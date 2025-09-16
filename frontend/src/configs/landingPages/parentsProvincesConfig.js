// Parents in Provinces Landing Page Configuration
// Target: Parents in remote areas with limited access to healthcare

export const parentsProvincesConfig = {
  routeId: 'parents-provinces',
  segment: 'parentsProvinces.segment',
  targetAudience: 'parentsProvinces.description',
  heroImage: 'my child has fever.png', // Primary topic image as hero
  
  topics: {
    childFever: {
      title: 'parentsProvinces.childFever.title',
      subtitle: 'parentsProvinces.childFever.subtitle',
      iconImage: 'my child has fever.png',
      color: '#4385F4',
      bgGradient: 'linear-gradient(135deg, #4385F4 0%, #7B9FF2 100%)',
      personas: ['ai_persona_aileen_carol', 'ai_persona_jessica_lee'],
      firstMessage: 'parentsProvinces.childFever.firstMessage'
    },
    
    remoteCare: {
      title: 'parentsProvinces.remoteCare.title',
      subtitle: 'parentsProvinces.remoteCare.subtitle',
      iconImage: 'No doctor nearby.png',
      color: '#673AB7',
      bgGradient: 'linear-gradient(135deg, #673AB7 0%, #9575CD 100%)',
      personas: ['ai_persona_aileen_carol'],
      firstMessage: 'parentsProvinces.remoteCare.firstMessage'
    },
    
    costSavings: {
      title: 'parentsProvinces.costSavings.title',
      subtitle: 'parentsProvinces.costSavings.subtitle',
      iconImage: 'Safe time and moeny.png',
      color: '#7B1FA2',
      bgGradient: 'linear-gradient(135deg, #7B1FA2 0%, #AD1457 100%)',
      personas: ['ai_persona_aileen_carol'],
      firstMessage: 'parentsProvinces.costSavings.firstMessage'
    }
  },
  
  analytics: {
    pixelId: '2436407033420953',
    gtag: 'G-TPKTH33FNE'
  }
};