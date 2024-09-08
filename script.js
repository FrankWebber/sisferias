function extrairInfo(texto, chave, ateCaracter = '') {
        const regex = new RegExp(chave + "\\s*:?\\s*(.*?)(?=" + ateCaracter + "|$)", "i");
        const match = texto.match(regex);
        return match ? match[1].trim() : '';
    }

    function calcularPeriodosFerias(dataAdmissao) {
        const hoje = new Date();
        let periodos = [];
        let dataInicio = new Date(dataAdmissao);
        let periodo = 1;

        while (dataInicio <= hoje) {
            let dataFim = new Date(dataInicio);
            dataFim.setFullYear(dataFim.getFullYear() + 1);
            dataFim.setDate(dataFim.getDate() - 1);

            periodos.push({
                periodo: periodo,
                inicio: new Date(dataInicio),
                fim: new Date(dataFim),
                anoReferencia: dataInicio.getFullYear(),
            });

            dataInicio = new Date(dataFim);
            dataInicio.setDate(dataInicio.getDate() + 1);
            periodo++;
        }

        return periodos;
    }

    function formatarDados() {
        const dadosSistema = document.getElementById('dadosSistema').value;
        const tabelaDados = document.getElementById('tabelaDados').getElementsByTagName('tbody')[0];
        tabelaDados.innerHTML = '';

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

        campos.forEach(campo => {
            const valor = extrairInfo(dadosSistema, campo.chave, campo.ate);
            if (valor) {
                const row = tabelaDados.insertRow();
                row.insertCell(0).textContent = campo.nome;
                row.insertCell(1).textContent = valor;
            }
        });

        document.getElementById('dadosFormatados').style.display = 'block';
        preencherFormulario(dadosSistema);
    }

    function preencherFormulario(dadosSistema) {
        document.getElementById('nome').value = extrairInfo(dadosSistema, 'Servidor:', 'ILS');
        document.getElementById('matricula').value = extrairInfo(dadosSistema, 'Mat:', 'Sit:');

        const cargoCompleto = extrairInfo(dadosSistema, 'Crg:', '$');
        const cargoMatch = cargoCompleto.match(/[A-Z][^:]+/);
        if (cargoMatch) {
            document.getElementById('cargo').value = cargoMatch[0].trim();
        } else {
            document.getElementById('cargo').value = '';
        }

        const lotacaoCompleta = extrairInfo(dadosSistema, 'U.A:', 'Carga');
        const lotacaoMatch = lotacaoCompleta.match(/\d+(.+)/);
        document.getElementById('lotacao').value = lotacaoMatch ? lotacaoMatch[1].trim() : lotacaoCompleta;

        const dataApresentacao = extrairInfo(dadosSistema, 'Data Apres:', 'Tipo Função');
        if (dataApresentacao) {
            const dataAdmissao = new Date(dataApresentacao.replace(/(\d{2})(\d{2})(\d{4})/, '$3-$2-$1'));
            document.getElementById('dataAdmissao').value = dataAdmissao.toISOString().split('T')[0];
            
            const hoje = new Date();
            const anoAtual = hoje.getFullYear();
            const dataInicioExercicio = new Date(anoAtual, dataAdmissao.getMonth(), dataAdmissao.getDate());
            if (hoje < dataInicioExercicio) {
                dataInicioExercicio.setFullYear(anoAtual - 1);
            }
            document.getElementById('exercicioInicio').value = dataInicioExercicio.toISOString().split('T')[0];

            const dataFimExercicio = new Date(dataInicioExercicio);
            dataFimExercicio.setFullYear(dataFimExercicio.getFullYear() + 1);
            dataFimExercicio.setDate(dataFimExercicio.getDate() - 1);
            document.getElementById('exercicioFim').value = dataFimExercicio.toISOString().split('T')[0];
        }

        const dataAtual = new Date();
        const mesAtual = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const anoAtual = dataAtual.getFullYear();
        document.getElementById('numero').value = `${mesAtual}/${anoAtual}`;

        validarCampos();
    }

    function validarCampos() {
        const campos = ['nome', 'matricula', 'cargo', 'lotacao', 'dataAdmissao', 'exercicioInicio', 'exercicioFim'];
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento.value) {
                elemento.classList.add('is-valid');
                elemento.classList.remove('is-invalid');
            } else {
                elemento.classList.add('is-invalid');
                elemento.classList.remove('is-valid');
            }
        });
    }

    function calcularDatasFerias() {
        const diasSolicitados = parseInt(document.getElementById('diasSolicitados').value) || 0;
        const dataInicio = new Date(document.getElementById('feriasInicio').value);
        
        if (!isNaN(dataInicio.getTime())) {
            const dataFim = new Date(dataInicio);
            dataFim.setDate(dataInicio.getDate() + diasSolicitados - 1);
            document.getElementById('feriasFim').value = dataFim.toISOString().split('T')[0];
            
            const dataRetorno = new Date(dataFim);
            dataRetorno.setDate(dataFim.getDate() + 1);
            document.getElementById('dataRetorno').value = dataRetorno.toISOString().split('T')[0];
        }
    }

    function numeroPorExtenso(numero) {
        const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
        const dezenas = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
        const dezenasEspeciais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];

        if (numero < 10) return unidades[numero];
        if (numero < 20) return dezenasEspeciais[numero - 10];
        if (numero < 100) {
            const dezena = Math.floor(numero / 10);
            const unidade = numero % 10;
            return dezenas[dezena] + (unidade ? ' e ' + unidades[unidade] : '');
        }
        return numero.toString();
    }

    function generateNewMemorandoNumber() {
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${month}/${year}-${randomNum}`;
    }

    function clearFormAndGenerateNewNumber() {
        document.getElementById('memorandoForm').reset();
        document.getElementById('memorando').style.display = 'none';
        document.getElementById('numero').value = generateNewMemorandoNumber();
        
        const formInputs = document.getElementById('memorandoForm').elements;
        for (let input of formInputs) {
            input.classList.remove('is-valid', 'is-invalid');
        }
    }

    document.getElementById('formatarDados').addEventListener('click', formatarDados);

    document.getElementById('diasSolicitados').addEventListener('input', calcularDatasFerias);
    document.getElementById('feriasInicio').addEventListener('input', calcularDatasFerias);

    document.getElementById('feriaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const dataAdmissao = new Date(document.getElementById('dataAdmissao').value);
        const periodos = calcularPeriodosFerias(dataAdmissao);
        
        const tbody = document.querySelector('#tabelaFerias tbody');
        tbody.innerHTML = '';
        
        periodos.forEach(p => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = `${p.periodo}º Período`;
            row.insertCell(1).textContent = p.inicio.toLocaleDateString('pt-BR');
            row.insertCell(2).textContent = p.fim.toLocaleDateString('pt-BR');
            row.insertCell(3).textContent = p.anoReferencia;
            const cellRadio = row.insertCell(4);
            const radioBtn = document.createElement('input');
            radioBtn.type = 'radio';
            radioBtn.name = 'periodoSelecionado';
            radioBtn.value = p.periodo;
            radioBtn.dataset.inicio = p.inicio.toISOString().split('T')[0];
            radioBtn.dataset.fim = p.fim.toISOString().split('T')[0];
            radioBtn.addEventListener('change', function() {
                document.getElementById('exercicioInicio').value = this.dataset.inicio;
                document.getElementById('exercicioFim').value = this.dataset.fim;
            });
            cellRadio.appendChild(radioBtn);
        });
        
        document.getElementById('resultados').style.display = 'block';
    });

    document.getElementById('memorandoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('memorando').style.display = 'block';
    });

    document.getElementById('limparFormulario').addEventListener('click', clearFormAndGenerateNewNumber);

    document.getElementById('gerarPdf').addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const numero = document.getElementById("numero").value;
        const nome = document.getElementById("nome").value;
        const cargo = document.getElementById("cargo").value;
        const matricula = document.getElementById("matricula").value;
        const lotacao = document.getElementById("lotacao").value;
        const exercicioInicio = new Date(document.getElementById("exercicioInicio").value).getFullYear();
        const diasSolicitados = document.getElementById("diasSolicitados").value;
        const feriasInicio = new Date(document.getElementById("feriasInicio").value).toLocaleDateString('pt-BR');
        const feriasFim = new Date(document.getElementById("feriasFim").value).toLocaleDateString('pt-BR');
        const observacoes = document.getElementById("observacoes").value;
        
        let yPos = 20;
        const lineHeight = 7;
        
        doc.text(`Manaus, ${dataAtual}`, 20, yPos); yPos += lineHeight * 2;
        doc.text(`MEMORANDO DE FÉRIAS Nº ${numero} – GPREV/DGP/SEDUC`, 20, yPos); yPos += lineHeight;
        doc.text(`DA: GERÊNCIA DE CADASTRO E APOSENTADORIA - GECAP/DGP`, 20, yPos); yPos += lineHeight;
        doc.text(`AO: ${lotacao}`, 20, yPos); yPos += lineHeight * 2;
        
        doc.text(`Senhor Diretor,`, 20, yPos); yPos += lineHeight * 2;
        
        const texto = `Pelo Presente, comunicamos que de acordo com o Artigo 62 da Lei nº 1.762 de 14 de novembro de 1986, ser-lhe-ão concedidos ao(à) servidor(a) ${nome}, cargo ${cargo}, matrícula ${matricula}, lotado(a) ${lotacao}, ${diasSolicitados} (${numeroPorExtenso(parseInt(diasSolicitados))}) dias de férias, referente ao exercício ${exercicioInicio} as quais deverão ser gozadas no período de ${feriasInicio} a ${feriasFim}.`;
        
        const linhas = doc.splitTextToSize(texto, 170);
        doc.text(linhas, 20, yPos);
        yPos += lineHeight * (linhas.length + 2);
        
        doc.text(`CIENTE EM:`, 20, yPos); yPos += lineHeight * 2;
        doc.text(`SERVIDOR (A):____________________________________________`, 20, yPos); yPos += lineHeight * 2;
        
        if (observacoes) {
            doc.text(`Obs.: ${observacoes}`, 20, yPos);
            yPos += lineHeight * 4;
        } else {
            doc.text(`Obs.: ___________________________________________________`, 20, yPos); yPos += lineHeight;
            doc.text(`__________________________________________________________`, 20, yPos); yPos += lineHeight;
            doc.text(`__________________________________________________________`, 20, yPos); yPos += lineHeight;
            doc.text(`__________________________________________________________`, 20, yPos); yPos += lineHeight * 2;
        }
        
        doc.text(`Atenciosamente,`, 20, yPos); yPos += lineHeight * 4;
        
        doc.text(`ANTONIA IONETE VIDINHA BARROSO`, 20, yPos); yPos += lineHeight;
        doc.text(`Gerente GPREV/DGP/SEDUC`, 20, yPos); yPos += lineHeight;
        doc.text(`Decreto de 03/08/2023`, 20, yPos); yPos += lineHeight * 2;
        
        doc.text(`Mauro Frank Lima de Lima`, 20, yPos); yPos += lineHeight;
        doc.text(`ASSISTENTE TECNICO PNM.ANM-III`, 20, yPos); yPos += lineHeight;
        doc.text(`Matrícula 227341-1A`, 20, yPos);
        
        doc.save("memorando_ferias.pdf");
    });
