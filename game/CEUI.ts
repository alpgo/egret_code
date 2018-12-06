/// <reference path="Utils.ts"/>

/**
 * EUI原理测试
 */
module test {
    export class CEUI extends egret.DisplayObjectContainer {
        constructor() {
            super();
            this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
                initView.call(this);
            }, this);
        }

        private group: eui.Group;
        @init
        public createGroup() {
            this.group = new eui.Group();
            this.addChild(this.group);
        }

        private image: eui.Image;
        @init
        public createImage() {
            this.image = new eui.Image();
            this.image.source = RES.getRes(Assets.main_coin_png);
            this.group.addChild(this.image);
        }
    }
}
