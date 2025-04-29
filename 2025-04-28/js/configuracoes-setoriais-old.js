// Funções globais para serem chamadas pelos atributos onclick no HTML
window.configurarCronogramaSetor = function(id) {
	SimuladorApp.ConfiguracoesSetoriais.configurarCronogramaSetor(id);
};

window.removerSetor = function(id) {
	SimuladorApp.ConfiguracoesSetoriais.removerSetor(id);
};

window.adicionarSetor = function() {
	SimuladorApp.ConfiguracoesSetoriais.adicionarSetor();
};

window.salvarCronogramaSetor = function() {
	SimuladorApp.ConfiguracoesSetoriais.salvarCronogramaSetor();
};

window.fecharModalCronograma = function() {
	SimuladorApp.ConfiguracoesSetoriais.fecharModalCronograma();
};

window.restaurarCronogramaPadrao = function() {
	SimuladorApp.ConfiguracoesSetoriais.restaurarCronogramaPadrao();
};

window.salvarConfiguracoes = function() {
	SimuladorApp.ConfiguracoesSetoriais.salvarConfiguracoes();
};

window.restaurarPadroes = function() {
	SimuladorApp.ConfiguracoesSetoriais.restaurarPadroes();
};

// Módulo de Configurações Setoriais
(function() {
	// Verificar se o objeto SimuladorApp existe
	if (typeof SimuladorApp === 'undefined') {
		window.SimuladorApp = {};
	}

	// Adicionar o módulo de Configurações Setoriais ao SimuladorApp
	SimuladorApp.ConfiguracoesSetoriais = {
		// Propriedades privadas
		_nextSetorId: 4,
		_setoresCronogramas: {},
		_cronogramaDefault: {
			'2026': 10.0,
			'2027': 25.0,
			'2028': 40.0,
			'2029': 55.0,
			'2030': 70.0,
			'2031': 85.0,
			'2032': 95.0,
			'2033': 100.0
		},

		// Método de inicialização
		// No arquivo configuracoes-setoriais.js, modificar o método inicializar:
		inicializar: function() {
			console.log('Inicializando módulo ConfiguracoesSetoriais...');

			// Carregar as configurações primeiro
			this._carregarConfiguracoesAnteriores();
			
			// Configurar selects existentes
    		this._configurarSelectsExistentes();

			// Depois configurar event listeners
			this._configurarEventListeners();

			// Verificar se os dados estão presentes na interface
			const aliquotaCBS = document.getElementById('aliquota-cbs');
			const aliquotaIBS = document.getElementById('aliquota-ibs');

			if (aliquotaCBS && !aliquotaCBS.value) {
				console.log('Preenchendo alíquota CBS com valor padrão');
				aliquotaCBS.value = '8.8';
			}

			if (aliquotaIBS && !aliquotaIBS.value) {
				console.log('Preenchendo alíquota IBS com valor padrão');
				aliquotaIBS.value = '17.7';
			}

			// Preencher valores do cronograma se não estiverem presentes
			for (let ano = 2026; ano <= 2033; ano++) {
				const inputPerc = document.querySelector(`input[name="perc-${ano}"]`);
				if (inputPerc && !inputPerc.value) {
					console.log(`Preenchendo percentual para ${ano} com valor padrão`);
					const valorPadrao = this._cronogramaDefault[ano] || 0;
					inputPerc.value = valorPadrao;
				}
			}

			console.log('Módulo ConfiguracoesSetoriais inicializado com sucesso');
		},

		// Métodos públicos
		adicionarSetor: function() {
		const tabelaSetores = document.getElementById('sector-table').getElementsByTagName('tbody')[0];
		const novaLinha = document.createElement('tr');
		novaLinha.id = `setor-${this._nextSetorId}`;

		// Obter os setores pré-definidos
		const setoresOptions = this._obterOpcoesSetores();

		novaLinha.innerHTML = `
			<td>
				<select name="setor-nome-${this._nextSetorId}" class="setor-select" data-id="${this._nextSetorId}">
					<option value="">Selecione um setor...</option>
					${setoresOptions}
				</select>
			</td>
			<td><input type="number" name="setor-aliquota-${this._nextSetorId}" min="0" max="100" step="0.01" value="26.5"></td>
			<td><input type="number" name="setor-reducao-${this._nextSetorId}" min="0" max="100" step="0.01" value="0"></td>
			<td>
				<select name="setor-cronograma-${this._nextSetorId}">
					<option value="padrao">Cronograma Padrão</option>
					<option value="proprio">Cronograma Específico</option>
				</select>
			</td>
			<td>
				<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(${this._nextSetorId})">Configurar</button>
				<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(${this._nextSetorId})">Remover</button>
			</td>
		`;

		tabelaSetores.appendChild(novaLinha);

		// Adicionar evento de mudança para preencher dados automaticamente
		const selectSetor = document.querySelector(`select[name="setor-nome-${this._nextSetorId}"]`);
		if (selectSetor) {
			selectSetor.addEventListener('change', this._preencherDadosSetor.bind(this));
		}

		this._nextSetorId++;
	},

		removerSetor: function(id) {
			if (confirm('Confirma a exclusão deste setor?')) {
				const linha = document.getElementById(`setor-${id}`);
				linha.parentNode.removeChild(linha);

				// Remover cronograma específico se existir
				if (this._setoresCronogramas[id]) {
					delete this._setoresCronogramas[id];
				}
			}
		},

		configurarCronogramaSetor: function(id) {
			const select = document.querySelector(`select[name="setor-cronograma-${id}"]`);
			if (select.value === "padrao") {
				select.value = "proprio";
			}

			const nomeSetor = document.querySelector(`input[name="setor-nome-${id}"]`).value;
			document.getElementById('modal-setor-nome').textContent = nomeSetor;
			document.getElementById('modal-setor-id').value = id;

			// Preencher tabela do modal com cronograma atual ou padrão
			const tabelaCronograma = document.getElementById('cronograma-setor-table').getElementsByTagName('tbody')[0];
			tabelaCronograma.innerHTML = '';

			const cronogramaAtual = this._setoresCronogramas[id] || this._cronogramaDefault;

			for (let ano = 2026; ano <= 2033; ano++) {
				const linha = document.createElement('tr');
				linha.innerHTML = `
					<td>${ano}</td>
					<td><input type="number" name="modal-perc-${ano}" min="0" max="100" step="0.1" value="${cronogramaAtual[ano]}"></td>
					<td><input type="text" name="modal-obs-${ano}" placeholder="Observações..."></td>
				`;
				tabelaCronograma.appendChild(linha);
			}

			// Exibir modal
			document.getElementById('modal-cronograma-setor').classList.add('active');
		},

		salvarCronogramaSetor: function() {
			const setorId = document.getElementById('modal-setor-id').value;
			const cronograma = {};

			for (let ano = 2026; ano <= 2033; ano++) {
				const valor = parseFloat(document.querySelector(`input[name="modal-perc-${ano}"]`).value);
				cronograma[ano] = valor;
			}

			this._setoresCronogramas[setorId] = cronograma;
			this.fecharModalCronograma();
		},

		fecharModalCronograma: function() {
			document.getElementById('modal-cronograma-setor').classList.remove('active');
		},

		restaurarCronogramaPadrao: function() {
			if (confirm('Confirma a restauração do cronograma para os valores padrão?')) {
				for (let ano = 2026; ano <= 2033; ano++) {
					document.querySelector(`input[name="perc-${ano}"]`).value = this._cronogramaDefault[ano];
					document.querySelector(`input[name="obs-${ano}"]`).value = '';
				}
			}
		},

		// No método salvarConfiguracoes do objeto SimuladorApp.ConfiguracoesSetoriais
		salvarConfiguracoes: function() {
			// Coletar e salvar as configurações
			const configuracoes = {
				parametrosGerais: {
					aliquotaCBS: parseFloat(document.getElementById('aliquota-cbs').value),
					aliquotaIBS: parseFloat(document.getElementById('aliquota-ibs').value),
					dataInicio: document.getElementById('data-inicio').value,
					cronograma: {}
				},
				setores: [],
				parametrosFinanceiros: {
					taxaAntecipacao: parseFloat(document.getElementById('taxa-antecipacao').value),
					taxaCapitalGiro: parseFloat(document.getElementById('taxa-capital-giro').value),
					spreadBancario: parseFloat(document.getElementById('spread-bancario').value),
					observacoes: document.getElementById('observacoes-financeiras').value
				}
			};

			// Coletar cronograma geral
			for (let ano = 2026; ano <= 2033; ano++) {
				configuracoes.parametrosGerais.cronograma[ano] = parseFloat(document.querySelector(`input[name="perc-${ano}"]`).value);
			}

			// Coletar dados dos setores
			const linhasSetores = document.getElementById('sector-table').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
			for (let i = 0; i < linhasSetores.length; i++) {
				const linha = linhasSetores[i];
				const id = linha.id.replace('setor-', '');
				
				// Obter os valores dos campos
				let nomeSetor = '';
				const nomeInput = linha.querySelector(`input[name="setor-nome-${id}"]`);
				const nomeSelect = linha.querySelector(`select[name="setor-nome-${id}"]`);
				
				if (nomeSelect) {
					nomeSetor = nomeSelect.options[nomeSelect.selectedIndex].text;
				} else if (nomeInput) {
					nomeSetor = nomeInput.value;
				}

				configuracoes.setores.push({
					id: id,
					nome: nomeSetor,
					aliquota: parseFloat(document.querySelector(`input[name="setor-aliquota-${id}"]`).value),
					reducao: parseFloat(document.querySelector(`input[name="setor-reducao-${id}"]`).value),
					tipoCronograma: document.querySelector(`select[name="setor-cronograma-${id}"]`).value,
					cronogramaEspecifico: this._setoresCronogramas[id] || null
				});
			}

			// Salvar as configurações
			localStorage.setItem('configuracoes-setoriais', JSON.stringify(configuracoes));
			
			// *** ADIÇÃO: Sincronizar com o objeto principal de configuração ***
			if (SimuladorApp && SimuladorApp.config) {
				SimuladorApp.config.sincronizarSetoresEspeciaisDoConfigSetoriais();
				// Atualizar o dropdown de setores
				SimuladorApp.atualizarDropdownSetores();
			}

			alert('Configurações salvas com sucesso!');
		},

		// No arquivo configuracoes-setoriais.js, modificar o método restaurarPadroes:
		restaurarPadroes: function() {
			if (confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão? Isso apagará todas as personalizações.')) {
				// Restaurar alíquotas e data de início
				document.getElementById('aliquota-cbs').value = '8.8';
				document.getElementById('aliquota-ibs').value = '17.7';
				document.getElementById('data-inicio').value = '2026-01';

				// Restaurar cronograma padrão
				this.restaurarCronogramaPadrao();

				// Restaurar parâmetros financeiros
				document.getElementById('taxa-antecipacao').value = '1.8';
				document.getElementById('taxa-capital-giro').value = '2.1';
				document.getElementById('spread-bancario').value = '3.5';
				document.getElementById('observacoes-financeiras').value = '';

				// Restaurar setores com a lista completa dos setores da legislação
				const tabelaSetores = document.getElementById('sector-table').getElementsByTagName('tbody')[0];
				tabelaSetores.innerHTML = `
					<tr id="setor-1">
						<td><input type="text" name="setor-nome-1" value="Comércio Varejista"></td>
						<td><input type="number" name="setor-aliquota-1" min="0" max="100" step="0.01" value="26.5"></td>
						<td><input type="number" name="setor-reducao-1" min="0" max="100" step="0.01" value="0"></td>
						<td>
							<select name="setor-cronograma-1">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio">Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(1)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(1)">Remover</button>
						</td>
					</tr>
					<tr id="setor-2">
						<td><input type="text" name="setor-nome-2" value="Indústria"></td>
						<td><input type="number" name="setor-aliquota-2" min="0" max="100" step="0.01" value="26.5"></td>
						<td><input type="number" name="setor-reducao-2" min="0" max="100" step="0.01" value="0"></td>
						<td>
							<select name="setor-cronograma-2">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio">Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(2)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(2)">Remover</button>
						</td>
					</tr>
					<tr id="setor-3">
						<td><input type="text" name="setor-nome-3" value="Serviços"></td>
						<td><input type="number" name="setor-aliquota-3" min="0" max="100" step="0.01" value="26.5"></td>
						<td><input type="number" name="setor-reducao-3" min="0" max="100" step="0.01" value="0"></td>
						<td>
							<select name="setor-cronograma-3">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio">Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(3)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(3)">Remover</button>
						</td>
					</tr>
					<tr id="setor-4">
						<td><input type="text" name="setor-nome-4" value="Agronegócio"></td>
						<td><input type="number" name="setor-aliquota-4" min="0" max="100" step="0.01" value="22.0"></td>
						<td><input type="number" name="setor-reducao-4" min="0" max="100" step="0.01" value="17"></td>
						<td>
							<select name="setor-cronograma-4">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio" selected>Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(4)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(4)">Remover</button>
						</td>
					</tr>
					<tr id="setor-5">
						<td><input type="text" name="setor-nome-5" value="Saúde"></td>
						<td><input type="number" name="setor-aliquota-5" min="0" max="100" step="0.01" value="18.0"></td>
						<td><input type="number" name="setor-reducao-5" min="0" max="100" step="0.01" value="32.1"></td>
						<td>
							<select name="setor-cronograma-5">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio" selected>Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(5)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(5)">Remover</button>
						</td>
					</tr>
					<tr id="setor-6">
						<td><input type="text" name="setor-nome-6" value="Educação"></td>
						<td><input type="number" name="setor-aliquota-6" min="0" max="100" step="0.01" value="16.5"></td>
						<td><input type="number" name="setor-reducao-6" min="0" max="100" step="0.01" value="37.7"></td>
						<td>
							<select name="setor-cronograma-6">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio" selected>Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(6)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(6)">Remover</button>
						</td>
					</tr>
					<tr id="setor-7">
						<td><input type="text" name="setor-nome-7" value="Transporte Público"></td>
						<td><input type="number" name="setor-aliquota-7" min="0" max="100" step="0.01" value="15.0"></td>
						<td><input type="number" name="setor-reducao-7" min="0" max="100" step="0.01" value="43.4"></td>
						<td>
							<select name="setor-cronograma-7">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio" selected>Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(7)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(7)">Remover</button>
						</td>
					</tr>
					<tr id="setor-8">
						<td><input type="text" name="setor-nome-8" value="Construção Civil"></td>
						<td><input type="number" name="setor-aliquota-8" min="0" max="100" step="0.01" value="24.0"></td>
						<td><input type="number" name="setor-reducao-8" min="0" max="100" step="0.01" value="9.4"></td>
						<td>
							<select name="setor-cronograma-8">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio">Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(8)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(8)">Remover</button>
						</td>
					</tr>
					<tr id="setor-9">
						<td><input type="text" name="setor-nome-9" value="Tecnologia"></td>
						<td><input type="number" name="setor-aliquota-9" min="0" max="100" step="0.01" value="23.5"></td>
						<td><input type="number" name="setor-reducao-9" min="0" max="100" step="0.01" value="11.3"></td>
						<td>
							<select name="setor-cronograma-9">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio">Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(9)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(9)">Remover</button>
						</td>
					</tr>
					<tr id="setor-10">
						<td><input type="text" name="setor-nome-10" value="Energia"></td>
						<td><input type="number" name="setor-aliquota-10" min="0" max="100" step="0.01" value="20.5"></td>
						<td><input type="number" name="setor-reducao-10" min="0" max="100" step="0.01" value="22.6"></td>
						<td>
							<select name="setor-cronograma-10">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio">Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(10)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(10)">Remover</button>
						</td>
					</tr>
					<tr id="setor-11">
						<td><input type="text" name="setor-nome-11" value="Serviços Financeiros"></td>
						<td><input type="number" name="setor-aliquota-11" min="0" max="100" step="0.01" value="26.5"></td>
						<td><input type="number" name="setor-reducao-11" min="0" max="100" step="0.01" value="0"></td>
						<td>
							<select name="setor-cronograma-11">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio">Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(11)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(11)">Remover</button>
						</td>
					</tr>
					<tr id="setor-12">
						<td><input type="text" name="setor-nome-12" value="Saneamento Básico"></td>
						<td><input type="number" name="setor-aliquota-12" min="0" max="100" step="0.01" value="14.0"></td>
						<td><input type="number" name="setor-reducao-12" min="0" max="100" step="0.01" value="47.2"></td>
						<td>
							<select name="setor-cronograma-12">
								<option value="padrao">Cronograma Padrão</option>
								<option value="proprio" selected>Cronograma Específico</option>
							</select>
						</td>
						<td>
							<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(12)">Configurar</button>
							<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(12)">Remover</button>
						</td>
					</tr>
				`;

				// Redefinir variáveis
				this._nextSetorId = 13;
				this._setoresCronogramas = {};

				// Configurar cronogramas específicos para setores com redução
				for (let id = 4; id <= 12; id++) {
					if (id === 4 || id === 5 || id === 6 || id === 7 || id === 12) {
						const cronogramaEspecifico = {
							'2026': 5.0,
							'2027': 15.0,
							'2028': 25.0,
							'2029': 40.0,
							'2030': 55.0,
							'2031': 70.0,
							'2032': 85.0,
							'2033': 100.0
						};
						this._setoresCronogramas[id] = cronogramaEspecifico;
					}
				}
				// ADICIONAR ESTE BLOCO ao final do método, antes do alert:
				// Atualizar objeto SimuladorApp.config
				if (SimuladorApp && SimuladorApp.config) {
					// Criar nova instância com valores padrão
					SimuladorApp.config = new ConfiguracaoSplitPayment();

					// Criar nova instância do simulador com a nova configuração
					SimuladorApp.simulador = new SimuladorFluxoCaixa(SimuladorApp.config);

					// Atualizar dropdown de setores
					SimuladorApp.popularDropdownSetores();
				}
				
				alert('Todas as configurações foram restauradas para os valores padrão.');
			}
		},

		// Métodos privados
		_configurarEventListeners: function() {
			// Adicionar event listeners para os botões principales
			document.getElementById('btn-adicionar-setor').addEventListener('click', function() {
				SimuladorApp.ConfiguracoesSetoriais.adicionarSetor();
			});

			document.getElementById('btn-restaurar-cronograma').addEventListener('click', function() {
				SimuladorApp.ConfiguracoesSetoriais.restaurarCronogramaPadrao();
			});

			document.getElementById('btn-salvar-configuracoes').addEventListener('click', function() {
				SimuladorApp.ConfiguracoesSetoriais.salvarConfiguracoes();
			});

			document.getElementById('btn-restaurar-padroes').addEventListener('click', function() {
				SimuladorApp.ConfiguracoesSetoriais.restaurarPadroes();
			});

			// Event listeners para o modal
			document.getElementById('btn-salvar-cronograma-setor').addEventListener('click', function() {
				SimuladorApp.ConfiguracoesSetoriais.salvarCronogramaSetor();
			});

			document.getElementById('btn-cancelar-modal').addEventListener('click', function() {
				SimuladorApp.ConfiguracoesSetoriais.fecharModalCronograma();
			});

			document.getElementById('btn-fechar-modal').addEventListener('click', function() {
				SimuladorApp.ConfiguracoesSetoriais.fecharModalCronograma();
			});
		},
		
		// Arquivo: configuracoes-setoriais.js
		// Localização: Dentro do objeto SimuladorApp.ConfiguracoesSetoriais
		// Adicione antes da função _carregarConfiguracoesAnteriores

		_obterOpcoesSetores: function() {
			// Verificar se SimuladorApp.config existe
			if (!SimuladorApp || !SimuladorApp.config || !SimuladorApp.config.setores_especiais) {
				console.error('Configuração de setores não encontrada');
				return '';
			}

			let options = '';
			const setores = SimuladorApp.config.setores_especiais;

			for (const [codigo, setor] of Object.entries(setores)) {
				options += `<option value="${codigo}">${setor.nome}</option>`;
			}

			return options;
		},

		_preencherDadosSetor: function(event) {
			const select = event.target;
			const setorId = select.dataset.id;
			const setorCodigo = select.value;

			if (!setorCodigo || !SimuladorApp.config.setores_especiais[setorCodigo]) {
				return;
			}

			const setor = SimuladorApp.config.setores_especiais[setorCodigo];

			// Preencher a alíquota efetiva
			const inputAliquota = document.querySelector(`input[name="setor-aliquota-${setorId}"]`);
			if (inputAliquota) {
				inputAliquota.value = setor.aliquota_efetiva * 100;
			}

			// Preencher a redução especial
			const inputReducao = document.querySelector(`input[name="setor-reducao-${setorId}"]`);
			if (inputReducao) {
				inputReducao.value = setor.reducao_especial * 100;
			}

			// Configurar cronograma próprio, se aplicável
			const selectCronograma = document.querySelector(`select[name="setor-cronograma-${setorId}"]`);
			if (selectCronograma && setor.cronograma_proprio) {
				selectCronograma.value = 'proprio';
			}
		},
		
		_configurarSelectsExistentes: function() {
		// Substituir inputs de texto existentes por selects
		const linhasSetores = document.querySelectorAll('#sector-table tbody tr');

		linhasSetores.forEach(linha => {
			const setorId = linha.id.replace('setor-', '');
			const inputNome = linha.querySelector(`input[name="setor-nome-${setorId}"]`);

			if (inputNome) {
				const nomeAtual = inputNome.value;
				const tdNome = inputNome.parentNode;

				// Criar select com opções
				const setoresOptions = this._obterOpcoesSetores();
				const selectHTML = `
					<select name="setor-nome-${setorId}" class="setor-select" data-id="${setorId}">
						<option value="">Selecione um setor...</option>
						${setoresOptions}
					</select>
				`;

				tdNome.innerHTML = selectHTML;

				// Tentar selecionar a opção que corresponde ao nome atual
				const selectNovo = tdNome.querySelector('select');
				if (selectNovo) {
					// Procurar opção por texto
					const options = Array.from(selectNovo.options);
					const optionCorrespondente = options.find(option => option.text === nomeAtual);

					if (optionCorrespondente) {
						selectNovo.value = optionCorrespondente.value;
					}

					// Adicionar evento de mudança
					selectNovo.addEventListener('change', this._preencherDadosSetor.bind(this));
				}
			}
		});
	},

		_carregarConfiguracoesAnteriores: function() {
			const configuracoesAnteriores = localStorage.getItem('configuracoes-setoriais');
			if (configuracoesAnteriores) {
				try {
					const config = JSON.parse(configuracoesAnteriores);

					// Carregar parâmetros gerais
					if (config.parametrosGerais) {
						document.getElementById('aliquota-cbs').value = config.parametrosGerais.aliquotaCBS;
						document.getElementById('aliquota-ibs').value = config.parametrosGerais.aliquotaIBS;
						document.getElementById('data-inicio').value = config.parametrosGerais.dataInicio;

						// Carregar cronograma
						if (config.parametrosGerais.cronograma) {
							for (let ano = 2026; ano <= 2033; ano++) {
								if (config.parametrosGerais.cronograma[ano] !== undefined) {
									document.querySelector(`input[name="perc-${ano}"]`).value = config.parametrosGerais.cronograma[ano];
								}
							}
						}
					}

					// Carregar parâmetros financeiros
					if (config.parametrosFinanceiros) {
						document.getElementById('taxa-antecipacao').value = config.parametrosFinanceiros.taxaAntecipacao;
						document.getElementById('taxa-capital-giro').value = config.parametrosFinanceiros.taxaCapitalGiro;
						document.getElementById('spread-bancario').value = config.parametrosFinanceiros.spreadBancario;
						document.getElementById('observacoes-financeiras').value = config.parametrosFinanceiros.observacoes || '';
					}

					// Carregar setores
					if (config.setores && config.setores.length > 0) {
						// Limpar tabela de setores
						const tabelaSetores = document.getElementById('sector-table').getElementsByTagName('tbody')[0];
						tabelaSetores.innerHTML = '';

						// Determinar o próximo ID
						let maxId = 0;

						// Adicionar setores da configuração
						config.setores.forEach(setor => {
							const id = parseInt(setor.id);
							maxId = Math.max(maxId, id);

							const novaLinha = document.createElement('tr');
							novaLinha.id = `setor-${id}`;

							novaLinha.innerHTML = `
								<td><input type="text" name="setor-nome-${id}" value="${setor.nome}"></td>
								<td><input type="number" name="setor-aliquota-${id}" min="0" max="100" step="0.01" value="${setor.aliquota}"></td>
								<td><input type="number" name="setor-reducao-${id}" min="0" max="100" step="0.01" value="${setor.reducao}"></td>
								<td>
									<select name="setor-cronograma-${id}">
										<option value="padrao" ${setor.tipoCronograma === 'padrao' ? 'selected' : ''}>Cronograma Padrão</option>
										<option value="proprio" ${setor.tipoCronograma === 'proprio' ? 'selected' : ''}>Cronograma Específico</option>
									</select>
								</td>
								<td>
									<button type="button" class="btn btn-outline btn-sm" onclick="configurarCronogramaSetor(${id})">Configurar</button>
									<button type="button" class="btn btn-accent btn-sm" onclick="removerSetor(${id})">Remover</button>
								</td>
							`;

							tabelaSetores.appendChild(novaLinha);

							// Carregar cronograma específico
							if (setor.cronogramaEspecifico) {
								this._setoresCronogramas[id] = setor.cronogramaEspecifico;
							}
						});

						// Atualizar o próximo ID
						this._nextSetorId = maxId + 1;
					}
					

					console.log('Configurações carregadas com sucesso do localStorage.');
				} catch (e) {
					console.error('Erro ao carregar configurações:', e);
				}
			}
		}
	};

	// Inicialização automática quando o DOM estiver carregado
	document.addEventListener('DOMContentLoaded', function() {
		// Verificar se estamos na aba de configurações setoriais
		const abas = document.querySelectorAll('#tabs a');
		let abaAtiva = null;

		abas.forEach(function(aba) {
			if (aba.classList.contains('active')) {
				abaAtiva = aba;
			}

			// Adicionar listener para inicializar quando mudar para a aba de configurações
			aba.addEventListener('click', function() {
				if (this.getAttribute('href') === '#configuracoes-setoriais') {
					SimuladorApp.ConfiguracoesSetoriais.inicializar();
				}
			});
		});

		// Se a aba ativa for a de configurações, inicializar
		if (abaAtiva && abaAtiva.getAttribute('href') === '#configuracoes-setoriais') {
			SimuladorApp.ConfiguracoesSetoriais.inicializar();
		}
	});
})();
