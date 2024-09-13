function getCurrentDate() {
    return new Date(); // Current date
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function convertToTable() {
    const input = document.getElementById('inputText').value;
    
    const regex = {
        lotacao: /Lotacao:\s*([0-9.]+)\s*-\s*(.+?)\s*Ingresso:/,
        ingresso: /Ingresso:\s*(\w+)/,
        servidor: /Servidor:\s*(\d+\.\d+-\d+)\s*\w*\s*-\s*(.+?)\s*Status:/,
        status: /Status:\s*(\w+)/,
        horasTrabalhadas: /(\d{2}:\d{2})\s+(\d{2}:\d{2})\s+(\d{2}:\d{2})/,
        posse: /Posse\.+:\s*(\d{2}\/\d{2}\/\d{4})/,
        dtInicio: /Dt Inicio\.:\s*(\d{2}\/\d{2}\/\d{4})/,
        dtTermino: /Dt Termino\.:\s*(\d{2}\/\d{2}\/\d{4})?/,
        cargo: /Cargo\.+:\s*(.+?)\s*Posse/
    };

    const lotacaoMatch = input.match(regex.lotacao);
    const lotacao = lotacaoMatch ? `${lotacaoMatch[1]} - ${lotacaoMatch[2].trim()}` : '';
    const ingresso = input.match(regex.ingresso) ? input.match(regex.ingresso)[1] : '';
    
    const servidorMatch = input.match(regex.servidor);
    const matricula = servidorMatch ? servidorMatch[1] : '';
    const servidorNome = servidorMatch ? servidorMatch[2].trim() : '';
    
    const status = input.match(regex.status) ? input.match(regex.status)[1] : '';
    
    const horasMatch = input.match(regex.horasTrabalhadas);
    const horasTrabalhadas = horasMatch ? horasMatch[3] : '';
    const turno1 = horasMatch ? horasMatch[1] : '';
    const turno2 = horasMatch ? horasMatch[2] : '';
    
    const dtInicio = input.match(regex.dtInicio) ? input.match(regex.dtInicio)[1] : '';
    const dtTermino = input.match(regex.dtTermino) ? input.match(regex.dtTermino)[1] : 'Não especificado';
    
    const cargo = input.match(regex.cargo) ? input.match(regex.cargo)[1].trim() : '';
    const posse = input.match(regex.posse) ? input.match(regex.posse)[1] : '';

    const currentDate = formatDate(getCurrentDate());
    const table = `
      <table>
        <tr><th>Campo</th><th>Valor</th></tr>
        <tr><td>Lotação</td><td>${lotacao}</td></tr>
        <tr><td>Ingresso</td><td>${ingresso}</td></tr>
        <tr><td>Servidor</td><td>${servidorNome}</td></tr>
        <tr><td>Matrícula</td><td>${matricula}</td></tr>
        <tr><td>Status</td><td>${status}</td></tr>
        <tr><td>Horas Trabalhadas</td><td>${horasTrabalhadas}</td></tr>
        <tr><td>1º Turno</td><td>${turno1}</td></tr>
        <tr><td>2º Turno</td><td>${turno2}</td></tr>
        <tr><td>Data de Início</td><td>${dtInicio}</td></tr>
        <tr><td>Data de Término</td><td>${dtTermino}</td></tr>
        <tr><td>Cargo</td><td>${cargo}</td></tr>
        <tr><td>Posse</td><td>${posse}</td></tr>
        <tr><td>Data Atual</td><td>${currentDate}</td></tr>
      </table>
    `;

    document.getElementById('output').innerHTML = table;

    if (posse) {
        const [day, month, year] = posse.split('/').map(Number);
        const posseDate = new Date(year, month - 1, day);
        const exercicios = calculateExercicios(posseDate);

        let feriasTable = `
            <table>
                <tr>
                    <th>Exercício</th>
                    <th>Início</th>
                    <th>Até</th>
                    <th>Término</th>
                    <th>Selecionar</th>
                </tr>
        `;

        exercicios.forEach((ex, index) => {
            feriasTable += `
                <tr>
                    <td>${year + index}</td>
                    <td>${ex.inicio}</td>
                    <td>a</td>
                    <td>${ex.termino}</td>
                    <td><input type="radio" name="exercicio_selecionado" id="${ex.id}" value="${year + index}/${year + index + 1}" onchange="preencherExercicioSelecionado(this)"></td>
                </tr>
            `;
        });

        feriasTable += '</table>';
        document.getElementById('feriasOutput').innerHTML = feriasTable;
        
        preencherOpcoesPeriodo(exercicios);
    } else {
        document.getElementById('feriasOutput').innerHTML = '<p>Data de posse não encontrada.</p>';
    }
}

function calculateExercicios(posseDate) {
    let exercicios = [];
    let currentDate = getCurrentDate();
    let exercicioDate = new Date(posseDate);

    while (exercicioDate <= currentDate) {
        const start = new Date(exercicioDate);
        const end = new Date(exercicioDate);
        end.setFullYear(start.getFullYear() + 1);
        end.setDate(end.getDate() - 1);

        exercicios.push({
            id: `exercicio_${exercicios.length}`,
            inicio: formatDate(start),
            termino: formatDate(end),
            anoServico: exercicios.length + 1,
            periodoAquisitivoInicio: formatDate(start),
            periodoAquisitivoFim: formatDate(new Date(end.getFullYear(), end.getMonth(), end.getDate()))
        });

        exercicioDate.setFullYear(exercicioDate.getFullYear() + 1);
    }

    return exercicios;
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function calcularDataFinal(inicio, dias) {
    const [dia, mes, ano] = inicio.split('/').map(Number);
    let dataInicio = new Date(ano, mes - 1, dia);
    
    dataInicio.setDate(dataInicio.getDate() + parseInt(dias) - 1);
    
    const diaFinal = dataInicio.getDate().toString().padStart(2, '0');
    const mesFinal = (dataInicio.getMonth() + 1).toString().padStart(2, '0');
    const anoFinal = dataInicio.getFullYear();
    
    return `${diaFinal}/${mesFinal}/${anoFinal}`;
}

function gerarTexto() {
    const servidorNome = document.getElementById('servidorNome').value.trim();
    const cargo = document.getElementById('cargo').value.trim();
    const matricula = document.getElementById('matricula').value.trim();
    const lotacao = document.getElementById('lotacao').value.trim();
    const ingresso = document.getElementById('ingresso').value.trim();
    const diasFerias = document.getElementById('diasFerias').value.trim();
    const exercicio = document.getElementById('exercicio').value.trim();
    const inicioFerias = document.getElementById('inicioFerias').value.trim();
    const dataPosse = document.getElementById('dataPosse').value.trim();

    if (!servidorNome || !cargo || !matricula || !lotacao || !ingresso || !diasFerias || !exercicio || !inicioFerias || !dataPosse) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const diasFeriasNum = parseInt(diasFerias, 10);
    if (isNaN(diasFeriasNum) || diasFeriasNum <= 0 || diasFeriasNum > 30) {
        alert("Por favor, insira um número válido de dias de férias (1-30).");
        return;
    }

    const fimFerias = calcularDataFinal(inicioFerias, diasFerias);
    document.getElementById('fimFerias').value = fimFerias;

    const assistenteSelect = document.getElementById('assistente');
    const assistenteInfo = assistenteSelect.value.split('|');
    const assistenteNome = assistenteInfo[0];
    const assistenteCargo = assistenteInfo[1];
    const assistenteMatricula = assistenteInfo[2];

    const texto = `Senhor Diretor,

Pelo presente, comunicamos que de acordo com o Artigo 62 da Lei nº 1.762 de 14 de novembro de 1986, ser-lhe-ão concedidos ao(à) servidor(a) ${servidorNome}, cargo ${cargo}, matrícula ${matricula}, lotado(a) ${lotacao}, ingresso ${ingresso}, ${diasFerias} (${diasFeriasPorExtenso(diasFerias)}) dias de férias, referente ao exercício ${exercicio} (${exercicioFormatado(exercicio, dataPosse)}) as quais deverão ser gozadas no período de ${inicioFerias} a ${fimFerias}.

CIENTE EM: ____/____/________

SERVIDOR(A): ____________________________________________

Obs.: ________________________________________________________

Atenciosamente,

ANTONIA IONETE VIDINHA BARROSO
Gerente GPREV/DGP/SEDUC
Decreto de 03/08/2023

${assistenteNome}
${assistenteCargo}
Matrícula ${assistenteMatricula}`;

    document.getElementById('textoOutput').innerText = texto;
}

function diasFeriasPorExtenso(dias) {
    const numeros = ['ZERO', 'UM', 'DOIS', 'TRÊS', 'QUATRO', 'CINCO', 'SEIS', 'SETE', 'OITO', 'NOVE', 'DEZ',
                     'ONZE', 'DOZE', 'TREZE', 'QUATORZE', 'QUINZE', 'DEZESSEIS', 'DEZESSETE', 'DEZOITO', 'DEZENOVE', 'VINTE',
                     'VINTE E UM', 'VINTE E DOIS', 'VINTE E TRÊS', 'VINTE E QUATRO', 'VINTE E CINCO', 'VINTE E SEIS', 'VINTE E SETE', 'VINTE E OITO', 'VINTE E NOVE', 'TRINTA'];
    return numeros[parseInt(dias)] || dias;
}

function exercicioFormatado(exercicio, dataPosse) {
    const [anoInicio, anoFim] = exercicio.split('/');
    const dataInicioPeriodo = new Date(dataPosse);
    dataInicioPeriodo.setFullYear(parseInt(anoInicio));
    
    const dataFimPeriodo = new Date(dataInicioPeriodo);
    dataFimPeriodo.setFullYear(dataFimPeriodo.getFullYear() + 1);
    dataFimPeriodo.setDate(dataFimPeriodo.getDate() - 1);
    
    return `${formatDate(dataInicioPeriodo)} a ${formatDate(dataFimPeriodo)}`;
}

document.addEventListener('DOMContentLoaded', function() {
    formatarDataAtual();
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.target.id === 'output') {
                preencherFormulario();
            }
        });
    });

    observer.observe(document.getElementById('output'), { childList: true });
});

