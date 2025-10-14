/**
 * Helper para gerenciar armazenamento com fallback para Tracking Prevention
 */
class StorageHelper {
    constructor() {
        this.storageAvailable = this.checkStorageAvailability();
        this.fallbackStorage = new Map();
        this.setupStorageProxy();
    }

    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage bloqueado pelo Tracking Prevention, usando fallback');
            return false;
        }
    }

    setItem(key, value) {
        if (this.storageAvailable) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn('Erro ao salvar no localStorage:', e);
                this.storageAvailable = false;
            }
        }
        
        // Fallback para Map em memória
        this.fallbackStorage.set(key, value);
        return false;
    }

    getItem(key) {
        if (this.storageAvailable) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.warn('Erro ao ler localStorage:', e);
                this.storageAvailable = false;
            }
        }
        
        // Fallback para Map em memória
        return this.fallbackStorage.get(key) || null;
    }

    removeItem(key) {
        if (this.storageAvailable) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('Erro ao remover do localStorage:', e);
            }
        }
        
        this.fallbackStorage.delete(key);
    }

    clear() {
        if (this.storageAvailable) {
            try {
                localStorage.clear();
            } catch (e) {
                console.warn('Erro ao limpar localStorage:', e);
            }
        }
        
        this.fallbackStorage.clear();
    }

    // Método para solicitar acesso ao storage (para cross-origin)
    async requestStorageAccess() {
        if (document.requestStorageAccess) {
            try {
                await document.requestStorageAccess();
                this.storageAvailable = this.checkStorageAvailability();
                return this.storageAvailable;
            } catch (e) {
                console.warn('Acesso ao storage negado:', e);
                return false;
            }
        }
        return this.storageAvailable;
    }

    // Notificar usuário sobre limitações
    showStorageWarning() {
        if (!this.storageAvailable) {
            const warning = document.createElement('div');
            warning.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 9999;
                max-width: 300px;
                font-size: 14px;
            `;
            warning.innerHTML = `
                <strong>Aviso:</strong> O carrinho será perdido ao recarregar a página devido às configurações de privacidade do navegador.
                <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 16px; cursor: pointer;">&times;</button>
            `;
            document.body.appendChild(warning);
            
            setTimeout(() => {
                if (warning.parentElement) {
                    warning.remove();
                }
            }, 10000);
        }
    }

    // Interceptar tentativas de acesso direto ao localStorage
    setupStorageProxy() {
        if (!this.storageAvailable) {
            const self = this;
            const originalSetItem = Storage.prototype.setItem;
            const originalGetItem = Storage.prototype.getItem;
            const originalRemoveItem = Storage.prototype.removeItem;
            
            Storage.prototype.setItem = function(key, value) {
                try {
                    return originalSetItem.call(this, key, value);
                } catch (e) {
                    self.fallbackStorage.set(key, value);
                }
            };
            
            Storage.prototype.getItem = function(key) {
                try {
                    return originalGetItem.call(this, key);
                } catch (e) {
                    return self.fallbackStorage.get(key) || null;
                }
            };
            
            Storage.prototype.removeItem = function(key) {
                try {
                    return originalRemoveItem.call(this, key);
                } catch (e) {
                    self.fallbackStorage.delete(key);
                }
            };
        }
    }
}

// Instância global
window.storageHelper = new StorageHelper();