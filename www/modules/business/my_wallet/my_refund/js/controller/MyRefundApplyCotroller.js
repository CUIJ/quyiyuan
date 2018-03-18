/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年8月20日
 * 创建原因：申请退款页面控制器
 * 修改者：程铄闵
 * 修改时间：2015年10月17日13:24:46
 * 修改原因：2.0.80版本需求修改
 */
new KyeeModule()
    .group("kyee.quyiyuan.myRefundApply.controller")
    .require(["kyee.quyiyuan.myRefundApply.service"])
    .type("controller")
    .name("MyRefundApplyController")
    .params(["$scope", "$state", "MyRefundApplyService", "KyeeViewService","$ionicHistory","KyeeI18nService"])
    .action(function ($scope, $state, MyRefundApplyService, KyeeViewService,$ionicHistory,KyeeI18nService) {
        //初始化表单信息
        $scope.applyInfo = {
            TRADE_NO : MyRefundApplyService.applyInfo.OUT_TRADE_NO,
            USER_NAME:'',
            USER_BANK_LASTCARD:'',
            USER_PHONE_NUMBER:'',
            RETURN_TYPE: '0'
        };
        $scope.placeholder = {
            userName:KyeeI18nService.get("refund_apply.pHUserName","请输入开户人姓名"),
            bankCardNo:KyeeI18nService.get("refund_apply.pHBankCardNo","请输入银行卡后四位"),
            phoneNum:KyeeI18nService.get("refund_apply.pHPhoneNum","请输入开户手机号")
        };//KYEEAPPC-3801 国际化翻译 by 程铄闵

        //确定
        $scope.confirmBtn = function(){
            //检测数据是否合法，如果合法则发送请求
            MyRefundApplyService.checkData(function(){
                //返回上级
                $ionicHistory.goBack(-1);
            }, $scope.applyInfo);
        };
        //取消
        $scope.cancelBtn = function(){
            //返回上级
            $ionicHistory.goBack(-1);
        };
    })
    .build();