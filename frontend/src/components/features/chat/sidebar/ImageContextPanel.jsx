import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, Button, Stack, CircularProgress, Alert, IconButton, Tooltip } from '@mui/material';
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
// import VisibilityIcon from '@mui/icons-material/Visibility';
import ZoomableImage from './ZoomableImage';
import CloseIcon from '@mui/icons-material/Close';

const ImageContextPanel = (props) => {
  const {
    currentImageStack = [],
    sendMessage,
    conversationId,
    onPromoteCropToStack,
    onClearAllImages,
    // onToggleImageVisibility, // Commented out - removing hide functionality
    onDeleteImage,
    uploadedImagePreviewUrl,
  } = props;

  const { t } = useTranslation('chat');
  const [activeSingleCropPreview, setActiveSingleCropPreview] = useState(null);
  const [panelError, setPanelError] = useState('');
  const [isProcessingZoom, setIsProcessingZoom] = useState(false);

  const handleCropGeneratedByChild = useCallback((sourceImageId, cropDataUrl, selectionDetails) => {
    if (cropDataUrl) {
      setActiveSingleCropPreview({ sourceImageId, cropDataUrl, selectionDetails });
      setPanelError('');
    } else {
      setActiveSingleCropPreview(null);
    }
  }, []);

  const handleSendAndPromoteZoom = async () => {
    if (!activeSingleCropPreview || !activeSingleCropPreview.cropDataUrl) {
      setPanelError(t('imageContext.noActiveZoom'));
      return;
    }
    if (!conversationId || !sendMessage || !onPromoteCropToStack) {
        setPanelError(t('imageContext.functionsUnavailable'));
        return;
    }
    setIsProcessingZoom(true);
    setPanelError('');
    try {
      await onPromoteCropToStack(
        activeSingleCropPreview.cropDataUrl,
        activeSingleCropPreview.selectionDetails,
        activeSingleCropPreview.sourceImageId
      );
      setActiveSingleCropPreview(null);
    } catch (e) {
      console.error("Error in ImageContextPanel during promote crop delegate:", e);
      setPanelError(e.message || t('imageContext.cropPromotionError'));
    } finally {
      setIsProcessingZoom(false);
    }
  };

  const handleClearButtonClick = () => {
    if (onClearAllImages) {
      onClearAllImages();
    }
    setActiveSingleCropPreview(null);
    setPanelError('');
  };

  const imagesToDisplayInPanel = useMemo(() => {
    if (!currentImageStack || currentImageStack.length === 0) {
      return [];
    }
    // Removed visibility filter - show all images
    const visibleImages = currentImageStack; // .filter(img => img.isVisibleInPanel);

    if (uploadedImagePreviewUrl) {
      const focusedIndex = visibleImages.findIndex(img => img.url === uploadedImagePreviewUrl);
      if (focusedIndex > 0) {
        const focusedImage = visibleImages[focusedIndex];
        const restOfTheStack = [
          ...visibleImages.slice(0, focusedIndex),
          ...visibleImages.slice(focusedIndex + 1)
        ];
        return [focusedImage, ...restOfTheStack];
      }
    }
    return visibleImages;
  }, [currentImageStack, uploadedImagePreviewUrl]);

  // Determine if the focused image is a crop and store its highlight details for its parent.
  const highlightMap = useMemo(() => {
    if (!imagesToDisplayInPanel || imagesToDisplayInPanel.length === 0) return {};
    const focused = imagesToDisplayInPanel[0];
    if (!focused?.isCrop || !focused?.sourceImageId || !focused?.originalSourceDetails?.selectionRectForParentHighlight) return {};
    return {
      [focused.sourceImageId]: focused.originalSourceDetails.selectionRectForParentHighlight,
    };
  }, [imagesToDisplayInPanel]);

  if (!currentImageStack || currentImageStack.length === 0) {
    return (
        <Paper elevation={0} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height:'100%', textAlign:'center' }}>
            <Typography variant="body2" color="text.secondary">
                {t('imageContext.noImages')}
            </Typography>
        </Paper>
    );
  }

  // Removed hidden images check since we're not hiding images anymore
  // if (imagesToDisplayInPanel.length === 0 && currentImageStack.length > 0) {
  //    return (
  //       <Paper elevation={0} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height:'100%', textAlign:'center' }}>
  //           <Typography variant="body2" color="text.secondary">
  //               {t('imageContext.allHidden')}
  //           </Typography>
  //            <Button onClick={() => onToggleImageVisibility && onToggleImageVisibility(currentImageStack[0].id)} sx={{mt:1}} size="small">
  //               {t('imageContext.showFirst')}
  //           </Button>
  //       </Paper>
  //   );
  // }

  return (
    <Paper elevation={0} sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb:0.5}}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {t('imageContext.imageDisplay', { shown: imagesToDisplayInPanel.length, total: currentImageStack.length })}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5, mr: -0.5 }}>
        {imagesToDisplayInPanel.map((image, index) => {
          console.log(`[ImageContextPanel] Rendering ZoomableImage for ID: ${image.id}, URL_is_truthy: ${!!image.url}, URL_type: ${typeof image.url}, URL_prefix: ${image.url?.substring(0,30)}`);
          // const isLastVisibleImage = imagesToDisplayInPanel.length === 1 && image.isVisibleInPanel; // Not needed anymore
          return (
            <Box key={image.id || index} sx={{ position: 'relative', mb: 1, border: image.url === uploadedImagePreviewUrl ? '2px solid #AD55DA' : 'none', padding: image.url === uploadedImagePreviewUrl ? '2px' : '0' }}>
              <ZoomableImage 
                imageId={image.id} 
                imageDataUrl={image.url} 
                onCropGenerated={handleCropGeneratedByChild}
                selectionColor={image.url === uploadedImagePreviewUrl ? '#AD55DA' : (index % 2 === 0 ? 'red' : 'blue')}
                highlightDetails={highlightMap[image.id]}
              />
              {/* Only show delete button, hide functionality removed */}
              <IconButton 
                  onClick={() => onDeleteImage && onDeleteImage(image.id)} 
                  size="small"
                  title={t('imageContext.deleteImage')}
                  sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2, backgroundColor: 'rgba(255,0,0,0.5)', color: 'white', padding: '2px', '&:hover': { backgroundColor: 'rgba(255,0,0,0.8)'} }}
              >
                  <CloseIcon fontSize="inherit" />
              </IconButton>
            </Box>
          );
        })}
      </Box>

      {activeSingleCropPreview && activeSingleCropPreview.cropDataUrl && (
        <Box sx={{ mt: 1, p:1, border: '1px solid mediumseagreen', borderRadius:1, position: 'relative' }}>
          <Tooltip title={t('imageContext.clearZoom')}>
            <IconButton 
              size="small"
              onClick={() => setActiveSingleCropPreview(null)} 
              sx={{ position: 'absolute', top: 2, right: 2, zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.7)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)'} }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', display:'block' }}>
            {t('imageContext.zoomPreview')}
          </Typography>
          <img
            src={activeSingleCropPreview.cropDataUrl}
                            alt={t('common:alt.zoomPreview')} 
            style={{ display: 'block', maxWidth: '100%', maxHeight: '150px', margin: '4px auto 8px auto', border: '1px solid grey' }}
          />
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Tooltip title={!conversationId ? t('imageContext.startConversationToSend') : t('imageContext.sendZoomToTeam')}>
              <span> 
                <Button 
                  onClick={handleSendAndPromoteZoom} 
                  size="small" 
                  variant="contained"
                  color="success"
                  disabled={isProcessingZoom || !conversationId}
                >
                  {isProcessingZoom ? <CircularProgress size={16}/> : t('imageContext.sendToTeam')}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      )}

      {!activeSingleCropPreview && imagesToDisplayInPanel.length > 0 && (
        <Typography variant="caption" sx={{textAlign: 'center', mt:0.5, color: 'text.secondary'}}>
            {t('imageContext.dragToZoom')}
        </Typography>
      )}

      {panelError && (
        <Alert severity="error" sx={{ mt: 1 }} onClose={() => { setPanelError(''); setIsProcessingZoom(false); }}>
          {panelError}
        </Alert>
      )}
    </Paper>
  );
};

ImageContextPanel.propTypes = {
  currentImageStack: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    filename: PropTypes.string,
    isCrop: PropTypes.bool,
    isVisibleInPanel: PropTypes.bool,
    originalSourceDetails: PropTypes.object,
    sourceImageId: PropTypes.string,
  })).isRequired,
  sendMessage: PropTypes.func, 
  conversationId: PropTypes.string,
  onPromoteCropToStack: PropTypes.func.isRequired,
  onClearAllImages: PropTypes.func.isRequired,
  // onToggleImageVisibility: PropTypes.func.isRequired, // Commented out - removing hide functionality
  onDeleteImage: PropTypes.func,
  uploadedImagePreviewUrl: PropTypes.string,
};

export default ImageContextPanel; 