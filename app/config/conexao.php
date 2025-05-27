<?php

$servername = getenv('btnstetpkc5wyiazdaat-mysql.services.clever-cloud.com');
$username = getenv('ug8zsmvq9zgfgmhm');
$password = getenv('S9Wvl7TVAMRaYcgxZ4aA');
$dbname = getenv('btnstetpkc5wyiazdaat');
$port = getenv('3306');

$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro interno do servidor ao conectar ao banco de dados."]);
    exit();
}

?>