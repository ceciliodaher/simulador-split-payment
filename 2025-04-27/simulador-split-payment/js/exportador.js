// config.js
class ConfiguracaoSplitPayment {
    constructor() {
        // Parâmetros base de alíquotas
        this.aliquotas_base = {
            "CBS": 0.088,  // 8,8%
            "IBS": 0.177   // 17,7%
        };

        // Cronograma de implementação
        this.fase_transicao = {
            2026: 0.10,  // 10% de implementação
            2027: 0.25,
            2028: 0.40,
            2029: 0.55,
            2030: 0.70,
            2031: 0.85,
            2032: 0.95,
            2033: 1.00
        };

        // Configurações setoriais (será carregado de setores.json)
        this.setores_especiais = {};

        // Configurações para análise de fluxo de caixa
        this.parametros_fluxo_caixa = {
            "prazo_pagamento_imposto_atual": 25,  // Dias após o mês
            "prazo_medio_recebimento_padrao": 30  // PMR em dias
        };
        
        // Parâmetros financeiros
        this.parametros_financeiros = {
            "taxa_antecipacao": 0.018,  // 1,8% a.m.
            "taxa_capital_giro": 0.021,  // 2,1% a.m.
            "spread_bancario": 0.035     // 3,5 p.p.
        };
    }

    // Obter alíquota efetiva para um setor específico
    getAliquotaEfetiva(setor) {
        if (this.setores_especiais[setor]) {
            return this.setores_especiais[setor].aliquota;
        }
        return this.aliquotas_base.CBS + this.aliquotas_base.IBS;
    }

    // Obter cronograma de implementação específico para um setor
    getCronogramaSetor(setor, ano) {
        if (this.setores_especiais[setor] && 
            this.setores_especiais[setor].cronograma_proprio && 
            this.setores_especiais[setor].cronograma[ano]) {
            return this.setores_especiais[setor].cronograma[ano];
        }
        return this.fase_transicao[ano] || 0;
    }
}

// simulador.js
class SimuladorFluxoCaixa {
    constructor(configuracao) {
        this.config = configuracao;
        this.memoria_calculo = {};
    }

    // Cálculo do fluxo de caixa no modelo atual
    calcularFluxoCaixaAtual(dados) {
        // Extração de dados
        const faturamento = dados.faturamento;
        const aliquota = dados.aliquota;
        const pmr = dados.pmr;
        const vendas_vista = faturamento * dados.percVista;
        const vendas_prazo = faturamento * dados.percPrazo;
        
        // Cálculo de impostos
        const impostos_total = faturamento * aliquota;
        
        // Prazo efetivo de pagamento de impostos (mês seguinte + dias)
        const prazo_pagamento = this.config.parametros_fluxo_caixa.prazo_pagamento_imposto_atual;
        const prazo_efetivo = 30 + prazo_pagamento;
        
        // Cálculo do capital de giro utilizado para impostos
        const capital_giro_impostos = (impostos_total / 30) * prazo_efetivo;
        
        // Cálculo do capital de giro necessário para vendas a prazo
        const capital_giro_vendas = (vendas_prazo / 30) * pmr;
        
        // Cálculo do fluxo líquido de caixa atual
        const fluxo_liquido = capital_giro_vendas - capital_giro_impostos;
        
        // Registrar na memória de cálculo
        this.memoria_calculo.fluxo_atual = {
            faturamento,
            aliquota,
            pmr,
            vendas_vista,
            vendas_prazo,
            impostos_total,
            prazo_efetivo,
            capital_giro_impostos,
            capital_giro_vendas,
            fluxo_liquido
        };
        
        return {
            impostos: impostos_total,
            capital_giro: fluxo_liquido,
            prazo_efetivo: prazo_efetivo
        };
    }

