
function testLoc(target: Object, method: string) {
    var orginFunc = target[method];
    return function () {
        function newFunc() {
            test.printMsgLoc(new Error(), `egret: ${method}`);
            debugger;
            var result = orginFunc.apply(this, arguments);
            target[method] = orginFunc;
            return result;
        };
        target[method] = newFunc;
    };
}

function iterate(obj) {
    var keys = Object.keys(obj);
    keys.forEach(key => {
        var target = obj[key];
        var method = key;
        var newFunc = testLoc(target, method);
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
    // 主渲染过程
    render: egret.CanvasRenderer.prototype
};

iterate(engine);

// engine.runEgret;
