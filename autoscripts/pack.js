/**
 * 打包成图集
 * 1. 单张图片尺寸过大，需要单独加载
 * 2. 图集内容太大，需要分成几个组加载
 * 3. 资源文件hash编码
 */
var fs = require("fs");
var path = require("path");
var crc = require('crc');
var childProcess = require('child_process');
var config = require('./config');
var assetsData = require('./assets');
var repeats = require('./repeat');
var utils = require('./utils');

// 打包成图集的命令
let cmdlist = [];

// (合成图集时)超过图片宽高限制的图片
let bigPics = [];

// 是否使用执行TextureMerge命令
let useTextureMerge = true;

// 资源组
let groups;

// 资源列表
let resources;

module.exports = function (isTextureMerge) {
    useTextureMerge = isTextureMerge;
    groups = createGroups();
    resources = createResources();
    // // 清理目录
    utils.removeDir(config.out_assets0);
    utils.removeDir(config.out_packs0);
    utils.removeDir(config.tmp);
    // 处理资源
    handleResources(resources);
};

function createGroups() {
    let groups = [];
    for (let i = 0; i < assetsData.length; i++) {
        let filelist = assetsData[i];
        let dirname = filelist[0].dirname;
        // if (!utils.notGroupDir(dirname)) {
        groups.push({
            keys: getKeys(filelist),
            name: dirname
        });
        // }
    }
    return groups;

    function getKeys(filelist) {
        return filelist.filter((file) => {
            if (isFontPng(filelist, file)) {
                return false;
            }
            return true;
        }).map(file => file.key).join(",");
    }
}

function createResources() {
    let rs = [];
    assetsData.forEach(filelist => {
        let subs = []; // texture图集
        let items = []; // 单个资源
        filelist.forEach(file => {
            // 过滤字体PNG
            if (isFontPng(filelist, file)) {
                // console.log(file.filename + "  font png")
                return;
            }

            if (isItemRes(file)) {
                items.push(file);
            } else {
                subs.push(file);
            }
        });
        // 二维数组: 多个图集(每个图集对应多张图片)
        var subsList = parseSubs(subs);
        rs.push({
            subs: subsList,
            items: items
        });
    });
    printBigPics();
    return rs;
}

function isFontPng(filelist, file) {
    if (file.extname == 'fnt') {
        return false;
    }
    let fntName = file.basename + '.fnt';
    for (let i = 0; i < filelist.length; i++) {
        let nextFile = filelist[i];
        if (nextFile.filename == fntName) {
            return true;
        }
    }
    return false;
}

/**
 * 输出所有的大尺寸图片
 */
function printBigPics() {
    if (!config.printLimit) {
        return;
    }
    if (bigPics.length) {
        console.log('\n--- 以下图片宽or高太大,不适于参与图集打包 ---\n');
    }
    bigPics.forEach(file => {
        let prefix;
        if (file.width) {
            prefix = '(width = ' + file.width + 'px) ';
        }
        if (file.height) {
            prefix = '(height = ' + file.height + 'px) ';
        }
        console.log(prefix + file.path);
    });
}

/**
 * 分析图集大小,分解成多个图集
 */
function parseSubs(subs) {
    if (subs.length == 0) {
        return subs;
    }
    let total = 0;
    let array = [];
    subs.forEach(file => {
        let size = fs.readFileSync(file.path).length;
        total += size;
        array.push({
            size,
            file
        });
    });
    total = total / 1024;
    // 拆分图集(减小图集尺寸大小,增加图片的并发请求数)
    if (total < config.maxSize) {
        return [subs];
    } else { }
    // 拆分出的图集个数
    let count = Math.ceil(total / config.maxSize);
    let results = [];
    // 倒序计算, 平均图集大小
    array.sort((a, b) => a.size - b.size).forEach((item, index) => {
        index = array.length - 1 - index;
        let a = Math.floor(index / count) % 2;
        let b = index % count;
        let num = a ? count - 1 - b : b;
        (results[num] = results[num] || []).push(item.file);
    });
    return results;
}

