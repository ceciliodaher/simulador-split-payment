# Documento Técnico: Redesenho do Simulador de Impacto do Split Payment

## 1. Introdução

Este documento apresenta as especificações técnicas para uma reformulação arquitetural do Simulador de Impacto do Split Payment no Fluxo de Caixa, visando solucionar os problemas de sincronização de dados e melhorar a experiência do usuário. A proposta principal envolve uma inversão do fluxo de trabalho, priorizando a configuração do sistema antes da execução de simulações.

## 2. Visão Geral da Nova Arquitetura

A nova arquitetura proposta reorganiza o fluxo de dados do aplicativo para seguir uma direção unidirecional clara: configuração → simulação. Esta abordagem substitui o modelo atual onde existem múltiplos pontos de configuração e sincronização entre diferentes módulos.

### 2.1 Princípios Arquiteturais

- **Fluxo de Dados Unidirecional**: Estabelecer uma direção clara, da configuração para a simulação.
- **Centralização de Configurações**: Consolidar todas as configurações em um local centralizado.
- **Reutilização de Componentes**: Manter componentes reutilizáveis existentes, mas com fluxo de dados redesenhado.
- **Persistência Coordenada**: Implementar um modelo uniforme de persistência de dados.
- **Separação de Preocupações**: Distinguir claramente entre configuração do sistema e execução de simulações.

### 2.2 Diagrama Conceitual da Nova Arquitetura

```
┌───────────────────────────┐      ┌───────────────────────────┐
│                           │      │                           │
│    Configurações Gerais   │      │  Configurações Setoriais  │
│                           │──┐   │                           │
│   - Nome da Empresa       │  │   │  - Parâmetros Setoriais   │
│   - Setor de Atividade    │  │   │  - Alíquotas             │
│   - Regime Tributário     │  │   │  - Cronogramas           │
│                           │  │   │                           │
└───────────────────────────┘  │   └───────────────────────────┘
                               │   │
                               ▼   ▼
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                    Repositório Central                        │
│                                                               │
│  - Configurações da Empresa (nome, setor, regime)             │
│  - Setores Cadastrados e Parâmetros                           │
│  - Configurações de Simulação                                 │
│  - Estado dos Formulários                                     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────┐      ┌───────────────────────────┐
│                           │      │                           │
│   Simulação Principal     │      │   Estratégias Mitigação   │
│                           │      │                           │
│  - Parâmetros Simulação   │      │ - Estratégias Baseadas    │
│  - Resultados             │◄─────┤   em Simulação            │
│  - Gráficos               │      │ - Análises Comparativas   │
│                           │      │                           │
└───────────────────────────┘      └───────────────────────────┘
                               ▲
                               │
┌───────────────────────────┐  │
│                           │  │
│    Memória de Cálculo     │──┘
│                           │
│  - Resultados Detalhados  │
│  - Histórico              │
│                           │
└───────────────────────────┘
```

## 3. Estrutura de Navegação

### 3.1 Reorganização das Abas

1. **Configurações Gerais** (Nova Aba)
   - Informações básicas da empresa
   - Seleção do setor de atividade
   - Regime tributário
   - Parâmetros financeiros gerais

2. **Configurações Setoriais** (Modificada)
   - Parâmetros específicos do setor
   - Alíquotas e reduções setoriais
   - Cronogramas de implementação

3. **Simulação Principal** (Modificada)
   - Visualiza dados pré-configurados (somente leitura)
   - Parâmetros específicos da simulação
   - Execução da simulação
   - Visualização de resultados

4. **Estratégias de Mitigação** (Mantida)
   - Baseada nos resultados da simulação

5. **Memória de Cálculo** (Mantida)
   - Visualização detalhada dos cálculos

### 3.2 Fluxo de Navegação Recomendado

```
Início
  │
  ▼
┌─────────────────────┐
│ Configurações Gerais│
└─────────────────────┘
  │
  ▼
┌─────────────────────┐
│Configurações Setoriais
└─────────────────────┘
  │
  ▼
┌─────────────────────┐
│ Simulação Principal │
└─────────────────────┘
  │
  ├───────────────┐
  │               │
  ▼               ▼
┌─────────────┐ ┌─────────────┐
│ Estratégias │ │ Memória de  │
│ Mitigação   │ │ Cálculo     │
└─────────────┘ └─────────────┘
```

## 4. Especificação Detalhada

### 4.1 Estrutura de Dados Unificada

A estrutura de dados centralizada do aplicativo deve ser implementada como um objeto global que será a fonte única de verdade:

