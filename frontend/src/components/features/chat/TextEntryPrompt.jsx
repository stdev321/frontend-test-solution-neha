import React, { useEffect } from 'react';
import { Box, Paper, Typography, Button, Fade, useTheme } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';

export default function TextEntryPrompt({ show, onDismiss }) {
  const theme = useTheme();
  const { t } = useTranslation('chat');
  const { t: tCommon } = useTranslation('common');

  // Auto-dismiss after 10 s
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDismiss, 10_000);
    return () => clearTimeout(t);
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <Fade in={show}>
      <Box
        sx={{
          position: 'absolute',
          bottom: 120,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          maxWidth: 400,
          width: '90%',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 3,
            bgcolor:
              theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.background.paper,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {t('input.enterTextHere')}
          </Typography>

          {/* Down-arrow */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <KeyboardArrowDownIcon
              sx={{
                fontSize: 40,
                color: 'primary.main',
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%,20%,50%,80%,100%': { transform: 'translateY(0)' },
                  '40%': { transform: 'translateY(-10px)' },
                  '60%': { transform: 'translateY(-5px)' },
                },
              }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('input.startTypingMessage')}
          </Typography>

          <Button variant="contained" onClick={onDismiss} size="small" sx={{ minWidth: 80 }}>
            {tCommon('common.ok')}
          </Button>
        </Paper>
      </Box>
    </Fade>
  );
}
