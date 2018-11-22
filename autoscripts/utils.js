/**
 * 工具类
 */
var fs = require('fs');
var path = require('path');
var config = require('./config');

module.exports = {
    /**
     * 格式化路径信息
     */
    formatPath: function (str) {
        return str.replace(/[\\]/g, "/").replace("../resource/", "");
    },
    /**
     * 通过url获取文件类型
     */
    getfiletype: function (suffix) {
        if (!suffix) {
            console.warn('文件无类型');
        }
        let type = "";
        switch (suffix) {
            case "xml":
            case "json":
            case "sheet":
                type = suffix;
                break;
            case "png":
            case "jpg":
            case "gif":
            case "jpeg":
            case "bmp":
                type = "image";
                break;
            case "fnt":
                type = "font";
                break;
            case "txt":
                type = "text";
                break;
            case "mp3":
            case "ogg":
            case "mpeg":
            case "wav":
            case "m4a":
            case "mp4":
            case "aiff":
            case "wma":
            case "mid":
                type = "sound";
                break;
            default:
                type = "bin";
                break;
        }
        return type;
    },
    /**
     * 重复资源文件名转化为key
     */
    toRps: function (arr) {
        let list = [];
        arr.forEach(function (items) {
            list.push(items.map(item => item.replace(/[\.]/g, '_')));
        });
        return list;
    },
    /**
     * @return true 非分组资源目录
     * @return false 分组资源目录
     * jpg, music, dragon等不是分组目录
     */
    notGroupDir: function (dirname) {
        return config.notGroupDir.indexOf(dirname) != -1;
    },
    /**
     * 清空文件目录
     */
    removeDir: function (dirPath) {
        if (!fs.existsSync(dirPath)) {
            return;
        }
        let files = fs.readdirSync(dirPath);
        var that = this;
        files.forEach(function (filename) {
            let pp = path.join(dirPath, filename);
            let stat = fs.statSync(pp);
            if (stat.isDirectory()) {
                that.removeDir(pp);
            } else if (stat.isFile()) {
                fs.unlinkSync(pp);
            }
        });
        fs.rmdirSync(dirPath);
    },
    /**
     * 抽象的文件结构
     */
    File: function (filename) {
        this.filename = filename;
        this.dirname = this.filename.split('_')[0];
        this.basename = this.filename.split('.')[0];
        this.extname = this.filename.split('.')[1];
        this.key = this.filename.replace('.', '_');
        this.path = path.join(config.assetsPath, this.dirname, this.filename);
    },
    /**
     * 是否字体图片
     */
    isFontPng: function (filelist, file) {
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
};