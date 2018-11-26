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

    onRESLoaded() {
        let filters = new test.Filters();
        this.stage.addChild(filters);
        this.stage.removeChild(this);
    }

    @test.init
    setStageBgColor() {
        stage = this.stage;
        var canvas = document.getElementsByTagName('canvas')[0];
        canvas.style.backgroundColor = 'rgba(185,211,238,0.5)';
    }
}

var stage;
