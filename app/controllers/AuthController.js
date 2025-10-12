const User = require('../models/User');

class AuthController {
    constructor(pool) {
        this.userModel = new User(pool);
    }

    async register(req, res) {
        try {
            const {
                NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
                LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO,
                TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA, CPF_CLIENTE
            } = req.body;

            if (!NOME_USUARIO || !EMAIL_USUARIO || !SENHA_USUARIO) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Nome, email e senha são obrigatórios." 
                });
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Formato de email inválido." 
                });
            }

            const result = await this.userModel.create({
                NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
                LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO,
                TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA, CPF_CLIENTE
            });

            res.status(201).json({ 
                success: true, 
                message: "Usuário cadastrado com sucesso!" 
            });

        } catch (error) {
            console.error('Erro no cadastro:', error);
            if (error.message.includes('CEP')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ 
                    success: false, 
                    message: "Este email ou dígito de pessoa já está cadastrado." 
                });
            }
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor: " + error.message 
            });
        }
    }

    async login(req, res) {
        try {
            const { EMAIL_USUARIO, SENHA_USUARIO } = req.body;

            if (!EMAIL_USUARIO || !SENHA_USUARIO) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Email e senha são obrigatórios." 
                });
            }

            const user = await this.userModel.findByEmail(EMAIL_USUARIO);
            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Credenciais inválidas." 
                });
            }

            const passwordMatch = await this.userModel.validatePassword(SENHA_USUARIO, user.SENHA_USUARIO);
            if (!passwordMatch) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Credenciais inválidas." 
                });
            }

            let sellerInfo = {};
            if (user.TIPO_USUARIO === 'V') {
                // Buscar informações do vendedor se necessário
                sellerInfo = {
                    sellerId: user.ID_USUARIO,
                    storeName: 'Loja Padrão',
                    storeProfileImage: null
                };
            }

            const tipoUsuarioFrontend = user.TIPO_USUARIO;
            
            res.status(200).json({
                success: true,
                message: "Login bem-sucedido!",
                user: {
                    id: user.ID_USUARIO,
                    name: user.NOME_USUARIO,
                    email: user.EMAIL_USUARIO,
                    type: tipoUsuarioFrontend,
                    ...sellerInfo
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor." 
            });
        }
    }

    async resetPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Email é obrigatório." 
                });
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Formato de email inválido." 
                });
            }

            // Por segurança, sempre retorna sucesso mesmo se o email não existir
            res.status(200).json({
                success: true,
                message: "Se este e-mail estiver cadastrado, você receberá instruções para redefinir sua senha."
            });

        } catch (error) {
            console.error('Erro ao processar redefinição de senha:', error);
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor." 
            });
        }
    }

    async getUserById(req, res) {
        try {
            const userId = req.params.id;
            
            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "ID do usuário é obrigatório." 
                });
            }
            
            const user = await this.userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Usuário não encontrado." 
                });
            }
            
            // Manter tipo do banco (C, V, A)
            // user.TIPO_USUARIO já está no formato correto
            
            res.status(200).json({
                success: true,
                user: user
            });
            
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor." 
            });
        }
    }

    async updateUser(req, res) {
        try {
            const {
                id_usuario, NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO,
                LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                CEP_USUARIO, DT_NASC_USUARIO, IMAGEM_PERFIL_BASE64,
                NOVA_SENHA_USUARIO, CONFIRM_SENHA_USUARIO
            } = req.body;

            if (!id_usuario) {
                return res.status(400).json({ 
                    success: false, 
                    message: "ID do usuário é obrigatório." 
                });
            }

            if (NOVA_SENHA_USUARIO) {
                if (NOVA_SENHA_USUARIO !== CONFIRM_SENHA_USUARIO) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "As senhas não coincidem." 
                    });
                }
                if (NOVA_SENHA_USUARIO.length < 6) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "A senha deve ter no mínimo 6 caracteres." 
                    });
                }
            }

            const updated = await this.userModel.update(id_usuario, {
                NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO,
                LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                CEP_USUARIO, DT_NASC_USUARIO, IMAGEM_PERFIL_BASE64,
                NOVA_SENHA_USUARIO
            });

            if (updated) {
                res.status(200).json({ 
                    success: true, 
                    message: "Dados atualizados com sucesso!" 
                });
            } else {
                res.status(404).json({ 
                    success: false, 
                    message: "Usuário não encontrado." 
                });
            }

        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            if (error.message.includes('CEP')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ 
                    success: false, 
                    message: "Este email já está em uso." 
                });
            }
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor." 
            });
        }
    }

    async buscarUsuario(req, res) {
        const userId = req.query.id_usuario;
        if (!userId) {
            return res.status(400).json({ success: false, message: "ID do usuário não fornecido." });
        }
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "Usuário não encontrado." });
            }
            if (user.TIPO_USUARIO === 'V') {
                // Buscar dados da loja se for vendedor
                // Implementar se necessário
            }
            res.status(200).json({ success: true, message: "Dados do usuário encontrados.", user: user });
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    }

    async getSellerProfile(req, res) {
        // Implementar busca de perfil do vendedor
        res.json({ success: true, message: "Método a implementar" });
    }

    async updateSellerProfile(req, res) {
        // Implementar atualização de perfil do vendedor
        res.json({ success: true, message: "Método a implementar" });
    }

    async checkUsers(req, res) {
        try {
            const users = await this.userModel.getAll();
            res.json({ success: true, users });
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        }
    }
}

module.exports = AuthController;