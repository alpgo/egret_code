declare namespace UTEST {
    function parseConfig(obj: Object): void;
    function printMsgLoc(error, ...args): void;
    function setDebugMethod(accessKey: string, target: Object, cond?: Function, methodKey?: string): Function;
    function runDebugMethod(accessKey: string, condition: Function): void;
}