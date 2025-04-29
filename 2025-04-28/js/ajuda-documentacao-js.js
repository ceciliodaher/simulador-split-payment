/**
 * Funcionalidades JavaScript para a aba de Ajuda e Documentação
 * Simulador de Impacto do Split Payment no Fluxo de Caixa
 * © 2025 Expertzy Inteligência Tributária
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização da navegação
    initNavigation();
    
    // Inicialização do sistema de pesquisa
    initSearch();
    
    // Inicialização do FAQ
    initFAQ();
    
    // Inicialização da navegação por teclado
    initKeyboardNavigation();
});

/**
 * Inicializa o sistema de navegação entre tópicos
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.help-nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover classe active de todos os links e seções
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.help-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Adicionar classe active ao link clicado
            this.classList.add('active');
            
            // Mostrar a seção correspondente
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Armazenar a seção ativa no localStorage
                localStorage.setItem('activeSectionId', targetId);
                
                // Atualizar título da página
                const sectionTitle = targetSection.querySelector('.help-section-title').textContent;
                document.title = `${sectionTitle} | Ajuda do Simulador de Split Payment`;
                
                // Atualizar URL (para permitir compartilhamento direto)
                history.pushState(null, sectionTitle, `#${targetId}`);
                
                // Rolar até a seção (em telas pequenas)
                if (window.innerWidth < 991) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Navegação entre páginas (botões Anterior/Próximo)
    const navButtons = document.querySelectorAll('.help-nav-prev, .help-nav-next');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('data-target');
            const targetLink = document.querySelector(`.help-nav-link[data-target="${targetId}"]`);
            
            if (targetLink) {
                targetLink.click();
            }
        });
    });
    
    // Verificar hash na URL para navegação direta
    if (location.hash) {
        const sectionId = location.hash.substring(1);
        const targetLink = document.querySelector(`.help-nav-link[data-target="${sectionId}"]`);
        
        if (targetLink) {
            setTimeout(() => {
                targetLink.click();
            }, 100);
        }
    } else {
        // Verificar se há uma seção ativa armazenada
        const storedSectionId = localStorage.getItem('activeSectionId');
        
        if (storedSectionId) {
            const targetLink = document.querySelector(`.help-nav-link[data-target="${storedSectionId}"]`);
            
            if (targetLink) {
                setTimeout(() => {
                    targetLink.click();
                }, 100);
            }
        }
    }
}

/**
 * Inicializa o sistema de pesquisa
 */
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    
    // Pesquisar ao pressionar Enter
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Limpar destaques quando o usuário digita
    searchInput.addEventListener('input', function() {
        clearHighlights();
    });
    
    // Função de pesquisa
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm.length < 2) {
            return;
        }
        
        let foundIn = [];
        let matchCount = 0;
        
        // Buscar nos títulos e conteúdos
        document.querySelectorAll('.help-section-title, .help-subsection-title, .help-text p, .glossary-term-title, .glossary-term-definition, .faq-question, .example-title').forEach(el => {
            if (el.textContent.toLowerCase().includes(searchTerm)) {
                matchCount++;
                
                // Encontra a seção mais próxima
                let section = el.closest('.help-section');
                if (section && !foundIn.includes(section.id)) {
                    foundIn.push(section.id);
                }
            }
        });
        
        if (foundIn.length > 0) {
            // Mostrar o primeiro resultado
            document.querySelector(`.help-nav-link[data-target="${foundIn[0]}"]`).click();
            
            // Destaca os termos encontrados
            highlightSearchTerms(searchTerm);
            
            // Reportar resultados
            showSearchMessage(`Encontrados ${matchCount} resultados para "${searchTerm}"`);
        } else {
            showSearchMessage(`Nenhum resultado encontrado para "${searchTerm}". Tente outras palavras-chave.`);
        }
    }
    
    // Adicionar mensagem de pesquisa
    function showSearchMessage(message) {
        // Verificar se já existe uma mensagem
        let messageEl = document.querySelector('.search-message');
        
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'search-message';
            messageEl.style.marginBottom = '1rem';
            messageEl.style.padding = '0.5rem';
            messageEl.style.borderRadius = '4px';
            messageEl.style.backgroundColor = 'var(--light-bg)';
            messageEl.style.color = 'var(--gray-text)';
            
            // Inserir antes do container de help
            const helpContainer = document.querySelector('.help-container');
            helpContainer.parentNode.insertBefore(messageEl, helpContainer);
        }
        
        messageEl.textContent = message;
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 500);
        }, 5000);
    }
}

