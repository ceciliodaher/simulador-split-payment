/**
 * SimuladorRepository.js
 * Repositório central de dados para o Simulador de Impacto do Split Payment
 * Implementa o padrão de repositório para gerenciar estado global
 * © 2025 Expertzy Inteligência Tributária
 */

const SimuladorRepository = {
    // Dados compartilhados - inicializados com valores padrão
    _dados: {
        // Informações básicas da empresa
        empresa: {
            nome: "",
            setor: "",  // Código do setor selecionado
            regime: "",  // Regime tributário
            faturamento: 0,
            periodo: "mensal", // "mensal" ou "anual"
            margem: 0.15 // Percentual decimal (ex: 0.15 para 15%)
        },

        // Configurações do ciclo financeiro
        cicloFinanceiro: {
            pmr: 30, // Prazo Médio de Recebimento
            pmp: 30, // Prazo Médio de Pagamento
            pme: 30, // Prazo Médio de Estoque
            percVista: 0.3, // Percentual de vendas à vista (decimal)
            percPrazo: 0.7  // Percentual de vendas a prazo (decimal)
        },

        // Parâmetros fiscais
        parametrosFiscais: {
            aliquota: 0.265, // Alíquota efetiva atual
            tipoOperacao: "", // "b2b", "b2c" ou "mista"
            creditos: 0 // Créditos tributários mensais
        },

        // Parâmetros da simulação
        parametrosSimulacao: {
            dataInicial: "2026-01-01",
            dataFinal: "2033-12-31",
            cenario: "moderado", // "conservador", "moderado", "otimista" ou "personalizado"
            taxaCrescimento: 0.05 // Para cenário personalizado
        },

        // Alíquotas base do sistema tributário
        aliquotasBase: {
            CBS: 0.088, // 8,8%
            IBS: 0.177  // 17,7%
        },

        // Cronograma de implementação
        // Percentuais em formato decimal
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

        // Setores cadastrados com parâmetros específicos
        // Objeto indexado por código do setor
        setoresEspeciais: {
            // Exemplo:
            "comercio": {
                nome: "Comércio Varejista",
                aliquotaEfetiva: 0.265,
                reducaoEspecial: 0.0,
                cronogramaProprio: false,
                cronograma: null
            },
            "industria": {
                nome: "Indústria",
                aliquotaEfetiva: 0.265,
                reducaoEspecial: 0.0,
                cronogramaProprio: false,
                cronograma: null
            },
            "servicos": {
                nome: "Serviços",
                aliquotaEfetiva: 0.265,
                reducaoEspecial: 0.0,
                cronogramaProprio: false,
                cronograma: null
            }
        },

        // Parâmetros financeiros para cálculos
        parametrosFinanceiros: {
            taxaAntecipacaoRecebiveis: 0.018, // 1,8% a.m.
            taxaCapitalGiro: 0.021, // 2,1% a.m.
            spreadBancario: 0.035 // 3,5 p.p.
        },

        // Estratégias de mitigação selecionadas
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
            }
        },

        // Resultados da última simulação
        resultadosSimulacao: {
            impactoBase: null,
            projecaoTemporal: null,
            estrategiasMitigacao: null,
            memoriaCalculo: null
        },

        // Estado da interface
        interfaceState: {
            tabAtiva: "configuracoes-gerais",
            dropdownsInicializados: false,
            simulacaoRealizada: false
        }
    },
    
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