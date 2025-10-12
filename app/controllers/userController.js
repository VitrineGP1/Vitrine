const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const usuario = require('../models/userModel');
const enviarEmail = require('../js/email-reset-senha');

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

        if (!NOME_USUARIO || !EMAIL_USUARIO || !SENHA_USUARIO) {
            return res.status(400).json({ success: false, message: "Nome, email e senha são obrigatórios." });
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
            return res.status(400).json({ success: false, message: "Formato de email inválido." });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(SENHA_USUARIO)) {
            return res.status(400).json({ 
                success: false, 
                message: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais." 
            });
        }

        try {
            const emailExists = await this.userModel.emailExists(EMAIL_USUARIO);
            if (emailExists) {
                return res.status(409).json({ success: false, message: "Este email já está cadastrado." });
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

            const result = await this.userModel.create(userData);

            res.status(201).json({
                success: true,
                message: "Usuário cadastrado com sucesso!",
                userId: result.insertId
            });

        } catch (error) {
            console.error('Erro no cadastro:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: "Este email já está cadastrado." });
            }
            
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor.",
                ...(process.env.NODE_ENV === 'development' && {
                    debug: error.message
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

        // Validações básicas
        if (!EMAIL_USUARIO || !SENHA_USUARIO) {
            console.log('Email ou senha não fornecidos');
            return res.status(400).json({ 
                success: false, 
                message: "Email e senha são obrigatórios." 
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
            console.log('Formato de email inválido:', EMAIL_USUARIO);
            return res.status(400).json({ 
                success: false, 
                message: "Formato de email inválido." 
            });
        }

        try {
            console.log('Buscando usuário por email:', EMAIL_USUARIO);
            
            // Buscar usuário no banco
            const user = await this.userModel.findByEmail(EMAIL_USUARIO);
            
            if (!user) {
                console.log('Usuário não encontrado para o email:', EMAIL_USUARIO);
                // Por segurança, retornar mesma mensagem para não revelar se email existe
                return res.status(401).json({ 
                    success: false, 
                    message: "Credenciais inválidas." 
                });
            }

            console.log('Usuário encontrado, verificando senha...');
            console.log('Senha do banco:', user.SENHA_USUARIO ? '***' : 'NÃO ENCONTRADA');
            
            // Verificar se a senha do usuário existe
            if (!user.SENHA_USUARIO) {
                console.error('Usuário sem senha no banco de dados');
                return res.status(500).json({ 
                    success: false, 
                    message: "Erro interno do servidor." 
                });
            }

            // Comparar senhas
            const passwordMatch = await bcrypt.compare(SENHA_USUARIO, user.SENHA_USUARIO);
            console.log('Senha corresponde:', passwordMatch);
            
            if (passwordMatch) {
                console.log('Login bem-sucedido para:', EMAIL_USUARIO);
                
                // Remover senha do objeto de resposta
                const { SENHA_USUARIO, ...userWithoutPassword } = user;
                
                res.json({
                    success: true,
                    message: "Login bem-sucedido!",
                    user: userWithoutPassword
                });
            } else {
                console.log('Senha incorreta para:', EMAIL_USUARIO);
                res.status(401).json({ 
                    success: false, 
                    message: "Credenciais inválidas." 
                });
            }
        } catch (error) {
            console.error('=== ERRO NO LOGIN ===');
            console.error('Tipo do erro:', error.constructor.name);
            console.error('Mensagem do erro:', error.message);
            console.error('Stack trace:', error.stack);
            
            res.status(500).json({ 
                success: false, 
                message: "Erro interno do servidor.",
                ...(process.env.NODE_ENV === 'development' && {
                    debug: error.message
                })
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
    },

    recuperarSenha: async (req, res) => {
        const errors = validationResult(req);
        console.log(errors);
        if (!errors.isEmpty()) {
            return res.render("pages/rdsenha", {
                listaErros: errors,
                dadosNotificacao: null,
                valores: req.body,
            });
        }
        try {
            const user = await usuario.findUserCustom({
                email_usuario: req.body.email_usu,
            });
            const token = jwt.sign(
                { userId: user[0].id_usuario, expiresIn: "40m" },
                process.env.SECRET_KEY
            );
            const html = require('./js/email-reset-senha')(process.env.URL_BASE, token);
            enviarEmail(req.body.email_usu, "Pedido de recuperação de senha", null, html, () => {
                return res.render("pages/index", {
                    listaErros: null,
                    autenticado: req.session.autenticado,
                    dadosNotificacao: {
                        titulo: "Recuperação de senha",
                        mensagem: "Enviamos um e-mail com instruções para resetar sua senha",
                        tipo: "success",
                    },
                });
            });
        } catch (e) {
            console.log(e);
        }
    };

    validarTokenNovaSenha: async (req, res) => {
        const token = req.query.token;
        console.log(token);
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                res.render("pages/rdsenha", {
                    listaErros: null,
                    dadosNotificacao: { 
                        titulo: "Link expirado!",
                        mensagem: "Insira seu e-mail para iniciar o reset de senha.",
                        tipo: "error",
                    },
                    valores: req.body
                });
            } else {
                res.render("pages/resetar-senha", {
                    listaErros: null,
                    autenticado: req.session.autenticado,
                    id_usuario: decoded.userId,
                    dadosNotificacao: null
                });
            }
        });
    };

    resetarSenha: async (req, res) => {
        const errors = validationResult(req);
        console.log(errors);
        if (!errors.isEmpty()) {
            return res.render("pages/resetar-senha", {
                listaErros: errors,
                dadosNotificacao: null,
                valores: req.body,
            });
        }
        try {
            const senha = bcrypt.hashSync(req.body.senha_usu);
            const resetar = await usuario.update(
                { senha_usuario: senha },
                req.body.id_usuario
            );
            console.log(resetar);
            res.render("pages/login", {
                listaErros: null,
                dadosNotificacao: {
                    titulo: "Perfil alterado",
                    mensagem: "Nova senha registrada",
                    tipo: "success",
                },
            });
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = UserController;