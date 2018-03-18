new KyeeModule()
    .group("kyee.quyiyuan.filters.impl.userInformation")
    .type("service")
    .name("UserInfFilterDef")
    .params(["CacheServiceBus", "KyeeMessageService", "$state", "KyeeViewService", "AccountAuthenticationService", "KyeeI18nService"])
    .action(function(CacheServiceBus, KyeeMessageService, $state, KyeeViewService, AccountAuthenticationService, KyeeI18nService){

        var def = {

            params : null,

            isUnFinash : false,

            /**
             * 获取简短描述
             *
             * @returns {string}
             */
            getShortname : function(){

                return KyeeI18nService.get("commonText.loginTips","账号实名信息完善");
            },

            /**
             * 获取测试
             *
             * @returns {boolean}
             */
            test : function(){
                var userRecord = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                if(userRecord==null||userRecord==undefined){
                    return true;
                }
                else{
                    return userRecord != null && userRecord.ID_NO != null && userRecord.ID_NO != "" &&
                        userRecord.NAME != null && userRecord.NAME != "";
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
             * 执行过滤器(登录)
             *
             * @param params
             * @returns {boolean}
             */
            doFilter : function(){
                var me = this;

                AccountAuthenticationService.isFromFiler = true;//标志登录页面是由过滤器引导出来

//                KyeeViewService.openModalFromUrl({
//                    id : "",
//                    url : "modules/business/login/index.html",
//                    scope : LoginService.tabsControllerScope
//                });
                AccountAuthenticationService.ifFromRegist = "1";
                $state.go("account_authentication");
                //KyeeMessageService.broadcast({
                //    content : "请在这里登录",
                //    delay : 1000
                //});
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