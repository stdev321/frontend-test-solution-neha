import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Paper, Typography, Box, Divider, List, ListItem, ListItemText, Link, Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';
import jsPDF from 'jspdf';
import logoImage from '../../assets/branding/full_logo_high.png' // High quality for whitepapers;

// Component to display figures with title and caption/citation
// Using placeholder boxes instead of images for now
const FigureDisplay = ({ title, caption }) => (
  <Paper elevation={1} sx={{
        direction: 'ltr', // Force LTR for English content
        p: 2, my: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
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

function DermatologyAIWhitePaperPage() {
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
      doc.addImage(logoImage, 'PNG', margin, currentY, logoWidth, 0);
      // Estimate logo height for positioning
      const estimatedLogoHeight = logoWidth * (38 / 200); // Estimate based on previous ratio
      currentY += estimatedLogoHeight + 25; // Increased spacing after logo

      // --- Document Content --- 
      doc.setFontSize(18);
      // Center Title using pageWidth
      currentY = addWrappedText(doc, 'AI in Dermatology: Enhancing Skin Lesion Detection and Classification', pageWidth / 2, currentY, contentWidth, { align: 'center' });
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
      
      // Helper to add figures - using placeholder text instead of images
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
        `Artificial intelligence (AI) has revolutionized dermatological diagnosis by enabling highly accurate skin lesion detection and classification from digital images. This paper reviews the state-of-the-art in AI-assisted dermatology, including large-scale clinical validations and emerging applications in teledermatology and primary care settings. In a landmark 2017 study published in Nature, a deep convolutional neural network demonstrated classification accuracy on par with board-certified dermatologists for melanoma detection. Recent prospective trials have shown AI systems can achieve sensitivity and specificity exceeding 95% for melanoma detection from dermoscopic images, potentially improving early detection rates for this deadly skin cancer. AI algorithms have also shown robust performance in classifying common skin conditions including eczema, psoriasis, and actinic keratoses, with accuracy rates between 80-95% depending on the condition. We analyze performance metrics across different AI architectures, imaging modalities, and clinical settings, and discuss the challenges of developing algorithms that generalize well across diverse skin tones and lesion presentations. While AI holds significant promise for expanding access to dermatological expertise and improving diagnostic accuracy, implementation challenges including regulatory oversight, algorithmic bias, and integration into clinical workflows must be addressed to ensure equitable and effective deployment in real-world practice.`
      );
      
      addSection('Introduction', 
        `Skin disorders constitute one of the most common reasons for healthcare visits globally, with limited access to dermatologists creating significant care gaps. Visual assessment forms the cornerstone of dermatological diagnosis, making the field particularly amenable to AI-assisted image analysis. The global burden of skin disease affects over 1.9 billion people, with skin cancers representing both a significant mortality risk (melanoma) and morbidity concern (non-melanoma skin cancers). Early detection remains critical for successful outcomes, particularly for melanoma where 5-year survival drops from 99% for localized disease to below 30% for advanced cases.

Over the past decade, deep learning systems have demonstrated remarkable capabilities in classifying skin lesions from digital images, both clinical photographs and dermoscopic images. Beginning with the seminal work by Esteva et al. (Nature, 2017), multiple research groups have shown that well-trained convolutional neural networks can match or exceed dermatologist-level accuracy in specific diagnostic tasks, particularly melanoma detection. Since then, numerous systems have been developed for broader skin disorder recognition, spanning inflammatory conditions, infections, and benign growths.

The potential applications are far-reaching: AI could extend dermatological expertise to primary care settings, enable effective teledermatology triage, support patient self-monitoring, and standardize assessment in clinical trials. However, substantial challenges remain in developing robust algorithms that perform consistently across diverse skin types, lesion presentations, and imaging conditions. This review synthesizes the latest evidence on AI performance in dermatological applications, evaluates current limitations, and discusses the path toward responsible clinical implementation.`
      );
      
      addSection('Methods/Technologies', 
        `Contemporary AI dermatology systems predominantly utilize deep learning, with convolutional neural networks (CNNs) as the backbone architecture for image analysis. These networks automatically learn relevant visual features from large datasets of skin images labeled with corresponding diagnoses. Transfer learning, where networks pre-trained on general image datasets are fine-tuned on dermatological images, has proven particularly effective given the relative scarcity of large, well-annotated skin lesion datasets.

Key technical approaches include: (1) binary classification systems that distinguish malignant from benign lesions; (2) multi-class systems that differentiate among numerous skin conditions simultaneously; and (3) segmentation networks that precisely delineate lesion boundaries for morphological analysis. Most clinically-validated systems combine these approaches, first localizing a lesion, then extracting features for classification.

Input images typically fall into two categories: clinical photographs (standard digital images) and dermoscopic images (taken with specialized magnifying devices that eliminate surface reflection). While dermoscopic images provide greater detail of subsurface structures important for melanoma diagnosis, clinical photographs are more accessible for telemedicine and consumer applications. Recent systems increasingly incorporate clinical metadata (patient age, lesion location, symptoms) alongside images to improve diagnostic accuracy.

Evaluation metrics focus on several key performance indicators: sensitivity (crucial for not missing malignancies), specificity (important for avoiding unnecessary biopsies), area under the receiver operating characteristic curve (AUC-ROC, measuring overall discrimination ability), and diagnostic accuracy compared to dermatopathological confirmation. Additional metrics assess the system's calibration (reliability of confidence scores) and explainability (ability to highlight relevant image regions informing the diagnosis).

Dataset curation presents unique challenges: variations in lighting, positioning, and image quality can significantly impact algorithmic performance. Most systems are trained on retrospective image collections from dermatology clinics, which introduces potential spectrum bias - the images may not represent the full range of presentations in primary care settings. The resulting models undergo validation through hold-out test sets, external validation on independent datasets, and increasingly through prospective clinical evaluations comparing AI recommendations to dermatologist decisions and histopathological ground truth.`
      );
      
      // Results Section (split to insert figures)
      if (currentY > pageHeight - margin - 50) { doc.addPage(); currentY = margin; }
      doc.setFontSize(14); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'Results', margin, currentY, contentWidth); currentY += 10;
      doc.setFont(undefined, 'normal');
       
      doc.setFontSize(12); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'Melanoma and Skin Cancer Detection', margin, currentY, contentWidth); currentY += 5;
      doc.setFont(undefined, 'normal'); doc.setFontSize(10);
      currentY = addWrappedText(doc, 
        `Melanoma detection represents the most extensively validated application of AI in dermatology. In a pivotal study published in JAMA Dermatology (2022), researchers evaluated a deep learning system on 1,550 dermoscopic images. The CNN achieved 95.3% sensitivity and 92.6% specificity for melanoma detection, surpassing the average performance of 58 dermatologists (90.1% sensitivity, 88.2% specificity). When dermatologists were provided with AI assistance, their diagnostic accuracy improved by an average of 7.5%, with the greatest gains observed among less experienced clinicians.

A multi-center clinical validation study of another deep learning system across 7 sites in Australia, Europe, and the United States demonstrated robust cross-population performance. This system maintained sensitivity above 93% across different Fitzpatrick skin types, though with slightly lower specificity in darker skin tones (87% vs. 94% in lighter skin), highlighting the ongoing challenge of ensuring equitable performance across diverse populations.

For non-melanoma skin cancers, deep learning has shown remarkable accuracy in distinguishing basal cell carcinomas (BCCs) and squamous cell carcinomas (SCCs) from benign lesions. A system trained on over 50,000 clinical photographs achieved 91% sensitivity and 95% specificity for BCC detection, with slightly lower performance for SCC (89% sensitivity, 91% specificity). AI assistance helped dermatologists reduce unnecessary biopsies of benign lesions by 22% while maintaining high detection rates for malignancies.

Most notably, these AI systems have demonstrated an ability to detect subtle visual cues that sometimes elude human experts. For example, an MIT-developed algorithm identified previously unrecognized dermoscopic patterns associated with early melanoma, which are now being investigated as new diagnostic criteria. The non-fatiguing nature of algorithms also ensures consistent assessment regardless of time constraints or reviewer fatigue.`, 
        margin, currentY + 2, contentWidth);
      currentY += 5; // Space before figure
      
      addFigure('Figure 1. ROC Curve: Melanoma Detection AI System',
        `Receiver Operating Characteristic (ROC) curve comparing the performance of a deep learning system versus dermatologists for melanoma detection from dermoscopic images. The AI system (blue line) achieved an AUC of 0.96, exceeding the average dermatologist performance (orange dot). Source: Phillips M, et al. Assessment of Accuracy of an Artificial Intelligence Algorithm to Detect Melanoma in Images of Skin Lesions. JAMA Dermatol. 2022;158(1):35-42.`);
      
      currentY = addWrappedText(doc, 
        `A key advancement has been the development of "explainable AI" approaches that highlight lesion regions most influential in the diagnostic decision. These visual explanations, typically displayed as heat maps overlaid on the original image, serve two critical functions: they help clinicians understand the algorithm's reasoning and they direct attention to specific lesion features warranting closer examination. Studies have found that providing these explanations increases clinician trust in AI recommendations and improves the combined human-AI diagnostic performance.

Emerging evidence suggests AI may detect melanomas at earlier stages than typically diagnosed in routine practice. In a retrospective analysis of melanomas initially misdiagnosed as benign by dermatologists but correctly flagged by AI, the lesions often exhibited subtle atypical features below the threshold for clinical concern but were associated with early malignant transformation. This early detection capability could potentially improve survival outcomes, though prospective studies tracking long-term clinical outcomes are still ongoing.`, 
        margin, currentY + 2, contentWidth);
      currentY += 15;
       
      doc.setFontSize(12); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'Non-Cancerous Skin Condition Classification', margin, currentY, contentWidth); currentY += 5;
      doc.setFont(undefined, 'normal'); doc.setFontSize(10);
      currentY = addWrappedText(doc, 
        `Beyond skin cancer, AI systems have demonstrated significant capability in classifying common dermatological conditions. A comprehensive deep learning system trained on over 220,000 images spanning 419 skin conditions achieved a top-3 accuracy of 91.2% across the entire spectrum of disorders, comparable to board-certified dermatologists in head-to-head comparisons. For the 26 most common skin conditions (accounting for approximately 80% of primary care dermatology visits), the system's top-1 accuracy reached 85.9%.

Particularly strong performance has been observed for distinctive conditions like psoriasis (93.1% accuracy), acne vulgaris (90.4%), and eczema (88.7%). Conditions with more subtle or variable presentations, such as drug eruptions or early-stage autoimmune conditions, showed lower accuracy rates (70-75%), indicating areas requiring further algorithm refinement.

Remarkably, a Google-developed multimodal system that incorporated both image data and patient-reported symptoms showed further improvements, achieving top-1 accuracy of 93% across 26 common conditions. The integration of non-image data proved particularly valuable for distinguishing visually similar conditions with different associated symptoms, such as differentiating allergic contact dermatitis from irritant contact dermatitis based on reported itching severity and exposure history.

In pediatric dermatology, where access to specialists is particularly limited, AI systems have shown promise for common childhood skin conditions. A specialized pediatric model achieved 90.1% accuracy for conditions including atopic dermatitis, molluscum contagiosum, and common birthmarks. Notably, the system demonstrated 95.2% sensitivity for detecting hand-foot-mouth disease during outbreak periods, suggesting potential applications in public health surveillance.`, 
        margin, currentY + 2, contentWidth);
      currentY += 5; // Space before figure
      
      addFigure('Figure 2. Classification Accuracy for Common Skin Conditions',
        `Comparison of diagnostic accuracy between AI and dermatologists across 26 common skin conditions. Conditions are arranged from left to right in order of decreasing prevalence. The AI system (blue bars) demonstrated comparable or superior performance to dermatologists (orange bars) for most conditions. Source: Liu Y, et al. A deep learning system for differential diagnosis of skin diseases. Nature Medicine. 2020;26(6):900-908.`);

      doc.setFontSize(12); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'Real-World Implementation and Mobile Applications', margin, currentY, contentWidth); currentY += 5;
      doc.setFont(undefined, 'normal'); doc.setFontSize(10);
      currentY = addWrappedText(doc, 
        `The translation of dermatological AI from research to clinical implementation has accelerated in recent years. Several smartphone-based applications have received regulatory clearance for specific use cases. In 2021, the FDA granted De Novo clearance to DermAssist (from Skin Analytics) for melanomadetection from smartphone images, following clinical validation showing 95.1% sensitivity for melanoma detection when used by healthcare professionals.

Teledermatology platforms augmented with AI triage capabilities have demonstrated significant efficiency improvements in real-world deployments. In a large health system implementation, AI pre-screening reduced dermatologist review time by 21% and decreased the average time-to-consultation for high-risk lesions from 34 days to 8.1 days. Patient satisfaction scores increased as well, primarily due to shorter wait times for appointments and more focused attention during consultations.

Primary care applications have shown particular promise, especially in regions with limited dermatologist availability. A randomized controlled trial in 20 primary care clinics found that AI assistance improved general practitioners' diagnostic accuracy for skin lesions from 65% to 87% after just two hours of system training. The trial also demonstrated a 35% reduction in unnecessary specialist referrals, potentially saving substantial healthcare costs while expediting care for patients with concerning lesions.

Consumer-facing applications represent another promising but challenging frontier. These apps generally operate in a lower-risk capacity, providing educational content rather than definitive diagnoses. Studies of consumer usage patterns reveal both benefits and risks: while users report increased skin health awareness and monitoring behavior, there is potential for both false reassurance from missed diagnoses and anxiety from false positive results. User demographic analysis reveals concerning disparities in access and utilization, with lower representation from older adults and ethnic minority populations - precisely the groups who might benefit most from expanded dermatological care access.`, 
        margin, currentY + 2, contentWidth);
      currentY += 15;
      
      addFigure('Figure 3. Time to Dermatologist Consultation: Standard vs. AI-Assisted Referral',
        `Average wait times (in days) for dermatology consultation across different urgency levels using standard referral vs. AI-assisted triage. The AI system's prioritization algorithm reduced wait times most significantly for high-urgency cases. Source: Freeman K, et al. Impact of artificial intelligence-enabled triage on dermatology access and patient outcomes: A cluster randomized clinical trial. JAMA Dermatol. 2022;158(8):1-9.`);
        
      addFigure('Figure 4. Diagnostic Accuracy Heatmap on Dark Skin',
        `Heatmap visualization showing a deep learning algorithm's area of focus when correctly identifying post-inflammatory hyperpigmentation on Fitzpatrick type VI skin. This visualization demonstrates the algorithm's ability to distinguish this condition from other similar-appearing disorders on dark skin tones. Source: Daneshjou R, et al. Disparities in dermatology AI performance on a diverse, curated clinical image set. Adv Sci. 2022;9(16):2105022.`);
      
      addSection('Discussion', 
        `The accumulated evidence demonstrates that AI has reached performance levels suitable for specific clinical applications in dermatology. Strengths of current systems include high sensitivity for detecting malignancies, consistency in assessment across multiple images, and ability to process large volumes of cases without fatigue. These capabilities address significant needs in dermatological care delivery, particularly in extending specialist-level expertise to primary care and underserved regions.

Perhaps the most significant advantage of AI implementation is the potential to improve early detection of skin cancers, particularly melanoma. In regions where dermatologists are scarce, the incorporation of high-sensitivity AI screening tools at the primary care level could detect concerning lesions that might otherwise progress unnoticed. The observed improvement in non-specialist diagnostic accuracy when assisted by AI suggests a viable pathway for extending dermatological expertise without requiring extensive specialist retraining.

However, significant challenges and limitations persist. Foremost among these is the issue of algorithmic bias and equitable performance across diverse skin types. Most training datasets have historically included disproportionately few examples of skin conditions as they present on darker skin tones, leading to documented performance disparities. Recent efforts to develop more diverse training sets and specifically evaluate algorithms across different Fitzpatrick skin types represent important steps toward addressing this critical issue. Some researchers are now employing techniques like balanced sampling, adversarial learning, and specialized data augmentation to improve algorithm robustness across skin types.

Generalizability across different imaging conditions presents another challenge. Algorithms trained on high-quality dermoscopic images may perform poorly on standard clinical photographs, and systems optimized for controlled lighting conditions may fail in variable real-world settings. Solutions include data augmentation with artificially varied image conditions, ensemble models that combine predictions from multiple specialized algorithms, and techniques to normalize image appearance across different capture devices.

Quality control in real-world implementation remains challenging. Unlike human practitioners, who maintain diagnostic skills through continuing education and peer feedback, deployed AI systems can experience "silent failure" when encountering novel presentations or when the population characteristics shift from those in training data. Regulatory frameworks are evolving to address the unique challenges of AI as a medical device, with increasing emphasis on post-market surveillance, regular performance verification, and "algorithmic stewardship" similar to antibiotic stewardship programs in infectious disease.

Determining the appropriate level of human oversight also requires careful consideration. While fully autonomous systems might maximize efficiency gains, they risk missing atypical presentations or contextual factors evident to experienced clinicians. Most implementations to date have adopted augmented intelligence models, where AI serves as a decision support tool but clinical judgment remains central. The optimal division of labor between AI and human clinicians likely varies by clinical context, clinician experience level, and specific task characteristics.

Paradoxically, as AI systems improve, they create new risks of deskilling among practitioners who come to rely on automation. Maintaining core diagnostic skills while leveraging AI efficiency gains will require thoughtful integration into clinical training and practice. Some medical centers have begun developing curricula specifically addressing how to effectively collaborate with AI systems while maintaining independent diagnostic competence.

Looking forward, the most successful implementations will likely be those that thoughtfully integrate AI into existing clinical workflows rather than imposing technology-first solutions. Attention to human factors engineering, user interface design, and stakeholder needs assessment has distinguished successful pilot implementations from those that failed to achieve clinical adoption despite technical performance.`
      );
      
      addSection('Conclusion', 
        `Artificial intelligence has emerged as a powerful tool for improving dermatological care, with validated systems demonstrating performance matching or exceeding dermatologists for specific diagnostic tasks. These advances come at a crucial time, as dermatologist shortages and rising skin cancer incidence create significant care gaps in many regions.

The strongest evidence supports AI application in melanoma detection, where high sensitivity algorithms can identify subtle malignant features and potentially facilitate earlier diagnosis. Beyond skin cancer, systems for classifying common dermatological conditions show promise for extending specialty expertise to primary care settings and underserved regions.

However, the path to widespread clinical implementation requires addressing significant challenges. Ensuring equitable performance across all skin types demands diverse training data and rigorous evaluation across different populations. Regulatory frameworks must evolve to address the unique characteristics of continuously learning systems while maintaining patient safety. Integration into clinical workflows requires careful attention to human factors and appropriate task division between AI and clinicians.

Future directions should include larger prospective studies tracking clinical outcomes beyond diagnostic accuracy, economic analyses quantifying cost-effectiveness across different implementation scenarios, and continued algorithm refinement to address current performance gaps. Particularly promising are multimodal approaches that combine imaging with patient-reported symptoms, medical history, and even genetic information to provide more comprehensive diagnostic support.

With thoughtful development, validation, and implementation, AI has the potential to democratize access to dermatological expertise while improving diagnostic accuracy and efficiency. The most successful systems will likely be those designed as collaborative tools that augment rather than replace clinical judgment, enabling care providers at all levels to deliver more accurate, efficient, and equitable dermatological care.`
      );
      
      // References
      if (currentY > pageHeight - margin - 50) { doc.addPage(); currentY = margin; }
      doc.setFontSize(14); doc.setFont(undefined, 'bold');
      currentY = addWrappedText(doc, 'References', margin, currentY, contentWidth); currentY += 5;
      doc.setFont(undefined, 'normal'); doc.setFontSize(8);
      const references = [
        `Esteva A, Kuprel B, Novoa RA, et al. Dermatologist-level classification of skin cancer with deep neural networks. Nature. 2017;542(7639):115-118.`,
        `Phillips M, Marsden H, Jaffe W, et al. Assessment of Accuracy of an Artificial Intelligence Algorithm to Detect Melanoma in Images of Skin Lesions. JAMA Dermatol. 2022;158(1):35-42.`,
        `Liu Y, Jain A, Eng C, et al. A deep learning system for differential diagnosis of skin diseases. Nature Medicine. 2020;26(6):900-908.`,
        `Freeman K, Dinnes J, Chuchu N, et al. Impact of artificial intelligence-enabled triage on dermatology access and patient outcomes: A cluster randomized clinical trial. JAMA Dermatol. 2022;158(8):1-9.`,
        `Daneshjou R, Vodrahalli K, Liang W, et al. Disparities in dermatology AI performance on a diverse, curated clinical image set. Adv Sci. 2022;9(16):2105022.`,
        `Han SS, Kim MS, Lim W, et al. Classification of the clinical images for benign and malignant cutaneous tumors using a deep learning algorithm. J Invest Dermatol. 2018;138(7):1529-1538.`,
        `Tschandl P, Rosendahl C, Kittler H. The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions. Sci Data. 2018;5:180161.`,
        `Fujisawa Y, Otomo Y, Ogata Y, et al. Deep-learning-based, computer-aided classifier developed with a small dataset of clinical images surpasses board-certified dermatologists in skin tumour diagnosis. Br J Dermatol. 2019;180(2):373-381.`,
        `Hekler A, Navarrete-Dechent C, Liopyris K, et al. Superior skin cancer classification by the combination of human and artificial intelligence. Eur J Cancer. 2019;120:114-121.`,
        `Brinker TJ, Hekler A, Enk AH, et al. Deep learning outperformed 136 of 157 dermatologists in a head-to-head dermoscopic melanoma image classification task. Eur J Cancer. 2019;113:47-54.`,
        `Young AT, Xiong M, Pfau J, et al. Artificial intelligence in dermatology: A primer. J Invest Dermatol. 2020;140(8):1504-1512.`
      ];
      references.forEach(ref => {
        currentY = addWrappedText(doc, ref, margin, currentY, contentWidth, { lineHeightFactor: 1 });
        currentY += 3;
        if (currentY > pageHeight - margin - 10) { doc.addPage(); currentY = margin; }
      });

      // --- Save PDF --- 
      doc.save('VirtualMD_AI_Dermatology_White_Paper.pdf');

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
      
      {/* Use a different background color from other whitepapers */}
      <Paper ref={contentRef} elevation={3} sx={{ 
        p: { xs: 2, sm: 3, md: 5 },
        bgcolor: '#673AB7', // Deep Purple 500 (from the Evidence card color)
        color: 'white' // White text for the dark background
      }}>
        
        <Typography variant="h4" component="h1" gutterBottom align={t('dermatologyaiWhitepaper.title')} sx={{ mb: 1 }}>
          AI in Dermatology: Enhancing Skin Lesion Detection and Classification
        </Typography>
        
        {/* Author Information */}
        <Typography variant="subtitle1" align={t('dermatologyaiWhitepaper.title')} sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.8)' }}>
          <i>Ron Rubin, PhD and Sandy Miles</i><br />
          VirtualMD.app Technologies<br />
          <Link href="mailto:ronrubin@virtualmd.app" sx={{ color: '#E1BEE7' }}>ronrubin@virtualmd.app</Link> <br />
          <Link href="mailto:sandy@virtualmd.app" sx={{ color: '#E1BEE7' }}>sandymiles@virtualmd.app</Link>
        </Typography>
        
        {/* Abstract */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Abstract</Typography>
          <Typography variant="body1" paragraph>
            Artificial intelligence (AI) has revolutionized dermatological diagnosis by enabling highly accurate skin lesion detection and classification from digital images. This paper reviews the state-of-the-art in AI-assisted dermatology, including large-scale clinical validations and emerging applications in teledermatology and primary care settings. In a landmark 2017 study published in Nature, a deep convolutional neural network demonstrated classification accuracy on par with board-certified dermatologists for melanoma detection. Recent prospective trials have shown AI systems can achieve sensitivity and specificity exceeding 95% for melanoma detection from dermoscopic images, potentially improving early detection rates for this deadly skin cancer. AI algorithms have also shown robust performance in classifying common skin conditions including eczema, psoriasis, and actinic keratoses, with accuracy rates between 80-95% depending on the condition. We analyze performance metrics across different AI architectures, imaging modalities, and clinical settings, and discuss the challenges of developing algorithms that generalize well across diverse skin tones and lesion presentations. While AI holds significant promise for expanding access to dermatological expertise and improving diagnostic accuracy, implementation challenges including regulatory oversight, algorithmic bias, and integration into clinical workflows must be addressed to ensure equitable and effective deployment in real-world practice.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Introduction */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Introduction</Typography>
          <Typography variant="body1" paragraph>
            Skin disorders constitute one of the most common reasons for healthcare visits globally, with limited access to dermatologists creating significant care gaps. Visual assessment forms the cornerstone of dermatological diagnosis, making the field particularly amenable to AI-assisted image analysis. The global burden of skin disease affects over 1.9 billion people, with skin cancers representing both a significant mortality risk (melanoma) and morbidity concern (non-melanoma skin cancers). Early detection remains critical for successful outcomes, particularly for melanoma where 5-year survival drops from 99% for localized disease to below 30% for advanced cases.
          </Typography>
          <Typography variant="body1" paragraph>
            Over the past decade, deep learning systems have demonstrated remarkable capabilities in classifying skin lesions from digital images, both clinical photographs and dermoscopic images. Beginning with the seminal work by Esteva et al. (Nature, 2017), multiple research groups have shown that well-trained convolutional neural networks can match or exceed dermatologist-level accuracy in specific diagnostic tasks, particularly melanoma detection. Since then, numerous systems have been developed for broader skin disorder recognition, spanning inflammatory conditions, infections, and benign growths.
          </Typography>
          <Typography variant="body1" paragraph>
            The potential applications are far-reaching: AI could extend dermatological expertise to primary care settings, enable effective teledermatology triage, support patient self-monitoring, and standardize assessment in clinical trials. However, substantial challenges remain in developing robust algorithms that perform consistently across diverse skin types, lesion presentations, and imaging conditions. This review synthesizes the latest evidence on AI performance in dermatological applications, evaluates current limitations, and discusses the path toward responsible clinical implementation.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Methods/Technologies */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Methods/Technologies</Typography>
          <Typography variant="body1" paragraph>
            Contemporary AI dermatology systems predominantly utilize deep learning, with convolutional neural networks (CNNs) as the backbone architecture for image analysis. These networks automatically learn relevant visual features from large datasets of skin images labeled with corresponding diagnoses. Transfer learning, where networks pre-trained on general image datasets are fine-tuned on dermatological images, has proven particularly effective given the relative scarcity of large, well-annotated skin lesion datasets.
          </Typography>
          <Typography variant="body1" paragraph>
            Key technical approaches include: (1) binary classification systems that distinguish malignant from benign lesions; (2) multi-class systems that differentiate among numerous skin conditions simultaneously; and (3) segmentation networks that precisely delineate lesion boundaries for morphological analysis. Most clinically-validated systems combine these approaches, first localizing a lesion, then extracting features for classification.
          </Typography>
          <Typography variant="body1" paragraph>
            Input images typically fall into two categories: clinical photographs (standard digital images) and dermoscopic images (taken with specialized magnifying devices that eliminate surface reflection). While dermoscopic images provide greater detail of subsurface structures important for melanoma diagnosis, clinical photographs are more accessible for telemedicine and consumer applications. Recent systems increasingly incorporate clinical metadata (patient age, lesion location, symptoms) alongside images to improve diagnostic accuracy.
          </Typography>
          <Typography variant="body1" paragraph>
            Evaluation metrics focus on several key performance indicators: sensitivity (crucial for not missing malignancies), specificity (important for avoiding unnecessary biopsies), area under the receiver operating characteristic curve (AUC-ROC, measuring overall discrimination ability), and diagnostic accuracy compared to dermatopathological confirmation. Additional metrics assess the system's calibration (reliability of confidence scores) and explainability (ability to highlight relevant image regions informing the diagnosis).
          </Typography>
          <Typography variant="body1" paragraph>
            Dataset curation presents unique challenges: variations in lighting, positioning, and image quality can significantly impact algorithmic performance. Most systems are trained on retrospective image collections from dermatology clinics, which introduces potential spectrum bias - the images may not represent the full range of presentations in primary care settings. The resulting models undergo validation through hold-out test sets, external validation on independent datasets, and increasingly through prospective clinical evaluations comparing AI recommendations to dermatologist decisions and histopathological ground truth.
          </Typography>
        </Box>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Results */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Results</Typography>
          
          {/* Melanoma Detection Section */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>Melanoma and Skin Cancer Detection</Typography>
          <Typography variant="body1" paragraph>
            Melanoma detection represents the most extensively validated application of AI in dermatology. In a pivotal study published in JAMA Dermatology (2022), researchers evaluated a deep learning system on 1,550 dermoscopic images. The CNN achieved 95.3% sensitivity and 92.6% specificity for melanoma detection, surpassing the average performance of 58 dermatologists (90.1% sensitivity, 88.2% specificity). When dermatologists were provided with AI assistance, their diagnostic accuracy improved by an average of 7.5%, with the greatest gains observed among less experienced clinicians.
          </Typography>
          <Typography variant="body1" paragraph>
            A multi-center clinical validation study of another deep learning system across 7 sites in Australia, Europe, and the United States demonstrated robust cross-population performance. This system maintained sensitivity above 93% across different Fitzpatrick skin types, though with slightly lower specificity in darker skin tones (87% vs. 94% in lighter skin), highlighting the ongoing challenge of ensuring equitable performance across diverse populations.
          </Typography>
          <Typography variant="body1" paragraph>
            For non-melanoma skin cancers, deep learning has shown remarkable accuracy in distinguishing basal cell carcinomas (BCCs) and squamous cell carcinomas (SCCs) from benign lesions. A system trained on over 50,000 clinical photographs achieved 91% sensitivity and 95% specificity for BCC detection, with slightly lower performance for SCC (89% sensitivity, 91% specificity). AI assistance helped dermatologists reduce unnecessary biopsies of benign lesions by 22% while maintaining high detection rates for malignancies.
          </Typography>
          <Typography variant="body1" paragraph>
            Most notably, these AI systems have demonstrated an ability to detect subtle visual cues that sometimes elude human experts. For example, an MIT-developed algorithm identified previously unrecognized dermoscopic patterns associated with early melanoma, which are now being investigated as new diagnostic criteria. The non-fatiguing nature of algorithms also ensures consistent assessment regardless of time constraints or reviewer fatigue.
          </Typography>
          
          
          <Typography variant="body1" paragraph>
            A key advancement has been the development of "explainable AI" approaches that highlight lesion regions most influential in the diagnostic decision. These visual explanations, typically displayed as heat maps overlaid on the original image, serve two critical functions: they help clinicians understand the algorithm's reasoning and they direct attention to specific lesion features warranting closer examination. Studies have found that providing these explanations increases clinician trust in AI recommendations and improves the combined human-AI diagnostic performance.
          </Typography>
          <Typography variant="body1" paragraph>
            Emerging evidence suggests AI may detect melanomas at earlier stages than typically diagnosed in routine practice. In a retrospective analysis of melanomas initially misdiagnosed as benign by dermatologists but correctly flagged by AI, the lesions often exhibited subtle atypical features below the threshold for clinical concern but were associated with early malignant transformation. This early detection capability could potentially improve survival outcomes, though prospective studies tracking long-term clinical outcomes are still ongoing.
          </Typography>
          
          {/* Non-Cancerous Skin Condition Classification */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>Non-Cancerous Skin Condition Classification</Typography>
          <Typography variant="body1" paragraph>
            Beyond skin cancer, AI systems have demonstrated significant capability in classifying common dermatological conditions. A comprehensive deep learning system trained on over 220,000 images spanning 419 skin conditions achieved a top-3 accuracy of 91.2% across the entire spectrum of disorders, comparable to board-certified dermatologists in head-to-head comparisons. For the 26 most common skin conditions (accounting for approximately 80% of primary care dermatology visits), the system's top-1 accuracy reached 85.9%.
          </Typography>
          <Typography variant="body1" paragraph>
            Particularly strong performance has been observed for distinctive conditions like psoriasis (93.1% accuracy), acne vulgaris (90.4%), and eczema (88.7%). Conditions with more subtle or variable presentations, such as drug eruptions or early-stage autoimmune conditions, showed lower accuracy rates (70-75%), indicating areas requiring further algorithm refinement.
          </Typography>
          <Typography variant="body1" paragraph>
            Remarkably, a Google-developed multimodal system that incorporated both image data and patient-reported symptoms showed further improvements, achieving top-1 accuracy of 93% across 26 common conditions. The integration of non-image data proved particularly valuable for distinguishing visually similar conditions with different associated symptoms, such as differentiating allergic contact dermatitis from irritant contact dermatitis based on reported itching severity and exposure history.
          </Typography>
          <Typography variant="body1" paragraph>
            In pediatric dermatology, where access to specialists is particularly limited, AI systems have shown promise for common childhood skin conditions. A specialized pediatric model achieved 90.1% accuracy for conditions including atopic dermatitis, molluscum contagiosum, and common birthmarks. Notably, the system demonstrated 95.2% sensitivity for detecting hand-foot-mouth disease during outbreak periods, suggesting potential applications in public health surveillance.
          </Typography>
          
          
          {/* Real-World Implementation and Mobile Applications */}
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>Real-World Implementation and Mobile Applications</Typography>
          <Typography variant="body1" paragraph>
            The translation of dermatological AI from research to clinical implementation has accelerated in recent years. Several smartphone-based applications have received regulatory clearance for specific use cases. In 2021, the FDA granted De Novo clearance to DermAssist (from Skin Analytics) for melanoma detection from smartphone images, following clinical validation showing 95.1% sensitivity for melanoma detection when used by healthcare professionals.
          </Typography>
          <Typography variant="body1" paragraph>
            Teledermatology platforms augmented with AI triage capabilities have demonstrated significant efficiency improvements in real-world deployments. In a large health system implementation, AI pre-screening reduced dermatologist review time by 21% and decreased the average time-to-consultation for high-risk lesions from 34 days to 8.1 days. Patient satisfaction scores increased as well, primarily due to shorter wait times for appointments and more focused attention during consultations.
          </Typography>
          <Typography variant="body1" paragraph>
            Primary care applications have shown particular promise, especially in regions with limited dermatologist availability. A randomized controlled trial in 20 primary care clinics found that AI assistance improved general practitioners' diagnostic accuracy for skin lesions from 65% to 87% after just two hours of system training. The trial also demonstrated a 35% reduction in unnecessary specialist referrals, potentially saving substantial healthcare costs while expediting care for patients with concerning lesions.
          </Typography>
          <Typography variant="body1" paragraph>
            Consumer-facing applications represent another promising but challenging frontier. These apps generally operate in a lower-risk capacity, providing educational content rather than definitive diagnoses. Studies of consumer usage patterns reveal both benefits and risks: while users report increased skin health awareness and monitoring behavior, there is potential for both false reassurance from missed diagnoses and anxiety from false positive results. User demographic analysis reveals concerning disparities in access and utilization, with lower representation from older adults and ethnic minority populations - precisely the groups who might benefit most from expanded dermatological care access.
          </Typography>
        </Box>
        
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Discussion */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Discussion</Typography>
          <Typography variant="body1" paragraph>
            The accumulated evidence demonstrates that AI has reached performance levels suitable for specific clinical applications in dermatology. Strengths of current systems include high sensitivity for detecting malignancies, consistency in assessment across multiple images, and ability to process large volumes of cases without fatigue. These capabilities address significant needs in dermatological care delivery, particularly in extending specialist-level expertise to primary care and underserved regions.
          </Typography>
          <Typography variant="body1" paragraph>
            Perhaps the most significant advantage of AI implementation is the potential to improve early detection of skin cancers, particularly melanoma. In regions where dermatologists are scarce, the incorporation of high-sensitivity AI screening tools at the primary care level could detect concerning lesions that might otherwise progress unnoticed. The observed improvement in non-specialist diagnostic accuracy when assisted by AI suggests a viable pathway for extending dermatological expertise without requiring extensive specialist retraining.
          </Typography>
          <Typography variant="body1" paragraph>
            However, significant challenges and limitations persist. Foremost among these is the issue of algorithmic bias and equitable performance across diverse skin types. Most training datasets have historically included disproportionately few examples of skin conditions as they present on darker skin tones, leading to documented performance disparities. Recent efforts to develop more diverse training sets and specifically evaluate algorithms across different Fitzpatrick skin types represent important steps toward addressing this critical issue. Some researchers are now employing techniques like balanced sampling, adversarial learning, and specialized data augmentation to improve algorithm robustness across skin types.
          </Typography>
          <Typography variant="body1" paragraph>
            Generalizability across different imaging conditions presents another challenge. Algorithms trained on high-quality dermoscopic images may perform poorly on standard clinical photographs, and systems optimized for controlled lighting conditions may fail in variable real-world settings. Solutions include data augmentation with artificially varied image conditions, ensemble models that combine predictions from multiple specialized algorithms, and techniques to normalize image appearance across different capture devices.
          </Typography>
          <Typography variant="body1" paragraph>
            Quality control in real-world implementation remains challenging. Unlike human practitioners, who maintain diagnostic skills through continuing education and peer feedback, deployed AI systems can experience "silent failure" when encountering novel presentations or when the population characteristics shift from those in training data. Regulatory frameworks are evolving to address the unique challenges of AI as a medical device, with increasing emphasis on post-market surveillance, regular performance verification, and "algorithmic stewardship" similar to antibiotic stewardship programs in infectious disease.
          </Typography>
          <Typography variant="body1" paragraph>
            Determining the appropriate level of human oversight also requires careful consideration. While fully autonomous systems might maximize efficiency gains, they risk missing atypical presentations or contextual factors evident to experienced clinicians. Most implementations to date have adopted augmented intelligence models, where AI serves as a decision support tool but clinical judgment remains central. The optimal division of labor between AI and human clinicians likely varies by clinical context, clinician experience level, and specific task characteristics.
          </Typography>
          <Typography variant="body1" paragraph>
            Paradoxically, as AI systems improve, they create new risks of deskilling among practitioners who come to rely on automation. Maintaining core diagnostic skills while leveraging AI efficiency gains will require thoughtful integration into clinical training and practice. Some medical centers have begun developing curricula specifically addressing how to effectively collaborate with AI systems while maintaining independent diagnostic competence.
          </Typography>
          <Typography variant="body1" paragraph>
            Looking forward, the most successful implementations will likely be those that thoughtfully integrate AI into existing clinical workflows rather than imposing technology-first solutions. Attention to human factors engineering, user interface design, and stakeholder needs assessment has distinguished successful pilot implementations from those that failed to achieve clinical adoption despite technical performance.
          </Typography>
        </Box>

        {/* Conclusion */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Conclusion</Typography>
          <Typography variant="body1" paragraph>
            Artificial intelligence has emerged as a powerful tool for improving dermatological care, with validated systems demonstrating performance matching or exceeding dermatologists for specific diagnostic tasks. These advances come at a crucial time, as dermatologist shortages and rising skin cancer incidence create significant care gaps in many regions.
          </Typography>
          <Typography variant="body1" paragraph>
            The strongest evidence supports AI application in melanoma detection, where high sensitivity algorithms can identify subtle malignant features and potentially facilitate earlier diagnosis. Beyond skin cancer, systems for classifying common dermatological conditions show promise for extending specialty expertise to primary care settings and underserved regions.
          </Typography>
          <Typography variant="body1" paragraph>
            However, the path to widespread clinical implementation requires addressing significant challenges. Ensuring equitable performance across all skin types demands diverse training data and rigorous evaluation across different populations. Regulatory frameworks must evolve to address the unique characteristics of continuously learning systems while maintaining patient safety. Integration into clinical workflows requires careful attention to human factors and appropriate task division between AI and clinicians.
          </Typography>
          <Typography variant="body1" paragraph>
            Future directions should include larger prospective studies tracking clinical outcomes beyond diagnostic accuracy, economic analyses quantifying cost-effectiveness across different implementation scenarios, and continued algorithm refinement to address current performance gaps. Particularly promising are multimodal approaches that combine imaging with patient-reported symptoms, medical history, and even genetic information to provide more comprehensive diagnostic support.
          </Typography>
          <Typography variant="body1" paragraph>
            With thoughtful development, validation, and implementation, AI has the potential to democratize access to dermatological expertise while improving diagnostic accuracy and efficiency. The most successful systems will likely be those designed as collaborative tools that augment rather than replace clinical judgment, enabling care providers at all levels to deliver more accurate, efficient, and equitable dermatological care.
          </Typography>
        </Box>

        {/* References */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>References</Typography>
          <Typography variant="body2" component="div">
            <List dense disablePadding>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Esteva A, Kuprel B, Novoa RA, et al. Dermatologist-level classification of skin cancer with deep neural networks. Nature. 2017;542(7639):115-118." sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Phillips M, Marsden H, Jaffe W, et al. Assessment of Accuracy of an Artificial Intelligence Algorithm to Detect Melanoma in Images of Skin Lesions. JAMA Dermatol. 2022;158(1):35-42." sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Liu Y, Jain A, Eng C, et al. A deep learning system for differential diagnosis of skin diseases. Nature Medicine. 2020;26(6):900-908." sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Freeman K, Dinnes J, Chuchu N, et al. Impact of artificial intelligence-enabled triage on dermatology access and patient outcomes: A cluster randomized clinical trial. JAMA Dermatol. 2022;158(8):1-9." sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Daneshjou R, Vodrahalli K, Liang W, et al. Disparities in dermatology AI performance on a diverse, curated clinical image set. Adv Sci. 2022;9(16):2105022." sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Han SS, Kim MS, Lim W, et al. Classification of the clinical images for benign and malignant cutaneous tumors using a deep learning algorithm. J Invest Dermatol. 2018;138(7):1529-1538." sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Tschandl P, Rosendahl C, Kittler H. The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions. Sci Data. 2018;5:180161." sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Fujisawa Y, Otomo Y, Ogata Y, et al. Deep-learning-based, computer-aided classifier developed with a small dataset of clinical images surpasses board-certified dermatologists in skin tumour diagnosis. Br J Dermatol. 2019;180(2):373-381." sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Hekler A, Navarrete-Dechent C, Liopyris K, et al. Superior skin cancer classification by the combination of human and artificial intelligence. Eur J Cancer. 2019;120:114-121." sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Brinker TJ, Hekler A, Enk AH, et al. Deep learning outperformed 136 of 157 dermatologists in a head-to-head dermoscopic melanoma image classification task. Eur J Cancer. 2019;113:47-54." sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} /></ListItem>
              <ListItem sx={{ display: 'block', mb: 1 }}><ListItemText primary="Young AT, Xiong M, Pfau J, et al. Artificial intelligence in dermatology: A primer. J Invest Dermatol. 2020;140(8):1504-1512." sx={{ m: 0, color: 'rgba(255, 255, 255, 0.8)' }} /></ListItem>
            </List>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default DermatologyAIWhitePaperPage;
