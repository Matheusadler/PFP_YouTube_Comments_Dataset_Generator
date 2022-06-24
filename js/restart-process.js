/*
Autor: Matheus Adler
Este script é responsável pelos eventos de controle da página restart-process.html, tendo como evento principal 
exibir informações sobre os arquivos gerados e voltar para a tela de index.
*/
const { ipcRenderer } = require('electron'); // importa a função de comunicação com o processo principal da aplicação Electron

// o bloco abaixo é chamado quando o html for totalmente carregado
document.addEventListener('DOMContentLoaded', function(){

    var options = ipcRenderer.sendSync('get-options', ""); // pega os argumentos salvos na tela de index
    path_destiny = options[0]['args'][1]; // pega o caminho do diretório de destino
    query_string = options[0]['args'][3]; // pega a string de consulta

    let name_file = query_string.replace(/\s/g, '_'); // substitui os espaços por underlines
    document.getElementById("card-title").innerHTML = "Foram gerados dois arquivos na pasta " + path_destiny + ":"; // informa ao usuário onde os arquivos foram gerados
    document.getElementById("card-text").innerHTML = name_file + "_crawled.csv é o arquivo com os comentários coletados dos vídeos. <br>" +
                                                        name_file + "_preprocessed.csv é o arquivo com os comentários coletados dos vídeos após o processamento."; // informa ao usuário os nomes dos arquivos que foram gerados

    let returnButton = document.getElementById("returnButton"); // pega o botão de retorno
    returnButton.onclick = () => returnToIndex(); // quando o botão é clicado, chama a função de retorno para a tela inicial

})

function returnToIndex (){
    window.location.replace("../html/index.html"); // redireciona para a tela de index
}