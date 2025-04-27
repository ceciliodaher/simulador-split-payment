<script>
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
			inicializar: function() {
				this._configurarEventListeners();
				this._carregarConfiguracoesAnteriores();
			},

			// Métodos públicos
			adicionarSetor: function() {
				const tabelaSetores = document.getElementById('sector-table').getElementsByTagName('tbody')[0];
				const novaLinha = document.createElement('tr');
				novaLinha.id = `setor-${this._nextSetorId}`;

				novaLinha.innerHTML = `
					<td><input type="text" name="setor-nome-${this._nextSetorId}" placeholder="Nome do setor..."></td>
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

					configuracoes.setores.push({
						id: id,
						nome: document.querySelector(`input[name="setor-nome-${id}"]`).value,
						aliquota: parseFloat(document.querySelector(`input[name="setor-aliquota-${id}"]`).value),
						reducao: parseFloat(document.querySelector(`input[name="setor-reducao-${id}"]`).value),
						tipoCronograma: document.querySelector(`select[name="setor-cronograma-${id}"]`).value,
						cronogramaEspecifico: this._setoresCronogramas[id] || null
					});
				}

				// Salvar as configurações
				localStorage.setItem('configuracoes-setoriais', JSON.stringify(configuracoes));

				alert('Configurações salvas com sucesso!');
			},

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

					// Restaurar setores para o padrão
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
					`;

					// Redefinir variáveis
					this._nextSetorId = 4;
					this._setoresCronogramas = {};

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
				if (aba.classList.contains('active-tab')) {
					abaAtiva = aba;
				}

				// Adicionar listener para inicializar quando mudar para a aba de configurações
				aba.addEventListener('click', function() {
					if (this.getAttribute('href') === '#configuracoes') {
						SimuladorApp.ConfiguracoesSetoriais.inicializar();
					}
				});
			});

			// Se a aba ativa for a de configurações, inicializar
			if (abaAtiva && abaAtiva.getAttribute('href') === '#configuracoes') {
				SimuladorApp.ConfiguracoesSetoriais.inicializar();
			}
		});
	})();
</script>
