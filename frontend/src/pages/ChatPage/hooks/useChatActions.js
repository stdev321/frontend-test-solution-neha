import React, { useState, useCallback } from 'react';
import { 
  getConversationSummary,
  createSummaryJob,
  getSummaryJob,
  createDifferentialOpinionJob,
  getDifferentialOpinionJob,
  post
} from '../../../services/api';
import ConversationCache from '../../../utils/conversationCache';

const WORD_THRESHOLD = 150; // Minimum words required for summary/differential opinion

export const useChatActions = ({
  messages,
  currentUser,
  profileData,
  conversationId,
  conversationDetails,
  allPersonas,
  lastGeneratedSummary,
  setSidebarError,
  setSidebarIsLoading,
  setSidebarData,
  setSidebarContentMode,
  setMoreInfoNeededDialogOpen,
  setLastGeneratedSummary,
  setSummaryCache,
  setConversationDetails,
  setConversationsList,
}) => {
  const [actionLoading, setActionLoading] = useState({
    summary: false,
    transcript: false,
    differentialOpinion: false,
  });

  const buildTranscript = useCallback(() => {
    if (!Array.isArray(messages) || messages.length === 0) return '';

    const tz = 'America/New_York';

    const parseToValidDate = (value) => {
      try {
        if (value instanceof Date) {
          return isNaN(value.getTime()) ? new Date() : value;
        }
        if (typeof value === 'number') {
          const d = new Date(value);
          return isNaN(d.getTime()) ? new Date() : d;
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          // Try as-is
          let d = new Date(trimmed);
          if (!isNaN(d.getTime())) return d;
          // Try appending Z if missing timezone
          if (!/Z$/i.test(trimmed)) {
            d = new Date(trimmed.replace(' ', 'T') + 'Z');
            if (!isNaN(d.getTime())) return d;
          }
        }
      } catch (_) {
        // ignore and fall through
      }
      return new Date();
    };

    const headerSourceRaw = conversationDetails?.created_at || messages[0]?.timestamp || Date.now();
    const headerDateObj = parseToValidDate(headerSourceRaw);
    const headerDate = headerDateObj
      .toLocaleString('en-US', {
        timeZone: tz,
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace('AM', 'am')
      .replace('PM', 'pm');

    const personaNameMap = {};
    (allPersonas || []).forEach((p) => {
      if (p && p.id) personaNameMap[p.id] = p.name || p.id;
    });

    let transcriptText = `Conversation: ${conversationDetails?.title || 'Untitled'}\n`;
    transcriptText += `Date: ${headerDate}\n\n`;
    let currentDay = (() => {
      try {
        return headerDateObj.toISOString().slice(0, 10);
      } catch (_) {
        return new Date().toISOString().slice(0, 10);
      }
    })();

    messages.forEach((m) => {
      const timestampSource = m.timestamp || m.created_at || Date.now();
      const dateObj = parseToValidDate(timestampSource);
      let dayStr = currentDay;
      try {
        dayStr = dateObj.toISOString().slice(0, 10);
      } catch (_) {
        // keep previous dayStr
      }
      if (dayStr !== currentDay) {
        const readableDay = dateObj.toLocaleDateString('en-US', {
          timeZone: tz,
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
        transcriptText += `Date: ${readableDay}\n\n`;
        currentDay = dayStr;
      }
      const speaker = (m.role === 'assistant' || m.sender_type === 'ASSISTANT')
        ? (personaNameMap[m.persona_id] || 'Assistant')
        : (profileData?.full_name || profileData?.display_name || currentUser?.email || 'Patient');
      transcriptText += `**${speaker}:** ${m.content}\n\n`;
    });
    return transcriptText;
  }, [messages, conversationDetails, allPersonas, profileData, currentUser]);

  const handleGetDifferentialOpinion = useCallback(async () => {
    console.log('useChatActions: handleGetDifferentialOpinion called, conversationId:', conversationId);
    if (!conversationId) {
      console.log('useChatActions: ERROR - No conversationId provided for differential opinion!');
      setSidebarError("No conversation selected to get differential opinion.");
      return null;
    }

    // Check if conversation has enough content
    if (!conversationDetails || (Array.isArray(messages) && messages.length > 0)) {
      let totalUserWords = 0;
      if (Array.isArray(messages) && messages.length > 0) {
        totalUserWords = messages
          .filter(m => (m.role === 'user' || m.sender_type === 'USER'))
          .reduce((acc, msg) => acc + localCountWords(msg.content), 0);
      }
      if (totalUserWords < WORD_THRESHOLD) {
        if (setMoreInfoNeededDialogOpen) setMoreInfoNeededDialogOpen(true);
        return null;
      }
    }

    setActionLoading(prev => ({ ...prev, differentialOpinion: true }));
    setSidebarError('');

    try {
      const { job_id } = await createDifferentialOpinionJob(conversationId);

      // simple polling with backoff
      let delayMs = 1500;
      const maxDelay = 10000;
      const maxTimeMs = 10 * 60 * 1000; // 10 minutes
      const start = Date.now();
      while (true) {
        const job = await getDifferentialOpinionJob(job_id);
        if (job.status === 'completed') {
          const data = { type: 'differentialOpinion', content: job.content };
          setSidebarData(data);
          setSidebarContentMode('differentialOpinion');
          
          // Save to cache
          ConversationCache.set(conversationId, 'differentialOpinion', data);
          break;
        }
        if (job.status === 'failed') {
          throw new Error(job.error_message || 'Differential opinion failed');
        }
        if (Date.now() - start > maxTimeMs) {
          throw new Error('Differential opinion is taking longer than expected. Please try again later.');
        }
        await new Promise(r => setTimeout(r, delayMs));
        delayMs = Math.min(maxDelay, Math.round(delayMs * 1.4));
      }
    } catch (error) {
      console.error('Differential opinion error:', error);
      const errorMessage = error.message || 'Failed to get differential opinion';
      setSidebarError('Failed to get differential opinion: ' + errorMessage);
      setSidebarContentMode('default');
    } finally {
      setActionLoading(prev => ({ ...prev, differentialOpinion: false }));
    }
  }, [conversationId, messages, conversationDetails, setMoreInfoNeededDialogOpen, 
      lastGeneratedSummary, buildTranscript, setActionLoading, setSidebarData, 
      setSidebarContentMode, setSidebarError]);

  const localCountWords = (text) => text ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleGetSummary = useCallback(async () => {
    console.log('useChatActions: handleGetSummary called, conversationId:', conversationId);
    if (!conversationId) {
      console.log('useChatActions: ERROR - No conversationId provided!');
      setSidebarError("No conversation selected to get summary.");
      return null;
    }

    console.log('useChatActions: Summary - Checking conversation details and messages...', {
      conversationDetails: !!conversationDetails,
      messagesLength: Array.isArray(messages) ? messages.length : 'not array',
    });

    if (!conversationDetails || (Array.isArray(messages) && messages.length > 0)) {
      let totalUserWords = 0;
      if (Array.isArray(messages) && messages.length > 0) {
        totalUserWords = messages
          .filter(m => (m.role === 'user' || m.sender_type === 'USER'))
          .reduce((acc, msg) => acc + localCountWords(msg.content), 0);
      }
      console.log('useChatActions: Summary - Word count check - totalUserWords:', totalUserWords, 'threshold:', WORD_THRESHOLD);
      if (totalUserWords < WORD_THRESHOLD) {
        console.log('useChatActions: Summary - Not enough words, opening "more info needed" dialog');
        if (setMoreInfoNeededDialogOpen) setMoreInfoNeededDialogOpen(true);
        return null;
      }
    }
    
    console.log('useChatActions: Summary - Proceeding with summary generation...');
    setActionLoading(s => ({ ...s, summary: true }));
    if(setSidebarError) setSidebarError('');

    try {
      // Kick off async job and poll
      const { job_id } = await createSummaryJob(conversationId);
      let delayMs = 1500;
      const maxDelay = 10000;
      const maxTimeMs = 10 * 60 * 1000; // 10 minutes
      const start = Date.now();
      let finalTitle = conversationDetails?.title;
      let summaryText = null;
      while (true) {
        const job = await getSummaryJob(job_id);
        if (job.status === 'completed') {
          summaryText = job.summary_text;
          finalTitle = job.final_title || finalTitle;
          break;
        }
        if (job.status === 'failed') {
          throw new Error(job.error_message || 'Summary generation failed');
        }
        if (Date.now() - start > maxTimeMs) {
          throw new Error('Summary is taking longer than expected. Please try again later.');
        }
        await new Promise(r => setTimeout(r, delayMs));
        delayMs = Math.min(maxDelay, Math.round(delayMs * 1.4));
      }

      if (summaryText) {
        if(setSidebarData) setSidebarData(summaryText);
        if(setSidebarContentMode) setSidebarContentMode('summary');
        if(setLastGeneratedSummary) setLastGeneratedSummary(summaryText);
        
        // Save to cache
        ConversationCache.set(conversationId, 'summary', summaryText);
        
        if(setSummaryCache) setSummaryCache(prev => ({
          ...prev,
          [conversationId]: {
            summary: summaryText,
            messageCount: messages.length,
          },
        }));
        if (finalTitle && conversationDetails?.title !== finalTitle) {
          if(setConversationDetails) setConversationDetails(prev => prev ? { ...prev, title: finalTitle } : null);
          if(setConversationsList) setConversationsList(prevList => prevList.map(c =>
            c.id === conversationId ? { ...c, title: finalTitle } : c
          ));
        }
        return summaryText;
      } else {
        throw new Error('Invalid summary response received');
      }
    } catch (err) {
      if(setSidebarError) setSidebarError(`Failed to load summary: ${err.message}`);
      throw err;
    } finally {
      setActionLoading(s => ({ ...s, summary: false }));
    }
  }, [
    conversationId, messages, conversationDetails, setMoreInfoNeededDialogOpen, 
    setActionLoading, setSidebarError, setSidebarIsLoading, setSidebarData, setSidebarContentMode, 
    setLastGeneratedSummary, setSummaryCache, setConversationDetails, setConversationsList
  ]);

  const handleGetTranscript = useCallback(async () => {
    console.log('useChatActions: handleGetTranscript called, conversationId:', conversationId);
    if (!conversationId) {
      console.log('useChatActions: ERROR - No conversationId provided for transcript!');
      if(setSidebarError) setSidebarError("No conversation selected to get transcript.");
      return;
    }
    
    if (!conversationDetails || (Array.isArray(messages) && messages.length > 0)) {
      let totalUserWords = 0;
      if (Array.isArray(messages) && messages.length > 0) {
        totalUserWords = messages
          .filter(m => (m.role === 'user' || m.sender_type === 'USER'))
          .reduce((acc, msg) => acc + localCountWords(msg.content), 0);
      }
      if (totalUserWords < WORD_THRESHOLD) {
        if (setMoreInfoNeededDialogOpen) setMoreInfoNeededDialogOpen(true);
        return;
      }
    }

    setActionLoading(s => ({ ...s, transcript: true }));
    if(setSidebarError) setSidebarError('');
    if(setSidebarIsLoading) setSidebarIsLoading(true);
    if(setSidebarData) setSidebarData(null);
    if(setSidebarContentMode) setSidebarContentMode('transcript');
    try {
      const text = buildTranscript();
      const transcriptData = { transcript: text };
      if(setSidebarData) setSidebarData(transcriptData);
      
      // Save to cache
      ConversationCache.set(conversationId, 'transcript', transcriptData);
    } catch (err) {
      if(setSidebarError) setSidebarError(`Failed to load transcript: ${err.message}`);
      if(setSidebarContentMode) setSidebarContentMode('default');
    } finally {
      setActionLoading(s => ({ ...s, transcript: false }));
      if(setSidebarIsLoading) setSidebarIsLoading(false);
    }
  }, [
    conversationId, messages, conversationDetails, buildTranscript, setMoreInfoNeededDialogOpen,
    setActionLoading, setSidebarError, setSidebarIsLoading, setSidebarData, setSidebarContentMode
  ]);

  return {
    actionLoading,
    handleGetSummary,
    handleGetTranscript,
    handleGetDifferentialOpinion,
  };
}; 