    // Cálculo do fluxo de caixa com split payment
    calcularFluxoCaixaSplitPayment(dados) {
        // Extração de dados
        const faturamento = dados.faturamento;
        const aliquota = dados.aliquota;
        const pmr = dados.pmr;
        const vendas_vista = faturamento * dados.percVista;
        const vendas_prazo = faturamento * dados.percPrazo;
        const setor = dados.setor;
        
        // Ano inicial da simulação
        const ano_inicial = parseInt(dados.dataInicial.substring(0, 4));
        
        // Percentual de implementação do split payment
        const percentual_implementacao = this.config.getCronogramaSetor(setor, ano_inicial);
        
        // Cálculo de impostos
        const impostos_total = faturamento * aliquota;
        const impostos_split = impostos_total * percentual_implementacao;
        const impostos_convencionais = impostos_total - impostos_split;
        
        // Prazo efetivo de pagamento de impostos (mês seguinte + dias)
        const prazo_pagamento = this.config.parametros_fluxo_caixa.prazo_pagamento_imposto_atual;
        const prazo_efetivo = 30 + prazo_pagamento;
        
        // Cálculo do capital de giro para impostos convencionais
        const capital_giro_impostos_conv = (impostos_convencionais / 30) * prazo_efetivo;
        
        // Impostos retidos nas vendas a prazo via split payment
        const impostos_split_prazo = vendas_prazo * aliquota * percentual_implementacao;
        
        // Recebimentos líquidos após split payment
        const recebimentos_liquidos = vendas_prazo - impostos_split_prazo;
        
        // Cálculo do capital de giro necessário para vendas a prazo
        const capital_giro_vendas = (recebimentos_liquidos / 30) * pmr;
        
        // Cálculo do fluxo líquido de caixa com split payment
        const fluxo_liquido = capital_giro_vendas - capital_giro_impostos_conv;
        
        // Registrar na memória de cálculo
        this.memoria_calculo.fluxo_split = {
            faturamento,
            aliquota,
            pmr,
            vendas_vista,
            vendas_prazo,
            impostos_total,
            percentual_implementacao,
            impostos_split,
            impostos_convencionais,
            prazo_efetivo,
            capital_giro_impostos_conv,
            impostos_split_prazo,
            recebimentos_liquidos,
            capital_giro_vendas,
            fluxo_liquido
        };
        
        return {
            percentual_implementacao: percentual_implementacao,
            impostos_split: impostos_split,
            impostos_convencionais: impostos_convencionais,
            capital_giro: fluxo_liquido
        };
    }

    // Cálculo do impacto no capital de giro
    calcularImpactoCapitalGiro(dados) {
        // Se ainda não calculados, calcular os fluxos
        if (!this.memoria_calculo.fluxo_atual) {
            this.calcularFluxoCaixaAtual(dados);
        }
        if (!this.memoria_calculo.fluxo_split) {
            this.calcularFluxoCaixaSplitPayment(dados);
        }
        
        // Extração dos valores dos fluxos
        const capital_giro_atual = this.memoria_calculo.fluxo_atual.fluxo_liquido;
        const capital_giro_split = this.memoria_calculo.fluxo_split.fluxo_liquido;
        
        // Cálculo do impacto
        const impacto_valor = capital_giro_atual - capital_giro_split;
        const impacto_percentual = (impacto_valor / capital_giro_atual) * 100;
        
        // Registrar na memória de cálculo
        this.memoria_calculo.impacto = {
            capital_giro_atual,
            capital_giro_split,
            impacto_valor,
            impacto_percentual
        };
        
        return {
            capitalGiroAtual: capital_giro_atual,
            capitalGiroSplit: capital_giro_split,
            impactoValor: impacto_valor,
            impactoPercentual: impacto_percentual
        };
    }

    // Simulação ao longo do período de transição
    simularPeriodoTransicao(dados, anoInicial, anoFinal) {
        const resultados = {};
        
        for (let ano = anoInicial; ano <= anoFinal; ano++) {
            // Clonar dados para não afetar os originais
            const dadosAno = {...dados};
            dadosAno.dataInicial = `${ano}-01-01`;
            
            // Ajustar faturamento conforme cenário de crescimento
            if (ano > anoInicial) {
                let taxaCrescimento = 0;
                switch (dados.cenario) {
                    case 'conservador':
                        taxaCrescimento = 0.02; // 2% a.a.
                        break;
                    case 'moderado':
                        taxaCrescimento = 0.05; // 5% a.a.
                        break;
                    case 'otimista':
                        taxaCrescimento = 0.08; // 8% a.a.
                        break;
                    case 'personalizado':
                        taxaCrescimento = dados.taxaCrescimento;
                        break;
                }
                
                // Aplicar crescimento composto
                const anosDecorridos = ano - anoInicial;
                dadosAno.faturamento = dados.faturamento * Math.pow(1 + taxaCrescimento, anosDecorridos);
            }
            
            // Calcular impacto para o ano
            const fluxoAtual = this.calcularFluxoCaixaAtual(dadosAno);
            const fluxoSplit = this.calcularFluxoCaixaSplitPayment(dadosAno);
            const impacto = this.calcularImpactoCapitalGiro(dadosAno);
            
            // Armazenar resultados
            resultados[ano] = {
                percentual_implementacao: this.config.getCronogramaSetor(dados.setor, ano),
                fluxoAtual,
                fluxoSplit,
                impacto
            };
        }
        
        return resultados;
    }
    
