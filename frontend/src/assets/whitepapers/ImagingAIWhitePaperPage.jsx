// frontend/src/pages/ImagingAIWhitePaperPage.jsx
// This page displays the detailed white paper on AI in Diagnostic Imaging.
// It maintains the standard app layout (header/footer) and uses Material UI for styling.

import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Paper, Typography, Box, Divider, List, ListItem, ListItemText, Link, Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';
import jsPDF from 'jspdf';
import logoImage from '../../assets/branding/full_logo_high.png' // High quality for whitepapers;

// Import figures from the new subdirectory - Fixed paths relative to new location
import figure1Url from '../images/WhitePaper_AI_In_Diagnostic_imaging/Figure1-ROC-Curve.png';
import figure2Url from '../images/WhitePaper_AI_In_Diagnostic_imaging/Figure2-Sensitivity-And-Specificity.png';
import figure3Url from '../images/WhitePaper_AI_In_Diagnostic_imaging/Figure3-Average-Time-To-Diagnosis.png';
import figure4Url from '../images/WhitePaper_AI_In_Diagnostic_imaging/Figure4-HeatMap.png';

// Component to display figures with title and caption/citation
const FigureDisplay = ({ imageUrl, title, caption }) => (
  <Paper elevation={1} sx={{
        direction: 'ltr', // Force LTR for English content
        p: 2, my: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>{title}</Typography>
    <Box 
      component="img"
      src={imageUrl}
      alt={title}
      sx={{ 
        maxWidth: '100%', 
        height: 'auto', 
        my: 1, 
        border: '1px solid', 
        borderColor: 'divider' 
      }} 
    />
    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
      {caption}
    </Typography>
  </Paper>
);

function ImagingAIWhitePaperPage() {
  const { t, i18n } = useTranslation('pages');
  
  // Check if current language is RTL
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(i18n.language);
  const { setHeaderMode } = useHeaderVisibility();
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0); // Scroll to top when component mounts
  }, [setHeaderMode]);

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
      // Let jsPDF calculate height by passing 0
      doc.addImage(logoImage, 'PNG', margin, currentY, logoWidth, 0);
      // Estimate logo height for positioning (adjust if aspect ratio is known and differs)
      const estimatedLogoHeight = logoWidth * (38 / 200); // Estimate based on previous ratio
      currentY += estimatedLogoHeight + 25; // Increased spacing after logo

      // --- Document Content --- 
      doc.setFontSize(18);
      // Center Title using pageWidth
      currentY = addWrappedText(doc, 'AI in Diagnostic Imaging', pageWidth / 2, currentY, contentWidth, { align: 'center' });
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
      
      // Helper to add figures (basic implementation)
      const addFigure = (figUrl, title, caption, format = 'PNG') => {
         const estimatedFigHeight = 150; // Estimate needed space for image + caption
         const spaceForCaption = 50; // Estimated space needed for caption
         // Check for page break: need space for title, image, caption
         if (currentY > pageHeight - margin - estimatedFigHeight - spaceForCaption) { 
           doc.addPage();
           currentY = margin;
         }
         doc.setFontSize(10);
         doc.setFont(undefined, 'bold');
         currentY = addWrappedText(doc, title, margin, currentY, contentWidth);
         currentY += 8; // Space before image
         
         // Add Image
         const imgStartY = currentY;
         let actualImageHeight = 0;
         try {
             const imgWidth = contentWidth * 0.7;
             // Ensure ALL figures are added as PNG
             doc.addImage(figUrl, 'PNG', margin + (contentWidth - imgWidth) / 2, currentY, imgWidth, 0); 
             actualImageHeight = imgWidth * 0.75; // Still an estimate!
         } catch (e) {
             console.error("Error adding image:", e);
             currentY = addWrappedText(doc, `[Error adding image: ${title}]`, margin, currentY, contentWidth);
         }
         
         currentY = imgStartY + actualImageHeight + 10;
         doc.setFontSize(8);
         doc.setFont(undefined, 'italic');
         currentY = addWrappedText(doc, caption, margin, currentY, contentWidth);
         currentY += 20;
         doc.setFont(undefined, 'normal');
      }

      // --- Add Sections --- 
      addSection('Abstract', 
        `Artificial intelligence (AI) has rapidly emerged as a transformative tool in diagnostic imaging, demonstrating expert-level performance across radiology, pathology, ophthalmology, and gastroenterology. We review the state-of-the-art in AI-assisted imaging, including clinical trials and FDA-cleared systems such as autonomous retinal screening for diabetic retinopathy, AI-aided polyp detection in colonoscopy, and deep learning tools in medical imaging diagnostics. Evidence from prospective studies indicates that AI can improve sensitivity and workflow efficiency – for example, an AI system increased breast cancer detection by 29% in screening mammography without increasing false positives, while reducing radiologist workload by nearly half (itnonline.com). In pathology, AI algorithms have achieved near-perfect cancer detection sensitivity in whole-slide images (nature.com), and in ophthalmology an autonomous AI system for diabetic retinopathy achieved 87% sensitivity and 91% specificity in a primary care setting (pmc.ncbi.nlm.nih.gov). We discuss performance metrics (sensitivity, specificity, AUC) from recent trials, and examine challenges including generalizability across populations, bias in training data, and the evolving regulatory landscape for AI/ML-based medical devices. While AI has shown potential to enhance diagnostic accuracy and efficiency, rigorous clinical validation and oversight are essential to ensure safe integration into practice.`
      );
      addSection('Introduction', 
        `Advances in machine learning, particularly deep convolutional neural networks, have enabled AI systems to interpret medical images with unprecedented accuracy. Radiology and other image-rich fields face growing imaging volumes and workforce constraints, motivating interest in AI as a means to improve diagnostic efficiency and consistency. Over the past decade, AI algorithms have been developed to detect abnormalities in medical images ranging from radiographs and CT scans to digital pathology slides and retinal photographs. Early studies demonstrated high accuracy in controlled settings, spurring dozens of AI tools to receive regulatory clearance for clinical use. Notably, in 2018 the FDA authorized the first autonomous AI diagnostic system (IDx-DR) for diabetic retinopathy detection (pmc.ncbi.nlm.nih.gov). Since then, a proliferation of AI-assisted imaging devices has entered practice, prompting assessments of their real-world performance and impact on clinical outcomes. This review provides a comprehensive overview of state-of-the-art AI in diagnostic imaging, summarizing evidence from recent clinical trials across multiple specialties and highlighting key technological and regulatory considerations.`
      );
       addSection('Methods/Technologies', 
        `Modern AI in imaging relies predominantly on deep learning trained on large labeled datasets. Convolutional neural networks can automatically learn complex visual features, enabling image classification (e.g., detecting disease vs. normal) and object detection or segmentation (e.g., outlining lesions). Many AI tools are designed as augmented diagnostic aids: they analyze images and provide findings (such as bounding boxes, heatmaps, or automated measurements) to assist clinicians, who retain final interpretation authority. In other cases, autonomous AI systems operate without specialist oversight for screening purposes. For example, the IDx-DR system for diabetic retinopathy is autonomous, producing a referral decision from retinal photos without requiring an ophthalmologist (pmc.ncbi.nlm.nih.gov). AI algorithms are typically evaluated on retrospective test sets using metrics like sensitivity, specificity, and area under the ROC curve (AUC). Increasingly, prospective clinical trials are employed to measure real-world performance, workflow efficiency, and impact on interobserver variability. Key performance metrics include detection sensitivity (the fraction of true positives identified), specificity (true negatives correctly identified), and positive/negative predictive values, as well as AUC to summarize overall accuracy. Additionally, studies examine time-to-diagnosis improvements (e.g., faster flagging of critical findings) and interobserver variability – whether AI reduces variability by providing a consistent standard. We surveyed peer-reviewed studies and regulatory filings to collate the highest level of evidence on AI performance in clinical imaging tasks.`
      );
      
      // Results Section (split to insert figures)
       if (currentY > pageHeight - margin - 50) { doc.addPage(); currentY = margin; }
       doc.setFontSize(14); doc.setFont(undefined, 'bold');
       currentY = addWrappedText(doc, 'Results', margin, currentY, contentWidth); currentY += 10;
       doc.setFont(undefined, 'normal');
       
       doc.setFontSize(12); doc.setFont(undefined, 'bold');
       currentY = addWrappedText(doc, 'Radiology', margin, currentY, contentWidth); currentY += 5;
       doc.setFont(undefined, 'normal'); doc.setFontSize(10);
       currentY = addWrappedText(doc, 
          `AI applications in radiology span modalities from plain X-rays to CT, MRI, and mammography. Large retrospective studies initially showed that AI could match or exceed radiologist performance in detecting certain findings. For instance, an independent validation of a deep learning system (Lunit INSIGHT CXR) on 1,960 chest radiographs reported AUCs ranging from 0.88 to 0.99 for detecting ten common abnormalities, comparable between emergency and outpatient settings (pubmed.ncbi.nlm.nih.gov).`, 
          margin, currentY + 2, contentWidth);
       currentY += 5;
       currentY = addWrappedText(doc, 
          `AI algorithms can detect anomalies faster and with high precision, even when lesions are barely perceptible to the naked eye. Below is an example chest X-ray where a convolutional neural network flagged a faint pulmonary nodule in the right mid-lung field, using a heatmap overlay to direct the clinician's attention.`, 
          margin, currentY + 2, contentWidth);
       currentY += 5; // Space before figure
       addFigure(figure4Url, 'Figure 4. AI Heatmap Highlighting Subtle Pulmonary Nodule',
         `Chest X-ray with AI-generated heatmap (red→yellow) marking a solitary pulmonary nodule not readily visible on initial human review. Source: van Beek EJR, Ahn JS, Kim MJ, Murchison JT. Validation of a deep learning algorithm for detecting thoracic abnormalities on chest radiographs. Clin Radiol. 2023;78(1):1–7.`, 'PNG');
      currentY = addWrappedText(doc, 
         `In prospective settings, AI has demonstrated the ability to improve screening accuracy. A notable example is in mammography: the Mammography Screening with Artificial Intelligence (MASAI) trial in Sweden enrolled over 100,000 women and evaluated an AI (Transpara) as an independent reader in breast cancer screening. AI-supported screening achieved a 29% higher cancer detection rate (6.4 vs 5.0 cancers per 1000 screens) compared to standard double reading, without increasing false positives (itnonline.com). Critically, it also reduced radiologists' reading workload by 44% (itnonline.com), by allowing one reader instead of two in many cases. Another study found that an AI system for chest CT triage of acute findings (e.g., intracranial hemorrhage, pulmonary embolism) can significantly shorten time-to-notification of critical results, helping prioritize urgent cases. Across multiple trials, AI as a second reader tends to increase sensitivity for lesion detection (catching findings that humans miss) while maintaining acceptable specificity (itnonline.com, pubmed.ncbi.nlm.nih.gov). However, standalone AI is not infallible – it may generate false positives or overlook rare presentations, so clinical implementation often uses AI to augment, not replace, human interpretation.`, 
         margin, currentY + 2, contentWidth);
       currentY += 15;
       
       doc.setFontSize(12); doc.setFont(undefined, 'bold');
       currentY = addWrappedText(doc, 'Pathology', margin, currentY, contentWidth); currentY += 5;
       doc.setFont(undefined, 'normal'); doc.setFontSize(10);
       currentY = addWrappedText(doc, 
         `Digital pathology has become a fertile ground for AI because whole-slide images contain abundant data that can be laborious for pathologists to exhaustively review. AI-based image analyzers have shown remarkable accuracy in detecting malignancies in histopathology slides. For example, a deep learning algorithm for prostate biopsy analysis was validated on thousands of slides from multiple institutions: it achieved 97–100% sensitivity and 88–98% specificity for identifying cancer in biopsy cores (nature.com). In that study, the AI detected several cancer foci initially missed by pathologists, highlighting its potential to reduce oversight errors (nature.com). The consistency of AI was also notable – for Gleason grading of prostate cancer, the AI's grading agreement (quadratic kappa ~0.77) was on par with experienced pathologists and even approached the consensus grade in difficult cases (nature.com). In breast pathology, deep learning algorithms in the CAMELYON challenge achieved near-human performance for metastatic tumor detection in lymph nodes, with some achieving an AUC > 0.99. These tools can serve as a "second pair of eyes," flagging suspicious areas on slides for closer human inspection and thereby reducing interobserver variability in readings. Early clinical use-cases include assisting pathologists in screening slides (e.g., Pap smears or lymph node biopsies) to triage which need detailed review. Regulatory approvals are emerging: an AI for prostate cancer detection on slides (Paige Prostate) gained FDA clearance in 2021, marking the first authorized pathology AI device. Overall, in pathology, AI has demonstrated high sensitivity (often exceeding that of individual pathologists in time-limited settings) and good specificity, with the promise of improving diagnostic throughput and consistency.`, 
         margin, currentY + 2, contentWidth);
       currentY += 15;

      doc.setFontSize(12); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'Ophthalmology', margin, currentY, contentWidth); currentY += 5;
      doc.setFont(undefined, 'normal'); doc.setFontSize(10);
      currentY = addWrappedText(doc, 
        `Ophthalmology was among the first fields to implement autonomous AI diagnostics. Diabetic retinopathy (DR) screening traditionally requires an ophthalmologist's interpretation of retinal fundus photographs, which is a barrier to widespread screening. The FDA-approved IDx-DR system addresses this gap by autonomously analyzing fundus images for diabetic retinopathy. In a pivotal trial at primary care clinics, the IDx-DR AI achieved 87.2% sensitivity and 90.7% specificity for detecting more-than-mild DR, using expert fundus photography grading as the reference standard (pmc.ncbi.nlm.nih.gov). The system met its pre-specified performance targets and could produce immediate refer/no-refer decisions, enabling point-of-care screening (pmc.ncbi.nlm.nih.gov). This led to IDx-DR becoming the first AI system authorized to provide a diagnosis without specialist oversight (pmc.ncbi.nlm.nih.gov). Following this, other ophthalmic AI tools have been developed, such as EyeArt (Eyenuk) for DR screening and algorithms for detecting glaucomatous optic nerve changes or age-related macular degeneration on optical coherence tomography. Clinical studies indicate AI can accurately identify referable diabetic retinopathy with AUCs around 0.90 or above, and real-world deployments (e.g., in retail clinics) have demonstrated feasibility of autonomous screening. In addition to screening, AI has been applied in ophthalmology to assist in quantifying disease (such as retinal thickness or visual field loss) and in predicting progression. While AI systems excel at detecting classic disease patterns in retinal images, challenges remain in handling uncommon pathologies or image artifacts; thus ongoing monitoring and periodic re-validation in diverse patient populations are recommended.`, 
        margin, currentY + 2, contentWidth);
      currentY += 5; // Space before figure
      addFigure(figure1Url, 'Figure 1. ROC Curve: Diabetic Retinopathy AI System',
        `Source: Abramoff MD, Lavin PT, Birch M, Shah N, Folk JC. Pivotal trial of an autonomous AI-based diagnostic system for detection of diabetic retinopathy in primary care offices. NPJ Digital Medicine. 2018;1:39.`, 'PNG');

      doc.setFontSize(12); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'Gastroenterology', margin, currentY, contentWidth); currentY += 5;
      doc.setFont(undefined, 'normal'); doc.setFontSize(10);
      currentY = addWrappedText(doc, 
        `In gastrointestinal endoscopy, AI-based real-time image analysis is being used to enhance lesion detection. The prime example is computer-aided detection (CADe) for colorectal polyps during colonoscopy. GI Genius (Medtronic/Cosmo), cleared by the FDA in 2021, is an AI device that highlights possible polyps in the endoscopic video feed to assist gastroenterologists. Multiple randomized controlled trials (RCTs) have shown that such AI assistance can significantly improve adenoma detection rates (ADR). A 2021 meta-analysis of RCTs reported that AI-assisted colonoscopy achieved a pooled ADR of 36.6%, compared to 25.2% with standard colonoscopy – an absolute increase of over 11% (pmc.ncbi.nlm.nih.gov). This corresponds to detecting more adenomatous polyps per procedure, which is clinically important since higher ADR is linked to lower colorectal cancer incidence. In the landmark trial by Repici et al., incorporating GI Genius led to a reduction in missed polyps and an increase in small adenoma detection (pmc.ncbi.nlm.nih.gov). AI systems have also been developed for upper GI endoscopy, for instance to detect early esophageal neoplasia or gastric lesions, and in capsule endoscopy for automated image screening. While efficacy in expert hands is proven, recent real-world studies show more nuanced results: some community practice trials did not find a significant ADR improvement with AI, possibly due to already high baseline ADR or user factors (pmc.ncbi.nlm.nih.gov). Nonetheless, most evidence supports AI's ability to reduce operator dependence and interobserver variability in endoscopic detection. Apart from detection, AI is being explored for classification of polyps during colonoscopy (e.g., optical biopsy of diminutive polyps to decide if resection is needed), with early studies showing high specificity for identifying hyperplastic vs adenomatous lesions.`, 
        margin, currentY + 2, contentWidth);
      currentY += 15;
      
      addFigure(figure2Url, 'Figure 2. Sensitivity and Specificity in Key Imaging AI Studies',
        `Sources: Abramoff MD, et al. NPJ Digit Med. 2018; Mori Y, et al. Ann Intern Med. 2018;169(6):357–366; Steiner DF, et al. Am J Surg Pathol. 2018;42(6):828–833.`, 'PNG');
        
      addFigure(figure3Url, 'Figure 3. Average Time to Diagnosis: Manual vs AI-Assisted',
        `Source: Topol EJ. High-performance medicine: the convergence of human and artificial intelligence. Nature Medicine. 2019;25(1):44–56.`, 'PNG');
      
      addSection('Discussion', 
        `Collectively, these results illustrate that AI has matured from laboratory proofs-of-concept to clinically validated tools across diverse imaging specialties. Diagnostic accuracy: AI algorithms often achieve sensitivity and specificity on par with experienced physicians for specific tasks. In fields like mammography and colonoscopy, the addition of AI has measurably increased the detection of clinically significant lesions (itnonline.com, pmc.ncbi.nlm.nih.gov). Importantly, this is translating into real-world improvements – for example, catching more early-stage cancers in screening or more polyps in colonoscopy that might prevent cancer development. Efficiency and workflow: Beyond accuracy, AI offers gains in efficiency. By automating initial image review or triaging cases, AI can shorten time-to-diagnosis for urgent findings and reduce human workload. A majority of studies report reduced reading times or improved workflow with AI assistance in radiology (itnonline.com). Consistently, AI behaves as a tireless second reader that can screen normal cases quickly (with high negative predictive value) and alert clinicians to subtle abnormalities, thus mitigating fatigue-related misses. Interobserver variability: AI provides a standardized interpretation that can act as a reference point. This is especially valuable in subjective tasks like grading disease severity. For instance, in pathology and ophthalmology, AI's consistency helps reduce variability – the AI will output the same result given the same input, whereas human interpretations might differ. The prostate AI study showed the algorithm's tumor grading agreed with expert consensus nearly as well as experts agreed with each other (nature.com). Such consistency can improve overall diagnostic agreement when AI is used in conjunction with human readers. Despite these promising outcomes, there are several challenges and limitations to address. Generalizability: AI models can suffer performance degradation when deployed in populations or settings that differ from the training data. Factors like patient demographics, imaging equipment, or clinical prevalence can shift, leading to reduced accuracy. For example, an AI trained predominantly on lighter-skinned patients for melanoma detection may underperform on darker-skinned individuals (pewtrusts.org), potentially perpetuating health disparities. Similarly, algorithms developed at large academic centers may not immediately translate to smaller community hospitals with different patient populations and resources (pewtrusts.org). Ensuring diverse and representative training data, as well as performing external validation, is critical to guarantee consistent performance. Bias: AI can inherit biases present in training datasets. If certain groups are underrepresented or if surrogate markers (e.g., health care cost as a proxy for need) are used, the AI's recommendations might be skewed (pewtrusts.org, pewtrusts.org). Ongoing research in algorithmic fairness and techniques to debias training (or at least detect bias in outputs) is needed to ensure equitable diagnostic performance. Regulatory oversight: The regulatory framework for AI in medicine is evolving. Thus far, nearly all FDA-cleared imaging AI devices use "locked" algorithms – fixed models that do not change after deployment (pewtrusts.org). This ensures a stable performance profile but means the AI cannot adapt without a new approval. The FDA has recognized that traditional regulatory paradigms are not well-suited for adaptive, continuously-learning AI systems (fda.gov, fda.gov). In 2021, the FDA released an AI/ML-based Software as a Medical Device Action Plan outlining a potential path for approving adaptive algorithms and emphasizing the need for Good Machine Learning Practice in development (fda.gov). Future regulations will likely require rigorous post-market surveillance, transparency of algorithm updates, and possibly real-time performance monitoring to maintain safety and effectiveness as AI models evolve. Integration and training: Successful deployment of AI tools demands integration into clinical workflows (e.g., PACS systems for radiology, digital pathology systems) and training end-users to interpret AI outputs correctly. User trust is a factor – clinicians need to understand an AI's limitations and error modes to use it effectively. Furthermore, medicolegal and ethical questions persist: e.g., how to assign responsibility if an AI misses a diagnosis or if clinicians disagree with an AI recommendation. These will need clear guidelines as AI becomes more ingrained in practice.`
      );
      addSection('Conclusion', 
        `AI-assisted diagnostic imaging has progressed from concept to reality, with robust evidence demonstrating improvements in diagnostic performance and efficiency across radiology, pathology, ophthalmology, and gastroenterology. High-profile examples such as autonomous retinal screening for diabetic retinopathy and AI-guided colonoscopy have shown that AI can meet or exceed clinician benchmarks in sensitivity and specificity, while also reducing workload and interobserver variability. These technologies are poised to augment clinical decision-making – detecting subtle findings that may elude the human eye and standardizing care delivery. Nevertheless, realizing AI's full potential in healthcare will require careful attention to its limitations. Ensuring algorithms are trained and validated on diverse populations, mitigating bias, and establishing regulatory mechanisms for continuous algorithm improvement are paramount. With ongoing clinical trials and improving transparency of AI "black box" models, the medical community is learning how best to interface AI with expert judgment. In summary, AI in diagnostic imaging represents a significant step toward more precise, efficient, and accessible healthcare, but it must be implemented with rigor and oversight. Continued research, multi-center validation, and interdisciplinary collaboration (between clinicians, data scientists, and regulators) will be essential to safely harness AI's capabilities to improve patient outcomes.`
      );
      
      // References (simplified - ideally loop through list)
       if (currentY > pageHeight - margin - 50) { doc.addPage(); currentY = margin; }
       doc.setFontSize(14); doc.setFont(undefined, 'bold');
       currentY = addWrappedText(doc, 'References', margin, currentY, contentWidth); currentY += 5;
       doc.setFont(undefined, 'normal'); doc.setFontSize(8);
       const references = [
          `Abràmoff MD, Lavin PT, Birch M, Shah N, Folk JC... NPJ Digital Medicine. 2018;1:39 (pmc.ncbi.nlm.nih.gov).`,
          `Lång K, et al... Lancet Oncol. 2023;24(8):936-944 (itnonline.com).`,
          `van Beek EJR, Ahn JS, Kim MJ, Murchison JT... Clin Radiol. 2023;78(1):1-7 (pubmed.ncbi.nlm.nih.gov).`,
          `Tolkach Y, Ovtcharov V, Pryalukhin A, et al... NPJ Precis Oncol. 2023;7:77 (nature.com, nature.com).`,
          `Repici A, Badalamenti M, Maselli R, et al... Gastroenterology. 2020;159(2):512–520.e7 (pmc.ncbi.nlm.nih.gov).`,
          `Hassan C, Spadaccini M, Iannone A, et al... Gastrointest Endosc. 2021;93(1):77–85.e6 (pmc.ncbi.nlm.nih.gov).`,
          `Pew Charitable Trusts... Issue Brief, Aug 2021 (pewtrusts.org, pewtrusts.org).`,
          `Food and Drug Administration (FDA)... January 2021 (fda.gov).`,
          `Mori Y, Kudo SE, Misawa M, et al... Ann Intern Med. 2018;169(6):357–366.`,
          `Steiner DF, Chen P-HC, Mermel CH, et al... Am J Surg Pathol. 2018;42(6):828–833.`,
          `Topol EJ... Nature Medicine. 2019;25(1):44–56.`
       ];
       references.forEach(ref => {
         currentY = addWrappedText(doc, ref, margin, currentY, contentWidth, { lineHeightFactor: 1 });
         currentY += 3;
         if (currentY > pageHeight - margin - 10) { doc.addPage(); currentY = margin; }
       });

      // --- Save PDF --- 
      doc.save('VirtualMD_AI_Imaging_White_Paper.pdf');

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
      
      <Paper ref={contentRef} elevation={3} sx={{ p: { xs: 2, sm: 3, md: 5 } }}>
        
        <Typography variant="h4" component="h1" gutterBottom align={t('imagingaiWhitepaper.title')} sx={{ mb: 1 }}>
          AI in Diagnostic Imaging
        </Typography>
        
        {/* Author Information */}
        <Typography variant="subtitle1" align={t('imagingaiWhitepaper.title')} color="text.secondary" sx={{ mb: 3 }}>
          <i>Ron Rubin, PhD and Sandy Miles</i><br />
          VirtualMD.app Technologies<br />
          <Link href="mailto:ronrubin@virtualmd.app">ronrubin@virtualmd.app</Link> <br />
          <Link href="mailto:sandy@virtualmd.app">sandymiles@virtualmd.app</Link>
        </Typography>
        
        {/* Abstract */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Abstract</Typography>
          <Typography variant="body1" paragraph>
            Artificial intelligence (AI) has rapidly emerged as a transformative tool in diagnostic imaging, demonstrating expert-level performance across radiology, pathology, ophthalmology, and gastroenterology. We review the state-of-the-art in AI-assisted imaging, including clinical trials and FDA-cleared systems such as autonomous retinal screening for diabetic retinopathy, AI-aided polyp detection in colonoscopy, and deep learning tools in medical imaging diagnostics. Evidence from prospective studies indicates that AI can improve sensitivity and workflow efficiency – for example, an AI system increased breast cancer detection by 29% in screening mammography without increasing false positives, while reducing radiologist workload by nearly half (itnonline.com). In pathology, AI algorithms have achieved near-perfect cancer detection sensitivity in whole-slide images (nature.com), and in ophthalmology an autonomous AI system for diabetic retinopathy achieved 87% sensitivity and 91% specificity in a primary care setting (pmc.ncbi.nlm.nih.gov). We discuss performance metrics (sensitivity, specificity, AUC) from recent trials, and examine challenges including generalizability across populations, bias in training data, and the evolving regulatory landscape for AI/ML-based medical devices. While AI has shown potential to enhance diagnostic accuracy and efficiency, rigorous clinical validation and oversight are essential to ensure safe integration into practice.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />

        {/* Introduction */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Introduction</Typography>
          <Typography variant="body1" paragraph>
            Advances in machine learning, particularly deep convolutional neural networks, have enabled AI systems to interpret medical images with unprecedented accuracy. Radiology and other image-rich fields face growing imaging volumes and workforce constraints, motivating interest in AI as a means to improve diagnostic efficiency and consistency. Over the past decade, AI algorithms have been developed to detect abnormalities in medical images ranging from radiographs and CT scans to digital pathology slides and retinal photographs. Early studies demonstrated high accuracy in controlled settings, spurring dozens of AI tools to receive regulatory clearance for clinical use. Notably, in 2018 the FDA authorized the first autonomous AI diagnostic system (IDx-DR) for diabetic retinopathy detection (pmc.ncbi.nlm.nih.gov). Since then, a proliferation of AI-assisted imaging devices has entered practice, prompting assessments of their real-world performance and impact on clinical outcomes. This review provides a comprehensive overview of state-of-the-art AI in diagnostic imaging, summarizing evidence from recent clinical trials across multiple specialties and highlighting key technological and regulatory considerations.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />

        {/* Methods/Technologies */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Methods/Technologies</Typography>
          <Typography variant="body1" paragraph>
            Modern AI in imaging relies predominantly on deep learning trained on large labeled datasets. Convolutional neural networks can automatically learn complex visual features, enabling image classification (e.g., detecting disease vs. normal) and object detection or segmentation (e.g., outlining lesions). Many AI tools are designed as augmented diagnostic aids: they analyze images and provide findings (such as bounding boxes, heatmaps, or automated measurements) to assist clinicians, who retain final interpretation authority. In other cases, autonomous AI systems operate without specialist oversight for screening purposes. For example, the IDx-DR system for diabetic retinopathy is autonomous, producing a referral decision from retinal photos without requiring an ophthalmologist (pmc.ncbi.nlm.nih.gov). AI algorithms are typically evaluated on retrospective test sets using metrics like sensitivity, specificity, and area under the ROC curve (AUC). Increasingly, prospective clinical trials are employed to measure real-world performance, workflow efficiency, and impact on interobserver variability. Key performance metrics include detection sensitivity (the fraction of true positives identified), specificity (true negatives correctly identified), and positive/negative predictive values, as well as AUC to summarize overall accuracy. Additionally, studies examine time-to-diagnosis improvements (e.g., faster flagging of critical findings) and interobserver variability – whether AI reduces variability by providing a consistent standard. We surveyed peer-reviewed studies and regulatory filings to collate the highest level of evidence on AI performance in clinical imaging tasks.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Results */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Results</Typography>
          
          {/* Radiology Section */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>Radiology</Typography>
          <Typography variant="body1" paragraph>
            AI applications in radiology span modalities from plain X-rays to CT, MRI, and mammography. Large retrospective studies initially showed that AI could match or exceed radiologist performance in detecting certain findings. For instance, an independent validation of a deep learning system (Lunit INSIGHT CXR) on 1,960 chest radiographs reported AUCs ranging from 0.88 to 0.99 for detecting ten common abnormalities, comparable between emergency and outpatient settings (pubmed.ncbi.nlm.nih.gov).
          </Typography>
          <Typography variant="body1" paragraph>
             AI algorithms can detect anomalies faster and with high precision, even when lesions are barely perceptible to the naked eye. Below is an example chest X-ray where a convolutional neural network flagged a faint pulmonary nodule in the right mid-lung field, using a heatmap overlay to direct the clinician's attention.
          </Typography>
          <FigureDisplay 
             imageUrl={figure4Url} 
             title="Figure 4. AI Heatmap Highlighting Subtle Pulmonary Nodule"
             caption={t('imagingaiWhitepaper.content30')}
          />
          <Typography variant="body1" paragraph>
            In prospective settings, AI has demonstrated the ability to improve screening accuracy. A notable example is in mammography: the Mammography Screening with Artificial Intelligence (MASAI) trial in Sweden enrolled over 100,000 women and evaluated an AI (Transpara) as an independent reader in breast cancer screening. AI-supported screening achieved a 29% higher cancer detection rate (6.4 vs 5.0 cancers per 1000 screens) compared to standard double reading, without increasing false positives (itnonline.com). Critically, it also reduced radiologists' reading workload by 44% (itnonline.com), by allowing one reader instead of two in many cases. Another study found that an AI system for chest CT triage of acute findings (e.g., intracranial hemorrhage, pulmonary embolism) can significantly shorten time-to-notification of critical results, helping prioritize urgent cases. Across multiple trials, AI as a second reader tends to increase sensitivity for lesion detection (catching findings that humans miss) while maintaining acceptable specificity (itnonline.com, pubmed.ncbi.nlm.nih.gov). However, standalone AI is not infallible – it may generate false positives or overlook rare presentations, so clinical implementation often uses AI to augment, not replace, human interpretation.
          </Typography>
          
          {/* Pathology Section */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>Pathology</Typography>
          <Typography variant="body1" paragraph>
            Digital pathology has become a fertile ground for AI because whole-slide images contain abundant data that can be laborious for pathologists to exhaustively review. AI-based image analyzers have shown remarkable accuracy in detecting malignancies in histopathology slides. For example, a deep learning algorithm for prostate biopsy analysis was validated on thousands of slides from multiple institutions: it achieved 97–100% sensitivity and 88–98% specificity for identifying cancer in biopsy cores (nature.com). In that study, the AI detected several cancer foci initially missed by pathologists, highlighting its potential to reduce oversight errors (nature.com). The consistency of AI was also notable – for Gleason grading of prostate cancer, the AI's grading agreement (quadratic kappa ~0.77) was on par with experienced pathologists and even approached the consensus grade in difficult cases (nature.com). In breast pathology, deep learning algorithms in the CAMELYON challenge achieved near-human performance for metastatic tumor detection in lymph nodes, with some achieving an AUC {'>'} 0.99. These tools can serve as a "second pair of eyes," flagging suspicious areas on slides for closer human inspection and thereby reducing interobserver variability in readings. Early clinical use-cases include assisting pathologists in screening slides (e.g., Pap smears or lymph node biopsies) to triage which need detailed review. Regulatory approvals are emerging: an AI for prostate cancer detection on slides (Paige Prostate) gained FDA clearance in 2021, marking the first authorized pathology AI device. Overall, in pathology, AI has demonstrated high sensitivity (often exceeding that of individual pathologists in time-limited settings) and good specificity, with the promise of improving diagnostic throughput and consistency.
          </Typography>

          {/* Ophthalmology Section */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>Ophthalmology</Typography>
          <Typography variant="body1" paragraph>
            Ophthalmology was among the first fields to implement autonomous AI diagnostics. Diabetic retinopathy (DR) screening traditionally requires an ophthalmologist's interpretation of retinal fundus photographs, which is a barrier to widespread screening. The FDA-approved IDx-DR system addresses this gap by autonomously analyzing fundus images for diabetic retinopathy. In a pivotal trial at primary care clinics, the IDx-DR AI achieved 87.2% sensitivity and 90.7% specificity for detecting more-than-mild DR, using expert fundus photography grading as the reference standard (pmc.ncbi.nlm.nih.gov). The system met its pre-specified performance targets and could produce immediate refer/no-refer decisions, enabling point-of-care screening (pmc.ncbi.nlm.nih.gov). This led to IDx-DR becoming the first AI system authorized to provide a diagnosis without specialist oversight (pmc.ncbi.nlm.nih.gov). Following this, other ophthalmic AI tools have been developed, such as EyeArt (Eyenuk) for DR screening and algorithms for detecting glaucomatous optic nerve changes or age-related macular degeneration on optical coherence tomography. Clinical studies indicate AI can accurately identify referable diabetic retinopathy with AUCs around 0.90 or above, and real-world deployments (e.g., in retail clinics) have demonstrated feasibility of autonomous screening. In addition to screening, AI has been applied in ophthalmology to assist in quantifying disease (such as retinal thickness or visual field loss) and in predicting progression. While AI systems excel at detecting classic disease patterns in retinal images, challenges remain in handling uncommon pathologies or image artifacts; thus ongoing monitoring and periodic re-validation in diverse patient populations are recommended.
          </Typography>
          <FigureDisplay 
             imageUrl={figure1Url} 
             title="Figure 1. ROC Curve: Diabetic Retinopathy AI System"
             caption={t('imagingaiWhitepaper.content42')}
          />

          {/* Gastroenterology Section */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>Gastroenterology</Typography>
          <Typography variant="body1" paragraph>
            In gastrointestinal endoscopy, AI-based real-time image analysis is being used to enhance lesion detection. The prime example is computer-aided detection (CADe) for colorectal polyps during colonoscopy. GI Genius (Medtronic/Cosmo), cleared by the FDA in 2021, is an AI device that highlights possible polyps in the endoscopic video feed to assist gastroenterologists. Multiple randomized controlled trials (RCTs) have shown that such AI assistance can significantly improve adenoma detection rates (ADR). A 2021 meta-analysis of RCTs reported that AI-assisted colonoscopy achieved a pooled ADR of 36.6%, compared to 25.2% with standard colonoscopy – an absolute increase of over 11% (pmc.ncbi.nlm.nih.gov). This corresponds to detecting more adenomatous polyps per procedure, which is clinically important since higher ADR is linked to lower colorectal cancer incidence. In the landmark trial by Repici et al., incorporating GI Genius led to a reduction in missed polyps and an increase in small adenoma detection (pmc.ncbi.nlm.nih.gov). AI systems have also been developed for upper GI endoscopy, for instance to detect early esophageal neoplasia or gastric lesions, and in capsule endoscopy for automated image screening. While efficacy in expert hands is proven, recent real-world studies show more nuanced results: some community practice trials did not find a significant ADR improvement with AI, possibly due to already high baseline ADR or user factors (pmc.ncbi.nlm.nih.gov). Nonetheless, most evidence supports AI's ability to reduce operator dependence and interobserver variability in endoscopic detection. Apart from detection, AI is being explored for classification of polyps during colonoscopy (e.g., optical biopsy of diminutive polyps to decide if resection is needed), with early studies showing high specificity for identifying hyperplastic vs adenomatous lesions.
          </Typography>
        </Box>
        
        {/* Insert Figure 2 after relevant text - perhaps after Pathology or Radiology? Let's put it here */}
        <FigureDisplay 
           imageUrl={figure2Url} 
           title="Figure 2. Sensitivity and Specificity in Key Imaging AI Studies"
           caption={t('imagingaiWhitepaper.content49')}
        />

        {/* Insert Figure 3 after relevant text - perhaps before/in Discussion? Let's put it here */}
        <FigureDisplay 
           imageUrl={figure3Url} 
           title="Figure 3. Average Time to Diagnosis: Manual vs AI-Assisted"
           caption={t('imagingaiWhitepaper.content98')}
        />
        
        <Divider sx={{ my: 4 }} />

        {/* Discussion */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Discussion</Typography>
          <Typography variant="body1" paragraph>
            Collectively, these results illustrate that AI has matured from laboratory proofs-of-concept to clinically validated tools across diverse imaging specialties. Diagnostic accuracy: AI algorithms often achieve sensitivity and specificity on par with experienced physicians for specific tasks. In fields like mammography and colonoscopy, the addition of AI has measurably increased the detection of clinically significant lesions (itnonline.com, pmc.ncbi.nlm.nih.gov). Importantly, this is translating into real-world improvements – for example, catching more early-stage cancers in screening or more polyps in colonoscopy that might prevent cancer development. Efficiency and workflow: Beyond accuracy, AI offers gains in efficiency. By automating initial image review or triaging cases, AI can shorten time-to-diagnosis for urgent findings and reduce human workload. A majority of studies report reduced reading times or improved workflow with AI assistance in radiology (itnonline.com). Consistently, AI behaves as a tireless second reader that can screen normal cases quickly (with high negative predictive value) and alert clinicians to subtle abnormalities, thus mitigating fatigue-related misses. Interobserver variability: AI provides a standardized interpretation that can act as a reference point. This is especially valuable in subjective tasks like grading disease severity. For instance, in pathology and ophthalmology, AI's consistency helps reduce variability – the AI will output the same result given the same input, whereas human interpretations might differ. The prostate AI study showed the algorithm's tumor grading agreed with expert consensus nearly as well as experts agreed with each other (nature.com). Such consistency can improve overall diagnostic agreement when AI is used in conjunction with human readers. Despite these promising outcomes, there are several challenges and limitations to address. Generalizability: AI models can suffer performance degradation when deployed in populations or settings that differ from the training data. Factors like patient demographics, imaging equipment, or clinical prevalence can shift, leading to reduced accuracy. For example, an AI trained predominantly on lighter-skinned patients for melanoma detection may underperform on darker-skinned individuals (pewtrusts.org), potentially perpetuating health disparities. Similarly, algorithms developed at large academic centers may not immediately translate to smaller community hospitals with different patient populations and resources (pewtrusts.org). Ensuring diverse and representative training data, as well as performing external validation, is critical to guarantee consistent performance. Bias: AI can inherit biases present in training datasets. If certain groups are underrepresented or if surrogate markers (e.g., health care cost as a proxy for need) are used, the AI's recommendations might be skewed (pewtrusts.org, pewtrusts.org). Ongoing research in algorithmic fairness and techniques to debias training (or at least detect bias in outputs) is needed to ensure equitable diagnostic performance. Regulatory oversight: The regulatory framework for AI in medicine is evolving. Thus far, nearly all FDA-cleared imaging AI devices use "locked" algorithms – fixed models that do not change after deployment (pewtrusts.org). This ensures a stable performance profile but means the AI cannot adapt without a new approval. The FDA has recognized that traditional regulatory paradigms are not well-suited for adaptive, continuously-learning AI systems (fda.gov, fda.gov). In 2021, the FDA released an AI/ML-based Software as a Medical Device Action Plan outlining a potential path for approving adaptive algorithms and emphasizing the need for Good Machine Learning Practice in development (fda.gov). Future regulations will likely require rigorous post-market surveillance, transparency of algorithm updates, and possibly real-time performance monitoring to maintain safety and effectiveness as AI models evolve. Integration and training: Successful deployment of AI tools demands integration into clinical workflows (e.g., PACS systems for radiology, digital pathology systems) and training end-users to interpret AI outputs correctly. User trust is a factor – clinicians need to understand an AI's limitations and error modes to use it effectively. Furthermore, medicolegal and ethical questions persist: e.g., how to assign responsibility if an AI misses a diagnosis or if clinicians disagree with an AI recommendation. These will need clear guidelines as AI becomes more ingrained in practice.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />

        {/* Conclusion */}
        <Box sx={{ mb: 4 }}>
           <Typography variant="h5" component="h2" gutterBottom>Conclusion</Typography>
          <Typography variant="body1" paragraph>
            AI-assisted diagnostic imaging has progressed from concept to reality, with robust evidence demonstrating improvements in diagnostic performance and efficiency across radiology, pathology, ophthalmology, and gastroenterology. High-profile examples such as autonomous retinal screening for diabetic retinopathy and AI-guided colonoscopy have shown that AI can meet or exceed clinician benchmarks in sensitivity and specificity, while also reducing workload and interobserver variability. These technologies are poised to augment clinical decision-making – detecting subtle findings that may elude the human eye and standardizing care delivery. Nevertheless, realizing AI's full potential in healthcare will require careful attention to its limitations. Ensuring algorithms are trained and validated on diverse populations, mitigating bias, and establishing regulatory mechanisms for continuous algorithm improvement are paramount. With ongoing clinical trials and improving transparency of AI "black box" models, the medical community is learning how best to interface AI with expert judgment. In summary, AI in diagnostic imaging represents a significant step toward more precise, efficient, and accessible healthcare, but it must be implemented with rigor and oversight. Continued research, multi-center validation, and interdisciplinary collaboration (between clinicians, data scientists, and regulators) will be essential to safely harness AI's capabilities to improve patient outcomes.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />

        {/* References */}
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>References</Typography>
          <Typography variant="body2" component="div">
            <List dense disablePadding>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Abràmoff MD, Lavin PT, Birch M, Shah N, Folk JC. Pivotal trial of an autonomous AI-based diagnostic system for detection of diabetic retinopathy in primary care offices. NPJ Digital Medicine. 2018;1:39 (pmc.ncbi.nlm.nih.gov)." sx={{ m: 0 }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Lång K, et al. Artificial intelligence–supported mammography screening: evidence from a randomised trial (MASAI). Lancet Oncol. 2023;24(8):936-944 (itnonline.com)." sx={{ m: 0 }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="van Beek EJR, Ahn JS, Kim MJ, Murchison JT. Validation of a deep learning algorithm for detecting thoracic abnormalities on chest radiographs. Clin Radiol. 2023;78(1):1-7 (pubmed.ncbi.nlm.nih.gov)." sx={{ m: 0 }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Tolkach Y, Ovtcharov V, Pryalukhin A, et al. Artificial intelligence for prostate cancer detection and Gleason grading in biopsies: a multi-institutional validation. NPJ Precis Oncol. 2023;7:77 (nature.com, nature.com)." sx={{ m: 0 }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Repici A, Badalamenti M, Maselli R, et al. Efficacy of real-time computer-aided detection of colorectal neoplasia in a randomized trial. Gastroenterology. 2020;159(2):512–520.e7 (pmc.ncbi.nlm.nih.gov)." sx={{ m: 0 }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Hassan C, Spadaccini M, Iannone A, et al. Performance of artificial intelligence in colonoscopy for adenoma detection: systematic review and meta-analysis. Gastrointest Endosc. 2021;93(1):77–85.e6 (pmc.ncbi.nlm.nih.gov)." sx={{ m: 0 }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Pew Charitable Trusts. How FDA regulates artificial intelligence in medical products. Issue Brief, Aug 2021 (pewtrusts.org, pewtrusts.org)." sx={{ m: 0 }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Food and Drug Administration (FDA). Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device Action Plan. January 2021 (fda.gov)." sx={{ m: 0 }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Mori Y, Kudo SE, Misawa M, et al. Real-time AI identification diminutive polyps colonoscopy. Ann Intern Med. 2018;169(6):357–366." sx={{ m: 0 }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Steiner DF, Chen P-HC, Mermel CH, et al. Evaluation of a deep learning assistance system for digital pathology of lymph nodes. Am J Surg Pathol. 2018;42(6):828–833." sx={{ m: 0 }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Topol EJ. High-performance medicine: the convergence of human and artificial intelligence. Nature Medicine. 2019;25(1):44–56." sx={{ m: 0 }} /></ListItem>
            </List>
          </Typography>
        </Box>

      </Paper>
    </Container>
  );
}

export default ImagingAIWhitePaperPage; 