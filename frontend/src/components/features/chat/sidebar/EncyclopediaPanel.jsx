// EncyclopediaPanel.jsx - Component for the Encyclopedia search functionality
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Link as MuiLink,
  Stack,
} from '@mui/material';
import { ThinkingIndicator } from '../../../common/ThinkingIndicator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { printHtmlContent } from '../../../../utils/printUtils';
import translationService from '../../../../services/translationService';
import VirtualMDLogo from '../../../../assets/branding/full_logo_medium.png' // Medium for component;

// Helper function to copy text to clipboard
const copyToClipboard = async (text, t) => {
  try {
    await navigator.clipboard.writeText(text);
    // Simple alert feedback - could be enhanced with snackbar if needed
    alert(t('encyclopedia.copySuccess'));
  } catch (err) {
    console.error('Clipboard copy failed', err);
    alert(t('encyclopedia.copyError'));
  }
};

// Encyclopedia Query Input Component
function EncyclopediaQueryInput({ onSubmit, isLoading, hasResponse }) {
  const { t } = useTranslation('chat');
  // Use sessionStorage to persist query text across navigation
  const getStoredQuery = () => {
    try {
      const stored = sessionStorage.getItem('VirtualMD_encyclopedia_query_text') || '';
      return stored;
    } catch (e) {
      return '';
    }
  };

  const setStoredQuery = (text) => {
    try {
      sessionStorage.setItem('VirtualMD_encyclopedia_query_text', text);
    } catch (e) {
      // Silent fail if sessionStorage unavailable
    }
  };

  // Always sync with sessionStorage on every render
  const [query, setQuery] = useState(getStoredQuery());

  // Sync with sessionStorage when component mounts or remounts
  React.useEffect(() => {
    const storedQuery = getStoredQuery();
    if (storedQuery !== query) {
      setQuery(storedQuery);
    }
  }, [query]);

  // Store query text in sessionStorage whenever it changes
  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setStoredQuery(newQuery);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Encyclopedia: Form submitted with query:', query);
    if (query.trim()) {
      console.log('Encyclopedia: Calling onSubmit with:', query.trim());
      onSubmit(query.trim()); // Trim query for consistency
    } else {
      console.log('Encyclopedia: Query is empty, not submitting');
    }
  };

  const handleKeyPress = (e) => {
    // Handle Enter key to submit (but not Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('Encyclopedia: Enter key pressed with query:', query);
      if (query.trim()) {
        console.log('Encyclopedia: Calling onSubmit via Enter with:', query.trim());
        onSubmit(query.trim()); // Trim query for consistency
      } else {
        console.log('Encyclopedia: Query is empty, not submitting via Enter');
      }
    }
  };

  // Hide the entire input section if we have a response
  if (hasResponse) {
    return null;
  }

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography variant="h7" component="div">
          {t('encyclopedia.title')}
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={query}
          onChange={handleQueryChange}
          margin="normal"
          variant="outlined"
          disabled={isLoading}
          onKeyDown={handleKeyPress}
        />
        {isLoading ? (
          <Box
            sx={{
              mt: 1,
              p: 2,
              bgcolor: '#AD55DA', // Purple background
              color: 'white',
              borderRadius: 1,
              textAlign: 'center',
              fontWeight: 'medium'
            }}
          >
            {t('encyclopedia.loadingMessage')}
          </Box>
        ) : (
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 1 }}
            disabled={!query.trim()}
          >
            {t('encyclopedia.searchButton')}
          </Button>
        )}
      </Box>
    </Paper>
  );
}

