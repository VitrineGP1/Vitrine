document.addEventListener('DOMContentLoaded', () => {
    console.log('Script de cadastro iniciado...');

    // Verifica se está na página de cadastro
    const cadastroForm = document.getElementById('cadastro-form');
    if (!cadastroForm) {
        console.log('Página não é de cadastro, saindo...');
        return;
    }

    // Elementos principais com verificação
    const feedbackMessage = document.getElementById('feedback-message');
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
    const sellerFieldsDiv = document.getElementById('seller-fields');

    console.log('Elementos carregados:', {
        cadastroForm: !!cadastroForm,
        nomeInput: !!nomeInput,
        emailInput: !!emailInput,
        passwordInput: !!passwordInput
    });

    // Função para mostrar/esconder senha
    function togglePasswordVisibility(input, button) {
        if (!input || !button) return;
        
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.innerHTML = isPassword ? '👁️' : '👁️‍🗨️';
        button.setAttribute('title', isPassword ? 'Ocultar senha' : 'Mostrar senha');
    }

    // Event listeners para os botões de mostrar/esconder (COM VERIFICAÇÃO)
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility(passwordInput, togglePasswordBtn);
        });
        console.log('Botão togglePassword configurado');
    }

    if (toggleConfirmPasswordBtn && confirmPasswordInput) {
        toggleConfirmPasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordBtn);
        });
        console.log('Botão toggleConfirmPassword configurado');
    }

    // Função para verificar força da senha
    function checkPasswordStrength(password) {
        let strength = 0;
        const feedback = [];

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

    // Atualizar indicador de força da senha em tempo real (COM VERIFICAÇÃO)
    if (passwordInput && strengthBar && strengthText) {
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
            if (passwordError && feedback.length > 0 && password.length > 0) {
                passwordError.textContent = 'Requisitos faltantes: ' + feedback.join(', ');
            } else if (passwordError) {
                passwordError.textContent = '';
            }
        });
        console.log('Indicador de força de senha configurado');
    }

    // Feedback messages
    function showFeedback(message, type) {
        if (!feedbackMessage) return;
        
        feedbackMessage.textContent = message;
        feedbackMessage.className = `message ${type}-message`;
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            if (feedbackMessage) {
                feedbackMessage.style.display = 'none';
            }
        }, 5000);
    }

    // Limpar erros
    function clearErrors() {
        const errorElements = [
            nomeError, emailError, celularError, passwordError, 
            confirmPasswordError, cepError, dataNascError
        ];
        
        errorElements.forEach(element => {
            if (element) element.textContent = '';
        });
        
        if (strengthBar) strengthBar.style.width = '0%';
        if (strengthText) strengthText.textContent = '';
    }

    // Formatação de celular (COM VERIFICAÇÃO)
    if (celularInput) {
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
        console.log('Formatação de celular configurada');
    }

    // Formatação de CEP (COM VERIFICAÇÃO)
    if (cepInput) {
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
                if (cepError) cepError.textContent = 'CEP deve conter 8 dígitos.';
                return;
            } else {
                if (cepError) cepError.textContent = '';
            }

            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (data.erro) {
                    if (cepError) cepError.textContent = 'CEP não encontrado.';
                    return;
                }

                if (logradouroInput) logradouroInput.value = data.logradouro || '';
                if (bairroInput) bairroInput.value = data.bairro || '';
                if (cidadeInput) cidadeInput.value = data.localidade || '';
                if (ufInput) ufInput.value = data.uf || '';
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
                if (cepError) cepError.textContent = 'Erro ao buscar CEP. Tente novamente.';
            }
        });
        console.log('Formatação de CEP configurada');
    }

    // Toggle campos de vendedor (COM VERIFICAÇÃO)
    function toggleSellerFields() {
        if (!sellerFieldsDiv || !typeSellerRadio || !typeBuyerRadio) return;
        
        if (typeSellerRadio.checked) {
            sellerFieldsDiv.style.display = 'block';
        } else {
            sellerFieldsDiv.style.display = 'none';
        }
    }

    if (typeSellerRadio && typeBuyerRadio) {
        typeSellerRadio.addEventListener('change', toggleSellerFields);
        typeBuyerRadio.addEventListener('change', toggleSellerFields);
        toggleSellerFields(); // Inicializar estado
        console.log('Toggle de campos de vendedor configurado');
    }

    // SUBMIT DO FORMULÁRIO (COM VERIFICAÇÃO COMPLETA)
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Formulário submetido');
            
            clearErrors();
            if (feedbackMessage) feedbackMessage.style.display = 'none';

            let isValid = true;

            // Obter valores com verificação de existência
            const NOME_USUARIO = nomeInput ? nomeInput.value.trim() : '';
            const EMAIL_USUARIO = emailInput ? emailInput.value.trim() : '';
            const SENHA_USUARIO = passwordInput ? passwordInput.value : '';
            const CONFIRM_SENHA_USUARIO = confirmPasswordInput ? confirmPasswordInput.value : '';
            const CELULAR_USUARIO = celularInput ? celularInput.value.trim() : '';
            const LOGRADOURO_USUARIO = logradouroInput ? logradouroInput.value.trim() : '';
            const BAIRRO_USUARIO = bairroInput ? bairroInput.value.trim() : '';
            const CIDADE_USUARIO = cidadeInput ? cidadeInput.value.trim() : '';
            const UF_USUARIO = ufInput ? ufInput.value.trim() : '';
            const CEP_USUARIO = cepInput ? cepInput.value.trim() : '';
            const DT_NASC_USUARIO = dataNascInput ? dataNascInput.value : '';
            
            // Obter tipo de usuário com fallback
            let TIPO_USUARIO = 'cliente';
            if (typeSellerRadio && typeSellerRadio.checked) {
                TIPO_USUARIO = 'seller';
            }

            console.log('Dados do formulário:', {
                NOME_USUARIO,
                EMAIL_USUARIO,
                SENHA_USUARIO: SENHA_USUARIO ? '***' : 'vazia',
                TIPO_USUARIO
            });

            // Validações com verificação de elementos de erro
            if (!NOME_USUARIO || NOME_USUARIO.length < 3) {
                if (nomeError) nomeError.textContent = 'Nome deve ter no mínimo 3 caracteres.';
                isValid = false;
            }

            if (!EMAIL_USUARIO || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
                if (emailError) emailError.textContent = 'Formato de e-mail inválido.';
                isValid = false;
            }

            // Validação forte da senha
            const { strength, feedback } = checkPasswordStrength(SENHA_USUARIO);
            if (!SENHA_USUARIO || SENHA_USUARIO.length < 8) {
                if (passwordError) passwordError.textContent = 'A senha deve ter no mínimo 8 caracteres.';
                isValid = false;
            } else if (strength < 3) {
                if (passwordError) passwordError.textContent = 'Senha muito fraca. Adicione: ' + feedback.join(', ');
                isValid = false;
            }

            if (SENHA_USUARIO !== CONFIRM_SENHA_USUARIO) {
                if (confirmPasswordError) confirmPasswordError.textContent = 'As senhas não coincidem.';
                isValid = false;
            }

            if (CELULAR_USUARIO && CELULAR_USUARIO.length < 14) {
                if (celularError) celularError.textContent = 'Celular incompleto.';
                isValid = false;
            }

            if (CEP_USUARIO && !/^\d{5}-\d{3}$/.test(CEP_USUARIO)) {
                if (cepError) cepError.textContent = 'CEP inválido.';
                isValid = false;
            }

            if (DT_NASC_USUARIO) {
                const birthDate = new Date(DT_NASC_USUARIO);
                const today = new Date();
                if (birthDate > today) {
                    if (dataNascError) dataNascError.textContent = 'Data de nascimento não pode ser futura.';
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

            console.log('Enviando dados para API:', { ...userData, SENHA_USUARIO: '***' });

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
                console.log('Resposta da API:', result);

                if (response.ok && result.success) {
                    showFeedback(result.message, 'success');
                    cadastroForm.reset();
                    if (strengthBar) strengthBar.style.width = '0%';
                    if (strengthText) strengthText.textContent = '';
                    
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
        console.log('Event listener do formulário configurado');
    }

    console.log('Script de cadastro carregado com sucesso!');
});