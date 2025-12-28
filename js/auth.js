/**
 * Simple Authentication Layer
 * Password protection for the dashboard
 */

(function() {
    'use strict';

    // ════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ════════════════════════════════════════════════════════════════════════

    // SHA-256 hash of your password
    // To generate: Open browser console and run:
    // crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword')).then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('')))

    const PASSWORD_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // Default: "password"
    const SESSION_KEY = 'portfolio_auth_token';
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    // ════════════════════════════════════════════════════════════════════════
    // AUTHENTICATION FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function isAuthenticated() {
        const session = localStorage.getItem(SESSION_KEY);
        if (!session) return false;

        try {
            const data = JSON.parse(session);
            const now = Date.now();
            return data.hash === PASSWORD_HASH && data.expires > now;
        } catch {
            return false;
        }
    }

    function setAuthenticated() {
        const session = {
            hash: PASSWORD_HASH,
            expires: Date.now() + SESSION_DURATION
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
        location.reload();
    }

    // ════════════════════════════════════════════════════════════════════════
    // UI FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    function createLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.innerHTML = `
            <style>
                #auth-modal {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.95);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.3s;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .auth-box {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: 16px;
                    padding: 48px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                }
                .auth-box h2 {
                    margin: 0 0 8px 0;
                    color: var(--text-primary);
                    font-size: 24px;
                    font-weight: 600;
                }
                .auth-box p {
                    margin: 0 0 32px 0;
                    color: var(--text-secondary);
                    font-size: 14px;
                }
                .auth-input {
                    width: 100%;
                    padding: 12px 16px;
                    background: var(--bg-body);
                    border: 1px solid var(--border-subtle);
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 14px;
                    font-family: var(--font-family);
                    margin-bottom: 16px;
                    transition: all 0.2s;
                }
                .auth-input:focus {
                    border-color: var(--color-brand);
                    outline: none;
                }
                .auth-button {
                    width: 100%;
                    padding: 12px;
                    background: var(--color-brand);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .auth-button:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                .auth-button:active {
                    transform: translateY(0);
                }
                .auth-error {
                    color: var(--color-down);
                    font-size: 13px;
                    margin-top: 12px;
                    display: none;
                }
                .auth-lock {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 24px;
                    background: var(--color-brand);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }
            </style>
            <div class="auth-box">
                <div class="auth-lock">🔒</div>
                <h2>Portföy Erişimi</h2>
                <p>Devam etmek için şifrenizi girin</p>
                <form id="auth-form">
                    <input
                        type="password"
                        id="auth-password"
                        class="auth-input"
                        placeholder="Şifre"
                        autocomplete="current-password"
                        autofocus
                    >
                    <button type="submit" class="auth-button">Giriş Yap</button>
                    <div class="auth-error" id="auth-error">Hatalı şifre. Lütfen tekrar deneyin.</div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    async function handleLogin(e) {
        e.preventDefault();
        const input = document.getElementById('auth-password');
        const error = document.getElementById('auth-error');
        const password = input.value;

        if (!password) return;

        const hash = await hashPassword(password);

        if (hash === PASSWORD_HASH) {
            setAuthenticated();
            document.getElementById('auth-modal').remove();
            // App will initialize automatically
            window.location.reload();
        } else {
            error.style.display = 'block';
            input.value = '';
            input.focus();
            // Shake animation
            input.style.animation = 'shake 0.3s';
            setTimeout(() => { input.style.animation = ''; }, 300);
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ════════════════════════════════════════════════════════════════════════

    function init() {
        // Add shake animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);

        if (!isAuthenticated()) {
            // Hide main content
            const appShell = document.querySelector('.app-shell');
            if (appShell) appShell.style.display = 'none';

            // Show login modal
            const modal = createLoginModal();
            document.getElementById('auth-form').addEventListener('submit', handleLogin);
        } else {
            // Add logout button to header
            window.addEventListener('load', () => {
                const headerActions = document.querySelector('.header-actions');
                if (headerActions) {
                    const logoutBtn = document.createElement('button');
                    logoutBtn.innerHTML = '⏻';
                    logoutBtn.title = 'Çıkış Yap';
                    logoutBtn.addEventListener('click', logout);
                    headerActions.appendChild(logoutBtn);
                }
            });
        }
    }

    // Run authentication check before anything else
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose logout function globally
    window.portfolioLogout = logout;
})();