// Main Encyclopedia Panel Component
export default function EncyclopediaPanel({
  onSubmit,
  response, // The full response object { response, engine_id }
  isLoading,
  error,
  onReset, // New prop to clear the response and return to input
}) {
  const { t, i18n } = useTranslation('chat');
  const contentRef = useRef(null);
  
  // Translation state management
  const [translatedContent, setTranslatedContent] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState({});

  // Translation effect for backend content
  useEffect(() => {
    if (!response?.response) {
      setTranslatedContent('');
      return;
    }

    const rawContent = response.response;

    // Skip translation for English
    if (i18n.language === 'en') {
      setTranslatedContent(rawContent);
      return;
    }

    // Create cache key
    const createCacheKey = (content, language) => {
      const contentHash = content.length + '_' + content.substring(0, 50).replace(/\s/g, '');
      return `encyclopedia_${contentHash}_${language}`;
    };

    const cacheKey = createCacheKey(rawContent, i18n.language);

    // Check cache first
    if (cacheKey && translationCache[cacheKey]) {
      console.log(`[EncyclopediaPanel] Using cached translation for ${i18n.language}`);
      setTranslatedContent(translationCache[cacheKey]);
      return;
    }

    // Translate if needed
    setIsTranslating(true);
    
    const translateContent = async () => {
      try {
        // Translate the content
        const result = await translationService.translateText(rawContent, i18n.language);
        
        if (result.success) {
          const translatedText = result.data.translated_text;
          
          // Cache the translated content
          if (cacheKey) {
            setTranslationCache(prev => ({
              ...prev,
              [cacheKey]: translatedText
            }));
            console.log(`[EncyclopediaPanel] Cached translation for ${i18n.language}`);
          }
          
          setTranslatedContent(translatedText);
        } else {
          console.warn('[EncyclopediaPanel] Translation failed, using original content:', result.error);
          setTranslatedContent(rawContent);
        }
      } catch (error) {
        console.error('[EncyclopediaPanel] Error translating encyclopedia content:', error);
        // Fallback to original content if translation fails
        setTranslatedContent(rawContent);
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [response?.response, i18n.language, translationCache]);

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const handlePrint = () => {
    if (!contentRef.current || !response?.response) return;
    printHtmlContent(t('encyclopedia.print.title'), t('encyclopedia.print.subtitle'), contentRef.current.innerHTML, VirtualMDLogo);
  };

  // Define Markdown components for styling
  const markdownComponents = {
    h1: ({node, ...props}) => <Typography variant="h5" gutterBottom sx={{ mt: 2 }} {...props} />, // Slightly smaller than page H4
    h2: ({node, ...props}) => <Typography variant="h6" gutterBottom sx={{ mt: 1.5 }} {...props} />,
    h3: ({node, ...props}) => <Typography variant="subtitle1" gutterBottom sx={{ mt: 1, fontWeight: 'bold' }} {...props} />,
    p: ({node, ...props}) => <Typography paragraph sx={{ mb: 1.5 }} {...props} />,
    li: ({node, ...props}) => <li style={{ marginBottom: '0.5em' }}><Typography component="span" {...props} /></li>,
    a: ({node, ...props}) => <MuiLink {...props} target="_blank" rel="noopener noreferrer" />, // Use MuiLink
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 0 /* Panel already has padding */ }}>
      {/* Input Component - takes its own height, does not grow/shrink */}
      <Box sx={{ flexShrink: 0, mb: 1 /* Add some margin below input */ }}>
        <EncyclopediaQueryInput onSubmit={onSubmit} isLoading={isLoading} hasResponse={response?.response} />
      </Box>

      {/* Results Area - grows to fill remaining space and scrolls internally */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 /* Important for flex item scrolling */ }}>
        {isLoading && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <ThinkingIndicator />
            </Box>
            <Typography variant="body2" align="center" color="text.secondary">
              {t('encyclopedia.generatingResponse')}
            </Typography>
            <Typography variant="caption" align="center" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {t('encyclopedia.longWaitMessage')}
            </Typography>
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {typeof error === 'string' ? error : error?.message || t('encyclopedia.genericError')}
          </Alert>
        )}
        {response?.response && !isLoading && !error && (
          <Paper variant="outlined" sx={{ p: 2, mt: 0, display: 'flex', flexDirection: 'column', minHeight: 0, flexGrow: 1 }}>
            {/* Button Bar */}
            <Box sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 0.5 }}>
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  sx={{ p: 0, minWidth: 'auto', fontSize: '0.75rem' }}
                  onClick={handleReset}
                >
                  {t('encyclopedia.return')}
                </Button>
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  sx={{ p: 0, minWidth: 'auto', fontSize: '0.75rem' }}
                  onClick={handlePrint}
                >
                  {t('encyclopedia.print.button')}
                </Button>
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  sx={{ p: 0, minWidth: 'auto', fontSize: '0.75rem' }}
                  onClick={() => copyToClipboard(response.response, t)}
                >
                  {t('encyclopedia.copy')}
                </Button>
              </Stack>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                {t('encyclopedia.searchResult')}
              </Typography>
            </Box>

            {/* Content Area with ref for printing */}
            <Box ref={contentRef} sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
              {isTranslating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ThinkingIndicator size="small" />
                  <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                    {t('encyclopedia.translatingContent')}
                  </Typography>
                </Box>
              )}
              <ReactMarkdown
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
              >
                {translatedContent || response.response}
              </ReactMarkdown>
              {response.engine_id && (
                <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary', textAlign: 'right', fontStyle: 'italic' }}>
                  {t('encyclopedia.attribution')}
                </Typography>
              )}
            </Box>
          </Paper>
        )}
        {!isLoading && !error && !response?.response && (
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 2, p:2 }}>
                {t('encyclopedia.emptyState')}
            </Typography>
        )}
      </Box>
    </Box>
  );
}
