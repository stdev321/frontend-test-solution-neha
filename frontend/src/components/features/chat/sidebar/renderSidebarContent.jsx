import React from 'react';
import { Box, Typography, Paper, Button, Alert, Stack } from '@mui/material';
import { ThinkingIndicator } from '../../../common/ThinkingIndicator';
import { Psychology } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BioPanel from './BioPanel';
import SummaryPanel from './SummaryPanel';
import TranscriptPanel from './TranscriptPanel';
import PersonaListPanel from './PersonaListPanel';
import ActiveChatParticipantsPanel from './ActiveChatParticipantsPanel';
import ChatConfiguratorPanel from './ChatConfiguratorPanel';
import SpecialistPanel from './SpecialistPanel';
import NewConversationPanel from './NewConversationPanel';
import EncyclopediaPanel from './EncyclopediaPanel';
import ImageContextPanel from './ImageContextPanel';
import ImageProcessingToolbar from './ImageProcessingToolbar';
import ProfilePanel from './ProfilePanel';
import AccountPanel from './AccountPanel';
import ConsultationsPanel from './ConsultationsPanel';
import ManageTeamPanel from './ManageTeamPanel';
import { formatDifferentialOpinionText, personalizePatientReferences } from './helpers';
import TeamRecommendationQuestionnaire from './TeamRecommendationQuestionnaire';
import TeamRecommendationResults from './TeamRecommendationResults';
import DifferentialOpinionPanel from './DifferentialOpinionPanel';
import TranslatedPersonaListPanel from './TranslatedPersonaListPanel';

