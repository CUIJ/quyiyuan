/**
 * 产品名称：quyiyaun
 * 创建者：wangwan
 * 创建时间：2016年10月21日17:41:12
 * 创建原因：云his消息推送消息展示页面
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.clound.his.message.controller")
    .require([
        "kyee.framework.service.view"
    ])
    .type("controller")
    .name("CloundHisMessageController")
    .params(["$scope","$ionicViewSwitcher","$state","KyeeListenerRegister","CloundHisMessageService"])
    .action(function ($scope,$ionicViewSwitcher,$state,KyeeListenerRegister,CloundHisMessageService) {
        ////页面添加监听事件( 物理返回键按下之后)
        //KyeeListenerRegister.regist({
        //    focus: "clound_his_message",
        //    when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
        //    action: function (params) {
        //        params.stopAction();
        //        $ionicViewSwitcher.nextDirection('back');
        //        $state.go('myquyi->MAIN_TAB.medicalGuide');
        //    }
        //});
        KyeeListenerRegister.regist({
            focus: "clound_his_message",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            action: function (params) {
                var patientName = CloundHisMessageService.MESSAGE.patientName;
                var hospitalName = CloundHisMessageService.MESSAGE.hospitalName;
                var paramValue = CloundHisMessageService.MESSAGE.paramValue;
                var balance = CloundHisMessageService.MESSAGE.balance;
                var amt = CloundHisMessageService.MESSAGE.amt;
                var debt = CloundHisMessageService.MESSAGE.debt;
                var cutOffDate = CloundHisMessageService.MESSAGE.cutOffDate;
                $scope.MESSAGE = '您好，' + patientName + '，截止'+cutOffDate+'，您在' + hospitalName + '的住院预交金已不足' + paramValue + '元，请您及时缴纳预交金（您住院期间共缴纳预交金' + balance + '元，共花费' + amt + '元，预交金余额为'+debt+'元）。';
            }
        });

    })
    .build();
