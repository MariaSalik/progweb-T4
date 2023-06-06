//lista de disciplinas do aluno atual
let disciplinas_aluno = [];
let TCC_1 = [];
let TCC_2 = [];

$(document).ready(function() {

  document.addEventListener('contextmenu', event => event.preventDefault()); // remove o menu do botÃ£o direito
  $("button").click(function(){
    carregarXML();
    adicionarEventosClique();
  });
});

//carregamento das disciplinas do aluno
function carregarXML() {
    let grr = document.getElementById("grr").value;

    //limpa lista de disciplinas do aluno atual
    disciplinas_aluno = [];
    TCC_1 = [];
    TCC_2 = [];

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {

        let xmlDoc = xhr.responseXML;
        let alunos = xmlDoc.getElementsByTagName("ALUNO");
        for (let i = 0; i < alunos.length; i++) {
          let aluno = alunos[i];
          let matricula = aluno.getElementsByTagName("MATR_ALUNO")[0].childNodes[0].nodeValue;
          if(matricula == grr){
            let nome = aluno.getElementsByTagName("NOME_ATIV_CURRIC")[0].childNodes[0].nodeValue;
            let cod = aluno.getElementsByTagName("COD_ATIV_CURRIC")[0].childNodes[0].nodeValue; // código
            let tipo = aluno.getElementsByTagName("DESCR_ESTRUTURA")[0]?.childNodes[0]?.nodeValue || "";
            let periodo = aluno.getElementsByTagName("PERIODO")[0].childNodes[0].nodeValue; // semestre
            let ano = aluno.getElementsByTagName("ANO")[0].childNodes[0].nodeValue;
            let sigla = aluno.getElementsByTagName("SIGLA")[0]?.childNodes[0]?.nodeValue || "";     
            let nota = aluno.getElementsByTagName("MEDIA_FINAL")[0].childNodes[0].nodeValue;
            let freq = aluno.getElementsByTagName("FREQUENCIA")[0]?.childNodes[0]?.nodeValue || "";  // frequencia 

            let disciplina = {
              COD_ATIV_CURRIC: cod,
              NOME_ATIV_CURRIC: nome,
              ANO: ano,
              PERIODO: periodo,
              MEDIA_FINAL: nota,
              FREQUENCIA: freq,
              SIGLA: sigla,
              DESCR_ESTRUTURA: tipo
            };

            // adiciona nas listas
            if(tipo == "Trabalho de GraduaÃ§Ã£o I"){
              TCC_1.push(disciplina);
            }else if(tipo == "Trabalho de GraduaÃ§Ã£o II"){
              TCC_2.push(disciplina);
            }else{
              disciplinas_aluno.push(disciplina);
            }
          }
        }
        situacao_com_cor();
      }
    };
    xhr.open('GET', 'alunos.xml', true);
    xhr.send(); 
}

