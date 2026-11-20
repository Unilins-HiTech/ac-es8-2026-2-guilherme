
const URL_API = 'https://backend-aula09-guilherme.onrender.com/pacientes';
const URL_VIACEP = 'https://viacep.com.br/ws';

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagem = document.getElementById('mensagem');
const mensagemCarregando = document.getElementById('carregando');

const campoId = document.getElementById('id');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoNascimento = document.getElementById('nascimento');

const campoCep = document.getElementById('cep');
const campoLogradouro = document.getElementById('logradouro');
const campoCidade = document.getElementById('cidade');
const campoUf = document.getElementById('uf');
const cepAjuda = document.getElementById('cep-ajuda');

const botaoSalvar = document.getElementById('btn-salvar');
const botaoCancelar = document.getElementById('btn-cancelar');

let controladorCep = null;

function formatarData(dataISO) {
  if (!dataISO) return '-';

  // Aceita tanto YYYY-MM-DD quanto datas ISO completas
  const [ano, mes, dia] = dataISO.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarCidadeUf(paciente) {
  if (!paciente.cidade) {
    return '-';
  }

  return paciente.uf
    ? `${paciente.cidade}/${paciente.uf}`
    : paciente.cidade;
}

function mostrarMensagem(texto, tipo = 'danger') {
  mensagem.innerHTML = '';

  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo}`;
  alerta.textContent = texto;

  mensagem.appendChild(alerta);
}

function criarCelula(texto) {
  const celula = document.createElement('td');
  celula.textContent = texto ?? '-';
  return celula;
}

// Verificar respostas da API
async function verificarResposta(resposta) {
  if (!resposta.ok) {
    let mensagemErro = `Erro HTTP: ${resposta.status}`;

    try {
      const dados = await resposta.json();
      mensagemErro = dados.erro || mensagemErro;
    } catch {
      // Mantém a mensagem original
    }

    throw new Error(mensagemErro);
  }

  return resposta;
}

// Consultar endereço na API ViaCEP
async function buscarEndereco(cep) {
  // Cancela uma consulta anterior, se existir
  if (controladorCep) {
    controladorCep.abort();
  }

  const controlador = new AbortController();
  controladorCep = controlador;

  cepAjuda.textContent = 'Buscando endereço...';
  cepAjuda.className = 'form-text text-primary';

  try {
    const resposta = await fetch(
      `${URL_VIACEP}/${cep}/json/`,
      { signal: controlador.signal }
    );

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const dados = await resposta.json();

    // Ignora respostas de consultas antigas
    if (campoCep.value !== cep || controladorCep !== controlador) {
      return;
    }

    // ViaCEP retorna erro: true quando o CEP não existe
    if (dados.erro) {
      cepAjuda.textContent =
        'CEP não encontrado. Preencha o endereço manualmente.';
      cepAjuda.className = 'form-text text-danger';
      return;
    }

    campoLogradouro.value = dados.logradouro || '';
    campoCidade.value = dados.localidade || '';
    campoUf.value = dados.uf || '';

    cepAjuda.textContent =
      'Endereço preenchido automaticamente!';
    cepAjuda.className = 'form-text text-success';

  } catch (erro) {
    if (erro.name === 'AbortError') {
      return;
    }

    console.error(erro);

    if (campoCep.value === cep && controladorCep === controlador) {
      cepAjuda.textContent =
        'Não foi possível consultar o CEP. Preencha manualmente.';
      cepAjuda.className = 'form-text text-danger';
    }
  } finally {
    if (controladorCep === controlador) {
      controladorCep = null;
    }
  }
}

// Detectar quando o usuário digitar o CEP
campoCep.addEventListener('input', () => {
  campoCep.value = campoCep.value
    .replace(/\D/g, '')
    .slice(0, 8);

  if (controladorCep) {
    controladorCep.abort();
    controladorCep = null;
  }

  // Limpa endereço anterior ao alterar o CEP
  campoLogradouro.value = '';
  campoCidade.value = '';
  campoUf.value = '';

  if (campoCep.value.length === 8) {
    buscarEndereco(campoCep.value);
  } else {
    cepAjuda.textContent = '';
    cepAjuda.className = 'form-text';
  }
});

// Exibir pacientes na tabela
function renderizarTabela(pacientes) {
  tabela.innerHTML = '';

  pacientes.forEach(paciente => {
    const linha = document.createElement('tr');

    linha.appendChild(criarCelula(paciente.nome));
    linha.appendChild(criarCelula(paciente.email));
    linha.appendChild(
      criarCelula(formatarData(paciente.nascimento))
    );

    linha.appendChild(
      criarCelula(formatarCidadeUf(paciente))
    );

    const celulaAcoes = document.createElement('td');

    const botaoEditar = document.createElement('button');
    botaoEditar.textContent = 'Editar';
    botaoEditar.className =
      'btn btn-sm btn-outline-primary me-2';

    botaoEditar.addEventListener('click', () => {
      iniciarEdicao(paciente);
    });

    const botaoExcluir = document.createElement('button');
    botaoExcluir.textContent = 'Excluir';
    botaoExcluir.className =
      'btn btn-sm btn-outline-danger';

    botaoExcluir.addEventListener('click', () => {
      excluirPaciente(paciente.id);
    });

    celulaAcoes.appendChild(botaoEditar);
    celulaAcoes.appendChild(botaoExcluir);

    linha.appendChild(celulaAcoes);
    tabela.appendChild(linha);
  });
}

// Preencher formulário para edição
function iniciarEdicao(paciente) {
  if (controladorCep) {
    controladorCep.abort();
    controladorCep = null;
  }

  campoId.value = paciente.id;
  campoNome.value = paciente.nome;
  campoEmail.value = paciente.email;
  campoNascimento.value = paciente.nascimento
    ? paciente.nascimento.slice(0, 10)
    : '';

  campoCep.value = paciente.cep ?? '';
  campoLogradouro.value = paciente.logradouro ?? '';
  campoCidade.value = paciente.cidade ?? '';
  campoUf.value = paciente.uf ?? '';

  cepAjuda.textContent = '';
  cepAjuda.className = 'form-text';

  botaoSalvar.textContent = 'Atualizar';
  botaoCancelar.classList.remove('d-none');

  campoNome.focus();
}

// Limpar formulário
function limparFormulario() {
  if (controladorCep) {
    controladorCep.abort();
    controladorCep = null;
  }

  formulario.reset();
  campoId.value = '';

  cepAjuda.textContent = '';
  cepAjuda.className = 'form-text';

  botaoSalvar.textContent = 'Salvar';
  botaoCancelar.classList.add('d-none');
}

// GET - Listar pacientes
async function listarPacientes() {
  try {
    const resposta = await fetch(URL_API);

    await verificarResposta(resposta);

    const pacientes = await resposta.json();

    renderizarTabela(pacientes);
    mensagemCarregando.style.display = 'none';

  } catch (erro) {
    console.error(erro);
    mensagemCarregando.style.display = 'none';

    mostrarMensagem(
      `Não foi possível carregar os pacientes: ${erro.message}`
    );
  }
}

// POST - Cadastrar ou PUT - Editar
async function salvarPaciente(dados, id) {
  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `${URL_API}/${id}` : URL_API;

  const resposta = await fetch(url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  await verificarResposta(resposta);
}

// DELETE - Excluir paciente
async function excluirPaciente(id) {
  if (!confirm('Deseja realmente excluir este paciente?')) {
    return;
  }

  try {
    const resposta = await fetch(`${URL_API}/${id}`, {
      method: 'DELETE'
    });

    await verificarResposta(resposta);

    mostrarMensagem(
      'Paciente excluído com sucesso.',
      'success'
    );

    await listarPacientes();

  } catch (erro) {
    console.error(erro);
    mostrarMensagem(erro.message);
  }
}

// Enviar formulário
formulario.addEventListener('submit', async event => {
  event.preventDefault();

  const dados = {
    nome: campoNome.value,
    email: campoEmail.value,
    nascimento: campoNascimento.value,
    cep: campoCep.value,
    logradouro: campoLogradouro.value,
    cidade: campoCidade.value,
    uf: campoUf.value
  };

  botaoSalvar.disabled = true;

  try {
    await salvarPaciente(dados, campoId.value);

    mostrarMensagem(
      'Paciente salvo com sucesso.',
      'success'
    );

    limparFormulario();
    await listarPacientes();

  } catch (erro) {
    console.error(erro);
    mostrarMensagem(erro.message);
  } finally {
    botaoSalvar.disabled = false;
  }
});

// Cancelar edição
botaoCancelar.addEventListener('click', limparFormulario);

// Carregar pacientes ao iniciar
listarPacientes();
