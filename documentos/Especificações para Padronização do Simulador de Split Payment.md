# Relatório Técnico: Especificações para Padronização do Simulador de Split Payment

## 1. Introdução

Este documento técnico apresenta as especificações detalhadas para a padronização da interface do usuário e da funcionalidade do Simulador de Impacto do Split Payment no Fluxo de Caixa. As modificações visam alinhar o arquivo principal (index.html) com o padrão de formatação e funcionalidades presentes no modelo de referência (index-v13.html), garantindo uma experiência consistente e aprimorada para o usuário.

## 2. Especificações para Formatação Monetária e Percentual

### 2.1 Formatação Monetária

#### Estrutura HTML

```html
<div class="form-group">
    <label for="faturamento">Faturamento:</label>
    <div class="input-group money-input-container">
        <span class="money-prefix">R$</span>
        <input type="text" id="faturamento" name="faturamento" class="money-input" value="">
    </div>
</div>
```

#### Estilos CSS a serem adicionados

```css
.money-input-container {
    position: relative;
}

.money-input {
    padding-left: 30px !important;
    text-align: right !important;
    font-family: 'Consolas', monospace;
}

.money-prefix {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    pointer-events: none;
}
```

#### Funções JavaScript para Formatação Monetária

```javascript
function formatarMoeda(valor) {
    if (valor === undefined || valor === null || isNaN(valor)) {
        return 'R$ 0,00';
    }

    return 'R$ ' + valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function converterMoedaParaNumero(valorFormatado) {
    if (!valorFormatado) return 0;

    let valor = valorFormatado.replace(/R\$\s?/g, '').replace(/\s/g, '');
    valor = valor.replace(/\./g, '').replace(',', '.');

    return parseFloat(valor) || 0;
}
```

#### Configuração de Eventos para Campos Monetários

```javascript
function configurarCampoMonetario(idCampo) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;

    campo.type = 'text';
    campo.classList.add('money-input');

    // Adicionar container e prefixo se necessário
    if (!campo.parentElement.classList.contains('money-input-container')) {
        const container = document.createElement('div');
        container.classList.add('money-input-container');

        const prefix = document.createElement('span');
        prefix.classList.add('money-prefix');
        prefix.textContent = 'R$';

        campo.parentElement.insertBefore(container, campo);
        container.appendChild(prefix);
        container.appendChild(campo);
    }

    campo.addEventListener('input', function(e) {
        const posicaoCursor = this.selectionStart || 0;
        const valorAntigo = this.value;

        // Remover formatação
        let numeros = valorAntigo.replace(/\D/g, '');

        // Limitar tamanho
        if (numeros.length > 15) {
            numeros = numeros.substring(0, 15);
        }

        // Converter para formato de moeda
        let valorFormatado = '';
        if (numeros.length > 0) {
            const valor = parseFloat(numeros) / 100;
            valorFormatado = formatarMoeda(valor);
        }

        // Atualizar valor se necessário
        if (valorFormatado !== valorAntigo) {
            this.value = valorFormatado;

            // Recuperar posição do cursor
            const novaPosicao = Math.min(
                posicaoCursor + (valorFormatado.length - valorAntigo.length),
                valorFormatado.length
            );

            setTimeout(() => {
                this.setSelectionRange(novaPosicao, novaPosicao);
            }, 0);
        }
    });

    campo.addEventListener('blur', function() {
        if (!this.value) {
            this.value = 'R$ 0,00';
        }
    });

    campo.addEventListener('focus', function() {
        if (this.value === 'R$ 0,00') {
            this.value = '';
        }

        setTimeout(() => {
            this.selectionStart = this.selectionEnd = this.value.length;
        }, 0);
    });
}
```

### 2.2 Formatação Percentual

#### Estrutura HTML

```html
<div class="form-group">
    <label for="margem">Margem Operacional (%):</label>
    <div class="input-group percent-input-container">
        <input type="text" id="margem" name="margem" class="percent-input" value="">
        <div class="input-group-append">
            <span class="input-group-text">%</span>
        </div>
    </div>
</div>
```