/**
 * 该资源的发布类型
 * @return true 单个资源
 * @return false 图集资源
 */
function isItemRes(file) {
    let type = utils.getfiletype(file.extname);
    // 非图片
    if (type !== 'image') {
        return true;
    }
    // 非分组目录
    let dirname = file.dirname;
    if (utils.notGroupDir(dirname)) {
        return true;
    }
    // 重复资源
    if (isRepeatResouce(file.filename)) {
        return true;
    }
    // 判断图片大小
    let sizeOf = require('image-size');
    let dilimisions = sizeOf(file.path);
    if (dilimisions.width > config.maxWidth) {
        bigPics.push({
            width: dilimisions.width,
            path: file.path
        });
        return true;
    }
    if (dilimisions.height > config.maxHeight) {
        bigPics.push({
            height: dilimisions.height,
            path: file.path
        });
        return true;
    }
    return false;
}

/**
 * 是否属于重复资源
 */
function isRepeatResouce(filename) {
    for (let i = 0; i < repeats.length; i++) {
        let list = repeats[i];
        for (let j = 0; j < list.length; j++) {
            if (filename == list[j]) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 处理资源分类
 */
function handleResources(resources) {
    resources.forEach(function (group) {
        let items = group.items;
        items.forEach(function (file) {
            copy(file);
            // 拷贝字体图片
            if (file.extname == 'fnt') {
                let pngFile = new utils.File(file.basename + '.png');
                copy(pngFile);
            }
        });
        group.subs.forEach((filelist, index) => copySubs(filelist, index));
    });
    // 运行打包图集命令
    createCommand(0);
}

/**
 * 拷贝一张图片至发布目录
 * @param temp 临时目录（拷贝subs时用）
 */
function copy(file, temp) {
    let sourceFile = path.join(config.assetsPath, file.dirname, file.filename);
    let dirPath = temp || path.join(config.out_assets0, file.dirname);
    mkdirSync(dirPath);
    let destPath = path.join(dirPath, file.filename);
    fs.copyFileSync(sourceFile, destPath);
}

/**
 * 拷贝一组图片至temp目录
 * @param index 图集序号
 */
function copySubs(list, index) {
    if (list.length <= 0) return;
    // 拷贝到临时目录
    for (let i = 0; i < list.length; i++) {
        let file = list[i];
        copy(list[i], path.join(config.tmp, file.dirname + index));
    }
    // 创建图集文件
    let dirname = list[0].dirname;
    let orgin = path.join(config.tmp, dirname + index);
    let dest = path.join(config.out_packs0, dirname + index + '.json');
    mkdirSync(config.out_packs0);
    cmdlist.push({
        orgin: orgin, // 原始图片组目录
        dest: dest // 输出图片目录
    });
}

/**
 * 创建目录
 * @param thePath 仅包含目录
 */
function mkdirSync(thePath) {
    let list = thePath.replace(/[\\]/g, '/').split('/');
    for (let i = 0; i < list.length; i++) {
        let pp = path.join.apply(path, list.slice(0, i + 1));
        if (!fs.existsSync(pp)) {
            fs.mkdirSync(pp);
        }
    }
}

function createCommand(index) {
    if (index == 0) {
        useTextureMerge && console.log('\n开始图集打包，请耐心等待...\n');
    }
    // 图集打包命令执行完毕
    if (index >= cmdlist.length) {
        utils.removeDir(config.tmp);
        useTextureMerge && console.log("图集文件生成完毕...");
        writeToFile(groups, resources);
        return;
    }

    let data = cmdlist[index];
    let orgin = data.orgin;
    let dest = data.dest;

    let abOrgin = path.join(__dirname, orgin);
    let abDest = path.join(__dirname, dest);
    let command = 'TextureMerger -p ' + abOrgin + ' -o ' + abDest;
    let sortNum = '(' + (index + 1) + '/' + cmdlist.length + ')';
    if (useTextureMerge) {
        console.log(sortNum);
        console.log('start pack: ' + dest);
        childProcess.exec(command, function (err) {
            if (err) {
                console.warn('警告：请将TextureMerger.exe路径配置在PATH中,TextureMerger版本要求为1.6.7或者1.6.3');
                process.exit(1);
            } else {
                console.log('over pack: ' + dest + '\n');
                createCommand(index + 1);
            }
        });
    } else {
        createCommand(index + 1);
    }
}

/**
 * 写入配置文件
 */
function writeToFile(groups, resources) {
    let array = [];
    resources.forEach(function (data) {
        let subs = data.subs;
        let items = data.items;
        if (subs.length) {
            subs.forEach((subitem, index) => {
                let dirname = subitem[0].dirname;
                // 编码图集的JSON文件
                let oldJsonName = dirname + index + '.json';
                let oldJsonUrl = path.join(config.out_packs0, oldJsonName);
                let newJsonName = (dirname + index) + '_' + getCRC(oldJsonUrl) + '.json';
                let newJsonUrl = path.join(config.out_packs0, newJsonName);
                fs.renameSync(oldJsonUrl, newJsonUrl);
                // 编码图集的PNG文件
                let oldPngName = dirname + index + '.png';
                let oldPngURL = path.join(config.out_packs0, oldPngName);
                let newPngName = (dirname + index) + '_' + getCRC(oldPngURL) + '.png';
                let newPngURL = path.join(config.out_packs0, newPngName);
                fs.renameSync(oldPngURL, newPngURL);
                // 更新JSON文件中png文件名
                updateJSON(newJsonUrl, oldPngName, newPngName);
                // 添加资源配置
                array.push({
                    url: utils.formatPath(newJsonUrl),
                    name: dirname + '-' + index + 'sheet',
                    type: 'sheet',
                    subkeys: subitem.map(file => file.key).join(',')
                });
            });
        }
        if (items.length) {
            items.forEach(function (file) {
                // 字体文件
                (function () {
                    if (file.extname === 'fnt') {
                        let url = path.join(config.out_assets0, file.dirname, file.basename + '.png');
                        let filename = file.basename + '_' + getCRC(url) + '.png';
                        let newURL = path.join(config.out_assets0, file.dirname, filename);
                        fs.renameSync(url, newURL);

                        let fontURL = path.join(config.out_assets0, file.dirname, file.filename);
                        let str = fs.readFileSync(fontURL);
                        let json = JSON.parse(str);
                        json.file = filename;
                        fs.writeFileSync(fontURL, JSON.stringify(json));
                    }
                })();

                let url = path.join(config.out_assets0, file.dirname, file.filename);
                let filename = file.basename + '_' + getCRC(url) + '.' + file.extname;
                let newURL = path.join(config.out_assets0, file.dirname, filename);
                fs.renameSync(url, newURL);
                array.push({
                    url: utils.formatPath(newURL),
                    name: file.key,
                    type: utils.getfiletype(file.extname)
                });
            });
        }
    });
    let json = {
        groups: groups,
        resources: array,
        repeats: utils.toRps(repeats)
    };
    fs.writeFileSync(config.default_res_file, JSON.stringify(json));
    console.log('\ndefault.res.json updated');
}

/**
 * 计算文件的CRC编码
 */
function getCRC(filepath) {
    return crc.crc32(fs.readFileSync(filepath, 'utf8')).toString(16);
}

/**
 * 更新JSON文件中png文件名
 * @param filepath JSON文件
 * @param oldName 老的png文件名
 * @param newName 新的png文件名
 */
function updateJSON(filepath, oldName, newName) {
    let content = fs.readFileSync(filepath).toString();
    content = content.replace(oldName, newName);
    fs.writeFileSync(filepath, content);
}