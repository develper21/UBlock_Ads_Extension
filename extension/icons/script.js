// Main JavaScript file for YouTube Ad Blocker Extension Landing Page

document.addEventListener('DOMContentLoaded', function() {
    console.log('YouTube Ad Blocker Extension Landing Page Loaded!');
    
    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = '0s';
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .step, .flow-item, .spec-item').forEach(el => {
        observer.observe(el);
    });
    
    // Add copy functionality for code snippets
    document.querySelectorAll('code').forEach(code => {
        code.style.cursor = 'pointer';
        code.title = 'Click to copy';
        
        code.addEventListener('click', function() {
            navigator.clipboard.writeText(this.textContent).then(() => {
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                this.style.background = '#28a745';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '#e9ecef';
                    this.style.color = 'inherit';
                }, 1000);
            });
        });
    });
    
    // Add hover effects for feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            this.style.color = 'white';
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.background = '#f8f9fa';
            this.style.color = 'inherit';
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add loading animation for the logo
    const logo = document.querySelector('.logo svg');
    if (logo) {
        logo.style.animation = 'pulse 2s infinite';
    }
    
    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .feature-card {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Add scroll-to-top functionality
    let scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #667eea;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
        } else {
            scrollToTopBtn.style.opacity = '0';
        }
    });
    
    // Add dynamic counter animation
    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = Math.floor(current);
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, 20);
    };
    
    // Create a demo counter for blocked ads
    const createDemoCounter = () => {
        const demoSection = document.createElement('div');
        demoSection.innerHTML = `
            <section class="demo-counter" style="text-align: center; padding: 40px; background: linear-gradient(135deg, #FF4757 0%, #FF6B7A 100%); color: white; border-radius: 20px; margin: 20px 0;">
                <h2 style="color: white; margin-bottom: 20px;">Live Demo Counter</h2>
                <div style="font-size: 4rem; font-weight: bold; margin: 20px 0;" id="demo-count">0</div>
                <p style="font-size: 1.2rem; opacity: 0.9;">Ads Blocked (Demo)</p>
                <button id="demo-btn" style="margin-top: 20px; padding: 10px 20px; background: white; color: #FF4757; border: none; border-radius: 25px; font-weight: bold; cursor: pointer;">Simulate Ad Block</button>
            </section>
        `;
        
        const downloadSection = document.querySelector('.download');
        downloadSection.parentNode.insertBefore(demoSection, downloadSection);
        
        let demoCount = 0;
        const demoCountElement = document.getElementById('demo-count');
        const demoBtnElement = document.getElementById('demo-btn');
        
        demoBtnElement.addEventListener('click', () => {
            demoCount += Math.floor(Math.random() * 5) + 1;
            animateCounter(demoCountElement, demoCount);
            
            // Add visual feedback
            demoBtnElement.style.background = '#28a745';
            demoBtnElement.style.color = 'white';
            demoBtnElement.textContent = 'Blocked!';
            
            setTimeout(() => {
                demoBtnElement.style.background = 'white';
                demoBtnElement.style.color = '#FF4757';
                demoBtnElement.textContent = 'Simulate Ad Block';
            }, 1000);
        });
    };
    
    // Add the demo counter
    createDemoCounter();
});