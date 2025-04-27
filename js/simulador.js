/**
 * SimuladorFluxoCaixa - Implementação do núcleo de simulação para avaliação 
 * do impacto do Split Payment no fluxo de caixa das empresas.
 * 
 * Este módulo implementa os cálculos fundamentais para:
 * - Fluxo de caixa no modelo atual (sem split payment)
 * - Fluxo de caixa no modelo com split payment
 * - Análise comparativa e cálculo do impacto
 * - Projeção temporal ao longo do período de implementação (2026-2033)
 * 
 * © 2025 Expertzy Inteligência Tributária
 */

class SimuladorFluxoCaixa {
    /**
     * Construtor da classe de simulação
     * @param {ConfiguracaoSplitPayment} configuracao - Configuração do Split Payment
     */
    constructor(configuracao) {
        // Armazena a configuração fornecida
        this.config = configuracao;
        
        // Inicializa o objeto de memória de cálculo para registrar os passos
        this.memoriaCalculo = {
            parametrosEntrada: {},
            resultadoAtual: {},
            resultadoSplitPayment: {},
            impactoGeral: {},
            projecaoTemporal: {},
            estrategiasMitigacao: {}
        };
    }

    /**
     * Normaliza os dados de entrada para formato padronizado
     * @private
     * @param {Object} dados - Dados brutos do formulário
     * @returns {Object} Dados normalizados
     */
    _normalizarDados(dados) {
        // Cria uma cópia para não modificar o objeto original
        const dadosNormalizados = { ...dados };
        
        // Normaliza valores monetários
        if (typeof dadosNormalizados.faturamento === 'string') {
            dadosNormalizados.faturamento = this.config.converterMoedaParaNumero(dadosNormalizados.faturamento);
        }
        
        if (typeof dadosNormalizados.creditos === 'string') {
            dadosNormalizados.creditos = this.config.converterMoedaParaNumero(dadosNormalizados.creditos);
        }
        
        // Normaliza valores percentuais
        if (typeof dadosNormalizados.margem === 'string') {
            dadosNormalizados.margem = this.config.converterPercentualParaNumero(dadosNormalizados.margem);
        }
        
        if (typeof dadosNormalizados.aliquota === 'string') {
            dadosNormalizados.aliquota = this.config.converterPercentualParaNumero(dadosNormalizados.aliquota);
        }
        
        if (typeof dadosNormalizados.percVista === 'string') {
            dadosNormalizados.percVista = this.config.converterPercentualParaNumero(dadosNormalizados.percVista);
        }
        
        if (typeof dadosNormalizados.percPrazo === 'string') {
            dadosNormalizados.percPrazo = this.config.converterPercentualParaNumero(dadosNormalizados.percPrazo);
        }
        
        // Normaliza prazos para formato numérico
        ['pmr', 'pmp', 'pme'].forEach(campo => {
            if (typeof dadosNormalizados[campo] === 'string') {
                dadosNormalizados[campo] = parseInt(dadosNormalizados[campo], 10) || 0;
            }
        });
        
        // Se faturamento for anual, converte para mensal
        if (dadosNormalizados.periodo === 'anual') {
            dadosNormalizados.faturamentoMensal = dadosNormalizados.faturamento / 12;
        } else {
            dadosNormalizados.faturamentoMensal = dadosNormalizados.faturamento;
        }
        
        // Calcula o ciclo financeiro se não estiver definido
        if (!dadosNormalizados.cicloFinanceiro) {
            dadosNormalizados.cicloFinanceiro = 
                dadosNormalizados.pmr + 
                dadosNormalizados.pme - 
                dadosNormalizados.pmp;
        }
        
        // Registra os dados normalizados na memória de cálculo
        this.memoriaCalculo.parametrosEntrada = dadosNormalizados;
        
        return dadosNormalizados;
    }