```javascript
/**
 * Estrutura de dados unificada para o Simulador de Impacto do Split Payment
 * Central para todo o aplicativo
 */
const ConfiguracaoSimulador = {
    /**
     * Informações básicas da empresa
     */
    empresa: {
        nome: "",
        setor: "",  // Código do setor selecionado
        regime: "",  // Regime tributário
        faturamento: 0,
        periodo: "mensal", // "mensal" ou "anual"
        margem: 0 // Percentual decimal (ex: 0.15 para 15%)
    },

    /**
     * Configurações do ciclo financeiro
     */
    cicloFinanceiro: {
        pmr: 30, // Prazo Médio de Recebimento
        pmp: 30, // Prazo Médio de Pagamento
        pme: 30, // Prazo Médio de Estoque
        percVista: 0.3, // Percentual de vendas à vista (decimal)
        percPrazo: 0.7  // Percentual de vendas a prazo (decimal)
    },

    /**
     * Parâmetros fiscais
     */
    parametrosFiscais: {
        aliquota: 0.265, // Alíquota efetiva atual
        tipoOperacao: "", // "b2b", "b2c" ou "mista"
        creditos: 0 // Créditos tributários mensais
    },

    /**
     * Parâmetros da simulação
     */
    parametrosSimulacao: {
        dataInicial: "2026-01-01",
        dataFinal: "2033-12-31",
        cenario: "moderado", // "conservador", "moderado", "otimista" ou "personalizado"
        taxaCrescimento: 0.05 // Para cenário personalizado
    },

    /**
     * Alíquotas base do sistema tributário
     */
    aliquotasBase: {
        CBS: 0.088, // 8,8%
        IBS: 0.177  // 17,7%
    },

    /**
     * Cronograma de implementação
     * Percentuais em formato decimal
     */
    cronogramaImplementacao: {
        2026: 0.10,
        2027: 0.25,
        2028: 0.40,
        2029: 0.55,
        2030: 0.70,
        2031: 0.85,
        2032: 0.95,
        2033: 1.00
    },

    /**
     * Setores cadastrados com parâmetros específicos
     * Objeto indexado por código do setor
     */
    setoresEspeciais: {
        // Exemplo:
        "comercio": {
            nome: "Comércio Varejista",
            aliquotaEfetiva: 0.265,
            reducaoEspecial: 0.0,
            cronogramaProprio: false,
            cronograma: null
        },
        // Outros setores...
    },

    /**
     * Parâmetros financeiros para cálculos
     */
    parametrosFinanceiros: {
        taxaAntecipacaoRecebiveis: 0.018, // 1,8% a.m.
        taxaCapitalGiro: 0.021, // 2,1% a.m.
        spreadBancario: 0.035 // 3,5 p.p.
    },

    /**
     * Estratégias de mitigação selecionadas
     */
    estrategiasMitigacao: {
        ajustePrecos: {
            ativar: false,
            percentualAumento: 0.05,
            elasticidade: -1.2,
            impactoVendas: 0,
            periodoAjuste: 3
        },
        renegociacaoPrazos: {
            ativar: false,
            aumentoPrazo: 15,
            percentualFornecedores: 60,
            contrapartidas: "nenhuma",
            custoContrapartida: 0
        },
        antecipacaoRecebiveis: {
            ativar: false,
            percentualAntecipacao: 50,
            taxaDesconto: 0.018,
            prazoAntecipacao: 25
        },
        capitalGiro: {
            ativar: false,
            valorCaptacao: 100,
            taxaJuros: 0.021,
            prazoPagamento: 12,
            carencia: 3
        },
        mixProdutos: {
            ativar: false,
            percentualAjuste: 30,
            focoAjuste: "ciclo",
            impactoReceita: -5,
            impactoMargem: 3.5
        },
        meiosPagamento: {
            ativar: false,
            distribuicaoAtual: {
                vista: 30,
                prazo: 70
            },
            distribuicaoNova: {
                vista: 40,
                dias30: 30,
                dias60: 20,
                dias90: 10
            },
            taxaIncentivo: 3
        }
    },

    /**
     * Resultados da última simulação
     */
    resultadosSimulacao: {
        impactoBase: null,
        projecaoTemporal: null,
        estrategiasMitigacao: null,
        memoriaCalculo: null
    },

    /**
     * Estado da interface
     */
    interfaceState: {
        tabAtiva: "configuracoes-gerais",
        dropdownsInicializados: false,
        simulacaoRealizada: false
    }
};
```

### 4.2 Módulos do Sistema

Reorganizar o código em módulos mais bem definidos:

1. **Módulo de Configuração**
   - Gerencia todas as configurações do sistema
   - Persiste e recupera dados
   - Valida parâmetros

2. **Módulo de Simulação**
   - Executa simulações com base nas configurações
   - Calcula impactos e projeções
   - Gera relatórios

3. **Módulo de Interface**
   - Gerencia a navegação entre abas
   - Atualiza componentes visuais
   - Coleta entrada do usuário

4. **Módulo de Persistência**
   - Salva e recupera dados do localStorage
   - Mantém a integridade dos dados

5. **Módulo de Utilidades**
   - Funções de formatação
   - Funções auxiliares
   - Validadores

### 4.3 Implementação do Repositório Central

```javascript
// Implementação do padrão de repositório para gerenciar estado global
const SimuladorRepository = {
    // Dados compartilhados - inicializados com valores padrão
    _dados: { ... }, // Estrutura completa definida em 4.1
    
    // Obtém todos os dados
    obterDados: function() {
        return this._dados;
    },
    
    // Obtém uma seção específica
    obterSecao: function(secao) {
        return this._dados[secao];
    },
    
    // Atualiza uma seção específica
    atualizarSecao: function(secao, dados) {
        this._dados[secao] = { ...this._dados[secao], ...dados };
        this._notificarMudanca(secao);
        return this._dados[secao];
    },
    
    // Atualiza um campo específico
    atualizarCampo: function(secao, campo, valor) {
        if (!this._dados[secao]) {
            console.error(`Seção '${secao}' não encontrada`);
            return null;
        }
        
        this._dados[secao][campo] = valor;
        this._notificarMudanca(secao, campo);
        return valor;
    },
    
    // Salva todos os dados no localStorage
    salvar: function() {
        try {
            localStorage.setItem('simulador-split-payment', JSON.stringify(this._dados));
            console.log('Dados salvos com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    },
    
    // Carrega dados do localStorage
    carregar: function() {
        try {
            const dadosSalvos = localStorage.getItem('simulador-split-payment');
            if (dadosSalvos) {
                this._dados = JSON.parse(dadosSalvos);
                console.log('Dados carregados com sucesso');
                this._notificarMudanca('*');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return false;
        }
    },
    
    // Sistema de observadores para atualizações de UI
    _observadores: {},
    
    // Adiciona um observador para mudanças em seções/campos
    observar: function(secao, callback) {
        if (!this._observadores[secao]) {
            this._observadores[secao] = [];
        }
        this._observadores[secao].push(callback);
    },
    
    // Notifica observadores sobre mudanças
    _notificarMudanca: function(secao, campo) {
        // Notificar observadores da seção específica
        if (this._observadores[secao]) {
            this._observadores[secao].forEach(callback => {
                callback(this._dados[secao], campo);
            });
        }
        
        // Notificar observadores globais
        if (secao !== '*' && this._observadores['*']) {
            this._observadores['*'].forEach(callback => {
                callback(this._dados, secao);
            });
        }
    }
};
```

## 5. Especificação por Módulo

### 5.1 Aba de Configurações Gerais (Nova)

Esta nova aba funcionará como o ponto de entrada para configuração do sistema, onde o usuário fornecerá os dados fundamentais da empresa.

#### 5.1.1 Interface de Usuário

