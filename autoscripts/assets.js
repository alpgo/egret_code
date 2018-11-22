/**
 * 资源数据提取
 */
var fs = require('fs');
var path = require('path');
var config = require('./config');
var log = require('./logger');
var utils = require('./utils');

// 检测资源的路径深度
// 正确的目录结构: assets(0)/dir(1)/filename(2)
// 错误的目录结构: assets(0)/, assets(0)/filename(1), assets(0)/dir(1)/dir(2)/filename(3), ...
function validateDeep() {
    var assetsPath = config.assetsPath;
    var max = Number.MIN_VALUE; // 目录最大深度
    var min = Number.MAX_VALUE; // 文件最浅深度
    var start = 0; // assets根目录深度为0
    checkAssets(assetsPath, start);
    if (max > 1) {
        log.warn("不允许资源目录大于1");
        return false;
    }
    if (min == Number.MAX_VALUE) {
        log.warn("没有任何资源文件");
        return false;
    }
    if (min == 1) {
        log.warn("assets目录下不可放置资源文件");
        return false;
    }
    if (min > 2) {
        log.warn("资源文件所在目录深度不可大于1");
        return false;
    }
    return true;

    function checkAssets(dir, deep) {
        max = Math.max(max, deep);
        var hasFile = false;
        var files = fs.readdirSync(dir);
        files.forEach(filename => {
            var pathname = path.join(dir, filename);
            var stat = fs.statSync(pathname);
            if (stat.isDirectory()) {
                checkAssets(pathname, deep + 1);
            } else if (stat.isFile()) {
                hasFile = true;
            } else {
                console.warn(pathname + ", not file");
            }
        });
        if (hasFile) {
            min = Math.min(min, deep + 1);
        }
    }
}

/**
 * 遍历资源目录
 */
function itemAssets() {
    var map = {};
    var dirs = getAllDirs();
    // 遍历所有目录
    dirs.forEach(function (dirname) {
        // 忽略文件夹(独立不受管理)
        if (config.notCodeDir.indexOf(dirname) > -1) {
            return;
        }
        let curDir = path.join(config.assetsPath, dirname);
        let files = fs.readdirSync(curDir);
        // 处理单个文件
        files.forEach(function (filename) {
            let curFile = path.join(curDir, filename);
            let newName = generateName(curFile);
            if (newName !== filename) {
                // 文件重命名
                let old = path.join(curDir, filename);
                let cur = path.join(curDir, newName);
                fs.renameSync(old, cur);
                log.rename(old, cur);
                filename = newName;
            }

            // 字体文件
            if (filename.split('.')[1] === 'fnt') {
                let cur = path.join(curDir, filename);
                let obj = JSON.parse(fs.readFileSync(cur));
                obj.file = filename.replace('.fnt', '.png');
                fs.writeFileSync(cur, JSON.stringify(obj));
            }

            let group = map[dirname] = map[dirname] || [];
            group.push(new utils.File(filename));
        });
    });
    return map;
}

/** 
 * 所有目录名称 
 */
function getAllDirs() {
    return getAllDirs.dirs = getAllDirs.dirs || fs.readdirSync(config.assetsPath);
}

/**
 * 统一规范化文件名
 */
function generateName(curFile) {
    let list = curFile.split(/[\\/]/);
    var filename = list[list.length - 1];
    var dirname = list[list.length - 2];
    let pos = filename.indexOf("_");
    // 从其他目录中移动到本目录中的文件
    var newName;
    let gdirs = getAllDirs();
    if (gdirs.indexOf(dirname) != -1) {
        filename = filename.replace(/^.*?_/, "");
    }
    newName = dirname + "_" + filename;
    return newName;
}

/**
 * 对象转换为数组
 * 按字母顺序
 */
function sortToArray(map) {
    let keys = Object.keys(map);
    return keys.sort((a, b) => { a > b ? 1 : -1; }).map(dirname => map[dirname]);
}

/**
 * 记录下所有的图片名称
 */
function writeAssets(array) {
    let groups = 'module Groups {\n\n';
    let assets = 'module Assets {\n\n';
    array.forEach(filelist => {
        if (filelist.length) {
            let groupName = filelist[0].dirname;
            if (!utils.notGroupDir(groupName)) {
                groups += `\texport const ${groupName}: string = '${groupName}';\n\n`;
            }
        }
        filelist.forEach(file => {
            let key = file.key;
            assets += `\texport const ${key}: string = '${key}';\n\n`;
        });
    });
    assets += '}';
    groups += '}';
    // write to file
    let dest = '../game/Assets.ts';
    fs.writeFileSync(dest, assets + '\n\n' + groups);
    console.log('<Assets.ts> updated');
}

/**
 * 资源文件的解析与映射为数据
 * 将assets目录下的资源转化为JSON数据表示
 * JSON数据包含[资源组,资源项,重复资源集 ]
 */
function main() {
    if (!validateDeep()) {
        process.exit(1);
    }
    let map = itemAssets();
    let array = sortToArray(map);
    writeAssets(array);
    module.exports = array;
}

main();