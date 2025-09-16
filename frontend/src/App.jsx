// File: frontend/src/App.jsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Import i18n configuration
import './i18n';
// Language-specific font adjustments now handled directly in AdaptiveInfoCard.jsx

// Import performance monitor (only in development)
if (process.env.NODE_ENV === 'development') {
  import('./utils/performanceMonitor').then(module => {
    console.log('🚀 Performance monitoring enabled. Type `performanceMonitor.logMetrics()` in console to see metrics.');
  });
}

import { AuthProvider } from './contexts/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { MyAdvisersProvider } from './contexts/MyAdvisersContext';
import { HeaderVisibilityProvider } from './contexts/HeaderVisibilityContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import SimpleFeedbackWidget from './components/SimpleFeedbackWidget';
// import TestFeedbackButton from './components/TestFeedbackButton'; // Test component - not needed

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicLayout from './components/layout/PublicLayout';
import ChatPage from './pages/ChatPage';
import LandingPage from './pages/LandingPage';
import EvidencePage from './pages/EvidencePage';
import FeaturesPage from './pages/FeaturesPage';
import PatientInfoPage from './pages/PatientInfoPage';
import PhysicianInfoPage from './pages/PhysicianInfoPage';
import NurseInfoPage from './pages/NurseInfoPage';
import MentalHealthAIWhitePaperPage from './assets/whitepapers/MentalHealthAIWhitePaperPage.jsx';
import PharmacistInfoPage from './pages/PharmacistInfoPage';
import DataPrivacyPage from './pages/DataPrivacyPage';
import LegalPage from './pages/LegalPage';
import ContactPage from './pages/ContactPage';
// import EncyclopediaTestPage from './pages/EncyclopediaTestPage';
// import GuestExperiencePage from './pages/GuestExperiencePage'; // LEGACY - Commented out, using ChatPage with guest mode instead
import AnimatedGuestExperience from './components/features/landing/AnimatedGuestExperience';
import ImagingAIWhitePaperPage from './assets/whitepapers/ImagingAIWhitePaperPage';
import ImagingAILaymanPage from './assets/whitepapers/ImagingAILaymanPage';
import AiAccuracyWhitePaperPage from './assets/whitepapers/AiAccuracyWhitePaperPage';
import ResearchPage from './pages/ResearchPage';
import ClinicianInfoPage from './pages/ClinicianInfoPage';
import PrivateRoute from './components/common/PrivateRoute';
import ConditionalRoute from './components/common/ConditionalRoute';
import AdminRoute from './components/AdminRoute';
import PathologyAIWhitePaperPage from './assets/whitepapers/PathologyAIWhitePaperPage';
import HealthAdvisoryPage from './pages/HealthAdvisoryPage';
import DermatologyAIWhitePaperPage from './assets/whitepapers/DermatologyAIWhitePaperPage';
import WhyVirtualMDPage from './pages/why-virtualmd';
import AboutVirtualMDHealthEncyclopedia from './pages/AboutVirtualMDHealthEncyclopedia';
import DataPrivacyWhitePaperPage from './pages/DataPrivacyWhitePaperPage';
import YourHealthInYourHandsPage from './pages/YourHealthInYourHandsPage';
import MedicalImageProcessingPage from './pages/MedicalImageProcessingPage';
// import GuestExperiencePageWithChat from './pages/GuestExperience/GuestExperiencePageWithChat'; // UNUSED - Never routed
import { FEATURE_FLAGS } from './config/featureFlags';
import IntroductoryPopup from './components/IntroductoryPopup';
// import EncyclopediaAsyncTestPage from './pages/EncyclopediaAsyncTestPage';
import NoteFromFounders from './pages/NoteFromFounders';
import FAQPage from './pages/FAQPage';
import HowToPage from './pages/HowToPage';
// Admin UI (lives outside src/, imported explicitly)
import AdminPage from '../admin_web/components/AdminPage.jsx';
import AdminPersonasPage from '../admin_web/components/Admin/AdminPersonasPage.jsx';
// import AdminFeedbackPage from '../admin_web/components/Admin/AdminFeedbackPage.jsx'; // Removed - needs backend API

// Blog pages (lazy loaded for bundle size; avoid require on Vite)
// Blog components removed - now served at blog.virtualmd.app

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function PublicRoutesLayout() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}


