// Simulador.js - Versão integrada e simplificada
// © 2025 Expertzy Inteligência Tributária

// ======= CONFIGURAÇÃO DO SPLIT PAYMENT =======
class ConfiguracaoSplitPayment {
    constructor() {
        // Alíquotas base dos tributos
        this.aliquotas_base = {
            "CBS": 0.088,  // 8,8%
            "IBS": 0.177   // 17,7%
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

        // Configurações setoriais
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
        };
        
        // Configurações para análise de fluxo de caixa
        this.parametros_fluxo_caixa = {
            "prazo_pagamento_imposto_atual": 25,  // Dias após o mês
            "prazo_medio_recebimento_padrao": 30, // PMR em dias (padrão)
            "prazo_medio_pagamento_padrao": 30,   // PMP em dias (padrão)
            "prazo_medio_estoque_padrao": 30,     // PME em dias (padrão)
            "taxa_antecipacao_recebiveis": 0.018, // 1,8% a.m.
            "taxa_capital_giro": 0.021,           // 2,1% a.m.
            "spread_bancario": 0.035              // 3,5 p.p.
        };
        
        // Configurações de formatação
        this.configuracoes_exibicao = {
            "casas_decimais_percentual": 2,
            "casas_decimais_valores": 2,
            "simbolo_moeda": "R$",
            "separador_milhar": "."
        };
        
        // Carregar configurações salvas se existirem
        this.carregarConfiguracoes();
    }

    // Funções de formatação e conversão
    formatarMoeda(valor, incluirSimbolo = true) {
        if (valor === undefined || valor === null || isNaN(valor)) {
            return incluirSimbolo ? `${this.configuracoes_exibicao.simbolo_moeda} 0,00` : '0,00';
        }
        
        // Formata o número com casas decimais fixas e separador de milhar
        const valorFormatado = valor.toLocaleString('pt-BR', {
            minimumFractionDigits: this.configuracoes_exibicao.casas_decimais_valores,
            maximumFractionDigits: this.configuracoes_exibicao.casas_decimais_valores
        });
        
        return incluirSimbolo 
            ? `${this.configuracoes_exibicao.simbolo_moeda} ${valorFormatado}`
            : valorFormatado;
    }

    formatarPercentual(valor, incluirSimbolo = true) {
        if (valor === undefined || valor === null || isNaN(valor)) {
            return incluirSimbolo ? '0,00%' : '0,00';
        }
        
        // Multiplica por 100 e formata com casas decimais fixas
        const percentual = (valor * 100).toLocaleString('pt-BR', {
            minimumFractionDigits: this.configuracoes_exibicao.casas_decimais_percentual,
            maximumFractionDigits: this.configuracoes_exibicao.casas_decimais_percentual
        });
        
        return incluirSimbolo ? `${percentual}%` : percentual;
    }

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

    // Obtém a alíquota total (CBS + IBS)
    obterAliquotaTotal() {
        return this.aliquotas_base.CBS + this.aliquotas_base.IBS;
    }

    // Obtém a alíquota efetiva para um setor específico
    obterAliquotaEfetivaSetor(codigoSetor) {
        if (this.setores_especiais[codigoSetor]) {
            return this.setores_especiais[codigoSetor].aliquota_efetiva;
        }
        return this.obterAliquotaTotal();
    }

    // Obtém o percentual de implementação do Split Payment para um ano e setor
    obterPercentualImplementacao(ano, codigoSetor = null) {
        // Verifica se o setor tem cronograma próprio
        if (codigoSetor && 
            this.setores_especiais[codigoSetor] && 
            this.setores_especiais[codigoSetor].cronograma_proprio &&
            this.setores_especiais[codigoSetor].cronograma &&
            this.setores_especiais[codigoSetor].cronograma[ano]) {
            
            return this.setores_especiais[codigoSetor].cronograma[ano];
        }
        
        // Se não tem cronograma próprio ou o ano não está no cronograma do setor
        if (this.cronograma_implementacao[ano]) {
            return this.cronograma_implementacao[ano];
        }
        
        // Se o ano está fora do período de implementação
        if (ano < 2026) return 0;
        if (ano > 2033) return 1.0;
        
        // Não deveria chegar aqui, mas por segurança
        return 0;
    }

    // Atualiza as alíquotas base
    atualizarAliquotasBase(aliquotaCBS, aliquotaIBS) {
        if (aliquotaCBS !== undefined && !isNaN(aliquotaCBS) && aliquotaCBS >= 0) {
            this.aliquotas_base.CBS = aliquotaCBS;
        }
        
        if (aliquotaIBS !== undefined && !isNaN(aliquotaIBS) && aliquotaIBS >= 0) {
            this.aliquotas_base.IBS = aliquotaIBS;
        }
    }

    // Salva as configurações
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