    // Atualizar e limpar a memória de cálculo
    atualizarMemoriaCalculo() {
        // Já implementado através dos métodos anteriores
        return this.memoria_calculo;
    }
}

// analisador.js
class AnalisadorImpacto {
    constructor(simulador) {
        this.simulador = simulador;
    }

    // Análise de sensibilidade para diferentes alíquotas
    analiseSensibilidadeAliquotas(dados, variacoes) {
        const resultados = {};
        const aliquotaBase = dados.aliquota;
        
        for (const variacao of variacoes) {
            // Ajustar alíquota conforme variação
            const dadosVariacao = {...dados};
            dadosVariacao.aliquota = aliquotaBase * (1 + variacao);
            
            // Calcular impacto com a nova alíquota
            const impacto = this.simulador.calcularImpactoCapitalGiro(dadosVariacao);
            
            // Armazenar resultados
            resultados[`${variacao >= 0 ? '+' : ''}${variacao * 100}%`] = impacto;
        }
        
        return resultados;
    }

    // Análise de sensibilidade para diferentes prazos médios de recebimento
    analiseSensibilidadePrazos(dados, variacoes) {
        const resultados = {};
        const pmrBase = dados.pmr;
        
        for (const variacao of variacoes) {
            // Ajustar PMR conforme variação
            const dadosVariacao = {...dados};
            dadosVariacao.pmr = pmrBase + variacao;
            
            // Calcular impacto com o novo PMR
            const impacto = this.simulador.calcularImpactoCapitalGiro(dadosVariacao);
            
            // Armazenar resultados
            resultados[`${variacao >= 0 ? '+' : ''}${variacao} dias`] = impacto;
        }
        
        return resultados;
    }

    // Simulação de diferentes estratégias de mitigação
    simularEstrategiasMitigacao(dados, estrategias) {
        const resultadosEstrategias = {};
        
        // Calcular impacto base sem estratégias
        const impactoBase = this.simulador.calcularImpactoCapitalGiro(dados);
        resultadosEstrategias['base'] = {
            impacto: impactoBase,
            reducao: 0,
            custo: 0,
            roi: 0
        };
        
        // Simular cada estratégia
        for (const estrategia of estrategias) {
            let reducaoImpacto = 0;
            let custoEstrategia = 0;
            
            switch (estrategia.tipo) {
                case 'ajuste-precos':
                    // Implementação do ajuste de preços
                    const percAumento = estrategia.parametros.percAumento / 100;
                    const elasticidade = estrategia.parametros.elasticidade;
                    
                    // Impacto nas vendas devido à elasticidade
                    const impactoVendas = elasticidade * percAumento;
                    
                    // Aumento de faturamento (considerando elasticidade)
                    const dadosAjustados = {...dados};
                    dadosAjustados.faturamento = dados.faturamento * (1 + percAumento) * (1 + impactoVendas);
                    
                    // Calcular novo impacto
                    const impactoAjustado = this.simulador.calcularImpactoCapitalGiro(dadosAjustados);
                    reducaoImpacto = impactoBase.impactoValor - impactoAjustado.impactoValor;
                    
                    // Custo da estratégia (marketing, ajustes de sistemas, etc.)
                    custoEstrategia = dados.faturamento * 0.01; // Estimativa de 1% do faturamento
                    break;
                    
                case 'renegociacao-prazos':
                    // Implementação da renegociação de prazos
                    // Lógica similar às demais estratégias
                    break;
                    
                case 'antecipacao-recebiveis':
                    // Implementação da antecipação de recebíveis
                    // Lógica similar às demais estratégias
                    break;
                    
                // Implementar demais estratégias...
            }
            
            // Calcular ROI da estratégia
            const roi = custoEstrategia > 0 ? (reducaoImpacto / custoEstrategia) * 100 : 0;
            
            // Armazenar resultados
            resultadosEstrategias[estrategia.tipo] = {
                impactoReduzido: impactoBase.impactoValor - reducaoImpacto,
                reducao: reducaoImpacto,
                custo: custoEstrategia,
                roi: roi
            };
        }
        
        return resultadosEstrategias;
    }
}

