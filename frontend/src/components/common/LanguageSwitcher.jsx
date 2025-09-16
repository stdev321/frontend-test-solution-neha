import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  Box, 
  Typography
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';
import CheckIcon from '@mui/icons-material/Check';
import { clearPersonasCache } from '../../services/personaI18nService';

const LanguageSwitcher = ({ 
  variant = 'icon', // 'icon', 'button', 'text'
  showLabel = false,
  color = 'inherit',
  size = 'medium'
}) => {
  const { i18n } = useTranslation(['common', 'header']);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language) => {
    // Clear the personas cache to force reload with new language
    clearPersonasCache();
    
    i18n.changeLanguage(language);
    // Change document direction for RTL support
    const rtlLanguages = ['ar', 'he', 'fa'];
    const isRTL = rtlLanguages.includes(language);
    
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.body.dir = isRTL ? 'rtl' : 'ltr';
    document.body.className = isRTL ? 'rtl' : 'ltr';
    
    // Close the menu after a short delay
    setTimeout(() => {
      handleClose();
    }, 1000);
  };

  // All languages alphabetically sorted with Latin name first, then native script
  const allLanguages = [
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'de', name: 'Deutsch' },
    { code: 'nl', name: 'Dutch (Nederlands)' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fa', name: 'Farsi', nativeName: 'فارسی' },
    { code: 'fil', name: 'Filipino' },
    { code: 'fr', name: 'Français' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'id', name: 'Indonesian' },
    { code: 'it', name: 'Italiano' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ms', name: 'Malay' },
    { code: 'mi', name: 'Māori' },
    { code: 'pt', name: 'Português' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'sw', name: 'Swahili' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
    { code: 'xh', name: 'Xhosa' },
    { code: 'yo', name: 'Yorùbá' },
    { code: 'zu', name: 'Zulu' }
  ];

  const getCurrentLanguageName = () => {
    const lang = allLanguages.find(l => l.code === i18n.language);
    return lang ? lang.name : 'English';
  };



  const getLanguageDisplay = (language) => {
    if (language.nativeName) {
      return `${language.name} (${language.nativeName})`;
    }
    return language.name;
  };

  const renderTrigger = () => {
    switch (variant) {
      case 'text':
        return (
          <Box
            onClick={handleClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              color: color,
              '&:hover': {
                opacity: 0.7
              }
            }}
          >
            <LanguageIcon fontSize={size} />
            {showLabel && (
              <Typography variant="body2">
                {getCurrentLanguageName()}
              </Typography>
            )}
          </Box>
        );
      
      default:
        return (
          <IconButton
            onClick={handleClick}
            color={color}
            size={size}
            sx={{
              color: color === 'inherit' ? 'inherit' : color
            }}
          >
            <PublicIcon />
          </IconButton>
        );
    }
  };

  return (
    <>
      {renderTrigger()}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root': {
            maxHeight: '90vh',
            width: { xs: '340px', sm: '460px', md: '600px' },
            maxWidth: '95vw',
            mt: 1,
            direction: 'ltr !important', // Force LTR for language grid columns
            transform: 'none !important', // Prevent any transforms
            '& *': {
              direction: 'ltr !important', // Force all children to LTR
            }
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Box 
          sx={{ 
            p: 1,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gridAutoFlow: 'column',
            gridTemplateRows: { 
              xs: 'repeat(30, auto)', 
              sm: 'repeat(15, auto)', 
              md: 'repeat(10, auto)' 
            },
            gap: 0.5,
            // Use transform to counteract RTL flipping
            transform: i18n.dir() === 'rtl' ? 'scaleX(-1)' : 'none',
            '& > *': {
              // Flip children back
              transform: i18n.dir() === 'rtl' ? 'scaleX(-1)' : 'none',
            }
          }}>
          {allLanguages.map((language) => {
            const isSelected = i18n.language === language.code;
            return (
              <MenuItem
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                selected={isSelected}
                sx={{
                  py: 0.75,
                  px: 1.5,
                  borderRadius: 0.5,
                  backgroundColor: isSelected ? '#2196F3 !important' : 'transparent',
                  color: isSelected ? 'white !important' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isSelected ? '#1976D2 !important' : 'action.hover'
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#2196F3 !important',
                    color: 'white !important'
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: '36px',
                  border: '2px solid',
                  borderColor: isSelected ? '#9C27B0' : 'transparent'
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 600 : 400
                  }}
                >
                  {getLanguageDisplay(language)}
                </Typography>
                {isSelected && (
                  <CheckIcon 
                    sx={{ 
                      ml: 1,
                      fontSize: '1rem',
                      color: 'white'
                    }} 
                  />
                )}
              </MenuItem>
            );
          })}
        </Box>
      </Menu>
    </>
  );
};

export default LanguageSwitcher;