const bcrypt = require('bcryptjs');

class User {
    constructor(pool) {
        this.pool = pool;
    }

    async create(userData) {
        const {
            NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
            LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
            CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO,
            TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA, CPF_CLIENTE
        } = userData;

        let connection;
        try {
            const hashedPassword = await bcrypt.hash(SENHA_USUARIO, 10);
            connection = await this.pool.getConnection();
            await connection.beginTransaction();

            let cleanCep = null;
            if (CEP_USUARIO) {
                cleanCep = CEP_USUARIO.replace(/\D/g, '').substring(0, 8);
                if (cleanCep.length !== 8) {
                    throw new Error("CEP deve conter exatamente 8 dígitos.");
                }
            }

            const tipoUsuarioDB = TIPO_USUARIO;
            
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

            if (TIPO_USUARIO === 'V') {
                if (!TIPO_PESSOA || !DIGITO_PESSOA) {
                    throw new Error("Para vendedores, Tipo de Pessoa e Dígito de Pessoa são obrigatórios.");
                }
                
                try {
                    await connection.execute(
                        `INSERT INTO VENDEDORES (ID_USUARIO, TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA)
                         VALUES (?, ?, ?, ?)`,
                        [newUserId, TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA || 'Loja Padrão']
                    );
                } catch (columnError) {
                    await connection.execute(
                        `INSERT INTO VENDEDORES (ID_USUARIO, TIPO_PESSOA, DIGITO_PESSOA)
                         VALUES (?, ?, ?)`,
                        [newUserId, TIPO_PESSOA, DIGITO_PESSOA]
                    );
                }
            } else if (TIPO_USUARIO === 'C' && CPF_CLIENTE) {
                await connection.execute(
                    `INSERT INTO CLIENTES (ID_USUARIO, CPF_CLIENTE)
                     VALUES (?, ?)`,
                    [newUserId, CPF_CLIENTE.replace(/\D/g, '')]
                );
            }

            await connection.commit();
            return { success: true, userId: newUserId };

        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async findByEmail(email) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, TIPO_USUARIO
                 FROM USUARIOS WHERE EMAIL_USUARIO = ?`,
                [email]
            );
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (connection) connection.release();
        }
    }

    async findById(id) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, 
                        LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, 
                        CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO, IMAGEM_PERFIL_BASE64 
                 FROM USUARIOS WHERE ID_USUARIO = ?`,
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (connection) connection.release();
        }
    }

    async update(id, userData) {
        const {
            NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
            BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
            DT_NASC_USUARIO, IMAGEM_PERFIL_BASE64, NOVA_SENHA_USUARIO
        } = userData;

        let connection;
        try {
            connection = await this.pool.getConnection();
            
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
                    throw new Error("CEP deve conter exatamente 8 dígitos.");
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
                throw new Error("Nenhum campo para atualizar.");
            }

            updateValues.push(id);
            const updateQuery = `UPDATE USUARIOS SET ${updateFields.join(', ')} WHERE ID_USUARIO = ?`;
            
            const [result] = await connection.execute(updateQuery, updateValues);
            return result.affectedRows > 0;

        } finally {
            if (connection) connection.release();
        }
    }

    async delete(id) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            await connection.beginTransaction();
            
            await connection.execute('DELETE FROM PRODUTOS WHERE ID_VENDEDOR = ?', [id]);
            await connection.execute('DELETE FROM VENDEDORES WHERE ID_USUARIO = ?', [id]);
            await connection.execute('DELETE FROM CLIENTES WHERE ID_USUARIO = ?', [id]);
            await connection.execute('DELETE FROM ADMINISTRADORES WHERE ID_USUARIO = ?', [id]);
            
            const [result] = await connection.execute('DELETE FROM USUARIOS WHERE ID_USUARIO = ?', [id]);
            
            await connection.commit();
            return result.affectedRows > 0;

        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async getAll() {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [users] = await connection.execute(
                `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, 
                        CIDADE_USUARIO, TIPO_USUARIO 
                 FROM USUARIOS ORDER BY ID_USUARIO DESC`
            );
            return users;
        } finally {
            if (connection) connection.release();
        }
    }

    async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;