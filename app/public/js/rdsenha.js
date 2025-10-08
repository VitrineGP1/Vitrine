document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de recuperação de senha iniciado...');

    // Elementos do formulário
    const recoveryForm = document.getElementById('recovery-form');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submit-btn');
    const feedbackMessage = document.getElementById('feedback-message');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');

    // Função para mostrar feedback
    function showFeedback(message, type) {
        if (!feedbackMessage) return;
        
        feedbackMessage.textContent = message;
        feedbackMessage.className = `message ${type}-message`;
        feedbackMessage.style.display = 'block';
        
        if (type === 'success') {
            simplyNotify.success(message);
        } else {
            simplyNotify.error(message);
        }
        
        setTimeout(() => {
            if (feedbackMessage) {
                feedbackMessage.style.display = 'none';
            }
        }, 5000);
    }

    // Estado de loading
    function setLoadingState(loading) {
        if (!submitBtn || !btnText || !btnLoading) return;
        
        if (loading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Enviando...';
            btnLoading.style.display = 'inline-block';
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Recuperar Senha';
            btnLoading.style.display = 'none';
        }
    }

    // Validação de email
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // SUBMIT DO FORMULÁRIO
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log('Formulário de recuperação de senha submetido');

            const email = emailInput ? emailInput.value.trim() : '';

            // Validação
            if (!email || !validateEmail(email)) {
                showFeedback('Por favor, insira um email válido.', 'error');
                return;
            }

            // Mostrar estado de loading
            setLoadingState(true);

            try {
                console.log('Enviando solicitação de recuperação para:', email);

                // Fazer requisição para o backend
                const response = await fetch('/api/recuperar_senha', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email })
                });

                console.log('Resposta recebida:', response.status);

                const result = await response.json();
                console.log('Resultado:', result);

                if (response.ok && result.success) {
                    showFeedback(result.message, 'success');
                    recoveryForm.reset();
                    
                    // Redirecionar após sucesso
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 3000);
                } else {
                    showFeedback(result.message || 'Erro ao processar solicitação.', 'error');
                }

            } catch (error) {
                console.error('Erro na requisição:', error);
                showFeedback('Erro de conexão com o servidor.', 'error');
            } finally {
                setLoadingState(false);
            }
        });
    }

    // Voltar para login
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '/login';
        });
    }

    console.log('Script de recuperação de senha carregado com sucesso!');
});