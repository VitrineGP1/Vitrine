const fs = require('fs');
const path = require('path');

async function initializeDatabase(pool) {
    try {
        console.log('🔄 Verificando se o banco precisa ser inicializado...');
        
        // Verificar se a tabela USUARIOS existe
        const [tables] = await pool.execute("SHOW TABLES LIKE 'USUARIOS'");
        
        if (tables.length === 0) {
            console.log('📦 Banco vazio detectado. Inicializando estrutura...');
            
            // Ler o script SQL
            const sqlScript = fs.readFileSync(
                path.join(__dirname, 'BANCO_COMPLETO_RAILWAY.sql'), 
                'utf8'
            );
            
            // Dividir em comandos individuais
            const commands = sqlScript
                .split(';')
                .map(cmd => cmd.trim())
                .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
            
            // Executar cada comando
            for (const command of commands) {
                if (command.trim()) {
                    await pool.execute(command);
                }
            }
            
            console.log('✅ Banco inicializado com sucesso!');
            console.log('📊 Tabelas criadas: USUARIOS, VENDEDORES, CATEGORIAS, PRODUTOS, etc.');
            console.log('🏪 Categorias inseridas: Artesanato, Decoração, Roupas, Acessórios');
            
        } else {
            console.log('✅ Banco já inicializado.');
            
            // Verificar se as novas colunas existem
            const [columns] = await pool.execute("SHOW COLUMNS FROM PRODUTOS LIKE 'SUBCATEGORIA'");
            if (columns.length === 0) {
                console.log('🔄 Adicionando novas colunas para roupas...');
                
                const alterCommands = [
                    "ALTER TABLE PRODUTOS ADD COLUMN SUBCATEGORIA VARCHAR(50)",
                    "ALTER TABLE PRODUTOS ADD COLUMN TAMANHO VARCHAR(10)",
                    "ALTER TABLE PRODUTOS ADD COLUMN QUANTIDADE INT DEFAULT 1",
                    "ALTER TABLE PRODUTOS ADD COLUMN BUSTO_P VARCHAR(20)",
                    "ALTER TABLE PRODUTOS ADD COLUMN COMP_P VARCHAR(20)",
                    "ALTER TABLE PRODUTOS ADD COLUMN BUSTO_M VARCHAR(20)",
                    "ALTER TABLE PRODUTOS ADD COLUMN COMP_M VARCHAR(20)",
                    "ALTER TABLE PRODUTOS ADD COLUMN BUSTO_G VARCHAR(20)",
                    "ALTER TABLE PRODUTOS ADD COLUMN COMP_G VARCHAR(20)"
                ];
                
                for (const command of alterCommands) {
                    try {
                        await pool.execute(command);
                    } catch (error) {
                        if (!error.message.includes('Duplicate column name')) {
                            throw error;
                        }
                    }
                }
                
                console.log('✅ Novas colunas adicionadas!');
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error.message);
        return false;
    }
}

module.exports = { initializeDatabase };