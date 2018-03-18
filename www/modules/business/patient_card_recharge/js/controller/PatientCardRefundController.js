/**
* 产品名称：quyiyuan
* 创建人: 董茁
* 创建日期:2016年9月27日15:05:42
* 创建原因：就诊卡退费页面
* 任务号：
**/
new KyeeModule()
    .group("kyee.quyiyuan.patient_card_refund.controller")
    .require(["kyee.quyiyuan.patient_card_refund.service",
            "kyee.quyiyuan.patient_card_records.controller",
       "kyee.quyiyuan.card_refund.controller"])
    .type("controller")
    .name("PatientCardRefundController")
    .params(["$scope", "$rootScope", "$state", "$ionicHistory", "KyeeI18nService", "KyeeUtilsService", "KyeeMessageService","KyeeListenerRegister","PatientCardRefundService","PatientCardRecordsService"])
    .action(function ($scope, $rootScope, $state, $ionicHistory, KyeeI18nService, KyeeUtilsService, KyeeMessageService,KyeeListenerRegister,PatientCardRefundService,PatientCardRecordsService){
        //初始化数据
        $scope.isGrey=0;//默认可点击 绿色
        $scope.isViewRefund=0;//默认显示
        //拉取退费数据
        PatientCardRefundService.getRefund(function(data){
            $scope.total=data.data.total;
        });
         var loadData = function(){
             $scope.cardRefund =  PatientCardRefundService.rechargeInfo;
             if(( $scope.cardRefund.REFUND_ARRAY==undefined && $scope.cardRefund.OTHER_REFUND ==undefined) || $scope.cardRefund.TOTAL_AMOUNT<=0 ){
                 $scope.isViewRefund=1;//不显示
             }
             //按钮灰色逻辑 没有线上数据 或者就诊卡余额为小于等于0
             if( $scope.cardRefund.REFUND_ARRAY==undefined ||  $scope.cardRefund.TOTAL_AMOUNT<=0){
                 $scope.isGrey = 1;//灰色
             }
        };
        loadData();
        //两者都为空  或者就诊余额是0  都不显示

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

        $scope.queryRefund=function(){
            $state.go('card_refund');
        };
        //返回
        $scope.back = function(){
            $ionicHistory.goBack();
        };

        $scope.refundSubmitBtn = function(){
          //线上退费数据 并且就诊卡余额大于0 按钮才可点击
            if($scope.cardRefund.REFUND_ARRAY && $scope.cardRefund.TOTAL_AMOUNT>0){//有线上退费
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get('patient_card_recharge.msgTitle',"提示"),
                    content: KyeeI18nService.get('patient_card_recharge.confirmMessage',"确定申请退费？"),
                    okText:KyeeI18nService.get('patient_card_recharge.yes',"确定"),
                    cancelText:KyeeI18nService.get('patient_card_recharge.no',"取消"),
                    onSelect: function (res) {
                        if(res){
                             PatientCardRefundService.applyPatientCardRefund(function(data){
                                 if(data.success){
                                     PatientCardRefundService.fromApplyRefund = true;
                                     $state.go('patient_card_records');//跳到退费记录界面
                                     //获取退费记录
                                 }else{
                                     //弹出信息
                                     KyeeMessageService.broadcast({
                                         content: KyeeI18nService.get("patient_card_recharge.message", data.message)
                                     });
                                     return ;
                                 }
                             }, $scope.cardRefund);
                        }else{

                        }
                    }
                });


            }
        };
        //弹出提示信息
        $scope.noticeMessage = function(){
            KyeeMessageService.message({
                title : KyeeI18nService.get("patient_card_refund.noticeMessage","温馨提示"),
                content : KyeeI18nService.get("patient_card_refund.content","趣医退款金额不能大于您在趣医的充值金额，退款将退还到您之前的充值账号中，您可通过退款记录查询详细的退款信息。"),
                okText: KyeeI18nService.get("commonText.iknowMsg","我知道了")
            });

        };

        /* KyeeListenerRegister.regist({
         focus: "patient_card_refund",
         when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
         direction: "forward",
         action: function (params) {
         params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
         $scope.back();

             }
         });*/
    })
    .build();