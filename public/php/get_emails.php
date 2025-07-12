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

$prefix = $_GET['prefix'] ?? '';
$to = $prefix . '@buymium.store';

$stmt = $conn->prepare("SELECT * FROM emails WHERE recipient = ? ORDER BY timestamp DESC");
$stmt->bind_param("s", $to);
$stmt->execute();
$result = $stmt->get_result();

$emails = [];
while ($row = $result->fetch_assoc()) {
    $emails[] = $row;
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode(['success' => true, 'emails' => $emails]);
?> 