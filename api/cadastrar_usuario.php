<?php
// Incluir o arquivo de conexão
require_once 'C:\Users\mathe\Documents\Escola\PRIT\vitrine_copia\config\conexao.php';

// Configurar cabeçalhos para JSON e CORS (Cross-Origin Resource Sharing)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Cuidado em produção!
header('Access-Control-Allow-Methods: POST, OPTIONS'); // Permitir POST
header('Access-Control-Allow-Headers: Content-Type'); // Permitir o cabeçalho Content-Type

// Se for uma requisição OPTIONS (pré-voo do CORS), apenas retorne 200 OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Pega os dados JSON do corpo da requisição
    $data = json_decode(file_get_contents('php://input'), true);

    // Validação básica dos dados (ajuste conforme seu formulário)
    // As colunas devem corresponder ao seu formulário de cadastro e à sua tabela USUARIOS
    $nome = $data['nome_usuario'] ?? ''; // Nome do campo no formulário/JSON do Node.js
    $email = $data['email_usuario'] ?? '';
    $celular = $data['celular_usuario'] ?? '';
    $logradouro = $data['logradouro_usuario'] ?? '';
    $bairro = $data['bairro_usuario'] ?? '';
    $cidade = $data['cidade_usuario'] ?? '';
    $uf = $data['uf_usuario'] ?? '';
    $cep = $data['cep_usuario'] ?? '';
    $dt_nasc = $data['dt_nasc_usuario'] ?? '';
    $senha_texto_puro = $data['senha_usuario'] ?? ''; // Senha do formulário
    $tipo_usuario = $data['tipo_usuario'] ?? ''; // Ex: 'C' para Cliente, 'V' para Vendedor

    // Validação mínima para campos obrigatórios
    if (empty($nome) || empty($email) || empty($senha_texto_puro) || empty($tipo_usuario)) {
        echo json_encode(["success" => false, "message" => "Dados obrigatórios ausentes."]);
        $conn->close();
        exit();
    }

    // Hash da senha para segurança
    $senha_hash = password_hash($senha_texto_puro, PASSWORD_DEFAULT);

    // Preparar a instrução SQL para inserção (USANDO PREPARED STATEMENTS para segurança)
    $sql = "INSERT INTO USUARIOS (NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO, SENHA_USUARIO, TIPO_USUARIO) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    // Criar um prepared statement
    if ($stmt = $conn->prepare($sql)) {
        // 's' para string, 'i' para integer, 'd' para double, 'b' para blob
        // A ordem e o tipo devem corresponder às colunas na sua query
        $stmt->bind_param("sssssssssss", $nome, $email, $celular, $logradouro, $bairro, $cidade, $uf, $cep, $dt_nasc, $senha_hash, $tipo_usuario);

        // Executar a instrução
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Usuário cadastrado com sucesso!", "user_id" => $conn->insert_id]);
        } else {
            // Se houver um erro de chave única (ex: email já existe)
            if ($conn->errno == 1062) { // Código de erro para entrada duplicada
                echo json_encode(["success" => false, "message" => "Erro: E-mail ou celular já cadastrado."]);
            } else {
                echo json_encode(["success" => false, "message" => "Erro ao cadastrar usuário: " . $stmt->error]);
            }
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