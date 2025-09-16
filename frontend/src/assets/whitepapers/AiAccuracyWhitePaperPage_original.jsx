import React, { useEffect, useRef } from 'react';
import { Container, Paper, Typography, Box, Divider, List, ListItem, ListItemText, Link, Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';
import jsPDF from 'jspdf';
import logoImage from '../../assets/branding/full_logo_high.png';

// Define the white paper content as constants
const TITLE = "Accuracy and Considerations for AI in Medical Information";

const SECTION1_TITLE = "1. Introduction: The Promise of AI in Medicine";
const SECTION1_CONTENT = `Artificial Intelligence (AI) holds significant potential to revolutionize aspects of healthcare. From analyzing medical images like X-rays and CT scans to identifying patterns in patient data that might predict disease risk, AI tools offer the possibility of enhancing diagnostic speed, accuracy, and efficiency. They can process vast amounts of medical literature far faster than humans, potentially aiding clinicians in staying up-to-date and informing treatment decisions. AI can also power conversational agents, like those used by MindSpring.health, to provide patients with accessible information, answer health-related questions, and assist in navigating complex medical topics. The goal is often not to replace human doctors but to augment their capabilities and improve patient access to information.`;

const SECTION2_TITLE = "2. Understanding AI Accuracy and Errors in Medicine";
const SECTION2_CONTENT_P1 = `While promising, the accuracy of AI in medicine is a critical area of ongoing research and development. Studies comparing AI diagnostic capabilities to human clinicians yield mixed results, heavily dependent on the specific task, the quality of training data, and the AI model used.`;
const SECTION2_CONTENT_LIST = [
  { 
    title: "Examples of AI Success:", 
    text: "Research has shown AI models achieving dermatologist-level accuracy in classifying skin cancers from images (e.g., Esteva et al., Nature, 2017 - illustrative example). Similarly, AI has demonstrated high accuracy in detecting diabetic retinopathy from retinal scans (e.g., Gulshan et al., JAMA, 2016 - illustrative example). In certain narrow, data-rich tasks, AI can match or even exceed human performance due to its ability to detect subtle patterns."
  },
  {
    title: "Types of AI Errors:",
    text: "AI errors differ from human errors. They can arise from: Biased Data (If training data underrepresents certain demographics, the AI may perform poorly for those groups), Overfitting (The AI learns the training data too well, including noise, and fails to generalize to new, unseen patient cases), Lack of Context (AI may struggle with complex patient histories, comorbidities, or nuanced symptoms that require broader clinical judgment), Adversarial Examples (Minor, imperceptible changes to input data could potentially cause an AI to make a completely wrong prediction), Hallucinations (LLMs can sometimes generate plausible-sounding but factually incorrect or nonsensical information)."
  },
  {
    title: "AI vs. Human Doctors:",
    text: "It's rarely a simple \"better or worse\" scenario. A meta-analysis might show AI slightly outperforming radiologists on average for a specific scan type (*hypothetical graph concept*), but human experts often excel in atypical cases or when integrating information from multiple sources. Conversely, AI might be more consistent in avoiding fatigue-related errors on repetitive tasks. The ideal scenario often involves human-AI collaboration."
  }
];

const SECTION3_TITLE = "3. The Challenge of AI Communication in Healthcare";
const SECTION3_CONTENT_P1 = `Beyond diagnostic accuracy, a significant hurdle is how AI communicates information to patients. A correct answer delivered poorly can be unhelpful or even harmful.`;
const SECTION3_CONTENT_LIST = [
  "Lack of Empathy and Nuance: AI models often lack the genuine empathy, reassurance, and ability to tailor explanations to an individual's emotional state and understanding (e.g., Ayers et al., JAMA Internal Medicine, 2023 - illustrative example).",
  "Information Overload/Jargon: AI can sometimes provide exhaustive, technically dense information that overwhelms rather than clarifies.",
  "Confidence Miscalibration: An AI might present information with high confidence even when it's uncertain or incorrect, potentially misleading patients."
];
const SECTION3_CONTENT_P2 = `This is where MindSpring.health strives to be **\"simply better.\"** We aim not only for factual accuracy in the information provided by our AI personas but also focus heavily on the *manner* of delivery. Our goal is to train and guide our AI specialists to communicate clearly, concisely, and with an appropriate tone, breaking down complex topics and acknowledging limitations, bridging the gap between raw AI output and helpful patient communication.`;

const SECTION4_TITLE = "4. What This Means for You Using MindSpring.health";
const SECTION4_CONTENT_LIST = [
  "**Treat it as Information, Not Diagnosis:** Use the information provided as a starting point. It is *not* a substitute for a professional medical diagnosis, treatment plan, or personalized advice.",
  "**Be Aware of Limitations:** Understand that AI can make mistakes, misunderstand context, or provide incomplete information. Information may not apply to your specific, unique health situation.",
  "**Verify Critical Information:** Always discuss significant health concerns, symptoms, or potential treatment options with a qualified human healthcare provider.",
  "**AI Personas Simulate Roles:** The AI specialists simulate roles but do not possess the qualifications or legal standing of licensed human professionals."
];

const SECTION5_TITLE = "5. Disclaimer and Emergency Information";
const SECTION5_DISCLAIMER = `MindSpring.health strives for accuracy. However, this and any AI-based service can give incorrect information. The information provided is for educational and informational purposes only and does not constitute medical advice. Always consult a qualified human healthcare professional for any health concerns or before making any decisions related to your health or treatment. Reliance on any information provided by this service is solely at your own risk.`;
const SECTION5_EMERGENCY = "In an emergency, always call 911.";

function AiAccuracyWhitePaperPage() {
  const { setHeaderMode } = useHeaderVisibility();
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0);
  }, [setHeaderMode]);

  const addWrappedText = (doc, text, x, y, maxWidth, options = {}) => {
    const lines = doc.splitTextToSize(text || '', maxWidth);
    doc.text(lines, x, y, options);
    const fontSize = doc.internal.getFontSize();
    const lineHeightFactor = options.lineHeightFactor || 1.15;
    const textHeight = lines.length * fontSize * lineHeightFactor / doc.internal.scaleFactor;
    return y + textHeight;
  };

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

      const addPdfSection = (title, content, options = {}) => {
        const titleSize = options.titleSize || 14;
        const contentSize = options.contentSize || 10;
        const spaceAfterTitle = options.spaceAfterTitle || 5;
        const spaceAfterSection = options.spaceAfterSection || 15;
        const listIndent = options.listIndent || 15;

        const minSpaceNeeded = (titleSize * 1.15 + contentSize * 1.15) / doc.internal.scaleFactor + spaceAfterTitle;
        if (currentY > pageHeight - margin - minSpaceNeeded) {
          doc.addPage();
          currentY = margin;
        }

        doc.setFontSize(titleSize);
        doc.setFont(undefined, 'bold');
        currentY = addWrappedText(doc, title, margin, currentY, contentWidth);
        doc.setFont(undefined, 'normal');
        currentY += spaceAfterTitle;

        doc.setFontSize(contentSize);
        const contentStartY = currentY;

        if (typeof content === 'string') {
          currentY = addWrappedText(doc, content, margin, contentStartY, contentWidth, { lineHeightFactor: 1.2 });
        } else if (Array.isArray(content)) {
          content.forEach((item) => {
            const itemMinSpace = (contentSize * 1.15) / doc.internal.scaleFactor + 5;
            if (currentY > pageHeight - margin - itemMinSpace) {
              doc.addPage();
              currentY = margin;
            }

            if (typeof item === 'string') {
              currentY =
