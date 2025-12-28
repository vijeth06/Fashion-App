import apiService from './apiService';
import { getAnalytics } from './AnalyticsService';
export class SocialFashionHub {
  constructor() {
    this.analytics = getAnalytics();
    this.currentUser = null;
    this.realTimeConnections = new Map();
    this.notificationListeners = [];
  }
  setUser(user) {
    this.currentUser = user;
  }
  async shareOutfitLook(outfitData, options = {}) {
    try {
      const look = {
        userId: this.currentUser?.uid,
        userName: this.currentUser?.displayName || 'Fashion Enthusiast',
        userAvatar: this.currentUser?.photoURL,
        outfit: outfitData.items,
        caption: options.caption || '',
        tags: options.tags || [],
        occasion: options.occasion,
        season: options.season,
        isPublic: options.isPublic !== false,
        allowComments: options.allowComments !== false,
        timestamp: Date.now(),
        location: options.location,
        mood: options.mood,
        styleInspo: options.styleInspo,
        shoppableLinks: this.generateShoppableLinks(outfitData.items)
      };
      const response = await apiService.post('/api/social/looks/share', look);
      if (response.success) {
        this.analytics.trackEvent('outfit_shared', {
          lookId: response.lookId,
          itemCount: outfitData.items.length,
          tags: options.tags
        });
        await this.notifyFollowers('new_look', response.lookId);
      }
      return response;
    } catch (error) {
      console.error('Error sharing outfit:', error);
      throw error;
    }
  }
  async startLiveStylingSession(sessionData) {
    try {
      const session = {
        hostId: this.currentUser?.uid,
        hostName: this.currentUser?.displayName,
        title: sessionData.title,
        description: sessionData.description,
        category: sessionData.category, // 'styling-tips', 'outfit-building', 'trend-talk'
        maxViewers: sessionData.maxViewers || 100,
        isInteractive: sessionData.isInteractive !== false,
        scheduledFor: sessionData.scheduledFor || Date.now(),
        duration: sessionData.duration || 30, // minutes
        status: 'live'
      };
      const response = await apiService.post('/api/social/live/start', session);
      if (response.success) {
        this.setupLiveSessionHandlers(response.sessionId);
        this.analytics.trackEvent('live_session_started', {
          sessionId: response.sessionId,
          category: session.category
        });
      }
      return response;
    } catch (error) {
      console.error('Error starting live session:', error);
      throw error;
    }
  }
  async joinLiveStylingSession(sessionId) {
    try {
      const response = await apiService.post(`/api/social/live/${sessionId}/join`, {
        userId: this.currentUser?.uid,
        userName: this.currentUser?.displayName
      });
      if (response.success) {
        this.setupLiveViewerHandlers(sessionId);
        this.analytics.trackEvent('live_session_joined', {
          sessionId
        });
      }
      return response;
    } catch (error) {
      console.error('Error joining live session:', error);
      throw error;
    }
  }
  async sendLiveMessage(sessionId, message) {
    try {
      await apiService.post(`/api/social/live/${sessionId}/chat`, {
        userId: this.currentUser?.uid,
        userName: this.currentUser?.displayName,
        message,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error sending live message:', error);
    }
  }
  async requestStylingHelp(requestData) {
    try {
      const request = {
        userId: this.currentUser?.uid,
        userName: this.currentUser?.displayName,
        outfit: requestData.outfit,
        question: requestData.question,
        context: {
          occasion: requestData.occasion,
          budget: requestData.budget,
          stylePreference: requestData.stylePreference
        },
        urgency: requestData.urgency || 'normal', // 'urgent', 'normal', 'casual'
        rewardPoints: requestData.rewardPoints || 0,
        status: 'open',
        timestamp: Date.now()
      };
      const response = await apiService.post('/api/social/help-requests/create', request);
      if (response.success) {
        this.analytics.trackEvent('styling_help_requested', {
          requestId: response.requestId,
          urgency: request.urgency
        });
      }
      return response;
    } catch (error) {
      console.error('Error requesting styling help:', error);
      throw error;
    }
  }
  async provideSuggestion(requestId, suggestionData) {
    try {
      const suggestion = {
        requestId,
        userId: this.currentUser?.uid,
        userName: this.currentUser?.displayName,
        suggestion: suggestionData.suggestion,
        recommendedItems: suggestionData.recommendedItems || [],
        reasoning: suggestionData.reasoning,
        visualReference: suggestionData.visualReference,
        timestamp: Date.now()
      };
      const response = await apiService.post(`/api/social/help-requests/${requestId}/suggestions`, suggestion);
      if (response.success) {
        this.analytics.trackEvent('suggestion_provided', {
          requestId
        });
      }
      return response;
    } catch (error) {
      console.error('Error providing suggestion:', error);
      throw error;
    }
  }
  async createStyleChallenge(challengeData) {
    try {
      const challenge = {
        creatorId: this.currentUser?.uid,
        creatorName: this.currentUser?.displayName,
        title: challengeData.title,
        description: challengeData.description,
        rules: challengeData.rules,
        theme: challengeData.theme, // 'monochrome', 'vintage', 'sustainable', etc.
        constraints: challengeData.constraints, // color limits, item count, budget
        startDate: challengeData.startDate || Date.now(),
        endDate: challengeData.endDate,
        prizes: challengeData.prizes,
        hashtag: challengeData.hashtag,
        judging: challengeData.judging || 'community-vote', // 'community-vote', 'expert-panel', 'ai-score'
        status: 'active'
      };
      const response = await apiService.post('/api/social/challenges/create', challenge);
      if (response.success) {
        this.analytics.trackEvent('challenge_created', {
          challengeId: response.challengeId,
          theme: challenge.theme
        });
      }
      return response;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }
  async submitChallengeEntry(challengeId, entryData) {
    try {
      const entry = {
        challengeId,
        userId: this.currentUser?.uid,
        userName: this.currentUser?.displayName,
        outfit: entryData.outfit,
        story: entryData.story,
        hashtags: entryData.hashtags,
        meetsCriteria: await this.validateChallengeEntry(challengeId, entryData),
        timestamp: Date.now()
      };
      const response = await apiService.post(`/api/social/challenges/${challengeId}/submit`, entry);
      if (response.success) {
        this.analytics.trackEvent('challenge_entry_submitted', {
          challengeId,
          entryId: response.entryId
        });
      }
      return response;
    } catch (error) {
      console.error('Error submitting challenge entry:', error);
      throw error;
    }
  }
  async createStylingSquad(squadData) {
    try {
      const squad = {
        creatorId: this.currentUser?.uid,
        name: squadData.name,
        description: squadData.description,
        theme: squadData.theme, // 'sustainable-fashion', 'vintage-lovers', 'minimalists'
        privacy: squadData.privacy || 'public', // 'public', 'private', 'invite-only'
        maxMembers: squadData.maxMembers || 50,
        rules: squadData.rules,
        activities: ['outfit-shares', 'challenges', 'discussions', 'live-sessions'],
        members: [this.currentUser?.uid],
        createdAt: Date.now()
      };
      const response = await apiService.post('/api/social/squads/create', squad);
      if (response.success) {
        this.analytics.trackEvent('squad_created', {
          squadId: response.squadId,
          theme: squad.theme
        });
      }
      return response;
    } catch (error) {
      console.error('Error creating squad:', error);
      throw error;
    }
  }
  async startCollaborativeOutfit(collaborators) {
    try {
      const session = {
        initiatorId: this.currentUser?.uid,
        collaborators: collaborators.map(c => c.uid),
        currentOutfit: [],
        chatHistory: [],
        votes: {},
        turnOrder: [this.currentUser?.uid, ...collaborators.map(c => c.uid)],
        currentTurn: 0,
        status: 'active',
        createdAt: Date.now()
      };
      const response = await apiService.post('/api/social/collaborative/start', session);
      if (response.success) {
        this.setupCollaborativeHandlers(response.sessionId);
        this.analytics.trackEvent('collaborative_outfit_started', {
          sessionId: response.sessionId,
          collaborators: collaborators.length
        });
      }
      return response;
    } catch (error) {
      console.error('Error starting collaborative outfit:', error);
      throw error;
    }
  }
  async proposeCollaborativeItem(sessionId, item) {
    try {
      const response = await apiService.post(`/api/social/collaborative/${sessionId}/propose`, {
        userId: this.currentUser?.uid,
        item,
        reason: item.reason,
        timestamp: Date.now()
      });
      return response;
    } catch (error) {
      console.error('Error proposing item:', error);
      throw error;
    }
  }
  async voteOnProposal(sessionId, proposalId, vote) {
    try {
      await apiService.post(`/api/social/collaborative/${sessionId}/vote`, {
        userId: this.currentUser?.uid,
        proposalId,
        vote, // 'approve', 'reject', 'suggest-alternative'
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error voting:', error);
    }
  }
  async findStyleTwins() {
    try {
      const response = await apiService.get('/api/social/match/style-twins', {
        params: {
          userId: this.currentUser?.uid
        }
      });
      if (response.success) {
        this.analytics.trackEvent('style_twins_searched');
      }
      return response.matches || [];
    } catch (error) {
      console.error('Error finding style twins:', error);
      return [];
    }
  }
  async giftOutfitRecommendation(recipientId, outfitData) {
    try {
      const gift = {
        senderId: this.currentUser?.uid,
        senderName: this.currentUser?.displayName,
        recipientId,
        outfit: outfitData.outfit,
        message: outfitData.message,
        occasion: outfitData.occasion,
        isAnonymous: outfitData.isAnonymous || false,
        timestamp: Date.now()
      };
      const response = await apiService.post('/api/social/gifts/send', gift);
      if (response.success) {
        this.analytics.trackEvent('outfit_recommendation_gifted', {
          recipientId
        });
      }
      return response;
    } catch (error) {
      console.error('Error gifting outfit:', error);
      throw error;
    }
  }
  setupNotifications(callback) {
    this.notificationListeners.push(callback);
  }
  async notifyFollowers(eventType, data) {
    try {
      await apiService.post('/api/social/notifications/send', {
        userId: this.currentUser?.uid,
        eventType,
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error notifying followers:', error);
    }
  }
  generateShoppableLinks(items) {
    return items.map(item => ({
      itemId: item.id,
      productLink: `/products/${item.id}`,
      affiliateLink: item.affiliateLink,
      price: item.price,
      inStock: item.inStock
    }));
  }
  async validateChallengeEntry(challengeId, entryData) {
    try {
      const response = await apiService.post(`/api/social/challenges/${challengeId}/validate`, entryData);
      return response.valid || false;
    } catch (error) {
      return false;
    }
  }
  setupLiveSessionHandlers(sessionId) {
    console.log(`Live session ${sessionId} handlers set up`);
  }
  setupLiveViewerHandlers(sessionId) {
    console.log(`Live viewer handlers for ${sessionId} set up`);
  }
  setupCollaborativeHandlers(sessionId) {
    console.log(`Collaborative handlers for ${sessionId} set up`);
  }
  async getCommunityTrending(timeframe = '7d') {
    try {
      const response = await apiService.get('/api/social/trending', {
        params: { timeframe }
      });
      return {
        trendingLooks: response.looks || [],
        trendingStyles: response.styles || [],
        popularChallenges: response.challenges || [],
        risingInfluencers: response.influencers || []
      };
    } catch (error) {
      console.error('Error fetching trending:', error);
      return {};
    }
  }
  async getInspirationFeed(filters = {}) {
    try {
      const response = await apiService.get('/api/social/feed/inspiration', {
        params: {
          userId: this.currentUser?.uid,
          style: filters.style,
          occasion: filters.occasion,
          season: filters.season,
          page: filters.page || 1
        }
      });
      return response.feed || [];
    } catch (error) {
      console.error('Error fetching inspiration feed:', error);
      return [];
    }
  }
}
let socialHubInstance = null;
export const getSocialHub = () => {
  if (!socialHubInstance) {
    socialHubInstance = new SocialFashionHub();
  }
  return socialHubInstance;
};
export default SocialFashionHub;
