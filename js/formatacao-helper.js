/**
 * FormatacaoHelper - Utilitários para formatação e manipulação de valores
 * monetários e percentuais para o Simulador de Impacto do Split Payment
 * 
 * © 2025 Expertzy Inteligência Tributária
 */
const FormatacaoHelper = {
    /**
     * Formata um número como valor monetário no padrão brasileiro
     * @param {Number} valor - Valor a ser formatado
     * @returns {String} - Valor formatado (sem o prefixo R$)
     */
    formatarBR(valor) {
        return valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },
    
    /**
     * Formata um campo de input como valor monetário
     * @param {HTMLInputElement} input - Campo de input a ser formatado
     */
    formatarMoeda(input) {
        let valor = input.value.replace(/\D/g, '');
        
        if (!valor) {
            input.value = 'R$ 0,00';
            return;
        }
        
        const valorNumerico = parseFloat(valor) / 100;
        input.value = 'R$ ' + this.formatarBR(valorNumerico);
    },
    
    /**
     * Extrai o valor numérico de um texto formatado como moeda
     * @param {String} valorFormatado - Texto formatado (ex: "R$ 1.234,56")
     * @returns {Number} - Valor numérico (ex: 1234.56)
     */
    extrairValorNumerico(valorFormatado) {
        if (!valorFormatado) return 0;
        
        // Remover todos os caracteres não-numéricos, exceto vírgula ou ponto
        let valor = valorFormatado.replace(/[^\d,\.]/g, '');
        
        // Substituir vírgula por ponto para conversão correta
        valor = valor.replace(/\./g, '').replace(',', '.');
        
        return parseFloat(valor) || 0;
    },
    
    /**
     * Inicializa os campos monetários na página
     */
    inicializarCamposMonetarios() {
        console.log('Inicializando campos monetários');
        
        const camposMoeda = [
            'faturamento',
            'creditos'
        ];
        
        camposMoeda.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                console.log(`Configurando campo monetário: ${campoId}`);
                
                // Definir valor inicial
                if (!campo.value || campo.value.trim() === '') {
                    campo.value = 'R$ 0,00';
                }
                
                // Remover event listeners existentes para evitar duplicação
                const clone = campo.cloneNode(true);
                if (campo.parentNode) {
                    campo.parentNode.replaceChild(clone, campo);
                }
                
                // Converter para tipo text se for number
                if (clone.type === 'number') {
                    clone.type = 'text';
                }
                
                // Adicionar classes necessárias
                clone.classList.add('money-input');
                
                // Adicionar event listeners para formatação
                clone.addEventListener('input', function() {
                    FormatacaoHelper.formatarMoeda(this);
                });
                
                clone.addEventListener('focus', function() {
                    // Selecionar todo o conteúdo ao receber foco
                    setTimeout(() => this.select(), 0);
                });
                
                clone.addEventListener('blur', function() {
                    // Garantir que o campo não fique vazio ao perder foco
                    if (!this.value || this.value === 'R$' || this.value === 'R$ ') {
                        this.value = 'R$ 0,00';
                    }
                });
                
                // Chamamos uma vez no início para garantir formatação inicial
                FormatacaoHelper.formatarMoeda(clone);
            } else {
                console.warn(`Campo monetário não encontrado: ${campoId}`);
            }
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
        // Inicializar campos monetários diretamente
        this.inicializarCamposMonetarios();
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

// Disponibilizar objeto globalmente
window.FormatacaoHelper = FormatacaoHelper;

// Inicializar automaticamente após o carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando formatação monetária');
    FormatacaoHelper.inicializarCamposMonetarios();
});