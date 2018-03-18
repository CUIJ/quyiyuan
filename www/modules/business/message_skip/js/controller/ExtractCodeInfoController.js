/**
 * 产品名称：quyiyuan
 * 创建者：杨旭平
 * 创建时间： 2017/1/5
 * 创建原因：短信跳转提取码页面
 */

new KyeeModule()
    .group("kyee.quyiyuan.messageSkip.extractCodeInfocontroller")
    .require([
        "kyee.quyiyuan.messageSkip.ExtractCodeInfo.service",
        "kyee.quyiyuan.messageSkip.service"
    ])
    .type("controller")
    .name("ExtractCodeInfoController")
    .params(["$ionicScrollDelegate","$scope", "$state","$rootScope","KyeeListenerRegister","KyeeI18nService","KyeeMessageService",
        "ExtractCodeInfoService","CacheServiceBus","CenterUtilService","MessageSkipService","LoginService"])
    .action(function ($ionicScrollDelegate,$scope, $state,$rootScope,KyeeListenerRegister,KyeeI18nService,KyeeMessageService,
                      ExtractCodeInfoService,CacheServiceBus,CenterUtilService,MessageSkipService,LoginService) {
        //动态设置屏幕样式
        //$("#content_bottom_div").css("height", ($(window).height()-$("#content_top_div").height()) + "px");
        //$(".label_div_1").css("margin-top", ($(window).height()-$("#content_top_div").height()-34-60) + "px");

        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "extract_code_info",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                //初始化页面元素
                pageInit();
            }
        });
        /**
         * 页面元素初始化
         */
        var pageInit = function () {
            $scope.objParams = {"activationCode":""};   //页面参数初始化
        };
        //监听取消事件，跳转到主页
        $scope.cancle = function(){
            $state.go("home->MAIN_TAB");
        };
        $scope.showKeyBoard =  function(){
            $scope.top="1";
        };
        $scope.hideKeyBoard =  function(){
            $scope.top="0";
        };
        //监听确定事件
        $scope.confirm = function(){
            var activation = $scope.objParams.activationCode;
            //正则验证提取码为4位纯数字
            var reg = /^\d{4}$/;
            if(!reg.test(activation)){
                KyeeMessageService.broadcast({
                    content : KyeeI18nService.get("message_skip.inputErrorHint", "请输入4位数字格式的提取码")
                });
            }else{
                var cache = CacheServiceBus.getMemoryCache();
                var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                objParams.activationCode = activation;
                objParams.token = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK);
                ExtractCodeInfoService.checkActivationCodeAndActivate(true,objParams,function(resultData){
                    if(null != resultData){
                        if(resultData.success){
                            //用户信息不为空时自动登录
                            if(!CenterUtilService.isDataBlank(resultData.userData)){
                                LoginService.messageAutoLogin(resultData, objParams.skipRoute, objParams.hospitalId);
                            }else{
                                $state.go("home->MAIN_TAB");
                            }
                        }else{
                            KyeeMessageService.broadcast({
                                content : resultData.message
                            });
                        }
                    }else{
                        $state.go("home->MAIN_TAB");
                    }
                });
            }
        }
    })
    .build();
