// frontend/src/components/layout/Footer.jsx
// Simple footer component using MUI, matching the theme.
export const FOOTER_DESKTOP_HEIGHT = 56; // px – used by layouts to reserve space when footer is fixed

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link, useTheme, Container, Tooltip, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

function Footer() {
  const theme = useTheme();
  const { brandColors } = theme.palette; // Assuming brandColors exist in theme
  const { t } = useTranslation('common');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Use a subtle background color derived from the theme, or a default
  const footerBgColor = brandColors?.darkBlue ? `${brandColors.darkBlue}E6` : 'rgba(53, 106, 195, 0.9)'; // Dark blue with opacity
  const footerTextColor = 'rgba(255, 255, 255, 0.8)';
  const linkHoverColor = 'rgba(255, 255, 255, 1)';

  const linkStyles = {
    color: footerTextColor,
    textDecoration: 'none',
    transition: 'all 0.2s',
    '&:hover': {
      color: linkHoverColor,
      textDecoration: 'underline',
    },
  };

  // Health Advisory specific styles
  const healthAdvisoryStyles = {
    color: 'red',
    textDecoration: 'underline',
    transition: 'all 0.2s',
    '&:hover': {
      color: '#ff5555',
    },
    fontSize: 'inherit',
  };

  const tooltipText = t('footer.medicalDisclaimerTooltip');

  return (
    <Box sx={{ 
      mt: 'auto',
      width: '100%',
    }}>
      <Box
        component="footer"
        sx={{
          width: '100%',
          py: { xs: 1.5, md: 1.5, xl: 3 },
          px: { xs: 2, md: 3, xl: 5 }, // Match header padding
          backgroundColor: footerBgColor,
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        }}
      >
        {isMobile ? (
          // Mobile layout - compact grid
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, justifyItems: 'center' }}>
              <Tooltip 
                title={
                  <Typography sx={{ fontSize: '14px' }}>
                    {tooltipText}
                  </Typography>
                }
                placement="top"
                arrow
              >
                <Link 
                  component={RouterLink} 
                  to="/health-advisory" 
                  variant="caption" 
                  sx={{ ...healthAdvisoryStyles, fontSize: '0.75rem' }}
                >
                  {t('footer.medicalAdvisory')}
                </Link>
              </Tooltip>
              <Link component={RouterLink} to="/legal" variant="caption" sx={{ ...linkStyles, fontSize: '0.75rem' }}>
                {t('footer.legal')}
              </Link>
              <Link component={RouterLink} to="/data-privacy-whitepaper" variant="caption" sx={{ ...linkStyles, fontSize: '0.75rem' }}>
                {t('footer.yourPrivacy')}
              </Link>
              <Link component={RouterLink} to="/contact" variant="caption" sx={{ ...linkStyles, fontSize: '0.75rem' }}>
                {t('footer.contactUs')}
              </Link>
              <Link component={RouterLink} to="/how-to" variant="caption" sx={{ ...linkStyles, fontSize: '0.75rem' }}>
                {t('footer.howToUse')}
              </Link>
              <Link component={RouterLink} to="/faq" variant="caption" sx={{ ...linkStyles, fontSize: '0.75rem' }}>
                {t('footer.faq')}
              </Link>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Link component={RouterLink} to="/note-from-founders" variant="caption" sx={{ ...linkStyles, fontSize: '0.75rem' }}>
                {t('footer.noteFromFounders')}
              </Link>
              <Link href="https://blog.virtualmd.app" target="_blank" rel="noopener noreferrer" variant="caption" sx={{ ...linkStyles, fontSize: '0.75rem' }}>
                {t('footer.blog', 'Blog')}
              </Link>
              <Link href="mailto:info@virtualmd.app" variant="caption" sx={{ ...linkStyles, fontWeight: 'bold', fontSize: '0.75rem' }}>
                info@virtualmd.app
              </Link>
              <Typography variant="caption" sx={{ color: footerTextColor, fontSize: '0.7rem' }}>
                &copy; {new Date().getFullYear()} {t('footer.copyright')}
              </Typography>
            </Box>
          </Box>
        ) : (
          // Desktop layout - original horizontal
          <>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: footerTextColor, flexShrink: 0 }}>
                &copy; {new Date().getFullYear()} {t('footer.copyright')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Tooltip 
                  title={
                    <Typography sx={{ fontSize: '14px' }}>
                      {tooltipText}
                    </Typography>
                  }
                  placement="top-start"
                  arrow
                >
                  <Link 
                    component={RouterLink} 
                    to="/health-advisory" 
                    variant="body2" 
                    sx={healthAdvisoryStyles}
                  >
                    {t('footer.medicalAdvisory')}
                  </Link>
                </Tooltip>
                <Link component={RouterLink} to="/data-privacy-whitepaper" variant="body2" sx={linkStyles}>
                  {t('footer.yourPrivacy')}
                </Link>
                <Link component={RouterLink} to="/legal" variant="body2" sx={linkStyles}>
                  {t('footer.legal')}
                </Link>
                <Link component={RouterLink} to="/contact" variant="body2" sx={linkStyles}>
                  {t('footer.contactUs')}
                </Link>
                <Link component={RouterLink} to="/how-to" variant="body2" sx={linkStyles}>
                  {t('footer.howToUse')}
                </Link>
                <Link component={RouterLink} to="/faq" variant="body2" sx={linkStyles}>
                  {t('footer.faq')}
                </Link>
                <Link component={RouterLink} to="/note-from-founders" variant="body2" sx={linkStyles}>
                  {t('footer.noteFromFounders')}
                </Link>
                <Link href="https://blog.virtualmd.app" target="_blank" rel="noopener noreferrer" variant="body2" sx={linkStyles}>
                  {t('footer.blog', 'Blog')}
                </Link>
                <Link href="mailto:info@virtualmd.app" variant="body2" sx={{ ...linkStyles, fontWeight: 'bold' }}>
                  info@virtualmd.app
                </Link>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default Footer; 