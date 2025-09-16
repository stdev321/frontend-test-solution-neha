// Default Guest Experience Configuration
// Target: General users trying out VirtualMD for the first time (original guest page)

import sickChildIcon from '../../assets/icons/sick_child_icon.png';
import sleepingIcon from '../../assets/icons/sleeping_icon.png';
import nutritionIcon from '../../assets/icons/nutrition_icon.png';

export const defaultGuestConfig = {
  routeId: 'default-guest',
  segment: 'General Users',
  targetAudience: 'First-time visitors trying out VirtualMD services',
  heroImage: 'doctor_on_computer.jpg', // Keep original background
  
  topics: {
    child: {
      title: 'defaultGuest.childHealth.title',
      subtitle: 'defaultGuest.childHealth.subtitle',
      iconImage: sickChildIcon,
      color: '#4385F4',
      bgGradient: 'linear-gradient(135deg, #4385F4 0%, #7B9FF2 100%)',
      personas: [
        'ai_persona_aileen_carol'
      ],
      firstMessage: 'defaultGuest.childHealth.firstMessage'
    },
    
    sleep: {
      title: 'defaultGuest.sleep.title',
      subtitle: 'defaultGuest.sleep.subtitle',
      iconImage: sleepingIcon,
      color: '#673AB7',
      bgGradient: 'linear-gradient(135deg, #673AB7 0%, #9575CD 100%)',
      personas: [
        'ai_persona_aileen_carol',
        'ai_persona_benjamin_stein',
        'ai_persona_alice_chen'
      ],
      firstMessage: 'defaultGuest.sleep.firstMessage'
    },
    
    nutrition: {
      title: 'defaultGuest.nutrition.title',
      subtitle: 'defaultGuest.nutrition.subtitle',
      iconImage: nutritionIcon,
      color: '#7B1FA2',
      bgGradient: 'linear-gradient(135deg, #7B1FA2 0%, #AD1457 100%)',
      personas: [
        'ai_persona_aileen_carol',
        'ai_persona_angelica_fordham',
        'ai_persona_rachel_levy',
        'ai_persona_amina_okufur'
      ],
      firstMessage: 'defaultGuest.nutrition.firstMessage'
    }
  },
  
  analytics: {
    pixelId: null, // No special tracking for default guest experience
    gtag: 'G-TPKTH33FNE' // Use standard Google Analytics
  }
};