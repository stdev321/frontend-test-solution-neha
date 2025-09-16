// frontend/src/components/common/InfoCard.jsx
// Reusable card component for displaying information (features, evidence, nav links).

import React from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink
import {
  Card,
  CardActionArea,
  CardContent,
  Box,
  Typography,
  useTheme,
  Link as MuiLink, // Import MuiLink for external links or non-route actions
  alpha
} from '@mui/material';

export default function InfoCard({
  icon,
  title,
  description,
  citation,
  color = '#4385F4', // Default Google Blue
  circleColor, // Optional separate color for the circle background
  link, // Expecting a string path for react-router or external URL
  onClick // Optional onClick handler
}) {
  const theme = useTheme();

  
  const isInternalLink = !onClick && link && link.startsWith('/');

  // Determine the component and its props for CardActionArea
  let actionAreaProps = {};
  if (onClick) {
    actionAreaProps.onClick = onClick;
    // If onClick is provided, we might not want it to act as a link component
    // unless onClick itself handles the navigation.
    // For simplicity, let's assume if onClick is given, it takes full control.
    // We can make CardActionArea a simple 'div' or let MUI default.
  } else if (isInternalLink) {
    actionAreaProps.component = RouterLink;
    actionAreaProps.to = link;
  } else if (link) { // For external links
    actionAreaProps.component = MuiLink;
    actionAreaProps.href = link;
    actionAreaProps.target = '_blank';
    actionAreaProps.rel = 'noopener noreferrer';
  }

  return (
    <Card
      elevation={4}
      sx={{
        width: '100%',
        height: 380,
        borderRadius: '16px',
        background: `linear-gradient(145deg, ${color}15 0%, ${color}05 100%)`,
        border: `2px solid ${color}`,
        transition: 'box-shadow 0.3s',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: theme.shadows[16],
          background: `linear-gradient(145deg, ${color}25 0%, ${color}10 100%)`,
        },
      }}
    >
      <CardActionArea
        {...actionAreaProps}
        sx={{
          height: '100%',
          overflow: 'hidden',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: '100%',
            pt: 5,
          }}
        >
          <Box
            sx={{
              mb: 3,
              p: 3,
              borderRadius: '50%',
              bgcolor: circleColor || color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 20px ${alpha(circleColor || color, 0.4)}`,
              color: 'white',
              width: 80,
              height: 80,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 48 } })}
          </Box>
          <CardContent sx={{ p: 0, textAlign: 'center', maxWidth: '100%', overflow: 'hidden', minHeight: 100 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: color, 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
              }}
            >
              {title}
            </Typography>
            {React.isValidElement(description) ? (
              description
            ) : (
              <Typography
                variant="body1"
                sx={{
                  color: '#6741D9',
                  whiteSpace: 'pre-line',
                  overflowWrap: 'break-word',
                  maxWidth: '95%',
                  mx: 'auto',
                  lineHeight: 1.5,
                  fontWeight: 600,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                  textAlign: 'center',
                }}
              >
                {description || citation}
              </Typography>
            )}
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}

// Add default props or prop types later if needed
