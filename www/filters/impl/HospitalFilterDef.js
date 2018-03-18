new KyeeModule()
    .group("kyee.quyiyuan.filters.impl.hospital")
    .type("service")
    .name("HospitalFilterDef")
    .params(["CacheServiceBus", "KyeeMessageService", "$state", "KyeeViewService", "HospitalSelectorService", "KyeeI18nService"])
    .action(function(CacheServiceBus, KyeeMessageService, $state, KyeeViewService, HospitalSelectorService, KyeeI18nService){

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

                return KyeeI18nService.get("commonText.selectHospitalTips","选择医院");
            },

            /**
             * 获取测试
             *
             * @returns {boolean}
             */
            test : function(){
                // 从微信菜单直接进入科室列表并禁止选择医院时不执行过滤器
                var urlInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(urlInfo && urlInfo.hospitalID && urlInfo.wx_forward == "appointment"){
                    return true;
                }

                var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                return hospitalInfo != null && hospitalInfo.id != "";
            },

            /**
             * 执行过滤器
             *
             * @param params
             */
            run : function(params){

                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("commonText.selectHospitalMsg","请选择前往的医院")
                });

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

                var me = this;

                //标志医院选择页面是由过滤器引导出来
                HospitalSelectorService.isFromFiler = true;

                HospitalSelectorService.setReturnView($state.current.name);
                $state.go("hospital_selector");
            },

            /**
             * 执行完成，如果需要
             */
            doFinashIfNeed : function(params){

                HospitalSelectorService.isFromFiler = false;
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