new KyeeModule()
    .group("kyee.quyiyuan.consultation.view_full_text.controller")
    .require(["kyee.quyiyuan.consultation.view_full_text.service"])
    .type("controller")
    .name("ViewFullTextController")
    .params(["$scope", "$state", "KyeeViewService","KyeeListenerRegister","$ionicHistory",
        "ViewFullTextService"])
    .action(function ($scope, $state, KyeeViewService,KyeeListenerRegister,$ionicHistory,
        ViewFullTextService) {

        KyeeListenerRegister.regist({
            focus: "view_full_text",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            action: function (params) {

            }
        });

        KyeeListenerRegister.regist({
            focus: "view_full_text",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        $scope.content = ViewFullTextService.content.replace(/(\\r|\\n)/g,'<br/>');

        $scope.goBack = function(){
            if($ionicHistory.backView().stateName == "doctor_info"){

            }
            $ionicHistory.goBack(-1);
        };

    })
    .build();


