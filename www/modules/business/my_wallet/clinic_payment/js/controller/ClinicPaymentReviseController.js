/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016/5/10
 * 创建原因：2.2.20版 门诊待缴费控制层
 * 任务号：KYEEAPPC-6170
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.clinicPaymentRevise.controller")
    .require(["kyee.quyiyuan.myWallet.clinicPaymentRevise.service",
        "kyee.quyiyuan.payOrder.controller",
        "kyee.quyiyuan.payOrder.service",
        "kyee.quyiyuan.myWallet.clinicPaid.controller",
        "ngSanitize",
        "kyee.quyiyuan.myWallet.clinicPaymentQueryController.controller"])
    .type("controller")
    .name("ClinicPaymentReviseController")
    .params(["$scope", "$rootScope", "$state", "$ionicHistory", "ClinicPaymentReviseService", "KyeeMessageService",
        "PayOrderService", "KyeeListenerRegister", "KyeeViewService", "CacheServiceBus", "QueryHisCardService",
        "KyeeUtilsService", "KyeeI18nService", "HospitalSelectorService", "$compile", "$timeout", "$ionicScrollDelegate",
        "AuthenticationService", "$ionicListDelegate","ClinicPaidService","CommPatientDetailService","AppointmentRegistDetilService",
        "PaidRecordService"])
    .action(function ($scope, $rootScope, $state, $ionicHistory, ClinicPaymentReviseService, KyeeMessageService,
                      PayOrderService, KyeeListenerRegister, KyeeViewService, CacheServiceBus, QueryHisCardService,
                      KyeeUtilsService, KyeeI18nService, HospitalSelectorService, $compile, $timeout, $ionicScrollDelegate,
                      AuthenticationService, $ionicListDelegate,ClinicPaidService,CommPatientDetailService,AppointmentRegistDetilService,
                      PaidRecordService) {
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
        //保留小数位数
        var num = 2;

        //详情对话框
        var dialog = undefined;
        //默认正常显示去支付按钮 KYEEAPPC-4631
        $scope.isPay = 1;
        //页面无数据提示
        $scope.emptyText = undefined;//KYEEAPPTEST-3190 程铄闵
        //页面是否无数据
        $scope.isEmpty = true;
        //小数位数底部提示
        $scope.roundTip = undefined;
        //默认开通权限
        $scope.isPermission = true;
        //初始化选中数据
        //$scope.checkAllData = undefined;
        //就医记录上方入口--1
        $scope.fromMedicalGuide = 0;
        //已缴费数据
        $scope.paidData = undefined;
        //是否已缴费数据为空
        $scope.isPaidEmpty = true;
        //初始化选择方式
        $scope.chooseModel = -1;//0-单选；1-多选；2-全选
        // 是否可以切换医院
        $scope.canBeSelect = ($rootScope.ROLE_CODE!="5");
        //是否显示历史数据
        $scope.isShowHisData = true;
        //是否扫描专属二维码进来
        $scope.isNotFromQRCode = true;

     /*  //门诊提示信息 by dongzhuo
        $scope.message = undefined;
        //门诊附加费用 by dongzhuo
        $scope.extraCharge = undefined;*/
        //初始化医院名称
        if(ClinicPaymentReviseService.fromGuideRecordHosName){
            //就医记录的记录跳转来
            $scope.hospitalName = ClinicPaymentReviseService.fromGuideRecordHosName;
            $scope.hospitalLogo = ClinicPaymentReviseService.getHospitalLogo(ClinicPaymentReviseService.HOSPITALID_TREE);
            ClinicPaymentReviseService.fromGuideRecordHosName = undefined;
        }
        else if(ClinicPaymentReviseService.fromRecordHospitalId){
            //小铃铛跳转来
            var data = ClinicPaymentReviseService.getHospitalNameLogo(ClinicPaymentReviseService.HOSPITALID_TREE);
            $scope.hospitalName = data.hospitalName;
            $scope.hospitalLogo = data.logo;
            ClinicPaymentReviseService.unNeedRegister = 'unneed';
            ClinicPaidService.fromMsgHospitalId = ClinicPaymentReviseService.HOSPITALID_TREE;
            ClinicPaidService.fromMsgHospitalName = data.hospitalName;
        }
        else{
            var hospitalInfo = CacheServiceBus.getStorageCache().get('hospitalInfo');
            ClinicPaymentReviseService.HOSPITALID_TREE = hospitalInfo.id;
            $scope.hospitalLogo = ClinicPaymentReviseService.getHospitalLogo(hospitalInfo.id);
            $scope.hospitalName = hospitalInfo.name;
        }

        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "clinic_payment_revise",
            direction: 'both',
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                if (params.from == "myquyi->MAIN_TAB.medicalGuide"){
                    $scope.fromMedicalGuide = 1;//就医记录上方入口--1
                    ClinicPaidService.fromMedicalGuide = 1;//就医记录入口--1
                }
                else{
                    $scope.fromMedicalGuide = 0;
                    ClinicPaidService.fromMedicalGuide = undefined;//就医记录入口--1
                }
                //从医院首页进入 KYEEAPPC-5128 程铄闵
                if (params.from == "home->MAIN_TAB") {
                    ClinicPaymentReviseService.fromHospitalView = '1';
                }
                else {
                    ClinicPaymentReviseService.fromHospitalView = undefined;
                }
                //从扫描专属二维码进入
                if ($ionicHistory.backView().stateName == "qrcode_skip_controller"
                    ||$ionicHistory.backView().stateName == "doctor_patient_relation"
                    ||ClinicPaymentReviseService.useNewPaymentInterface) {
//                    $ionicHistory.backView().stateName = "hospital->MAIN_TAB";
                    $scope.isNotFromQRCode = false;
                }else{
                    $scope.isNotFromQRCode = true;
                }
                $scope.canBeSelect = ($rootScope.ROLE_CODE!="5") && $scope.isNotFromQRCode;
                //页面初始化
                $scope.doRefresh(true);
            }
        });
        //初始化点击事件
        var initClick = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("clinicPayReviseMidTipId"));
                    var element1=angular.element(document.getElementById("clinicPayReviseBgTipId"));
                    element.html($scope.emptyText);
                    element1.html($scope.emptyText);
                    $compile(element.contents())($scope);
                    $compile(element1.contents())($scope);
                },
                1000
            );
        };
        //获取是否开通权限
        var setPermission = function(prompt){
            if(prompt && prompt.indexOf('未开通')>-1){
                $scope.isPermission = false;
            }
            else{
                $scope.isPermission = true;
            }
        };

        //初始化
        var init = function(data,success,prompt){

            if (success) {
                //有数据
                if ((data.REG && data.REG.length > 0)||(data.PAY && data.PAY.length > 0)) {
                    $scope.roundTip = undefined;
                    $scope.isEmpty = false;
                    //预约挂号
                    if (data.REG && data.REG.length > 0) {
                        $scope.isPaidEmpty = true;
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
                        //计算金额
                        var sum = 0;
                        $scope.sum = $scope.convertMoney(sum);
                        var item = data.REG[0];
                        if (item.APPOINT_TYPE == '7') {
                            $scope.type = '0';
                        }
                        else if (item.REGIST_TYPE == '8') {
                            $scope.type = '1';
                        }
                    }
                    //门诊
                    if (data.PAY && data.PAY.length > 0) {
                        //已缴费
                        if(data.PAY[0].MONTH_OF_YEAR){
                            $scope.paidData = data.PAID;
                            $scope.isPaidEmpty = false;
                            setPermission(prompt);//获取未开通标记
                            $scope.emptyText = prompt;
                        }
                        //待缴费
                        else{
                            $scope.chooseModel = data.PAY[0].CHOOSE_MODEL;
                            $scope.isPaidEmpty = true;
                            var sum = 0;
                            $scope.type = '2';
                            //全选时直接显示总金额
                            var pay = data.PAY[0];
                            $scope.isPay = pay.IS_PAY;
                            if (pay.CHOOSE_MODEL == '2') {
                                //默认选中当天数据（针对全选）
                                var date = new Date();
                                date = getFormatDate(date);
                                var rec = pay.PAYMENT_INFO;
                                for (var i = 0; i < rec.length; i++) {
                                    if(date == rec[i].VISIT_DATE){
                                        rec[i].checked = true;
                                        sum = addition(sum,parseFloat(rec[i].ACCOUNT_SUM));
                                    }
                                }
                            }
                            num = pay.TOTAL_ROUND;//保留位数
                            countMultiModel(pay);
                            sum = rounding(sum, num);
                            $scope.sum = $scope.convertMoney(sum);
                        }
                    }
                }
                else{
                    $scope.isEmpty = true;
                    $scope.isPaidEmpty = true;
                    setPermission(prompt);//获取未开通标记
                    $scope.emptyText = prompt;
                }
            }
            else {
                //扫描专属二维码进来如没查询到数据则不显示历史记录
                if(ClinicPaymentReviseService.useNewPaymentInterface){
                    $scope.isShowHisData = false;
                }
                setPermission(prompt);//获取未开通标记
                $scope.isEmpty = true;
                $scope.isPaidEmpty = true;
                $scope.emptyText = prompt;
            }
            initClick();
            $scope.$broadcast('scroll.refreshComplete');
        };

        /**
         * 时间格式化函数
         * @param date
         * @returns {string}
         */
        var getFormatDate=function (date) {
            var year = date.getFullYear();
            var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1)
                : date.getMonth() + 1;
            var day = date.getDate() < 10 ? "0" + date.getDate() : date
                .getDate();
            var dateStr = year + "/" + month + "/" + day;
            return dateStr;
        };

        //刷新
        $scope.doRefresh = function (isInit) {
            $scope.pFirIndex = -1;//第一层展开下标（门诊）
            $scope.rFirIndex = -1;//第一层展开下标（预约挂号）
            $scope.pSecIndex = -1;//第二层展开下标（门诊）
            $scope.rSecIndex = -1;//第二层展开下标（预约挂号）
            $scope.sum = 0;//合计金额
            $scope.sum = $scope.convertMoney($scope.sum);
            $scope.roundTip = undefined;
            //获取待缴费数据
            ClinicPaymentReviseService.loadData(ClinicPaymentReviseService.fromHospitalView, function (data, success, prompt, resultCode) {
                KyeeUtilsService.cancelInterval(timer);
                $scope.allPaymentData = data;
                remainSeconds = [];//KYEEAPPC-4804 修改一直停在当前页面到倒计时结束后页面一直不断刷新问题 程铄闵
                init(data,success,prompt);
            }, isInit,$scope.fromMedicalGuide);
        };

        //多选选中计算金额 KYEEAPPC-8485 程铄闵 金额统一四舍五入
        var countMultiModel = function(paymentData){
            var sum = 0;
            var isShowTip = false;//默认每一项明细总金额和主表总金额都不相等
            var info = paymentData.PAYMENT_INFO;
            for (var i = 0; i < info.length; i++) {
                if (info[i].checked) {
                    sum = addition(sum,parseFloat(info[i].ACCOUNT_SUM));
                    if(info[i].EQUAL_FLAG == 'false'){
                        isShowTip = true;
                    }
                }
            }
            isRoundTip(sum, num,isShowTip);
            sum = rounding(sum, num);
            $scope.sum = $scope.convertMoney(sum);
        };

        //选中门诊缴费某条记录
        $scope.choose = function (paymentDetail, chooseMore, $index, paymentData) {
            $scope.type = 2;
            //清空预约挂号记录
            if($scope.allPaymentData.REG){
                $scope.rSecIndex = -1;
                $scope.registerData = [];
                $scope.sum=0;
            }
            //多选
            if (chooseMore == '1') {
                var rec = paymentData.PAYMENT_INFO;
                var curDate;//已勾选日期
                var selDate = paymentDetail.VISIT_DATE;//将勾选日期
                //已选则取消
                if (paymentDetail.checked) {
                    paymentDetail.checked = false;
                }
                else {
                    for (var i = 0; i < rec.length; i++) {
                        if(rec[i].checked){
                            curDate = rec[i].VISIT_DATE;
                            break;
                        }
                    }
                    //有值且不一致
                    if(curDate && curDate!=selDate){
                        KyeeMessageService.confirm({
                            title: KyeeI18nService.get("commonText.msgTitle", "消息"),
                            content: KyeeI18nService.get("clinic_payment_revise.chooseConfirm", "当前医院不支持跨天缴费，如果继续将取消之前的选择，请确认是否继续？"),
                            onSelect: function (flag) {
                                if (flag) {
                                    for (var i = 0; i < rec.length; i++) {
                                        if(selDate != rec[i].VISIT_DATE){
                                            rec[i].checked = false;
                                        }
                                    }
                                    paymentDetail.checked = true;
                                    countMultiModel(paymentData);
                                }
                            }
                        });
                    }
                    else{
                        paymentDetail.checked = true;
                    }
                }
                countMultiModel(paymentData);
            }
            //单选
            else if (chooseMore == '0') {
                if ($scope.pSecIndex != $index) {
                    $scope.pSecIndex = $index;
                    var sum = parseFloat(paymentDetail.ACCOUNT_SUM);
                    isRoundTip(sum, num,(paymentDetail.EQUAL_FLAG=='false'));
                    sum = rounding(sum, num);
                    $scope.sum = $scope.convertMoney(sum);
                    for (var i = 0; i < paymentDetail.length; i++) {
                        paymentDetail[i].checked = $index == i;
                    }
                }
            }
            //全选
            else if(chooseMore == '2'){
                var rec = paymentData.PAYMENT_INFO;
                var curDate;//已勾选日期
                var selDate = paymentDetail.VISIT_DATE;//将勾选日期
                for (var i = 0; i < rec.length; i++) {
                    if(rec[i].checked){
                        curDate = rec[i].VISIT_DATE;
                        break;
                    }
                }
                //有值且不一致
                if(curDate && curDate!=selDate){
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get("commonText.msgTitle", "消息"),
                        content: KyeeI18nService.get("clinic_payment_revise.chooseConfirm", "当前医院不支持跨天缴费，如果继续将取消之前的选择，请确认是否继续？"),
                        onSelect: function (flag) {
                            if (flag) {
                                for (var i = 0; i < rec.length; i++) {
                                    if(selDate == rec[i].VISIT_DATE){
                                        rec[i].checked = true;
                                    }
                                    else{
                                        rec[i].checked = false;
                                    }
                                }
                                countMultiModel(paymentData);
                            }
                        }
                    });
                }
                else{
                    //有值且一致
                    if(curDate && curDate==selDate){
                        for (var i = 0; i < rec.length; i++) {
                            if(selDate == rec[i].VISIT_DATE){
                                rec[i].checked = false;
                            }
                        }
                    }
                    //无值
                    else{
                        for (var i = 0; i < rec.length; i++) {
                            if(selDate == rec[i].VISIT_DATE){
                                rec[i].checked = true;
                            }
                        }
                    }
                }
                countMultiModel(paymentData);
            }
        };
        //选中预约挂号某条记录
        $scope.chooseRegister = function (item, $index) {
            //清空门诊选中记录
            if($scope.chooseModel==0||$scope.chooseModel==1||$scope.chooseModel==2){
                $scope.pSecIndex = -1;
                var paymentDetail = $scope.allPaymentData.PAY[0].PAYMENT_INFO;
                for (var i = 0; i < paymentDetail.length; i++) {
                    paymentDetail[i].checked = false;
                }
                //$scope.checkAllData = [];
                $scope.sum = 0;
            }
            if ($scope.rSecIndex != $index) {
                $scope.sum = $scope.convertMoney(parseFloat(item.ACTUAL_AMOUNT));
            }
            $scope.rSecIndex = $index;
            $scope.registerData = item;
            if (item.APPOINT_TYPE == '7') {
                $scope.type = '0';
            }
            else if (item.REGIST_TYPE == '8') {
                $scope.type = '1';
            }
        };
        //显示预约挂号详情
        $scope.showRegisterDetail = function (index) {
            $scope.pFirIndex = -1;
            if($scope.rFirIndex == index){
                $scope.rFirIndex = -1;
            }
            else{
                $scope.rFirIndex = index;
            }
            $ionicScrollDelegate.$getByHandle('clinic_payment_revise_content').resize();
        };
        //显示门诊详情
        $scope.showDetail = function (index) {
            $scope.rFirIndex = -1;
            if($scope.pFirIndex == index){
                $scope.pFirIndex = -1;
            }
            else{
                $scope.pFirIndex = index;
            }
            $ionicScrollDelegate.$getByHandle('clinic_payment_revise_content').resize();
        };
        //转换金额 KYEEAPPC-8485 程铄闵 金额统一四舍五入
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = rounding(v,2);
                return data.toFixed(2);
            }
        };

        //获取选中的REC_MASTER_ID
        var getRecMasterId = function(payInfo){
            var checkArr = '';
            for(var i=0;i<payInfo.length;i++){
                if(payInfo[i].checked){
                    checkArr += (payInfo[i].REC_MASTER_ID+',');
                }
            }
            var recMasterId =  checkArr.substr(0,checkArr.length-1);//截掉最后一个逗号
            return recMasterId;
        };

        //门诊缴费点击去支付
        $scope.toPayOrder = function () {
            if ($scope.isPay != "1") {
                //KyeeMessageService.broadcast({
                //    content: $scope.isPay
                //});
                return;
            }
            var paymentData = $scope.allPaymentData.PAY[0];
            var index = $scope.pSecIndex;
            var payInfo = paymentData.PAYMENT_INFO;
            if (paymentData.CHOOSE_MODEL == '1'||paymentData.CHOOSE_MODEL == '2') {
                //多选+全选
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
                        content: KyeeI18nService.get("clinic_payment_revise.chooseTip", "请选择支付项进行支付！")
                    });
                    return;
                }
            }
            else if (paymentData.CHOOSE_MODEL == '0') {
                //单选
                for (var i = 0; i < payInfo.length; i++) {
                    if (index == i) {
                        payInfo[i].checked = true;//
                    }
                    else {
                        payInfo[i].checked = false;
                    }
                }
                if (index < 0) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("clinic_payment_revise.chooseTip", "请选择支付项进行支付！")
                    });
                    return;
                }
            }
            else{
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("clinic_payment_revise.chooseTip", "请选择支付项进行支付！")
                });
                return;
            }
            //选择医院
            ClinicPaymentReviseService.hospitalId = paymentData.HOSPITAL_ID;
            if (paymentData.PAYMENT_INFO[0].MS_STATUS == '1') {
                if (paymentData.CHOOSE_MODEL == '0' && paymentData.PAYMENT_INFO[index].STATUS > '1001') {
                    $scope.loadPreSettlement(paymentData.PAYMENT_INFO[index].SERIAL_NO, paymentData.PAYMENT_INFO[index].VISIT_DATE, paymentData.PAYMENT_INFO[index].PRESC_ATTR);
                    return;
                } else if (paymentData.CHOOSE_MODEL == '2' && paymentData.PAYMENT_INFO[0].STATUS > '1001') {
                    $scope.loadPreSettlement('', paymentData.PAYMENT_INFO[0].VISIT_DATE);
                    return;
                }
                if ($scope.green(paymentData, index)) {
                    //医保可以支付，医保支付显示高亮
                    dialog = KyeeMessageService.dialog({
                        template: "modules/business/my_wallet/clinic_payment/views/delay_views/ms_pay_choise.html",
                        scope: $scope,
                        title: KyeeI18nService.get("commonText.msgTitle", "消息"),
                        direction: "|",
                        buttons: [
                            {
                                text: KyeeI18nService.get("clinic_payment_revise.mdPay", "医保支付"),
                                style: 'button-size-l',
                                click: function () {
                                    paySubmit(paymentData, '1');
                                    dialog.close();
                                }
                            },
                            {
                                text: KyeeI18nService.get("clinic_payment_revise.selfPay", "自费全额支付"),
                                style: 'qy-fff qy-bg-grey5',
                                click: function () {
                                    paySubmit(paymentData, '0');
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
                        title: KyeeI18nService.get("commonText.msgTitle", "消息"),
                        direction: "|",
                        buttons: [
                            {
                                text: KyeeI18nService.get("clinic_payment_revise.mdPay", "医保支付"),
                                style: 'qy-fff qy-bg-grey5',
                                click: function () {
                                    KyeeMessageService.broadcast({
                                        content: KyeeI18nService.get("clinic_payment_revise.mdPayTip", "您有订单未划价完成，不能使用医保支付！")
                                    });
                                }
                            },
                            {
                                text: KyeeI18nService.get("clinic_payment_revise.selfPay", "自费全额支付"),
                                style: 'button-size-l',
                                click: function () {
                                    paySubmit(paymentData, '0');
                                    dialog.close();
                                }
                            }
                        ]
                    });
                }
            }
            else {
                /*
                 * 产品名称：quyiyuan
                 * 创建人: 董茁
                 * 创建日期:2016年8月01日09:09:17
                 * 创建原因：门诊费用附加费用展示
                 * 任务号：KYEEAPPC-7182
                 */

                var ADD_KEY = '';
                var masterId = getRecMasterId(payInfo);//获取masterId
                ClinicPaymentReviseService.getExtraCharge(function(result) {
                    var data = result.data;
                    //对附加费用做特殊处理
                    var extraCharge = JSON.parse(result.data.ADD_INFO);
                    if(data.ADD_KEY && extraCharge.total !='0' ){
                        ADD_KEY=ADD_KEY+data.ADD_KEY;
                    }
                    $scope.messgae = data;// {ADD_INFO: "{"total":"0","rows":[{},{}]}", ALERT_MSG: "所选缴费信息会产生以下加收费费用：", IS_CONTINUE: "是否继续？"}
                    $scope.extraCharge = extraCharge;//  {total: "0", rows: Array[0]}  把数据放到作用域  以便view显示数据
                    if (result.success && parseFloat(extraCharge.total)  > 0 ) {//判断是否有门诊附加费用
                        //获取附加费用
                        var dialog = KyeeMessageService.dialog({
                            scope: $scope,
                            template: "modules/business/my_wallet/clinic_payment/views/delay_views/extra_clinic_charge.html",
                            buttons: [
                                {
                                    text: KyeeI18nService.get("clinic_payment_revise.cancel", "取消"),
                                    style: 'button-block button-size-l button-size-ll',
                                    click: function () {
                                        dialog.close();
                                        return;
                                    }
                                },
                                {
                                    text: KyeeI18nService.get("clinic_payment_revise.ok", "确定"),
                                    style: 'qy-fff qy-bg-green button-block button-size-l ',
                                    click: function () {
                                        ClinicPaymentReviseService.addInfo = extraCharge;//在下一个页面要使用的数据
                                        paySubmit(paymentData, '0',ADD_KEY);
                                        dialog.close();
                                    }
                                }
                            ]
                        });
                    } //否则直接到订单页面
                    else {
                        paySubmit(paymentData, '0',ADD_KEY);
                    }
                },masterId);
            }
        };

        //缴费
        var paySubmit = function (paymentData, IS_MS_PAY,ADD_KEY) {

            ClinicPaymentReviseService.hospitalId = paymentData.HOSPITAL_ID;
            //获取订单
            ClinicPaymentReviseService.PaymentGetOrder(function (data) {
                //待缴费用路由
                //data.ROUTER = $state.current.name;
                data.ROUTER = 'clinicPaid';//KYEEAPPC-5700 门诊费用支付完成后跳转至已缴费页面 程铄闵
                PayOrderService.payData = data;
                //存入医院ID  By 章剑飞  KYEEAPPTEST-2747
                PayOrderService.payData.hospitalID = data.hospitalID;
                //刷新数据
                $state.go('payOrder');
            }, paymentData, IS_MS_PAY,ADD_KEY);

        };

        //监听离开C端缴费页面，清除页面的hospitalID
        KyeeListenerRegister.regist({
            focus: "clinic_payment_revise",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if (params.to != 'payOrder') {
                    ClinicPaymentReviseService.hospitalId = undefined;
                }
                if (params.to == 'qrcode_skip_controller') {
                    $state.go('home->MAIN_TAB');
                }
            }
        });
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "clinic_payment_revise",
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
            ClinicPaymentReviseService.useNewPaymentInterface = false;
            if (timer) {
                //销毁定时器
                KyeeUtilsService.cancelInterval(timer);
            }
            ClinicPaymentReviseService.unNeedRegister = undefined;
            ClinicPaymentReviseService.fromRecordHospitalId = undefined;
            ClinicPaidService.fromMsgHospitalId = undefined;//清除小铃铛/小信封进已缴费的医院标记，防影响医院首页已缴费
            if(ClinicPaymentReviseService.lastRootState == "appointment_result" || ClinicPaymentReviseService.lastRootState == "appointment_regist_detil"){
                ClinicPaymentReviseService.lastRootState = undefined;
                $state.go('myquyi->MAIN_TAB.medicalGuide');
            }
            else if ($ionicHistory.backView().stateName == "qrcode_skip_controller"
                ||$ionicHistory.backView().stateName == "doctor_patient_relation"
                ||$ionicHistory.backView().stateName == "login"
            ){
                $state.go('home->MAIN_TAB');
            }else{
                $ionicHistory.goBack(); //KYEEAPPC-5700 程铄闵 门诊费用支付完成后跳转至已缴费页面
            }
        };

        //是否可支付
        $scope.green = function (paymentData, index) {
            if (paymentData.CHOOSE_MODEL == '0') {
                //单选则直接根据该记录设置颜色
                setPromptAndColor(paymentData.PAYMENT_INFO[index]);
                if (!fontColor || fontColor == 'canPay') {
                    return true;
                }
                if (paymentData.PAYMENT_INFO[index].STATUS > '1001') {
                    //查询状态按钮
                    return true;
                }
                return false;
            } else {
                //多选
                var checkedItems = [];
                if (paymentData.CHOOSE_MODEL == '2') {
                    checkedItems = paymentData.PAYMENT_INFO;
                } else {
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
                    if (paymentData.CHOOSE_MODEL == '2' && fontColor == 'green') {
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
            if ($scope.rSecIndex < 0) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("clinic_payment_revise.chooseTip", "请选择支付项进行支付！")
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
                CARD_NO: appointDetil.CARD_NO,
                postData: appointDetil
            };//增加卡号 程铄闵 KYEEAPPC-7823
            ClinicPaymentReviseService.goToPay(function (paydata) {
                PayOrderService.payData = paydata;
                PayOrderService.payData.ROUTER = undefined;//KYEEAPPC-4996 程铄闵 门诊住院和就诊卡充值支付页面提示语
                $state.go("payOrder");
            }, toPayPara);
        };
        //挂号后交费
        $scope.goToPayRegist = function () {
            if ($scope.rSecIndex < 0) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("clinic_payment_revise.chooseTip", "请选择支付项进行支付！")
                });
                return;
            }
            var appointDetil = $scope.registerData;
            var toPayPara = {
                HOSPITAL_ID: appointDetil.HOSPITAL_ID,
                C_REG_ID: appointDetil.REG_ID,
                CARD_NO:appointDetil.CARD_NO
            };
            ClinicPaymentReviseService.goToPayRegist(function (paydata) {
                PayOrderService.payData = paydata;
                PayOrderService.payData.ROUTER = undefined;//KYEEAPPC-4996 程铄闵 门诊住院和就诊卡充值支付页面提示语
                $state.go("payOrder");
            }, toPayPara, appointDetil);
        };

        //是否显示小数位数的底部提示 KYEEAPPC-8485 程铄闵 金额统一四舍五入
        var isRoundTip = function (sum, num, isShowTip) {
            //isEqual 明细总金额与主记录是否一致
            $scope.roundTip = undefined;
            if (sum != rounding(sum, num) || isShowTip==true) {
                $scope.roundTip = ClinicPaymentReviseService.roundTip;
            }
        };
        //底部支付按钮
        $scope.paySubmitBtn = function () {
            //预约
            if ($scope.type == '0') {
                $scope.goToPay();
            }
            //挂号
            else if ($scope.type == '1') {
                $scope.goToPayRegist();
            }
            //门诊
            else if ($scope.type == '2') {
                $scope.toPayOrder();
            }
        };
        //跳转到切换医院
        $scope.goToHospitalView = function () {
            HospitalSelectorService.isFromClinicPaymentRevise = true;
            $state.go('hospital_selector');
        };
        //修改查询条件
        $scope.goToQueryView = function () {
            $state.go('clinic_payment_query');
        };
        //补充查询条件
        $scope.goPatientDetail = function () {
            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var current = angular.copy(currentPatient);//可直接操作缓存问题   By  张家豪  KYEEAPPTEST-3068
            CommPatientDetailService.editPatient(current);
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

        //相加计算
        var addition = function(a,b){
            return (a*1000 + b*1000)/1000;
        };

        //跳转到实名认证 程铄闵 KYEEAPPC-4806
        $scope.goToAuthentication = function () {
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

            ClinicPaymentReviseService.authFlag = true;

            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: 'modules/business/center/views/authentication/authentication.html'
            });
        };
        //计算实付款(自付款) 已废弃
        $scope.userPay = function (paymentDetail) {
            //医保-单选-已划价
            if (paymentDetail.PATIENT_PAY_AMOUNT && paymentDetail.CHOOSE_MODEL == '0') {
                return $scope.convertMoney(parseFloat(paymentDetail.PATIENT_PAY_AMOUNT));
            }
            else {
                return $scope.convertMoney(parseFloat(paymentDetail.ACCOUNT_SUM));
            }
        };
        //删除
        $scope.deleteRecord = function ($index, payItem) {
            //全选
            if($scope.chooseModel==2){
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get("commonText.msgTitle", "消息"),
                    content: KyeeI18nService.get("clinic_payment_revise.deleteConfirmAll", "当前医院不支持单笔缴费，请确认删除全天待缴费记录？"),
                    onSelect: function (flag) {
                        if (flag) {
                            $scope.pFirIndex = -1;
                            $scope.rFirIndex = -1;
                            var id = '';
                            var startIndex = -1;//删除的第一个数据下标
                            var num = 0;//删除个数
                            var selDate = payItem.VISIT_DATE;//选中日期
                            var rec = $scope.allPaymentData.PAY[0].PAYMENT_INFO;
                            for (var i = 0; i < rec.length; i++) {
                                if(selDate == rec[i].VISIT_DATE){
                                    if(startIndex<0){
                                        startIndex = i;
                                    }
                                    id = id + rec[i].REC_MASTER_ID+',';
                                    num++;
                                }
                            }
                            id = id.substring(0,id.length-1);
                            ClinicPaymentReviseService.deleteClinicPayment(function () {
                                $scope.allPaymentData.PAY[0].PAYMENT_INFO.splice(startIndex,num);
                                $scope.doRefresh(false);
                            }, id);
                            $ionicScrollDelegate.scrollTop();
                        }
                    }
                });
            }
            else{
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get("commonText.msgTitle", "消息"),
                    content: KyeeI18nService.get("clinic_payment_revise.deleteConfirm", "确认删除已选择待缴费记录？"),
                    onSelect: function (flag) {
                        if (flag) {
                            $scope.pFirIndex = -1;
                            $scope.rFirIndex = -1;
                            ClinicPaymentReviseService.deleteClinicPayment(function () {
                                $scope.allPaymentData.PAY[0].PAYMENT_INFO.splice($index, 1);
                                $scope.doRefresh(false);
                            }, payItem.REC_MASTER_ID);
                            $ionicScrollDelegate.scrollTop();
                        }
                    }
                });
            }
        };

        /*已废弃方法*/
        //显示医保提示
        var setPromptAndColor = function (paymentDetail) {
            if (paymentDetail.MS_STATUS == '1') {
                //此记录支持医保支付
                if (paymentDetail.ETL_READ != '1' || paymentDetail.STATUS == '1000' || paymentDetail.STATUS == '1002') {
                    fontColor = 'red';
                    msPrompt = KyeeI18nService.get("clinic_payment_revise.mdStatus1000", "此订单包含医保费用，医保订单正在处理您的医保费用，请您稍候，当医保划价完成后，点击去支付按钮缴纳余款即可。");
                } else if (paymentDetail.STATUS == '1001') {
                    fontColor = 'canPay';
                    msPrompt = KyeeI18nService.get("clinic_payment_revise.mdStatus1001", '医保划价已完成，请您支付余款！');
                } else if (paymentDetail.STATUS == '2000') {
                    fontColor = 'red';
                    msPrompt = KyeeI18nService.get("clinic_payment_revise.payFailTip", "缴费失败，请重新缴费！");
                } else if (paymentDetail.STATUS == '2002') {
                    fontColor = 'green';
                    msPrompt = KyeeI18nService.get("clinic_payment_revise.mdSelfPayTip", "您的医保自费部分正在处理，请稍后查询！");
                } else if (paymentDetail.STATUS == '3000') {
                    //结算失败
                    if (paymentDetail.PATIENT_PAY_AMOUNT == '0') {
                        //结算失败，且无自费部分
                        if (!paymentDetail.ERROR_MSG) {
                            fontColor = 'red';
                            msPrompt = KyeeI18nService.get("clinic_payment_revise.errorMsg", "结算失败。")
                        } else {
                            fontColor = 'red';
                            var errorReason = KyeeI18nService.get("clinic_payment_revise.errorReason", "结算失败，失败原因：");
                            msPrompt = errorReason + paymentDetail.ERROR_MSG;
                        }
                    } else {
                        if (!paymentDetail.ERROR_MSG) {
                            fontColor = 'red';
                            msPrompt = KyeeI18nService.get("clinic_payment_revise.errorRefundMsg", "结算失败（如果您尚未退费，则不需要支付自费部分金额）。");
                        } else {
                            fontColor = 'red';
                            var errorRefundReason = KyeeI18nService.get("clinic_payment_revise.errorRefundMsg", "结算失败，请再次结算（如果您尚未退费，则不需要支付自费部分金额）。失败原因：");
                            msPrompt = errorRefundReason + paymentDetail.ERROR_MSG;
                        }
                    }
                } else if (paymentDetail.STATUS == '3002' || paymentDetail.STATUS == '6000'
                    || paymentDetail.STATUS == '6001') {
                    fontColor = 'green';
                    msPrompt = KyeeI18nService.get("clinic_payment_revise.mdProcessing", "您的医保结算正在处理，请稍后查询！");
                } else if (paymentDetail.STATUS == '3001') {
                    fontColor = 'green';
                    msPrompt = KyeeI18nService.get("clinic_payment_revise.paySuccess", "结算成功。");
                }
            } else {
                fontColor = '';
                msPrompt = '';
            }
        };
        //查询医保支付状态
        $scope.loadPreSettlement = function (serialNo, v_date, p_attr) {
            //获取待缴费数据
            ClinicPaymentReviseService.loadPreSettlement(function (data) {
                //自费结果
                if (data.data.STATUS == '2000') {     //自费失败
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("clinic_payment_revise.payFailTip", "缴费失败，请重新缴费！")
                    });
                    //缴费/结算失败，还原为预结算完成状态
                    $scope.backToPre(data.data.TRADE_NO);
                } else if (data.data.STATUS == '2002') {     //自费处理中
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("clinic_payment_revise.mdSelfPayTip", "您的医保自费部分正在处理，请稍后查询！")
                    });
                }
                //结算结果
                else if (data.data.STATUS == '3000') {
                    //结算失败
                    if (data.data.PATIENT_PAY_AMOUNT == '0') {
                        //结算失败，且无自费部分
                        if (data.data.ERROR_MSG == '' || data.data.ERROR_MSG == undefined) {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("clinic_payment_revise.errorMsg", "结算失败。")
                            });
                        } else {
                            var errorReason = KyeeI18nService.get("clinic_payment_revise.errorReason", "结算失败，失败原因：");
                            KyeeMessageService.broadcast({
                                content: errorReason + data.data.ERROR_MSG
                            });
                        }
                    } else {
                        if (data.data.ERROR_MSG == '' || data.data.ERROR_MSG == undefined) {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("clinic_payment_revise.errorRefundMsg", "结算失败（如果您尚未退费，则不需要支付自费部分金额）。")
                            });
                        } else {
                            var errorRefundReason = KyeeI18nService.get("clinic_payment_revise.errorRefundMsg", "结算失败，请再次结算（如果您尚未退费，则不需要支付自费部分金额）。失败原因：");
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
                        content: KyeeI18nService.get("clinic_payment_revise.mdProcessing", "您的医保结算正在处理，请稍后查询！")
                    });
                } else if (data.data.STATUS == '3001') {     //结算成功
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("clinic_payment_revise.paySuccess", "结算成功。")
                    });
                    //刷新数据
                    $scope.doRefresh(true);

                }
            }, serialNo, v_date, p_attr);
        };
        //缴费/结算失败，还原为预结算完成状态
        $scope.backToPre = function (tradeNo) {
            ClinicPaymentReviseService.backToPre(function (data) {
                //刷新数据
                $scope.doRefresh(true);
            }, tradeNo);
        };
        //医保缴费
        $scope.medPay = function (paymentDetail) {
            //(医保-单选时)未划价
            if (paymentDetail.ETL_READ != '1' || paymentDetail.STATUS == '1000' || paymentDetail.STATUS == '1002') {
                return '¥ 0.00';
            }
            return ((parseFloat((paymentDetail.ACCOUNT_SUM)) - parseFloat(paymentDetail.PATIENT_PAY_AMOUNT))).toFixed(2);
        };
        //按钮文字
        $scope.buttonText = function (paymentDetail) {
            //医保
            if (paymentDetail.MS_STATUS == 1) {
                //预结算之后的操作
                if (paymentDetail.STATUS > '1001') {
                    if (paymentDetail.STATUS == '3000') {
                        var continuePay = KyeeI18nService.get("clinic_payment_revise.continuePay", "继续支付");
                        $scope.buttonColor = 'button_color_red';
                        $scope.buttonT = continuePay;
                    } else {
                        var payStatus = KyeeI18nService.get("clinic_payment_revise.payStatus", "查询状态");
                        $scope.buttonColor = 'button_color_green';
                        $scope.buttonT = payStatus;
                    }
                } else {
                    //var status = $scope.green();
                    if (paymentDetail.ETL_READ != '1' || paymentDetail.STATUS == '1000' || paymentDetail.STATUS == '1002') {
                        $scope.buttonColor = 'button_color_grey';//置灰
                    }
                    else {
                        $scope.buttonColor = 'button_color_red';
                    }
                    $scope.buttonT = KyeeI18nService.get("clinic_payment_revise.goPay", "结 算");
                }
            }
            else {
                $scope.buttonColor = 'button_color_red';
                $scope.buttonT = KyeeI18nService.get("clinic_payment_revise.goPay", "结 算");
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

        //门诊待缴费门诊业务滑动监听  by 杜巍巍 已废弃
        $scope.dragPhysicalData = function (index) {
            $ionicListDelegate.$getByHandle('appoint_paid').closeOptionButtons();
            $scope.appoint_hidden_index = -1;
            //当删除按钮划开时，隐藏展开按钮
            var medicalItemContentTrans = document.getElementById('medical_item_' + index).firstChild.style["-webkit-transform"];
            var transLeft = '0px';
            if (medicalItemContentTrans) {
                transLeft = medicalItemContentTrans.substring(12, medicalItemContentTrans.indexOf('px'));
                if (parseFloat(transLeft) <= -26) {
                    //如果当前项目已经展开，则先收缩当前项
                    if ($scope.pFirIndex == index) {
                        $scope.pFirIndex = -1;
                    }
                    if ($scope.medical_hidden_index == index) {
                        $scope.medical_hidden_index = -1;
                    }
                    else {
                        $scope.medical_hidden_index = index;
                    }
                }
                else {
                    $scope.medical_hidden_index = -1;
                }
            }
            else {
                $scope.medical_hidden_index = -1;
            }
        };
        /**
         * 滑动删除待缴费记录函数  by 杜巍巍 已废弃
         * @param  index paymentData
         */
        $scope.delete = function ($index, payItem) {
            ClinicPaymentReviseService.deleteClinicPayment(function () {
                $scope.allPaymentData.PAY[0].PAYMENT_INFO.splice($index, 1);
                $scope.doRefresh(false);
            }, payItem.REC_MASTER_ID);
        };

        //关闭底部黑框 程铄闵 KYEEAPPC-5599 已废弃
        $scope.closeTip = function () {
            $scope.ionScrollHeight = (window.innerHeight - 97) + 'px';
            $ionicScrollDelegate.$getByHandle('clinic_payment_content').resize();
            $scope.hiddenBar = true;
        };


        //创建原因：跳转到已缴费用
        $scope.toClinicPaid = function () {
            $state.go('clinicPaid');
        };

        //已缴费记录跳转到详情
        $scope.paidRecGoDetail = function(paidItem){
            //预约挂号记录
            if(paidItem.DEPT_NAME){
                AppointmentRegistDetilService.RECORD = {
                    HOSPITAL_ID: paidItem.HOSPITAL_ID,
                    REG_ID: paidItem.REG_ID
                };
                AppointmentRegistDetilService.ROUTE_STATE = "clinic_payment_revise";
                $state.go('appointment_regist_detil');
            }
            //门诊已缴费记录
            else{
                ClinicPaidService.fromClinicPaid = true;
                //详情增加多笔记录 程铄闵 KYEEAPPC-7609 KYEEAPPTEST-3818
                var params = {
                    PLACE:'0',
                    REC_MASTER_ID:paidItem.REC_MASTER_ID,
                    EXTRA_KEY:paidItem.EXTRA_KEY
                };
                PaidRecordService.params = params;
                $state.go('paid_record');
            }
        };
    })
    .build();