#### Estilos CSS a serem adicionados

```css
.percent-input {
    text-align: right !important;
    font-family: 'Consolas', monospace;
}

.percent-input-container .input-group-text {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-left: none;
    color: #6c757d;
}
```

#### Funções JavaScript para Formatação Percentual

```javascript
function formatarPercentual(valor, incluirSimbolo = true) {
    if (valor === undefined || valor === null || isNaN(valor)) {
        return incluirSimbolo ? '0,00%' : '0,00';
    }

    const percentual = (valor * 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return incluirSimbolo ? `${percentual}%` : percentual;
}

function converterPercentualParaNumero(valorFormatado) {
    if (!valorFormatado) return 0;

    let valor = valorFormatado.replace(/%/g, '').replace(/\s/g, '');
    valor = valor.replace(/\./g, '').replace(',', '.');

    return (parseFloat(valor) || 0) / 100;
}
```

#### Configuração de Eventos para Campos Percentuais

```javascript
function configurarCampoPercentual(idCampo) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;

    campo.type = 'text';
    campo.classList.add('percent-input');

    campo.addEventListener('input', function(e) {
        const posicaoCursor = this.selectionStart || 0;
        const valorAntigo = this.value;

        // Manter apenas números e vírgula
        let valor = this.value.replace(/[^\d,]/g, '');

        // Garantir apenas uma vírgula
        const partes = valor.split(',');
        if (partes.length > 2) {
            valor = partes[0] + ',' + partes.slice(1).join('');
        }

        // Limitar casas decimais
        if (partes.length === 2 && partes[1].length > 2) {
            valor = partes[0] + ',' + partes[1].substring(0, 2);
        }

        // Atualizar valor apenas se necessário
        if (valor !== valorAntigo) {
            this.value = valor;

            // Recuperar posição do cursor
            const diferencaTamanho = valor.length - valorAntigo.length;
            const novaPosicao = Math.max(0, Math.min(posicaoCursor + diferencaTamanho, valor.length));

            setTimeout(() => {
                this.setSelectionRange(novaPosicao, novaPosicao);
            }, 0);
        }
    });

    campo.addEventListener('blur', function() {
        if (this.value) {
            let valor;
            if (this.value.includes('%')) {
                valor = converterPercentualParaNumero(this.value);
            } else {
                valor = parseFloat(this.value.replace(',', '.')) / 100 || 0;
            }

            this.value = formatarPercentual(valor, true);
        } else {
            this.value = '0,00%';
        }
    });

    campo.addEventListener('focus', function() {
        let valor;
        if (this.value.includes('%')) {
            valor = converterPercentualParaNumero(this.value) * 100;
        } else {
            valor = parseFloat(this.value.replace(',', '.')) || 0;
        }

        if (valor > 0) {
            this.value = valor.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).replace('.', ',');
        } else {
            this.value = '';
        }

        setTimeout(() => {
            this.selectionStart = this.selectionEnd = this.value.length;
        }, 0);
    });
}
```

## 3. Especificações para o Sistema de Navegação por Abas

### 3.1 Estrutura HTML para Navegação por Abas

```html
<div class="tab-container">
    <div class="tab-buttons">
        <button class="tab-button active" data-tab="simulacao-principal">Simulação Principal</button>
        <button class="tab-button" data-tab="configuracoes-setoriais">Configurações Setoriais</button>
        <button class="tab-button" data-tab="estrategias-mitigacao">Estratégias de Mitigação</button>
        <button class="tab-button" data-tab="memoria-calculo">Memória de Cálculo</button>
        <button class="tab-button" data-tab="ajuda-documentacao">Ajuda e Documentação</button>
    </div>

    <!-- Conteúdo das abas -->
    <div id="simulacao-principal" class="tab-content active">
        <!-- Conteúdo da aba -->
    </div>
    <div id="configuracoes-setoriais" class="tab-content">
        <!-- Conteúdo da aba -->
    </div>
    <!-- Demais abas -->
</div>
```

