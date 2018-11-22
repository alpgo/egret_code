/**
 * 用户操作,命令行解析
 */
function main() {
    var readlineSync = require('readline-sync');
    printCommand();
    let line = readlineSync.question('Input > ');
    switch (line.trim()) {
        case '1':
            require('./single')();
            break;
        case '2':
            require('./pack')(true);
            break;
            // case '3':
            // require('./pack')(false);
            // break;
        case '4':
            require('./skin');
            break;
        case '5':
            process.exit(0);
            break;
        default:
            console.log('没有找到命令！');
            main();
            break;
    }
}

function printCommand() {
    console.log('\033[2J');
    console.log('\n---------  command list -------- \n')
    console.log('1: 单张图片资源');
    console.log('2: 图集资源发布');
    // console.log('3: 图集发布 (Not Textmerge), 测试专用');
    console.log('4: 皮肤ID生成');
    console.log('5: 退出');
    console.log('');
}

main();