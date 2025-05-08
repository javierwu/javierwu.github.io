// 后台管理系统JavaScript功能

document.addEventListener('DOMContentLoaded', () => {
    // 登录表单处理
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // 简单的前端验证，实际应用中应该使用后端验证
            if (username === 'admin' && password === 'admin123') {
                // 存储登录状态
                localStorage.setItem('adminLoggedIn', 'true');
                // 跳转到管理界面
                window.location.href = 'index.html';
            } else {
                alert('用户名或密码错误！');
            }
        });
    }
    
    // 检查登录状态
    const checkLogin = () => {
        // 如果在登录页面，不需要检查
        if (window.location.href.includes('login.html')) {
            return;
        }
        
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        if (!isLoggedIn) {
            // 未登录，跳转到登录页面
            window.location.href = 'login.html';
        }
    };
    
    // 执行登录检查
    checkLogin();
    
    // 退出登录功能
    const logoutBtn = document.getElementById('logout-btn');
    const headerLogoutBtn = document.getElementById('header-logout-btn');
    
    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'login.html';
    };
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', handleLogout);
    }
    
    // 侧边栏折叠功能
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            
            // 更新按钮图标
            const icon = sidebarToggle.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fas fa-bars';
            } else {
                icon.className = 'fas fa-times';
            }
        });
    }
    
    // 响应式导航处理
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    
    if (mobileNavToggle && sidebar) {
        mobileNavToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            
            // 更新按钮图标
            const isActive = sidebar.classList.contains('active');
            mobileNavToggle.innerHTML = isActive ? 
                '<i class="fas fa-times"></i>' : 
                '<i class="fas fa-bars"></i>';
        });
    }
    
    // 表格操作功能
    const setupTableActions = () => {
        // 编辑按钮点击事件
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                const title = row.querySelector('td:first-child').textContent;
                alert(`编辑: ${title}`);
                // 实际应用中，这里应该打开编辑表单或页面
            });
        });
        
        // 删除按钮点击事件
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                const title = row.querySelector('td:first-child').textContent;
                
                if (confirm(`确定要删除 "${title}" 吗？`)) {
                    // 实际应用中，这里应该发送删除请求到后端
                    row.remove();
                    alert('删除成功！');
                }
            });
        });
    };
    
    setupTableActions();
    
    // 添加新内容的模拟功能
    const setupAddButtons = () => {
        const addButtons = document.querySelectorAll('.add-new-btn');
        
        addButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const type = this.dataset.type;
                alert(`添加新${type}`);
                // 实际应用中，这里应该打开添加表单或页面
            });
        });
    };
    
    setupAddButtons();
    
    // 模拟数据加载
    const simulateDataLoading = () => {
        const loadingElements = document.querySelectorAll('.loading-data');
        
        loadingElements.forEach(element => {
            setTimeout(() => {
                element.classList.remove('loading-data');
                element.innerHTML = element.dataset.content || '加载完成';
            }, 1000);
        });
    };
    
    simulateDataLoading();
    
    // 页面切换功能
    const setupPageNavigation = () => {
        const navLinks = document.querySelectorAll('.admin-nav a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // 如果链接指向其他页面，不阻止默认行为
                if (this.getAttribute('href').includes('.html')) {
                    return;
                }
                
                e.preventDefault();
                
                // 更新活动状态
                document.querySelectorAll('.admin-nav li').forEach(item => {
                    item.classList.remove('active');
                });
                this.parentElement.classList.add('active');
                
                // 更新页面标题
                const pageTitle = document.getElementById('page-title');
                if (pageTitle) {
                    pageTitle.textContent = this.textContent.trim();
                }
                
                // 在实际应用中，这里应该加载相应的内容
            });
        });
    };
    
    setupPageNavigation();
    
    // 实现搜索功能
    const setupSearch = () => {
        const searchBox = document.querySelector('.admin-search');
        
        if (searchBox) {
            searchBox.addEventListener('submit', function(e) {
                e.preventDefault();
                const query = this.querySelector('input').value.trim();
                
                if (query) {
                    alert(`搜索: ${query}`);
                    // 实际应用中，这里应该执行搜索并显示结果
                }
            });
        }
    };
    
    setupSearch();
});

// 全局函数：显示通知
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    // 添加关闭按钮功能
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // 自动关闭
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 全局函数：确认对话框
function confirmAction(message, callback) {
    const confirmed = confirm(message);
    if (confirmed && typeof callback === 'function') {
        callback();
    }
}