// visualizador.js
class GeradorGraficos {
    constructor() {
        // Configurações padrão para gráficos
        this.configuracoesGraficos = {
            cores: {
                atual: 'rgba(52, 152, 219, 0.7)',
                split: 'rgba(231, 76, 60, 0.7)',
                impacto: 'rgba(243, 156, 18, 0.7)',
                estrategias: [
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(155, 89, 182, 0.7)',
                    'rgba(52, 73, 94, 0.7)',
                    'rgba(22, 160, 133, 0.7)',
                    'rgba(192, 57, 43, 0.7)'
                ]
            },
            fontes: {
                titulo: {
                    family: "'Segoe UI', sans-serif",
                    size: 16,
                    weight: 'bold'
                },
                eixos: {
                    family: "'Segoe UI', sans-serif",
                    size: 12,
                    weight: 'normal'
                }
            }
        };
    }

    // Gerar gráfico comparativo do impacto no fluxo de caixa
    gerarGraficoImpacto(resultados, elementId) {
        const ctx = document.getElementById(elementId).getContext('2d');
        
        // Preparar dados para o gráfico
        const dados = {
            labels: ['Fluxo de Caixa'],
            datasets: [
                {
                    label: 'Modelo Atual',
                    data: [resultados.impacto.capitalGiroAtual],
                    backgroundColor: this.configuracoesGraficos.cores.atual,
                    borderColor: this.configuracoesGraficos.cores.atual.replace('0.7', '1'),
                    borderWidth: 1
                },
                {
                    label: 'Split Payment',
                    data: [resultados.impacto.capitalGiroSplit],
                    backgroundColor: this.configuracoesGraficos.cores.split,
                    borderColor: this.configuracoesGraficos.cores.split.replace('0.7', '1'),
                    borderWidth: 1
                }
            ]
        };
        
        // Configurações do gráfico
        const config = {
            type: 'bar',
            data: dados,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparativo do Fluxo de Caixa',
                        font: this.configuracoesGraficos.fontes.titulo
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: R$ ${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Capital de Giro (R$)',
                            font: this.configuracoesGraficos.fontes.eixos
                        }
                    }
                }
            }
        };
        
        // Criar o gráfico
        return new Chart(ctx, config);
    }

    // Gerar gráfico de evolução do impacto ao longo do tempo
    gerarGraficoEvolucaoTemporal(resultados, elementId) {
        const ctx = document.getElementById(elementId).getContext('2d');
        
        // Extrair anos e valores de impacto
        const anos = Object.keys(resultados);
        const percentuais = anos.map(ano => resultados[ano].percentual_implementacao * 100);
        const impactos = anos.map(ano => resultados[ano].impacto.impactoPercentual);
        
        // Preparar dados para o gráfico
        const dados = {
            labels: anos,
            datasets: [
                {
                    label: 'Percentual de Implementação (%)',
                    data: percentuais,
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                    yAxisID: 'y'
                },
                {
                    label: 'Impacto no Capital de Giro (%)',
                    data: impactos,
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(231, 76, 60, 1)',
                    yAxisID: 'y1'
                }
            ]
        };
        
        // Configurações do gráfico
        const config = {
            type: 'line',
            data: dados,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução do Impacto do Split Payment',
                        font: this.configuracoesGraficos.fontes.titulo
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Implementação (%)',
                            font: this.configuracoesGraficos.fontes.eixos
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Impacto (%)',
                            font: this.configuracoesGraficos.fontes.eixos
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        };
        
        // Criar o gráfico
        return new Chart(ctx, config);
    }

    // Gerar gráfico comparativo das estratégias
    gerarGraficoEstrategias(resultados, elementId) {
        const ctx = document.getElementById(elementId).getContext('2d');
        
        // Extrair estratégias e valores
        const estrategias = Object.keys(resultados).filter(key => key !== 'base');
        const eficacias = estrategias.map(est => {
            const reducao = resultados[est].reducao;
            const impactoBase = resultados['base'].impacto.impactoValor;
            return (reducao / impactoBase) * 100;
        });
        
        // Preparar dados para o gráfico
        const dados = {
            labels: estrategias.map(est => {
                // Formatar nomes das estratégias
                switch(est) {
                    case 'ajuste-precos': return 'Ajuste de Preços';
                    case 'renegociacao-prazos': return 'Renegociação de Prazos';
                    case 'antecipacao-recebiveis': return 'Antecipação de Recebíveis';
                    case 'capital-giro': return 'Captação de Capital de Giro';
                    case 'mix-produtos': return 'Otimização do Mix';
                    case 'meios-pagamento': return 'Diversificação de Pagamentos';
                    default: return est;
                }
            }),
            datasets: [
                {
                    label: 'Eficácia na Redução do Impacto (%)',
                    data: eficacias,
                    backgroundColor: estrategias.map((_, i) => 
                        this.configuracoesGraficos.cores.estrategias[i % this.configuracoesGraficos.cores.estrategias.length]
                    ),
                    borderColor: estrategias.map((_, i) => 
                        this.configuracoesGraficos.cores.estrategias[i % this.configuracoesGraficos.cores.estrategias.length].replace('0.7', '1')
                    ),
                    borderWidth: 1
                }
            ]
        };
        
        // Configurações do gráfico
        const config = {
            type: 'bar',
            data: dados,
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Eficácia das Estratégias de Mitigação',
                        font: this.configuracoesGraficos.fontes.titulo
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Redução do Impacto (%)',
                            font: this.configuracoesGraficos.fontes.eixos
                        }
                    }
                }
            }
        };
        
        // Criar o gráfico
        return new Chart(ctx, config);
    }
}

