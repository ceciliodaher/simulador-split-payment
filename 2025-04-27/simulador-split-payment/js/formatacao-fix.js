/**
 * formatacao-fix.js - Correção para problemas de formatação
 * © 2025 Expertzy Inteligência Tributária
 */

document.addEventListener('DOMContentLoaded', function() {
    // Obtém a instância de configuração existente (global ou do SimuladorApp)
    const config = window.configuracaoSplitPayment || 
                  (window.SimuladorApp && window.SimuladorApp.config);
    
    if (!config) {
        console.error('Configuração não encontrada. A correção não pode ser aplicada.');
        return;
    }
    
    // Remove os listeners antigos dos campos monetários
    document.querySelectorAll('.money-input').forEach(input => {
        // Cria um clone do elemento para remover todos os listeners
        const clone = input.cloneNode(true);
        if (input.parentNode) {
            input.parentNode.replaceChild(clone, input);
        }
        
        // Adiciona os novos listeners melhorados
        configurarInputMonetario(clone, config);
    });
    
    // Remove os listeners antigos dos campos percentuais
    document.querySelectorAll('.percent-input').forEach(input => {
        // Cria um clone do elemento para remover todos os listeners
        const clone = input.cloneNode(true);
        if (input.parentNode) {
            input.parentNode.replaceChild(clone, input);
        }
        
        // Adiciona os novos listeners melhorados
        configurarInputPercentual(clone, config);
    });
    
    // Reconecta os eventos de cálculo automático que podem ter sido perdidos
    reconectarCalculosAutomaticos();
    
    console.log('Correção de formatação aplicada com sucesso.');
});

/**
 * Configura formatação para campos monetários
 * @param {HTMLInputElement} input - Campo de entrada
 * @param {Object} config - Objeto de configuração
 */
function configurarInputMonetario(input, config) {
    // Verifica se o campo existe
    if (!input) return;
    
    // Evento ao ganhar foco - remove formatação para facilitar edição
    input.addEventListener('focus', function() {
        // Se o valor for R$ 0,00 ou vazio, limpar completamente
        if (this.value === 'R$ 0,00' || this.value === '') {
            this.value = '';
            return;
        }
        
        // Remove R$ e pontos, mantém apenas o valor numérico com vírgula
        let valor = this.value.replace(/R\$\s?/g, '')
                             .replace(/\./g, '');
        
        this.value = valor;
        
        // Posicionar cursor no final
        setTimeout(() => {
            this.selectionStart = this.selectionEnd = this.value.length;
        }, 10);
    });
    
    // Permite apenas digitação de números e uma vírgula
    input.addEventListener('input', function(e) {
        // Guarda a posição do cursor
        const start = this.selectionStart;
        const end = this.selectionEnd;
        
        // Remove caracteres inválidos (mantém números, vírgula e pontos)
        const valorOriginal = this.value;
        let valorLimpo = valorOriginal.replace(/[^\d,.]/g, '');
        
        // Verifica se precisa atualizar o valor
        if (valorLimpo !== valorOriginal) {
            this.value = valorLimpo;
            
            // Restaura a posição do cursor
            this.setSelectionRange(
                start - (valorOriginal.length - valorLimpo.length),
                end - (valorOriginal.length - valorLimpo.length)
            );
        }
    });
    
    // Ao sair do campo, formata adequadamente
    input.addEventListener('blur', function() {
        // Converte para número
        let valor = this.value.replace(/\./g, '')
                            .replace(',', '.');
        
        valor = parseFloat(valor);
        
        // Se for um número válido, formata como moeda
        if (!isNaN(valor) && valor > 0) {
            this.value = 'R$ ' + valor.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } else {
            // Se não for válido ou for zero
            this.value = '';
        }
    });
}

/**
 * Configura formatação para campos percentuais
 * @param {HTMLInputElement} input - Campo de entrada
 * @param {Object} config - Objeto de configuração
 */
