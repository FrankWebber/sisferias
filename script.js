  // Função para extrair informações específicas de um texto com base em uma chave e um delimitador opcional
function extrairInfo(texto, chave, ateCaracter = '') {
    // Cria uma expressão regular dinâmica baseada nos parâmetros fornecidos
    // O padrão procura pela 'chave', possivelmente seguida de dois pontos e espaços, captura o conteúdo até o 'ateCaracter' ou o fim da linha
    const regex = new RegExp(chave + "\\s*:?\\s*(.*?)(?=" + ateCaracter + "|$)", "i");
    
    // Executa a expressão regular no texto fornecido
    const match = texto.match(regex);
    
    // Se houver correspondência, retorna o grupo capturado, removendo espaços extras; caso contrário, retorna uma string vazia
    return match ? match[1].trim() : '';
}

// Função para calcular os períodos de férias com base na data de admissão
function calcularPeriodosFerias(dataAdmissao) {
    // Obtém a data atual
    const hoje = new Date();
    
    // Inicializa um array para armazenar os períodos de férias
    let periodos = [];
    
    // Converte a data de admissão em um objeto Date
    let dataInicio = new Date(dataAdmissao);
    
    // Inicializa o contador de períodos
    let periodo = 1;

    // Loop enquanto a data de início for anterior à data atual
    while (dataInicio < hoje) {
        // Cria uma nova data de fim adicionando um ano à data de início
        let dataFim = new Date(dataInicio);
        dataFim.setFullYear(dataFim.getFullYear() + 1);
        
        // Ajusta a data de início para o dia seguinte ao fim do período atual
        dataInicio.setDate(dataFim.getDate() + 1);

        // Adiciona o período calculado ao array de períodos
        periodos.push({
            periodo: periodo,
            inicio: new Date(dataInicio),
            fim: new Date(dataFim),
            anoReferencia: dataInicio.getFullYear(),
        });

        // Avança a data de início para o próximo ano
        dataInicio.setFullYear(dataInicio.getFullYear() + 1);
        
        // Incrementa o contador de períodos
        periodo++;
    }

    // Retorna o array de períodos calculados
    return periodos;
}

// Função para formatar os dados extraídos e preencher a tabela na interface
function formatarDados() {
    // Obtém o texto dos dados do sistema inserido pelo usuário
    const dadosSistema = document.getElementById('dadosSistema').value;
    
    // Obtém o corpo da tabela onde os dados serão inseridos
    const tabelaDados = document.getElementById('tabelaDados').getElementsByTagName('tbody')[0];
    
    // Limpa o conteúdo anterior da tabela
    tabelaDados.innerHTML = '';

    // Define os campos que serão extraídos, com suas respectivas chaves e delimitadores
    const campos = [
        { nome: 'Servidor', chave: 'Servidor:', ate: 'ILS' },
        { nome: 'Matrícula', chave: 'Mat:', ate: 'Sit:' },
        { nome: 'Nome da Mãe', chave: 'Nome Mãe:', ate: 'Ano Adm' },
        { nome: 'Ano de Admissão', chave: 'Ano Adm:', ate: 'Nascto' },
        { nome: 'Data de Nascimento', chave: 'Nascto:', ate: 'Situação' },
        { nome: 'Situação', chave: 'Situação:', ate: 'Homol' },
        { nome: 'CPF', chave: 'C\\.P\\.F\\.:', ate: 'Local Apres' },
        { nome: 'Local de Apresentação', chave: 'Local Apres:', ate: 'Data Apres' },
        { nome: 'Data de Apresentação', chave: 'Data Apres:', ate: 'Tipo Função' },
        { nome: 'Tipo de Função', chave: 'Tipo Função:', ate: 'Vínculo' },
        { nome: 'Vínculo', chave: 'Vínculo:', ate: 'Tipo Objeto' },
        { nome: 'Cargo', chave: 'Crg:', ate: '$' }
    ];

    // Itera sobre cada campo para extrair e inserir os dados na tabela
    campos.forEach(campo => {
        // Usa a função extrairInfo para obter o valor do campo
        const valor = extrairInfo(dadosSistema, campo.chave, campo.ate);
        
        // Se o valor foi encontrado, insere uma nova linha na tabela com o nome do campo e o valor extraído
        if (valor) {
            const row = tabelaDados.insertRow();
            row.insertCell(0).textContent = campo.nome;
            row.insertCell(1).textContent = valor;
        }
    });

    // Exibe a seção de dados formatados na interface
    document.getElementById('dadosFormatados').style.display = 'block';
    
    // Chama a função para preencher o formulário com os dados extraídos
    preencherFormulario(dadosSistema);
}

