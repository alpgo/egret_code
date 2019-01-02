var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Assets;
(function (Assets) {
    Assets.main_coin_png = 'main_coin_png';
    Assets.main_rank_png = 'main_rank_png';
})(Assets || (Assets = {}));
var Groups;
(function (Groups) {
    Groups.main = 'main';
})(Groups || (Groups = {}));
// 工具函数类
var test;
(function (test) {
    /**
     * 页面初始化(调用初始化装饰器函数)
     */
    function initView() {
        var _this = this;
        var proto = Object.getPrototypeOf(this);
        var inits = proto[test._init_decorate_] || [];
        inits.forEach(function (name) {
            var method = proto[name];
            method.call(_this);
        });
        // bind data models
        var updates = [];
        var binds = proto[test._models_decorate_] || [];
        binds.forEach(function (item) {
            var data = item.model;
            if (data && data.updates) {
                var method = proto[item.view];
                var fn = method.bind(_this);
                data.updates.push(fn);
                updates.push([data, fn]);
            }
            else {
                console.warn(data + "\u5E94\u8BE5\u4ECEgetBindData()\u8FD4\u56DE?");
            }
        });
        // remove updates 
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, function () {
            updates.forEach(function (data, fn) {
                var index = data.updates.indexOf(fn);
                index >= 0 && data.updates.splice(index, 1);
            });
            // 闭包中释放引用的 data && fn
            updates = [];
        }, this);
    }
    test.initView = initView;
    /**
      * 页面初始化函数装饰器
      */
    test._init_decorate_ = "init-decorate";
    function init(target, name, desc) {
        var arr = target[test._init_decorate_] = target[test._init_decorate_] || [];
        arr.push(name);
    }
    test.init = init;
    /**
     * 数据与视图绑定
     */
    test._models_decorate_ = "binddata-decorate";
    function bindData(data) {
        return function (target, property, descriptor) {
            var arr = target[test._models_decorate_] = target[test._models_decorate_] || [];
            arr.push({
                model: data,
                view: property
            });
        };
    }
    test.bindData = bindData;
    /**
     * 基础测试数据(除了数组的元素变化,其他数据具有数据更新通知能力)
     */
    function getBindData(orginData) {
        var currentData = { updates: [] };
        bind(orginData, currentData, "");
        return currentData;
        function bind(orgin, current, keyChain) {
            var keys = Object.keys(orgin);
            keys.forEach(function (key) {
                var currentValue = orgin[key];
                if (Object.prototype.toString.call(currentValue) === "[object Object]") {
                    current[key] = {};
                    bind(orgin[key], current[key], keyChain + "." + key);
                    return;
                }
                Object.defineProperty(current, key, {
                    get: function () { return currentValue; },
                    set: function (value) {
                        if (value != currentValue) {
                            var oldValue_1 = currentValue;
                            currentValue = value;
                            currentData.updates.forEach(function (fn) { return fn(oldValue_1, currentValue, keyChain + "." + key, currentData); });
                        }
                    }
                });
            });
        }
    }
    test.getBindData = getBindData;
    // 条件函数: 当渲染对象的name属性匹配时, 条件成立
    function drawDisplayObject(name) {
        return function (displayObject) {
            return displayObject.name === name;
        };
    }
    test.drawDisplayObject = drawDisplayObject;
})(test || (test = {}));
/// <reference path="Utils.ts"/>
/**
 * EUI原理测试
 */
