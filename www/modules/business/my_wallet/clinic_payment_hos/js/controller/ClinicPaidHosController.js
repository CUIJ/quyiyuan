/**
 * 产品名称：quyiyuan
 * 创建原因：已缴费用控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.clinicPaidHos.controller")
    .require(["kyee.quyiyuan.myWallet.clinicPaid.service",
        "kyee.quyiyuan.myWallet.paidRecord.controller",
        "ngSanitize",
        "kyee.quyiyuan.myWallet.clinicPaidQueryController.controller",
        "kyee.quyiyuan.myWallet.clinicPaidMessage.controller"])
    .type("controller")
    .name("ClinicPaidHosController")
    .params(["CenterUtilService","$scope", "$rootScope", "$state", "$ionicHistory", "ClinicPaidService", "KyeeListenerRegister",
        "AppointmentRegistDetilService", "KyeeMessageService","$ionicScrollDelegate","KyeeI18nService",
        "HospitalSelectorService","$compile","CacheServiceBus","$timeout","AuthenticationService",
        "KyeeViewService","ClinicPaymentService","$ionicListDelegate","CommPatientDetailService","KyeeUtilsService",
        "ClinicPaymentReviseService","PatientCardService","PaidRecordService","PayOrderService"])
    .action(function (CenterUtilService,$scope, $rootScope, $state, $ionicHistory, ClinicPaidService, KyeeListenerRegister,
                      AppointmentRegistDetilService, KyeeMessageService,$ionicScrollDelegate,KyeeI18nService,
                      HospitalSelectorService,$compile,CacheServiceBus,$timeout,AuthenticationService,
                      KyeeViewService,ClinicPaymentService,$ionicListDelegate,CommPatientDetailService,KyeeUtilsService,
                      ClinicPaymentReviseService,PatientCardService,PaidRecordService,PayOrderService) {
        $scope.sortRule = ClinicPaidService.sortRule;//门诊已缴费排序规则 1-按时间（默认） 2-按医院
        $scope.shouldShowDelete = false;
        $scope.shouldShowReorder = false;
        $scope.listCanSwipe = true;
        $scope.isEmpty = true;
        $scope.isDeleteEmpty = false;
        $scope.emptyText = undefined;//KYEEAPPTEST-3190 程铄闵
        $scope.detailIndex = 0;//初始化展开详情标记
        $scope.tips = undefined;
        var lastHeight = 0;
        ClinicPaidService.firstIndex = 0;//默认展开
        $scope.payChannel0 = KyeeI18nService.get("clinicPaid.payChannel0","APP支付");
        $scope.payChannel1 = KyeeI18nService.get("clinicPaid.payChannel1","非APP支付");
        $scope.isPermission = true;//是否开通 true-开通
        // // 是否可以切换医院
        // $scope.canBeSelect = ($rootScope.ROLE_CODE!="5");
        $scope.QUERY_PAY_TYPE = '';//门诊查询方式
        $scope.showTip = undefined;//提示信息
        $scope.addCardTip = '';
        $scope.recharge={
            CARD_SHOW :'',
            CARD_NO :'',
            CARD_TYPE :'',
            CARD_NAME : '',
            PATIENT_ID :''
        };
        $scope.input= {
            PhoneNumber:''
        };
        $scope.toEdit = false;
        var getPatientInfo=function () {
            //显示当前默认就诊者
            $scope.currentCustomPatient={};

            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            $scope.currentCustomPatient.PATIENT_NAME = currentPatient.OFTEN_NAME;
            if(2== currentPatient.SEX){
                $scope.currentCustomPatient.SEX="女";
            }else{
                $scope.currentCustomPatient.SEX="男";
            }
            $scope.currentCustomPatient.AGE = handleAge(currentPatient.DATE_OF_BIRTH);
            $scope.currentCustomPatient.PATIENT_NAME_SHOW=handleName($scope.currentCustomPatient.PATIENT_NAME);
            if(currentPatient.ID_NO){
                $scope.currentCustomPatient.ID_NO = currentPatient.ID_NO;
                $scope.currentCustomPatient.ID_NO_SHOW = currentPatient.ID_NO.replace(/(.{3}).*(.{4})/,"$1********$2");
            }
            //$scope.currentCustomPatient.PHONE = currentPatient.PHONE;
            if(!$scope.phoneNumber){
                $scope.phoneNumber = currentPatient.PHONE;
            }


        };
        /**
         * 处理年龄
         * @param patient
         */
        var handleAge = function (birthday) {
            return CenterUtilService.ageBydateOfBirth(birthday);
        };
        var handleName = function (name) {
            var result = "";
            if(name){
                result =  name.substring(name.length-1,name.length)
            }
            return result;
        };
        KyeeListenerRegister.regist({
            focus: "clinicPaidHos",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: 'both',
            action: function (params) {
                //定位非跨院所选医院名(就医记录下方记录进入)
                if(ClinicPaidService.hospitalIdTreeName){
                    $scope.hospitalLogo = ClinicPaymentReviseService.getHospitalLogo(ClinicPaidService.hospitalIdTree);
                    $scope.hospitalName = ClinicPaidService.hospitalIdTreeName;//就医记录所选医院名
                }else if(ClinicPaidService.fromMsgHospitalId){
                    //小铃铛、小信封入口
                    $scope.hospitalLogo = ClinicPaymentReviseService.getHospitalLogo(ClinicPaidService.fromMsgHospitalId);
                    $scope.hospitalName = ClinicPaidService.fromMsgHospitalName;//小铃铛所选医院名
                }else{
                    $scope.hospitalLogo = ClinicPaymentReviseService.getHospitalLogo(CacheServiceBus.getStorageCache().get('hospitalInfo').id);
                    $scope.hospitalName = CacheServiceBus.getStorageCache().get('hospitalInfo').name;//默认医院名
                }
            }
        });

        //页面监听事件 程铄闵
        //门诊已结算点击账单详情进入详情页面以后，退出详情页面，不刷新页面  by 杜巍巍  KYEEAPPTEST-3248
        KyeeListenerRegister.regist({
            focus: "clinicPaidHos",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: 'both',
            action: function (params) {
                var sortRule = ClinicPaidService.sortRule;
                getPatientInfo();
                //从支付页面跳转过来延时1秒 //KYEEAPPC-5700 程铄闵 门诊费用支付完成后跳转至已缴费页面
                if($ionicHistory.backView()){
                    var lastPage = $ionicHistory.backView().stateId;
                    if(lastPage && lastPage == "payOrder" && !ClinicPaidService.recordBack){
                        KyeeMessageService.loading({
                            mask: true
                        });//增加遮罩
                        $timeout(
                            function () {
                                $scope.doRefresh(sortRule,true);
                            },
                            1000
                        );
                    }
                    else{
                        if(ClinicPaidService.recordBack){
                            ClinicPaidService.recordBack = false;
                        }
                        else{
                            $scope.doRefresh(sortRule,true);
                        }
                    }
                }
                else{
                    if(ClinicPaidService.recordBack) {
                        ClinicPaidService.recordBack = false;
                    }
                    else{
                        $scope.doRefresh(sortRule,true);
                    }
                }
                //初始化组件；判断设备是否为ios
                if(window.device != undefined && ionic.Platform.platform() == "ios"){
                    var screenSize = KyeeUtilsService.getInnerSize();
                    $scope.deviceTop= 64+50;
                }else{
                    $scope.deviceTop=44+50;
                }
            }
        });

        //处理成功数据
        var init = function(data,message){
            $scope.detailIndex = 0;//详情
            if(ClinicPaidService.paymentPayhisParms && ClinicPaidService.paymentPayhisParms.QUERY_PAY_TYPE){
                $scope.QUERY_PAY_TYPE = ClinicPaidService.paymentPayhisParms.QUERY_PAY_TYPE;
            }
            if(ClinicPaidService.paymentPayhisParms && ClinicPaidService.paymentPayhisParms.PAYMENT_PAYHIS_FLAG =="1" &&
                ClinicPaidService.paymentPayhisParms.PAY_SUBMIT_FLAG == "0"){
                $scope.showTip = "当前医院暂未开通线上门诊缴费，以下是您在窗口或自助机上的历史缴费记录。"
            }else{
                $scope.showTip = undefined;
            }
            if(ClinicPaidService.paymentPayhisParms){
                if(ClinicPaidService.paymentPayhisParms.PAYMENT_PAYHIS_FLAG == 0){//门诊已缴费未开通
                    $scope.isShowHead = false;
                }else{
                    $scope.isShowHead = true;
                }

            }else{
                $scope.isShowHead = true;
            }
            if(data&&data.data){
                if(data.data.rows){
                    $scope.paidData = data.data.rows;
                    if($scope.paidData.length == 0){
                        $scope.isEmpty = true;
                        $scope.emptyText = message.RETURN_MSG;
                        if($scope.emptyText){
                            if($scope.emptyText.indexOf(",")>-1){
                                $scope.emptyText = $scope.emptyText.split(",");
                            }else{
                                $scope.emptyText = $scope.emptyText.split("，");
                            }
                        }
                        //判提示语对应图标
                        if(message.RETURN_MSG&&message.RETURN_MSG.indexOf('未开通')>-1){
                            $scope.isPermission = false;
                        }
                        else{
                            $scope.isPermission = true;
                        }
                    }else{
                        $scope.isEmpty = false;
                    }
                }else{
                    $scope.isEmpty = true;
                    $scope.emptyText = message.RETURN_MSG;
                    if($scope.emptyText){
                        if($scope.emptyText.indexOf(",")>-1){
                            $scope.emptyText = $scope.emptyText.split(",");
                        }else{
                            $scope.emptyText = $scope.emptyText.split("，");
                        }
                    }
                }
                if(data.CARD_LIST){
                    setCardInfo(JSON.parse(data.CARD_LIST).rows);
                }else{
                    $scope.addCardTip = '请添加就诊卡';
                }

            }
            $ionicScrollDelegate.scrollTop();
        };
        

        //判断本月
        $scope.isCurrentMonth = function(date){
            var cur = KyeeUtilsService.DateUtils.formatFromDate(new Date(),'YYYY/MM');
            var dateNew = KyeeUtilsService.DateUtils.formatFromDate(date,'YYYY/MM');
            return cur==dateNew;
        };

        //跳转入门诊费用
        $scope.toClinicPayment = function () {
            $state.go('clinicPayment');
        };
        //跳转到详情页
        $scope.showRecord = function (paidInfo) {
            ClinicPaidService.fromClinicPaid = true;//从已缴费记录中跳到详情标记 by 程铄闵 KYEEAPPC-3868
            //详情增加多笔记录 程铄闵 KYEEAPPC-7609 KYEEAPPTEST-3818
            if(!paidInfo.DEPT_NAME&&paidInfo.IS_ADD != '1'){
                paidInfo.EXTRA_KEY = undefined;//无附加费则传此字段为空
            }
            var params = {
                PLACE:'0',
                REC_MASTER_ID:paidInfo.REC_MASTER_ID,
                EXTRA_KEY:paidInfo.EXTRA_KEY
            };
            PaidRecordService.params = params;
            $state.go('paid_record');
        };
        //跳转到预约挂号详情
        $scope.goDetail = function (paidDetail) {
            AppointmentRegistDetilService.RECORD = {
                HOSPITAL_ID: paidDetail.HOSPITAL_ID,
                REG_ID: paidDetail.REG_ID
            };
            //AppointmentRegistDetilService.ROUTE_STATE = "clinicPaid";
            AppointmentRegistDetilService.ROUTE_STATE = "clinicPaidHos";

            $state.go('appointment_regist_detil');
        };
        //支付状态
        $scope.payStatus = function (ACCOUNT_FLAG) {
            switch (ACCOUNT_FLAG) {
                case '0':
                    $scope.payStatusColor = "qy-green";
                    return KyeeI18nService.get("clinicPaid.accountFlag0","正在处理");
                case '1':
                    $scope.payStatusColor = "qy-green";
                    return "缴费成功";
                    $scope.payStatusColor = "qy-green";
                case '2':
                    return "缴费失败";
                    $scope.payStatusColor = "qy-red";
                case '3':
                    return KyeeI18nService.get("clinicPaid.accountFlag3","已退费");
                    $scope.payStatusColor = "qy-green";
                case '4':
                    return KyeeI18nService.get("clinicPaid.accountFlag4","退费中");
                    $scope.payStatusColor = "qy-green";
                case '5':
                    return KyeeI18nService.get("clinicPaid.accountFlag5","退费失败");
                    $scope.payStatusColor = "qy-red";
            }
        };
        //点击展示详情
        $scope.showInfo = function(index){
            //如果展开按钮隐藏则点击不触发展开事件  KYEEAPPC-5024
            if(index == $scope.medical_hidden_index){
                return ;
            }
            $ionicListDelegate.$getByHandle('clinic_paid').closeOptionButtons();
            $scope.medical_hidden_index = -1;
            var scroll = $ionicScrollDelegate.$getByHandle("paid_scroll");
            //原滚动条高度
            var scrollValues = scroll.getScrollView().getValues();
            //已展开则收起
            if ($scope.detailIndex == index) {
                $scope.detailIndex = -1;
                ClinicPaidService.firstIndex = -1;
                scroll.scrollTo(scrollValues.left, lastHeight, false);
            } else {
                if (document.getElementById('paidDetail') != undefined) {
                    //如果详情已展示，还原滚动条
                    //详情高度
                    var diseaseDetailHeight = document.getElementById('paidDetail').offsetHeight;
                    //还原滚动条
                    if ($scope.detailIndex < index) {
                        //点击项在当前选中项的下方
                        scroll.scrollTo(scrollValues.left, scrollValues.top - diseaseDetailHeight, false);
                    } else {
                        //点击项在当前选中项的上方
                        scroll.scrollTo(scrollValues.left, lastHeight, false);
                    }
                }
                $scope.detailIndex = index;
                ClinicPaidService.firstIndex = index;
                //点开后滚动条的高度
            }
            //记住这次点击的滚动条高度
            lastHeight = scrollValues.top;
            //滚动条重置
            scroll.resize();
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
        //转换金额  KYEEAPPC-8485 程铄闵 金额统一四舍五入
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = rounding(v,2);
                return data.toFixed(2);
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

            ClinicPaidService.authFlag = true;

            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: 'modules/business/center/views/authentication/authentication.html'
            });
        };

        //滑动监听  by 杜巍巍
        $scope.dragPhysicalData = function(index){
            //当删除按钮划开时，隐藏展开按钮
            var medicalItemContentTrans = document.getElementById('medical_item_'+index).firstChild.style["-webkit-transform"];
            var transLeft = '0px';
            if(medicalItemContentTrans){
                transLeft = medicalItemContentTrans.substring(12,medicalItemContentTrans.indexOf('px'));
                if(parseFloat(transLeft)<=-26){
                    //如果当前项目已经展开，则先收缩当前项
                    if($scope.detailIndex == index){
                        $scope.detailIndex = -1;
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

        //点击空白处--已废弃
        $scope.click = function(){
            $ionicListDelegate.$getByHandle('clinic_paid').closeOptionButtons();
            $scope.medical_hidden_index = -1;
        };

        //关闭底部黑框 程铄闵 KYEEAPPC-5599 已废弃
        $scope.closeTip = function(){
            $scope.ionScrollHeight=(window.innerHeight-53) +'px';
            $ionicScrollDelegate.$getByHandle('paid_scroll').resize();
            $scope.hiddenBar = true;
        };

        //返回 //KYEEAPPC-5700 程铄闵 门诊费用支付完成后跳转至已缴费页面
        $scope.back = function () {
            ClinicPaidService.paymentPayhisParms = {
                QUERY_PAY_TYPE:undefined,////QUERY_PAY_TYPE: 1:就诊卡；2：就诊卡+姓名；3：身份证+姓名；4：手机号+姓名; 5:查询方式选择了1和2，但是仅支持虚拟卡
                PAYMENT_FLAG:undefined,
                PAYMENT_PAYHIS_FLAG:undefined,
                PAY_SUBMIT_FLAG:undefined
            };
            ClinicPaidService.cardInfo = undefined;
            ClinicPaidService.sortRule = 1;//默认展示按时间
            ClinicPaidService.popupHospitalId = undefined;
            //$scope.hideOverlay();
            ClinicPaidService.fromMedicalGuide = false;//清除是否跨院标记 默认false-非跨院 （就医记录跨院）
            ClinicPaidService.hospitalIdTree = undefined;//清除就医记录标示 有值-就医记录直接跳转的 （就医记录下方->已缴费）
            ClinicPaidService.hospitalIdTreeName = undefined;//有值-就医记录直接跳转的（就医记录下方->已缴费）
            ClinicPaidService.fromMsgHospitalId = undefined;//有值-小铃铛待缴费所选医院 （小铃铛待缴费->已缴费）
            ClinicPaidService.fromMsgHospitalName = undefined;//小铃铛待缴费所选医院名（小铃铛待缴费->已缴费）
            if($ionicHistory.backView().stateId=='payOrder'){
                $ionicHistory.goBack(-2);
            }
            else if($ionicHistory.backView().stateId=='webPay'){
                $ionicHistory.goBack(-3);
            }
            else{
                $ionicHistory.goBack();
            }
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "clinicPaidHos",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });

        //修改个人信息跳转
        $scope.goPatientDetail = function(){
            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var current = angular.copy(currentPatient);//可直接操作缓存问题   By  张家豪  KYEEAPPTEST-3068
            CommPatientDetailService.editPatient(current);
        };


        //选择其它医院 KYEEAPPC-6170 程铄闵
        $scope.selectOtherHospital = function(){
            PatientCardService.fromOtherRoute = 'clinicPaid';
            var stgCache = CacheServiceBus.getStorageCache();
            var hospInfo = stgCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            PatientCardService.scopeAdd = {};
            PatientCardService.scopeAdd.area = {};
            PatientCardService.scopeAdd.area.PROVINCE_CODE = hospInfo.provinceCode;
            PatientCardService.scopeAdd.area.PROVINCE_NAME = hospInfo.provinceName;
            PatientCardService.scopeAdd.area.CITY_CODE = hospInfo.cityCode;
            PatientCardService.scopeAdd.area.CITY_NAME = hospInfo.cityName;
            //$scope.hideOverlay();
            $state.go('patient_card_hospital');
        };

        $scope.editPhone = function(){
            $scope.toEdit = true;
        };

        var currentCardNo = '';//切换卡后选择的卡
        //选择卡号
        $scope.selectItem = function (params) {
            if(params&&params.item&&params.item.value == -1){
                var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                PatientCardService.selectUserInfoUsed = {};
                PatientCardService.selectUserInfoUsed.USER_VS_ID = userInfo.USER_VS_ID;
                $state.go('patient_card_add');
            }else{
                $scope.recharge.CARD_SHOW = params.item.text;//展示值
                $scope.recharge.CARD_NO = params.item.value;
                $scope.recharge.CARD_TYPE = params.item.cardType;
                $scope.recharge.CARD_NAME = params.item.name;
                $scope.recharge.PATIENT_ID = params.item.patientID;
                $scope.currentCustomPatient.CARD=$scope.recharge.CARD_NO;
                currentCardNo = $scope.currentCustomPatient.CARD
                var queryObj = {
                    patientId :  $scope.recharge.PATIENT_ID,
                    cardNo : $scope.recharge.CARD_NO
                };
                ClinicPaidService.queryObj = queryObj;
                var sortRule = ClinicPaidService.sortRule;
                $scope.doRefresh(sortRule,true);
            }
        };
        //过滤就诊卡信息&初始化默认卡
        //过滤就诊卡信息&初始化默认卡
        var setCardInfo = function(rechargeInfo){
            var k = 0;
            var cardInfo = [];//就诊者信息（无虚拟卡的）
            if (rechargeInfo != null && rechargeInfo.length > 0) {
                $scope.addCardTip = '';
                for (var j = 0; j < rechargeInfo.length; j++) {
                    //过滤虚拟卡（趣医）
                    if (rechargeInfo[j] && rechargeInfo[j].CARD_TYPE && rechargeInfo[j].CARD_TYPE == 0 && rechargeInfo[j].CARD_NO != undefined && rechargeInfo[j].CARD_NO.substring(0, 1) == "Q") {
                        if(rechargeInfo[j].IS_DEFAULT==1){
                            $scope.addCardTip = "请添加就诊卡";
                        }
                        break;
                    } else {
                        if(currentCardNo){
                            $scope.currentCustomPatient.CARD = currentCardNo;
                        }else{
                            if(rechargeInfo[j].IS_DEFAULT==1){
                                $scope.currentCustomPatient.CARD=rechargeInfo[j].CARD_NO;
                            }else{
                                $scope.addCardTip = "请选择就诊卡";
                            }
                        }
                        cardInfo[k] = rechargeInfo[j];
                        k++;
                    }
                }
            }else{
                $scope.addCardTip = "请添加就诊卡";
            }
            if(!cardInfo || cardInfo.length ==0){
                $scope.addCardTip = "请添加就诊卡";
            }
            ClinicPaidService.cardInfo = cardInfo;
            setSelectItem(cardInfo);//填充就诊卡
        };

        //填充就诊卡内容
        var setSelectItem = function(cardNoList){
            var menus = [];
            if(cardNoList){
                for (var i = 0; i < cardNoList.length; i++) {
                    var resultMap = {};
                    resultMap["name"] = cardNoList[i].CARD_NAME;
                    resultMap["text"] = cardNoList[i].CARD_NO;
                    resultMap["value"] = cardNoList[i].CARD_NO;//唯一属性CARD_NO
                    resultMap["patientID"] = cardNoList[i].PATIENT_ID;
                    resultMap["cardType"] = cardNoList[i].CARD_TYPE;
                    menus.push(resultMap);
                }
            }
            var resultMap = {};
            resultMap["name"] = "";
            resultMap["text"] = KyeeI18nService.get("index_hosp.addNewPatientCard","+ 添加新的就诊卡");
            resultMap["value"] = -1;
            menus.push(resultMap);
            //控制器中绑定数据：
            $scope.pickerItems = menus;
            setDefaultCardItem();
        };

        //绑定选择事件
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
            params.hideMode = "AUTO";
        };
        //匹配默认卡信息
        //若显示的卡在卡列表中则补充其余信息
        var setDefaultCardItem = function(){
            if($scope.pickerItems){
                for (var i = 0; i < $scope.pickerItems.length; i++) {
                    if ($scope.currentCustomPatient.CARD == $scope.pickerItems[i].value) {
                        $scope.recharge.CARD_SHOW=$scope.pickerItems[i].value;
                        $scope.recharge.PATIENT_ID = $scope.pickerItems[i].patientID;
                        $scope.recharge.CARD_NO = $scope.pickerItems[i].value;
                        $scope.recharge.CARD_TYPE = $scope.pickerItems[i].cardType;
                        $scope.recharge.CARD_NAME = $scope.pickerItems[i].name;
                        break;
                    }
                }
            }
        };
        //点击选择按钮事件
        $scope.showPatientCardNo = function () {
            $scope.title = KyeeI18nService.get("card_recharge_confirm.pHCardNo", "请选择就诊卡");
            //调用显示
            $scope.showPicker($scope.recharge);
        };

        //刷新
        $scope.doRefresh = function (sortRule,showLoading,isHospitalClick) {
            $scope.sortRule = sortRule;
            ClinicPaidService.sortRule = sortRule;
            if(showLoading){
                $scope.paidData = [];
            }
            if(sortRule!=2){
                ClinicPaidService.popupHospitalId = undefined;//清除选择的弹出医院 程铄闵 KYEEAPPC-6170
            }
            $scope.detailIndex = -1;//详情
            ClinicPaidService.PHONE_NUMBER = $scope.phoneNumber;
            ClinicPaidService.loadHosData(sortRule,ClinicPaymentService.fromHospitalView,function (success,data,message) {//KYEEAPPC-5128 程铄闵 从医院首页进入
                KyeeMessageService.hideLoading();//取消遮罩
                if(success){
                    init(data,message);
                }
                else{
                    $scope.isPermission = true;
                    $scope.isEmpty = true;
                    $scope.emptyText = message;
                    if($scope.emptyText){
                        if($scope.emptyText.indexOf(",")>-1){
                            $scope.emptyText = $scope.emptyText.split(",");
                        }else{
                            $scope.emptyText = $scope.emptyText.split("，");
                        }
                    }
                }
                $scope.$broadcast('scroll.refreshComplete');
            }, showLoading);
        };
        $scope.blur = function () {
            if($scope.input.PhoneNumber && $scope.input.PhoneNumber.trim().length>0){
                $scope.toEdit = false;
                $scope.phoneNumber = $scope.input.PhoneNumber;
            }
            $scope.doRefresh(true);
        }
    })
    .build();