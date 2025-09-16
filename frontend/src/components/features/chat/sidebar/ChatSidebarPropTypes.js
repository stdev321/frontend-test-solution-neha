import PropTypes from 'prop-types';

const ChatSidebarPropTypes = {
  conversationId: PropTypes.string, 
  conversationDetails: PropTypes.object, 
  conversationsList: PropTypes.array.isRequired,
  isLoading: PropTypes.bool, 
  isCreatingConversation: PropTypes.bool, 
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

  onNewConversation: PropTypes.func.isRequired,
  onUpdateTitle: PropTypes.func.isRequired, 
  onDeleteConversation: PropTypes.func.isRequired, 

  contentMode: PropTypes.oneOf([
    'default', 'bio', 'personaList', 'profile', 'summary', 'transcript', 
    'specialist', 'newConversationSetup', 'selectSpecialists', 
    'encyclopediaQuery', 'manageTeamView', 'chatConfigurationView',
    'activeChatView', 'differentialOpinion', 'teamRecommendationQuestionnaire', 
    'teamRecommendationResults'
  ]).isRequired,
  onSetMode: PropTypes.func.isRequired,
  data: PropTypes.any, 

  conversationPersonas: PropTypes.array, 
  onSelectPersona: PropTypes.func, 
  activePersonaId: PropTypes.string, 
  availablePersonasForSelection: PropTypes.array,
  selectedPersonaIds: PropTypes.object,
  onPersonaSelectionChange: PropTypes.func,
  onStartWithSelectedSpecialists: PropTypes.func,
  personaApiLoading: PropTypes.bool,
  personaApiError: PropTypes.string,
  
  initialChoice: PropTypes.string,
  onSetInitialChoice: PropTypes.func,
  onConfirmInitialChoice: PropTypes.func,

  onEncyclopediaQuery: PropTypes.func.isRequired,
  onEncyclopediaReset: PropTypes.func.isRequired,
  encyclopediaResponse: PropTypes.object, 
  encyclopediaLoading: PropTypes.bool,    
  encyclopediaError: PropTypes.object,

  addAdviserToUserTeam: PropTypes.func, 
  removeAdviserFromUserTeam: PropTypes.func,

  profileData: PropTypes.object, 
  profileLoading: PropTypes.bool,
  profileError: PropTypes.string,
  onUpdateProfile: PropTypes.func.isRequired,

  allPersonas: PropTypes.array,
  onRefreshConversation: PropTypes.func, 

  handleStartTeamConversation: PropTypes.func.isRequired, 
  handleStartAileenCarolConversation: PropTypes.func.isRequired, 
  handleSelectSubsetConversation: PropTypes.func.isRequired, 
  handleSelectSingleSpecialistConversation: PropTypes.func.isRequired,
  
  isSingleSpecialistModeActive: PropTypes.bool.isRequired,
  setAvailablePersonasForSelection: PropTypes.func.isRequired,
  setSidebarContentMode: PropTypes.func.isRequired,

  onParticipantTileClick: PropTypes.func,
  onShowSpecialistsGrid: PropTypes.func,
  onShowSpecialistsGridOnly: PropTypes.func,
  onAITeamBuilder: PropTypes.func,
  chatAreaContentMode: PropTypes.string,
  sidebarData: PropTypes.string,
  onGetSummary: PropTypes.func,
  onGetDifferentialOpinion: PropTypes.func,
  onGetTranscript: PropTypes.func,
  onExitChat: PropTypes.func,
  currentUser: PropTypes.object, 
  uploadedImagePreviewUrl: PropTypes.string, 
  onClearSidebarImagePreview: PropTypes.func, 
  sendMessage: PropTypes.func, 

  activeImageStack: PropTypes.array,
  onPromoteCropToStack: PropTypes.func,
  onClearAllImages: PropTypes.func,
  onToggleImageVisibility: PropTypes.func,
  onDeleteImage: PropTypes.func,
  onSetFocusedImage: PropTypes.func,
  onFilesSelectedForContext: PropTypes.func,

  // Team recommendation props
  onSubmitQuestionnaire: PropTypes.func,
  onAcceptTeamRecommendation: PropTypes.func,
  isGettingRecommendation: PropTypes.bool,
  isApplyingRecommendation: PropTypes.bool,
  recommendationData: PropTypes.object,
  recommendationError: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default ChatSidebarPropTypes; 