/**
 *产品名称：quyiyuan
 *创建者：姚斌
 *创建时间：2015/11/4
 *创建原因：设置多语言服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.changeLanguage.service")
    .type("service")
    .name("ChangeLanguageService")
    .params(["KyeeI18nService", "$rootScope", "HttpServiceBus","$state","HospitalService","KyeeUtilsService"])
    .action(function(KyeeI18nService, $rootScope, HttpServiceBus,$state,HospitalService,KyeeUtilsService){

        var def = {

            /**
             * 更新全局待翻译数据
             */
            updateRootScopeLangText : function(){
                $rootScope.lang = {};

                KyeeUtilsService.conditionInterval({
                    time : 100,
                    conditionFunc : KyeeI18nService.getCurrLangName,
                    doFunc : function () {
                        $rootScope.lang.homeText = KyeeI18nService.get("commonText.homeText", "就医");
                        $rootScope.lang.serviceText = KyeeI18nService.get("commonText.serviceText", "服务");
                        $rootScope.lang.recordText = KyeeI18nService.get("commonText.recordText", "病史");
                        $rootScope.lang.walletText = KyeeI18nService.get("commonText.walletText", "我的");
                        $rootScope.lang.centerText = KyeeI18nService.get("commonText.centerText", "个人中心");
                        $rootScope.lang.messageText = KyeeI18nService.get("commonText.msgTitle", "消息");
                        $rootScope.lang.pullingText = KyeeI18nService.get("commonText.pullingText", "释放即可刷新");
                        $rootScope.lang.refreshingText = KyeeI18nService.get("commonText.refreshingText", "努力加载中...");

                        if('home->MAIN_TAB'===$state.current.name){
                            HospitalService.updateSudokuData();
                        }
                    }
                });
            },

            /**
             * 获取多语言功能是否开放的开关
             * @param onSuccess
             */
            queryLanguageSwitch: function (onSuccess) {
                HttpServiceBus.connect({
                    url: "/config/action/ParamsystemActionC.jspx",
                    showLoading: false,
                    params: {
                        op: "querySysParams",
                        PARA_CODE: "I18N_SWITCH_F"
                    },
                    cache : {
                        by : "ONCE"
                    },
                    onSuccess: function (retVal) {
                        if (retVal.success && retVal.data) {
                            var flag = retVal.data.I18N_SWITCH_F;
                            onSuccess(flag);
                        }
                    }
                });
            },

            /**
             * 检查多语言功能是否开发，不开放则切换到默认语言
             */
            checkLanguageSwitch : function () {
                var me = this;
                me.queryLanguageSwitch(function (result) {
                    var currentLangType = KyeeI18nService.getCurrLangName();
                    var defaultLLangType = "zh_CN";
                    if(result == 0 && currentLangType != defaultLLangType){
                        KyeeI18nService.use(defaultLLangType, $rootScope);
                        var timer = KyeeUtilsService.delay({
                            time: 1000,
                            action: function(){
                                me.updateRootScopeLangText();
                                KyeeUtilsService.cancelDelay(timer);
                            }
                        });
                        /*setTimeout(function(){
                            me.updateRootScopeLangText();
                        }, 1000);*/
                    }
                });
            }

        };
        return def;
    })
    .build();
