/**
 * Created by Administrator on 2015/4/25.
 *个人中心的控制器，属于根控制器
 * 个人中心主页开发（APK）  By  张家豪  KYEEAPPC-4404
 * 赵婷
 * 修改用户：朱学亮
 * 修改时间：2015/5/11 11:11
 * 修改原因：添加以模态方式跳转至我的二维码页面
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.controller")
    .require([
        "kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.center.controller.custom_patient",
        "kyee.quyiyuan.center.controller.role_view",
        "kyee.quyiyuan.center.controller.change_pwd",
        "kyee.quyiyuan.center.controller.update_user",
        "kyee.quyiyuan.center.controller.query_his_card",
        "kyee.quyiyuan.center.controller.add_patient_info",
        "kyee.quyiyuan.center.controller.add_custom_patient",
        "kyee.quyiyuan.center.qr_code.controller",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.home.noticeCenter.service",
        "kyee.quyiyuan.appointment.regist.list.controller",
        "kyee.quyiyuan.center.custom_patient.service",
        "kyee.quyiyuan.address_manage.controller",
        "kyee.quyiyuan.medicineOrder.controller",
        "kyee.quyiyuan.center.comm_patient_detail.service",
        "kyee.quyiyuan.frequent_info.controller",
        "kyee.quyiyuan.center.changeLanguage.controller",
        "kyee.quyiyuan.aboutquyi.service",
        "kyee.quyiyuan.myWallet.inpatientPayment.service",
        "kyee.quyiyuan.myWallet.perpaid.controller",
        "kyee.quyiyuan.myWallet.couponsRecord.controller",
        "kyee.quyiyuan.center.controller.administrator_login",
        "kyee.quyiyuan.center.administrator_login",
        "kyee.quyiyuan.price.controller",
        //程铄闵 删除冗余代码,迁移新我的下 KYEEAPPC-5641
        "kyee.quyiyuan.myWallet.applyCash.controller",
        "kyee.quyiyuan.myWallet.coupons.controller",
        "kyee.quyiyuan.myRefund.controller",
        "kyee.quyiyuan.rebate.rebateBankAdd.controller",
        "kyee.quyiyuan.myWallet.registerFree.controller",
        "kyee.quyiyuan.myWallet.clinicPayment.controller",
        "kyee.quyiyuan.myWallet.inpatientPaymentRecord.controller",
        "kyee.quyiyuan.myWallet.perpaidPayInfo.controller",
        "kyee.quyiyuan.messagecenter.messageCenter.controller",
        "kyee.quyiyuan.patients_group.patients_group_message.controller",
        "kyee.quyiyuan.myWallet.cashback.controller",
        "kyee.quyiyuan.health.archive.my.health.archive.controller",
        "kyee.quyiyuan.appointment.regist.rush.list.new.controller",
        "kyee.quyiyuan.my.convenience.clinic.controller",
        "kyee.quyiyuan.my.convenience.clinic.service",
        "kyee.quyiyuan.consultation.order.controller",  //跳转至'我的订单'页面所需

        "kyee.quyiyuan.consulation.note.controller",
        "kyee.quyiyuan.consulation.note.detail.controller",
        "kyee.quyiyuan.consulation.note.report.controller",
        "kyee.quyiyuan.consultation.UploadMaterial.controller",
        "kyee.quyiyuan.consultation.UploadMaterial.controller",
        "kyee.quyiyuan.consulation.note.detail.service",
        "kyee.quyiyuan.consulation.note.detail.service",

        "kyee.quyiyuan.messagecenter.my_healthy.service", //跳转到我的健康页
        "kyee.quyiyuan.messagecenter.my_healthy.controller",
        "kyee.quyiyuan.my.prescription.controller"

    ])
    .type("controller")
    .name("CenterController")
    .params(["OperationMonitor","HomeService","QrCodeService","$scope", "$state", "$ionicHistory", "CenterService", "KyeeMessageService", "KyeeViewService",
        "LoginService", "CacheServiceBus", "NoticeCenterService", "CustomPatientService",
        "CommPatientDetailService", "KyeeListenerRegister", "FilterChainInvoker",
        "KyeeUtilsService", "AddressmanageService", "AboutQuyiService",
        "AddCustomPatientService", "$ionicScrollDelegate", "InpatientPaymentService", "HospitalSelectorService", "KyeeI18nService",
        "PatientCardRechargeService","ClinicPaymentReviseService","PerpaidService","$rootScope","MyPersonalInformationService","AddClinicManagementService","$location","ConsulationNoteDetailService","MyHealthyService"])
    .action(function (OperationMonitor,HomeService,QrCodeService,$scope, $state, $ionicHistory, CenterService, KyeeMessageService, KyeeViewService, LoginService, CacheServiceBus, NoticeCenterService, CustomPatientService,
                      CommPatientDetailService, KyeeListenerRegister, FilterChainInvoker, KyeeUtilsService,
                      AddressmanageService, AboutQuyiService, AddCustomPatientService, $ionicScrollDelegate, InpatientPaymentService, HospitalSelectorService, KyeeI18nService,
                      PatientCardRechargeService,ClinicPaymentReviseService,PerpaidService,$rootScope,MyPersonalInformationService,AddClinicManagementService,$location,ConsulationNoteDetailService,MyHealthyService) {

        var second = 120;//倒计时
        $scope.havePeople = false; //有无就诊者
        $scope.isTimeNotPatient = false; //解决初始化时延迟显示就诊者
        $scope.riskPromotionShow = false; //我的保险是否开启促销活动，默认不开启
        var memoryCache = CacheServiceBus.getMemoryCache();//全局参数
        var storageCache = CacheServiceBus.getStorageCache();//缓存数据
        var currentUserRecord = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);//用户缓存
        $scope.userSource = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);//用户来源

        AddressmanageService.ROUTER = "center";//进入 Addressmanage 页面的标记

        //就诊者的会诊记录: 'NONE', 'MDT', 'RPP', 'BOTH'
        $scope.hasMDTorRPP = LoginService.MDT_AND_RPP && LoginService.MDT_AND_RPP !== 'NONE';

        $scope.mdtWatcher = $scope.$watch(function(){
            return LoginService.MDT_AND_RPP;
        }, function(newVal, oldValue, scope){
            scope.hasMDTorRPP = newVal && newVal !== 'NONE';
        });
        /**
         * 查询选中就诊者
         */
        $scope.queryCustomPatient = function () {
            currentUserRecord = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);//用户缓存
            //查询选中就诊者
            CenterService.getSelectCustomInfo(currentUserRecord, storageCache, function (havePeople, image, data) {
                $scope.havePeople = havePeople;
                $scope.IMAGE_PATH = image;
                $scope.currentCustomPatient = data;
                $scope.currentCustomPatient.nameShow = handleName($scope.currentCustomPatient.OFTEN_NAME);
                $scope.isTimeNotPatient = 1;
            });
        };
        /**
         * 进入我的健康页面
         */
        $scope.goToMyHealth = function(){
            MyHealthyService.jumpRouter = 'center->MAIN_TAB';
            $state.go('my_healthy');
        }

        /**
         * 打开模态窗口
         * @type {Function}
         */
        var openModal = $scope.openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };

        /**
         * 倒计时
         * @param timer
         */
        var setBtnState = function (timer) {
            try {
                if (second > 0) {
                    $scope.checkUserCache();
                } else {
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            } catch (e) {
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        };
        /**
         *  判断当前浏览器是否是微信浏览器
         * @returns {boolean}
         */
        function isWeiXin(){
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                return true;
            }else{
                return false;
            }
        };

        /**
         * 定时刷新获取缓存(最多只发送一次请求)
         */
        $scope.enterPage = function () {
            CenterService.getNetParams(function (MYINSURANCE_SWITCH,MYINSURANCE_URL,MYINSURANCE_URL_WEIXIN,IS_HOSPITAL_CLINIC_REBATE,IS_PATIENT_CARD_REBATE,IS_HOSPITAL_PREFEE_REBATE,HEARTH_ARCHIVE_BO_ZHOU,HEARTH_ARCHIVE_APP,RISK_PROMOTION_SWITCH,RISK_PROMOTION_START_TIME) {
                if (MYINSURANCE_SWITCH == "true"&& MYINSURANCE_URL && MYINSURANCE_URL_WEIXIN) {
                    CenterService.withMyInsurance = '1';
                    CenterService.MyInsuranceUrl = MYINSURANCE_URL;
                    if(isWeiXin()){
                        CenterService.MyInsuranceUrl = MYINSURANCE_URL_WEIXIN;
                    }
                    $scope.withMyInsurance =  CenterService.withMyInsurance;
                } else {
                    CenterService.withMyInsurance = '0';
                }
                if(IS_HOSPITAL_CLINIC_REBATE=="true"||IS_PATIENT_CARD_REBATE =="true"||IS_HOSPITAL_PREFEE_REBATE =="true" ){
                    $scope.cashBackIsShow = true;
                }
                if(HEARTH_ARCHIVE_BO_ZHOU=="1"){
                   $scope.healthArchiveBoZhou = true;
                }
                if(HEARTH_ARCHIVE_APP=="1"){
                    $scope.healthArchiveApp = true;
                }
                if(RISK_PROMOTION_START_TIME!=""&&RISK_PROMOTION_START_TIME!=undefined&&RISK_PROMOTION_START_TIME!="NULL"&&RISK_PROMOTION_START_TIME!=null&&RISK_PROMOTION_START_TIME!="null"&&RISK_PROMOTION_START_TIME!="undefined"){
                    var riskPromotionStartTimeList=CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.RISK_PROMOTION_START_TIME_LIST);
                    var riskPromotionStartTime=RISK_PROMOTION_START_TIME.replace(/\s+/g,"");
                    if(riskPromotionStartTime!=""){
                        if(riskPromotionStartTimeList!=""&&riskPromotionStartTimeList!=undefined&&riskPromotionStartTimeList!="riskPromotionStartTimeList"&&riskPromotionStartTimeList!=null){
                            if(riskPromotionStartTimeList.indexOf(riskPromotionStartTime)<0){
                                riskPromotionStartTimeList=riskPromotionStartTimeList+","+riskPromotionStartTime;
                                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.RISK_PROMOTION_START_TIME_LIST,riskPromotionStartTimeList);
                                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.RISK_PROMOTION_FIRST_SHOW,"1");
                            }
                        }else{
                            riskPromotionStartTimeList=riskPromotionStartTime;
                            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.RISK_PROMOTION_START_TIME_LIST,riskPromotionStartTimeList);
                            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.RISK_PROMOTION_FIRST_SHOW,"1");
                        }
                    }

                }
                if(RISK_PROMOTION_SWITCH=="1"){
                    var riskPromotionFirstShow=CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.RISK_PROMOTION_FIRST_SHOW);
                    if(riskPromotionFirstShow=="1"){
                        $scope.riskPromotionShow = true;
                    }

                }

            });

            //不间断时间为10秒
            second = 10;
            setBtnState();
            var timer = KyeeUtilsService.interval({
                time: 1000,
                action: function () {
                    second--;
                    setBtnState(timer);
                }
            });
        };
        /**
         * 登录、注册
         */
        $scope.toLogin = function () {
            var ysbzWxPst=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.YSBZ_WX_FLAG);  //是否是养生亳州微信公众号链接
            if(AppConfig.BRANCH_VERSION=="03"&&ysbzWxPst!='1'){
                window.location.href="javascript:window.myObject.login()";
            }else{
                LoginService.frontPage = "3";  //标志从“个人中心”跳到登录页面
                $state.go("login");
            }
        };


        //点击头像编辑当前就诊者，进入编辑页面
        $scope.editCurrentPatient = function () {
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var current = angular.copy(currentPatient);//可直接操作缓存问题   By  张家豪  KYEEAPPTEST-3068
            CommPatientDetailService.editPatient(current);
        };


        /**
         * 跳入选择卡页面
         */
        $scope.goPatientCard = function () {
            $state.go("patient_card");
        };

        //增加就诊者
        $scope.addPatient = function () {

            OperationMonitor.record("addPatient", "center->MAIN_TAB");
            AddCustomPatientService.Mark = 3;//新增就诊者标记，返回此页面时刷新此页面
            AddCustomPatientService.Restart = $scope;//将本页面的$scope传入Service层

            var phoneNum = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER);
            AddCustomPatientService.currentUserPhoneNum = phoneNum;
            openModal('modules/business/center/views/add_patient_info/add_custom_patient.html');
        };


        /**
         * 校验就诊者缓存信息
         */
        var checkInformation = function () {
            //查询用户就诊者缓存是否存在，如果存在则不需要继续发请求查询就诊者
            var currentCustomPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            if(currentCustomPatient && currentCustomPatient.USER_VS_ID){
                $scope.havePeople = true;
                $scope.IMAGE_PATH = CenterService.dealWithImage(currentCustomPatient);
                $scope.currentCustomPatient = currentCustomPatient;
                $scope.currentCustomPatient.nameShow = handleName($scope.currentCustomPatient.OFTEN_NAME);
                $scope.isTimeNotPatient = true;
            }else{
                $scope.queryCustomPatient();
            }
            //取消倒计时查询就诊者
            second = 0;
        };

        var handleName = function (name) {
            var result = "";
            if(name){
                result =  name.substring(name.length-1,name.length)
            }
            return result;
        };

        /**
         *进行用户缓存校验
         */
        $scope.checkUserCache = function(){

            currentUserRecord = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);//用户缓存

            //查询用户有无常用就诊者，如果USER_ID不存在则不需校验
            if (memoryCache && currentUserRecord && currentUserRecord.USER_ID) {
                //校验就诊者缓存信息
                checkInformation();
            }else{
                $scope.isTimeNotPatient = 2; //没有USER_ID意味着没有登录
            }
        };

        KyeeListenerRegister.regist({
            focus: "center->MAIN_TAB",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                setTimeout(function () {
                    $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
                }, 100);
                $scope.enterPage();//页面初始化

            }
        });

        /**
         * 跳转到就诊卡充值页面  KYEEAPPC-4687 程铄闵
         */
        $scope.goToPatientRecharge = function () {
            PatientCardRechargeService.fromView = $state.current.name;// KYEEAPPC-8088 程铄闵 2.3.10充值功能改版
            KyeeMessageService.loading({
                mask: true
            });//增加遮罩 KYEEAPPTEST-3945 程铄闵
            PatientCardRechargeService.getModule(function (route) {
                KyeeMessageService.hideLoading();//取消遮罩
                PatientCardRechargeService.isFirstEnter = true;
                $state.go(route);//KYEEAPPC-5217 程铄闵
            },$state);
        };
        /**
         * 跳转到门诊缴费页面  KYEEAPPC-6170 程铄闵
         */
        $scope.goToClinicPayment = function () {
            ClinicPaymentReviseService.isMedicalInsurance(function (route) {
                $state.go(route);
            });
        };
        /**
         * 跳转到住院预缴  程铄闵 KYEEAPPC-6601
         */
        $scope.goToPerpaid = function () {
            FilterChainInvoker.invokeChain({
                id: "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
                token: "center->MAIN_TAB",
                onFinash: function () {
                    PerpaidService.loadPermission(function (route) {
                        $state.go(route);
                    });
                }
            });
        };
        /**
         * 进入帮助与反馈页面
         */
        $scope.enterHelpPage = function() {
            $state.go("aboutquyi_help");
        };
        /**
         * 我的保险点击事件
         */
        $scope.myInsurance = function(){
            var whereIComeFrom = "WEB";//APP WEIXIN WEB
            if ($location.$$absUrl.indexOf("file:///") != -1 ||$location.$$absUrl.indexOf("localhost:8080/var") != -1){
                whereIComeFrom = "APP";
            }
           if(isWeiXin()){
                whereIComeFrom = "WEIXIN";
            }
            var userAgents=navigator.userAgent;
            userAgents=userAgents.toLowerCase();
            var loginFalg=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN) == true;
            if(loginFalg){
                var url = CenterService.MyInsuranceUrl;//后台配置所取
                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.RISK_PROMOTION_FIRST_SHOW,"0");
                CenterService.queryInsuranceParameters(whereIComeFrom,url,currentUserRecord,'center',function (data) {
                    HomeService.queryWebConfig.openUrl= data;
                    if(window.device && device.platform == "iOS"){
                        var cache = CacheServiceBus.getMemoryCache();
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_VIEW_ROUTER, "center->MAIN_TAB");
                        window.open(data,"_blank","location=yes");
                    }else if (whereIComeFrom == "WEIXIN"){
                        window.location.href = data;
                    }else{
                        $state.go('homeWebNoTitle');
                    }
                 });
            }else{
                $state.go("login");
            }
        };
        /**
         * 我的二维码点击事件
         */
        $scope.myQRCode = function(){
            FilterChainInvoker.invokeChain({
                id: "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
                token: "center->MAIN_TAB",
                onFinash: function () {
                    getQyCode();
                }
            });
        };
        /**
         * 我的二维码调用事件
         */
        var getQyCode = function(){
            var hospitalInfo = storageCache.get("hospitalInfo");
            var hospitalId=hospitalInfo.id;
            var qrCodeType;
            //获取医院二维码参数
            QrCodeService.getQrCode(hospitalId,function(retVal){
                if (retVal.success) {
                    if (retVal.data && retVal.data.qrCodeType && retVal.data.qrCodeType != '') {
                        qrCodeType = retVal.data.qrCodeType;
                    } else {
                        qrCodeType = "CARD_NO";
                    }

                    var currentCardInfo = CacheServiceBus.getMemoryCache().get('currentCardInfo');
                    //去除就诊卡过滤器 二维码内容包含就诊卡或就诊者编号&&就诊者没有就诊卡
                    if((qrCodeType.indexOf("CARD_NO")!=-1||qrCodeType.indexOf("PATIENT_ID")!=-1)
                        &&(!currentCardInfo || !currentCardInfo.USER_VS_ID)){
                        KyeeMessageService.confirm({
                            title: KyeeI18nService.get("commonText.warmTipMsg","温馨提示"),
                            content: KyeeI18nService.get("commonText.selectCardMsg","该项业务需要您先添加就诊卡信息"),
                            okText: KyeeI18nService.get("commonText.selectOk","前往添加"),
                            cancelText: KyeeI18nService.get("commonText.selectCancel","以后再说"),
                            onSelect: function (res) {
                                if (res) {
                                    $state.go("patient_card_select");
                                }
                            }
                        });
                    }else{
                        QrCodeService.qrCodeType=qrCodeType;
                        $state.go("my_qr_code");
                    }
                }
            });
        };
        $scope.goCashBack = function(){
            $state.go("cashBack");
        };

        $scope.goMessageCenter = function(){
            var patientsGroupIsOpen = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_SWITCH);
            if($rootScope.IS_SHELL_LOAD && patientsGroupIsOpen) {
                $state.go("message->MAIN_TAB");
            } else {
                $state.go("messagecenter");
            }
        };
        //我的抢号
        $scope.goMyHid = function(){
           AddClinicManagementService.rush_type = 1;
           $state.go("rush_clinic_record_list_new");
        };
        //我的方便门诊
        $scope.goMyQuickClinic = function(){
            $state.go("my_convenience_clinic");
        };
        //我的处方
        $scope.goMyPrescription = function(){
            $state.go("my_prescription");
        };
        //我的健康档案
        $scope.goMyHealth = function(){
            MyPersonalInformationService.BACK_ID = 'my_personal_information';
            $state.go("my_health_archive");
        };

        /**
         * [goConsultationOrder 跳转至我的订单页面]
         * @return {[type]} [description]
         */
        $scope.goConsultationOrder = function(){
            $state.go("consultation_order");
        };
        //会诊
        $scope.goConsulationNode = function(){
            if (LoginService.MDT_AND_RPP === 'BOTH') {
                ConsulationNoteDetailService.consType = 'MDT';
            }
            $state.go('consulationnote');
        }
    })
    .build();
