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
            },
            "agronegocio": {
                nome: "Agronegócio",
                aliquota_efetiva: 0.26,
                reducao_especial: 0.02,
                cronograma_proprio: true
            },
            "saude": {
                nome: "Saúde e Hospitalar",
                aliquota_efetiva: 0.25,
                reducao_especial: 0.03,
                cronograma_proprio: true
            },
            "educacao": {
                nome: "Educação",
                aliquota_efetiva: 0.24,
                reducao_especial: 0.05,
                cronograma_proprio: true
            },
            "construcao": {
                nome: "Construção Civil",
                aliquota_efetiva: 0.27,
                reducao_especial: 0.01,
                cronograma_proprio: false
            },
            "transportes": {
                nome: "Transportes e Logística",
                aliquota_efetiva: 0.265,
                reducao_especial: 0.015,
                cronograma_proprio: false
            },
            "tecnologia": {
                nome: "Tecnologia da Informação",
                aliquota_efetiva: 0.27,
                reducao_especial: 0.0,
                cronograma_proprio: false
            },
            "financeiro": {
                nome: "Serviços Financeiros",
                aliquota_efetiva: 0.28,
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
            // Total da necessidade adicional de capital ao longo do período
            totalNecessidadeCapitalGiro: Object.values(resultadosAnuais)
                .reduce((acc, val) => acc + (val.necessidadeAdicionalCapitalGiro || 0), 0),

            // Média do impacto anual no capital de giro
            mediaImpactoAnual: Object.values(resultadosAnuais).length > 0 ?
                Object.values(resultadosAnuais)
                    .reduce((acc, val) => acc + (val.diferencaCapitalGiro || 0), 0) / 
                    Object.values(resultadosAnuais).length : 0,

            // Total do custo financeiro ao longo do período
            custoFinanceiroTotal: Object.values(resultadosAnuais)
                .reduce((acc, val) => acc + (val.custoFinanceiroAnual || 0), 0),

            // Impacto médio anual sobre a margem operacional
            // Código corrigido usando o objeto memoriaCalculo:
            impactoMedioMargem: Object.values(resultadosAnuais).length > 0 ?
                Object.values(resultadosAnuais)
                    .reduce((acc, val) => acc + ((val.margemOperacionalOriginal || 0) - (val.margemOperacionalAjustada || 0)), 0) /
                    Object.values(resultadosAnuais).length : 0
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
    // No método inicializar do SimuladorApp
    inicializar: function() {
        console.log('Inicializando Simulador de Impacto do Split Payment...');

        // Inicializar configuração
        this.config = new ConfiguracaoSplitPayment();

        // Inicializar simulador
        this.simulador = new SimuladorFluxoCaixa(this.config);

        // Configurar navegação de abas
        window.aoMudarAba = this.aoMudarAba.bind(this);

        // Aplicar a nova formatação monetária para os campos específicos
        if (window.FormatacaoHelper) {
            window.FormatacaoHelper.inicializarFormatacaoMonetaria();
        } else {
            console.error('FormatacaoHelper não encontrado!');
        }

        // Configurar event listeners
        this.configurarEventListeners();

        // Atualizar interface
        this.carregarValoresInterface();

        // Inicializar propriedade _ultimosResultados
        this._ultimosResultados = null;

        // Inicializar módulo de configurações setoriais quando necessário
        this.configurarModuloConfiguracoesSetoriais();

        // Inicializar aba de estratégias de mitigação
        this.inicializarAbaEstrategias();

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
    
    // Inicializa a aba de estratégias de mitigação
    inicializarAbaEstrategias: function() {
        console.log('Inicializando aba de estratégias de mitigação');

        // Assegurar que os painéis de parâmetros estejam inicialmente ocultos
        document.querySelectorAll('.strategy-params').forEach(panel => {
            panel.style.display = 'none';
        });

        // Configurar checkboxes para mostrar/ocultar painéis
        document.querySelectorAll('input[name="estrategias"]').forEach(checkbox => {
            // Verificar estado inicial
            if (checkbox.checked) {
                const panelId = `params-${checkbox.value}`;
                const panel = document.getElementById(panelId);
                if (panel) panel.style.display = 'block';
            }
        });

        // Assegurar que os botões de ação estejam visíveis
        const botoesContainer = document.querySelector('#estrategias-mitigacao .buttons-container');
        if (botoesContainer) {
            botoesContainer.style.display = 'flex';
            console.log('Container de botões configurado:', botoesContainer);
        }
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
        console.log(`Aba alterada para: ${tabId}`);

        switch (tabId) {
            case 'memoria-calculo':
                this.atualizarMemoriaCalculo();
                break;
            case 'configuracoes-setoriais':
                // Garantir que o módulo seja inicializado
                if (SimuladorApp.ConfiguracoesSetoriais) {
                    SimuladorApp.ConfiguracoesSetoriais.inicializar();
                    console.log('Módulo de configurações setoriais inicializado');
                } else {
                    console.error('Módulo de configurações setoriais não encontrado');
                }
                break;
            case 'estrategias-mitigacao':
                // Código existente...
                break;
        }
    },
    
    // Inicializa formatação de inputs
    inicializarFormatacao: function() {
        // Formatar inputs monetários
        //document.querySelectorAll('.money-input').forEach(input => {
            // Manipulador para formatação monetária
            //input.addEventListener('input', function(e) {
                // Permite apenas números e uma vírgula
                //this.value = this.value.replace(/[^\d,]/g, '');
                
                // Garante apenas uma vírgula
                //const partes = this.value.split(',');
                //if (partes.length > 2) {
                    //this.value = partes[0] + ',' + partes.slice(1).join('');
                }
                
                // Limita a 2 casas decimais
                //if (partes.length === 2 && partes[1].length > 2) {
                    //this.value = partes[0] + ',' + partes[1].substring(0, 2);
                //}
            //});
            
            // Formatação ao perder foco
            //input.addEventListener('blur', function() {
                //if (this.value) {
                    //let valor = this.value.replace(/\./g, '').replace(',', '.');
                    //valor = parseFloat(valor) || 0;
                    //this.value = SimuladorApp.config.formatarMoeda(valor);
                //} else {
                    //this.value = SimuladorApp.config.formatarMoeda(0);
                //}
            //});
            
            // Formatar valor inicial
            //if (input.value) {
                //input.dispatchEvent(new Event('blur'));
            //}
        //});
        
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
        
        // Botão Simular Estratégias
        const btnSimularEstrategias = document.getElementById('btn-simular-estrategias');
        if (btnSimularEstrategias) {
            // Remover event listeners existentes (evitar duplicação)
            const novoBtn = btnSimularEstrategias.cloneNode(true);
            if (btnSimularEstrategias.parentNode) {
                btnSimularEstrategias.parentNode.replaceChild(novoBtn, btnSimularEstrategias);
            }

            // Adicionar novo event listener
            novoBtn.addEventListener('click', () => {
                this.realizarSimulacaoEstrategias();
            });
        }

        // Configurar checkboxes para mostrar/ocultar painéis de estratégias
        document.querySelectorAll('input[name="estrategias"]').forEach(checkbox => {
            // Remover eventos existentes para evitar duplicação
            const novoCheckbox = checkbox.cloneNode(true);
            checkbox.parentNode.replaceChild(novoCheckbox, checkbox);

            // Adicionar novo event listener
            novoCheckbox.addEventListener('change', function() {
                const estrategia = this.value;
                const panelId = `params-${estrategia}`;
                const panel = document.getElementById(panelId);

                if (panel) {
                    panel.style.display = this.checked ? 'block' : 'none';
                }
            });

            // Verificar estado inicial
            if (novoCheckbox.checked) {
                const panelId = `params-${novoCheckbox.value}`;
                const panel = document.getElementById(panelId);
                if (panel) panel.style.display = 'block';
            }
        });
        
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
        
        // Formatação específica para campos monetários após a configuração de todos os eventos
        if (window.FormatacaoHelper) {
            window.FormatacaoHelper.formatarCamposMonetariosEspecificos(
                ['faturamento', 'creditos'], 
                this.config
            );
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
    
    // No arquivo app.js, substituir a função realizarSimulacao pelo código abaixo:
    realizarSimulacao: function() {
        // Verificar se o simulador foi inicializado
        if (!this.simulador) {
            console.error('Simulador não inicializado');
            alert('O simulador ainda não foi inicializado. Tente novamente em alguns instantes.');
            return;
        }

        try {
            // Coletar dados do formulário com tratamento de erros
            const dados = this.coletarDadosFormulario();
            console.log('Dados coletados:', dados);

            // Validar dados
            if (!this.validarDados(dados)) {
                console.error('Validação de dados falhou');
                alert('Por favor, preencha todos os campos obrigatórios corretamente.');
                return;
            }

            // Configurar opções de simulação
            const opcoesSimulacao = {
                anoInicial: parseInt(dados.dataInicial?.split('-')[0] || '2026', 10),
                anoFinal: parseInt(dados.dataFinal?.split('-')[0] || '2033', 10),
                cenario: dados.cenario || 'moderado',
                taxaCrescimento: dados.cenario === 'personalizado' ? 
                    parseFloat(dados.taxaCrescimento) / 100 : null,
                simularEstrategias: false
            };

            console.log('Iniciando simulação com opções:', opcoesSimulacao);

            // Executar simulação com captura de exceções específicas
            try {
                const resultados = this.simulador.simular(dados, opcoesSimulacao);
                console.log('Simulação concluída com sucesso:', resultados);

                // Armazenar resultados para uso em outras partes do sistema
                this._ultimosResultados = resultados;

                // Exibir resultados
                this.exibirResultados(resultados);

                // Atualizar explicitamente a memória de cálculo
                this.atualizarMemoriaCalculo();

                return resultados;
            } catch (error) {
                console.error('Erro específico na simulação:', error);
                console.error('Stack trace:', error.stack);
                alert('Ocorreu um erro específico ao executar a simulação. Verifique o console para mais detalhes.');
            }
        } catch (error) {
            console.error('Erro geral na simulação:', error);
            console.error('Stack trace:', error.stack);
            alert('Ocorreu um erro geral ao preparar a simulação. Verifique o console para mais detalhes.');
        }
    },
    
    // Realiza simulação de estratégias de mitigação
    realizarSimulacaoEstrategias: function() {
        // Verificar se já houve uma simulação base
        if (!this._ultimosResultados) {
            alert('É necessário realizar uma simulação básica antes de simular estratégias de mitigação.');
            return;
        }

        try {
            // Coletar dados sobre estratégias de mitigação
            const estrategias = this.coletarDadosEstrategias();

            // Coletar dados do formulário principal
            const dados = this.coletarDadosFormulario();

            // Configurar opções de simulação
            const opcoesSimulacao = {
                anoInicial: parseInt(dados.dataInicial?.split('-')[0] || '2026', 10),
                simularEstrategias: true,
                estrategias: estrategias
            };

            // Executar simulação
            const resultados = this.simulador.simular(dados, opcoesSimulacao);

            // Armazenar resultados para uso em outras partes do sistema
            this._ultimosResultadosEstrategias = resultados;

            // Exibir resultados
            this.exibirResultadosEstrategias(resultados);

            return resultados;
        } catch (error) {
            console.error('Erro na simulação de estratégias:', error);
            alert('Ocorreu um erro ao executar a simulação de estratégias de mitigação.');
        }
    },

    // Coleta dados sobre estratégias de mitigação
    coletarDadosEstrategias: function() {
        const estrategias = {};

        // Verificar quais estratégias estão selecionadas
        const checkbox_ajustePrecos = document.getElementById('ajuste-precos');
        const checkbox_renegociacaoPrazos = document.getElementById('renegociacao-prazos');
        const checkbox_antecipacaoRecebiveis = document.getElementById('antecipacao-recebiveis');
        const checkbox_capitalGiro = document.getElementById('capital-giro');

        // Estratégia: Ajuste de Preços
        if (checkbox_ajustePrecos && checkbox_ajustePrecos.checked) {
            estrategias.ajustePrecos = {
                ativar: true,
                percentualAumento: parseFloat(document.getElementById('perc-aumento').value) / 100 || 0.05,
                elasticidade: parseFloat(document.getElementById('elasticidade').value) || -1.2,
                periodoAjuste: parseInt(document.getElementById('periodo-ajuste').value) || 3
            };
        }

        // Estratégia: Renegociação de Prazos
        if (checkbox_renegociacaoPrazos && checkbox_renegociacaoPrazos.checked) {
            estrategias.renegociacaoPrazos = {
                ativar: true,
                aumentoPrazo: parseInt(document.getElementById('aumento-prazo').value) || 15,
                percentualFornecedores: parseFloat(document.getElementById('perc-fornecedores').value) || 60,
                custoContrapartida: parseFloat(document.getElementById('custo-contrapartida').value) || 0
            };
        }

        // Estratégia: Antecipação de Recebíveis
        if (checkbox_antecipacaoRecebiveis && checkbox_antecipacaoRecebiveis.checked) {
            estrategias.antecipacaoRecebiveis = {
                ativar: true,
                percentualAntecipacao: parseFloat(document.getElementById('perc-antecipacao').value) || 50,
                taxaDesconto: parseFloat(document.getElementById('taxa-desconto').value) || 1.8,
                prazoAntecipacao: parseInt(document.getElementById('prazo-antecipacao').value) || 25
            };
        }

        // Estratégia: Captação de Capital de Giro
        if (checkbox_capitalGiro && checkbox_capitalGiro.checked) {
            estrategias.capitalGiro = {
                ativar: true,
                valorCaptacao: parseFloat(document.getElementById('valor-captacao').value) || 100,
                taxaJuros: parseFloat(document.getElementById('taxa-juros').value) || 2.1,
                prazoPagamento: parseInt(document.getElementById('prazo-pagamento').value) || 12,
                carencia: parseInt(document.getElementById('carencia').value) || 3
            };
        }

        return estrategias;
    },

    // Exibe os resultados da simulação de estratégias
    exibirResultadosEstrategias: function(resultados) {
        const containerResultados = document.getElementById('resultados-estrategias');
        if (!containerResultados) return;

        // Tornar visível o container de resultados
        containerResultados.style.display = 'block';

        // Extrair dados relevantes
        const estrategiasMitigacao = resultados.estrategiasMitigacao;
        if (!estrategiasMitigacao) {
            containerResultados.innerHTML = '<p>Não foi possível calcular o impacto das estratégias de mitigação.</p>';
            return;
        }

        // Preencher a tabela de resumo
        const tabelaResumoCorpo = document.getElementById('tabela-resumo-corpo');
        if (tabelaResumoCorpo) {
            tabelaResumoCorpo.innerHTML = '';

            // Adicionar uma linha para cada estratégia
            Object.entries(estrategiasMitigacao.resultadosEstrategias).forEach(([estrategia, resultado]) => {
                const tr = document.createElement('tr');

                // Estratégia
                const tdEstrategia = document.createElement('td');
                tdEstrategia.style.padding = '10px';
                tdEstrategia.style.textAlign = 'left';
                tdEstrategia.style.border = '1px solid #ddd';
                tdEstrategia.textContent = this.simulador._traduzirNomeEstrategia(estrategia);

                // Impacto no Caixa
                const tdImpacto = document.createElement('td');
                tdImpacto.style.padding = '10px';
                tdImpacto.style.textAlign = 'right';
                tdImpacto.style.border = '1px solid #ddd';
                tdImpacto.textContent = this.config.formatarMoeda(resultado.diferencaImpacto);

                // Custo de Implementação
                const tdCusto = document.createElement('td');
                tdCusto.style.padding = '10px';
                tdCusto.style.textAlign = 'right';
                tdCusto.style.border = '1px solid #ddd';
                tdCusto.textContent = this.config.formatarMoeda(resultado.custoImplementacao);

                // ROI
                const tdRoi = document.createElement('td');
                tdRoi.style.padding = '10px';
                tdRoi.style.textAlign = 'right';
                tdRoi.style.border = '1px solid #ddd';
                tdRoi.textContent = resultado.retornoInvestimento === Infinity ? 
                    'N/A' : resultado.retornoInvestimento.toFixed(2);

                // Viabilidade
                const tdViabilidade = document.createElement('td');
                tdViabilidade.style.padding = '10px';
                tdViabilidade.style.textAlign = 'center';
                tdViabilidade.style.border = '1px solid #ddd';

                // Determinar viabilidade
                const viabilidade = 
                    resultado.eficaciaPercentual > 50 ? 'Alta' :
                    resultado.eficaciaPercentual > 20 ? 'Média' :
                    'Baixa';

                // Adicionar cor conforme viabilidade
                tdViabilidade.style.backgroundColor = 
                    viabilidade === 'Alta' ? '#d4edda' :
                    viabilidade === 'Média' ? '#fff3cd' :
                    '#f8d7da';

                tdViabilidade.textContent = viabilidade;

                // Adicionar células à linha
                tr.appendChild(tdEstrategia);
                tr.appendChild(tdImpacto);
                tr.appendChild(tdCusto);
                tr.appendChild(tdRoi);
                tr.appendChild(tdViabilidade);

                // Adicionar linha à tabela
                tabelaResumoCorpo.appendChild(tr);
            });
        }

        // Aqui você pode adicionar código para preencher os gráficos e outras visualizações
        // utilizando os dados de estrategiasMitigacao.rankingEficacia, estrategiasMitigacao.impactoCombinado, etc.

        // Preencher a seção de recomendações
        const conteudoDetalhamento = document.getElementById('conteudo-detalhamento');
        if (conteudoDetalhamento) {
            let html = '<h3>Recomendações</h3><ul>';

            estrategiasMitigacao.analiseComparativa.recomendacoes.forEach(recomendacao => {
                html += `<li class="recomendacao ${recomendacao.tipo}">
                    ${recomendacao.mensagem}
                </li>`;
            });

            html += '</ul>';

            // Adicionar detalhes de cada estratégia
            html += '<h3>Detalhamento das Estratégias</h3>';

            Object.entries(estrategiasMitigacao.resultadosEstrategias).forEach(([estrategia, resultado]) => {
                html += `
                    <div class="estrategia-detalhe">
                        <h4>${this.simulador._traduzirNomeEstrategia(estrategia)}</h4>
                        <p>Eficácia: ${resultado.eficaciaPercentual.toFixed(2)}%</p>
                        <p>Custo anual: ${this.config.formatarMoeda(resultado.custoImplementacao)}</p>
                        <p>Impacto no capital de giro: ${this.config.formatarMoeda(resultado.diferencaImpacto)}</p>
                    </div>
                `;
            });

            conteudoDetalhamento.innerHTML = html;
        }
    },

    // Método para obter os últimos resultados da simulação de estratégias
    obterUltimosResultadosEstrategias: function() {
        return this._ultimosResultadosEstrategias;
    },
    
    // Método para obter os últimos resultados da simulação
    obterUltimosResultados: function() {
        return this._ultimosResultados;
    },
    
    // Coleta dados do formulário
    // No método coletarDadosFormulario do SimuladorApp
    coletarDadosFormulario: function() {
        // Dados básicos da empresa
        const faturamentoEl = document.getElementById('faturamento');
        const faturamento = FormatacaoHelper.extrairValorNumerico(faturamentoEl.value);

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
        const creditos = FormatacaoHelper.extrairValorNumerico(creditosEl.value);

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
        
        // Log para depuração
        console.log('Exibindo resultados:', resultados);
        
        // Formatar valores para exibição
        const formatarValor = val => this.config.formatarMoeda(val || 0);
        const formatarPercent = val => this.config.formatarPercentual(val || 0);
        
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

// Configuração específica e direta para os campos monetários
setTimeout(() => {
    const campoFaturamento = document.getElementById('faturamento');
    const campoCreditos = document.getElementById('creditos');
    
    if (window.FormatacaoHelper && campoFaturamento) {
        console.log('Aplicando formatação monetária ao campo Faturamento');
        window.FormatacaoHelper.formatarInputMonetario(campoFaturamento, this.config);
    }
    
    if (window.FormatacaoHelper && campoCreditos) {
        console.log('Aplicando formatação monetária ao campo Créditos');
        window.FormatacaoHelper.formatarInputMonetario(campoCreditos, this.config);
    }
}, 500); // Atraso para garantir que os elementos já estão no DOM

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando simulador...');
    SimuladorApp.inicializar();
});