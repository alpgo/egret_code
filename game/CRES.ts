module CRES {

    export interface IRESLoader {
        complete(c: Function, thisObject: any): IRESLoader;
        progress(c: Function, thisObject: any): IRESLoader;
    }

    export interface IRESData {
        groups?: string[];
        urls?: string[];
        keys?: string[];
    }

    export function loadGroups(groups: string[]): IRESLoader {
        return load({ groups: groups });
    }

    export function loadUrls(urls: string[]): IRESLoader {
        return load({ urls: urls });
    }

    export function loadKeys(keys: string[]): IRESLoader {
        return load({ keys: keys });
    }

    export function load(data: IRESData): IRESLoader {
        let groups = data.groups || [],
            keys = data.keys || [],
            urls = data.urls || [];
        return new CRESLoader(groups, keys, urls);
    }

    // URL资源缓存
    const URLRESCache: any = {};

    export function getURLRES(url: string): any {
        return URLRESCache[url];
    }

    // 配置资源中的重复资源列表
    let Repeats = [];

    export function init() {
        RES.setMaxRetryTimes(1);
        RES.setMaxLoadingThread(20);
        // 提取重复资源配置数据
        let config = RES['configInstance'];
        let parseConfig = config.parseConfig;
        config.parseConfig = function (data: any, folder: string) {
            Repeats = data.repeats || [];
            parseConfig.call(this, data, folder);
        };
        // 
        let getRes = RES.getRes;
        RES.getRes = function (key: string) {
            let resItem: KeyItem = config.keyMap[key];
            if (!resItem) {
                console.warn(`资源配置中无法找到key=${key}的资源`);
                return null;
            } else {
                let theKey: string = resItem.other || key;
                return getRes.call(this, theKey);
            }
        }
        // 
        let getResAsync = RES.getResAsync;
        RES.getResAsync = function (key: string, compFunc: Function, thisObject: any) {
            let keyMap = config.keyMap;
            let resItem = keyMap[key];
            let newCompFunc = function (res: any, name: string) {
                HandleItemRepeats(name);
                compFunc.call(this, res, name);
            };
            if (resItem.other) {
                getResAsync.call(this, resItem.other, newCompFunc, thisObject);
            } else {
                getResAsync.call(this, key, newCompFunc, thisObject);
            }
        };
    }

    /** 
     * 处理资源单项重复
     */
    function HandleItemRepeats(key: string) {
        let instance = RES['configInstance'];
        let keyMap = instance.keyMap;
        let curItem: KeyItem = keyMap[key];
        if (!curItem.other) {
            let rps = GetRepeatListByItem(key);
            rps.forEach(name => {
                let theItem: KeyItem = keyMap[name];
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
    function GetRepeatListByItem(key: string): string[] {
        let length = Repeats.length;
        for (let i = 0; i < length; i++) {
            let list = Repeats[i];
            if (list.indexOf(key) != -1) {
                return list;
            }
        }
        return [];
    }

    /**
     * 资源加载器
     */
    class CRESLoader implements IRESLoader {

        // 资源组中已经完成加载项个数
        private groupDic: any = {};

        // 待加载的资源组个数
        private groupLoading: number;

        // 组加载资源总数
        private groupItemsTotal: number;

        // 异步加载资源总数
        private asyncItemsTotal: number;

        // 已经完成加载的异步资源个数
        private asyncItemsLoaded: number = 0;

        private $initListener() {
            RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onGroupProgress, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onGroupError, this);
            RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemError, this);
        }

        private $removeListener() {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onGroupProgress, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onGroupError, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemError, this);
        }

        // @param groups 所有资源组列表
        // @param keys 所有Key资源列表
        // @param urls 所有URL资源列表
        public constructor(public groups: string[], public keys: string[], public urls: string[]) {
            if (groups.length == 0 && keys.length == 0 && urls.length == 0) {
                console.warn("空资源加载");
                egret.callLater(() => {
                    this.$onResComplete();
                }, this);
            } else {
                this.groupLoading = this.groups.length;
                this.groupItemsTotal = this.getGroupItemsTotal();
                this.asyncItemsTotal = this.keys.length + this.urls.length;
                egret.callLater(() => {
                    if (this.groups) {
                        this.$initGroupDicAsync();
                        this.$initListener();
                        this.loadGroupList();
                    }
                    this.loadUrlList();
                    this.loadKeyList();
                }, this);
            }
        }

        // 所有资源组的总资源项个数
        private getGroupItemsTotal(): number {
            let count = 0;
            let length = this.groups.length;
            for (let i = 0; i < length; i++) {
                let groupName = this.groups[i];
                count += RES.getGroupByName(groupName).length;
            }
            return count;
        }

        private $initGroupDicAsync() {
            if (!this.$doProgressFlag) return;
            for (let i = 0; i < this.groups.length; i++) {
                let groupName = this.groups[i];
                this.groupDic[groupName] = 0;
            }
        }

        // 请求加载KEY资源
        private loadKeyList() {
            for (let i = 0; i < this.keys.length; i++) {
                let key = this.keys[i];
                RES.getResAsync(key, () => {
                    HandleItemRepeats(key);
                    this.onResourceItemComp();
                }, this);
            }
        }

        // 请求加载URL资源
        // 因为egret引擎无法获取已经加载过的URL资源，所以采用URLDICT缓存
        private loadUrlList() {
            for (let i = 0; i < this.urls.length; i++) {
                let url = this.urls[i];
                RES.getResByUrl(url, (res: any) => {
                    URLRESCache[url] = res;
                    HandleItemRepeats(url);
                    this.onResourceItemComp();
                }, this);
            }
        }

        private onResourceItemComp() {
            this.asyncItemsLoaded++;
            this.doResProgress();
            this.doResComplete();
        }

        // 请求加载资源组
        private loadGroupList() {
            for (let i = 0; i < this.groups.length; i++) {
                let groupName = this.groups[i];
                RES.loadGroup(groupName);
            }
        }

        private findGroup(groupName: string): boolean {
            return this.groups.indexOf(groupName) >= 0;
        }

        // 已经加载的资源个数
        private getGroupItemsLoaded(): number {
            if (!this.$doProgressFlag) {
                console.warn("不需要加载进度时，不该调用此函数");
                return 0;
            }
            let count = 0;
            for (let groupName in this.groupDic) {
                count += this.groupDic[groupName];
            }
            return count;
        }

        private onGroupComplete(event: RES.ResourceEvent) {
            if (!this.findGroup(event.groupName)) return;
            this.groupLoading--;
            if (this.groupLoading <= 0) {
                this.$removeListener();
            }
            this.handleGroupRepeats(event);
            this.groupDic[event.groupName] = RES.getGroupByName(event.groupName).length;
            this.doResProgress();
            this.doResComplete();
        }

        private onGroupProgress(event: RES.ResourceEvent) {
            if (!this.$doProgressFlag) return;
            if (!this.findGroup(event.groupName)) return;
            this.groupDic[event.groupName] = event.itemsLoaded;
            this.doResProgress();
        }

        private onGroupError(event: RES.ResourceEvent) {
            if (!this.findGroup(event.groupName)) return;
            this.onGroupComplete(event);
            console.warn(`group{${event.groupName}} load failure`);
        }

        private onItemError(event: RES.ResourceEvent) {
            if (!this.findGroup(event.groupName)) return;
            let resourceItem = event.resItem;
            console.warn(`item load failure. INFO: group{${event.groupName}} + url{${resourceItem.url}} + name{${resourceItem.name}}`);
        }

        private doResComplete() {
            if (this.asyncItemsLoaded === this.asyncItemsTotal && this.groupLoading <= 0) {
                this.$onResComplete();
            }
        }

        private doResProgress() {
            if (!this.$doProgressFlag) return;
            let total = this.asyncItemsTotal + this.groupItemsTotal;
            let loaded = this.getGroupItemsLoaded() + this.asyncItemsLoaded;
            this.$onResProgress(loaded, total);
        }

        // @implements
        public complete(c: Function, thisObject: any): IRESLoader {
            this.$onResComplete = c.bind(thisObject);
            return this;
        }

        // @implements
        public progress(c: Function, thisObject: any): IRESLoader {
            this.$doProgressFlag = true;
            this.$onResProgress = c.bind(thisObject);
            return this;
        }

        private $onResComplete() { }

        private $doProgressFlag: boolean = false;

        private $onResProgress(itemsLoaded: number, itemsTotal: number) { }

        /**
         * 处理资源组中重复
         */
        public handleGroupRepeats(event: RES.ResourceEvent) {
            let instance = RES['configInstance'];
            let keyMap = instance.keyMap;
            let groupDic = instance.groupDic;
            let groupName = event.groupName;
            let groups: KeyItem[] = groupDic[groupName] || [];
            groups.forEach((groupItem) => HandleItemRepeats(groupItem.name));
        }
    }

    /**
     * 资源组定义
     */
    interface KeyItem {
        name: string;
        type: string;
        url: string;
        loaded: boolean;
        other: string;      // 另一个已经加载的相同的资源名字
    }
}