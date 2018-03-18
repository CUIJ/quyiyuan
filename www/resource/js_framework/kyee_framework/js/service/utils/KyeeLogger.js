var KyeeLogger = {

    //日志级别，默认为 DEBUG
    level : 0,

    //日志级别映射
    levelMapping : {
        DEBUG : 0,
        INFO : 1,
        WARN : 2,
        ERROR : 3
    },

    /**
     * 设置日志级别
     *
     * @param level
     */
    setLevel : function(level){

        this.level = this.levelMapping[level];
    },

    /**
     * 调试级别输出
     *
     * @param content
     */
    debug : function(content){

        if(AppConfig.MODE == "DEV" && this.levelMapping.DEBUG >= this.level) {
            console.debug(content);
        }
    },

    /**
     * 消息级别输出
     *
     * @param content
     */
    info : function(content){

        if(AppConfig.MODE == "DEV" && this.levelMapping.INFO >= this.level) {
            console.info(content);
        }
    },

    /**
     * 警告级别输出
     *
     * @param content
     */
    warn : function(content){

        if(AppConfig.MODE == "DEV" && this.levelMapping.WARN >= this.level) {
            console.warn(content);
        }
    },

    /**
     * 错误级别输出
     *
     * @param content
     */
    error : function(content){

        if(AppConfig.MODE == "DEV" && this.levelMapping.ERROR >= this.level){
            console.error(content);
        }
    }
};