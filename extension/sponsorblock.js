// SponsorBlock integration for YouTube Ad Blocker Pro

class SponsorBlock {
    constructor() {
        this.apiUrl = 'https://sponsor.ajay.app/api';
        this.segments = [];
        this.currentVideoId = null;
        this.enabled = true;
        this.categories = {
            sponsor: { enabled: true, color: '#00d400' },
            selfpromo: { enabled: true, color: '#ffff00' },
            interaction: { enabled: true, color: '#cc00ff' },
            intro: { enabled: false, color: '#00ffff' },
            outro: { enabled: false, color: '#0202ed' },
            preview: { enabled: false, color: '#008fd6' },
            music_offtopic: { enabled: false, color: '#ff9900' },
            filler: { enabled: false, color: '#7300FF' }
        };
        this.skipCount = 0;
        this.init();
    }

    async init() {
        const settings = await Utils.getStorageData(['sponsorblock_enabled', 'sponsorblock_categories', 'sponsorblock_skipcount']);
        
        this.enabled = settings.sponsorblock_enabled !== false;
        if (settings.sponsorblock_categories) {
            this.categories = { ...this.categories, ...settings.sponsorblock_categories };
        }
        this.skipCount = settings.sponsorblock_skipcount || 0;
        
        Utils.log('SponsorBlock initialized', 'info');
    }

    async fetchSegments(videoId) {
        if (!this.enabled || !videoId) return [];
        
        try {
            const enabledCategories = Object.keys(this.categories).filter(cat => this.categories[cat].enabled);
            if (enabledCategories.length === 0) return [];
            
            const categoriesParam = JSON.stringify(enabledCategories);
            const url = `${this.apiUrl}/skipSegments?videoID=${videoId}&categories=${encodeURIComponent(categoriesParam)}`;
            
            Utils.log(`Fetching SponsorBlock segments for ${videoId}`, 'info');
            const response = await Utils.makeRequest(url);
            
            if (Array.isArray(response)) {
                this.segments = response.map(segment => ({
                    category: segment.category,
                    startTime: segment.segment[0],
                    endTime: segment.segment[1],
                    UUID: segment.UUID,
                    votes: segment.votes,
                    locked: segment.locked,
                    description: segment.description || ''
                }));
                
                Utils.log(`Found ${this.segments.length} SponsorBlock segments`, 'info');
                return this.segments;
            }
        } catch (error) {
            Utils.log(`SponsorBlock API error: ${error.message}`, 'warn');
        }
        
        return [];
    }

    async loadSegments(videoId) {
        if (this.currentVideoId === videoId) return this.segments;
        
        this.currentVideoId = videoId;
        this.segments = await this.fetchSegments(videoId);
        
        // Update UI with segments
        this.displaySegments();
        
        return this.segments;
    }

    checkCurrentTime(currentTime) {
        if (!this.enabled || this.segments.length === 0) return null;
        
        for (const segment of this.segments) {
            if (currentTime >= segment.startTime && currentTime < segment.endTime) {
                return segment;
            }
        }
        return null;
    }

    async skipSegment(video, segment) {
        if (!video || !segment) return false;
        
        try {
            video.currentTime = segment.endTime;
            this.skipCount++;
            
            // Save skip count
            await Utils.setStorageData({ sponsorblock_skipcount: this.skipCount });
            
            // Show notification
            const categoryName = segment.category.replace('_', ' ').toUpperCase();
            Utils.createNotification(
                `Skipped ${categoryName} segment (${Utils.formatTime(segment.endTime - segment.startTime)})`,
                'success',
                2000
            );
            
            Utils.log(`Skipped ${segment.category} segment: ${segment.startTime}s - ${segment.endTime}s`, 'info');
            
            // Send skip event to background
            const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
            browserAPI.runtime.sendMessage({
                action: 'sponsorblock_skip',
                category: segment.category,
                videoId: this.currentVideoId
            });
            
            return true;
        } catch (error) {
            Utils.log(`Error skipping segment: ${error.message}`, 'error');
            return false;
        }
    }

    displaySegments() {
        if (!this.segments.length) return;
        
        // Remove existing segment markers
        document.querySelectorAll('.ytab-segment-marker').forEach(el => el.remove());
        
        // Wait for progress bar
        Utils.waitForElement('.ytp-progress-bar-container').then(container => {
            this.createSegmentMarkers(container);
        }).catch(() => {
            Utils.log('Could not find progress bar for segment markers', 'warn');
        });
    }

    createSegmentMarkers(progressContainer) {
        const video = document.querySelector('video');
        if (!video || !video.duration) return;
        
        this.segments.forEach(segment => {
            const marker = document.createElement('div');
            marker.className = 'ytab-segment-marker';
            marker.title = `${segment.category.replace('_', ' ').toUpperCase()}: ${Utils.formatTime(segment.startTime)} - ${Utils.formatTime(segment.endTime)}`;
            
            const startPercent = (segment.startTime / video.duration) * 100;
            const widthPercent = ((segment.endTime - segment.startTime) / video.duration) * 100;
            
            marker.style.cssText = `
                position: absolute;
                left: ${startPercent}%;
                width: ${widthPercent}%;
                height: 100%;
                background-color: ${this.categories[segment.category]?.color || '#ff0000'};
                opacity: 0.8;
                pointer-events: none;
                z-index: 1;
            `;
            
            progressContainer.appendChild(marker);
        });
    }

    async submitSegment(videoId, startTime, endTime, category) {
        if (!this.enabled) return false;
        
        try {
            const response = await Utils.makeRequest(`${this.apiUrl}/skipSegments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoID: videoId,
                    segments: [{
                        segment: [startTime, endTime],
                        category: category
                    }],
                    userID: await this.getUserId()
                })
            });
            
            Utils.createNotification('Segment submitted to SponsorBlock!', 'success');
            return true;
        } catch (error) {
            Utils.log(`Error submitting segment: ${error.message}`, 'error');
            Utils.createNotification('Failed to submit segment', 'error');
            return false;
        }
    }

    async getUserId() {
        let userId = await Utils.getStorageData(['sponsorblock_userid']);
        if (!userId.sponsorblock_userid) {
            userId = this.generateUserId();
            await Utils.setStorageData({ sponsorblock_userid: userId });
        }
        return userId.sponsorblock_userid || userId;
    }

    generateUserId() {
        return 'ytab_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    async updateSettings(settings) {
        if (settings.enabled !== undefined) {
            this.enabled = settings.enabled;
        }
        
        if (settings.categories) {
            this.categories = { ...this.categories, ...settings.categories };
        }
        
        await Utils.setStorageData({
            sponsorblock_enabled: this.enabled,
            sponsorblock_categories: this.categories
        });
        
        // Reload segments if video is playing
        if (this.currentVideoId) {
            await this.loadSegments(this.currentVideoId);
        }
    }

    getStats() {
        return {
            enabled: this.enabled,
            skipCount: this.skipCount,
            segmentsFound: this.segments.length,
            currentVideo: this.currentVideoId
        };
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SponsorBlock;
} else {
    window.SponsorBlock = SponsorBlock;
}