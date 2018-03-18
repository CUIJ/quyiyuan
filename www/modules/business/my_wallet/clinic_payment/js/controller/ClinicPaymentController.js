/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年9月13日21:40:28
 * 创建原因：待缴费用控制器
 * 任务号：KYEEAPPC-3275
 * 修改者：程铄闵
 * 修改时间：2015年11月26日11:33:40
 * 修改原因：待缴费2.1.0优化
 * 任务号：KYEEAPPC-4102
 * 修改者：程铄闵
 * 修改时间：2015年12月13日21:10:53
 * 修改原因：门诊费用增加切换医院的功能（2.1.10）
 * 任务号：KYEEAPPC-4451
 * 修改者：程铄闵
 * 修改时间：2015年12月26日13:28:16
 * 修改原因：门诊费用小数点及提示语句的处理（2.1.20）
 * 任务号：KYEEAPPC-4673
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.clinicPayment.controller")
    .require(["kyee.quyiyuan.myWallet.clinicPayment.service",
        "kyee.quyiyuan.payOrder.controller",
        "kyee.quyiyuan.payOrder.service",
        "kyee.quyiyuan.myWallet.clinicPaid.controller",
        "ngSanitize",
        "kyee.quyiyuan.myWallet.clinicPaymentQueryController.controller"])
    .type("controller")
    .name("ClinicPaymentController")
    .params(["$scope", "$state", "$ionicHistory", "ClinicPaymentService", "KyeeMessageService",
        "PayOrderService", "KyeeListenerRegister", "KyeeViewService", "CacheServiceBus", "QueryHisCardService",
        "KyeeUtilsService","KyeeI18nService","HospitalSelectorService","$compile", "$timeout","$ionicScrollDelegate",
        "AuthenticationService","$ionicListDelegate"])
    .action(function ($scope, $state, $ionicHistory, ClinicPaymentService, KyeeMessageService,
                      PayOrderService, KyeeListenerRegister, KyeeViewService, CacheServiceBus, QueryHisCardService,
                      KyeeUtilsService,KyeeI18nService,HospitalSelectorService,$compile, $timeout,$ionicScrollDelegate,
                      AuthenticationService,$ionicListDelegate) {
        //显示详情项
        $scope.payDetail = [];
        //页面显示剩余时间
        $scope.remainTime = [];
        //剩余时间集合
        var remainSeconds = [];
        //计时器
        var timer = undefined;

        var fontColor = '';
        var msPrompt = '';
        //详情对话框
        var dialog = undefined;
        $scope.isPay = 1;//默认正常显示去支付按钮 KYEEAPPC-4631

        //页面无数据提示
        $scope.emptyText = undefined;//KYEEAPPTEST-3190 程铄闵
        //页面是否无数据
        $scope.isEmpty = true;
        //底部黑框提示
        $scope.tips = undefined;
        //小数位数底部提示
        $scope.roundTip = undefined;

        //初始化选中数据
        $scope.checkAllData = undefined;
        //支持滑动删除的可配参数
        $scope.shouldShowDelete = false;
        $scope.shouldShowReorder = false;
        $scope.listCanSwipe = true;

        //默认显示底部黑框
        $scope.hiddenBar = false;

        //初始化底部提示
        var initTips = function(){
            //底部提示
            var tip = ClinicPaymentService.tips;
            var storageCache = CacheServiceBus.getStorageCache();
            var hospitalInfo = storageCache.get("hospitalInfo");//当前医院信息
            if(tip){
                if(tip.trim()==''){
                    getTips();
                }
                else{
                    $scope.tips = tip;
                }
            }
            else{
                getTips();
            }
            footerClick();
        };
        //默认提示信息 KYEEAPPC-5128 程铄闵
        var getTips = function(){
            if(ClinicPaymentService.fromHospitalView==1){
                $scope.tips = KyeeI18nService.get("clinicPayment.tip","已成功为您刷新费用记录")
            }
            else{
                $scope.tips = '已成功为您刷新费用记录，如果需查看其它医院费用记录，请<span style=\"text-decoration: underline;color:#357fbc;\" ng-click=\"goToHospitalView();\">切换医院</span>';
            }
        };
        //初始化底部点击事件 KYEEAPPTEST-3181 程铄闵
        var footerClick = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("clinicPaymentTipId"));
                    element.html($scope.tips);
                    $compile(element.contents())($scope);
                    var scroll = document.getElementById("clinic_payment_scroll_id");
                    var footbar = document.getElementById("clinic_payment_footbar_id");
                    if(scroll && footbar){
                        $scope.ionScrollHeight=(window.innerHeight-97-parseInt(footbar.offsetHeight)) +'px';
                        $ionicScrollDelegate.scrollTop();
                    }
                    if(!footbar){
                        $scope.ionScrollHeight=(window.innerHeight-97) +'px';
                    }
                },
                1000
            );
        };
        //刷新
        $scope.doRefresh = function (flag) {
            $scope.pFirIndex = -1;//第一层展开下标（门诊）
            $scope.rFirIndex = -1;//第一层展开下标（预约挂号）
            $scope.pSecIndex = -1;//第二层展开下标（门诊）
            $scope.rSecIndex = -1;//第二层展开下标（预约挂号）
            //$scope.pSingleIndex = -1;//门诊单选下标
            $scope.sum = 0;//合计金额
            $scope.buttonT = KyeeI18nService.get("clinicPayment.goPay","去支付");//默认按钮字样
            $scope.buttonColor = 'button_color_red';//默认按钮样式
            //获取待缴费数据
            ClinicPaymentService.loadData(ClinicPaymentService.fromHospitalView,function (data, success, prompt, resultCode) {
                KyeeUtilsService.cancelInterval(timer);
                $scope.allPaymentData = data;
                remainSeconds = [];//KYEEAPPC-4804 修改一直停在当前页面到倒计时结束后页面一直不断刷新问题 程铄闵
                if (success) {
                    $scope.isEmpty = false;
                    if(!ClinicPaymentService.HOSPITALID_TREE)
                    {
                        for (var i = 0; i < data.REG.length; i++) {
                            remainSeconds[i] = data.REG[i].REMAIN_SECORDS;
                        }
                        //倒计时需要继续支付的数据
                        if (remainSeconds.length > 0) {
                            setTime(timer, remainSeconds);
                            //计时
                            timer = KyeeUtilsService.interval({
                                time: 1000,
                                action: function () {
                                    setTime(timer, remainSeconds);
                                }
                            });
                        }
                        //添加合计金额计算--多选时默认显示第一条记录所有金额
                        //有预约挂号记录则先显示
                        if(data.REG.length>0){
                            var sum = 0;
                            $scope.sum = sum.toFixed(2);
                            $scope.rFirIndex = 0;//第一层默认展开第一项（预约挂号）
                            var item = data.REG[0];
                            if(item.APPOINT_TYPE=='7'){
                                $scope.type = '0';
                            }
                            else if(item.REGIST_TYPE=='8'){
                                $scope.type = '1';
                            }
                        }
                        //门诊
                        else{
                            if(data.PAY){
                                var sum = 0;
                                $scope.pFirIndex = 0;//第一层默认展开第一项（门诊）
                                $scope.type = '2';
                                //全选时直接显示总金额
                                var pay = data.PAY[0];
                                $scope.isPay = pay.IS_PAY;
                                if(pay.CHOOSE_MODEL == '2'){
                                    var info = pay.PAYMENT_INFO;
                                    for(var i=0;i<info.length;i++){
                                        sum = sum + parseFloat($scope.userPay(info[i]));
                                    }
                                }
                                var num = pay.TOTAL_ROUND;
                                isRoundTip(sum,num);
                                sum = rounding(sum,num);
                                $scope.sum = sum.toFixed(2);
                                $scope.checkAllData = data.PAY[0];//默认选中第一条数据（针对全选）
                            }
                        }
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                } else {
                    $scope.isEmpty = true;
                    $scope.emptyText = prompt;
                    $scope.$broadcast('scroll.refreshComplete');
                }
                initTips();
            }, flag);
        };
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "clinicPayment",
            direction:'both',
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                if(params.from!=="myquyi->MAIN_TAB.medicalGuide" && params.from!=="home->MAIN_TAB")
                {
                    ClinicPaymentService.HOSPITALID_TREE = undefined;
                }
                //从医院首页进入 KYEEAPPC-5128 程铄闵
                if(params.from == "home->MAIN_TAB"){
                    ClinicPaymentService.fromHospitalView = '1';
                }
                else{
                    ClinicPaymentService.fromHospitalView = undefined;
                }
                //页面初始化
                $scope.doRefresh(true);
            }
        });

        //选中门诊缴费某条记录
        $scope.choose = function (paymentDetail,chooseMore,$index,paymentData) {
            var num = paymentData.TOTAL_ROUND;//保留位数
            //多选
            if(chooseMore == '1'){
                if (paymentDetail.checked) {
                    paymentDetail.checked = false;
                    var sum = 0;
                    var info = paymentData.PAYMENT_INFO;
                    for(var i=0;i<info.length;i++){
                        if(info[i].checked){
                            sum = sum + parseFloat($scope.userPay(info[i]));
                        }
                    }
                    //var sum = parseFloat($scope.sum) - parseFloat($scope.userPay(paymentDetail));
                    isRoundTip(sum,num);
                    sum = rounding(sum,num);
                    $scope.sum = sum.toFixed(2);
                } else {
                    paymentDetail.checked = true;
                    //var sum = parseFloat($scope.sum) + parseFloat($scope.userPay(paymentDetail));
                    var sum = 0;
                    var info = paymentData.PAYMENT_INFO;
                    for(var i=0;i<info.length;i++){
                        if(info[i].checked){
                            sum = sum + parseFloat($scope.userPay(info[i]));
                        }
                    }

                    isRoundTip(sum,num);
                    sum = rounding(sum,num);
                    $scope.sum = sum.toFixed(2);
                }
                $scope.checkAllData = paymentData;
                $scope.buttonText(paymentDetail);
            }
            //单选
            else if(chooseMore == '0'){
                if($scope.pSecIndex != $index){
                    $scope.sum = (parseFloat($scope.userPay(paymentDetail))).toFixed(2);
                }
                $scope.pSecIndex = $index;
                var sum = parseFloat($scope.userPay(paymentDetail));
                isRoundTip(sum,num);
                sum = rounding(sum,num);
                $scope.sum = sum.toFixed(2);
                for(var i=0;i<paymentDetail.length;i++){
                    paymentDetail[i].checked = $index==i;
                }
                $scope.checkAllData = paymentData;
                $scope.buttonText(paymentDetail);
            }
        };
        //选中预约挂号某条记录
        $scope.chooseRegister = function(item,$index){
            if($scope.rSecIndex != $index){
                $scope.sum = (parseFloat(item.ACTUAL_AMOUNT)).toFixed(2);
            }
            $scope.rSecIndex = $index;
            $scope.registerData = item;
            if(item.APPOINT_TYPE=='7'){
                $scope.type = '0';
            }
            else if(item.REGIST_TYPE=='8'){
                $scope.type = '1';
            }
        };
        //显示详情
        $scope.showDetail = function (paymentDetail) {
            //弹出对话框
            $scope.payDetail = paymentDetail;
            dialog = KyeeMessageService.dialog({
                template: "modules/business/my_wallet/clinic_payment/views/delay_views/pay_detail.html",
                tapBgToClose:true,//程铄闵 KYEEAPPC-5599 点击周围可关闭
                scope: $scope
            });
        };
        //关闭对话框
        $scope.closeDialog = function () {
            dialog.close();
        };

        //默认医保支付状态
        $scope.payStatus = function (group) {
            if (group.MS_STATUS == '1' && (group.STATUS == '1002' || group.STATUS == '1000' || group.ETL_READ != '1')) {
                //医保支付，并且未划价完成，ETL未回写成功
                return '1';
            } else if (group.MS_STATUS == '1' && group.STATUS == '3000') {
                //医保结算失败
                return '2';
            } else if (group.MS_STATUS == '1' && group.STATUS != '1001') {
                //医保支付，并且已经开始自费或结算
                return '3';
            } else {
                //医保支付可选
                return '0';
            }
        };
        //查询医保支付状态
        $scope.loadPreSettlement = function (serialNo, v_date, p_attr) {
            //获取待缴费数据
            ClinicPaymentService.loadPreSettlement(function (data) {
                //自费结果
                if (data.data.STATUS == '2000') {     //自费失败
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("clinicPayment.payFailTip","缴费失败，请重新缴费！")
                    });
                    //缴费/结算失败，还原为预结算完成状态
                    $scope.backToPre(data.data.TRADE_NO);
                } else if (data.data.STATUS == '2002') {     //自费处理中
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("clinicPayment.mdSelfPayTip","您的医保自费部分正在处理，请稍后查询！")
                    });
                }
                //结算结果
                else if (data.data.STATUS == '3000') {
                    //结算失败
                    if (data.data.PATIENT_PAY_AMOUNT == '0') {
                        //结算失败，且无自费部分
                        if (data.data.ERROR_MSG == '' || data.data.ERROR_MSG == undefined) {
                            KyeeMessageService.broadcast({
                                content:KyeeI18nService.get("clinicPayment.errorMsg","结算失败。")
                            });
                        } else {
                            var errorReason = KyeeI18nService.get("clinicPayment.errorReason","结算失败，失败原因：");
                            KyeeMessageService.broadcast({
                                content: errorReason + data.data.ERROR_MSG
                            });
                        }
                    } else {
                        if (data.data.ERROR_MSG == '' || data.data.ERROR_MSG == undefined) {
                            KyeeMessageService.broadcast({
                                content:KyeeI18nService.get("clinicPayment.errorRefundMsg","结算失败（如果您尚未退费，则不需要支付自费部分金额）。")
                            });
                        } else {
                            var errorRefundReason = KyeeI18nService.get("clinicPayment.errorRefundMsg","结算失败，请再次结算（如果您尚未退费，则不需要支付自费部分金额）。失败原因：");
                            KyeeMessageService.broadcast({
                                content: errorRefundReason + data.data.ERROR_MSG
                            });
                        }
                    }
                    //缴费/结算失败，还原为预结算完成状态
                    $scope.backToPre(data.data.TRADE_NO);
                } else if (data.data.STATUS == '3002' || data.data.STATUS == '6000'
                    || data.data.STATUS == '6001') {
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("clinicPayment.mdProcessing","您的医保结算正在处理，请稍后查询！")
                    });
                } else if (data.data.STATUS == '3001') {     //结算成功
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("clinicPayment.paySuccess","结算成功。")
                    });
                    //刷新数据
                    $scope.doRefresh(true);

                }
            }, serialNo, v_date, p_attr);
        };
        //缴费/结算失败，还原为预结算完成状态
        $scope.backToPre = function (tradeNo) {
            ClinicPaymentService.backToPre(function (data) {
                //刷新数据
                $scope.doRefresh(true);
            }, tradeNo);
        };
        //门诊缴费点击去支付
        $scope.toPayOrder = function () {
            if($scope.isPay!="1"){
                KyeeMessageService.broadcast({
                    content: $scope.isPay
                });
                return;
            }
            var paymentData = $scope.checkAllData;
            if(paymentData==undefined){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("clinicPayment.chooseTip","请选择支付项进行支付！")
                });
                return;
            }
            var index = $scope.pSecIndex;
            var payInfo = paymentData.PAYMENT_INFO;
            if (paymentData.CHOOSE_MODEL == '1') {
                //多选
                var i = 0;
                for (i; i < payInfo.length; i++) {
                    //如果至少选中了一项则跳出循环，不再计数
                    if (payInfo[i].checked) {
                        break;
                    }
                }
                //遍历完成后，没有选中一项
                if (i == payInfo.length) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("clinicPayment.chooseTip","请选择支付项进行支付！")
                    });
                    return;
                }
            } else if (paymentData.CHOOSE_MODEL == '0') {
                //单选
                for(var i=0;i<payInfo.length;i++){
                    if(index==i){
                        payInfo[i].checked = true;///
                    }
                    else{
                        payInfo[i].checked = false;
                    }
                }
                if(index<0){
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("clinicPayment.chooseTip","请选择支付项进行支付！")
                    });
                    return;
                }

            }
            //选择医院
            ClinicPaymentService.hospitalId = paymentData.HOSPITAL_ID;
            if (paymentData.PAYMENT_INFO[0].MS_STATUS == '1') {
                if(paymentData.CHOOSE_MODEL=='0' &&　paymentData.PAYMENT_INFO[index].STATUS>'1001'){
                    $scope.loadPreSettlement(paymentData.PAYMENT_INFO[index].SERIAL_NO, paymentData.PAYMENT_INFO[index].VISIT_DATE, paymentData.PAYMENT_INFO[index].PRESC_ATTR);
                    return ;
                }else if(paymentData.CHOOSE_MODEL=='2' &&　paymentData.PAYMENT_INFO[0].STATUS>'1001'){
                    $scope.loadPreSettlement('',paymentData.PAYMENT_INFO[0].VISIT_DATE);
                    return ;
                }
                if ($scope.green(paymentData, index)) {
                    //医保可以支付，医保支付显示高亮
                    dialog = KyeeMessageService.dialog({
                        template: "modules/business/my_wallet/clinic_payment/views/delay_views/ms_pay_choise.html",
                        scope: $scope,
                        title: KyeeI18nService.get("commonText.msgTitle","消息"),
                        direction:  "|",
                        buttons: [
                            {
                                text: KyeeI18nService.get("clinicPayment.mdPay","医保支付"),
                                style: 'button-size-l',
                                click: function () {
                                    paySubmit(paymentData,'1');
                                    dialog.close();
                                }
                            },
                            {
                                text: KyeeI18nService.get("clinicPayment.selfPay","自费全额支付"),
                                style: 'qy-fff qy-bg-grey5',
                                click: function () {
                                    paySubmit(paymentData,'0');
                                    dialog.close();
                                }
                            }
                        ]
                    });
                } else {
                    //医保不可支付，自费全额支付显示高亮
                    dialog = KyeeMessageService.dialog({
                        template: "modules/business/my_wallet/clinic_payment/views/delay_views/ms_pay_choise.html",
                        scope: $scope,
                        title: KyeeI18nService.get("commonText.msgTitle","消息"),
                        direction:  "|",
                        buttons: [
                            {
                                text: KyeeI18nService.get("clinicPayment.mdPay","医保支付"),
                                style: 'qy-fff qy-bg-grey5',
                                click: function () {
                                    KyeeMessageService.broadcast({
                                        content:KyeeI18nService.get("clinicPayment.mdPayTip","您有订单未划价完成，不能使用医保支付！")
                                    });
                                }
                            },
                            {
                                text: KyeeI18nService.get("clinicPayment.selfPay","自费全额支付"),
                                style: 'button-size-l',
                                click: function () {
                                    paySubmit(paymentData,'0');
                                    dialog.close();
                                }
                            }
                        ]
                    });
                }
            } else {
                paySubmit(paymentData,'0');
            }
        };
        //缴费
        var paySubmit = function (paymentData, IS_MS_PAY) {
            ClinicPaymentService.hospitalId = paymentData.HOSPITAL_ID;
            //获取订单
            ClinicPaymentService.PaymentGetOrder(function (data) {
                //待缴费用路由
                //data.ROUTER = $state.current.name;
                data.ROUTER = 'clinicPaid';//KYEEAPPC-5700 门诊费用支付完成后跳转至已缴费页面 程铄闵
                PayOrderService.payData = data;
                //存入医院ID  By 章剑飞  KYEEAPPTEST-2747
                PayOrderService.payData.hospitalID = data.hospitalID;
                //刷新数据
                $state.go('payOrder');
            }, paymentData, IS_MS_PAY);

        };
        //创建原因：跳转到已缴费用
        $scope.toClinicPaid = function () {
            $state.go('clinicPaid');
        };

        //监听离开C端缴费页面，清除页面的hospitalID
        KyeeListenerRegister.regist({
            focus: "clinicPayment",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if (params.to != 'payOrder') {
                    ClinicPaymentService.hospitalId = undefined;
                }
            }
        });
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "clinicPayment",
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
            if(timer){
                //销毁定时器
                KyeeUtilsService.cancelInterval(timer);
            }
            //if($ionicHistory.backView().stateId=='payOrder'){
            //    $ionicHistory.goBack(-3);
            //}
            ////从网页版支付成功直接返回 程铄闵 KYEEAPPC-5420
            //else if($ionicHistory.backView().stateId=='webPay'){
            //    $ionicHistory.goBack(-4);
            //}
            $ionicHistory.goBack(); //KYEEAPPC-5700 程铄闵 门诊费用支付完成后跳转至已缴费页面
        };
        //显示医保提示
        var setPromptAndColor = function (paymentDetail) {
            if (paymentDetail.MS_STATUS == '1') {
                //此记录支持医保支付
                if (paymentDetail.ETL_READ != '1' || paymentDetail.STATUS == '1000' || paymentDetail.STATUS == '1002') {
                    fontColor = 'red';
                    msPrompt = KyeeI18nService.get("clinicPayment.mdStatus1000","此订单包含医保费用，医保订单正在处理您的医保费用，请您稍候，当医保划价完成后，点击去支付按钮缴纳余款即可。");
                } else if (paymentDetail.STATUS == '1001') {
                    fontColor = 'canPay';
                    msPrompt = KyeeI18nService.get("clinicPayment.mdStatus1001",'医保划价已完成，请您支付余款！');
                } else if (paymentDetail.STATUS == '2000') {
                    fontColor = 'red';
                    msPrompt = KyeeI18nService.get("clinicPayment.payFailTip","缴费失败，请重新缴费！");
                } else if (paymentDetail.STATUS == '2002') {
                    fontColor = 'green';
                    msPrompt = KyeeI18nService.get("clinicPayment.mdSelfPayTip","您的医保自费部分正在处理，请稍后查询！");
                } else if (paymentDetail.STATUS == '3000') {
                    //结算失败
                    if (paymentDetail.PATIENT_PAY_AMOUNT == '0') {
                        //结算失败，且无自费部分
                        if (!paymentDetail.ERROR_MSG) {
                            fontColor = 'red';
                            msPrompt = KyeeI18nService.get("clinicPayment.errorMsg","结算失败。")
                        } else {
                            fontColor = 'red';
                            var errorReason = KyeeI18nService.get("clinicPayment.errorReason","结算失败，失败原因：");
                            msPrompt = errorReason + paymentDetail.ERROR_MSG;
                        }
                    } else {
                        if (!paymentDetail.ERROR_MSG) {
                            fontColor = 'red';
                            msPrompt = KyeeI18nService.get("clinicPayment.errorRefundMsg","结算失败（如果您尚未退费，则不需要支付自费部分金额）。");
                        } else {
                            fontColor = 'red';
                            var errorRefundReason = KyeeI18nService.get("clinicPayment.errorRefundMsg","结算失败，请再次结算（如果您尚未退费，则不需要支付自费部分金额）。失败原因：");
                            msPrompt = errorRefundReason + paymentDetail.ERROR_MSG;
                        }
                    }
                } else if (paymentDetail.STATUS == '3002' || paymentDetail.STATUS == '6000'
                    || paymentDetail.STATUS == '6001') {
                    fontColor = 'green';
                    msPrompt = KyeeI18nService.get("clinicPayment.mdProcessing","您的医保结算正在处理，请稍后查询！");
                } else if (paymentDetail.STATUS == '3001') {
                    fontColor = 'green';
                    msPrompt = KyeeI18nService.get("clinicPayment.paySuccess","结算成功。");
                }
            } else {
                fontColor = '';
                msPrompt = '';
            }
        };
        //决定提示语颜色
        $scope.positivePrompt = function (paymentDetail) {
            setPromptAndColor(paymentDetail);
            if (fontColor == 'red') {
                return false;
            }
            return true;
        };
        //取医保提示语
        $scope.getPrompt = function (paymentDetail) {
            setPromptAndColor(paymentDetail);
            return msPrompt;
        };
        //是否可支付
        $scope.green = function (paymentData, index) {
            if (paymentData.CHOOSE_MODEL == '0') {
                //单选则直接根据该记录设置颜色
                setPromptAndColor(paymentData.PAYMENT_INFO[index]);
                if (!fontColor || fontColor == 'canPay') {
                    return true;
                }
                if(paymentData.PAYMENT_INFO[index].STATUS>'1001'){
                    //查询状态按钮
                    return true;
                }
                return false;
            } else {
                //多选
                var checkedItems = [];
                if(paymentData.CHOOSE_MODEL == '2'){
                    checkedItems = paymentData.PAYMENT_INFO;
                }else{
                    //取出选中的记录
                    for (var i = 0; i < paymentData.PAYMENT_INFO.length; i++) {
                        if (paymentData.PAYMENT_INFO[i].checked) {
                            checkedItems.push(paymentData.PAYMENT_INFO[i]);
                        }
                    }
                }
                //遍历选中的记录
                for (var i = 0; i < checkedItems.length; i++) {
                    //有一项为不可医保支付，则按钮显示为灰色
                    setPromptAndColor(checkedItems[i]);
                    if(paymentData.CHOOSE_MODEL == '2' && fontColor == 'green'){
                        continue;
                    }
                    if (fontColor != 'canPay') {
                        return false;
                    }
                }
                //如果选中项中都可以执行医保支付，则按钮显示为绿色
                if (checkedItems.length != 0 && checkedItems.length == i) {
                    return true;
                }
                return false;
            }
        };
        //计算实付款(自付款)
        $scope.userPay = function (paymentDetail) {
            //医保-单选-已划价
            if(paymentDetail.PATIENT_PAY_AMOUNT && paymentDetail.CHOOSE_MODEL=='0'){
                return parseFloat(paymentDetail.PATIENT_PAY_AMOUNT).toFixed(2);
            }
            else{
                return parseFloat(paymentDetail.ACCOUNT_SUM).toFixed(2);
            }
        };
        //医保缴费
        $scope.medPay = function (paymentDetail) {
            //(医保-单选时)未划价
            if (paymentDetail.ETL_READ != '1' || paymentDetail.STATUS == '1000' || paymentDetail.STATUS == '1002') {
                return '¥ 0.00';
            }
            return ((parseFloat((paymentDetail.ACCOUNT_SUM))-parseFloat(paymentDetail.PATIENT_PAY_AMOUNT))).toFixed(2);
        };

        //定时器
        var setTime = function (timer, remainSeconds) {
            for (var i = 0; i < remainSeconds.length; i++) {
                if (remainSeconds[i] > 0) {
                    remainSeconds[i]--;
                    var minute = Math.floor(remainSeconds[i] / (60));//分钟
                    var second = Math.floor(remainSeconds[i]) % 60;//秒
                    if (second < 10) {
                        second = '0' + second;
                    }
                    $scope.remainTime[i] = minute + ':' + second;
                } else {
                    $scope.remainTime[i] = '00:00';
                    KyeeUtilsService.cancelInterval(timer);
                    $scope.doRefresh(true);

                }
            }
        };
        //点击继续支付,预约后支付
        $scope.goToPay = function () {
            if($scope.rSecIndex<0){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("clinicPayment.chooseTip","请选择支付项进行支付！")
                });
                return;
            }
            var appointDetil = $scope.registerData;
            var toPayPara = {
                hospitalId: appointDetil.HOSPITAL_ID,
                patientId: appointDetil.PATIENT_ID,
                userId: appointDetil.USER_ID,
                cRegId: appointDetil.REG_ID,
                markDesc: appointDetil.MARK_DESC,
                Amount: appointDetil.AMOUNT,
                postData: appointDetil
            };
            ClinicPaymentService.goToPay(function (paydata) {
                PayOrderService.payData = paydata;
                PayOrderService.payData.ROUTER = undefined;//KYEEAPPC-4996 程铄闵 门诊住院和就诊卡充值支付页面提示语
                $state.go("payOrder");
            },toPayPara);
        };
        //挂号后交费
        $scope.goToPayRegist=function(){
            if($scope.rSecIndex<0){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("clinicPayment.chooseTip","请选择支付项进行支付！")
                });
                return;
            }
            var appointDetil = $scope.registerData;
            var toPayPara = {
                HOSPITAL_ID: appointDetil.HOSPITAL_ID,
                C_REG_ID: appointDetil.REG_ID
            };
            ClinicPaymentService.goToPayRegist(function (paydata) {
                PayOrderService.payData = paydata;
                PayOrderService.payData.ROUTER = undefined;//KYEEAPPC-4996 程铄闵 门诊住院和就诊卡充值支付页面提示语
                $state.go("payOrder");
            },toPayPara,appointDetil);
        };
        //按钮文字
        $scope.buttonText = function(paymentDetail){
            //医保
            if(paymentDetail.MS_STATUS == 1){
                //预结算之后的操作
                if(paymentDetail.STATUS>'1001'){
                    if(paymentDetail.STATUS == '3000'){
                        var continuePay = KyeeI18nService.get("clinicPayment.continuePay","继续支付");
                        $scope.buttonColor = 'button_color_red';
                        $scope.buttonT = continuePay;
                    }else{
                        var payStatus = KyeeI18nService.get("clinicPayment.payStatus","查询状态");
                        $scope.buttonColor = 'button_color_green';
                        $scope.buttonT = payStatus;
                    }
                }else{
                    //var status = $scope.green();
                    if(paymentDetail.ETL_READ != '1' || paymentDetail.STATUS == '1000' || paymentDetail.STATUS == '1002'){
                        $scope.buttonColor = 'button_color_grey';//置灰
                    }
                    else{
                        $scope.buttonColor = 'button_color_red';
                    }
                    $scope.buttonT = KyeeI18nService.get("clinicPayment.goPay","去支付");
                }
            }
            else{
                $scope.buttonColor = 'button_color_red';
                $scope.buttonT = KyeeI18nService.get("clinicPayment.goPay","去支付");
            }
        };
        //点击展示详情
        $scope.showInfo = function(flag,payData,index){
            //如果展开按钮隐藏则点击不触发展开事件  KYEEAPPC-5024
            if(flag ==1){
                if(index == $scope.appoint_hidden_index){
                    return;
                }
            }else{
                if(index == $scope.medical_hidden_index){
                    return ;
                }
            }
            $ionicListDelegate.$getByHandle('clinic_paid').closeOptionButtons();
            $scope.medical_hidden_index = -1;
            $ionicListDelegate.$getByHandle('appoint_paid').closeOptionButtons();
            $scope.appoint_hidden_index = -1;
            $scope.rSecIndex = -1;//重置第二层选择（预约挂号）
            $scope.pSecIndex = -1;//重置第二层选择（门诊）
            $scope.roundTip = undefined;
            var sum = 0;
            $scope.sum = sum.toFixed(2);
            //按钮颜色样式
            $scope.buttonT = KyeeI18nService.get("clinicPayment.goPay","去支付");
            $scope.buttonColor = 'button_color_red';
            //flag:1-预约挂号  2-门诊
            $scope.type = flag;//缴费类型
            if(flag=='1'){
                $scope.pFirIndex = -1;//收起门诊
                if ($scope.rFirIndex == index) {
                    $scope.rFirIndex = -1;
                }
                else{
                    $scope.rFirIndex = index;
                }
                $scope.isPay = 1;//重置
            }
            else if(flag=='2'){
                $scope.rFirIndex = -1;//收起预约挂号
                var paymentData = payData;
                $scope.isPay = payData.IS_PAY;//去支付按钮权限 0-未开通；1-开通 KYEEAPPC-4631 程铄闵
                //取消所有选择-多选
                var info = paymentData.PAYMENT_INFO;
                for(var i = 0;i<info.length;i++){
                    paymentData.PAYMENT_INFO[i].checked = false;
                }
                $scope.checkAllData = undefined;
                //取消单选
                $scope.Index = -1;
                //已展开则收起
                if ($scope.pFirIndex == index) {
                    $scope.pFirIndex = -1;
                    $scope.isPay = 1;//重置
                }
                else{
                    //计算合计金额（针对全选）
                    //全选
                    if(paymentData.CHOOSE_MODEL == '2'){
                        var sum = 0;
                        var info = paymentData.PAYMENT_INFO;
                        for(var i=0;i<info.length;i++){
                            sum = sum + parseFloat($scope.userPay(info[i]));
                        }
                        $scope.checkAllData = paymentData;//记录选中数据（针对全选）
                        $scope.roundTip = undefined;//小数位数底部提示
                        var num = payData.TOTAL_ROUND;
                        isRoundTip(sum,num);
                        sum = rounding(sum,num);
                        $scope.sum = sum.toFixed(2);
                    }
                    $scope.pFirIndex = index;
                }
            }
            $ionicScrollDelegate.$getByHandle('clinic_payment_content').resize();
        };
        //是否显示小数位数的底部提示
        var isRoundTip = function(sum,num){
            $scope.roundTip = undefined;
            if(num == 1||num == 0){
                if(sum != rounding(sum,num)){
                    sum = rounding(sum,num);
                    $scope.roundTip = ClinicPaymentService.roundTip;
                }
                else{
                    $scope.roundTip = undefined;
                }
            }
            else{
                $scope.roundTip = undefined;
            }
        };
        //底部支付按钮
        $scope.paySubmitBtn = function(){
            //预约
            if($scope.type=='0'){
                $scope.goToPay();
            }
            //挂号
            else if($scope.type=='1'){
                $scope.goToPayRegist();
            }
            //门诊
            else if($scope.type=='2'){
                $scope.toPayOrder();
            }
        };
        //跳转到切换医院
        $scope.goToHospitalView = function(){
            HospitalSelectorService.isFromClinicPayment = true;
            $state.go('hospital_selector');
        };
        //更改配置
        $scope.goToQueryView = function(){
            $state.go('clinic_payment_query');
        };
        //四舍五入的方法 v-待转换的值 e-位数
        var rounding = function(v,e){
            v = parseFloat(v);
            if(!isNaN(v)){
                var t=1;
                for(;e>0;t*=10,e--);
                for(;e<0;t/=10,e++);
                v= Math.round(v*t)/t;
                return v;
            }
        };
        //跳转到实名认证 程铄闵 KYEEAPPC-4806
        $scope.goToAuthentication = function(){
            var currentCustomPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            AuthenticationService.HOSPITAL_SM = {
                OFTEN_NAME: currentCustomPatient.OFTEN_NAME,
                ID_NO: currentCustomPatient.ID_NO,
                PHONE: currentCustomPatient.PHONE,
                USER_VS_ID: currentCustomPatient.USER_VS_ID,
                FLAG: currentCustomPatient.FLAG
            };
            //认证类型： 0：实名认证，1：实名追述
            AuthenticationService.AUTH_TYPE = 0;
            //0：就诊者，1：用户
            AuthenticationService.AUTH_SOURCE = 0;

            ClinicPaymentService.authFlag = true;

            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: 'modules/business/center/views/authentication/authentication.html'
            });
        };

        //滑动门诊就已记录监听  by  杜巍巍
        $scope.dragAppointData = function(index){
            $ionicListDelegate.$getByHandle('clinic_paid').closeOptionButtons();
            $scope.medical_hidden_index = -1;
            //当删除按钮划开时，隐藏展开按钮
            var medicalItemContentTrans = document.getElementById('appoint_item_'+index).firstChild.style["-webkit-transform"];
            var transLeft = '0px';
            if(medicalItemContentTrans){
                transLeft = medicalItemContentTrans.substring(12,medicalItemContentTrans.indexOf('px'));
                if(parseFloat(transLeft)<=-26){
                    //如果当前项目已经展开，则先收缩当前项
                    if($scope.rFirIndex == index){
                        $scope.rFirIndex = -1;
                    }
                    if($scope.appoint_hidden_index == index){
                        $scope.appoint_hidden_index = -1;
                    }
                    else{
                        $scope.appoint_hidden_index = index;
                    }
                }
                else{
                    $scope.appoint_hidden_index = -1;
                }
            }
            else{
                $scope.appoint_hidden_index = -1;
            }
        };

        //门诊待缴费门诊业务滑动监听  by 杜巍巍
        $scope.dragPhysicalData = function(index){
            $ionicListDelegate.$getByHandle('appoint_paid').closeOptionButtons();
            $scope.appoint_hidden_index = -1;
            //当删除按钮划开时，隐藏展开按钮
            var medicalItemContentTrans = document.getElementById('medical_item_'+index).firstChild.style["-webkit-transform"];
            var transLeft = '0px';
            if(medicalItemContentTrans){
                transLeft = medicalItemContentTrans.substring(12,medicalItemContentTrans.indexOf('px'));
                if(parseFloat(transLeft)<=-26){
                    //如果当前项目已经展开，则先收缩当前项
                    if($scope.pFirIndex == index){
                        $scope.pFirIndex = -1;
                    }
                    if($scope.medical_hidden_index == index){
                        $scope.medical_hidden_index = -1;
                    }
                    else{
                        $scope.medical_hidden_index = index;
                    }
                }
                else{
                    $scope.medical_hidden_index = -1;
                }
            }
            else{
                $scope.medical_hidden_index = -1;
            }
        };
        /**
         * 滑动删除待缴费记录函数  by 杜巍巍
         * @param  index paymentData
         */
        $scope.delete = function ($index,paymentData) {
            ClinicPaymentService.deleteClinicPayment(function(){
                  $scope.allPaymentData.PAY.splice($index, 1);
                  $scope.doRefresh(false);
             },paymentData.REG_ID);
        };
        //点击空白处
        $scope.click = function(){
            $ionicListDelegate.$getByHandle('clinic_paid').closeOptionButtons();
            $scope.medical_hidden_index = -1;
            $ionicListDelegate.$getByHandle('appoint_paid').closeOptionButtons();
            $scope.appoint_hidden_index = -1;
        };

        //关闭底部黑框 程铄闵 KYEEAPPC-5599
        $scope.closeTip = function(){
            $scope.ionScrollHeight=(window.innerHeight-97) +'px';
            $ionicScrollDelegate.$getByHandle('clinic_payment_content').resize();
            $scope.hiddenBar = true;
        };

    })
    .build();