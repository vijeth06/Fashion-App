

export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  WHATSAPP: 'whatsapp',
  LINKEDIN: 'linkedin',
  PINTEREST: 'pinterest',
  EMAIL: 'email',
  COPY_LINK: 'copy'
};

export function generateShareURL(platform, data) {
  const { url, title, description, imageUrl, hashtags = [] } = data;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedImage = encodeURIComponent(imageUrl);
  const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');

  switch (platform) {
    case SOCIAL_PLATFORMS.FACEBOOK:
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
    
    case SOCIAL_PLATFORMS.TWITTER:
      const tweetText = `${title} ${hashtagString}`;
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodedUrl}`;
    
    case SOCIAL_PLATFORMS.WHATSAPP:
      const whatsappText = `${title} - ${description} ${url}`;
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
    
    case SOCIAL_PLATFORMS.LINKEDIN:
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    
    case SOCIAL_PLATFORMS.PINTEREST:
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedDescription}`;
    
    case SOCIAL_PLATFORMS.EMAIL:
      const subject = `Check out my virtual try-on look: ${title}`;
      const body = `${description}\\n\\nSee my look here: ${url}\\n\\nTry it yourself at Virtual Fashion!`;
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    default:
      return url;
  }
}

export async function shareWithWebAPI(data) {
  if (!navigator.share) {
    throw new Error('Web Share API not supported');
  }

  try {
    await navigator.share({
      title: data.title,
      text: data.description,
      url: data.url
    });
    return true;
  } catch (error) {
    if (error.name === 'AbortError') {

      return false;
    }
    throw error;
  }
}

export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {

      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        return true;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export function generateTryOnShareData(lookData) {
  const { imageDataUrl, items, userName } = lookData;
  const itemNames = items.map(item => item.name).join(', ');
  
  return {
    title: `Check out my virtual try-on look!`,
    description: `I'm trying on ${itemNames} using Virtual Fashion's AR technology. What do you think?`,
    url: window.location.origin + '/try-on',
    imageUrl: imageDataUrl || '',
    hashtags: ['VirtualFashion', 'TryOn', 'Fashion', 'AR', 'Style']
  };
}

export function trackShare(platform, lookId, userId) {

  console.log('Share tracked:', {
    platform,
    lookId,
    userId,
    timestamp: new Date().toISOString()
  });

  const shareHistory = JSON.parse(localStorage.getItem('shareHistory') || '[]');
  shareHistory.push({
    platform,
    lookId,
    userId,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('shareHistory', JSON.stringify(shareHistory.slice(-100))); // Keep last 100
}

export function getShareAnalytics() {
  const shareHistory = JSON.parse(localStorage.getItem('shareHistory') || '[]');
  
  const platformCounts = shareHistory.reduce((acc, share) => {
    acc[share.platform] = (acc[share.platform] || 0) + 1;
    return acc;
  }, {});

  const recentShares = shareHistory.slice(-10);
  
  return {
    totalShares: shareHistory.length,
    platformBreakdown: platformCounts,
    recentShares,
    topPlatform: Object.entries(platformCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
  };
}

export const PLATFORM_CONFIGS = {
  [SOCIAL_PLATFORMS.FACEBOOK]: {
    name: 'Facebook',
    icon: 'ðŸ“˜',
    color: '#1877F2',
    description: 'Share with friends'
  },
  [SOCIAL_PLATFORMS.TWITTER]: {
    name: 'Twitter',
    icon: 'ðŸ¦',
    color: '#1DA1F2',
    description: 'Tweet your look'
  },
  [SOCIAL_PLATFORMS.INSTAGRAM]: {
    name: 'Instagram',
    icon: 'ðŸ“·',
    color: '#E4405F',
    description: 'Post to your story'
  },
  [SOCIAL_PLATFORMS.WHATSAPP]: {
    name: 'WhatsApp',
    icon: 'ðŸ’¬',
    color: '#25D366',
    description: 'Send to contacts'
  },
  [SOCIAL_PLATFORMS.LINKEDIN]: {
    name: 'LinkedIn',
    icon: 'ðŸ’¼',
    color: '#0A66C2',
    description: 'Share professionally'
  },
  [SOCIAL_PLATFORMS.PINTEREST]: {
    name: 'Pinterest',
    icon: 'ðŸ“Œ',
    color: '#BD081C',
    description: 'Pin your style'
  },
  [SOCIAL_PLATFORMS.EMAIL]: {
    name: 'Email',
    icon: 'ðŸ“§',
    color: '#34495e',
    description: 'Send via email'
  },
  [SOCIAL_PLATFORMS.COPY_LINK]: {
    name: 'Copy Link',
    icon: 'ðŸ”—',
    color: '#6c757d',
    description: 'Copy to clipboard'
  }
};

export function createShareableLink(lookId, userId) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/looks/${lookId}?shared=true&ref=${userId}`;
}

export async function handleShare(platform, data, options = {}) {
  const { trackAnalytics = true, lookId, userId } = options;
  
  try {
    switch (platform) {
      case SOCIAL_PLATFORMS.COPY_LINK:
        const success = await copyToClipboard(data.url);
        if (success && trackAnalytics) {
          trackShare(platform, lookId, userId);
        }
        return success;
      
      case SOCIAL_PLATFORMS.INSTAGRAM:

        await copyToClipboard(data.url);
        alert('Link copied! Paste it in your Instagram post or story.');
        if (trackAnalytics) {
          trackShare(platform, lookId, userId);
        }
        return true;
      
      default:

        const shareUrl = generateShareURL(platform, data);
        const popup = window.open(
          shareUrl,
          'share',
          'width=600,height=400,scrollbars=yes,resizable=yes'
        );
        
        if (popup && trackAnalytics) {
          trackShare(platform, lookId, userId);
        }
        
        return !!popup;
    }
  } catch (error) {
    console.error('Error sharing:', error);
    return false;
  }
}

export function getSharingTips(platform) {
  const tips = {
    [SOCIAL_PLATFORMS.FACEBOOK]: [
      'Tag friends to get their opinions',
      'Add a personal caption about your style',
      'Share to your story for more visibility'
    ],
    [SOCIAL_PLATFORMS.TWITTER]: [
      'Use relevant fashion hashtags',
      'Mention your favorite brands',
      'Ask followers for styling advice'
    ],
    [SOCIAL_PLATFORMS.INSTAGRAM]: [
      'Perfect for Stories and Reels',
      'Use fashion and style hashtags',
      'Tag brands you\'re wearing'
    ],
    [SOCIAL_PLATFORMS.WHATSAPP]: [
      'Great for getting quick feedback',
      'Share with fashion-conscious friends',
      'Create a style group chat'
    ],
    [SOCIAL_PLATFORMS.PINTEREST]: [
      'Save to your fashion boards',
      'Great for outfit inspiration',
      'Pin seasonal looks'
    ]
  };
  
  return tips[platform] || ['Share and get feedback from your network!'];
}