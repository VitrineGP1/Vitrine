document.addEventListener('DOMContentLoaded', async () => {
    const profileNameSpan = document.getElementById('profile-name');
    const profileEmailSpan = document.getElementById('profile-email');
    const profileTypeSpan = document.getElementById('profile-type');
    const userProfileImage = document.getElementById('user-profile-image');
    const profileImageFileInput = document.getElementById('profile-image-file-input');
    const saveProfileImageBtn = document.getElementById('save-profile-image-btn');
    const profileImageFeedback = document.getElementById('profile-image-feedback');
    const storeProfileSection = document.getElementById('store-profile-section');
    const storeProfileImage = document.getElementById('store-profile-image');
    const storeNameSpan = document.getElementById('store-name');
    const goToSellerAreaBtn = document.getElementById('go-to-seller-area-btn');

    const API_USER_URL = '/api/buscar_usuario';
    const API_UPDATE_USER_URL = '/api/atualizar_usuario';

    let currentUserId = null;
    let currentUserProfileImageBase64 = null;


    function showFeedback(element, message, type) {
        element.textContent = message;
        element.className = `feedback-message ${type}-message`;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }


    async function loadUserProfile() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            const user = JSON.parse(loggedInUser);
            currentUserId = user.id;

            try {
                const response = await fetch(`${API_USER_URL}?id_usuario=${currentUserId}`);
                const result = await response.json();

                if (result.success && result.user) {
                    const userData = result.user;
                    profileNameSpan.textContent = userData.NOME_USUARIO;
                    profileEmailSpan.textContent = userData.EMAIL_USUARIO;
                    profileTypeSpan.textContent = userData.TIPO_USUARIO === 'seller' ? 'Vendedor' : 'Comprador';

                    if (userData.IMAGEM_PERFIL_BASE64) {
                        userProfileImage.src = userData.IMAGEM_PERFIL_BASE64;
                        currentUserProfileImageBase64 = userData.IMAGEM_PERFIL_BASE64;
                    } else {
                        userProfileImage.src = 'https://placehold.co/150x150/cccccc/333333?text=Foto+Perfil';
                        currentUserProfileImageBase64 = null;
                    }


                    if (userData.TIPO_USUARIO === 'seller') {
                        storeProfileSection.style.display = 'block';
                        goToSellerAreaBtn.style.display = 'block';

                        if (userData.IMAGEM_PERFIL_LOJA_BASE64) {
                            storeProfileImage.src = userData.IMAGEM_PERFIL_LOJA_BASE64;
                        } else {
                            storeProfileImage.src = 'https://placehold.co/120x120/cccccc/333333?text=Foto+Loja';
                        }
                        storeNameSpan.textContent = user.storeName || 'Não definido'; 
                    } else {
                        storeProfileSection.style.display = 'none';
                        goToSellerAreaBtn.style.display = 'none';
                    }

                } else {
                    showFeedback(profileImageFeedback, result.message || 'Erro ao carregar dados do usuário.', 'error');
                }
            } catch (error) {
                console.error('Erro ao buscar perfil:', error);
                showFeedback(profileImageFeedback, 'Erro de conexão ao carregar perfil.', 'error');
            }
        } else {
            showFeedback(profileImageFeedback, 'Você não está logado. Redirecionando para o login...', 'error');
            setTimeout(() => { window.location.href = '/login'; }, 2000);
        }
    }

   
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
                saveProfileImageBtn.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            userProfileImage.src = 'https://placehold.co/150x150/cccccc/333333?text=Foto+Perfil';
            currentUserProfileImageBase64 = null;
            saveProfileImageBtn.style.display = 'none'; 
        }
    });


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

            const userResponse = await fetch(`${API_USER_URL}?id_usuario=${currentUserId}`);
            const userResult = await userResponse.json();
            if (!userResult.success || !userResult.user) {
                showFeedback(profileImageFeedback, 'Erro ao obter dados do usuário para atualização.', 'error');
                return;
            }
            const existingUserData = userResult.user;

            const response = await fetch(API_UPDATE_USER_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: currentUserId,
                    IMAGEM_PERFIL_BASE64: currentUserProfileImageBase64,

                    NOME_USUARIO: existingUserData.NOME_USUARIO,
                    EMAIL_USUARIO: existingUserData.EMAIL_USUARIO,
                    CELULAR_USUARIO: existingUserData.CELULAR_USUARIO,
                    LOGRADOURO_USUARIO: existingUserData.LOGRADOURO_USUARIO,
                    BAIRRO_USUARIO: existingUserData.BAIRRO_USUARIO,
                    CIDADE_USUARIO: existingUserData.CIDADE_USUARIO,
                    UF_USUARIO: existingUserData.UF_USUARIO,
                    CEP_USUARIO: existingUserData.CEP_USUARIO,
                    DT_NASC_USUARIO: existingUserData.DT_NASC_USUARIO,
                    TIPO_USUARIO: existingUserData.TIPO_USUARIO
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showFeedback(profileImageFeedback, 'Foto de perfil atualizada com sucesso!', 'success');
                saveProfileImageBtn.style.display = 'none';

                let user = JSON.parse(localStorage.getItem('loggedInUser'));
                if (user) {
                    user.IMAGEM_PERFIL_BASE64 = currentUserProfileImageBase64;
                    localStorage.setItem('loggedInUser', JSON.stringify(user));
                }
            } else {
                showFeedback(profileImageFeedback, result.message || 'Erro ao atualizar foto de perfil.', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição de atualização de perfil:', error);
            showFeedback('Erro de conexão com o servidor.', 'error');
        }
    });


    goToSellerAreaBtn.addEventListener('click', () => {
        window.location.href = '/vendedor';
    });

    loadUserProfile();
});