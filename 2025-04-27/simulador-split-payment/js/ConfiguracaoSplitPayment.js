/**
 * ConfiguracaoSplitPayment - Classe responsável por gerenciar os parâmetros 
 * de configuração do sistema de Split Payment no simulador.
 * 
 * Esta classe centraliza:
 * - Alíquotas tributárias (CBS e IBS)
 * - Cronograma de implementação (2026-2033)
 * - Configurações setoriais específicas
 * - Parâmetros para análise de fluxo de caixa
 * - Formatação de valores monetários e percentuais
 * 
 * @author Expertzy Inteligência Tributária
 * @version 1.0
 */
class ConfiguracaoSplitPayment {
    /**
     * Construtor da classe de configuração
     * Inicializa todos os parâmetros com valores padrão
     */
    constructor() {
        // Alíquotas base dos tributos
        this.aliquotas_base = {
            "CBS": 0.088,  // 8,8% (Contribuição sobre Bens e Serviços - Federal)
            "IBS": 0.177   // 17,7% (Imposto sobre Bens e Serviços - Estadual/Municipal)
        };

        // Cronograma de implementação gradual (2026-2033)
        this.cronograma_implementacao = {
            2026: 0.10,  // 10% de implementação
            2027: 0.25,  // 25% de implementação
            2028: 0.40,  // 40% de implementação
            2029: 0.55,  // 55% de implementação
            2030: 0.70,  // 70% de implementação
            2031: 0.85,  // 85% de implementação
            2032: 0.95,  // 95% de implementação
            2033: 1.00   // 100% de implementação (completa)
        };

        // Configurações para setores com regimes especiais
        this.setores_especiais = {
            "comercio": {
                nome: "Comércio Varejista",
                aliquota_efetiva: 0.265,
                reducao_especial: 0.0,
                cronograma_proprio: false
            },
            "industria": {
                nome: "Indústria",
                aliquota_efetiva: 0.265,
                reducao_especial: 0.0,
                cronograma_proprio: false
            },
            "servicos": {
                nome: "Serviços",
                aliquota_efetiva: 0.265,
                reducao_especial: 0.0,
                cronograma_proprio: false
            }
            // Outros setores serão adicionados conforme necessário
        };

        // Configurações para análise de fluxo de caixa
        this.parametros_fluxo_caixa = {
            // Parâmetros para o regime atual
            "prazo_pagamento_imposto_atual": 25,  // Dias após o mês seguinte
            "prazo_medio_recebimento_padrao": 30, // PMR em dias (padrão)
            "prazo_medio_pagamento_padrao": 30,   // PMP em dias (padrão)
            "prazo_medio_estoque_padrao": 30,     // PME em dias (padrão)
            
            // Parâmetros financeiros para estratégias de mitigação
            "taxa_antecipacao_recebiveis": 0.018, // 1,8% a.m.
            "taxa_capital_giro": 0.021,           // 2,1% a.m.
            "spread_bancario": 0.035              // 3,5 p.p.
        };
        
        // Configurações de formatação e exibição
        this.configuracoes_exibicao = {
            "casas_decimais_percentual": 2,
            "casas_decimais_valores": 2,
            "simbolo_moeda": "R$",
            "separador_milhar": ".",
            "separador_decimal": ","
        };
    }

    /**
     * Formata um valor como moeda brasileira
     * @param {number} valor - Valor a ser formatado
     * @param {boolean} incluirSimbolo - Se deve incluir o símbolo da moeda
     * @returns {string} Valor formatado como moeda
     */
    formatarMoeda(valor, incluirSimbolo = true) {
        if (valor === undefined || valor === null || isNaN(valor)) {
            return incluirSimbolo ? `${this.configuracoes_exibicao.simbolo_moeda} 0,00` : '0,00';
        }
        
        // Formata o número com casas decimais e separador de milhar
        const valorFormatado = valor.toLocaleString('pt-BR', {
            minimumFractionDigits: this.configuracoes_exibicao.casas_decimais_valores,
            maximumFractionDigits: this.configuracoes_exibicao.casas_decimais_valores
        });
        
        return incluirSimbolo 
            ? `${this.configuracoes_exibicao.simbolo_moeda} ${valorFormatado}`
            : valorFormatado;
    }

    /**
     * Formata um valor como percentual
     * @param {number} valor - Valor decimal a ser formatado (ex: 0.265 para 26,5%)
     * @param {boolean} incluirSimbolo - Se deve incluir o símbolo de percentual
     * @returns {string} Valor formatado como percentual
     */
    formatarPercentual(valor, incluirSimbolo = true) {
        if (valor === undefined || valor === null || isNaN(valor)) {
            return incluirSimbolo ? '0,00%' : '0,00';
        }
        
        // Multiplica por 100 e formata com casas decimais
        const percentual = (valor * 100).toLocaleString('pt-BR', {
            minimumFractionDigits: this.configuracoes_exibicao.casas_decimais_percentual,
            maximumFractionDigits: this.configuracoes_exibicao.casas_decimais_percentual
        });
        
        return incluirSimbolo ? `${percentual}%` : percentual;
    }

