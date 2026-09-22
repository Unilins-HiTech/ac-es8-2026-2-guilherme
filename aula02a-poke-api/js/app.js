const API_URL = 'https://pokeapi.co/api/v2/pokemon';

const pokemonGrid = document.getElementById('pokemonGrid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

const modalElement = document.getElementById('pokemonModal');
const modalBody = document.getElementById('pokemonModalBody');
const modalTitle = document.getElementById('pokemonModalLabel');

const pokemonModal = new bootstrap.Modal(modalElement);


// Buscar os dados de um Pokémon
async function fetchPokemonData(urlOrName) {

	const url = urlOrName.startsWith('http')
		? urlOrName
		: `${API_URL}/${urlOrName.toLowerCase().trim()}`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error('Pokémon não encontrado');
	}

	return await response.json();
}


// Carregar lista inicial
async function loadInitialPokemon(limit = 20) {

	showLoading(true);

	pokemonGrid.innerHTML = '';

	try {

		const response = await fetch(`${API_URL}?limit=${limit}`);

		if (!response.ok) {
			throw new Error('Erro ao carregar Pokémon');
		}

		const data = await response.json();

		const pokemonPromises = data.results.map((item) =>
			fetchPokemonData(item.url)
		);

		const pokemonList = await Promise.all(pokemonPromises);

		pokemonList.forEach(renderPokemonCard);

	} catch (error) {

		showError('Erro ao carregar a lista de Pokémon.');

		console.error(error);

	} finally {

		showLoading(false);

	}
}


// Criar os cards
function renderPokemonCard(pokemon) {

	const imageUrl =
		pokemon.sprites.other['official-artwork'].front_default ||
		pokemon.sprites.front_default;

	const typesBadges = pokemon.types
		.map(
			(t) =>
				`<span class="badge bg-secondary badge-type">
					${t.type.name}
				</span>`
		)
		.join('');

	const heightInMeters = (pokemon.height / 10).toFixed(1);

	const weightInKg = (pokemon.weight / 10).toFixed(1);

	const cardHTML = `
		<div class="col">

			<div
				class="card h-100 shadow-sm pokemon-card border-0"
				onclick="openPokemonModal('${pokemon.name}')"
			>

				<div class="text-center p-3 bg-white rounded-top">

					<img
						src="${imageUrl}"
						class="card-img-top img-fluid"
						style="max-height: 160px; object-fit: contain;"
						alt="${pokemon.name}"
					>

				</div>

				<div class="card-body">

					<div class="d-flex justify-content-between align-items-center mb-2">

						<h5 class="card-title text-capitalize fw-bold m-0">
							${pokemon.name}
						</h5>

						<small class="text-muted">
							#${String(pokemon.id).padStart(3, '0')}
						</small>

					</div>

					<div class="mb-3">
						${typesBadges}
					</div>

					<div class="row text-center border-top pt-2">

						<div class="col-6 border-end">

							<small class="text-muted d-block">
								Altura
							</small>

							<strong>
								${heightInMeters} m
							</strong>

						</div>

						<div class="col-6">

							<small class="text-muted d-block">
								Peso
							</small>

							<strong>
								${weightInKg} kg
							</strong>

						</div>

					</div>

				</div>

			</div>

		</div>
	`;

	pokemonGrid.insertAdjacentHTML(
		'beforeend',
		cardHTML
	);
}


// Abrir modal
async function openPokemonModal(name) {

	// Título enquanto carrega
	modalTitle.textContent = 'Carregando...';

	// Spinner
	modalBody.innerHTML = `
		<div class="text-center py-5">

			<div
				class="spinner-border text-danger"
				role="status"
			>
				<span class="visually-hidden">
					Carregando...
				</span>
			</div>

			<p class="mt-3 text-muted">
				Carregando detalhes...
			</p>

		</div>
	`;

	// Abre imediatamente para mostrar o loading
	pokemonModal.show();

	try {

		const pokemon = await fetchPokemonData(name);

		renderPokemonModal(pokemon);

	} catch (error) {

		modalTitle.textContent = 'Erro';

		modalBody.innerHTML = `
			<div class="alert alert-danger text-center">

				Não foi possível carregar os detalhes
				deste Pokémon.

			</div>
		`;

		console.error(error);
	}
}


