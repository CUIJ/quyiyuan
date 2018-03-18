/**
 * Created by zxy on 15-6-9.
 */
new KyeeModule()
    .group("kyee.quyiyuan.filters.impl.BozhouCustomized")
    .type("service")
    .name("BozhouCustomized")
    .params(["CacheServiceBus", "KyeeMessageService", "$state", "KyeeViewService", "LoginService", "KyeeI18nService"])
    .action(function(CacheServiceBus, KyeeMessageService, $state, KyeeViewService, LoginService, KyeeI18nService){

        var def = {

            params : null,

            isUnFinash : false,

            /**
             * 获取简短描述
             *
             * @returns {string}
             */
            getShortname : function(){

                return KyeeI18nService.get("commonText.selectHospitalTips","在我家亳州完善个人信息");
            },

            /**
             * 获取测试
             *
             * @returns {boolean}
             */
            test : function(){

                var cache = CacheServiceBus.getMemoryCache();

                var userSource=cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);//用户来源

                var user_code = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);//用户缓存

                var login = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN);

                //是否身份证的缓存为空的赋值判断
                if(user_code){
                    if(user_code.ID_NO){
                        var isRecord = true; //isRecord是一个是否存入数值的标志
                    }else{
                        var isRecord = false;//isRecord是一个是否存入数值的标志
                    }
                }else{
                    var isRecord = false;//isRecord是一个是否存入数值的标志
                }

                return !(userSource == 3 && !login) && !(userSource == 3 && !isRecord);
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
             * 执行过滤器(亳州定制登陆检测)
             *
             * @param params
             * @returns {boolean}
             */
            doFilter : function(){
                var me = this;

                LoginService.isFromFiler = true;//标志登录页面是由过滤器引导出来

                if(navigator.app){

                navigator.app.exitApp();//直接退出趣医院

                }


            },

            /**
             * 执行完成，如果需要
             */
            doFinashIfNeed : function(params){

                var me = this;

                if(me.isUnFinash && me.test()){

                    if(params != undefined){

                        if(params.onBefore != undefined){

                            var isContinue = true;
                            params.onBefore({
                                stopAction : function(){
                                    isContinue = false;
                                }
                            });

                            if(!isContinue){
                                me.token = me.params.token;
                                me.isUnFinash = false;
                                return;
                            }
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