module.exports = {
    /** 
     * 图片资源存放目录 
     */
    assetsPath: '../resource/assets',
    /**
     * 输出的资源配置文件
     */
    default_res_file: '../resource/default.res.json',
    /**
     * 图集发布的单张图片的输出位置
     */
    out_assets0: '../resource/pack/assets0',
    /**
     * 图集发布的图集的输出位置
     */
    out_packs0: '../resource/pack/packs0',
    /**
     * 图集发布使用的临时目录
     */
    tmp: './temp',
    /**
     * 不进行打包成图集的分组(但是仍保留GROUP)
     */
    notGroupDir: ['jpg', 'music', 'dragon', 'font'],
    /**
     * 不进行管理与编码的文件(常见与html中)
     * 该目录中的所有不会加入到资源配置文件中，不会被管理和拷贝
     */
    notCodeDir: ['html', 'test', 'share'],
    /**
     * 图集中单个图片的最大宽度(px)
     */
    maxWidth: 512,
    /**
     * 图集中单个图片的最大高度(px)
     */
    maxHeight: 512,
    /**
     * 图集大小限制(KB)
     */
    maxSize: 300,
    /**
     * 是否输出超过图集宽高限制的图片路径
     */
    printLimit: true,
    /**
     * 删除资源时,在控制台打印
     */
    printDelete: true,
    /**
     * 添加资源时,在控制台打印
     */
    printAdd: false,
    /**
     * 打印所有重复文件列表
     */
    printRepeat: false
};