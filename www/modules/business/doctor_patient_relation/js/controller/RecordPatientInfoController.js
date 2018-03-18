new KyeeModule()
    .group("kyee.quyiyuan.doctor.patient.relation.record_patient_info.controller")
    .require([
        "kyee.quyiyuan.doctor.patient.relation.service",
        "kyee.quyiyuan.myWallet.clinicPaymentRevise.service",
        "kyee.quyiyuan.myWallet.perpaidPayInfo.service",
        "kyee.quyiyuan.myWallet.perpaid.service",
        "kyee.quyiyuan.patients_group.attending_doctor.service",
        "kyee.quyiyuan.patients_group.attending_doctor.controller",
        "kyee.quyiyuan.qrcodeSkip.service",
        "kyee.quyiyuan.appointment.doctor_consultation.service"
    ])
    .type("controller")
    .name("RecordPatientInfoController")
    .params(["$timeout","$ionicHistory","$interval","ReportMultipleService","$scope","$state","KyeeListenerRegister","KyeeMessageService","CacheServiceBus","DoctorPatientRelationService",
        "AppointmentDoctorDetailService","AppointmentDeptGroupService","MyCareDoctorsService","HospitalSelectorService",
        "CenterUtilService","AddCustomPatientService","LoginService","KyeeUtilsService","ClinicPaymentReviseService","PerpaidPayInfoService","PerpaidService",
        "AttendingDoctorService","QRCodeSkipService","DoctorConsultationService"])
    .action(function ($timeout,$ionicHistory,$interval,ReportMultipleService,$scope,$state,KyeeListenerRegister,KyeeMessageService,CacheServiceBus,DoctorPatientRelationService,
                      AppointmentDoctorDetailService,AppointmentDeptGroupService,MyCareDoctorsService,HospitalSelectorService,
                      CenterUtilService,AddCustomPatientService,LoginService,KyeeUtilsService,ClinicPaymentReviseService,PerpaidPayInfoService,PerpaidService,
                      AttendingDoctorService,QRCodeSkipService,DoctorConsultationService){
        var timer = {};
        var second;
        KyeeListenerRegister.regist({
            focus: "record_patient_idCard",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction : "both",
            action: function (params) {
                $scope.patientInfo = {
                    patientName:"",
                    idNo:"",
                    patientNameReadonly:false,
                    idNoReadonly:false,
                };
                $scope.msgText = "获取验证码";
                second = 120;
                $scope.btnDisabled = false;

                //根据用户ID和就诊者ID查询用户信息状态
                var cache = CacheServiceBus.getMemoryCache();
                var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                $scope.businessType=objParams.businessType;

                $scope.isNeedAutoRegister = objParams.isNeedAutoRegister;
                $scope.DOCTOR_UUID = DoctorPatientRelationService.DOCTOR_UUID;
                var params =  {
                    hospitalId: objParams.hospitalId,
                    doctorCode: objParams.doctorCode,
                    deptCode: objParams.deptCode
                };
                DoctorConsultationService.getDoctorConsultationData(params,function(res){
                    var data = res.data.doctorVo;
                    $scope.doctor_name = data.doctorName;
                    $scope.doctor_pic = data.doctorPhoto;
                    $scope.dept_name = data.deptName;
                    $scope.doctor_sex = data.doctorSex;
                    DoctorPatientRelationService.doctorInfo = {
                        doctorName:$scope.doctor_name,
                        doctorPic:$scope.doctor_pic,
                        deptName:$scope.dept_name,
                        doctorSex:$scope.doctor_sex
                    }
                });
                var hospitalId = objParams.hospitalId;
                MyCareDoctorsService.queryHospitalInfo(hospitalId, function (res) {
                    $scope.hos_name = res.HOSPITAL_NAME//查询医院信息
                    DoctorPatientRelationService.hosName = $scope.hos_name;
                });


            }
        });
        KyeeListenerRegister.regist({
            focus: "record_patient_number",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction : "both",
            action: function (params) {
                $scope.patientInfo = {
                    phoneNumber:"",
                    msgCode:"",
                    phoneNumberReadonly:false,
                    notCheckCode:1
                };
                $scope.chooseContract  = true;
                $scope.msgText = "获取验证码";
                second = 120;
                $scope.btnDisabled = false;
                //上个页面保存的数据
                $scope.doctor_name = DoctorPatientRelationService.doctorInfo.doctorName;
                $scope.doctor_pic = DoctorPatientRelationService.doctorInfo.doctorPic;
                $scope.dept_name = DoctorPatientRelationService.doctorInfo.deptName;
                $scope.doctor_sex =DoctorPatientRelationService.doctorInfo.doctorSex;
                $scope.hos_name =  DoctorPatientRelationService.hosName;
            }
        });
        KyeeListenerRegister.regist({
            focus: "record_patient_number",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                $scope.btnDisabled = false;
                $scope.msgText = "获取验证码";
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        });
        /**
         * 更改选中阅读咨询条款提醒状态
         */
        $scope.changeStatusOnContract = function(){
            $scope.chooseContract = !$scope.chooseContract;
        };
        $scope.viewContract = function(){
            $state.go('consult_contract');
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
        };
        /**
         * 判断该变量是否为空
         * @param data
         * @returns {boolean}
         */
        var isEmpty = function(data){
            if(data==undefined||data == null||data == ''){
                return true;
            }else{
                return false;
            }
        };
        /**
         * 用户点击下一步，准备跳转到录入身份信息页面
         */
        $scope.next = function(){
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
            DoctorPatientRelationService.idCard = $scope.patientInfo.idNo;
            DoctorPatientRelationService.patientName = $scope.patientInfo.patientName;
            $state.go('record_patient_number');
        };
        /**
         * 提交患者信息
         */
        $scope.submit = function(){
            //效验手机号
            if(!$scope.patientInfo.phoneNumberReadonly&&isEmpty($scope.patientInfo.phoneNumber)){
                KyeeMessageService.broadcast({
                    content:"请输入您的手机号码"
                });
                return ;
            }
            if (!$scope.patientInfo.phoneNumberReadonly&&!AddCustomPatientService.validatePhoneNum($scope.patientInfo.phoneNumber)) {
                return ;
            }
            //校验验证码
            if( $scope.notCheckCode !=1&&isEmpty($scope.patientInfo.msgCode)){
                KyeeMessageService.broadcast({
                    content: "请输入验证码！"
                });
                return ;
            };
            var params = {
                DOCTOR_QR_CODE:DoctorPatientRelationService.DOCTOR_UUID,
                PATIENT_NAME:DoctorPatientRelationService.patientName,
                PHONE_NUMBER:$scope.patientInfo.phoneNumber,
                ID_NO:DoctorPatientRelationService.idCard
            };
            var cache = CacheServiceBus.getMemoryCache();
            var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
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
            if('1'==objParams.isNeedAutoRegister){
                var cache = CacheServiceBus.getMemoryCache();
                var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                var openId = objParams.openid;
                var userInfo = {
                    PHONE_NUMBER:$scope.patientInfo.phoneNumber,
                    ID_NO:DoctorPatientRelationService.idCard,
                    NAME:DoctorPatientRelationService.patientName,
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
                ID_NO:DoctorPatientRelationService.idCard,
                NAME:DoctorPatientRelationService.patientName,
                REGISTER_SOURCE:REGISTER_SOURCE,
                OPEN_ID:openId,
                CHECK_CODE:$scope.patientInfo.msgCode
            };
            LoginService.autoRegisterAndLogin(userInfo,objParams.skipRoute,objParams.hospitalID);
        };

        /**
         * 校验身份证格式
         * @param card
         * @returns {boolean}
         */
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

    }).build();