/**
 * App.js
 * Inicialização e coordenação do Simulador de Impacto do Split Payment
 * © 2025 Expertzy Inteligência Tributária
 */

// Função de inicialização principal
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando simulador...');
    
    // Inicializar o repositório central
    if (typeof SimuladorRepository !== 'undefined') {
        SimuladorRepository.carregar();
    } else {
        console.error('SimuladorRepository não encontrado. Verifique se repository.js foi carregado corretamente.');
    }
    
    // Inicializar sistema de navegação
    inicializarNavegacao();
    
    // Inicializar observadores para manter sincronização
    inicializarObservadores();
    
    // Inicializar controladores para cada aba
    if (typeof ConfiguracoesGeraisController !== 'undefined') {
        ConfiguracoesGeraisController.inicializar();
    } else {
        console.error('ConfiguracoesGeraisController não encontrado. Verifique se config-controller.js foi carregado corretamente.');
    }
    
    // Inicializar interações entre abas
    inicializarInteracoesEntreAbas();
    
    // Inicializar na aba de configurações gerais
    const tabInicial = document.querySelector('.tab-button[data-tab="configuracoes-gerais"]');
    if (tabInicial) {
        tabInicial.click();
    } else {
        console.error('Botão da aba inicial não encontrado.');
    }
    
    console.log('Simulador inicializado com sucesso');
});

// Função para inicializar o sistema de navegação por abas
//function inicializarNavegacao() {
//    console.log('Inicializando sistema de navegação...');
    
//    const tabButtons = document.querySelectorAll('.tab-button');
//    const tabContents = document.querySelectorAll('.tab-content');
    
//    if (tabButtons.length === 0) {
//        console.error('Nenhum botão de aba encontrado.');
//        return;
//    }
    
//    if (tabContents.length === 0) {
//        console.error('Nenhum conteúdo de aba encontrado.');
//        return;
//    }
    
//    console.log(`Encontrados ${tabButtons.length} botões e ${tabContents.length} conteúdos de abas.`);
    
//    tabButtons.forEach(button => {
//        button.addEventListener('click', function() {
//            console.log(`Clique na aba: ${this.getAttribute('data-tab')}`);
            
            // Remover classe active de todas as abas
//            tabButtons.forEach(btn => btn.classList.remove('active'));
//            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active à aba clicada
//            this.classList.add('active');
            
            // Mostrar conteúdo correspondente
//            const tabId = this.getAttribute('data-tab');
//            const content = document.getElementById(tabId);
//            if (content) {
//                content.classList.add('active');
//                console.log(`Ativando conteúdo: ${tabId}`);
//            } else {
//                console.error(`Conteúdo de aba não encontrado para o ID: ${tabId}`);
//            }
            
            // Atualizar estado da interface, se o repositório estiver disponível
//            if (typeof SimuladorRepository !== 'undefined') {
//                SimuladorRepository.atualizarCampo('interfaceState', 'tabAtiva', tabId);
//            }
            
//            // Executar ações específicas para a aba
//            aoMudarAba(tabId);
//        });
//    });
    
//    console.log('Sistema de navegação inicializado com sucesso.');
//}

// Ações ao mudar de aba
function aoMudarAba(tabId) {
    console.log(`Aba alterada para: ${tabId}`);
    
    switch (tabId) {
        case 'configuracoes-gerais':
            // Garantir que os dados estão atualizados
            if (typeof ConfiguracoesGeraisController !== 'undefined') {
                ConfiguracoesGeraisController.inicializar();
            }
            break;
            
        case 'configuracoes-setoriais':
            // Verificar se config gerais foram preenchidas
            if (verificarPrecondição('empresa', ['nome', 'setor', 'regime'], 'configuracoes-gerais')) {
                // Inicializar ConfiguracoesSetoriais (se disponível)
                if (typeof SimuladorApp !== 'undefined' && SimuladorApp.ConfiguracoesSetoriais) {
                    SimuladorApp.ConfiguracoesSetoriais.inicializar();
                }
            }
            break;
            
        case 'simulacao-principal':
            // Verificar se configs necessárias foram preenchidas
            if (verificarPrecondição('empresa', ['nome', 'setor', 'regime'], 'configuracoes-gerais')) {
                // Inicializar SimulacaoPrincipalController (se disponível)
                if (typeof SimulacaoPrincipalController !== 'undefined') {
                    SimulacaoPrincipalController.inicializar();
                }
            }
            break;
            
        case 'estrategias-mitigacao':
            // Verificar se simulação foi realizada
            if (verificarSimulacaoRealizada()) {
                // Inicializar controlador específico, se disponível
                if (typeof EstrategiasController !== 'undefined') {
                    EstrategiasController.inicializar();
                }
            }
            break;
            
        case 'memoria-calculo':
            // Verificar se simulação foi realizada
            if (verificarSimulacaoRealizada()) {
                // Inicializar controlador específico, se disponível
                if (typeof MemoriaController !== 'undefined') {
                    MemoriaController.inicializar();
                }
            }
            break;
            
        case 'ajuda-documentacao':
            // Inicializar sistema de ajuda (se disponível)
            if (typeof AjudaController !== 'undefined') {
                AjudaController.inicializar();
            }
            break;
    }
}

