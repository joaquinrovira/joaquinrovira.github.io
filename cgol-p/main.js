const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, ipcMain} = electron;

let mainWindow;

// Listen for app to be ready
app.on('ready', () => {
    
    // Create new window
    mainWindow = new BrowserWindow({
        width: 1024, 
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });
    
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'cgol-p.html'),
        protocol: 'file',
        slashes: 'true'
    }));
});