/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015/9/22
 * 创建原因：我的钱包--门诊业务缴费详细记录页面
 * 任务号：KYEEAPPC-3468
 * 修改者：程铄闵
 * 修改时间：2015年11月17日10:34:32
 * 修改原因：国际化翻译
 * 任务号：KYEEAPPC-3802
 * 修改者：张婧
 * 修改时间：2016年7月26日18:21:38
 * 修改原因：添加单击按钮统计
 * 任务号：KYEEAPPC-6641
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.paidRecord.controller")
    .require(["kyee.quyiyuan.myWallet.clinicPaid.service",
        "kyee.quyiyuan.myWallet.paidRecord.service",
        "kyee.quyiyuan.myClinicRefundApply.controller"])
    .type("controller")
    .name("PaidRecordController")
    .params(["$scope", "$state","KyeeMessageService","ClinicPaidService","KyeeListenerRegister",
        "$ionicHistory","KyeeI18nService","MyRefundDetailNewService","ClinicPaymentReviseService","MyRefundDetailService",
        "OperationMonitor","PaidRecordService","MyClinicRefundApplyService","$timeout","$compile"])
    .action(function ($scope, $state,KyeeMessageService,ClinicPaidService,KyeeListenerRegister,
                      $ionicHistory,KyeeI18nService,MyRefundDetailNewService,ClinicPaymentReviseService,MyRefundDetailService,
                      OperationMonitor,PaidRecordService,MyClinicRefundApplyService,$timeout,$compile) {
         //对话框
        var dialog = undefined;
        $scope.isFromClinicPaid = false;
        var isFromMsg = false;//非已缴费页面进入时清掉标记，可以刷已缴费页面
        $scope.isEmpty = true;
        $scope.selectflag=0;
        $scope.showRcodeImgAbs = false;//是否直接在当前页面显示一维码，无需点击显示
        //外部通知跳转进来，显示返回键
        if(PaidRecordService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        }
        //初始化数据
        var init = function(){
            //从已缴费记录中跳到详情 && 从申请退费进入 程铄闵 KYEEAPPC-7610
            //缴费成功提醒 by 程铄闵 KYEEAPPC-3868
            var forwardView = $ionicHistory.forwardView();
            initClick();
            isPermitAddConfirm();
            if(PaidRecordService.webJump || ClinicPaidService.fromClinicPaid || (forwardView && (forwardView.stateId == 'clinic_refund_apply'||forwardView.stateId == 'refund_detail'))){
                ClinicPaidService.fromClinicPaid = false;

                if(!($ionicHistory.backView() && $ionicHistory.backView().stateId == 'clinic_paid_message')){
                    $scope.isFromClinicPaid = true;
                }
                PaidRecordService.loadPaidRecord(PaidRecordService.params,function(success,data){
                    if(success){
                        $scope.isEmpty = false;
                        $scope.paidInfo = data;
                        $scope.hospitalLogo = ClinicPaymentReviseService.getHospitalLogo($scope.paidInfo.HOSPITAL_ID);
                        if($scope.paidInfo&&$scope.paidInfo.PAYMENT_FEE_SUCCESS_MSG&&$scope.paidInfo.PAYMENT_FEE_SUCCESS_MSG.indexOf("<show>") != -1){
                            if($scope.paidInfo.RECEIPT_NO&&$scope.paidInfo.IS_OPEN_ONEDIMENCODE==1){
                                $scope.paidInfo.PAYMENT_FEE_SUCCESS_MSG = $scope.paidInfo.PAYMENT_FEE_SUCCESS_MSG.replace("<show>","");
                                $scope.paidInfo.PAYMENT_FEE_SUCCESS_MSG = $scope.paidInfo.PAYMENT_FEE_SUCCESS_MSG.replace("<span style=\"color:#4685BA;\" ng-click=\"getOneDimenCode();\"></span>","");
                                $scope.showRcodeImgAbs = true;
                            }else{
                                $scope.showRcodeImgAbs = false;
                            }
                        }else{
                            $scope.showRcodeImgAbs = false;
                        }
                        initCanSelectAll();
                    }
                    else{
                        $scope.isEmpty = true;
                        $scope.emptyText = data;
                    }
                });
            }
            else{
                //费用信息
                var paidInfo = PaidRecordService.paidInfo;
                if(paidInfo && paidInfo.success){
                    $scope.isEmpty = false;
                    $scope.paidInfo = paidInfo;
                    $scope.hospitalLogo = ClinicPaymentReviseService.getHospitalLogo($scope.paidInfo.HOSPITAL_ID);
                }
                else{
                    $scope.isEmpty = true;
                    $scope.emptyText = PaidRecordService.errorMsg;
                }
            }

        };

        //初始化点击事件
        var initClick = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("paidSuccessMsgID"));
                    element.html($scope.paidInfo.PAYMENT_FEE_SUCCESS_MSG);
                    $compile(element.contents())($scope);
                },
                1000
            );
        };
        var initCanSelectAll=function(){
            var count=0;
            var countConfirm=0;
            for(var i=0;i<$scope.paidInfo.PAYDETAIL.length;i++){
                var j=$scope.paidInfo.PAYDETAIL[i].GROUP_DATA.length;
                for(var k=0 ;k<j;k++){
                    count++;
                    if($scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].IS_CONFIRM==1){
                        countConfirm++;
                    }
                }
            }
            if(count==countConfirm){
                $scope.canSelectAll=true;
            }
            else{
                $scope.canSelectAll=false;;
            }
        };

        var isPermitAddConfirm=function(){
            PaidRecordService. isPermitAddConfirm(function(result){
                $scope.isPermit=false;
                if("1"==result.confirmResult){
                    $scope.isPermit=true;
                }
                $scope.tipText = result.tipText;
            });
        };

        init();

        //加监听 小铃铛或小信封或待缴费-》已缴费详情（不传recordBack = true）
        KyeeListenerRegister.regist({
            focus: "paid_record",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: 'both',
            action: function (params) {
                if($ionicHistory.backView()){
                    var lastPage = $ionicHistory.backView().stateId;
                    if(lastPage != "clinicPaid"){
                        isFromMsg = true;
                    }
                }
            }
        });

         //跳转到详情页
        $scope.showDetail = function (paymentDetail,params) {
            OperationMonitor.record("showDetail","paid_record");//添加按钮统计
            //弹出对话框
            $scope.paidDetail = paymentDetail;//第三层数据
            if(params.IS_ADD=='1'){//如果是附加费用的话 不显示弹框 by dongzhuo
                return;
            }
            dialog = KyeeMessageService.dialog({
                template: "modules/business/my_wallet/clinic_payment/views/delay_views/paid_detail.html",
                tapBgToClose:true,//程铄闵 KYEEAPPC-5599 点击周围可关闭
                scope: $scope
            });
        };
        //关闭对话框
        $scope.closeDialog = function () {
            dialog.close();
        };
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "paid_record",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                if (KyeeMessageService.isPopupShown()) {
                    dialog.close();
                    return;
                }
                $scope.back();

            }
        });
        //返回
        $scope.back = function () {
            if(PaidRecordService.webJump){
                //外部通知跳转进来,返回到首页
                PaidRecordService.webJump = undefined;
                $state.go('home->MAIN_TAB');
            }else{
                //非已缴费页面进入时清掉标记，可以刷页面
                if(!isFromMsg){
                    ClinicPaidService.recordBack = true;
                }
                $ionicHistory.goBack();
            }
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);
        };
        //支付状态--已废弃
        $scope.payStatus = function (ACCOUNT_FLAG) {
            switch (ACCOUNT_FLAG) {
                case '0':
                    return KyeeI18nService.get("paid_record.accountFlag0","正在处理");//green
                case '1':
                    return KyeeI18nService.get("paid_record.accountFlag1","支付成功");//green
                case '2':
                    return KyeeI18nService.get("paid_record.accountFlag2","支付失败");
                case '3':
                    return KyeeI18nService.get("paid_record.accountFlag3","已退费");
                case '4':
                    return KyeeI18nService.get("paid_record.accountFlag4","退费中");
                case '5':
                    return KyeeI18nService.get("paid_record.accountFlag5","退费失败");
            }
        };
        //四舍五入的方法 v-待转换的值 e-位数
        var rounding = function (v, e) {
            v = parseFloat(v);
            if (!isNaN(v)) {
                var t = 1;
                for (; e > 0; t *= 10, e--);
                for (; e < 0; t /= 10, e++);
                v = Math.round(v * t) / t;
                return v;
            }
        };
        //转换金额 KYEEAPPC-8485 程铄闵 金额统一四舍五入
        $scope.convertMoney = function(v,isOriginalShow){
            if (v != undefined) {
                var data = parseFloat(v);
                //小数点3位及以上原样显示
                if(isOriginalShow == true){
                    var n = data.toString().split('.')[1];
                    if(!n || (n && n.length>0 && n.length<3)){
                        data = data.toFixed(2);
                    }
                }
                else{
                    data = rounding(data,2).toFixed(2);
                }
                return data;
            }
        };
        /**
         * 创建人：章剑飞
         * 创建时间：2015年7月22日11:20:56
         * 创建原因：申请退费
         * 任务号：KYEEAPPC-2773
         * 修改：zhangjing
         * 任务号：KYEEAPPC-4268
         * 描述：页面提示语的优化（title调用李兴公共方法，变成“提示”）
         * 修改时间：2015年11月25日14:31:23
         * 修改人: 董茁
         * 修改日期:2016/8/24
         * 修改原因：2.2.90版 申请退费页面
         * 任务号：KYEEAPPC-761
         */
        $scope.refundApply = function (paidInfo) {
            OperationMonitor.record("refundApply","paid_record");//添加按钮统计
            PaidRecordService.refundApply(function(data){
                MyClinicRefundApplyService.refundInformation = data;
                $state.go('clinic_refund_apply');
            },paidInfo);
        };

        //删除门诊已缴费记录函数
        $scope.delete = function (paidInfo){
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("commonText.msgTitle", "消息"),
                content: KyeeI18nService.get("paid_record.delTip", "该记录删除后，将无法恢复。请确认是否删除？"),
                onSelect: function (flag) {
                    if (flag) {
                        OperationMonitor.record("deletePaidRecord","paid_record");//添加按钮统计
                        PaidRecordService.deleteClinicPaid(function(){
                            $ionicHistory.goBack();
                        },paidInfo.REC_MASTER_ID,paidInfo.EXTRA_KEY);//附加费用删除标志 by dongzhuo KYEEAPPC-7183

                    }
                }
            })
        };

        //请求退费详情页
        $scope.refundDetail = function (paidInfo){
            OperationMonitor.record("refundDetail","paid_record");//添加按钮统计
            MyRefundDetailService.params = {
                flag:'clinicPaid',
                REC_MASTER_ID: $scope.paidInfo.REC_MASTER_ID,
                OUT_TRADE_NO: $scope.paidInfo.ORDER_NO,
                refundSum: $scope.paidInfo.RETURN_BALANCE,
                PAYTYPE_FLAG:$scope.paidInfo.PAYTYPE_FLAG,
                READ_FLAG_ID:$scope.paidInfo.READ_FLAG_ID
            };
            //KYEEAPPTEST-3818 增加附加费判断
            if($scope.paidInfo && $scope.paidInfo.IS_ADD == '1' && MyRefundDetailService.params){
                MyRefundDetailService.params.EXTRA_KEY = $scope.paidInfo.EXTRA_KEY;
            }
            $state.go('refund_detail');
        };

        //得到一维码 bydongzhuo
        $scope.getOneDimenCode = function(){
                $scope.paidInfo = PaidRecordService.paidInfo;
                $scope.imgWidth=1*230;
                $scope.height=77/2;
                $scope.divHeight=114;
                $scope.greenIndex=1;
                var dialog = KyeeMessageService.dialog({
                    template: "modules/business/my_wallet/clinic_payment/views/delay_views/oneDimenCode.html",
                    tapBgToClose:true,
                    scope: $scope
                });
        };
        //得到二维码 zhengpengcheng
        $scope.getTwoDimenCode = function(){
            $scope.paidInfo = PaidRecordService.paidInfo;
            $scope.imgWidth=1*230;
            $scope.height=77/2;
            $scope.divHeight=114;
            $scope.greenIndex=1;
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/my_wallet/clinic_payment/views/delay_views/twoDimenCode.html",
                tapBgToClose:true,
                scope: $scope
            });
        };
        //一倍大小图片
        $scope.oneSizeShow = function(){
            $scope.imgWidth=1*230;
            $scope.greenIndex=1;
            $scope.divHeight=114;
            if($scope.greenIndex==1){
                $scope.height=77/2;
            }
        };
        //0.5倍大小图片
        $scope.twoSizeShow = function(){
            $scope.imgWidth=0.5*230;
            $scope.greenIndex=2;
            $scope.divHeight=114*0.25;
            if($scope.greenIndex==2){
                $scope.height=77/5;
            }
        };
        //0.25倍大小图片
        $scope.threeSizeShow = function(){
            $scope.imgWidth=0.25*230;
            $scope.greenIndex=3;
            $scope.divHeight=114*0.25;
            if($scope.greenIndex==3){
                $scope.height=77/6.5;
            }
        };

        //展示支付失败提示内容  程铄闵  KYEEAPPC-3869
        $scope.errorMsgClick = function(paidInfo){
            var flag = paidInfo.ACCOUNT_FLAG;
            var errorMsg = paidInfo.ERROR_MSG;//错误提示
            OperationMonitor.record("showErrorMsg","paid_record");//添加按钮统计
            //退费失败时弹框提示
            if(paidInfo.ORIG_ACCOUNT_FLAG!=1 && flag == 5 && errorMsg!=undefined && errorMsg!=''){
                KyeeMessageService.message({
                    title : KyeeI18nService.get("paid_record.failDetail","失败详情"),
                    content : paidInfo.ERROR_MSG,
                    okText: KyeeI18nService.get("commonText.iknowMsg","我知道了")
                });
            }
            //支付失败&预交金支付方式&医院参数开关已开弹框提示 程铄闵 KYEEAPPC-4677
            else if(flag==2 && errorMsg!=undefined && errorMsg!='' && paidInfo.PAYTYPE_FLAG=='3' && paidInfo.SHOW_ERROR_MSG=='1'){
                KyeeMessageService.message({
                    title : KyeeI18nService.get("paid_record.failDetail","失败详情"),
                    content : paidInfo.ERROR_MSG,
                    okText: KyeeI18nService.get("commonText.iknowMsg","我知道了")
                });
            }
        };
        $scope.allChoose = false;
        $scope.canConfirm = false;
        $scope.canSelectAll=false;
        $scope.confirm=function(){
            if(!$scope.canConfirm){
              return;
            }
            var primkey = new Array();
            for(var i=0;i<$scope.paidInfo.PAYDETAIL.length;i++){
                var j=$scope.paidInfo.PAYDETAIL[i].GROUP_DATA.length;
                for(var k=0 ;k<j;k++){
                   if($scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].selectflag){
                       $scope.canConfirm=false;
                       $scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].confirm=true;
                       if($scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].IS_CONFIRM!=1){
                           $scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].IS_CONFIRM=1;
                       primkey.push( ($scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].REC_DETAIL_ID).toString())}

                   }
                }
            }
            if(primkey.length!=0){
            PaidRecordService.updatePaidRecordConfirm(primkey);

                var count=0;
                var countSelec=0;
                for(var i=0;i<$scope.paidInfo.PAYDETAIL.length;i++){
                    var j=$scope.paidInfo.PAYDETAIL[i].GROUP_DATA.length;
                    for(var k=0 ;k<j;k++){
                        count++;
                        if( $scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].selectflag||$scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].IS_CONFIRM==1){
                            countSelec++;
                        }
                    }
                }
                if(count!=0&& countSelec==count) {
                    $scope.canSelectAll=true;
                }
            }

        }
        $scope.selectPic = function(detail){
            if(detail.confirm||detail.IS_CONFIRM==1){
                return;
            }

            if(detail.selectflag){
                detail.selectflag=false;
            }else {
                detail.selectflag = true;
            }
            var count=0;
            var countSelec=0;
            var currentCount=0;
            for(var i=0;i<$scope.paidInfo.PAYDETAIL.length;i++){
                var j=$scope.paidInfo.PAYDETAIL[i].GROUP_DATA.length;
                for(var k=0 ;k<j;k++){
                    count++;
                    if( $scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].selectflag||$scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].IS_CONFIRM==1){
                        countSelec++;
                    }
                    if( $scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].selectflag&&$scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].IS_CONFIRM!=1){
                        currentCount++;
                    }
                }
            }
            if(countSelec==count){
                $scope.allChoose=true;
            }
            else{
                $scope.allChoose=false;
            }

            if(currentCount>0){
                $scope.canConfirm=true;
            }
            else{
                $scope.canConfirm=false;
            }
        }
        $scope.toAllChoose = function(){
            if($scope.canSelectAll){
                return;
            }
            if($scope.allChoose){
                $scope.allChoose = false;
                for(var i=0;i<$scope.paidInfo.PAYDETAIL.length;i++){
                 var j=$scope.paidInfo.PAYDETAIL[i].GROUP_DATA.length;
                    for(var k=0 ;k<j;k++){
                        if($scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].confirm||$scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].IS_CONFIRM==1){
                            continue;
                        }
                        $scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].selectflag=false;
                        $scope.canConfirm=false;
                    }
                }

            }else{
                $scope.allChoose = true;
                for(var i=0;i<$scope.paidInfo.PAYDETAIL.length;i++){
                    var j=$scope.paidInfo.PAYDETAIL[i].GROUP_DATA.length;
                    for(var k=0 ;k<j;k++){
                        if($scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].confirm||$scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].IS_CONFIRM==1){
                            continue;
                        }
                        $scope.paidInfo.PAYDETAIL[i].GROUP_DATA[k].selectflag=true;
                        $scope.canConfirm=true;
                    }
                }
            }
        }


    })
    .build();