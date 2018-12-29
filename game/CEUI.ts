/// <reference path="Utils.ts"/>

/**
 * EUI原理测试
 */
module test {

    export let edata = getBindData({
        name: '通过数据控制image的图片属性',
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

        set show(value) {
            if (value > 10) {
                console.log(10);
            }
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

        // @init
        public init0() {
            // 测试set方法
            UTEST.setDebugMethod("show", Object.getPrototypeOf(this))();
            this.show = 100;
        }

        @bindData(edata)
        public updateData(oldValue, newValue, keyName, obj) {
            this.image.x = edata.offset.tx;
            UTEST.runDebugMethod("drawDisplayObject", drawDisplayObject('image')); // 标记待测试方法
            console.log(`edata${keyName}更新前${oldValue}更新后${newValue}`);
        }
    }
}
