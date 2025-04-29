/**
 * tab-navigation.js
 * Sistema de navegação em abas para o Simulador de Impacto do Split Payment
 * Resolve problemas de navegação unificando a lógica em um único componente
 * © 2025 Expertzy Inteligência Tributária
 */

// Variáveis globais para o sistema de navegação
let currentTab = null; // Aba atual ativa
let tabHistory = []; // Histórico de navegação
const MAX_HISTORY = 10; // Tamanho máximo do histórico

// Esperar pelo carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('tab-navigation.js: Inicializando sistema de navegação');
    
    // Inicializar sistema de navegação em abas
    initTabNavigation();
    
    // Inicializar tratamento de eventos de teclas para navegação
    initKeyboardNavigation();
});

/**
 * Inicializa o sistema de navegação em abas
 */
function initTabNavigation() {
    // Selecionar todos os botões de aba e conteúdos
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Verificar se os elementos foram encontrados
    if (tabButtons.length === 0) {
        console.error('Sistema de abas: botões de aba não encontrados');
        return;
    }
    
    if (tabContents.length === 0) {
        console.error('Sistema de abas: conteúdos de aba não encontrados');
        return;
    }
    
    console.log(`Sistema de abas: ${tabButtons.length} botões e ${tabContents.length} conteúdos encontrados`);
    
    // Configurar listeners para cada botão de aba
    tabButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            // Prevenir comportamento padrão do link, se aplicável
            event.preventDefault();
            
            // Obter o ID da aba a ser ativada
            const targetTabId = this.getAttribute('data-tab');
            if (!targetTabId) {
                console.error('Sistema de abas: botão sem atributo data-tab');
                return;
            }
            
            // Ativar a aba clicada
            activateTab(targetTabId);
        });
    });
    
    // Verificar se há uma aba ativa armazenada no localStorage
    let startTab = null;
    
    // Verificar se o repositório está disponível para obter a última aba ativa
    if (typeof SimuladorRepository !== 'undefined') {
        try {
            const interfaceState = SimuladorRepository.obterSecao('interfaceState');
            if (interfaceState && interfaceState.tabAtiva) {
                startTab = interfaceState.tabAtiva;
                console.log(`Sistema de abas: recuperando última aba ativa: ${startTab}`);
            }
        } catch (e) {
            console.warn('Sistema de abas: erro ao acessar repositório:', e);
        }
    }
    
    // Se não houver aba ativa armazenada, usar a primeira aba
    if (!startTab && tabButtons.length > 0) {
        startTab = tabButtons[0].getAttribute('data-tab');
        console.log(`Sistema de abas: usando primeira aba como padrão: ${startTab}`);
    }
    
    // Ativar a aba inicial
    if (startTab) {
        activateTab(startTab);
    } else {
        console.error('Sistema de abas: não foi possível determinar a aba inicial');
    }
}

/**
 * Inicializa suporte à navegação por teclado (Ctrl+1, Ctrl+2, etc.)
 */
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // Verificar se Ctrl está pressionado e se a tecla é um número de 1 a 9
        if (event.ctrlKey && event.key >= '1' && event.key <= '9') {
            // Converter para índice baseado em zero
            const tabIndex = parseInt(event.key) - 1;
            
            // Selecionar a aba correspondente
            const tabButtons = document.querySelectorAll('.tab-button');
            if (tabIndex < tabButtons.length) {
                const targetButton = tabButtons[tabIndex];
                const targetTabId = targetButton.getAttribute('data-tab');
                
                if (targetTabId) {
                    event.preventDefault(); // Prevenir comportamento padrão do navegador
                    activateTab(targetTabId);
                }
            }
        }
    });
}

/**
 * Ativa uma aba específica
 * @param {string} tabId - ID da aba a ser ativada
 * @returns {boolean} - true se a aba foi ativada com sucesso, false caso contrário
 */
