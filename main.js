const electron = require('electron');
const url = require('url');
const path = require('path');
const { ipcMain, dialog } = require('electron');
const fs = require('fs');

const { app, BrowserWindow, Menu } = electron;

let mainWindow;
let historyWindow;

app.on('ready', function () {

    mainWindow = new BrowserWindow({
        width: 1030,
        height: 650,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: true,
            enableRemoteModule: true
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));



    mainWindow.on('closed', function () {
        app.quit();
    })

    //build menu from template

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

function createHistoryWindow() {
    mainWindow = new BrowserWindow({
        width: 1030,
        height: 650,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: true,
            enableRemoteModule: true
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'History.html'),
        protocol: 'file:',
        slashes: true
    }));
}

const mainMenuTemplate = [

    {
        label: 'File',
        submenu: [
            {
                label: 'History',
                click() {
                    createHistoryWindow();
                }
            },
            {
                label: 'Clear items',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ],

    },
    {
        label: 'History',
        click() {
            createHistoryWindow();
        }
    }
]

if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

//add developer tools
if (process.env.NODE_ENV != 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}

//Open image
ipcMain.on("chooseFile", (event, arg) => {
    const result = dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }]
    });

    result.then(({ canceled, filePaths, bookmarks }) => {
        const base64 = fs.readFileSync(filePaths[0]).toString('base64');
        event.reply("chosenFile", base64);
    });
});

//pass var
ipcMain.on('item1', function (e, item) {
    console.log(item);
    mainWindow.webContents.send('item123', "item");
});