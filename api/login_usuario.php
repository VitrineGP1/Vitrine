<?php
// Incluir o arquivo de conexão
require_once 'C:\Users\mathe\Documents\Escola\PRIT\vitrine_copia\config\conexao.php';

// Configurar cabeçalhos para JSON e CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Cuidado em produção!
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Se for uma requisição OPTIONS (pré-voo do CORS), apenas retorne 200 OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Pega os dados JSON do corpo da requisição
    $data = json_decode(file_get_contents('php://input'), true);

    // Validação básica dos dados
    $email = $data['email_usuario'] ?? ''; // Nome do campo de e-mail no formulário/JSON do Node.js
    $senha_digitada = $data['senha_usuario'] ?? ''; // Senha digitada no formulário

    // Validação mínima para campos obrigatórios
    if (empty($email) || empty($senha_digitada)) {
        echo json_encode(["success" => false, "message" => "E-mail e senha são obrigatórios."]);
        $conn->close();
        exit();
    }

    // Preparar a instrução SQL para buscar o usuário pelo e-mail
    // Usando Prepared Statements para segurança contra SQL Injection
    $sql = "SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, TIPO_USUARIO FROM USUARIOS WHERE EMAIL_USUARIO = ?";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("s", $email); // 's' para string (email)
        $stmt->execute();
        $result = $stmt->get_result(); // Pega o resultado da consulta

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            $senha_hash_armazenada = $user['SENHA_USUARIO'];

            // Verificar se a senha digitada corresponde ao hash armazenado
            if (password_verify($senha_digitada, $senha_hash_armazenada)) {
                // Senha correta! Login bem-sucedido.
                // Não retorne a senha ou o hash da senha!
                echo json_encode([
                    "success" => true,
                    "message" => "Login realizado com sucesso!",
                    "user" => [
                        "id" => $user['ID_USUARIO'],
                        "nome" => $user['NOME_USUARIO'],
                        "email" => $user['EMAIL_USUARIO'],
                        "tipo_usuario" => $user['TIPO_USUARIO']
                    ]
                ]);
            } else {
                // Senha incorreta
                echo json_encode(["success" => false, "message" => "Credenciais inválidas (senha incorreta)."]);
            }
        } else {
            // Usuário não encontrado
            echo json_encode(["success" => false, "message" => "Credenciais inválidas (usuário não encontrado)."]);
        }

        $stmt->close(); // Fechar o statement
    } else {
        echo json_encode(["success" => false, "message" => "Erro na preparação da query: " . $conn->error]);
    }

    $conn->close(); // Fechar a conexão
} else {
    // Se não for POST, informa que a requisição não é permitida
    echo json_encode(["success" => false, "message" => "Método de requisição não permitido. Use POST."]);
}
?>