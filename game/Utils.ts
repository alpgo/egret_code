// 工具函数类
module test {
    /**
     * 可追踪调用过程的打印方法
     */
    export function printMsgLoc(error, ...args) {
        // 检测参数
        if (Object.prototype.toString.call(error) != "[object Error]") {
            console.warn('the first param not an Error');
            return;
        }
        // 分解多行处理
        var lines = error.stack.split('\n');
        // error.message 输出行数，IF "", 全部输出 { +"10" => 10, 这里+号的作用可将字符串转化为Number类型或者NaN}
        var count = +error.message || lines.length;
        // 打印的参数信息 {// arguments[1..] 简单的数据输出（数字, 字符串）}
        var message = [].slice.call(arguments, 1).join(" ");
        // 更新第一行数据
        var line0 = lines[0].slice(0, 5) + "\t" + message;
        // 组合多行内容
        var result = [line0].concat(lines.slice(1, count + 1)).join("\n");

        console.log(result);

        return function () {
            console.log.apply(null, arguments);
        };
    }

    /**
     * 页面初始化(调用初始化装饰器函数)
     */
    export function initView() {
        let proto = Object.getPrototypeOf(this);
        let inits = proto[_init_decorate_] || [];
        inits.forEach(name => {
            let method = proto[name];
            method.call(this);
        });
    }

    /**
     * 页面初始化函数装饰器
     */
    export const _init_decorate_ = "init-decorate";
    export function init(target, name, desc) {
        var arr = target[_init_decorate_] = target[_init_decorate_] || [];
        arr.push(name);
    }
}