    /**
     * Calcula o fluxo de caixa no regime tributário atual
     * @param {Object} dados - Dados de entrada do formulário
     * @returns {Object} Resultados do fluxo de caixa atual
     */
    calcularFluxoCaixaAtual(dados) {
        // Normaliza os dados de entrada
        const dadosNorm = this._normalizarDados(dados);
        
        // Extrai parâmetros relevantes
        const {
            faturamentoMensal,
            aliquota,
            pmr,
            percVista,
            percPrazo
        } = dadosNorm;
        
        // Calcula valores de vendas à vista e a prazo
        const vendasVista = faturamentoMensal * percVista;
        const vendasPrazo = faturamentoMensal * percPrazo;
        
        // Calcula valor de tributos sobre o faturamento
        const valorTributos = faturamentoMensal * aliquota;
        
        // Obtém o prazo de pagamento de impostos do modelo atual
        const prazoPagamentoImpostoAtual = this.config.parametros_fluxo_caixa.prazo_pagamento_imposto_atual;
        
        // Prazo efetivo (dias no mês seguinte + dias do mês atual)
        const prazoEfetivoPagamentoImposto = 30 + prazoPagamentoImpostoAtual;
        
        // Calcula o capital de giro disponível temporariamente (diferença temporal)
        const capitalGiroTributario = valorTributos * (prazoEfetivoPagamentoImposto / 30);
        
        // Calcula o fluxo de caixa líquido considerando o prazo médio de recebimento
        const fluxoCaixaVendasVista = vendasVista; // Imediato
        const fluxoCaixaVendasPrazo = vendasPrazo * (pmr / 30); // Proporcional ao PMR
        
        // Calcula os dias de capital de giro disponível devido ao prazo de pagamento de impostos
        const diasCapitalGiroTributario = prazoEfetivoPagamentoImposto;
        
        // Resultados
        const resultados = {
            vendasVista,
            vendasPrazo,
            valorTributos,
            prazoPagamentoImpostoAtual,
            prazoEfetivoPagamentoImposto,
            capitalGiroTributario,
            fluxoCaixaVendasVista,
            fluxoCaixaVendasPrazo,
            diasCapitalGiroTributario,
            
            // Valores totais
            totalRecebimentos: vendasVista + vendasPrazo,
            totalDesembolsos: valorTributos,
            saldoFluxoCaixa: vendasVista + vendasPrazo - valorTributos
        };
        
        // Registra resultados na memória de cálculo
        this.memoriaCalculo.resultadoAtual = resultados;
        
        return resultados;
    }

    /**
     * Calcula o fluxo de caixa com o regime de Split Payment
     * @param {Object} dados - Dados de entrada do formulário
     * @param {number} ano - Ano de referência para percentual de implementação
     * @returns {Object} Resultados do fluxo de caixa com Split Payment
     */
    calcularFluxoCaixaSplitPayment(dados, ano = 2026) {
        // Normaliza os dados de entrada
        const dadosNorm = this._normalizarDados(dados);
        
        // Extrai parâmetros relevantes
        const {
            faturamentoMensal,
            aliquota,
            pmr,
            percVista,
            percPrazo,
            setor
        } = dadosNorm;
        
        // Obtém o percentual de implementação do Split Payment para o ano e setor
        const percentualImplementacao = this.config.obterPercentualImplementacao(ano, setor);
        
        // Calcula valores de vendas à vista e a prazo
        const vendasVista = faturamentoMensal * percVista;
        const vendasPrazo = faturamentoMensal * percPrazo;
        
        // Calcula valor total de tributos
        const valorTributos = faturamentoMensal * aliquota;
        
        // Divisão dos tributos entre modelo convencional e Split Payment
        const tributosSplit = valorTributos * percentualImplementacao;
        const tributosConvencionais = valorTributos - tributosSplit;
        
        // Tributos retidos no Split Payment para cada tipo de venda
        const tributosSplitVendasVista = vendasVista * aliquota * percentualImplementacao;
        const tributosSplitVendasPrazo = vendasPrazo * aliquota * percentualImplementacao;
        
        // Valores líquidos recebidos após retenção do Split Payment
        const recebimentoLiquidoVendasVista = vendasVista - tributosSplitVendasVista;
        const recebimentoLiquidoVendasPrazo = vendasPrazo - tributosSplitVendasPrazo;
        
        // Prazo efetivo para tributos convencionais (dias no mês seguinte + dias do mês atual)
        const prazoPagamentoImpostoAtual = this.config.parametros_fluxo_caixa.prazo_pagamento_imposto_atual;
        const prazoEfetivoPagamentoImposto = 30 + prazoPagamentoImpostoAtual;
        
        // Capital de giro disponível para tributos convencionais
        const capitalGiroTributosConvencionais = tributosConvencionais * (prazoEfetivoPagamentoImposto / 30);
        
        // Ajuste do fluxo de caixa considerando o Split Payment
        const fluxoCaixaVendasVista = recebimentoLiquidoVendasVista; // Imediato, mas já com retenção
        const fluxoCaixaVendasPrazo = recebimentoLiquidoVendasPrazo * (pmr / 30); // Proporcional ao PMR, já com retenção
        
        // Impacto no fluxo de caixa pela antecipação do pagamento de tributos via Split
        const impactoAntecipacaoTributos = tributosSplit * ((prazoEfetivoPagamentoImposto - 1) / 30);
        
        // Resultados
        const resultados = {
            vendasVista,
            vendasPrazo,
            valorTributos,
            percentualImplementacao,
            tributosSplit,
            tributosConvencionais,
            tributosSplitVendasVista,
            tributosSplitVendasPrazo,
            recebimentoLiquidoVendasVista,
            recebimentoLiquidoVendasPrazo,
            prazoEfetivoPagamentoImposto,
            capitalGiroTributosConvencionais,
            fluxoCaixaVendasVista,
            fluxoCaixaVendasPrazo,
            impactoAntecipacaoTributos,
            
            // Valores totais
            totalRecebimentosLiquidos: recebimentoLiquidoVendasVista + recebimentoLiquidoVendasPrazo,
            totalDesembolsosTributos: tributosConvencionais,
            saldoFluxoCaixa: recebimentoLiquidoVendasVista + recebimentoLiquidoVendasPrazo - tributosConvencionais
        };
        
        // Registra resultados na memória de cálculo
        this.memoriaCalculo.resultadoSplitPayment = resultados;
        
        return resultados;
    }

