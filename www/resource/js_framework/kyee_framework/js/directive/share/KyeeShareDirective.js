/**
 *  创建者：licong
 *  创建时间：2017/1/24
 *  文件描述：分享网页链接到第三方公众平台
 *           分享平台有微信好友，朋友圈，微博，qq空间
 *           kyeeShareDirective指令的实现基于cordova插件com.kingyee.kymh.share
 */
angular
    .module("kyee.framework.directive.share", [])
    .directive("kyeeShareDirective", ["KyeeFrameworkConfig", "KyeeDeviceInfoService", "KyeeShareService", "KyeeMessageService", "KyeeI18nService", "AboutQuyiService", function(KyeeFrameworkConfig, KyeeDeviceInfoService, KyeeShareService, KyeeMessageService, KyeeI18nService, AboutQuyiService){
        var def = {
            scope: {
                shareParams: "=",  // 分享的链接，标题，描述，图片
                hasShareMenu: "=",
                saveShareChannel: "&", // 保存分享渠道和数据
                bind: "&"
            },
            templateUrl:  KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/share/templates/share.html",
            replace: true,
            restrict: "A",
            controller: ["$scope", function($scope){

                //生成唯一标示符
                $scope.id = (new Date().getTime()).toString();

                if($scope.shareParams && $scope.shareParams.length >= 3){
                    $scope.shareData = {
                        infoUrl: $scope.shareParams[0],
                        infoTitle: $scope.shareParams[1],
                        infoDescription: $scope.shareParams[2],
                        platform: "Android" //默认认为是Android平台的分享
                    };

                    if($scope.shareParams.length == 3){
                        $scope.shareParams[4] = ""; // 分享的图片，默认为趣医icon
                    }
                }

                if($scope.hasShareMenu == undefined){
                    $scope.hasShareMenu = false;
                }

                $scope.show = function(){
                    $scope.hasShareMenu = true;
                    //显示半透明背景
                    var shareDiv = angular.element(document.getElementById($scope.id +"_shareDiv"));
                    var backdrop = angular.element(document.getElementById($scope.id+"_backdrop"));

                    shareDiv.removeClass("share_container_hide");
                    backdrop.removeClass("share_background_hide");
                    shareDiv.addClass("share_container_in");
                    backdrop.addClass("share_background_in");

                    KyeeDeviceInfoService.getInfo(function(info){
                        $scope.shareData.platform = info.platform;
                    },function(){});
                };

                $scope.hide = function() {
                    $scope.hasShareMenu = false;
                    //隐藏半透明背景
                    setTimeout(function() {
                        var shareDiv = angular.element(document.getElementById($scope.id +"_shareDiv"));
                        var backdrop = angular.element(document.getElementById($scope.id+"_backdrop"));

                        shareDiv.removeClass("share_container_in");
                        backdrop.removeClass("share_background_in");
                        shareDiv.addClass("share_container_hide");
                        backdrop.addClass("share_background_hide");
                    }, 500);
                };

                /*
                 *  status: SUCCESS, FAIL, CANCEL, AUTH_DENIED
                 *  sharePlatform: QQZone, wxhy, wxpyq, weibo
                 * */
                var showMessage = function(status, sharePlatform){
                    var content;
                    if(status == "SUCCESS"){
                        if(sharePlatform == "QQZone"){
                            content = KyeeI18nService.get("commonText.shareQQZone","成功分享到QQ空间，感谢您对趣医院的关注！");
                        } else if(sharePlatform == "wxhy"){
                            content = KyeeI18nService.get("commonText.wxfriendTips", "成功分享给微信好友，感谢您对趣医院的关注！");
                        } else if(sharePlatform == "wxpyq"){
                            content = KyeeI18nService.get("commonText.friendTips", "成功分享到朋友圈，感谢您对趣医院的关注！");
                        } else if(sharePlatform == "weibo"){
                            content = KyeeI18nService.get("commonText.weiboTips","成功分享到微博，感谢您对趣医院的关注！");
                        }
                    } else if(status == "FAIL"){
                        content = KyeeI18nService.get("commonText.shareFail", "分享失败！");
                    } else if(status == "CANCEL"){
                        content = KyeeI18nService.get("commonText.shareCancel","分享取消！");
                    } else if(status == "AUTH_DENIED"){
                        content = KyeeI18nService.get("commonText.shareForbidden","权限被拒绝！");
                    } else if(status == "NOT_INSTALL"){
                        if(sharePlatform == "QQZone"){
                            content = KyeeI18nService.get("commonText.notInstallQQ","您需要安装最新的QQ");
                        } else if(sharePlatform == "wxhy" || sharePlatform == "wxpyq"){
                            content = KyeeI18nService.get("commonText.notInstallWeixin","您需要安装最新的微信");
                        } else if(sharePlatform == "weibo") {
                            content = KyeeI18nService.get("commonText.notInstallWeiBo", "您需要安装最新的微博");
                        }
                    }

                    if(content){
                        KyeeMessageService.broadcast({
                            content: content
                        });
                    }
                };

                /* *
                 * 分享成功回调函数
                 *  sharePlatform: QQZone, wxhy, wxpyq, weibo
                 * */
                var successCallback = function(info, sharePlatform){
                    $scope.hide();
                    showMessage("SUCCESS", sharePlatform);
                    AboutQuyiService.saveShareChannel(sharePlatform, info, $scope.shareData);
                };

                /* *
                 * 分享失败回调函数
                 *  sharePlatform: QQZone, wxhy, wxpyq, weibo
                 * */
                var errorCallback = function(info, sharePlatform){
                    $scope.hide();
                    if (info == 2) {
                        showMessage("CANCEL");
                    } else if (info == 3) {
                        showMessage("NOT_INSTALL", sharePlatform);
                    } else {
                        showMessage("FAIL");
                    }
                    AboutQuyiService.saveShareChannel(sharePlatform, info, $scope.shareData);
                };

                $scope.share2weixinhy = function() {
                    KyeeShareService.share(
                        "WeiXinHY",
                        function(info){
                            successCallback(info, "wxhy");
                        },
                        function(info){
                            errorCallback(info, "wxhy");
                        },
                        $scope.shareParams);
                };

                $scope.share2weixinpyq = function() {
                    KyeeShareService.share(
                        "WeiXinCircle",
                        function(info){
                            successCallback(info, "wxpyq");
                        },
                        function(info){
                            errorCallback(info, "wxpyq");
                        },
                        $scope.shareParams);
                };

                $scope.share2weibo = function() {
                    KyeeShareService.share(
                        "sinashare",
                        function(info){
                            successCallback(info, "weibo");
                        },
                        function(info){
                            errorCallback(info, "weibo");
                        },
                        $scope.shareParams);
                };

                $scope.share2qq = function() {
                    KyeeShareService.share(
                        "Qzone",
                        function(info){
                            successCallback(info, "QQZone");
                        },
                        function(info){
                            errorCallback(info, "QQZone");
                        },
                        $scope.shareParams);
                };

                /**
                 * 作用域绑定
                 */
                $scope.bind({
                    params: $scope
                });

            }]
        };

        return def;
    }]);
