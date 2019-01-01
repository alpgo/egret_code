/// <reference path="Utils.ts"/>

/**
 * EUI原理测试
 */
module test {

    export let edata = getBindData({
        name: '在控制台中通过数据可以更好的控制image的图片属性或者触发调试工具等',
        offset: {
            tx: 0
        }
    });

    export class CEUI extends egret.DisplayObjectContainer {
        constructor() {
            super();
            this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
                initView.call(this);
            }, this);
        }

        @init
        public addEgretEuiDebug() {
            UTEST.parseConfig({

            });
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
            this.image.name = 'image';
            this.image.source = RES.getRes(Assets.main_coin_png);
            this.group.addChild(this.image);
        }

        @init
        @bindData(edata)
        public updateData(oldValue, newValue, keyName, obj) {
            this.image.x = edata.offset.tx;
            console.log(`edata${keyName}更新前${oldValue}更新后${newValue}`);
            UTEST.runDebugMethod("drawDisplayObject", drawDisplayObject('image')); // 标记待测试方法
        }
    }
}
