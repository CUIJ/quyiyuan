/**
 * 产品名称：quyiyuan
 * 创建用户：姜品
 * 日期：2017年10月31日
 * 创建原因：在线咨询患者知情条款控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.consult_contract.controller")
    .require([

    ])
    .type("controller")
    .name("ConsultContractController")
    .params(["$scope", "$state", "$ionicHistory", "$interval",
        "KyeeUtilsService", "KyeeListenerRegister"])
    .action(function ($scope, $state, $ionicHistory, $interval,
                      KyeeUtilsService, KyeeListenerRegister) {

        KyeeListenerRegister.regist({
            focus: "consult_contract",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                //initView();
            }
        });

        KyeeListenerRegister.regist({
            focus: "consult_contract",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        $scope.goBack = function () {
           $ionicHistory.goBack(-1);
        };

    })
    .build();