    /**
     * Calcula o impacto do Split Payment no capital de giro
     * @param {Object} dados - Dados de entrada do formulário
     * @param {number} ano - Ano de referência para percentual de implementação
     * @returns {Object} Resultados do impacto no capital de giro
     */
    calcularImpactoCapitalGiro(dados, ano = 2026) {
        // Calcula o fluxo de caixa nos dois cenários
        const resultadoAtual = this.calcularFluxoCaixaAtual(dados);
        const resultadoSplit = this.calcularFluxoCaixaSplitPayment(dados, ano);
        
        // Extrai dados normalizados
        const dadosNorm = this.memoriaCalculo.parametrosEntrada;
        
        // Calcula o capital de giro no modelo atual
        const capitalGiroAtual = 
            resultadoAtual.vendasPrazo * (dadosNorm.pmr / 30) - 
            resultadoAtual.valorTributos * (resultadoAtual.prazoEfetivoPagamentoImposto / 30);
        
        // Calcula o capital de giro no modelo com Split Payment
        const capitalGiroSplit = 
            resultadoSplit.recebimentoLiquidoVendasPrazo * (dadosNorm.pmr / 30) - 
            resultadoSplit.tributosConvencionais * (resultadoSplit.prazoEfetivoPagamentoImposto / 30);
        
        // Calcula a diferença absoluta e percentual
        const diferencaCapitalGiro = capitalGiroSplit - capitalGiroAtual;
        const percentualImpacto = capitalGiroAtual !== 0 ? 
            (diferencaCapitalGiro / Math.abs(capitalGiroAtual)) * 100 : 0;
        
        // Calcula outros indicadores relevantes
        const necessidadeAdicionalCapitalGiro = diferencaCapitalGiro < 0 ? 
            Math.abs(diferencaCapitalGiro) : 0;
        
        const custoFinanceiroAnual = necessidadeAdicionalCapitalGiro * 
            (this.config.parametros_fluxo_caixa.taxa_capital_giro * 12);
        
        // Impacto sobre a margem operacional
        const margemOperacionalOriginal = dadosNorm.margem;
        const impactoSobreMargem = (custoFinanceiroAnual / (dadosNorm.faturamentoMensal * 12)) * 100;
        const margemOperacionalAjustada = margemOperacionalOriginal - impactoSobreMargem;
        
        // Resultados
        const resultados = {
            capitalGiroAtual,
            capitalGiroSplit,
            diferencaCapitalGiro,
            percentualImpacto,
            necessidadeAdicionalCapitalGiro,
            custoFinanceiroAnual,
            margemOperacionalOriginal,
            impactoSobreMargem,
            margemOperacionalAjustada,
            
            // Detalhes adicionais para diagnóstico
            ano,
            percentualImplementacao: resultadoSplit.percentualImplementacao,
            detalhesFluxoAtual: resultadoAtual,
            detalhesFluxoSplit: resultadoSplit
        };
        
        // Registra resultados na memória de cálculo
        this.memoriaCalculo.impactoGeral = resultados;
        
        return resultados;
    }

