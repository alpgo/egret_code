
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
 * 引擎的所有待测试函数的配置（定位函数 => 断点调试 => 理解原理）
 */
const engine = {
    // 主渲染过程
    render: egret.CanvasRenderer.prototype,
    // 屏幕尺寸计算
    updateScreenSize: egret.web.WebPlayer.prototype
};

iterate(engine);

engine.updateScreenSize;
