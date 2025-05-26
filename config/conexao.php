<?php
$servername = "btnstetpkc5wyiazdaat-mysql.services.clever-cloud.com";
$database = "btnstetpkc5wyiazdaat";
$username = "ug8zsmvq9zgfgmhm";
$password = "S9Wvl7TVAMRaYcgxZ4aA";

$conn = new mysqli($servername, $username, $password, $database);

if (!$conn) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    echo json_encode(["success" => false, "message" => "Conexão falhou: " . mysqli_connect_error()]);
    exit();
}

?>