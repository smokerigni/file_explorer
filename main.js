'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var mainWindow = null;

var Menu = require('menu');

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('ready', function () {
    mainWindow = new BrowserWindow({width: 900, height: 600});

    mainWindow.loadURL('file://' + __dirname + '/views/index.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    
    var template = [{
            label: "File",
            submenu: [
                {label: "Reset", accelerator: "Command+R", click: function () {
                        mainWindow.loadURL('file://' + __dirname + '/views/index.html');
                    }},
                {type: "separator"},
                {label: "Quit", accelerator: "Command+Q", click: function () {
                        app.quit();
                    }}
            ]}
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});

var ipc = require('ipc');

ipc.on('openfile', function (event, data) {
    mainWindow.loadURL(data.data);
});