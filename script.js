document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const createMobileNav = () => {
        const nav = document.querySelector('.main-nav');
        const mobileNavToggle = document.createElement('button');
        mobileNavToggle.className = 'mobile-nav-toggle';
        mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileNavToggle.setAttribute('aria-label', '导航菜单');
        
        nav.parentNode.insertBefore(mobileNavToggle, nav);
        
        mobileNavToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            mobileNavToggle.innerHTML = isExpanded ? 
                '<i class="fas fa-bars"></i>' : 
                '<i class="fas fa-times"></i>';
        });
    };
    
    // Only create mobile nav for smaller screens
    if (window.innerWidth < 768) {
        createMobileNav();
    }
    
    // Window resize handler
    window.addEventListener('resize', () => {
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        if (window.innerWidth < 768) {
            if (!mobileNavToggle) {
                createMobileNav();
            }
        } else {
            if (mobileNavToggle) {
                mobileNavToggle.remove();
                document.querySelector('.main-nav').classList.remove('active');
            }
        }
    });
    
    // Banner slider functionality
    const setupBannerSlider = () => {
        const banners = [
            {
                title: '上海风中玫瑰贸易仲裁委员会（上海风中玫瑰仲裁中心）',
                image: 'images/banner.jpg'
            },
            {
                title: '专业高效的国际商事争议解决机构',
                image: 'images/banner2.jpg'
            },
            {
                title: '一带一路国际商事调解中心',
                image: 'images/banner3.jpg'
            }
        ];
        
        let currentBanner = 0;
        const bannerElement = document.querySelector('.banner');
        const bannerContent = document.querySelector('.banner-content h2');
        
        if (!bannerElement || !bannerContent) return;
        
        // Create navigation dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'banner-dots';
        bannerElement.appendChild(dotsContainer);
        
        banners.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = index === 0 ? 'dot active' : 'dot';
            dot.addEventListener('click', () => {
                changeBanner(index);
            });
            dotsContainer.appendChild(dot);
        });
        
        const changeBanner = (index) => {
            currentBanner = index;
            bannerContent.textContent = banners[index].title;
            bannerElement.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${banners[index].image}')`;
            
            // Update active dot
            document.querySelectorAll('.banner-dots .dot').forEach((dot, i) => {
                dot.className = i === index ? 'dot active' : 'dot';
            });
        };
        
        // Auto-rotate banners
        setInterval(() => {
            currentBanner = (currentBanner + 1) % banners.length;
            changeBanner(currentBanner);
        }, 5000);
    };
    
    setupBannerSlider();
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (email && email.includes('@')) {
                alert('感谢您的订阅！');
                this.reset();
            } else {
                alert('请输入有效的电子邮箱地址。');
            }
        });
    }
    
    // Search form functionality
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        searchBox.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = this.querySelector('input').value;
            
            if (query.trim()) {
                alert(`您正在搜索: ${query}`);
                // In a real implementation, redirect to search results page
                // window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add animation for quick links
    const quickLinks = document.querySelectorAll('.quick-link-item');
    quickLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const icon = link.querySelector('i');
            icon.classList.add('animate__animated', 'animate__pulse');
        });
        
        link.addEventListener('mouseleave', () => {
            const icon = link.querySelector('i');
            icon.classList.remove('animate__animated', 'animate__pulse');
        });
    });
});

// Add CSS class for sticky header on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});

