<?php
// Define os cabeçalhos CORS para permitir requisições do seu frontend (se estiver em um domínio diferente)
header("Access-Control-Allow-Origin: *"); // Em produção, substitua * pela URL exata do seu frontend (ex: 'https://seufrotend.onrender.com')
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Permite POST para atualização
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Permite Content-Type para JSON

// Lida com requisições OPTIONS (preflight requests) que os navegadores fazem para CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Define o tipo de conteúdo da resposta como JSON
header('Content-Type: application/json');

// Inclui o arquivo de conexão com o banco de dados do Clever Cloud
require_once 'conexao.php';

// Obtém os dados da requisição POST (enviados como JSON)
$data = json_decode(file_get_contents('php://input'), true);

// Verifica se os dados foram recebidos corretamente
if (json_last_error() !== JSON_ERROR_NONE || empty($data)) {
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "message" => "Dados inválidos ou ausentes."]);
    exit();
}

// --- Validação e Obtenção dos Dados ---
$id_usuario = isset($data['id_usuario']) ? intval($data['id_usuario']) : null;
$nome_usuario = isset($data['nome_usuario']) ? trim($data['nome_usuario']) : null;
$email_usuario = isset($data['email_usuario']) ? trim($data['email_usuario']) : null;
$celular_usuario = isset($data['celular_usuario']) ? trim($data['celular_usuario']) : null;
$logradouro_usuario = isset($data['logradouro_usuario']) ? trim($data['logradouro_usuario']) : null;
$bairro_usuario = isset($data['bairro_usuario']) ? trim($data['bairro_usuario']) : null;
$cidade_usuario = isset($data['cidade_usuario']) ? trim($data['cidade_usuario']) : null;
$uf_usuario = isset($data['uf_usuario']) ? trim($data['uf_usuario']) : null;
$cep_usuario = isset($data['cep_usuario']) ? trim($data['cep_usuario']) : null;
$dt_nasc_usuario = isset($data['dt_nasc_usuario']) ? trim($data['dt_nasc_usuario']) : null;
$tipo_usuario = isset($data['tipo_usuario']) ? trim($data['tipo_usuario']) : null;
$nova_senha_usuario = isset($data['nova_senha_usuario']) ? $data['nova_senha_usuario'] : null;

// --- Validação básica (adapte conforme suas regras de negócio) ---
if (!$id_usuario) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID do usuário é obrigatório para atualização."]);
    exit();
}
if (empty($nome_usuario) || empty($email_usuario)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Nome e Email são campos obrigatórios."]);
    exit();
}
if (!filter_var($email_usuario, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Formato de email inválido."]);
    exit();
}

// --- Preparando a Query SQL ---
$sql = "UPDATE USUARIOS SET 
            NOME_USUARIO = ?, 
            EMAIL_USUARIO = ?, 
            CELULAR_USUARIO = ?, 
            LOGRADOURO_USUARIO = ?, 
            BAIRRO_USUARIO = ?, 
            CIDADE_USUARIO = ?, 
            UF_USUARIO = ?, 
            CEP_USUARIO = ?, 
            DT_NASC_USUARIO = ?, 
            TIPO_USUARIO = ?";
$params = "ssssssssss"; // Tipos dos parâmetros: s (string) para cada um acima
$values = [
    $nome_usuario,
    $email_usuario,
    $celular_usuario,
    $logradouro_usuario,
    $bairro_usuario,
    $cidade_usuario,
    $uf_usuario,
    $cep_usuario,
    $dt_nasc_usuario,
    $tipo_usuario
];

// Se uma nova senha foi fornecida, adicione-a à query
if (!empty($nova_senha_usuario)) {
    // SEMPRE HASH A SENHA ANTES DE SALVAR!
    $hashed_password = password_hash($nova_senha_usuario, PASSWORD_DEFAULT);
    $sql .= ", SENHA_USUARIO = ?";
    $params .= "s";
    $values[] = $hashed_password;
}

$sql .= " WHERE ID_USUARIO = ?";
$params .= "i"; // 'i' para integer (ID_USUARIO)
$values[] = $id_usuario;

try {
    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        throw new Exception("Falha ao preparar a declaração SQL: " . $conn->error);
    }

    // Associa os parâmetros dinamicamente
    $stmt->bind_param($params, ...$values);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["success" => true, "message" => "Perfil atualizado com sucesso!"]);
        } else {
            // Nenhuma linha afetada pode significar que o ID não existe ou que não houve mudanças nos dados
            echo json_encode(["success" => false, "message" => "Nenhuma alteração detectada ou usuário não encontrado."]);
        }
    } else {
        throw new Exception("Falha ao executar a atualização: " . $stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    // Loga o erro para depuração (visível nos logs do Render)
    error_log("Erro na atualização do usuário: " . $e->getMessage());
    http_response_code(500); // Internal Server Error
    echo json_encode(["success" => false, "message" => "Erro interno do servidor ao atualizar o perfil."]);
}

$conn->close();
?>