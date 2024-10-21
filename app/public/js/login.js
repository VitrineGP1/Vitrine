document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('loginForm');
  
    // Verifique se o loginForm foi encontrado
    if (!loginForm) {
      console.error('Formulário de login não encontrado!');
      return; // Saia da função se o formulário não existir
    }
  
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Impede o envio do formulário até a validação
  
      // Obtendo os valores dos campos
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      // Limpando mensagens de erro
      document.getElementById('emailError').textContent = '';
      document.getElementById('passwordError').textContent = '';
  
      let hasError = false;
  
      // Validação de email
      if (!email) {
        document.getElementById('emailError').textContent = 'Por favor, insira seu email.';
        hasError = true;
      } else if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Email inválido.';
        hasError = true;
      }
  
      // Validação de senha
      if (!password) {
        document.getElementById('passwordError').textContent = 'Por favor, insira sua senha.';
        hasError = true;
      } else if (password.length < 8) {
        document.getElementById('passwordError').textContent = 'A senha deve ter pelo menos 8 caracteres.';
        hasError = true;
      }
  
      // Se não houver erros, redirecione para o link desejado
      if (!hasError) {        
        // Redireciona após a validação
        window.location.href = 'C:\\Users\\mathe\\Documents\\Sites\\views\\pages\\perfil.html'; // Insira o link que deseja redirecionar
        
        // Limpa o formulário após o envio (opcional, se o formulário estiver sendo enviado para outra página)
        loginForm.reset();
      }
    });
  
    // Função para validar o formato do email
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex para validar o email
      return re.test(String(email).toLowerCase());
    }
});