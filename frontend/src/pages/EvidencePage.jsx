// frontend/src/pages/EvidencePage.jsx
// Showcases VirtualMD.app's approach: grounded in research, leading a wellness revolution.

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Tooltip, Link as MuiLink, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import BiotechIcon from '@mui/icons-material/Biotech';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PsychologyIcon from '@mui/icons-material/Psychology';
import InfoGrid from '../components/common/InfoGrid';

// Import new wellness-oriented icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExploreIcon from '@mui/icons-material/Explore';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import InsightsIcon from '@mui/icons-material/Insights';

export default function EvidencePage() {
  const { t } = useTranslation('pages');

  // Data for the original evidence cards (Research Foundations)
  const researchEvidenceItems = [
    {
      id: 'radiology',
      icon: <ImageSearchIcon fontSize="large" />,
      title: t('evidencePage.researchEvidence.radiology.title'),
      description: (
        <>
          <Typography variant="body2" component="span" sx={{ display: 'block', whiteSpace: 'pre-line' }}>
            {t('evidencePage.researchEvidence.radiology.description')}
          </Typography>
          <Tooltip title={t('evidencePage.researchEvidence.radiology.tooltip')} arrow>
            <MuiLink
              component={RouterLink}
              to="/explainers/imaging-ai"
              variant="caption"
              sx={{ display: 'block', mt: 1, fontWeight: 'medium' }}
              onClick={(e) => e.stopPropagation()}
            >
              {t('evidencePage.researchEvidence.radiology.explainSimply')}
            </MuiLink>
          </Tooltip>
        </>
      ),
      citation: t('evidencePage.researchEvidence.radiology.citation'),
      color: '#1976d2',
      link: '/whitepapers/imaging-ai-assist',
    },
    {
      id: 'pathology',
      icon: <BiotechIcon fontSize="large" />,
      title: t('evidencePage.researchEvidence.pathology.title'),
      description: t('evidencePage.researchEvidence.pathology.description'),
      citation: t('evidencePage.researchEvidence.pathology.citation'),
      color: '#3F51B5',
      link: '/whitepapers/pathology-ai-assist',
    },
    {
      id: 'dermatology',
      icon: <LocalHospitalIcon fontSize="large" />,
      title: t('evidencePage.researchEvidence.dermatology.title'),
      description: t('evidencePage.researchEvidence.dermatology.description'),
      citation: t('evidencePage.researchEvidence.dermatology.citation'),
      color: '#673AB7',
      link: '/whitepapers/dermatology-ai-assist',
    },
    {
      id: 'mental-health-research',
      icon: <PsychologyIcon fontSize="large" />,
      title: t('evidencePage.researchEvidence.mentalHealthResearch.title'),
      description: t('evidencePage.researchEvidence.mentalHealthResearch.description'),
      citation: t('evidencePage.researchEvidence.mentalHealthResearch.citation'),
      color: '#7E57C2',
      link: '/for-mental-health',
    },
  ];

  // Data for the new insight cards (Wellness Revolution)
  const wellnessInsightItems = [
    {
      id: 'personalized-wellness',
      icon: <SelfImprovementIcon fontSize="large" />,
      title: t('evidencePage.wellnessInsights.personalizedWellness.title'),
      description: t('evidencePage.wellnessInsights.personalizedWellness.description'),
      color: '#00796b', // Teal
      link: null,
    },
    {
      id: 'holistic-signals',
      icon: <InsightsIcon fontSize="large" />,
      title: t('evidencePage.wellnessInsights.holisticSignals.title'),
      description: t('evidencePage.wellnessInsights.holisticSignals.description'),
      color: '#00695c', // Darker Teal
      link: null,
    },
    {
      id: 'proactive-wellbeing',
      icon: <ExploreIcon fontSize="large" />,
      title: t('evidencePage.wellnessInsights.proactiveWellbeing.title'),
      description: t('evidencePage.wellnessInsights.proactiveWellbeing.description'),
      color: '#004d40', // Even Darker Teal
      link: null,
    },
    {
      id: 'ai-enhanced-clarity',
      icon: <LightbulbIcon fontSize="large" />,
      title: t('evidencePage.wellnessInsights.aiEnhancedClarity.title'),
      description: t('evidencePage.wellnessInsights.aiEnhancedClarity.description'),
      color: '#00897b', // Medium Teal
      link: null,
    },
  ];
  return (
    <>
      <Typography
        variant="h2"
        align="center"
        sx={{
          mt: 5,
          mb: 3,
          fontWeight: 'bold',
          color: 'primary.main', // Using theme color
          fontSize: { xs: '2.6rem', sm: '3.2rem', md: '3.8rem' }
        }}
      >
        {t('evidencePage.heading')}
      </Typography>

      <Typography
        variant="h6" // Changed to h6 for better hierarchy
        align="center"
        sx={{
          mb: 4,
          mx: 'auto',
          maxWidth: '900px',
          color: 'text.secondary',
          fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.3rem'},
          lineHeight: 1.7,
          px: 2
        }}
        dangerouslySetInnerHTML={{ __html: t('evidencePage.description2') }}
      />

      <InfoGrid
        heading={t('evidencePage.researchHeading')}
        items={researchEvidenceItems}
        headingVariant="h4" // More prominent heading for the section
        headingColor="text.primary"
        gridItemSx={{ mb: 3 }} // Add some bottom margin to grid items
      />
    </>
  );
} 