const ConversationCache = {
  CACHE_DURATION: 86400000, // 24 hours in milliseconds
  
  getCacheKey(conversationId, type) {
    return `conversation_${conversationId}_${type}`;
  },
  
  get(conversationId, type) {
    const key = this.getCacheKey(conversationId, type);
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > this.CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  },
  
  set(conversationId, type, content) {
    const key = this.getCacheKey(conversationId, type);
    localStorage.setItem(key, JSON.stringify({
      content,
      timestamp: Date.now()
    }));
  },
  
  clear(conversationId, type) {
    const key = this.getCacheKey(conversationId, type);
    localStorage.removeItem(key);
  },
  
  clearAll(conversationId) {
    ['summary', 'differentialOpinion', 'transcript', 'encyclopedia'].forEach(type => {
      this.clear(conversationId, type);
    });
  }
};

export const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) {
    return 'just now';
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

export default ConversationCache;