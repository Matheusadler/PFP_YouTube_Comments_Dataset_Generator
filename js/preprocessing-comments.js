const { ipcRenderer } = require('electron'); // importa a função de comunicação com o processo principal da aplicação Electron
const { PythonShell } = require('python-shell'); // importa a biblioteca para execução de scripts python
const fs = require('fs'); // importa sistema de arquivos do JavaScript
const readline = require('readline'); // importa biblioteca para leitura de arquivos
var $ = jQuery = require('jquery'); // importa o jquery

// o bloco abaixo é chamado quando o html for totalmente carregado
document.addEventListener('DOMContentLoaded', function () {
    var args = ipcRenderer.sendSync('get-options', ""); // pega os argumentos salvos na tela de index
    options = args[0]
    delete args

    var comments_list = ipcRenderer.sendSync('get-comments-length', ""); // pega a quantidade de comentários extraidos dos vídeos
    var file = 'count_preprocessing.txt'; // cria o arquivo de texto "count_preprocessing.txt" que será usado para salvar a quantidade de comentários processados, essa informação é necessária para a barra de progresso
    var progress = 0; // inicializa a barra de progresso com o valor 0

    PythonShell.run('preprocessing-comments.py', options, function (err) { // executa o script python "preprocessing-comments.py"
        if (err) { // se ocorrer algum erro
            $("#modalError").modal('show'); // mostra o modal de erro
            document.getElementById("msgError").innerHTML = "Algum problema ocorreu ao processar o dataset de sua pesquisa. Por favor, tente novamente."; // com essa mensagem de erro
        } else { // se não ocorrer nenhum erro
            $("#modalSuccess").modal('show'); // mostra o modal de sucesso
            document.getElementById("msgSuccess").innerHTML = "Dataset processado com sucesso!"; // com essa mensagem de sucesso
        }
    });

    let delay = 1000; // 1 segundo   
    var t = setInterval(function () { // essa função é chamada a cada 1 segundo
        if (progress >= comments_list) { // se o valor da barra de progresso for maior ou igual a quantidade de comentários extraidos dos vídeos
            clearInterval(t); // para a execução da função
        } else {
            var linesCount = 0; // inicializa o contador de linhas com o valor 0
            var rl = readline.createInterface({ // cria um objeto de leitura de arquivos
                input: fs.createReadStream(file), // cria um stream de leitura do arquivo "count_preprocessing.txt"
                output: process.stdout, // cria um stream de escrita do arquivo "count_preprocessing.txt"
                terminal: false // não mostra o prompt do terminal
            });
            rl.on('line', function (line) { // quando ocorrer uma linha no arquivo
                linesCount++; // incrementa o contador de linhas
            });
            rl.on('close', function () { // quando o arquivo for fechado
                progress = linesCount; // atualiza o valor da barra de progresso com o valor da linha
            });
            if (progress < comments_list) { // se o valor da barra de progresso for menor que a quantidade de comentários extraidos dos vídeos
                var elem = document.getElementById("myBar"); // pega o elemento da barra de progresso
                elem.style.width = (progress / comments_list * 100) + '%'; // atualiza o tamanho da barra de progresso
                document.getElementById("myBar").innerHTML = Math.floor(progress / comments_list * 100) + '%'; // atualiza o valor da barra de progresso
            }
        }
    }, delay);

})