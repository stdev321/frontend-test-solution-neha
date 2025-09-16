import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

const PRESET_LABELS = [
  { value: 'standard', label: 'Standard Enhancement' },
  { value: 'mammography', label: 'Mammography' },
  { value: 'ophthalmology_red_free', label: 'Red-Free (Ophthalmology)' },
  { value: 'radiology', label: 'Radiology (General)' },
  { value: 'ct_soft_tissue', label: 'CT – Soft Tissue Window' },
  { value: 'ct_lung', label: 'CT – Lung Window' },
  { value: 'mri_t1', label: 'MRI T1-Weighted' },
  { value: 'mri_t2', label: 'MRI T2-Weighted' },
  { value: 'ultrasound', label: 'Ultrasound' },
  { value: 'endoscopy', label: 'Endoscopy' }
];

export default function MedicalImageProcessingPage() {
  const [preset, setPreset] = useState('standard');
  const [file, setFile] = useState(null);
  const [processedUrl, setProcessedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation('pages');

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError('');
    setProcessedUrl('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('preset', preset);

      const res = await fetch('http://localhost:4001/process', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Processing failed');
      const blob = await res.blob();
      setProcessedUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {t('medicalImageProcessingPage.title')}
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="preset-label">{t('medicalImageProcessingPage.preset')}</InputLabel>
        <Select
          labelId="preset-label"
          value={preset}
          label={t('medicalImageProcessingPage.preset')}
          onChange={e => setPreset(e.target.value)}
        >
          {PRESET_LABELS.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" component="label" sx={{ mr: 2 }}>
        {t('medicalImageProcessingPage.chooseImage')}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
      </Button>
      {file && <Typography variant="body2">{file.name}</Typography>}

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !file}>
          {loading ? <CircularProgress size={24} /> : t('medicalImageProcessingPage.process')}
        </Button>
      </Box>

      {processedUrl && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t('medicalImageProcessingPage.processedImage')}
          </Typography>
                          <img src={processedUrl} alt={t('common:alt.processed')} style={{ maxWidth: '100%' }} />
        </Box>
      )}

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
} 