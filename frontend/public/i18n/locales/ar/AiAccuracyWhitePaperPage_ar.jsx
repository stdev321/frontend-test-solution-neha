import React, { useEffect, useRef } from 'react';
import { Container, Paper, Typography, Box, Divider, List, ListItem, ListItemText, Link, Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import logoImage from '../../assets/branding/logo_long_transparent.png';

function AiAccuracyWhitePaperPage() {
  const { setHeaderMode } = useHeaderVisibility();
  const { t, i18n } = useTranslation('pages');
  
  // Check if current language is RTL
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(i18n.language);

  // Define the white paper content as constants using translations
  const TITLE = "1. الورقة البيضاء حول دقة الذكاء الاصطناعي";

  const SECTION1_TITLE = "2. القسم الأول: مقدمة";
  const SECTION1_CONTENT = "3. في هذا القسم، سنستعرض كيف يمكن للذكاء الاصطناعي أن يحقق دقة متميزة في مختلف المجالات، وكيف يتم تقييم هذه الدقة.";

  const SECTION2_TITLE = "4. القسم الثاني: النجاحات والأخطاء";
  const SECTION2_CONTENT_P1 = "5. هذا القسم يستعرض النجاحات التي حققها الذكاء الاصطناعي والتحديات التي واجهته في سبيل تحقيق هذه النجاحات.";
  const SECTION2_CONTENT_LIST = "6. [
    {
      title: نجاحات الذكاء الاصطناعي,
      text: نستعرض هنا الإنجازات الكبرى التي حققها الذكاء الاصطناعي والتأثير الإيجابي الذي أحدثه في مختلف الصناعات.
    },
    {
      title: أخطاء الذكاء الاصطناعي,
      text: سنناقش في هذا الجزء الأخطاء الشائعة التي يمكن أن يرتكبها الذكاء الاصطناعي وكيفية التعامل معها.
    },
    {
      title: مقارنة بين الذكاء الاصطناعي والإنسان,
      text: هنا نقارن بين قدرات الذكاء الاصطناعي والإنسان في مواجهة المهام المختلفة وتحديد الأفضلية.
    }
  ]";

  const SECTION3_TITLE = "7. القسم الثالث: التحديات والمقاربات";
  const SECTION3_CONTENT_P1 = "8. في هذا القسم، نستعرض التحديات الرئيسية التي تواجه الذكاء الاصطناعي وكيف يمكن التغلب عليها من خلال مقاربات محددة.";
  const SECTION3_CONTENT_LIST = "9. [
    التحديات المتعلقة بالتعاطف,
    التحديات المتعلقة بالإفراط في المعلومات,
    التحديات المتعلقة بالثقة
  ]";
  const SECTION3_CONTENT_P2 = "10. مقاربة مايندسكريبت";

  const SECTION4_TITLE = "11. القسم الرابع: المبادئ التوجيهية";
  const SECTION4_CONTENT_LIST = "12. [
    المعلومات,
    القيود,
    التحقق,
    الشخصيات
  ]";

  const SECTION5_TITLE = "13. القسم الخامس: التنويهات";
  const SECTION5_DISCLAIMER = "14. تنويه";
  const SECTION5_EMERGENCY = "15. في حالات الطوارئ";
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0); // Scroll to top when component mounts
  }, [setHeaderMode]);

  // Utility to add wrapped text and manage Y position
  const addWrappedText = (doc, text, x, y, maxWidth, options = {}) => {
    const lines = doc.splitTextToSize(text || '', maxWidth);
    doc.text(lines, x, y, options);
    const fontSize = doc.internal.getFontSize();
    const lineHeightFactor = options.lineHeightFactor || 1.15;
    const textHeight = lines.length * fontSize * lineHeightFactor / doc.internal.scaleFactor;
    return y + textHeight; // Return the Y position *after* the text
  };

  // PDF Download Handler
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // 1. Logo
      const logoWidth = 120;
      doc.addImage(logoImage, 'PNG', margin, currentY, logoWidth, 0);
      const estimatedLogoHeight = logoWidth * (38 / 200); 
      currentY += estimatedLogoHeight + 25;

      // 2. Title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, TITLE, pageWidth / 2, currentY, contentWidth, { align: 'center' });
      doc.setFont(undefined, 'normal');
      currentY += 25;

      // Helper for sections (more robust)
      const addPdfSection = (title, content, options = {}) => {
        const titleSize = options.titleSize || 14;
        const contentSize = options.contentSize || 10;
        const spaceAfterTitle = options.spaceAfterTitle || 5;
        const spaceAfterSection = options.spaceAfterSection || 15;
        const listIndent = options.listIndent || 15;

        // Estimate minimum space needed for title + a line of content
        const minSpaceNeeded = (titleSize * 1.15 + contentSize * 1.15) / doc.internal.scaleFactor + spaceAfterTitle;
        if (currentY > pageHeight - margin - minSpaceNeeded) { 
          doc.addPage(); 
          currentY = margin; 
        }
        
        // Add Title
        doc.setFontSize(titleSize);
        doc.setFont(undefined, 'bold');
        currentY = addWrappedText(doc, title, margin, currentY, contentWidth);
        doc.setFont(undefined, 'normal');
        currentY += spaceAfterTitle;
        
        // Add Content
        doc.setFontSize(contentSize);
        const contentStartY = currentY;
        
        if (typeof content === 'string') {
          // Handle simple paragraph
           currentY = addWrappedText(doc, content, margin, contentStartY, contentWidth, { lineHeightFactor: 1.2 });
        } else if (Array.isArray(content)) {
           // Handle list of strings or objects
           content.forEach((item, index) => {
               const itemMinSpace = (contentSize * 1.15) / doc.internal.scaleFactor + 5;
               if (currentY > pageHeight - margin - itemMinSpace) { doc.addPage(); currentY = margin; }

               if (typeof item === 'string') {
                   // Simple bullet point
                   currentY = addWrappedText(doc, `\u2022 ${item.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}`, // Basic markdown removal for PDF
                       margin + listIndent, currentY, contentWidth - listIndent, { lineHeightFactor: 1.2 });
                   currentY += 3; // Space between bullet points
               } else if (typeof item === 'object' && item.title && item.text) {
                   // Sub-section with title/text
                   const subTitleMinSpace = (contentSize * 1.15) / doc.internal.scaleFactor + 3;
                   if (currentY > pageHeight - margin - subTitleMinSpace - itemMinSpace) { doc.addPage(); currentY = margin; }
                   
                   doc.setFont(undefined, 'bold');
                   currentY = addWrappedText(doc, item.title, margin + listIndent / 2, currentY, contentWidth - listIndent / 2);
                   doc.setFont(undefined, 'normal');
                   currentY += 2;
                   currentY = addWrappedText(doc, item.text, margin + listIndent, currentY, contentWidth - listIndent, { lineHeightFactor: 1.2 });
                   currentY += 6; // Space after sub-section text
               }
           });
        }
        // Ensure Y advances even if content was short
        currentY = Math.max(currentY, contentStartY + (contentSize*1.15/doc.internal.scaleFactor)); 
        currentY += spaceAfterSection; 
      };

      // 3. Add Content Using the Helper
      addPdfSection(SECTION1_TITLE, SECTION1_CONTENT);
      // Combine paragraph and list for section 2
      addPdfSection(SECTION2_TITLE, [SECTION2_CONTENT_P1, ...SECTION2_CONTENT_LIST]);
      // Combine paragraphs and list for section 3
      addPdfSection(SECTION3_TITLE, [SECTION3_CONTENT_P1, ...SECTION3_CONTENT_LIST, SECTION3_CONTENT_P2.replace(/\*\*|\*/g, '')]); // Strip markdown for PDF
      // Handle list for section 4
      addPdfSection(SECTION4_TITLE, SECTION4_CONTENT_LIST);
      // Disclaimer section
      addPdfSection(SECTION5_TITLE, SECTION5_DISCLAIMER, { spaceAfterTitle: 2, spaceAfterSection: 10 });

      // 4. Add Emergency Line (Centered, Red, Bold)
      const emergencyLineSpace = (12 * 1.15) / doc.internal.scaleFactor + 10;
      if (currentY > pageHeight - margin - emergencyLineSpace) { doc.addPage(); currentY = margin; }
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 0, 0); // Red
      currentY = addWrappedText(doc, SECTION5_EMERGENCY, pageWidth / 2, currentY + 10, contentWidth, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Reset color

      // 5. Save
      doc.save(t('aiAccuracyWhitepaper.pdfFilename'));

    } catch (error) {
      console.error("Error generating AI Accuracy PDF:", error);
      // Optionally show an error message to the user
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // JSX Rendering (similar structure to ImagingAIWhitePaperPage)
  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: 'ltr' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={isGeneratingPdf ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? t('aiAccuracyWhitepaper.generating') : t('aiAccuracyWhitepaper.downloadPdf')}
        </Button>
      </Box>
      
      <Paper ref={contentRef} elevation={3} sx={{ p: { xs: 2, sm: 3, md: 5 } }}>
        
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          {TITLE}
        </Typography>
        
        {/* Section 1 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{SECTION1_TITLE}</Typography>
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>{SECTION1_CONTENT}</Typography>
        </Box>
        <Divider sx={{ my: 4 }} />

        {/* Section 2 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{SECTION2_TITLE}</Typography>
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>{SECTION2_CONTENT_P1}</Typography>
          <List dense disablePadding sx={{ pl: 2 }}>
            {SECTION2_CONTENT_LIST.map((item, index) => (
              <ListItem key={index} sx={{ display: 'block', py: 0.5, mb: 1 }}>
                <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>{item.title}</Typography>
                <Typography variant="body1" component="p" sx={{ display: 'block', whiteSpace: 'pre-line', mt: 0.5 }}>{item.text}</Typography>
              </ListItem>
            ))}
          </List>
        </Box>
        <Divider sx={{ my: 4 }} />

        {/* Section 3 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{SECTION3_TITLE}</Typography>
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>{SECTION3_CONTENT_P1}</Typography>
          <List dense disablePadding sx={{ pl: 2 }}>
            {SECTION3_CONTENT_LIST.map((item, index) => (
              <ListItem key={index} sx={{ display: 'list-item', listStyleType: 'disc', py: 0.5, ml: 2 }}>
                 <Typography variant="body1" component="span">{item}</Typography>
              </ListItem>
            ))}
          </List>
          <Typography variant="body1" paragraph sx={{ mt: 2, whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: SECTION3_CONTENT_P2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
        </Box>
        <Divider sx={{ my: 4 }} />

        {/* Section 4 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{SECTION4_TITLE}</Typography>
           <List dense disablePadding sx={{ pl: 2 }}>
            {SECTION4_CONTENT_LIST.map((item, index) => (
              <ListItem key={index} sx={{ display: 'list-item', listStyleType: 'disc', py: 0.5, ml: 2 }}>
                 <Typography variant="body1" component="span" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }}/>
              </ListItem>
            ))}
          </List>
        </Box>
        <Divider sx={{ my: 4 }} />

        {/* Section 5 */}
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>{SECTION5_TITLE}</Typography>
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>{SECTION5_DISCLAIMER}</Typography>
          <Typography variant="h6" component="p" sx={{ color: 'red', fontWeight: 'bold', textAlign: 'center', mt: 3 }}>
            {SECTION5_EMERGENCY}
          </Typography>
        </Box>

      </Paper>
    </Container>
  );
}

export default AiAccuracyWhitePaperPage; 