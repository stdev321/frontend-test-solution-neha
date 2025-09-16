// frontend/src/assets/whitepapers/PathologyAIWhitePaperPage.jsx
// This page displays the detailed white paper on AI in Pathology.

import React, { useEffect, useRef, useState } from 'react';
import { Container, Paper, Typography, Box, Divider, List, ListItem, ListItemText, Link, Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';
import jsPDF from 'jspdf';
import logoImage from '../../assets/branding/full_logo_high.png';

// Component to display figures with title and caption/citation
const FigureDisplay = ({ imageUrl, title, caption }) => (
  <Paper elevation={1} sx={{ p: 2, my: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>{title}</Typography>
    <Box 
      sx={{ 
        width: '100%',
        height: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#e0e0e0',
        border: '1px solid',
        borderColor: 'divider',
        my: 1,
      }} 
    >
      <Typography variant="body2" color="text.secondary">
        [Placeholder for {title}]
      </Typography>
    </Box>
    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
      {caption}
    </Typography>
  </Paper>
);

function PathologyAIWhitePaperPage() {
  const { setHeaderMode } = useHeaderVisibility();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0); // Scroll to top when component mounts
  }, [setHeaderMode]);

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      // PDF generation logic would go here
      // For now, let's keep it minimal to avoid syntax errors
      alert("PDF generation would happen here");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={isGeneratingPdf ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
        </Button>
      </Box>
      
      <Paper ref={contentRef} elevation={3} sx={{ 
        p: { xs: 2, sm: 3, md: 5 },
        bgcolor: '#2C3E50', // Darker blue-gray background for better contrast with white text
        color: 'white', // White text color for main content
      }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 1, color: 'white' }}>
          AI in Pathology: Advancing Diagnostic Accuracy and Efficiency
        </Typography>
        
        <Typography variant="subtitle1" align="center" color="rgba(255, 255, 255, 0.8)" sx={{ mb: 3 }}>
          <i>Ron Rubin, PhD and Sandy Miles</i><br />
          VirtualMD.app Technologies<br />
          <Link href="mailto:ronrubin@virtualmd.app" sx={{ color: '#90CAF9' }}>ronrubin@virtualmd.app</Link> <br />
          <Link href="mailto:sandy@virtualmd.app" sx={{ color: '#90CAF9' }}>sandymiles@virtualmd.app</Link>
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'white' }}>Abstract</Typography>
          <Typography variant="body1" paragraph sx={{ color: 'white' }}>
            Digital pathology combined with artificial intelligence has emerged as a powerful technology to enhance diagnostic accuracy and efficiency in histopathological analysis. This paper reviews current evidence for AI applications in pathology, from tumor detection and classification to automated Gleason scoring and expression pattern analysis. Recent studies demonstrate that AI algorithms can achieve 97-100% sensitivity and 88-98% specificity for prostate cancer detection (nature.com), detect breast cancer metastases in lymph nodes with AUC >0.99 (CAMELYON challenge), and predict patient outcomes from histomorphological features. FDA-cleared systems like Paige Prostate (2021) represent the first wave of AI tools entering clinical pathology practice. We examine performance metrics across multiple tissue types and discuss regulatory considerations, implementation challenges, and future directions. While AI has shown remarkable potential to reduce interobserver variability and increase detection of subtle findings, integration into existing laboratory workflows and validation across diverse patient populations remain critical challenges to widespread adoption.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'white' }}>Introduction</Typography>
          <Typography variant="body1" paragraph sx={{ color: 'white' }}>
            Digital pathology has undergone a transformative evolution over the past decade, progressing from simple digitization of glass slides to sophisticated AI-powered systems capable of detecting and classifying disease with expert-level precision. The shift from traditional microscopy to whole-slide imaging (WSI) created the foundation for computational analysis, while advances in deep learning have enabled AI algorithms to recognize complex histological patterns that characterize various pathologies. This convergence has particular relevance in oncology, where pathology diagnosis forms the cornerstone of treatment decisions yet faces challenges of interobserver variability and increasing workload demands.
          </Typography>
        </Box>
        
        {/* Add more content sections as needed */}
        
        {/* Just putting placeholder figures for now */}
        <FigureDisplay 
          imageUrl="https://via.placeholder.com/800x500?text=Figure+1:+ROC+Curve"
          title="Figure 1. ROC Curve: Prostate Cancer AI Grading System"
          caption="Source: Bulten W, Pinckaers H, van Boven H, et al. Automated deep-learning system for Gleason grading of prostate cancer using biopsies: a diagnostic study. Lancet Oncol. 2020;21(2):233-241."
        />
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
        
        <Box>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'white' }}>References</Typography>
          <Typography variant="body2" component="div" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            <List dense disablePadding>
              <ListItem sx={{ display: 'block', mb: 1 }}>
                <ListItemText primary="Campanella G, Hanna MG, Geneslaw L, et al. Clinical-grade computational pathology using weakly supervised deep learning on whole slide images. Nat Med. 2019;25(8):1301-1309." sx={{ m: 0 }} />
              </ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}>
                <ListItemText primary="Bulten W, Pinckaers H, van Boven H, et al. Automated deep-learning system for Gleason grading of prostate cancer using biopsies: a diagnostic study. Lancet Oncol. 2020;21(2):233-241." sx={{ m: 0 }} />
              </ListItem>
              {/* More references as needed */}
            </List>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default PathologyAIWhitePaperPage;
