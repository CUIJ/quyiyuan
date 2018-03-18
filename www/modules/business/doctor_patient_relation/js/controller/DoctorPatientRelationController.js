/**
 * Created by Administrator on 2017/5/15 0015.
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctor.patient.relation.controller")
    .require([
        "kyee.quyiyuan.doctor.patient.relation.service",
        "kyee.quyiyuan.myWallet.clinicPaymentRevise.service",
        "kyee.quyiyuan.myWallet.perpaidPayInfo.service",
        "kyee.quyiyuan.myWallet.perpaid.service",
        "kyee.quyiyuan.patients_group.attending_doctor.service",
        "kyee.quyiyuan.patients_group.attending_doctor.controller",
        "kyee.quyiyuan.qrcodeSkip.service",
        "kyee.quyiyuan.appointment.doctor_consultation.service",
        "kyee.quyiyuan.consultation.consult_contract.controller",
	"kyee.quyiyuan.patients_group.questionnaire_search.controller",
        "kyee.quyiyuan.patients_group.questionnaire_search.service"
    ])
    .type("controller")
    .name("DoctorPatientRelationController")
    .params(["$timeout","$ionicHistory","$interval","ReportMultipleService","$scope","$state","KyeeListenerRegister","KyeeMessageService","CacheServiceBus","DoctorPatientRelationService",
        "AppointmentDoctorDetailService","AppointmentDeptGroupService","MyCareDoctorsService","HospitalSelectorService",
        "CenterUtilService","AddCustomPatientService","LoginService","KyeeUtilsService","ClinicPaymentReviseService","PerpaidPayInfoService","PerpaidService",
        "AttendingDoctorService","QRCodeSkipService","DoctorConsultationService","KyeeI18nService","QuestionnaireSearchService"])
    .action(function ($timeout,$ionicHistory,$interval,ReportMultipleService,$scope,$state,KyeeListenerRegister,KyeeMessageService,CacheServiceBus,DoctorPatientRelationService,
                      AppointmentDoctorDetailService,AppointmentDeptGroupService,MyCareDoctorsService,HospitalSelectorService,
                      CenterUtilService,AddCustomPatientService,LoginService,KyeeUtilsService,ClinicPaymentReviseService,PerpaidPayInfoService,
		      PerpaidService,AttendingDoctorService,QRCodeSkipService,DoctorConsultationService,KyeeI18nService,QuestionnaireSearchService) {
        //定时器
        var timer = {};
        var second;
        KyeeListenerRegister.regist({
            focus: "doctor_patient_relation",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction : "both",
            action: function (params) {
                $scope.patientInfo = {
                    patientName:"",
                    phoneNumber:"",
                    idNo:"",
                    msgCode:"",
                    patientNameReadonly:false,
                    phoneNumberReadonly:false,
                    idNoReadonly:false,
                    notCheckCode:1
                };
                $scope.msgText = "获取验证码";
                second = 120;
                $scope.btnDisabled = false;

                //根据用户ID和就诊者ID查询用户信息状态
                var cache = CacheServiceBus.getMemoryCache();
                var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                $scope.businessType=objParams.businessType;

                $scope.isNeedAutoRegister = objParams.isNeedAutoRegister;

                if(1==objParams.businessType){
                    $scope.DOCTOR_UUID = DoctorPatientRelationService.DOCTOR_UUID;
                }
                if(2==objParams.businessType){
                    $scope.reportAdditionalCard=DoctorPatientRelationService.reportAdditionalCard;
                    $scope.reportAdditionalInpNo=DoctorPatientRelationService.reportAdditionalInpNo;
                    //有就诊者需要补充信息
                    if(DoctorPatientRelationService.patientInfo){
                        if(DoctorPatientRelationService.patientInfo.PHONE&&DoctorPatientRelationService.patientInfo.ID_NO&&DoctorPatientRelationService.patientInfo.OFTEN_NAME){
                            $scope.patientInfo.phoneNumber=DoctorPatientRelationService.patientInfo.PHONE;
                            $scope.patientInfo.idNo=DoctorPatientRelationService.patientInfo.ID_NO;
                            $scope.patientInfo.patientName=DoctorPatientRelationService.patientInfo.OFTEN_NAME;
                            $scope.patientInfo.patientNameReadonly = true;
                            $scope.patientInfo.phoneNumberReadonly = true;
                            $scope.patientInfo.idNoReadonly = true;
                            $scope.notCheckCode=1;
                        }
                    }
                    $scope.hintPass="如需查看住院报告单，请输入住院号";
                }
                if(4==objParams.businessType){
                    $scope.paymentAdditionalCard = DoctorPatientRelationService.paymentAdditionalCard;
                    //有就诊者需要补充信息
                    if(DoctorPatientRelationService.patientInfo.PHONE&&DoctorPatientRelationService.patientInfo.ID_NO&&DoctorPatientRelationService.patientInfo.OFTEN_NAME){
                        $scope.patientInfo.phoneNumber=DoctorPatientRelationService.patientInfo.PHONE;
                        $scope.patientInfo.idNo=DoctorPatientRelationService.patientInfo.ID_NO;
                        $scope.patientInfo.patientName=DoctorPatientRelationService.patientInfo.OFTEN_NAME;
                        $scope.patientInfo.patientNameReadonly = true;
                        $scope.patientInfo.phoneNumberReadonly = true;
                        $scope.patientInfo.idNoReadonly = true;
                        $scope.notCheckCode=1;
                    }
                }
                if(5==objParams.businessType){
                    $scope.paymentAdditionalInpNo=DoctorPatientRelationService.paymentAdditionalInpNo;
                    //有就诊者需要补充信息
                    if(DoctorPatientRelationService.patientInfo.PHONE&&DoctorPatientRelationService.patientInfo.ID_NO&&DoctorPatientRelationService.patientInfo.OFTEN_NAME){
                        $scope.patientInfo.phoneNumber=DoctorPatientRelationService.patientInfo.PHONE;
                        $scope.patientInfo.idNo=DoctorPatientRelationService.patientInfo.ID_NO;
                        $scope.patientInfo.patientName=DoctorPatientRelationService.patientInfo.OFTEN_NAME;
                        $scope.patientInfo.patientNameReadonly = true;
                        $scope.patientInfo.phoneNumberReadonly = true;
                        $scope.patientInfo.idNoReadonly = true;
                        $scope.notCheckCode=1;
                    }
                    $scope.hintPass="请输入住院号";
                }


            }
        });
        $scope.submitPatientData = function(){
            if(isEmpty($scope.patientInfo.patientName)){
                KyeeMessageService.broadcast({
                    content:"请输入您的真实姓名"
                });
                return ;
            }
            if(!$scope.patientInfo.phoneNumberReadonly&&isEmpty($scope.patientInfo.phoneNumber)){
                KyeeMessageService.broadcast({
                    content:"请输入您的手机号码"
                });
                return ;
            }
            //效验手机号
            if (!$scope.patientInfo.phoneNumberReadonly&&!AddCustomPatientService.validatePhoneNum($scope.patientInfo.phoneNumber)) {
                return ;
            }
            if(!$scope.patientInfo.idNoReadonly&&isEmpty($scope.patientInfo.idNo)){
                KyeeMessageService.broadcast({
                    content:"请输入您的身份证号码"
                });
                return ;
            }
            //校验身份证
            if (!$scope.patientInfo.idNoReadonly&&!CenterUtilService.idNoCheck($scope.patientInfo.idNo)) {
                KyeeMessageService.broadcast({
                    content:"身份证格式错误！"
                });
                return ;
            }

            //检验验证码
            if( $scope.notCheckCode !=1&&isEmpty($scope.patientInfo.msgCode)){
                KyeeMessageService.broadcast({
                    content: "请输入验证码！"
                });
                return ;
            };
            //校验就诊卡号
            if($scope.reportAdditionalCard==1||(4==$scope.businessType && $scope.paymentAdditionalCard)){
                //检验验证码
                if(isEmpty($scope.patientInfo.cardNo)){
                    KyeeMessageService.broadcast({
                        content: "请输入您的就诊卡号！"
                    });
                    return ;
                };
                if(!checkCardOrInpNo($scope.patientInfo.cardNo)){
                    KyeeMessageService.broadcast({
                        content: "请输入正确的就诊卡号！"
                    });
                    return ;
                };
            }
            //校验住院号
            if((5==$scope.businessType && $scope.paymentAdditionalInpNo)){
                //检验验证码
                if(isEmpty($scope.patientInfo.inpNo)){
                    KyeeMessageService.broadcast({
                        content: "请输入您的住院号！"
                    });
                    return ;
                };
                if(!checkCardOrInpNo($scope.patientInfo.inpNo)){
                    KyeeMessageService.broadcast({
                        content: "请输入正确的住院号！"
                    });
                    return ;
                };
            }
            var params = {
                DOCTOR_QR_CODE:$scope.DOCTOR_UUID,
                PATIENT_NAME:$scope.patientInfo.patientName,
                PHONE_NUMBER:$scope.patientInfo.phoneNumber,
                ID_NO:$scope.patientInfo.idNo
            };
            var cache = CacheServiceBus.getMemoryCache();
            var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
            //扫描二维码跳转预约挂号页面
            if(objParams.businessType==1){
                DoctorPatientRelationService.getDoctorPatientInfo(params, function (resultData) {
                    if (resultData.success) {
                        $scope.DOCTOR_INFO = resultData.data.DOCTOR_INFO;
                        toSubmitInfo(100001);
                    } else {
                        KyeeMessageService.broadcast({
                            content: resultData.message
                        });
                        $scope.btnDisabled = false;
                        $scope.msgText = "获取验证码";
                        //关闭定时器
                        KyeeUtilsService.cancelInterval(timer);
                    }
                });
            };
            //扫描二维码跳转报告单页面
            if(objParams.businessType==2){
                if($scope.reportAdditionalCard==1||$scope.reportAdditionalInpNo==1){
                    ReportMultipleService.CLINIC_NUM = $scope.patientInfo.cardNo;
                    ReportMultipleService.INHOSPITAL_NUM = $scope.patientInfo.inpNo;
                }
                if(1!=$scope.notCheckCode){// 用户信息是手动填写的
                    toSubmitInfo(100002);
                }else{
                    //无需自动注册，直接登录
                    var cache=  CacheServiceBus.getMemoryCache();
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, DoctorPatientRelationService.retInfo);
                    LoginService.saveUserInfoToCacheQuyiApp(DoctorPatientRelationService.retInfo,"",0);

                    if(objParams.hospitalID&&objParams.hospitalID!=""){
                        //切换医院
                        LoginService.isMessageSkip = true;
                        LoginService.skipRoute = decodeURIComponent(objParams.skipRoute);
                        LoginService.isQrcodeSkip = 1;
                        LoginService.handleSelectHos(DoctorPatientRelationService.retInfo);
                    }else{
                        LoginService.isMessageSkip = true;
                        LoginService.skipRoute = decodeURIComponent(objParams.skipRoute);
                        LoginService.getSelectCustomInfo();//登陆成功，查询登陆账户下选择的就诊者
                    }
                }
            }
            //扫描二维码跳转就诊卡充值页面
            if(objParams.businessType==3){
                if(1!=$scope.notCheckCode){// 用户信息是手动填写的
                    toSubmitInfo(100003);
                }else{
                    //无需自动注册，直接登录
                    var cache=  CacheServiceBus.getMemoryCache();
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, DoctorPatientRelationService.retInfo);
                    LoginService.saveUserInfoToCacheQuyiApp(DoctorPatientRelationService.retInfo,"",0);

                    if(objParams.hospitalID&&objParams.hospitalID!=""){
                        //切换医院
                        LoginService.isMessageSkip = true;
                        LoginService.skipRoute = decodeURIComponent(objParams.skipRoute);
                        LoginService.isQrcodeSkip = 1;
                        LoginService.handleSelectHos(DoctorPatientRelationService.retInfo);
                    }else{
                        LoginService.isMessageSkip = true;
                        LoginService.skipRoute = decodeURIComponent(objParams.skipRoute);
                        LoginService.getSelectCustomInfo();//登陆成功，查询登陆账户下选择的就诊者
                    }
                }
            }
            //扫描二维码跳转门诊缴费页面
            if(objParams.businessType==4){
                if($scope.paymentAdditionalCard){
                    ClinicPaymentReviseService.queryObj = {};
                    ClinicPaymentReviseService.queryObj.patientId = $scope.patientInfo.cardNo;
                    ClinicPaymentReviseService.useNewPaymentInterface = true;
                }
                if(1!=$scope.notCheckCode){// 用户信息是手动填写的
                    toSubmitInfo(100004);
                }else{
                    //无需自动注册，直接登录
                    var cache=  CacheServiceBus.getMemoryCache();
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, DoctorPatientRelationService.retInfo);
                    LoginService.saveUserInfoToCacheQuyiApp(DoctorPatientRelationService.retInfo,"",0);

                    if(objParams.hospitalID&&objParams.hospitalID!=""){
                        //切换医院
                        LoginService.isMessageSkip = true;
                        LoginService.skipRoute = decodeURIComponent(objParams.skipRoute);
                        LoginService.isQrcodeSkip = 1;
                        LoginService.handleSelectHos(DoctorPatientRelationService.retInfo);
                    }else{
                        LoginService.isMessageSkip = true;
                        LoginService.skipRoute = decodeURIComponent(objParams.skipRoute);
                        LoginService.getSelectCustomInfo();//登陆成功，查询登陆账户下选择的就诊者
                    }
                }
            }
            //扫描二维码跳转住院预缴页面
            if(objParams.businessType==5){
                if($scope.paymentAdditionalInpNo){
                    PerpaidService.isFromQRCode = true;
                    PerpaidPayInfoService.isFromQRCode = true;
                    PerpaidPayInfoService.inNoQRCode = $scope.patientInfo.inpNo;
//                    PerpaidService.permissionData.INP_NO = $scope.patientInfo.inpNo;
                }
                if(1!=$scope.notCheckCode){// 用户信息是手动填写的
                    toSubmitInfo(100005);
                }else{
                    //无需自动注册，直接登录
                    var cache=  CacheServiceBus.getMemoryCache();
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, DoctorPatientRelationService.retInfo);
                    LoginService.saveUserInfoToCacheQuyiApp(DoctorPatientRelationService.retInfo,"",0);

                    if(objParams.hospitalID&&objParams.hospitalID!=""){
                        //切换医院
                        LoginService.isMessageSkip = true;
                        LoginService.skipRoute = decodeURIComponent(objParams.skipRoute);
                        LoginService.isQrcodeSkip = 1;
                        LoginService.handleSelectHos(DoctorPatientRelationService.retInfo);
                    }else{
                        LoginService.isMessageSkip = true;
                        LoginService.skipRoute = decodeURIComponent(objParams.skipRoute);
                        LoginService.getSelectCustomInfo();//登陆成功，查询登陆账户下选择的就诊者
                    }
                }
            }
            //微信扫码标准医患互动二维码点击推送的图文消息跳转至咨询医生列表
            if(objParams.businessType==8){
                toSubmitInfo(100006);
            }
            if(objParams.businessType==9){

                toSubmitInfo(10);
            }
            /**
             * 菜单过来的自动注册
             */
            
            if('1'==objParams.isNeedAutoRegister){
                var cache = CacheServiceBus.getMemoryCache();
                var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                var openId = objParams.openid;
                var userInfo = {
                    PHONE_NUMBER:$scope.patientInfo.phoneNumber,
                    ID_NO:$scope.patientInfo.idNo,
                    NAME:$scope.patientInfo.patientName,
                    REGISTER_SOURCE:"7",
                    OPEN_ID:openId,
                    CHECK_CODE:$scope.patientInfo.msgCode
                };
                LoginService.submitUserAndPatient(userInfo,null,function(retUser){
                    LoginService.loginOff();
                    LoginService.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, userInfo.USER_INFO);
                    LoginService.saveUserInfoToCacheQuyiApp(retUser,"",0);
                    LoginService.isMessageSkip = true;
                    LoginService.skipRoute = decodeURIComponent(objParams.wx_forward);
                    LoginService.getIMLoginInfo();
                    LoginService.getSelectCustomInfo();//登陆成功，查询登陆账户下选择的就诊者

                })
            }
        };
        /**
         *提交用户信息
         */
        var toSubmitInfo = function(REGISTER_SOURCE){
            var cache = CacheServiceBus.getMemoryCache();
            var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
            var openId = objParams.openId;
            var userInfo = {
                PHONE_NUMBER:$scope.patientInfo.phoneNumber,
                ID_NO:$scope.patientInfo.idNo,
                NAME:$scope.patientInfo.patientName,
                REGISTER_SOURCE:REGISTER_SOURCE,
                OPEN_ID:openId,
                CHECK_CODE:$scope.patientInfo.msgCode
            };
            if(REGISTER_SOURCE == 9){
                AttendingDoctorService.patientInfo = userInfo;
            }
            if(objParams.registType!= undefined) {
                QuestionnaireSearchService.deptType=objParams.deptType;
                objParams.skipRoute = "questionnaire_search";
            }
            LoginService.autoRegisterAndLogin(userInfo,objParams.skipRoute,objParams.hospitalID);
        };
       var isEmpty = function(data){
            if(data==undefined||data==null||data==''){
                return true;
            }else{
                return false;
            }
       };
        var checkCardOrInpNo = function(card){
            if (!card) {// 卡号为空，返回false
                return false;
            } else {
                if (card.length > 50) {// 判断卡号是否大于50(目前数据库中为50)
                    return false;
                }
                if (/.*[\u4e00-\u9fa5]+.*$/.test(card)) {
                    return false;
                }
            }
            return true;
        };

        /**
         * 获取验证码点击事件
         */
        $scope.getMsgCode = function () {
            //效验手机号
            if (!AddCustomPatientService.validatePhoneNum($scope.patientInfo.phoneNumber)) {
                return ;
            }
            //获取短信验证码
            DoctorPatientRelationService.sendCheckCode($scope.patientInfo.phoneNumber,function(data){
                //按钮冻结时间为120秒
                if(data){
                    if(data.data.SECURITY_CODE=='007'){
                        second = data.data.secondsRange;
                    }
                    else {
                        second = 120;
                    }
                }
                setBtnState();
                $scope.btnDisabled = true;
                timer = KyeeUtilsService.interval({
                    time: 1000,
                    action: function () {
                        second--;
                        setBtnState(timer);
                    }
                });
            });
        };
        //短信验证码倒计时
        function setBtnState(timer) {
            try {
                if (second > 0) {
                    $scope.btnDisabled = true;
                    var remainder = "剩余";
                    var sec = "秒";
                    $scope.msgText = remainder + second + sec;
                } else {
                    $scope.btnDisabled = false;
                    $scope.msgText = "获取验证码";
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            } catch (e) {
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        }
        //监听页面离开
        KyeeListenerRegister.regist({
            focus: "doctor_patient_relation",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                $scope.btnDisabled = false;
                $scope.msgText = "获取验证码";
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        });
        $scope.toGoLogin = function(){
            var cache = CacheServiceBus.getMemoryCache();
            var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
            if(objParams&&objParams!=null&&objParams!=undefined&&objParams!=''){
                var openId = objParams.openid;
                if(openId){
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_OPEN_ID, openId);
                }
                LoginService.isMessageSkip = true;
                if(objParams.wx_forward){
                    if(objParams.wx_forward == "healthCard"){
                        LoginService.isShowRegist = false;
                    }
                    LoginService.skipRoute = decodeURIComponent(objParams.wx_forward);
                }else{
                    LoginService.skipRoute = decodeURIComponent("home->MAIN_TAB");
                }
                $state.go("login");
            }
        }


        /**
         * 页面回退监听
         */
        $scope.backToFrom = function () {
            $ionicHistory.goBack(-1);
        };
        /**
         * 监听物理返回键保证和页面返回键一样
         */
        KyeeListenerRegister.regist({
            focus: "doctor_patient_relation",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backToFrom();
            }
        });


    })
    .build();