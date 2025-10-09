const bcrypt = require('bcryptjs');

class UserController {
    constructor(userModel) {
        this.userModel = userModel;
    }

    async register(req, res) {
        console.log('=== INICIANDO CADASTRO ===');
        console.log('Dados recebidos:', req.body);

        const {
            NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
            LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
            CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO
        } = req.body;

        // Validações básicas
        if (!NOME_USUARIO || !EMAIL_USUARIO || !SENHA_USUARIO) {
            console.log('Campos obrigatórios faltando');
            return res.status(400).json({ 
                success: false, 
                message: "Nome, email e senha são obrigatórios." 
            });
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
            console.log('Email inválido:', EMAIL_USUARIO);
            return res.status(400).json({ 
                success: false, 
                message: "Formato de email inválido." 
            });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(SENHA_USUARIO)) {
            console.log('Senha não atende aos requisitos');
            return res.status(400).json({ 
                success: false, 
                message: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais." 
            });
        }

        try {
            console.log('Verificando se email existe:', EMAIL_USUARIO);
            const emailExists = await this.userModel.emailExists(EMAIL_USUARIO);
            if (emailExists) {
                console.log('Email já cadastrado:', EMAIL_USUARIO);
                return res.status(409).json({ 
                    success: false, 
                    message: "Este email já está cadastrado." 
                });
            }

            const hashedPassword = await bcrypt.hash(SENHA_USUARIO, 12);

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
                TIPO_USUARIO: TIPO_USUARIO || 'cliente'
            };

            console.log('Dados do usuário preparados:', { 
                ...userData, 
                SENHA_USUARIO: '***criptografada***' 
            });

            const result = await this.userModel.create(userData);
            console.log('Resultado do model.create:', result);

            res.status(201).json({
                success: true,
                message: "Usuário cadastrado com sucesso!",
                userId: result.insertId
            });

        } catch (error) {
            console.error('=== ERRO NO CADASTRO ===');
            console.error('Tipo do erro:', error.constructor.name);
            console.error('Mensagem do erro:', error.message);
            console.error('Código do erro:', error.code);
            console.error('SQL Message:', error.sqlMessage);
            console.error('Stack trace:', error.stack);
            
            // Erros específicos do MySQL
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ 
                    success: false, 
                    message: "Este email já está cadastrado." 
                });
            }
            
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                return res.status(500).json({ 
                    success: false, 
                    message: `Erro no banco de dados: Coluna não encontrada. Detalhes: ${error.sqlMessage}` 
                });
            }

            if (error.code === 'ER_NO_SUCH_TABLE') {
                return res.status(500).json({ 
                    success: false, 
                    message: "Erro no banco de dados: Tabela não encontrada." 
                });
            }
            
            // Erro genérico
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor.",
                ...(process.env.NODE_ENV === 'development' && {
                    debug: {
                        error: error.message,
                        code: error.code,
                        sqlMessage: error.sqlMessage
                    }
                })
            });
        }
    }

    async login(req, res) {
        console.log('=== INICIANDO LOGIN ===');
        console.log('Dados recebidos:', { 
            EMAIL_USUARIO: req.body.EMAIL_USUARIO, 
            SENHA_USUARIO: '***' 
        });

        const { EMAIL_USUARIO, SENHA_USUARIO } = req.body;

        if (!EMAIL_USUARIO || !SENHA_USUARIO) {
            return res.status(400).json({ 
                success: false, 
                message: "Email e senha são obrigatórios." 
            });
        }

        try {
            console.log('Buscando usuário por email:', EMAIL_USUARIO);
            const user = await this.userModel.findByEmail(EMAIL_USUARIO);
            
            if (!user) {
                console.log('Usuário não encontrado');
                return res.status(401).json({ 
                    success: false, 
                    message: "Credenciais inválidas." 
                });
            }

            console.log('Usuário encontrado, verificando senha...');
            const passwordMatch = await bcrypt.compare(SENHA_USUARIO, user.SENHA_USUARIO);
            
            if (passwordMatch) {
                console.log('Senha correta - login bem-sucedido');
                const { SENHA_USUARIO, ...userWithoutPassword } = user;
                
                res.json({
                    success: true,
                    message: "Login bem-sucedido!",
                    user: userWithoutPassword
                });
            } else {
                console.log('Senha incorreta');
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

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: "ID do usuário não fornecido." 
            });
        }

        try {
            const user = await this.userModel.findById(userId);
            
            if (user) {
                res.json({ 
                    success: true, 
                    message: "Dados do usuário encontrados.", 
                    user 
                });
            } else {
                res.status(404).json({ 
                    success: false, 
                    message: "Usuário não encontrado." 
                });
            }
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor." 
            });
        }
    }

    async updateProfile(req, res) {
        console.log('=== ATUALIZANDO PERFIL ===');
        console.log('Dados recebidos:', req.body);

        const {
            id_usuario,
            NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
            BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
            DT_NASC_USUARIO, TIPO_USUARIO, NOVA_SENHA_USUARIO, CONFIRM_SENHA_USUARIO
        } = req.body;

        if (!id_usuario) {
            return res.status(400).json({ 
                success: false, 
                message: "ID do usuário é obrigatório." 
            });
        }
        if (!NOME_USUARIO || !EMAIL_USUARIO) {
            return res.status(400).json({ 
                success: false, 
                message: "Nome e Email são obrigatórios." 
            });
        }
        if (NOVA_SENHA_USUARIO && NOVA_SENHA_USUARIO !== CONFIRM_SENHA_USUARIO) {
            return res.status(400).json({ 
                success: false, 
                message: "As novas senhas não coincidem." 
            });
        }

        if (NOVA_SENHA_USUARIO) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(NOVA_SENHA_USUARIO)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "A nova senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais." 
                });
            }
        }

        try {
            const emailExists = await this.userModel.emailExists(EMAIL_USUARIO, id_usuario);
            if (emailExists) {
                return res.status(409).json({ 
                    success: false, 
                    message: "Este email já está cadastrado para outro usuário." 
                });
            }

            const updateData = {
                NOME_USUARIO,
                EMAIL_USUARIO,
                CELULAR_USUARIO,
                LOGRADOURO_USUARIO,
                BAIRRO_USUARIO,
                CIDADE_USUARIO,
                UF_USUARIO,
                CEP_USUARIO,
                DT_NASC_USUARIO,
                TIPO_USUARIO
            };

            if (NOVA_SENHA_USUARIO) {
                updateData.SENHA_USUARIO = await bcrypt.hash(NOVA_SENHA_USUARIO, 12);
            }

            const result = await this.userModel.update(id_usuario, updateData);

            if (result.affectedRows > 0) {
                res.json({ 
                    success: true, 
                    message: "Perfil atualizado com sucesso!" 
                });
            } else {
                res.json({ 
                    success: false, 
                    message: "Nenhuma alteração detectada." 
                });
            }

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor." 
            });
        }
    }

    async recoverPassword(req, res) {
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

        try {
            const user = await this.userModel.findByEmail(email);
            
            // Por segurança, sempre retorna mesma mensagem
            res.json({ 
                success: true, 
                message: "Se o email existir em nosso sistema, enviaremos instruções de recuperação." 
            });

        } catch (error) {
            console.error('Erro na recuperação:', error);
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor." 
            });
        }
    }
}

module.exports = UserController;