function configurarInputPercentual(input, config) {
    // Verifica se o campo existe
    if (!input) return;
    
    // Evento ao ganhar foco - remove formatação para facilitar edição
    input.addEventListener('focus', function() {
        // Se o valor for 0,00% ou vazio, limpar completamente
        if (this.value === '0,00%' || this.value === '') {
            this.value = '';
            return;
        }
        
        // Remove % e mantém apenas o valor numérico com vírgula
        let valor = this.value.replace(/%/g, '').trim();
        
        this.value = valor;
        
        // Posicionar cursor no final
        setTimeout(() => {
            this.selectionStart = this.selectionEnd = this.value.length;
        }, 10);
    });
    
    // Permite apenas digitação de números e uma vírgula
    input.addEventListener('input', function(e) {
        // Guarda a posição do cursor
        const start = this.selectionStart;
        const end = this.selectionEnd;
        
        // Remove caracteres inválidos (mantém números, vírgula e pontos)
        const valorOriginal = this.value;
        let valorLimpo = valorOriginal.replace(/[^\d,.]/g, '');
        
        // Verifica se precisa atualizar o valor
        if (valorLimpo !== valorOriginal) {
            this.value = valorLimpo;
            
            // Restaura a posição do cursor
            this.setSelectionRange(
                start - (valorOriginal.length - valorLimpo.length),
                end - (valorOriginal.length - valorLimpo.length)
            );
        }
    });
    
    // Ao sair do campo, formata adequadamente
    input.addEventListener('blur', function() {
        // Converte para número
        let valor = this.value.replace(/\./g, '')
                            .replace(',', '.');
        
        valor = parseFloat(valor);
        
        // Se for um número válido, formata como percentual
        if (!isNaN(valor) && valor > 0) {
            this.value = valor.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + '%';
        } else {
            // Se não for válido ou for zero
            this.value = '';
        }
    });
}

/**
 * Reconecta os cálculos automáticos que podem ter sido perdidos
 */
function reconectarCalculosAutomaticos() {
    // Recalcular ciclo financeiro quando PMR, PMP ou PME mudar
    const pmrInput = document.getElementById('pmr');
    const pmpInput = document.getElementById('pmp');
    const pmeInput = document.getElementById('pme');
    const cicloFinanceiroInput = document.getElementById('ciclo-financeiro');
    
    function atualizarCicloFinanceiro() {
        if (pmrInput && pmpInput && pmeInput && cicloFinanceiroInput) {
            const pmr = parseInt(pmrInput.value) || 0;
            const pmp = parseInt(pmpInput.value) || 0;
            const pme = parseInt(pmeInput.value) || 0;
            
            const ciclo = pmr + pme - pmp;
            cicloFinanceiroInput.value = ciclo;
        }
    }
    
    if (pmrInput) pmrInput.addEventListener('input', atualizarCicloFinanceiro);
    if (pmrInput) pmrInput.addEventListener('blur', atualizarCicloFinanceiro);
    if (pmpInput) pmpInput.addEventListener('input', atualizarCicloFinanceiro);
    if (pmpInput) pmpInput.addEventListener('blur', atualizarCicloFinanceiro);
    if (pmeInput) pmeInput.addEventListener('input', atualizarCicloFinanceiro);
    if (pmeInput) pmeInput.addEventListener('blur', atualizarCicloFinanceiro);
    
    // Calcular vendas a prazo a partir das vendas à vista
    const percVistaInput = document.getElementById('perc-vista');
    const percPrazoInput = document.getElementById('perc-prazo');
    
    function atualizarPercPrazo() {
        if (percVistaInput && percPrazoInput) {
            let percVista = 0;
            
            // Extrai o valor numérico
            const valorVista = percVistaInput.value.replace(/%/g, '').trim();
            if (valorVista) {
                percVista = parseFloat(valorVista.replace(',', '.')) / 100;
            }
            
            // Calcula o percentual complementar
            const percPrazo = 1 - percVista;
            
            // Formata o resultado
            percPrazoInput.value = (percPrazo * 100).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + '%';
        }
    }
    
    if (percVistaInput) {
        percVistaInput.addEventListener('input', atualizarPercPrazo);
        percVistaInput.addEventListener('blur', atualizarPercPrazo);
    }
    
    // Inicializar com valores padrão se necessário
    if (percVistaInput && !percVistaInput.value) {
        percVistaInput.value = "30,00%";
        atualizarPercPrazo();
    }
    
    // Realizar cálculo inicial
    atualizarCicloFinanceiro();
    atualizarPercPrazo();
}