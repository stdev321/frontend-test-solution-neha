import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const ZoomableImage = ({ imageId, imageDataUrl, onCropGenerated, selectionColor = 'red', highlightDetails }) => {
  // Natural dimensions of the original source image
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);

  // The rectangle the user is drawing on-screen, **always relative to containerRef**
  const [visualSelection, setVisualSelection] = useState({ x: 0, y: 0, width: 0, height: 0, startX: 0, startY: 0 });

  // Is the user currently dragging?
  const [isSelecting, setIsSelecting] = useState(false);

  // Geometry describing where the image is rendered inside the container
  const [imageRenderProps, setImageRenderProps] = useState({ offsetX: 0, offsetY: 0, renderedWidth: 0, renderedHeight: 0 });

  // Refs
  const containerRef = useRef(null);
  const imageDisplayRef = useRef(null);

  useEffect(() => {
    // Reset selection when imageDataUrl changes (e.g. new image loaded)
    setVisualSelection({ x: 0, y: 0, width: 0, height: 0, startX: 0, startY: 0 });
    setIsSelecting(false);
    setNaturalWidth(0);
    setNaturalHeight(0);
  }, [imageDataUrl]);

  /**
   * Helper to calculate where exactly the <img> content sits inside its container.
   * This must be up-to-date before we translate a visual selection into an actual crop.
   */
  const calculateAndStoreImageRenderProps = useCallback(() => {
    if (!containerRef.current || !imageDisplayRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const imgRect = imageDisplayRef.current.getBoundingClientRect();
    setImageRenderProps({
      offsetX: imgRect.left - containerRect.left,
      offsetY: imgRect.top - containerRect.top,
      renderedWidth: imgRect.width,
      renderedHeight: imgRect.height,
    });
  }, []);

  // Keep geometry in sync on window resize so highlight overlay stays aligned.
  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => calculateAndStoreImageRenderProps();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateAndStoreImageRenderProps]);

  // Also observe container size changes that are NOT window resizes (e.g., panel drag)
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      calculateAndStoreImageRenderProps();
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [calculateAndStoreImageRenderProps]);

  const handleImageLoad = (event) => {
    setNaturalWidth(event.target.naturalWidth);
    setNaturalHeight(event.target.naturalHeight);
    // Defer the render-prop calculation to the next frame so DOM is settled
    requestAnimationFrame(calculateAndStoreImageRenderProps);
  };

  const handleMouseDownOnImage = (event) => {
    if (!containerRef.current || !imageDataUrl) return;

    // Refresh geometry in case of resize between last load and now
    calculateAndStoreImageRenderProps();

    const containerRect = containerRef.current.getBoundingClientRect();
    const startX = event.clientX - containerRect.left;
    const startY = event.clientY - containerRect.top;

    setVisualSelection({ x: startX, y: startY, width: 0, height: 0, startX, startY });
    setIsSelecting(true);

    // Clear any previously generated crop for this image
    onCropGenerated?.(imageId, null, null);
  };

  const handleMouseMoveOnImage = (event) => {
    if (!isSelecting || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let currentX = event.clientX - containerRect.left;
    let currentY = event.clientY - containerRect.top;

    // Constrain within container bounds
    currentX = Math.max(0, Math.min(currentX, containerRect.width));
    currentY = Math.max(0, Math.min(currentY, containerRect.height));

    const newX = Math.min(currentX, visualSelection.startX);
    const newY = Math.min(currentY, visualSelection.startY);
    const newWidth = Math.abs(currentX - visualSelection.startX);
    const newHeight = Math.abs(currentY - visualSelection.startY);

    setVisualSelection(prev => ({ ...prev, x: newX, y: newY, width: newWidth, height: newHeight }));
  };

  const handleMouseUpOnImage = () => {
    if (!isSelecting || !imageDisplayRef.current || !containerRef.current || !imageDataUrl) {
      setIsSelecting(false);
      return;
    }
    setIsSelecting(false);

    // Abort if selection is tiny
    if (visualSelection.width < 5 || visualSelection.height < 5 || naturalWidth === 0 || naturalHeight === 0) {
      setVisualSelection({ x: 0, y: 0, width: 0, height: 0, startX: 0, startY: 0 });
      onCropGenerated?.(imageId, null, null);
      return;
    }

    const { offsetX, offsetY, renderedWidth, renderedHeight } = imageRenderProps;
    const imgElement = imageDisplayRef.current;

    // Calculate intersection of selection with image content area
    const selectionLeftRelToImg = visualSelection.x - offsetX;
    const selectionTopRelToImg = visualSelection.y - offsetY;

    const intersectLeft = Math.max(selectionLeftRelToImg, 0);
    const intersectTop = Math.max(selectionTopRelToImg, 0);
    const intersectRight = Math.min(selectionLeftRelToImg + visualSelection.width, renderedWidth);
    const intersectBottom = Math.min(selectionTopRelToImg + visualSelection.height, renderedHeight);

    const intersectWidth = intersectRight - intersectLeft;
    const intersectHeight = intersectBottom - intersectTop;

    if (intersectWidth <= 0 || intersectHeight <= 0) {
      // Selection was entirely outside image content
      onCropGenerated?.(imageId, null, null);
      return;
    }

    // Prepare scaling factors for natural pixel space
    const scaleX = naturalWidth / renderedWidth;
    const scaleY = naturalHeight / renderedHeight;

    const sourceXNat = intersectLeft * scaleX;
    const sourceYNat = intersectTop * scaleY;
    const sourceWidthNat = intersectWidth * scaleX;
    const sourceHeightNat = intersectHeight * scaleY;

    // Preview canvas mirrors what the user saw on-screen (intersect area only)
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = intersectWidth;
    previewCanvas.height = intersectHeight;
    const previewCtx = previewCanvas.getContext('2d');

    previewCtx.drawImage(
      imgElement,
      sourceXNat, sourceYNat, sourceWidthNat, sourceHeightNat, // from natural pixels
      0, 0, intersectWidth, intersectHeight                   // draw 1:1 to canvas
    );

    const screenCapturePreviewDataUrl = previewCanvas.toDataURL('image/png');

    // ---------------------------------------------
    // Create high-resolution crop maintaining aspect ratio
    // ---------------------------------------------
    const hiResCanvas = document.createElement('canvas');
    // Use the crop's natural pixel dimensions so no distortion occurs
    hiResCanvas.width = sourceWidthNat;
    hiResCanvas.height = sourceHeightNat;
    const hiCtx = hiResCanvas.getContext('2d');
    hiCtx.drawImage(
      imgElement,
      sourceXNat, sourceYNat, sourceWidthNat, sourceHeightNat, // source region in natural pixels
      0, 0, sourceWidthNat, sourceHeightNat                     // draw 1:1 to canvas
    );

    const hiResDataUrl = hiResCanvas.toDataURL('image/png');

    // Accurate crop coordinates already computed above
    const sourceX = sourceXNat;
    const sourceY = sourceYNat;
    const sourceWidth = sourceWidthNat;
    const sourceHeight = sourceHeightNat;

    const finalCropDetails = {
      sourceX: Math.round(sourceX),
      sourceY: Math.round(sourceY),
      sourceWidth: Math.round(sourceWidth),
      sourceHeight: Math.round(sourceHeight),
      originalNaturalWidth: naturalWidth,
      originalNaturalHeight: naturalHeight,
      selectionRectOnDisplayedContent: {
        x: intersectLeft,
        y: intersectTop,
        width: intersectWidth,
        height: intersectHeight,
      },
      selectionRectForParentHighlight: {
        xPercent: (sourceX / naturalWidth) * 100,
        yPercent: (sourceY / naturalHeight) * 100,
        widthPercent: (sourceWidth / naturalWidth) * 100,
        heightPercent: (sourceHeight / naturalHeight) * 100,
      },
    };

    onCropGenerated?.(imageId, hiResDataUrl, finalCropDetails);
  };
  
  const handleMouseLeaveImage = (event) => {
    // If mouse goes up outside while selecting, standard mouseup should handle it.
    // If isSelecting is true and mouse leaves, then re-enters and mouseup occurs,
    // it should still work. If the intention is to cancel on mouse leave, this needs more logic.
    // For now, we assume mouseup anywhere will finalize or cancel the selection.
    if (isSelecting && !event.buttons) { // Mouse button was released outside
        handleMouseUpOnImage();
    }
  };

  // Define these styles outside the sx prop to avoid template literal issues with the tool
  const currentBorder = `1px dashed ${selectionColor}`;
  const currentBackgroundColor = selectionColor === 'red' ? 'rgba(255,0,0,0.1)' : 'rgba(0,0,255,0.1)';

  if (!imageDataUrl) return null; // Don't render if no image data

  return (
    <Box
      ref={containerRef}
      onMouseDown={handleMouseDownOnImage}
      onMouseMove={handleMouseMoveOnImage}
      onMouseUp={handleMouseUpOnImage}
      onMouseLeave={handleMouseLeaveImage}
      sx={{
        position: 'relative',
        cursor: 'crosshair',
        border: '1px solid',
        borderColor: 'divider',
        maxWidth: '100%',
        height: 'auto',
        minHeight: 100, // Smaller min height for stacked images
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'action.disabledBackground', // Slightly different bg for each instance
        mb: 1, // Margin between stacked images
      }}
    >
      <img
        ref={imageDisplayRef}
        src={imageDataUrl}
        alt={`View ${imageId}`}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '80vh', // prevent runaway growth; adjust as desired
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable="false"
        onLoad={handleImageLoad}
      />
      {isSelecting && visualSelection.width > 0 && visualSelection.height > 0 && (
        <Box
          sx={{
            position: 'absolute',
            border: currentBorder,
            backgroundColor: currentBackgroundColor,
            left: visualSelection.x,
            top: visualSelection.y,
            width: visualSelection.width,
            height: visualSelection.height,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Highlight overlay if provided (e.g., parent of a focused crop) */}
      {highlightDetails && (
        <Box
          sx={{
            position: 'absolute',
            pointerEvents: 'none',
            border: '2px solid rgba(255, 223, 0, 0.9)',
            boxShadow: '0 0 4px 2px rgba(255, 223, 0, 0.7)',
            left: imageRenderProps.offsetX + (highlightDetails.xPercent / 100) * imageRenderProps.renderedWidth,
            top: imageRenderProps.offsetY + (highlightDetails.yPercent / 100) * imageRenderProps.renderedHeight,
            width: (highlightDetails.widthPercent / 100) * imageRenderProps.renderedWidth,
            height: (highlightDetails.heightPercent / 100) * imageRenderProps.renderedHeight,
          }}
        />
      )}
    </Box>
  );
};

ZoomableImage.propTypes = {
  imageId: PropTypes.string.isRequired,
  imageDataUrl: PropTypes.string.isRequired,
  onCropGenerated: PropTypes.func.isRequired, // Callback: (imageId, croppedDataUrl, selectionDetails)
  selectionColor: PropTypes.string,
  highlightDetails: PropTypes.shape({
    xPercent: PropTypes.number,
    yPercent: PropTypes.number,
    widthPercent: PropTypes.number,
    heightPercent: PropTypes.number,
  }),
};

export default ZoomableImage; 