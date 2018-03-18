/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2016年1月19日20:01:09
 * 创建原因：支付结果页面控制器
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.payResult.controller")
    .require(["kyee.quyiyuan.payResult.service"])
    .type("controller")
    .name("PayResultController")
    .params(["$scope", "$state", "PayResultService", "PayConfirmService", "PayOrderService", "KyeeListenerRegister"])
    .action(function ($scope, $state, PayResultService, PayConfirmService, PayOrderService, KyeeListenerRegister) {
        //支付金额
        $scope.AMOUNT = '¥' + PayConfirmService.AMOUNT;

        //点击返回
        $scope.back = function() {
            PayOrderService.checkResult(PayConfirmService.HOSPITAL_ID, PayOrderService.payData, PayConfirmService.TRADE_NO, '16',true);
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "payResult",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
    })
    .build();