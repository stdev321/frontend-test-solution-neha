// ProfilePanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  CircularProgress,
  useTheme,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProfilePanelUI from './ProfilePanelUI';

const getSafeImageSrc = (imageData) => {
  if (typeof imageData === 'string' && imageData.trim()) {
    if (imageData.startsWith('data:image')) {
      return imageData; // Already correctly prefixed
    }
    return `data:image/jpeg;base64,${imageData}`;
  }
  return null; // Or a default placeholder image URL if preferred
};

const ProfilePanel = ({
  profileData: initialProfileDataProp, // Renamed to avoid conflict with internal state name
  isLoading,
  error,
  onSaveChanges, // Function passed from parent to handle the actual API call
  onNavigateToAccount, // Added onNavigateToAccount prop
  isGuestMode = false,
}) => {
  const { t } = useTranslation('profile');
  
  // --- State Definitions ---
  const [profileData, setProfileData] = useState(null);
  const [initialProfileData, setInitialProfileData] = useState(null); // To track internal changes
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State to control edit mode
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [keyHealthInfo, setKeyHealthInfo] = useState('');
  const [initialKeyHealthInfo, setInitialKeyHealthInfo] = useState('');
  const [imageProcessingError, setImageProcessingError] = useState('');
  const fileInputRef = useRef(null); // Ref for hidden file input
  const theme = useTheme();

  useEffect(() => {
    if (initialProfileDataProp) { // Re-initialize if the prop itself changes
      const safeData = {
        email: initialProfileDataProp.email || '',
        display_name: initialProfileDataProp.display_name || '', // Added display_name
        full_name: initialProfileDataProp.full_name || '',
        profile_picture: initialProfileDataProp.profile_picture || null, // Added profile_picture
        is_clinician: initialProfileDataProp.is_clinician || false,
        conditions: initialProfileDataProp.conditions || [],
        medical_events: initialProfileDataProp.medical_events || [],
        medications: initialProfileDataProp.medications || [],
      };
      let combinedInfo = '';
      if (safeData.conditions && safeData.conditions.length > 0 && 
          (safeData.conditions[0].condition_name?.includes('Conditions:') || 
           safeData.conditions[0].condition_name?.includes('Medical Events:') || 
           safeData.conditions[0].condition_name?.includes('Medications:'))) {
        combinedInfo = safeData.conditions[0].condition_name || '';
      } else {
        combinedInfo += `${t('healthInfo.conditions')}\n`;
        safeData.conditions.forEach(c => {
          combinedInfo += `- ${c.condition_name || t('healthInfo.notAvailable')}${c.diagnosis_date ? t('healthInfo.diagnosed') + c.diagnosis_date + ')' : ''}${c.notes ? '\n' + t('healthInfo.notes') + c.notes : ''}\n`;
        });
        combinedInfo += '\n';
      }
      if (safeData.medical_events && safeData.medical_events.length > 0) {
        combinedInfo += `${t('healthInfo.medicalEvents')}\n`;
        safeData.medical_events.forEach(e => {
          combinedInfo += `- ${e.event_description || t('healthInfo.notAvailable')}${e.event_date ? t('healthInfo.date') + e.event_date + ')' : ''}${e.notes ? '\n' + t('healthInfo.notes') + e.notes : ''}\n`;
        });
        combinedInfo += '\n';
      }
      if (safeData.medications && safeData.medications.length > 0) {
        combinedInfo += `${t('healthInfo.medications')}\n`;
        safeData.medications.forEach(m => {
          combinedInfo += `- ${m.medication_name || t('healthInfo.notAvailable')}${m.dosage ? ' (' + m.dosage + ')' : ''}${m.frequency ? ' - ' + m.frequency : ''}${m.start_date ? t('healthInfo.started') + m.start_date + ')' : ''}${m.end_date && m.end_date.toLowerCase() !== 'present' ? t('healthInfo.ended') + m.end_date + ')' : ''}${m.notes ? '\n' + t('healthInfo.notes') + m.notes : ''}\n`;
        });
      }

      setProfileData(safeData);
      setInitialProfileData(JSON.parse(JSON.stringify(safeData))); // Deep copy
      setImagePreview(getSafeImageSrc(safeData.profile_picture)); // Use helper here
      setKeyHealthInfo(combinedInfo.trim());
      setInitialKeyHealthInfo(combinedInfo.trim());
    } else {
      setProfileData(null);
      setInitialProfileData(null);
      setImagePreview(null);
      setKeyHealthInfo('');
      setInitialKeyHealthInfo('');
    }
    // Reset save status when data changes
    setSaveError('');
    setSaveSuccess('');
    setIsSaving(false);
    setImageProcessingError('');
  }, [initialProfileDataProp]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setSaveError(''); // Clear errors on input change
    setSaveSuccess('');
  };

  const toggleEditing = () => {
    const currentlyEditing = isEditing;
    setIsEditing(prev => !prev);
    if (currentlyEditing) {
      setProfileData(JSON.parse(JSON.stringify(initialProfileData))); // Reset text fields
      setImagePreview(getSafeImageSrc(initialProfileData?.profile_picture)); // Use helper here
      setKeyHealthInfo(initialKeyHealthInfo); // Reset combined field too
      setImageFile(null);
      setSaveError('');
      setSaveSuccess('');
      setImageProcessingError('');
    }
  };

  const handleAddItem = (listName) => {
    setProfileData(prev => ({
      ...prev,
      [listName]: [...(prev[listName] || []), {}] 
    }));
    setSaveError('');
    setSaveSuccess('');
  };

  const handleRemoveItem = (listName, index) => {
    setProfileData(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
    setSaveError('');
    setSaveSuccess('');
  };

  const handleListItemChange = (event, listName, index) => {
    const { name, value } = event.target;
    setProfileData(prev => ({
      ...prev,
      [listName]: prev[listName].map((item, i) =>
        i === index ? { ...item, [name]: value } : item
      )
    }));
    setSaveError('');
    setSaveSuccess('');
  };

  const MAX_IMAGE_SIZE_PX = 200; // Max width/height for profile pic
  const IMAGE_QUALITY = 0.85; // JPEG quality (0.0 to 1.0)

  const handleFileSelectClick = () => {
    fileInputRef.current?.click(); // Trigger hidden file input
  };

  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageProcessingError(t('errors.invalidImageFile'));
      setImageFile(null);
      event.target.value = null; // Clear input
      return;
    }

    setImageFile(file); // Store the raw file temporarily
    setImageProcessingError('');
    setSaveSuccess(''); // Clear previous success message

    const reader = new FileReader();
    reader.onload = (e) => {
      processImageForUpload(e.target.result);
    };
    reader.onerror = () => {
      setImageProcessingError(t('errors.fileReadFailed'));
      setImageFile(null);
    };
    reader.readAsDataURL(file); // Read for preview first

    event.target.value = null;
  };

  const processImageForUpload = (imageDataUrl) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_IMAGE_SIZE_PX) {
          height = Math.round(height * (MAX_IMAGE_SIZE_PX / width));
          width = MAX_IMAGE_SIZE_PX;
        }
      } else {
        if (height > MAX_IMAGE_SIZE_PX) {
          width = Math.round(width * (MAX_IMAGE_SIZE_PX / height));
          height = MAX_IMAGE_SIZE_PX;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const resizedBase64 = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);

      console.log(`Resized image from ${img.width}x${img.height} to ${width}x${height}. Base64 length: ${resizedBase64.length}`);

      setProfileData(prev => ({ ...prev, profile_picture: resizedBase64 }));
      setImagePreview(resizedBase64); // Update preview to resized version
      setImageFile(null); // Clear the raw file as it's processed
    };
    img.onerror = () => {
      setImageProcessingError(t('errors.imageProcessFailed'));
      setImageFile(null);
    };
    img.src = imageDataUrl;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setProfileData(prev => ({ ...prev, profile_picture: null }));
    setImageProcessingError('');
    setSaveSuccess('');
  };

  const handleSave = async () => {
    if (!onSaveChanges) return;

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const payloadToSave = {
        ...profileData, // Includes display_name, full_name, profile_picture
        conditions: [
          {
            condition_name: keyHealthInfo, 
            diagnosis_date: null, // Or a default/empty string if backend requires
            notes: null // Or a default/empty string
          }
        ],
        medical_events: [],
        medications: [],
      };

      await onSaveChanges(payloadToSave); 
      setSaveSuccess(t('success.profileUpdated'));
      const updatedInitialState = {
        ...payloadToSave,
        email: profileData.email, // these are not in payloadToSave as they are from initialProfileDataProp or profileData
        is_clinician: profileData.is_clinician,
        id: profileData.id, // Assuming id is part of profileData from initial load
      };
      setInitialProfileData(JSON.parse(JSON.stringify(updatedInitialState)));
      setInitialKeyHealthInfo(keyHealthInfo); // Also update the initial state for the combined field
      setIsEditing(false); // Exit editing mode on successful save
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveError(err.message || t('errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !profileData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('loading.profile')}</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{t('errors.loadingProfile')}{error}</Alert>;
  }

  if (!profileData) {
    return <Typography sx={{ p: 2, textAlign: 'center' }}>{t('errors.noData')}</Typography>;
  }

  // Check if there are changes to save
  const hasChanges = JSON.stringify(profileData) !== JSON.stringify(initialProfileData) || keyHealthInfo !== initialKeyHealthInfo;

  return (
    <ProfilePanelUI
      profileData={profileData}
      isLoading={isLoading}
      error={error}
      isSaving={isSaving}
      saveError={saveError}
      saveSuccess={saveSuccess}
      isEditing={isEditing}
      imagePreview={imagePreview}
      keyHealthInfo={keyHealthInfo}
      imageProcessingError={imageProcessingError}
      hasChanges={hasChanges}
      fileInputRef={fileInputRef}
      theme={theme}
      onNavigateToAccount={onNavigateToAccount}
      toggleEditing={toggleEditing}
      handleSave={handleSave}
      handleInputChange={handleInputChange}
      handleFileSelectClick={handleFileSelectClick}
      handleFileSelected={handleFileSelected}
      handleRemoveImage={handleRemoveImage}
      isGuestMode={isGuestMode}
      setKeyHealthInfo={setKeyHealthInfo}
      setSaveError={setSaveError}
      setSaveSuccess={setSaveSuccess}
    />
  );
};

export default ProfilePanel;
