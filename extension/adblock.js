// Advanced ad blocking engine for YouTube Ad Blocker Pro

class AdBlockEngine {
    constructor() {
        this.blockedCount = 0;
        this.enabled = true;
        this.networkBlocking = true;
        this.domBlocking = true;
        this.antiAntiAdblock = true;
        this.whitelistedChannels = new Set();
        this.filterLists = new Map();
        this.customFilters = [];
        this.observer = null;
        this.lastAdCheck = 0;
        this.adCheckInterval = 1000; // Check every second
        
        // Enhanced ad selectors with priority
        this.adSelectors = {
            // High priority - video ads
            video: [
                '.video-ads',
                '.ytp-ad-module',
                '.ytp-ad-overlay-container',
                '.ytp-ad-text-overlay',
                '.ytp-ad-player-overlay',
                '.ytp-ad-skip-button-container',
                '.ytp-ad-preview-container',
                'ytd-player-legacy-desktop-watch-ads-renderer',
                'ytd-display-ad-renderer[slot-id*="player"]'
            ],
            
            // Medium priority - banner ads
            banner: [
                '#masthead-ad',
                '.ytd-display-ad-renderer',
                '.ytd-promoted-sparkles-web-renderer',
                '.ytd-ad-slot-renderer',
                '.ytd-banner-promo-renderer',
                'ytd-rich-item-renderer[is-ad]',
                'ytd-compact-promoted-item-renderer'
            ],
            
            // Low priority - sidebar and misc ads
            sidebar: [
                '#secondary .ytd-display-ad-renderer',
                '.ytd-companion-slot-renderer',
                'ytd-promoted-video-renderer',
                '.ytd-search-pyv-renderer',
                'ytd-ad-slot-renderer',
                '.ytm-promoted-video-renderer',
                '.ytm-companion-ad-renderer'
            ]
        };
        
        this.init();
    }

    async init() {
        const settings = await Utils.getStorageData([
            'adblock_enabled', 
            'adblock_network', 
            'adblock_dom', 
            'adblock_anti_anti',
            'adblock_whitelist',
            'adblock_count',
            'adblock_custom_filters'
        ]);
        
        this.enabled = settings.adblock_enabled !== false;
        this.networkBlocking = settings.adblock_network !== false;
        this.domBlocking = settings.adblock_dom !== false;
        this.antiAntiAdblock = settings.adblock_anti_anti !== false;
        this.blockedCount = settings.adblock_count || 0;
        this.customFilters = settings.adblock_custom_filters || [];
        
        if (settings.adblock_whitelist) {
            this.whitelistedChannels = new Set(settings.adblock_whitelist);
        }
        
        await this.loadFilterLists();
        this.setupDOMBlocking();
        this.setupNetworkBlocking();
        this.setupAntiAntiAdblock();
        
        Utils.log('AdBlock engine initialized', 'info');
    }

    async loadFilterLists() {
        // Load built-in filter lists
        const builtInFilters = [
            // YouTube specific filters
            '||googlevideo.com/videoplayback*&dur=*&gir=yes&lmt=*',
            '||youtube.com/api/stats/ads',
            '||youtube.com/ptracking',
            '||youtube.com/pagead/',
            '||googleadservices.com^',
            '||doubleclick.net^',
            '||googlesyndication.com^'
        ];
        
        this.filterLists.set('builtin', builtInFilters);
        
        // Merge with custom filters
        if (this.customFilters.length > 0) {
            this.filterLists.set('custom', this.customFilters);
        }
        
        Utils.log(`Loaded ${builtInFilters.length + this.customFilters.length} filters`, 'info');
    }

