//controlling file explorer events

var fs = require('fs');
var path = require('path');
var remote = require('electron');
var allowed = ['.png', '.jpg', '.html', '.mp3', '.mp4', '.ogg', ''];
var ipc = require('ipc');
var drivelist = require('drivelist');
var disks = [];

window.$ = require('jquery');

var __init = function (){
    drivelist.list(function (error, drives) {
        if (error) {
            alert("Permission denied!");
            throw error;
        }
        drives.forEach(function (drive) {
            if (drive.mountpoints.length) {
                $.each(drive.mountpoints, function (index, value) {
                    disks.push(value);
                });
                load(disks[0].path);
                $('#breadcrumbs').html(breadcrumb(disks[0].path));
            }
        });

        $.each(disks, function (index, value) {
            console.log(value.path);
            $('#drive-list').append('<div class="dir-route ion-ios-filing-outline" route="' + value.path + '">' + value.path + '</div>');
        });
    });
};


function breadcrumb(path) {
    var pieces = path.split("\\");
    pieces = pieces.filter(function (e) {
        return e;
    });
    if (pieces.length === 1) {
        // this is a drive letter
        return '<a href="#!" class="breadcrumb dir-route" route="' + pieces[0] + '">' + pieces[0] + '</a>';
    } else if (pieces.length === 2) {
        return '<a href="#!" class="breadcrumb dir-route" route="' + pieces[0] + '">' + pieces[0] + '</a>' + '<a href="#!" class="breadcrumb">' + truncate(pieces[1], 32) + '</a>';
    } else if (pieces.length === 3) {
        return '<a href="#!" class="breadcrumb dir-route" route="' + pieces[0] + "\\" + pieces[1] + '">' + truncate(pieces[1], 32) + '</a>' + '<a href="#!" class="breadcrumb">' + truncate(pieces[2], 32) + '</a>';
    } else {
        var root = pieces.slice(0, pieces.length - 3).join("\\");
        return '<a href="#!" class="breadcrumb dir-route" route="' + root + "\\" + pieces[pieces.length - 3] + "\\" + pieces[pieces.length - 2] + '">' + truncate(pieces[pieces.length - 2], 32) + '</a>' + '<a href="#!" class="breadcrumb">' + truncate(pieces[pieces.length - 1], 32) + '</a>';
    }
}

function truncate(string, maxlength) {
    return string.length > maxlength ? string.substring(0, maxlength - 3) + "..." : string;
}

function sprint(str, o) {
    if (typeof str !== "string" || typeof o !== "object") {
        return;
    }
    var regex = /%s\(([a-zA-Z0-9_]{1,15})\)/g,
            i;
    if (regex.test(str)) {
        str = str.replace(regex, function (found, match) {
            return o[match];
        });
    } else {
        for (i in o) {
            str = str.replace(/%s/, o[i]);
        }
    }
    return str;
}

function load(p) {
    $('.open').addClass('disabled');
    $('.open').attr('data-file-path', '');
    $('.open-file-path').html('Select file...');
    $('#progress').show();
    console.log(p);
    fs.readdir(p, function (err, files) {
        if (err) {
            $('#progress').hide(1000);
            alert("Permission denied! Try to run the program as Administrator (Superuser --sudo)!");
            throw err;
        } else {
            $('#file-list').html("");
            files.map(function (file) {
                return path.join(p, file);
            }).filter(function () {
                return true;
            }).forEach(function (file) {
                if ($.inArray(path.extname(file), allowed) !== -1 || path.extname(file) === '') {
                    //console.log(fs.existsSync(file));
                    $('#file-list').append(sprint('<tr><td class="truncated' + (path.extname(file) === '' ? ' dir-route" route="' + path.parse(file).dir + "\\" + path.basename(file) + '"' : ' selectable-file" data-file-path="' + path.parse(file).dir + "\\" + path.basename(file) + '"') + '>%s</td><td><span>%s</span></td></tr>', [truncate(path.basename(file), 46), (path.extname(file) === '' ? 'directory' : path.extname(file))]));
                } else {
                    fs.stat(file, function (err, stat) {
                        if (err === null && stat.isDirectory()) {
                            $('#file-list').append(sprint('<tr><td class="dir-route truncated" route="' + path.parse(file).dir + "\\" + path.basename(file) + '">%s</td><td><span>directory</span></td></tr>', [truncate(path.basename(file), 46)]));
                        } else if (err === null && stat.isFile()) {
                            //disabled files, no event
                            $('#file-list').append(sprint('<tr><td class="disabled-file truncated">%s</td><td><span>%s</span></td></tr>', [truncate(path.basename(file), 46), (path.extname(file) === '' ? 'directory' : path.extname(file))]));
                        } else if (err.code === 'ENOENT') {
                            return;
                        } else {
                            return;
                        }
                    });
                }
            });
            $('#breadcrumbs').html(breadcrumb(p));
            $('#progress').hide(1000);
        }
    });
}
$(document).ready(function () {
    __init();
    
    $('#file-list, #drive-list, #breadcrumbs').on('click', '.dir-route', function () {
        var routePath = $(this).attr('route');
        load(routePath);
    });
    $('#file-list').on('click', '.selectable-file', function () {
        $('.selectable-file').parent('tr').removeClass('sfp');
        $(this).parent('tr').addClass('sfp');
        var filepath = $(this).attr('data-file-path');
        $('.open').attr('data-file-path', filepath);
        $('.open').removeClass('disabled');
        $('.open-file-path').html(filepath);
    });
    $('#file-list').on('click', '.disabled-file', function () {
        alert("This is a non-selectable file! Allowed extension are: " + allowed);
    });
    //ipc send
    
    $('.open').on('click', function () {
        var filepath = $(this).attr('data-file-path');
        ipc.send('openfile', {data: filepath});
        window.close();
    });
});







