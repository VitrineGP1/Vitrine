<?php
// Define os cabeçalhos CORS
header("Access-Control-Allow-Origin: *"); // Altere para a URL do seu frontend em produção
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json'); // Resposta JSON

require_once 'conexao.php'; // Inclui sua conexão com o Clever Cloud

$data = json_decode(file_get_contents('php://input'), true);

if (json_last_error() !== JSON_ERROR_NONE || empty($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Dados inválidos."]);
    exit();
}

$email = $data['email'] ?? '';
$senha = $data['password'] ?? '';

if (empty($email) || empty($senha)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email e senha são obrigatórios."]);
    exit();
}

try {
    // Busca o usuário pelo email
    $stmt = $conn->prepare("SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, TIPO_USUARIO FROM USUARIOS WHERE EMAIL_USUARIO = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        // Verifica a senha hashada
        if (password_verify($senha, $user['SENHA_USUARIO'])) {
            // Login bem-sucedido
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Login bem-sucedido!",
                "user" => [
                    "id" => $user['ID_USUARIO'],
                    "name" => $user['NOME_USUARIO'],
                    "email" => $user['EMAIL_USUARIO'],
                    "type" => $user['TIPO_USUARIO']
                    // Não envie a senha hashada ou qualquer dado sensível!
                ]
            ]);
            // Aqui você pode gerar um token JWT e enviá-lo de volta ao frontend
            // para gerenciar a sessão do usuário.
        } else {
            // Senha incorreta
            http_response_code(401); // Unauthorized
            echo json_encode(["success" => false, "message" => "Credenciais inválidas."]);
        }
    } else {
        // Usuário não encontrado
        http_response_code(401); // Unauthorized
        echo json_encode(["success" => false, "message" => "Credenciais inválidas."]);
    }

    $stmt->close();
} catch (Exception $e) {
    error_log("Erro no login: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro interno do servidor."]);
}

$conn->close();
?>