function formatarDataAtual() {
    const dataAtual = new Date();
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const ano = dataAtual.getFullYear();
    const dataFormatada = `${dia}/${mes}/${ano}`;
    document.getElementById('dataAtual').innerText = dataFormatada;
}

function preencherFormulario() {
    const table = document.querySelector('#output table');
    if (!table) return;

    const rows = table.querySelectorAll('tr');
    const data = {};

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 2) {
            data[cells[0].textContent.trim()] = cells[1].textContent.trim();
        }
    });

    document.getElementById('servidorNome').value = data['Servidor'] || '';
    document.getElementById('cargo').value = data['Cargo'] || '';
    document.getElementById('matricula').value = data['Matrícula'] || '';
    document.getElementById('lotacao').value = data['Lotação'] || '';
    document.getElementById('ingresso').value = data['Ingresso'] || '';
    
    if (data['Posse']) {
        const [day, month, year] = data['Posse'].split('/');
        const formattedPosse = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        document.getElementById('dataPosse').value = formattedPosse;
    }

    const currentYear = new Date().getFullYear();
    document.getElementById('exercicio').value = `${currentYear}/${currentYear + 1}`;
    document.getElementById('diasFerias').value = '30';

    const today = new Date();
    const startDate = new Date(today.setMonth(today.getMonth() + 3));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 29);

    document.getElementById('inicioFerias').value = formatDate(startDate);
    document.getElementById('fimFerias').value = formatDate(endDate);
}

