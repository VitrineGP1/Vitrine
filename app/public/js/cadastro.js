document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastro-form');
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

    const typeBuyerRadio = document.getElementById('type-buyer');
    const typeSellerRadio = document.getElementById('type-seller');
    const sellerFieldsDiv = document.getElementById('seller-fields');

    const tipoPessoaSelect = document.getElementById('tipoPessoa');
    const digitoPessoaInput = document.getElementById('digitoPessoa');
    const nomeLojaInput = document.getElementById('nomeLoja');

    const nomeError = document.getElementById('nome-error');
    const emailError = document.getElementById('email-error');
    const celularError = document.getElementById('celular-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const cepError = document.getElementById('cep-error');
    const dataNascError = document.getElementById('dataNasc-error');
    const tipoPessoaError = document.getElementById('tipoPessoa-error');
    const digitoPessoaError = document.getElementById('digitoPessoa-error');
    const nomeLojaError = document.getElementById('nomeLoja-error');

    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `message ${type}-message`;
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 5000);
    }

    function clearErrors() {
        nomeError.textContent = '';
        emailError.textContent = '';
        celularError.textContent = '';
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';
        cepError.textContent = '';
        dataNascError.textContent = '';
        tipoPessoaError.textContent = '';
        digitoPessoaError.textContent = '';
        nomeLojaError.textContent = '';
    }

    function toggleSellerFields() {
        if (typeSellerRadio.checked) {
            sellerFieldsDiv.style.display = 'block';
            tipoPessoaSelect.setAttribute('required', 'required');
            digitoPessoaInput.setAttribute('required', 'required');
            nomeLojaInput.setAttribute('required', 'required');
        } else {
            sellerFieldsDiv.style.display = 'none';
            tipoPessoaSelect.removeAttribute('required');
            digitoPessoaInput.removeAttribute('required');
            nomeLojaInput.removeAttribute('required');
            tipoPessoaSelect.value = '';
            digitoPessoaInput.value = '';
            nomeLojaInput.value = '';
            clearErrors();
        }
    }

    typeBuyerRadio.addEventListener('change', toggleSellerFields);
    typeSellerRadio.addEventListener('change', toggleSellerFields);

    toggleSellerFields();

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

    cepInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d{0,3}).*/, '$1-$2');
        }
        e.target.value = value;
    });

    digitoPessoaInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (tipoPessoaSelect.value === 'PF') {
            if (value.length > 9) {
                value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/^(\d{3})(\d{0,3})/, '$1.$2');
            }
        } else if (tipoPessoaSelect.value === 'PJ') {
            if (value.length > 12) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
            } else if (value.length > 8) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
            } else if (value.length > 5) {
                value = value.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
            }
        }
        e.target.value = value;
    });

    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearErrors();
        feedbackMessage.style.display = 'none';

        let isValid = true;

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
        const TIPO_USUARIO = document.querySelector('input[name="TIPO_USUARIO"]:checked').value;

        if (NOME_USUARIO.length < 3) {
            nomeError.textContent = 'Nome deve ter no mínimo 3 caracteres.';
            isValid = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
            emailError.textContent = 'Formato de e-mail inválido.';
            isValid = false;
        }
        if (SENHA_USUARIO.length < 6) {
            passwordError.textContent = 'A senha deve ter no mínimo 6 caracteres.';
            isValid = false;
        }
        if (SENHA_USUARIO !== CONFIRM_SENHA_USUARIO) {
            confirmPasswordError.textContent = 'As senhas não coincidem.';
            isValid = false;
        }
        if (CELULAR_USUARIO && CELULAR_USUARIO.length < 14) {
            celularError.textContent = 'Formato de celular inválido (mínimo 14 caracteres com máscara).';
            isValid = false;
        }
        if (CEP_USUARIO && !/^\d{5}-\d{3}$/.test(CEP_USUARIO)) {
            cepError.textContent = 'Formato de CEP inválido (xxxxx-xxx).';
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

        let TIPO_PESSOA = null;
        let DIGITO_PESSOA = null;
        let NOME_LOJA = null;

        if (TIPO_USUARIO === 'seller') {
            TIPO_PESSOA = tipoPessoaSelect.value;
            DIGITO_PESSOA = digitoPessoaInput.value.trim();
            NOME_LOJA = nomeLojaInput.value.trim();

            if (!TIPO_PESSOA) {
                tipoPessoaError.textContent = 'Selecione o tipo de pessoa.';
                isValid = false;
            }
            if (!DIGITO_PESSOA) {
                digitoPessoaError.textContent = 'CPF/CNPJ é obrigatório.';
                isValid = false;
            } else {
                if (TIPO_PESSOA === 'PF' && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(DIGITO_PESSOA)) {
                    digitoPessoaError.textContent = 'Formato de CPF inválido (xxx.xxx.xxx-xx).';
                    isValid = false;
                } else if (TIPO_PESSOA === 'PJ' && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(DIGITO_PESSOA)) {
                    digitoPessoaError.textContent = 'Formato de CNPJ inválido (xx.xxx.xxx/xxxx-xx).';
                    isValid = false;
                }
            }
            if (!NOME_LOJA || NOME_LOJA.length < 3) {
                nomeLojaError.textContent = 'Nome da loja deve ter no mínimo 3 caracteres.';
                isValid = false;
            }
        }

        if (!isValid) {
            showFeedback('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        const userData = {
            NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
            LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
            CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO,
            TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA
        };

        try {
            const result = await response.json();

            if (response.ok && result.success) {
                showFeedback(result.message, 'success');
                cadastroForm.reset();
                toggleSellerFields();
                setTimeout(() => {
                    window.location.href = '/perfil';
                }, 2000);
            } else {
                showFeedback(result.message || 'Erro ao cadastrar usuário.', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição de cadastro:', error);
            showFeedback('Erro de conexão com o servidor.', 'error');
        }
    });
});