### 3.2 Estilos CSS para o Sistema de Abas

```css
.tab-container {
    width: 100%;
    margin-bottom: 20px;
}

.tab-buttons {
    display: flex;
    border-bottom: 1px solid var(--light-border);
}

.tab-button {
    padding: 12px 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    color: var(--gray-text);
    transition: all 0.3s ease;
    border-bottom: 3px solid transparent;
}

.tab-button:hover {
    color: var(--primary-color);
    background-color: rgba(52, 152, 219, 0.05);
}

.tab-button.active {
    color: var(--primary-color);
    border-bottom: 3px solid var(--primary-color);
    background-color: white;
}

.tab-content {
    display: none;
    opacity: 0;
    animation: fadeIn 0.5s ease;
}

.tab-content.active {
    display: block;
    opacity: 1;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

### 3.3 JavaScript para o Sistema de Navegação por Abas

```javascript
function inicializarNavegacao() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todas as abas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Adicionar classe active à aba clicada
            this.classList.add('active');

            // Mostrar conteúdo correspondente
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
            }

            // Executar ações específicas para abas
            aoMudarAba(tabId);
        });
    });

    // Configurar navegação para subabas
    const subtabButtons = document.querySelectorAll('.subtab-button');
    const subtabContents = document.querySelectorAll('.subtab-content');

    subtabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Encontrar o container pai
            const parentTab = this.closest('.tab-content');
            if (!parentTab) return;

            // Remover classe active das subabas neste container
            const relatedButtons = parentTab.querySelectorAll('.subtab-button');
            const relatedContents = parentTab.querySelectorAll('.subtab-content');

            relatedButtons.forEach(btn => btn.classList.remove('active'));
            relatedContents.forEach(content => content.classList.remove('active'));

            // Adicionar classe active à subaba clicada
            this.classList.add('active');

            // Mostrar conteúdo correspondente
            const subtabId = this.getAttribute('data-subtab');
            const subtabContent = document.getElementById(subtabId);
            if (subtabContent) {
                subtabContent.classList.add('active');
            }
        });
    });
}

function aoMudarAba(tabId) {
    // Funções específicas para cada aba
    switch (tabId) {
        case 'memoria-calculo':
            atualizarMemoriaCalculo();
            break;
        // Outras ações específicas
    }
}
```

## 4. Especificações para Estilo dos Botões

### 4.1 Estrutura HTML para Botões

```html
<div class="buttons-container">
    <button type="button" class="primary" id="btn-simular">Simular</button>
    <button type="reset" class="secondary" id="btn-limpar">Limpar</button>
</div>
```

### 4.2 Estilos CSS para Botões

```css
.buttons-container {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 30px;
}

button {
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

button.primary {
    background-color: var(--primary-color);
    color: white;
    box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3);
}

button.secondary {
    background-color: var(--light-bg);
    color: var(--dark-text);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button.outline {
    background-color: transparent;
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
}

button.primary:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(52, 152, 219, 0.4);
}

