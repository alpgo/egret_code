
/**
 * 为某个对象的特定方法添加调试定位
 * @param target 对象
 * @param method 方法
 * @param cond 过滤条件
 */
function testLoc(target: Object, method: string, cond?: Function) {
    var orginFunc = target[method];
    return function () {
        function newFunc() {
            var testFlag = false;
            // 若没有条件过滤 || 条件判断正确, 则添加调试
            if (!cond || cond.apply(this, arguments)) {
                testFlag = true;
                test.printMsgLoc(new Error(), `egret: ${method}`);
                debugger;
            }
            var result = orginFunc.apply(this, arguments);
            testFlag && (target[method] = orginFunc);   // 测试完立即恢复原函数，否则该函数每次执行时都是被打上断点。
            return result;
        };
        target[method] = newFunc;
    };
}

/**
 * 初始化所有的调试信息
 */
function iterate(obj) {
    var keys = Object.keys(obj);
    keys.forEach(key => {
        var value = obj[key];
        var method = key;
        if (Object.prototype.toString.call(value) == '[object Array]') {
            var target = value[0];
            var cond = value[1];
            var newFunc = testLoc(target, method, cond);
        } else {
            var target = value;
            var newFunc = testLoc(target, method);
        }
        Object.defineProperty(obj, key, {
            get: function () {
                newFunc();
            }
        });
    });
}

/**
 * 以后可扩展时间测量
 */
function ticker() {
    let update = egret.sys.SystemTicker.prototype.update;
    egret.sys.SystemTicker.prototype.update = function () {
        update.call(this, arguments);
    };
}

ticker();

// 渲染单个对象时，若name属性匹配时调试定位控制有效 
function drawDisplayObject(name: string) {
    return function (displayObject: egret.DisplayObject) {
        return displayObject.name === name;
    };
}

/**
 * 引擎的所有待测试函数的配置（定位函数 => 断点调试 => 理解原理）
 */
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
    drawDisplayObject: [egret.CanvasRenderer.prototype, drawDisplayObject('filters')]
};

iterate(engine);

// engine.drawDisplayObject;
