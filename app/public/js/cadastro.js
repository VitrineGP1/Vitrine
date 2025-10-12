document.addEventListener('DOMContentLoaded', () => {

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
    const cpfInput = document.getElementById('cpf');

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
    const cpfError = document.getElementById('cpf-error');

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
    }

    if (toggleConfirmPasswordBtn && confirmPasswordInput) {
        toggleConfirmPasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordBtn);
        });
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
            confirmPasswordError, cepError, dataNascError, cpfError
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

    // Formatação e validação de CPF
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 9) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{0,3})/, '$1.$2');
            }
            e.target.value = value;
        });

        cpfInput.addEventListener('blur', () => {
            const cpf = cpfInput.value.replace(/\D/g, '');
            if (cpf.length === 11 && !isValidCPF(cpf)) {
                if (cpfError) cpfError.textContent = 'CPF inválido.';
            } else if (cpf.length > 0 && cpf.length !== 11) {
                if (cpfError) cpfError.textContent = 'CPF deve conter 11 dígitos.';
            } else {
                if (cpfError) cpfError.textContent = '';
            }
        });
    }

    // Função para validar CPF
    function isValidCPF(cpf) {
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        return remainder === parseInt(cpf.charAt(10));
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
    }

    // SUBMIT DO FORMULÁRIO (COM VERIFICAÇÃO COMPLETA)
    if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
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
        const CPF_CLIENTE = cpfInput ? cpfInput.value.replace(/\D/g, '') : '';
        
        // ✅ DEFINIR SEMPRE COMO CLIENTE
        const TIPO_USUARIO = 'C';

        // Validações
        if (!NOME_USUARIO) {
            if (nomeError) nomeError.textContent = 'Nome é obrigatório.';
            isValid = false;
        }

        if (!EMAIL_USUARIO) {
            if (emailError) emailError.textContent = 'E-mail é obrigatório.';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
            if (emailError) emailError.textContent = 'E-mail inválido.';
            isValid = false;
        }

        if (!SENHA_USUARIO) {
            if (passwordError) passwordError.textContent = 'Senha é obrigatória.';
            isValid = false;
        } else if (SENHA_USUARIO.length < 8) {
            if (passwordError) passwordError.textContent = 'Senha deve ter no mínimo 8 caracteres.';
            isValid = false;
        }

        if (SENHA_USUARIO !== CONFIRM_SENHA_USUARIO) {
            if (confirmPasswordError) confirmPasswordError.textContent = 'Senhas não coincidem.';
            isValid = false;
        }

        if (!CPF_CLIENTE) {
            if (cpfError) cpfError.textContent = 'CPF é obrigatório.';
            isValid = false;
        } else if (CPF_CLIENTE.length !== 11 || !isValidCPF(CPF_CLIENTE)) {
            if (cpfError) cpfError.textContent = 'CPF inválido.';
            isValid = false;
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
            TIPO_USUARIO, // ✅ SEMPRE 'C' PARA CLIENTE
            CPF_CLIENTE   // ✅ CPF DO FORMULÁRIO
        };

        try {
            // ✅ USA A ROTA ÚNICA
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
                

                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                // Tratamento específico para cada tipo de erro
                let errorMessage = 'Erro ao cadastrar usuário.';
                
                if (result.error) {
                    if (result.error.includes('Email já cadastrado')) {
                        errorMessage = 'Este e-mail já está cadastrado';
                    } else if (result.error.includes('CELULAR_USUARIO')) {
                        errorMessage = 'Número de celular já cadastrado';
                    } else if (result.error.includes('CPF_CLIENTE')) {
                        errorMessage = 'CPF já cadastrado';
                    } else if (result.error.includes('NOME_USUARIO')) {
                        errorMessage = 'Nome de usuário já existe';
                    } else if (result.error.includes('Duplicate entry')) {
                        errorMessage = 'Dados já cadastrados no sistema';
                    } else {
                        errorMessage = result.error;
                    }
                }
                
                showFeedback(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            showFeedback('Erro de conexão com o servidor.', 'error');
        }
    });
}
});