var test;
(function (test) {
    test.edata = test.getBindData({
        name: '在控制台中通过数据可以更好的控制image的图片属性或者触发调试工具等',
        width: 0,
        horizontalCenter: 0,
        offset: {
            tx: 0
        }
    });
    var CEUI = /** @class */ (function (_super) {
        __extends(CEUI, _super);
        function CEUI() {
            var _this = _super.call(this) || this;
            _this.addEventListener(egret.Event.ADDED_TO_STAGE, function () {
                test.initView.call(_this);
            }, _this);
            return _this;
        }
        CEUI.prototype.addEgretEuiDebug = function () {
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
        };
        CEUI.prototype.createGroup = function () {
            this.group = new eui.Group();
            this.addChild(this.group);
            this.group.width = 400;
            this.group.height = 300;
            this.group.layout = new eui.BasicLayout();
            var outline = new egret.Shape;
            outline.graphics.lineStyle(3, 0x00ff00);
            outline.graphics.beginFill(0x000000, 0);
            outline.graphics.drawRect(0, 0, 400, 300);
            outline.graphics.endFill();
            this.group.addChild(outline);
        };
        CEUI.prototype.createImage = function () {
            this.image = new eui.Image();
            this.image.name = 'image';
            this.image.source = RES.getRes(Assets.main_coin_png);
            this.group.addChild(this.image);
            console.log(this.image.width, this.image.height);
            this.image.y = 100;
            this.image.horizontalCenter = 0;
            test.edata.image = this.image;
        };
        CEUI.prototype.updateData = function (oldValue, newValue, keyName, obj) {
            if (keyName == ".offset.tx") {
                this.image.x = test.edata.offset.tx;
            }
            else if (keyName == ".width") {
                this.group.width = test.edata.width;
            }
            else if (keyName == ".horizontalCenter") {
                this.image.horizontalCenter = test.edata.horizontalCenter;
            }
            console.log("edata" + keyName + "\u66F4\u65B0\u524D" + oldValue + "\u66F4\u65B0\u540E" + newValue);
            // UTEST.runDebugMethod("drawDisplayObject", drawDisplayObject('image')); // 标记待测试方法
        };
        CEUI.prototype.utest = function () {
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
        };
        __decorate([
            test.init
        ], CEUI.prototype, "addEgretEuiDebug", null);
        __decorate([
            test.init
        ], CEUI.prototype, "createGroup", null);
        __decorate([
            test.init
        ], CEUI.prototype, "createImage", null);
        __decorate([
            test.bindData(test.edata)
        ], CEUI.prototype, "updateData", null);
        __decorate([
            test.init
        ], CEUI.prototype, "utest", null);
        return CEUI;
    }(egret.DisplayObjectContainer));
    test.CEUI = CEUI;
})(test || (test = {}));
var CRES;
(function (CRES) {
    function loadGroups(groups) {
        return load({ groups: groups });
    }
    CRES.loadGroups = loadGroups;
    function loadUrls(urls) {
        return load({ urls: urls });
    }
    CRES.loadUrls = loadUrls;
    function loadKeys(keys) {
        return load({ keys: keys });
    }
    CRES.loadKeys = loadKeys;
    function load(data) {
        var groups = data.groups || [], keys = data.keys || [], urls = data.urls || [];
        return new CRESLoader(groups, keys, urls);
    }
    CRES.load = load;
    // URL资源缓存
    var URLRESCache = {};
    function getURLRES(url) {
        return URLRESCache[url];
    }
    CRES.getURLRES = getURLRES;
    // 配置资源中的重复资源列表
    var Repeats = [];
    function init() {
        RES.setMaxRetryTimes(1);
        RES.setMaxLoadingThread(20);
        // 提取重复资源配置数据
        var config = RES['configInstance'];
        var parseConfig = config.parseConfig;
        config.parseConfig = function (data, folder) {
            Repeats = data.repeats || [];
            parseConfig.call(this, data, folder);
        };
        // 
        var getRes = RES.getRes;
        RES.getRes = function (key) {
            var resItem = config.keyMap[key];
            if (!resItem) {
                console.warn("\u8D44\u6E90\u914D\u7F6E\u4E2D\u65E0\u6CD5\u627E\u5230key=" + key + "\u7684\u8D44\u6E90");
                return null;
            }
            else {
                var theKey = resItem.other || key;
                return getRes.call(this, theKey);
            }
        };
        // 
        var getResAsync = RES.getResAsync;
        RES.getResAsync = function (key, compFunc, thisObject) {
            var keyMap = config.keyMap;
            var resItem = keyMap[key];
            var newCompFunc = function (res, name) {
                HandleItemRepeats(name);
                compFunc.call(this, res, name);
            };
            if (resItem.other) {
                getResAsync.call(this, resItem.other, newCompFunc, thisObject);
            }
            else {
                getResAsync.call(this, key, newCompFunc, thisObject);
            }
        };
    }
    CRES.init = init;
    /**
     * 处理资源单项重复
     */
    function HandleItemRepeats(key) {
        var instance = RES['configInstance'];
        var keyMap = instance.keyMap;
        var curItem = keyMap[key];
        if (!curItem.other) {
            var rps = GetRepeatListByItem(key);
            rps.forEach(function (name) {
                var theItem = keyMap[name];
                // 设置重复资源
                if (!theItem.other) {
                    theItem.other = curItem.name;
                    theItem.loaded = curItem.loaded;
                    theItem.type = curItem.type;
                    theItem.url = curItem.url;
                }
            });
        }
    }
    /**
     * 根据重复项获取重复列表
     */
    function GetRepeatListByItem(key) {
        var length = Repeats.length;
        for (var i = 0; i < length; i++) {
            var list = Repeats[i];
            if (list.indexOf(key) != -1) {
                return list;
            }
        }
        return [];
    }
    /**
     * 资源加载器
     */
    var CRESLoader = /** @class */ (function () {
        // @param groups 所有资源组列表
        // @param keys 所有Key资源列表
        // @param urls 所有URL资源列表
        function CRESLoader(groups, keys, urls) {
            var _this = this;
            this.groups = groups;
            this.keys = keys;
            this.urls = urls;
            // 资源组中已经完成加载项个数
            this.groupDic = {};
            // 已经完成加载的异步资源个数
            this.asyncItemsLoaded = 0;
            this.$doProgressFlag = false;
            if (groups.length == 0 && keys.length == 0 && urls.length == 0) {
                console.warn("空资源加载");
                egret.callLater(function () {
                    _this.$onResComplete();
                }, this);
            }
            else {
                this.groupLoading = this.groups.length;
                this.groupItemsTotal = this.getGroupItemsTotal();
                this.asyncItemsTotal = this.keys.length + this.urls.length;
                egret.callLater(function () {
                    if (_this.groups) {
                        _this.$initGroupDicAsync();
                        _this.$initListener();
                        _this.loadGroupList();
                    }
                    _this.loadUrlList();
                    _this.loadKeyList();
                }, this);
            }
        }
        CRESLoader.prototype.$initListener = function () {
            RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onGroupProgress, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onGroupError, this);
            RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemError, this);
        };
        CRESLoader.prototype.$removeListener = function () {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onGroupProgress, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onGroupError, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemError, this);
        };
        // 所有资源组的总资源项个数
        CRESLoader.prototype.getGroupItemsTotal = function () {
            var count = 0;
            var length = this.groups.length;
            for (var i = 0; i < length; i++) {
                var groupName = this.groups[i];
                count += RES.getGroupByName(groupName).length;
            }
            return count;
        };
        CRESLoader.prototype.$initGroupDicAsync = function () {
            if (!this.$doProgressFlag)
                return;
            for (var i = 0; i < this.groups.length; i++) {
                var groupName = this.groups[i];
                this.groupDic[groupName] = 0;
            }
        };
        // 请求加载KEY资源
        CRESLoader.prototype.loadKeyList = function () {
            var _this = this;
            var _loop_1 = function (i) {
                var key = this_1.keys[i];
                RES.getResAsync(key, function () {
                    HandleItemRepeats(key);
                    _this.onResourceItemComp();
                }, this_1);
            };
            var this_1 = this;
            for (var i = 0; i < this.keys.length; i++) {
                _loop_1(i);
            }
        };
        // 请求加载URL资源
        // 因为egret引擎无法获取已经加载过的URL资源，所以采用URLDICT缓存
        CRESLoader.prototype.loadUrlList = function () {
            var _this = this;
            var _loop_2 = function (i) {
                var url = this_2.urls[i];
                RES.getResByUrl(url, function (res) {
                    URLRESCache[url] = res;
                    HandleItemRepeats(url);
                    _this.onResourceItemComp();
                }, this_2);
            };
            var this_2 = this;
            for (var i = 0; i < this.urls.length; i++) {
                _loop_2(i);
            }
        };
        CRESLoader.prototype.onResourceItemComp = function () {
            this.asyncItemsLoaded++;
            this.doResProgress();
            this.doResComplete();
        };
        // 请求加载资源组
        CRESLoader.prototype.loadGroupList = function () {
            for (var i = 0; i < this.groups.length; i++) {
                var groupName = this.groups[i];
                RES.loadGroup(groupName);
            }
        };
        CRESLoader.prototype.findGroup = function (groupName) {
            return this.groups.indexOf(groupName) >= 0;
        };
        // 已经加载的资源个数
        CRESLoader.prototype.getGroupItemsLoaded = function () {
            if (!this.$doProgressFlag) {
                console.warn("不需要加载进度时，不该调用此函数");
                return 0;
            }
            var count = 0;
            for (var groupName in this.groupDic) {
                count += this.groupDic[groupName];
            }
            return count;
        };
        CRESLoader.prototype.onGroupComplete = function (event) {
            if (!this.findGroup(event.groupName))
                return;
            this.groupLoading--;
            if (this.groupLoading <= 0) {
                this.$removeListener();
            }
            this.handleGroupRepeats(event);
            this.groupDic[event.groupName] = RES.getGroupByName(event.groupName).length;
            this.doResProgress();
            this.doResComplete();
        };
        CRESLoader.prototype.onGroupProgress = function (event) {
            if (!this.$doProgressFlag)
                return;
            if (!this.findGroup(event.groupName))
                return;
            this.groupDic[event.groupName] = event.itemsLoaded;
            this.doResProgress();
        };
        CRESLoader.prototype.onGroupError = function (event) {
            if (!this.findGroup(event.groupName))
                return;
            this.onGroupComplete(event);
            console.warn("group{" + event.groupName + "} load failure");
        };
        CRESLoader.prototype.onItemError = function (event) {
            if (!this.findGroup(event.groupName))
                return;
            var resourceItem = event.resItem;
            console.warn("item load failure. INFO: group{" + event.groupName + "} + url{" + resourceItem.url + "} + name{" + resourceItem.name + "}");
        };
        CRESLoader.prototype.doResComplete = function () {
            if (this.asyncItemsLoaded === this.asyncItemsTotal && this.groupLoading <= 0) {
                this.$onResComplete();
            }
        };
        CRESLoader.prototype.doResProgress = function () {
            if (!this.$doProgressFlag)
                return;
            var total = this.asyncItemsTotal + this.groupItemsTotal;
            var loaded = this.getGroupItemsLoaded() + this.asyncItemsLoaded;
            this.$onResProgress(loaded, total);
        };
        // @implements
        CRESLoader.prototype.complete = function (c, thisObject) {
            this.$onResComplete = c.bind(thisObject);
            return this;
        };
        // @implements
        CRESLoader.prototype.progress = function (c, thisObject) {
            this.$doProgressFlag = true;
            this.$onResProgress = c.bind(thisObject);
            return this;
        };
        CRESLoader.prototype.$onResComplete = function () { };
        CRESLoader.prototype.$onResProgress = function (itemsLoaded, itemsTotal) { };
        /**
         * 处理资源组中重复
         */
        CRESLoader.prototype.handleGroupRepeats = function (event) {
            var instance = RES['configInstance'];
            var keyMap = instance.keyMap;
            var groupDic = instance.groupDic;
            var groupName = event.groupName;
            var groups = groupDic[groupName] || [];
            groups.forEach(function (groupItem) { return HandleItemRepeats(groupItem.name); });
        };
        return CRESLoader;
    }());
})(CRES || (CRES = {}));
/// <reference path="Utils.ts"/>
// 滤镜的测试 
var test;
(function (test) {
    var Filters = /** @class */ (function (_super) {
        __extends(Filters, _super);
        function Filters() {
            var _this = _super.call(this) || this;
            _this.name = "filters";
            _this.addEventListener(egret.Event.ADDED_TO_STAGE, function () {
                test.initView.call(_this);
            }, _this);
            _this.cacheAsBitmap = true;
            return _this;
        }
        Filters.prototype.createRankButt = function () {
            var texture = RES.getRes(Assets.main_rank_png);
            var bitmap = new egret.Bitmap(texture);
            bitmap.x = this.stage.stageWidth / 2;
            bitmap.y = this.stage.stageHeight / 2;
            bitmap.scaleX = 2;
            bitmap.scaleY = 2;
            bitmap.anchorOffsetX = 48;
            bitmap.anchorOffsetY = 50;
            bitmap.name = 'rank';
            this.addChild(bitmap);
            this.bitmap = bitmap;
        };
        Filters.prototype.useColorFilter = function () {
            var matrix = [
                2, 0, 0, 0, 0,
                0, 1, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 0, 1, 0
            ];
            var colorFilter = new egret.ColorMatrixFilter(matrix);
            this.bitmap.filters = [colorFilter];
        };
        __decorate([
            test.init
        ], Filters.prototype, "createRankButt", null);
        __decorate([
            test.init
        ], Filters.prototype, "useColorFilter", null);
        return Filters;
    }(egret.DisplayObjectContainer));
    test.Filters = Filters;
})(test || (test = {}));
/**
 * 误区：
 *     * 颜色滤镜的使用，有着CanvasRender.ts/colorFilter()的密集运算，为了提高性能，需要使用 cacheAsBitmap 提高性能， 但是这里有个误区：
 *      1. 虽然 this.bitmap.cacheAsBitmap = true, 但是每一帧都会运行colorFilter()，看起来 cacheAsBitmap 没有起着作用。正确的办法如下 >
 *      2. 将 this.bitmap.parent.cacheAsBitmap = true，此时 colorFilter() 就不会一直运行了。
 *     （正确方法）当子元素设置filters时，应该将该父元素设置为cacheAsBitmap.
 */ 
