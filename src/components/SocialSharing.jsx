import React, { useState } from 'react';
import { 
  SOCIAL_PLATFORMS, 
  PLATFORM_CONFIGS, 
  handleShare, 
  generateTryOnShareData,
  shareWithWebAPI,
  getSharingTips
} from '../utils/socialSharing';
import { useAuth } from '../context/AuthContext';

export default function SocialSharing({ 
  lookData, 
  isOpen, 
  onClose,
  className = \"\"
}) {
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const [showTips, setShowTips] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(null);

  const shareData = generateTryOnShareData({
    ...lookData,
    userName: user?.displayName || 'Fashion Lover'
  });

  const handlePlatformShare = async (platform) => {
    setSharing(true);
    setShareSuccess(null);

    try {

      if (platform === 'native' && navigator.share) {
        const success = await shareWithWebAPI(shareData);
        if (success) {
          setShareSuccess('Shared successfully!');
        }
      } else {
        const success = await handleShare(platform, shareData, {
          trackAnalytics: true,
          lookId: lookData.id || 'anonymous',
          userId: user?.uid || 'anonymous'
        });

        if (success) {
          const platformName = PLATFORM_CONFIGS[platform]?.name || platform;
          if (platform === SOCIAL_PLATFORMS.COPY_LINK) {
            setShareSuccess('Link copied to clipboard!');
          } else {
            setShareSuccess(`Shared to ${platformName}!`);
          }
        } else {
          setShareSuccess('Share was cancelled or failed.');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      setShareSuccess('Failed to share. Please try again.');
    } finally {
      setSharing(false);
      setTimeout(() => setShareSuccess(null), 3000);
    }
  };

  if (!isOpen) return null;

  const platforms = [
    SOCIAL_PLATFORMS.FACEBOOK,
    SOCIAL_PLATFORMS.TWITTER,
    SOCIAL_PLATFORMS.INSTAGRAM,
    SOCIAL_PLATFORMS.WHATSAPP,
    SOCIAL_PLATFORMS.PINTEREST,
    SOCIAL_PLATFORMS.EMAIL,
    SOCIAL_PLATFORMS.COPY_LINK
  ];

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className=\"bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto\">
        <div className=\"p-6\">
          {}
          <div className=\"flex items-center justify-between mb-6\">
            <h2 className=\"text-2xl font-bold text-gray-900\">Share Your Look</h2>
            <button
              onClick={onClose}
              className=\"text-gray-400 hover:text-gray-600 transition-colors\"
            >
              <svg className=\"w-6 h-6\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" />
              </svg>
            </button>
          </div>

          {}
          <div className=\"bg-gray-50 rounded-xl p-4 mb-6\">
            <div className=\"flex gap-3\">
              {lookData.imageDataUrl && (
                <img 
                  src={lookData.imageDataUrl} 
                  alt=\"Your try-on look\" 
                  className=\"w-16 h-16 object-cover rounded-lg\"
                />
              )}
              <div className=\"flex-1\">
                <h3 className=\"font-semibold text-gray-900 mb-1\">{shareData.title}</h3>
                <p className=\"text-sm text-gray-600 line-clamp-2\">{shareData.description}</p>
                <div className=\"flex flex-wrap gap-1 mt-2\">
                  {shareData.hashtags.map(tag => (
                    <span key={tag} className=\"text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full\">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {}
          {shareSuccess && (
            <div className=\"bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded\">
              <p className=\"text-green-700 text-sm\">{shareSuccess}</p>
            </div>
          )}

          {}
          {navigator.share && (
            <div className=\"mb-6\">
              <button
                onClick={() => handlePlatformShare('native')}
                disabled={sharing}
                className=\"w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2\"
              >
                <span>ðŸ“±</span>
                {sharing ? 'Sharing...' : 'Share via Apps'}
              </button>
              <div className=\"text-center text-gray-500 text-sm mt-2 mb-4\">or choose a platform below</div>
            </div>
          )}

          {}
          <div className=\"grid grid-cols-2 gap-3\">
            {platforms.map((platform) => {
              const config = PLATFORM_CONFIGS[platform];
              return (
                <div key={platform} className=\"relative\">
                  <button
                    onClick={() => handlePlatformShare(platform)}
                    disabled={sharing}
                    className=\"w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50 group\"
                    style={{ borderColor: showTips === platform ? config.color : undefined }}
                  >
                    <div className=\"text-center\">
                      <div className=\"text-2xl mb-2\">{config.icon}</div>
                      <div className=\"font-medium text-gray-900 text-sm\">{config.name}</div>
                      <div className=\"text-xs text-gray-500\">{config.description}</div>
                    </div>
                  </button>
                  
                  {}
                  <button
                    onClick={() => setShowTips(showTips === platform ? null : platform)}
                    className=\"absolute top-2 right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs hover:bg-gray-200 transition-colors\"
                  >
                    ?
                  </button>
                </div>
              );
            })}
          </div>

          {}
          {showTips && (
            <div className=\"mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200\">
              <h4 className=\"font-semibold text-blue-900 mb-2\">
                {PLATFORM_CONFIGS[showTips].name} Tips:
              </h4>
              <ul className=\"text-sm text-blue-800 space-y-1\">
                {getSharingTips(showTips).map((tip, index) => (
                  <li key={index} className=\"flex items-start gap-2\">
                    <span className=\"text-blue-500 mt-0.5\">â€¢</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {}
          <div className=\"mt-6 pt-4 border-t border-gray-200\">
            <p className=\"text-center text-xs text-gray-500\">
              By sharing, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuickShareButton({ 
  lookData, 
  variant = 'default',
  size = 'md',
  className = \"\"
}) {
  const [showShareModal, setShowShareModal] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg'
  };

  const variantClasses = {
    default: 'bg-purple-600 text-white hover:bg-purple-700',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50',
    ghost: 'text-purple-600 hover:bg-purple-50'
  };

  return (
    <>
      <button
        onClick={() => setShowShareModal(true)}
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]} 
          ${className}
          rounded-lg font-medium transition-colors flex items-center gap-2
        `}
      >
        <svg className=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
          <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z\" />
        </svg>
        Share Look
      </button>
      
      <SocialSharing
        lookData={lookData}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </>
  );
}