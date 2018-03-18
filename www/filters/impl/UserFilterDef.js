new KyeeModule()
    .group("kyee.quyiyuan.filters.impl.user")
    .type("service")
    .name("UserFilterDef")
    .params(["CacheServiceBus", "KyeeMessageService", "$state", "KyeeViewService", "LoginService", "KyeeI18nService","CenterUtilService"])
    .action(function(CacheServiceBus, KyeeMessageService, $state, KyeeViewService, LoginService, KyeeI18nService,CenterUtilService){

        var def = {

            params : null,

            isUnFinash : false,

            /**
             * 获取简短描述
             *
             * @returns {string}
             */
            getShortname : function(){

                return KyeeI18nService.get("commonText.loginTips","登录");
            },

            /**
             * 获取测试
             *
             * @returns {boolean}
             */
            test : function(){
                var loginFalg=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN) == true;
                //我家亳州健康档案
                var urlInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                var noLoginAndPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.NO_LOGIN_AND_PATIENT);
                if(urlInfo && urlInfo.state == "my_health_archive"){
                    return true;
                }

                if(noLoginAndPatient == 1){
                    return true;
                }

                //用户来源是3跳转到我家亳州登
                var ysbzWxPst=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.YSBZ_WX_FLAG);  //是否是养生亳州微信公众号链接
                if(!loginFalg && AppConfig.BRANCH_VERSION=="03"&&ysbzWxPst!='1'){
                    window.location.href="javascript:window.myObject.login()";
                }
                return loginFalg;
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
                LoginService.isFromFiler = true;//标志登录页面是由过滤器引导出来
                //静默登录
                if(def.isLoginSilence()){
                    if(LoginService.autoLoginFlag!=1){
                        LoginService.UserFilterDef = def;
                        LoginService.autoLoginFlag = 2;
                        LoginService.isDefaultLogin= true;//静默登录标识
                        LoginService.autoLoad();
                    }
                }else{
                    var ysbzWxPst=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.YSBZ_WX_FLAG);  //是否是养生亳州微信公众号链接
                    if(AppConfig.BRANCH_VERSION!="03"||ysbzWxPst=='1'){
                        $state.go("login");
                    }
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
            },

            /*
             微信菜单跳转判断是否执行静默登录（若StorageCache有用户信息，不需要跳转到登录页面，直接调自动登录方法）
             */
            isLoginSilence : function () {
                var urlInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if (urlInfo && urlInfo.wx_forward && urlInfo.wx_forward.length > 0) {//微信链接 直接调登陆请求
                    var loginType = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TYPE); //获取登录类型
                    var user = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.USER);
                    var isAutoRe='1';
                    if (loginType == '1') {                                                         // 验证码自动登录
                        var security_code = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE);
                        if (!CenterUtilService.isDataBlank(user) && !CenterUtilService.isDataBlank(security_code)) {
                            isAutoRe='0';
                        }
                    } else {
                        var padInit = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.PWD);
                        if (!CenterUtilService.isDataBlank(user) && !CenterUtilService.isDataBlank(padInit)) {
                            isAutoRe='0';
                        }
                    }
                    console.log("dewferger"+isAutoRe);
                    ////微信公众号过来的需要自动注册
                    if('1'==isAutoRe){
                        var openId=urlInfo.openid;
                        var isNeedAutoRegister =urlInfo.isNeedAutoRegister;
                        if(openId&&'1'==isNeedAutoRegister){
                            return true;
                        }
                    }else{
                        return true;
                    }
                }
                return false;
            }
        };

        return def;
    })
    .build();