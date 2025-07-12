# PHP Backend Buymium

## File:
- inbound.php         : Endpoint untuk menerima email dari Mailgun (POST), simpan ke MySQL
- get_emails.php      : Endpoint untuk ambil daftar email berdasarkan prefix (GET)
- get_email_detail.php: Endpoint untuk ambil detail email berdasarkan messageId (GET)

## Setup Database
1. Buat database di MySQL, misal: `buymium`
2. Buat tabel:

CREATE TABLE emails (
  id VARCHAR(255) PRIMARY KEY,
  subject VARCHAR(255),
  sender VARCHAR(255),
  recipient VARCHAR(255),
  body TEXT,
  timestamp INT
);

3. Edit konfigurasi koneksi di setiap file PHP jika perlu (user, password, db)

## Setting Mailgun
- Atur route Forward ke: http://[alamat-server]/php/inbound.php

## Frontend
- Untuk fetch email: GET ke /php/get_emails.php?prefix=namaprefix
- Untuk detail email: GET ke /php/get_email_detail.php?messageId=ID 