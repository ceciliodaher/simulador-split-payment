/**
 * Controlador Principal do Simulador de Split Payment
 * Responsável pela integração entre os diversos módulos
 */
const SimuladorApp = (function() {
    // Armazenar instâncias dos principais componentes
    let configuracao;
    let simulador;
    let analisador;
    let visualizador;
    let exportador;
    let dadosFormulario = {};
    let resultadosSimulacao = {};
    
    // Carregar conteúdo de abas dinamicamente
    async function carregarAba(abaId) {
        if (abaId === 'simulacao-principal') return; // Já carregada no HTML principal
        
        const abaElement = document.getElementById(abaId);
        if (abaElement && abaElement.dataset.carregada !== 'true') {
            try {
                const resposta = await fetch(`templates/${abaId}.html`);
                const conteudo = await resposta.text();
                abaElement.innerHTML = conteudo;
                abaElement.dataset.carregada = 'true';
                
                // Inicializar funcionalidades específicas da aba
                inicializarAba(abaId);
                
                console.log(`Aba ${abaId} carregada com sucesso`);
            } catch (erro) {
                console.error(`Erro ao carregar aba ${abaId}:`, erro);
                abaElement.innerHTML = `<p class="error">Erro ao carregar conteúdo. Por favor, tente novamente.</p>`;
            }
        }
    }
    
    // Inicializar funcionalidades específicas de cada aba
    function inicializarAba(abaId) {
        switch(abaId) {
            case 'configuracoes-setoriais':
                inicializarConfiguracoesSetoriais();
                break;
            case 'estrategias-mitigacao':
                inicializarEstrategiasMitigacao();
                break;
            case 'memoria-calculo':
                inicializarMemoriaCalculo();
                break;
            case 'ajuda-documentacao':
                inicializarAjudaDocumentacao();
                break;
        }
    }
    
    // Inicializar a aba de Configurações Setoriais
    function inicializarConfiguracoesSetoriais() {
        // Carregar dados setoriais
        fetch('data/setores.json')
            .then(response => response.json())
            .then(dados => {
                configuracao.setores_especiais = dados;
                atualizarInterfaceSetoriais();
            })
            .catch(erro => console.error('Erro ao carregar dados setoriais:', erro));
            
        // Adicionar events listeners específicos
        document.getElementById('btn-adicionar-setor')?.addEventListener('click', adicionarSetor);
        document.getElementById('btn-restaurar-cronograma')?.addEventListener('click', restaurarCronogramaPadrao);
        // ...outros listeners
    }
    
    // Inicializar a aba de Estratégias de Mitigação
    function inicializarEstrategiasMitigacao() {
        // Adicionar event listeners para os checkboxes de estratégias
        const checkboxes = document.querySelectorAll('input[name="estrategias"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                toggleEstrategia(this.value, this.checked);
            });
        });
        
        // Event listeners para botões
        document.getElementById('btn-simular-estrategias')?.addEventListener('click', simularEstrategias);
        document.getElementById('btn-comparar')?.addEventListener('click', compararEficacia);
    }
    
    // Inicializar a aba de Memória de Cálculo
    function inicializarMemoriaCalculo() {
        // Adicionar event listeners para filtros e controles
        document.getElementById('cenario-select')?.addEventListener('change', atualizarMemoriaCalculo);
        document.getElementById('periodo-select')?.addEventListener('change', atualizarMemoriaCalculo);
        
        // Event listeners para exportação
        document.getElementById('btn-exportar-txt')?.addEventListener('click', exportarMemoriaTxt);
        document.getElementById('btn-exportar-pdf')?.addEventListener('click', exportarMemoriaPdf);
    }
    
    // Inicializar a aba de Ajuda e Documentação
    function inicializarAjudaDocumentacao() {
        // Adicionar event listeners para navegação na ajuda
        const navLinks = document.querySelectorAll('.help-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                navegarAjuda(this.getAttribute('data-target'));
            });
        });
    }
    
    // Inicializar o simulador
    function init() {
        // Criar instâncias dos componentes principais
        configuracao = new ConfiguracaoSplitPayment();
        simulador = new SimuladorFluxoCaixa(configuracao);
        analisador = new AnalisadorImpacto(simulador);
        visualizador = new GeradorGraficos();
        exportador = new ExportadorRelatorios();
        
        // Inicializar sistema de navegação
        TabNavigationSystem.initialize({
            onTabChange: function(tabId) {
                carregarAba(tabId);
            }
        });
        
        // Configurar listeners para o formulário principal
        const btnSimular = document.getElementById('btn-simular');
        if (btnSimular) {
            btnSimular.addEventListener('click', function(e) {
                e.preventDefault();
                executarSimulacao();
            });
        }
        
        console.log('Simulador de Split Payment inicializado com sucesso');
    }
    
    // Coletar dados do formulário
    function coletarDadosFormulario() {
        dadosFormulario = {
            faturamento: parseFloat(document.getElementById('faturamento').value),
            periodo: document.querySelector('input[name="periodo"]:checked').value,
            setor: document.getElementById('setor').value,
            regime: document.getElementById('regime').value,
            margem: parseFloat(document.getElementById('margem').value) / 100,
            pmr: parseInt(document.getElementById('pmr').value),
            pmp: parseInt(document.getElementById('pmp').value),
            pme: parseInt(document.getElementById('pme').value),
            percVista: parseFloat(document.getElementById('perc-vista').value) / 100,
            percPrazo: parseFloat(document.getElementById('perc-prazo').value) / 100,
            aliquota: parseFloat(document.getElementById('aliquota').value) / 100,
            tipoOperacao: document.getElementById('tipo-operacao').value,
            creditos: parseFloat(document.getElementById('creditos').value),
            dataInicial: document.getElementById('data-inicial').value,
            dataFinal: document.getElementById('data-final').value,
            cenario: document.getElementById('cenario').value,
            taxaCrescimento: document.getElementById('cenario').value === 'personalizado' ? 
                parseFloat(document.getElementById('taxa-crescimento').value) / 100 : null
        };
        
        return dadosFormulario;
    }
    
    // Executar simulação principal
    function executarSimulacao() {
        // Coletar dados do formulário
        const dados = coletarDadosFormulario();
        
        // Executar simulação
        resultadosSimulacao = {
            fluxoAtual: simulador.calcularFluxoCaixaAtual(dados),
            fluxoSplit: simulador.calcularFluxoCaixaSplitPayment(dados),
            impacto: simulador.calcularImpactoCapitalGiro(dados),
            projecao: simulador.simularPeriodoTransicao(dados, 
                      parseInt(dados.dataInicial.substring(0, 4)), 
                      parseInt(dados.dataFinal.substring(0, 4)))
        };
        
        // Exibir resultados
        exibirResultadosSimulacao();
        
        // Atualizar memória de cálculo
        atualizarMemoriaCalculoAtual();
    }
    
    // Exibir resultados da simulação
    function exibirResultadosSimulacao() {
        // Criar área de resultados se não existir
        let resultadosDiv = document.getElementById('resultados');
        if (!resultadosDiv) {
            resultadosDiv = document.createElement('div');
            resultadosDiv.id = 'resultados';
            resultadosDiv.className = 'group-box';
            document.getElementById('simulacao-form').appendChild(resultadosDiv);
        }
        
        // Montar conteúdo HTML com os resultados
        let conteudoHTML = `
            <h3>Resultados da Simulação</h3>
            <div class="form-row">
                <div class="form-column">
                    <div class="form-group">
                        <label>Impacto no Capital de Giro:</label>
                        <div class="input-group">
                            <input type="text" value="R$ ${resultadosSimulacao.impacto.impactoValor.toFixed(2)}" readonly>
                        </div>
                    </div>
                </div>
                <div class="form-column">
                    <div class="form-group">
                        <label>Impacto Percentual:</label>
                        <div class="input-group">
                            <input type="text" value="${resultadosSimulacao.impacto.impactoPercentual.toFixed(2)}%" readonly>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="grafico-impacto" style="height: 300px; margin-top: 20px;"></div>
            
            <div style="margin-top: 20px;">
                <button type="button" class="primary" id="btn-estrategias">Analisar Estratégias de Mitigação</button>
                <button type="button" class="secondary" id="btn-detalhes">Ver Detalhes</button>
            </div>
        `;
        
        resultadosDiv.innerHTML = conteudoHTML;
        
        // Gerar gráfico de impacto
        visualizador.gerarGraficoImpacto(resultadosSimulacao, 'grafico-impacto');
        
        // Adicionar event listeners aos novos botões
        document.getElementById('btn-estrategias').addEventListener('click', function() {
            // Navegar para a aba de estratégias
            document.querySelector('.tab-button[data-tab="estrategias-mitigacao"]').click();
        });
        
        document.getElementById('btn-detalhes').addEventListener('click', function() {
            // Mostrar detalhes adicionais
            exibirDetalhesSimulacao();
        });
    }
    
    // Exibir detalhes adicionais da simulação
    function exibirDetalhesSimulacao() {
        // Implementação da exibição de detalhes
    }
    
    // Simular estratégias de mitigação
    function simularEstrategias() {
        // Implementação da simulação de estratégias
    }
    
    // Comparar eficácia das estratégias
    function compararEficacia() {
        // Implementação da comparação de eficácia
    }
    
    // Atualizar memória de cálculo
    function atualizarMemoriaCalculoAtual() {
        simulador.atualizarMemoriaCalculo();
    }
    
    // API pública
    return {
        init: init,
        getResultados: function() { return resultadosSimulacao; },
        getDadosFormulario: function() { return dadosFormulario; }
    };
})();

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', SimuladorApp.init);
// Dentro do módulo SimuladorApp
// Adicionar novo listener para o evento tabContentLoaded
document.addEventListener('tabContentLoaded', function(e) {
    const tabId = e.detail.tabId;
    inicializarComponentesAba(tabId);
});

// Função para inicializar componentes específicos de cada aba após seu carregamento
function inicializarComponentesAba(tabId) {
    switch(tabId) {
        case 'simulacao-principal':
            inicializarFormularioPrincipal();
            break;
        case 'configuracoes-setoriais':
            inicializarConfiguracoesSetoriais();
            break;
        case 'estrategias-mitigacao':
            inicializarEstrategiasMitigacao();
            break;
        case 'memoria-calculo':
            inicializarMemoriaCalculo();
            break;
        case 'ajuda-documentacao':
            inicializarAjudaDocumentacao();
            break;
    }
}