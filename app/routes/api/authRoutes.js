const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

module.exports = (pool) => {
    // Rota de CADASTRO de Usuário
    router.post('/cadastro_usuario', async (req, res) => {
        const {
            NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
            LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
            CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO,
            TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA, CPF_CLIENTE
        } = req.body;

        if (!NOME_USUARIO || !EMAIL_USUARIO || !SENHA_USUARIO) {
            return res.status(400).json({ success: false, message: "Nome, email e senha são obrigatórios." });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
            return res.status(400).json({ success: false, message: "Formato de email inválido." });
        }

        let connection;
        try {
            const hashedPassword = await bcrypt.hash(SENHA_USUARIO, 10);
            connection = await pool.getConnection();

            await connection.beginTransaction();

            // Limpar CEP removendo caracteres não numéricos e limitando a 8 dígitos
            let cleanCep = null;
            if (CEP_USUARIO) {
                cleanCep = CEP_USUARIO.replace(/\D/g, '').substring(0, 8);
                // Validar se o CEP tem exatamente 8 dígitos
                if (cleanCep.length !== 8) {
                    return res.status(400).json({ success: false, message: "CEP deve conter exatamente 8 dígitos." });
                }
            }

            // Converter tipo de usuário para formato do banco (1 caractere)
            const tipoUsuarioDB = TIPO_USUARIO === 'seller' ? 'V' : TIPO_USUARIO === 'buyer' ? 'C' : 'A';

            const [userResult] = await connection.execute(
                `INSERT INTO USUARIOS (
                    NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
                    LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                    CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    NOME_USUARIO, EMAIL_USUARIO, hashedPassword, CELULAR_USUARIO,
                    LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                    cleanCep, DT_NASC_USUARIO, tipoUsuarioDB
                ]
            );
            const newUserId = userResult.insertId;

            // Inserir dados específicos baseado no tipo de usuário
            if (TIPO_USUARIO === 'seller') {
                if (!TIPO_PESSOA || !DIGITO_PESSOA) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: "Para vendedores, Tipo de Pessoa e Dígito de Pessoa são obrigatórios." });
                }

                // Inserir dados do vendedor incluindo todos os campos obrigatórios
                await connection.execute(
                    `INSERT INTO VENDEDORES (ID_USUARIO, TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA, DESCRICAO_NEGOCIO, LOGRADOURO_VENDEDOR, BAIRRO_VENDEDOR, CIDADE_VENDEDOR, UF_VENDEDOR, CEP_VENDEDOR)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        newUserId,
                        TIPO_PESSOA,
                        DIGITO_PESSOA,
                        NOME_LOJA || 'Loja Padrão',
                        'Descrição padrão do negócio',
                        LOGRADOURO_USUARIO || 'Endereço não informado',
                        BAIRRO_USUARIO || 'Bairro não informado',
                        CIDADE_USUARIO || 'Cidade não informada',
                        UF_USUARIO || 'UF',
                        cleanCep || '00000000'
                    ]
                );
            } else if (TIPO_USUARIO === 'buyer') {
                // Para compradores, CPF é opcional no cadastro inicial
                if (CPF_CLIENTE) {
                    await connection.execute(
                        `INSERT INTO CLIENTES (ID_USUARIO, CPF_CLIENTE)
                         VALUES (?, ?)`,
                        [newUserId, CPF_CLIENTE.replace(/\D/g, '')]
                    );
                }
            }

            await connection.commit();
            res.status(201).json({ success: true, message: "Usuário cadastrado com sucesso!" });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Erro no cadastro de usuário (Node.js API):', error);
            console.error('Stack trace completo:', error.stack);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: "Este email ou dígito de pessoa já está cadastrado." });
            }
            res.status(500).json({ success: false, message: "Erro interno do servidor: " + error.message });
        } finally {
            if (connection) connection.release();
        }
    });

    // Rota de LOGIN de Usuário
    router.post('/login_usuario', async (req, res) => {
        const { EMAIL_USUARIO, SENHA_USUARIO } = req.body;

        if (!EMAIL_USUARIO || !SENHA_USUARIO) {
            return res.status(400).json({ success: false, message: "Email e senha são obrigatórios." });
        }

        try {
            const connection = await pool.getConnection();

            const [rows] = await connection.execute(
                `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, TIPO_USUARIO
                 FROM USUARIOS WHERE EMAIL_USUARIO = ?`,
                [EMAIL_USUARIO]
            );

            if (rows.length === 0) {
                connection.release();
                return res.status(401).json({ success: false, message: "Credenciais inválidas." });
            }

            const user = rows[0];
            const passwordMatch = await bcrypt.compare(SENHA_USUARIO, user.SENHA_USUARIO);

            if (!passwordMatch) {
                connection.release();
                return res.status(401).json({ success: false, message: "Credenciais inválidas." });
            }

            let sellerInfo = {};
            if (user.TIPO_USUARIO === 'V') {
                try {
                    // Primeiro, tentar adicionar a coluna NOME_LOJA se não existir
                    try {
                        await connection.execute('ALTER TABLE VENDEDORES ADD COLUMN NOME_LOJA VARCHAR(100)');
                    } catch (alterError) {
                        // Coluna já existe ou outro erro - continuar
                    }

                    const [sellerRows] = await connection.execute(
                        `SELECT ID_VENDEDOR, NOME_LOJA, IMAGEM_PERFIL_LOJA_BASE64 FROM VENDEDORES WHERE ID_USUARIO = ?`,
                        [user.ID_USUARIO]
                    );
                    if (sellerRows.length > 0) {
                        sellerInfo = {
                            sellerId: sellerRows[0].ID_VENDEDOR,
                            storeName: sellerRows[0].NOME_LOJA || 'Loja Padrão',
                            storeProfileImage: sellerRows[0].IMAGEM_PERFIL_LOJA_BASE64
                        };
                    } else {
                        // Se não encontrou dados do vendedor, usar o ID do usuário como fallback
                        sellerInfo = {
                            sellerId: user.ID_USUARIO,
                            storeName: 'Loja Padrão',
                            storeProfileImage: null
                        };
                    }
                } catch (sellerError) {
                    console.log('Aviso: Erro ao buscar dados do vendedor:', sellerError.message);
                    // Fallback em caso de erro
                    sellerInfo = {
                        sellerId: user.ID_USUARIO,
                        storeName: 'Loja Padrão',
                        storeProfileImage: null
                    };
                }
            }

            connection.release();

            // Converter tipo do banco para formato do frontend
            const tipoUsuarioFrontend = user.TIPO_USUARIO === 'V' ? 'seller' : user.TIPO_USUARIO === 'C' ? 'buyer' : 'admin';

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
            console.error('Erro no login de usuário (Node.js API):', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    // Rota para buscar dados completos do usuário
    router.get('/user/:id', async (req, res) => {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "ID do usuário é obrigatório." });
        }

        try {
            const connection = await pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
                        BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
                        DT_NASC_USUARIO, TIPO_USUARIO
                 FROM USUARIOS WHERE ID_USUARIO = ?`,
                [userId]
            );
            connection.release();

            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: "Usuário não encontrado." });
            }

            const userData = rows[0];
            // Converter tipo do banco para formato do frontend
            userData.TIPO_USUARIO = userData.TIPO_USUARIO === 'V' ? 'seller' : userData.TIPO_USUARIO === 'C' ? 'buyer' : 'admin';

            res.status(200).json({
                success: true,
                user: userData
            });

        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    // Rota para solicitar reset de senha
    router.post('/reset_password', async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email é obrigatório." });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Formato de email inválido." });
        }

        try {
            const connection = await pool.getConnection();
            const [rows] = await connection.execute(
                'SELECT ID_USUARIO, NOME_USUARIO FROM USUARIOS WHERE EMAIL_USUARIO = ?',
                [email]
            );
            connection.release();

            if (rows.length > 0) {
                const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
                const user = rows[0];
                
                // Enviar email se configurado
                if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                    try {
                        const transporter = nodemailer.createTransporter({
                            host: 'smtp.gmail.com',
                            port: 587,
                            secure: false,
                            auth: {
                                user: process.env.EMAIL_USER,
                                pass: process.env.EMAIL_PASS
                            }
                        });

                        await transporter.sendMail({
                            from: `"Vitrine" <${process.env.EMAIL_USER}>`,
                            to: email,
                            subject: 'Código de Redefinição de Senha - Vitrine',
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                    <h2 style="color: #713112;">Redefinição de Senha</h2>
                                    <p>Olá ${user.NOME_USUARIO},</p>
                                    <p>Seu código para redefinir a senha é:</p>
                                    <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                                        <h1 style="color: #713112; font-size: 32px; margin: 0;">${resetCode}</h1>
                                    </div>
                                    <p>Este código é válido por 10 minutos.</p>
                                    <p>Se você não solicitou esta redefinição, ignore este email.</p>
                                </div>
                            `
                        });
                        console.log(`Email enviado para ${email} com código: ${resetCode}`);
                    } catch (emailError) {
                        console.error('Erro ao enviar email:', emailError.message);
                        console.log(`Código de reset para ${email}: ${resetCode}`);
                    }
                } else {
                    console.log(`Código de reset para ${email}: ${resetCode}`);
                }
            }

            res.status(200).json({
                success: true,
                message: "Se este e-mail estiver cadastrado, você receberá um código para redefinir sua senha."
            });

        } catch (error) {
            console.error('Erro ao processar reset:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    // Rota para confirmar reset com código
    router.post('/confirm_reset', async (req, res) => {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ success: false, message: "Email, código e nova senha são obrigatórios." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "A senha deve ter no mínimo 6 caracteres." });
        }

        try {
            const connection = await pool.getConnection();
            const [rows] = await connection.execute(
                'SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL_USUARIO = ?',
                [email]
            );

            if (rows.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Email não encontrado." });
            }

            if (!/^\d{6}$/.test(code)) {
                connection.release();
                return res.status(400).json({ success: false, message: "Código inválido." });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await connection.execute(
                'UPDATE USUARIOS SET SENHA_USUARIO = ? WHERE EMAIL_USUARIO = ?',
                [hashedPassword, email]
            );
            connection.release();

            res.status(200).json({
                success: true,
                message: "Senha redefinida com sucesso!"
            });

        } catch (error) {
            console.error('Erro ao confirmar reset:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    // Rota para atualizar dados do usuário
    router.put('/atualizar_usuario', async (req, res) => {
        const {
            id_usuario, NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO,
            LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
            CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO, IMAGEM_PERFIL_BASE64,
            NOVA_SENHA_USUARIO, CONFIRM_SENHA_USUARIO
        } = req.body;

        if (!id_usuario) {
            return res.status(400).json({ success: false, message: "ID do usuário é obrigatório." });
        }

        try {
            const connection = await pool.getConnection();

            // Se está alterando senha, validar
            if (NOVA_SENHA_USUARIO) {
                if (NOVA_SENHA_USUARIO !== CONFIRM_SENHA_USUARIO) {
                    connection.release();
                    return res.status(400).json({ success: false, message: "As senhas não coincidem." });
                }
                if (NOVA_SENHA_USUARIO.length < 6) {
                    connection.release();
                    return res.status(400).json({ success: false, message: "A senha deve ter no mínimo 6 caracteres." });
                }
            }

            // Construir query de atualização dinamicamente
            let updateFields = [];
            let updateValues = [];

            if (NOME_USUARIO) {
                updateFields.push('NOME_USUARIO = ?');
                updateValues.push(NOME_USUARIO);
            }
            if (EMAIL_USUARIO) {
                updateFields.push('EMAIL_USUARIO = ?');
                updateValues.push(EMAIL_USUARIO);
            }
            if (CELULAR_USUARIO) {
                updateFields.push('CELULAR_USUARIO = ?');
                updateValues.push(CELULAR_USUARIO);
            }
            if (LOGRADOURO_USUARIO) {
                updateFields.push('LOGRADOURO_USUARIO = ?');
                updateValues.push(LOGRADOURO_USUARIO);
            }
            if (BAIRRO_USUARIO) {
                updateFields.push('BAIRRO_USUARIO = ?');
                updateValues.push(BAIRRO_USUARIO);
            }
            if (CIDADE_USUARIO) {
                updateFields.push('CIDADE_USUARIO = ?');
                updateValues.push(CIDADE_USUARIO);
            }
            if (UF_USUARIO) {
                updateFields.push('UF_USUARIO = ?');
                updateValues.push(UF_USUARIO);
            }
            if (CEP_USUARIO) {
                const cleanCep = CEP_USUARIO.replace(/\D/g, '').substring(0, 8);
                if (cleanCep.length !== 8) {
                    connection.release();
                    return res.status(400).json({ success: false, message: "CEP deve conter exatamente 8 dígitos." });
                }
                updateFields.push('CEP_USUARIO = ?');
                updateValues.push(cleanCep);
            }
            if (DT_NASC_USUARIO) {
                updateFields.push('DT_NASC_USUARIO = ?');
                updateValues.push(DT_NASC_USUARIO);
            }
            if (IMAGEM_PERFIL_BASE64) {
                updateFields.push('IMAGEM_PERFIL_BASE64 = ?');
                updateValues.push(IMAGEM_PERFIL_BASE64);
            }
            if (NOVA_SENHA_USUARIO) {
                const hashedPassword = await bcrypt.hash(NOVA_SENHA_USUARIO, 10);
                updateFields.push('SENHA_USUARIO = ?');
                updateValues.push(hashedPassword);
            }

            if (updateFields.length === 0) {
                connection.release();
                return res.status(400).json({ success: false, message: "Nenhum campo para atualizar." });
            }

            updateValues.push(id_usuario);
            const updateQuery = `UPDATE USUARIOS SET ${updateFields.join(', ')} WHERE ID_USUARIO = ?`;

            const [result] = await connection.execute(updateQuery, updateValues);
            connection.release();

            if (result.affectedRows > 0) {
                res.status(200).json({ success: true, message: "Dados atualizados com sucesso!" });
            } else {
                res.status(404).json({ success: false, message: "Usuário não encontrado." });
            }

        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: "Este email já está em uso." });
            }
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    return router;
};