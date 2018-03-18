new KyeeModule()
    .group("kyee.quyiyuan.patients_group.treatment_plan.controller")
    .require(["kyee.quyiyuan.patients_group.patients_group_message.controller"])
    .type("controller")
    .name("TreatmentPlanController")
    .params(["$rootScope", "$scope", "$state", "$ionicHistory", "TreatmentPlanService", "KyeeListenerRegister","StatusBarPushService"])
    .action(function ($rootScope, $scope, $state, $ionicHistory, TreatmentPlanService, KyeeListenerRegister,StatusBarPushService) {

        //外部通知跳转进来，显示返回键
        if(StatusBarPushService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        }
        KyeeListenerRegister.regist({
            focus: "treatment_plan_push",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                if (TreatmentPlanService.isFromBar) {
                    TreatmentPlanService.loadData(TreatmentPlanService.messageId, function (result) {
                        TreatmentPlanService.treatmentPlan = result.URL_DATA;
                    });
                }
                initView();
            }
        });

        /**
         * 监听物理键返回
         */
        KyeeListenerRegister.regist({
            focus: "treatment_plan_push",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();        //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.goBack();
            }
        });

        $scope.goBack = function () {
            if (TreatmentPlanService.isFromBar ||StatusBarPushService.webJump) {
                StatusBarPushService.webJump = undefined;
                TreatmentPlanService.isFromBar = false;
                $state.go("message->MAIN_TAB", {}, {reload: true});
            } else {
                $ionicHistory.goBack(-1);
            }
        };

        function initView() {
            $scope.treatmentPlan = TreatmentPlanService.treatmentPlan;
            if (typeof $scope.treatmentPlan == "string") {
                $scope.treatmentPlan = JSON.parse($scope.treatmentPlan);
            }
        }
    })
    .build();