/**
 * Destaca termos pesquisados no conteúdo
 */
function highlightSearchTerms(term) {
    // Remove destaques anteriores
    clearHighlights();
    
    // Adiciona novos destaques
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    
    document.querySelectorAll('.help-section.active .help-text, .help-section.active .glossary-term-definition, .help-section.active .faq-question, .help-section.active .faq-answer, .help-section.active .example-section p, .help-section.active .help-subsection-title').forEach(el => {
        highlightElement(el, regex);
    });
    
    // Scroll até o primeiro destaque
    const firstHighlight = document.querySelector('.search-highlight');
    if (firstHighlight) {
        firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Remove todos os destaques de pesquisa
 */
function clearHighlights() {
    document.querySelectorAll('.search-highlight').forEach(el => {
        el.outerHTML = el.innerHTML;
    });
}

/**
 * Destaca ocorrências em um elemento
 */
function highlightElement(element, regex) {
    // Preservar elementos filho ao substituir texto
    const childNodes = Array.from(element.childNodes);
    
    childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            // É um nó de texto
            const highlightedText = node.textContent.replace(regex, '<span class="search-highlight">$1</span>');
            
            if (highlightedText !== node.textContent) {
                const tempSpan = document.createElement('span');
                tempSpan.innerHTML = highlightedText;
                element.replaceChild(tempSpan, node);
                
                // Extrair os nós de texto e span do tempSpan
                while (tempSpan.firstChild) {
                    element.insertBefore(tempSpan.firstChild, tempSpan);
                }
                
                // Remover o tempSpan
                element.removeChild(tempSpan);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.className !== 'search-highlight') {
            // É um elemento (recursão)
            highlightElement(node, regex);
        }
    });
}

/**
 * Inicializa o sistema de perguntas frequentes (FAQ)
 */
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            
            // Fechar todas as perguntas
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            });
            
            // Se não estava ativo, abre este
            if (!isActive) {
                this.classList.add('active');
                answer.classList.add('active');
            }
        });
    });
}

/**
 * Inicializa a navegação por teclado
 */
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Não executar se estiver em um campo de entrada
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Navegação por setas
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            // Próxima seção
            const activeSection = document.querySelector('.help-section.active');
            const navNext = activeSection.querySelector('.help-nav-next');
            
            if (navNext) {
                navNext.click();
                e.preventDefault();
            }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            // Seção anterior
            const activeSection = document.querySelector('.help-section.active');
            const navPrev = activeSection.querySelector('.help-nav-prev');
            
            if (navPrev) {
                navPrev.click();
                e.preventDefault();
            }
        } else if (e.key === '/' || (e.ctrlKey && e.key === 'f')) {
            // Atalho para pesquisa
            document.querySelector('.search-input').focus();
            e.preventDefault();
        }
    });
}

/**
 * Escapar caracteres especiais para uso em expressões regulares
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Função para copiar uma seção para a área de transferência
 */
function copySection(button) {
    const sectionId = button.getAttribute('data-section');
    const section = document.getElementById(sectionId);
    
    if (!section) return;
    
    // Criar um elemento temporário para copiar o texto
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = section.innerText;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    
    try {
        document.execCommand('copy');
        
        // Feedback visual
        const originalText = button.textContent;
        button.textContent = 'Copiado!';
        button.style.backgroundColor = 'var(--secondary-color)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
        }, 2000);
    } catch (err) {
        console.error('Erro ao copiar:', err);
    }
    
    document.body.removeChild(tempTextarea);
}