```html
<div id="configuracoes-gerais" class="tab-content">
    <h2>Configurações Gerais da Empresa</h2>
    <p class="text-muted mb-3">Defina informações básicas da empresa para simulação do impacto do Split Payment.</p>
    
    <div class="group-box">
        <h3>Dados da Empresa</h3>
        <div class="form-row">
            <div class="form-column">
                <div class="form-group">
                    <label for="nome-empresa">Nome da Empresa:</label>
                    <input type="text" id="nome-empresa" name="nome-empresa" required>
                </div>
            </div>
            <div class="form-column">
                <div class="form-group">
                    <label for="setor-config">Setor de Atividade:</label>
                    <select id="setor-config" name="setor-config" required>
                        <option value="">Selecione...</option>
                        <!-- Opções serão preenchidas via JavaScript -->
                    </select>
                </div>
            </div>
            <div class="form-column">
                <div class="form-group">
                    <label for="regime-config">Regime Tributário:</label>
                    <select id="regime-config" name="regime-config" required>
                        <option value="">Selecione...</option>
                        <option value="simples">Simples Nacional</option>
                        <option value="presumido">Lucro Presumido</option>
                        <option value="real">Lucro Real</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
    
    <div class="group-box">
        <h3>Parâmetros Financeiros Gerais</h3>
        <div class="form-row">
            <div class="form-column">
                <div class="form-group">
                    <label for="faturamento-config">Faturamento:</label>
                    <div class="input-group">
                        <input type="text" id="faturamento-config" name="faturamento-config" class="money-input">
                        <div class="input-group-append">
                            <span class="input-group-text">R$</span>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Período:</label>
                    <div class="radio-group">
                        <div class="radio-item">
                            <input type="radio" id="periodo-mensal-config" name="periodo-config" value="mensal" checked>
                            <label for="periodo-mensal-config">Mensal</label>
                        </div>
                        <div class="radio-item">
                            <input type="radio" id="periodo-anual-config" name="periodo-config" value="anual">
                            <label for="periodo-anual-config">Anual</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-column">
                <div class="form-group">
                    <label for="margem-config">Margem Operacional (%):</label>
                    <div class="input-group">
                        <input type="text" id="margem-config" name="margem-config" class="percent-input">
                        <div class="input-group-append">
                            <span class="input-group-text">%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="group-box">
        <h3>Parâmetros do Ciclo Financeiro</h3>
        <div class="form-row">
            <div class="form-column">
                <div class="form-group">
                    <label for="pmr-config">Prazo Médio de Recebimento (PMR):</label>
                    <div class="input-group">
                        <input type="number" id="pmr-config" name="pmr-config" min="0" step="1" value="30">
                        <div class="input-group-append">
                            <span class="input-group-text">dias</span>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="pmp-config">Prazo Médio de Pagamento (PMP):</label>
                    <div class="input-group">
                        <input type="number" id="pmp-config" name="pmp-config" min="0" step="1" value="30">
                        <div class="input-group-append">
                            <span class="input-group-text">dias</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-column">
                <div class="form-group">
                    <label for="pme-config">Prazo Médio de Estoque (PME):</label>
                    <div class="input-group">
                        <input type="number" id="pme-config" name="pme-config" min="0" step="1" value="30">
                        <div class="input-group-append">
                            <span class="input-group-text">dias</span>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="ciclo-financeiro-config">Ciclo Financeiro:</label>
                    <div class="input-group">
                        <input type="number" id="ciclo-financeiro-config" name="ciclo-financeiro-config" readonly>
                        <div class="input-group-append">
                            <span class="input-group-text">dias</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-column">
                <div class="form-group">
                    <label for="perc-vista-config">Percentual de Vendas à Vista (%):</label>
                    <div class="input-group">
                        <input type="text" id="perc-vista-config" name="perc-vista-config" class="percent-input">
                        <div class="input-group-append">
                            <span class="input-group-text">%</span>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="perc-prazo-config">Percentual de Vendas a Prazo (%):</label>
                    <div class="input-group">
                        <input type="text" id="perc-prazo-config" name="perc-prazo-config" readonly class="percent-input" style="background-color: #f8f9fa;">
                        <div class="input-group-append">
                            <span class="input-group-text">%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Botões -->
    <div class="buttons-container">
        <button type="button" class="primary" id="btn-salvar-config">Salvar Configurações</button>
        <button type="reset" class="secondary" id="btn-limpar-config">Limpar</button>
        <button type="button" class="accent" id="btn-avancar-config">Avançar para Configurações Setoriais</button>
    </div>
</div>
```

#### 5.1.2 Controlador da Aba

```javascript
// Controlador para a aba de Configurações Gerais
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
```

### 5.2 Modificações na Aba de Simulação Principal

#### 5.2.1 Modificações na Interface

```html
<div id="simulacao-principal" class="tab-content">
    <h2>Simulação Principal</h2>
    
    <!-- Dados básicos da empresa (somente leitura) -->
    <div class="group-box">
        <h3>Dados da Empresa</h3>
        <div class="form-row">
            <div class="form-column">
                <div class="form-group">
                    <label for="nome-empresa-sim">Nome da Empresa:</label>
                    <input type="text" id="nome-empresa-sim" name="nome-empresa-sim" readonly>
                </div>
            </div>
            <div class="form-column">
                <div class="form-group">
                    <label for="setor">Setor de Atividade:</label>
                    <select id="setor" name="setor" disabled>
                        <option value="">Selecione...</option>
                        <!-- Preenchido via JavaScript -->
                    </select>
                    <button type="button" class="btn btn-sm btn-link edit-button" id="btn-editar-setor">
                        Editar em Configurações
                    </button>
                </div>
            </div>
            <div class="form-column">
                <div class="form-group">
                    <label for="regime">Regime Tributário:</label>
                    <select id="regime" name="regime" disabled>
                        <option value="">Selecione...</option>
                        <option value="simples">Simples Nacional</option>
                        <option value="presumido">Lucro Presumido</option>
                        <option value="real">Lucro Real</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
    
    <!-- O resto do formulário de simulação permanece similar -->
    <!-- Porém, os campos já preenchidos em Configurações Gerais são pré-preenchidos e somente leitura -->
    
    <!-- ... (demais elementos do formulário) ... -->
    
    <!-- Botões -->
    <div class="buttons-container">
        <button type="button" class="primary" id="btn-simular">Simular</button>
        <button type="button" class="secondary" id="btn-voltar-config">Voltar para Configurações</button>
    </div>
</div>
```

#### 5.2.2 Modificações no Controlador

