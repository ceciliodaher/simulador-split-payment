/**
 * Integração da formatação monetária com o Simulador de Split Payment
 * 
 * Este código modifica o comportamento do simulador para utilizar
 * a nova implementação de formatação monetária automática.
 * 
 * © 2025 Expertzy Inteligência Tributária
 */

// Quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('Integrando formatação monetária ao simulador');
    
    // Inicializar formatação monetária
    if (window.FormatacaoMonetaria) {
        FormatacaoMonetaria.inicializarFormatacaoMonetaria();
    } else {
        console.error('Módulo FormatacaoMonetaria não encontrado!');
    }
    
    // Modificar o SimuladorApp.inicializar para usar a nova formatação monetária
    if (window.SimuladorApp && typeof SimuladorApp.inicializar === 'function') {
        // Armazenar a função de inicialização original
        const inicializarOriginal = SimuladorApp.inicializar;
        
        // Substituir pela nova função que utiliza a nova formatação
        SimuladorApp.inicializar = function() {
            console.log('Inicializando Simulador de Impacto do Split Payment com nova formatação monetária...');
            
            // Chamar a função original
            inicializarOriginal.call(this);
            
            // Substituir a formatação monetária
            this.formatarMoeda = function(valor, incluirSimbolo = true) {
                if (valor === undefined || valor === null || isNaN(valor)) {
                    return incluirSimbolo ? `R$ 0,00` : '0,00';
                }
                
                // Usar o formatador da nova implementação
                return incluirSimbolo 
                    ? `R$ ${FormatacaoMonetaria.formatarBR(valor)}`
                    : FormatacaoMonetaria.formatarBR(valor);
            };
            
            // Substituir a função de conversão de moeda para número
            this.converterMoedaParaNumero = function(valorFormatado) {
                return FormatacaoMonetaria.extrairValorNumerico(valorFormatado);
            };
            
            // Atualizar os campos monetários com a nova formatação
            if (window.FormatacaoMonetaria) {
                // Lista de campos que devem usar a formatação monetária
                const camposMoedaSimulador = ['faturamento', 'creditos'];
                
                // Formatar campos específicos
                FormatacaoMonetaria.formatarCamposMonetariosEspecificos(
                    camposMoedaSimulador, 
                    this.config
                );
            }
            
            console.log('Formatação monetária aplicada ao simulador com sucesso');
        };
        
        // Modificar método coletarDadosFormulario
        const coletarDadosFormularioOriginal = SimuladorApp.coletarDadosFormulario;
        
        SimuladorApp.coletarDadosFormulario = function() {
            // Extrair valores antes de coletar os dados para garantir
            // que os valores numéricos sejam obtidos corretamente
            const camposFaturamento = document.getElementById('faturamento');
            const camposCreditos = document.getElementById('creditos');
            
            if (camposFaturamento) {
                camposFaturamento.dataset.valorNumerico = 
                    FormatacaoMonetaria.extrairValorNumerico(camposFaturamento.value);
            }
            
            if (camposCreditos) {
                camposCreditos.dataset.valorNumerico = 
                    FormatacaoMonetaria.extrairValorNumerico(camposCreditos.value);
            }
            
            // Chamar a função original
            const dados = coletarDadosFormularioOriginal.call(this);
            
            // Garantir que os valores sejam numéricos
            if (camposFaturamento && camposFaturamento.dataset.valorNumerico) {
                dados.faturamento = parseFloat(camposFaturamento.dataset.valorNumerico);
            }
            
            if (camposCreditos && camposCreditos.dataset.valorNumerico) {
                dados.creditos = parseFloat(camposCreditos.dataset.valorNumerico);
            }
            
            return dados;
        };
    } else {
        console.error('SimuladorApp não encontrado ou não possui método inicializar!');
    }
    
    console.log('Integração da formatação monetária concluída');
});
