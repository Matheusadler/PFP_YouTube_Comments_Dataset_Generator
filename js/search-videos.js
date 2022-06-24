/*
Autor: Matheus Adler
Este script é responsável pelos eventos de controle da página index.html, tendo como evento principal 
a execução do script python search-videos.py e o load na tela de busca de vídeos.
*/
const { ipcRenderer } = require('electron'); // importa a função de comunicação com o processo principal da aplicação Electron
const { PythonShell } = require('python-shell'); // importa a biblioteca para execução de scripts python
var $ = jQuery = require('jquery'); // importa o jquery

// o bloco abaixo é chamado quando o html for totalmente carregado
document.addEventListener('DOMContentLoaded', function () {

    var args = ipcRenderer.sendSync('get-options', ""); // pega os argumentos salvos na tela de index
    options = args[0] 
    delete args

    PythonShell.run('search-videos.py', options, function (err, video_list) { // executa o script python "search-videos.py"
        if (err) { // se ocorrer algum erro
            $("#modalError").modal('show'); // mostra o modal de erro
            document.getElementById("msgError").innerHTML = "Algum problema ocorreu ao buscar os vídeos para sua pesquisa. Por favor, tente novamente."; // com essa mensagem de erro
        } else { // se não ocorrer nenhum erro
            ipcRenderer.send('save-video-length', [video_list]); // salva a quantidade de vídeos encontrados na pesquisa
            $("#modalSuccess").modal('show'); // mostra o modal de sucesso
            document.getElementById("msgSuccess").innerHTML = video_list + " vídeos encontrados com sucesso!"; // com essa mensagem de sucesso
        }
    });
})