    // Carrega as configurações
    carregarConfiguracoes() {
        try {
            const configSalva = localStorage.getItem('splitPaymentConfig');
            if (configSalva) {
                const config = JSON.parse(configSalva);
                
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
}

// ======= SIMULADOR DE FLUXO DE CAIXA =======
class SimuladorFluxoCaixa {
    constructor(configuracao) {
        // Armazena a configuração
        this.config = configuracao;
        
        // Inicializa a memória de cálculo
        this.memoriaCalculo = {
            parametrosEntrada: {},
            resultadoAtual: {},
            resultadoSplitPayment: {},
            impactoGeral: {},
            projecaoTemporal: {},
            estrategiasMitigacao: {}
        };
    }

    // Normaliza os dados de entrada
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

    // Calcula o fluxo de caixa no regime tributário atual
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
            diasCapitalGiroTributario: prazoEfetivoPagamentoImposto,
            
            // Valores totais
            totalRecebimentos: vendasVista + vendasPrazo,
            totalDesembolsos: valorTributos,
            saldoFluxoCaixa: vendasVista + vendasPrazo - valorTributos
        };
        
        // Registra resultados na memória de cálculo
        this.memoriaCalculo.resultadoAtual = resultados;
        
        return resultados;
    }

    // Calcula o fluxo de caixa com o regime de Split Payment
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

    // Calcula o impacto do Split Payment no capital de giro
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
        const margemOperacionalOriginal = dadosNorm.margem || 0.15; // Valor padrão se não informado
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

    // Simula o impacto ao longo do período de transição
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

    // Simula o impacto completo
    simular(dados, opcoesSimulacao = {}) {
        // Opções padrão
        const opcoes = {
            anoInicial: 2026,
            anoFinal: 2033,
            cenario: 'moderado',
            taxaCrescimento: null,
            simularEstrategias: false,
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
        
        // Resultados completos da simulação
        const resultados = {
            parametrosEntrada: this.memoriaCalculo.parametrosEntrada,
            resultadoBase,
            projecaoTemporal,
            memoriaCalculo: this.memoriaCalculo
        };
        
        return resultados;
    }

    // Obtém a memória de cálculo
    obterMemoriaCalculo() {
        return this.memoriaCalculo;
    }
}

// ======= APLICATIVO PRINCIPAL =======
const SimuladorApp = {
    // Configuração global do aplicativo
    config: null,
    
    // Simulador de fluxo de caixa
    simulador: null,
    
    // Armazena os últimos resultados da simulação
    _ultimosResultados: null,
    
    // Inicializa a aplicação
    // No método inicializar do SimuladorApp
    inicializar: function() {
        console.log('Inicializando Simulador de Impacto do Split Payment...');

        // Inicializar configuração
        this.config = new ConfiguracaoSplitPayment();

        // Inicializar simulador
        this.simulador = new SimuladorFluxoCaixa(this.config);

        // Configurar navegação de abas
        //this.inicializarNavegacao();
        window.aoMudarAba = this.aoMudarAba.bind(this);

        // Configurar inputs de formatação - MODIFICADO
        if (window.FormatacaoHelper) {
            window.FormatacaoHelper.configurarTodosInputs(this.config);
        } else {
            console.error('FormatacaoHelper não encontrado!');
            this.inicializarFormatacao(); // Fallback para o método original
        }

        // Configurar event listeners
        this.configurarEventListeners();

        // Atualizar interface
        this.carregarValoresInterface();

        // Inicializar propriedade _ultimosResultados
        this._ultimosResultados = null;

        // Inicializar módulo de configurações setoriais quando necessário
        this.configurarModuloConfiguracoesSetoriais();

        console.log('Simulador de Impacto do Split Payment inicializado com sucesso.');
    },
    
    // Configura o módulo de configurações setoriais
    configurarModuloConfiguracoesSetoriais: function() {
        // Verificar se estamos na aba de configurações setoriais
        const abaAtiva = document.querySelector('.tab-button.active');
        if (abaAtiva && abaAtiva.getAttribute('data-tab') === 'configuracoes-setoriais') {
            // Se estiver na aba, inicializar imediatamente
            this.inicializarConfiguracoesSetoriais();
        }
        
        // Adicionar evento para inicializar quando a aba for alterada
        const self = this;
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.addEventListener('click', function() {
                if (this.getAttribute('data-tab') === 'configuracoes-setoriais') {
                    self.inicializarConfiguracoesSetoriais();
                }
            });
        });
    },
    
    // Inicializa as configurações setoriais
    inicializarConfiguracoesSetoriais: function() {
        // Verificar se as configurações setoriais já foram inicializadas
        if (this.configuracoesSetoriaisInicializadas) return;
        
        console.log('Inicializando configurações setoriais...');
        
        // Inicializar configurações setoriais
        // Código específico para inicializar as configurações setoriais
        
        // Marcar como inicializado
        this.configuracoesSetoriaisInicializadas = true;
        
        console.log('Configurações setoriais inicializadas com sucesso.');
    },
    
    // Inicializa o sistema de navegação por abas
    inicializarNavegacao: function() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Adicionar event listeners para botões de aba
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remover classe active de todas as abas
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Adicionar classe active à aba clicada
                this.classList.add('active');
                
                // Mostrar conteúdo correspondente
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
                