    /**
     * Simula o impacto do Split Payment ao longo do período de transição
     * @param {Object} dados - Dados de entrada do formulário
     * @param {number} anoInicial - Ano inicial da simulação
     * @param {number} anoFinal - Ano final da simulação
     * @param {string} cenario - Cenário de crescimento (conservador, moderado, otimista, personalizado)
     * @param {number} taxaCrescimento - Taxa de crescimento anual (para cenário personalizado)
     * @returns {Object} Resultados da projeção temporal
     */
    simularPeriodoTransicao(dados, anoInicial = 2026, anoFinal = 2033, cenario = 'moderado', taxaCrescimento = null) {
        // Define as taxas de crescimento para cada cenário
        const taxasCenarios = {
            conservador: 0.02, // 2% a.a.
            moderado: 0.05,    // 5% a.a.
            otimista: 0.08,    // 8% a.a.
            personalizado: taxaCrescimento !== null ? taxaCrescimento : 0.05
        };
        
        // Obtém a taxa correspondente ao cenário
        const taxaCrescimentoAnual = taxasCenarios[cenario] || taxasCenarios.moderado;
        
        // Normaliza os dados de entrada
        const dadosBase = this._normalizarDados(dados);
        
        // Resultado para cada ano
        const resultadosAnuais = {};
        
        // Dados acumulados para análise de tendência
        const tendencias = {
            anos: [],
            impactoCapitalGiro: [],
            percentualImplementacao: [],
            custoFinanceiroAnual: [],
            margemOperacionalAjustada: []
        };
        
        // Simula cada ano do período de transição
        for (let ano = anoInicial; ano <= anoFinal; ano++) {
            // Calcula o fator de crescimento acumulado
            const anosDecorridos = ano - anoInicial;
            const fatorCrescimento = Math.pow(1 + taxaCrescimentoAnual, anosDecorridos);
            
            // Ajusta o faturamento de acordo com o crescimento
            const dadosAjustados = { ...dadosBase };
            dadosAjustados.faturamento = dadosBase.faturamento * fatorCrescimento;
            dadosAjustados.faturamentoMensal = dadosBase.faturamentoMensal * fatorCrescimento;
            
            // Calcula o impacto para este ano
            const impactoAno = this.calcularImpactoCapitalGiro(dadosAjustados, ano);
            
            // Armazena o resultado
            resultadosAnuais[ano] = {
                faturamentoAnual: dadosAjustados.faturamento,
                faturamentoMensal: dadosAjustados.faturamentoMensal,
                percentualImplementacao: impactoAno.percentualImplementacao,
                capitalGiroAtual: impactoAno.capitalGiroAtual,
                capitalGiroSplit: impactoAno.capitalGiroSplit,
                diferencaCapitalGiro: impactoAno.diferencaCapitalGiro,
                percentualImpacto: impactoAno.percentualImpacto,
                necessidadeAdicionalCapitalGiro: impactoAno.necessidadeAdicionalCapitalGiro,
                custoFinanceiroAnual: impactoAno.custoFinanceiroAnual,
                margemOperacionalAjustada: impactoAno.margemOperacionalAjustada
            };
            
            // Acumula dados para tendências
            tendencias.anos.push(ano);
            tendencias.impactoCapitalGiro.push(impactoAno.diferencaCapitalGiro);
            tendencias.percentualImplementacao.push(impactoAno.percentualImplementacao);
            tendencias.custoFinanceiroAnual.push(impactoAno.custoFinanceiroAnual);
            tendencias.margemOperacionalAjustada.push(impactoAno.margemOperacionalAjustada);
        }
        
        // Calcula o impacto acumulado ao longo do período
        const impactoAcumulado = {
            totalNecessidadeCapitalGiro: Object.values(resultadosAnuais)
                .reduce((acc, val) => acc + val.necessidadeAdicionalCapitalGiro, 0),
            mediaImpactoAnual: Object.values(resultadosAnuais)
                .reduce((acc, val) => acc + val.diferencaCapitalGiro, 0) / 
                (anoFinal - anoInicial + 1),
            custoFinanceiroTotal: Object.values(resultadosAnuais)
                .reduce((acc, val) => acc + val.custoFinanceiroAnual, 0),
            impactoMedioMargem: Object.values(resultadosAnuais)
                .reduce((acc, val) => acc + (val.margemOperacionalOriginal - val.margemOperacionalAjustada), 0) /
                (anoFinal - anoInicial + 1)
        };
        
        // Resultados da projeção temporal
        const resultados = {
            parametros: {
                anoInicial,
                anoFinal,
                cenario,
                taxaCrescimentoAnual
            },
            resultadosAnuais,
            tendencias,
            impactoAcumulado
        };
        
        // Registra resultados na memória de cálculo
        this.memoriaCalculo.projecaoTemporal = resultados;
        
        return resultados;
    }

