/**
 * ConfiguracoesGeraisController.js
 * Controlador para a aba de Configurações Gerais do Simulador
 * © 2025 Expertzy Inteligência Tributária
 */

const ConfiguracoesGeraisController = {
    inicializar: function() {
        console.log('Inicializando controlador de Configurações Gerais');
        
        // Carregar dados existentes
        this.carregarDados();
        
        // Inicializar formatação para campos monetários e percentuais
        this.inicializarFormatacao();
        
        // Inicializar eventos
        this.inicializarEventos();
        
        // Calcular ciclo financeiro inicial
        this.calcularCicloFinanceiro();
        
        // Inicializar dropdown de setores
        this.inicializarDropdownSetores();
        
        console.log('Controlador de Configurações Gerais inicializado');
    },
    
    carregarDados: function() {
        // Recuperar dados do repositório
        const dadosEmpresa = SimuladorRepository.obterSecao('empresa');
        const dadosCiclo = SimuladorRepository.obterSecao('cicloFinanceiro');
        
        // Preencher campos do formulário
        document.getElementById('nome-empresa').value = dadosEmpresa.nome || '';
        
        // Verificar se setor existe e preencher dropdown
        if (dadosEmpresa.setor) {
            const selectSetor = document.getElementById('setor-config');
            if (selectSetor) selectSetor.value = dadosEmpresa.setor;
        }
        
        // Preencher regime tributário
        if (dadosEmpresa.regime) {
            const selectRegime = document.getElementById('regime-config');
            if (selectRegime) selectRegime.value = dadosEmpresa.regime;
        }
        
        // Preencher faturamento
        const faturamento = document.getElementById('faturamento-config');
        if (faturamento && dadosEmpresa.faturamento) {
            faturamento.value = FormatacaoHelper.formatarMoeda(dadosEmpresa.faturamento);
        }
        
        // Preencher período
        const periodoMensal = document.getElementById('periodo-mensal-config');
        const periodoAnual = document.getElementById('periodo-anual-config');
        if (periodoMensal && periodoAnual) {
            if (dadosEmpresa.periodo === 'anual') {
                periodoAnual.checked = true;
            } else {
                periodoMensal.checked = true;
            }
        }
        
        // Preencher margem
        const margem = document.getElementById('margem-config');
        if (margem && dadosEmpresa.margem) {
            margem.value = FormatacaoHelper.formatarPercentual(dadosEmpresa.margem);
        }
        
        // Preencher dados de ciclo financeiro
        document.getElementById('pmr-config').value = dadosCiclo.pmr || 30;
        document.getElementById('pmp-config').value = dadosCiclo.pmp || 30;
        document.getElementById('pme-config').value = dadosCiclo.pme || 30;
        
        // Preencher percentuais
        const percVista = document.getElementById('perc-vista-config');
        if (percVista && dadosCiclo.percVista) {
            percVista.value = FormatacaoHelper.formatarPercentual(dadosCiclo.percVista);
        }
        
        const percPrazo = document.getElementById('perc-prazo-config');
        if (percPrazo && dadosCiclo.percPrazo) {
            percPrazo.value = FormatacaoHelper.formatarPercentual(dadosCiclo.percPrazo);
        }
    },
    
    salvarDados: function() {
        // Coletar dados do formulário
        const nome = document.getElementById('nome-empresa').value;
        const setor = document.getElementById('setor-config').value;
        const regime = document.getElementById('regime-config').value;
        const faturamento = FormatacaoHelper.extrairValorNumerico(
            document.getElementById('faturamento-config').value
        );
        const periodo = document.querySelector('input[name="periodo-config"]:checked').value;
        const margem = FormatacaoHelper.extrairValorNumerico(
            document.getElementById('margem-config').value
        ) / 100; // Converter para decimal
        
        // Validar dados obrigatórios
        if (!nome || !setor || !regime || isNaN(faturamento) || faturamento <= 0) {
            alert('Por favor, preencha todos os campos obrigatórios corretamente.');
            return false;
        }
        
        // Coletar dados do ciclo financeiro
        const pmr = parseInt(document.getElementById('pmr-config').value) || 30;
        const pmp = parseInt(document.getElementById('pmp-config').value) || 30;
        const pme = parseInt(document.getElementById('pme-config').value) || 30;
        const percVista = FormatacaoHelper.extrairValorNumerico(
            document.getElementById('perc-vista-config').value
        ) / 100; // Converter para decimal
        const percPrazo = 1 - percVista;
        
        // Atualizar dados no repositório
        SimuladorRepository.atualizarSecao('empresa', {
            nome,
            setor,
            regime,
            faturamento,
            periodo,
            margem
        });
        
        SimuladorRepository.atualizarSecao('cicloFinanceiro', {
            pmr,
            pmp,
            pme,
            percVista,
            percPrazo
        });
        
        // Salvar no localStorage
        SimuladorRepository.salvar();
        
        alert('Configurações da empresa salvas com sucesso!');
        return true;
    },
    
    inicializarFormatacao: function() {
        // Inicializar formatação para campos monetários
        const camposFaturamento = document.getElementById('faturamento-config');
        if (camposFaturamento && window.FormatacaoHelper) {
            window.FormatacaoHelper.formatarInputMonetario(camposFaturamento);
        }
        
        // Inicializar formatação para campos percentuais
        const camposMargem = document.getElementById('margem-config');
        const camposPercVista = document.getElementById('perc-vista-config');
        if (window.FormatacaoHelper) {
            if (camposMargem) window.FormatacaoHelper.formatarInputPercentual(camposMargem);
            if (camposPercVista) window.FormatacaoHelper.formatarInputPercentual(camposPercVista);
        }
    },
    
    inicializarEventos: function() {
        // Botão salvar
        const btnSalvar = document.getElementById('btn-salvar-config');
        if (btnSalvar) {
            btnSalvar.addEventListener('click', () => {
                this.salvarDados();
            });
        }
        
        // Botão limpar
        const btnLimpar = document.getElementById('btn-limpar-config');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                if (confirm('Deseja limpar todos os campos? Esta ação não pode ser desfeita.')) {
                    document.getElementById('nome-empresa').value = '';
                    document.getElementById('setor-config').value = '';
                    document.getElementById('regime-config').value = '';
                    document.getElementById('faturamento-config').value = '';
                    document.getElementById('margem-config').value = '';
                    document.getElementById('pmr-config').value = '30';
                    document.getElementById('pmp-config').value = '30';
                    document.getElementById('pme-config').value = '30';
                    document.getElementById('perc-vista-config').value = '';
                    this.calcularCicloFinanceiro();
                    this.atualizarPercPrazo();
                }
            });
        }
        
        // Botão avançar
        const btnAvancar = document.getElementById('btn-avancar-config');
        if (btnAvancar) {
            btnAvancar.addEventListener('click', () => {
                if (this.salvarDados()) {
                    // Mudar para a próxima aba
                    document.querySelector('.tab-button[data-tab="configuracoes-setoriais"]').click();
                }
            });
        }
        
        // Eventos para cálculo automático do ciclo financeiro
        ['pmr-config', 'pmp-config', 'pme-config'].forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.addEventListener('input', () => {
                    this.calcularCicloFinanceiro();
                });
            }
        });
        
        // Evento para atualização automática do percentual a prazo
        const campoPercVista = document.getElementById('perc-vista-config');
        if (campoPercVista) {
            campoPercVista.addEventListener('input', () => {
                this.atualizarPercPrazo();
            });
            campoPercVista.addEventListener('blur', () => {
                this.atualizarPercPrazo();
            });
        }
    },
    
    calcularCicloFinanceiro: function() {
        const pmr = parseInt(document.getElementById('pmr-config').value) || 0;
        const pmp = parseInt(document.getElementById('pmp-config').value) || 0;
        const pme = parseInt(document.getElementById('pme-config').value) || 0;
        
        const ciclo = pmr + pme - pmp;
        const campoCiclo = document.getElementById('ciclo-financeiro-config');
        if (campoCiclo) {
            campoCiclo.value = ciclo;
        }
    },
    
    atualizarPercPrazo: function() {
        const percVista = document.getElementById('perc-vista-config');
        const percPrazo = document.getElementById('perc-prazo-config');
        
        if (percVista && percPrazo) {
            const valorPercVista = FormatacaoHelper.extrairValorNumerico(percVista.value) / 100;
            const valorPercPrazo = Math.max(0, Math.min(1, 1 - valorPercVista));
            
            percPrazo.value = FormatacaoHelper.formatarPercentual(valorPercPrazo);
        }
    },
    
    inicializarDropdownSetores: function() {
        const selectSetor = document.getElementById('setor-config');
        if (!selectSetor) {
            console.warn('Elemento select "setor-config" não encontrado');
            return;
        }
        
        // Limpar opções existentes, exceto a primeira (Selecione...)
        while (selectSetor.options.length > 1) {
            selectSetor.remove(1);
        }
        
        // Obter setores do repositório
        const setores = SimuladorRepository.obterSecao('setoresEspeciais');
        if (!setores || Object.keys(setores).length === 0) {
            console.warn('Nenhum setor encontrado para adicionar ao dropdown');
            return;
        }
        
        // Adicionar opções ao dropdown
        for (const [codigo, setor] of Object.entries(setores)) {
            if (setor && setor.nome) {
                const option = document.createElement('option');
                option.value = codigo;
                option.textContent = setor.nome;
                selectSetor.appendChild(option);
            }
        }
        
        console.log('Dropdown de setores atualizado com sucesso.');
    }
};