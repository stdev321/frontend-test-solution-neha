// Elderly Landing Page Configuration
// Target: Senior citizens managing chronic conditions and health monitoring

export const elderlyConfig = {
  routeId: 'elderly',
  segment: 'elderly.segment',
  targetAudience: 'elderly.description',
  heroImage: 'Check my blood pressure.png', // Primary topic image as hero
  
  topics: {
    bloodPressure: {
      title: 'elderly.bloodPressure.title',
      subtitle: 'elderly.bloodPressure.subtitle',
      iconImage: 'Check my blood pressure.png',
      color: '#4385F4',
      bgGradient: 'linear-gradient(135deg, #4385F4 0%, #7B9FF2 100%)',
      personas: ['ai_persona_aileen_carol'],
      firstMessage: 'elderly.bloodPressure.firstMessage'
    },
    
    diabetes: {
      title: 'elderly.diabetes.title',
      subtitle: 'elderly.diabetes.subtitle',
      iconImage: 'Living with diabetes.png',
      color: '#673AB7',
      bgGradient: 'linear-gradient(135deg, #673AB7 0%, #9575CD 100%)',
      personas: ['ai_persona_aileen_carol', 'ai_persona_rebecca_shapiro'],
      firstMessage: 'elderly.diabetes.firstMessage'
    },
    
    familySupport: {
      title: 'elderly.familySupport.title',
      subtitle: 'elderly.familySupport.subtitle',
      iconImage: 'Support for family.png',
      color: '#7B1FA2',
      bgGradient: 'linear-gradient(135deg, #7B1FA2 0%, #AD1457 100%)',
      personas: ['ai_persona_aileen_carol', 'ai_persona_sima_taweel'],
      firstMessage: 'elderly.familySupport.firstMessage'
    }
  },
  
  analytics: {
    pixelId: '1357037785830219',
    gtag: 'G-TPKTH33FNE'
  }
};