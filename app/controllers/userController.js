// controllers/userController.js
const bcrypt = require('bcryptjs');

class UserController {
    constructor(userModel) {
        this.userModel = userModel;
    }

    async register(req, res) {
        const {
            NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
            LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
            CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO
        } = req.body;

        // Validações (mantenha as suas)
        if (!NOME_USUARIO || !EMAIL_USUARIO || !SENHA_USUARIO) {
            return res.status(400).json({ success: false, message: "Nome, email e senha são obrigatórios." });
        }

        try {
            // Verifica se email existe
            const emailExists = await this.userModel.emailExists(EMAIL_USUARIO);
            if (emailExists) {
                return res.status(409).json({ success: false, message: "Este email já está cadastrado." });
            }

            // Criptografa senha
            const hashedPassword = await bcrypt.hash(SENHA_USUARIO, 12);

            // Prepara dados
            const userData = {
                NOME_USUARIO,
                EMAIL_USUARIO,
                SENHA_USUARIO: hashedPassword,
                CELULAR_USUARIO: CELULAR_USUARIO || null,
                LOGRADOURO_USUARIO: LOGRADOURO_USUARIO || null,
                BAIRRO_USUARIO: BAIRRO_USUARIO || null,
                CIDADE_USUARIO: CIDADE_USUARIO || null,
                UF_USUARIO: UF_USUARIO || null,
                CEP_USUARIO: CEP_USUARIO || null,
                DT_NASC_USUARIO: DT_NASC_USUARIO || null,
                TIPO_USUARIO: TIPO_USUARIO || 'cliente',
                DATA_CADASTRO: new Date()
            };

            const result = await this.userModel.create(userData);

            res.status(201).json({
                success: true,
                message: "Usuário cadastrado com sucesso!",
                userId: result.insertId
            });

        } catch (error) {
            console.error('Erro no cadastro de usuário:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    }

    async login(req, res) {
        const { EMAIL_USUARIO, SENHA_USUARIO } = req.body;

        try {
            const user = await this.userModel.findByEmail(EMAIL_USUARIO);
            
            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Credenciais inválidas." 
                });
            }

            const passwordMatch = await bcrypt.compare(SENHA_USUARIO, user.SENHA_USUARIO);
            
            if (passwordMatch) {
                const { SENHA_USUARIO, ...userWithoutPassword } = user;
                res.json({
                    success: true,
                    message: "Login bem-sucedido!",
                    user: userWithoutPassword
                });
            } else {
                res.status(401).json({ 
                    success: false, 
                    message: "Credenciais inválidas." 
                });
            }
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor." 
            });
        }
    }

    async getProfile(req, res) {
        const userId = req.query.id_usuario;

        try {
            const user = await this.userModel.findById(userId);
            
            if (user) {
                res.json({ success: true, message: "Dados do usuário encontrados.", user });
            } else {
                res.status(404).json({ success: false, message: "Usuário não encontrado." });
            }
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    }

    async updateProfile(req, res) {
        // Sua lógica de atualização aqui (já existe no seu código)
    }
}

module.exports = UserController;