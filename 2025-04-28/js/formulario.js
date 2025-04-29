// js/formulario.js
(function() {
    // Cálculo automático do ciclo financeiro
    function atualizarCicloFinanceiro() {
        const pmr = parseInt(document.getElementById('pmr').value) || 0;
        const pme = parseInt(document.getElementById('pme').value) || 0;
        const pmp = parseInt(document.getElementById('pmp').value) || 0;
        
        const ciclo = pmr + pme - pmp;
        document.getElementById('ciclo-financeiro').value = ciclo;
    }

    // Cálculo do percentual de vendas a prazo
    function atualizarPercPrazo() {
        const percVista = parseFloat(document.getElementById('perc-vista').value) || 0;
        const percPrazo = 100 - percVista;
        document.getElementById('perc-prazo').value = percPrazo.toFixed(1);
    }

    // Mostrar/ocultar cenário personalizado
    function toggleCenarioPersonalizado() {
        const cenarioSelect = document.getElementById('cenario');
        const cenarioPersonalizado = document.getElementById('cenario-personalizado');
        
        if (cenarioSelect.value === 'personalizado') {
            cenarioPersonalizado.style.display = 'block';
        } else {
            cenarioPersonalizado.style.display = 'none';
        }
    }

    // Inicializar formulário
    function inicializarFormulario() {
        // Inicializar cálculos
        atualizarCicloFinanceiro();
        atualizarPercPrazo();
        
        // Adicionar event listeners
        document.getElementById('pmr').addEventListener('input', atualizarCicloFinanceiro);
        document.getElementById('pme').addEventListener('input', atualizarCicloFinanceiro);
        document.getElementById('pmp').addEventListener('input', atualizarCicloFinanceiro);
        document.getElementById('perc-vista').addEventListener('input', atualizarPercPrazo);
        document.getElementById('cenario').addEventListener('change', toggleCenarioPersonalizado);
    }

    // Expor funções que precisam ser acessadas por outros módulos
    window.Formulario = {
        inicializar: inicializarFormulario,
        atualizarCicloFinanceiro: atualizarCicloFinanceiro,
        atualizarPercPrazo: atualizarPercPrazo
    };

    // Inicializar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', inicializarFormulario);
})();