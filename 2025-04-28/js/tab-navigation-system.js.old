/**
 * TabNavigationSystem - Sistema modular para gerenciamento de navegação por abas
 * 
 * Este módulo implementa um sistema completo para gerenciar a navegação
 * entre abas em interfaces de usuário, com suporte a:
 * - Navegação entre abas ao clicar nos botões
 * - Exibição/ocultação de conteúdo de cada aba
 * - Persistência da aba selecionada usando localStorage
 * - Indicação visual da aba ativa com classes CSS
 * - Animações de transição entre abas
 * 
 * Desenvolvido para o Simulador de Impacto do Split Payment no Fluxo de Caixa
 * © 2025 Expertzy Inteligência Tributária
 */

const TabNavigationSystem = (function() {
    // Configurações padrão
    const defaultSettings = {
        tabButtonSelector: 'a[href^="#"]',       // Seletor CSS para botões de aba
        tabContentSelector: '.tab-content',      // Seletor CSS para conteúdos de aba
        activeClass: 'active',                  // Classe CSS para elementos ativos
        storageKey: 'activeTabId',              // Chave para localStorage
        useStorage: true,                        // Usar localStorage para persistência
        useAnimation: true,                      // Usar animações de transição
        animationDuration: 300,                 // Duração da animação (ms)
        onTabChange: null                        // Callback ao mudar de aba
    };
    
    // Variáveis privadas
    let settings = {};
    let tabButtons = [];
    let tabContents = [];
    let activeTabId = null;
    let isInitialized = false;
    
    /**
     * Inicializa o sistema de navegação por abas
     * @param {Object} options - Opções de configuração
     */
    function initialize(options = {}) {
        // Evitar múltiplas inicializações
        if (isInitialized) {
            console.warn('TabNavigationSystem já está inicializado');
            return;
        }
        
        // Mesclar configurações padrão com opções fornecidas
        settings = Object.assign({}, defaultSettings, options);
        
        // Selecionar elementos do DOM
        tabButtons = document.querySelectorAll(settings.tabButtonSelector);
        tabContents = document.querySelectorAll(settings.tabContentSelector);
        
        // Verificar se há elementos para trabalhar
        if (tabButtons.length === 0 || tabContents.length === 0) {
            console.error('Nenhuma aba ou conteúdo encontrado. Verifique os seletores.');
            return;
        }
        
        // Adicionar event listeners aos botões de aba
        tabButtons.forEach(button => {
            button.addEventListener('click', handleTabClick);
        });
        
        // Adicionar estilos CSS para animação, se habilitado
        if (settings.useAnimation) {
            addAnimationStyles();
        }
        
        // Tentar restaurar aba ativa do localStorage
        if (settings.useStorage) {
            restoreActiveTab();
        }
        
        // Se nenhuma aba estiver ativa, ativar a primeira
        if (!activeTabId && tabButtons.length > 0) {
            const firstTabId = tabButtons[0].getAttribute('href').substring(1);
            activateTab(firstTabId);
        }
        
        isInitialized = true;
        console.log('TabNavigationSystem inicializado com sucesso');
    }
    
    /**
     * Manipulador de evento para cliques em botões de aba
     * @param {Event} event - O evento de clique
     */
    function handleTabClick(event) {
        event.preventDefault();
        const href = event.currentTarget.getAttribute('href');
        if (href && href.startsWith('#')) {
            const tabId = href.substring(1);
            activateTab(tabId);
        }
    }
    
    /**
     * Ativa uma aba específica
     * @param {string} tabId - O ID da aba a ser ativada
     */
    function activateTab(tabId) {
        if (tabId === activeTabId) {
            return; // Já está ativa, não fazer nada
        }
        
        // Disparar evento de mudança de aba
        const event = new CustomEvent('tabChanged', {
            detail: { tabId: tabId }
        });
        document.dispatchEvent(event);
        
        // Desativar todas as abas
        tabButtons.forEach(button => {
            button.classList.remove(settings.activeClass);
        });
        
        tabContents.forEach(content => {
            content.classList.remove(settings.activeClass);
            
            // Preparar para animação, se habilitada
            if (settings.useAnimation) {
                content.style.display = 'none';
                content.style.opacity = '0';
            }
        });
        
        // Ativar a aba selecionada
        const selectedButton = Array.from(tabButtons).find(
            button => button.getAttribute('href') === '#' + tabId
        );
        
        const selectedContent = document.getElementById(tabId);
        
        if (selectedButton && selectedContent) {
            selectedButton.classList.add(settings.activeClass);
            
            if (settings.useAnimation) {
                // Exibir conteúdo antes da animação
                selectedContent.style.display = 'block';
                
                // Usar timeout para garantir que a transição de opacidade funcione
                setTimeout(() => {
                    selectedContent.style.opacity = '1';
                    selectedContent.classList.add(settings.activeClass);
                }, 10);
            } else {
                selectedContent.classList.add(settings.activeClass);
            }
            
            // Atualizar a aba ativa
            activeTabId = tabId;
            
            // Salvar no localStorage, se habilitado
            if (settings.useStorage) {
                localStorage.setItem(settings.storageKey, tabId);
            }
            
            // Executar callback, se fornecido
            if (typeof settings.onTabChange === 'function') {
                settings.onTabChange(tabId, selectedContent);
            }
        }
    }
    
    /**
     * Restaura a aba ativa do localStorage
     */
    function restoreActiveTab() {
        try {
            const storedTabId = localStorage.getItem(settings.storageKey);
            if (storedTabId) {
                // Verificar se a aba armazenada existe no DOM atual
                const tabExists = Array.from(tabButtons).some(
                    button => button.getAttribute('href') === '#' + storedTabId
                );
                
                if (tabExists) {
                    activateTab(storedTabId);
                } else {
                    console.warn(`Aba armazenada "${storedTabId}" não encontrada no DOM atual`);
                }
            }
        } catch (error) {
            console.error('Erro ao restaurar aba do localStorage:', error);
        }
    }
    
    /**
     * Adiciona estilos CSS para animação de transição
     */
    function addAnimationStyles() {
        // Verificar se os estilos já foram adicionados
        if (document.getElementById('tab-navigation-styles')) {
            return;
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'tab-navigation-styles';
        styleElement.textContent = `
            ${settings.tabContentSelector} {
                transition: opacity ${settings.animationDuration}ms ease;
                display: none;
                opacity: 0;
            }
            
            ${settings.tabContentSelector}.${settings.activeClass} {
                display: block;
                opacity: 1;
            }
            
            ${settings.tabButtonSelector} {
                transition: background-color 0.3s, color 0.3s, border-color 0.3s;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    /**
     * Atualiza as configurações do sistema
     * @param {Object} options - Novas opções de configuração
     */
    function updateSettings(options = {}) {
        Object.assign(settings, options);
        
        // Atualizar estilos de animação, se necessário
        if (settings.useAnimation) {
            addAnimationStyles();
        }
        
        console.log('Configurações atualizadas', settings);
    }
    
    /**
     * Destrói o sistema de navegação, removendo event listeners
     */
    function destroy() {
        if (!isInitialized) {
            return;
        }
        
        // Remover event listeners
        tabButtons.forEach(button => {
            button.removeEventListener('click', handleTabClick);
        });
        
        // Remover estilos de animação
        const styleElement = document.getElementById('tab-navigation-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        // Resetar variáveis
        tabButtons = [];
        tabContents = [];
        activeTabId = null;
        isInitialized = false;
        
        console.log('TabNavigationSystem destruído');
    }
    
    // API pública
    return {
        initialize,
        activateTab,
        updateSettings,
        destroy,
        getActiveTabId: () => activeTabId,
        isInitialized: () => isInitialized
    };
})();

// Sistema de navegação por abas secundárias (para subabas)
const SubTabNavigationSystem = (function() {
    // Configurações padrão para subabas
    const defaultSettings = {
        parentTabSelector: '.tab-content',       // Seletor para aba pai
        tabButtonSelector: '.subtab-button',     // Seletor para botões de subaba
        tabContentSelector: '.subtab-content',   // Seletor para conteúdos de subaba
        activeClass: 'active',                  // Classe CSS para elementos ativos
        storagePrefix: 'activeSubTabId_',       // Prefixo para chaves localStorage
        useStorage: true,                        // Usar localStorage para persistência
        useAnimation: true,                      // Usar animações de transição
        onTabChange: null                        // Callback ao mudar de subaba
    };
    
    // Variáveis privadas
    let settings = {};
    let parentTabs = [];
    let navigationSystems = {};
    let isInitialized = false;
    
    /**
     * Inicializa o sistema de navegação por subabas
     * @param {Object} options - Opções de configuração
     */
    function initialize(options = {}) {
        // Evitar múltiplas inicializações
        if (isInitialized) {
            console.warn('SubTabNavigationSystem já está inicializado');
            return;
        }
        
        // Mesclar configurações padrão com opções fornecidas
        settings = Object.assign({}, defaultSettings, options);
        
        // Selecionar abas pai
        parentTabs = document.querySelectorAll(settings.parentTabSelector);
        
        // Para cada aba pai, criar um sistema de navegação próprio
        parentTabs.forEach(parentTab => {
            const parentId = parentTab.id;
            
            if (!parentId) {
                console.warn('Aba pai sem ID encontrada, ignorando');
                return;
            }
            
            // Selecionar elementos dentro desta aba pai
            const tabButtons = parentTab.querySelectorAll(settings.tabButtonSelector);
            const tabContents = parentTab.querySelectorAll(settings.tabContentSelector);
            
            if (tabButtons.length === 0 || tabContents.length === 0) {
                return; // Sem subabas nesta aba pai
            }
            
            // Criar um sistema de navegação para esta aba pai
            const subTabSystem = Object.create(TabNavigationSystem);
            
            // Inicializar com configurações personalizadas
            subTabSystem.initialize({
                tabButtonSelector: `#${parentId} ${settings.tabButtonSelector}`,
                tabContentSelector: `#${parentId} ${settings.tabContentSelector}`,
                activeClass: settings.activeClass,
                storageKey: `${settings.storagePrefix}${parentId}`,
                useStorage: settings.useStorage,
                useAnimation: settings.useAnimation,
                onTabChange: settings.onTabChange
            });
            
            // Armazenar referência
            navigationSystems[parentId] = subTabSystem;
        });
        
        isInitialized = true;
        console.log('SubTabNavigationSystem inicializado com sucesso');
    }
    
    /**
     * Ativa uma subaba específica
     * @param {string} parentId - ID da aba pai
     * @param {string} tabId - ID da subaba a ser ativada
     */
    function activateTab(parentId, tabId) {
        const system = navigationSystems[parentId];
        if (system) {
            system.activateTab(tabId);
        } else {
            console.warn(`Sistema de navegação para aba pai "${parentId}" não encontrado`);
        }
    }
    
    /**
     * Destrói o sistema de navegação por subabas
     */
    function destroy() {
        if (!isInitialized) {
            return;
        }
        
        // Destruir todos os sistemas de navegação
        Object.values(navigationSystems).forEach(system => {
            system.destroy();
        });
        
        // Resetar variáveis
        navigationSystems = {};
        parentTabs = [];
        isInitialized = false;
        
        console.log('SubTabNavigationSystem destruído');
    }
    
    // API pública
    return {
        initialize,
        activateTab,
        destroy,
        isInitialized: () => isInitialized,
        getSystemForParent: (parentId) => navigationSystems[parentId]
    };
})();

