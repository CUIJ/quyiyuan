/**
 * 产品名称：quyiyuan
 * 创建者：杨旭平
 * 创建时间： 2017/1/5
 * 创建原因：短信跳转提取码页面
 */

new KyeeModule()
    .group("kyee.quyiyuan.messageSkip.extractAllInfoController")
    .require([
        "kyee.quyiyuan.messageSkip.ExtractAllInfo.service",
        "kyee.quyiyuan.messageSkip.service"
    ])
    .type("controller")
    .name("ExtractAllInfoController")
    .params(["$scope", "$state","$ionicScrollDelegate","KyeeListenerRegister","KyeeI18nService","KyeeMessageService",
            "CenterUtilService","ExtractAllInfoService","MessageSkipService","CacheServiceBus","LoginService"])
    .action(function ($scope, $state, $ionicScrollDelegate,KyeeListenerRegister,KyeeI18nService,KyeeMessageService,
                      CenterUtilService,ExtractAllInfoService,MessageSkipService,CacheServiceBus,LoginService) {

        //动态设置屏幕样式
        var visibleHeight = 540 + 60 + 100;
        var sumHeight = $(window).height();
        $scope.isScroll = null;
        if(visibleHeight < sumHeight){
            $(".qy_message_skip_extract").hide();
            setTimeout(function(){
                $(".content_bottom_div").css("margin-top", ($(window).height()-540-34-60 - 14));
                $(".qy_message_skip_extract").show();
            },100);
            $scope.isScroll = false;
        }else {
            $(".qy_message_skip_extract").hide();
            setTimeout(function(){
                $(".content_bottom_div").css("margin-top", 100 - 34);
                $(".qy_message_skip_extract").show();
            },100);
            $scope.isScroll = true;
        }
        //上拉操作
        $scope.onDragUp = function () {
            var visibleHeight = 540 + 60 + 100;
            var sumHeight = $(window).height();
            $scope.isScroll = null;
            if(visibleHeight < sumHeight){
                $ionicScrollDelegate.$getByHandle('myScroll').scrollTo(0,0,true);
            }else{
                var reHeight = $(".content_top_div").height() + $(".content_bottom_div").height() + 60 + 66 +14 - $(window).height();
                $ionicScrollDelegate.$getByHandle('myScroll').resize();
                $ionicScrollDelegate.$getByHandle('myScroll').scrollTo(0,reHeight,true);
            }
        };
        $scope.showKeyBoard =  function(){
            $scope.top="1";
        };
        $scope.hideKeyBoard =  function(){
            $scope.top="0";
        };
        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "extract_all_info",
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
            $scope.hintUserName = KyeeI18nService.get("message_skip.hintPhone", "请输入姓名");
            $scope.hintIdNum = KyeeI18nService.get("message_skip.hintPass", "请输入身份证号");
            $scope.objParams = {"activationCode":"","userName":"","idNum":""};   //页面参数初始化
        };


        //监听取消事件，跳转到主页
        $scope.cancle = function(){
            $state.go("home->MAIN_TAB");
        }

        //监听确定事件
        $scope.confirm = function(){
            var activation = $scope.objParams.activationCode;
            var userName = $scope.objParams.userName;
            var idNum = $scope.objParams.idNum;
            //正则验证提取码为4位纯数字
            var reg = /^\d{4}$/;
            if(!reg.test(activation)){
                KyeeMessageService.broadcast({
                    content : KyeeI18nService.get("message_skip.inputErrorHint", "请输入4位数字格式的提取码")
                });
                return false;
            }else{
                var cache = CacheServiceBus.getMemoryCache();
                var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                objParams.activationCode = activation;
                objParams.token = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK);
                objParams.userName = userName;
                objParams.idNum = idNum;
                ExtractAllInfoService.checkActivationCodeAndRegistPatient(true,objParams,function(resultData){
                    if(null != resultData){
                        if(resultData.success){
                            //增加会诊标识
                            LoginService.MDT_AND_RPP=resultData.MDT_AND_RPP;
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
