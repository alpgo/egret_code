class Main extends egret.DisplayObjectContainer {

    constructor() {
        super();
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, () => {
            CRES.init();
            CRES.loadGroups([Groups.main]).complete(this.onRESLoaded, this);
        }, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    onRESLoaded() {
        stage = this.stage;
        let filters = new test.Filters();
        this.stage.addChild(filters);
        this.stage.removeChild(this);
    }
}

var stage;

/**
 * 测试egret$render的一次渲染过程
 */
var renderObj = {
    originRender: null,
    start: function () {
        this.originRender = egret.CanvasRenderer.prototype.render;
        egret.CanvasRenderer.prototype.render = function (...args): any {
            const result = renderObj.originRender.call(this, ...args);
            renderObj.stop();
            return result;
        };
    },
    stop: function () {
        egret.CanvasRenderer.prototype.render = renderObj.originRender;
        test.printMsgLoc(new Error(), 'egret render function');
        debugger;
    }
};