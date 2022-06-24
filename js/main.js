/*
Autor: Matheus Adler
Este script é responsável pelos módulos de controle de vida util do processo principal da aplicação Electron e também por
criar a janela principal da aplicação. Também tem como função a comunicação entre os processos js.
*/
// carregando os módulos do framework Electron
const { app, BrowserWindow, dialog, ipcMain } = require('electron');

// este método irá instanciar a janela principal da aplicação
function createWindow(){    
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        resizable: true,
        webPreferences:{
            nodeIntegration:true, // Permite a integração com o Node.js
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
        
    // carrega o arquivo index.html
    mainWindow.loadFile('./html/index.html');
}

app.whenReady().then(() => {
    // após o Electron ser devidamente carregado, ele chamará o método abaixo
    createWindow();
    app.on('activate', () => {
        // no macOS, é comum recriar uma janela no aplicativo quando o ícone do dock é clicado e não há outras janelas abertas.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
});

// encerra a aplicação se todas as suas janelas forem fechadas, caso o kernel atual não seja "darwin" (MacOs)
// no MacOS, é comum que os aplicativos e sua barra de menus permaneçam ativos até que o usuário saia explicitamente através do comando Cmd + Q.
app.on("window-all-closed", ()=>{
    if(process.platform !== "darwin") app.quit();
})

// evento para salvar os arumentos selecionados
ipcMain.on("save-options", (event, args) => {
    options = args[0]
});

// evento para acessar os arumentos salvos
ipcMain.on("get-options", (event, args) => {
    event.returnValue = [options]
});

// evento para salvar a quantidade de vídeos buscados na pesquisa
ipcMain.on("save-video-length", (event, args) => {
    text = args[0]
});

// evento para acessar a quantidade de vídeos buscados na pesquisa
ipcMain.on("get-video-length", (event, args) => {
    event.returnValue = [text]
});

// evento para salvar a quantidade de comentários coletados
ipcMain.on("save-comments-length", (event, args) => {
    text = args[0]
});

// evento para acessar a quantidade de comentários coletados
ipcMain.on("get-comments-length", (event, args) => {
    event.returnValue = [text]
});

// quando o evento 'select-directory' for chamado a janela de diretórios é aberta e, em seguida, retorna o caminho especificado
ipcMain.on('select-directory', (event, arg) => {
    selected_dir = dialog.showOpenDialogSync({
        properties: ['openDirectory']
    });
    event.returnValue = selected_dir
})