button.secondary:hover {
    background-color: #e2e6ea;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

button.outline:hover {
    background-color: rgba(52, 152, 219, 0.05);
}
```

## 5. Classes JavaScript para Configuração e Simulação

### 5.1 Classe ConfiguracaoSplitPayment

```javascript
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

        // Carregar configurações salvas se existirem
        this.carregarConfiguracoes();
    }

    // Formatação monetária
    formatarMoeda(valor, incluirSimbolo = true) {
        if (valor === undefined || valor === null || isNaN(valor)) {
            return incluirSimbolo ? 'R$ 0,00' : '0,00';
        }

        // Formatação com separador de milhares e casas decimais
        const valorFormatado = valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return incluirSimbolo ? `R$ ${valorFormatado}` : valorFormatado;
    }

    // Formatação percentual
    formatarPercentual(valor, incluirSimbolo = true) {
        if (valor === undefined || valor === null || isNaN(valor)) {
            return incluirSimbolo ? '0,00%' : '0,00';
        }

        // Multiplica por 100 e formata
        const percentual = (valor * 100).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return incluirSimbolo ? `${percentual}%` : percentual;
    }

    // Conversão de moeda formatada para número
    converterMoedaParaNumero(valorFormatado) {
        if (!valorFormatado) return 0;

        // Remove o símbolo da moeda e espaços
        let valor = valorFormatado.replace(/R\$\s?/g, '').replace(/\s/g, '');

        // Substitui separadores
        valor = valor.replace(/\./g, '').replace(',', '.');

        return parseFloat(valor) || 0;
    }

    // Conversão de percentual formatado para decimal
    converterPercentualParaNumero(valorFormatado) {
        if (!valorFormatado) return 0;

        // Remove o símbolo de percentual e espaços
        let valor = valorFormatado.replace(/%/g, '').replace(/\s/g, '');

        // Substitui separadores
        valor = valor.replace(/\./g, '').replace(',', '.');

        // Divide por 100 para obter decimal
        return (parseFloat(valor) || 0) / 100;
    }

    // Obtém a alíquota efetiva para um setor
    obterAliquotaEfetivaSetor(codigoSetor) {
        if (this.setores_especiais[codigoSetor]) {
            return this.setores_especiais[codigoSetor].aliquota_efetiva;
        }
        return this.aliquotas_base.CBS + this.aliquotas_base.IBS;
    }

    // Obtém o percentual de implementação para um ano/setor
    obterPercentualImplementacao(ano, codigoSetor = null) {
        // Verificar cronograma específico do setor
        if (codigoSetor && 
            this.setores_especiais[codigoSetor] && 
            this.setores_especiais[codigoSetor].cronograma_proprio &&
            this.setores_especiais[codigoSetor].cronograma &&
            this.setores_especiais[codigoSetor].cronograma[ano]) {

            return this.setores_especiais[codigoSetor].cronograma[ano];
        }

        // Usar cronograma padrão
        if (this.cronograma_implementacao[ano]) {
            return this.cronograma_implementacao[ano];
        }

        // Fora do período de implementação
        if (ano < 2026) return 0;
        if (ano > 2033) return 1.0;

        return 0;
    }

    // Salva as configurações no localStorage
    salvarConfiguracoes() {
        try {
            localStorage.setItem('splitPaymentConfig', JSON.stringify({
                aliquotas_base: this.aliquotas_base,
                cronograma_implementacao: this.cronograma_implementacao,
                setores_especiais: this.setores_especiais,
                parametros_fluxo_caixa: this.parametros_fluxo_caixa
            }));
            return true;
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            return false;
        }
    }

    // Carrega as configurações do localStorage
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

                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            return false;
        }
    }
}
```

### 5.2 Classe SimuladorFluxoCaixa

```javascript
class SimuladorFluxoCaixa {
    constructor(configuracao) {
        this.config = configuracao;

        // Inicializar memória de cálculo
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
        const dadosNormalizados = { ...dados };

        // Normalizar valores monetários
        if (typeof dadosNormalizados.faturamento === 'string') {
            dadosNormalizados.faturamento = this.config.converterMoedaParaNumero(dadosNormalizados.faturamento);
        }

        // Normalizar percentuais
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

        // Normalizar prazos
        ['pmr', 'pmp', 'pme'].forEach(campo => {
            if (typeof dadosNormalizados[campo] === 'string') {
                dadosNormalizados[campo] = parseInt(dadosNormalizados[campo], 10) || 0;
            }
        });

        // Calcular faturamento mensal se necessário
        if (dadosNormalizados.periodo === 'anual') {
            dadosNormalizados.faturamentoMensal = dadosNormalizados.faturamento / 12;
        } else {
            dadosNormalizados.faturamentoMensal = dadosNormalizados.faturamento;
        }

        // Calcular ciclo financeiro
        if (!dadosNormalizados.cicloFinanceiro) {
            dadosNormalizados.cicloFinanceiro = 
                dadosNormalizados.pmr + 
                dadosNormalizados.pme - 
                dadosNormalizados.pmp;
        }

        // Registrar os dados normalizados
        this.memoriaCalculo.parametrosEntrada = dadosNormalizados;

        return dadosNormalizados;
    }

