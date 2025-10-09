const db = require('../../config/BANCO_VITRINE');

class UserModel {
    async emailExists(email, excludeUserId = null) {
        try {
            let sql = 'SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL_USUARIO = ?';
            const params = [email];
            
            if (excludeUserId) {
                sql += ' AND ID_USUARIO != ?';
                params.push(excludeUserId);
            }
            
            const [rows] = await db.execute(sql, params);
            return rows.length > 0;
        } catch (error) {
            console.error('Erro ao verificar email:', error);
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            const sql = 'SELECT * FROM USUARIOS WHERE EMAIL_USUARIO = ?';
            const [rows] = await db.execute(sql, [email]);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar usuário por email:', error);
            throw error;
        }
    }

    async findById(userId) {
        try {
            const sql = 'SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO, DATA_CADASTRO FROM USUARIOS WHERE ID_USUARIO = ?';
            const [rows] = await db.execute(sql, [userId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }

    async create(userData) {
        try {
            console.log('Dados recebidos no model.create:', userData);
            
            const sql = `INSERT INTO USUARIOS (
                NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
                LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO, DATA_CADASTRO
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
            
            const params = [
                userData.NOME_USUARIO,
                userData.EMAIL_USUARIO,
                userData.SENHA_USUARIO,
                userData.CELULAR_USUARIO,
                userData.LOGRADOURO_USUARIO,
                userData.BAIRRO_USUARIO,
                userData.CIDADE_USUARIO,
                userData.UF_USUARIO,
                userData.CEP_USUARIO,
                userData.DT_NASC_USUARIO,
                userData.TIPO_USUARIO
            ];

            console.log('SQL:', sql);
            console.log('Parâmetros:', params);
            console.log('Número de colunas: 12');
            console.log('Número de valores:', params.length);

            const [result] = await db.execute(sql, params);
            console.log('Resultado da inserção:', result);
            
            return result;
        } catch (error) {
            console.error('=== ERRO NO userModel.create ===');
            console.error('Mensagem:', error.message);
            console.error('Código:', error.code);
            console.error('SQL:', error.sql);
            console.error('SQL Message:', error.sqlMessage);
            throw error;
        }
    }

    async update(userId, updateData) {
        try {
            console.log('Atualizando usuário:', userId, updateData);
            
            const fields = [];
            const params = [];
            
            // Construir dinamicamente os campos a serem atualizados
            if (updateData.NOME_USUARIO !== undefined) {
                fields.push('NOME_USUARIO = ?');
                params.push(updateData.NOME_USUARIO);
            }
            if (updateData.EMAIL_USUARIO !== undefined) {
                fields.push('EMAIL_USUARIO = ?');
                params.push(updateData.EMAIL_USUARIO);
            }
            if (updateData.SENHA_USUARIO !== undefined) {
                fields.push('SENHA_USUARIO = ?');
                params.push(updateData.SENHA_USUARIO);
            }
            if (updateData.CELULAR_USUARIO !== undefined) {
                fields.push('CELULAR_USUARIO = ?');
                params.push(updateData.CELULAR_USUARIO);
            }
            if (updateData.LOGRADOURO_USUARIO !== undefined) {
                fields.push('LOGRADOURO_USUARIO = ?');
                params.push(updateData.LOGRADOURO_USUARIO);
            }
            if (updateData.BAIRRO_USUARIO !== undefined) {
                fields.push('BAIRRO_USUARIO = ?');
                params.push(updateData.BAIRRO_USUARIO);
            }
            if (updateData.CIDADE_USUARIO !== undefined) {
                fields.push('CIDADE_USUARIO = ?');
                params.push(updateData.CIDADE_USUARIO);
            }
            if (updateData.UF_USUARIO !== undefined) {
                fields.push('UF_USUARIO = ?');
                params.push(updateData.UF_USUARIO);
            }
            if (updateData.CEP_USUARIO !== undefined) {
                fields.push('CEP_USUARIO = ?');
                params.push(updateData.CEP_USUARIO);
            }
            if (updateData.DT_NASC_USUARIO !== undefined) {
                fields.push('DT_NASC_USUARIO = ?');
                params.push(updateData.DT_NASC_USUARIO);
            }
            if (updateData.TIPO_USUARIO !== undefined) {
                fields.push('TIPO_USUARIO = ?');
                params.push(updateData.TIPO_USUARIO);
            }
            
            if (fields.length === 0) {
                throw new Error('Nenhum campo para atualizar');
            }
            
            params.push(userId);
            
            const sql = `UPDATE USUARIOS SET ${fields.join(', ')} WHERE ID_USUARIO = ?`;
            
            console.log('SQL de update:', sql);
            console.log('Parâmetros de update:', params);
            
            const [result] = await db.execute(sql, params);
            return result;
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }
}

module.exports = UserModel;