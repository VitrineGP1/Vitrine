document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const feedbackMessage = document.getElementById('feedback-message');

    function showMessage(text, type) {
        feedbackMessage.textContent = text;
        feedbackMessage.className = `feedback-message ${type}-message`;
        feedbackMessage.style.display = 'block';
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
            showMessage('Por favor, insira seu e-mail.', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showMessage('Por favor, insira um e-mail válido.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/reset_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (result.success) {
                showMessage('Se este e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.', 'success');
                emailInput.value = '';
            } else {
                showMessage(result.message || 'Erro ao processar solicitação.', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            showMessage('Erro de conexão. Tente novamente mais tarde.', 'error');
        }
    });
});