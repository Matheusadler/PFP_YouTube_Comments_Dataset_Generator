const { ipcRenderer } = require('electron'); // importa a função de comunicação com o processo principal da aplicação Electron
const path = require('path'); // importa o sistema de arquivos

// o bloco abaixo é chamado quando o html for totalmente carregado
document.addEventListener('DOMContentLoaded', function () {

    let buttonPathDestiny = document.getElementById("buttonPathDestiny");
    buttonPathDestiny.onclick = () => selectDirDestiny();

    let confirmButton = document.getElementById("confirmButton");
    confirmButton.onclick = () => validateInputs();
})

// essa função checa se todos os campos foram preenchidos na tela de index
function validateInputs() {
    let path_destiny = document.getElementById("inputPathDestiny").value; // pega o valor do input do diretório de destino
    let query_string = document.getElementById("queryString").value; // pega o valor do input da string de busca
    let requiredSpanPathDestiny = document.getElementById("spanPathDestiny"); // pega o span que mostra o erro do diretório de destino
    let requiredSpanQueryString = document.getElementById("spanQueryString"); // pega o span que mostra o erro da string de busca
    let valideInputs = false; // chave para saber se todos os campos foram preenchidos


    if (path_destiny == "") { // checa se o campo do diretório de destino está vazio
        requiredSpanPathDestiny.hidden = false; // se estiver vazio, mostra o span de erro
        path_destiny.required = true; // marca o campo como obrigatório
        valideInputs = false; // se o campo estiver vazio, não é válido
    } else {
        requiredSpanPathDestiny.hidden = true; // se o campo não estiver vazio, esconde o span de erro
        path_destiny.required = false; // desmarca o campo como obrigatório
        valideInputs = true; // se o campo não estiver vazio, é válido
    }

    if (query_string == "") { // checa se o campo da string de busca está vazio
        requiredSpanQueryString.hidden = false; // se estiver vazio, mostra o span de erro
        query_string.required = true; // marca o campo como obrigatório
        valideInputs = false; // se o campo estiver vazio, não é válido
    } else {
        requiredSpanQueryString.hidden = true; // se o campo não estiver vazio, esconde o span de erro
        query_string.required = false; // desmarca o campo como obrigatório
        valideInputs = true; // se o campo não estiver vazio, é válido
    }

    if (valideInputs) {
        getOptions(); // se todos os campos foram preenchidos, chama a função que pega os argumentos e envia para o script python
    }
}

async function getOptions() {
    let query_string = document.getElementById("queryString").value; // pega o valor do input da string de busca
    let path_destiny = document.getElementById("inputPathDestiny").value; // pega o valor do input do diretório de destino
    path_destiny = path_destiny.replace(/\\/g, "/"); // substitui os caracteres de barra por barra invertida

    // define os argumentos que serão passados para o script em python
    let options = {
        scriptPath: path.join(__dirname, '../py/'), // caminho do script python
        args: ['--path-destiny', path_destiny, '--query-string', query_string] // argumentos
    };

    ipcRenderer.send('save-options', [options]); // evento que salva os argumentos

    window.location.replace("../html/search-videos.html"); // redireciona para a página de busca de vídeos
}

// este método abre uma janela para a seleção do diretório de destino para salvar o arquivo csv final
function selectDirDestiny() {
    let selected_path = ipcRenderer.sendSync('select-directory', ""); // chama o evento 'select-directory' definido no script main.js

    if (selected_path != undefined) { // checa se ao menos um diretório foi selecionado
        inputPathDestiny.value = selected_path; // se sim, carrega o input do diretório com o respectivo caminho selecionado
    }
}