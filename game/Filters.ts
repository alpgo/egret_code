/// <reference path="Utils.ts"/>

// 滤镜的测试 
module test {
    export class Filters extends egret.DisplayObjectContainer {
        constructor() {
            super();
            this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
                initView.call(this);
            }, this);
        }

        @init
        public createBg() {
            let bg = new egret.Sprite();
            bg.graphics.beginFill(0x333, 0.5);
            bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
            bg.graphics.endFill();
            this.addChild(bg);
        }

        @init
        public create() {
            let texture = RES.getRes(Assets.main_rank_png);
            let bitmap = new egret.Bitmap(texture);
            this.addChild(bitmap);
        }
    }
}