/**
 * Função para alternar entre modo claro e escuro
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Armazenar preferência
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
    
    // Atualizar texto do botão
    const button = document.getElementById('dark-mode-toggle');
    if (button) {
        button.textContent = isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro';
    }
}

/**
 * Função para verificar preferência de tema escuro
 */
function checkDarkModePreference() {
    const storedPreference = localStorage.getItem('darkMode');
    
    if (storedPreference === 'true') {
        document.body.classList.add('dark-mode');
        
        const button = document.getElementById('dark-mode-toggle');
        if (button) {
            button.textContent = '☀️ Modo Claro';
        }
    }
}

/**
 * Função para imprimir seção atual
 */
function printCurrentSection() {
    const activeSection = document.querySelector('.help-section.active');
    
    if (!activeSection) return;
    
    // Criar um novo documento para impressão
    const printWindow = window.open('', '_blank');
    const sectionTitle = activeSection.querySelector('.help-section-title').textContent;
    
    printWindow.document.write(`
        <html>
        <head>
            <title>${sectionTitle} | Simulador de Split Payment</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    padding: 20px;
                }
                h1 {
                    color: #3498db;
                    border-bottom: 1px solid #dee2e6;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #343a40;
                    margin-top: 20px;
                }
                p {
                    margin-bottom: 15px;
                }
                .footer {
                    margin-top: 30px;
                    border-top: 1px solid #dee2e6;
                    padding-top: 10px;
                    font-size: 12px;
                    color: #6c757d;
                }
            </style>
        </head>
        <body>
            <h1>${sectionTitle}</h1>
            ${activeSection.innerHTML}
            <div class="footer">
                © 2025 Expertzy Inteligência Tributária<br>
                Simulador de Impacto do Split Payment no Fluxo de Caixa
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Remover elementos não desejados na impressão
    const elementsToRemove = printWindow.document.querySelectorAll('.help-navigation, .faq-question::after');
    elementsToRemove.forEach(el => el.remove());
    
    // Acionar a impressão
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

/**
 * Função para expandir/colapsar todas as perguntas do FAQ
 */
function toggleAllFAQs(expand) {
    const faqQuestions = document.querySelectorAll('#faq .faq-question');
    
    faqQuestions.forEach(question => {
        const answer = question.nextElementSibling;
        
        if (expand) {
            question.classList.add('active');
            answer.classList.add('active');
        } else {
            question.classList.remove('active');
            answer.classList.remove('active');
        }
    });
}

/**
 * Função para filtrar termos do glossário
 */
function filterGlossaryTerms(input) {
    const filter = input.value.toLowerCase();
    const terms = document.querySelectorAll('.glossary-term');
    let hasVisibleTerms = false;
    
    terms.forEach(term => {
        const title = term.querySelector('.glossary-term-title').textContent.toLowerCase();
        const definition = term.querySelector('.glossary-term-definition').textContent.toLowerCase();
        
        if (title.includes(filter) || definition.includes(filter)) {
            term.style.display = '';
            hasVisibleTerms = true;
            
            // Destacar o termo pesquisado
            if (filter) {
                highlightElement(term, new RegExp(`(${escapeRegExp(filter)})`, 'gi'));
            }
        } else {
            term.style.display = 'none';
        }
    });
    
    // Exibir mensagem se não encontrar termos
    const noResultsEl = document.getElementById('no-glossary-results');
    
    if (!hasVisibleTerms) {
        if (!noResultsEl) {
            const message = document.createElement('div');
            message.id = 'no-glossary-results';
            message.textContent = `Nenhum termo encontrado para "${filter}".`;
            message.style.padding = '10px';
            message.style.color = 'var(--gray-text)';
            message.style.fontStyle = 'italic';
            
            const glossaryContent = document.querySelector('#glossario .help-subsection');
            glossaryContent.appendChild(message);
        }
    } else if (noResultsEl) {
        noResultsEl.remove();
    }
}