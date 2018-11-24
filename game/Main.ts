/// <reference path="TestLoc.ts"/>

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