    /**
     * Simula estratégias de mitigação do impacto do Split Payment
     * @param {Object} dados - Dados de entrada do formulário
     * @param {Object} estrategias - Configurações das estratégias a simular
     * @param {number} ano - Ano de referência para percentual de implementação
     * @returns {Object} Resultados da simulação de estratégias
     */
    simularEstrategiasMitigacao(dados, estrategias, ano = 2026) {
        // Calcula o impacto base sem estratégias
        const impactoBase = this.calcularImpactoCapitalGiro(dados, ano);
        
        // Resultados por estratégia
        const resultadosEstrategias = {};
        
        // Estratégia: Ajuste de Preços
        if (estrategias.ajustePrecos && estrategias.ajustePrecos.ativar) {
            const {
                percentualAumento,
                elasticidade,
                periodoAjuste
            } = estrategias.ajustePrecos;
            
            // Cálculo do impacto no volume de vendas com base na elasticidade
            const impactoVolume = percentualAumento * elasticidade;
            
            // Cálculo do faturamento ajustado
            const faturamentoAjustado = dados.faturamento * (1 + percentualAumento) * (1 + impactoVolume);
            
            // Dados ajustados para simulação
            const dadosAjustados = { ...dados, faturamento: faturamentoAjustado };
            
            // Simula o impacto com a estratégia
            const impactoComEstrategia = this.calcularImpactoCapitalGiro(dadosAjustados, ano);
            
            // Calcula a eficácia da estratégia
            const diferencaImpacto = impactoComEstrategia.diferencaCapitalGiro - impactoBase.diferencaCapitalGiro;
            const eficaciaPercentual = impactoBase.diferencaCapitalGiro !== 0 ?
                (diferencaImpacto / Math.abs(impactoBase.diferencaCapitalGiro)) * 100 : 0;
            
            // Registra os resultados
            resultadosEstrategias.ajustePrecos = {
                parametros: estrategias.ajustePrecos,
                impactoVolume,
                faturamentoAjustado,
                diferencaImpacto,
                eficaciaPercentual,
                custoImplementacao: 0, // Sem custo direto de implementação
                retornoInvestimento: diferencaImpacto > 0 ? Infinity : 0,
                resultadoDetalhado: impactoComEstrategia
            };
        }
        
        // Estratégia: Renegociação de Prazos com Fornecedores
        if (estrategias.renegociacaoPrazos && estrategias.renegociacaoPrazos.ativar) {
            const {
                aumentoPrazo,
                percentualFornecedores,
                custoContrapartida
            } = estrategias.renegociacaoPrazos;
            
            // Cálculo do PMP ajustado
            const pmpAdicional = aumentoPrazo * (percentualFornecedores / 100);
            const pmpAjustado = dados.pmp + pmpAdicional;
            
            // Dados ajustados para simulação
            const dadosAjustados = { ...dados, pmp: pmpAjustado };
            
            // Simula o impacto com a estratégia
            const impactoComEstrategia = this.calcularImpactoCapitalGiro(dadosAjustados, ano);
            
            // Calcula o custo da contrapartida
            const custoAnual = dados.faturamento * 12 * (custoContrapartida / 100);
            
            // Calcula a eficácia da estratégia
            const diferencaImpacto = impactoComEstrategia.diferencaCapitalGiro - impactoBase.diferencaCapitalGiro;
            const eficaciaPercentual = impactoBase.diferencaCapitalGiro !== 0 ?
                (diferencaImpacto / Math.abs(impactoBase.diferencaCapitalGiro)) * 100 : 0;
            
            // Calcula o retorno sobre investimento (ROI)
            const retornoInvestimento = custoAnual > 0 ?
                diferencaImpacto / custoAnual : Infinity;
            
            // Registra os resultados
            resultadosEstrategias.renegociacaoPrazos = {
                parametros: estrategias.renegociacaoPrazos,
                pmpAdicional,
                pmpAjustado,
                diferencaImpacto,
                eficaciaPercentual,
                custoImplementacao: custoAnual,
                retornoInvestimento,
                resultadoDetalhado: impactoComEstrategia
            };
        }
        
        // Estratégia: Antecipação de Recebíveis
        if (estrategias.antecipacaoRecebiveis && estrategias.antecipacaoRecebiveis.ativar) {
            const {
                percentualAntecipacao,
                taxaDesconto,
                prazoAntecipacao
            } = estrategias.antecipacaoRecebiveis;
            
            // Extrai dados relevantes
            const dadosNorm = this._normalizarDados(dados);
            const vendasPrazo = dadosNorm.faturamentoMensal * dadosNorm.percPrazo;
            
            // Valor a antecipar
            const valorAntecipar = vendasPrazo * (percentualAntecipacao / 100);
            
            // Custo da antecipação
            const taxaDescontoMensal = taxaDesconto / 100;
            const custoAntecipacao = valorAntecipar * taxaDescontoMensal * (prazoAntecipacao / 30);
            const custoAnual = custoAntecipacao * 12;
            
            // Cálculo do PMR ajustado
            const pmrOriginal = dadosNorm.pmr;
            const pmrAjustado = pmrOriginal * (1 - (percentualAntecipacao / 100));
            
            // Dados ajustados para simulação
            const dadosAjustados = { ...dados, pmr: pmrAjustado };
            
            // Simula o impacto com a estratégia
            const impactoComEstrategia = this.calcularImpactoCapitalGiro(dadosAjustados, ano);
            
            // Calcula a eficácia da estratégia
            const diferencaImpacto = impactoComEstrategia.diferencaCapitalGiro - impactoBase.diferencaCapitalGiro;
            const eficaciaPercentual = impactoBase.diferencaCapitalGiro !== 0 ?
                (diferencaImpacto / Math.abs(impactoBase.diferencaCapitalGiro)) * 100 : 0;
            
            // Calcula o retorno sobre investimento (ROI)
            const retornoInvestimento = custoAnual > 0 ?
                diferencaImpacto / custoAnual : Infinity;
            
            // Registra os resultados
            resultadosEstrategias.antecipacaoRecebiveis = {
                parametros: estrategias.antecipacaoRecebiveis,
                valorAntecipar,
                custoAntecipacao,
                custoAnual,
                pmrAjustado,
                diferencaImpacto,
                eficaciaPercentual,
                custoImplementacao: custoAnual,
                retornoInvestimento,
                resultadoDetalhado: impactoComEstrategia
            };
        }
        
        // Estratégia: Captação de Capital de Giro
        if (estrategias.capitalGiro && estrategias.capitalGiro.ativar) {
            const {
                valorCaptacao,
                taxaJuros,
                prazoPagamento,
                carencia
            } = estrategias.capitalGiro;
            
            // Extrai dados relevantes
            const dadosNorm = this._normalizarDados(dados);
            
            // Valor a captar (% do faturamento mensal)
            const valorACaptar = dadosNorm.faturamentoMensal * (valorCaptacao / 100);
            
            // Taxa de juros mensal
            const taxaJurosMensal = taxaJuros / 100;
            
            // Cálculo do custo financeiro anual
            const custoMensal = valorACaptar * taxaJurosMensal;
            const custoAnual = custoMensal * 12;
            
            // Não há alteração no impacto direto, apenas compensação com capital externo
            const diferencaImpacto = valorACaptar > Math.abs(impactoBase.diferencaCapitalGiro) ?
                Math.abs(impactoBase.diferencaCapitalGiro) : valorACaptar;
            
            const eficaciaPercentual = impactoBase.diferencaCapitalGiro !== 0 ?
                (diferencaImpacto / Math.abs(impactoBase.diferencaCapitalGiro)) * 100 : 0;
            
            // Calcula o retorno sobre investimento (ROI)
            const retornoInvestimento = custoAnual > 0 ?
                diferencaImpacto / custoAnual : Infinity;
            
            // Registra os resultados
            resultadosEstrategias.capitalGiro = {
                parametros: estrategias.capitalGiro,
                valorACaptar,
                custoMensal,
                custoAnual,
                diferencaImpacto,
                eficaciaPercentual,
                custoImplementacao: custoAnual,
                retornoInvestimento,
                impactoOriginal: impactoBase.diferencaCapitalGiro
            };
        }
        
        // Análise comparativa das estratégias
        const analiseComparativa = this._analisarEstrategiasComparativas(resultadosEstrategias, impactoBase);
        
        // Resultados gerais
        const resultados = {
            impactoBase,
            resultadosEstrategias,
            analiseComparativa
        };
        
        // Registra resultados na memória de cálculo
        this.memoriaCalculo.estrategiasMitigacao = resultados;
        
        return resultados;
    }

