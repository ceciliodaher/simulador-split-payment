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
			
			console.log(`Adicionando novo setor com ID ${this._nextSetorId}`);

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

			// Encontrar o nome do setor (agora pode ser um select ou input)
			let nomeSetor = "";
			const selectNome = document.querySelector(`select[name="setor-nome-${id}"]`);
			const inputNome = document.querySelector(`input[name="setor-nome-${id}"]`);
			
			if (selectNome) {
				const selectedOption = selectNome.options[selectNome.selectedIndex];
				nomeSetor = selectedOption ? selectedOption.text : `Setor ${id}`;
			} else if (inputNome) {
				nomeSetor = inputNome.value || `Setor ${id}`;
			} else {
				nomeSetor = `Setor ${id}`;
			}
			
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

				// Identificar se é um select ou input para o nome do setor
				const selectNome = linha.querySelector(`select[name="setor-nome-${id}"]`);
				const inputNome = linha.querySelector(`input[name="setor-nome-${id}"]`);
				
				// Obter o nome e código corretamente
				let nome, codigo;
				if (selectNome) {
					codigo = selectNome.value;
					nome = selectNome.options[selectNome.selectedIndex].text;
				} else if (inputNome) {
					nome = inputNome.value;
					codigo = `setor-${id}`;
				} else {
					nome = `Setor ${id}`;
					codigo = `setor-${id}`;
				}

				// Obter outros valores
				const inputAliquota = linha.querySelector(`input[name="setor-aliquota-${id}"]`);
				const inputReducao = linha.querySelector(`input[name="setor-reducao-${id}"]`);
				const selectCronograma = linha.querySelector(`select[name="setor-cronograma-${id}"]`);

				if (inputAliquota && inputReducao && selectCronograma) {
					configuracoes.setores.push({
						id: id,
						codigo: codigo,
						nome: nome,
						aliquota: parseFloat(inputAliquota.value),
						reducao: parseFloat(inputReducao.value),
						tipoCronograma: selectCronograma.value,
						cronogramaEspecifico: this._setoresCronogramas[id] || null
					});
				}
			}

			// Salvar as configurações no localStorage
			localStorage.setItem('configuracoes-setoriais', JSON.stringify(configuracoes));

			// Atualizar o objeto SimuladorApp.config.setores_especiais
			if (SimuladorApp && SimuladorApp.config && SimuladorApp.config.setores_especiais) {
				// Limpar setores especiais existentes
				SimuladorApp.config.setores_especiais = {};

				// Adicionar setores da tabela
				for (let i = 0; i < linhasSetores.length; i++) {
					const linha = linhasSetores[i];
					const id = linha.id.replace('setor-', '');

					// Selecionar elementos usando querySelector para garantir compatibilidade
					// com as possíveis mudanças de input para select
					const selectNome = linha.querySelector(`select[name="setor-nome-${id}"]`);
					const inputNome = linha.querySelector(`input[name="setor-nome-${id}"]`);
					const inputAliquota = linha.querySelector(`input[name="setor-aliquota-${id}"]`);
					const inputReducao = linha.querySelector(`input[name="setor-reducao-${id}"]`);
					const selectCronograma = linha.querySelector(`select[name="setor-cronograma-${id}"]`);

					// Verificar se os elementos necessários existem
					if ((selectNome || inputNome) && inputAliquota && inputReducao && selectCronograma) {
						// Determinar o nome e o código do setor
						let codigo, nome;
						
						if (selectNome) {
							codigo = selectNome.value || `setor-${id}`;
							nome = selectNome.options[selectNome.selectedIndex].text;
						} else {
							codigo = `setor-${id}`;
							nome = inputNome.value;
						}
						
						// Usar código padronizado para compatibilidade
						// Converter nomes para códigos amigáveis (sem espaços, acentos, etc.)
						let codigoPadronizado;
						if (codigo && codigo !== "") {
							codigoPadronizado = codigo;
						} else {
							codigoPadronizado = nome.toLowerCase()
								.normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // Remover acentos
								.replace(/\s+/g, '-')  // Substituir espaços por hífens
								.replace(/[^a-z0-9-]/g, ''); // Remover caracteres especiais
						}
						
						// Garantir que o código seja único 
						// Se o código já existir, adicionar um sufixo numérico
						let codigoFinal = codigoPadronizado;
						let contador = 1;
						while (SimuladorApp.config.setores_especiais[codigoFinal]) {
							codigoFinal = `${codigoPadronizado}-${contador}`;
							contador++;
						}

						// Armazenar o setor com o código padronizado
						SimuladorApp.config.setores_especiais[codigoFinal] = {
							nome: nome,
							aliquota_efetiva: parseFloat(inputAliquota.value) / 100,
							reducao_especial: parseFloat(inputReducao.value) / 100,
							cronograma_proprio: selectCronograma.value === 'proprio',
							cronograma: this._setoresCronogramas[id] || null
						};
						
						console.log(`Setor armazenado: ${nome} (${codigoFinal})`);
					}
				}

				// Salvar configurações do SimuladorApp
				SimuladorApp.config.salvarConfiguracoes();

				// Atualizar dropdown de setores - chamada correta para o método de atualização
				if (typeof SimuladorApp.atualizarDropdownSetores === 'function') {
					console.log('Chamando método atualizarDropdownSetores');
					SimuladorApp.atualizarDropdownSetores();
				} else if (typeof SimuladorApp.popularDropdownSetores === 'function') {
					console.log('Chamando método popularDropdownSetores (alternativo)');
					SimuladorApp.popularDropdownSetores();
				} else {
					console.error('Método para atualizar dropdown de setores não encontrado. A integração com o menu dropdown pode não funcionar corretamente.');
				}
			}

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
				
				// Atualizar objeto SimuladorApp.config
				if (SimuladorApp && SimuladorApp.config) {
					// Criar nova instância com valores padrão
					SimuladorApp.config = new ConfiguracaoSplitPayment();

					// Criar nova instância do simulador com a nova configuração
					SimuladorApp.simulador = new SimuladorFluxoCaixa(SimuladorApp.config);

					// Atualizar dropdown de setores
					if (typeof SimuladorApp.atualizarDropdownSetores === 'function') {
						SimuladorApp.atualizarDropdownSetores();
					} else if (typeof SimuladorApp.popularDropdownSetores === 'function') {
						SimuladorApp.popularDropdownSetores();
					} else {
						console.error('Método para atualizar dropdown de setores não encontrado');
					}
				}
				
				// Converter inputs para selects após a restauração completa
				this._configurarSelectsExistentes();
				
				alert('Todas as configurações foram restauradas para os valores padrão.');
			}
		},

		// Métodos privados
		_configurarEventListeners: function() {
			// Adicionar event listeners para os botões principais
			const btnAdicionarSetor = document.getElementById('btn-adicionar-setor');
			if (btnAdicionarSetor) {
				btnAdicionarSetor.addEventListener('click', function() {
					SimuladorApp.ConfiguracoesSetoriais.adicionarSetor();
				});
			}

			const btnRestaurarCronograma = document.getElementById('btn-restaurar-cronograma');
			if (btnRestaurarCronograma) {
				btnRestaurarCronograma.addEventListener('click', function() {
					SimuladorApp.ConfiguracoesSetoriais.restaurarCronogramaPadrao();
				});
			}

			const btnSalvarConfiguracoes = document.getElementById('btn-salvar-configuracoes');
			if (btnSalvarConfiguracoes) {
				btnSalvarConfiguracoes.addEventListener('click', function() {
					SimuladorApp.ConfiguracoesSetoriais.salvarConfiguracoes();
				});
			}

			const btnRestaurarPadroes = document.getElementById('btn-restaurar-padroes');
			if (btnRestaurarPadroes) {
				btnRestaurarPadroes.addEventListener('click', function() {
					SimuladorApp.ConfiguracoesSetoriais.restaurarPadroes();
				});
			}

			// Event listeners para o modal
			const btnSalvarCronogramaSetor = document.getElementById('btn-salvar-cronograma-setor');
			if (btnSalvarCronogramaSetor) {
				btnSalvarCronogramaSetor.addEventListener('click', function() {
					SimuladorApp.ConfiguracoesSetoriais.salvarCronogramaSetor();
				});
			}

			const btnCancelarModal = document.getElementById('btn-cancelar-modal');
			if (btnCancelarModal) {
				btnCancelarModal.addEventListener('click', function() {
					SimuladorApp.ConfiguracoesSetoriais.fecharModalCronograma();
				});
			}

			const btnFecharModal = document.getElementById('btn-fechar-modal');
			if (btnFecharModal) {
				btnFecharModal.addEventListener('click', function() {
					SimuladorApp.ConfiguracoesSetoriais.fecharModalCronograma();
				});
			}
		},
		
		_obterOpcoesSetores: function() {
			// Verificar se SimuladorApp.config existe
			if (!SimuladorApp || !SimuladorApp.config || !SimuladorApp.config.setores_especiais) {
				console.error('Configuração de setores não encontrada');
				return '';
			}

			let options = '';
			const setores = SimuladorApp.config.setores_especiais;
			
			console.log('Obtendo opções de setores a partir de:', setores);

			// Verificar se há setores para adicionar
			if (Object.keys(setores).length === 0) {
				console.warn('Nenhum setor encontrado para gerar opções');
				return '';
			}

			for (const [codigo, setor] of Object.entries(setores)) {
				if (setor && setor.nome) {
					options += `<option value="${codigo}">${setor.nome}</option>`;
					console.log(`Opção de setor adicionada: ${setor.nome} (${codigo})`);
				}
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
				
				// Se tiver cronograma próprio, carregar os dados
				if (setor.cronograma) {
					this._setoresCronogramas[setorId] = setor.cronograma;
				}
			}
		},
		
		_configurarSelectsExistentes: function() {
			// Substituir inputs de texto existentes por selects
			const linhasSetores = document.querySelectorAll('#sector-table tbody tr');
			
			console.log(`Configurando ${linhasSetores.length} selects existentes`);

			linhasSetores.forEach(linha => {
				const setorId = linha.id.replace('setor-', '');
				const inputNome = linha.querySelector(`input[name="setor-nome-${setorId}"]`);

				if (inputNome) {
					const nomeAtual = inputNome.value;
					const tdNome = inputNome.parentNode;
					
					console.log(`Configurando select para setor ${setorId} com nome atual "${nomeAtual}"`);

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
							console.log(`Opção correspondente encontrada: ${optionCorrespondente.value}`);
						} else {
							console.log(`Nenhuma opção correspondente encontrada para "${nomeAtual}"`);
							
							// Adicionar opção para o setor atual se não for encontrado
							const novaOption = document.createElement('option');
							const codigoNovo = `setor-${setorId}`;
							novaOption.value = codigoNovo;
							novaOption.text = nomeAtual;
							selectNovo.appendChild(novaOption);
							selectNovo.value = codigoNovo;
							
							// Adicionar à configuração se não existir
							if (SimuladorApp.config && SimuladorApp.config.setores_especiais) {
								const inputAliquota = linha.querySelector(`input[name="setor-aliquota-${setorId}"]`);
								const inputReducao = linha.querySelector(`input[name="setor-reducao-${setorId}"]`);
								const selectCronograma = linha.querySelector(`select[name="setor-cronograma-${setorId}"]`);
								
								if (inputAliquota && inputReducao && selectCronograma) {
									SimuladorApp.config.setores_especiais[codigoNovo] = {
										nome: nomeAtual,
										aliquota_efetiva: parseFloat(inputAliquota.value) / 100,
										reducao_especial: parseFloat(inputReducao.value) / 100,
										cronograma_proprio: selectCronograma.value === 'proprio',
										cronograma: this._setoresCronogramas[setorId] || null
									};
								}
							}
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
					console.log('Configurações anteriores carregadas do localStorage:', config);
					
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
						
						// Assegurar que haja pelo menos um setor padrão, se a tabela ficou vazia
						if (maxId === 0) {
							this.restaurarPadroes();
						}
					}
					
					// Atualizar a configuração global do SimuladorApp
					if (SimuladorApp && SimuladorApp.config) {
						// Limpar setores especiais existentes
						SimuladorApp.config.setores_especiais = {};
						
						// Carregar dados dos setores para o SimuladorApp.config
						if (config.setores && config.setores.length > 0) {
							config.setores.forEach(setor => {
								const codigo = setor.codigo || `setor-${setor.id}`;
								
								SimuladorApp.config.setores_especiais[codigo] = {
									nome: setor.nome,
									aliquota_efetiva: setor.aliquota / 100,
									reducao_especial: setor.reducao / 100,
									cronograma_proprio: setor.tipoCronograma === 'proprio',
									cronograma: setor.cronogramaEspecifico
								};
							});
						}
						
						// Atualizar alíquotas base
						if (config.parametrosGerais) {
							SimuladorApp.config.aliquotas_base.CBS = config.parametrosGerais.aliquotaCBS / 100;
							SimuladorApp.config.aliquotas_base.IBS = config.parametrosGerais.aliquotaIBS / 100;
						}
						
						// Atualizar cronograma
						if (config.parametrosGerais && config.parametrosGerais.cronograma) {
							for (let ano = 2026; ano <= 2033; ano++) {
								if (config.parametrosGerais.cronograma[ano] !== undefined) {
									SimuladorApp.config.cronograma_implementacao[ano] = config.parametrosGerais.cronograma[ano] / 100;
								}
							}
						}
						
						// Salvar alterações
						SimuladorApp.config.salvarConfiguracoes();
						
						// Atualizar dropdown de setores
						if (typeof SimuladorApp.atualizarDropdownSetores === 'function') {
							SimuladorApp.atualizarDropdownSetores();
						} else if (typeof SimuladorApp.popularDropdownSetores === 'function') {
							SimuladorApp.popularDropdownSetores();
						}
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
		
		// Também verificar pela classe tab-button para compatibilidade com sistema de navegação novo
		const tabButtons = document.querySelectorAll('.tab-button');
		tabButtons.forEach(function(button) {
			if (button.classList.contains('active') && button.getAttribute('data-tab') === 'configuracoes-setoriais') {
				SimuladorApp.ConfiguracoesSetoriais.inicializar();
			}
			
			button.addEventListener('click', function() {
				if (this.getAttribute('data-tab') === 'configuracoes-setoriais') {
					SimuladorApp.ConfiguracoesSetoriais.inicializar();
				}
			});
		});
	});
})();