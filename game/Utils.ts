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
        // bind data models
        let updates = [];
        let binds = proto[_models_decorate_] || [];
        binds.forEach(item => {
            var data = item.model;
            if (data && data.updates) {
                var method = proto[item.view];
                var fn = method.bind(this);
                data.updates.push(fn);
                updates.push([data, fn]);
            } else {
                console.warn(`${data}应该从getBindData()返回?`);
            }
        });
        // remove updates 
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
            updates.forEach((data, fn) => {
                let index = data.updates.indexOf(fn);
                index >= 0 && data.updates.splice(index, 1);
            });
            // 闭包中释放引用的 data && fn
            updates = [];
        }, this);
    }

    /**
      * 页面初始化函数装饰器
      */
    export const _init_decorate_ = "init-decorate";
    export function init(target, name, desc) {
        var arr = target[_init_decorate_] = target[_init_decorate_] || [];
        arr.push(name);
    }

    /**
     * 数据与视图绑定
     */
    export const _models_decorate_ = "binddata-decorate";
    export function bindData(data) {
        return function (target, property, descriptor) {
            var arr = target[_models_decorate_] = target[_models_decorate_] || [];
            arr.push({
                model: data,
                view: property
            });
        };
    }

    /**
     * 基础测试数据(除了数组的元素变化,其他数据具有数据更新通知能力)
     */
    export function getBindData(orginData): any {
        let currentData = { updates: [] };
        bind(orginData, currentData, "");
        return currentData;

        function bind(orgin, current, keyChain) {
            let keys = Object.keys(orgin);
            keys.forEach(key => {
                let currentValue = orgin[key];
                if (Object.prototype.toString.call(currentValue) === "[object Object]") {
                    current[key] = {};
                    bind(orgin[key], current[key], keyChain + "." + key);
                    return;
                }
                Object.defineProperty(current, key, {
                    get: function () { return currentValue; },
                    set: function (value) {
                        if (value != currentValue) {
                            let oldValue = currentValue;
                            currentValue = value;
                            currentData.updates.forEach(fn => fn(oldValue, currentValue, keyChain + "." + key, currentData));
                        }
                    }
                });
            });
        }
    }

}