    setupDOMBlocking() {
        if (!this.domBlocking) return;
        
        // Inject CSS immediately
        this.injectAdBlockCSS();
        
        // Set up mutation observer
        if (this.observer) this.observer.disconnect();
        
        this.observer = new MutationObserver(Utils.throttle((mutations) => {
            this.processMutations(mutations);
        }, 100));
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'id', 'src', 'data-ad-slot-id']
        });
        
        // Initial scan
        this.scanAndBlockAds();
        
        // Periodic scan for dynamic content
        setInterval(() => {
            if (Date.now() - this.lastAdCheck > this.adCheckInterval) {
                this.scanAndBlockAds();
                this.lastAdCheck = Date.now();
            }
        }, this.adCheckInterval);
    }

    setupNetworkBlocking() {
        if (!this.networkBlocking) return;
        
        // Override fetch and XMLHttpRequest
        this.interceptNetworkRequests();
        
        // Block video ad requests
        this.blockVideoAdRequests();
    }

    setupAntiAntiAdblock() {
        if (!this.antiAntiAdblock) return;
        
        // Override common adblock detection methods
        this.overrideAdblockDetection();
    }

    injectAdBlockCSS() {
        if (document.getElementById('ytab-adblock-css')) return;
        
        const style = document.createElement('style');
        style.id = 'ytab-adblock-css';
        
        const allSelectors = [
            ...this.adSelectors.video,
            ...this.adSelectors.banner,
            ...this.adSelectors.sidebar
        ];
        
        style.textContent = `
            /* YouTube Ad Blocker Pro - CSS Rules */
            ${allSelectors.join(',\n')} {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                left: -9999px !important;
            }
            
            /* Hide ad containers */
            [id*="ad-"]:not([id*="add"]):not([id*="bad"]):not([id*="pad"]):not([id*="thread"]),
            [class*="ad-"]:not([class*="add"]):not([class*="bad"]):not([class*="pad"]):not([class*="thread"]),
            [data-ad-slot-id],
            .GoogleActiveViewElement,
            .ytp-ad-overlay-container,
            .ytp-ad-text-overlay {
                display: none !important;
            }
            
            /* Prevent layout shift */
            .ytd-display-ad-renderer {
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* Hide promoted content */
            ytd-promoted-sparkles-web-renderer,
            ytd-compact-promoted-item-renderer,
            [aria-label*="Promoted"],
            [title*="Promoted"] {
                display: none !important;
            }
        `;
        
        document.head.appendChild(style);
    }

    scanAndBlockAds() {
        if (!this.enabled || !this.domBlocking) return;
        
        let blockedInScan = 0;
        
        // Check if current channel is whitelisted
        const channelId = Utils.getChannelId();
        if (channelId && this.whitelistedChannels.has(channelId)) {
            return;
        }
        
        // Scan all selector categories
        Object.entries(this.adSelectors).forEach(([category, selectors]) => {
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (this.isElementVisible(element)) {
                        this.hideElement(element, category);
                        blockedInScan++;
                    }
                });
            });
        });
        
        // Check for video ads specifically
        this.checkVideoAds();
        
        if (blockedInScan > 0) {
            this.updateBlockedCount(blockedInScan);
            Utils.log(`Blocked ${blockedInScan} ads in DOM scan`, 'info');
        }
    }

    processMutations(mutations) {
        let blockedInMutation = 0;
        
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                mutation.addNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (this.isAdElement(node)) {
                            this.hideElement(node, 'mutation');
                            blockedInMutation++;
                        }
                        
                        // Check child elements
                        const adChildren = node.querySelectorAll && node.querySelectorAll(
                            Object.values(this.adSelectors).flat().join(',')
                        );
                        
                        if (adChildren) {
                            adChildren.forEach(child => {
                                if (this.isElementVisible(child)) {
                                    this.hideElement(child, 'mutation');
                                    blockedInMutation++;
                                }
                            });
                        }
                    }
                });
            }
        });
        
        if (blockedInMutation > 0) {
            this.updateBlockedCount(blockedInMutation);
        }
    }

    checkVideoAds() {
        const video = document.querySelector('video');
        if (!video) return;
        
        // Check for ad indicators
        const adIndicators = [
            '.ytp-ad-text',
            '.ytp-ad-duration-remaining',
            '.ytp-ad-skip-button',
            '.ytp-ad-preview-text'
        ];
        
        let isAdPlaying = false;
        adIndicators.forEach(selector => {
            if (document.querySelector(selector)) {
                isAdPlaying = true;
            }
        });
        
        if (isAdPlaying) {
            this.handleVideoAd(video);
        }
    }

    handleVideoAd(video) {
        // Try to skip immediately
        const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
        if (skipButton && skipButton.offsetParent !== null) {
            skipButton.click();
            this.updateBlockedCount(1);
            Utils.log('Auto-clicked skip button', 'info');
            return;
        }
        
        // If no skip button, try to seek to end
        if (video.duration && video.duration < 30) { // Only for short ads
            video.currentTime = video.duration;
            this.updateBlockedCount(1);
            Utils.log('Seeked past video ad', 'info');
        }
        
        // Mute ad audio
        if (!video.muted) {
            video.muted = true;
            video.dataset.ytabMuted = 'true';
        }
    }

    interceptNetworkRequests() {
        // Override fetch
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [url] = args;
            if (this.shouldBlockRequest(url)) {
                Utils.log(`Blocked fetch request: ${url}`, 'info');
                this.updateBlockedCount(1);
                throw new Error('Request blocked by YouTube Ad Blocker Pro');
            }
            return originalFetch.apply(this, args);
        };
        
        // Override XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            if (window.adBlockEngine && window.adBlockEngine.shouldBlockRequest(url)) {
                Utils.log(`Blocked XHR request: ${url}`, 'info');
                window.adBlockEngine.updateBlockedCount(1);
                throw new Error('Request blocked by YouTube Ad Blocker Pro');
            }
            return originalOpen.apply(this, [method, url, ...args]);
        };
    }

    blockVideoAdRequests() {
        // Intercept video source changes
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            const originalSetSrc = video.__lookupSetter__('src') || Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src').set;
            
            Object.defineProperty(video, 'src', {
                set: function(value) {
                    if (window.adBlockEngine && window.adBlockEngine.shouldBlockRequest(value)) {
                        Utils.log(`Blocked video ad source: ${value}`, 'info');
                        window.adBlockEngine.updateBlockedCount(1);
                        return;
                    }
                    originalSetSrc.call(this, value);
                },
                get: function() {
                    return this.getAttribute('src');
                }
            });
        });
    }

    shouldBlockRequest(url) {
        if (!this.enabled || !this.networkBlocking || !url) return false;
        
        // Check against filter lists
        for (const [listName, filters] of this.filterLists) {
            for (const filter of filters) {
                if (this.matchesFilter(url, filter)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    matchesFilter(url, filter) {
        // Simple filter matching (can be enhanced with proper ABP syntax)
        if (filter.startsWith('||')) {
            const domain = filter.slice(2).split('/')[0].replace('^', '');
            return url.includes(domain);
        }
        
        if (filter.includes('*')) {
            const regex = new RegExp(filter.replace(/\*/g, '.*'));
            return regex.test(url);
        }
        
        return url.includes(filter);
    }

    overrideAdblockDetection() {
        // Override common adblock detection properties
        Object.defineProperty(window, 'adblockDetected', {
            get: () => false,
            set: () => {},
            configurable: false
        });
        
        // Override getComputedStyle for hidden elements
        const originalGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = function(element, pseudoElement) {
            const styles = originalGetComputedStyle.call(this, element, pseudoElement);
            
            // If element was hidden by our adblocker, fake visible styles
            if (element.style.display === 'none' && element.classList.contains('ytab-blocked')) {
                return new Proxy(styles, {
                    get(target, prop) {
                        if (prop === 'display') return 'block';
                        if (prop === 'visibility') return 'visible';
                        if (prop === 'opacity') return '1';
                        return target[prop];
                    }
                });
            }
            
            return styles;
        };
    }

    isElementVisible(element) {
        if (!element || !element.offsetParent) return false;
        
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }

    isAdElement(element) {
        if (!element || !element.tagName) return false;
        
        // Check all selector categories
        const allSelectors = Object.values(this.adSelectors).flat();
        
        return allSelectors.some(selector => {
            try {
                return element.matches(selector);
            } catch (e) {
                return false;
            }
        });
    }

    hideElement(element, category = 'unknown') {
        if (!element) return;
        
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
        element.style.height = '0';
        element.style.width = '0';
        element.style.overflow = 'hidden';
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        
        element.classList.add('ytab-blocked');
        element.dataset.ytabCategory = category;
        
        // Remove from DOM after a delay to prevent layout issues
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 1000);
    }

    async updateBlockedCount(increment = 1) {
        this.blockedCount += increment;
        
        // Save to storage
        await Utils.setStorageData({ adblock_count: this.blockedCount });
        
        // Update badge
        const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
        browserAPI.runtime.sendMessage({
            action: 'updateBadge',
            count: this.blockedCount
        });
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('ytab-ad-blocked', {
            detail: { count: increment, total: this.blockedCount }
        }));
    }

    async toggleWhitelist(channelId) {
        if (!channelId) return;
        
        if (this.whitelistedChannels.has(channelId)) {
            this.whitelistedChannels.delete(channelId);
        } else {
            this.whitelistedChannels.add(channelId);
        }
        
        await Utils.setStorageData({
            adblock_whitelist: Array.from(this.whitelistedChannels)
        });
        
        return this.whitelistedChannels.has(channelId);
    }

    async updateSettings(settings) {
        if (settings.enabled !== undefined) this.enabled = settings.enabled;
        if (settings.networkBlocking !== undefined) this.networkBlocking = settings.networkBlocking;
        if (settings.domBlocking !== undefined) this.domBlocking = settings.domBlocking;
        if (settings.antiAntiAdblock !== undefined) this.antiAntiAdblock = settings.antiAntiAdblock;
        
        await Utils.setStorageData({
            adblock_enabled: this.enabled,
            adblock_network: this.networkBlocking,
            adblock_dom: this.domBlocking,
            adblock_anti_anti: this.antiAntiAdblock
        });
        
        // Reinitialize if needed
        if (settings.enabled === false) {
            this.cleanup();
        } else if (settings.enabled === true) {
            this.setupDOMBlocking();
        }
    }

    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // Remove injected CSS
        const style = document.getElementById('ytab-adblock-css');
        if (style) style.remove();
        
        // Restore blocked elements
        document.querySelectorAll('.ytab-blocked').forEach(el => {
            el.style.display = '';
            el.style.visibility = '';
            el.style.opacity = '';
            el.classList.remove('ytab-blocked');
        });
    }

    getStats() {
        return {
            enabled: this.enabled,
            blockedCount: this.blockedCount,
            networkBlocking: this.networkBlocking,
            domBlocking: this.domBlocking,
            antiAntiAdblock: this.antiAntiAdblock,
            whitelistedChannels: Array.from(this.whitelistedChannels),
            filterCount: Array.from(this.filterLists.values()).flat().length
        };
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdBlockEngine;
} else {
    window.AdBlockEngine = AdBlockEngine;
}