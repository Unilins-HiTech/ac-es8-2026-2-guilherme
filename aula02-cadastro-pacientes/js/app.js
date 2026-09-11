const pacientes = [];

let quantidadeJSON = 0;
let quantidadeManual = 0;

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagemCarregando = document.getElementById('carregando');

function adicionarPaciente(nome, email, nascimento) {
	pacientes.push({ nome, email, nascimento });
}

function renderizarTabela() {
	tabela.innerHTML = '';

	if (pacientes.length === 0) {
		mensagemCarregando.textContent = 'Nenhum paciente cadastrado ainda';
		return;
	}

	pacientes.forEach((paciente) => {
		const linha = document.createElement('tr');
		linha.innerHTML = `
      <td>${paciente.nome}</td>
      <td>${paciente.email}</td>
      <td>${formatarData(paciente.nascimento)}</td>
    `;
		tabela.appendChild(linha);
	});

	mensagemCarregando.textContent =
		`Pacientes: ${quantidadeJSON} | Cadastrados manualmente: ${quantidadeManual}`;
}

function formatarData(dataISO) {
	const [ano, mes, dia] = dataISO.split('-');
	return `${dia}/${mes}/${ano}`;
}

// Nova função: busca os pacientes iniciais a partir do arquivo JSON
async function carregarPacientesIniciais() {
	try {
		mensagemCarregando.textContent = 'Carregando pacientes...';

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const resposta = await fetch('data/pacientes.json');



		console.log(resposta);

	
		if (!resposta.ok) {
			throw new Error(`Erro HTTP: ${resposta.status}`);
		}

		const dados = await resposta.json(); 

		// Trata o caso do JSON vazio
		if (dados.length === 0) {
			renderizarTabela();
			return;
		}

		// Adiciona cada paciente vindo do arquivo ao nosso array local
		dados.forEach((paciente) => {
			adicionarPaciente(
				paciente.nome,
				paciente.email,
				paciente.nascimento
			);

			quantidadeJSON++;
		});

		renderizarTabela();

	} catch (erro) {
		console.error('Não foi possível carregar os pacientes:', erro);

		mensagemCarregando.textContent =
			'Não foi possível carregar os pacientes. Tente novamente mais tarde.';

		return;
	}
}

formulario.addEventListener('submit', (event) => {
	event.preventDefault();

	const nome = document.getElementById('nome').value;
	const email = document.getElementById('email').value;
	const nascimento = document.getElementById('nascimento').value;

	adicionarPaciente(nome, email, nascimento);

	quantidadeManual++;

	renderizarTabela();

	formulario.reset();
});

// Assim que o script carrega, já dispara a busca dos dados iniciais
carregarPacientesIniciais();