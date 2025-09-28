document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastro-form');
    const feedbackMessage = document.getElementById('feedback-message');

    // Elementos do formulário
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const celularInput = document.getElementById('celular');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const logradouroInput = document.getElementById('logradouro');
    const bairroInput = document.getElementById('bairro');
    const cidadeInput = document.getElementById('cidade');
    const ufInput = document.getElementById('uf');
    const cepInput = document.getElementById('cep');
    const dataNascInput = document.getElementById('dataNasc');

    // Botões de mostrar/esconder senha
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');

    // Indicadores de força da senha
    const passwordStrength = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    // Elementos de erro
    const nomeError = document.getElementById('nome-error');
    const emailError = document.getElementById('email-error');
    const celularError = document.getElementById('celular-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const cepError = document.getElementById('cep-error');
    const dataNascError = document.getElementById('dataNasc-error');

    // Tipo de usuário
    const typeBuyerRadio = document.getElementById('type-buyer');
    const typeSellerRadio = document.getElementById('type-seller');

    // Função para mostrar/esconder senha
    function togglePasswordVisibility(input, button) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.innerHTML = isPassword ? '👁️' : '👁️‍🗨️';
        button.setAttribute('title', isPassword ? 'Ocultar senha' : 'Mostrar senha');
    }

    // Event listeners para os botões de mostrar/esconder
    togglePasswordBtn.addEventListener('click', () => {
        togglePasswordVisibility(passwordInput, togglePasswordBtn);
    });

    toggleConfirmPasswordBtn.addEventListener('click', () => {
        togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordBtn);
    });

    // Função para verificar força da senha
    function checkPasswordStrength(password) {
        let strength = 0;
        const feedback = [];

        // Critérios de força
        if (password.length >= 8) strength += 1;
        else feedback.push('Mínimo 8 caracteres');

        if (/[a-z]/.test(password)) strength += 1;
        else feedback.push('Letras minúsculas');

        if (/[A-Z]/.test(password)) strength += 1;
        else feedback.push('Letras maiúsculas');

        if (/[0-9]/.test(password)) strength += 1;
        else feedback.push('Números');

        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        else feedback.push('Caracteres especiais');

        return { strength, feedback };
    }

    // Atualizar indicador de força da senha em tempo real
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const { strength, feedback } = checkPasswordStrength(password);

        // Atualizar barra de progresso
        const width = (strength / 5) * 100;
        strengthBar.style.width = width + '%';

        // Atualizar cores e texto
        if (password.length === 0) {
            strengthBar.style.backgroundColor = '#ddd';
            strengthText.textContent = '';
            strengthText.className = '';
        } else {
            switch(strength) {
                case 0:
                case 1:
                    strengthBar.style.backgroundColor = '#ff4d4d';
                    strengthText.textContent = 'Muito fraca';
                    strengthText.className = 'strength-weak';
                    break;
                case 2:
                    strengthBar.style.backgroundColor = '#ffa64d';
                    strengthText.textContent = 'Fraca';
                    strengthText.className = 'strength-weak';
                    break;
                case 3:
                    strengthBar.style.backgroundColor = '#ffd24d';
                    strengthText.textContent = 'Média';
                    strengthText.className = 'strength-medium';
                    break;
                case 4:
                    strengthBar.style.backgroundColor = '#a3d56d';
                    strengthText.textContent = 'Forte';
                    strengthText.className = 'strength-strong';
                    break;
                case 5:
                    strengthBar.style.backgroundColor = '#4CAF50';
                    strengthText.textContent = 'Muito forte';
                    strengthText.className = 'strength-strong';
                    break;
            }
        }

        // Mostrar feedback detalhado
        if (feedback.length > 0 && password.length > 0) {
            passwordError.textContent = 'Requisitos faltantes: ' + feedback.join(', ');
        } else {
            passwordError.textContent = '';
        }
    });

    // Feedback messages
    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `message ${type}-message`;
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 5000);
    }

    // Limpar erros
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
        strengthBar.style.width = '0%';
        strengthText.textContent = '';
    }

    // Formatação de celular
    celularInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 5) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        }
        e.target.value = value;
    });

    // Formatação de CEP
    cepInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d{0,3}).*/, '$1-$2');
        }
        e.target.value = value;
    });

    // Buscar endereço por CEP
    cepInput.addEventListener('blur', async () => {
        const cep = cepInput.value.replace(/\D/g, '');

        if (cep.length !== 8) {
            cepError.textContent = 'CEP deve conter 8 dígitos.';
            return;
        } else {
            cepError.textContent = '';
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                cepError.textContent = 'CEP não encontrado.';
                return;
            }

            logradouroInput.value = data.logradouro || '';
            bairroInput.value = data.bairro || '';
            cidadeInput.value = data.localidade || '';
            ufInput.value = data.uf || '';
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            cepError.textContent = 'Erro ao buscar CEP. Tente novamente.';
        }
    });

    // Submit do formulário
    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearErrors();
        feedbackMessage.style.display = 'none';

        let isValid = true;

        // Obter valores
        const NOME_USUARIO = nomeInput.value.trim();
        const EMAIL_USUARIO = emailInput.value.trim();
        const SENHA_USUARIO = passwordInput.value;
        const CONFIRM_SENHA_USUARIO = confirmPasswordInput.value;
        const CELULAR_USUARIO = celularInput.value.trim();
        const LOGRADOURO_USUARIO = logradouroInput.value.trim();
        const BAIRRO_USUARIO = bairroInput.value.trim();
        const CIDADE_USUARIO = cidadeInput.value.trim();
        const UF_USUARIO = ufInput.value.trim();
        const CEP_USUARIO = cepInput.value.trim();
        const DT_NASC_USUARIO = dataNascInput.value;
        const TIPO_USUARIO = typeSellerRadio.checked ? 'seller' : 'buyer';

        // Validações
        if (NOME_USUARIO.length < 3) {
            nomeError.textContent = 'Nome deve ter no mínimo 3 caracteres.';
            isValid = false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
            emailError.textContent = 'Formato de e-mail inválido.';
            isValid = false;
        }

        // Validação forte da senha
        const { strength, feedback } = checkPasswordStrength(SENHA_USUARIO);
        if (SENHA_USUARIO.length < 8) {
            passwordError.textContent = 'A senha deve ter no mínimo 8 caracteres.';
            isValid = false;
        } else if (strength < 3) {
            passwordError.textContent = 'Senha muito fraca. Adicione: ' + feedback.join(', ');
            isValid = false;
        }

        if (SENHA_USUARIO !== CONFIRM_SENHA_USUARIO) {
            confirmPasswordError.textContent = 'As senhas não coincidem.';
            isValid = false;
        }

        if (CELULAR_USUARIO && CELULAR_USUARIO.length < 14) {
            celularError.textContent = 'Celular incompleto.';
            isValid = false;
        }

        if (CEP_USUARIO && !/^\d{5}-\d{3}$/.test(CEP_USUARIO)) {
            cepError.textContent = 'CEP inválido.';
            isValid = false;
        }

        if (DT_NASC_USUARIO) {
            const birthDate = new Date(DT_NASC_USUARIO);
            const today = new Date();
            if (birthDate > today) {
                dataNascError.textContent = 'Data de nascimento não pode ser futura.';
                isValid = false;
            }
        }

        if (!isValid) {
            showFeedback('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        // Preparar dados para envio
        const userData = {
            NOME_USUARIO,
            EMAIL_USUARIO,
            SENHA_USUARIO,
            CELULAR_USUARIO: CELULAR_USUARIO || null,
            LOGRADOURO_USUARIO: LOGRADOURO_USUARIO || null,
            BAIRRO_USUARIO: BAIRRO_USUARIO || null,
            CIDADE_USUARIO: CIDADE_USUARIO || null,
            UF_USUARIO: UF_USUARIO || null,
            CEP_USUARIO: CEP_USUARIO || null,
            DT_NASC_USUARIO: DT_NASC_USUARIO || null,
            TIPO_USUARIO
        };

        try {
            // Fazer requisição para o backend
            const response = await fetch('/api/cadastrar_usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showFeedback(result.message, 'success');
                cadastroForm.reset();
                strengthBar.style.width = '0%';
                strengthText.textContent = '';
                
                // Redirecionar após sucesso
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                showFeedback(result.message || 'Erro ao cadastrar usuário.', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            showFeedback('Erro de conexão com o servidor.', 'error');
        }
    });
});