```javascript
// Controlador para a aba de Simulação Principal
const SimulacaoPrincipalController = {
    inicializar: function() {
        console.log('Inicializando controlador de Simulação Principal');
        
        // Verificar se as configurações foram realizadas
        this.verificarConfiguracaoPreviaPrenchida();
        
        // Carregar dados do repositório
        this.carregarDados();
        
        // Inicializar eventos
        this.inicializarEventos();
        
        console.log('Controlador de Simulação Principal inicializado');
    },
    
    verificarConfiguracaoPreviaPrenchida: function() {
        // Verificar se as configurações básicas foram preenchidas
        const dadosEmpresa = SimuladorRepository.obterSecao('empresa');
        
        if (!dadosEmpresa.nome || !dadosEmpresa.setor || !dadosEmpresa.regime) {
            // Redirecionar para a aba de configurações gerais
            alert('É necessário preencher as configurações gerais da empresa antes de realizar uma simulação.');
            document.querySelector('.tab-button[data-tab="configuracoes-gerais"]').click();
        }
    },
    
    carregarDados: function() {
        // Carregar dados da empresa (somente leitura)
        const dadosEmpresa = SimuladorRepository.obterSecao('empresa');
        const dadosCiclo = SimuladorRepository.obterSecao('cicloFinanceiro');
        const parametrosFiscais = SimuladorRepository.obterSecao('parametrosFiscais');
        const parametrosSimulacao = SimuladorRepository.obterSecao('parametrosSimulacao');
        
        // Preencher campos da empresa
        document.getElementById('nome-empresa-sim').value = dadosEmpresa.nome || '';
        
        // Preencher setor
        const selectSetor = document.getElementById('setor');
        if (selectSetor && dadosEmpresa.setor) {
            // Garantir que as opções estão preenchidas
            this.atualizarDropdownSetores();
            selectSetor.value = dadosEmpresa.setor;
        }
        
        // Preencher regime
        const selectRegime = document.getElementById('regime');
        if (selectRegime && dadosEmpresa.regime) {
            selectRegime.value = dadosEmpresa.regime;
        }
        
        // Preencher faturamento
        const faturamento = document.getElementById('faturamento');
        if (faturamento && dadosEmpresa.faturamento) {
            faturamento.value = FormatacaoHelper.formatarMoeda(dadosEmpresa.faturamento);
        }
        
        // Preencher período
        const periodoMensal = document.getElementById('periodo-mensal');
        const periodoAnual = document.getElementById('periodo-anual');
        if (periodoMensal && periodoAnual) {
            if (dadosEmpresa.periodo === 'anual') {
                periodoAnual.checked = true;
            } else {
                periodoMensal.checked = true;
            }
        }
        
        // Preencher margem
        const margem = document.getElementById('margem');
        if (margem && dadosEmpresa.margem !== undefined) {
            margem.value = FormatacaoHelper.formatarPercentual(dadosEmpresa.margem);
        }
        
        // Preencher dados do ciclo financeiro
        document.getElementById('pmr').value = dadosCiclo.pmr || 30;
        document.getElementById('pmp').value = dadosCiclo.pmp || 30;
        document.getElementById('pme').value = dadosCiclo.pme || 30;
        
        // Calcular ciclo financeiro
        const cicloFinanceiro = document.getElementById('ciclo-financeiro');
        if (cicloFinanceiro) {
            cicloFinanceiro.value = (dadosCiclo.pmr || 30) + (dadosCiclo.pme || 30) - (dadosCiclo.pmp || 30);
        }
        
        // Preencher percentuais
        const percVista = document.getElementById('perc-vista');
        if (percVista && dadosCiclo.percVista !== undefined) {
            percVista.value = FormatacaoHelper.formatarPercentual(dadosCiclo.percVista);
        }
        
        const percPrazo = document.getElementById('perc-prazo');
        if (percPrazo && dadosCiclo.percPrazo !== undefined) {
            percPrazo.value = FormatacaoHelper.formatarPercentual(dadosCiclo.percPrazo);
        }
        
        // Preencher parâmetros fiscais
        const aliquota = document.getElementById('aliquota');
        if (aliquota && parametrosFiscais.aliquota !== undefined) {
            aliquota.value = parametrosFiscais.aliquota * 100; // Converter para percentual
        }
        
        const tipoOperacao = document.getElementById('tipo-operacao');
        if (tipoOperacao && parametrosFiscais.tipoOperacao) {
            tipoOperacao.value = parametrosFiscais.tipoOperacao;
        }
        
        const creditos = document.getElementById('creditos');
        if (creditos && parametrosFiscais.creditos !== undefined) {
            creditos.value = FormatacaoHelper.formatarMoeda(parametrosFiscais.creditos);
        }
        
        // Preencher parâmetros de simulação
        const dataInicial = document.getElementById('data-inicial');
        if (dataInicial && parametrosSimulacao.dataInicial) {
            dataInicial.value = parametrosSimulacao.dataInicial;
        }
        
        const dataFinal = document.getElementById('data-final');
        if (dataFinal && parametrosSimulacao.dataFinal) {
            dataFinal.value = parametrosSimulacao.dataFinal;
        }
        
        const cenario = document.getElementById('cenario');
        if (cenario && parametrosSimulacao.cenario) {
            cenario.value = parametrosSimulacao.cenario;
            
            // Se for cenário personalizado, mostrar campo de taxa
            if (parametrosSimulacao.cenario === 'personalizado') {
                const divCenarioPersonalizado = document.getElementById('cenario-personalizado');
                if (divCenarioPersonalizado) {
                    divCenarioPersonalizado.style.display = 'block';
                }
                
                const taxaCrescimento = document.getElementById('taxa-crescimento');
                if (taxaCrescimento && parametrosSimulacao.taxaCrescimento !== undefined) {
                    taxaCrescimento.value = parametrosSimulacao.taxaCrescimento * 100; // Converter para percentual
                }
            }
        }
    },
    
    inicializarEventos: function() {
        // Botão para editar configurações
        const btnEditarSetor = document.getElementById('btn-editar-setor');
        if (btnEditarSetor) {
            btnEditarSetor.addEventListener('click', () => {
                document.querySelector('.tab-button[data-tab="configuracoes-gerais"]').click();
            });
        }
        
        // Botão voltar para configurações
        const btnVoltarConfig = document.getElementById('btn-voltar-config');
        if (btnVoltarConfig) {
            btnVoltarConfig.addEventListener('click', () => {
                document.querySelector('.tab-button[data-tab="configuracoes-gerais"]').click();
            });
        }
        
        // Botão simular
        const btnSimular = document.getElementById('btn-simular');
        if (btnSimular) {
            btnSimular.addEventListener('click', () => {
                this.realizarSimulacao();
            });
        }
        
        // Campo de alíquota
        const campoAliquota = document.getElementById('aliquota');
        if (campoAliquota) {
            campoAliquota.addEventListener('change', () => {
                const valor = parseFloat(campoAliquota.value);
                if (!isNaN(valor)) {
                    SimuladorRepository.atualizarCampo('parametrosFiscais', 'aliquota', valor / 100);
                }
            });
        }
        
        // Campo tipo de operação
        const campoTipoOperacao = document.getElementById('tipo-operacao');
        if (campoTipoOperacao) {
            campoTipoOperacao.addEventListener('change', () => {
                SimuladorRepository.atualizarCampo('parametrosFiscais', 'tipoOperacao', campoTipoOperacao.value);
            });
        }
        
        // Campo de créditos
        const campoCreditos = document.getElementById('creditos');
        if (campoCreditos) {
            campoCreditos.addEventListener('change', () => {
                const valor = FormatacaoHelper.extrairValorNumerico(campoCreditos.value);
                SimuladorRepository.atualizarCampo('parametrosFiscais', 'creditos', valor);
            });
        }
        
        // Campos de parâmetros de simulação
        const campoDataInicial = document.getElementById('data-inicial');
        if (campoDataInicial) {
            campoDataInicial.addEventListener('change', () => {
                SimuladorRepository.atualizarCampo('parametrosSimulacao', 'dataInicial', campoDataInicial.value);
            });
        }
        
        const campoDataFinal = document.getElementById('data-final');
        if (campoDataFinal) {
            campoDataFinal.addEventListener('change', () => {
                SimuladorRepository.atualizarCampo('parametrosSimulacao', 'dataFinal', campoDataFinal.value);
            });
        }
        
        const campoCenario = document.getElementById('cenario');
        if (campoCenario) {
            campoCenario.addEventListener('change', () => {
                SimuladorRepository.atualizarCampo('parametrosSimulacao', 'cenario', campoCenario.value);
                
                // Mostrar/ocultar campo de taxa personalizada
                const divCenarioPersonalizado = document.getElementById('cenario-personalizado');
                if (divCenarioPersonalizado) {
                    divCenarioPersonalizado.style.display = 
                        campoCenario.value === 'personalizado' ? 'block' : 'none';
                }
            });
        }
        
        const campoTaxaCrescimento = document.getElementById('taxa-crescimento');
        if (campoTaxaCrescimento) {
            campoTaxaCrescimento.addEventListener('change', () => {
                const valor = parseFloat(campoTaxaCrescimento.value);
                if (!isNaN(valor)) {
                    SimuladorRepository.atualizarCampo('parametrosSimulacao', 'taxaCrescimento', valor / 100);
                }
            });
        }
    },
    
    atualizarDropdownSetores: function() {
        const selectSetor = document.getElementById('setor');
        if (!selectSetor) {
            console.warn('Elemento select "setor" não encontrado');
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
    },
    
    realizarSimulacao: function() {
        // Verificar se as configurações necessárias estão preenchidas
        const dadosEmpresa = SimuladorRepository.obterSecao('empresa');
        
        if (!dadosEmpresa.nome || !dadosEmpresa.setor || !dadosEmpresa.regime) {
            alert('É necessário preencher as configurações básicas da empresa antes de realizar a simulação.');
            return;
        }
        
        // Coletar parâmetros fiscais do formulário
        const aliquota = parseFloat(document.getElementById('aliquota').value) / 100;
        const tipoOperacao = document.getElementById('tipo-operacao').value;
        const creditos = FormatacaoHelper.extrairValorNumerico(document.getElementById('creditos').value);
        
        // Validar parâmetros obrigatórios
        if (isNaN(aliquota) || aliquota <= 0 || !tipoOperacao) {
            alert('Por favor, preencha todos os parâmetros tributários obrigatórios.');
            return;
        }
        
        // Atualizar repositório com valores do formulário
        SimuladorRepository.atualizarSecao('parametrosFiscais', {
            aliquota,
            tipoOperacao,
            creditos
        });
        
        // Coletar parâmetros de simulação
        const dataInicial = document.getElementById('data-inicial').value;
        const dataFinal = document.getElementById('data-final').value;
        const cenario = document.getElementById('cenario').value;
        
        let taxaCrescimento = 0.05; // Valor padrão para cenário moderado
        
        if (cenario === 'personalizado') {
            taxaCrescimento = parseFloat(document.getElementById('taxa-crescimento').value) / 100;
        } else if (cenario === 'conservador') {
            taxaCrescimento = 0.02;
        } else if (cenario === 'otimista') {
            taxaCrescimento = 0.08;
        }
        
        // Validar parâmetros obrigatórios
        if (!dataInicial || !dataFinal || !cenario) {
            alert('Por favor, preencha todos os parâmetros de simulação obrigatórios.');
            return;
        }
        
        // Atualizar repositório
        SimuladorRepository.atualizarSecao('parametrosSimulacao', {
            dataInicial,
            dataFinal,
            cenario,
            taxaCrescimento
        });
        
        // Salvar dados no localStorage
        SimuladorRepository.salvar();
        
        // Executar a simulação
        console.log('Iniciando simulação...');
        
        // Simular usando o módulo de simulação (a ser implementado)
        const resultados = SimuladorModulo.simular();
        
        // Armazenar resultados no repositório
        SimuladorRepository.atualizarSecao('resultadosSimulacao', resultados);
        
        // Exibir resultados
        this.exibirResultados(resultados);
        
        // Marcar que a simulação foi realizada
        SimuladorRepository.atualizarCampo('interfaceState', 'simulacaoRealizada', true);
    },
    
    exibirResultados: function(resultados) {
        // Implementar exibição dos resultados
        const containerResultados = document.getElementById('resultados');
        if (!containerResultados) {
            console.error('Container de resultados não encontrado');
            return;
        }
        
        // Formatar valores para exibição
        const formatarValor = val => FormatacaoHelper.formatarMoeda(val || 0);
        const formatarPercent = val => FormatacaoHelper.formatarPercentual(val || 0);
        
        // Extrair dados principais
        const impacto = resultados.impactoBase;
        const projecao = resultados.projecaoTemporal;
        
        // Construir HTML dos resultados
        let html = `
            <div class="result-card">
                <h3>Resultados da Simulação</h3>
                
                <div class="result-section">
                    <h4>Impacto Inicial (${projecao?.parametros?.anoInicial || impacto.ano || '2026'})</h4>
                    <table class="result-table">
                        <tr>
                            <td>Percentual de Implementação:</td>
                            <td>${formatarPercent(impacto.percentualImplementacao)}</td>
                        </tr>
                        <tr>
                            <td>Diferença no Capital de Giro:</td>
                            <td class="${(impacto.diferencaCapitalGiro || 0) >= 0 ? 'negative' : 'positive'}">
                                ${formatarValor(impacto.diferencaCapitalGiro)}
                            </td>
                        </tr>
                        <tr>
                            <td>Impacto Percentual:</td>
                            <td class="${impacto.percentualImpacto >= 0 ? 'positive' : 'negative'}">
                                ${formatarPercent(impacto.percentualImpacto/100)}
                            </td>
                        </tr>
                        <tr>
                            <td>Necessidade Adicional de Capital:</td>
                            <td>${formatarValor(impacto.necessidadeAdicionalCapitalGiro)}</td>
                        </tr>
                        <tr>
                            <td>Impacto na Margem Operacional:</td>
                            <td>De ${formatarPercent(impacto.margemOperacionalOriginal)} para ${formatarPercent(impacto.margemOperacionalAjustada)}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="result-section">
                    <h4>Projeção do Impacto</h4>
                    <p>Impacto acumulado ao longo do período ${projecao?.parametros?.anoInicial || '2026'}-${projecao?.parametros?.anoFinal || '2033'}:</p>
                    <table class="result-table">
                        <tr>
                            <td>Necessidade Total de Capital:</td>
                            <td>${formatarValor(projecao?.impactoAcumulado?.totalNecessidadeCapitalGiro)}</td>
                        </tr>
                        <tr>
                            <td>Custo Financeiro Total:</td>
                            <td>${formatarValor(projecao.impactoAcumulado.custoFinanceiroTotal)}</td>
                        </tr>
                        <tr>
                            <td>Impacto Médio na Margem:</td>
                            <td>${formatarPercent(projecao.impactoAcumulado.impactoMedioMargem/100)}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="call-to-action">
                    <button id="btn-estrategias" class="primary">Simular Estratégias de Mitigação</button>
                    <button id="btn-detalhes" class="secondary">Ver Detalhes Completos</button>
                </div>
            </div>
        `;
        
        // Inserir o HTML no container
        containerResultados.innerHTML = html;
        
        // Adicionar event listeners aos botões
        document.getElementById('btn-estrategias')?.addEventListener('click', () => {
            document.querySelector('.tab-button[data-tab="estrategias-mitigacao"]').click();
        });
        
        document.getElementById('btn-detalhes')?.addEventListener('click', () => {
            document.querySelector('.tab-button[data-tab="memoria-calculo"]').click();
        });
    }
};
```

