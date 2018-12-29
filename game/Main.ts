var stage;

class Main extends egret.DisplayObjectContainer {

    constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            test.initView.call(this);
            RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, () => {
                CRES.init();
                CRES.loadGroups([Groups.main]).complete(this.onRESLoaded, this);
            }, this);
            RES.loadConfig("resource/default.res.json", "resource/");
        }, this);
    }

    @test.init
    setStageBgColor() {
        stage = this.stage;
        var canvas = document.getElementsByTagName('canvas')[0];
        canvas.style.backgroundColor = 'rgba(185,211,238,0.5)';
    }

    onRESLoaded() {
        // let filters = new test.Filters();
        // let mask = new test.Mask();
        let ceui = new test.CEUI();
        this.stage.addChild(ceui);
        this.stage.removeChild(this);
    }


    @test.init
    addEgretEngineDebug() {
        // 配置数据: 待标记原始方法为可调试方法
        UTEST.parseConfig({
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
        });
    }
}

