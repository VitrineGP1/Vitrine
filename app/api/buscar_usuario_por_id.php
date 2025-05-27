<?php
// Incluir o arquivo de conexão
require_once 'config/conexao.php';

// Configurar cabeçalhos para JSON e CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Cuidado em produção!
header('Access-Control-Allow-Methods: GET, OPTIONS'); // Permitir GET
header('Access-Control-Allow-Headers: Content-Type');

// Se for uma requisição OPTIONS (pré-voo do CORS), apenas retorne 200 OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verifica se a requisição é GET e se o ID foi fornecido na URL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id_usuario = $_GET['id'];

    // Validação básica do ID
    if (!is_numeric($id_usuario)) {
        echo json_encode(["success" => false, "message" => "ID de usuário inválido."]);
        $conn->close();
        exit();
    }

    // Preparar a instrução SQL para buscar o usuário pelo ID
    // Seleciona TODAS as colunas que você quer exibir no perfil
    $sql = "SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO FROM USUARIOS WHERE ID_USUARIO = ?";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("i", $id_usuario); // 'i' para integer (ID do usuário)
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            // Retorne o usuário encontrado
            echo json_encode(["success" => true, "user" => $user]);
        } else {
            // Usuário não encontrado
            echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
        }

        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Erro na preparação da query: " . $conn->error]);
    }

    $conn->close();
} else {
    // Se não for GET ou o ID não for fornecido
    echo json_encode(["success" => false, "message" => "Método de requisição não permitido ou ID do usuário ausente. Use GET com ?id=."]);
}
?>