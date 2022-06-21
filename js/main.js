// Carregando os módulos do framework Electron
const { app, BrowserWindow, dialog, ipcMain } = require('electron');

// Este método irá instanciar a janela principal da aplicação
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
        
    // Carrega o arquivo index.html
    mainWindow.loadFile('./html/index.html');
}

app.whenReady().then(() => {
    // Após o Electron ser devidamente carregado, ele chamará o método abaixo
    createWindow();
    app.on('activate', () => {
        // No macOS, é comum recriar uma janela no aplicativo quando o ícone do dock é clicado e não há outras janelas abertas.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
});

// Encerra a aplicação se todas as suas janelas forem fechadas, caso o kernel atual não seja "darwin" (MacOs)
// No MacOS, é comum que os aplicativos e sua barra de menus permaneçam ativos até que o usuário saia explicitamente através do comando Cmd + Q.
app.on("window-all-closed", ()=>{
    if(process.platform !== "darwin") app.quit();
})
