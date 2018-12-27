module test {

    // 主容器: 所有的配置方法
    const container = {};

    // 配置数据: 待标记原始方法为可调试方法
    const engine = {
        // 白鹭初始化
        runEgret: egret,
        // 屏幕尺寸计算
        updateScreenSize: egret.web.WebPlayer.prototype,
        // 更新舞台尺寸
        updateStageSize: egret.sys.Player.prototype,
        // 舞台Stage的displayList初始化
        createDisplayList: egret.sys.Player.prototype,
        // 主渲染过程
        render: egret.CanvasRenderer.prototype, 
        // 渲染单个对象 （通过为特定的对象添加name属性，可特定调试某个对象的渲染过程）
        drawDisplayObject: egret.CanvasRenderer.prototype
    };

    // 条件函数: 当渲染对象的name属性匹配时, 条件成立
    export function drawDisplayObject(name: string) {
        return function (displayObject: egret.DisplayObject) {
            return displayObject.name === name;
        };
    }

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

    // 检测debugItem的accessKey是否重复
    function isRepeatAccessKey(accessKey: string, target: Object, methodKey: string) {
        // chess parameters
        const item = container[accessKey];
        if (item) {
            // 判断目前设置的方法与已经设置的item对应的方法是否为相同的方法
            const sameTargetAndMethod = (item.target === target && item.methodKey === methodKey);
            if (!sameTargetAndMethod) {
                // 不同的方法使用了相同的accessKey
                console.warn(`出现了重复的访问属性${accessKey},请保持唯一性`);
                return true;
            } else {
                //  同一个方法, 重复设置该方法target.methodKey为调试方法
            }
        }
        return false;
    }

    function createDebugObj(options: any) {
        let descriptor = Object.getOwnPropertyDescriptor(options.target, options.methodKey);
        let originFunc = descriptor.value || descriptor.set;
        return {
            target: options.target,
            methodKey: options.methodKey,
            cond: options.cond,
            originFunc: originFunc,
            run: function () {
                var that = this;
                that.updateOrginMethod(function () {
                    var testFlag = false;
                    var cond = that.cond;
                    // 若没有条件过滤 || 条件判断正确, 则添加调试
                    if (!cond || cond.apply(this, arguments)) {
                        testFlag = true;
                        test.printMsgLoc(new Error(), `[method]: ${that.methodKey}`);
                        debugger;
                    }
                    var result = that.originFunc.apply(this, arguments);
                    // 如果已经被测试完, 则立即恢复原函数. 否则, 继续保持待测试状态,等待测试条件满足了,测试完再恢复. (每次设置测试方法, 只能被测试一次)
                    testFlag && that.recoverOrginMethod();
                    return result;
                });
            },
            recoverOrginMethod: function () {
                if (descriptor.value) {
                    descriptor.value = this.originFunc;
                } else if (descriptor.set) {
                    descriptor.set = this.originFunc;
                }
                Object.defineProperty(options.target, options.methodKey, descriptor);
            },
            updateOrginMethod: function (newFunc) {
                if (descriptor.value) {
                    descriptor.value = newFunc;
                } else if (descriptor.set) {
                    descriptor.set = newFunc;
                }
                Object.defineProperty(options.target, options.methodKey, descriptor);
            }
        };
    }

    /**
     * 标记原始方法为可调式方法
     * @param accessKey 直接访问的属性名称(默认: methodKey相同)
     * @param target 原始方法的对象
     * @param methodKey 原始方法的名称
     * @param cond 测试成立条件
     */
    export function setDebugMethod(accessKey: string, target: Object, cond?: Function, methodKey?: string) {
        methodKey = methodKey || accessKey;
        if (isRepeatAccessKey(accessKey, target, methodKey)) {
            return;
        }
        let obj = container[accessKey] || createDebugObj({
            accessKey: accessKey,
            target: target,
            methodKey: methodKey,
            cond: cond
        });
        // 更新调试参数信息
        obj.cond = cond;
        container[accessKey] = obj;
        return function () {
            obj.run();
        };
    }

    // 初始化所有的调试信息
    (function iterate() {
        var keys = Object.keys(engine);
        keys.forEach(key => {
            var value = engine[key];
            var target = value;
            var methodKey = key;
            var cond = null;
            if (Object.prototype.toString.call(value) == '[object Array]') {
                target = value[0];
                let param2 = value[1];
                if (typeof param2 == 'string') {
                    methodKey = param2;
                    cond = value[2];
                } else {
                    cond = param2;
                }
            }
            setDebugMethod(key, target, cond, methodKey);
        });
    }());

    // container.drawDisplayObject;

    // 导出名称container别名, 避免外部滥用container名称, 最后可能多处需要修改(因为该文件以后可能依赖具体需求有很多改动, 因为container命名方式看起来不太妥当, 以后可能会改成其他名称)
    export function testMethod(accessKey: string, condition?: Function) {
        let obj = container[accessKey];
        if (!obj) {
            console.warn(`找不到测试方法${accessKey}`);
            return;
        }
        if (condition) {
            setDebugMethod(accessKey, obj.target, condition, obj.methodKey);
        }
        obj.run();
    }
}