                // Executar ações específicas para cada aba
                SimuladorApp.aoMudarAba(tabId);
            });
        });
        
        // Também configura as subabas
        const subtabButtons = document.querySelectorAll('.subtab-button');
        const subtabContents = document.querySelectorAll('.subtab-content');
        
        subtabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Encontrar o container pai desta subaba
                const parentTab = this.closest('.tab-content');
                if (!parentTab) return;
                
                // Remover classe active de todas as subabas neste container
                const relatedButtons = parentTab.querySelectorAll('.subtab-button');
                const relatedContents = parentTab.querySelectorAll('.subtab-content');
                
                relatedButtons.forEach(btn => btn.classList.remove('active'));
                relatedContents.forEach(content => content.classList.remove('active'));
                
                // Adicionar classe active à subaba clicada
                this.classList.add('active');
                
                // Mostrar conteúdo correspondente
                const subtabId = this.getAttribute('data-subtab');
                const subtabContent = document.getElementById(subtabId);
                if (subtabContent) subtabContent.classList.add('active');
            });
        });
    },
    
    // Ações a executar quando mudar de aba
    aoMudarAba: function(tabId) {
        switch (tabId) {
            case 'memoria-calculo':
                this.atualizarMemoriaCalculo();
                break;
            case 'configuracoes-setoriais':
                this.inicializarConfiguracoesSetoriais();
                break;
            case 'estrategias-mitigacao':
                // Se tivermos resultados da última simulação, podemos usá-los
                if (this._ultimosResultados) {
                    // Configurar a interface de estratégias com base nos resultados
                    // ...
                }
                break;
        }
    },
    
    // Inicializa formatação de inputs
    inicializarFormatacao: function() {
        // Formatar inputs monetários
        document.querySelectorAll('.money-input').forEach(input => {
            // Manipulador para formatação monetária
            input.addEventListener('input', function(e) {
                // Permite apenas números e uma vírgula
                this.value = this.value.replace(/[^\d,]/g, '');
                
                // Garante apenas uma vírgula
                const partes = this.value.split(',');
                if (partes.length > 2) {
                    this.value = partes[0] + ',' + partes.slice(1).join('');
                }
                
                // Limita a 2 casas decimais
                if (partes.length === 2 && partes[1].length > 2) {
                    this.value = partes[0] + ',' + partes[1].substring(0, 2);
                }
            });
            
            // Formatação ao perder foco
            input.addEventListener('blur', function() {
                if (this.value) {
                    let valor = this.value.replace(/\./g, '').replace(',', '.');
                    valor = parseFloat(valor) || 0;
                    this.value = SimuladorApp.config.formatarMoeda(valor);
                } else {
                    this.value = SimuladorApp.config.formatarMoeda(0);
                }
            });
            
            // Formatar valor inicial
            if (input.value) {
                input.dispatchEvent(new Event('blur'));
            }
        });
        
        // Formatar inputs percentuais
        document.querySelectorAll('.percent-input').forEach(input => {
            // Manipulador para formatação percentual
            input.addEventListener('input', function(e) {
                // Permite apenas números e uma vírgula
                this.value = this.value.replace(/[^\d,]/g, '');
                
                // Garante apenas uma vírgula
                const partes = this.value.split(',');
                if (partes.length > 2) {
                    this.value = partes[0] + ',' + partes.slice(1).join('');
                }
                
                // Limita a 2 casas decimais
                if (partes.length === 2 && partes[1].length > 2) {
                    this.value = partes[0] + ',' + partes[1].substring(0, 2);
                }
            });
            
            // Formatação ao perder foco
            input.addEventListener('blur', function() {
                if (this.value) {
                    let valor = this.value.replace(/\./g, '').replace(',', '.');
                    valor = parseFloat(valor) || 0;
                    this.value = SimuladorApp.config.formatarPercentual(valor / 100);
                } else {
                    this.value = SimuladorApp.config.formatarPercentual(0);
                }
            });
            
            // Formatar valor inicial
            if (input.value) {
                input.dispatchEvent(new Event('blur'));
            }
        });
    },
    
    // Configura event listeners
    configurarEventListeners: function() {
        // Botão Simular
        const btnSimular = document.getElementById('btn-simular');
        if (btnSimular) {
            // Remover event listeners existentes (evitar duplicação)
            const novoBtn = btnSimular.cloneNode(true);
            if (btnSimular.parentNode) {
                btnSimular.parentNode.replaceChild(novoBtn, btnSimular);
            }
            
            // Adicionar novo event listener
            novoBtn.addEventListener('click', () => {
                this.realizarSimulacao();
            });
        }
        
        // Botão Limpar
        const btnLimpar = document.getElementById('btn-limpar');
        if (btnLimpar) {
            // Remover event listeners existentes (evitar duplicação)
            const novoBtn = btnLimpar.cloneNode(true);
            if (btnLimpar.parentNode) {
                btnLimpar.parentNode.replaceChild(novoBtn, btnLimpar);
            }
            
            // Adicionar novo event listener
            novoBtn.addEventListener('click', () => {
                this.limparFormulario();
            });
        }
        
        // Cenário Personalizado
        const selectCenario = document.getElementById('cenario');
        const divCenarioPersonalizado = document.getElementById('cenario-personalizado');
        
        if (selectCenario && divCenarioPersonalizado) {
            selectCenario.addEventListener('change', function() {
                divCenarioPersonalizado.style.display = 
                    this.value === 'personalizado' ? 'block' : 'none';
            });
            
            // Inicializar visibilidade
            divCenarioPersonalizado.style.display = 
                selectCenario.value === 'personalizado' ? 'block' : 'none';
        }
        
        // Calcular ciclo financeiro automaticamente
        const pmrInput = document.getElementById('pmr');
        const pmpInput = document.getElementById('pmp');
        const pmeInput = document.getElementById('pme');
        const cicloFinanceiroInput = document.getElementById('ciclo-financeiro');
        
        const atualizarCicloFinanceiro = () => {
            if (pmrInput && pmpInput && pmeInput && cicloFinanceiroInput) {
                const pmr = parseInt(pmrInput.value) || 0;
                const pmp = parseInt(pmpInput.value) || 0;
                const pme = parseInt(pmeInput.value) || 0;
                
                const ciclo = pmr + pme - pmp;
                cicloFinanceiroInput.value = ciclo;
            }
        };
        
        if (pmrInput) pmrInput.addEventListener('input', atualizarCicloFinanceiro);
        if (pmpInput) pmpInput.addEventListener('input', atualizarCicloFinanceiro);
        if (pmeInput) pmeInput.addEventListener('input', atualizarCicloFinanceiro);
        
        // Calcular inicial
        atualizarCicloFinanceiro();
        
        // Calcular vendas a prazo a partir das vendas à vista
        const percVistaInput = document.getElementById('perc-vista');
        const percPrazoInput = document.getElementById('perc-prazo');
        
        const atualizarPercPrazo = () => {
            if (percVistaInput && percPrazoInput) {
                const percVista = this.config.converterPercentualParaNumero(percVistaInput.value);
                const percPrazo = 1 - percVista;
                percPrazoInput.value = this.config.formatarPercentual(percPrazo);
            }
        };
        
        if (percVistaInput) {
            percVistaInput.addEventListener('input', atualizarPercPrazo);
            percVistaInput.addEventListener('blur', atualizarPercPrazo);
        }
        
        // Inicializar calculador de vendas a prazo
        if (percVistaInput && percVistaInput.value) {
            atualizarPercPrazo();
        } else if (percVistaInput) {
            percVistaInput.value = this.config.formatarPercentual(0.3); // 30% padrão
            atualizarPercPrazo();
        }
        
        // Botão Salvar Configurações
        const btnSalvarConfiguracoes = document.getElementById('btn-salvar-configuracoes');
        if (btnSalvarConfiguracoes) {
            // Remover event listeners existentes (evitar duplicação)
            const novoBtn = btnSalvarConfiguracoes.cloneNode(true);
            if (btnSalvarConfiguracoes.parentNode) {
                btnSalvarConfiguracoes.parentNode.replaceChild(novoBtn, btnSalvarConfiguracoes);
            }
            
            // Adicionar novo event listener
            novoBtn.addEventListener('click', () => {
                this.salvarConfiguracoes();
            });
        }
        
        // Botão Restaurar Padrões
        const btnRestaurarPadroes = document.getElementById('btn-restaurar-padroes');
        if (btnRestaurarPadroes) {
            // Remover event listeners existentes (evitar duplicação)
            const novoBtn = btnRestaurarPadroes.cloneNode(true);
            if (btnRestaurarPadroes.parentNode) {
                btnRestaurarPadroes.parentNode.replaceChild(novoBtn, btnRestaurarPadroes);
            }
            
            // Adicionar novo event listener
            novoBtn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja restaurar todas as configurações para o padrão original?')) {
                    // Criar nova instância com valores padrão
                    this.config = new ConfiguracaoSplitPayment();
                    
                    // Criar nova instância do simulador com a nova configuração
                    this.simulador = new SimuladorFluxoCaixa(this.config);
                    
                    // Remover configurações salvas
                    localStorage.removeItem('splitPaymentConfig');
                    
                    // Recarregar a interface
                    this.carregarValoresInterface();
                    
                    // Limpar resultados anteriores
                    this._ultimosResultados = null;
                    
                    alert('Configurações restauradas com sucesso!');
                }
            });
        }
    },
    
    // Carrega os valores da configuração na interface
    carregarValoresInterface: function() {
        // Alíquotas base
        const inputCBS = document.getElementById('aliquota-cbs');
        const inputIBS = document.getElementById('aliquota-ibs');
        
        if (inputCBS) inputCBS.value = this.config.formatarPercentual(this.config.aliquotas_base.CBS);
        if (inputIBS) inputIBS.value = this.config.formatarPercentual(this.config.aliquotas_base.IBS);
        
        // Cronograma de implementação
        for (let ano = 2026; ano <= 2033; ano++) {
            const inputPerc = document.querySelector(`input[name="perc-${ano}"]`);
            if (inputPerc && this.config.cronograma_implementacao[ano] !== undefined) {
                inputPerc.value = this.config.formatarPercentual(this.config.cronograma_implementacao[ano]);
            }
        }
        
        // Inicializar com valores padrão onde necessário
        const pmrInput = document.getElementById('pmr');
        const pmpInput = document.getElementById('pmp');
        const pmeInput = document.getElementById('pme');
        
        if (pmrInput && !pmrInput.value) pmrInput.value = "30";
        if (pmpInput && !pmpInput.value) pmpInput.value = "30";
        if (pmeInput && !pmeInput.value) pmeInput.value = "30";
        
        // Recalcular ciclo financeiro
        const cicloFinanceiroInput = document.getElementById('ciclo-financeiro');
        if (cicloFinanceiroInput) {
            const pmr = parseInt(pmrInput?.value || "0");
            const pmp = parseInt(pmpInput?.value || "0");
            const pme = parseInt(pmeInput?.value || "0");
            cicloFinanceiroInput.value = (pmr + pme - pmp).toString();
        }
        
        // Inicializar percentuais de venda
        const percVistaInput = document.getElementById('perc-vista');
        const percPrazoInput = document.getElementById('perc-prazo');
        
        if (percVistaInput && !percVistaInput.value) {
            percVistaInput.value = this.config.formatarPercentual(0.3);
        }
        
        if (percPrazoInput) {
            percPrazoInput.value = this.config.formatarPercentual(
                1 - this.config.converterPercentualParaNumero(percVistaInput?.value || "30%")
            );
        }
    },
    
    // Realiza a simulação
    realizarSimulacao: function() {
        // Verificar se o simulador foi inicializado
        if (!this.simulador) {
            alert('O simulador ainda não foi inicializado. Tente novamente em alguns instantes.');
            return;
        }
        
        // Coletar dados do formulário
        const dados = this.coletarDadosFormulario();
        
        // Validar dados
        if (!this.validarDados(dados)) {
            alert('Por favor, preencha todos os campos obrigatórios corretamente.');
            return;
        }
        
        // Configurar opções de simulação
        const opcoesSimulacao = {
            anoInicial: parseInt(dados.dataInicial.split('-')[0], 10),
            anoFinal: parseInt(dados.dataFinal.split('-')[0], 10),
            cenario: dados.cenario,
            taxaCrescimento: dados.cenario === 'personalizado' ? 
                parseFloat(dados.taxaCrescimento) / 100 : null,
            simularEstrategias: false  // Inicialmente sem estratégias
        };
        
        // Executar simulação
        try {
            console.log('Iniciando simulação com dados:', dados);
            const resultados = this.simulador.simular(dados, opcoesSimulacao);
            console.log('Simulação concluída:', resultados);
            
            // Armazenar resultados para uso em outras partes do sistema
            this._ultimosResultados = resultados;
            
            // Exibir resultados
            this.exibirResultados(resultados);
            
            // Atualizar explicitamente a memória de cálculo
            this.atualizarMemoriaCalculo();
            
            return resultados;
        } catch (error) {
            console.error('Erro ao executar a simulação:', error);
            alert('Ocorreu um erro ao executar a simulação. Verifique o console para mais detalhes.');
        }
    },
    
    // Método para obter os últimos resultados da simulação
    obterUltimosResultados: function() {
        return this._ultimosResultados;
    },
    
    // Coleta dados do formulário
    coletarDadosFormulario: function() {
        // Dados básicos da empresa
        const faturamentoEl = document.getElementById('faturamento');
        const faturamento = this.config.converterMoedaParaNumero(faturamentoEl.value);
        
        const periodoEl = document.querySelector('input[name="periodo"]:checked');
        const periodo = periodoEl ? periodoEl.value : 'mensal';
        
        const setor = document.getElementById('setor').value;
        const regime = document.getElementById('regime').value;
        
        const margemEl = document.getElementById('margem');
        const margem = this.config.converterPercentualParaNumero(margemEl.value);
        
        // Ciclo financeiro
        const pmr = parseInt(document.getElementById('pmr').value, 10) || 0;
        const pmp = parseInt(document.getElementById('pmp').value, 10) || 0;
        const pme = parseInt(document.getElementById('pme').value, 10) || 0;
        const cicloFinanceiro = parseInt(document.getElementById('ciclo-financeiro').value, 10) || 0;
        
        const percVistaEl = document.getElementById('perc-vista');
        const percVista = this.config.converterPercentualParaNumero(percVistaEl.value);
        
        const percPrazoEl = document.getElementById('perc-prazo');
        const percPrazo = this.config.converterPercentualParaNumero(percPrazoEl.value);
        
        // Parâmetros tributários
        const aliquotaEl = document.getElementById('aliquota');
        const aliquota = this.config.converterPercentualParaNumero(aliquotaEl.value);
        
        const tipoOperacao = document.getElementById('tipo-operacao').value;
        
        const creditosEl = document.getElementById('creditos');
        const creditos = this.config.converterMoedaParaNumero(creditosEl.value);
        
        // Parâmetros de simulação
        const dataInicial = document.getElementById('data-inicial').value;
        const dataFinal = document.getElementById('data-final').value;
        const cenario = document.getElementById('cenario').value;
        
        // Parâmetros de cenário personalizado
        let taxaCrescimento = null;
        if (cenario === 'personalizado') {
            const taxaCrescimentoEl = document.getElementById('taxa-crescimento');
            taxaCrescimento = parseFloat(taxaCrescimentoEl.value);
        }
        
        // Retornar objeto com todos os dados
        return {
            faturamento,
            periodo,
            setor,
            regime,
            margem,
            pmr,
            pmp,
            pme,
            cicloFinanceiro,
            percVista,
            percPrazo,
            aliquota,
            tipoOperacao,
            creditos,
            dataInicial,
            dataFinal,
            cenario,
            taxaCrescimento
        };
    },
    
    // Valida os dados do formulário
    validarDados: function(dados) {
        // Validações básicas
        if (isNaN(dados.faturamento) || dados.faturamento <= 0) {
            alert('Por favor, informe um valor de faturamento válido.');
            return false;
        }
        
        if (isNaN(dados.margem)) {
            alert('Por favor, informe uma margem operacional válida.');
            return false;
        }
        
        if (!dados.setor) {
            alert('Por favor, selecione um setor de atividade.');
            return false;
        }
        
        if (!dados.regime) {
            alert('Por favor, selecione um regime tributário.');
            return false;
        }
        
        if (isNaN(dados.aliquota) || dados.aliquota <= 0) {
            alert('Por favor, informe uma alíquota válida.');
            return false;
        }
        
        if (!dados.tipoOperacao) {
            alert('Por favor, selecione um tipo de operação predominante.');
            return false;
        }
        
        if (dados.cenario === 'personalizado' && 
            (isNaN(dados.taxaCrescimento) || dados.taxaCrescimento < 0)) {
            alert('Por favor, informe uma taxa de crescimento válida para o cenário personalizado.');
            return false;
        }
        
        // Se chegou até aqui, os dados são válidos
        return true;
    },
    
    // Exibe os resultados da simulação
    exibirResultados: function(resultados) {
        const containerResultados = document.getElementById('resultados');
        if (!containerResultados) return;
        
        // Extrair dados principais
        const impacto = resultados.resultadoBase;
        const projecao = resultados.projecaoTemporal;
        
        // Formatar valores para exibição
        const formatarValor = valor => this.config.formatarMoeda(valor);
        const formatarPercent = valor => this.config.formatarPercentual(valor);
        
        // Construir HTML dos resultados
        let html = `
            <div class="result-card">
                <h3>Resultados da Simulação</h3>
                
                <div class="result-section">
                    <h4>Impacto Inicial (${projecao.parametros.anoInicial})</h4>
                    <table class="result-table">
                        <tr>
                            <td>Percentual de Implementação:</td>
                            <td>${formatarPercent(impacto.percentualImplementacao)}</td>
                        </tr>
                        <tr>
                            <td>Diferença no Capital de Giro:</td>
                            <td class="${impacto.diferencaCapitalGiro >= 0 ? 'positive' : 'negative'}">
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
                    <p>Impacto acumulado ao longo do período ${projecao.parametros.anoInicial}-${projecao.parametros.anoFinal}:</p>
                    <table class="result-table">
                        <tr>
                            <td>Necessidade Total de Capital:</td>
                            <td>${formatarValor(projecao.impactoAcumulado.totalNecessidadeCapitalGiro)}</td>
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
            // Ativar a aba de estratégias
            document.querySelector('.tab-button[data-tab="estrategias-mitigacao"]')?.click();
        });
        
        document.getElementById('btn-detalhes')?.addEventListener('click', () => {
            // Ativar a aba de memória de cálculo
            document.querySelector('.tab-button[data-tab="memoria-calculo"]')?.click();
        });
    },
    
    // Limpa o formulário
    limparFormulario: function() {
        const form = document.getElementById('simulacao-form');
        if (form) {
            form.reset();
            
            // Atualizar valores calculados automaticamente
            // (ciclo financeiro, vendas a prazo, etc.)
            this.carregarValoresInterface();
        }
        
        // Limpar resultados
        const containerResultados = document.getElementById('resultados');
        if (containerResultados) {
            containerResultados.innerHTML = '';
        }
        
        // Limpar resultados armazenados
        this._ultimosResultados = null;
    },
    
    // Atualiza a memória de cálculo
    atualizarMemoriaCalculo: function() {
        const memoryContainer = document.getElementById('memory-content');
        if (!memoryContainer || !this.simulador) return;
        
        // Se tivermos resultados armazenados, use-os
        let memoriaCalculo;
        if (this._ultimosResultados && this._ultimosResultados.memoriaCalculo) {
            memoriaCalculo = this._ultimosResultados.memoriaCalculo;
        } else {
            // Caso contrário, obtenha diretamente do simulador
            memoriaCalculo = this.simulador.obterMemoriaCalculo();
        }
        
        // Verificar se há conteúdo na memória
        if (Object.keys(memoriaCalculo.parametrosEntrada).length === 0) {
            memoryContainer.innerHTML = `
                <div class="calculation-section">
                    <div class="calculation-section-title">Memória de Cálculo</div>
                    <div class="calculation-line comment">Ainda não há simulações realizadas. Execute uma simulação para visualizar a memória de cálculo.</div>
                </div>
            `;
            return;
        }
        
        // Formatar a memória de cálculo para exibição
        let html = '';
        
        // Parâmetros de entrada
        html += `<div class="calculation-section">
            <div class="calculation-section-title">== PARÂMETROS DE ENTRADA ==</div>`;
        
        // Formatar cada parâmetro de entrada
        const params = memoriaCalculo.parametrosEntrada;
        for (const [key, value] of Object.entries(params)) {
            let valorFormatado = value;
            
            // Formatar valores monetários e percentuais
            if (key.includes('faturamento') || key.includes('creditos')) {
                valorFormatado = this.config.formatarMoeda(value);
            } else if (key.includes('margem') || key.includes('aliquota') || key.includes('perc')) {
                valorFormatado = this.config.formatarPercentual(value);
            }
            
            html += `<div class="calculation-line input">${key}: ${valorFormatado}</div>`;
        }
        
        html += `</div>`;
        
        // Fluxo de caixa atual
        html += `<div class="calculation-section">
            <div class="calculation-section-title">== CÁLCULO DO FLUXO DE CAIXA ATUAL ==</div>`;
        
        // Formatar cálculos do fluxo atual
        const fluxoAtual = memoriaCalculo.resultadoAtual;
        html += `<div class="calculation-line comment"># Cálculo das vendas mensais por modalidade</div>`;
        html += `<div class="calculation-line formula">Vendas à Vista = Faturamento * % Vendas à Vista</div>`;
        html += `<div class="calculation-line formula">Vendas à Vista = ${this.config.formatarMoeda(params.faturamentoMensal)} * ${this.config.formatarPercentual(params.percVista)}</div>`;
        html += `<div class="calculation-line result">Vendas à Vista = ${this.config.formatarMoeda(fluxoAtual.vendasVista)}</div>`;
        
        html += `<div class="calculation-line formula">Vendas a Prazo = Faturamento * % Vendas a Prazo</div>`;
        html += `<div class="calculation-line formula">Vendas a Prazo = ${this.config.formatarMoeda(params.faturamentoMensal)} * ${this.config.formatarPercentual(params.percPrazo)}</div>`;
        html += `<div class="calculation-line result">Vendas a Prazo = ${this.config.formatarMoeda(fluxoAtual.vendasPrazo)}</div>`;
        
        html += `<div class="calculation-line comment"># Cálculo dos impostos</div>`;
        html += `<div class="calculation-line formula">Impostos = Faturamento * Alíquota Efetiva</div>`;
        html += `<div class="calculation-line formula">Impostos = ${this.config.formatarMoeda(params.faturamentoMensal)} * ${this.config.formatarPercentual(params.aliquota)}</div>`;
        html += `<div class="calculation-line result">Impostos = ${this.config.formatarMoeda(fluxoAtual.valorTributos)}</div>`;
        
        html += `<div class="calculation-line comment"># Cálculo do prazo de pagamento do imposto atual</div>`;
        html += `<div class="calculation-line variable">Prazo de Pagamento do Imposto = ${fluxoAtual.prazoPagamentoImpostoAtual} dias (após o mês)</div>`;
        html += `<div class="calculation-line formula">Prazo Efetivo = 30 + ${fluxoAtual.prazoPagamentoImpostoAtual} = ${fluxoAtual.prazoEfetivoPagamentoImposto} dias</div>`;
        
        html += `</div>`;
        
        // Fluxo de caixa com Split Payment
        html += `<div class="calculation-section">
            <div class="calculation-section-title">== CÁLCULO DO FLUXO DE CAIXA COM SPLIT PAYMENT ==</div>`;
        
        const fluxoSplit = memoriaCalculo.resultadoSplitPayment;
        html += `<div class="calculation-line comment"># Parâmetros do Split Payment para ${memoriaCalculo.impactoGeral.ano}</div>`;
        html += `<div class="calculation-line variable">Percentual de Implementação (${memoriaCalculo.impactoGeral.ano}) = ${this.config.formatarPercentual(fluxoSplit.percentualImplementacao)}</div>`;
        
        html += `<div class="calculation-line comment"># Cálculo dos impostos em Split Payment</div>`;
        html += `<div class="calculation-line formula">Impostos Split = Impostos * Percentual de Implementação</div>`;
        html += `<div class="calculation-line formula">Impostos Split = ${this.config.formatarMoeda(fluxoSplit.valorTributos)} * ${this.config.formatarPercentual(fluxoSplit.percentualImplementacao)}</div>`;
        html += `<div class="calculation-line result">Impostos Split = ${this.config.formatarMoeda(fluxoSplit.tributosSplit)}</div>`;
        
        html += `<div class="calculation-line formula">Impostos Convencionais = Impostos - Impostos Split</div>`;
        html += `<div class="calculation-line formula">Impostos Convencionais = ${this.config.formatarMoeda(fluxoSplit.valorTributos)} - ${this.config.formatarMoeda(fluxoSplit.tributosSplit)}</div>`;
        html += `<div class="calculation-line result">Impostos Convencionais = ${this.config.formatarMoeda(fluxoSplit.tributosConvencionais)}</div>`;
        
        html += `<div class="calculation-line comment"># Cálculo do impacto no fluxo de vendas a prazo</div>`;
        html += `<div class="calculation-line formula">Impostos Split nas Vendas a Prazo = Vendas a Prazo * Alíquota Efetiva * % Implementação</div>`;
        html += `<div class="calculation-line formula">Impostos Split nas Vendas a Prazo = ${this.config.formatarMoeda(fluxoSplit.vendasPrazo)} * ${this.config.formatarPercentual(params.aliquota)} * ${this.config.formatarPercentual(fluxoSplit.percentualImplementacao)}</div>`;
        html += `<div class="calculation-line result">Impostos Split nas Vendas a Prazo = ${this.config.formatarMoeda(fluxoSplit.tributosSplitVendasPrazo)}</div>`;
        
        html += `</div>`;
        
        // Impacto no capital de giro
        html += `<div class="calculation-section">
            <div class="calculation-section-title">== IMPACTO NO CAPITAL DE GIRO ==</div>`;
        
        const impacto = memoriaCalculo.impactoGeral;
        html += `<div class="calculation-line comment"># Cálculo do Capital de Giro Comprometido no modelo atual</div>`;
        html += `<div class="calculation-line formula">Capital de Giro Atual = (Vendas a Prazo / 30) * PMR - (Impostos / 30) * (Prazo Efetivo)</div>`;
        html += `<div class="calculation-line formula">Capital de Giro Atual = (${this.config.formatarMoeda(fluxoAtual.vendasPrazo)} / 30) * ${params.pmr} - (${this.config.formatarMoeda(fluxoAtual.valorTributos)} / 30) * ${fluxoAtual.prazoEfetivoPagamentoImposto}</div>`;
        html += `<div class="calculation-line result">Capital de Giro Atual = ${this.config.formatarMoeda(impacto.capitalGiroAtual)}</div>`;
        
        html += `<div class="calculation-line comment"># Cálculo do Capital de Giro Comprometido com Split Payment</div>`;
        html += `<div class="calculation-line formula">Capital de Giro Split = (Recebimento Líquido Vendas a Prazo / 30) * PMR - (Impostos Convencionais / 30) * (Prazo Efetivo)</div>`;
        html += `<div class="calculation-line formula">Capital de Giro Split = (${this.config.formatarMoeda(fluxoSplit.recebimentoLiquidoVendasPrazo)} / 30) * ${params.pmr} - (${this.config.formatarMoeda(fluxoSplit.tributosConvencionais)} / 30) * ${fluxoSplit.prazoEfetivoPagamentoImposto}</div>`;
        html += `<div class="calculation-line result">Capital de Giro Split = ${this.config.formatarMoeda(impacto.capitalGiroSplit)}</div>`;
        
        html += `<div class="calculation-line comment"># Cálculo do Impacto no Capital de Giro</div>`;
        html += `<div class="calculation-line formula">Impacto = Capital de Giro Split - Capital de Giro Atual</div>`;
        html += `<div class="calculation-line formula">Impacto = ${this.config.formatarMoeda(impacto.capitalGiroSplit)} - ${this.config.formatarMoeda(impacto.capitalGiroAtual)}</div>`;
        html += `<div class="calculation-line result">Impacto = ${this.config.formatarMoeda(impacto.diferencaCapitalGiro)} (${impacto.diferencaCapitalGiro < 0 ? 'Redução' : 'Aumento'} no Capital de Giro)</div>`;
        
        html += `</div>`;
        
        // Inserir o HTML formatado no container
        memoryContainer.innerHTML = html;
        
        // Atualizar contador de linhas
        const lineCount = document.getElementById('line-count');
        if (lineCount) {
            const lines = memoryContainer.querySelectorAll('.calculation-line').length;
            lineCount.textContent = `Linhas: ${lines}`;
        }
    },
    
    // Salva as configurações
    salvarConfiguracoes: function() {
        // Capturar alíquotas base
        const inputCBS = document.getElementById('aliquota-cbs');
        const inputIBS = document.getElementById('aliquota-ibs');
        
        if (inputCBS) {
            const aliquotaCBS = this.config.converterPercentualParaNumero(inputCBS.value);
            this.config.aliquotas_base.CBS = aliquotaCBS;
        }
        
        if (inputIBS) {
            const aliquotaIBS = this.config.converterPercentualParaNumero(inputIBS.value);
            this.config.aliquotas_base.IBS = aliquotaIBS;
        }
        
        // Capturar cronograma de implementação
        for (let ano = 2026; ano <= 2033; ano++) {
            const inputPerc = document.querySelector(`input[name="perc-${ano}"]`);
            if (inputPerc) {
                const percentual = this.config.converterPercentualParaNumero(inputPerc.value);
                this.config.cronograma_implementacao[ano] = percentual;
            }
        }
        
        // Salvar configurações
        if (this.config.salvarConfiguracoes()) {
            alert('Configurações salvas com sucesso!');
        } else {
            alert('Erro ao salvar configurações. Verifique o console para mais detalhes.');
        }
    }
};

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando simulador...');
    SimuladorApp.inicializar();
});