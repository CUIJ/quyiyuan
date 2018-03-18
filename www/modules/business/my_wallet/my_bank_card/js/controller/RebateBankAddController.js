/**
 * 产品名称：quyiyuan.
 * 创建用户：张文华
 * 日期：2015年5月11日23:01:26
 * 创建原因：银行卡列表页面控制层
 */
new KyeeModule()
    .group("kyee.quyiyuan.rebate.rebateBankAdd.controller")
    .require([
        "kyee.quyiyuan.rebate.editBankCardMsg.controller",
        "kyee.quyiyuan.rebate.rebateBankAdd.service"
    ])
    .type("controller")
    .name("RebateBankAddController")
    .params(["$scope","RebateBankAddService","$state", "KyeeListenerRegister"])
    .action(function($scope,RebateBankAddService,$state, KyeeListenerRegister){

        //初始化页面  By  章剑飞  KYEEAPPC-4750
        KyeeListenerRegister.regist({
            focus: "rebateBankAdd",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "rebateBankAdd",
            action: function (params) {
                //页面初始化
                RebateBankAddService.initView(function(result){
                    $scope.bankCardInfoList = result;
                });
            }
        });
        //添加银行卡
        $scope.doShowEditBankCardMsg = function(){
            $state.go('editBankCardMsg');
        };
        //点击银行卡列表
        $scope.onBankCardListTap = function(record){
            RebateBankAddService.onBankCardListTap(record);
        };
        //删除银行卡
        $scope.doDeleteCard = function(record){
            RebateBankAddService.doDeleteCard(record,function(result){
                $scope.bankCardInfoList = result;
            });
        };
    })
    .build();
