/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月10日14:39:01
 * 创建原因：支付订单控制器
 * 修改者：程铄闵
 * 修改时间：2015年11月10日21:36:27
 * 修改原因：国际化翻译
 * 任务号：KYEEAPPC-3800
 * 修改者：程铄闵
 * 修改时间：2015年11月26日11:33:40
 * 修改原因：待缴费2.1.0优化
 * 任务号：KYEEAPPC-4102
 * 任务号：KYEEAPPC-3800
 * 修改者：杜巍巍
 * 修改时间：2016年3月1日11:33:40
 * 修改原因：零钱支付
 * 任务号：KYEEAPPC-7183
 * 修改者：董茁
 * 修改时间：2016年08月03日16:34:09
 * 修改原因：订单页面门诊附加费用弹框显示
 */

new KyeeModule()
    .group("kyee.quyiyuan.payOrder.controller")
    .require([
        "kyee.quyiyuan.payOrder.service",
        "kyee.quyiyuan.webPay.controller",
        "kyee.quyiyuan.webPay.service",
        "kyee.quyiyuan.appointment.appointment_regist_detil.service",
        //"kyee.quyiyuan.myWallet.inpatientPaymentPayInfo.service",
        "kyee.quyiyuan.payConfirm.controller",
        "kyee.quyiyuan.payConfirm.service"
    ])
    .type("controller")
    .name("PayOrderController")
    .params(["HealthCardService","PatientCardRecordsService","$scope", "$state", "$ionicHistory", "PayOrderService", "KyeeViewService","PerpaidService",
        "CacheServiceBus", "KyeeMessageService", "$interval", "KyeeListenerRegister", "KyeeUtilsService",
        "AppointmentRegistDetilService","RegistConfirmService","KyeeI18nService","$ionicScrollDelegate",
        "WebPayService","PerpaidRecordService","ClinicPaymentReviseService","$sce","$timeout",
        "CardRechargeConfirmService","PurchaseMedinceService","VideoInterrogationService",
        "AppointmentDoctorDetailService"])
    .action(function (HealthCardService,PatientCardRecordsService,$scope, $state, $ionicHistory, PayOrderService, KyeeViewService,PerpaidService,
                      CacheServiceBus, KyeeMessageService, $interval, KyeeListenerRegister, KyeeUtilsService,
                      AppointmentRegistDetilService,RegistConfirmService,KyeeI18nService,$ionicScrollDelegate,
                      WebPayService,PerpaidRecordService,ClinicPaymentReviseService,$sce,$timeout,
                      CardRechargeConfirmService,PurchaseMedinceService,VideoInterrogationService,
                      AppointmentDoctorDetailService) {
        //验证码按钮倒数
        var second = 120;
        //医保验证码按钮倒数
        var mdSecond = 120;
        //电话号码来源
        var phFlag = '';
        //选中支付方式编号
        var payType = '';
        //预交金是否显示下方余额
        $scope.isShowRecharge = false;
        //底部按钮是否可以点击
        $scope.NoClick = false;
        //全局参数
        var memoryCache = CacheServiceBus.getMemoryCache();
        $scope.placeholder = {
            pHMsgCode:KyeeI18nService.get("payOrder.pHMsgCode","请输入验证码"),
            pHMdMsgCode:KyeeI18nService.get("payOrder.pHMdMsgCode","医保短信验证码"),
            pHmdPassword:KyeeI18nService.get("payOrder.pHmdPassword","医保联机交易密码")
        };//KYEEAPPC-3800 国际化翻译 by 程铄闵

        //获取验证码按钮文字
        $scope.validateMsgText = KyeeI18nService.get("payOrder.valMsgText","获取验证码");
        //获取医保验证码按钮文字
        $scope.mdValidateMsgText = KyeeI18nService.get("payOrder.mdValMsgText","获取验证码");
        //默认不选中支付方式
        $scope.radioChecked = -1;
        //默认不显示倒计时
        $scope.showCountdown = false;
        //剩余支付时间
        var remainSeconds = 0;
        //是否显示查看更多支付方式
        $scope.isShowMorePayType = false;
        //是否显示返现标记 KYEEAPPC-6712 hemeng 2016年6月22日20:01:54
        $scope.cashbackExplain = false;
        //是否显示零钱支付
        $scope.isShowSmallPay = undefined;
        $scope.payTypes =[];
        //上页传递的数据
        PayOrderService.hospitalId = PayOrderService.payData?PayOrderService.payData.hospitalID:"";
        //是否是趣医支付订单
        $scope.isQyPayOrder = 1;
        //就诊卡余额数据
        $scope.cardBalanceInfo = {};
        //初始化上页数据
        var initPayData = function(){
            //上页传递的数据
            $scope.payData = PayOrderService.payData;
        };

        //网页版支付返回后当页查询 KYEEAPPC-5741 程铄闵
        KyeeListenerRegister.regist({
            focus: "payOrder",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
                //从支付返回刷新页面
                if($ionicHistory.forwardView()){
                    var lastPage = $ionicHistory.forwardView().stateId;
                    if(lastPage == 'webPay' && WebPayService.isCheck){
                        WebPayService.isCheck = false;
                        PayOrderService.checkResult(WebPayService.hospitalId, WebPayService.pageData, WebPayService.tradeNo, WebPayService.payType,false);
                    }
                }
                //是否网页版
                if(!window.device){//网页版
                    $scope.isWeb = true;
                }
            }
        });
        var timer = undefined;
        //页面离开，销毁定时器
        KyeeListenerRegister.regist({
            focus: "payOrder",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if (timer != undefined) {
                    KyeeUtilsService.cancelInterval(timer);
                }
            }
        });

        //定时器
        var setTime = function (timer, remainSeconds) {
            var hour= Math.floor(remainSeconds / (60*60));//小时
            var minute = Math.floor((remainSeconds/60)%(60));//分钟
            var second = Math.floor(remainSeconds%60);//秒
            var timeShow="";
            if (remainSeconds > 0) {
                if (second < 10) {
                    second = '0' + second;
                }
                if(hour>0){
                    if (minute < 10) {
                        minute = '0' + minute;
                    }
                    timeShow=hour+':'+ minute + ':' + second
                }else{
                    timeShow=minute + ':' + second
                }
                $scope.REMAIN_SECONDS =timeShow;
            } else {
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
                $scope.REMAIN_SECONDS = '00:00';

                //begin 先挂号后支付 By 高玉楼 KYEEAPPC-2677
                //先挂号后支付
                if (PayOrderService.payData.flag == 4) {
                    undoPay();
                } else if(PayOrderService.payData.ROUTER == 'waiting_for_payment_detail' || PayOrderService.payData.ROUTER == 'rush_clinic_record_list_new'){
                    undoPay();
                }
                else {
                    $scope.cancelPayOrder();
                }
                //end 先挂号后支付 By 高玉楼
            }
        };

        //得到附加费用 bydogzhuo
        if(ClinicPaymentReviseService.addInfo){
            $scope.total= parseFloat(ClinicPaymentReviseService.addInfo.total);//判断是否显示问号 大于0 显示问号明细，小于0 不显示明细
        }
        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };
        //点击问号展示订单页面附加费用明细 by dongzhuo
        $scope.showAddChargeInfo = function(){
            $scope.extraCharge = ClinicPaymentReviseService.addInfo;
            var dialog = KyeeMessageService.dialog({
                scope: $scope,
                title:KyeeI18nService.get("patient_card_recharge.messageTitle","加收费用"),
                template: "modules/business/payment/views/extra_charge_popup.html",
                tapBgToClose:true //点击周围可关闭
            });
        };

        //用户在挂号支付时，符合条件则只需支付趣医免过后的费用
        //预约挂号增加减免金额显示 程铄闵 KYEEAPPC-7615
        // var preName = PayOrderService.payData.PREFERENTIAL_NAME;
        var preFee = PayOrderService.payData.PREFERENTIAL_LIST;
        if (PayOrderService.payData.IS_OPEN_BALANCE == 'success' ||(preFee!=undefined&&preFee!='')) {
            $scope.amountuser = true;
        }
        //非预约挂号进入支付订单
        if (PayOrderService.payData.flag == undefined) {
        }
        //判断是否为预约后支付,新增抢号预缴倒计时
        else if (PayOrderService.payData.APPOINT_SUCCESS_PAY == '1') {
            $scope.showCountdown = true;
            if (PayOrderService.payData.REMAIN_SECONDS != undefined) {
                //edit by 新增支付倒计时结束时间  高萌 2017年3月10日12:49:26
                if(PayOrderService.payData.PAY_DEADLINE != undefined && PayOrderService.payData.PAY_DEADLINE != null && PayOrderService.payData.PAY_DEADLINE != ""){
                    var payDeadLine = PayOrderService.payData.PAY_DEADLINE;
                    var now = new Date();
                    var remainSecondsReality = (payDeadLine - now.getTime())/1000;
                    remainSeconds = parseInt(PayOrderService.payData.REMAIN_SECONDS);
                    if(remainSecondsReality < remainSeconds){
                        remainSeconds = remainSecondsReality;
                    }
                }else{
                    remainSeconds = parseInt(PayOrderService.payData.REMAIN_SECONDS);
                }
                //end
                var timer = KyeeUtilsService.interval({
                    time: 1000,
                    action: function () {
                        remainSeconds--;
                        setTime(timer, remainSeconds);
                    }
                });
            }
        } else {
            //超时取消订单
            //KyeeUtilsService.delay({
            //    time:300000,
            //    action:function(){
            //        $scope.cancelPayOrder();
            //    }
            //});
        }
        //获取医院参数--更新底部提示语
        var getParams = function(explain) {
            PayOrderService.loadParams(function (registExplain, prefee, VerifyMsgForFree, phoneFlag) {
                //KYEEAPPC-4996 修改门诊、就诊卡充值、住院预缴、电子订单模块的提示语 程铄闵
                if(PayOrderService.payData){
                    var router = PayOrderService.payData.ROUTER;
                }
                $scope.registExplain = undefined;
                //预交金支付方式 KYEEAPPTEST-3409 程铄闵   KYEEAPPC-6170
                $scope.prefee = prefee;
                //增加新版住院预缴 KYEEAPPC-6601   KYEEAPPC-6603
                if (router == 'clinicPaid'||router == 'recharge_records'||router == 'patient_card_records'||
                    router == 'medicineOrder'||router == 'perpaid_record') {
                    $scope.registExplain = explain;
                    //增加返现提示的标记 KYEEAPPC-6712 hemeng 2016年6月22日20:01:54
                    if(explain!=undefined && explain!=null && explain!='') {
                        $scope.cashbackExplain = true;
                    }
                }
                //原预约挂号提示
                else {
                    /*if (PayOrderService.payData.ROUTER != 'clinicPayment'
                     && PayOrderService.payData.ROUTER != 'wallet_card_recharge') {//APPCOMMERCIALBUG-1195,去掉就诊卡充值时的提示信息
                     //挂号提示
                     $scope.registExplain = registExplain;
                     }*/
                    $scope.registExplain = registExplain;
                    $scope.VerifyMsgForFree = VerifyMsgForFree;
                }
            });
        };
        //绑定支付方式
        PayOrderService.bindPayType(function (callback,changePay,payTypes,explain,isQyPayOrder) {
            if(!callback){
                return;
            }
            $scope.isQyPayOrder = isQyPayOrder;
            //非趣医支付订单
            if(isQyPayOrder == 1){
                payType = payTypes[0].ITEM_VALUE;
                PayOrderService.paySubmit(function(url){
                    $scope.openUrl = $sce.trustAsResourceUrl(url);
                },payType, $scope.msgCode.msgCode, $state);
                return;
            }

            //初始化支付头部数据
            initPayData();

            //此请求回调后调请求医院参数 程铄闵 KYEEAPPC-4605
            getParams(explain);

            //查询到所有支持的支付方式
            $scope.changePay = changePay;//零钱支付金额
            PayOrderService.allPayType = payTypes;

            //初始化若为空报错 程铄闵 KYEEAPPC-5420
            if($scope.payData){
                //预交金方式查余额 程铄闵 KYEEAPPC-7823
                for(var i = 0; i<payTypes.length ; i++){
                    if(payTypes[i].ITEM_VALUE == '3'){
                        var amount = $scope.payData.AMOUNT;
                        if (PayOrderService.payData.IS_OPEN_BALANCE == 'success' ||(preFee!=undefined&&preFee!='')) {
                            amount = $scope.payData.USER_PAY_AMOUNT;
                        }
                        PayOrderService.getCardBalance(amount,$scope.payData.CARD_NO,function(success,data){
                            if(success){
                                $scope.cardBalanceInfo = data;
                            }
                        });
                        break;
                    }
                }
                //是否有免挂号费 by 杜巍巍 KYEEAPPC-5272
                if($scope.payData.isShow == '1'){
                    //免挂号费时，屏蔽其他支付方式只显示免挂号费。不显示零钱支付
                    $scope.payTypes = payTypes;
                    $scope.radioChecked = 0;
                    payType = payTypes[0].ITEM_VALUE;
                    $scope.isShowSmallPay = false;

                }else{
                    //非免挂号费方式
                    //支持零钱支付方式（有零钱&&金额大于待缴金额）
                    if(changePay && parseInt(changePay)>= parseInt($scope.payData.AMOUNT)){
                        $scope.isShowSmallPay = true;
                        //无免挂号费，支持零钱支付，默认支付方式都不选中
                        if(payTypes.length <= 2){
                            $scope.payTypes = payTypes;
                            $scope.isShowMorePayType = false;
                        }else{
                            $scope.isShowMorePayType = true;
                            //无免挂号费，支持零钱支付，并且支付方式大于2种
                            for(var i = 0; i<2 ; i++){
                                $scope.payTypes[i] = payTypes[i];
                            }
                        }
                    }else{
                        //无免挂号费，不支持零钱支付
                        $scope.isShowSmallPay = false;
                        if(payTypes.length <= 2 && payTypes.length > 0){
                            $scope.payTypes = payTypes;
                            if(payTypes.length == 1){
                                //无免挂号费，支持零钱支付，并且支付方式只要一种默认勾选
                                $scope.radioChecked = 0;
                                payType = payTypes[0].ITEM_VALUE;
                            }else{
                                //无免挂号费，不支持零钱支付，并且支付方式等于2种，默认勾选第一条
                                $scope.radioChecked = 0;
                                payType = payTypes[0].ITEM_VALUE;
                            }
                            $scope.isShowMorePayType = false;
                        }
                        //未配置支付方式时拦截（不勾选） 程铄闵 KYEEAPPTEST-3546
                        else if(payTypes.length > 2){
                            //无免挂号费，不支持零钱支付，并且支付方式大于2种，默认勾选第一条
                            for(var i = 0; i<2 ; i++){
                                $scope.payTypes[i] = payTypes[i];
                            }
                            $scope.radioChecked = 0;
                            payType = payTypes[0].ITEM_VALUE;
                            $scope.isShowMorePayType = true;
                        }
                        //若第一条为预交金支付方式则无默认选择 程铄闵 KYEEAPPC-7823
                        if(payTypes[0].ITEM_VALUE == '3'){
                            $scope.radioChecked = -1;
                            payType = '';
                        }
                    }
                }
            }
        });

        //点击查看更多支付方式 by 杜巍巍 KYEEAPPC-5272
        $scope.morePayType = function(){
            $ionicScrollDelegate.$getByHandle('pay_order_content').resize();
            $scope.payTypes = PayOrderService.allPayType;
            $scope.isShowMorePayType = false;
        };
        //默认使用零钱支付不勾选
        $scope.showUseSmallMoney = false;
        //勾选零钱支付
        $scope.useSmallMoney = function () {
            $scope.showUseSmallMoney = !$scope.showUseSmallMoney;
            if($scope.showUseSmallMoney){
                $scope.radioChecked = undefined;
                payType = 20;
            }
            else{
                $scope.radioChecked = -1;//在取消选择时重置标志
            }
        };
        //选择支付方式
        $scope.choosePayType = function (index, pay) {
            $scope.radioChecked = index;
            //预交金方式显示余额 程铄闵 KYEEAPPC-7823
            $scope.isShowRecharge = false;
            $scope.NoClick = false;
            if(pay.ITEM_VALUE==3){
                if($scope.cardBalanceInfo && $scope.cardBalanceInfo.SHOW_REST==1 && !$scope.isShowRecharge){
                    $scope.isShowRecharge = true;
                }
                if($scope.cardBalanceInfo && $scope.cardBalanceInfo.IS_ABLE_PAY == '2'){
                    $scope.NoClick = true;
                }
            }
            $scope.currentPayType = pay.ITEM_NAME;
            payType = pay.ITEM_VALUE;
            //选择了底下的支付方式则不能用零钱支付。
            $scope.showUseSmallMoney = false;
        };
        //用户输入的验证码
        $scope.msgCode = {
            msgCode: '',
            mdMsgCode: '',
            //医保密码
            password: ''
        };

        //支付完成操作
        var finishPay = function(flag){
            var router = PayOrderService.payData.ROUTER;
            if (flag == 'failed') {
                //预约挂号支付失败则取消订单
                $scope.cancelPayOrder();
            } else {
                //支付完成
                var data = PayOrderService.payData;
                if (data.flag == undefined) {
                    //增加新版住院预缴 KYEEAPPC-6601
                    if (router == 'perpaid_record') {
                        PerpaidRecordService.fromPayOrder = true;
                        $state.go(router);
                    } else if(router == 'patient_card_records'){
                        PayOrderService.fromPayOrderNew = true;//强制加标识
                        $state.go(router);
                    }
                    else {
                        //普通支付
                        if(data.ROUTER == 'healthCardPay'){
                            PatientCardRecordsService.isHealthCard = 1;
                            HealthCardService.healthCardPayToRecords = true;
                            PayOrderService.healthCardPayOrder=1;
                            $state.go("patient_card_records");
                        }else{
                            $state.go(router);
                        }
                    }
                } else {
                    //begin 预约挂号成功后，向后台发送支付成功请求 By 高玉楼
                    //发送支付成功请求
                    //    PayOrderService.afterPay();
                    //end   预约挂号成功后，向后台发送支付成功请求 By 高玉楼
                    if (data.ROUTER == 'appointment_regist_list') {
                        //C端预约挂号记录中的预约转挂号
                        $state.go(data.ROUTER);
                    }else if(data.ROUTER == 'rush_clinic_record_list_new'){
                        //抢号管理页面进入支付页面，支付成功后跳转到抢号详情页面
                        $state.go('rush_clinic_detail');
                    }else if(data.ROUTER == 'waiting_for_payment_detail'){
                        //抢号待支付详情页面进入支付页面，支付成功后跳转到抢号详情页面
                        $state.go('rush_clinic_detail');
                    }
                    else if(data.ROUTER == 'waiting_for_payment_detail'){
                        $state.go("rush_clinic_detail");
                    }
                    else if(data.ROUTER == 'purchase_medince'){
                        PurchaseMedinceService.REG_ID = data.C_REG_ID;
                        //购药开单挂号付费完成跳转
                        $state.go("purchase_medince");
                    }
                    else if(data.ROUTER == 'video_interrogation'){
                        VideoInterrogationService.REG_ID = data.C_REG_ID;
                        //购药开单挂号付费完成跳转
                        $state.go("video_interrogation");
                    }else if(data.ROUTER == 'healthCardPay'){
                        //健康卡充值完成跳转
                        PatientCardRecordsService.isHealthCard = 1;
                        HealthCardService.healthCardPayToRecords = true;
                        PayOrderService.healthCardPayOrder=1;
                        $state.go("patient_card_records");
                    }
                    else {
                        if(!$scope.payData){
                            $scope.payData = PayOrderService.payData;
                        }
                        AppointmentRegistDetilService.RECORD = {
                            HOSPITAL_ID: PayOrderService.hospitalId,
                            REG_ID: $scope.payData.REG_ID
                        };
                        AppointmentRegistDetilService.ROUTE_STATE = 'payOrder';
                        //预约挂号支付

                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                        $state.go("appointment_result");

                    }
                }
                //跳转页面之后清除数据
                PayOrderService.payData = undefined;
                ClinicPaymentReviseService.addInfo = undefined;
            }
        };

        //点击支付
        $scope.paySubmit = function () {
            if($scope.NoClick){
                return;
            }
            if (PayOrderService.paymentPrompt && ($scope.payData.PATIENT_PAY_AMOUNT === '' || $scope.payData.PATIENT_PAY_AMOUNT == undefined)) {
                KyeeMessageService.confirm({
                    content: PayOrderService.paymentPrompt,
                    onSelect: function (string) {
                        if (!string) {
                            return;
                        } else {
                            paySubmitSuccess();
                        }
                    }
                });
            }
            else {
                paySubmitSuccess();
            }
        };
        var paySubmitSuccess = function () {
            var data = $scope.payData;
            var router = data.ROUTER;
            //无自费部分医保支付
            if (data.PATIENT_PAY_AMOUNT === 0) {
                if ($scope.msgCode.mdMsgCode == '' || $scope.msgCode.mdMsgCode == undefined) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("payOrder.checkMsgCode","验证码不能为空！")
                    });
                    return;
                } else if ($scope.msgCode.password == '' || $scope.msgCode.password == undefined) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("payOrder.checkPassword","医保交易密码不能为空！")
                    });
                    return;
                } else if (payType == '3') {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("payOrder.checkPayType","医保支付中暂不支持预交金支付，请选择其他支付方式！")
                    });
                    return;
                }
                PayOrderService.mdNoPatientPay(function () {
                    $state.go(router);
                }, $scope.msgCode.mdMsgCode, $scope.msgCode.password, data);

            }
            else if (data.PATIENT_PAY_AMOUNT) {
                //有自费部分医保支付
                if ($scope.msgCode.mdMsgCode == '' || $scope.msgCode.mdMsgCode == undefined) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("payOrder.checkMsgCode","验证码不能为空！")
                    });
                    return;
                } else if ($scope.msgCode.password == '' || $scope.msgCode.password == undefined) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("payOrder.checkPassword","医保交易密码不能为空！")
                    });
                    return;
                } else if ($scope.radioChecked == -1) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("payOrder.checkRadio","请选择支付方式！")
                    });
                    return;
                } else if (payType == '3') {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("payOrder.checkPayType","医保支付中暂不支持预交金支付，请选择其他支付方式！")
                    });
                    return;
                }
                //医保支付创建子订单，即自费支付部分
                PayOrderService.subPayorder(function () {
                    $state.go(router);
                }, $scope.msgCode.mdMsgCode, $scope.msgCode.password, data, payType, $state);
            }
            else {
                if ($scope.radioChecked == -1) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("payOrder.checkRadio","请选择支付方式！")
                    });
                    return;
                }
                PayOrderService.paySubmit(function (flag) {
                    finishPay(flag);
                }, payType, $scope.msgCode.msgCode, $state);
            }
        };
        //返回到上一页
        $scope.goBackToLastPage = function () {
            //begin 先挂号后支付 By 高玉楼 KYEEAPPC-2677
            var data = PayOrderService.payData;

            //非趣医订单页 程铄闵 KYEEAPPC-7176
            if($scope.isQyPayOrder==1){
                //支付成功
                if(window.payOrderResult == 'paySuccess'){
                    finishPay();
                }
                else{
                    //查询支付结果
                    //如果是挂号后支付或预约后支付或预约挂号时不提示取消交易提示
                    if (data.ROUTER == 'appointment_regist_detil'||data.APPOINT_SUCCESS_PAY == 1) {
                        KyeeMessageService.loading({
                            mask: true
                        });
                        $timeout(
                            function(){
                                KyeeMessageService.hideLoading();//取消遮罩
                                PayOrderService.checkOrder(data.hospitalID,function(rec){
                                    //成功
                                    if(rec == 'success'){
                                        finishPay();
                                    }
                                    else{
                                        undoPay();
                                    }
                                });
                            },PayOrderService.delayTime
                        );

                    }
                    else{
                        KyeeMessageService.loading({
                            mask: true
                        });//增加遮罩
                        $timeout(
                            function(){
                                KyeeMessageService.hideLoading();//取消遮罩
                                PayOrderService.checkOrder(data.hospitalID,function(rec){
                                    //成功
                                    if(rec == 'success'){
                                        finishPay();
                                    }
                                    else{
                                        KyeeMessageService.confirm({
                                            content: KyeeI18nService.get("payOrder.goBackConfirm","支付订单已创建，是否取消本次交易？"),
                                            okText:KyeeI18nService.get("commonText.yes","是"),
                                            cancelText:KyeeI18nService.get("commonText.no","否"),
                                            onSelect: function (confirm) {
                                                if (confirm) {
                                                    cancelBack(data);
                                                }
                                            }
                                        });
                                    }
                                });
                            },PayOrderService.delayTime
                        );
                    }
                }
            }
            else{
                //从订单的充值再到订单
                if(PayOrderService.fromRechargeOrder){
                    KyeeMessageService.confirm({
                        content: KyeeI18nService.get("payOrder.goBackConfirm","支付订单已创建，是否取消本次交易？"),
                        okText:KyeeI18nService.get("commonText.yes","是"),
                        cancelText:KyeeI18nService.get("commonText.no","否"),
                        onSelect: function (confirm) {
                            if (confirm) {
                                PayOrderService.cleanOrderNo(function () {
                                    //跳转页面之后替换前一订单数据
                                    PayOrderService.payData = PayOrderService.lastPayData;
                                    $state.go('card_recharge_confirm');
                                });
                            }
                        }
                    });
                    return;
                }
                //如果是挂号后支付或预约后支付或预约挂号时不提示取消交易提示
                if(data.ROUTER == 'waiting_for_payment_detail' || data.ROUTER == 'rush_clinic_record_list_new'){
                    KyeeMessageService.confirm({
                        title:"确认要离开？",
                        content: KyeeI18nService.get("payOrder.goBack","超过支付时效后订单将被取消，请尽快完成支付。"),
                        okText:KyeeI18nService.get("commonText.query","确认离开"),
                        cancelText:KyeeI18nService.get("commonText.going","继续支付"),
                        onSelect: function (confirm) {
                            if (confirm) {
                                $state.go(data.ROUTER);
                            }
                        }
                    });
                } else if (data.ROUTER == 'appointment_regist_detil'||data.APPOINT_SUCCESS_PAY == 1) {
                    undoPay();
                } else {
                    KyeeMessageService.confirm({
                        content: KyeeI18nService.get("payOrder.goBackConfirm","支付订单已创建，是否取消本次交易？"),
                        okText:KyeeI18nService.get("commonText.yes","是"),
                        cancelText:KyeeI18nService.get("commonText.no","否"),
                        onSelect: function (confirm) {
                            if (confirm) {
                                cancelBack(data);
                            }
                        }
                    });
                }
                //end 下挂号后支付 By 高玉楼
            }
        };

        //begin 先挂号后缴费 By 高玉楼
        //放弃支付，直接回退到相应页面
        var undoPay = function () {
            var data = PayOrderService.payData;
            if (data.ROUTER == 'appointment_regist_detil') {
                $state.go('appointment_regist_detil');
            } else if (data.ROUTER == 'appointment_result') {
                $state.go('appointment_regist_detil');
            }  else if (data.ROUTER == 'waiting_for_payment_detail' || data.ROUTER == 'rush_clinic_record_list_new') {
                $state.go(data.ROUTER);
            }
            else if(data.APPOINT_SUCCESS_PAY == 1){
                $ionicHistory.goBack(-1);//预约挂号返回不取消订单
            } else {
                $ionicHistory.goBack(-2);
            }
            //跳转页面之后清除数据
            PayOrderService.payData = undefined;
        };
        //end 先挂号后缴费 By 高玉楼 KYEEAPPC-2677

        //订单返回操作 程铄闵
        var cancelBack = function(data){
            ClinicPaymentReviseService.addInfo = undefined;
            if (data.flag == undefined) {
                //清除数据
                PayOrderService.cleanOrderNo(function () {
                    $ionicHistory.goBack(-1);
                    //跳转页面之后清除数据
                    PayOrderService.payData = undefined;
                });
            } else {
                //取消订单
                $scope.cancelPayOrder();
            }
        };

        //取消订单
        $scope.cancelPayOrder = function () {
            var data = PayOrderService.payData;
            //begin 取消订单合并  By  章剑飞  APPCOMMERCIALBUG-884
            PayOrderService.cancelPayOrder(function () {
                if (data.ROUTER == 'appointment_regist_detil') {
                    $state.go('appointment_regist_detil');
                } else if (data.ROUTER == 'appointment_result') {
                    $state.go('appointment_regist_detil');
                } else if (data.ROUTER == 'rush_clinic_record_list_new' || data.ROUTER == 'waiting_for_payment_detail') {
                    $state.go(data.ROUTER);
                } else if (data.ROUTER == 'purchase_medince' || data.ROUTER == 'video_interrogation') {
                    //购药开单 或 视频问诊过来的页面，返回到医生主页“网络门诊”标签页
                    AppointmentDoctorDetailService.activeTab = 2;
                    $state.go("doctor_info");
                } else{
                    $ionicHistory.goBack(-2);
                }
                //跳转页面之后清除数据
                PayOrderService.payData = undefined;
            });
            //end 取消订单合并  By  章剑飞  APPCOMMERCIALBUG-884

        };
        //获取验证码
        $scope.getValiteCode = function () {
            var setBtnState = function (timer) {
                try {
                    if (second != -1) {
                        var rest = KyeeI18nService.get("payOrder.restText","剩余");
                        var sec = KyeeI18nService.get("payOrder.secText","秒");
                        $scope.validateMsgText =rest + second + sec;
                    } else {
                        $scope.btnDisabled = false;
                        $scope.validateMsgText = KyeeI18nService.get("payOrder.valMsgText","获取验证码");
                        //关闭定时器
                        KyeeUtilsService.cancelInterval(timer);
                    }
                } catch (e) {
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            };
            //获取验证码
            PayOrderService.getValiteCode(function (data) {
                //按钮冻结时间为120秒
                second = 120;
                setBtnState();
                $scope.btnDisabled = true;
                var timer = KyeeUtilsService.interval({
                    time: 1000,
                    action: function () {
                        second--;
                        setBtnState(timer);
                    }
                });
            }, payType);
        };

        //获取医保验证码
        $scope.getMdValiteCode = function () {
            //倒计时
            var setBtnState = function (timer) {
                try {
                    if (mdSecond != -1) {
                        var rest = KyeeI18nService.get("payOrder.restText","剩余");
                        var sec = KyeeI18nService.get("payOrder.secText","秒");
                        $scope.mdValidateMsgText =rest + mdSecond + sec;
                    } else {
                        $scope.mdBtnDisabled = false;
                        $scope.mdValidateMsgText = KyeeI18nService.get("payOrder.valMsgText","获取验证码");
                        //关闭定时器
                        KyeeUtilsService.cancelInterval(timer);
                    }
                } catch (e) {
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            };
            //获取验证码
            PayOrderService.getMdValiteCode(function () {
                //按钮冻结时间为120秒
                mdSecond = 120;
                setBtnState();
                $scope.mdBtnDisabled = true;
                var timer = KyeeUtilsService.interval({
                    time: 1000,
                    action: function () {
                        mdSecond--;
                        setBtnState(timer);
                    }
                });
            }, payType);
        };
        //是否显示验证码栏
        $scope.showMsgBar = function () {
            if (($scope.prefee == '1' && payType == '3')
                || ($scope.VerifyMsgForFree == '1' && payType == '6')) {
                return true;
            }
            return false;
        };
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "payOrder",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBackToLastPage();
            }
        });
        //去充值 程铄闵 KYEEAPPC-7823
        $scope.goRecharge = function(){
            CardRechargeConfirmService.rechargeInfo = {};
            CardRechargeConfirmService.rechargeInfo.HOSPITAL_NAME = $scope.cardBalanceInfo.HOSPITAL_NAME;
            CardRechargeConfirmService.rechargeInfo.rows = [];
            var obj = {
                PATIENT_ID:$scope.cardBalanceInfo.PATIENT_ID,
                PATIENT_NAME:$scope.cardBalanceInfo.PATIENT_NAME,
                TOTAL_AMOUNT:$scope.cardBalanceInfo.REST_AMOUNT,
                ID_NO:$scope.cardBalanceInfo.ID_NO,
                CARD_NO:$scope.cardBalanceInfo.CARD_NO
            };
            CardRechargeConfirmService.rechargeInfo.rows[0] = obj;
            CardRechargeConfirmService.rechargeInfo.STRAIGHT = '1';//默认为直连的情况 // KYEEAPPC-8088 程铄闵 2.3.10充值功能改版
            PayOrderService.fromRechargeOrder = true;
            PayOrderService.lastPayData = PayOrderService.payData;
            $state.go('card_recharge_confirm');
        };

    })
    .build();