<?php
$host = 'localhost';
$user = 'root'; 
$pass = '';
$db = 'buymium'; 

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    die('Database connection failed: ' . $conn->connect_error);
}

$subject = $_POST['subject'] ?? '';
$from = $_POST['from'] ?? '';
$to = $_POST['recipient'] ?? '';
$body = $_POST['body-plain'] ?? ($_POST['stripped-html'] ?? '');
$message_id = $_POST['Message-Id'] ?? $_POST['message-id'] ?? uniqid();
$timestamp = time();

// Simpan ke database
$stmt = $conn->prepare("INSERT IGNORE INTO emails (id, subject, sender, recipient, body, timestamp) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssi", $message_id, $subject, $from, $to, $body, $timestamp);
$stmt->execute();

$stmt->close();
$conn->close();

echo "OK";
