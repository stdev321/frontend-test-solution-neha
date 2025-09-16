import { useState, useCallback, useEffect, useRef } from 'react';
import { uploadFile, deleteConversationImage } from '../../services/api';
import { convertFileToImage } from '../../utils/fileToImageConverter';

export const useImageManager = (conversationId, sendMessage, setSidebarErrorGlobal, handleSetSidebarModeGlobal) => {
  // Each item: { id, url, filename, isCrop, isVisibleInPanel, originalSourceDetails?, sourceImageId? }
  const [activeImageStack, setActiveImageStack] = useState([]); 
  const [uploadedImagePreviewUrl, setUploadedImagePreviewUrl] = useState(null); 
  const [isProcessingImageAction, setIsProcessingImageAction] = useState(false);
  const prevConversationIdRef = useRef(conversationId); // Ref to store previous conversationId
  const MAX_IMAGE_MB = 10; // Anthropic Vision embed limit per image
  const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

  // Helper to convert File to Data URL
  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const commonAddImageToStack = useCallback((newImageItem) => {
    setActiveImageStack(prevStack => {
      const updatedStack = [...prevStack, newImageItem].slice(-4); // Add and ensure max 4
      return updatedStack;
    });
    setUploadedImagePreviewUrl(newImageItem.url); // New image is always focused
    if (handleSetSidebarModeGlobal) handleSetSidebarModeGlobal('activeChatView');
  }, [handleSetSidebarModeGlobal]);

  const handleFilesSelectedForContext = useCallback(async (files) => {
    if (!conversationId || !sendMessage) {
      if (setSidebarErrorGlobal) setSidebarErrorGlobal("Cannot process: Conversation not active or send unavailable.");
      return;
    }
    const canAddCount = 4 - activeImageStack.length;
    if (files.length === 0 || canAddCount === 0) {
      if (files.length > 0 && canAddCount === 0 && setSidebarErrorGlobal) {
        setSidebarErrorGlobal("Max 4 images. Clear one to add new.");
      }
      return;
    }
    const filesToProcess = files.slice(0, canAddCount);
    if (files.length > canAddCount && setSidebarErrorGlobal) {
      setSidebarErrorGlobal(`Max 4 images. Added first ${canAddCount} of ${files.length} selected.`);
    }

    setIsProcessingImageAction(true);
    for (const file of filesToProcess) {
      try {
        // --- Early size check for images ---
        if (file.type.startsWith('image/') && file.size > MAX_IMAGE_BYTES) {
          if (setSidebarErrorGlobal) setSidebarErrorGlobal(`Image '${file.name}' is larger than ${MAX_IMAGE_MB} MB and cannot be uploaded.`);
          continue; // Skip this file
        }

        let dataUrl;
        let fileToUpload;
        let uploadName;

        if (file.type.startsWith('image/')) {
          // images already supported
          dataUrl = await fileToDataURL(file);
          fileToUpload = file;
          uploadName = file.name;
        } else {
          // convert non-image
          const { dataUrl: jpeg64, blob, filename } = await convertFileToImage(file);
          dataUrl = jpeg64;
          fileToUpload = new File([blob], filename, { type: 'image/jpeg' });
          uploadName = filename;
        }

        const resp = await uploadFile(fileToUpload);
        if (!resp?.id || !resp.filename) throw new Error('Upload response missing ID or filename.');
        sendMessage(`AI Health Team: please find attached '${resp.filename}'.`, [resp.id]);

        commonAddImageToStack({
          id: resp.id,
          url: dataUrl,
          filename: resp.filename || uploadName,
          isCrop: false,
          isVisibleInPanel: true,
        });
      } catch (err) {
        console.error('Error in handleFilesSelectedForContext (convert/upload):', err);
        if (setSidebarErrorGlobal) setSidebarErrorGlobal(err.message || 'File processing error.');
      }
    }
    setIsProcessingImageAction(false);
  }, [conversationId, sendMessage, setSidebarErrorGlobal, activeImageStack.length, commonAddImageToStack]);

  const handlePromoteCropToStack = useCallback(async (cropDataUrl, selectionDetails, sourceImageId) => {
    if (!conversationId || !sendMessage) {
      if (setSidebarErrorGlobal) setSidebarErrorGlobal("Cannot send zoom: Conversation not active or send function unavailable.");
      return;
    }
    if (activeImageStack.length >= 4) {
      if (setSidebarErrorGlobal) setSidebarErrorGlobal("Cannot add more images: Maximum of 4 images allowed. Clear an image first to make space.");
      return;
    }

    setIsProcessingImageAction(true);
    try {
      const blob = await fetch(cropDataUrl).then(r => r.blob());
      if (blob.size > MAX_IMAGE_BYTES) {
        if (setSidebarErrorGlobal) setSidebarErrorGlobal(`Cropped image is larger than ${MAX_IMAGE_MB} MB. Please crop a smaller area.`);
        setIsProcessingImageAction(false);
        return;
      }
      const sourceImage = activeImageStack.find(img => img.id === sourceImageId);
      const originalFilename = sourceImage?.filename || sourceImageId || 'image';
      const safeOriginalFilename = originalFilename.replace(/[^a-zA-Z0-9_.-]/g, '_').substring(0, 50);
      const zoomFile = new File([blob], `zoom_of_${safeOriginalFilename}.png`, { type: 'image/png' });
      const resp = await uploadFile(zoomFile);
      if (!resp?.id) throw new Error('Upload response missing ID for zoomed image.');

      const { sourceX, sourceY, sourceWidth, sourceHeight, originalNaturalWidth, originalNaturalHeight } = selectionDetails;
      const centerXPercentage = originalNaturalWidth > 0 ? Math.round(((sourceX + sourceWidth / 2) / originalNaturalWidth) * 100) : 0;
      const centerYPercentage = originalNaturalHeight > 0 ? Math.round(((sourceY + sourceHeight / 2) / originalNaturalHeight) * 100) : 0;
      const areaOriginal = originalNaturalWidth * originalNaturalHeight;
      const areaCropped = sourceWidth * sourceHeight;
      let scalingFactor = (areaOriginal > 0 && areaCropped > 0) ? parseFloat((areaOriginal / areaCropped).toFixed(1)) : 1;
      if (scalingFactor < 1) scalingFactor = 1;
      const displayScalingFactor = Number.isInteger(scalingFactor) ? scalingFactor : scalingFactor.toFixed(1);
      sendMessage(`Zooming in ${displayScalingFactor}x.`, [resp.id]);
      commonAddImageToStack({
        id: resp.id, url: cropDataUrl, filename: zoomFile.name,
        isCrop: true, isVisibleInPanel: true,
        originalSourceDetails: selectionDetails, sourceImageId: sourceImageId,
      });
    } catch (err) {
      console.error("Error in handlePromoteCropToStack:", err);
      if (setSidebarErrorGlobal) setSidebarErrorGlobal(err.message || 'Zoom processing error.');
    }
    setIsProcessingImageAction(false);
  }, [conversationId, sendMessage, setSidebarErrorGlobal, activeImageStack, commonAddImageToStack]);

  const handleToggleImageVisibilityInPanel = useCallback((imageIdToToggle) => {
    let newFocusedUrl = uploadedImagePreviewUrl;
    let shouldUpdateFocus = false;

    const newStack = activeImageStack.map(image => {
      if (image.id === imageIdToToggle) {
        const newVisibility = !image.isVisibleInPanel;
        if (newVisibility) { // Becoming visible
          newFocusedUrl = image.url;
          shouldUpdateFocus = true;
        } else { // Becoming hidden
          if (image.url === uploadedImagePreviewUrl) { // If hiding the currently focused image
            shouldUpdateFocus = true; // Signal that focus needs to be re-evaluated
            newFocusedUrl = null; // Tentatively set to null
          }
        }
        return { ...image, isVisibleInPanel: newVisibility };
      }
      return image;
    });

    if (shouldUpdateFocus && newFocusedUrl === null) { // Re-evaluate focus if primary was hidden
      const firstVisible = newStack.find(img => img.isVisibleInPanel);
      newFocusedUrl = firstVisible ? firstVisible.url : null;
    }
    
    setActiveImageStack(newStack);
    setUploadedImagePreviewUrl(newFocusedUrl);

    if (newFocusedUrl && handleSetSidebarModeGlobal) {
        handleSetSidebarModeGlobal('activeChatView');
    }
  }, [activeImageStack, uploadedImagePreviewUrl, handleSetSidebarModeGlobal]);

  const handleSetFocusedImage = useCallback((imageId) => {
    let focusedImageUrl = null;
    const newStack = activeImageStack.map(img => {
      if (img.id === imageId) {
        focusedImageUrl = img.url;
        return { ...img, isVisibleInPanel: true }; // Ensure it's visible
      }
      return img;
    });
    
    setActiveImageStack(newStack);
    if (focusedImageUrl) {
      setUploadedImagePreviewUrl(focusedImageUrl);
      if (handleSetSidebarModeGlobal) {
        handleSetSidebarModeGlobal('activeChatView');
      }
    }
  }, [activeImageStack, handleSetSidebarModeGlobal]);

  const handleDeleteImage = useCallback(async (imageId) => {
    if (!conversationId) {
      if (setSidebarErrorGlobal) setSidebarErrorGlobal("Cannot delete image: No active conversation.");
      return;
    }

    setIsProcessingImageAction(true);
    try {
      await deleteConversationImage(conversationId, imageId);
      
      // Remove from stack
      const newStack = activeImageStack.filter(img => img.id !== imageId);
      setActiveImageStack(newStack);
      
      // Update focus if needed
      const deletedImage = activeImageStack.find(img => img.id === imageId);
      if (deletedImage && deletedImage.url === uploadedImagePreviewUrl) {
        const firstVisible = newStack.find(img => img.isVisibleInPanel);
        setUploadedImagePreviewUrl(firstVisible ? firstVisible.url : null);
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      if (setSidebarErrorGlobal) setSidebarErrorGlobal(err.message || 'Failed to delete image.');
    }
    setIsProcessingImageAction(false);
  }, [conversationId, activeImageStack, uploadedImagePreviewUrl, setSidebarErrorGlobal]);

  const handleClearAllImagesInStack = useCallback(() => {
    // No need to revoke data URLs, only blob URLs if any were hypothetically stored
    setActiveImageStack([]);
    setUploadedImagePreviewUrl(null);
  }, []); // Removed activeImageStack dependency as it's not strictly needed for just resetting

  // Effect to clear image stack when conversationId changes
  useEffect(() => {
    if (prevConversationIdRef.current !== conversationId) {
      // console.log(`[useImageManager] Conversation ID changed from ${prevConversationIdRef.current} to ${conversationId}. Clearing image stack.`);
      handleClearAllImagesInStack();
    }
    // Update the ref to the current conversationId for the next render cycle
    prevConversationIdRef.current = conversationId;
  }, [conversationId, handleClearAllImagesInStack]);

  // No specific unmount cleanup for data URLs needed beyond what React handles for state.
  // The blob URL cleanup can be removed if all URLs are data URLs.
  // useEffect(() => {
  //   const stackToClean = [...activeImageStack];
  //   return () => stackToClean.forEach(img => { if (img.url?.startsWith('blob:')) URL.revokeObjectURL(img.url); });
  // }, [activeImageStack]);

  return {
    activeImageStack,
    uploadedImagePreviewUrl,
    isProcessingImageAction,
    handleFilesSelectedForContext,
    handlePromoteCropToStack,
    handleClearAllImagesInStack,
    handleToggleImageVisibilityInPanel,
    handleSetFocusedImage,
    handleDeleteImage,
  };
}; 