const renderSidebarContent = (args) => {
    const {
        t,
        contentMode,
        data,
        chatAreaContentMode,
        onSetMode,
        conversationId,
        profileData,
        currentUser,
        onSelectPersona,
        activePersonaId,
        onDeleteConversation,    // if referenced
        // plus all handlers / state vars you see inside
        myAdvisers,
        isLoadingMyAdvisers,
        isCreatingConversation,
        handleStartTeamConversation,
        handleRemoveAdviserFromTeam,
        isLoading,
        sidebarErrorProp,
        conversationDetails,
        allPersonas,
        activeChatSubView,
        setActiveChatSubView,
        activeImageStack,
        uploadedImagePreviewUrl,
        sendMessage,
        onPromoteCropToStack,
        onClearAllImages,
        onToggleImageVisibility,
        onDeleteImage,
        profileLoading,
        profileError,
        onUpdateProfile,
        initialChoice,
        onSetInitialChoice,
        onConfirmInitialChoice,
        availablePersonasForSelection,
        selectedPersonaIds,
        onPersonaSelectionChange,
        personaApiLoading,
        personaApiError,
        onStartWithSelectedSpecialists,
        isSingleSpecialistModeActive,
        setSidebarContentMode,
        handleStartAileenCarolConversation,
        handleSelectSingleSpecialistConversation,
        handleSelectSubsetConversation,
        onEncyclopediaQuery,
        onEncyclopediaReset,
        encyclopediaResponse,
        encyclopediaLoading,
        encyclopediaError,
        DifferentialOpinionRef,
        handleDifferentialOpinionPrint,
        copyDifferentialOpinionToClipboard,
        selectedIds,
        setSelectedIds,
        conversationsList,
        openMultiDelete,
        dialogError,
        isListLoading,
        isActionInProgress,
        handleClickEditItem,
        handleClickDeleteItem,
        handleParticipantCardClick,
        onFilesSelectedForContext,
        onSetFocusedImage,
        onShowSpecialistsGrid,
        onUpdateTitle,
        myAdvisersError,
        handleAddAdviserToTeam,
        onSubmitQuestionnaire,
        onAcceptTeamRecommendation,
        isGettingRecommendation,
        isApplyingRecommendation,
        recommendationData,
        recommendationError,
        isGuestMode,
        // ... any additional vars
    } = args;

    if (sidebarErrorProp) {
        const errorMessage =
            typeof sidebarErrorProp === 'string'
                ? sidebarErrorProp
                : sidebarErrorProp?.message || 'Error loading data.';
        return <Alert severity="error">{errorMessage}</Alert>;
    }

    switch (contentMode) {
        case 'bio':
            return data ? (
                <BioPanel
                    data={data}
                    onReturnToPanel={() => {
                        // Always return to the "Panel" view for non-conversation pages,
                        // which is the My AI Health Team list (personaList). For active
                        // conversations, the Bio view is handled in activeChatView and
                        // returns to the participants panel there.
                        if (onSetMode) {
                            if (conversationId) onSetMode('activeChatView');
                            else onSetMode('personaList');
                        }
                    }}
                />
            ) : (
                <Typography sx={{ p: 2 }}>Loading bio...</Typography>
            );
        case 'summary':
            const personalizedSummary = personalizePatientReferences(data, profileData, currentUser);

            return personalizedSummary ? (
                <SummaryPanel
                    data={personalizedSummary}
                    onReturnToPanel={() => {
                        if (onSetMode) {
                            if (conversationId) onSetMode('activeChatView');
                            else onSetMode('default');
                        }
                    }}
                    onShowTranscript={() => onSetMode && onSetMode('transcript')}
                />
            ) : <Typography sx={{ p: 2 }}>No summary available.</Typography>;
        case 'transcript':
            return data ? (
                <TranscriptPanel
                    data={data}
                    onReturnToPanel={() => {
                        if (onSetMode) {
                            if (conversationId) onSetMode('activeChatView');
                            else onSetMode('default');
                        }
                    }}
                    onShowSummary={() => onSetMode && onSetMode('summary')}
                />
            ) : <Typography sx={{ p: 2 }}>Loading transcript...</Typography>;
        case 'personaList':

            let personasToList = [];


            let listIsActuallyLoading = isLoading || isLoadingMyAdvisers;

            if (conversationId && conversationDetails?.personas?.length > 0) {
                personasToList = conversationDetails.personas;
                listIsActuallyLoading = isLoading;
            } else {
                personasToList = myAdvisers || [];
            }

            if (!personasToList.find(p => p.id?.toLowerCase() === 'ai_persona_aileen_carol')) {
                const aileenCarolObj = (allPersonas || []).find(
                    p => p.id?.toLowerCase() === 'ai_persona_aileen_carol'
                );
                if (aileenCarolObj) personasToList.unshift(aileenCarolObj);
            }

            if (listIsActuallyLoading && personasToList.length === 0) {
                return <ThinkingIndicator sx={{ display: 'block', margin: '20px auto' }} />;
            }

            if (!listIsActuallyLoading && personasToList.length === 0) {
                if (conversationId) {
                    return <Typography sx={{ p: 2, textAlign: 'center' }}>No specialists currently in this chat.</Typography>;
                } else {

                    return <Typography sx={{ p: 2, textAlign: 'center' }}>No AI Health Advisers selected. You can manage your advisers in your profile.</Typography>;
                }
            }

            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', px: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {t('team.myAIHealthTeam')}
                    </Typography>



                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        <TranslatedPersonaListPanel
                            personas={personasToList}
                            onSelectPersona={onSelectPersona}
                            activePersonaId={activePersonaId}
                            onRemovePersona={handleRemoveAdviserFromTeam}
                            nonRemovableIds={['ai_persona_aileen_carol']}
                            showRemoveIcon={!!conversationId || chatAreaContentMode === 'specialistsGrid'}
                            onSendMessage={conversationId ? sendMessage : null}
                        />

                        {chatAreaContentMode === 'specialistsGrid' && (
                            <Box sx={{ mt: 2, textAlign: 'left' }}> 
                                <Typography variant="subtitle2" >
                                    {t('team.addMembersInstruction')}
                                </Typography>
                                <Typography variant="caption" component="p"> 
                                    {t('team.maxTeamSizeNote')}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {!conversationId && personasToList.length > 0 && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleStartTeamConversation}
                                disabled={isCreatingConversation || isLoadingMyAdvisers}
                                sx={{
                                    py: 1,
                                    px: 2,
                                    fontSize: '0.875rem',
                                    fontWeight: 'medium',
                                    color: '#FFFFFF !important',
                                    minWidth: 'auto',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {isCreatingConversation ? (
                                    <>
                                        <ThinkingIndicator showDots={false} sx={{ mr: 1, color: 'inherit' }} />
                                        {t('team.starting')}
                                    </>
                                ) : (
                                    t('team.startTeamConsult')
                                )}
                            </Button>
                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
                                {t('team.startConsultationWithTeam')}
                            </Typography>
                        </Box>
                    )}
                </Box>
            );
        case 'activeChatView':
            if (!conversationDetails) {
                return (
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <ThinkingIndicator showDots={false} />
                        <Typography sx={{ ml: 1 }}>Loading chat...</Typography>
                    </Box>
                );
            }

            if (activeChatSubView === 'participantsPanel') {
                if (!conversationDetails.personas) {
                    return (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <ThinkingIndicator showDots={false} />
                            <Typography sx={{ ml: 1 }}>Loading participants...</Typography>
                        </Box>
                    );
                }
                return (
                    <ActiveChatParticipantsPanel
                        conversationPersonas={conversationDetails.personas || []}
                        currentUserProfile={profileData}
                        onParticipantClick={handleParticipantCardClick}
                        activeSpeakerId={activePersonaId}
                        onSendMessage={sendMessage}
                        isGuestMode={isGuestMode}
                        allPersonas={allPersonas}
                    />
                );
            } else if (activeChatSubView === 'bioView') {
                if (!data) {
                    return (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <ThinkingIndicator showDots={false} />
                            <Typography sx={{ ml: 1 }}>Loading bio...</Typography>
                        </Box>
                    );
                }

                return (
                    <BioPanel
                        data={data}
                        onReturnToPanel={() => setActiveChatSubView('participantsPanel')}
                    />
                );

            } else if (activeChatSubView === 'uploadedImageView') {

                if (!activeImageStack || activeImageStack.length === 0) {
                    setActiveChatSubView('participantsPanel');
                    return (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography color="text.secondary">No image active.</Typography>
                        </Box>
                    );
                }
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <ImageProcessingToolbar
                            activeImageStack={activeImageStack}
                            uploadedImagePreviewUrl={uploadedImagePreviewUrl}
                            onAddProcessedImageFile={onFilesSelectedForContext}
                            onSetFocusedImage={onSetFocusedImage}
                        />

                        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                            <ImageContextPanel
                                currentImageStack={activeImageStack}
                                sendMessage={sendMessage}
                                conversationId={conversationId}
                                onPromoteCropToStack={onPromoteCropToStack}
                                onClearAllImages={onClearAllImages}
                                // onToggleImageVisibility={onToggleImageVisibility} // Commented out - removing hide functionality
                                onDeleteImage={onDeleteImage}
                                uploadedImagePreviewUrl={uploadedImagePreviewUrl}
                            />
                        </Box>
                    </Box>
                );
            }

            // Default to participants panel if no matching subview
            if (conversationDetails && conversationDetails.personas) {
                return (
                    <ActiveChatParticipantsPanel
                        conversationPersonas={conversationDetails.personas || []}
                        currentUserProfile={profileData}
                        onParticipantClick={handleParticipantCardClick}
                        activeSpeakerId={activePersonaId}
                        onSendMessage={sendMessage}
                        isGuestMode={isGuestMode}
                        allPersonas={allPersonas}
                    />
                );
            }

            return <Typography sx={{ p: 2 }}>Error: Unknown active chat view.</Typography>;
        case 'profile':
            return <ProfilePanel
                profileData={profileData}
                isLoading={profileLoading}
                error={profileError}
                onSaveChanges={onUpdateProfile}
                onNavigateToManageTeam={onShowSpecialistsGrid}
                onNavigateToAccount={() => onSetMode('account')}
                isGuestMode={isGuestMode}
            />;
        case 'account':
            return <AccountPanel />;
        case 'newConversationSetup':
            return (
                <NewConversationPanel
                    initialChoice={initialChoice}
                    onSetInitialChoice={onSetInitialChoice}
                    onConfirmInitialChoice={onConfirmInitialChoice}
                    personaApiLoading={personaApiLoading}
                    isCreatingConversation={isCreatingConversation}
                    personaApiError={personaApiError}
                    onSetMode={onSetMode}
                />
            );
        case 'selectSpecialists':
            return <SpecialistPanel
                availablePersonasForSelection={availablePersonasForSelection}
                selectedPersonaIds={selectedPersonaIds}
                onPersonaSelectionChange={onPersonaSelectionChange}
                isCreatingConversation={isCreatingConversation || personaApiLoading}
                onSetMode={onSetMode}
                personaApiLoading={personaApiLoading}
                personaApiError={personaApiError}
                onStartWithSelectedSpecialists={onStartWithSelectedSpecialists}
                isSingleSpecialistModeActive={isSingleSpecialistModeActive}
                setSidebarContentMode={setSidebarContentMode}
            />;
        case 'chatConfigurationView': {
            const aileenCarolObject = (allPersonas || []).find(p => p.id?.toLowerCase() === 'ai_persona_aileen_carol');
            return (
                <ChatConfiguratorPanel
                    myAdvisers={myAdvisers || []}
                    aileenCarolDetails={aileenCarolObject || null}
                    onStartWithAileenCarolOnly={handleStartAileenCarolConversation}
                    onStartWithSingleSpecialist={handleSelectSingleSpecialistConversation}
                    onStartWithSpecialistsAndAileenCarol={handleSelectSubsetConversation}
                    isCreatingConversation={isCreatingConversation}
                    onNavigateToManageTeam={onShowSpecialistsGrid}
                />
            );
        }
        case 'manageTeamView': {
            return (
                <ManageTeamPanel
                    myAdvisers={myAdvisers || []}
                    allSystemPersonas={allPersonas || []}
                    onAddAdviser={handleAddAdviserToTeam}
                    onRemoveAdviser={handleRemoveAdviserFromTeam}
                    isLoading={isLoadingMyAdvisers}
                    error={myAdvisersError}
                    onSetMode={onSetMode}
                />
            );
        }
        case 'specialist':
            return (
                <Paper elevation={0} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Talk to a Specialist</Typography>
                    <Typography>This feature is coming soon!</Typography>
                </Paper>
            );
        case 'encyclopediaQuery':
            return <EncyclopediaPanel
                onSubmit={onEncyclopediaQuery}
                onReset={onEncyclopediaReset}
                response={encyclopediaResponse}
                isLoading={encyclopediaLoading}
                error={encyclopediaError}
            />;
        case 'differentialOpinion':
            return (
                <DifferentialOpinionPanel
                    data={data}
                    profileData={profileData}
                    currentUser={currentUser}
                    conversationId={conversationId}
                    onSetMode={onSetMode}
                    onPrint={handleDifferentialOpinionPrint}
                    onCopy={copyDifferentialOpinionToClipboard}
                    panelRef={DifferentialOpinionRef}
                />
            );
        case 'default':
            return (
                <ConsultationsPanel
                    conversationId={conversationId}
                    conversationDetails={conversationDetails}
                    conversationsList={conversationsList}
                    onUpdateTitle={onUpdateTitle}
                    isListLoading={isListLoading}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    handleClickEditItem={handleClickEditItem}
                    handleClickDeleteItem={handleClickDeleteItem}
                    onTriggerMultiDelete={openMultiDelete}
                    dialogError={dialogError}
                    isActionInProgress={isActionInProgress}
                />
            );
        case 'teamRecommendationQuestionnaire':
            return <TeamRecommendationQuestionnaire
                onSubmit={onSubmitQuestionnaire}
                onCancel={() => {
                    onSetMode('personaList');
                    if (onShowSpecialistsGrid) onShowSpecialistsGrid();
                }}
                isLoading={isGettingRecommendation}
                error={recommendationError}
                myAdvisers={myAdvisers}
                profileData={profileData}
                currentUser={currentUser}
            />;
        case 'teamRecommendationResults':
            return <TeamRecommendationResults
                recommendationData={recommendationData}
                availablePersonas={allPersonas}
                onAcceptTeam={onAcceptTeamRecommendation}
                onRetry={() => onSetMode('teamRecommendationQuestionnaire')}
                onCancel={() => {
                    onSetMode('personaList');
                    if (onShowSpecialistsGrid) onShowSpecialistsGrid();
                }}
                isApplying={isApplyingRecommendation}
                error={recommendationError}
            />;
        default:
            return (
                <ConsultationsPanel
                    conversationId={conversationId}
                    conversationDetails={conversationDetails}
                    conversationsList={conversationsList}
                    onUpdateTitle={onUpdateTitle}
                    isListLoading={isListLoading}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    handleClickEditItem={handleClickEditItem}
                    handleClickDeleteItem={handleClickDeleteItem}
                    onTriggerMultiDelete={openMultiDelete}
                    dialogError={dialogError}
                    isActionInProgress={isActionInProgress}
                />
            );
    }
};
export default renderSidebarContent;