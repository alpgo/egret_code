/**
 * 写入单张图片集的资源配置文件
 */
var fs = require("fs");
var path = require("path");
var config = require("./config");
var utils = require('./utils');
var assetsData = require('./assets');
var log = require('./logger');
var repeats = require('./repeat');

// // 清理目录
utils.removeDir(config.out_assets0);
utils.removeDir(config.out_packs0);
utils.removeDir(config.tmp);

function check() {
    let file = config.default_res_file;
    let b = fs.existsSync(file);
    if (!b) {
        let p = path.join(__dirname, file);
        fs.writeFileSync(file, '');
    }
}

check();

function createGroups() {
    let groups = [];
    for (let i = 0; i < assetsData.length; i++) {
        let filelist = assetsData[i];
        let dirname = filelist[0].dirname;
        if (!utils.notGroupDir(dirname)) {
            groups.push({
                keys: filelist.map(file => file.key).join(","),
                name: dirname
            });
        }
    }
    return groups;
}

function createResources() {
    let array = [];
    assetsData.forEach(list => {
        list.forEach(file => {
            if (utils.isFontPng(list, file)) {
                return;
            }
            array.push({
                name: file.key,
                type: utils.getfiletype(file.extname),
                url: 'assets/' + file.dirname + '/' + file.filename
            });
        });
    });
    return array;
}

/**
 * 打印出资源文件的改动
 */
function printDiff(old, current) {
    old = old.resources || [];
    current = current.resources || [];
    var oldmap = {},
        curmap = {};
    for (var i = 0; i < old.length; i++) {
        var olditem = old[i];
        oldmap[olditem.name] = olditem;
    }
    for (var i = 0; i < current.length; i++) {
        var curitem = current[i];
        curmap[curitem.name] = curitem;
    }
    var deleteArray = [];
    for (var name in oldmap) {
        var reserve = name in curmap;
        if (reserve) {
            delete curmap[name];
        } else {
            deleteArray.push(oldmap[name]);
        }
    }
    for (var i = 0; i < deleteArray.length; i++) {
        log.delete(deleteArray[i]);
    }
    for (var name in curmap) {
        log.add(curmap[name]);
    }
}

// 格式化res.json
function formatResJSON(data) {
    let groups = data.groups;
    let resources = data.resources;
    var repeats = data.repeats;

    var str = "{";
    // groups
    str += '\n\t"groups": [';
    groups.forEach((group, index) => {
        var gstr = "";
        if (index == 0) {
            gstr = "{\n";
        } else {
            gstr = ", {\n";
        }
        gstr = gstr +
            '\t\t"keys": "' + group.keys + '",\n' +
            '\t\t"name": "' + group.name + '"' +
            "\n\t}"
        str += gstr;
    });
    str += "],";
    // resources
    str += '\n\t"resources": [';
    resources.forEach((resitem, index) => {
        var rstr = "";
        if (index == 0) {
            rstr = "{\n";
        } else {
            rstr = ", {\n";
        }
        rstr = rstr +
            '\t\t"name": "' + resitem.name + '",\n' +
            '\t\t"type": "' + resitem.type + '",\n' +
            '\t\t"url": "' + resitem.url + '"' +
            "\n\t}"
        str += rstr;
    });
    str += "]";
    // repeats
    if (repeats && repeats.length) {
        str += ',\n\t"repeats": [\n';
        repeats.forEach((rs, index) => {
            if (index == 0) {
                str += '\t\t[\n';
            } else if (index < repeats.length - 1) {
                str += ',\n\t\t[\n';
            } else {
                str += ',\n\t\t[\n';
            }
            rs.forEach(function (filename, pos) {
                str += '\t\t\t"' + filename.replace(/\./g, '_');
                if (pos != rs.length - 1) {
                    str += '",\n';
                } else {
                    str += '"\n';
                }
            });
            str += '\t\t]';
        });
        str += "\n\t]";
    }
    // last
    str += "\n}";
    return str;
}

module.exports = function () {
    let groups = createGroups();
    let resources = createResources();
    let data = { groups, resources, repeats };
    let old = fs.readFileSync(config.default_res_file).toString() || "";
    old = JSON.parse(old.trim() || '{}');
    fs.writeFileSync(config.default_res_file, formatResJSON(data));
    printDiff(old, data);
    console.log('default.res.json updated');
}