// adiciona evento de clique na tabela
function adicionarEventosClique() {

  $("td").off("click"); // remove os eventos de clique anteriores das celulas
  $("td").off("contextmenu");

  //botao de fechar modal
  $("span.close").on("click", function() {
    let modal = document.getElementById("modal");
    modal.style.display = "none";
  });

  //quando clica fora do modal
  window.onclick = function(event) {
    let modal = document.getElementById("modal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // botao esquerdo
  $("td").on("click", function(event) {
    let td = $(event.target).text();

    let last_time;
    if(td == "TG I"){
      last_time = last_tcc(TCC_1);
    }else if(td == "TG II"){
      last_time = last_tcc(TCC_2);
    }else{
      last_time  = last_time_disciplina(td, disciplinas_aluno);
    }

    if(last_time ){
      last_time  = formatarDados(last_time);
      console.log(last_time );
      exibirModal(last_time );
    }
  });

  // botao direito
  $("td").on("contextmenu", function(event) {
    let td = $(event.target).text();

    let historico;

    if(td == "TG I"){
      historico = hist_tcc(TCC_1);
    }else if(td == "TG II"){
      historico = hist_tcc(TCC_2);
    }else{  
      historico = historico_aluno(td, disciplinas_aluno);
    }

    if(historico.length > 0){
      let historicoString = "";
      for (let i = 0; i < historico.length; i++) {
        historicoString += formatarDados(historico[i]) + '<br>';
      }
      console.log(historicoString);
      exibirModal(historicoString);
    }
  });
}

 // Visualização com cores da situação do aluno na disciplina
function situacao_com_cor() {
  $("td").css("background-color", ""); // inicialmente, remove a cor de fundo de todas as cÃ©lulas 

  //para cada 
  $("td").each(function() {
    let last_time ;
    
    let td = $(this).text();
    if(td == "TG I"){
      last_time  = last_tcc(TCC_1);
    }else if(td == "TG II"){
      last_time  = last_tcc(TCC_2);
    }else{
      last_time  = last_time_disciplina(td, disciplinas_aluno);
    }
    
    if(last_time  != null){
      let sigla = last_time.SIGLA;
      
      if (sigla === "Aprovado"){
        $(this).css("background-color", "green");
      }else if (sigla === "Reprovado" || sigla === "Cancelado" || sigla === "Repr. Freq" || sigla === "Tr. Total") {
        $(this).css("background-color", "red");
      }else if (sigla === "Matricula"){
        $(this).css("background-color", "pourple");
      }else if (sigla === "Equivale"){
        $(this).css("background-color", "orange");
      }else {
        $(this).css("background-color", "white");

      }
    }   
  });
}

// retorna historico completo do aluno na disciplina de tcc (I ou II) 
function hist_tcc(disciplinas_aluno) {

  hist_aluno = [];

  for (let i = 0; i < disciplinas_aluno.length; i++) {
    let disciplina = disciplinas_aluno[i];
    hist_aluno.push(disciplina);
  }
  return hist_aluno;

}

// Retorna a última vez que a disciplina TCC1 ou TCC2 foi cursado pelo aluno
function last_tcc(disciplinas_aluno) {

  let last = null;
  let a = 0; // ano
  let periodo = 0; // semestre

  for (let i = 0; i <disciplinas_aluno.length; i++) {
    let disciplina = disciplinas_aluno[i];
    if (disciplina.ANO > a || (disciplina.ANO === a && disciplina.PERIODO > periodo)) {
      a = disciplina.ANO;
      periodo = disciplina.PERIODO;
      last = disciplina;
    }
  }
  return last;
}

// retorna historico completo do aluno na disciplina
function historico_aluno(codigoDisciplina, disciplinas_aluno) {

  hist_aluno = [];

  for (let i = 0; i < disciplinas_aluno.length; i++) {
    let disciplina = disciplinas_aluno[i];
    if (disciplina.COD_ATIV_CURRIC == codigoDisciplina) {
      hist_aluno.push(disciplina);
    }
  }
  return hist_aluno;

}

// Retorna a última vez que a disciplina foi cursado pelo aluno
function last_time_disciplina(codigoDisciplina, disciplinas_aluno) {

  let last = null;
  let a = 0;  // ano
  let periodo = 0;  // semestre

  for (let i = 0; i < disciplinas_aluno.length; i++) {
    let disciplina = disciplinas_aluno[i];
    if (disciplina.COD_ATIV_CURRIC == codigoDisciplina) {
      if (disciplina.ANO > a|| (disciplina.ANO === a && disciplina.PERIODO > periodo)) {
        a = disciplina.ANO;
        periodo = disciplina.PERIODO;
        last = disciplina;
      }
    }
  }
  return last;
}

// transforma struct disciplina para string
function formatarDados(last_time ) {
  let resultado = '';
  resultado += 'Código: ' + last_time .COD_ATIV_CURRIC + '<br>';
  resultado += 'Disciplina: ' + last_time .NOME_ATIV_CURRIC + '<br>';
  resultado += 'Última vez cursada: ' + last_time .ANO + '/' + last_time .PERIODO + '<br>';
  resultado += 'Nota: ' + last_time .MEDIA_FINAL + '<br>';
  resultado += 'Frequência: ' + last_time .FREQUENCIA + '<br>';
  resultado += 'Sigla: ' + last_time .SIGLA + '<br>';

  return resultado;
}

//funcao que exibe o modal
function exibirModal(historicoString) {
  let modalBody = document.getElementById("modalBody");
  modalBody.innerHTML = historicoString;

  let modal = document.getElementById("modal");
  modal.style.display = "block";
}