// Criar conteúdo do modal
function renderPokemonModal(pokemon) {

	modalTitle.textContent =
		`${pokemon.name} #${String(pokemon.id).padStart(3, '0')}`;


	// Status que queremos mostrar
	const statsWanted = [
		'hp',
		'attack',
		'defense',
		'speed'
	];


	const statNames = {
		hp: 'HP',
		attack: 'Ataque',
		defense: 'Defesa',
		speed: 'Velocidade'
	};


	const statsHTML = pokemon.stats
		.filter((stat) =>
			statsWanted.includes(stat.stat.name)
		)
		.map((stat) => {

			const value = stat.base_stat;

			// Limita visualmente a barra em 100%
			const percentage = Math.min(value, 100);

			return `
				<div class="mb-3">

					<div class="d-flex justify-content-between">

						<strong>
							${statNames[stat.stat.name]}
						</strong>

						<span>
							${value}
						</span>

					</div>

					<div
						class="progress"
						role="progressbar"
						aria-valuenow="${value}"
						aria-valuemin="0"
						aria-valuemax="100"
					>

						<div
							class="progress-bar bg-danger"
							style="width: ${percentage}%"
						>
							${value}
						</div>

					</div>

				</div>
			`;

		})
		.join('');


	// Habilidades
	const abilitiesHTML = pokemon.abilities
		.map(
			(ability) => `
				<span
					class="badge bg-primary me-2 mb-2 text-capitalize"
				>
					${ability.ability.name}
				</span>
			`
		)
		.join('');


	// Áudio
	let audioHTML;

	if (pokemon.cries && pokemon.cries.latest) {

		audioHTML = `
			<audio
				controls
				class="w-100"
			>
				<source
					src="${pokemon.cries.latest}"
					type="audio/ogg"
				>

				Seu navegador não suporta áudio.

			</audio>
		`;

	} else {

		audioHTML = `
			<p class="text-muted">
				Áudio não disponível.
			</p>
		`;
	}


	// Sprites
	const sprites = [
		{
			title: 'Normal - Frente',
			url: pokemon.sprites.front_default
		},

		{
			title: 'Normal - Costas',
			url: pokemon.sprites.back_default
		},

		{
			title: 'Shiny - Frente',
			url: pokemon.sprites.front_shiny
		},

		{
			title: 'Shiny - Costas',
			url: pokemon.sprites.back_shiny
		}
	];


	const spritesHTML = sprites
		.map((sprite) => {

			if (!sprite.url) {

				return `
					<div class="col-6 col-md-3 text-center">

						<div
							class="border rounded p-2 h-100"
						>

							<p class="small mb-2">
								${sprite.title}
							</p>

							<small class="text-muted">
								Indisponível
							</small>

						</div>

					</div>
				`;

			}

			return `
				<div class="col-6 col-md-3 text-center">

					<div
						class="border rounded p-2 h-100 bg-light"
					>

						<p class="small fw-bold mb-0">
							${sprite.title}
						</p>

						<img
							src="${sprite.url}"
							class="sprite-img img-fluid"
							alt="${sprite.title}"
						>

					</div>

				</div>
			`;

		})
		.join('');


	modalBody.innerHTML = `

		<div class="row">

			<div class="col-md-6">

				<h5 class="mb-3">
					Status Base
				</h5>

				${statsHTML}

			</div>


			<div class="col-md-6">

				<h5>
					Habilidades
				</h5>

				<div class="mb-4">
					${abilitiesHTML}
				</div>


				<h5>
					Som do Pokémon
				</h5>

				${audioHTML}

			</div>

		</div>


		<hr>


		<h5 class="mb-3">
			Galeria de Sprites
		</h5>


		<div class="row g-3">

			${spritesHTML}

		</div>
	`;
}


// Busca por nome ou ID
async function handleSearch() {

	const query = searchInput.value.trim();

	if (!query) {

		loadInitialPokemon();

		return;
	}

	showLoading(true);

	pokemonGrid.innerHTML = '';

	try {

		const pokemon = await fetchPokemonData(query);

		renderPokemonCard(pokemon);

	} catch (error) {

		showError(
			`Nenhum Pokémon encontrado com o termo "${query}".`
		);

	} finally {

		showLoading(false);

	}
}


// Mostrar loading
function showLoading(state) {

	if (state) {

		loading.classList.remove('d-none');

	} else {

		loading.classList.add('d-none');

	}
}


// Mostrar erro
function showError(message) {

	pokemonGrid.innerHTML = `
		<div class="col-12">

			<div
				class="alert alert-warning text-center"
				role="alert"
			>
				${message}
			</div>

		</div>
	`;
}


// Eventos
searchBtn.addEventListener(
	'click',
	handleSearch
);


searchInput.addEventListener(
	'keypress',
	(e) => {

		if (e.key === 'Enter') {
			handleSearch();
		}

	}
);


// Inicialização
loadInitialPokemon();