    /**
     * Analisa comparativamente as diferentes estratégias de mitigação
     * @private
     * @param {Object} resultadosEstrategias - Resultados por estratégia
     * @param {Object} impactoBase - Impacto base sem estratégias
     * @returns {Object} Análise comparativa
     */
    _analisarEstrategiasComparativas(resultadosEstrategias, impactoBase) {
        // Ranking de eficácia
        const estrategiasComEficacia = Object.entries(resultadosEstrategias)
            .map(([estrategia, resultado]) => ({
                estrategia,
                diferencaImpacto: resultado.diferencaImpacto,
                eficaciaPercentual: resultado.eficaciaPercentual,
                custoImplementacao: resultado.custoImplementacao,
                retornoInvestimento: resultado.retornoInvestimento
            }))
            .sort((a, b) => b.eficaciaPercentual - a.eficaciaPercentual);
        
        // Ranking de custo-benefício (ROI)
        const estrategiasComROI = [...estrategiasComEficacia]
            .sort((a, b) => b.retornoInvestimento - a.retornoInvestimento);
        
        // Impacto conjunto das estratégias (estimativa simplificada)
        // Considera apenas 70% da eficácia combinada devido a sobreposições
        const eficaciaCombinada = estrategiasComEficacia
            .reduce((acc, val) => acc + val.diferencaImpacto, 0) * 0.7;
        
        const percentualMitigacaoCombinada = impactoBase.diferencaCapitalGiro !== 0 ?
            (eficaciaCombinada / Math.abs(impactoBase.diferencaCapitalGiro)) * 100 : 0;
        
        const custoCombinado = estrategiasComEficacia
            .reduce((acc, val) => acc + val.custoImplementacao, 0);
        
        // Resultado da análise comparativa
        return {
            rankingEficacia: estrategiasComEficacia,
            rankingROI: estrategiasComROI,
            impactoCombinado: {
                eficaciaCombinada,
                percentualMitigacaoCombinada,
                custoCombinado,
                roiCombinado: custoCombinado > 0 ? eficaciaCombinada / custoCombinado : Infinity
            },
            recomendacoes: this._gerarRecomendacoes(estrategiasComEficacia, impactoBase)
        };
    }

