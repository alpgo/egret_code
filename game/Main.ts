class Main extends egret.DisplayObjectContainer {
    constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    onAddToStage() {
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onGameStart, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }
    onGameStart() {
        CRES.init();
        CRES.loadGroups([Groups.main]).complete(() => {
            var bit = new egret.Bitmap();
            var res = RES.getRes(Assets.main_rank_png);
            bit.texture = res;
            this.addChild(bit);
        }, this);
    }
}
