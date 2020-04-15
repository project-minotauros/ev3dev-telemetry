const { app, BrowserWindow } = require('electron');
require('update-electron-app')({
  repo: 'project-minotaurus/ev3dev-telemetry',
  updateInterval: '1 hour'
});

let window;
function createWindow() {
  window = new BrowserWindow({ width: 800, height: 600, icon: __dirname + '/assets/img/icon.png' });
  window.loadFile('index.html');
  window.removeMenu();
  window.webContents.openDevTools();

  window.on('closed', () => window = null);
}

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
