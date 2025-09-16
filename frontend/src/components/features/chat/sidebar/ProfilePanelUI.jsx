import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Avatar,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  Grid,
  Badge,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

// Import guest user image
import guestUserImage from '../../../../assets/images/guest-user_tiny.png';

export default function ProfilePanelUI({
  profileData,
  isLoading,
  error,
  isSaving,
  saveError,
  saveSuccess,
  isEditing,
  imagePreview,
  keyHealthInfo,
  imageProcessingError,
  hasChanges,
  fileInputRef,
  theme,
  onNavigateToAccount,
  toggleEditing,
  handleSave,
  handleInputChange,
  handleFileSelectClick,
  handleFileSelected,
  handleRemoveImage,
  setKeyHealthInfo,
  setSaveError,
  setSaveSuccess,
  isGuestMode = false,
}) {
  const { t } = useTranslation('chat');
  
  if (isLoading && !profileData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>Error loading profile: {error}</Alert>;
  }

  if (!profileData) {
    return <Typography sx={{ p: 2, textAlign: 'center' }}>No profile data available.</Typography>;
  }

  return (
    <Paper elevation={0} sx={{ p: 2, overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            {t('profile.myProfile', 'My Profile')}
          </Typography>
          {onNavigateToAccount && (
            <Button
              onClick={onNavigateToAccount}
              size="small"
              sx={{
                mt: 0.5,
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                color: theme.palette.secondary.light,
                '&:hover': { textDecoration: 'underline', backgroundColor: 'transparent' }
              }}
            >
              {t('profile.myAccount', 'My Account')}
            </Button>
          )}
        </Box>
        {!isGuestMode && !isEditing ? (
          <Tooltip title={t('profile.editProfile')}>
            <span>
              <IconButton onClick={toggleEditing} color="primary" disabled={isSaving}>
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
        ) : !isGuestMode ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {hasChanges && (
              <Tooltip title={t('profile.saveChanges')}>
                <span>
                  <IconButton 
                    onClick={handleSave} 
                    color="success"
                    disabled={isSaving || !hasChanges}
                  >
                    {isSaving ? <CircularProgress size={24} /> : <CheckCircleOutlineIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <Tooltip title={t('profile.cancelEdits')}>
              <span>
                <IconButton 
                  onClick={toggleEditing} 
                  disabled={isSaving}
                  sx={{ color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.main }}
                >
                  <HighlightOffIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ) : null}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} container spacing={3} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}> 
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelected}
              ref={fileInputRef}
              style={{ display: 'none' }}
              disabled={!isEditing}
            />
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                isEditing && (
                  <Tooltip title={t('profile.changePhoto')}>
                    <IconButton 
                      size="small" 
                      onClick={handleFileSelectClick} 
                      sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover'} }}
                      disabled={!isEditing}
                    >
                      <AddPhotoAlternateIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Tooltip>
                )
              }
            >
              <Avatar
                variant="rounded"
                src={isGuestMode ? guestUserImage : (imagePreview || undefined)}
                alt={profileData.display_name || profileData.email}
                sx={{ 
                  width: '120px',
                  height: '120px',
                  margin: '0 auto', 
                  fontSize: '2.5rem', 
                  bgcolor: 'primary.main', 
                  borderRadius: 2,
                  boxShadow: !isEditing ? theme.shadows[3] : 'none',
                  border: `2px solid ${theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main}`,
                  '& img': {
                    objectFit: 'cover'
                  }
                }}
              >
                {!imagePreview && profileData.display_name ? profileData.display_name.charAt(0).toUpperCase() : 
                 !imagePreview && profileData.email ? profileData.email.charAt(0).toUpperCase() : null}
              </Avatar>
            </Badge>
            {isEditing && imagePreview && (
              <Tooltip title={t('profile.removePhoto')}>
                <IconButton size="small" onClick={handleRemoveImage} sx={{ mt: 1, color: 'error.main' }} disabled={!isEditing}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {imageProcessingError && <Alert severity="error" sx={{ mt: 1, fontSize: '0.8rem' }}>{imageProcessingError}</Alert>}
          </Grid>

          <Grid item xs={12} sm={8} container direction="column" spacing={1}>
            {!isEditing ? (
              <>
                <Grid item>
                  <Typography variant="body2" color="text.secondary" component="div">{t('profile.displayName', 'Display Name')}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{profileData.display_name || '-'}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 1 }}>{t('profile.fullName', 'Full Name')}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{profileData.full_name || '-'}</Typography>
                </Grid>
              </>
            ) : (
              <>
                <Grid item>
                  <TextField
                    label={t('profile.displayName')}
                    name="display_name"
                    value={profileData.display_name || ''}
                    onChange={handleInputChange}
                    fullWidth
                    variant="filled"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ readOnly: isGuestMode }}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    label={t('profile.fullName')}
                    name="full_name"
                    value={profileData.full_name || ''}
                    onChange={handleInputChange}
                    fullWidth
                    variant="filled"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ readOnly: isGuestMode }}
                  />
                </Grid>
              </>
            )}
          </Grid> 
        </Grid>

        <Grid item xs={12}> 
          <TextField
            label={t('profile.email')}
            name="email"
            type="email"
            value={profileData.email || ''}
            onChange={handleInputChange}
            fullWidth
            margin="none"
            disabled
            variant={"filled"}
            InputProps={{ readOnly: true, sx: { fontSize: '1.1rem' } }}
            InputLabelProps={{ shrink: true, sx: {fontSize: '1rem'} }}
            helperText={<Typography variant="caption">{t('profile.emailCannotBeChanged', 'Email cannot be changed.')}</Typography>}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Health Information Section */}
      <Grid container spacing={2}>
        {/* Age and Gender */}
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">{t('profile.age', 'Age')}</Typography>
          <Typography variant="h6">{profileData.age || '-'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">{t('profile.gender', 'Gender')}</Typography>
          <Typography variant="h6">{profileData.gender || '-'}</Typography>
        </Grid>

        {/* Medical Conditions */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">Medical Conditions</Typography>
          <Typography variant="h6">{profileData.medical_conditions || 'None'}</Typography>
        </Grid>

        {/* Current Medications */}
        <Grid item xs={12} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">Current Medications</Typography>
          <Typography variant="h6">{profileData.current_medications || 'None'}</Typography>
        </Grid>

        {/* Allergies */}
        <Grid item xs={12} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">Allergies</Typography>
          <Typography variant="h6">{profileData.allergies || 'None'}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Grid item xs={12} sx={{ mt: 2 }}>
        <Tooltip title={t('profile.healthInfoTooltip')}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Key Health Information
          </Typography>
        </Tooltip>

        {!isEditing ? (
          <Paper elevation={0} sx={{ p:1.5, border: '1px solid', borderColor: 'divider', borderRadius:1, whiteSpace: 'pre-wrap', bgcolor: 'background.default' }}>
            <Typography variant="body1" component="div">
              {keyHealthInfo || 'No key health information recorded.'}
            </Typography>
          </Paper>
        ) : (
          <TextField
            name="keyHealthInfo"
            value={keyHealthInfo}
            onChange={(e) => { setKeyHealthInfo(e.target.value); setSaveError(''); setSaveSuccess(''); }}
            fullWidth
            multiline
            rows={8}
            variant="outlined"
            placeholder={t('profile.healthInfoPlaceholder')}
            sx={{ bgcolor: 'background.paper', textarea: { fontSize: '1rem' } }}
            InputProps={{ readOnly: isGuestMode }}
          />
        )}
      </Grid>

      {isEditing && (saveError || saveSuccess) && (
        <Box sx={{ mt: 2 }}>
          {saveError && <Alert severity="error" sx={{ mb:1 }}>{saveError}</Alert>}
          {saveSuccess && <Alert severity="success" sx={{ mb:1 }}>{saveSuccess}</Alert>}
        </Box>
      )}
    </Paper>
  );
} 