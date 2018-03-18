new KyeeModule()
    .group("kyee.framework.base.support.listener")
    .type("service")
    .name("KyeeListenerRegister")
    .action(function(){

        var def = {

            registryTable : {},

            onceRegistryTable : {},

            /**
             * 注册新事件
             *
             * @param cfg
             */
            regist : function(cfg){

                var me = this;

                var key = cfg.focus + "!" + cfg.when

                me.registryTable[key] = cfg;
            },

            /**
             * 一次性事件
             *
             * @param cfg
             */
            once : function(cfg){

                var me = this;

                me.onceRegistryTable[cfg.when] = cfg;
            },

            /**
             * 下载一次性事件
             *
             * @param when
             */
            uninstallOnce : function(when){

                var me = this;

                me.onceRegistryTable[when] = undefined;
            },

            /**
             * 查询指定路由的指定事件
             *
             * @param focus
             * @param when
             * @returns {*}
             */
            queryHandler : function(focus, when){

                var me = this;

                var key = focus + "!" + when

                return me.registryTable[key] == undefined ? null : me.registryTable[key];
            },

            /**
             * 查询一次性事件处理器
             *
             * @param when
             */
            queryOnceHandler : function(when){

                var me = this;

                return me.onceRegistryTable[when] == undefined ? null : me.onceRegistryTable[when];
            }
        };

        return def;
    })
    .build();