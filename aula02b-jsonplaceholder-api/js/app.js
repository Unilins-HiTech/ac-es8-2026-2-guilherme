const URL_BASE = 'https://jsonplaceholder.typicode.com';


// Array de usuários carregados
let usuariosCarregados = [];


// Elementos da tela de usuários
const telaLista = document.getElementById('tela-lista');
const mensagemCarregando = document.getElementById('carregando');

const campoBusca = document.getElementById('busca-usuario');
const areaBusca = document.getElementById('area-busca');


// Elementos da tela de posts
const telaDetalhe = document.getElementById('tela-detalhe');

const detalheNome = document.getElementById('detalhe-nome');

const listaPosts = document.getElementById('lista-posts');

const contadorPosts = document.getElementById('contador-posts');

const carregandoPosts = document.getElementById('carregando-posts');

const botaoVoltar = document.getElementById('btn-voltar');


// Elementos da tela de comentários
const telaComentarios = document.getElementById('tela-comentarios');

const tituloPost = document.getElementById('titulo-post');

const listaComentarios = document.getElementById('lista-comentarios');

const contadorComentarios =
	document.getElementById('contador-comentarios');

const carregandoComentarios =
	document.getElementById('carregando-comentarios');

const botaoVoltarPosts =
	document.getElementById('btn-voltar-posts');


// ========================================
// CARREGAR USUÁRIOS
// ========================================

async function carregarUsuarios() {

	mensagemCarregando.classList.remove('d-none');

	try {

		const resposta = await fetch(
			`${URL_BASE}/users`
		);

		if (!resposta.ok) {

			throw new Error(
				`Erro HTTP: ${resposta.status}`
			);

		}


		const usuarios = await resposta.json();


		// Guarda os usuários para o filtro
		usuariosCarregados = usuarios;


		renderizarListaUsuarios(
			usuariosCarregados
		);


	} catch (erro) {

		console.error(
			'Erro ao carregar usuários:',
			erro
		);


		telaLista.innerHTML = `

			<div class="col-12">

				<div class="alert alert-danger">

					Não foi possível carregar
					os usuários.

				</div>

			</div>

		`;

	} finally {

		mensagemCarregando.classList.add(
			'd-none'
		);

	}

}


// ========================================
// RENDERIZAR USUÁRIOS
// ========================================

