/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年6月4日10:51:50
 * 创建原因：选择就诊者拦截器
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.filters.impl.selectCustomPatient")
    .type("service")
    .name("SelectCustomPatientDef")
    .params(["CacheServiceBus", "KyeeMessageService", "$state", "KyeeViewService", "KyeeI18nService","AccountAuthenticationService","$location"])
    .action(function(CacheServiceBus, KyeeMessageService, $state, KyeeViewService, KyeeI18nService,AccountAuthenticationService,$location){

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

                return KyeeI18nService.get("commonText.selectPatientTips","选择常用就诊者");
            },

            /**
             * 获取测试
             *
             * @returns {boolean}
             */
            test : function(){

                //我家亳州健康档案
                var urlInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                var noLoginAndPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.NO_LOGIN_AND_PATIENT);
                if(urlInfo && urlInfo.state == "my_health_archive"){
                    return true;
                }
                if(noLoginAndPatient == 1){
                    return true;
                }
                //提供选择就诊者过滤器（公共）  By  张家豪  KYEEAPPC-4459
                var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
                if(currentCustomPatient && currentCustomPatient.USER_VS_ID){
                    return true;
                }else{
                    return false;
                }
            },

            /**
             * 执行过滤器
             *
             * @param params
             */
            run : function(params){

                var me = this;

                if(me.locationUrl()&& $location.$$absUrl.split('#').pop().substring(1) == "regist"){
                    AccountAuthenticationService.ifFromRegist = "1";
                    $state.go("account_authentication");
                }else{
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get("commonText.warmTipMsg","温馨提示"),
                        content: KyeeI18nService.get("commonText.selectPatientMsg","该项业务需要您先添加就诊者信息"),
                        okText: KyeeI18nService.get("commonText.selectOk","前往添加"),
                        cancelText: KyeeI18nService.get("commonText.selectCancel","以后再说"),
                        onSelect: function (res) {
                            if (res) {
                                me.params = params;
                                me.isUnFinash = true;
                                me.isFromFiler = true;
                                me.doFilter();
                            }else if(!res
                                && me.locationUrl()
                                && $location.$$absUrl.split('#').pop().substring(1) == "regist"){
                                AccountAuthenticationService.ifFromRegist = "1";
                                $state.go("account_authentication");
                            }else if(!res
                                && me.locationUrl()
                                && $location.$$absUrl.split('#').pop().substring(1) == "login"){
                                $state.go("home->MAIN_TAB");
                            }else if(!res
                                && me.locationUrl()
                                && $location.$$absUrl.split('#').pop().substring(1) == "hospital_selector"){
                                $state.go("center->MAIN_TAB");
                            }
                        }
                    });
                }
            },

            /**
             * zhangjiahao
             * KYEEAPPTEST-3450
             * 没有就诊者进行和就诊者相关的业务提示处理不正确
             * @returns {boolean}
             */
            locationUrl: function () {
                if ($location.$$absUrl
                    && $location.$$absUrl.split('#')
                    && $location.$$absUrl.split('#').pop()
                    && $location.$$absUrl.split('#').pop().length > 0) {
                    return true;
                } else {
                    return false;
                }
            },
            /**
             * 执行过滤器
             *
             * @param params
             * @returns {boolean}
             */
            doFilter : function(){
                $state.go("custom_patient");
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