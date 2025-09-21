// Popup script for YouTube Ad Blocker Extension

document.addEventListener('DOMContentLoaded', function() {
    const blockedCountElement = document.getElementById('blockedCount');
    const resetBtn = document.getElementById('resetBtn');
    const statusElement = document.getElementById('status');
    
    // Load and display blocked ads count
    function loadBlockedCount() {
        // Check if we're using Chrome or Firefox API
        const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
        
        browserAPI.runtime.sendMessage({ action: 'getBlockedCount' }, (response) => {
            if (response && typeof response.count === 'number') {
                updateCountDisplay(response.count);
            } else {
                // Fallback to storage API
                browserAPI.storage.local.get(['blockedAdsCount'], (result) => {
                    const count = result.blockedAdsCount || 0;
                    updateCountDisplay(count);
                });
            }
        });
    }
    
    // Update count display with animation
    function updateCountDisplay(count) {
        const currentCount = parseInt(blockedCountElement.textContent) || 0;
        
        if (count !== currentCount) {
            // Animate number change
            animateNumber(currentCount, count, 500);
        }
    }
    
    // Animate number counting
    function animateNumber(start, end, duration) {
        const startTime = Date.now();
        const difference = end - start;
        
        function updateNumber() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (difference * easeOut));
            
            blockedCountElement.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                blockedCountElement.textContent = end;
            }
        }
        
        updateNumber();
    }
    
    // Reset counter
    function resetCounter() {
        const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
        
        resetBtn.disabled = true;
        resetBtn.innerHTML = '<div class="loading"></div>';
        
        browserAPI.runtime.sendMessage({ action: 'resetCount' }, (response) => {
            if (response && response.success) {
                animateNumber(parseInt(blockedCountElement.textContent) || 0, 0, 300);
                showSuccessMessage('Counter reset successfully!');
            }
            
            setTimeout(() => {
                resetBtn.disabled = false;
                resetBtn.textContent = 'Reset Counter';
            }, 1000);
        });
    }
    
    // Show success message
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const container = document.querySelector('.container');
        container.insertBefore(successDiv, document.querySelector('.info'));
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
    
    // Check if extension is active on current tab
    function checkExtensionStatus() {
        const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
        
        browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab && currentTab.url) {
                const isYouTube = currentTab.url.includes('youtube.com');
                updateStatusDisplay(isYouTube);
            }
        });
    }
    
    // Update status display
    function updateStatusDisplay(isActive) {
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('span');
        
        if (isActive) {
            indicator.className = 'status-indicator active';
            text.textContent = 'Protection Active';
        } else {
            indicator.className = 'status-indicator inactive';
            indicator.style.background = '#ff6b6b';
            indicator.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)';
            text.textContent = 'Visit YouTube to activate';
        }
    }
    
    // Event listeners
    resetBtn.addEventListener('click', resetCounter);
    
    // Initialize popup
    loadBlockedCount();
    checkExtensionStatus();
    
    // Update count every 2 seconds when popup is open
    const updateInterval = setInterval(loadBlockedCount, 2000);
    
    // Clean up interval when popup closes
    window.addEventListener('beforeunload', () => {
        clearInterval(updateInterval);
    });
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.key === 'r' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            resetCounter();
        }
    });
});