// BPO Workers Landing Page Configuration
// Target: Business Process Outsourcing workers dealing with shift work challenges

export const bpoWorkersConfig = {
  routeId: 'bpo-workers',
  segment: 'BPO workers',
  targetAudience: 'Business Process Outsourcing workers dealing with shift work challenges',
  heroImage: 'I cant sleep!.png', // Primary topic image as hero
  
  topics: {
    sleep: {
      title: 'bpoWorkers.sleep.title',
      subtitle: 'bpoWorkers.sleep.subtitle',
      iconImage: 'I cant sleep!.png',
      color: '#4385F4',
      bgGradient: 'linear-gradient(135deg, #4385F4 0%, #7B9FF2 100%)',
      personas: ['ai_persona_aileen_carol', 'ai_persona_al_patel'],
      firstMessage: 'bpoWorkers.sleep.firstMessage'
    },
    
    fatigue: {
      title: 'bpoWorkers.fatigue.title',
      subtitle: 'bpoWorkers.fatigue.subtitle',
      iconImage: 'Always tired.png',
      color: '#673AB7',
      bgGradient: 'linear-gradient(135deg, #673AB7 0%, #9575CD 100%)',
      personas: ['ai_persona_aileen_carol', 'ai_persona_al_patel'],
      firstMessage: 'bpoWorkers.fatigue.firstMessage'
    },
    
    stress: {
      title: 'bpoWorkers.stress.title',
      subtitle: 'bpoWorkers.stress.subtitle',
      iconImage: 'Stress overload.png',
      color: '#7B1FA2',
      bgGradient: 'linear-gradient(135deg, #7B1FA2 0%, #AD1457 100%)',
      personas: ['ai_persona_aileen_carol'],
      firstMessage: 'bpoWorkers.stress.firstMessage'
    }
  },
  
  analytics: {
    pixelId: '1118259443784534',
    gtag: 'G-TPKTH33FNE'
  }
};