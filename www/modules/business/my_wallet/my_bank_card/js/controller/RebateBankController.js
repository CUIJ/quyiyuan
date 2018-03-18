/**
 * 产品名称：quyiyuan.
 * 创建用户：张文华
 * 日期：2015年5月11日23:01:26
 * 创建原因：账户信息页面控制层
 */
new KyeeModule()
    .group("kyee.quyiyuan.rebate.rebateBank.controller")
    .require([
        "kyee.quyiyuan.rebate.rebateBank.service",
        "kyee.quyiyuan.rebate.rebateBankAdd.controller",
        "kyee.quyiyuan.myWallet.applyCash.service"
    ])
    .type("controller")
    .name("RebateBankController")
    .params(["$scope","RebateBankService","$state","ApplyCashService","KyeeI18nService"])
    .action(function($scope,RebateBankService,$state,ApplyCashService,KyeeI18nService){
        $scope.placetxt=KyeeI18nService.get('rebateBank.inputPlaceHolder','请输入提现金额',null);
        RebateBankService.scope = $scope;
        //页面数据初始化为默认值
        $scope.inputVal = {
            AMOUNT:""
        };
        $scope.BankCardInfo = {
            bankName:'',
            cardId:'',
            bankNo:''
        };
        //监听进入本页面事件，每次进入时初始化页面
        $scope.$on("$ionicView.enter",function() {
            RebateBankService.initView(function(result){
                $scope.BankCardInfo.cardId = result.cardId;
                $scope.BankCardInfo.bankName = result.bankName;
                $scope.BankCardInfo.bankNo = result.bankNo;
            });
        });

        //确定按钮
        $scope.onSubmitBtn = function(){
            RebateBankService.onSubmitBtn($scope.inputVal.AMOUNT,$scope.BankCardInfo,function(){
                $state.go("apply_cash");
            });
        };
        //跳转银行卡列表页面
        $scope.doShowRebateBankAdd = function(){
            RebateBankService.doShowRebateBankAdd();
        };
        //跳转编辑银行卡页面
        $scope.onShowEditBankCardMsgTap = function(){
            RebateBankService.onShowEditBankCardMsgTap();
        };
        //输入事件监听
        $scope.onInputAmount = function(amount){
            $scope.inputVal.AMOUNT = RebateBankService.onInputAmount(amount,$scope);
        };
    })
    .build();
