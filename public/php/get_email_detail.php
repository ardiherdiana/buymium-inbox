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

$messageId = $_GET['messageId'] ?? '';

$stmt = $conn->prepare("SELECT * FROM emails WHERE id = ? LIMIT 1");
$stmt->bind_param("s", $messageId);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'email' => $row]);
} else {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Email tidak ditemukan']);
}

$stmt->close();
$conn->close();
?> 