// Verificar se pré-condições foram atendidas
function verificarPrecondição(secao, campos, abaRedirecionamento) {
    // Se o repositório não estiver disponível, permitir a navegação
    if (typeof SimuladorRepository === 'undefined') {
        console.warn('SimuladorRepository não disponível para verificar pré-condições.');
        return true;
    }
    
    const dados = SimuladorRepository.obterSecao(secao);
    
    // Verificar se todos os campos obrigatórios foram preenchidos
    const camposFaltantes = campos.filter(campo => !dados[campo]);
    
    if (camposFaltantes.length > 0) {
        console.warn(`Campos faltantes: ${camposFaltantes.join(', ')}`);
        alert(`É necessário preencher ${camposFaltantes.join(', ')} na aba ${abaRedirecionamento} antes de prosseguir.`);
        document.querySelector(`.tab-button[data-tab="${abaRedirecionamento}"]`).click();
        return false;
    }
    
    return true;
}

// Verificar se simulação foi realizada
function verificarSimulacaoRealizada() {
    // Se o repositório não estiver disponível, permitir a navegação
    if (typeof SimuladorRepository === 'undefined') {
        console.warn('SimuladorRepository não disponível para verificar simulação.');
        return true;
    }
    
    const interfaceState = SimuladorRepository.obterSecao('interfaceState');
    const resultadosSimulacao = SimuladorRepository.obterSecao('resultadosSimulacao');
    
    if (!interfaceState.simulacaoRealizada || !resultadosSimulacao.impactoBase) {
        alert('É necessário realizar uma simulação antes de acessar esta funcionalidade.');
        document.querySelector('.tab-button[data-tab="simulacao-principal"]').click();
        return false;
    }
    
    return true;
}

// Inicializar observadores para sincronização de dados
function inicializarObservadores() {
    // Se o repositório não estiver disponível, pular esta etapa
    if (typeof SimuladorRepository === 'undefined') {
        console.warn('SimuladorRepository não disponível para inicializar observadores.');
        return;
    }
    
    // Observar mudanças nos setores para atualizar dropdowns
    SimuladorRepository.observar('setoresEspeciais', function(setores) {
        console.log('Setores atualizados, atualizando dropdowns...');
        
        // Atualizar dropdown na aba de configurações gerais
        if (typeof ConfiguracoesGeraisController !== 'undefined' && 
            typeof ConfiguracoesGeraisController.inicializarDropdownSetores === 'function') {
            ConfiguracoesGeraisController.inicializarDropdownSetores();
        }
        
        // Atualizar dropdown na aba de simulação
        if (typeof SimulacaoPrincipalController !== 'undefined' && 
            typeof SimulacaoPrincipalController.atualizarDropdownSetores === 'function') {
            SimulacaoPrincipalController.atualizarDropdownSetores();
        }
    });
    
    // Observar mudanças na empresa para atualizar interface de simulação
    SimuladorRepository.observar('empresa', function(dadosEmpresa) {
        console.log('Dados da empresa atualizados, atualizando interface de simulação...');
        
        // Verificar se a aba de simulação está ativa
        const tabAtiva = SimuladorRepository.obterSecao('interfaceState').tabAtiva;
        if (tabAtiva === 'simulacao-principal' && 
            typeof SimulacaoPrincipalController !== 'undefined' && 
            typeof SimulacaoPrincipalController.carregarDados === 'function') {
            // Recarregar dados na interface
            SimulacaoPrincipalController.carregarDados();
        }
    });
}

// Inicializar interações entre abas
function inicializarInteracoesEntreAbas() {
    // Botão para editar configurações na aba de simulação
    const btnEditarSetor = document.getElementById('btn-editar-setor');
    if (btnEditarSetor) {
        btnEditarSetor.addEventListener('click', () => {
            const tabButton = document.querySelector('.tab-button[data-tab="configuracoes-gerais"]');
            if (tabButton) {
                tabButton.click();
            } else {
                console.error('Botão da aba de configurações gerais não encontrado.');
            }
        });
    }
    
    // Botão voltar para configurações
    const btnVoltarConfig = document.getElementById('btn-voltar-config');
    if (btnVoltarConfig) {
        btnVoltarConfig.addEventListener('click', () => {
            const tabButton = document.querySelector('.tab-button[data-tab="configuracoes-gerais"]');
            if (tabButton) {
                tabButton.click();
            } else {
                console.error('Botão da aba de configurações gerais não encontrado.');
            }
        });
    }
}