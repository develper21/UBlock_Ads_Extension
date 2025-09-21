// Utility functions for YouTube Ad Blocker Pro

class Utils {
    static log(message, type = 'info') {
        if (this.isDebugMode()) {
            const prefix = '[YT AdBlock Pro]';
            switch (type) {
                case 'error':
                    console.error(prefix, message);
                    break;
                case 'warn':
                    console.warn(prefix, message);
                    break;
                default:
                    console.log(prefix, message);
            }
        }
    }

    static isDebugMode() {
        return localStorage.getItem('ytab_debug') === 'true';
    }

    static getVideoId(url = window.location.href) {
        const match = url.match(/[?&]v=([^&]+)/);
        return match ? match[1] : null;
    }

    static getChannelId() {
        const channelLink = document.querySelector('a[href*="/channel/"], a[href*="/@"]');
        if (channelLink) {
            const href = channelLink.href;
            const channelMatch = href.match(/\/channel\/([^\/]+)/);
            const handleMatch = href.match(/\/@([^\/]+)/);
            return channelMatch ? channelMatch[1] : handleMatch ? handleMatch[1] : null;
        }
        return null;
    }

    static waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static async makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            this.log(`Request failed: ${error.message}`, 'error');
            throw error;
        }
    }

    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    static async getStorageData(keys) {
        return new Promise((resolve) => {
            const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
            browserAPI.storage.local.get(keys, resolve);
        });
    }

    static async setStorageData(data) {
        return new Promise((resolve) => {
            const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
            browserAPI.storage.local.set(data, resolve);
        });
    }

    static isYouTubePage() {
        return window.location.hostname.includes('youtube.com');
    }

    static isVideoPage() {
        return this.isYouTubePage() && window.location.pathname === '/watch';
    }

    static createNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `ytab-notification ytab-notification--${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#667eea'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        return notification;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else {
    window.Utils = Utils;
}