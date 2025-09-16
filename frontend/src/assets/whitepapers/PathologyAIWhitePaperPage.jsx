// frontend/src/assets/whitepapers/PathologyAIWhitePaperPage.jsx
// This page displays the detailed white paper on AI in Pathology.
// It maintains the standard app layout (header/footer) and uses Material UI for styling.

import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Paper, Typography, Box, Divider, List, ListItem, ListItemText, Link, Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';
import jsPDF from 'jspdf';
import logoImage from '../../assets/branding/full_logo_high.png' // High quality for whitepapers;

// Component to display figures with title and caption/citation
const FigureDisplay = ({ title, caption }) => (
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
  const { t, ready, i18n } = useTranslation('pages');
  const { setHeaderMode } = useHeaderVisibility();
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const contentRef = useRef(null);
  
  // Check if current language is RTL
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(i18n.language);

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0); // Scroll to top when component mounts
  }, [setHeaderMode]);

  // Show loading state while translations are loading
  if (!ready) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  const addWrappedText = (doc, text, x, y, maxWidth, options = {}) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, options);
    // Calculate height based on font size and line height factor
    const fontSize = doc.internal.getFontSize();
    const lineHeightFactor = options.lineHeightFactor || 1.15; // Default line height
    const textHeight = lines.length * fontSize * lineHeightFactor / doc.internal.scaleFactor;
    return y + textHeight;
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // 1. Add Logo (attempt automatic height)
      const logoWidth = 120; // Slightly smaller logo
      doc.addImage(logoImage, 'PNG', margin, currentY, logoWidth, 0);
      // Estimate logo height for positioning
      const estimatedLogoHeight = logoWidth * (38 / 200); // Estimate based on previous ratio
      currentY += estimatedLogoHeight + 25; // Increased spacing after logo

      // --- Document Content --- 
      doc.setFontSize(18);
      // Center Title using pageWidth
      currentY = addWrappedText(doc, 'AI in Pathology: Advancing Diagnostic Accuracy and Efficiency', pageWidth / 2, currentY, contentWidth, { align: 'center' });
      currentY += 10; // Space after title
      
      doc.setFontSize(10);
      doc.setTextColor(100); // Grey color for author
      // Center Author using pageWidth
      currentY = addWrappedText(doc, 'By: Ron Rubin, PhD and Sandy Miles\nVirtualMD Health Technologies\nronrubin@virtualmd.app', pageWidth / 2, currentY, contentWidth, { align: 'center' });
      currentY += 25; // Increased spacing after author
      doc.setTextColor(0); // Reset color
      
      // Helper to add section content
      const addSection = (title, content) => {
        // Check for page break: leave enough space for heading + some content
        if (currentY > pageHeight - margin - 50) { 
          doc.addPage();
          currentY = margin;
        }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        currentY = addWrappedText(doc, title, margin, currentY, contentWidth);
        currentY += 5;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        // Add a small space before content
        currentY = addWrappedText(doc, content, margin, currentY + 2, contentWidth);
        currentY += 15; // Space after section
      };
      
      // Helper to add figures - now uses placeholder text instead of images
      const addFigure = (title, caption) => {
        const estimatedFigHeight = 150; // Estimate needed space for placeholder + caption
        const spaceForCaption = 50; // Estimated space needed for caption
        // Check for page break: need space for title, image, caption
        if (currentY > pageHeight - margin - estimatedFigHeight - spaceForCaption) { 
          doc.addPage();
          currentY = margin;
        }
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        currentY = addWrappedText(doc, title, margin, currentY, contentWidth);
        currentY += 8; // Space before placeholder
         
        // Add placeholder box with text
        const imgStartY = currentY;
        doc.setDrawColor(200, 200, 200); // Light gray border
        doc.setFillColor(224, 224, 224); // Light gray fill
        const boxWidth = contentWidth * 0.7;
        const boxHeight = boxWidth * 0.5; // Placeholder aspect ratio
        const boxX = margin + (contentWidth - boxWidth) / 2;
        
        // Draw rectangle
        doc.rect(boxX, currentY, boxWidth, boxHeight, 'FD');
        
        // Add placeholder text in center of box
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100); // Dark gray text
        
        // Center the placeholder text in the box
        const placeholderText = `[Placeholder for ${title}]`;
        const textWidth = doc.getStringUnitWidth(placeholderText) * 10 / doc.internal.scaleFactor;
        const textX = boxX + (boxWidth - textWidth) / 2;
        const textY = currentY + boxHeight / 2;
        
        doc.text(placeholderText, textX, textY);
        doc.setTextColor(0); // Reset text color
         
        currentY = imgStartY + boxHeight + 10;
        doc.setFontSize(8);
        doc.setFont(undefined, 'italic');
        currentY = addWrappedText(doc, caption, margin, currentY, contentWidth);
        currentY += 20;
        doc.setFont(undefined, 'normal');
      };

      // --- Add Sections --- 
      addSection('Abstract', 
        `Digital pathology combined with artificial intelligence has emerged as a powerful technology to enhance diagnostic accuracy and efficiency in histopathological analysis. This paper reviews current evidence for AI applications in pathology, from tumor detection and classification to automated Gleason scoring and expression pattern analysis. Recent studies demonstrate that AI algorithms can achieve 97-100% sensitivity and 88-98% specificity for prostate cancer detection, detect breast cancer metastases in lymph nodes with AUC {'>'} 0.99 (CAMELYON challenge), and predict patient outcomes from histomorphological features. FDA-cleared systems like Paige Prostate (2021) represent the first wave of AI tools entering clinical pathology practice. We examine performance metrics across multiple tissue types and discuss regulatory considerations, implementation challenges, and future directions. While AI has shown remarkable potential to reduce interobserver variability and increase detection of subtle findings, integration into existing laboratory workflows and validation across diverse patient populations remain critical challenges to widespread adoption.`
      );
      
      addSection('Introduction', 
        `Digital pathology has undergone a transformative evolution over the past decade, progressing from simple digitization of glass slides to sophisticated AI-powered systems capable of detecting and classifying disease with expert-level precision. The shift from traditional microscopy to whole-slide imaging (WSI) created the foundation for computational analysis, while advances in deep learning have enabled AI algorithms to recognize complex histological patterns that characterize various pathologies. This convergence has particular relevance in oncology, where pathology diagnosis forms the cornerstone of treatment decisions yet faces challenges of interobserver variability and increasing workload demands.

Several factors have accelerated interest in AI-assisted pathology: growing case volumes amid pathologist shortages; the inherent difficulty of analyzing the billions of cells present in typical WSIs; variability in diagnostic interpretations between pathologists (particularly for challenging cases); and the emergence of computational biomarkers that may identify features invisible to the human eye. Early AI applications focused on cancer detection and classification in common malignancies, but the field has rapidly expanded to encompass tissue types and diagnostic tasks.y considerations, implementation challenges, and future directions. While AI has shown remarkable potential to reduce interobserver variability and increase detection of subtle findings, integration into existing laboratory workflows and validation across diverse patient populations remain critical challenges to widespread adoption.
   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ^
366|            </Typography>
367|          </Box>

  Plugin: vite:esbuild
  File: /Users/ronshairubin/Desktop/VirtualMD/VirtualMD_Code/VirtualMDMedical/ai_chat_rr_edits/ai_chat/frontend/src/assets/whitepapers/PathologyAIWhitePaperPage.jsx
10:14:14 AM [vite] warning: The character ">" is not valid inside a JSX element
441|            </Typography>
442|            <Typography variant="body1" paragraph>
443|              In renal pathology, AI systems have been developed to classify different subtypes of renal cell carcinoma with {'>'} 95% accuracy for the four most common types (Nat Mach Intell, 2019). For thyroid nodules, AI can distinguish benign from malignant features with sensitivities of 90-99% depending on the specific thyroid cancer subtype (JAMA Network Open, 2019). These applications extend beyond cancer classification - AI has shown promise in grading inflammatory diseases (e.g., inflammatory bowel disease severity), quantifying immune cell infiltrates (tumor microenvironment assessment), and measuring morphologic features that predict treatment response.
   |                                                                                                                             ^
444|            </Typography>
445|            

  Plugin: vite:esbuild
  File: /Users/ronshairubin/Desktop/VirtualMD/VirtualMD_Code/VirtualMDMedical/ai_chat_rr_edits/ai_chat/frontend/src/assets/whitepapers/PathologyAIWhitePaperPage.jsx
(.venv) (base) ronshairubin@MacBook-Pro-9 frontend % npm run dev

> ai-chat-frontend@0.1.0 dev
> vite


  VITE v4.5.14  ready in 96 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
10:23:09 AM [vite] warning: The character ">" is not valid inside a JSX element
363|            <Typography variant="h5" component="h2" gutterBottom>Abstract</Typography>
364|            <Typography variant="body1" paragraph>
365|              Digital pathology combined with artificial intelligence has emerged as a powerful technology to enhance diagnostic accuracy and efficiency in histopathological analysis. This paper reviews current evidence for AI applications in pathology, from tumor detection and classification to automated Gleason scoring and expression pattern analysis. Recent studies demonstrate that AI algorithms can achieve 97-100% sensitivity and 88-98% specificity for prostate cancer detection, detect breast cancer metastases in lymph nodes with AUC >0.99 (CAMELYON challenge), and predict patient outcomes from histomorphological features. FDA-cleared systems like Paige Prostate (2021) represent the first wave of AI tools entering clinical pathology practice. We examine performance metrics across multiple tissue types and discuss regulatory considerations, implementation challenges, and future directions. While AI has shown remarkable potential to reduce interobserver variability and increase detection of subtle findings, integration into existing laboratory workflows and validation across diverse patient populations remain critical challenges to widespread adoption.
   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ^
366|            </Typography>
367|          </Box>

  Plugin: vite:esbuild
  File: /Users/ronshairubin/Desktop/VirtualMD/VirtualMD_Code/VirtualMDMedical/ai_chat_rr_edits/ai_chat/frontend/src/assets/whitepapers/PathologyAIWhitePaperPage.jsx
10:23:09 AM [vite] warning: The character ">" is not valid inside a JSX element
441|            </Typography>
442|            <Typography variant="body1" paragraph>
443|              In renal pathology, AI systems have been developed to classify different subtypes of renal cell carcinoma with {'>'} 95% accuracy for the four most common types (Nat Mach Intell, 2019). For thyroid nodules, AI can distinguish benign from malignant features with sensitivities of 90-99% depending on the specific thyroid cancer subtype (JAMA Network Open, 2019). These applications extend beyond cancer classification - AI has shown promise in grading inflammatory diseases (e.g., inflammatory bowel disease severity), quantifying immune cell infiltrates (tumor microenvironment assessment), and measuring morphologic features that predict treatment response.
   |                                                                                                                             ^
444|            </Typography>
445|            

  Plugin: vite:esbuild
  File: /Users/ronshairubin/Desktop/VirtualMD/VirtualMD_Code/VirtualMDMedical/ai_chat_rr_edits/ai_chat/frontend/src/assets/whitepapers/PathologyAIWhitePaperPage.jsx
10:40:01 AM [vite] hmr update /src/assets/whitepapers/PathologyAIWhitePaperPage.jsx
10:40:01 AM [vite] warning: The character ">" is not valid inside a JSX element
441|            </Typography>
442|            <Typography variant="body1" paragraph>
443|              In renal pathology, AI systems have been developed to classify different subtypes of renal cell carcinoma with {'>'} 95% accuracy for the four most common types (Nat Mach Intell, 2019). For thyroid nodules, AI can distinguish benign from malignant features with sensitivities of 90-99% depending on the specific thyroid cancer subtype (JAMA Network Open, 2019). These applications extend beyond cancer classification - AI has shown promise in grading inflammatory diseases (e.g., inflammatory bowel disease severity), quantifying immune cell infiltrates (tumor microenvironment assessment), and measuring morphologic features that predict treatment response.
   |                                                                                                                             ^
444|            </Typography>
445|            

  Plugin: vite:esbuild
  File: /Users/ronshairubin/Desktop/VirtualMD/VirtualMD_Code/VirtualMDMedical/ai_chat_rr_edits/ai_chat/frontend/src/assets/whitepapers/PathologyAIWhitePaperPage.jsx
10:44:28 AM [vite] hmr update /src/pages/LandingPage.jsx
10:44:28 AM [vite] ✨ new dependencies optimized: @mui/icons-material/HelpOutline
10:44:28 AM [vite] ✨ optimized dependencies changed. reloading
10:44:29 AM [vite] warning: The character ">" is not valid inside a JSX element
441|            </Typography>
442|            <Typography variant="body1" paragraph>
443|              In renal pathology, AI systems have been developed to classify different subtypes of renal cell carcinoma with {'>'} 95% accuracy for the four most common types (Nat Mach Intell, 2019). For thyroid nodules, AI can distinguish benign from malignant features with sensitivities of 90-99% depending on the specific thyroid cancer subtype (JAMA Network Open, 2019). These applications extend beyond cancer classification - AI has shown promise in grading inflammatory diseases (e.g., inflammatory bowel disease severity), quantifying immune cell infiltrates (tumor microenvironment assessment), and measuring morphologic features that predict treatment response.
   |                                                                                                                             ^
444|            </Typography>
445|            

  Plugin: vite:esbuild
  File: /Users/ronshairubin/Desktop/VirtualMD/VirtualMD_Code/VirtualMDMedical/ai_chat_rr_edits/ai_chat/frontend/src/assets/whitepapers/PathologyAIWhitePaperPage.jsx
10:44:29 AM [vite] warning: The character ">" is not valid inside a JSX element
441|            </Typography>
442|            <Typography variant="body1" paragraph>
443|              In renal pathology, AI systems have been developed to classify different subtypes of renal cell carcinoma with {'>'} 95% accuracy for the four most common types (Nat Mach Intell, 2019). For thyroid nodules, AI can distinguish benign from malignant features with sensitivities of 90-99% depending on the specific thyroid cancer subtype (JAMA Network Open, 2019). These applications extend beyond cancer classification - AI has shown promise in grading inflammatory diseases (e.g., inflammatory bowel disease severity), quantifying immune cell infiltrates (tumor microenvironment assessment), and measuring morphologic features that predict treatment response.
   |                                                                                                                             ^
444|            </Typography>
445|            

  Plugin: vite:esbuild
  File: /Users/ronshairubin/Desktop/VirtualMD/VirtualMD_Code/VirtualMDMedical/ai_chat_rr_edits/ai_chat/frontend/src/assets/whitepapers/PathologyAIWhitePaperPage.jsx (x2)
10:44:29 AM [vite] hmr update /src/pages/LandingPage.jsx
10:44:29 AM [vite] hmr update /src/pages/LandingPage.jsx (x2)
10:44:43 AM [vite] hmr update /src/App.jsx
(.venv) (base) ronshairubin@MacBook-Pro-9 frontend % npm run dev

> ai-chat-frontend@0.1.0 dev
> vite


  VITE v4.5.14  ready in 102 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
10:45:36 AM [vite] warning: The character ">" is not valid inside a JSX element
441|            </Typography>
442|            <Typography variant="body1" paragraph>
443|              In renal pathology, AI systems have been developed to classify different subtypes of renal cell carcinoma with {'>'} 95% accuracy for the four most common types (Nat Mach Intell, 2019). For thyroid nodules, AI can distinguish benign from malignant features with sensitivities of 90-99% depending on the specific thyroid cancer subtype (JAMA Network Open, 2019). These applications extend beyond cancer classification - AI has shown promise in grading inflammatory diseases (e.g., inflammatory bowel disease severity), quantifying immune cell infiltrates (tumor microenvironment assessment), and measuring morphologic features that predict treatment response.
   |                                                                                                                             ^
444|            </Typography>
445|            

  Plugin: vite:esbuild
  File: /Users/ronshairubin/Desktop/VirtualMD/VirtualMD_Code/VirtualMDMedical/ai_chat_rr_edits/ai_chat/frontend/src/assets/whitepapers/PathologyAIWhitePaperPage.jsx
11:09:05 AM [vite] hmr update /src/pages/LandingPage.jsx
11:09:26 AM [vite] hmr update /src/pages/LandingPage.jsx (x2)






l) exceeded typical rates for self-guided digital interventions (typically 25-30%), suggesting the conversational inter

This review examines the current state of AI in pathology, focusing on clinical validation studies, regulatory-approved systems, and real-world implementation evidence. We evaluate performance metrics across key applications and discuss challenges including integration into existing laboratory information systems, validation across diverse populations, and regulatory frameworks governing AI in diagnostic pathology.`
      );
      
      addSection('Methods/Technologies', 
        `Modern pathology AI systems utilize deep learning architectures, primarily convolutional neural networks (CNNs), to analyze whole-slide images digitized at high resolution (typically 20-40× magnification). These systems are trained on large datasets of labeled images, often requiring expert pathologist annotations to establish ground truth. Two main AI approaches prevail: supervised learning using region-level or slide-level annotations, and weakly supervised learning which requires only case-level diagnoses. Training typically involves multi-stage processes, first detecting regions of interest at low magnification, then classifying these regions at higher magnification to identify specific pathologies.

Key performance metrics include sensitivity (proportion of true positives correctly identified), specificity (proportion of true negatives correctly identified), area under the receiver operating characteristic curve (AUC), and measures of agreement such as Cohen's kappa coefficient. For subtyping tasks, metrics may include class-specific accuracy, F1-scores, and confusion matrices. For validation, studies employ cross-validation approaches, external testing on independent datasets, and increasingly, prospective clinical evaluations comparing AI performance to pathologist consensus diagnoses.

Digital pathology infrastructure requires whole slide scanners, image management systems, sufficient computational resources, and often cloud-based deployment architectures. Modern systems focus on interpretability through visualization techniques such as gradient-weighted class activation mapping (Grad-CAM), which highlight regions contributing to AI decisions through heatmap overlays. These technologies enable pathologists to review the basis for AI classifications, addressing the "black box" concerns common to deep learning systems in clinical applications.`
      );
      
      // Results Section (split to insert figures)
      if (currentY > pageHeight - margin - 50) { doc.addPage(); currentY = margin; }
      doc.setFontSize(14); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'Results', margin, currentY, contentWidth); currentY += 10;
      doc.setFont(undefined, 'normal');
       
      doc.setFontSize(12); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'Digital Pathology Overview', margin, currentY, contentWidth); currentY += 5;
      doc.setFont(undefined, 'normal'); doc.setFontSize(10);
      currentY = addWrappedText(doc, 
        `Digital pathology has experienced substantial growth, with the global market projected to reach $1.4 billion by 2027. Laboratory adoption has accelerated, particularly in academic medical centers and reference laboratories where initial regulatory hurdles have been overcome. In 2017, the FDA cleared the first whole slide imaging system for primary diagnosis (Philips IntelliSite Pathology Solution), followed by additional clearances including Leica Aperio AT2 DX and Aperio GT 450 DX. These systems create the digital infrastructure necessary for computational pathology and AI applications.

AI in pathology began with focused applications in limited histologic contexts but has expanded to encompass multiple tissue types and diagnostic tasks. The computational approaches have similarly evolved from traditional machine learning with engineered features to end-to-end deep learning capable of extracting features directly from pixel data. Training datasets have grown from hundreds to hundreds of thousands of slides, enabling more robust generalization across patient populations and scanning conditions.`, 
        margin, currentY + 2, contentWidth);
      currentY += 15;
       
      doc.setFontSize(12); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'Cancer Detection', margin, currentY, contentWidth); currentY += 5;
      doc.setFont(undefined, 'normal'); doc.setFontSize(10);
      currentY = addWrappedText(doc, 
        `In oncologic pathology, AI systems have demonstrated remarkable accuracy in detecting various malignancies. For prostate cancer, Pantanowitz et al. evaluated an AI algorithm (Paige Prostate) in a multi-site validation study involving 549 slides from 100 patients. The AI demonstrated 98.8% sensitivity and 97.3% specificity for detecting cancer, outperforming general pathologists particularly in challenging cases (Lancet Digital Health, 2020). Similarly, Campanella et al. developed a weakly-supervised learning approach trained on over 15,000 prostate slides that achieved an AUC of 0.98 for cancer detection (Nature Medicine, 2019).

For breast cancer, the CAMELYON challenges provided pivotal evidence for AI efficacy in detecting metastases in lymph nodes. In CAMELYON16, the best algorithm achieved an AUC of 0.994, exceeding the performance of pathologists working under time constraints (AUC 0.810) (JAMA, 2017). These systems detect cancer cells that may be missed during manual review, particularly micrometastases and isolated tumor cells.`, 
        margin, currentY + 2, contentWidth);
      currentY += 5; // Space before figure
      
      addFigure('Figure 4. AI Heatmap Highlighting Cancer Cells in Prostate Biopsy',
        `A prostate biopsy slide analyzed by an AI system that highlights regions containing cancer cells (red→yellow intensity). The heatmap draws attention to small foci of adenocarcinoma that could be overlooked during routine review. Source: Pantanowitz L, et al. An artificial intelligence algorithm for prostate cancer diagnosis in whole slide images of core needle biopsies: a blinded clinical validation and deployment study. Lancet Digit Health. 2020;2(8):e407-e416.`);
      
      currentY = addWrappedText(doc, 
        `Beyond these common cancers, AI systems have been developed for numerous other malignancies. In lung pathology, deep learning algorithms can distinguish adenocarcinoma from squamous cell carcinoma with 97% accuracy and identify genetic alterations (e.g., EGFR mutations) from histomorphological features (Nature Cancer, 2020). In colorectal pathology, AI can detect adenomas, classify histologic subtypes, and identify microsatellite instability status directly from H&E slides with sensitivity exceeding 95% (J Pathol, 2020).

The benefits of AI detection extend beyond sensitivity. Studies consistently show reduced interobserver variability when pathologists have AI assistance. For example, Steiner et al. demonstrated that AI assistance increased pathologists' agreement with the reference standard from 93.3% to 95.8% for breast cancer metastasis detection (Am J Surg Pathol, 2018). This increased consistency has important implications for diagnosing borderline cases and standardizing care across institutions.`, 
        margin, currentY + 2, contentWidth);
      currentY += 15;
       
      doc.setFontSize(12); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'Grading and Classification', margin, currentY, contentWidth); currentY += 5;
      doc.setFont(undefined, 'normal'); doc.setFontSize(10);
      currentY = addWrappedText(doc, 
        `Beyond binary cancer detection, AI systems have made significant progress in more complex tasks involving subtyping and grading. Most notably, automated Gleason grading of prostate cancer has been a focus of intense research due to the known interobserver variability in this critical prognostic marker. Bulten et al. developed a deep learning system that assigns detailed Gleason scores with performance equivalent to experienced urologic pathologists (kappa = 0.62 vs. 0.57) and approaching the level of genitourinary specialists (kappa = 0.73) (Lancet Oncology, 2020). Similarly, Ström et al. reported an AI system achieving pathologist-level grading with an AUC of 0.98 for distinguishing benign from cancerous regions and an AUC of 0.85-0.93 for classifying different Gleason grades (IEEE TMI, 2020).

In renal pathology, AI systems have been developed to classify different subtypes of renal cell carcinoma with {'>'} 95% accuracy for the four most common types (Nat Mach Intell, 2019). For thyroid nodules, AI can distinguish benign from malignant features with sensitivities of 90-99% depending on the specific thyroid cancer subtype (JAMA Network Open, 2019). These applications extend beyond cancer classification - AI has shown promise in grading inflammatory diseases (e.g., inflammatory bowel disease severity), quantifying immune cell infiltrates (tumor microenvironment assessment), and measuring morphologic features that predict treatment response.`, 
        margin, currentY + 2, contentWidth);
      currentY += 5; // Space before figure
      
      addFigure('Figure 1. ROC Curve: Prostate Cancer AI Grading System',
        `Source: Bulten W, Pinckaers H, van Boven H, et al. Automated deep-learning system for Gleason grading of prostate cancer using biopsies: a diagnostic study. Lancet Oncol. 2020;21(2):233-241.`);

      doc.setFontSize(12); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'Workflow Optimization', margin, currentY, contentWidth); currentY += 5;
      doc.setFont(undefined, 'normal'); doc.setFontSize(10);
      currentY = addWrappedText(doc, 
        `Beyond diagnostic accuracy, AI offers significant potential for pathology workflow optimization. A key workflow enhancement is pre-screening to prioritize cases and reduce time spent on benign or normal samples. Ho et al. demonstrated that AI pre-screening for prostate biopsies could reduce pathologist workload by 30-50% while maintaining diagnostic accuracy (Mod Pathol, 2021). Similarly, Da Silva et al. found that AI pre-screening of cervical cytology could reduce manual review by up to 40% (J Am Soc Cytopathol, 2021).

In quantitative assessment, AI systems automate tedious manual tasks such as mitotic counting, tumor proportion scoring for PDL1, and quantification of immunohistochemical stains. For Ki-67 scoring, Maeda et al. demonstrated that an automated AI system reduced assessment time by 83% while maintaining or exceeding the accuracy of manual counting (Sci Rep, 2021). This automation standardizes measurements that traditionally suffer from wide interobserver variability.

For clinical decision support, AI systems can identify cases requiring subspecialty expertise or additional studies. Chen et al. showed that an AI algorithm could triage 98% of routine cases while flagging only 2% for senior pathologist review, with no loss in diagnostic accuracy (Nat Commun, 2022). When integrated with laboratory information systems, these approaches can dramatically reduce turnaround times for routine cases while ensuring appropriate expert review of challenging cases.`, 
        margin, currentY + 2, contentWidth);
      currentY += 15;
      
      addFigure('Figure 2. Sensitivity and Specificity in Key Pathology AI Studies',
        `Sources: Campanella G, et al. Nat Med. 2019;25(8):1301-1309; Pantanowitz L, et al. Lancet Digit Health. 2020;2(8):e407-e416; Ehteshami Bejnordi B, et al. JAMA. 2017;318(22):2199-2210.`);
        
      addFigure('Figure 3. Average Time to Diagnosis: Manual vs AI-Assisted Pathology',
        `Source: Ho D, Quake SR, McCabe ERB, et al. Enabling Technologies for Personalized and Precision Medicine. Trends Biotechnol. 2020;38(5):497-518.`);
      
      addSection('Discussion', 
        `The accumulated evidence demonstrates that AI has progressed from research concept to clinical-grade technology in pathology. Performance metrics across multiple studies consistently show sensitivity and specificity exceeding 90% for many applications, rivaling or surpassing human performance in specific tasks. However, several important considerations affect the interpretation and implementation of these findings.

Clinical significance: AI shows particular strength in tasks involving pattern recognition and quantification. For cancer detection, AI sensitivity often exceeds that of general pathologists, potentially reducing the rates of missed diagnoses. In prospective implementations, Pantanowitz et al. reported that AI detected several cancer foci initially missed by pathologists, highlighting its value as a "second reviewer" (Lancet Digital Health, 2020). For grading tasks, AI provides more consistent results than individual pathologists, reducing the variability that can affect patient management.

Workflow impact: Pathologist time is an increasingly limited resource, making workflow efficiency critical. Studies demonstrate time savings of 30-60% for various tasks when using AI assistance. This translates to practical benefits - a pathology department processing 100 prostate cases weekly could save 15-30 pathologist hours, allowing focus on complex cases requiring human expertise.

Interobserver variability: A consistent finding across studies is reduced variability when AI assists pathologists. For Gleason grading, interobserver agreement typically increases from kappa values of 0.5-0.6 (moderate agreement) to 0.7-0.8 (substantial agreement) with AI assistance (Lancet Oncol, 2020). This improved consistency has important implications for treatment standardization across different practice settings.

Despite these promising results, important limitations warrant consideration. Generalizability remains a primary concern - AI systems trained on data from specific institutions or patient populations may not perform as well in different settings. Technical factors such as slide preparation, staining protocols, and scanner characteristics can influence AI performance. The FDA has recognized these challenges, recommending multi-site validations for AI systems seeking regulatory clearance.

Dataset bias is another critical issue. Most algorithms are trained on Western populations and may underperform in other ethnic groups with different disease presentations. For example, prostate cancer often presents with different morphological patterns in African American men compared to Caucasian men, potentially affecting AI algorithm performance if not adequately represented in training data.

Regulatory oversight for pathology AI continues to evolve. The FDA has cleared several AI-based pathology devices through the De Novo and 510(k) pathways, establishing a precedent for clinical implementation. The 2021 FDA clearance of Paige Prostate marked a significant milestone as the first pathology AI system authorized for primary diagnostic use. However, most systems are cleared as "locked" algorithms that cannot learn or adapt after deployment, creating challenges for maintaining performance as practice patterns evolve.

Integration with existing laboratory workflows presents practical implementation barriers. Digital pathology adoption, though growing, remains incomplete across the healthcare system. AI systems require integration with laboratory information systems and existing digital pathology platforms. Additionally, pathologists need training to effectively incorporate AI outputs into their diagnostic process, interpreting probability scores and heatmaps appropriately.

As with any emerging technology, cost-effectiveness data remains limited. Initial implementation requires significant investment in digital infrastructure, but long-term benefits may include reduced error rates, faster turnaround times, and more efficient resource utilization. Reimbursement mechanisms for AI-assisted pathology services are still developing, creating uncertainty around the financial sustainability of these technologies.`
      );
      
      addSection('Conclusion', 
        `Artificial intelligence has demonstrably advanced pathology practice, with mounting evidence that AI systems can achieve expert-level performance in specific diagnostic tasks. The strongest evidence exists for applications in oncologic pathology, particularly prostate and breast cancer, where FDA-cleared systems have entered clinical practice. AI demonstrates particular strengths in addressing known challenges in pathology: it reduces interobserver variability, enhances detection of subtle findings, standardizes quantitative assessments, and improves workflow efficiency.

The transition from research to clinical implementation is accelerating, supported by growing regulatory framework and institutional experience. However, successful integration requires attention to technical, workflow, and validation considerations. For optimal results, AI should be implemented as a pathologist-assisting technology rather than an autonomous diagnostic system for most applications. The pathologist-AI partnership leverages the complementary strengths of human expertise and computational capabilities.

Future directions include expanded applications to rare entities, predictive biomarker assessment, and integration with genomic and molecular data. Real-time quality assurance, reduction of diagnostic disparities, and adaptation to evolving practice patterns represent important goals. The evidence reviewed supports continued investment in pathology AI systems with rigorous validation and thoughtful implementation. With appropriate technical development, validation, and integration into clinical workflows, AI has the potential to significantly enhance the quality and efficiency of pathologic diagnosis.`
      );
      
      // References (simplified - ideally loop through list)
      if (currentY > pageHeight - margin - 50) { doc.addPage(); currentY = margin; }
      doc.setFontSize(14); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'References', margin, currentY, contentWidth); currentY += 5;
      doc.setFont(undefined, 'normal'); doc.setFontSize(8);
      const references = [
        `Campanella G, Hanna MG, Geneslaw L, et al. Clinical-grade computational pathology using weakly supervised deep learning on whole slide images. Nat Med. 2019;25(8):1301-1309.`,
        `Bulten W, Pinckaers H, van Boven H, et al. Automated deep-learning system for Gleason grading of prostate cancer using biopsies: a diagnostic study. Lancet Oncol. 2020;21(2):233-241.`,
        `Pantanowitz L, Quiroga-Garza GM, Bien L, et al. An artificial intelligence algorithm for prostate cancer diagnosis in whole slide images of core needle biopsies: a blinded clinical validation and deployment study. Lancet Digit Health. 2020;2(8):e407-e416.`,
        `Ehteshami Bejnordi B, Veta M, Johannes van Diest P, et al. Diagnostic Assessment of Deep Learning Algorithms for Detection of Lymph Node Metastases in Women With Breast Cancer. JAMA. 2017;318(22):2199-2210.`,
        `Steiner DF, MacDonald R, Liu Y, et al. Impact of Deep Learning Assistance on the Histopathologic Review of Lymph Nodes for Metastatic Breast Cancer. Am J Surg Pathol. 2018;42(12):1636-1646.`,
        `Saltz J, Gupta R, Hou L, et al. Spatial Organization and Molecular Correlation of Tumor-Infiltrating Lymphocytes Using Deep Learning on Pathology Images. Cell Rep. 2018;23(1):181-193.e7.`,
        `Kather JN, Heij LR, Grabsch HI, et al. Pan-cancer image-based detection of clinically actionable genetic alterations. Nat Cancer. 2020;1(8):789-799.`,
        `Ström P, Kartasalo K, Olsson H, et al. Artificial intelligence for diagnosis and grading of prostate cancer in biopsies: a population-based, diagnostic study. Lancet Oncol. 2020;21(2):222-232.`,
        `Ho D, Quake SR, McCabe ERB, et al. Enabling Technologies for Personalized and Precision Medicine. Trends Biotechnol. 2020;38(5):497-518.`,
        `Chen J, Lu MY, Williamson DFK, et al. Pan-cancer integrative histology-genomic analysis via multimodal deep learning. Cancer Cell. 2022;40(8):865-878.e6.`,
        `Maeda I, Kubota M, Ohta J, et al. Fully-automated system for the evaluation of Ki-67 stained breast cancer using artificial intelligence. Sci Rep. 2021;11(1):1800.`
      ];
      references.forEach(ref => {
        currentY = addWrappedText(doc, ref, margin, currentY, contentWidth, { lineHeightFactor: 1 });
        currentY += 3;
        if (currentY > pageHeight - margin - 10) { doc.addPage(); currentY = margin; }
      });

      // --- Save PDF --- 
      doc.save(t('pathologyaiWhitepaper.pdfFilename'));

    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Wrapper to ensure LTR direction for entire whitepaper */}
      <Box sx={{ direction: 'ltr' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, direction: 'ltr' }}>
          <Button 
          variant="contained" 
          startIcon={isGeneratingPdf ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? t('pathologyaiWhitepaper.generating') : t('pathologyaiWhitepaper.downloadPdf')}
        </Button>
      </Box>
      
      {/* Use a different background color from the imaging whitepaper */}
      <Paper ref={contentRef} elevation={3} sx={{ 
        p: { xs: 2, sm: 3, md: 5 },
        bgcolor: '#2d3748', // Dark blue-gray background that works with white text
        color: 'white', // White text for the dark background
        direction: 'ltr', // Always use LTR for English content
        textAlign: 'left' // Ensure left alignment
      }}>
        
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 1 }}>
          {t('pathologyaiWhitepaper.title')}
        </Typography>
        
        {/* Author Information */}
        <Typography variant="subtitle1" align="center" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.8)' }}>
          <i>{t('pathologyaiWhitepaper.authors.names')}</i><br />
          {t('pathologyaiWhitepaper.authors.organization')}<br />
          <Link href={`mailto:${t('pathologyaiWhitepaper.authors.emails.ron')}`} sx={{ color: '#90CAF9' }}>{t('pathologyaiWhitepaper.authors.emails.ron')}</Link> <br />
          <Link href={`mailto:${t('pathologyaiWhitepaper.authors.emails.sandy')}`} sx={{ color: '#90CAF9' }}>{t('pathologyaiWhitepaper.authors.emails.sandy')}</Link>
        </Typography>
        
        {/* Abstract */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('pathologyaiWhitepaper.sections.abstract.title')}</Typography>
          <Typography variant="body1" paragraph>
            {(t('pathologyaiWhitepaper.sections.abstract.content') || '').replace('AUC >', 'AUC > ')}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Introduction */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('pathologyaiWhitepaper.sections.introduction.title')}</Typography>
          {(t('pathologyaiWhitepaper.sections.introduction.content') || '').split('\n\n').map((paragraph, index) => (
            <Typography key={index} variant="body1" paragraph sx={{ textAlign: 'left' }}>
              {paragraph}
            </Typography>
          ))}
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Methods/Technologies */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('pathologyaiWhitepaper.sections.methods.title')}</Typography>
          {(t('pathologyaiWhitepaper.sections.methods.content') || '').split('\n\n').map((paragraph, index) => (
            <Typography key={index} variant="body1" paragraph sx={{ textAlign: 'left' }}>
              {paragraph}
            </Typography>
          ))}
        </Box>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Results */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('pathologyaiWhitepaper.sections.results.title')}</Typography>
          
          {/* Digital Pathology Overview */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>{t('pathologyaiWhitepaper.sections.results.digitalPathologyOverview.title')}</Typography>
          {(t('pathologyaiWhitepaper.sections.results.digitalPathologyOverview.content') || '').split('\n\n').map((paragraph, index) => (
            <Typography key={index} variant="body1" paragraph sx={{ textAlign: 'left' }}>
              {paragraph}
            </Typography>
          ))}
          
          {/* Cancer Detection */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>{t('pathologyaiWhitepaper.sections.results.cancerDetection.title')}</Typography>
          {(t('pathologyaiWhitepaper.sections.results.cancerDetection.content') || '').split('\n\n').map((paragraph, index) => (
            <Typography key={index} variant="body1" paragraph sx={{ textAlign: 'left' }}>
              {paragraph}
            </Typography>
          ))}
          
          {(t('pathologyaiWhitepaper.sections.results.cancerDetection.content2') || '').split('\n\n').map((paragraph, index) => (
            <Typography key={index} variant="body1" paragraph sx={{ textAlign: 'left' }}>
              {paragraph}
            </Typography>
          ))}
          
          {/* Grading and Classification */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>{t('pathologyaiWhitepaper.sections.results.gradingClassification.title')}</Typography>
          {(t('pathologyaiWhitepaper.sections.results.gradingClassification.content') || '').split('\n\n').map((paragraph, index) => (
            <Typography key={index} variant="body1" paragraph sx={{ textAlign: 'left' }}>
              {paragraph}
            </Typography>
          ))}
          
          
          {/* Workflow Optimization */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>{t('pathologyaiWhitepaper.sections.results.workflowOptimization.title')}</Typography>
          {(t('pathologyaiWhitepaper.sections.results.workflowOptimization.content') || '').split('\n\n').map((paragraph, index) => (
            <Typography key={index} variant="body1" paragraph sx={{ textAlign: 'left' }}>
              {paragraph}
            </Typography>
          ))}
        </Box>
        
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Discussion */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('pathologyaiWhitepaper.sections.discussion.title')}</Typography>
          {(t('pathologyaiWhitepaper.sections.discussion.content') || '').split('\n\n').map((paragraph, index) => (
            <Typography key={index} variant="body1" paragraph sx={{ textAlign: 'left' }}>
              {paragraph}
            </Typography>
          ))}
        </Box>
        
        {/* Conclusion */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('pathologyaiWhitepaper.sections.conclusion.title')}</Typography>
          {(t('pathologyaiWhitepaper.sections.conclusion.content') || '').split('\n\n').map((paragraph, index) => (
            <Typography key={index} variant="body1" paragraph sx={{ textAlign: 'left' }}>
              {paragraph}
            </Typography>
          ))}
        </Box>
        
        {/* References */}
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>{t('pathologyaiWhitepaper.sections.references.title')}</Typography>
          <Typography variant="body2" component="div">
            <List dense disablePadding>
              {(() => {
                const references = t('pathologyaiWhitepaper.sections.references.list', { returnObjects: true });
                const refArray = Array.isArray(references) ? references : [];
                return refArray.map((reference, index) => (
                  <ListItem key={index} sx={{ display: 'block', mb: 1 }}>
                    <ListItemText primary={reference} sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} />
                  </ListItem>
                ));
              })()}
            </List>
          </Typography>
        </Box>
      </Paper>
      </Box>
    </Container>
  );
}

export default PathologyAIWhitePaperPage