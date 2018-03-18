/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年12月16日09:36:50
 * 创建原因：发卡行列表控制器
 * 任务号：KYEEAPPC-4565
 */
new KyeeModule()
    .group("kyee.quyiyuan.rebate.bankList.controller")
    .require([
        "kyee.quyiyuan.rebate.editBankCardMsg.service",
        "kyee.quyiyuan.rebate.bankList.service"
    ])
    .type("controller")
    .name("BankListController")
    .params(["$scope", "$ionicHistory", "EditBankCardMsgService", "KyeeI18nService", "$ionicScrollDelegate"])
    .action(function ($scope, $ionicHistory, EditBankCardMsgService, KyeeI18nService, $ionicScrollDelegate) {
        //发卡行选择列表
        $scope.bankList = EditBankCardMsgService.bankType;

        //搜索框
        $scope.bankListPlaceHolder = KyeeI18nService.get('bank_list.searchPlaceHolder', '搜索开户行关键词', null);

        //发卡行关键词
        $scope.keyword = '';

        //选择银行
        $scope.selectBank = function (bank) {
            EditBankCardMsgService.scope.formMsgs.BANK_CODE = bank.BANK_ID;
            EditBankCardMsgService.scope.formMsgs.BANK_NAME = bank.BANK_NAME;
            EditBankCardMsgService.scope.MAINTYPE_STATUS = bank.MAINTYPE_STATUS;
            $ionicHistory.goBack();
        };
        //滚动条重置
        $scope.scrollResize = function () {
            $ionicScrollDelegate.scrollTop();
        };
    })
    .build();
