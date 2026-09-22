const URL_BASE = 'https://jsonplaceholder.typicode.com';

// Array que guarda os usuários carregados
let usuariosCarregados = [];

// Referências aos elementos do DOM
const telaLista = document.getElementById('tela-lista');
const telaDetalhe = document.getElementById('tela-detalhe');
const mensagemCarregando = document.getElementById('carregando');

const detalheNome = document.getElementById('detalhe-nome');
const listaPosts = document.getElementById('lista-posts');
const contadorPosts = document.getElementById('contador-posts');

const botaoVoltar = document.getElementById('btn-voltar');

const campoBusca = document.getElementById('busca-usuario');
const areaBusca = document.getElementById('area-busca');


// Busca a lista de usuários na API
async function carregarUsuarios() {

	try {

		const resposta = await fetch(`${URL_BASE}/users`);

		if (!resposta.ok) {
			throw new Error(`Erro HTTP: ${resposta.status}`);
		}

		const usuarios = await resposta.json();

		// Guarda os usuários para utilizar no filtro
		usuariosCarregados = usuarios;

		renderizarListaUsuarios(usuariosCarregados);

	} catch (erro) {

		console.error('Erro ao carregar usuários:', erro);

		mensagemCarregando.textContent =
			'Não foi possível carregar os usuários.';

		return;
	}

	mensagemCarregando.style.display = 'none';
}


// Desenha os cards dos usuários
function renderizarListaUsuarios(usuarios) {

	telaLista.innerHTML = '';

	// Caso nenhum usuário seja encontrado no filtro
	if (usuarios.length === 0) {

		telaLista.innerHTML = `
			<div class="col-12">
				<div class="alert alert-warning">
					Nenhum usuário encontrado.
				</div>
			</div>
		`;

		return;
	}


	usuarios.forEach((usuario) => {

		const coluna = document.createElement('div');

		coluna.className = 'col-md-4';


		// Verifica se os dados existem antes de mostrar
		const nome = usuario.name || 'Nome não informado';

		const email = usuario.email || 'E-mail não informado';

		const telefone = usuario.phone || 'Telefone não informado';

		const website = usuario.website || 'Website não informado';

		const empresa =
			usuario.company && usuario.company.name
				? usuario.company.name
				: 'Empresa não informada';


		coluna.innerHTML = `

			<div
				class="card card-usuario h-100"
				data-id="${usuario.id}"
			>

				<div class="card-body">

					<h5 class="card-title">
						${nome}
					</h5>

					<p class="card-text text-muted">
						${email}
					</p>

					<p class="card-text mb-1">
						<strong>Telefone:</strong>
						${telefone}
					</p>

					<p class="card-text mb-2">
						<strong>Website:</strong>
						${website}
					</p>

					<p class="card-text">
						<small>
							${empresa}
						</small>
					</p>

				</div>

			</div>
		`;


		// Clique no card
		coluna
			.querySelector('.card-usuario')
			.addEventListener('click', () => {

				abrirDetalheUsuario(usuario);

			});


		telaLista.appendChild(coluna);

	});
}


// Filtro em tempo real
campoBusca.addEventListener('input', () => {

	const termo = campoBusca.value
		.toLowerCase()
		.trim();


	// Filtra o array que já foi carregado
	// Não realiza outra requisição HTTP
	const usuariosFiltrados =
		usuariosCarregados.filter((usuario) => {

			const nome = usuario.name || '';

			return nome
				.toLowerCase()
				.includes(termo);

		});


	renderizarListaUsuarios(usuariosFiltrados);

});


// Busca os posts de um usuário
async function abrirDetalheUsuario(usuario) {

	detalheNome.textContent =
		`Posts de ${usuario.name || 'Usuário'}`;


	listaPosts.innerHTML = `
		<li class="list-group-item">
			Carregando posts...
		</li>
	`;


	contadorPosts.textContent = '';


	// Esconde lista e busca
	telaLista.classList.add('d-none');
	areaBusca.classList.add('d-none');

	// Mostra detalhes
	telaDetalhe.classList.remove('d-none');


	try {

		const resposta = await fetch(
			`${URL_BASE}/posts?userId=${usuario.id}`
		);


		if (!resposta.ok) {

			throw new Error(
				`Erro HTTP: ${resposta.status}`
			);

		}


		const posts = await resposta.json();


		// Exibe quantidade de posts
		if (posts.length === 1) {

			contadorPosts.textContent =
				'1 post encontrado';

		} else {

			contadorPosts.textContent =
				`${posts.length} posts encontrados`;

		}


		renderizarPosts(posts);


	} catch (erro) {

		console.error(
			'Erro ao carregar posts:',
			erro
		);


		contadorPosts.textContent = '';


		listaPosts.innerHTML = `
			<li class="list-group-item text-danger">
				Erro ao carregar posts.
			</li>
		`;

	}
}


// Renderiza os posts
function renderizarPosts(posts) {

	listaPosts.innerHTML = '';


	// Usuário sem posts
	if (posts.length === 0) {

		listaPosts.innerHTML = `
			<li class="list-group-item text-muted">
				Nenhum post encontrado para este usuário.
			</li>
		`;

		return;
	}


	posts.forEach((post) => {

		const item =
			document.createElement('li');


		item.className =
			'list-group-item';


		const titulo =
			post.title || 'Post sem título';


		const conteudo =
			post.body || 'Post sem conteúdo';


		item.innerHTML = `

			<strong>
				${titulo}
			</strong>

			<p class="mb-0">
				${conteudo}
			</p>

		`;


		listaPosts.appendChild(item);

	});
}


// Botão voltar
botaoVoltar.addEventListener('click', () => {

	telaDetalhe.classList.add('d-none');

	telaLista.classList.remove('d-none');

	areaBusca.classList.remove('d-none');

});


// Inicialização
carregarUsuarios();