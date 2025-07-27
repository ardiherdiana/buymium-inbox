class EmailService {
    constructor() {
        this.currentPrefix = '';
        this.emails = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromLocalStorage();
    }

    bindEvents() {
        const emailForm = document.getElementById('emailForm');
        const refreshButton = document.getElementById('refreshButton');

        emailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        refreshButton.addEventListener('click', () => {
            this.refreshEmails();
        });
    }

    loadFromLocalStorage() {
        const savedPrefix = localStorage.getItem('lastEmailPrefix');
        if (savedPrefix) {
            document.getElementById('emailPrefix').value = savedPrefix;
        }
    }

    async handleFormSubmit() {
        const emailInput = document.getElementById('emailPrefix').value.trim();
        if (!emailInput) {
            this.showError('Masukkan nama email terlebih dahulu');
            return;
        }

        let prefix = emailInput;
        if (emailInput.includes('@')) {
            const [pre, domain] = emailInput.split('@');
            if (domain !== 'buymium.store') {
                this.showError('Domain harus buymium.store');
                return;
            }
            prefix = pre;
        }

        // Validasi prefix
        if (!/^[a-zA-Z0-9._-]+$/.test(prefix)) {
            this.showError('Nama email hanya boleh berisi huruf, angka, titik, underscore, dan dash');
            return;
        }

        // Reset semua data ketika ganti email prefix
        this.currentPrefix = prefix;
        this.emails = [];
        localStorage.setItem('lastEmailPrefix', prefix);
        // Bersihkan container email lama
        const container = document.getElementById('emailsContainer');
        container.innerHTML = '';
        this.showEmailList();
        await this.fetchEmails();
    }

    showEmailList() {
        const emailList = document.getElementById('emailList');
        const emailAddress = document.getElementById('emailAddress');
        const noEmailAddress = document.getElementById('noEmailAddress');
        emailList.style.display = 'block';
        emailAddress.textContent = `${this.currentPrefix}@buymium.store`;
        noEmailAddress.textContent = `${this.currentPrefix}@buymium.store`;
        emailList.scrollIntoView({ behavior: 'smooth' });
    }

    async fetchEmails() {
        this.showLoading(true);
        this.hideMessages();

        try {
            
            // Untuk hPanel Hostinger (file HTML sejajar dengan folder php):
            const fetchUrl = `php/get_emails.php?prefix=${this.currentPrefix}`;
            const response = await fetch(fetchUrl);
            const data = await response.json();

            if (data.success) {
                this.emails = data.emails;
                this.displayEmails();
            } else {
                this.showError(data.error || 'Gagal mengambil email');
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            this.showError('Terjadi kesalahan saat mengambil email');
        } finally {
            this.showLoading(false);
        }
    }

    async refreshEmails() {
        if (this.currentPrefix) {
            await this.fetchEmails();
        }
    }

    displayEmails() {
        const container = document.getElementById('emailsContainer');
        
        if (this.emails.length === 0) {
            this.showNoEmails();
            return;
        }

        // Bersihkan container sepenuhnya
        container.innerHTML = '';
        
        this.emails.forEach(email => {
            const emailElement = this.createEmailElement(email);
            container.appendChild(emailElement);
        });
    }

    createEmailElement(email) {
        const emailDiv = document.createElement('div');
        emailDiv.className = 'email-item';
        emailDiv.dataset.emailId = email.id;
        emailDiv.dataset.expanded = 'false';

        const timestamp = this.formatTimestamp(email.timestamp);
        const preview = this.getEmailPreview(email.body);

        emailDiv.innerHTML = `
            <div class="email-header">
                <div class="email-subject">${this.escapeHtml(email.subject)}</div>
                <div class="email-time">${timestamp}</div>
            </div>
            <div class="email-from">Dari: ${this.escapeHtml(email.from)}</div>
            <div class="email-preview">${this.escapeHtml(preview)}</div>
        `;

        emailDiv.addEventListener('click', () => {
            this.toggleEmailContent(email);
        });

        return emailDiv;
    }

    async toggleEmailContent(email) {
        const emailElement = document.querySelector(`[data-email-id="${email.id}"]`);
        const previewElement = emailElement.querySelector('.email-preview');
        const isExpanded = emailElement.dataset.expanded === 'true';
        
        if (isExpanded) {
            // Kembalikan ke preview dengan style asli
            const preview = this.getEmailPreview(email.body);
            previewElement.textContent = preview;
            previewElement.style.whiteSpace = 'normal';
            previewElement.style.overflow = '';
            previewElement.style.textOverflow = '';
            previewElement.style.webkitLineClamp = '';
            previewElement.style.maxHeight = '';
            emailElement.dataset.expanded = 'false';
        } else {
            // Tampilkan full content
            if (!emailElement.dataset.fullContentLoaded) {
                // Show loading
                previewElement.textContent = 'Memuat isi lengkap...';
                
                try {
                    // Untuk hPanel Hostinger (file HTML sejajar dengan folder php):
                    const fetchUrl = `php/get_email_detail.php?messageId=${encodeURIComponent(email.id)}`;
                    const response = await fetch(fetchUrl);
                    const data = await response.json();

                    if (data.success) {
                        const detailEmail = data.email;
                        // Simpan full content
                        emailElement.dataset.fullContent = detailEmail.body;
                        emailElement.dataset.fullContentLoaded = 'true';
                        // Tampilkan full content dengan format yang dipertahankan
                        previewElement.textContent = detailEmail.body;
                        previewElement.style.whiteSpace = 'pre-wrap';
                        previewElement.style.overflow = 'visible';
                        previewElement.style.textOverflow = 'unset';
                        previewElement.style.webkitLineClamp = 'unset';
                        previewElement.style.maxHeight = 'none';
                        emailElement.dataset.expanded = 'true';
                    } else {
                        previewElement.textContent = 'Gagal memuat isi email';
                        setTimeout(() => {
                            const preview = this.getEmailPreview(email.body);
                            previewElement.textContent = preview;
                        }, 2000);
                    }
                } catch (error) {
                    console.error('Error fetching email detail:', error);
                    previewElement.textContent = 'Terjadi kesalahan saat memuat isi email';
                    setTimeout(() => {
                        const preview = this.getEmailPreview(email.body);
                        previewElement.textContent = preview;
                    }, 2000);
                }
            } else {
                // Gunakan full content yang sudah disimpan dengan format yang dipertahankan
                previewElement.textContent = emailElement.dataset.fullContent;
                previewElement.style.whiteSpace = 'pre-wrap';
                previewElement.style.overflow = 'visible';
                previewElement.style.textOverflow = 'unset';
                previewElement.style.webkitLineClamp = 'unset';
                previewElement.style.maxHeight = 'none';
                emailElement.dataset.expanded = 'true';
            }
        }
    }

    formatEmailBody(body) {
        // Jika body adalah HTML, tampilkan sebagai HTML
        if (body.includes('<') && body.includes('>')) {
            return body;
        }
        
        // Jika plain text, escape HTML dan ganti line breaks
        return this.escapeHtml(body).replace(/\n/g, '<br>');
    }

    getEmailPreview(body) {
        // Hapus HTML tags untuk preview
        const plainText = body.replace(/<[^>]*>/g, '');
        return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} menit yang lalu`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} jam yang lalu`;
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    resetAllExpandedStates() {
        // Reset semua status expanded
        document.querySelectorAll('.email-item').forEach(emailElement => {
            emailElement.dataset.expanded = 'false';
            emailElement.dataset.fullContentLoaded = 'false';
            delete emailElement.dataset.fullContent;
            
            const previewElement = emailElement.querySelector('.email-preview');
            if (previewElement) {
                previewElement.style.whiteSpace = 'normal';
                previewElement.style.overflow = '';
                previewElement.style.textOverflow = '';
                previewElement.style.webkitLineClamp = '';
                previewElement.style.maxHeight = '';
            }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show) {
        const loadingMessage = document.getElementById('loadingMessage');
        loadingMessage.style.display = show ? 'block' : 'none';
    }

    showNoEmails() {
        const noEmailsMessage = document.getElementById('noEmailsMessage');
        noEmailsMessage.style.display = 'block';
    }

    hideMessages() {
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('noEmailsMessage').style.display = 'none';
    }

    showError(message) {
        // Buat toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Hapus toast setelah 5 detik
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Auto-refresh setiap 30 detik
let autoRefreshInterval;

function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        if (emailService.currentPrefix) {
            emailService.refreshEmails();
        }
    }, 30000); // 30 detik
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// Inisialisasi aplikasi
const emailService = new EmailService();

// Start auto-refresh ketika halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    startAutoRefresh();
});

// Stop auto-refresh ketika tab tidak aktif
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
    }
});