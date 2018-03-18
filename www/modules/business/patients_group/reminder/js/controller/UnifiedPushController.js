/**
 * Created by lizhihu on 2017/8/28.
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.unified_push.controller")
    .require([
        "kyee.quyiyuan.patients_group.patients_group_message.controller",
        "kyee.quyiyuan.appointment.purchase_medince.service",
        "kyee.quyiyuan.patients_group.personal_chat.service",
        "kyee.quyiyuan.login.service"
    ])
    .type("controller")
    .name("UnifiedPushController")
    .params(["$rootScope","$sce", "$ionicLoading","$scope", "$state", "$ionicHistory", "KyeeMessageService", "CacheServiceBus", "KyeeI18nService",
        "KyeeListenerRegister", "UnifiedPushService" ,"$ionicScrollDelegate","PurchaseMedinceService","PersonalChatService","LoginService"])
    .action(function ($rootScope,$sce, $ionicLoading,$scope, $state, $ionicHistory, KyeeMessageService, CacheServiceBus, KyeeI18nService,
                      KyeeListenerRegister, UnifiedPushService,$ionicScrollDelegate,PurchaseMedinceService,PersonalChatService,LoginService) {

        //显示loading圈
        var loading = function(){
            KyeeMessageService.loading({
                content: undefined,
                duration: 30000,
                mask: false
            });
        };

        loading();//进入页面显示
        /**
         * 监听页面进入事件
         */
        KyeeListenerRegister.regist({
            focus: "unified_push",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
               if (UnifiedPushService.isFromOuterPush || UnifiedPushService.isFromWeChat) {
                     UnifiedPushService.loadData(UnifiedPushService.messageId, function (result) {
                        UnifiedPushService.msgData = result.URL_DATA;
                        initView();
                         UnifiedPushService.isFromOuterPush = false;
                         UnifiedPushService.isFromWeChat = false;
                         UnifiedPushService.messageId = undefined;
                     });
                 } else {
                    initView();
                }
            }
        });

        /**
         * 监听物理键返回
         */
        KyeeListenerRegister.regist({
            focus: "unified_push",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();        //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.goBack();
            }
        });

        /**
         * 进入页面时的初始化方法
         */
        function initView() {
            $scope.data = UnifiedPushService.msgData;
            if (typeof $scope.data == "string") {
                $scope.data = JSON.parse($scope.data);

            }
            $scope.urlAdd = $sce.trustAsResourceUrl($scope.data.msgContent);
        }

        $scope.goBack = function () {
            if (UnifiedPushService.isFromOuterPush) {
                UnifiedPushService.isFromOuterPush = false;
                $state.go("message->MAIN_TAB", {}, {reload: true});
            } else {
                $ionicHistory.goBack(-1);
            }
        };

        //隐藏loading圈
        window.hideLoadByHomeWeb = function(){
            $ionicLoading.hide();
        };

    })
    .build();