### 5.3 Modificações na Aba de Configurações Setoriais

As modificações nesta aba serão menos extensas, pois suas funções principais serão mantidas. As principais alterações são:

1. Integração com o novo repositório central de dados
2. Modificação no fluxo de salvamento de dados
3. Sincronização explícita com as demais abas

Exemplo de código principal:

```javascript
// Método salvarConfiguracoes do objeto SimuladorApp.ConfiguracoesSetoriais
salvarConfiguracoes: function() {
    // ... código existente para coletar dados ...
    
    // Atualizar o repositório central
    const setoresFormatados = {};
    
    for (let i = 0; i < linhasSetores.length; i++) {
        // ... código existente para extrair dados ...
        
        // Armazenar no formato padronizado
        setoresFormatados[codigoFinal] = {
            nome: nome,
            aliquotaEfetiva: parseFloat(inputAliquota.value) / 100,
            reducaoEspecial: parseFloat(inputReducao.value) / 100,
            cronogramaProprio: selectCronograma.value === 'proprio',
            cronograma: this._setoresCronogramas[id] || null
        };
    }
    
    // Atualizar repositório central com os setores formatados
    SimuladorRepository.atualizarSecao('setoresEspeciais', setoresFormatados);
    
    // Salvar no localStorage através do repositório central
    SimuladorRepository.salvar();
    
    // Notificar outros módulos sobre a mudança
    // Não é mais necessário chamar métodos específicos, pois o repositório notifica os observadores
    
    alert('Configurações salvas com sucesso!');
}
```