function activateTab(tabId) {
    if (!tabId) {
        console.error('Sistema de abas: ID de aba não especificado');
        return false;
    }
    
    console.log(`Sistema de abas: ativando aba ${tabId}`);
    
    // Verificar pré-condições para ativação da aba
    if (!checkTabPreconditions(tabId)) {
        return false;
    }
    
    // Selecionar todos os botões e conteúdos 
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Botão e conteúdo alvo
    const targetButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(tabId);
    
    // Verificar se os elementos alvo existem
    if (!targetButton) {
        console.error(`Sistema de abas: botão para aba "${tabId}" não encontrado`);
        return false;
    }
    
    if (!targetContent) {
        console.error(`Sistema de abas: conteúdo para aba "${tabId}" não encontrado`);
        return false;
    }
    
    // Desativar todas as abas
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Ativar a aba selecionada
    targetButton.classList.add('active');
    targetContent.classList.add('active');
    
    // Atualizar aba atual e histórico
    if (currentTab && currentTab !== tabId) {
        // Adicionar aba anterior ao histórico
        tabHistory.push(currentTab);
        
        // Limitar tamanho do histórico
        if (tabHistory.length > MAX_HISTORY) {
            tabHistory.shift(); // Remover item mais antigo
        }
    }
    
    // Atualizar aba atual
    currentTab = tabId;
    
    // Atualizar estado no repositório, se disponível
    if (typeof SimuladorRepository !== 'undefined') {
        try {
            SimuladorRepository.atualizarCampo('interfaceState', 'tabAtiva', tabId);
        } catch (e) {
            console.warn('Sistema de abas: erro ao atualizar estado no repositório:', e);
        }
    }
    
    // Executar ações específicas da aba
    try {
        executeTabActions(tabId);
    } catch (e) {
        console.error(`Sistema de abas: erro ao executar ações para aba "${tabId}":`, e);
        handleTabError(tabId, e);
    }
    
    console.log(`Sistema de abas: aba ${tabId} ativada com sucesso`);
    return true;
}

/**
 * Verifica pré-condições para ativação de uma aba
 * @param {string} tabId - ID da aba a ser verificada
 * @returns {boolean} - true se todas as pré-condições foram atendidas
 */
function checkTabPreconditions(tabId) {
    // Se o repositório não estiver disponível, permitir navegação
    if (typeof SimuladorRepository === 'undefined') {
        return true;
    }
    
    try {
        // Verificar pré-condições específicas para cada aba
        switch (tabId) {
            case 'configuracoes-gerais':
                // Não há pré-condições para esta aba
                return true;
                
            case 'configuracoes-setoriais':
                // Verificar se configurações gerais foram preenchidas
                return checkRequiredFields('empresa', ['nome', 'setor', 'regime'], 'configuracoes-gerais');
                
            case 'simulacao-principal':
                // Verificar se configurações gerais foram preenchidas
                return checkRequiredFields('empresa', ['nome', 'setor', 'regime'], 'configuracoes-gerais');
                
            case 'estrategias-mitigacao':
                // Verificar se simulação foi realizada
                return checkSimulationPerformed();
                
            case 'memoria-calculo':
                // Verificar se simulação foi realizada
                return checkSimulationPerformed();
                
            case 'ajuda-documentacao':
                // Não há pré-condições para esta aba
                return true;
                
            default:
                // Para abas desconhecidas, permitir navegação
                return true;
        }
    } catch (e) {
        console.error(`Sistema de abas: erro ao verificar pré-condições para aba "${tabId}":`, e);
        return true; // Em caso de erro, permitir navegação
    }
}

/**
 * Verifica se campos obrigatórios foram preenchidos
 * @param {string} secao - Seção no repositório
 * @param {Array<string>} campos - Lista de campos obrigatórios
 * @param {string} abaRedirecionamento - Aba para redirecionamento em caso de falha
 * @returns {boolean} - true se todos os campos foram preenchidos
 */
function checkRequiredFields(secao, campos, abaRedirecionamento) {
    try {
        const dados = SimuladorRepository.obterSecao(secao);
        
        // Verificar se todos os campos obrigatórios foram preenchidos
        const camposFaltantes = campos.filter(campo => !dados[campo]);
        
        if (camposFaltantes.length > 0) {
            console.warn(`Sistema de abas: campos faltantes: ${camposFaltantes.join(', ')}`);
            alert(`É necessário preencher ${camposFaltantes.join(', ')} na aba ${abaRedirecionamento} antes de prosseguir.`);
            
            // Redirecionar para a aba necessária
            activateTab(abaRedirecionamento);
            return false;
        }
        
        return true;
    } catch (e) {
        console.error('Sistema de abas: erro ao verificar campos obrigatórios:', e);
        return true; // Em caso de erro, permitir navegação
    }
}

/**
 * Verifica se uma simulação foi realizada
 * @returns {boolean} - true se uma simulação foi realizada
 */
function checkSimulationPerformed() {
    try {
        const interfaceState = SimuladorRepository.obterSecao('interfaceState');
        const resultadosSimulacao = SimuladorRepository.obterSecao('resultadosSimulacao');
        
        if (!interfaceState.simulacaoRealizada || !resultadosSimulacao.impactoBase) {
            alert('É necessário realizar uma simulação antes de acessar esta funcionalidade.');
            activateTab('simulacao-principal');
            return false;
        }
        
        return true;
    } catch (e) {
        console.error('Sistema de abas: erro ao verificar simulação realizada:', e);
        return true; // Em caso de erro, permitir navegação
    }
}

/**
 * Executa ações específicas para cada aba
 * @param {string} tabId - ID da aba ativada
 */
