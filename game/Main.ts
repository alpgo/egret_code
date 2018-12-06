/// <reference path="TestLoc.ts"/>

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


}

var stage;