    /**
     * Converte um valor formatado como moeda para número
     * @param {string} valorFormatado - Valor formatado como moeda (ex: "R$ 1.234,56")
     * @returns {number} Valor numérico
     */
    converterMoedaParaNumero(valorFormatado) {
        if (!valorFormatado) return 0;
        
        // Remove o símbolo da moeda e espaços
        let valor = valorFormatado.replace(this.configuracoes_exibicao.simbolo_moeda, '')
            .replace(/\s/g, '');
            
        // Substitui separadores por formato que o parseFloat entende
        valor = valor.replace(/\./g, '')
            .replace(',', '.');
            
        return parseFloat(valor) || 0;
    }

    /**
     * Converte um valor formatado como percentual para número decimal
     * @param {string} valorFormatado - Valor formatado como percentual (ex: "26,5%")
     * @returns {number} Valor decimal (ex: 0.265)
     */
    converterPercentualParaNumero(valorFormatado) {
        if (!valorFormatado) return 0;
        
        // Remove o símbolo de percentual e espaços
        let valor = valorFormatado.replace('%', '')
            .replace(/\s/g, '');
            
        // Substitui separadores por formato que o parseFloat entende
        valor = valor.replace(/\./g, '')
            .replace(',', '.');
            
        // Divide por 100 para obter o valor decimal
        return (parseFloat(valor) || 0) / 100;
    }

    /**
     * Obtém a alíquota total do Split Payment (CBS + IBS)
     * @param {boolean} formatado - Se o valor deve ser retornado formatado
     * @returns {number|string} Alíquota total em decimal ou formatada
     */
    obterAliquotaTotal(formatado = false) {
        const aliquota = this.aliquotas_base.CBS + this.aliquotas_base.IBS;
        return formatado ? this.formatarPercentual(aliquota) : aliquota;
    }

    /**
     * Obtém a alíquota efetiva para um setor específico
     * @param {string} codigoSetor - Código identificador do setor
     * @param {boolean} formatado - Se o valor deve ser retornado formatado
     * @returns {number|string} Alíquota efetiva do setor em decimal ou formatada
     */
    obterAliquotaEfetivaSetor(codigoSetor, formatado = false) {
        let aliquota;
        
        if (this.setores_especiais[codigoSetor]) {
            aliquota = this.setores_especiais[codigoSetor].aliquota_efetiva;
        } else {
            // Se o setor não estiver cadastrado, retorna a alíquota base total
            aliquota = this.obterAliquotaTotal();
        }
        
        return formatado ? this.formatarPercentual(aliquota) : aliquota;
    }

    /**
     * Obtém o percentual de implementação do Split Payment para um ano específico
     * @param {number} ano - Ano de referência (entre 2026 e 2033)
     * @param {string} codigoSetor - Código do setor (opcional)
     * @param {boolean} formatado - Se o valor deve ser retornado formatado
     * @returns {number|string} Percentual de implementação em decimal ou formatado
     */
    obterPercentualImplementacao(ano, codigoSetor = null, formatado = false) {
        let percentual;
        
        // Verifica se o setor tem cronograma próprio
        if (codigoSetor && 
            this.setores_especiais[codigoSetor] && 
            this.setores_especiais[codigoSetor].cronograma_proprio &&
            this.setores_especiais[codigoSetor].cronograma &&
            this.setores_especiais[codigoSetor].cronograma[ano]) {
            
            percentual = this.setores_especiais[codigoSetor].cronograma[ano];
        }
        // Se não tem cronograma próprio ou o ano não está no cronograma do setor
        else if (this.cronograma_implementacao[ano]) {
            percentual = this.cronograma_implementacao[ano];
        }
        // Se o ano está fora do período de implementação
        else if (ano < 2026) {
            percentual = 0;
        }
        else if (ano > 2033) {
            percentual = 1.0;
        }
        // Não deveria chegar aqui, mas por segurança
        else {
            percentual = 0;
        }
        
        return formatado ? this.formatarPercentual(percentual) : percentual;
    }

    /**
     * Calcula o impacto financeiro estimado do Split Payment para um determinado valor
     * @param {number} valorBase - Valor base para cálculo (ex: faturamento)
     * @param {number} ano - Ano de referência
     * @param {string} codigoSetor - Código do setor (opcional)
     * @param {boolean} formatado - Se o valor deve ser retornado formatado
     * @returns {number|string} Valor do impacto financeiro
     */
    calcularImpactoFinanceiro(valorBase, ano, codigoSetor = null, formatado = false) {
        const aliquota = this.obterAliquotaEfetivaSetor(codigoSetor);
        const percentualImplementacao = this.obterPercentualImplementacao(ano, codigoSetor);
        
        const impacto = valorBase * aliquota * percentualImplementacao;
        
        return formatado ? this.formatarMoeda(impacto) : impacto;
    }

