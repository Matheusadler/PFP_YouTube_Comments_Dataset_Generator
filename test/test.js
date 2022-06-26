/*
Autor: Matheus Adler
Este script é responsável pelos testes da aplicação Electron e é executado pelo comando "npm test"
*/

const {
  Application
} = require('spectron') // importa o módulo de testes da aplicação via Spectron
const assert = require('assert') // importa o módulo de asserções da bibliota de testes Mocha.
const electronPath = require('electron') // acessa o caminho do executável do Electron via node_modules
const path = require('path') // importa o sistema de arquivos

const app = new Application({ // cria uma instância da aplicação
  path: electronPath,
  args: [path.join(__dirname, '..')] // passa o caminho do diretório da aplicação
});

// o bloco abaixo define todas as funções de teste da aplicação Electron com um timeout de 20 segundos
describe('YouTube Comments Dataset Generator', function () {
  this.timeout(20000);

  // inicia a aplicação antes de cada teste
  beforeEach(() => {
    return app.start();
  })

  // encerra a aplicação após cada teste
  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  })

  // função de teste que verifica se a aplicação está visivel
  it("Verifica se a janela está visível", async () => {
    await app.client.waitUntilWindowLoaded();
    const isVisible = await app.browserWindow.isVisible();
    assert.strictEqual(isVisible, true);
  });

  // função de teste que verifica se existe uma janela inicial
  it('Verifica se exibe uma janela inicial', async () => {
    await app.client.waitUntilWindowLoaded();
    const count = await app.client.getWindowCount();
    assert.strictEqual(count, 1);
  });

  // função de teste que verifica se o título da janela inicial é o esperado
  it('Verifica se o título da aplicação está correto', async () => {
    await app.client.waitUntilWindowLoaded();
    const title = await app.client.getTitle();
    assert.strictEqual(title, 'YouTube Comments Dataset Generator');
  });

  // função de teste que verifica se o botão de selecionar diretório existe
  it('Verifica se existe o botão "Selecione o diretório"', async () => {
    const element = await app.client.$('#buttonPathDestiny')
    const buttonText = await element.getText()
    return assert.strictEqual(buttonText, 'Selecione o diretório');
  });

  // função de teste que verifica se o botão de busca existe
  it('Verifica se existe o botão "Buscar"', async () => {
    const element = await app.client.$('#confirmButton');
    const buttonText = await element.getText();
    return assert.strictEqual(buttonText, 'Buscar');
  });

});