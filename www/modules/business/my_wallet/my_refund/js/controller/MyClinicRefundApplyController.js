/*
 * 产品名称：quyiyuan
 * 创建人: 董茁
 * 创建日期:2016/8/24
 * 创建原因：2.2.90版 申请退费控制层
 * 任务号：KYEEAPPC-7611
 */
new KyeeModule()
    .group("kyee.quyiyuan.myClinicRefundApply.controller")
    .require([
        "kyee.quyiyuan.myClinicRefundApply.service"
    ])
    .type("controller")
    .name("MyClinicRefundApplyController")
    .params(["$scope", "$state","$ionicHistory","MyClinicRefundApplyService","KyeeMessageService","KyeeI18nService","MyRefundDetailService"])
    .action(function ($scope, $state,$ionicHistory,MyClinicRefundApplyService,KyeeMessageService,KyeeI18nService,MyRefundDetailService) {

        //初始化选择方式 1多选
        $scope.chooseModel = 1;
        //总金额
        $scope.sum = 0;
        //得到要退费的信息
        $scope.refundInformation = MyClinicRefundApplyService.refundInformation;
        //按钮是否置灰的标志 默认灰色
        $scope.isPay= 0;

       //当退费记录只有一条信息 默认选中
       //页面加载完成执行此方法
        $scope.isCheckedOne = function(item){
           if(item.CHECK_FLAG==0){
            if($scope.refundInformation.total=='1'){
                item.checked=true;
                var data = $scope.refundInformation.rows;
                var sum = 0;
                for(var i=0; i<data.length; i++){
                    if(data[i].checked){
                        sum = sum + parseFloat(data[i].APPLY_MONEY);
                    }
                }
                $scope.sum = sum.toFixed(2);
                }
            else{
                item.checked = false;
            }
           }
        };

        //判断退费按钮是否置灰的条件 0灰色 1 绿色
        $scope.isButtonGrey = function(){
            var data = $scope.refundInformation.rows;
            //checkFlag==0可以勾选
            for(var i=0; i<data.length; i++){
                if(data[i].CHECK_FLAG==0 ){//存在可以勾选的情况
                    $scope.isPay=1;//可以点击 绿色
                    break;
                }

            }
        };

        //判断多选框是否被勾选
        $scope.isChecked = function(item){
            if(item.CHECK_FLAG==0){//0  可以勾选
                if (item.checked) {
                    item.checked = false;
                }
                else{
                    item.checked = true;
                }
                var data = $scope.refundInformation.rows;
                var sum = 0;
                for(var i=0; i<data.length; i++){
                    if(data[i].checked){
                        sum = sum + parseFloat(data[i].APPLY_MONEY);
                    }
                }
                $scope.sum = sum.toFixed(2);
            }
        };

        //弹出退费失败信息
         $scope.refundErrorInfo = function(item){
             if(item.RETURN_STATUS == '2' ){
                 $scope.errorMsg = item.ERROR_MESSAGE;//要弹出的提示信息
                 var dialog = KyeeMessageService.dialog({
                     title: KyeeI18nService.get("commonText.noticeMsg", "提示"),
                     template: "modules/business/my_wallet/my_refund/views/refund_error_information.html",
                     tapBgToClose:true,
                     scope: $scope
                 });
             }
         };


        //发送退费请求
        $scope.refundSubmitBtn = function(){
            var data = $scope.refundInformation.rows;
            if($scope.isPay == 1) {//按钮不是灰色确定按钮才生效
                var checkFlag = false;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].checked) {
                        checkFlag = true;
                    }
                }
                //如果没有被选中的退费项目 则给用户提示去勾选
                if (!checkFlag) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("refund_apply.chooseTip", "请选择退款项进行退款！")
                    });
                    return;
                }

                //发送请求
                var checkedRefundDetail = [];
                KyeeMessageService.confirm({
                    content: KyeeI18nService.get("refund_apply.msg", data[0].PAYMENT_REFUND_TIPS),
                    onSelect: function (string) {
                        if (string) {
                            for (var i = 0; i < data.length; i++) {
                               if(data[i].checked){
                                   checkedRefundDetail.push(data[i]);
                               }
                            }
                            checkedRefundDetail = JSON.stringify(checkedRefundDetail);
                            //发送请求给后台
                            MyClinicRefundApplyService.confirmRefundApply(function(result){
                                //跳转至退费详情界面
                                if(result.success){
                                    MyRefundDetailService.params = {
                                        flag: 'clinicRefund',
                                        REC_MASTER_ID: data[0].REC_MASTER_ID,
                                        OUT_TRADE_NO: data[0].OUT_TRADE_NO,
                                        PAYTYPE_FLAG: data[0].PAYMENT_TYPE
                                    };
                                    $state.go('refund_detail');
                                }
                            },checkedRefundDetail,data[0].OUT_TRADE_NO,data[0].REC_MASTER_ID);
                        }
                    }
                });
            }
        };

        //返回缴费详情页面
        $scope.back = function () {
            $ionicHistory.goBack();
        };

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

    })
    .build();