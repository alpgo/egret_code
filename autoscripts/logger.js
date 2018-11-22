/**
 * 日志记录器
 * 格式化输出信息
 */
var fs = require('fs');
var config = require('./config');

/**
 * 输出至控制台
 */
function print() {
    let msg = Array.prototype.slice.call(arguments).join("");
    console.log(msg + "\n");
};

/**
 * 记录至文件中
 */
var stream = fs.createWriteStream('./log.log', { 'flags': 'a' });

function write() {
    printDate();
    let msg = Array.prototype.slice.call(arguments).join("");
    stream.write(msg + "\n");
}

/**
 * 打印日期
 */
function printDate() {
    if (!printDate.hasRun) {
        stream.write('------- ' + new Date().toString() + ' -------\n');
    }
    printDate.hasRun = true;
}

function Logger() {}

// 打印警告信息
Logger.prototype.warn = function(str) {
    print('warn: ', str);
};

// 打印文件重命名信息
Logger.prototype.rename = function(old, cur) {
    old = old.replace('..\\resource\\', '');
    cur = cur.replace('..\\resource\\', '');
    let msg = 'rename: [' + old + '] to [' + cur + ']';
    write(msg);
};

// 打印删除资源信息
Logger.prototype.delete = function(resitem) {
    let msg = 'delete:\t< ' + resitem.url + ' >';
    write(msg);
    config.printDelete && print(msg);
};

// 打印新增资源信息
Logger.prototype.add = function(resitem) {
    let msg = 'add:\t< ' + resitem.url + ' >';
    write(msg);
    config.printAdd && print(msg);
};

module.exports = new Logger();