document.addEventListener('DOMContentLoaded', () => {
    console.log('Script de cadastro de vendedor iniciado...');

    // Elementos principais
    const sellerForm = document.getElementById('seller-form');
    const feedbackMessage = document.getElementById('feedback-message');
    
    // Elementos da notificação fixa
    const fixedNotification = document.getElementById('fixedNotification');
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationClose = document.getElementById('notificationClose');
    
    // Elementos do formulário
    const nomeInput = document.getElementById('nome');
    const cpfInput = document.getElementById('cpf');
    const emailInput = document.getElementById('email');
    const celularInput = document.getElementById('celular');
    const dataNascInput = document.getElementById('dataNasc');
    const nomeLojaInput = document.getElementById('nomeLoja');
    const cnpjInput = document.getElementById('cnpj');
    const descricaoNegocioInput = document.getElementById('descricaoNegocio');
    const telefoneComercialInput = document.getElementById('telefoneComercial');
    const siteInput = document.getElementById('site');
    const cepInput = document.getElementById('cep');
    const ufInput = document.getElementById('uf');
    const logradouroInput = document.getElementById('logradouro');
    const bairroInput = document.getElementById('bairro');
    const cidadeInput = document.getElementById('cidade');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Botões de mostrar/esconder senha
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');

    // Indicadores de força da senha
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    // Botão de submit
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');

    // Teste de conexão com API
    async function testarConexaoAPI() {
        try {
            console.log('🔍 Testando conexão com API...');
            const response = await fetch('/api/teste');
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Conexão com API estabelecida:', result.message);
            } else {
                console.log('❌ API não respondeu corretamente');
            }
        } catch (error) {
            console.error('❌ Erro na conexão com API:', error);
        }
    }

    // Chamar teste de conexão
    testarConexaoAPI();

    // Função para mostrar notificação fixa
    function showFixedNotification(title, message, type = 'error') {
        if (!fixedNotification || !notificationTitle || !notificationMessage) return;
        
        // Atualizar conteúdo
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;
        
        // Atualizar classe de tipo
        fixedNotification.className = `fixed-notification ${type}`;
        if (type === 'error') {
            fixedNotification.querySelector('.notification-icon').textContent = '⚠️';
        } else {
            fixedNotification.querySelector('.notification-icon').textContent = '✅';
        }
        
        // Mostrar notificação
        fixedNotification.classList.add('show');
        
        // Auto-esconder após 5 segundos (apenas para sucesso)
        if (type === 'success') {
            setTimeout(() => {
                hideFixedNotification();
            }, 5000);
        }
    }

    // Função para esconder notificação fixa
    function hideFixedNotification() {
        if (fixedNotification) {
            fixedNotification.classList.remove('show');
        }
    }

    // Event listener para fechar notificação
    if (notificationClose) {
        notificationClose.addEventListener('click', hideFixedNotification);
    }

    // Função para mostrar erro com simply-notify
    function showFieldError(fieldName, message) {
        simplyNotify.error(message, `Erro no campo ${fieldName}`);
    }

    // Função para limpar estilos de erro
    function clearFieldError(input) {
        if (!input) return;
        input.classList.remove('error');
        input.classList.remove('success');
    }

    // Função para mostrar sucesso no campo
    function showFieldSuccess(input) {
        if (!input) return;
        input.classList.remove('error');
        input.classList.add('success');
    }

    // Função para mostrar erro no campo
    function showFieldErrorStyle(input) {
        if (!input) return;
        input.classList.remove('success');
        input.classList.add('error');
    }

    // Função para mostrar/esconder senha
    function togglePasswordVisibility(input, button) {
        if (!input || !button) return;
        
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.innerHTML = isPassword ? '👁️‍🗨️' : '👁️';
        button.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
    }

    // Event listeners para os botões de mostrar/esconder
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

        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        return strength;
    }

    // Atualizar indicador de força da senha em tempo real
    if (passwordInput && strengthBar && strengthText) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);

            // Atualizar barra de progresso
            const width = (strength / 5) * 100;
            strengthBar.style.width = width + '%';

            // Atualizar cores e texto
            if (password.length === 0) {
                strengthBar.style.backgroundColor = '#ddd';
                strengthText.textContent = '';
                strengthText.className = 'strength-text';
            } else {
                switch(strength) {
                    case 0:
                    case 1:
                        strengthBar.style.backgroundColor = '#ff4d4d';
                        strengthText.textContent = 'Muito fraca';
                        strengthText.className = 'strength-text strength-weak';
                        break;
                    case 2:
                        strengthBar.style.backgroundColor = '#ffa64d';
                        strengthText.textContent = 'Fraca';
                        strengthText.className = 'strength-text strength-weak';
                        break;
                    case 3:
                        strengthBar.style.backgroundColor = '#ffd24d';
                        strengthText.textContent = 'Média';
                        strengthText.className = 'strength-text strength-medium';
                        break;
                    case 4:
                        strengthBar.style.backgroundColor = '#a3d56d';
                        strengthText.textContent = 'Forte';
                        strengthText.className = 'strength-text strength-strong';
                        break;
                    case 5:
                        strengthBar.style.backgroundColor = '#4CAF50';
                        strengthText.textContent = 'Muito forte';
                        strengthText.className = 'strength-text strength-strong';
                        break;
                }
            }
        });
    }

    // Formatação de CPF
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 9) {
                value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/^(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/^(\d{3})(\d{0,3})/, '$1.$2');
            }
            e.target.value = value;
        });
    }

    // Formatação de CNPJ (opcional)
    if (cnpjInput) {
        cnpjInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 12) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
            } else if (value.length > 8) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
            } else if (value.length > 5) {
                value = value.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
            }
            e.target.value = value;
        });
    }

    // Formatação de celular
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

    // Formatação de CEP
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

            if (cep.length !== 8) return;

            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    if (logradouroInput) logradouroInput.value = data.logradouro || '';
                    if (bairroInput) bairroInput.value = data.bairro || '';
                    if (cidadeInput) cidadeInput.value = data.localidade || '';
                    if (ufInput) ufInput.value = data.uf || '';
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        });
    }

    // Feedback messages
    function showFeedback(message, type) {
        if (!feedbackMessage) return;
        
        feedbackMessage.textContent = message;
        feedbackMessage.className = `message ${type}-message`;
        feedbackMessage.style.display = 'block';
        
        // Mostrar também na notificação fixa
        if (type === 'success') {
            showFixedNotification('Sucesso!', message, 'success');
            simplyNotify.success(message);
        } else {
            showFixedNotification('Erro', message, 'error');
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
            btnText.textContent = 'Cadastrando...';
            btnLoading.style.display = 'inline-block';
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Cadastrar como Vendedor';
            btnLoading.style.display = 'none';
        }
    }

    // Validação individual de campos
    function validateField(field, value, fieldName) {
        if (!field) return true;
        
        clearFieldError(field);

        switch(fieldName) {
            case 'nome':
                if (!value || value.length < 3) {
                    showFieldErrorStyle(field);
                    showFieldError('Nome', 'Nome deve ter no mínimo 3 caracteres');
                    return false;
                }
                break;
            
            case 'cpf':
                const cpfClean = value.replace(/\D/g, '');
                if (!cpfClean || cpfClean.length !== 11) {
                    showFieldErrorStyle(field);
                    showFieldError('CPF', 'CPF deve ter 11 dígitos');
                    return false;
                }
                break;
            
            case 'email':
                if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    showFieldErrorStyle(field);
                    showFieldError('E-mail', 'E-mail inválido');
                    return false;
                }
                break;
            
            case 'celular':
                const celularClean = value.replace(/\D/g, '');
                if (!celularClean || celularClean.length < 10) {
                    showFieldErrorStyle(field);
                    showFieldError('Celular', 'Celular deve ter pelo menos 10 dígitos');
                    return false;
                }
                break;
            
            case 'nomeLoja':
                if (!value || value.length < 2) {
                    showFieldErrorStyle(field);
                    showFieldError('Nome da Loja', 'Nome da loja é obrigatório');
                    return false;
                }
                break;
            
            case 'password':
                if (!value || value.length < 8) {
                    showFieldErrorStyle(field);
                    showFieldError('Senha', 'Senha deve ter no mínimo 8 caracteres');
                    return false;
                }
                break;
        }

        showFieldSuccess(field);
        return true;
    }

    // Validação em tempo real
    const fieldsToValidate = [
        { field: nomeInput, name: 'nome' },
        { field: cpfInput, name: 'cpf' },
        { field: emailInput, name: 'email' },
        { field: celularInput, name: 'celular' },
        { field: nomeLojaInput, name: 'nomeLoja' },
        { field: passwordInput, name: 'password' }
    ];

    fieldsToValidate.forEach(({ field, name }) => {
        if (field) {
            field.addEventListener('blur', () => {
                validateField(field, field.value, name);
            });
        }
    });

    // SUBMIT DO FORMULÁRIO
    if (sellerForm) {
        sellerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('📝 Formulário de vendedor submetido - Iniciando cadastro...');
            
            let isValid = true;

            // Obter valores
            const formData = {
                // Informações pessoais
                NOME_USUARIO: nomeInput ? nomeInput.value.trim() : '',
                CPF: cpfInput ? cpfInput.value.replace(/\D/g, '') : '',
                EMAIL_USUARIO: emailInput ? emailInput.value.trim() : '',
                CELULAR_USUARIO: celularInput ? celularInput.value.replace(/\D/g, '') : '',
                DT_NASC_USUARIO: dataNascInput ? dataNascInput.value : '',
                
                // Informações do negócio
                NOME_LOJA: nomeLojaInput ? nomeLojaInput.value.trim() : '',
                CNPJ: cnpjInput ? cnpjInput.value.replace(/\D/g, '') : '',
                DESCRICAO_NEGOCIO: descricaoNegocioInput ? descricaoNegocioInput.value.trim() : '',
                
                // Contato e localização
                TELEFONE_COMERCIAL: telefoneComercialInput ? telefoneComercialInput.value.replace(/\D/g, '') : '',
                SITE: siteInput ? siteInput.value.trim() : '',
                CEP_USUARIO: cepInput ? cepInput.value.replace(/\D/g, '') : '',
                UF_USUARIO: ufInput ? ufInput.value.trim() : '',
                LOGRADOURO_USUARIO: logradouroInput ? logradouroInput.value.trim() : '',
                BAIRRO_USUARIO: bairroInput ? bairroInput.value.trim() : '',
                CIDADE_USUARIO: cidadeInput ? cidadeInput.value.trim() : '',
                
                // Acesso
                SENHA_USUARIO: passwordInput ? passwordInput.value : '',
                CONFIRM_SENHA_USUARIO: confirmPasswordInput ? confirmPasswordInput.value : '',
                
                TIPO_USUARIO: 'vendedor'
            };

            console.log('🔄 Dados coletados:', formData);

            // Validar todos os campos
            fieldsToValidate.forEach(({ field, name }) => {
                if (!validateField(field, field.value, name)) {
                    isValid = false;
                }
            });

            // Validações adicionais
            if (!formData.DT_NASC_USUARIO) {
                isValid = false;
                if (dataNascInput) showFieldErrorStyle(dataNascInput);
                showFieldError('Data de Nascimento', 'Data de nascimento é obrigatória');
            }

            if (!formData.DESCRICAO_NEGOCIO) {
                isValid = false;
                if (descricaoNegocioInput) showFieldErrorStyle(descricaoNegocioInput);
                showFieldError('Descrição da Loja', 'Descrição da loja é obrigatória');
            }

            if (formData.SENHA_USUARIO !== formData.CONFIRM_SENHA_USUARIO) {
                isValid = false;
                if (confirmPasswordInput) showFieldErrorStyle(confirmPasswordInput);
                showFieldError('Confirmar Senha', 'As senhas não coincidem');
            }

            if (!isValid) {
                showFixedNotification('Erro no Formulário', 'Por favor, corrija os erros destacados nos campos', 'error');
                simplyNotify.error('Por favor, corrija os erros destacados nos campos', 'Erro no Formulário');
                return;
            }

            // Mostrar estado de loading
            setLoadingState(true);

            try {
                console.log('🔄 Enviando dados para API...', formData);
                
                // Fazer requisição para o backend - USANDO A MESMA ROTA DO CLIENTE
                const response = await fetch('/api/cadastrar_usuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                console.log('📨 Resposta recebida:', response.status);

                const result = await response.json();
                console.log('📊 Resultado:', result);

                if (response.ok && result.success) {
                    console.log('✅ Cadastro de vendedor realizado com sucesso!');
                    showFeedback('Cadastro de vendedor realizado com sucesso!', 'success');
                    sellerForm.reset();
                    if (strengthBar) strengthBar.style.width = '0%';
                    if (strengthText) {
                        strengthText.textContent = '';
                        strengthText.className = 'strength-text';
                    }
                    
                    // Redirecionar após sucesso
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else {
                    console.log('❌ Erro no cadastro:', result.message);
                    showFeedback(result.message || 'Erro ao cadastrar vendedor.', 'error');
                }
            } catch (error) {
                console.error('💥 Erro na requisição:', error);
                showFeedback('Erro de conexão com o servidor.', 'error');
            } finally {
                setLoadingState(false);
            }
        });
    }

    console.log('✅ Script de cadastro de vendedor carregado com sucesso!');
});

// Menu mobile (mantido do código original)
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        // Alternar menu mobile
        mobileMenuBtn.addEventListener('click', function() {
            if (mobileMenu.style.display === 'flex') {
                mobileMenu.style.display = 'none';
            } else {
                mobileMenu.style.display = 'flex';
            }
        });
        
        // Fechar menu ao clicar em um link (em dispositivos móveis)
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.style.display = 'none';
            });
        });
    }
    
    // Adicionar efeito de clique nos botões de login
    const loginButtons = document.querySelectorAll('.login-btn');
    loginButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Redirecionando para login...');
            // Aqui você adicionaria a lógica de redirecionamento
        });
    });
});