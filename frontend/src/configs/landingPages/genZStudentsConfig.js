// Gen Z Students Landing Page Configuration
// Target: Young students dealing with academic stress and health concerns

export const genZStudentsConfig = {
  routeId: 'gen-z-students',
  segment: 'genZStudents.segment',
  targetAudience: 'genZStudents.description',
  heroImage: 'Exam stress.png', // Primary topic image as hero
  
  topics: {
    examStress: {
      title: 'genZStudents.examStress.title',
      subtitle: 'genZStudents.examStress.subtitle',
      iconImage: 'Exam stress.png',
      color: '#4385F4',
      bgGradient: 'linear-gradient(135deg, #4385F4 0%, #7B9FF2 100%)',
      personas: ['ai_persona_aileen_carol'],
      firstMessage: 'genZStudents.examStress.firstMessage'
    },
    
    acne: {
      title: 'genZStudents.acne.title',
      subtitle: 'genZStudents.acne.subtitle',
      iconImage: 'Acne & skin care.png',
      color: '#673AB7',
      bgGradient: 'linear-gradient(135deg, #673AB7 0%, #9575CD 100%)',
      personas: ['ai_persona_aileen_carol', 'ai_persona_emily_davis'],
      firstMessage: 'genZStudents.acne.firstMessage'
    },
    
    lowEnergy: {
      title: 'genZStudents.lowEnergy.title',
      subtitle: 'genZStudents.lowEnergy.subtitle',
      iconImage: 'No energy to study.png',
      color: '#7B1FA2',
      bgGradient: 'linear-gradient(135deg, #7B1FA2 0%, #AD1457 100%)',
      personas: ['ai_persona_aileen_carol'],
      firstMessage: 'genZStudents.lowEnergy.firstMessage'
    }
  },
  
  analytics: {
    pixelId: '690577344043788',
    gtag: 'G-TPKTH33FNE'
  }
};