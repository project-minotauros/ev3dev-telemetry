const { app, BrowserWindow } = require('electron')

let window;
function createWindow() {
  window = new BrowserWindow({ width: 800, height: 600 });
  window.webContents.openDevTools();

  window.on('closed', () => window = null);
}

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
