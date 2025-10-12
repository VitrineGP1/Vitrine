document.addEventListener('DOMContentLoaded', async () => {

    const userProfileImage = document.getElementById('user-profile-image');
    const profileImageFileInput = document.getElementById('profile-image-file-input');
    const saveProfileImageBtn = document.getElementById('save-profile-image-btn');
    const profileImageFeedback = document.getElementById('profile-image-feedback');


    const profileDetailsForm = document.getElementById('profile-details-form');
    const profileNameInput = document.getElementById('profile-name-input');
    const profileEmailInput = document.getElementById('profile-email-input');
    const profileCelularInput = document.getElementById('profile-celular-input');
    const profileLogradouroInput = document.getElementById('profile-logradouro-input');
    const profileBairroInput = document.getElementById('profile-bairro-input');
    const profileCidadeInput = document.getElementById('profile-cidade-input');
    const profileUfInput = document.getElementById('profile-uf-input');
    const profileCepInput = document.getElementById('profile-cep-input');
    const profileDataNascInput = document.getElementById('profile-dataNasc-input');
    const profileTypeDisplay = document.getElementById('profile-type-display');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const profileDetailsFeedback = document.getElementById('profile-details-feedback');


    const passwordChangeForm = document.getElementById('password-change-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    const savePasswordBtn = document.getElementById('save-password-btn');
    const passwordFeedback = document.getElementById('password-feedback');

    const storeProfileSection = document.getElementById('store-profile-section');
    const storeProfileImage = document.getElementById('store-profile-image');
    const storeNameSpan = document.getElementById('store-name');
    const goToSellerAreaBtn = document.getElementById('go-to-seller-area-btn');

    const API_USER_URL = '/api/user';
    const API_UPDATE_USER_URL = '/api/atualizar_usuario';

    let currentUserId = null;
    let currentUserProfileImageBase64 = null;
    let initialUserData = {};

    function showFeedback(element, message, type) {
        element.textContent = message;
        element.className = `feedback-message ${type}-message`;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }


    function toggleEditMode(isEditing) {
        const inputs = profileDetailsForm.querySelectorAll('input:not(#profile-type-display)');
        inputs.forEach(input => {
            input.readOnly = !isEditing;
            if (isEditing) {
                input.classList.add('editable');
            } else {
                input.classList.remove('editable');
            }
        });
        editProfileBtn.style.display = isEditing ? 'none' : 'inline-block';
        saveProfileBtn.style.display = isEditing ? 'inline-block' : 'none';
        cancelEditBtn.style.display = isEditing ? 'inline-block' : 'none';
    }


    async function loadUserProfile() {
        const loggedInUser = localStorage.getItem('loggedUser');
        if (loggedInUser) {
            const user = JSON.parse(loggedInUser);
            currentUserId = user.id; 

            if (!currentUserId) {
                showFeedback(profileImageFeedback, 'ID do usuário não encontrado no localStorage. Redirecionando para o login...', 'error');
                console.log('PERFIL.JS: currentUserId não encontrado');
                // setTimeout(() => { window.location.href = '/login'; }, 2000);
                return;
            }

            try {
                const response = await fetch(`${API_USER_URL}/${currentUserId}`);
                const result = await response.json();

                if (response.ok && result.success && result.user) {
                    const userData = result.user;
                    initialUserData = { ...userData };

                    if (profileNameInput) profileNameInput.value = userData.NOME_USUARIO || '';
                    if (profileEmailInput) profileEmailInput.value = userData.EMAIL_USUARIO || '';
                    if (profileCelularInput) profileCelularInput.value = userData.CELULAR_USUARIO || '';
                    if (profileLogradouroInput) profileLogradouroInput.value = userData.LOGRADOURO_USUARIO || '';
                    if (profileBairroInput) profileBairroInput.value = userData.BAIRRO_USUARIO || '';
                    if (profileCidadeInput) profileCidadeInput.value = userData.CIDADE_USUARIO || '';
                    if (profileUfInput) profileUfInput.value = userData.UF_USUARIO || '';
                    if (profileCepInput) profileCepInput.value = userData.CEP_USUARIO || '';
                    if (profileDataNascInput) profileDataNascInput.value = userData.DT_NASC_USUARIO ? new Date(userData.DT_NASC_USUARIO).toISOString().split('T')[0] : '';
                    if (profileTypeDisplay) profileTypeDisplay.value = userData.TIPO_USUARIO === 'V' ? 'Vendedor' : userData.TIPO_USUARIO === 'C' ? 'Comprador' : 'Administrador';


                    if (userData.IMAGEM_PERFIL_BASE64) {
                        userProfileImage.src = userData.IMAGEM_PERFIL_BASE64;
                        currentUserProfileImageBase64 = userData.IMAGEM_PERFIL_BASE64;
                    } else {
                        userProfileImage.src = 'https://placehold.co/150x150/cccccc/333333?text=Foto+Perfil';
                        currentUserProfileImageBase64 = null;
                    }

 
                    if (userData.TIPO_USUARIO === 'V') {
                        if (storeProfileSection) storeProfileSection.style.display = 'block';
                        if (goToSellerAreaBtn) goToSellerAreaBtn.style.display = 'inline-block';

                        if (userData.IMAGEM_PERFIL_LOJA_BASE64) {
                            if (storeProfileImage) storeProfileImage.src = userData.IMAGEM_PERFIL_LOJA_BASE64;
                        } else {
                            if (storeProfileImage) storeProfileImage.src = 'https://placehold.co/120x120/cccccc/333333?text=Foto+Loja';
                        }

                        if (storeNameSpan) storeNameSpan.textContent = user.storeName || 'Não definido';
                    } else {
                        if (storeProfileSection) storeProfileSection.style.display = 'none';
                        if (goToSellerAreaBtn) goToSellerAreaBtn.style.display = 'none';
                    }

                    toggleEditMode(false);

                } else {
                    showFeedback(profileDetailsFeedback, result.message || 'Erro ao carregar dados do usuário.', 'error');
                    console.log('PERFIL.JS: Erro na API response');
                    // setTimeout(() => { window.location.href = '/login'; }, 2000);
                }
            } catch (error) {
                console.error('Erro ao buscar perfil:', error);
                showFeedback(profileDetailsFeedback, 'Erro de conexão ao carregar perfil.', 'error');
                console.log('PERFIL.JS: Erro de conexão');
                // setTimeout(() => { window.location.href = '/login'; }, 2000);
            }
        } else {
            showFeedback(profileDetailsFeedback, 'Você não está logado. Redirecionando para o login...', 'error');
            console.log('PERFIL.JS: loggedUser não encontrado no localStorage');
            // setTimeout(() => { window.location.href = '/login'; }, 2000);
        }
    }


    if (profileImageFileInput) {
        profileImageFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                if (file.size > 1 * 1024 * 1024) { 
                    showFeedback(profileImageFeedback, 'A imagem de perfil deve ter no máximo 1MB.', 'error');
                    profileImageFileInput.value = '';
                    userProfileImage.src = 'https://placehold.co/150x150/cccccc/333333?text=Foto+Perfil';
                    currentUserProfileImageBase64 = null;
                    return;
                }
                if (!file.type.startsWith('image/')) {
                    showFeedback(profileImageFeedback, 'Por favor, selecione um arquivo de imagem válido.', 'error');
                    profileImageFileInput.value = '';
                    userProfileImage.src = 'https://placehold.co/150x150/cccccc/333333?text=Foto+Perfil';
                    currentUserProfileImageBase64 = null;
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    userProfileImage.src = e.target.result;
                    currentUserProfileImageBase64 = e.target.result;
                    if (saveProfileImageBtn) saveProfileImageBtn.style.display = 'block'; 
                };
                reader.readAsDataURL(file);
            } else {
                userProfileImage.src = 'https://placehold.co/150x150/cccccc/333333?text=Foto+Perfil';
                currentUserProfileImageBase64 = null;
                if (saveProfileImageBtn) saveProfileImageBtn.style.display = 'none'; 
            }
        });
    }


    if (saveProfileImageBtn) {
        saveProfileImageBtn.addEventListener('click', async () => {
        if (!currentUserId) {
            showFeedback(profileImageFeedback, 'Erro: ID do usuário não encontrado.', 'error');
            return;
        }
        if (!currentUserProfileImageBase64) {
            showFeedback(profileImageFeedback, 'Por favor, selecione uma imagem para salvar.', 'error');
            return;
        }

        try {

            const dataToUpdate = {
                id_usuario: currentUserId,
                IMAGEM_PERFIL_BASE64: currentUserProfileImageBase64,
                NOME_USUARIO: profileNameInput.value,
                EMAIL_USUARIO: profileEmailInput.value,
                CELULAR_USUARIO: profileCelularInput.value,
                LOGRADOURO_USUARIO: profileLogradouroInput.value,
                BAIRRO_USUARIO: profileBairroInput.value,
                CIDADE_USUARIO: profileCidadeInput.value,
                UF_USUARIO: profileUfInput.value,
                CEP_USUARIO: profileCepInput.value,
                DT_NASC_USUARIO: profileDataNascInput.value,
                TIPO_USUARIO: initialUserData.TIPO_USUARIO 
            };

            const response = await fetch(API_UPDATE_USER_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToUpdate)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showFeedback(profileImageFeedback, 'Foto de perfil atualizada com sucesso!', 'success');
                saveProfileImageBtn.style.display = 'none';

                let user = JSON.parse(localStorage.getItem('loggedUser'));
                if (user) {
                    user.IMAGEM_PERFIL_BASE64 = currentUserProfileImageBase64;
                    localStorage.setItem('loggedUser', JSON.stringify(user));
                }
            } else {
                showFeedback(profileImageFeedback, result.message || 'Erro ao atualizar foto de perfil.', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição de atualização de perfil:', error);
            showFeedback('Erro de conexão com o servidor.', 'error');
        }
        });
    }


    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            toggleEditMode(true);
            if (profileDetailsFeedback) profileDetailsFeedback.textContent = ''; 
        });
    }


    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            if (profileNameInput) profileNameInput.value = initialUserData.NOME_USUARIO || '';
            if (profileEmailInput) profileEmailInput.value = initialUserData.EMAIL_USUARIO || '';
            if (profileCelularInput) profileCelularInput.value = initialUserData.CELULAR_USUARIO || '';
            if (profileLogradouroInput) profileLogradouroInput.value = initialUserData.LOGRADOURO_USUARIO || '';
            if (profileBairroInput) profileBairroInput.value = initialUserData.BAIRRO_USUARIO || '';
            if (profileCidadeInput) profileCidadeInput.value = initialUserData.CIDADE_USUARIO || '';
            if (profileUfInput) profileUfInput.value = initialUserData.UF_USUARIO || '';
            if (profileCepInput) profileCepInput.value = initialUserData.CEP_USUARIO || '';
            if (profileDataNascInput) profileDataNascInput.value = initialUserData.DT_NASC_USUARIO ? new Date(initialUserData.DT_NASC_USUARIO).toISOString().split('T')[0] : '';
            
            if (profileDetailsFeedback) profileDetailsFeedback.textContent = ''; 
            toggleEditMode(false); 
        });
    }


    if (profileDetailsForm) {
        profileDetailsForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (profileDetailsFeedback) profileDetailsFeedback.style.display = 'none';


        const dataToUpdate = {
            id_usuario: currentUserId,
            NOME_USUARIO: profileNameInput.value,
            EMAIL_USUARIO: profileEmailInput.value,
            CELULAR_USUARIO: profileCelularInput.value,
            LOGRADOURO_USUARIO: profileLogradouroInput.value,
            BAIRRO_USUARIO: profileBairroInput.value,
            CIDADE_USUARIO: profileCidadeInput.value,
            UF_USUARIO: profileUfInput.value,
            CEP_USUARIO: profileCepInput.value,
            DT_NASC_USUARIO: profileDataNascInput.value,
            TIPO_USUARIO: initialUserData.TIPO_USUARIO,
            IMAGEM_PERFIL_BASE64: currentUserProfileImageBase64
        };



        try {
            const response = await fetch(API_UPDATE_USER_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToUpdate)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showFeedback(profileDetailsFeedback, 'Dados do perfil atualizados com sucesso!', 'success');

                loadUserProfile();
            } else {
                showFeedback(profileDetailsFeedback, result.message || 'Erro ao atualizar dados do perfil.', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição de atualização do perfil:', error);
            showFeedback('Erro de conexão com o servidor.', 'error');
        }
        });
    }

    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        passwordFeedback.style.display = 'none';

        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        if (!newPassword || !confirmNewPassword) {
            showFeedback(passwordFeedback, 'Por favor, preencha ambos os campos de senha.', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showFeedback(passwordFeedback, 'A nova senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            showFeedback(passwordFeedback, 'As senhas não coincidem.', 'error');
            return;
        }

        try {

            const dataToUpdate = {
                id_usuario: currentUserId,
                NOVA_SENHA_USUARIO: newPassword,
                CONFIRM_SENHA_USUARIO: confirmNewPassword,
                NOME_USUARIO: profileNameInput.value,
                EMAIL_USUARIO: profileEmailInput.value,
                CELULAR_USUARIO: profileCelularInput.value,
                LOGRADOURO_USUARIO: profileLogradouroInput.value,
                BAIRRO_USUARIO: profileBairroInput.value,
                CIDADE_USUARIO: profileCidadeInput.value,
                UF_USUARIO: profileUfInput.value,
                CEP_USUARIO: profileCepInput.value,
                DT_NASC_USUARIO: profileDataNascInput.value,
                TIPO_USUARIO: initialUserData.TIPO_USUARIO,
                IMAGEM_PERFIL_BASE64: currentUserProfileImageBase64
            };

            const response = await fetch(API_UPDATE_USER_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToUpdate)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showFeedback(passwordFeedback, 'Senha alterada com sucesso!', 'success');
                newPasswordInput.value = '';
                confirmNewPasswordInput.value = '';
            } else {
                showFeedback(passwordFeedback, result.message || 'Erro ao mudar a senha.', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição de mudança de senha:', error);
            showFeedback('Erro de conexão com o servidor.', 'error');
        }
        });
    }

    if (goToSellerAreaBtn) {
        goToSellerAreaBtn.addEventListener('click', () => {
            window.location.href = '/vendedor';
        });
    }

    loadUserProfile(); 
});