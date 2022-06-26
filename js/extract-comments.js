/*
Autor: Matheus Adler
Este script é responsável pelos eventos de controle da página extract-comments.html, tendo como evento principal 
a chamada do script python extract-comments.py e a barra de progresso da coleta de comentários.
*/

const { ipcRenderer } = require('electron'); // importa a função de comunicação com o processo principal da aplicação Electron
const { PythonShell } = require('python-shell'); // importa a biblioteca para execução de scripts python
const fs = require('fs'); // importa sistema de arquivos do JavaScript
const readline = require('readline'); // importa biblioteca para leitura de arquivos
var $ = jQuery = require('jquery'); // importa o jquery

// o bloco abaixo é chamado quando o html for totalmente carregado
document.addEventListener('DOMContentLoaded', function () {
    var args = ipcRenderer.sendSync('get-options', ""); // [array] pega os argumentos salvos na tela de index
    options = args[0] // [object] pega o objeto com os argumentos
    delete args

    var video_list = ipcRenderer.sendSync('get-video-length', ""); // [integer] pega a quantidade de vídeos encontrados na pesquisa
    var file = 'count.txt'; // [string] cria o arquivo de texto "count.txt" que será usado para salvar a quantidade de vídeos encontrados, essa informação é necessária para a barra de progresso
    var progress = 0; // [integer] inicializa a barra de progresso com o valor 0

    // o bloco abaixo executa o script python "extract-comments.py" 
    PythonShell.run('extract_comments.py', options, function (err, comments) { 
        if (err) { // se ocorrer algum erro 
            $("#modalError").modal('show'); // mostra o modal de erro
            document.getElementById("msgError").innerHTML = "Algum problema ocorreu ao extrair os comentários dos vídeos para sua pesquisa. Por favor, tente novamente."; // com essa mensagem de erro
        }else { // se não ocorrer nenhum erro
            ipcRenderer.send('save-comments-length', [comments]); // salva a quantidade de comentários extraidos dos vídeos
            $("#modalSuccess").modal('show'); // mostra o modal de sucesso
            document.getElementById("msgSuccess").innerHTML = comments + " comentários foram extraidos com sucesso!"; // com essa mensagem de sucesso
        }
    });

    let delay = 1000; // 1 segundo   
    var iID = setInterval(function () { // essa função é chamada a cada 1 segundo
        if (progress >= video_list) { // se o valor da barra de progresso for maior ou igual a quantidade de vídeos encontrados
            clearInterval(iID); // para a execução da função
        } else { 
            var linesCount = 0; // inicializa o contador de linhas com o valor 0
            var rl = readline.createInterface({ // cria um objeto de leitura de arquivos
                input: fs.createReadStream(file), // cria um stream de leitura do arquivo "count.txt"
                output: process.stdout, // cria um stream de escrita do arquivo "count.txt"
                terminal: false // não mostra o prompt do terminal
            });
            rl.on('line', function (line) { // quando ocorrer uma linha no arquivo
                linesCount++; // incrementa o contador de linhas
            });
            rl.on('close', function () { // quando o arquivo for fechado
                progress = linesCount; // atualiza o valor da barra de progresso com o valor da linha
            });
            if (progress < video_list) { // se o valor da barra de progresso for menor que a quantidade de vídeos encontrados
                var elem = document.getElementById("myBar"); // pega o elemento da barra de progresso
                elem.style.width = (progress / video_list * 100) + '%'; // atualiza o tamanho da barra de progresso
                document.getElementById("myBar").innerHTML = Math.floor(progress / video_list * 100) + '%'; // atualiza o valor da barra de progresso
            }
        }
    }, delay);
})