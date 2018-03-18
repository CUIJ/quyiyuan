/**
 * 产品名称：quyiyuan
 * 创建者：董茁
 * 创建时间：2016年10月08日10:12:30
 * 创建原因：一键理赔完成页面controller
 * 任务号：KYEEAPPC-8140
 */
new KyeeModule()
    .group("kyee.quyiyuan.claim_complete.controller")
    .require(["kyee.quyiyuan.claim_complete.service"])
    .type("controller")
    .name("ClaimCompleteController")
    .params(["$scope", "$state","KyeeListenerRegister"])
    .action(function ($scope, $state,KyeeListenerRegister) {
        $scope.wid = (document.body.clientWidth);
        $scope.divMarL =(document.body.clientWidth-143)/2;
        $scope.div1MarL =(document.body.clientWidth-295)/2;
        //完成  跳到医院首页
        $scope.complete = function(){
            $state.go("home->MAIN_TAB");
        };

        $scope.back = function(){
            $state.go("home->MAIN_TAB");
        };
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "claim_complete",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
    })
    .build();