// -----------------------------------------------------------------------------
// Main App component   (⚠️  health-check useEffect removed to stop reload loop)
// -----------------------------------------------------------------------------
function App() {
  // Blog configuration removed - now served at blog.virtualmd.app

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeContextProvider>
          <AuthProvider>
            <MyAdvisersProvider>
              <HeaderVisibilityProvider>
                <LanguageProvider>
                  <IntroductoryPopup />
                  <SimpleFeedbackWidget />
                  <Routes>
                {/* Public routes wrapped in PublicLayout */}
                <Route element={<PublicRoutesLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  {/* <Route path="/guest" element={<GuestExperiencePage />} /> */}  {/* LEGACY - Commented out */}
                  
                  {/* Guest Landing Pages */}
                  <Route path="/guest" element={<AnimatedGuestExperience configId="default-guest" />} />
                  <Route path="/guest-bpo" element={<AnimatedGuestExperience configId="bpo-workers" />} />
                  <Route path="/guest-parents" element={<AnimatedGuestExperience configId="parents-provinces" />} />
                  <Route path="/guest-manila" element={<AnimatedGuestExperience configId="ofws-manila" />} />
                  <Route path="/guest-elderly" element={<AnimatedGuestExperience configId="elderly" />} />
                  <Route path="/guest-students" element={<AnimatedGuestExperience configId="gen-z-students" />} />
                  <Route path="/evidence" element={<EvidencePage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/for-patients" element={<PatientInfoPage />} />
                  <Route path="/for-physicians" element={<PhysicianInfoPage />} />
                  <Route path="/for-nurses" element={<NurseInfoPage />} />
                  <Route path="/for-mental-health" element={
                    <ConditionalRoute condition={FEATURE_FLAGS.showMentalHealthAIWhitepaper}>
                      <MentalHealthAIWhitePaperPage />
                    </ConditionalRoute>
                  } />
                  <Route path="/for-pharmacists" element={<PharmacistInfoPage />} />
                  <Route path="/data-privacy" element={<DataPrivacyPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  {/* <Route path="/test-encyclopedia" element={<EncyclopediaTestPage />} /> */}
                  {/* <Route path="/test-encyclopedia-async" element={<EncyclopediaAsyncTestPage />} /> */}
                  <Route path="/whitepapers/imaging-ai-assist" element={
                    <ConditionalRoute condition={FEATURE_FLAGS.showImagingAIWhitepaper}>
                      <ImagingAIWhitePaperPage />
                    </ConditionalRoute>
                  } />
                  <Route path="/whitepapers/pathology-ai-assist" element={
                    <ConditionalRoute condition={FEATURE_FLAGS.showPathologyAIWhitepaper}>
                      <PathologyAIWhitePaperPage />
                    </ConditionalRoute>
                  } />
                  <Route path="/whitepapers/dermatology-ai-assist" element={
                    <ConditionalRoute condition={FEATURE_FLAGS.showDermatologyAIWhitepaper}>
                      <DermatologyAIWhitePaperPage />
                    </ConditionalRoute>
                  } />
                  <Route path="/explainers/imaging-ai" element={
                    <ConditionalRoute condition={FEATURE_FLAGS.showImagingAILaymanPage}>
                      <ImagingAILaymanPage />
                    </ConditionalRoute>
                  } />
                  <Route path="/research" element={
                    <ConditionalRoute condition={FEATURE_FLAGS.showResearchPage}>
                      <ResearchPage />
                    </ConditionalRoute>
                  } />
                  <Route path="/research/mental-health-ai-whitepaper" element={
                    <ConditionalRoute condition={FEATURE_FLAGS.showMentalHealthAIWhitepaper}>
                      <MentalHealthAIWhitePaperPage />
                    </ConditionalRoute>
                  } />
                  <Route path="/research/ai-accuracy" element={<AiAccuracyWhitePaperPage />} />
                  <Route path="/patient-info" element={<PatientInfoPage />} />
                  <Route path="/clinician-info" element={<ClinicianInfoPage />} />
                  <Route path="/health-advisory" element={<HealthAdvisoryPage />} />
                  <Route path="/why-virtualmd" element={<WhyVirtualMDPage />} />
                  <Route path="/about-VirtualMD-health-encyclopedia" element={<AboutVirtualMDHealthEncyclopedia />} />
                  <Route path="/data-privacy-whitepaper" element={<DataPrivacyWhitePaperPage />} />
                  <Route path="/your-health-your-hands" element={<YourHealthInYourHandsPage />} />
                  <Route path="/tools/image-processing" element={<MedicalImageProcessingPage />} />
                  <Route path="/note-from-founders" element={<NoteFromFounders />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/how-to" element={<HowToPage />} />
                  {/* Blog routes removed - now served at blog.virtualmd.app */}
                </Route>

                {/* Admin routes (frontend prompts for admin password and backend validates). Component self-blocks in production. */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/personas" element={<AdminPersonasPage />} />
                {/* <Route path="/admin/feedback" element={<AdminFeedbackPage />} /> */}

                {/* Stand-alone public routes */}
                {/* <Route path="/guest-experience" element={<GuestExperiencePage />} /> */}  {/* LEGACY - Fallback route, consider removing */}
                <Route path="/guest-chat" element={<ChatPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Auth-protected routes - new clean structure */}
                <Route path="/dashboard" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/consultations" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/team" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/encyclopedia" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/conversation/:conversationId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/conversation/:conversationId/transcript" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/conversation/:conversationId/summary" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/conversation/:conversationId/differential-opinion" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                
                {/* Legacy chat route - redirect to dashboard */}
                <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/chat/*" element={<PrivateRoute><ChatPage /></PrivateRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </LanguageProvider>
            </HeaderVisibilityProvider>
          </MyAdvisersProvider>
        </AuthProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  </ErrorBoundary>
  );
}

export default App;