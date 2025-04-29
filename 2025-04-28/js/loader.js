/**
 * Carregador de Conteúdo para o Simulador de Split Payment
 * Responsável por carregar dinamicamente o conteúdo de todas as abas
 */
const ContentLoader = (function() {
    // Mapeamento de abas para arquivos de template
    const templateMap = {
        'simulacao-principal': 'templates/simulacao-principal.html',
        'configuracoes-setoriais': 'templates/configuracoes-setoriais.html',
        'estrategias-mitigacao': 'templates/estrategias-mitigacao.html',
        'memoria-calculo': 'templates/memoria-calculo.html',
        'ajuda-documentacao': 'templates/ajuda-documentacao.html'
    };
    
    // Estado de carregamento das abas
    const loadedTabs = {};
    
    /**
     * Carrega o conteúdo de uma aba específica
     * @param {string} tabId - Identificador da aba
     * @param {boolean} force - Forçar recarregamento mesmo se já estiver carregada
     * @returns {Promise} - Promessa resolvida quando o conteúdo for carregado
     */
    async function loadTabContent(tabId, force = false) {
        // Se a aba já estiver carregada e não estiver forçando, retorna
        if (loadedTabs[tabId] && !force) {
            return Promise.resolve(true);
        }
        
        const tabElement = document.getElementById(tabId);
        if (!tabElement) {
            console.error(`Elemento de aba não encontrado: ${tabId}`);
            return Promise.reject(new Error(`Elemento de aba não encontrado: ${tabId}`));
        }
        
        const templateUrl = templateMap[tabId];
        if (!templateUrl) {
            console.error(`Template não mapeado para a aba: ${tabId}`);
            return Promise.reject(new Error(`Template não mapeado para a aba: ${tabId}`));
        }
        
        try {
            // Adicionar indicador de carregamento
            tabElement.innerHTML = '<div class="loading-indicator">Carregando...</div>';
            
            // Carregar o conteúdo da aba via fetch
            const response = await fetch(templateUrl);
            if (!response.ok) {
                throw new Error(`Erro ao carregar template (${response.status}): ${templateUrl}`);
            }
            
            const content = await response.text();
            tabElement.innerHTML = content;
            
            // Marcar aba como carregada
            loadedTabs[tabId] = true;
            
            // Disparar evento de conteúdo carregado
            const event = new CustomEvent('tabContentLoaded', {
                detail: { tabId: tabId }
            });
            document.dispatchEvent(event);
            
            console.log(`Conteúdo carregado para aba: ${tabId}`);
            return true;
        } catch (error) {
            console.error(`Erro ao carregar conteúdo da aba ${tabId}:`, error);
            tabElement.innerHTML = `
                <div class="error-container">
                    <p>Erro ao carregar conteúdo. Por favor, tente novamente.</p>
                    <button class="btn primary" onclick="ContentLoader.loadTabContent('${tabId}', true)">
                        Tentar Novamente
                    </button>
                </div>
            `;
            return Promise.reject(error);
        }
    }
    
    /**
     * Inicializa o carregador, carregando a primeira aba automaticamente
     * e configurando os eventos para carregamento das demais abas
     */
    function initialize() {
        // Carregar a aba ativa inicialmente
        const activeTabId = document.querySelector('.tab-button.active')?.getAttribute('data-tab');
        if (activeTabId) {
            loadTabContent(activeTabId);
        }
        
        // Configurar listener para mudança de aba
        document.addEventListener('tabChanged', function(e) {
            const tabId = e.detail.tabId;
            loadTabContent(tabId);
        });
        
        console.log('ContentLoader inicializado');
    }
    
    // API pública
    return {
        initialize: initialize,
        loadTabContent: loadTabContent
    };
})();

// Inicializar o carregador quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', ContentLoader.initialize);
// No ContentLoader, após carregar o conteúdo HTML com sucesso
document.addEventListener('tabContentLoaded', function(e) {
    const tabId = e.detail.tabId;
    
    // Carregar script específico se necessário
    if (tabId === 'simulacao-principal') {
        // Verificar se o script já foi carregado
        if (!document.querySelector('script[src="js/simulacao-principal.js"]')) {
            const script = document.createElement('script');
            script.src = 'js/simulacao-principal.js';
            script.onload = function() {
                // Inicializar o controlador quando o script for carregado
                if (typeof SimulacaoPrincipalController !== 'undefined') {
                    SimulacaoPrincipalController.initialize();
                }
            };
            document.body.appendChild(script);
        } else {
            // Se o script já foi carregado, apenas reinicializar o controlador
            if (typeof SimulacaoPrincipalController !== 'undefined') {
                SimulacaoPrincipalController.initialize();
            }
        }
    }
    
    // Outros scripts específicos para outras abas...
});