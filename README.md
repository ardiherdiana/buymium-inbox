# Buymium - Temporary Email Service

Website temporary email sederhana seperti inboxkitten.com yang menggunakan Mailgun API untuk menerima dan menampilkan email.

## Fitur

- ✅ Form input untuk memasukkan nama email (prefix)
- ✅ Tampilan email dengan format: Subject, From, Isi email, Waktu masuk
- ✅ Tombol refresh untuk memperbarui daftar email
- ✅ Auto-refresh setiap 30 detik
- ✅ Tampilan detail email dengan klik
- ✅ Responsive design untuk mobile dan desktop
- ✅ Dark mode design yang modern
- ✅ Validasi input email prefix
- ✅ Local storage untuk menyimpan email prefix terakhir

## Teknologi

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **API**: Mailgun API
- **Styling**: Custom CSS dengan gradient dan glassmorphism

## Instalasi

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```

3. Pastikan konfigurasi Mailgun sudah benar di `config.js`:
   ```javascript
   module.exports = {
     MAILGUN_API_KEY: 'your-api-key-here',
     MAILGUN_DOMAIN: 'your-domain-here',
     PORT: 3000
   };
   ```

4. Jalankan server:
   ```bash
   npm start
   ```

5. Buka browser dan akses `http://localhost:3000`

## Cara Penggunaan

1. Masukkan nama email (prefix) di form input
2. Klik tombol "GO"
3. Website akan mengambil email yang dikirim ke `[prefix]@buymium.store`
4. Email akan ditampilkan dalam daftar dengan informasi lengkap
5. Klik email untuk melihat detail lengkap
6. Gunakan tombol refresh untuk memperbarui daftar email

## Struktur Proyek

```
buymium-inbox/
├── server.js          # Server Express.js
├── config.js          # Konfigurasi API key dan domain
├── package.json       # Dependencies dan scripts
├── README.md          # Dokumentasi
└── public/            # File frontend
    ├── index.html     # Halaman utama
    ├── style.css      # Styling CSS
    └── script.js      # JavaScript untuk interaksi
```

## API Endpoints

### GET /api/emails/:prefix
Mengambil daftar email berdasarkan prefix yang diberikan.

**Response:**
```json
{
  "success": true,
  "emails": [
    {
      "id": "message-id",
      "subject": "Subject Email",
      "from": "sender@example.com",
      "to": "prefix@buymium.store",
      "body": "Isi email",
      "timestamp": 1234567890,
      "size": 1024
    }
  ]
}
```

### GET /api/email/:messageId
Mengambil detail email berdasarkan message ID.

**Response:**
```json
{
  "success": true,
  "email": {
    "id": "message-id",
    "subject": "Subject Email",
    "from": "sender@example.com",
    "to": "prefix@buymium.store",
    "body": "Isi email lengkap",
    "timestamp": 1234567890,
    "size": 1024
  }
}
```

## Konfigurasi Mailgun

Pastikan domain `buymium.store` sudah dikonfigurasi dengan benar di Mailgun:

1. Domain sudah terverifikasi
2. DNS records sudah dikonfigurasi
3. API key memiliki akses untuk membaca email
4. Webhook events sudah dikonfigurasi (opsional)

## Keamanan

- Email tidak disimpan secara permanen di database
- Email akan expired sesuai kebijakan retention Mailgun
- Tidak ada sistem registrasi atau autentikasi
- Input email prefix divalidasi untuk mencegah injection

## Pengembangan

Untuk development mode dengan auto-restart:
```bash
npm run dev
```

## Lisensi

MIT License

## Catatan

- Email temporary akan expired sesuai kebijakan Mailgun (biasanya 3-7 hari)
- Website ini hanya untuk keperluan testing dan development
- Jangan gunakan untuk aktivitas yang memerlukan keamanan tinggi 