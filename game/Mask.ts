/// <reference path="Utils.ts"/>

// 遮罩的测试
module test {
    export class Mask extends egret.DisplayObjectContainer {

        constructor() {
            super();
            this.name = 'mask';
            this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
                initView.call(this);
            }, this);
        }

        private bitmap: egret.Bitmap;
        @init
        public createRankButt() {
            let texture = RES.getRes(Assets.main_rank_png);
            let bitmap = new egret.Bitmap(texture);
            bitmap.x = this.stage.stageWidth / 2;
            bitmap.y = this.stage.stageHeight / 2;
            // bitmap.scaleX = 2;
            // bitmap.scaleY = 2;
            // bitmap.anchorOffsetX = 48;
            // bitmap.anchorOffsetY = 50;
            bitmap.name = 'mask-rank';
            this.addChild(bitmap);
            this.bitmap = bitmap;
        }

        // @init
        public useMaskByRect() {
            var rect: egret.Rectangle = new egret.Rectangle(0, 0, 96, 50);
            this.bitmap.mask = rect;
        }

        // @init
        public useMaskByShapeObj() {
            var circle: egret.Shape = new egret.Shape();
            circle.graphics.beginFill(0x0000ff);
            circle.graphics.drawCircle(48, 50, 30);
            circle.graphics.endFill();
            circle.x = this.stage.stageWidth / 2;
            circle.y = this.stage.stageHeight / 2;
            this.addChild(circle);
            this.bitmap.mask = circle;
        }

        // @init
        public useMaskByBitmap() {
            var maskObj = new egret.Bitmap();
            maskObj.x = this.stage.stageWidth / 2;
            maskObj.y = this.stage.stageHeight / 2;
            maskObj.texture = RES.getRes(Assets.main_coin_png);
            this.addChild(maskObj);
            this.bitmap.mask = maskObj;
        }
    }
}