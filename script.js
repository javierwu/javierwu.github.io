// ========================================
// 浙工大给排水2002级2006届 毕业20周年同学会
// JavaScript 交互脚本
// ========================================

// 平滑滚动
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

// 导航栏滚动效果
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// 复制调查问卷格式
function copySurveyFormat() {
    const format = `1. 张三
   📍城市：杭州
   📱手机：138xxxx8888
   ✅意向：确定参加
   👨‍👩‍👧家属：配偶1人
   🎯方案：A或C（可多选1-2个）
   📅日期：5月23-24日、6月27-28日
   💰预算：可接受
   🍽️忌口：无
   👨‍🏫老师：希望能请XXX老师
   💡建议：期待重走板球场！`;

    navigator.clipboard.writeText(format).then(() => {
        alert('✅ 格式已复制到剪贴板！\n\n请粘贴到微信群填写后发送。');
    }).catch(() => {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = format;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('✅ 格式已复制！\n\n请粘贴到微信群填写后发送。');
    });
}

// 添加复制按钮
document.addEventListener('DOMContentLoaded', () => {
    const surveyBox = document.querySelector('.survey-box');
    if (surveyBox) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-copy';
        copyBtn.textContent = '📋 复制格式';
        copyBtn.style.cssText = `
            display: block;
            margin: 20px auto 0;
            padding: 12px 30px;
            background: #87A96B;
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
        `;
        copyBtn.addEventListener('click', copySurveyFormat);
        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.background = '#6B8E5A';
        });
        copyBtn.addEventListener('mouseleave', () => {
            copyBtn.style.background = '#87A96B';
        });
        surveyBox.appendChild(copyBtn);
    }

    // 为选项卡片添加点击展开效果
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    });

    // 统计倒计时（如果设置了截止日期）
    const deadlineElement = document.querySelector('.survey-info p');
    if (deadlineElement && deadlineElement.textContent.includes('X月X日')) {
        // 这里可以根据实际截止日期设置倒计时
        // const deadline = new Date('2026-03-31T24:00:00');
        // updateCountdown(deadline);
    }
});

// 倒计时功能
function updateCountdown(deadline) {
    function calculate() {
        const now = new Date();
        const diff = deadline - now;

        if (diff <= 0) {
            return '调查已截止';
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `⏰ 距离截止还有：${days}天 ${hours}小时 ${minutes}分钟`;
    }

    const countdownElement = document.createElement('p');
    countdownElement.className = 'countdown';
    countdownElement.style.cssText = `
        font-size: 18px;
        color: #E07A5F;
        font-weight: bold;
        margin: 20px 0;
    `;

    const surveyInfo = document.querySelector('.survey-info');
    if (surveyInfo) {
        surveyInfo.insertBefore(countdownElement, surveyInfo.firstChild);

        setInterval(() => {
            countdownElement.textContent = calculate();
        }, 60000);
    }
}

// 方案选择高亮
function highlightOption(option) {
    const cards = document.querySelectorAll('.option-card');
    cards.forEach(card => {
        card.style.opacity = '0.5';
        card.style.transform = 'scale(0.95)';
    });

    const selectedCard = document.querySelector(`.option-${option.toLowerCase()}`);
    if (selectedCard) {
        selectedCard.style.opacity = '1';
        selectedCard.style.transform = 'scale(1.05)';
        selectedCard.style.boxShadow = '0 10px 40px rgba(135, 169, 107, 0.3)';
    }
}

// 重置方案选择
function resetOptions() {
    const cards = document.querySelectorAll('.option-card');
    cards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.boxShadow = '';
    });
}

// 滚动动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 观察所有需要动画的元素
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.option-card, .about-card, .campus-card, .date-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// 打印功能
function printPage() {
    window.print();
}

// 分享功能
function sharePage() {
    const title = '浙工大给排水2002级2006届 毕业20周年同学会';
    const text = '廿载同窗，水长流远！快来参与我们的20周年同学会调查吧！';
    const url = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).catch(console.error);
    } else {
        // 降级方案：复制链接
        navigator.clipboard.writeText(url).then(() => {
            alert('🔗 网页链接已复制！\n\n可以分享给同学们了。');
        });
    }
}

// 添加分享按钮
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero-content');
    if (hero) {
        const shareBtn = document.createElement('button');
        shareBtn.className = 'btn-share';
        shareBtn.textContent = '📤 分享';
        shareBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #E07A5F;
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(224, 122, 95, 0.4);
            transition: all 0.3s;
            z-index: 999;
        `;
        shareBtn.addEventListener('click', sharePage);
        shareBtn.addEventListener('mouseenter', () => {
            shareBtn.style.transform = 'scale(1.1)';
        });
        shareBtn.addEventListener('mouseleave', () => {
            shareBtn.style.transform = 'scale(1)';
        });
        document.body.appendChild(shareBtn);
    }
});

console.log('🎓 浙工大给排水2002级2006届 同学会网页加载完成！');
console.log('廿载同窗 · 水长流远');
