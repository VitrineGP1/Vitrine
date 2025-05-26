<?php
// Incluir o arquivo de conexão
require_once '../config/conexao.php'; // Ajuste o caminho se necessário!

// Remover a linha mysqli_close($conn); e o echo "Conexão realizada com sucesso!"; do conexao.php
// A conexão será fechada ao final deste script ou você pode fechar aqui

// Se o conexao.php já está fechando a conexão, remova o mysqli_close($conn); de lá.
// No conexao.php, você só precisa do código de conexão, sem echo e sem close no final.

// Exemplo: Consultar todos os usuários da tabela 'usuarios'
$sql = "SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO FROM USUARIOS"; // Ajuste o nome da tabela e colunas

$result = $conn->query($sql);

$usuarios = array(); // Array para armazenar os resultados

if ($result->num_rows > 0) {
    // Percorrer cada linha de resultado
    while($row = $result->fetch_assoc()) {
        $usuarios[] = $row; // Adicionar a linha (usuário) ao array
    }
}

// Configurar o cabeçalho para retornar JSON
header('Content-Type: application/json');
// Permitir requisições de outras origens (CORS) - MUITO IMPORTANTE PARA NODE.JS
header('Access-Control-Allow-Origin: *'); // Cuidado em produção, limite isso ao seu domínio!

// Retornar os dados em formato JSON
echo json_encode($usuarios);

// Fechar a conexão
$conn->close();

?>