var stage;
var Main = /** @class */ (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, function () {
            test.initView.call(_this);
            RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, function () {
                CRES.init();
                CRES.loadGroups([Groups.main]).complete(_this.onRESLoaded, _this);
            }, _this);
            RES.loadConfig("resource/default.res.json", "resource/");
        }, _this);
        return _this;
    }
    Main.prototype.setStageBgColor = function () {
        stage = this.stage;
        var canvas = document.getElementsByTagName('canvas')[0];
        canvas.style.backgroundColor = 'rgba(185,211,238,0.5)';
    };
    Main.prototype.onRESLoaded = function () {
        // let filters = new test.Filters();
        // let mask = new test.Mask();
        var ceui = new test.CEUI();
        this.stage.addChild(ceui);
        this.stage.removeChild(this);
    };
    Main.prototype.addEgretEngineDebug = function () {
        UTEST.setON();
        // 配置数据: 待标记原始方法为可调试方法
        UTEST.parseConfig({
            // 白鹭初始化
            runEgret: egret,
            // 屏幕尺寸计算
            // updateScreenSize: egret.web.WebPlayer.prototype,
            // 更新舞台尺寸
            updateStageSize: egret.sys.Player.prototype,
            // 舞台Stage的displayList初始化
            createDisplayList: egret.sys.Player.prototype,
            // 主渲染过程
            render: egret.CanvasRenderer.prototype,
            // 渲染单个对象 （通过为特定的对象添加name属性，可特定调试某个对象的渲染过程）
            drawDisplayObject: egret.CanvasRenderer.prototype
        });
    };
    __decorate([
        test.init
    ], Main.prototype, "setStageBgColor", null);
    __decorate([
        test.init
    ], Main.prototype, "addEgretEngineDebug", null);
    return Main;
}(egret.DisplayObjectContainer));
/// <reference path="Utils.ts"/>
// 遮罩的测试
var test;
(function (test) {
    var Mask = /** @class */ (function (_super) {
        __extends(Mask, _super);
        function Mask() {
            var _this = _super.call(this) || this;
            _this.name = 'mask';
            _this.addEventListener(egret.Event.ADDED_TO_STAGE, function () {
                test.initView.call(_this);
            }, _this);
            return _this;
        }
        Mask.prototype.createRankButt = function () {
            var texture = RES.getRes(Assets.main_rank_png);
            var bitmap = new egret.Bitmap(texture);
            bitmap.x = this.stage.stageWidth / 2;
            bitmap.y = this.stage.stageHeight / 2;
            // bitmap.scaleX = 2;
            // bitmap.scaleY = 2;
            // bitmap.anchorOffsetX = 48;
            // bitmap.anchorOffsetY = 50;
            bitmap.name = 'mask-rank';
            this.addChild(bitmap);
            this.bitmap = bitmap;
        };
        // @init
        Mask.prototype.useMaskByRect = function () {
            var rect = new egret.Rectangle(0, 0, 96, 50);
            this.bitmap.mask = rect;
        };
        // @init
        Mask.prototype.useMaskByShapeObj = function () {
            var circle = new egret.Shape();
            circle.graphics.beginFill(0x0000ff);
            circle.graphics.drawCircle(48, 50, 30);
            circle.graphics.endFill();
            circle.x = this.stage.stageWidth / 2;
            circle.y = this.stage.stageHeight / 2;
            this.addChild(circle);
            this.bitmap.mask = circle;
        };
        // @init
        Mask.prototype.useMaskByBitmap = function () {
            var maskObj = new egret.Bitmap();
            maskObj.x = this.stage.stageWidth / 2;
            maskObj.y = this.stage.stageHeight / 2;
            maskObj.texture = RES.getRes(Assets.main_coin_png);
            this.addChild(maskObj);
            this.bitmap.mask = maskObj;
        };
        __decorate([
            test.init
        ], Mask.prototype, "createRankButt", null);
        return Mask;
    }(egret.DisplayObjectContainer));
    test.Mask = Mask;
})(test || (test = {}));
//# sourceMappingURL=game.js.map