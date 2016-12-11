//Controls main window
var remote = require('electron').remote;
var BrowserWindow = remote.BrowserWindow;
window.$ = require('jquery');

$(document).ready(function () {
    $('.open').on('click', function () {
        var win = new BrowserWindow({width: 900, height: 600});
        win.loadURL('file://' + __dirname + '/explore.html');
    });
});
