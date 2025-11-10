// 通用认证工具函数

// 显示消息
export function showMessage(elementId, message, type = 'info') {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message show ${type}`;
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 5000);
    }
}

// 验证邮箱格式
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 验证密码强度（至少6位）
export function validatePassword(password) {
    return password.length >= 6;
}

// 获取所有用户
export function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// 保存用户
export function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
}

// 查找用户
export function findUserByEmail(email) {
    const users = getUsers();
    return users.find(user => user.email === email);
}

// 保存当前登录用户
export function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// 获取当前登录用户
export function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// 退出登录
export function logout() {
    localStorage.removeItem('currentUser');
}