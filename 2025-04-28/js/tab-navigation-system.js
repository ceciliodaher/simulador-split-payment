// Arquivo: tab-navigation-system.js (versão corrigida)
/**
 * Sistema unificado de navegação por abas
 * Para Simulador de Impacto do Split Payment
 * © 2025 Expertzy Inteligência Tributária
 */

// IMPORTANTE: Preserve o início do arquivo, modifique apenas o código dos event listeners

// Função principal para inicializar o sistema de navegação
document.addEventListener('DOMContentLoaded', function() {
    console.log('Evento DOMContentLoaded disparado. Iniciando navegação...');
    
    // Selecionar todos os botões de aba e conteúdos de aba
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log(`Encontrados ${tabButtons.length} botões de aba e ${tabContents.length} conteúdos de aba`);
    
    // Verificar se há elementos suficientes para prosseguir
    if (tabButtons.length === 0 || tabContents.length === 0) {
        console.error('Elementos de navegação não encontrados. Verifique as classes .tab-button e .tab-content');
        return;
    }
    
    // Limpar event listeners existentes para evitar duplicação
    tabButtons.forEach(button => {
        // Clonar e substituir para remover listeners existentes
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo event listener ao botão clonado
        newButton.addEventListener('click', function() {
            // Armazenar o ID da aba a ser exibida
            const tabId = this.getAttribute('data-tab');
            const targetContent = document.getElementById(tabId);
            
            if (!targetContent) {
                console.error(`Conteúdo com ID "${tabId}" não encontrado!`);
                return;
            }
            
            // Remover classe active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado e ao conteúdo correspondente
            this.classList.add('active');
            targetContent.classList.add('active');
            
            // Executar ações específicas para esta aba, se existirem
            if (typeof SimuladorApp !== 'undefined' && typeof SimuladorApp.aoMudarAba === 'function') {
                console.log(`Chamando SimuladorApp.aoMudarAba("${tabId}")`);
                SimuladorApp.aoMudarAba(tabId);
            } else if (typeof window.aoMudarAba === 'function') {
                console.log(`Chamando window.aoMudarAba("${tabId}")`);
                window.aoMudarAba(tabId);
            } else {
                console.warn('Função aoMudarAba não encontrada');
            }
            
            console.log(`Aba alterada para: ${tabId}`);
        });
    });
    
    // Inicializar as subabas, se existirem
    const subtabButtons = document.querySelectorAll('.subtab-button');
    const subtabContents = document.querySelectorAll('.subtab-content');
    
    if (subtabButtons.length === 0) {
        return; // Não há subabas para inicializar
    }
    
    console.log(`Encontrados ${subtabButtons.length} botões de subaba`);
    
    subtabButtons.forEach(button => {
        // Limpar event listeners existentes
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo event listener
        newButton.addEventListener('click', function() {
            // Encontrar o container pai (tab-content que contém esta subaba)
            const parentTab = this.closest('.tab-content');
            if (!parentTab) {
                console.error('Container pai da subaba não encontrado!');
                return;
            }
            
            // Obter o ID do conteúdo da subaba
            const subtabId = this.getAttribute('data-subtab');
            const targetSubContent = document.getElementById(subtabId);
            
            if (!targetSubContent) {
                console.error(`Conteúdo de subaba com ID "${subtabId}" não encontrado!`);
                return;
            }
            
            // Selecionar apenas os botões e conteúdos dentro deste container pai
            const relatedButtons = parentTab.querySelectorAll('.subtab-button');
            const relatedContents = parentTab.querySelectorAll('.subtab-content');
            
            // Remover classe active de todas as subabas relacionadas
            relatedButtons.forEach(btn => btn.classList.remove('active'));
            relatedContents.forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado e ao conteúdo correspondente
            this.classList.add('active');
            targetSubContent.classList.add('active');
            
            console.log(`Subaba alterada para: ${subtabId}`);
        });
    });
    
    console.log('Sistema de navegação por abas inicializado com sucesso!');
});

// Fallback para garantir a inicialização mesmo se o DOMContentLoaded já tiver ocorrido
if (document.readyState === 'loading') {
    console.log('Documento ainda está carregando. Aguardando DOMContentLoaded...');
} else {
    console.log('Documento já carregado. Iniciando navegação imediatamente...');
    
    // Selecionar todos os botões de aba e conteúdos de aba
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log(`Encontrados ${tabButtons.length} botões de aba e ${tabContents.length} conteúdos de aba`);
    
    // Verificar se há elementos suficientes para prosseguir
    if (tabButtons.length === 0 || tabContents.length === 0) {
        console.error('Elementos de navegação não encontrados. Verifique as classes .tab-button e .tab-content');
        return;
    }
    
    // Limpar event listeners existentes para evitar duplicação
    tabButtons.forEach(button => {
        // Clonar e substituir para remover listeners existentes
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo event listener ao botão clonado
        newButton.addEventListener('click', function() {
            // Armazenar o ID da aba a ser exibida
            const tabId = this.getAttribute('data-tab');
            const targetContent = document.getElementById(tabId);
            
            if (!targetContent) {
                console.error(`Conteúdo com ID "${tabId}" não encontrado!`);
                return;
            }
            
            // Remover classe active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado e ao conteúdo correspondente
            this.classList.add('active');
            targetContent.classList.add('active');
            
            // Executar ações específicas para esta aba, se existirem
            if (typeof SimuladorApp !== 'undefined' && typeof SimuladorApp.aoMudarAba === 'function') {
                console.log(`Chamando SimuladorApp.aoMudarAba("${tabId}")`);
                SimuladorApp.aoMudarAba(tabId);
            } else if (typeof window.aoMudarAba === 'function') {
                console.log(`Chamando window.aoMudarAba("${tabId}")`);
                window.aoMudarAba(tabId);
            } else {
                console.warn('Função aoMudarAba não encontrada');
            }
            
            console.log(`Aba alterada para: ${tabId}`);
        });
    });
    
    // Inicializar as subabas, se existirem
    const subtabButtons = document.querySelectorAll('.subtab-button');
    const subtabContents = document.querySelectorAll('.subtab-content');
    
    if (subtabButtons.length > 0) {
        console.log(`Encontrados ${subtabButtons.length} botões de subaba`);
        
        subtabButtons.forEach(button => {
            // Limpar event listeners existentes
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Adicionar novo event listener
            newButton.addEventListener('click', function() {
                // Encontrar o container pai (tab-content que contém esta subaba)
                const parentTab = this.closest('.tab-content');
                if (!parentTab) {
                    console.error('Container pai da subaba não encontrado!');
                    return;
                }
                
                // Obter o ID do conteúdo da subaba
                const subtabId = this.getAttribute('data-subtab');
                const targetSubContent = document.getElementById(subtabId);
                
                if (!targetSubContent) {
                    console.error(`Conteúdo de subaba com ID "${subtabId}" não encontrado!`);
                    return;
                }
                
                // Selecionar apenas os botões e conteúdos dentro deste container pai
                const relatedButtons = parentTab.querySelectorAll('.subtab-button');
                const relatedContents = parentTab.querySelectorAll('.subtab-content');
                
                // Remover classe active de todas as subabas relacionadas
                relatedButtons.forEach(btn => btn.classList.remove('active'));
                relatedContents.forEach(content => content.classList.remove('active'));
                
                // Adicionar classe active ao botão clicado e ao conteúdo correspondente
                this.classList.add('active');
                targetSubContent.classList.add('active');
                
                console.log(`Subaba alterada para: ${subtabId}`);
            });
        });
    }
    
    console.log('Sistema de navegação por abas inicializado com sucesso!');
}