function renderizarListaUsuarios(usuarios) {

	telaLista.innerHTML = '';


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

		const coluna =
			document.createElement('div');


		coluna.className = 'col-md-4';


		const nome =
			usuario.name ||
			'Nome não informado';


		const email =
			usuario.email ||
			'E-mail não informado';


		const telefone =
			usuario.phone ||
			'Telefone não informado';


		const website =
			usuario.website ||
			'Website não informado';


		const empresa =
			usuario.company &&
			usuario.company.name
				? usuario.company.name
				: 'Empresa não informada';


		coluna.innerHTML = `

			<div
				class="card card-usuario h-100 shadow-sm"
				style="cursor: pointer;"
			>

				<div class="card-body">

					<h5 class="card-title">
						${nome}
					</h5>


					<p class="card-text text-muted">
						${email}
					</p>


					<p class="card-text mb-1">

						<strong>
							Telefone:
						</strong>

						${telefone}

					</p>


					<p class="card-text mb-2">

						<strong>
							Website:
						</strong>

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


		coluna
			.querySelector('.card-usuario')
			.addEventListener(
				'click',
				() => {

					abrirDetalheUsuario(
						usuario
					);

				}
			);


		telaLista.appendChild(
			coluna
		);

	});

}


// ========================================
// FILTRO DE USUÁRIOS
// ========================================

campoBusca.addEventListener(
	'input',
	() => {

		const termo =
			campoBusca.value
				.toLowerCase()
				.trim();


		const usuariosFiltrados =
			usuariosCarregados.filter(
				(usuario) => {

					const nome =
						usuario.name || '';


					return nome
						.toLowerCase()
						.includes(termo);

				}
			);


		renderizarListaUsuarios(
			usuariosFiltrados
		);

	}
);


// ========================================
// ABRIR POSTS DO USUÁRIO
// ========================================

async function abrirDetalheUsuario(usuario) {

	detalheNome.textContent =
		`Posts de ${usuario.name || 'Usuário'}`;


	contadorPosts.textContent = '';


	listaPosts.innerHTML = '';


	// Troca de tela
	telaLista.classList.add('d-none');

	areaBusca.classList.add('d-none');

	telaComentarios.classList.add('d-none');

	telaDetalhe.classList.remove('d-none');


	// Mostra spinner
	carregandoPosts.classList.remove(
		'd-none'
	);


	try {

		const resposta = await fetch(
			`${URL_BASE}/posts?userId=${usuario.id}`
		);


		if (!resposta.ok) {

			throw new Error(
				`Erro HTTP: ${resposta.status}`
			);

		}


		const posts =
			await resposta.json();


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


		listaPosts.innerHTML = `

			<div class="col-12">

				<div class="alert alert-danger">

					Erro ao carregar posts.

				</div>

			</div>

		`;

	} finally {

		carregandoPosts.classList.add(
			'd-none'
		);

	}

}


// ========================================
// RENDERIZAR POSTS
// ========================================

function renderizarPosts(posts) {

	listaPosts.innerHTML = '';


	if (posts.length === 0) {

		listaPosts.innerHTML = `

			<div class="col-12">

				<div class="alert alert-info">

					Nenhum post encontrado
					para este usuário.

				</div>

			</div>

		`;

		return;

	}


	posts.forEach((post) => {

		const coluna =
			document.createElement('div');


		coluna.className = 'col-md-6';


		const titulo =
			post.title ||
			'Post sem título';


		const conteudo =
			post.body ||
			'Post sem conteúdo';


		coluna.innerHTML = `

			<div
				class="card h-100 shadow-sm card-post"
				style="cursor: pointer;"
			>

				<div class="card-body">

					<h5 class="card-title">
						${titulo}
					</h5>


					<p class="card-text">
						${conteudo}
					</p>


					<small class="text-primary">

						Clique para ver
						os comentários

					</small>

				</div>

			</div>

		`;


		coluna
			.querySelector('.card-post')
			.addEventListener(
				'click',
				() => {

					abrirComentarios(post);

				}
			);


		listaPosts.appendChild(
			coluna
		);

	});

}


// ========================================
// ABRIR COMENTÁRIOS
// ========================================

async function abrirComentarios(post) {

	tituloPost.textContent =
		post.title || 'Post sem título';


	listaComentarios.innerHTML = '';

	contadorComentarios.textContent = '';


	// Troca de tela
	telaDetalhe.classList.add('d-none');

	telaComentarios.classList.remove(
		'd-none'
	);


	// Mostra spinner
	carregandoComentarios.classList.remove(
		'd-none'
	);


	try {

		const resposta = await fetch(
			`${URL_BASE}/comments?postId=${post.id}`
		);


		if (!resposta.ok) {

			throw new Error(
				`Erro HTTP: ${resposta.status}`
			);

		}


		const comentarios =
			await resposta.json();


		if (comentarios.length === 1) {

			contadorComentarios.textContent =
				'1 comentário encontrado';

		} else {

			contadorComentarios.textContent =
				`${comentarios.length} comentários encontrados`;

		}


		renderizarComentarios(
			comentarios
		);


	} catch (erro) {

		console.error(
			'Erro ao carregar comentários:',
			erro
		);


		listaComentarios.innerHTML = `

			<div class="alert alert-danger">

				Erro ao carregar
				os comentários.

			</div>

		`;

	} finally {

		carregandoComentarios.classList.add(
			'd-none'
		);

	}

}


// ========================================
// RENDERIZAR COMENTÁRIOS
// ========================================

function renderizarComentarios(comentarios) {

	listaComentarios.innerHTML = '';


	if (comentarios.length === 0) {

		listaComentarios.innerHTML = `

			<div class="alert alert-info">

				Nenhum comentário encontrado
				para este post.

			</div>

		`;

		return;

	}


	comentarios.forEach(
		(comentario) => {

			const item =
				document.createElement('div');


			item.className =
				'list-group-item';


			const nome =
				comentario.name ||
				'Comentário';


			const email =
				comentario.email ||
				'E-mail não informado';


			const corpo =
				comentario.body ||
				'Comentário sem conteúdo';


			item.innerHTML = `

				<div
					class="d-flex justify-content-between align-items-start"
				>

					<strong>
						${nome}
					</strong>

					<small class="text-muted">
						${email}
					</small>

				</div>


				<p class="mb-0 mt-2">

					${corpo}

				</p>

			`;


			listaComentarios.appendChild(
				item
			);

		}
	);

}


// ========================================
// BOTÃO VOLTAR PARA USUÁRIOS
// ========================================

botaoVoltar.addEventListener(
	'click',
	() => {

		telaDetalhe.classList.add(
			'd-none'
		);


		telaLista.classList.remove(
			'd-none'
		);


		areaBusca.classList.remove(
			'd-none'
		);

	}
);


// ========================================
// BOTÃO VOLTAR PARA POSTS
// ========================================

botaoVoltarPosts.addEventListener(
	'click',
	() => {

		telaComentarios.classList.add(
			'd-none'
		);


		telaDetalhe.classList.remove(
			'd-none'
		);

	}
);


// ========================================
// INICIALIZAÇÃO
// ========================================

carregarUsuarios();