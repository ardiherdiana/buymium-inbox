<?php
// Konfigurasi koneksi MySQL
$host = 'localhost';
$user = 'root'; // ganti sesuai user MySQL kamu
$pass = '';
$db = 'buymium'; // ganti sesuai nama database kamu

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    die('Database connection failed: ' . $conn->connect_error);
}

// Hapus email yang lebih dari 1 hari (24 jam)
$oneDayAgo = time() - 86400; // 86400 detik = 24 jam
$stmt = $conn->prepare("DELETE FROM emails WHERE timestamp < ?");
$stmt->bind_param("i", $oneDayAgo);
$stmt->execute();

echo "Deleted " . $stmt->affected_rows . " old emails.\n";

$stmt->close();
$conn->close();
?> 