const { ipcRenderer } = require('electron'); // importa a função de comunicação com o processo principal da aplicação Electron

// o bloco abaixo é chamado quando o html for totalmente carregado
document.addEventListener('DOMContentLoaded', function(){

    var options = ipcRenderer.sendSync('get-options', ""); // pega os argumentos salvos na tela de index
    path_destiny = options[0]['args'][1]; // pega o caminho do diretório de destino
    query_string = options[0]['args'][3]; // pega a string de consulta

    document.getElementById("card-title").innerHTML = "Foram gerados dois arquivos na pasta " + path_destiny + ":"; // exibe onde os arquivos foram salvos
    document.getElementById("card-text").innerHTML = query_string + "_crawled.csv é o arquivo de comentários coletados dos vídeos. <br>" +
                                                        query_string + "_preprocessed.csv é o arquivo de comentários coletados dos vídeos após o processamento."; // exibe os arquivos que foram gerados

    let returnButton = document.getElementById("returnButton"); // pega o botão de retorno
    returnButton.onclick = () => returnToIndex(); // define o evento do botão para voltar para a tela inicial

})

function returnToIndex (){
    window.location.replace("../html/index.html"); // redireciona para a tela de index
}