    /**
     * Gera recomendações baseadas na análise das estratégias
     * @private
     * @param {Array} estrategiasRanqueadas - Estratégias ordenadas por eficácia
     * @param {Object} impactoBase - Impacto base sem estratégias
     * @returns {Array} Lista de recomendações
     */
    _gerarRecomendacoes(estrategiasRanqueadas, impactoBase) {
        const recomendacoes = [];
        
        // Verifica se há necessidade de mitigação
        if (impactoBase.diferencaCapitalGiro >= 0) {
            recomendacoes.push({
                tipo: 'informativa',
                mensagem: 'O impacto do Split Payment é neutro ou positivo para o capital de giro, não sendo necessárias estratégias de mitigação.'
            });
            return recomendacoes;
        }
        
        // Recomendação geral baseada na magnitude do impacto
        const impactoPercentual = impactoBase.percentualImpacto;
        
        if (impactoPercentual < -5) {
            recomendacoes.push({
                tipo: 'urgente',
                mensagem: `O impacto negativo de ${Math.abs(impactoPercentual).toFixed(2)}% no capital de giro é significativo e requer atenção imediata.`
            });
        } else {
            recomendacoes.push({
                tipo: 'moderada',
                mensagem: `O impacto negativo de ${Math.abs(impactoPercentual).toFixed(2)}% no capital de giro é moderado, mas requer planejamento.`
            });
        }
        
        // Recomendações específicas para cada estratégia
        estrategiasRanqueadas.forEach(estrategia => {
            if (estrategia.eficaciaPercentual > 50) {
                recomendacoes.push({
                    tipo: 'estrategia',
                    estrategia: estrategia.estrategia,
                    mensagem: `A estratégia de ${this._traduzirNomeEstrategia(estrategia.estrategia)} apresenta alta eficácia (${estrategia.eficaciaPercentual.toFixed(2)}%) e deve ser priorizada.`
                });
            } else if (estrategia.eficaciaPercentual > 20) {
                recomendacoes.push({
                    tipo: 'estrategia',
                    estrategia: estrategia.estrategia,
                    mensagem: `A estratégia de ${this._traduzirNomeEstrategia(estrategia.estrategia)} apresenta eficácia moderada (${estrategia.eficaciaPercentual.toFixed(2)}%) e pode ser considerada.`
                });
            }
        });
        
        // Recomendação sobre combinação de estratégias
        if (estrategiasRanqueadas.length > 1) {
            recomendacoes.push({
                tipo: 'combinada',
                mensagem: 'A combinação de múltiplas estratégias pode proporcionar maior mitigação do impacto, mas atenção aos custos cumulativos.'
            });
        }
        
        return recomendacoes;
    }