    // Calcula o fluxo de caixa no regime atual
    calcularFluxoCaixaAtual(dados) {
        const dadosNorm = this._normalizarDados(dados);

        // Extrair parâmetros relevantes
        const {
            faturamentoMensal,
            aliquota,
            pmr,
            percVista,
            percPrazo
        } = dadosNorm;

        // Cálculos básicos
        const vendasVista = faturamentoMensal * percVista;
        const vendasPrazo = faturamentoMensal * percPrazo;
        const valorTributos = faturamentoMensal * aliquota;

        // Prazo de pagamento de impostos
        const prazoPagamentoImpostoAtual = this.config.parametros_fluxo_caixa.prazo_pagamento_imposto_atual;
        const prazoEfetivoPagamentoImposto = 30 + prazoPagamentoImpostoAtual;

        // Capital de giro disponível temporariamente
        const capitalGiroTributario = valorTributos * (prazoEfetivoPagamentoImposto / 30);

        // Fluxo de caixa
        const fluxoCaixaVendasVista = vendasVista;
        const fluxoCaixaVendasPrazo = vendasPrazo * (pmr / 30);

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
            totalRecebimentos: vendasVista + vendasPrazo,
            totalDesembolsos: valorTributos,
            saldoFluxoCaixa: vendasVista + vendasPrazo - valorTributos
        };

        // Registrar resultados
        this.memoriaCalculo.resultadoAtual = resultados;