// Função para preencher o formulário com os dados extraídos do texto
function preencherFormulario(dadosSistema) {
    // Preenche o campo 'nome' com o valor extraído
    document.getElementById('nome').value = extrairInfo(dadosSistema, 'Servidor:', 'ILS');
    
    // Preenche o campo 'matricula' com o valor extraído
    document.getElementById('matricula').value = extrairInfo(dadosSistema, 'Mat:', 'Sit:');

    // Extrai o cargo completo e aplica uma expressão regular para obter o cargo específico
    const cargoCompleto = extrairInfo(dadosSistema, 'Crg:', '$');
    const cargoMatch = cargoCompleto.match(/[A-Z][^:]+/);
    if (cargoMatch) {
        // Se encontrar correspondência, preenche o campo 'cargo' com o valor encontrado
        document.getElementById('cargo').value = cargoMatch[0].trim();
    } else {
        // Caso contrário, deixa o campo vazio
        document.getElementById('cargo').value = '';
    }

    // Extrai a lotação completa e aplica uma expressão regular para obter a parte relevante
    const lotacaoCompleta = extrairInfo(dadosSistema, 'U.A:', 'Carga');
    const lotacaoMatch = lotacaoCompleta.match(/\d+(.+)/);
    // Preenche o campo 'lotacao' com o valor extraído ou a lotação completa se não houver correspondência
    document.getElementById('lotacao').value = lotacaoMatch ? lotacaoMatch[1].trim() : lotacaoCompleta;

    // Extrai a data de apresentação e converte para o formato de data
    const dataApresentacao = extrairInfo(dadosSistema, 'Data Apres:', 'Tipo Função');
    if (dataApresentacao) {
        // Converte a data para o formato ISO (YYYY-MM-DD)
        const dataAdmissao = new Date(dataApresentacao.replace(/(\d{2})(\d{2})(\d{4})/, '$3-$2-$1'));
        document.getElementById('dataAdmissao').value = dataAdmissao.toISOString().split('T')[0];
        
        // Calcula o início e o fim do exercício com base na data de admissão
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const dataInicioExercicio = new Date(anoAtual, dataAdmissao.getMonth(), dataAdmissao.getDate());
        
        // Se a data atual for antes do início do exercício, ajusta o ano para o anterior
        if (hoje < dataInicioExercicio) {
            dataInicioExercicio.setFullYear(anoAtual - 1);
        }
        // Preenche os campos de início e fim do exercício
        document.getElementById('exercicioInicio').value = dataInicioExercicio.toISOString().split('T')[0];

        const dataFimExercicio = new Date(dataInicioExercicio);
        dataFimExercicio.setFullYear(dataFimExercicio.getFullYear() + 1);
        dataFimExercicio.setDate(dataFimExercicio.getDate() - 1);
        document.getElementById('exercicioFim').value = dataFimExercicio.toISOString().split('T')[0];
    }

    // Preenche o campo 'numero' com o mês e o ano atuais
    const dataAtual = new Date();
    const mesAtual = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const anoAtual = dataAtual.getFullYear();
    document.getElementById('numero').value = `${mesAtual}/${anoAtual}`;

    // Chama a função para validar os campos do formulário
    validarCampos();
}

// Função para validar os campos obrigatórios do formulário
function validarCampos() {
    // Define os campos que serão validados
    const campos = ['nome', 'matricula', 'cargo', 'lotacao', 'dataAdmissao', 'exercicioInicio', 'exercicioFim'];
    
    // Itera sobre cada campo para verificar se está preenchido
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento.value) {
            // Se o campo estiver preenchido, adiciona a classe 'is-valid' e remove 'is-invalid'
            elemento.classList.add('is-valid');
            elemento.classList.remove('is-invalid');
        } else {
            // Se o campo estiver vazio, adiciona a classe 'is-invalid' e remove 'is-valid'
            elemento.classList.add('is-invalid');
            elemento.classList.remove('is-valid');
        }
    });
}

// Função para calcular as datas de fim das férias e de retorno
function calcularDatasFerias() {
    // Obtém o número de dias solicitados, garantindo que seja um número inteiro
    const diasSolicitados = parseInt(document.getElementById('diasSolicitados').value) || 0;
    
    // Obtém a data de início das férias
    const dataInicio = new Date(document.getElementById('feriasInicio').value);
    
    // Verifica se a data de início é válida
    if (!isNaN(dataInicio.getTime())) {
        // Calcula a data de fim das férias adicionando os dias solicitados
        const dataFim = new Date(dataInicio);
        dataFim.setDate(dataInicio.getDate() + diasSolicitados + 1);
        document.getElementById('feriasFim').value = dataFim.toISOString().split('T')[0];
        
        // Calcula a data de retorno adicionando um dia à data de fim das férias
        const dataRetorno = new Date(dataFim);
        dataRetorno.setDate(dataFim.getDate() + 1);
        document.getElementById('dataRetorno').value = dataRetorno.toISOString().split('T')[0];
    }
}

