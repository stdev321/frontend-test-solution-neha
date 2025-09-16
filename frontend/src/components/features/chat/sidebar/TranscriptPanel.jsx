import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack
} from '@mui/material';
import { printHtmlContent } from '../../../../utils/printUtils';
import VirtualMDLogo from '../../../../assets/branding/full_logo_medium.png' // Medium for component;

// Helper to copy text
const copyToClipboard = async (text, t) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error('Clipboard copy failed', e);
    alert(t('transcript.copyError'));
  }
};

// Helper to parse markdown-style bold text and convert to JSX
const parseTranscriptText = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  return lines.map((line, index) => {
    if (!line.trim()) {
      return <br key={index} />;
    }
    
    // Check if line contains bold speaker name pattern: **Speaker Name:**
    const boldSpeakerMatch = line.match(/^\*\*(.*?):\*\*\s(.*)$/);
    if (boldSpeakerMatch) {
      const [, speakerName, content] = boldSpeakerMatch;
      return (
        <Box key={index} sx={{ mb: 1.5 }}>
          <Typography component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {speakerName}:
          </Typography>
          <Typography component="span" sx={{ ml: 1 }}>
            {content}
          </Typography>
        </Box>
      );
    }
    
    // Regular line (headers, dates, etc.)
    return (
      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
        {line}
      </Typography>
    );
  });
};

// Helper to convert transcript to HTML for printing
const convertTranscriptToHtml = (text) => {
  if (!text) return '';
  
  const lines = text.split('\n');
  let htmlContent = '';
  
  lines.forEach(line => {
    if (!line.trim()) {
      htmlContent += '<br>';
      return;
    }
    
    // Check if line contains bold speaker name pattern: **Speaker Name:**
    const boldSpeakerMatch = line.match(/^\*\*(.*?):\*\*\s(.*)$/);
    if (boldSpeakerMatch) {
      const [, speakerName, content] = boldSpeakerMatch;
      htmlContent += `<div style="margin-bottom: 12px;"><strong style="color: #1976d2;">${speakerName}:</strong> ${content}</div>`;
    } else {
      // Regular line (headers, dates, etc.)
      htmlContent += `<div style="margin-bottom: 4px;">${line}</div>`;
    }
  });
  
  return htmlContent;
};

// TranscriptPanel Component
function TranscriptPanel({ data, onReturnToPanel, onShowSummary }) {
  const { t } = useTranslation('chat');
  if (!data || !data.transcript) return <Typography sx={{p:2}}>{t('transcript.noTranscript')}</Typography>;

  const contentRef = React.useRef(null);
  const handlePrint = () => {
    if (!data.transcript) return;
    const htmlContent = convertTranscriptToHtml(data.transcript);
    printHtmlContent(t('transcript.title'), t('transcript.title'), htmlContent, VirtualMDLogo);
  };

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{mb:1}}>
        <Stack direction="row" spacing={1} sx={{flexWrap:'wrap', mb:0.5}}>
          {onReturnToPanel && (
            <Button size="small" variant="text" color="primary" sx={{p:0,minWidth:'auto',fontSize:'0.75rem'}} onClick={onReturnToPanel}>{t('transcript.returnToConversation')}</Button>
          )}
          <Button size="small" variant="text" color="primary" sx={{p:0,minWidth:'auto',fontSize:'0.75rem'}} onClick={handlePrint}>{t('transcript.print')}</Button>
          <Button size="small" variant="text" color="primary" sx={{p:0,minWidth:'auto',fontSize:'0.75rem'}} onClick={() => copyToClipboard(data.transcript, t)}>{t('transcript.copy')}</Button>
        </Stack>
        <Typography variant="h6">{t('transcript.title')}</Typography>
      </Box>
      <Box ref={contentRef} sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
        {Array.isArray(data.transcript) ? (
          data.transcript.map((msg, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: msg.role === 'user' ? 'bold' : 'normal' }}>
                {msg.role === 'user' ? t('transcript.roleLabels.patient') : t('transcript.roleLabels.assistant')}
              </Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>{msg.content}</Typography>
            </Box>
          ))
        ) : (
          parseTranscriptText(data.transcript)
        )}
      </Box>
    </Paper>
  );
}

TranscriptPanel.propTypes = {
  data: PropTypes.shape({
    transcript: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.shape({
        role: PropTypes.string,
        content: PropTypes.string
      }))
    ])
  }),
  onReturnToPanel: PropTypes.func,
  onShowSummary: PropTypes.func,
};

TranscriptPanel.defaultProps = {
  data: null,
  onReturnToPanel: null,
  onShowSummary: null,
};

export default TranscriptPanel;
