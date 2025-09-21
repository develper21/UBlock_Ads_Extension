// Background script for YouTube Ad Blocker Extension

// Initialize storage on extension install
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({ blockedAdsCount: 0 });
});

// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'adBlocked') {
    // Increment blocked ads count
    browser.storage.local.get(['blockedAdsCount']).then((result) => {
      const newCount = (result.blockedAdsCount || 0) + 1;
      browser.storage.local.set({ blockedAdsCount: newCount });
      
      // Update badge text
      browser.browserAction.setBadgeText({
        text: newCount.toString(),
        tabId: sender.tab.id
      });
      
      browser.browserAction.setBadgeBackgroundColor({
        color: '#ff0000'
      });
      
      sendResponse({ success: true, count: newCount });
    });
    
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'getBlockedCount') {
    browser.storage.local.get(['blockedAdsCount']).then((result) => {
      sendResponse({ count: result.blockedAdsCount || 0 });
    });
    
    return true;
  }
  
  if (message.action === 'resetCount') {
    browser.storage.local.set({ blockedAdsCount: 0 });
    browser.browserAction.setBadgeText({ text: '' });
    sendResponse({ success: true });
    
    return true;
  }
});

// Update badge when tab is activated
browser.tabs.onActivated.addListener((activeInfo) => {
  browser.storage.local.get(['blockedAdsCount']).then((result) => {
    const count = result.blockedAdsCount || 0;
    if (count > 0) {
      browser.browserAction.setBadgeText({
        text: count.toString(),
        tabId: activeInfo.tabId
      });
    }
  });
});