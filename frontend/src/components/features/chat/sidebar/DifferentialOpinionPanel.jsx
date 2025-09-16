import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import translationService from '../../../../services/translationService';
import { formatDifferentialOpinionText, personalizePatientReferences } from './helpers';

const DifferentialOpinionPanel = ({ 
  data, 
  profileData, 
  currentUser, 
  conversationId,
  onSetMode,
  onPrint,
  onCopy,
  panelRef
}) => {
  const { t, i18n } = useTranslation('chat');
  const [translatedContent, setTranslatedContent] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState({});

  // Create cache key for this content and language
  const createCacheKey = (content, language) => {
    if (!content) return null;
    // Create a simple hash based on content length and first 50 chars + language
    const contentHash = content.length + '_' + content.substring(0, 50).replace(/\s/g, '');
    return `differential_opinion_${contentHash}_${language}`;
  };

  // Translation effect - runs when data or language changes
  useEffect(() => {
    const translateContent = async () => {
      const rawContent = data?.content || data || t('differentialOpinion.noOpinionAvailable');
      
      if (!rawContent || rawContent === t('differentialOpinion.noOpinionAvailable')) {
        setTranslatedContent(rawContent);
        return;
      }

      const cacheKey = createCacheKey(rawContent, i18n.language);
      
      // Check if we have cached translation for this language
      if (cacheKey && translationCache[cacheKey]) {
        console.log(`[DifferentialOpinionPanel] Using cached translation for ${i18n.language}`);
        setTranslatedContent(translationCache[cacheKey]);
        return;
      }

      // If language is English, cache and use original content
      if (i18n.language === 'en') {
        const cacheKeyEn = createCacheKey(rawContent, 'en');
        if (cacheKeyEn) {
          setTranslationCache(prev => ({
            ...prev,
            [cacheKeyEn]: rawContent
          }));
        }
        setTranslatedContent(rawContent);
        return;
      }

      console.log(`[DifferentialOpinionPanel] Translating differential opinion content to ${i18n.language}`);
      setIsTranslating(true);

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
            console.log(`[DifferentialOpinionPanel] Cached translation for ${i18n.language}`);
          }
          
          setTranslatedContent(translatedText);
        } else {
          console.warn('[DifferentialOpinionPanel] Translation failed, using original content:', result.error);
          setTranslatedContent(rawContent);
        }
      } catch (error) {
        console.error('[DifferentialOpinionPanel] Error translating differential opinion:', error);
        // Fallback to original content if translation fails
        setTranslatedContent(rawContent);
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [data, i18n.language, translationCache]);

  // Use either translated content or original content during translation
  const displayContent = isTranslating ? (data?.content || data || t('differentialOpinion.noOpinionAvailable')) : translatedContent;
  
  // Format and personalize the content
  const formattedContent = formatDifferentialOpinionText(displayContent);
  const personalizedContent = personalizePatientReferences(formattedContent, profileData, currentUser);

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 0.5 }}>
          <Button
            size="small"
            variant="text"
            color="primary"
            sx={{ p: 0, minWidth: 'auto', fontSize: '0.75rem' }}
            onClick={() => {
              if (conversationId) onSetMode('activeChatView');
              else onSetMode('default');
            }}
          >
            {t('encyclopedia.return')}
          </Button>
          <Button
            size="small"
            variant="text"
            color="primary"
            sx={{ p: 0, minWidth: 'auto', fontSize: '0.75rem' }}
            onClick={onPrint}
          >
            {t('encyclopedia.print')}
          </Button>
          <Button
            size="small"
            variant="text"
            color="primary"
            sx={{ p: 0, minWidth: 'auto', fontSize: '0.75rem' }}
            onClick={() => onCopy(personalizedContent)}
          >
            {t('encyclopedia.copy')}
          </Button>
        </Stack>
        <Typography variant="h6">{t('sidebarHeader.differentialOpinion')}</Typography>
        {isTranslating && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            {t('messages.processing')}{t('common.punctuation.ellipsis')}
          </Typography>
        )}
      </Box>
      <Box ref={panelRef} sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {personalizedContent || t('differentialOpinion.noOpinionAvailable')}
        </ReactMarkdown>
      </Box>
    </Paper>
  );
};

DifferentialOpinionPanel.propTypes = {
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  profileData: PropTypes.object,
  currentUser: PropTypes.object,
  conversationId: PropTypes.string,
  onSetMode: PropTypes.func.isRequired,
  onPrint: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  panelRef: PropTypes.object
};

export default DifferentialOpinionPanel; 