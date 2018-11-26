/// <reference path="Utils.ts"/>

// 滤镜的测试 
module test {
    export class Filters extends egret.DisplayObjectContainer {
        constructor() {
            super();
            this.name = "filters";
            this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
                initView.call(this);
            }, this);
            this.cacheAsBitmap = true;
        }

        private bitmap: egret.Bitmap;
        @init
        public createRankButt() {
            let texture = RES.getRes(Assets.main_rank_png);
            let bitmap = new egret.Bitmap(texture);
            bitmap.x = this.stage.stageWidth / 2;
            bitmap.y = this.stage.stageHeight / 2;
            bitmap.scaleX = 2;
            bitmap.scaleY = 2;
            bitmap.anchorOffsetX = 48;
            bitmap.anchorOffsetY = 50;
            bitmap.name = 'rank';
            this.addChild(bitmap);
            this.bitmap = bitmap;
        }

        @init
        public useColorFilter() {
            let matrix = [
                2, 0, 0, 0, 0,
                0, 1, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 0, 1, 0
            ];
            let colorFilter = new egret.ColorMatrixFilter(matrix);
            this.bitmap.filters = [colorFilter];
        }
    }
}
/**
 * 误区：
 *     * 颜色滤镜的使用，有着CanvasRender.ts/colorFilter()的密集运算，为了提高性能，需要使用 cacheAsBitmap 提高性能， 但是这里有个误区： 
 *      1. 虽然 this.bitmap.cacheAsBitmap = true, 但是每一帧都会运行colorFilter()，看起来 cacheAsBitmap 没有起着作用。正确的办法如下 > 
 *      2. 将 this.bitmap.parent.cacheAsBitmap = true，此时 colorFilter() 就不会一直运行了。
 *     （正确方法）当子元素设置filters时，应该将该父元素设置为cacheAsBitmap.
 */