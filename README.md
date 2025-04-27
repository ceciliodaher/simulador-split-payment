# Simulador de Impacto do Split Payment no Fluxo de Caixa

![Badge](https://img.shields.io/badge/Expertzy-Inteligência_Tributária-blue)
![GitHub language count](https://img.shields.io/github/languages/count/seu-usuario/simulador-split-payment)
![License](https://img.shields.io/badge/license-MIT-green)

Ferramenta avançada para análise do impacto da implementação do Split Payment no fluxo de caixa de empresas, com modelagem setorial personalizável e simulações de cenários tributários.

## 📌 Recursos Principais

- **Simulação Dinâmica de Cenários**
  - Modelagem de fluxo de caixa pré e pós Split Payment
  - Análise comparativa entre regimes tributários
  - Projeção temporal (2026-2033)

- **Configuração Setorial Avançada**
  - Parâmetros específicos por setor econômico
  - Cronogramas de implementação personalizáveis
  - Mecanismo de adição dinâmica de novos setores

- **Análise de Impacto Financeiro**
  - Cálculo automático de necessidade de capital de giro
  - Simulação de estratégias de mitigação
  - Geração de relatórios detalhados

## 🚀 Instalação

1. Clone o repositório:
2. Acesse o diretório do projeto:
3. Abra o arquivo `index.html` em seu navegador.

## 🖥 Uso Básico

### Simulação Principal
1. Preencha os dados da empresa:
   - Faturamento
   - Setor de atividade
   - Regime tributário
   - Ciclo financeiro atual

2. Configure parâmetros tributários:
   - Alíquotas CBS/IBS
   - Créditos tributários
   - Percentual de implementação

3. Execute a simulação e analise os resultados:
   - Impacto no capital de giro
   - Projeção temporal
   - Gráficos comparativos

### Configurações Setoriais
// Exemplo de configuração setorial
this.setores_especiais = {
'comercio': {
nome: 'Comércio Varejista',
aliquota_efetiva: 0.265,
reducao_especial: 0.0,
cronograma_proprio: false
},
// ... outros setores
};

## ⚙ Configuração Avançada

### Adicionar Novo Setor
1. Na aba **Configurações Setoriais**
2. Clique em "Adicionar Setor"
3. Preencha os parâmetros:
   - Nome do setor
   - Alíquota efetiva
   - Redução especial
   - Cronograma próprio

### Modificar Parâmetros Fiscais
Edite o arquivo `app.txt` para ajustar:
// Alíquotas base
this.aliquotasbase = {
CBS: 0.088,
IBS: 0.177
};

// Cronograma de implementação
this.cronogramaimplementacao = {
2026: 0.10,
// ... outros anos
};

## 🤝 Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature:
3. Commit suas mudanças:
4. Push para a branch:
5. Abra um Pull Request

## 📄 Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido por** [Expertzy Inteligência Tributária](https://www.expertzy.com.br)  
✉️ Contato: contato@expertzy.com.br  
📅 Última atualização: Abril 2025





