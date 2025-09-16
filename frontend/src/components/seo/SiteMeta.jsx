// frontend/src/components/seo/SiteMeta.jsx
// Standalone SEO component for site-wide meta tags
// No dependencies on blog/Sanity - completely self-contained

import React from 'react';
import { Helmet } from 'react-helmet-async';

const SiteMeta = ({
  title,
  description,
  image,
  url,
  siteName = 'VirtualMD',
  locale = 'en_PH',
  localeAlternates = ['en_PH', 'fil_PH'],
  twitterSite = '@VirtualMD',
  keywords = [],
  breadcrumbs = [],
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  philippinesOptimized = true
}) => {
  // Get current URL if not provided
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://virtualmd.app');
  const canonicalUrl = currentUrl.split('?')[0]; // Remove query params for canonical

  // Enhanced Philippines-specific keywords
  const philippinesKeywords = philippinesOptimized ? [
    'Philippines healthcare', 'Filipino health', 'Pilipinas wellness', 
    'telemedicine Philippines', 'AI health advisor Philippines', 'virtual consultation PH',
    'healthcare technology Philippines', 'health AI Pilipinas'
  ] : [];

  // Combine keywords
  const allKeywords = [
    ...keywords,
    ...philippinesKeywords,
    'VirtualMD', 'AI healthcare', 'virtual health consultation', 'telemedicine'
  ].join(', ');

  // Philippines-optimized descriptions
  const philippinesDescription = philippinesOptimized && description 
    ? `${description} Available in the Philippines with Filipino healthcare expertise.`
    : description;

  // Generate structured data for breadcrumbs
  const breadcrumbStructuredData = breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': breadcrumb.name,
      'item': breadcrumb.url
    }))
  } : null;

  // Generate organization structured data
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'VirtualMD',
    'url': 'https://virtualmd.app',
    'logo': 'https://virtualmd.app/assets/branding/full_logo_medium.png',
    'sameAs': [
      'https://blog.virtualmd.app'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+1-555-VIRTUAL',
      'contactType': 'customer service',
      'areaServed': ['US', 'PH'],
      'availableLanguage': ['en', 'fil']
    }
  };

  // Health/Healthcare specific structured data
  const healthStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    'name': 'VirtualMD',
    'description': 'AI-powered virtual health consultations and healthcare guidance',
    'url': 'https://virtualmd.app',
    'medicalSpecialty': [
      'General Health', 
      'Telemedicine',
      'AI Healthcare',
      'Virtual Consultation'
    ],
    'areaServed': {
      '@type': 'Country',
      'name': 'Philippines'
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={philippinesDescription} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language and Region */}
      <meta httpEquiv="content-language" content={locale} />
      <meta name="geo.region" content="PH" />
      <meta name="geo.placename" content="Philippines" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={philippinesDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {localeAlternates.map(altLocale => (
        <meta key={altLocale} property="og:locale:alternate" content={altLocale} />
      ))}
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:alt" content={title} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={philippinesDescription} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Philippines-specific meta tags for local SEO */}
      {philippinesOptimized && (
        <>
          <meta name="geo.country" content="PH" />
          <meta name="DC.coverage" content="Philippines" />
          <meta name="DC.audience" content="Filipino healthcare seekers" />
        </>
      )}

      {/* Hreflang for multi-language support */}
      {localeAlternates.map(hrefLang => (
        <link 
          key={hrefLang} 
          rel="alternate" 
          hrefLang={hrefLang} 
          href={canonicalUrl} 
        />
      ))}

      {/* Structured Data */}
      {breadcrumbStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      )}
      
      <script type="application/ld+json">
        {JSON.stringify(organizationStructuredData)}
      </script>

      {philippinesOptimized && (
        <script type="application/ld+json">
          {JSON.stringify(healthStructuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SiteMeta;
