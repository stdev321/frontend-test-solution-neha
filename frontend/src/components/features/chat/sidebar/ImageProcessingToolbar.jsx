import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { processImage } from '../../../../utils/browserImageProcessor';

const PRESET_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'mammography', label: 'Mammography' },
  { value: 'ophthalmology_red_free', label: 'Red-Free' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'ct_soft_tissue', label: 'CT Soft-Tissue' },
  { value: 'ct_lung', label: 'CT Lung' },
  { value: 'mri_t1', label: 'MRI-T1' },
  { value: 'mri_t2', label: 'MRI-T2' },
  { value: 'ultrasound', label: 'Ultrasound' },
  { value: 'endoscopy', label: 'Endoscopy' }
];

export default function ImageProcessingToolbar({
  activeImageStack,
  uploadedImagePreviewUrl,
  onAddProcessedImageFile,
  onSetFocusedImage
}) {
  const [preset, setPreset] = useState('standard');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('chat');

  const focusedImage = activeImageStack.find(img => img.url === uploadedImagePreviewUrl);

  const handleProcess = async () => {
    if (!focusedImage) return;
    try {
      setLoading(true);
      const originalBlob = await (await fetch(focusedImage.url)).blob();
      const processedBlob = await processImage(originalBlob, preset);

      // Create a File object to reuse existing upload logic
      const processedFileName = `processed_${preset}_${focusedImage.filename || 'image'}.jpg`;
      const processedFile = new File([processedBlob], processedFileName, { type: 'image/jpeg' });

      if (onAddProcessedImageFile) {
        await onAddProcessedImageFile([processedFile]);
      }
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message || 'Processing failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevertFocus = () => {
    if (!focusedImage) return;
    // Find the original image (first non-crop that shares same sourceImageId or itself)
    const original = activeImageStack.find(img => !img.isCrop && (img.id === focusedImage.sourceImageId || img.id === focusedImage.id));
    if (original && onSetFocusedImage) onSetFocusedImage(original.id);
  };

  return (
    <Box sx={{ display: 'none', alignItems: 'center', gap: 1, mb: 1, mt: 1 }}>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="preset-select-label">{t('imageProcessing.preset')}</InputLabel>
        <Select
          labelId="preset-select-label"
          value={preset}
          label={t('imageProcessing.preset')}
          onChange={e => setPreset(e.target.value)}
        >
          {PRESET_OPTIONS.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tooltip title={t('imageProcessing.applyPreset')}>
        <span>
          <Button
            variant="contained"
            size="small"
            disabled={loading || !focusedImage}
            onClick={handleProcess}
          >
            {loading ? <CircularProgress size={16} /> : t('imageProcessing.process')}
          </Button>
        </span>
      </Tooltip>

      <Tooltip title={t('imageProcessing.revertFocus')}>
        <span>
          <Button
            variant="outlined"
            size="small"
            disabled={!focusedImage}
            onClick={handleRevertFocus}
          >
            {t('imageProcessing.revert')}
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
}

ImageProcessingToolbar.propTypes = {
  activeImageStack: PropTypes.array.isRequired,
  uploadedImagePreviewUrl: PropTypes.string,
  onAddProcessedImageFile: PropTypes.func,
  onSetFocusedImage: PropTypes.func
}; 