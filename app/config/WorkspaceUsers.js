// fetchUsers.js
// Importa a biblioteca axios
const axios = require('axios');

// URL da sua API PHP que lista os usuários
// Certifique-se de que o Apache (XAMPP) está rodando!
const PHP_API_URL = 'http://localhost/vitrine_copia/api/listar_usuarios.php';

async function fetchUsersFromPHP() {
    console.log('Tentando buscar usuários da API PHP...');
    try {
        // Faz uma requisição GET para a URL da sua API PHP
        const response = await axios.get(PHP_API_URL);

        // A propriedade 'data' da resposta contém o JSON retornado pelo PHP
        const users = response.data;

        console.log('------------------------------------');
        console.log('Dados de Usuários recebidos do PHP:');
        console.log(users);
        console.log('------------------------------------');

        // Você pode agora usar esses dados na sua aplicação Node.js
        // Por exemplo, enviá-los para um front-end, processá-los, etc.

        return users; // Retorna os dados para quem chamar esta função
    } catch (error) {
        // Lida com erros que podem ocorrer durante a requisição
        console.error('Erro ao buscar dados do PHP:', error.message);

        // Se houver uma resposta de erro do servidor (ex: 404 Not Found, 500 Internal Server Error)
        if (error.response) {
            console.error('Status do Erro:', error.response.status);
            console.error('Detalhes do Erro:', error.response.data);
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida
            console.error('Nenhuma resposta recebida:', error.request);
        } else {
            // Algo mais aconteceu ao configurar a requisição
            console.error('Erro na configuração da requisição:', error.message);
        }
        return null; // Retorna null ou lança o erro, dependendo da sua lógica
    }
}

// Chama a função para executar a busca de usuários
fetchUsersFromPHP();