// frontend/src/components/common/InfoGrid.jsx

import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, Container, useTheme, useMediaQuery } from '@mui/material';
import InfoCard from './InfoCard';
import AdaptiveInfoCard from './AdaptiveInfoCard';
import { motion } from 'framer-motion';

export default function InfoGrid({ items, heading }) {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  // Treat lg+ as desktop for layout purposes
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  if (!items || items.length === 0) return null;

  // Animation variants for staggered slide-in effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  };

  // Split items into Try it out and others
  const tryItOutItem = items.find(item => item.id === 'try-it-out');
  const otherItems = items.filter(item => item.id !== 'try-it-out');
  const desktopItems = items; // Preserve order as provided by caller on desktop

  return (
    <Box sx={{ width: '100%', mt: { xs: 'calc(0.5rem + 5vmin)', md: 'calc(2rem + 5vh)', lg: 'calc(4rem + 5vh)' }, mb: { xs: 0.5, md: 2, lg: 4 }, px: { xs: 0.5, sm: 2, md: 3 } }}>
      {heading && (
        <Typography
          variant="h4"
          align="center"
          sx={{ 
            mb: 4, 
            fontWeight: 'bold', 
            color: '#1976d2',
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.6rem' }
          }}
        >
          {heading}
        </Typography>
      )}

      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
      {isDesktop ? (
        // Desktop: single row containing all items in provided order
        <Grid
          container
          spacing={{ xs: 2, sm: 3, md: 4 }}
          justifyContent="center"
        >
          {desktopItems.map((item, i) => (
            <Grid
              key={item.id || item.title || i}
              item
              xs={12}
              sm={6}
              md={4}
              lg={4}
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <motion.div variants={itemVariants} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <AdaptiveInfoCard
                  icon={item.icon}
                  title={item.title}
                  description={item.description || item.text}
                  citation={item.citation}
                  color={item.color}
                  circleColor={item.circleColor}
                  link={item.link}
                  onClick={item.onClick}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {/* Mobile/Tablet: two rows, with Try it out centered above */}
          {tryItOutItem && (
        <Grid
              container
              spacing={{ xs: '1vmin', sm: 3, md: 4 }}
              justifyContent="center"
              sx={{ mb: { xs: 1, sm: 3 } }}
            >
              <Grid
                item
                xs={6}
                sm={4}
                md={4}
                sx={{ display: 'flex', justifyContent: 'center', maxWidth: { xs: '48vw', sm: 'none' } }}
              >
                <motion.div variants={itemVariants} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <AdaptiveInfoCard
                    icon={tryItOutItem.icon}
                    title={tryItOutItem.title}
                    description={tryItOutItem.description || tryItOutItem.text}
                    citation={tryItOutItem.citation}
                    color={tryItOutItem.color}
                    circleColor={tryItOutItem.circleColor}
                    link={tryItOutItem.link}
                    onClick={tryItOutItem.onClick}
                    sizeMultiplier={1.15}
                  />
                </motion.div>
              </Grid>
            </Grid>
          )}
          <Grid
            container
            spacing={{ xs: '2vmin', sm: 3, md: 4 }}
            justifyContent="center"
          >
            {otherItems.map((item, i) => (
              <Grid
                key={item.id || item.title || i}
                item
                xs={6}
                sm={4}
                md={4}
                sx={{ display: 'flex', justifyContent: 'center', maxWidth: { xs: '48vw', sm: 'none' } }}
              >
                <motion.div variants={itemVariants} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <AdaptiveInfoCard
                    icon={item.icon}
                    title={item.title}
                    description={item.description || item.text}
                    citation={item.citation}
                    color={item.color}
                    circleColor={item.circleColor}
                    link={item.link}
                    onClick={item.onClick}
                    sizeMultiplier={item.id === 'why-use-VirtualMD' ? 1.3 : 1.15}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </>
      )}
        </motion.div>
      </Container>
    </Box>
  );
}