### 5.4 Módulo de Simulação

Este novo módulo centraliza toda a lógica de simulação:

```javascript
// Módulo para execução de simulações
const SimuladorModulo = {
    /**
     * Realiza uma simulação completa
     * @returns {Object} Resultados da simulação
     */
    simular: function() {
        console.log('Iniciando simulação...');
        
        // Obter dados do repositório
        const dadosEmpresa = SimuladorRepository.obterSecao('empresa');
        const cicloFinanceiro = SimuladorRepository.obterSecao('cicloFinanceiro');
        const parametrosFiscais = SimuladorRepository.obterSecao('parametrosFiscais');
        const parametrosSimulacao = SimuladorRepository.obterSecao('parametrosSimulacao');
        
        // Preparar dados para simulação
        const dados = {
            faturamento: dadosEmpresa.faturamento,
            periodo: dadosEmpresa.periodo,
            setor: dadosEmpresa.setor,
            regime: dadosEmpresa.regime,
            margem: dadosEmpresa.margem,
            pmr: cicloFinanceiro.pmr,
            pmp: cicloFinanceiro.pmp,
            pme: cicloFinanceiro.pme,
            percVista: cicloFinanceiro.percVista,
            percPrazo: cicloFinanceiro.percPrazo,
            aliquota: parametrosFiscais.aliquota,
            tipoOperacao: parametrosFiscais.tipoOperacao,
            creditos: parametrosFiscais.creditos,
            dataInicial: parametrosSimulacao.dataInicial,
            dataFinal: parametrosSimulacao.dataFinal,
            cenario: parametrosSimulacao.cenario,
            taxaCrescimento: parametrosSimulacao.taxaCrescimento
        };
        
        // Extrair ano inicial e final para simulação
        const anoInicial = parseInt(parametrosSimulacao.dataInicial.split('-')[0]);
        const anoFinal = parseInt(parametrosSimulacao.dataFinal.split('-')[0]);
        
        // Calcular impacto inicial
        const impactoBase = this.calcularImpactoCapitalGiro(dados, anoInicial);
        
        // Simular período de transição
        const projecaoTemporal = this.simularPeriodoTransicao(
            dados, 
            anoInicial, 
            anoFinal, 
            parametrosSimulacao.cenario, 
            parametrosSimulacao.taxaCrescimento
        );
        
        // Armazenar memória de cálculo
        const memoriaCalculo = {
            parametrosEntrada: dados,
            resultadoAtual: this._resultadoAtual,
            resultadoSplitPayment: this._resultadoSplitPayment,
            impactoGeral: impactoBase,
            projecaoTemporal: projecaoTemporal
        };
        
        // Resultados completos
        const resultados = {
            impactoBase,
            projecaoTemporal,
            memoriaCalculo
        };
        
        console.log('Simulação concluída com sucesso');
        
        return resultados;
    },
    
    // Variáveis para armazenar resultados intermediários
    _resultadoAtual: null,
    _resultadoSplitPayment: null,
    
    /**
     * Calcula o fluxo de caixa no regime tributário atual
     * @param {Object} dados Dados para simulação
     * @returns {Object} Resultados do fluxo de caixa atual
     */
    calcularFluxoCaixaAtual: function(dados) {
        // ... implementação existente ...
        
        // Armazenar resultado para memória de cálculo
        this._resultadoAtual = resultados;
        
        return resultados;
    },
    
    /**
     * Calcula o fluxo de caixa com o regime de Split Payment
     * @param {Object} dados Dados para simulação
     * @param {number} ano Ano para simulação
     * @returns {Object} Resultados do fluxo de caixa com Split Payment
     */
    calcularFluxoCaixaSplitPayment: function(dados, ano = 2026) {
        // ... implementação existente ...
        
        // Armazenar resultado para memória de cálculo
        this._resultadoSplitPayment = resultados;
        
        return resultados;
    },
    
    /**
     * Calcula o impacto do Split Payment no capital de giro
     * @param {Object} dados Dados para simulação
     * @param {number} ano Ano para simulação
     * @returns {Object} Resultados do impacto no capital de giro
     */
    calcularImpactoCapitalGiro: function(dados, ano = 2026) {
        // ... implementação existente ...
        
        return resultados;
    },
    
    /**
     * Simula o impacto ao longo do período de transição
     * @param {Object} dados Dados para simulação
     * @param {number} anoInicial Ano inicial
     * @param {number} anoFinal Ano final
     * @param {string} cenario Cenário de crescimento
     * @param {number} taxaCrescimento Taxa de crescimento para cenário personalizado
     * @returns {Object} Resultados da projeção temporal
     */
    simularPeriodoTransicao: function(dados, anoInicial = 2026, anoFinal = 2033, cenario = 'moderado', taxaCrescimento = null) {
        // ... implementação existente ...
        
        return resultados;
    },
    
    /**
     * Simula estratégias de mitigação
     * @param {Object} dados Dados para simulação
     * @param {Object} estrategias Estratégias selecionadas
     * @param {number} ano Ano de referência
     * @returns {Object} Resultados da simulação de estratégias
     */
    simularEstrategiasMitigacao: function(dados, estrategias, ano = 2026) {
        // ... implementação existente ...
        
        return resultados;
    }
};
```