// Função para converter um número em seu equivalente por extenso (apenas para números menores que 100)
function numeroPorExtenso(numero) {
    // Arrays com as representações por extenso das unidades e dezenas
    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezenas = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const dezenasEspeciais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];

    // Verifica o intervalo do número e retorna a representação por extenso correspondente
    if (numero < 10) return unidades[numero];
    if (numero < 20) return dezenasEspeciais[numero - 10];
    if (numero < 100) {
        const dezena = Math.floor(numero / 10);
        const unidade = numero % 10;
        return dezenas[dezena] + (unidade ? ' e ' + unidades[unidade] : '');
    }
    // Se o número for maior ou igual a 100, retorna o próprio número como string
    return numero.toString();
}

// Adiciona um evento ao botão 'formatarDados' para chamar a função formatarDados ao ser clicado
document.getElementById('formatarDados').addEventListener('click', formatarDados);

// Adiciona eventos aos campos 'diasSolicitados' e 'feriasInicio' para recalcular as datas de férias quando alterados
document.getElementById('diasSolicitados').addEventListener('input', calcularDatasFerias);
document.getElementById('feriasInicio').addEventListener('input', calcularDatasFerias);

// Adiciona um evento ao formulário de férias para processar o cálculo dos períodos de férias ao ser submetido
document.getElementById('feriaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Exibe o spinner de carregamento
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';
    
    // Simula um atraso para processamento (pode ser removido em produção)
    setTimeout(() => {
        // Obtém a data de admissão e calcula os períodos de férias
        const dataAdmissao = new Date(document.getElementById('dataAdmissao').value);
        const periodos = calcularPeriodosFerias(dataAdmissao);
        
        // Limpa o conteúdo anterior da tabela de períodos de férias
        const tbody = document.querySelector('#tabelaFerias tbody');
        tbody.innerHTML = '';
        
        // Popula a tabela com os períodos calculados
        periodos.forEach(p => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = `${p.periodo}º Período`;
            row.insertCell(1).textContent = p.inicio.toLocaleDateString('pt-BR');
            row.insertCell(2).textContent = p.fim.toLocaleDateString('pt-BR');
            row.insertCell(3).textContent = p.anoReferencia;
            
            // Cria um botão de rádio para seleção do período
            const cellRadio = row.insertCell(4);
            const radioBtn = document.createElement('input');
            radioBtn.type = 'radio';
            radioBtn.name = 'periodoSelecionado';
            radioBtn.value = p.periodo;
            radioBtn.dataset.inicio = p.inicio.toISOString().split('T')[0];
            radioBtn.dataset.fim = p.fim.toISOString().split('T')[0];
            
            // Adiciona um evento para atualizar os campos de exercício ao selecionar um período
            radioBtn.addEventListener('change', function() {
                document.getElementById('exercicioInicio').value = this.dataset.inicio;
                document.getElementById('exercicioFim').value = this.dataset.fim;
            });
            cellRadio.appendChild(radioBtn);
        });
        
        // Exibe a seção de resultados e oculta o spinner de carregamento
        document.getElementById('resultados').style.display = 'block';
        loadingSpinner.style.display = 'none';
    }, 1000);
});

// Adiciona um evento ao formulário de memorando para exibir uma mensagem de sucesso ao ser submetido
document.getElementById('memorandoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('memorando').style.display = 'block';
    
    // Cria um elemento de alerta para notificar o usuário
    const alert = document.createElement('div');
    alert.className = 'alert alert-success fade-in';
    alert.textContent = 'Memorando gerado com sucesso!';
    document.getElementById('memorando').appendChild(alert);
    
    // Remove o alerta após 3 segundos
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
});