function executeTabActions(tabId) {
    console.log(`Sistema de abas: executando ações para aba ${tabId}`);
    
    switch(tabId) {
        case 'configuracoes-gerais':
            if (typeof ConfiguracoesGeraisController !== 'undefined') {
                try {
                    ConfiguracoesGeraisController.inicializar();
                } catch (e) {
                    console.warn('Sistema de abas: erro ao inicializar ConfiguracoesGeraisController:', e);
                }
            } else {
                console.warn('Sistema de abas: ConfiguracoesGeraisController não encontrado');
            }
            break;
            
        case 'configuracoes-setoriais':
            if (typeof SimuladorApp !== 'undefined' && 
                typeof SimuladorApp.ConfiguracoesSetoriais !== 'undefined') {
                try {
                    SimuladorApp.ConfiguracoesSetoriais.inicializar();
                } catch (e) {
                    console.warn('Sistema de abas: erro ao inicializar ConfiguracoesSetoriais:', e);
                }
            } else {
                console.warn('Sistema de abas: ConfiguracoesSetoriais não encontrado');
            }
            break;
            
        case 'simulacao-principal':
            if (typeof SimulacaoPrincipalController !== 'undefined') {
                try {
                    SimulacaoPrincipalController.inicializar();
                } catch (e) {
                    console.warn('Sistema de abas: erro ao inicializar SimulacaoPrincipalController:', e);
                }
            } else {
                console.warn('Sistema de abas: SimulacaoPrincipalController não encontrado');
            }
            break;
            
        case 'estrategias-mitigacao':
            if (typeof EstrategiasController !== 'undefined') {
                try {
                    EstrategiasController.inicializar();
                } catch (e) {
                    console.warn('Sistema de abas: erro ao inicializar EstrategiasController:', e);
                }
            } else {
                console.warn('Sistema de abas: EstrategiasController não encontrado');
            }
            break;
            
        case 'memoria-calculo':
            if (typeof MemoriaController !== 'undefined') {
                try {
                    MemoriaController.inicializar();
                } catch (e) {
                    console.warn('Sistema de abas: erro ao inicializar MemoriaController:', e);
                }
            } else {
                console.warn('Sistema de abas: MemoriaController não encontrado');
            }
            break;
            
        case 'ajuda-documentacao':
            if (typeof AjudaController !== 'undefined') {
                try {
                    AjudaController.inicializar();
                } catch (e) {
                    console.warn('Sistema de abas: erro ao inicializar AjudaController:', e);
                }
            } else {
                // Nenhuma ação necessária se o controlador não estiver disponível
                initHelpNavigation();
            }
            break;
            
        default:
            console.log(`Sistema de abas: nenhuma ação específica para aba ${tabId}`);
    }
}

/**
 * Inicializa navegação na aba de ajuda (independente de controlador)
 */
function initHelpNavigation() {
    const helpNavLinks = document.querySelectorAll('.help-nav-link');
    const helpSections = document.querySelectorAll('.help-section');
    
    if (helpNavLinks.length === 0 || helpSections.length === 0) {
        return; // Elementos não encontrados
    }
    
    // Inicializar navegação interna da ajuda
    helpNavLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Remover classe active de todos os links
            helpNavLinks.forEach(l => l.classList.remove('active'));
            
            // Adicionar classe active ao link clicado
            this.classList.add('active');
            
            // Obter ID da seção alvo
            const targetId = this.getAttribute('data-target');
            
            // Esconder todas as seções
            helpSections.forEach(section => section.classList.remove('active'));
            
            // Mostrar seção alvo
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Ativar primeira seção por padrão
    if (helpNavLinks.length > 0 && helpSections.length > 0) {
        helpNavLinks[0].classList.add('active');
        helpSections[0].classList.add('active');
    }
}

/**
 * Gerencia erros durante a ativação de abas
 * @param {string} tabId - ID da aba com erro
 * @param {Error} error - Objeto de erro
 */
function handleTabError(tabId, error) {
    // Registrar erro no console com detalhes
    console.error(`Sistema de abas: erro na aba ${tabId}:`, error);
    
    // Verificar se é um erro crítico que impede o uso da aba
    const isCritical = error.message && (
        error.message.includes('undefined') ||
        error.message.includes('null') ||
        error.message.includes('not a function')
    );
    
    // Para erros críticos, notificar o usuário
    if (isCritical) {
        const errorMessage = `Ocorreu um erro ao carregar a aba. 
        Detalhes técnicos: ${error.message}. 
        Tente recarregar a página ou contate o suporte.`;
        
        // Exibir alerta (pode ser substituído por uma notificação mais elegante)
        alert(errorMessage);
    }
}

// Expor funções públicas globalmente
window.TabNavigation = {
    activate: activateTab,
    getCurrentTab: () => currentTab,
    getTabHistory: () => [...tabHistory]
};