        return resultados;
    }

    // Calcula o fluxo de caixa com Split Payment
    calcularFluxoCaixaSplitPayment(dados, ano = 2026) {
        const dadosNorm = this._normalizarDados(dados);

        // Extrair parâmetros relevantes
        const {
            faturamentoMensal,
            aliquota,
            pmr,
            percVista,
            percPrazo,
            setor
        } = dadosNorm;

        // Obter percentual de implementação
        const percentualImplementacao = this.config.obterPercentualImplementacao(ano, setor);

        // Cálculos básicos
        const vendasVista = faturamentoMensal * percVista;
        const vendasPrazo = faturamentoMensal * percPrazo;
        const valorTributos = faturamentoMensal * aliquota;

        // Divisão entre Split Payment e método convencional
        const tributosSplit = valorTributos * percentualImplementacao;
        const tributosConvencionais = valorTributos - tributosSplit;

        // Tributos retidos por tipo de venda
        const tributosSplitVendasVista = vendasVista * aliquota * percentualImplementacao;
        const tributosSplitVendasPrazo = vendasPrazo * aliquota * percentualImplementacao;

        // Valores líquidos recebidos
        const recebimentoLiquidoVendasVista = vendasVista - tributosSplitVendasVista;
        const recebimentoLiquidoVendasPrazo = vendasPrazo - tributosSplitVendasPrazo;

        // Prazo para tributos convencionais
        const prazoPagamentoImpostoAtual = this.config.parametros_fluxo_caixa.prazo_pagamento_imposto_atual;
        const prazoEfetivoPagamentoImposto = 30 + prazoPagamentoImpostoAtual;

        // Capital de giro para tributos convencionais
        const capitalGiroTributosConvencionais = tributosConvencionais * (prazoEfetivoPagamentoImposto / 30);

        // Fluxo de caixa ajustado
        const fluxoCaixaVendasVista = recebimentoLiquidoVendasVista;
        const fluxoCaixaVendasPrazo = recebimentoLiquidoVendasPrazo * (pmr / 30);

        // Impacto da antecipação
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
            totalRecebimentosLiquidos: recebimentoLiquidoVendasVista + recebimentoLiquidoVendasPrazo,
            totalDesembolsosTributos: tributosConvencionais,
            saldoFluxoCaixa: recebimentoLiquidoVendasVista + recebimentoLiquidoVendasPrazo - tributosConvencionais
        };

        // Registrar resultados
        this.memoriaCalculo.resultadoSplitPayment = resultados;

        return resultados;
    }

    // Calcula o impacto no capital de giro
    calcularImpactoCapitalGiro(dados, ano = 2026) {
        // Calcular fluxos nos dois cenários
        const resultadoAtual = this.calcularFluxoCaixaAtual(dados);
        const resultadoSplit = this.calcularFluxoCaixaSplitPayment(dados, ano);

        // Extrair dados normalizados
        const dadosNorm = this.memoriaCalculo.parametrosEntrada;

        // Capital de giro no modelo atual
        const capitalGiroAtual = 
            resultadoAtual.vendasPrazo * (dadosNorm.pmr / 30) - 
            resultadoAtual.valorTributos * (resultadoAtual.prazoEfetivoPagamentoImposto / 30);

        // Capital de giro com Split Payment
        const capitalGiroSplit = 
            resultadoSplit.recebimentoLiquidoVendasPrazo * (dadosNorm.pmr / 30) - 
            resultadoSplit.tributosConvencionais * (resultadoSplit.prazoEfetivoPagamentoImposto / 30);

        // Diferença e impacto percentual
        const diferencaCapitalGiro = capitalGiroSplit - capitalGiroAtual;
        const percentualImpacto = capitalGiroAtual !== 0 ? 
            (diferencaCapitalGiro / Math.abs(capitalGiroAtual)) * 100 : 0;

        // Necessidade adicional de capital
        const necessidadeAdicionalCapitalGiro = diferencaCapitalGiro < 0 ? 
            Math.abs(diferencaCapitalGiro) : 0;

        // Custo financeiro anual
        const custoFinanceiroAnual = necessidadeAdicionalCapitalGiro * 
            (this.config.parametros_fluxo_caixa.taxa_capital_giro * 12);

        // Impacto sobre a margem
        const margemOperacionalOriginal = dadosNorm.margem || 0.15;
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

            // Detalhes adicionais
            ano,
            percentualImplementacao: resultadoSplit.percentualImplementacao,
            detalhesFluxoAtual: resultadoAtual,
            detalhesFluxoSplit: resultadoSplit
        };

        // Registrar resultados
        this.memoriaCalculo.impactoGeral = resultados;

        return resultados;
    }

    // Simulação completa
    simular(dados, opcoesSimulacao = {}) {
        // Opções padrão
        const opcoes = {
            anoInicial: 2026,
            anoFinal: 2033,
            cenario: 'moderado',
            taxaCrescimento: null,
            ...opcoesSimulacao
        };

        // Resultados básicos
        const resultadoBase = this.calcularImpactoCapitalGiro(dados, opcoes.anoInicial);

        // Resultados completos
        const resultados = {
            parametrosEntrada: this.memoriaCalculo.parametrosEntrada,
            resultadoBase,
            memoriaCalculo: this.memoriaCalculo
        };

        return resultados;
    }

    // Obter memória de cálculo
    obterMemoriaCalculo() {
        return this.memoriaCalculo;
    }
}
```

### 5.3 Implementação da Classe SimuladorApp

```javascript
const SimuladorApp = {
    // Configuração global do aplicativo
    config: null,

    // Simulador de fluxo de caixa
    simulador: null,

    // Inicializa a aplicação
    inicializar: function() {
        console.log('Inicializando Simulador de Impacto do Split Payment...');

        // Inicializar configuração
        this.config = new ConfiguracaoSplitPayment();

        // Inicializar simulador
        this.simulador = new SimuladorFluxoCaixa(this.config);

        // Configurar navegação de abas
        this.inicializarNavegacao();

        // Configurar event listeners
        this.configurarEventListeners();

        // Carregar valores na interface
        this.carregarValoresInterface();

        console.log('Simulador de Impacto do Split Payment inicializado com sucesso.');
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
        }
    },

    // Configura event listeners
    configurarEventListeners: function() {
        // Botão Simular
        const btnSimular = document.getElementById('btn-simular');
        if (btnSimular) {
            // Limpar event listeners existentes
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
            // Limpar event listeners existentes
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

        // Configurar formatação inicial para inputs
        this.configurarFormatacaoCampos();
    },

    // Configura a formatação dos campos monetários e percentuais
    configurarFormatacaoCampos: function() {
        if (!this.config) return;

        // Formatar campos monetários
        document.querySelectorAll('.money-input').forEach(input => {
            configurarCampoMonetario(input.id);
        });

        // Formatar campos percentuais
        document.querySelectorAll('.percent-input').forEach(input => {
            configurarCampoPercentual(input.id);
        });
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

            // Exibir resultados
            this.exibirResultados(resultados);

            // Atualizar explicitamente a memória de cálculo
            this.atualizarMemoriaCalculo();

            // Tornar os resultados disponíveis para outras partes do sistema
            this._ultimosResultados = resultados;

            return resultados;
        } catch (error) {
            console.error('Erro ao executar a simulação:', error);
            alert('Ocorreu um erro ao executar a simulação. Verifique o console para mais detalhes.');
        }
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
                    <h4>Impacto Inicial (${projecao?.parametros?.anoInicial || impacto.ano})</h4>
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

    // Atualiza a memória de cálculo
    atualizarMemoriaCalculo: function() {
        const memoryContainer = document.getElementById('memory-content');
        if (!memoryContainer || !this.simulador) return;

        // Obter a memória de cálculo do simulador
        const memoriaCalculo = this.simulador.obterMemoriaCalculo();

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

        // Fluxo de caixa com Split Payment e os demais componentes da memória de cálculo...
        // [Continua com outros componentes da memória de cálculo]

        // Inserir o HTML formatado no container
        memoryContainer.innerHTML = html;

        // Atualizar contador de linhas
        const lineCount = document.getElementById('line-count');
        if (lineCount) {
            const lines = memoryContainer.querySelectorAll('.calculation-line').length;
            lineCount.textContent = `Linhas: ${lines}`;
        }
    }
};
```

## 6. Estratégia de Implementação

Para implementar estas modificações, recomenda-se a seguinte abordagem:

1. **Modificar os arquivos CSS**:
   
   - Atualizar `split-payment-styles.css` com as classes adicionais para formatação monetária
   - Ajustar `form-enhancements.css` com os novos estilos para botões
   - Modificar `tab-navigation-css.css` para suportar a navegação baseada em `data-tab`

2. **Modificar o arquivo formatacao.js**:
   
   - Implementar as funções de formatação monetária e percentual
   - Adicionar funções para configuração automática de campos

3. **Modificar o arquivo formulario.js**:
   
   - Atualizar os métodos para cálculo automático do ciclo financeiro
   - Implementar a validação e conversão adequada para valores formatados

4. **Modificar index.html**:
   
   - Substituir a estrutura de navegação por abas
   - Atualizar os containers de campos para formatação monetária e percentual
   - Ajustar a estrutura de botões

5. **Decidir sobre a implementação das classes JavaScript**:
   
   - Opção 1: Implementar as classes `ConfiguracaoSplitPayment` e `SimuladorFluxoCaixa` em arquivos separados
   - Opção 2: Incorporar as classes diretamente no HTML, como no arquivo index-v13.html

## 7. Considerações Finais

A implementação destas especificações técnicas permitirá que o projeto principal (index.html) tenha a mesma formatação e funcionalidade que o modelo de referência (index-v13.html), proporcionando uma experiência mais consistente e aprimorada para o usuário.

Para facilitar a implementação, recomenda-se uma abordagem gradual:

1. Primeiro, implementar as modificações nos arquivos CSS e HTML
2. Em seguida, atualizar os arquivos JavaScript para formatação de campos
3. Por último, implementar ou migrar as classes de configuração e simulação

A formatação consistente de valores monetários e percentuais, o sistema de navegação por abas mais moderno e os estilos aprimorados para botões contribuirão para uma interface mais profissional e intuitiva.

© 2025 Expertzy Inteligência Tributária