// Adiciona um evento ao botão 'gerarPdf' para gerar o memorando em PDF usando jsPDF
document.getElementById('gerarPdf').addEventListener('click', function() {
    // Desestrutura o objeto jsPDF do namespace window.jspdf
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações iniciais do documento PDF
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Obtém os valores dos campos do formulário
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const numero = document.getElementById("numero").value;
    const nome = document.getElementById("nome").value;
    const cargo = document.getElementById("cargo").value;
    const matricula = document.getElementById("matricula").value;
    const lotacao = document.getElementById("lotacao").value;
    const exercicioInicio = new Date(document.getElementById("exercicioInicio").value);
    const exercicioFim = new Date(document.getElementById("exercicioFim").value);
    const diasSolicitados = document.getElementById("diasSolicitados").value;
    const feriasInicio = new Date(document.getElementById("feriasInicio").value);
    const feriasFim = new Date(document.getElementById("feriasFim").value);
    const observacoes = document.getElementById("observacoes").value;
    
    // Variáveis para controle de posição no documento
    let yPos = 20;
    const lineHeight = 7;
    
    // Adiciona o conteúdo ao documento PDF
    doc.text(`Manaus, ${dataAtual}`, 20, yPos); yPos += lineHeight * 2;
    doc.text(`MEMORANDO DE FÉRIAS Nº ${numero} – GPREV/DGP/SEDUC`, 20, yPos); yPos += lineHeight;
    doc.text(`DA: GERÊNCIA DE CADASTRO E APOSENTADORIA - GECAP/DGP`, 20, yPos); yPos += lineHeight;
    doc.text(`AO: ${lotacao}`, 20, yPos); yPos += lineHeight * 2;
    
    doc.text(`Senhor Diretor,`, 20, yPos); yPos += lineHeight * 2;
    
    // Texto principal do memorando, com os dados do servidor e das férias
    const texto = `Pelo Presente, comunicamos que de acordo com o Artigo 62 da Lei nº 1.762 de 14 de novembro de 1986, ser-lhe-ão concedidos ao(à) servidor(a) ${nome}, cargo ${cargo}, matrícula ${matricula}, lotado(a) ${lotacao}, ${diasSolicitados} (${numeroPorExtenso(parseInt(diasSolicitados))}) dias de férias, referente ao exercício ${exercicioInicio.getFullYear()} (${exercicioInicio.toLocaleDateString('pt-BR')} a ${exercicioFim.toLocaleDateString('pt-BR')}) as quais deverão ser gozadas no período de ${feriasInicio.toLocaleDateString('pt-BR')} a ${feriasFim.toLocaleDateString('pt-BR')}.`;
    
    // Quebra o texto em linhas para caber na largura da página
    const linhas = doc.splitTextToSize(texto, 170);
    doc.text(linhas, 20, yPos);
    yPos += lineHeight * (linhas.length + 2);
    
    // Adiciona campos para assinatura e observações
    doc.text(`CIENTE EM:`, 20, yPos); yPos += lineHeight * 2;
    doc.text(`SERVIDOR (A):____________________________________________`, 20, yPos); yPos += lineHeight * 2;
    
    if (observacoes) {
        // Se houver observações, adiciona ao documento
        doc.text(`Obs.: ${observacoes}`, 20, yPos);
        yPos += lineHeight * 4;
    } else {
        // Caso contrário, insere linhas em branco para observações
        doc.text(`Obs.: ___________________________________________________`, 20, yPos); yPos += lineHeight;
        doc.text(`__________________________________________________________`, 20, yPos); yPos += lineHeight;
        doc.text(`__________________________________________________________`, 20, yPos); yPos += lineHeight;
        doc.text(`__________________________________________________________`, 20, yPos); yPos += lineHeight * 2;
    }
    
    doc.text(`Atenciosamente,`, 20, yPos); yPos += lineHeight * 4;
    
    // Adiciona a assinatura do responsável
    doc.text(`ANTONIA IONETE VIDINHA BARROSO`, 20, yPos); yPos += lineHeight;
    doc.text(`Gerente GPREV/DGP/SEDUC`, 20, yPos); yPos += lineHeight;
    doc.text(`Decreto de 03/08/2023`, 20, yPos); yPos += lineHeight * 2;
    
    doc.text(`Mauro Frank Lima de Lima`, 20, yPos); yPos += lineHeight;
    doc.text(`ASSISTENTE TECNICO PNM.ANM-III`, 20, yPos); yPos += lineHeight;
    doc.text(`Matrícula 227341-1`, 20, yPos);
    
    // Salva o documento PDF com o nome especificado
    doc.save("memorando_ferias.pdf");
});

// Adiciona um evento ao botão 'limparFormulario' para resetar o formulário e ocultar o memorando
document.getElementById('limparFormulario').addEventListener('click', function() {
    // Reseta os campos do formulário
    document.getElementById('memorandoForm').reset();
    
    // Oculta a seção do memorando
    document.getElementById('memorando').style.display = 'none';
});
