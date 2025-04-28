/**
 * Controlador específico para a aba de Simulação Principal
 */
const SimulacaoPrincipalController = (function() {
    // Funções transferidas do HTML
    function calcularCicloFinanceiro() {
        const pmr = parseFloat(document.getElementById('pmr').value) || 0;
        const pme = parseFloat(document.getElementById('pme').value) || 0;
        const pmp = parseFloat(document.getElementById('pmp').value) || 0;
        
        const ciclo = pmr + pme - pmp;
        document.getElementById('ciclo-financeiro').value = ciclo;
    }

    function calcularVendasPrazo() {
        const percVista = parseFloat(document.getElementById('perc-vista').value) || 0;
        const percPrazo = 100 - percVista;
        document.getElementById('perc-prazo').value = percPrazo;
    }

    function toggleCenarioPersonalizado() {
        const cenarioSelect = document.getElementById('cenario');
        const cenarioPersonalizado = document.getElementById('cenario-personalizado');
        
        if (cenarioSelect.value === 'personalizado') {
            cenarioPersonalizado.style.display = 'block';
        } else {
            cenarioPersonalizado.style.display = 'none';
        }
    }

    // Função de inicialização
    function initialize() {
        // Verificar se os elementos existem antes de adicionar event listeners
        if (!document.getElementById('pmr')) {
            console.error('Elementos do formulário não encontrados. A aba foi carregada corretamente?');
            return false;
        }

        // Inicializar cálculos
        calcularCicloFinanceiro();
        calcularVendasPrazo();

        // Event Listeners para recalcular quando os valores mudarem
        document.getElementById('pmr').addEventListener('input', calcularCicloFinanceiro);
        document.getElementById('pme').addEventListener('input', calcularCicloFinanceiro);
        document.getElementById('pmp').addEventListener('input', calcularCicloFinanceiro);
        document.getElementById('perc-vista').addEventListener('input', calcularVendasPrazo);
        document.getElementById('cenario').addEventListener('change', toggleCenarioPersonalizado);

        // O event listener para o botão Simular será adicionado pelo controlador principal
        console.log('Controlador da Simulação Principal inicializado');
        return true;
    }

    // API pública
    return {
        initialize: initialize,
        recalcularCampos: function() {
            calcularCicloFinanceiro();
            calcularVendasPrazo();
        }
    };
})();

// Não inicializar automaticamente - será feito pelo loader.js quando o conteúdo for carregado