## 6. Configuração do Sistema e Inicialização

### 6.1 Inicialização da Aplicação

```javascript
// Função de inicialização principal
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando simulador...');
    
    // Inicializar o repositório central
    SimuladorRepository.carregar();
    
    // Inicializar sistema de navegação
    inicializarNavegacao();
    
    // Inicializar controladores para cada aba
    ConfiguracoesGeraisController.inicializar();
    SimulacaoPrincipalController.inicializar();
    
    // Garantir que outras abas que dependem da simulação estejam inicializadas
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            switch (tabId) {
                case 'configuracoes-gerais':
                    ConfiguracoesGeraisController.inicializar();
                    break;
                case 'configuracoes-setoriais':
                    // Inicializar ConfiguracoesSetoriais (código existente)
                    if (SimuladorApp.ConfiguracoesSetoriais) {
                        SimuladorApp.ConfiguracoesSetoriais.inicializar();
                    }
                    break;
                case 'simulacao-principal':
                    SimulacaoPrincipalController.inicializar();
                    break;
                case 'estrategias-mitigacao':
                    // Verificar se a simulação foi realizada
                    const interfaceState = SimuladorRepository.obterSecao('interfaceState');
                    if (!interfaceState.simulacaoRealizada) {
                        alert('É necessário realizar uma simulação antes de acessar as estratégias de mitigação.');
                        document.querySelector('.tab-button[data-tab="simulacao-principal"]').click();
                        return;
                    }
                    // Inicializar EstrategiasMitigacaoController (código existente)
                    break;
                case 'memoria-calculo':
                    // Inicializar MemoriaCalculoController (código existente)
                    break;
            }
        });
    });
    
    // Inicializar na aba de configurações gerais
    document.querySelector('.tab-button[data-tab="configuracoes-gerais"]').click();
    
    console.log('Simulador inicializado com sucesso');
});

// Função para inicializar o sistema de navegação por abas
function inicializarNavegacao() {
    // ... código existente em tab-navigation-system.js ...
}
```

### 6.2 Observadores para Sincronização

Configurar observadores para garantir sincronização automática:

```javascript
// Adicionar observadores após inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Observar mudanças nos setores para atualizar dropdowns
    SimuladorRepository.observar('setoresEspeciais', function(setores) {
        console.log('Setores atualizados, atualizando dropdowns...');
        
        // Atualizar dropdown na aba de configurações gerais
        if (typeof ConfiguracoesGeraisController.inicializarDropdownSetores === 'function') {
            ConfiguracoesGeraisController.inicializarDropdownSetores();
        }
        
        // Atualizar dropdown na aba de simulação
        if (typeof SimulacaoPrincipalController.atualizarDropdownSetores === 'function') {
            SimulacaoPrincipalController.atualizarDropdownSetores();
        }
    });
    
    // Observar mudanças na empresa para atualizar interface de simulação
    SimuladorRepository.observar('empresa', function(dadosEmpresa) {
        console.log('Dados da empresa atualizados, atualizando interface de simulação...');
        
        // Verificar se a aba de simulação está ativa
        const tabAtiva = SimuladorRepository.obterSecao('interfaceState').tabAtiva;
        if (tabAtiva === 'simulacao-principal') {
            // Recarregar dados na interface
            SimulacaoPrincipalController.carregarDados();
        }
    });
});
```