// exportador.js
class ExportadorRelatorios {
    constructor() {
        // Configurações de exportação
        this.opcoes = {
            pdf: {
                margem: 20,
                fonte: {
                    normal: 'Helvetica',
                    negrito: 'Helvetica-Bold'
                },
                tamanho: {
                    titulo: 16,
                    subtitulo: 14,
                    texto: 10
                }
            },
            excel: {
                estilos: {
                    cabecalho: {
                        font: { bold: true },
                        fill: { fgColor: { rgb: 'E0E0E0' } }
                    },
                    dados: {
                        numFmt: '#,##0.00'
                    }
                }
            }
        };
    }

    // Exportar para PDF
    exportarPDF(dados) {
        // Criar PDF usando jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Adicionar título
        doc.setFont(this.opcoes.pdf.fonte.negrito);
        doc.setFontSize(this.opcoes.pdf.tamanho.titulo);
        doc.text('Relatório de Impacto do Split Payment', this.opcoes.pdf.margem, this.opcoes.pdf.margem);
        
        // Adicionar data
        doc.setFont(this.opcoes.pdf.fonte.normal);
        doc.setFontSize(this.opcoes.pdf.tamanho.texto);
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        doc.text(`Data: ${dataAtual}`, this.opcoes.pdf.margem, this.opcoes.pdf.margem + 10);
        
        // Adicionar parâmetros da simulação
        doc.setFontSize(this.opcoes.pdf.tamanho.subtitulo);
        doc.text('Parâmetros da Simulação', this.opcoes.pdf.margem, this.opcoes.pdf.margem + 25);
        
        doc.setFontSize(this.opcoes.pdf.tamanho.texto);
        let y = this.opcoes.pdf.margem + 35;
        Object.entries(dados.parametros).forEach(([chave, valor]) => {
            doc.text(`${chave}: ${valor}`, this.opcoes.pdf.margem, y);
            y += 7;
        });
        
        // Adicionar resultados
        doc.setFontSize(this.opcoes.pdf.tamanho.subtitulo);
        doc.text('Resultados da Simulação', this.opcoes.pdf.margem, y + 10);
        
        doc.setFontSize(this.opcoes.pdf.tamanho.texto);
        y += 20;
        Object.entries(dados.resultados).forEach(([chave, valor]) => {
            doc.text(`${chave}: ${valor}`, this.opcoes.pdf.margem, y);
            y += 7;
        });
        
        // Adicionar rodapé
        const totalPaginas = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPaginas; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text('© 2025 Expertzy Inteligência Tributária', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }
        
        // Salvar o PDF
        doc.save('Relatorio_Split_Payment.pdf');
        
        return true;
    }

    // Exportar para Excel
    exportarExcel(dados) {
        // Criar workbook usando SheetJS
        const wb = XLSX.utils.book_new();
        
        // Criar planilha de parâmetros
        const wsParams = XLSX.utils.json_to_sheet(this.formatarDadosParaExcel(dados.parametros));
        XLSX.utils.book_append_sheet(wb, wsParams, 'Parâmetros');
        
        // Criar planilha de resultados
        const wsResults = XLSX.utils.json_to_sheet(this.formatarDadosParaExcel(dados.resultados));
        XLSX.utils.book_append_sheet(wb, wsResults, 'Resultados');
        
        // Aplicar estilos (básico, pois SheetJS tem suporte limitado a estilos)
        
        // Exportar o arquivo
        XLSX.writeFile(wb, 'Relatorio_Split_Payment.xlsx');
        
        return true;
    }

    // Auxiliar para formatar dados para Excel
    formatarDadosParaExcel(obj) {
        return Object.entries(obj).map(([chave, valor]) => ({ 
            Parâmetro: chave,
            Valor: valor
        }));
    }
}