// OFWs Manila Landing Page Configuration
// Target: Overseas Filipino Workers adapting to urban Manila life

export const ofwsManilaConfig = {
  routeId: 'ofws-manila',
  segment: 'ofwsManila.segment',
  targetAudience: 'ofwsManila.description',
  heroImage: 'Stress in Manila.png', // Primary topic image as hero
  
  topics: {
    urbanStress: {
      title: 'ofwsManila.urbanStress.title',
      subtitle: 'ofwsManila.urbanStress.subtitle',
      iconImage: 'Stress in Manila.png',
      color: '#4385F4',
      bgGradient: 'linear-gradient(135deg, #4385F4 0%, #7B9FF2 100%)',
      personas: ['ai_persona_aileen_carol'],
      firstMessage: 'ofwsManila.urbanStress.firstMessage'
    },
    
    loneliness: {
      title: 'ofwsManila.loneliness.title',
      subtitle: 'ofwsManila.loneliness.subtitle',
      iconImage: 'Loneliness & fatigue.png',
      color: '#673AB7',
      bgGradient: 'linear-gradient(135deg, #673AB7 0%, #9575CD 100%)',
      personas: ['ai_persona_aileen_carol'],
      firstMessage: 'ofwsManila.loneliness.firstMessage'
    },
    
    everydayHealth: {
      title: 'ofwsManila.everydayHealth.title',
      subtitle: 'ofwsManila.everydayHealth.subtitle',
      iconImage: 'Everyday health Nutrition and lifestyle hacks for workers.png',
      color: '#7B1FA2',
      bgGradient: 'linear-gradient(135deg, #7B1FA2 0%, #AD1457 100%)',
      personas: ['ai_persona_aileen_carol', 'ai_persona_assaf_azoulay'],
      firstMessage: 'ofwsManila.everydayHealth.firstMessage'
    }
  },
  
  analytics: {
    pixelId: '1802001757059504',
    gtag: 'G-TPKTH33FNE'
  }
};