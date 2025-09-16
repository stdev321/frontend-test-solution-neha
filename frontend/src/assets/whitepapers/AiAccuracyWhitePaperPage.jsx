// frontend/src/assets/whitepapers/AiAccuracyWhitePaperPage.jsx

import React, { useEffect, useRef, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  Button,
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import logoImage from '../branding/full_logo_high.png' // High quality for whitepapers;

export default function AiAccuracyWhitePaperPage() {
  const { setHeaderMode } = useHeaderVisibility();
  const { t, i18n } = useTranslation('aiAccuracyWhitepaper');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const contentRef = useRef(null);

  // Support RTL if needed
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(i18n.language);

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0);
  }, [setHeaderMode]);

  // Translated text
  const TITLE = t('title');

  const SECTION1_TITLE = t('section1.title');
  const SECTION1_CONTENT = t('section1.content');

  const SECTION2_TITLE = t('section2.title');
  const SECTION2_CONTENT_P1 = t('section2.intro');
  const SECTION2_CONTENT_LIST = [
    { title: t('section2.aiSuccess.title'), text: t('section2.aiSuccess.text') },
    { title: t('section2.aiErrors.title'),  text: t('section2.aiErrors.text') },
    { title: t('section2.aiVsHuman.title'), text: t('section2.aiVsHuman.text') },
  ];

  const SECTION3_TITLE = t('section3.title');
  const SECTION3_CONTENT_P1 = t('section3.intro');
  const SECTION3_CONTENT_LIST = [
    t('section3.challenges.empathy'),
    t('section3.challenges.overload'),
    t('section3.challenges.confidence'),
  ];
  const SECTION3_CONTENT_P2 = t('section3.VirtualMDApproach');

  const SECTION4_TITLE = t('section4.title');
  const SECTION4_CONTENT_LIST = [
    t('section4.guidelines.information'),
    t('section4.guidelines.limitations'),
    t('section4.guidelines.verify'),
    t('section4.guidelines.personas'),
  ];

  const SECTION5_TITLE = t('section5.title');
  const SECTION5_DISCLAIMER = t('section5.disclaimer');
  const SECTION5_EMERGENCY = t('section5.emergency');

  // Utility: wrap text for jsPDF
  const addWrappedText = (doc, text, x, y, maxWidth, options = {}) => {
    const lines = doc.splitTextToSize(text || '', maxWidth);
    doc.text(lines, x, y, options);
    const fontSize = doc.internal.getFontSize();
    const lineHeight = options.lineHeightFactor || 1.15;
    const height = (lines.length * fontSize * lineHeight) / doc.internal.scaleFactor;
    return y + height;
  };

  // PDF generation
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let currentY = margin;

      // Logo
      const logoW = 120;
      doc.addImage(logoImage, 'PNG', margin, currentY, logoW, 0);
      currentY += logoW * (38 / 200) + 25;

      // Title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      currentY = addWrappedText(
        doc,
        TITLE,
        pageWidth / 2,
        currentY,
        contentWidth,
        { align: 'center' }
      );
      doc.setFont(undefined, 'normal');
      currentY += 25;

      // Helper to add a section
      const addPdfSection = (title, content, opts = {}) => {
        const {
          titleSize = 14,
          contentSize = 10,
          afterTitle = 5,
          afterSection = 15,
          indent = 15
        } = opts;

        // Page break if needed
        const minSpace = (titleSize + contentSize) * 1.15 / doc.internal.scaleFactor + afterTitle;
        if (currentY > pageHeight - margin - minSpace) {
          doc.addPage();
          currentY = margin;
        }

        // Section title
        doc.setFontSize(titleSize);
        doc.setFont(undefined, 'bold');
        currentY = addWrappedText(doc, title, margin, currentY, contentWidth);
        doc.setFont(undefined, 'normal');
        currentY += afterTitle;

        // Section content
        doc.setFontSize(contentSize);
        const startY = currentY;
        if (typeof content === 'string') {
          currentY = addWrappedText(doc, content, margin, startY, contentWidth, { lineHeightFactor: 1.2 });
        } else {
          content.forEach(item => {
            const space = contentSize * 1.15 / doc.internal.scaleFactor + 5;
            if (currentY > pageHeight - margin - space) {
              doc.addPage();
              currentY = margin;
            }
            if (typeof item === 'string') {
              currentY = addWrappedText(
                doc,
                `\u2022 ${item}`,
                margin + indent,
                currentY,
                contentWidth - indent,
                { lineHeightFactor: 1.2 }
              );
              currentY += 3;
            } else {
              doc.setFont(undefined, 'bold');
              currentY = addWrappedText(
                doc,
                item.title,
                margin + indent / 2,
                currentY,
                contentWidth - indent / 2
              );
              doc.setFont(undefined, 'normal');
              currentY += 2;
              currentY = addWrappedText(
                doc,
                item.text,
                margin + indent,
                currentY,
                contentWidth - indent,
                { lineHeightFactor: 1.2 }
              );
              currentY += 6;
            }
          });
        }
        currentY = Math.max(currentY, startY + contentSize * 1.15 / doc.internal.scaleFactor);
        currentY += afterSection;
      };

      // Render sections
      addPdfSection(SECTION1_TITLE, SECTION1_CONTENT);
      addPdfSection(SECTION2_TITLE, [SECTION2_CONTENT_P1, ...SECTION2_CONTENT_LIST]);
      addPdfSection(SECTION3_TITLE, [SECTION3_CONTENT_P1, ...SECTION3_CONTENT_LIST, SECTION3_CONTENT_P2]);
      addPdfSection(SECTION4_TITLE, SECTION4_CONTENT_LIST);
      addPdfSection(SECTION5_TITLE, SECTION5_DISCLAIMER, { afterTitle: 2, afterSection: 10 });

      // Emergency line
      const emSpace = (12 * 1.15) / doc.internal.scaleFactor + 10;
      if (currentY > pageHeight - margin - emSpace) {
        doc.addPage();
        currentY = margin;
      }
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 0, 0);
      currentY = addWrappedText(
        doc,
        SECTION5_EMERGENCY,
        pageWidth / 2,
        currentY + 10,
        contentWidth,
        { align: 'center' }
      );
      doc.setTextColor(0, 0, 0);

      // Save
      doc.save(t('pdfFilename'));
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 4, direction: isRTL ? 'rtl' : 'ltr' }}
      ref={contentRef}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={isGeneratingPdf ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? t('generating') : t('downloadPdf')}
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 5 } }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
          {TITLE}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>{SECTION1_TITLE}</Typography>
          <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>{SECTION1_CONTENT}</Typography>
        </Box>
        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>{SECTION2_TITLE}</Typography>
          <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>{SECTION2_CONTENT_P1}</Typography>
          <List dense disablePadding sx={{ pl: 2 }}>
            {SECTION2_CONTENT_LIST.map((item, idx) => (
              <ListItem key={idx} sx={{ display: 'block', py: 0.5, mb: 1 }}>
                <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
                  {item.title}
                </Typography>
                <Typography component="p" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                  {item.text}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>{SECTION3_TITLE}</Typography>
          <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>{SECTION3_CONTENT_P1}</Typography>
          <List dense disablePadding sx={{ pl: 2 }}>
            {SECTION3_CONTENT_LIST.map((item, idx) => (
              <ListItem key={idx} sx={{ display: 'list-item', listStyleType: 'disc', py: 0.5, ml: 2 }}>
                <Typography>{item}</Typography>
              </ListItem>
            ))}
          </List>
          <Typography
            paragraph
            sx={{ mt: 2, whiteSpace: 'pre-line' }}
            dangerouslySetInnerHTML={{
              __html: SECTION3_CONTENT_P2
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
            }}
          />
        </Box>
        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>{SECTION4_TITLE}</Typography>
          <List dense disablePadding sx={{ pl: 2 }}>
            {SECTION4_CONTENT_LIST.map((item, idx) => (
              <ListItem key={idx} sx={{ display: 'list-item', listStyleType: 'disc', py: 0.5, ml: 2 }}>
                <Typography
                  component="span"
                  dangerouslySetInnerHTML={{
                    __html: item
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h5" gutterBottom>{SECTION5_TITLE}</Typography>
          <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>{SECTION5_DISCLAIMER}</Typography>
          <Typography variant="h6" align="center" sx={{ color: 'red', fontWeight: 'bold', mt: 3 }}>
            {SECTION5_EMERGENCY}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
