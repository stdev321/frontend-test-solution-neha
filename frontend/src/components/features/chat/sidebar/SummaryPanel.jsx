// SummaryPanel.jsx
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { printHtmlContent } from '../../../../utils/printUtils';
import VirtualMDLogo from '../../../../assets/branding/full_logo_medium.png' // Medium for component;

// SummaryPanel Component
function SummaryPanel({ data, onReturnToPanel, onShowTranscript }) {
  const { t } = useTranslation('chat');
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Clipboard copy failed', err);
      alert(t('summary.copyError'));
    }
  };
  // Add your console logs here if you want to see it one last time
  // console.log("SUMMARY_PANEL_DEBUG: Received data:", data, "(type:", typeof data + ")");

  if (!data) {
    return <Typography sx={{p:2}}>{t('summary.noSummary')}</Typography>;
  }
  
  const contentRef = React.useRef(null);
  const handlePrint = () => {
    if (!contentRef.current) return;
    printHtmlContent(t('summary.title'),t('summary.title'),contentRef.current.innerHTML,VirtualMDLogo);
  };

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{mb:1}}>
        <Stack direction="row" spacing={1} sx={{flexWrap:'wrap', mb:0.5}}>
          {onReturnToPanel && (
            <Button size="small" variant="text" color="primary" sx={{p:0,minWidth:'auto',fontSize:'0.75rem'}} onClick={onReturnToPanel}>{t('summary.return')}</Button>
          )}
          {onShowTranscript && (
            <Button size="small" variant="text" color="primary" sx={{p:0,minWidth:'auto',fontSize:'0.75rem'}} onClick={onShowTranscript}>{t('summary.transcript')}</Button>
          )}
          <Button size="small" variant="text" color="primary" sx={{p:0,minWidth:'auto',fontSize:'0.75rem'}} onClick={handlePrint}>{t('summary.print')}</Button>
          <Button size="small" variant="text" color="primary" sx={{p:0,minWidth:'auto',fontSize:'0.75rem'}} onClick={() => copyToClipboard(data)}>{t('summary.copy')}</Button>
        </Stack>
        <Typography variant="h6">{t('summary.title')}</Typography>
      </Box>
      <Box ref={contentRef} sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data}
        </ReactMarkdown>
      </Box>
    </Paper>
  );
}

SummaryPanel.propTypes = {
  data: PropTypes.string,
  onReturnToPanel: PropTypes.func,
  onShowTranscript: PropTypes.func,
};

SummaryPanel.defaultProps = {
  data: '',
  onReturnToPanel: null,
  onShowTranscript: null,
};

export default SummaryPanel;
