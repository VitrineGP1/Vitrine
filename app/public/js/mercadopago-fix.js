// Fix específico para SDK do Mercado Pago
(function() {
    'use strict';
    
    // Silenciar erros de storage no console
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('Tracking Prevention blocked access to storage')) {
            return; // Silenciar este erro específico
        }
        originalError.apply(console, args);
    };
    
    // Interceptar window.localStorage diretamente
    if (typeof Storage !== 'undefined') {
        const fallbackMap = new Map();
        
        const createProxy = (storage, fallback) => {
            return new Proxy(storage, {
                get(target, prop) {
                    if (prop === 'setItem') {
                        return function(key, value) {
                            try {
                                return target.setItem(key, value);
                            } catch (e) {
                                fallback.set(key, value);
                            }
                        };
                    }
                    if (prop === 'getItem') {
                        return function(key) {
                            try {
                                return target.getItem(key);
                            } catch (e) {
                                return fallback.get(key) || null;
                            }
                        };
                    }
                    if (prop === 'removeItem') {
                        return function(key) {
                            try {
                                return target.removeItem(key);
                            } catch (e) {
                                fallback.delete(key);
                            }
                        };
                    }
                    return target[prop];
                }
            });
        };
        
        try {
            localStorage.setItem('__test__', '__test__');
            localStorage.removeItem('__test__');
        } catch (e) {
            // localStorage bloqueado, substituir com proxy
            Object.defineProperty(window, 'localStorage', {
                value: createProxy(localStorage, fallbackMap),
                writable: false,
                configurable: false
            });
        }
    }
})();