/**
 * FormatacaoHelper - Utilitários para formatação e manipulação de valores
 * monetários e percentuais para o Simulador de Impacto do Split Payment
 * 
 * © 2025 Expertzy Inteligência Tributária
 */
const FormatacaoHelper = {
    /**
     * Formata um valor monetário para exibição nos campos de input
     * @param {HTMLInputElement} inputElement - Elemento de input
     * @param {ConfiguracaoSplitPayment} config - Configuração do Split Payment
     */
    formatarInputMonetario(inputElement, config) {
        if (!inputElement) return;
        
        // Remover event listeners anteriores para evitar duplicação
        const clone = inputElement.cloneNode(true);
        if (inputElement.parentNode) {
            inputElement.parentNode.replaceChild(clone, inputElement);
            inputElement = clone;
        }
        
        // Converter para tipo text se for number
        if (inputElement.type === 'number') {
            inputElement.type = 'text';
        }
        
        // Formatação inicial
        if (inputElement.value) {
            const valor = config.converterMoedaParaNumero(inputElement.value);
            inputElement.value = config.formatarMoeda(valor, true);
        } else {
            inputElement.value = '';  // Iniciar vazio para melhor UX
        }
        
        // Event listener para o foco
        inputElement.addEventListener('focus', function(e) {
            // Remover formatação para facilitar edição
            const valor = config.converterMoedaParaNumero(this.value);
            if (valor > 0) {
                this.value = valor.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).replace('.', ',');
            } else {
                this.value = '';  // Limpar se for zero
            }
            
            // Posicionar cursor no final
            setTimeout(() => {
                this.selectionStart = this.selectionEnd = this.value.length;
            }, 0);
        });
        
        // Event listener para entrada de dados
        inputElement.addEventListener('input', function(e) {
            // Armazenar posição do cursor e valor original
            const cursorPos = this.selectionStart || 0;
            const valorOriginal = this.value;
            
            // Manter apenas números e vírgula
            let valor = this.value.replace(/[^\d,]/g, '');
            
            // Garantir apenas uma vírgula
            const partes = valor.split(',');
            if (partes.length > 2) {
                valor = partes[0] + ',' + partes.slice(1).join('');
            }
            
            // Limitar casas decimais
            if (partes.length === 2 && partes[1].length > 2) {
                valor = partes[0] + ',' + partes[1].substring(0, 2);
            }
            
            // Atualizar valor apenas se necessário
            if (valor !== valorOriginal) {
                this.value = valor;
                
                // Ajustar posição do cursor
                const diferencaTamanho = valor.length - valorOriginal.length;
                const novaPosicao = Math.max(0, Math.min(cursorPos + diferencaTamanho, valor.length));
                
                // Restaurar posição do cursor
                setTimeout(() => {
                    this.setSelectionRange(novaPosicao, novaPosicao);
                }, 0);
            }
        });
        
        // Event listener para perda de foco
        inputElement.addEventListener('blur', function() {
            // Ao perder foco, formata o valor
            const valor = config.converterMoedaParaNumero(this.value);
            this.value = valor > 0 ? config.formatarMoeda(valor, true) : '';
        });
    },
    
    /**
     * Formata um valor percentual para exibição nos campos de input
     * @param {HTMLInputElement} inputElement - Elemento de input
     * @param {ConfiguracaoSplitPayment} config - Configuração do Split Payment
     */
    formatarInputPercentual(inputElement, config) {
        if (!inputElement) return;
        
        // Remover event listeners anteriores para evitar duplicação
        const clone = inputElement.cloneNode(true);
        if (inputElement.parentNode) {
            inputElement.parentNode.replaceChild(clone, inputElement);
            inputElement = clone;
        }
        
        // Converter para tipo text se for number
        if (inputElement.type === 'number') {
            inputElement.type = 'text';
        }
        
        // Formatação inicial
        if (inputElement.value) {
            let valor;
            if (inputElement.value.includes('%')) {
                valor = config.converterPercentualParaNumero(inputElement.value);
            } else {
                valor = parseFloat(inputElement.value.replace(',', '.')) / 100 || 0;
            }
            inputElement.value = config.formatarPercentual(valor, true);
        } else {
            inputElement.value = '';  // Iniciar vazio para melhor UX
        }
        
        // Event listener para foco
        inputElement.addEventListener('focus', function() {
            // Remover formatação para facilitar edição
            let valor;
            if (this.value.includes('%')) {
                valor = config.converterPercentualParaNumero(this.value) * 100;
            } else {
                valor = parseFloat(this.value.replace(',', '.')) || 0;
            }
            
            if (valor > 0) {
                this.value = valor.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).replace('.', ',');
            } else {
                this.value = '';  // Limpar se for zero
            }
            
            // Posicionar cursor no final
            setTimeout(() => {
                this.selectionStart = this.selectionEnd = this.value.length;
            }, 0);
        });
        
        // Event listener para entrada de dados
        inputElement.addEventListener('input', function(e) {
            // Armazenar posição do cursor e valor original
            const cursorPos = this.selectionStart || 0;
            const valorOriginal = this.value;
            
            // Manter apenas números e vírgula
            let valor = this.value.replace(/[^\d,]/g, '');
            
            // Garantir apenas uma vírgula
            const partes = valor.split(',');
            if (partes.length > 2) {
                valor = partes[0] + ',' + partes.slice(1).join('');
            }
            
            // Limitar casas decimais
            if (partes.length === 2 && partes[1].length > 2) {
                valor = partes[0] + ',' + partes[1].substring(0, 2);
            }
            
            // Atualizar valor apenas se necessário
            if (valor !== valorOriginal) {
                this.value = valor;
                
                // Ajustar posição do cursor
                const diferencaTamanho = valor.length - valorOriginal.length;
                const novaPosicao = Math.max(0, Math.min(cursorPos + diferencaTamanho, valor.length));
                
                // Restaurar posição do cursor
                setTimeout(() => {
                    this.setSelectionRange(novaPosicao, novaPosicao);
                }, 0);
            }
        });
        
        // Event listener para perda de foco
        inputElement.addEventListener('blur', function() {
            // Ao perder foco, formata o valor como percentual
            let valor;
            if (this.value === '') {
                valor = 0;
            } else if (this.value.includes('%')) {
                valor = config.converterPercentualParaNumero(this.value);
            } else {
                valor = parseFloat(this.value.replace(',', '.')) / 100 || 0;
            }
            
            this.value = valor > 0 ? config.formatarPercentual(valor, true) : '';
        });
    },
    
    /**
     * Configura automaticamente a formatação para todos os inputs monetários na página
     * @param {ConfiguracaoSplitPayment} config - Configuração do Split Payment
     */
    configurarInputsMonetarios(config) {
        // Seleciona todos os inputs com a classe money-input
        document.querySelectorAll('.money-input').forEach(input => {
            this.formatarInputMonetario(input, config);
        });
    },
    
    /**
     * Configura automaticamente a formatação para todos os inputs percentuais na página
     * @param {ConfiguracaoSplitPayment} config - Configuração do Split Payment
     */
    configurarInputsPercentuais(config) {
        // Seleciona todos os inputs com a classe percent-input
        document.querySelectorAll('.percent-input').forEach(input => {
            this.formatarInputPercentual(input, config);
        });
    },
    
    /**
     * Configura automaticamente a formatação para todos os inputs
     * @param {ConfiguracaoSplitPayment} config - Configuração do Split Payment
     */
    configurarTodosInputs(config) {
        this.configurarInputsMonetarios(config);
        this.configurarInputsPercentuais(config);
    }
};
// Exportar para o escopo global para ser acessível
window.FormatacaoHelper = FormatacaoHelper;