document.addEventListener('DOMContentLoaded', async () => {
    console.log('PERFIL.JS: DOM carregado, inicializando...');

    const userProfileImage = document.getElementById('user-profile-image');
    const profileImageFileInput = document.getElementById('profile-image-input');
    const saveProfileImageBtn = document.getElementById('save-profile-image-btn');
    const profileImageFeedback = document.getElementById('profile-image-feedback');
    
    console.log('PERFIL.JS: Elementos encontrados:', {
        userProfileImage: !!userProfileImage,
        profileImageFileInput: !!profileImageFileInput,
        saveProfileImageBtn: !!saveProfileImageBtn,
        profileImageFeedback: !!profileImageFeedback
    });


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
        if (profileDetailsForm) {
            const inputs = profileDetailsForm.querySelectorAll('input:not(#profile-type-display)');
            inputs.forEach(input => {
                input.readOnly = !isEditing;
                if (isEditing) {
                    input.classList.add('editable');
                } else {
                    input.classList.remove('editable');
                }
            });
        }
        if (editProfileBtn) editProfileBtn.style.display = isEditing ? 'none' : 'inline-block';
        if (saveProfileBtn) saveProfileBtn.style.display = isEditing ? 'inline-block' : 'none';
        if (cancelEditBtn) cancelEditBtn.style.display = isEditing ? 'inline-block' : 'none';
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
                        if (userProfileImage) userProfileImage.src = userData.IMAGEM_PERFIL_BASE64;
                        currentUserProfileImageBase64 = userData.IMAGEM_PERFIL_BASE64;
                    } else {
                        if (userProfileImage) userProfileImage.src = 'https://placehold.co/150x150/cccccc/333333?text=Foto+Perfil';
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
                    if (userProfileImage) userProfileImage.src = e.target.result;
                    currentUserProfileImageBase64 = e.target.result;
                    if (saveProfileImageBtn) saveProfileImageBtn.style.display = 'block'; 
                };
                reader.readAsDataURL(file);
            } else {
                if (userProfileImage) userProfileImage.src = 'https://placehold.co/150x150/cccccc/333333?text=Foto+Perfil';
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
            if (profileImageFeedback) showFeedback(profileImageFeedback, 'Erro de conexão com o servidor.', 'error');
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
            if (profileDetailsFeedback) showFeedback(profileDetailsFeedback, 'Erro de conexão com o servidor.', 'error');
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
            if (passwordFeedback) showFeedback(passwordFeedback, 'Erro de conexão com o servidor.', 'error');
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

        // Carregar dados do usuário
        document.addEventListener('DOMContentLoaded', function() {
            loadProfileImageFromStorage();
            loadUserData();
            setupEditControls();
            checkSellerStatus();
            loadAddressesFromStorage();
            setupProfileImageUpload();
            
            // Garantir sincronização das imagens após carregamento
            setTimeout(() => {
                const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
                if (loggedUser && loggedUser.profileImage) {
                    syncProfileImages(loggedUser.profileImage);
                }
            }, 200);
        });
        
        function loadProfileImageFromStorage() {
            const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
            const userProfileImage = document.getElementById('user-profile-image');
            const headerProfileImage = document.getElementById('header-profile-image');
            
            if (loggedUser) {
                if (loggedUser.profileImage) {
                    // Usar imagem salva
                    if (userProfileImage) userProfileImage.src = loggedUser.profileImage;
                    if (headerProfileImage) headerProfileImage.src = loggedUser.profileImage;
                } else {
                    // Usar placeholder com inicial do nome
                    const firstName = loggedUser.name ? loggedUser.name.split(' ')[0] : 'U';
                    const placeholderUrl = `https://placehold.co/80x80/cccccc/333333?text=${firstName.charAt(0)}`;
                    const headerPlaceholderUrl = `https://placehold.co/32x32/cccccc/333333?text=${firstName.charAt(0)}`;
                    
                    if (userProfileImage) userProfileImage.src = placeholderUrl;
                    if (headerProfileImage) headerProfileImage.src = headerPlaceholderUrl;
                }
            }
        }
        
        function setupProfileImageUpload() {
            const profileImageInput = document.getElementById('profile-image-input');
            const userProfileImage = document.getElementById('user-profile-image');
            const headerProfileImage = document.getElementById('header-profile-image');
            
            if (profileImageInput) {
                profileImageInput.addEventListener('change', function(event) {
                    const file = event.target.files[0];
                    if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                            alert('A imagem deve ter no máximo 2MB.');
                            return;
                        }
                        
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const base64Image = e.target.result;
                            userProfileImage.src = base64Image;
                            if (headerProfileImage) {
                                headerProfileImage.src = base64Image;
                            }
                            
                            // Salvar imagem automaticamente
                            saveProfileImage(base64Image);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        }
        
        async function saveProfileImage(base64Image) {
            const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
            if (!loggedUser) return;
            
            try {
                const response = await fetch('/api/update-profile-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: loggedUser.id,
                        imageBase64: base64Image
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Atualizar localStorage
                    loggedUser.profileImage = base64Image;
                    localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
                    
                    // Sincronizar ambas as imagens
                    syncProfileImages(base64Image);
                    
                    // Mostrar feedback
                    showToast('Foto de perfil atualizada com sucesso!', 'success');
                } else {
                    showToast('Erro ao salvar foto de perfil', 'error');
                }
            } catch (error) {
                console.error('Erro ao salvar imagem:', error);
                showToast('Erro ao salvar foto de perfil', 'error');
            }
        }
        
        function syncProfileImages(imageUrl) {
            const userProfileImage = document.getElementById('user-profile-image');
            const headerProfileImage = document.getElementById('header-profile-image');
            
            if (userProfileImage && imageUrl) userProfileImage.src = imageUrl;
            if (headerProfileImage && imageUrl) headerProfileImage.src = imageUrl;
            
            // Atualizar ícone do header se a função existir
            if (typeof window.updateProfileIcon === 'function') {
                window.updateProfileIcon(imageUrl);
            }
        }
        
        function showToast(message, type) {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                background: ${type === 'success' ? '#28a745' : '#dc3545'};
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
        
        function saveAddressesToStorage() {
            const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
            if (!loggedUser) return;
            
            const addresses = [];
            const addressItems = document.querySelectorAll('#addresses-list .address-item');
            
            addressItems.forEach(item => {
                const isMain = item.getAttribute('data-main') === 'true';
                const titleElement = item.querySelector('h4');
                const addressText = item.querySelector('p').innerHTML;
                
                if (titleElement && addressText) {
                    addresses.push({
                        name: titleElement.textContent.trim(),
                        address: addressText,
                        isMain: isMain
                    });
                }
            });
            
            localStorage.setItem(`addresses_${loggedUser.id}`, JSON.stringify(addresses));
        }
        
        function loadAddressesFromStorage() {
            const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
            if (!loggedUser) return;
            
            const savedAddresses = localStorage.getItem(`addresses_${loggedUser.id}`);
            if (!savedAddresses) return;
            
            const addresses = JSON.parse(savedAddresses);
            const addressesList = document.getElementById('addresses-list');
            
            // Limpar endereços existentes
            const existingAddresses = addressesList.querySelectorAll('.address-item');
            existingAddresses.forEach(item => {
                if (item.getAttribute('data-main') !== 'true' || addresses.some(addr => addr.isMain)) {
                    item.remove();
                }
            });
            
            // Separar endereços principais e secundários
            const mainAddress = addresses.find(addr => addr.isMain);
            const secondaryAddresses = addresses.filter(addr => !addr.isMain);
            
            // Adicionar endereço principal primeiro
            if (mainAddress) {
                const defaultMain = addressesList.querySelector('.address-item[data-main="true"]');
                if (defaultMain) defaultMain.remove();
                
                const newAddress = document.createElement('div');
                newAddress.className = 'address-item';
                newAddress.setAttribute('data-main', 'true');
                newAddress.style.cssText = 'padding: 20px; background: white; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #3483fa;';
                newAddress.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <span class="principal-badge" style="background: #3483fa; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">Principal</span>
                                <h4 style="margin: 0; color: #333;">${mainAddress.name}</h4>
                            </div>
                            <p style="margin: 5px 0; color: #666;">${mainAddress.address}</p>
                        </div>
                        <div class="address-actions">
                            <button class="btn btn-secondary" onclick="editAddress(this)" style="background: #6c757d; color: white; margin-right: 10px;"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-secondary" onclick="removeAddress(this)" style="background: #dc3545; color: white;"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                addressesList.prepend(newAddress);
            }
            
            // Adicionar endereços secundários
            secondaryAddresses.forEach(addr => {
                const newAddress = document.createElement('div');
                newAddress.className = 'address-item';
                newAddress.style.cssText = 'padding: 20px; background: white; border-radius: 6px; margin-bottom: 15px;';
                newAddress.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 10px 0; color: #333;">${addr.name}</h4>
                            <p style="margin: 5px 0; color: #666;">${addr.address}</p>
                        </div>
                        <div class="address-actions">
                            <button class="btn btn-secondary" onclick="editAddress(this)" style="background: #6c757d; color: white; margin-right: 10px;"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-secondary set-main-btn" onclick="setAsMainAddress(this)" style="background: #ffc107; color: #000; margin-right: 10px;"><i class="fas fa-star"></i></button>
                            <button class="btn btn-secondary" onclick="removeAddress(this)" style="background: #dc3545; color: white;"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                addressesList.appendChild(newAddress);
            });
        }
        
        async function loadUserData() {
            // Buscar dados do usuário logado
            const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
            
            if (!loggedUser) {
                console.log('PERFIL.EJS: loggedUser não encontrado, tentando redirecionar');
                // window.location.href = '/login';
                return;
            }
            
            try {
                // Buscar dados completos do usuário
                const response = await fetch(`/api/user/${loggedUser.id}`);
                const result = await response.json();
                
                if (result.success) {
                    const fullUserData = result.user;
                    
                    const userData = {
                        nome: fullUserData.NOME_USUARIO || loggedUser.name || '',
                        email: fullUserData.EMAIL_USUARIO || loggedUser.email || '',
                        celular: fullUserData.CELULAR_USUARIO || '',
                        dataNasc: fullUserData.DT_NASC_USUARIO || '',
                        cep: fullUserData.CEP_USUARIO || '',
                        logradouro: fullUserData.LOGRADOURO_USUARIO || '',
                        bairro: fullUserData.BAIRRO_USUARIO || '',
                        cidade: fullUserData.CIDADE_USUARIO || '',
                        uf: fullUserData.UF_USUARIO || '',
                        isVendedor: fullUserData.TIPO_USUARIO === 'seller',
                        profileImage: fullUserData.IMAGEM_PERFIL_BASE64
                    };
                    
                    // Sincronizar imagens de perfil
                    const currentUser = JSON.parse(localStorage.getItem('loggedUser'));
                    const userProfileImage = document.getElementById('user-profile-image');
                    const headerProfileImage = document.getElementById('header-profile-image');
                    
                    // Priorizar imagem do localStorage, depois da API
                    let imageToUse = currentUser?.profileImage || userData.profileImage;
                    
                    if (imageToUse) {
                        if (userProfileImage) userProfileImage.src = imageToUse;
                        if (headerProfileImage) headerProfileImage.src = imageToUse;
                        
                        // Salvar no localStorage se veio da API
                        if (!currentUser?.profileImage && userData.profileImage && currentUser) {
                            currentUser.profileImage = userData.profileImage;
                            localStorage.setItem('loggedUser', JSON.stringify(currentUser));
                        }
                    } else {
                        const firstName = userData.nome.split(' ')[0] || 'U';
                        if (userProfileImage) userProfileImage.src = `https://placehold.co/80x80/cccccc/333333?text=${firstName.charAt(0)}`;
                        if (headerProfileImage) {
                            headerProfileImage.src = `https://placehold.co/32x32/cccccc/333333?text=${firstName.charAt(0)}`;
                        }
                    }
                    
                    populateUserFields(userData);
                } else {
                    // Fallback para dados básicos do login com dados de exemplo
                    const userData = {
                        nome: loggedUser.name || 'João Silva',
                        email: loggedUser.email || 'joao@email.com',
                        celular: '(11) 99999-9999',
                        dataNasc: '1990-01-15',
                        cep: '01234-567',
                        logradouro: 'Rua das Flores, 123',
                        bairro: 'Centro',
                        cidade: 'São Paulo',
                        uf: 'SP',
                        isVendedor: loggedUser.type === 'seller'
                    };
                    
                    populateUserFields(userData);
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                // Fallback para dados básicos do login com dados de exemplo
                const userData = {
                    nome: loggedUser.name || 'João Silva',
                    email: loggedUser.email || 'joao@email.com',
                    celular: '(11) 99999-9999',
                    dataNasc: '1990-01-15',
                    cep: '01234-567',
                    logradouro: 'Rua das Flores, 123',
                    bairro: 'Centro',
                    cidade: 'São Paulo',
                    uf: 'SP',
                    isVendedor: loggedUser.type === 'seller'
                };
                
                populateUserFields(userData);
            }
        }
        
        function populateUserFields(userData) {
            console.log('Preenchendo campos com dados:', userData);
            
            // Preencher campos
            const nameInput = document.getElementById('profile-name-input');
            const emailInput = document.getElementById('profile-email-input');
            const celularInput = document.getElementById('profile-celular-input');
            const dataNascInput = document.getElementById('profile-dataNasc-input');
            const cepInput = document.getElementById('profile-cep-input');
            const logradouroInput = document.getElementById('profile-logradouro-input');
            const bairroInput = document.getElementById('profile-bairro-input');
            const cidadeInput = document.getElementById('profile-cidade-input');
            const ufInput = document.getElementById('profile-uf-input');
            
            if (nameInput) nameInput.value = userData.nome || '';
            if (emailInput) emailInput.value = userData.email || '';
            if (celularInput) celularInput.value = userData.celular || '';
            if (dataNascInput) dataNascInput.value = userData.dataNasc || '';
            if (cepInput) cepInput.value = userData.cep || '';
            if (logradouroInput) logradouroInput.value = userData.logradouro || '';
            if (bairroInput) bairroInput.value = userData.bairro || '';
            if (cidadeInput) cidadeInput.value = userData.cidade || '';
            if (ufInput) ufInput.value = userData.uf || '';
            
            // Atualizar exibição do endereço principal na aba endereços
            const mainAddressDisplay = document.getElementById('main-address-display');
            if (mainAddressDisplay && userData.logradouro) {
                mainAddressDisplay.innerHTML = `${userData.logradouro}, 123 - ${userData.bairro}<br>${userData.cidade}, ${userData.uf} - ${userData.cep}`;
            }
            
            // Atualizar sidebar
            const firstName = userData.nome ? userData.nome.split(' ')[0] : 'Usuário';
            const displayNameElement = document.getElementById('profile-display-name');
            if (displayNameElement) displayNameElement.textContent = firstName;
            
            // Não sobrescrever imagens se já existem no localStorage
            const currentUser = JSON.parse(localStorage.getItem('loggedUser'));
            if (!currentUser?.profileImage) {
                const userProfileImage = document.getElementById('user-profile-image');
                const headerProfileImage = document.getElementById('header-profile-image');
                
                if (userData.profileImage) {
                    if (userProfileImage) userProfileImage.src = userData.profileImage;
                    if (headerProfileImage) headerProfileImage.src = userData.profileImage;
                } else {
                    if (userProfileImage) userProfileImage.src = `https://placehold.co/80x80/cccccc/333333?text=${firstName.charAt(0)}`;
                    if (headerProfileImage) headerProfileImage.src = `https://placehold.co/32x32/cccccc/333333?text=${firstName.charAt(0)}`;
                }
            }
            
            // Controlar visibilidade do menu vendedor
            if (userData.isVendedor) {
                const sellerMenuItem = document.getElementById('seller-menu-item');
                const quickSellerBtn = document.getElementById('quick-seller-btn');
                const dashboardChart = document.getElementById('dashboard-chart');
                
                if (sellerMenuItem) sellerMenuItem.style.display = 'block';
                if (quickSellerBtn) quickSellerBtn.style.display = 'inline-block';
                if (dashboardChart) dashboardChart.style.display = 'block';
                initDashboardChart();
            }
            

        }
        
        function setupEditControls() {
            const editBtn = document.getElementById('edit-profile-btn');
            const saveBtn = document.getElementById('save-profile-btn');
            const cancelBtn = document.getElementById('cancel-edit-btn');
            const inputs = document.querySelectorAll('#personal-section input');
            let originalData = {};
            
            if (editBtn) {
                editBtn.addEventListener('click', function() {
                // Salvar dados originais
                inputs.forEach(input => {
                    originalData[input.id] = input.value;
                    input.readOnly = false;
                });
                
                // Trocar botões
                if (editBtn) editBtn.style.display = 'none';
                if (saveBtn) saveBtn.style.display = 'inline-block';
                if (cancelBtn) cancelBtn.style.display = 'inline-block';
                });
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                // Restaurar dados originais
                inputs.forEach(input => {
                    input.value = originalData[input.id];
                    input.readOnly = true;
                });
                
                // Trocar botões
                if (editBtn) editBtn.style.display = 'inline-block';
                if (saveBtn) saveBtn.style.display = 'none';
                if (cancelBtn) cancelBtn.style.display = 'none';
                });
            }
            
            if (saveBtn) {
                saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Aqui você faria a chamada para salvar os dados
                alert('Dados salvos com sucesso!');
                
                // Tornar campos readonly novamente
                inputs.forEach(input => {
                    input.readOnly = true;
                });
                
                // Trocar botões
                if (editBtn) editBtn.style.display = 'inline-block';
                if (saveBtn) saveBtn.style.display = 'none';
                if (cancelBtn) cancelBtn.style.display = 'none';
                
                // Atualizar sidebar
                const nameInput = document.getElementById('profile-name-input');
                const displayName = document.getElementById('profile-display-name');
                if (nameInput && displayName) {
                    const firstName = nameInput.value.split(' ')[0];
                    displayName.textContent = firstName;
                }
                });
            }
        }
        
        function checkSellerStatus() {
            // Verificar se usuário é vendedor e ocultar "Seja um Vendedor" do header
            const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
            
            if (loggedUser && (loggedUser.type === 'seller' || loggedUser.sellerId)) {
                // Ocultar "Seja um Vendedor" do menu principal se existir
                const sellerLinks = document.querySelectorAll('a[href="/cadastro"]');
                sellerLinks.forEach(link => {
                    if (link.textContent.includes('Seja um Vendedor')) {
                        link.style.display = 'none';
                    }
                });
            }
        }
        
        // Navegação entre seções
        const profileMenuLinks = document.querySelectorAll('.profile-menu a');
        if (profileMenuLinks.length > 0) {
            profileMenuLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links
                document.querySelectorAll('.profile-menu a').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Hide all sections
                document.querySelectorAll('.content-section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Show selected section
                const sectionId = this.dataset.section + '-section';
                const section = document.getElementById(sectionId);
                if (section) {
                    section.style.display = 'block';
                    
                    // Se for a seção do vendedor, inicializar gráfico
                    if (sectionId === 'seller-section') {
                        initSellerSection();
                    }
                    
                    // Se for a seção do admin, carregar dados
                    if (sectionId === 'admin-section') {
                        loadAdminData();
                    }
                    

                }
                });
            });
        }
        
        // Funções da Área do Vendedor
        let salesChart;
        let dashboardChart;
        
        const salesData = {
            7: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                data: [12, 19, 8, 15, 22, 18, 25],
                total: 119,
                revenue: 2975
            },
            30: {
                labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                data: [85, 120, 95, 140],
                total: 440,
                revenue: 11000
            },
            365: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                data: [450, 520, 380, 600, 720, 650, 800, 750, 680, 900, 850, 950],
                total: 8250,
                revenue: 206250
            }
        };
        
        function initSellerSection() {
            loadSellerMetrics();
            loadSellerProducts();
        }
        
        function requestWithdraw() {
            const amount = document.getElementById('withdraw-amount').textContent;
            document.getElementById('withdraw-modal-amount').textContent = amount;
            loadPaymentOptions();
            document.getElementById('withdraw-modal').style.display = 'flex';
        }
        
        function loadPaymentOptions() {
            const paymentOptionsDiv = document.getElementById('payment-options');
            let options = '';
            
            // Opção PIX
            const pixValue = document.getElementById('cards-pix').value;
            if (pixValue && pixValue.trim()) {
                options += `
                    <div class="payment-option" onclick="selectPaymentOption(this)">
                        <input type="radio" name="payment-method" value="pix">
                        <div class="payment-details">
                            <div class="payment-title">PIX</div>
                            <div class="payment-info">${pixValue}</div>
                        </div>
                    </div>
                `;
            }
            
            // Opções de Cartão
            const cardItems = document.querySelectorAll('#cards-list .card-item');
            cardItems.forEach((card, index) => {
                const cardNumber = card.querySelector('p').textContent;
                const cardType = card.querySelectorAll('p')[1].textContent;
                options += `
                    <div class="payment-option" onclick="selectPaymentOption(this)">
                        <input type="radio" name="payment-method" value="card-${index}">
                        <div class="payment-details">
                            <div class="payment-title">Cartão</div>
                            <div class="payment-info">${cardNumber}<br>${cardType}</div>
                        </div>
                    </div>
                `;
            });
            
            // Opção Boleto
            options += `
                <div class="payment-option" onclick="selectPaymentOption(this)">
                    <input type="radio" name="payment-method" value="boleto">
                    <div class="payment-details">
                        <div class="payment-title">Boleto Bancário</div>
                        <div class="payment-info">Receba por boleto bancário</div>
                    </div>
                </div>
            `;
            
            paymentOptionsDiv.innerHTML = options;
        }
        
        function selectPaymentOption(element) {
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
            element.classList.add('selected');
            element.querySelector('input[type="radio"]').checked = true;
        }
        
        function closeWithdrawModal() {
            document.getElementById('withdraw-modal').style.display = 'none';
        }
        
        function confirmWithdraw() {
            const selectedPayment = document.querySelector('input[name="payment-method"]:checked');
            if (!selectedPayment) {
                showConfirmationModal(
                    'Selecione um método',
                    'Por favor, selecione uma forma de recebimento.',
                    function() {}
                );
                return;
            }
            
            const amount = document.getElementById('withdraw-modal-amount').textContent;
            const paymentMethod = selectedPayment.value;
            let methodText = '';
            
            if (paymentMethod === 'pix') {
                methodText = 'PIX';
            } else if (paymentMethod.startsWith('card-')) {
                methodText = 'Cartão';
            } else if (paymentMethod === 'boleto') {
                methodText = 'Boleto Bancário';
            }
            
            closeWithdrawModal();
            showConfirmationModal(
                'Saque solicitado',
                `Saque de ${amount} via ${methodText} solicitado com sucesso! Você receberá uma confirmação por email.`,
                function() {
                    document.getElementById('withdraw-amount').textContent = 'R$ 0,00';
                }
            );
        }
        
        async function loadSellerMetrics() {
            try {
                const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
                if (!loggedUser || (!loggedUser.sellerId && !loggedUser.id)) {
                    return;
                }
                

                document.getElementById('dashboard-chart-total-sales').textContent = salesData[7].total;
                document.getElementById('dashboard-chart-revenue').textContent = 'R$ ' + salesData[7].revenue.toLocaleString('pt-BR') + ',00';
                document.getElementById('dashboard-products-count').textContent = '15';
                
                // Atualizar área do vendedor
                document.getElementById('seller-withdrawn-amount').textContent = 'R$ 1.200,00';
                
                // Atualizar área de saque
                document.getElementById('withdraw-amount').textContent = 'R$ 2.450,00';
            } catch (error) {
                console.error('Erro ao carregar métricas:', error);
            }
        }
        
        async function loadSellerProducts() {
            try {
                const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
                if (!loggedUser || (!loggedUser.sellerId && !loggedUser.id)) {
                    document.getElementById('seller-products-grid').innerHTML = '<p>Faça login como vendedor para ver seus produtos.</p>';
                    return;
                }
                
                const sellerId = loggedUser.sellerId || loggedUser.id;
                const response = await fetch(`/api/products?seller_id=${sellerId}`);
                const result = await response.json();
                
                if (result.success && result.products.length > 0) {
                    const grid = document.getElementById('seller-products-grid');
                    grid.innerHTML = result.products.map(product => {
                        const imageUrl = product.IMAGEM_BASE64 
                            ? `data:image/jpeg;base64,${product.IMAGEM_BASE64}`
                            : product.IMAGEM_URL || 'imagens/produto-default.jpg';
                        
                        const price = parseFloat(product.VALOR_UNITARIO).toFixed(2).replace('.', ',');
                        
                        return `
                            <div class="product-card">
                                <img src="${imageUrl}" alt="${product.NOME_PROD}" class="product-image">
                                <div class="product-info">
                                    <div class="product-name">${product.NOME_PROD}</div>
                                    <div class="product-price">R$ ${price}</div>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    document.getElementById('seller-products-grid').innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #666;">
                            <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 16px; color: #ddd;"></i>
                            <p>Você ainda não tem produtos cadastrados.</p>
                            <p style="font-size: 14px;">Clique em "Cadastrar Novo Produto" para começar.</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
                document.getElementById('seller-products-grid').innerHTML = '<p>Erro ao carregar produtos.</p>';
            }
        }
        
        function showSellerSection() {
            document.querySelectorAll('.profile-menu a').forEach(l => l.classList.remove('active'));
            document.getElementById('seller-menu-item').classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            
            document.getElementById('seller-section').style.display = 'block';
            initSellerSection();
        }
        
        function addCard() {
            const cardNumber = prompt('Digite o número do cartão (últimos 4 dígitos):');
            const cardType = prompt('Digite a bandeira (Visa/Mastercard):');
            const cardExpiry = prompt('Digite a validade (MM/AA):');
            
            if (cardNumber && cardType && cardExpiry) {
                const cardsList = document.getElementById('cards-list');
                const color = cardType.toLowerCase() === 'visa' ? '#3483fa' : '#ff6b35';
                
                const newCard = document.createElement('div');
                newCard.className = 'card-item';
                newCard.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px;';
                newCard.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-credit-card" style="font-size: 24px; color: ${color};"></i>
                        <div>
                            <p style="margin: 0; font-weight: 600;">**** **** **** ${cardNumber}</p>
                            <p style="margin: 0; font-size: 14px; color: #666;">${cardType} - Válido até ${cardExpiry}</p>
                        </div>
                    </div>
                    <button class="btn btn-secondary" onclick="removeCard(this)" style="background: #dc3545; color: white;"><i class="fas fa-trash"></i></button>
                `;
                cardsList.appendChild(newCard);
                alert('Cartão adicionado com sucesso!');
            }
        }
        
        function removeCard(button) {
            if (confirm('Deseja remover este cartão?')) {
                button.closest('.card-item').remove();
                alert('Cartão removido com sucesso!');
            }
        }
        
        function addPix() {
            const pixKey = prompt('Digite sua chave PIX (email, telefone, CPF ou chave aleatória):');
            
            if (pixKey && pixKey.trim()) {
                document.getElementById('cards-pix').value = pixKey.trim();
                document.getElementById('pix-container').style.display = 'block';
                document.getElementById('no-pix-message').style.display = 'none';
                document.getElementById('add-pix-btn').style.display = 'none';
                document.getElementById('edit-pix-btn').style.display = 'inline-block';
                document.getElementById('remove-pix-btn').style.display = 'inline-block';
                alert('Chave PIX adicionada com sucesso!');
            }
        }
        
        function editPix() {
            const currentPix = document.getElementById('cards-pix').value;
            const newPix = prompt('Digite a nova chave PIX:', currentPix);
            
            if (newPix && newPix.trim() && newPix !== currentPix) {
                document.getElementById('cards-pix').value = newPix.trim();
                alert('Chave PIX atualizada com sucesso!');
            }
        }
        
        function removePix() {
            if (confirm('Deseja remover sua chave PIX?\n\nVocê não poderá receber pagamentos via PIX.')) {
                document.getElementById('cards-pix').value = '';
                document.getElementById('pix-container').style.display = 'none';
                document.getElementById('no-pix-message').style.display = 'block';
                document.getElementById('add-pix-btn').style.display = 'inline-block';
                document.getElementById('edit-pix-btn').style.display = 'none';
                document.getElementById('remove-pix-btn').style.display = 'none';
                alert('Chave PIX removida com sucesso!');
            }
        }
        
        function addAddress() {
            document.getElementById('add-address-form').style.display = 'block';
            document.querySelector('#add-address-form h3').textContent = 'Adicionar novo endereço';
            document.querySelector('#add-address-form .btn-success').textContent = 'Salvar endereço';
            document.getElementById('add-address-form').removeAttribute('data-editing');
        }
        
        function editAddress(button) {
            const addressItem = button.closest('.address-item');
            const nameElement = addressItem.querySelector('h4');
            const addressElement = addressItem.querySelector('p');
            const isMain = addressItem.getAttribute('data-main') === 'true';
            
            // Extrair dados do endereço
            const name = nameElement.textContent.trim();
            const addressText = addressElement.innerHTML;
            
            // Parse do endereço (formato: "Rua, 123 - Bairro<br>Cidade, UF - CEP")
            const parts = addressText.split('<br>');
            const firstLine = parts[0]; // "Rua, 123 - Bairro"
            const secondLine = parts[1]; // "Cidade, UF - CEP"
            
            const [logradouroNumero, bairro] = firstLine.split(' - ');
            const [logradouro, numero] = logradouroNumero.split(', ');
            const [cidadeUf, cep] = secondLine.split(' - ');
            const [cidade, uf] = cidadeUf.split(', ');
            
            // Preencher formulário
            document.getElementById('new-address-name').value = name;
            document.getElementById('new-address-cep').value = cep;
            document.getElementById('new-address-logradouro').value = logradouro;
            document.getElementById('new-address-numero').value = numero;
            document.getElementById('new-address-bairro').value = bairro;
            document.getElementById('new-address-cidade').value = cidade;
            document.getElementById('new-address-uf').value = uf;
            document.getElementById('set-as-main').checked = isMain;
            
            // Configurar formulário para edição
            document.querySelector('#add-address-form h3').textContent = 'Editar endereço';
            document.querySelector('#add-address-form .btn-success').textContent = 'Salvar alterações';
            document.getElementById('add-address-form').setAttribute('data-editing', addressItem.dataset.index || '');
            document.getElementById('add-address-form').style.display = 'block';
        }
        
        function saveNewAddress() {
            const addressName = document.getElementById('new-address-name').value;
            const cep = document.getElementById('new-address-cep').value;
            const logradouro = document.getElementById('new-address-logradouro').value;
            const numero = document.getElementById('new-address-numero').value;
            const bairro = document.getElementById('new-address-bairro').value;
            const cidade = document.getElementById('new-address-cidade').value;
            const uf = document.getElementById('new-address-uf').value;
            const setAsMain = document.getElementById('set-as-main').checked;
            const isEditing = document.getElementById('add-address-form').hasAttribute('data-editing');
            
            if (addressName && cep && logradouro && numero && bairro && cidade && uf) {
                const addressesList = document.getElementById('addresses-list');
                
                // Se estiver editando, remover o endereço atual
                if (isEditing) {
                    const existingAddresses = addressesList.querySelectorAll('.address-item');
                    const editingName = document.getElementById('new-address-name').defaultValue || addressName;
                    existingAddresses.forEach(addr => {
                        const nameEl = addr.querySelector('h4');
                        if (nameEl && nameEl.textContent.trim() === editingName) {
                            addr.remove();
                        }
                    });
                } else {
                    // Verificar se CEP já existe (apenas para novos endereços)
                    const existingAddresses = addressesList.querySelectorAll('.address-item');
                    const cleanCep = cep.replace(/\D/g, '');
                    
                    for (let address of existingAddresses) {
                        const addressText = address.textContent;
                        const existingCep = addressText.match(/\d{5}-?\d{3}/);
                        if (existingCep && existingCep[0].replace(/\D/g, '') === cleanCep) {
                            showConfirmationModal(
                                'CEP duplicado',
                                'Já existe um endereço cadastrado com este CEP.',
                                function() {}
                            );
                            return;
                        }
                    }
                }
                
                // Se definir como principal, remover badge principal de outros endereços
                if (setAsMain) {
                    const allAddresses = addressesList.querySelectorAll('.address-item');
                    allAddresses.forEach(address => {
                        if (address.getAttribute('data-main') === 'true') {
                            address.removeAttribute('data-main');
                            address.style.borderLeft = 'none';
                            const badge = address.querySelector('.principal-badge');
                            if (badge) badge.remove();
                            
                            // Adicionar botão "Definir como principal"
                            const actionsDiv = address.querySelector('.address-actions');
                            if (actionsDiv && !actionsDiv.querySelector('.set-main-btn')) {
                                const setMainBtn = document.createElement('button');
                                setMainBtn.className = 'btn btn-secondary set-main-btn';
                                setMainBtn.style.cssText = 'background: #ffc107; color: #000; margin-right: 10px;';
                                setMainBtn.innerHTML = '<i class="fas fa-star"></i>';
                                setMainBtn.onclick = function() { setAsMainAddress(this); };
                                actionsDiv.insertBefore(setMainBtn, actionsDiv.firstChild);
                            }
                        }
                    });
                }
                
                const newAddress = document.createElement('div');
                newAddress.className = 'address-item';
                if (setAsMain) {
                    newAddress.setAttribute('data-main', 'true');
                    newAddress.style.cssText = 'padding: 20px; background: white; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #3483fa;';
                } else {
                    newAddress.style.cssText = 'padding: 20px; background: white; border-radius: 6px; margin-bottom: 15px;';
                }
                
                const principalBadge = setAsMain ? '<span class="principal-badge" style="background: #3483fa; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 10px;">Principal</span>' : '';
                const setMainButton = setAsMain ? '' : '<button class="btn btn-secondary set-main-btn" onclick="setAsMainAddress(this)" style="background: #ffc107; color: #000; margin-right: 10px;"><i class="fas fa-star"></i></button>';
                
                newAddress.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                ${principalBadge}
                                <h4 style="margin: 0; color: #333;">${addressName}</h4>
                            </div>
                            <p style="margin: 5px 0; color: #666;">${logradouro}, ${numero} - ${bairro}<br>${cidade}, ${uf} - ${cep}</p>
                        </div>
                        <div class="address-actions">
                            <button class="btn btn-secondary" onclick="editAddress(this)" style="background: #6c757d; color: white; margin-right: 10px;"><i class="fas fa-edit"></i></button>
                            ${setMainButton}
                            <button class="btn btn-secondary" onclick="removeAddress(this)" style="background: #dc3545; color: white;"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                addressesList.appendChild(newAddress);
                saveAddressesToStorage();
                
                // Limpar formulário e ocultar
                document.getElementById('new-address-name').value = '';
                document.getElementById('new-address-cep').value = '';
                document.getElementById('new-address-logradouro').value = '';
                document.getElementById('new-address-numero').value = '';
                document.getElementById('new-address-bairro').value = '';
                document.getElementById('new-address-cidade').value = '';
                document.getElementById('new-address-uf').value = '';
                document.getElementById('set-as-main').checked = false;
                document.getElementById('cep-status').textContent = '';
                document.getElementById('add-address-form').style.display = 'none';
            } else {
                showConfirmationModal(
                    'Campos obrigatórios',
                    'Por favor, preencha todos os campos.',
                    function() {}
                );
            }
        }
        
        function cancelAddAddress() {
            // Limpar formulário e ocultar
            document.getElementById('new-address-name').value = '';
            document.getElementById('new-address-cep').value = '';
            document.getElementById('new-address-logradouro').value = '';
            document.getElementById('new-address-numero').value = '';
            document.getElementById('new-address-bairro').value = '';
            document.getElementById('new-address-cidade').value = '';
            document.getElementById('new-address-uf').value = '';
            document.getElementById('set-as-main').checked = false;
            document.getElementById('cep-status').textContent = '';
            document.getElementById('add-address-form').style.display = 'none';
        }
        
        async function searchCep() {
            const cep = document.getElementById('new-address-cep').value.replace(/\D/g, '');
            const statusElement = document.getElementById('cep-status');
            
            if (cep.length !== 8) {
                statusElement.textContent = 'CEP deve ter 8 dígitos';
                statusElement.style.color = '#dc3545';
                return;
            }
            
            statusElement.textContent = 'Buscando CEP...';
            statusElement.style.color = '#666';
            
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (data.erro) {
                    statusElement.textContent = 'CEP não encontrado';
                    statusElement.style.color = '#dc3545';
                    return;
                }
                
                // Preencher campos automaticamente
                document.getElementById('new-address-logradouro').value = data.logradouro || '';
                document.getElementById('new-address-bairro').value = data.bairro || '';
                document.getElementById('new-address-cidade').value = data.localidade || '';
                document.getElementById('new-address-uf').value = data.uf || '';
                
                statusElement.textContent = 'CEP válido \u2713';
                statusElement.style.color = '#00a650';
                
                // Formatar CEP no campo
                document.getElementById('new-address-cep').value = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
                
            } catch (error) {
                statusElement.textContent = 'Erro ao buscar CEP';
                statusElement.style.color = '#dc3545';
            }
        }
        
        function showConfirmationModal(title, message, onConfirm) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-message').textContent = message;
            document.getElementById('confirmation-modal').style.display = 'flex';
            
            const confirmBtn = document.getElementById('modal-confirm-btn');
            confirmBtn.onclick = function() {
                onConfirm();
                closeConfirmationModal();
            };
        }
        
        function closeConfirmationModal() {
            document.getElementById('confirmation-modal').style.display = 'none';
        }
        
        // Fechar modal ao clicar fora
        const confirmationModal = document.getElementById('confirmation-modal');
        if (confirmationModal) {
            confirmationModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeConfirmationModal();
                }
            });
        }
        
        const withdrawModal = document.getElementById('withdraw-modal');
        if (withdrawModal) {
            withdrawModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeWithdrawModal();
                }
            });
        }
        
        function removeAddress(button) {
            const addressItem = button.closest('.address-item');
            const isPrincipal = addressItem.getAttribute('data-main') === 'true';
            
            if (isPrincipal) {
                showConfirmationModal(
                    'Não é possível remover',
                    'O endereço principal não pode ser removido. Defina outro endereço como principal primeiro.',
                    function() {}
                );
                return;
            }
            
            showConfirmationModal(
                'Remover endereço',
                'Tem certeza que deseja remover este endereço?',
                function() {
                    addressItem.remove();
                    saveAddressesToStorage();
                }
            );
        }
        
        function setAsMainAddress(button) {
            showConfirmationModal(
                'Definir como principal',
                'Definir este endereço como principal?',
                function() {
                    const addressesList = document.getElementById('addresses-list');
                    const newMainAddress = button.closest('.address-item');
                    
                    // Remover principal de todos os endereços
                    const allAddresses = addressesList.querySelectorAll('.address-item');
                    allAddresses.forEach(address => {
                        if (address.getAttribute('data-main') === 'true') {
                            address.removeAttribute('data-main');
                            address.style.borderLeft = 'none';
                            const badge = address.querySelector('.principal-badge');
                            if (badge) badge.remove();
                            
                            // Adicionar botão "Definir como principal" no antigo principal
                            const actionsDiv = address.querySelector('.address-actions');
                            if (actionsDiv && !actionsDiv.querySelector('.set-main-btn')) {
                                const setMainBtn = document.createElement('button');
                                setMainBtn.className = 'btn btn-secondary set-main-btn';
                                setMainBtn.style.cssText = 'background: #ffc107; color: #000; margin-right: 10px;';
                                setMainBtn.innerHTML = '<i class="fas fa-star"></i>';
                                setMainBtn.onclick = function() { setAsMainAddress(this); };
                                actionsDiv.insertBefore(setMainBtn, actionsDiv.firstChild);
                            }
                        }
                    });
                    
                    // Definir novo principal
                    newMainAddress.setAttribute('data-main', 'true');
                    newMainAddress.style.borderLeft = '4px solid #3483fa';
                    
                    // Adicionar badge principal
                    const titleDiv = newMainAddress.querySelector('h4').parentElement;
                    const badge = document.createElement('span');
                    badge.className = 'principal-badge';
                    badge.style.cssText = 'background: #3483fa; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 10px;';
                    badge.textContent = 'Principal';
                    titleDiv.insertBefore(badge, titleDiv.firstChild);
                    
                    // Remover botão "Definir como principal"
                    button.remove();
                    
                    saveAddressesToStorage();
                }
            );
        }
        
        function confirmDeleteAccount() {
            if (confirm('Tem certeza que deseja excluir sua conta?\n\nEsta ação é irreversível e todos os seus dados serão perdidos.')) {
                if (confirm('Digite "EXCLUIR" para confirmar:') === 'EXCLUIR') {
                    alert('Conta excluída com sucesso!');
                    localStorage.removeItem('loggedUser');
                    window.location.href = '/';
                } else {
                    alert('Exclusão cancelada.');
                }
            }
        }
        
        function initDashboardChart() {
            if (!dashboardChart) {
                const ctx = document.getElementById('dashboardSalesChart').getContext('2d');
                dashboardChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: salesData[7].labels,
                        datasets: [{
                            label: 'Vendas',
                            data: salesData[7].data,
                            borderColor: '#3483fa',
                            backgroundColor: 'rgba(52, 131, 250, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });
                
                // Configurar controles do gráfico do dashboard
                const chartButtons = document.querySelectorAll('#dashboard-chart .chart-btn');
                if (chartButtons.length > 0) {
                    chartButtons.forEach(btn => {
                        btn.addEventListener('click', function() {
                        document.querySelectorAll('#dashboard-chart .chart-btn').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        const period = parseInt(this.dataset.period);
                        const data = salesData[period];
                        dashboardChart.data.labels = data.labels;
                        dashboardChart.data.datasets[0].data = data.data;
                        dashboardChart.update();
                        
                        // Atualizar total de vendas e faturamento no grid
                        const totalSalesElement = document.getElementById('dashboard-chart-total-sales');
                        const revenueElement = document.getElementById('dashboard-chart-revenue');
                        if (totalSalesElement) totalSalesElement.textContent = data.total;
                        if (revenueElement) revenueElement.textContent = 'R$ ' + data.revenue.toLocaleString('pt-BR') + ',00';
                        });
                    });
                }
            }
        }
        
        // Função para carregar dados do admin (dashboard principal)
        async function loadAdminData() {
            try {
                // Carregar estatísticas básicas
                const response = await fetch('/api/admin/users');
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('admin-total-users').textContent = result.totalUsers;
                    document.getElementById('admin-total-sellers').textContent = result.sellers.length;
                    
                    // Atualizar tabela de compradores (primeiros 5)
                    const buyersTable = document.getElementById('buyers-table');
                    if (result.buyers.length > 0) {
                        buyersTable.innerHTML = result.buyers.slice(0, 5).map(buyer => `
                            <tr style="border-bottom: 1px solid #f0f0f0;">
                                <td style="padding: 12px;">${buyer.ID_USUARIO}</td>
                                <td style="padding: 12px; font-weight: 500;">${buyer.NOME_USUARIO}</td>
                                <td style="padding: 12px; color: #666;">${buyer.EMAIL_USUARIO}</td>
                                <td style="padding: 12px; color: #666;">${buyer.CELULAR_USUARIO || 'N/A'}</td>
                                <td style="padding: 12px;">
                                    <button class="btn btn-info" style="background: #3498db; color: white; padding: 4px 8px; font-size: 12px;">Ver</button>
                                </td>
                            </tr>
                        `).join('');
                    } else {
                        buyersTable.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #666;">Nenhum comprador encontrado</td></tr>';
                    }
                    
                    // Atualizar tabela de vendedores (primeiros 5)
                    const sellersTable = document.getElementById('sellers-table');
                    if (result.sellers.length > 0) {
                        sellersTable.innerHTML = result.sellers.slice(0, 5).map(seller => `
                            <tr style="border-bottom: 1px solid #f0f0f0;">
                                <td style="padding: 12px;">${seller.ID_USUARIO}</td>
                                <td style="padding: 12px; font-weight: 500;">${seller.NOME_USUARIO}</td>
                                <td style="padding: 12px; color: #666;">${seller.EMAIL_USUARIO}</td>
                                <td style="padding: 12px; color: #666;">${seller.DIGITO_PESSOA || 'N/A'}</td>
                                <td style="padding: 12px;">
                                    <button class="btn btn-info" style="background: #3498db; color: white; padding: 4px 8px; font-size: 12px;">Ver</button>
                                </td>
                            </tr>
                        `).join('');
                    } else {
                        sellersTable.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #666;">Nenhum vendedor encontrado</td></tr>';
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados do admin:', error);
            }
        }
        

        
        // Função para carregar dados da seção de gerenciar contas
        async function loadAccountsData() {
            try {
                const response = await fetch('/api/admin/users');
                const result = await response.json();
                
                if (result.success) {
                    // Atualizar estatísticas
                    document.getElementById('accounts-total-buyers').textContent = result.buyers.length;
                    document.getElementById('accounts-total-sellers').textContent = result.sellers.length;
                    document.getElementById('accounts-total-users').textContent = result.totalUsers;
                    
                    // Atualizar tabela completa de compradores
                    const buyersTable = document.getElementById('accounts-buyers-table');
                    if (result.buyers.length > 0) {
                        buyersTable.innerHTML = result.buyers.map(buyer => `
                            <tr style="border-bottom: 1px solid #f0f0f0;">
                                <td style="padding: 12px; font-weight: 500;">${buyer.ID_USUARIO}</td>
                                <td style="padding: 12px; font-weight: 500;">${buyer.NOME_USUARIO}</td>
                                <td style="padding: 12px; color: #666;">${buyer.EMAIL_USUARIO}</td>
                                <td style="padding: 12px; color: #666;">${buyer.CELULAR_USUARIO || 'N/A'}</td>
                                <td style="padding: 12px; color: #666;">${buyer.CPF_CLIENTE || 'N/A'}</td>
                            </tr>
                        `).join('');
                    } else {
                        buyersTable.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #666;">Nenhum comprador encontrado</td></tr>';
                    }
                    
                    // Atualizar tabela completa de vendedores
                    const sellersTable = document.getElementById('accounts-sellers-table');
                    if (result.sellers.length > 0) {
                        sellersTable.innerHTML = result.sellers.map(seller => `
                            <tr style="border-bottom: 1px solid #f0f0f0;">
                                <td style="padding: 12px; font-weight: 500;">${seller.ID_USUARIO}</td>
                                <td style="padding: 12px; font-weight: 500;">${seller.NOME_USUARIO}</td>
                                <td style="padding: 12px; color: #666;">${seller.EMAIL_USUARIO}</td>
                                <td style="padding: 12px; color: #666;">${seller.CELULAR_USUARIO || 'N/A'}</td>
                                <td style="padding: 12px; color: #666;">${seller.DIGITO_PESSOA || 'N/A'}</td>
                                <td style="padding: 12px; color: #666;">${seller.NOME_LOJA || 'N/A'}</td>
                            </tr>
                        `).join('');
                    } else {
                        sellersTable.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #666;">Nenhum vendedor encontrado</td></tr>';
                    }
                } else {
                    console.error('Erro ao carregar dados:', result.message);
                }
            } catch (error) {
                console.error('Erro ao carregar dados das contas:', error);
                document.getElementById('accounts-buyers-table').innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #e74c3c;">Erro ao carregar compradores</td></tr>';
                document.getElementById('accounts-sellers-table').innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #e74c3c;">Erro ao carregar vendedores</td></tr>';
            }
        }