    /**
     * Traduz o nome técnico da estratégia para um nome amigável
     * @private
     * @param {string} nomeEstrategia - Nome técnico da estratégia
     * @returns {string} Nome amigável da estratégia
     */
    _traduzirNomeEstrategia(nomeEstrategia) {
        const traducoes = {
            ajustePrecos: 'Ajuste de Preços',
            renegociacaoPrazos: 'Renegociação de Prazos com Fornecedores',
            antecipacaoRecebiveis: 'Antecipação de Recebíveis',
            capitalGiro: 'Captação de Capital de Giro',
            mixProdutos: 'Otimização do Mix de Produtos',
            meiosPagamento: 'Diversificação dos Meios de Pagamento'
        };
        
        return traducoes[nomeEstrategia] || nomeEstrategia;
    }

    /**
     * Realiza a simulação completa do impacto do Split Payment
     * @param {Object} dados - Dados de entrada do formulário
     * @param {Object} opcoesSimulacao - Opções adicionais para a simulação
     * @returns {Object} Resultados completos da simulação
     */
    simular(dados, opcoesSimulacao = {}) {
        // Opções padrão
        const opcoes = {
            anoInicial: 2026,
            anoFinal: 2033,
            cenario: 'moderado',
            taxaCrescimento: null,
            simularEstrategias: true,
            estrategias: {},
            ...opcoesSimulacao
        };
        
        // Resultados básicos para o ano inicial
        const resultadoBase = this.calcularImpactoCapitalGiro(dados, opcoes.anoInicial);
        
        // Projeção temporal para o período de transição
        const projecaoTemporal = this.simularPeriodoTransicao(
            dados, 
            opcoes.anoInicial, 
            opcoes.anoFinal, 
            opcoes.cenario, 
            opcoes.taxaCrescimento
        );
        
        // Simulação de estratégias de mitigação (se solicitado)
        let estrategiasMitigacao = null;
        if (opcoes.simularEstrategias) {
            estrategiasMitigacao = this.simularEstrategiasMitigacao(
                dados,
                opcoes.estrategias,
                opcoes.anoInicial
            );
        }
        
        // Resultados completos da simulação
        const resultados = {
            parametrosEntrada: this.memoriaCalculo.parametrosEntrada,
            resultadoBase,
            projecaoTemporal,
            estrategiasMitigacao,
            memoriaCalculo: this.memoriaCalculo
        };
        
        return resultados;
    }

    /**
     * Obtém a memória de cálculo completa
     * @returns {Object} Memória de cálculo com todos os passos
     */
    obterMemoriaCalculo() {
        return this.memoriaCalculo;
    }

    /**
     * Limpa a memória de cálculo
     */
    limparMemoriaCalculo() {
        this.memoriaCalculo = {
            parametrosEntrada: {},
            resultadoAtual: {},
            resultadoSplitPayment: {},
            impactoGeral: {},
            projecaoTemporal: {},
            estrategiasMitigacao: {}
        };
    }
}

// Exportar a classe para uso global
//export { SimuladorFluxoCaixa };
// Disponibilizar a classe globalmente sem exportação