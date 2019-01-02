/// <reference path="Utils.ts"/>

/**
 * EUI原理测试
 */
module test {

    export let edata = getBindData({
        name: '在控制台中通过数据可以更好的控制image的图片属性或者触发调试工具等',
        width: 0,
        horizontalCenter: 0,
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
                // Component
                setMeasuredSize: eui.Component.prototype,
                invalidateProperties: eui.Component.prototype,
                validateProperties: eui.Component.prototype,
                invalidateSize: eui.Component.prototype,
                validateSize: eui.Component.prototype,
                invalidateDisplayList: eui.Component.prototype,
                validateDisplayList: eui.Component.prototype,
                validateNow: eui.Component.prototype,
                setLayoutBoundsSize: eui.Component.prototype,
                setLayoutBoundsPosition: eui.Component.prototype,
                getLayoutBounds: eui.Component.prototype,
                getPreferredBounds: eui.Component.prototype,
                // UIComponent
                u_setMeasuredSize: [eui.sys.UIComponentImpl.prototype, "setMeasuredSize"],
                u_invalidateProperties: [eui.sys.UIComponentImpl.prototype, "invalidateProperties"],
                u_validateProperties: [eui.sys.UIComponentImpl.prototype, "validateProperties"],
                u_invalidateSize: [eui.sys.UIComponentImpl.prototype, "invalidateSize"],
                u_validateSize: [eui.sys.UIComponentImpl.prototype, "validateSize"],
                u_invalidateDisplayList: [eui.sys.UIComponentImpl.prototype, "invalidateDisplayList"],
                u_validateDisplayList: [eui.sys.UIComponentImpl.prototype, "validateDisplayList"],
                u_validateNow: [eui.sys.UIComponentImpl.prototype, "validateNow"],
                u_setLayoutBoundsSize: [eui.sys.UIComponentImpl.prototype, "setLayoutBoundsSize"],
                u_setLayoutBoundsPosition: [eui.sys.UIComponentImpl.prototype, "setLayoutBoundsPosition"],
                u_getLayoutBounds: [eui.sys.UIComponentImpl.prototype, "getLayoutBounds"],
                u_getPreferredBounds: [eui.sys.UIComponentImpl.prototype, "getPreferredBounds"],
                u_invalidateParentLayout: [eui.sys.UIComponentImpl.prototype, "invalidateParentLayout"],
                // Validator
                v_invalidateProperties: [eui.sys.Validator.prototype, "invalidateProperties"],
                v_validateProperties: [eui.sys.Validator.prototype, "validateProperties"],
                v_invalidateSize: [eui.sys.Validator.prototype, "invalidateSize"],
                v_validateSize: [eui.sys.Validator.prototype, "validateSize"],
                v_invalidateDisplayList: [eui.sys.Validator.prototype, "invalidateDisplayList"],
                v_validateDisplayList: [eui.sys.Validator.prototype, "validateDisplayList"],
                validateClient: eui.sys.Validator.prototype
            });
        }

        private group: eui.Group;
        @init
        public createGroup() {
            this.group = new eui.Group();
            this.addChild(this.group);
            this.group.width = 400;
            this.group.height = 300;
            this.group.layout = new eui.BasicLayout();

            var outline: egret.Shape = new egret.Shape;
            outline.graphics.lineStyle(3, 0x00ff00);
            outline.graphics.beginFill(0x000000, 0);
            outline.graphics.drawRect(0, 0, 400, 300);
            outline.graphics.endFill();
            this.group.addChild(outline);
        }

        private image: eui.Image;
        @init
        public createImage() {
            this.image = new eui.Image();
            this.image.name = 'image';
            this.image.source = RES.getRes(Assets.main_coin_png);
            this.group.addChild(this.image);
            console.log(this.image.width, this.image.height);
            this.image.y = 100;
            this.image.horizontalCenter = 0;
            edata.image = this.image;
        }

        @bindData(edata)
        public updateData(oldValue, newValue, keyName, obj) {
            if (keyName == ".offset.tx") {
                this.image.x = edata.offset.tx;
            } else if (keyName == ".width") {
                this.group.width = edata.width;
            } else if (keyName == ".horizontalCenter") {
                this.image.horizontalCenter = edata.horizontalCenter;
            }
            console.log(`edata${keyName}更新前${oldValue}更新后${newValue}`);
            // UTEST.runDebugMethod("drawDisplayObject", drawDisplayObject('image')); // 标记待测试方法
        }

        @init
        utest() {
            UTEST.setDebugMethod("i_invalidateParentLayout", eui.Image.prototype, null, "invalidateParentLayout")();

            UTEST.runDebugMethod("invalidateProperties");
            UTEST.runDebugMethod("invalidateSize");
            UTEST.runDebugMethod("invalidateDisplayList");

            UTEST.runDebugMethod("u_invalidateProperties");
            UTEST.runDebugMethod("u_invalidateSize");
            UTEST.runDebugMethod("u_invalidateDisplayList");
            UTEST.runDebugMethod("u_invalidateParentLayout");

            UTEST.runDebugMethod("v_invalidateProperties");
            UTEST.runDebugMethod("v_invalidateSize");
            UTEST.runDebugMethod("v_invalidateDisplayList");
        }
    }
}
