var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var config = require('./config');
var utils = require('./utils');

var cache = {};

function md5(file) {
    let content = fs.readFileSync(file);
    let hash = crypto.createHash('md5');
    hash.update(content);
    return hash.digest('hex');
}

function visitAll(dir) {
    var files = fs.readdirSync(dir);
    files.forEach(filename => {
        var filepath = path.join(dir, filename);
        var stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            visitAll(filepath);
        } else if (stat.isFile()) {
            handleFile(filepath);
        } else {
            console.warn(filepath + " ,not file and not dir");
        }
    });
}

function handleFile(filepath) {
    var hash = md5(filepath);
    var array = cache[hash] = cache[hash] || [];
    var list = filepath.split(/[\\/]/);
    var filename = list[list.length - 1];
    array.push(filename);
}

function getRepeats() {
    let rs = [];
    var keys = Object.keys(cache);
    keys.forEach(function(key) {
        let list = cache[key];
        if (list.length > 1) {
            rs.push(list);
        }
    });
    return rs;
}

function printResult() {
    let rs = getRepeats();
    if (rs.length) {
        console.log("--- 以下资源文件重复了 ---\n");
    }
    rs.forEach(function(list) {
        list.forEach(function(str) {
            console.log(str);
        });
        console.log('------------------\n')
    });
}

visitAll(config.assetsPath);
config.printRepeat && printResult();

module.exports = getRepeats();