    /**
     * Atualiza as alíquotas base
     * @param {number} aliquotaCBS - Nova alíquota da CBS
     * @param {number} aliquotaIBS - Nova alíquota do IBS
     */
    atualizarAliquotasBase(aliquotaCBS, aliquotaIBS) {
        if (aliquotaCBS !== undefined && !isNaN(aliquotaCBS) && aliquotaCBS >= 0) {
            this.aliquotas_base.CBS = aliquotaCBS;
        }
        
        if (aliquotaIBS !== undefined && !isNaN(aliquotaIBS) && aliquotaIBS >= 0) {
            this.aliquotas_base.IBS = aliquotaIBS;
        }
    }

    /**
     * Atualiza o cronograma de implementação para um determinado ano
     * @param {number} ano - Ano a ser atualizado
     * @param {number} percentual - Percentual de implementação (0 a 1)
     */
    atualizarCronograma(ano, percentual) {
        if (ano >= 2026 && ano <= 2033 && 
            percentual !== undefined && !isNaN(percentual) && 
            percentual >= 0 && percentual <= 1) {
            
            this.cronograma_implementacao[ano] = percentual;
        }
    }

    /**
     * Adiciona ou atualiza um setor especial
     * @param {string} codigoSetor - Código identificador do setor
     * @param {object} configuracaoSetor - Configurações do setor
     */
    configurarSetor(codigoSetor, configuracaoSetor) {
        if (!codigoSetor) return;
        
        // Se o setor já existe, atualiza suas propriedades
        if (this.setores_especiais[codigoSetor]) {
            Object.assign(this.setores_especiais[codigoSetor], configuracaoSetor);
        } else {
            // Se não existe, cria novo setor
            this.setores_especiais[codigoSetor] = configuracaoSetor;
        }
    }

    /**
     * Configura o cronograma próprio de um setor
     * @param {string} codigoSetor - Código identificador do setor
     * @param {object} cronogramaSetor - Cronograma específico do setor
     */
    configurarCronogramaSetor(codigoSetor, cronogramaSetor) {
        if (!codigoSetor || !this.setores_especiais[codigoSetor]) return;
        
        this.setores_especiais[codigoSetor].cronograma_proprio = true;
        this.setores_especiais[codigoSetor].cronograma = cronogramaSetor;
    }

    /**
     * Atualiza os parâmetros de fluxo de caixa
     * @param {object} novosParametros - Objeto com os novos parâmetros
     */
    atualizarParametrosFluxoCaixa(novosParametros) {
        if (!novosParametros) return;
        
        Object.assign(this.parametros_fluxo_caixa, novosParametros);
    }

    /**
     * Salva as configurações no localStorage para persistência
     */
    salvarConfiguracoes() {
        try {
            localStorage.setItem('splitPaymentConfig', JSON.stringify({
                aliquotas_base: this.aliquotas_base,
                cronograma_implementacao: this.cronograma_implementacao,
                setores_especiais: this.setores_especiais,
                parametros_fluxo_caixa: this.parametros_fluxo_caixa,
                configuracoes_exibicao: this.configuracoes_exibicao
            }));
            return true;
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            return false;
        }
    }

    /**
     * Carrega as configurações do localStorage
     * @returns {boolean} Verdadeiro se as configurações foram carregadas com sucesso
     */
    carregarConfiguracoes() {
        try {
            const configSalva = localStorage.getItem('splitPaymentConfig');
            if (configSalva) {
                const config = JSON.parse(configSalva);
                
                // Atualiza cada seção da configuração separadamente
                if (config.aliquotas_base) 
                    this.aliquotas_base = config.aliquotas_base;
                
                if (config.cronograma_implementacao) 
                    this.cronograma_implementacao = config.cronograma_implementacao;
                
                if (config.setores_especiais) 
                    this.setores_especiais = config.setores_especiais;
                
                if (config.parametros_fluxo_caixa) 
                    this.parametros_fluxo_caixa = config.parametros_fluxo_caixa;
                
                if (config.configuracoes_exibicao) 
                    this.configuracoes_exibicao = config.configuracoes_exibicao;
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            return false;
        }
    }

    /**
     * Restaura as configurações para o padrão original
     */
    restaurarPadroes() {
        // Recria o objeto com valores padrão
        const configPadrao = new ConfiguracaoSplitPayment();
        
        // Copia todas as propriedades padrão para esta instância
        this.aliquotas_base = {...configPadrao.aliquotas_base};
        this.cronograma_implementacao = {...configPadrao.cronograma_implementacao};
        this.setores_especiais = JSON.parse(JSON.stringify(configPadrao.setores_especiais));
        this.parametros_fluxo_caixa = {...configPadrao.parametros_fluxo_caixa};
        this.configuracoes_exibicao = {...configPadrao.configuracoes_exibicao};
        
        // Remove as configurações salvas no localStorage
        localStorage.removeItem('splitPaymentConfig');
    }
}