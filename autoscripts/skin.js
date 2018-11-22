/**
 * 读取所有皮肤的ID，生成皮肤数据
 */
var fs = require('fs'),
    path = require('path'),
    DOMParser = require('xmldom').DOMParser,
    assets = require('./assets');

// 先记录所有资源的key
let keyMap = (function () {
    let array = [];
    for (let i = 0; i < assets.length; i++) {
        let list = assets[i];
        for (let j = 0; j < list.length; j++) {
            let file = list[j];
            let key = file.key;
            array.push(key);
        }
    }
    return array;
} ());

var skinRoot = '../resource/skins';

var skinMap = {};

var filter = function (filename) {
    let extname = getExtname(filename);
    return extname == '.exml';
}

function getExtname(filename) {
    let dotIndex = filename.lastIndexOf('.');
    return filename.slice(dotIndex);
}

function itemAll(dir) {
    let files = fs.readdirSync(dir);
    files.forEach(filename => {
        let childDir = path.join(dir, filename);
        let stat = fs.statSync(childDir);
        if (stat.isDirectory()) {
            itemAll(childDir);
        } else if (stat.isFile()) {
            if (filter(filename)) {
                let filepath = childDir;
                let content = fs.readFileSync(filepath).toString();
                let xmlData = parseXML(content);
                // 检测皮肤文件中引用资源文件KEY的正确性
                checkSkinImageRes(xmlData, filename);
                handleFile(xmlData);
            }
        }
    });
}

// 检测皮肤文件中引用资源文件KEY的正确性
function checkSkinImageRes(xmlData, filename) {
    let children = xmlData.children;
    for (let i = 0; i < children.length; i++) {
        let node = children[i];
        if (node.name == 'e:Image' && node.attributes['source']) {
            let fileKey = node.attributes['source'];
            // 没有找到图片
            if (keyMap.indexOf(fileKey) == - 1) {
                console.warn(`皮肤文件<${filename}>中引用的图片<${fileKey}>属于无效资源`);
            }
        }
        if (node.children.length) {
            checkSkinImageRes(node, filename);
        }
    }
}

function handleFile(xmlData) {
    // 记录皮肤中组件引用ID
    var className;
    if (xmlData.attributes['class']) {
        className = xmlData.attributes['class'];
    } else {
        console.warn('skin 中缺少class属性');
    }
    // 字母排序
    let ids = getIds(xmlData, []);
    ids.sort(function (a, b) {
        return a[0] > b[0];
    });

    if (skinMap[className]) {
        console.warn('出现了重复的skin-class: ', className);
    } else {
        skinMap[className] = ids;
    }
}

function parseXML(content) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(content, 'text/xml');
    let length = xmlDoc.childNodes.length;
    for (let i = 0; i < length; i++) {
        let node = xmlDoc.childNodes[i];
        if (node.nodeType == 1) {
            return parseNode(node, null);
        }
    }
}

function getIds(xmlData, array) {
    let children = xmlData.children;
    for (let i = 0; i < children.length; i++) {
        let node = children[i];
        if (node.attributes['id'] && node.name != 'w:Config') {
            if (node.name.startsWith("e:")) {
                array.push([node.attributes['id'], node.name.replace('e:', 'eui.')]);
            }
            if (node.name.startsWith("view:")) {
                array.push([node.attributes['id'], node.name.replace('view:', 'view.')]);
            }
        }
        if (node.children.length) {
            getIds(node, array);
        }
    }
    return array;
}

function parseNode(node, parent) {
    if (node.localName == "parsererror") {
        throw new Error(node.textContent);
    }
    let xml = {
        localName: node.localName,
        nodeType: 1,
        parent,
        attributes: {},
        children: [],
        prefix: node["prefix"],
        namespace: node.namespaceURI,
        name: node.nodeName
    };
    let nodeAttributes = node.attributes;
    let attributes = xml.attributes;
    let length = nodeAttributes.length;
    for (let i = 0; i < length; i++) {
        let attributeNode = nodeAttributes[i];
        let name = attributeNode.name;
        if (name.indexOf("xmlns:") == 0) {
            continue;
        }
        attributes[name] = attributeNode.value;
        xml["$" + name] = attributeNode.value;
    }
    let childNodes = node.childNodes;
    length = childNodes.length;
    let children = xml.children;
    for (let i = 0; i < length; i++) {
        let childNode = childNodes[i];
        let nodeType = childNode.nodeType;
        let childXML = null;
        if (nodeType == 1) {
            childXML = parseNode(childNode, xml);
        } else if (nodeType == 3) {
            let text = childNode.textContent.trim();
            if (text) {
                childXML = new XMLText(text, xml);
            }
        }
        if (childXML) {
            children.push(childXML);
        }
    }
    return xml;
}

function getSkinData() {
    let skinDict = skinMap;
    let keys = Object.keys(skinDict).sort((a, b) => a > b);
    let str = 'module skin{\n\n';
    keys.forEach(className => {
        str += getContent(className, skinDict[className]);
        str += '\n';
    });
    str += '}';
    return str;
}

function getContent(className, ids) {
    let str = '\texport class ' + className + ' {\n';
    str += "\t\tstatic skinName : string = '" + className + "';\n";
    ids.forEach(array => {
        let id = array[0];
        let type = array[1];
        str += "\t\tstatic " + id + ": string = '" + id + "';\n";
    });
    ids.forEach(array => {
        let id = array[0];
        let type = array[1];
        str += "\t\t" + id + ': ' + type + ';\n';
    });
    str += '\t}\n';
    return str;
}

function writeFile(content) {
    let dest = '../src/config/Skin.ts';
    fs.writeFileSync(dest, content);
}

function main() {
    itemAll(skinRoot);
    let skinData = getSkinData();
    writeFile(skinData);
}

main();
console.log('<src/scritps/skin.ts> updated');