## 7. Considerações de Segurança e Validação

### 7.1 Validação de Dados

Implementar validações robustas para garantir a integridade dos dados:

```javascript
// Objeto de validação
const Validador = {
    /**
     * Valida os dados da empresa
     * @param {Object} dadosEmpresa Dados da empresa
     * @returns {Object} Resultado da validação {valido: boolean, mensagem: string}
     */
    validarDadosEmpresa: function(dadosEmpresa) {
        if (!dadosEmpresa.nome || dadosEmpresa.nome.trim() === '') {
            return { valido: false, mensagem: 'Nome da empresa é obrigatório.' };
        }
        
        if (!dadosEmpresa.setor) {
            return { valido: false, mensagem: 'Setor de atividade é obrigatório.' };
        }
        
        if (!dadosEmpresa.regime) {
            return { valido: false, mensagem: 'Regime tributário é obrigatório.' };
        }
        
        if (isNaN(dadosEmpresa.faturamento) || dadosEmpresa.faturamento <= 0) {
            return { valido: false, mensagem: 'Faturamento deve ser um valor positivo.' };
        }
        
        if (isNaN(dadosEmpresa.margem) || dadosEmpresa.margem < 0 || dadosEmpresa.margem > 1) {
            return { valido: false, mensagem: 'Margem operacional deve ser um percentual entre 0% e 100%.' };
        }
        
        return { valido: true };
    },
    
    /**
     * Valida os dados do ciclo financeiro
     * @param {Object} cicloFinanceiro Dados do ciclo financeiro
     * @returns {Object} Resultado da validação {valido: boolean, mensagem: string}
     */
    validarCicloFinanceiro: function(cicloFinanceiro) {
        if (isNaN(cicloFinanceiro.pmr) || cicloFinanceiro.pmr < 0) {
            return { valido: false, mensagem: 'PMR deve ser um valor não negativo.' };
        }
        
        if (isNaN(cicloFinanceiro.pmp) || cicloFinanceiro.pmp < 0) {
            return { valido: false, mensagem: 'PMP deve ser um valor não negativo.' };
        }
        
        if (isNaN(cicloFinanceiro.pme) || cicloFinanceiro.pme < 0) {
            return { valido: false, mensagem: 'PME deve ser um valor não negativo.' };
        }
        
        if (isNaN(cicloFinanceiro.percVista) || cicloFinanceiro.percVista < 0 || cicloFinanceiro.percVista > 1) {
            return { valido: false, mensagem: 'Percentual de vendas à vista deve ser entre 0% e 100%.' };
        }
        
        if (isNaN(cicloFinanceiro.percPrazo) || cicloFinanceiro.percPrazo < 0 || cicloFinanceiro.percPrazo > 1) {
            return { valido: false, mensagem: 'Percentual de vendas a prazo deve ser entre 0% e 100%.' };
        }
        
        // Validar que a soma é 100%
        const somaPercentuais = cicloFinanceiro.percVista + cicloFinanceiro.percPrazo;
        if (Math.abs(somaPercentuais - 1) > 0.001) { // Tolerância para erros de ponto flutuante
            return { valido: false, mensagem: 'A soma dos percentuais de vendas deve ser 100%.' };
        }
        
        return { valido: true };
    },
    
    // Outros métodos de validação...
};
```

### 7.2 Tratamento de Erros

Adicionar tratamento de erros para operações críticas:

```javascript
// Exemplo de implementação com tratamento de erros
salvarDados: function() {
    try {
        // Coletar dados
        const dadosEmpresa = {
            nome: document.getElementById('nome-empresa').value,
            setor: document.getElementById('setor-config').value,
            // ... outros campos
        };
        
        // Validar dados
        const validacao = Validador.validarDadosEmpresa(dadosEmpresa);
        if (!validacao.valido) {
            alert(validacao.mensagem);
            return false;
        }
        
        // Salvar no repositório
        SimuladorRepository.atualizarSecao('empresa', dadosEmpresa);
        
        // Salvar no localStorage
        const salvamento = SimuladorRepository.salvar();
        if (!salvamento) {
            throw new Error('Falha ao salvar dados no localStorage');
        }
        
        alert('Dados salvos com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        alert('Ocorreu um erro ao salvar os dados: ' + error.message);
        return false;
    }
}
```

## 8. Conclusão e Recomendações

### 8.1 Benefícios da Nova Arquitetura

A nova arquitetura proposta oferece diversos benefícios:

1. **Fluxo de Dados Mais Claro**: A direção unidirecional de configuração para simulação torna o sistema mais intuitivo e menos propenso a erros.

2. **Melhor Experiência do Usuário**: O usuário é guiado através de um processo lógico de configuração antes de realizar simulações.

3. **Redução de Bugs de Sincronização**: Com um repositório central e observadores para mudanças, a sincronização de dados entre diferentes partes do sistema se torna mais robusta.

4. **Manutenção Simplificada**: A separação clara de responsabilidades entre os módulos facilita a manutenção e evolução futura do sistema.

5. **Maior Consistência de Dados**: Os parâmetros configurados são mantidos consistentes em todo o sistema.

### 8.2 Roteiro de Implementação

Recomenda-se a seguinte ordem para implementação:

1. **Repositório Central**: Implementar a estrutura de dados centralizada e o sistema de observadores.

2. **Novas Interfaces**: Criar a aba de Configurações Gerais e modificar a aba de Simulação Principal.

3. **Controladores**: Implementar os controladores para as novas e modificadas abas.

4. **Integração**: Adaptar o código existente para usar o novo repositório central.

5. **Testes**: Realizar testes extensivos para garantir que tudo funcione corretamente.

### 8.3 Observações Finais

A implementação desta nova arquitetura requer uma reorganização significativa do código existente, mas oferece benefícios substanciais em termos de usabilidade, manutenção e robustez. A separação clara de configuração e simulação alinha-se com práticas modernas de desenvolvimento de software e proporcionará uma base mais sólida para futuras melhorias.

Recomenda-se também a documentação detalhada da nova arquitetura para facilitar o onboarding de novos desenvolvedores e a manutenção futura do sistema.

---

© 2025 Expertzy Inteligência Tributária