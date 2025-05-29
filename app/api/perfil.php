<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexao.php'; // Inclui sua conexão com o Clever Cloud

// Recebe o ID do usuário (isso precisa ser mais seguro em um sistema real, via token)
// Para teste, podemos pegar um ID fixo ou da URL (ex: perfil.php?id=1)
// Em produção, isso viria de um token ou sessão segura
$id_usuario = isset($_GET['id_usuario']) ? intval($_GET['id_usuario']) : null;

if (!$id_usuario) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID do usuário não fornecido."]);
    exit();
}

try {
    $stmt = $conn->prepare("SELECT NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO FROM USUARIOS WHERE ID_USUARIO = ?");
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user_data = $result->fetch_assoc();
        echo json_encode(["success" => true, "message" => "Dados do usuário encontrados.", "user" => $user_data]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
    }

    $stmt->close();
} catch (Exception $e) {
    error_log("Erro ao buscar usuário: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro interno do servidor."]);
}

$conn->close();
?>