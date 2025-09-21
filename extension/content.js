// Content script for YouTube Ad Blocker

(function() {
  'use strict';
  
  let blockedAdsCount = 0;
  let observer = null;
  
  // YouTube ad selectors - comprehensive list
  const adSelectors = [
    // Video ads
    '.video-ads',
    '.ytp-ad-module',
    '.ytp-ad-overlay-container',
    '.ytp-ad-text-overlay',
    '.ytp-ad-player-overlay',
    '.ytp-ad-skip-button-container',
    
    // Banner ads
    '#masthead-ad',
    '.ytd-display-ad-renderer',
    '.ytd-promoted-sparkles-web-renderer',
    '.ytd-ad-slot-renderer',
    '.ytd-banner-promo-renderer',
    
    // Sidebar ads
    '#secondary .ytd-display-ad-renderer',
    '.ytd-companion-slot-renderer',
    
    // Search ads
    '.ytd-search-pyv-renderer',
    '.ytd-promoted-video-renderer',
    
    // Mobile ads
    '.ytm-promoted-video-renderer',
    '.ytm-companion-ad-renderer',
    
    // Overlay ads
    '.ytp-ad-overlay-container',
    '.ytp-ad-text-overlay',
    '.iv-branding',
    
    // Shorts ads
    '.ytd-reel-video-renderer[is-ad]',
    
    // General ad containers
    '[id*="ad-"]',
    '[class*="ad-"]',
    '[data-ad-slot-id]',
    '.GoogleActiveViewElement'
  ];
  
  // Function to block ads
  function blockAds() {
    let adsBlocked = 0;
    
    adSelectors.forEach(selector => {
      const adElements = document.querySelectorAll(selector);
      adElements.forEach(element => {
        if (element && element.style.display !== 'none') {
          element.style.display = 'none';
          element.remove();
          adsBlocked++;
        }
      });
    });
    
    // Block video ads by skipping
    const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
    if (skipButton && skipButton.offsetParent !== null) {
      skipButton.click();
      adsBlocked++;
    }
    
    // Block ads in video player
    const videoAds = document.querySelectorAll('video[src*="googleads"], video[src*="doubleclick"]');
    videoAds.forEach(ad => {
      ad.pause();
      ad.currentTime = ad.duration || 999;
      ad.style.display = 'none';
      adsBlocked++;
    });
    
    // Report blocked ads to background script
    if (adsBlocked > 0) {
      blockedAdsCount += adsBlocked;
      browser.runtime.sendMessage({
        action: 'adBlocked',
        count: adsBlocked
      });
      
      console.log(`YouTube Ad Blocker: Blocked ${adsBlocked} ads`);
    }
  }
  
  // Function to hide ad-related elements with CSS
  function injectAdBlockCSS() {
    if (document.getElementById('youtube-ad-blocker-css')) return;
    
    const style = document.createElement('style');
    style.id = 'youtube-ad-blocker-css';
    style.textContent = `
      /* Hide video ads */
      .video-ads,
      .ytp-ad-module,
      .ytp-ad-overlay-container,
      .ytp-ad-text-overlay,
      .ytp-ad-player-overlay,
      .ytp-ad-skip-button-container,
      
      /* Hide banner ads */
      #masthead-ad,
      .ytd-display-ad-renderer,
      .ytd-promoted-sparkles-web-renderer,
      .ytd-ad-slot-renderer,
      .ytd-banner-promo-renderer,
      
      /* Hide sidebar ads */
      #secondary .ytd-display-ad-renderer,
      .ytd-companion-slot-renderer,
      
      /* Hide search ads */
      .ytd-search-pyv-renderer,
      .ytd-promoted-video-renderer,
      
      /* Hide overlay ads */
      .ytp-ad-overlay-container,
      .ytp-ad-text-overlay,
      .iv-branding,
      
      /* Hide shorts ads */
      .ytd-reel-video-renderer[is-ad],
      
      /* Hide general ad containers */
      [id*="ad-"]:not([id*="add"]):not([id*="bad"]):not([id*="pad"]),
      [class*="ad-"]:not([class*="add"]):not([class*="bad"]):not([class*="pad"]),
      [data-ad-slot-id],
      .GoogleActiveViewElement {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Initialize ad blocking
  function init() {
    // Inject CSS immediately
    injectAdBlockCSS();
    
    // Block ads immediately
    blockAds();
    
    // Set up mutation observer for dynamic content
    if (observer) observer.disconnect();
    
    observer = new MutationObserver((mutations) => {
      let shouldBlock = false;
      
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if added node contains ads
              const hasAds = adSelectors.some(selector => {
                return node.matches && node.matches(selector) || 
                       node.querySelector && node.querySelector(selector);
              });
              
              if (hasAds) {
                shouldBlock = true;
              }
            }
          });
        }
      });
      
      if (shouldBlock) {
        setTimeout(blockAds, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'src']
    });
    
    // Periodic ad blocking
    setInterval(blockAds, 2000);
  }
  
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Re-initialize on navigation (for SPA behavior)
  let currentUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      setTimeout(init, 1000);
    }
  }, 1000);
  
})();