document.getElementById('inicioFerias').addEventListener('change', updateFimFerias);
document.getElementById('diasFerias').addEventListener('change', updateFimFerias);

function updateFimFerias() {
    const inicioFerias = document.getElementById('inicioFerias').value.trim();
    const diasFerias = document.getElementById('diasFerias').value.trim();
    
    if (inicioFerias && diasFerias) {
        const fimFerias = calcularDataFinal(inicioFerias, diasFerias);
        document.getElementById('fimFerias').value = fimFerias;
    }
}

function preencherOpcoesPeriodo(exercicios) {
    const periodoFeriasDiv = document.getElementById('periodoFerias');
    periodoFeriasDiv.innerHTML = '';

    exercicios.forEach((ex, index) => {
        const option = document.createElement('div');
        option.className = 'radio-option';
        option.innerHTML = `
            <input type="radio" id="periodo${index}" name="periodoFerias" value="${index}">
            <label for="periodo${index}">${ex.inicio} a ${ex.termino}</label>
        `;
        periodoFeriasDiv.appendChild(option);

        option.querySelector('input[type="radio"]').addEventListener('change', function() {
            if (this.checked) {
                document.getElementById('exercicio').value = `${ex.inicio.split('/')[2]}/${parseInt(ex.inicio.split('/')[2]) + 1}`;
                document.getElementById('inicioFerias').value = ex.inicio;
                updateFimFerias();
            }
        });
    });
}

function preencherExercicioSelecionado(radio) {
    const exercicioSelecionado = radio.value;
    document.getElementById('exercicio').value = exercicioSelecionado;
    
    const [anoInicio, anoFim] = exercicioSelecionado.split('/');
    const dataPosse = new Date(document.getElementById('dataPosse').value);
    const inicioFerias = new Date(dataPosse);
    inicioFerias.setFullYear(parseInt(anoInicio));
    
    document.getElementById('inicioFerias').value = formatDate(inicioFerias);
    updateFimFerias();
}

function gerarTodosMemorandos() {
    const servidorNome = document.getElementById('servidorNome').value.trim();
    const cargo = document.getElementById('cargo').value.trim();
    const matricula = document.getElementById('matricula').value.trim();
    const dataPosse = document.getElementById('dataPosse').value.trim();

    if (!servidorNome || !cargo || !matricula || !dataPosse) {
        alert("Por favor, preencha todos os campos necessários.");
        return;
    }

    const exercicios = calculateExercicios(new Date(dataPosse));
    let memorandos = '';

    exercicios.forEach((ex, index) => {
        const currentDate = getCurrentDate();
        if (new Date(ex.termino.split('/').reverse().join('-')) > currentDate) {
            return; // Skip future exercises
        }

        const memorando = `Memorando N° ${(index + 1).toString().padStart(3, '0')}/${ex.inicio.split('/')[2]}-CPS/SEDUC
Manaus, 01/08/${ex.inicio.split('/')[2]}.

À Sra. Chefe do Departamento de Gestão de Pessoas/DGP

Assunto: Requerimento de Férias.

Venho respeitosamente solicitar, conforme documento anexo, o gozo de férias referente ao ${ex.anoServico}º ano de serviço, período aquisitivo de ${ex.periodoAquisitivoInicio} a ${ex.periodoAquisitivoFim}, a serem usufruídas no período de ${ex.inicio} a ${ex.termino}.

Atenciosamente,
${servidorNome}
${cargo}
Matrícula: ${matricula}

`;

        memorandos += memorando + '\n\n';
    });

    document.getElementById('todosMemorandos').innerText = memorandos;
}
