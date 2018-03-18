/**
 * Created by shing on 2016/6/6.
 */
new KyeeModule()
    .group("kyee.quyiyuan.filters.impl.firstpage")
    .type("service")
    .name("StartFirstPage")
    .params(["$state","CacheServiceBus"])
    .action(function($state,CacheServiceBus){

        var def = {

            params : null,

            isUnFinash : false,

            token : null,

            /**
             * 获取简短描述
             *
             * @returns {string}
             */
            getShortname : function(){

                return "首页面";
            },

            /**
             * 获取测试
             *
             * @returns {boolean}
             */
            test : function(){
                var urlInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(urlInfo && urlInfo.hospitalID&&!urlInfo.businessType){
                   return false;
                }else{
                   return true;
                }
            },

            /**
             * 执行过滤器
             *
             * @param params
             */
            run : function(params){

                var me = this;

                me.params = params;
                me.isUnFinash = true;

                me.doFilter();
            },

            /**
             * 执行过滤器
             *
             * @param params
             * @returns {boolean}
             */
            doFilter : function(){

                $state.go("home->MAIN_TAB");
            },

            /**
             * 执行完成，如果需要
             */
            doFinashIfNeed : function(params){

                var me = this;

                if(me.isUnFinash && me.test()){

                    if(params != undefined){

                        if(params.onBefore != undefined){
                            params.onBefore();
                        }
                    }

                    me.token = me.params.token;
                    me.isUnFinash = false;
                    me.params.onFinash();
                }
            }
        };

        return def;

    })
    .build();