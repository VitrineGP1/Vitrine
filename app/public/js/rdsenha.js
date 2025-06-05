document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const feedbackMessage = document.getElementById('feedback-message');

    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message ${type}-message`;
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 5000);
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            feedbackMessage.style.display = 'none';

            const email = emailInput.value.trim();

            if (!email) {
                showFeedback('Por favor, insira o seu e-mail.', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showFeedback('Formato de e-mail inválido.', 'error');
                return;
            }

            try {

                const response = await fetch('/api/request_password_reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showFeedback(result.message || 'Um e-mail com instruções de redefinição foi enviado.', 'success');
                    emailInput.value = '';
                } else {
                    showFeedback(result.message || 'Falha ao solicitar redefinição de senha. Verifique o e-mail ou tente novamente.', 'error');
                }
            } catch (error) {
                console.error('Erro na requisição de esqueci a senha:', error);
                showFeedback('Falha na conexão com o servidor. Tente novamente mais tarde.', 'error');
            }
        });
    }
});