// Inicializador para configurar o sistema quando o DOM estiver pronto
const TabSystemInitializer = {
    /**
     * Inicializa os sistemas de navegação para o simulador de Split Payment
     */
    init: function() {
        // Inicializar sistema principal de abas
        TabNavigationSystem.initialize({
            tabButtonSelector: 'nav ul#tabs li a',
            tabContentSelector: '.tab-content',
            activeClass: 'active',
            useStorage: true,
            useAnimation: true,
            animationDuration: 300,
            onTabChange: function(tabId, contentElement) {
                console.log(`Aba alterada para: ${tabId}`);

                // Mapear os IDs corretos das abas
                const idMapping = {
                    'simulacao-principal': 'simulacao',
                    'configuracoes-setoriais': 'configuracoes',
                    'estrategias-mitigacao': 'estrategias',
                    'memoria-calculo': 'memoria',
                    'ajuda-documentacao': 'ajuda'
                };

                // Usar o ID mapeado para chamar as funções corretas
                const mappedId = idMapping[tabId] || tabId;

                // Lógica específica para cada aba usando o ID mapeado
                if (mappedId === 'simulacao' && window.inicializarFormularioSimulacao) {
                    window.inicializarFormularioSimulacao();
                } else if (mappedId === 'estrategias' && window.inicializarEstrategias) {
                    window.inicializarEstrategias();
                } else if (mappedId === 'memoria' && window.atualizarMemoriaCalculo) {
                    window.atualizarMemoriaCalculo();
                }

                // Inicializar elementos específicos da aba
                if (contentElement && window.aoMudarAba) {
                    window.aoMudarAba(tabId);
                }
            }
        });

        // Inicializar sistema de subabas (quando necessário)
        SubTabNavigationSystem.initialize({
            parentTabSelector: '.tab-content',
            tabButtonSelector: '.subtab-button',
            tabContentSelector: '.subtab-content',
            activeClass: 'active',
            useStorage: true,
            useAnimation: true
        });

        console.log('Sistemas de navegação inicializados');
    }
};

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', TabSystemInitializer.init);

// Exportar módulos para uso global
window.TabNavigationSystem = TabNavigationSystem;
window.SubTabNavigationSystem = SubTabNavigationSystem;