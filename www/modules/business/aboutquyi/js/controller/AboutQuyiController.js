/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/30
 * 时间: 13:12
 * 创建原因：关于趣医页面的controller
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.aboutquyi.controller")
    .require([
        "kyee.framework.service.versioncheck",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.framework.service.share",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.phone",
        "kyee.quyiyuan.aboutquyi.help.controller",
        "kyee.quyiyuan.aboutquyi.feedback.controller",
        "kyee.quyiyuan.aboutquyi.weburl.controller",
        "kyee.quyiyuan.aboutquyi.service",
        "kyee.quyiyuan.aboutquyi.otherweburl.controller",
        "kyee.quyiyuan.aboutquyi.riskweburl.controller"
    ])
    .type("controller")
    .name("AboutQuyiController")
    .params(["$scope","$state", "$timeout","$window",
        "KyeeVersionCheckService","KyeeMessageService",
        "KyeeViewService", "LoginService",
        "KyeeShareService", "HttpServiceBus",
        "KyeeDeviceInfoService", "CacheServiceBus",
        "KyeePhoneService", "AboutQuyiService", "KyeeEnv", "KyeeI18nService", "$ionicHistory", "KyeeListenerRegister"])
    .action(function($scope,$state,$timeout,$window,
                     KyeeVersionCheckService, KyeeMessageService,
                     KyeeViewService, LoginService,
                     KyeeShareService, HttpServiceBus,
                     KyeeDeviceInfoService, CacheServiceBus,
                     KyeePhoneService,AboutQuyiService,KyeeEnv, KyeeI18nService, $ionicHistory, KyeeListenerRegister){

        $scope.version = KyeeI18nService.get("aboutquyi.curVersion","当前版本号{{version}}",{version: AppConfig.VERSION});

        //初始进入页面时，不显示新版本标示
        $scope.newFlagClass = ["new_flag_hide"];

        //是否显示分享界面，初次进入关于趣医界面时，不显示
        $scope.share_container_class = ["share_container_hide"];

        //是否显示分享界面，初次进入关于趣医界面时，半透明背景不显示
        $scope.share_background_class = ["share_background_hide"];

        //默认认为是Android 平台的分享
        $scope.platform = "Android";

        // 若为ios平台不限时检查更新和医院网址栏
        $scope.notIOS = true;
        if (KyeeEnv.PLATFORM == "ios") {
            $scope.notIOS = false;
        }

        $scope.officalUrl = "http://www.quyiyuan.com/";

        //是否有新外壳可更新 0-没有 1-有 默认为0
        $scope.versionState = 0;

        //调用检查新版本的服务，如果有新版本，显示新版本标示
        if($scope.notIOS) {
            $timeout(function(){

                KyeeVersionCheckService.getShellVersionState(
                    function(state) {
                        alert(4);
                        $scope.versionState = state;
                        if (state == 1) {
                            $scope.newFlagClass = ["new_flag_show"];
                            setTimeout(function () {
                                $scope.$apply();
                            }, 1);
                        }
                    },
                    function(state) {

                    }
                );
            }, 100);
        }

        // 短信平台短信号
        $scope.sms = "";
        AboutQuyiService.getSms(function(retVal) {
            if (retVal.data) {
                $scope.sms = retVal.data;
            }
        });

        //检查新版本
        $scope.checkNewVersion = function() {

            if (window.device == undefined || window.device == null) {

                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("aboutquyi.newVersionTips","已是最新版本！")
                });
            } else {
                if($scope.versionState == 0) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("aboutquyi.newVersionTips","已是最新版本！")
                    });
                } else {
                    KyeeVersionCheckService.checkVersionOnly();
                }
            }
        };

        // 分享参数，参数顺序：url, title, description
        $scope.shareData = [];
        $scope.shareData.push( "http://web.quyiyuan.com/weixindownload/mobiledownload.html");
        $scope.shareData.push("趣医院—移动互联时代的就医方式");
        $scope.shareData.push("就医全流程，趣医全搞定。");
        $scope.hasShareMenu = false; // 分享区域是否显示在页面上

        // 分享面板方法绑定
        $scope.bind = function(params){
            $scope.showShareMenu = params.show;
            $scope.hideShareMenu = params.hide;
        };

        $scope.goBack = function() {
            $ionicHistory.goBack();
        };

        KyeeListenerRegister.regist({
            focus: "aboutquyi",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function(params){
                params.stopAction();
                if($scope.hasShareMenu){
                    $scope.hideShareMenu();
                } else {
                    $scope.goBack();
                }
            }
        });

        $scope.click2call = function() {
            KyeePhoneService.callOnly("4000801010");
        };

        $scope.click2openNet = function() {
            AboutQuyiService.webUrl = "http://www.quyiyuan.com/";
            AboutQuyiService.name = KyeeI18nService.get("aboutquyi.appName","趣医院");
            $state.go("other_web_url");
        };

        $scope.onQRCodeHold = function(){
            //仅在网页版有效
            if (window.device == undefined || window.device == null){
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get("commonText.warmTipMsg","温馨提示"),
                    content: KyeeI18nService.get("commonText.selectCardMsg","是否识别二维码"),
                    okText: KyeeI18nService.get("commonText.selectOk","确定"),
                    cancelText: KyeeI18nService.get("commonText.selectCancel","取消"),
                    onSelect: function (res) {
                        if (res) {
                            window.location.href="https://app.quyiyuan.com/APP/mobileweb/mobiledownload.html";
                        }
                    }
                });

            }

        };
    })
    .build();