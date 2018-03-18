/**
 * 任务号：KYEEAPPTEST-3937
 * 创建用户: yangmingsi
 * 时间: 2016年11月23日10:51:57
 * 描述：意见反馈页面整体优化
 */
new KyeeModule()
    .group("kyee.quyiyuan.aboutquyi.newFeedback.controller")
    .require(["kyee.quyiyuan.aboutquyi.service"])
    .type("controller")
    .name("NewFeedbackController")
    .params(["KyeePhoneService","$scope", "$state", "AboutQuyiService",
        "KyeeI18nService", "KyeeMessageService","CacheServiceBus","KyeeListenerRegister","$ionicHistory","$ionicScrollDelegate"])
    .action(function(KyeePhoneService,$scope, $state, AboutQuyiService,
                     KyeeI18nService, KyeeMessageService,CacheServiceBus,KyeeListenerRegister,$ionicHistory,$ionicScrollDelegate){
        var memCache = CacheServiceBus.getMemoryCache();
        var userInfo = memCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
        var needNotToScroll = false;
        $scope.userSex = userInfo.SEX;//1:男 2：女
        $scope.dafaultText ="您好，我是客服小趣，我们的工作时间是周一至周五，（法定节假日除外）。我们会在收到反馈后24小时内给您回复，请耐心等待。";
        $scope.querySuggest=function(){
            AboutQuyiService.querySuggest($scope);
        };
        $scope.askQuestions=function(){
            $state.go("aboutquyi_newFeedback");
        };
        $scope.doRefresh=function(){
            AboutQuyiService.querySuggest($scope);
            $scope.$broadcast('scroll.refreshComplete');
            needNotToScroll = true;

        };
        /**
         * 初始化页面数据渲染完成后重置页面到底部
         */
        $scope.repeatFinshed = function(){
            if(needNotToScroll){ //下拉刷新反馈记录渲染成功后不需要进行条目回滚。
                needNotToScroll = false;
                return;
            }
            $ionicScrollDelegate.$getByHandle("feedback_content").scrollBottom(true);
            $scope.$apply();
        };

        KyeeListenerRegister.regist({
            focus: "aboutquyi_feedback",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "back",
            action: function (params) {
                var forwardView = $ionicHistory.forwardView();
                if (forwardView && forwardView.stateName == "aboutquyi_newFeedback") {
                    AboutQuyiService.querySuggest($scope);
                    $ionicScrollDelegate.$getByHandle("feedback_content").resize();
                    $ionicScrollDelegate.$getByHandle("feedback_content").scrollBottom(true);

                }
            }
        });
    })
    .build();