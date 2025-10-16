const fetch = require('node-fetch');

async function testCadastroVendedor() {
    const userData = {
        NOME_USUARIO: "João Vendedor Teste",
        EMAIL_USUARIO: "joao.teste@email.com",
        SENHA_USUARIO: "123456",
        CELULAR_USUARIO: "(11) 99999-9999",
        LOGRADOURO_USUARIO: "Rua Teste, 123",
        BAIRRO_USUARIO: "Centro",
        CIDADE_USUARIO: "São Paulo",
        UF_USUARIO: "SP",
        CEP_USUARIO: "01234-567",
        DT_NASC_USUARIO: "1990-01-01",
        TIPO_USUARIO: "seller",
        TIPO_PESSOA: "PF",
        DIGITO_PESSOA: "123.456.789-00",
        NOME_LOJA: "Loja do João"
    };

    try {
        console.log('Testando cadastro de vendedor...');
        const response = await fetch('http://localhost:3030/api/cadastrar_usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        console.log('Status:', response.status);
        console.log('Resposta:', result);

        if (result.success) {
            console.log('✅ Cadastro realizado com sucesso!');
        } else {
            console.log('❌ Erro no cadastro:', result.message);
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
    }
}

testCadastroVendedor();