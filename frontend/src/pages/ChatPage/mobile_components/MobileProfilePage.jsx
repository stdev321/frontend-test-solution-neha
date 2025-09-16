import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Avatar,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  Tooltip,
  CircularProgress,
  Alert,
  Badge
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';

export default function MobileProfilePage({
  currentUser,
  profileData,
  onBack,
  onLogout,
  onSaveChanges,
}) {
  const { t } = useTranslation(['chat', 'common']);
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState(profileData || {});
  const [imagePreview, setImagePreview] = useState(profileData?.profile_picture || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalProfile(profileData || {});
    setImagePreview(profileData?.profile_picture || '');
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelectClick = () => fileInputRef.current?.click();
  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };
  const handleRemoveImage = () => setImagePreview('');

  const hasChanges =
    JSON.stringify(localProfile) !== JSON.stringify(profileData || {}) ||
    imagePreview !== (profileData?.profile_picture || '');

  const handleSave = async () => {
    if (!onSaveChanges || !hasChanges) {
      setIsEditing(false);
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      await onSaveChanges({ ...localProfile, profile_picture: imagePreview });
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      setError(t('mobileProfile.saveError'));
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const initials = () => {
    if (localProfile.display_name) return localProfile.display_name[0].toUpperCase();
    if (localProfile.full_name) return localProfile.full_name[0].toUpperCase();
    if (localProfile.email) return localProfile.email[0].toUpperCase();
    return t('common:user.defaultInitial');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar sx={{ minHeight: '48px !important', py: 0 }}>
          <IconButton edge="start" onClick={onBack}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '1.1rem' }}>{t('mobileProfile.title')}</Typography>
          {!isEditing ? (
            <IconButton onClick={() => setIsEditing(true)}><EditIcon /></IconButton>
          ) : (
            <>
              <IconButton onClick={handleSave} disabled={!hasChanges || isSaving} color="success">
                {isSaving ? <CircularProgress size={20} /> : <CheckIcon />}
              </IconButton>
              <IconButton onClick={() => { setIsEditing(false); setLocalProfile(profileData || {}); setImagePreview(profileData?.profile_picture || ''); }}><CloseIcon /></IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{t('mobileProfile.saveSuccess')}</Alert>}

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileSelected} disabled={!isEditing}/>
                      <Tooltip title={isEditing ? t('mobileProfile.changePhoto') : ''} disableHoverListener={!isEditing}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={isEditing ? (
                <IconButton size="small" sx={{ bgcolor: 'background.paper' }} onClick={handleFileSelectClick}><AddPhotoAlternateIcon fontSize="small" /></IconButton>
              ) : null}
            >
              <Avatar src={imagePreview || undefined} sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2rem' }}>{!imagePreview && initials()}</Avatar>
            </Badge>
          </Tooltip>
          {isEditing && imagePreview && (
            <IconButton size="small" sx={{ ml: 1, color: 'error.main' }} onClick={handleRemoveImage}><DeleteIcon fontSize="small" /></IconButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isEditing ? (
            <TextField label={t('mobileProfile.displayName')} name="display_name" value={localProfile.display_name || ''} onChange={handleInputChange} fullWidth />
          ) : (
            <TextField label={t('mobileProfile.displayName')} value={localProfile.display_name || ''} InputProps={{ readOnly: true }} fullWidth />
          )}
          {isEditing ? (
            <TextField label={t('mobileProfile.fullName')} name="full_name" value={localProfile.full_name || ''} onChange={handleInputChange} fullWidth />
          ) : (
            <TextField label={t('mobileProfile.fullName')} value={localProfile.full_name || ''} InputProps={{ readOnly: true }} fullWidth />
          )}
          <TextField label={t('mobileProfile.email')} value={localProfile.email || ''} InputProps={{ readOnly: true }} fullWidth />
          {isEditing ? (
            <TextField label={t('mobileProfile.keyHealthInfo')} name="key_health_info" value={localProfile.key_health_info || ''} onChange={handleInputChange} multiline rows={4} fullWidth />
          ) : (
            <TextField label={t('mobileProfile.keyHealthInfo')} value={localProfile.key_health_info || ''} multiline rows={4} InputProps={{ readOnly: true }} fullWidth />
          )}
        </Box>

        <Button variant="text" color="primary" sx={{ mt: 4 }} onClick={onLogout}>{t('mobileProfile.logout')}</Button>
      </Box>
    </Box>
  );
} 