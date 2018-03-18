/**
 * 产品名称：quyiyuan
 * 创建者：futian
 * 创建时间： 2017/1/9
 * 创建原因：二维码跳转控制页面
 */
new KyeeModule()
.group("kyee.quyiyuan.qycode.controller")
 .require([
    "kyee.quyiyuan.messageSkip.service",
    "kyee.quyiyuan.qrcodeSkip.service",
    "kyee.quyiyuan.myWallet.clinicPaymentRevise.service",
    "kyee.quyiyuan.myWallet.perpaid.service",
    "kyee.quyiyuan.myWallet.perpaidPayInfo.service",
     "kyee.quyiyuan.consultation.consult_doctor_list.service",
     "kyee.quyiyuan.patients_group.attending_doctor.controller",
     "kyee.quyiyuan.patients_group.attending_doctor.service",
     "kyee.quyiyuan.doctor.patient.relation.record_patient_info.controller",
     "kyee.quyiyuan.dept.patient.relation.controller",
     "kyee.quyiyuan.patients_group.questionnaire_search.controller",
     "kyee.quyiyuan.patients_group.questionnaire_search.service",
     "kyee.quyiyuan.patients_group.my_doctor.select_patient_list.controller",
     "kyee.quyiyuan.patients_group.my_doctor.select_patient_list.service"
])
 .type("controller")
 .name("QRCodeController")
 .params(["$timeout","ReportMultipleService","HospitalService","DoctorPatientRelationService",
    "AccountAuthenticationService","$scope", "$state","QRCodeSkipService","KyeeListenerRegister",
    "MessageSkipService","CenterUtilService","CacheServiceBus","KyeeMessageService","LoginService",
    "ClinicPaymentReviseService","PerpaidService","PerpaidPayInfoService","PatientCardRechargeService",
    "AppointmentDoctorDetailService","AppointmentDeptGroupService", "ConsultDoctorListService",
     "AttendingDoctorService","DeptPatientRelationService","ShowWebPageService",
    "QuestionnaireSearchService","SelectPatientListService"])
 .action(function ($timeout,ReportMultipleService,HospitalService,DoctorPatientRelationService,
                   AccountAuthenticationService,$scope, $state,QRCodeSkipService,KyeeListenerRegister,
                   MessageSkipService,CenterUtilService,CacheServiceBus,KyeeMessageService,LoginService,
                   ClinicPaymentReviseService,PerpaidService,PerpaidPayInfoService,PatientCardRechargeService,
                   AppointmentDoctorDetailService,AppointmentDeptGroupService, ConsultDoctorListService,
                   AttendingDoctorService,DeptPatientRelationService,ShowWebPageService,
                   QuestionnaireSearchService,SelectPatientListService) {
    KyeeListenerRegister.regist({
        focus: "qrcode_skip_controller",
        when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
        direction: "both",
        action: function (params) {
            loginOff();
            //根据用户ID和就诊者ID查询用户信息状态
            var cache = CacheServiceBus.getMemoryCache();
            var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
            var skipRoute ="";
            var openId = objParams.openId;
            var token = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK);
            var hospitalId = objParams.hospitalID;
            if(1==objParams.businessType){     //扫描医生二维码之后，点击公众号发过来的医生卡片的链接跳转至医生主页
                AppointmentDoctorDetailService.doctorQRcodeData = { //标志扫医生二维码跳转至医生主页 并传递数据
                    hospitalId: decodeURI(objParams.hospitalID),
                    deptCode: decodeURI(objParams.deptCode),
                    doctorCode: decodeURI(objParams.doctorCode)
                };
                LoginService.REGISTER_INFO.HOSPITAL_ID=objParams.hospitalID;
                LoginService.REGISTER_INFO.REGISTER_SOURCE="100001";//统计注册来源
                LoginService.REGISTER_INFO.IS_RECORD_REGISTER=1;
                LoginService.REGISTER_INFO.DEPT_CODE=decodeURI(objParams.deptCode);
                LoginService.REGISTER_INFO.DOCTOR_CODE=decodeURI(objParams.doctorCode);
                skipRoute="doctor_info";
            }else if(2==objParams.businessType){
                skipRoute="index_hosp";
            }else if(3==objParams.businessType){
                skipRoute="patient_card_recharge";
            }else if(4==objParams.businessType){
                skipRoute="clinic_payment_revise";
            }else if(5==objParams.businessType){
                skipRoute="perpaid_pay_info";
            }else if(6==objParams.businessType){//微信公众号跳转到医生主页，缓存医院不等临时解决方案
                skipRoute="doctor_info";
            }else if(0==objParams.businessType){
                skipRoute="home->MAIN_TAB";
            }else if(7==objParams.businessType){
                skipRoute="patient_card_recharge";
            }else if(8==objParams.businessType){//微信扫码标准医患互动二维码点击推送的图文消息跳转至咨询医生列表
                ConsultDoctorListService.hospitalId = objParams.hospitalId || objParams.hospitalID;
                skipRoute="consult_doctor_list";
            }else if(9 == objParams.businessType){
                AttendingDoctorService.hospitalId = objParams.hospitalId;
                AttendingDoctorService.deptCode = objParams.deptCode;
                LoginService.REGISTER_INFO.HOSPITAL_ID=objParams.hospitalID;
                LoginService.REGISTER_INFO.REGISTER_SOURCE="10";//统计注册来源
                LoginService.REGISTER_INFO.IS_RECORD_REGISTER=1;
                LoginService.REGISTER_INFO.DEPT_CODE=decodeURI(objParams.deptCode);
                skipRoute = "attending_doctor";
            }else{
                $state.go("home->MAIN_TAB");
                return;
            }
            if(skipRoute!=""){
                objParams.skipRoute=skipRoute;
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL,objParams);
            }
            if(0==objParams.businessType){
                LoginService.REGISTER_INFO.HOSPITAL_ID=hospitalId;
                LoginService.REGISTER_INFO.REGISTER_SOURCE="100007";//统计注册来源
                LoginService.REGISTER_INFO.IS_RECORD_REGISTER=1;
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_OPEN_ID, openId);
                QRCodeSkipService.addRecord(objParams);
                $state.go("home->MAIN_TAB");
                return;
            }else if(6==objParams.businessType){
                var deptData = {};
                deptData.DEPT_CODE = objParams.deptCode;
                deptData.DEPT_NAME = decodeURI(objParams.deptName);
                deptData.DOCTOR_CODE = objParams.doctorCode;
                deptData.DOCTOR_TITLE = objParams.doctorTitle;
                deptData.DOCTOR_DESC = objParams.doctorDesc;
                deptData.DOCTOR_NAME = decodeURI(objParams.doctorName);
                deptData.HOSPITAL_ID = objParams.hospitalId || objParams.hospitalID;
                deptData.HOSPITAL_NAME = decodeURI(objParams.hospitalName);
                deptData.IS_ONLINE = '0';
                AppointmentDoctorDetailService.doctorInfo = angular.copy(deptData);
                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = angular.copy(deptData);
                AppointmentDoctorDetailService.activeTab = 1;//医生主页"咨询医生"Tab
                LoginService.isAfterConsultInfo = 1;//记录微信诊后详情点击标志

                KyeeMessageService.loading({
                    content: undefined,
                    duration: 2000,
                    mask: true
                });
                //切换医院
                $timeout(function(){
                    ////缓存医院详情
                    if (!LoginService.selectHospital(hospitalId)) {
                        $state.go("doctor_info");
                    }
                }, 2000);
                return;
            }
            if(openId){//openID不为空
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_OPEN_ID, openId);

                QRCodeSkipService.addRecord(objParams);
                QRCodeSkipService.queryUserInfoByOpenId(true,openId,hospitalId, token,function(data){
                    //根据openID获取到用户信息
                    var resultData="";
                    if(data){
                        resultData= data.loginUser;
                    }
                    if(7==objParams.businessType){//一卡通
                        if(resultData&&resultData.USER_ID&&resultData.USER_ID!=0){//获取到用户
                            PatientCardRechargeService.webJump = true;
                            PatientCardRechargeService.isSelectHos=false;

                            KyeeMessageService.loading({
                                content: undefined,
                                duration: 1000,
                                mask: true
                            });
                            //切换医院
                            $timeout(function(){
                                goToAutoLogin(resultData,skipRoute);
                            }, 1000);

                        }else{//获取到
                            $state.go("login");
                        }
                        return ;
                    }

                    if(resultData&&resultData.USER_ID&&resultData.USER_ID!=0&&resultData.PATIENT_COUNT>0){
                        objParams.USER_ID=resultData.USER_ID;
                        objParams.isLogin = 1;
                        QRCodeSkipService.addRecord(objParams);

                        if(1==objParams.businessType){
                            goToAutoLogin(resultData,skipRoute);
                        }
                        //报告单若用户 需查询开通方式
                        if(2==objParams.businessType){
                            //if(data.customPatient&&hospitalId!="1001"){
                            //    DoctorPatientRelationService.retInfo = resultData;
                            //    getReportParam(data.customPatient,resultData,skipRoute);
                            //}else{
                            //    goToAutoLogin(resultData,skipRoute);
                            //}
                            getReportParam(data.customPatient,resultData,skipRoute);

                        }
                        //就诊卡充值业务   需查询开通方式
                        if(3==objParams.businessType){
                            PatientCardRechargeService.webJump = true;
                            goToAutoLogin(resultData,skipRoute);
                        }
                        //门诊缴费
                        if(4==objParams.businessType){
                            if(data.customPatient&&hospitalId!="1001"){
                                DoctorPatientRelationService.retInfo = resultData;
                                getClinicPaymentParam(data.customPatient,resultData,skipRoute);
                            }else{
                                goToAutoLogin(resultData,skipRoute);
                            }
                        }
                        //住院预缴
                        if(5==objParams.businessType){
                            console.log("objParams.businessType"+objParams.businessType);
                            if(data.customPatient&&hospitalId!="1001"){
                                DoctorPatientRelationService.retInfo = resultData;
                                getInHosPreChargeParam(data.customPatient,resultData,skipRoute);
                            }else{
                                goToAutoLogin(resultData,skipRoute);
                            }
                        }
                        //微信扫码标准医患互动二维码点击推送的图文消息跳转至咨询医生列表
                        if(8==objParams.businessType){
                            goToAutoLogin(resultData,skipRoute);
                        }
                        if(9==objParams.businessType){
                            //有openId，
                            // 若为新版随访（registType有定义），跳转到选择/添加就诊者页面；
                            // 若不是新版随访，按照原skipRoute到选择主治医生页面
                            if(objParams.registType!=undefined){
                                SelectPatientListService.registType = objParams.registType;//注册类型：全部/部分填写
                                SelectPatientListService.deptType = objParams.deptType;//科室类型：住院/门诊
                                if(objParams.isChild!=undefined){
                                    SelectPatientListService.isChild=objParams.isChild;//是否儿童码
                                }else{
                                    SelectPatientListService.isChild = 0;
                                }
                                skipRoute = "select_patient_list";
                            }
                            goToAutoLogin(resultData,skipRoute);
                        }

                    }else{//跳转至信息录入页面
                        goTopatientRelation(resultData,skipRoute);
                    }
                });
            }else{//跳转至信息录入页面
                goTopatientRelation(null,skipRoute);
            }
        }
    });

    /**
     * 住院预缴逻辑
     * @param customPatient
     * @param resultData
     * @param skipRoute
     */
    var getInHosPreChargeParam = function(customPatient,resultData,skipRoute){
        var paraName = "queryPreFeeType";
        var cache = CacheServiceBus.getMemoryCache();
        var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
        var hospitalId = objParams.hospitalID;

        HospitalService.getParamValueByName(hospitalId,paraName,function (hospitalPara) {
            if(1==hospitalPara.data.queryPreFeeType){
                DoctorPatientRelationService.paymentAdditionalInpNo = true;
                PerpaidService.isFromQRCode = true;
                //有就诊者
                if(customPatient){
                    DoctorPatientRelationService.patientInfo = {
                        OFTEN_NAME:customPatient.OFTEN_NAME,
                        ID_NO:customPatient.ID_NO,
                        PHONE:customPatient.PHONE
                    };
                }
                $state.go("doctor_patient_relation");
                return;
            }else{
                DoctorPatientRelationService.paymentAdditionalInpNo = false;
                PerpaidService.isFromQRCode = true;
                PerpaidPayInfoService.isFromQRCode = true;
                goToAutoLogin(resultData,skipRoute);
                return;
            }
        });
    }


    /**
     * 门诊代缴费逻辑
     * @param customPatient
     * @param resultData
     * @param skipRoute
     */
    var getClinicPaymentParam = function(customPatient,resultData,skipRoute){
        var paraName = "queryPayResType";
        var cache = CacheServiceBus.getMemoryCache();
        var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
        var hospitalId = objParams.hospitalID;

        HospitalService.getParamValueByName(hospitalId,paraName,function (hospitalPara) {
            if(1==hospitalPara.data.queryPayResType || 2==hospitalPara.data.queryPayResType){
                DoctorPatientRelationService.paymentAdditionalCard = true;
                //有就诊者
                if(customPatient){
                    DoctorPatientRelationService.patientInfo = {
                        OFTEN_NAME:customPatient.OFTEN_NAME,
                        ID_NO:customPatient.ID_NO,
                        PHONE:customPatient.PHONE
                    };
                }
                $state.go("doctor_patient_relation");
                return;
            }else{
                DoctorPatientRelationService.paymentAdditionalCard = false;
                ClinicPaymentReviseService.useNewPaymentInterface = true;
                goToAutoLogin(resultData,skipRoute);
                return;
            }
        });
    }

    /**
     * 报告单跳转逻辑
     * @param customPatient
     * @param resultData
     * @param skipRoute
     */
    var getReportParam = function(customPatient,resultData,skipRoute){
        var paraName = "checkType,inHospitalCheckType";
        var cache = CacheServiceBus.getMemoryCache();
        var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
        var hospitalId = objParams.hospitalID;

        HospitalService.getParamValueByName(hospitalId,paraName,function (hospitalPara) {
            if(0==hospitalPara.data.checkType&&0==hospitalPara.data.inHospitalCheckType){
                KyeeMessageService.message({
                    title : "提示",
                    content : "此功能暂未开放，敬请期待！",
                    okText : "我知道了"
                });
                return;
            }else{
                if(resultData&&resultData.PATIENT_COUNT>0){
                    ReportMultipleService.QUERY_TYPE=hospitalPara.data.checkType;
                    ReportMultipleService.QUERY_TYPE_INHOSPITAL=hospitalPara.data.inHospitalCheckType;
                    goToAutoLogin(resultData,skipRoute);
                }else{
                    ReportMultipleService.QUERY_TYPE=hospitalPara.data.checkType;
                    ReportMultipleService.QUERY_TYPE_INHOSPITAL=hospitalPara.data.inHospitalCheckType;

                    //门诊或住院支持就诊卡查询
                    if(ReportMultipleService.QUERY_TYPE==1||
                        ReportMultipleService.QUERY_TYPE==2||
                        ReportMultipleService.QUERY_TYPE_INHOSPITAL==1||
                        ReportMultipleService.QUERY_TYPE_INHOSPITAL==2){
                        DoctorPatientRelationService.reportAdditionalCard =1;
                    }
                    //住院支持住院号查询
                    if(ReportMultipleService.QUERY_TYPE_INHOSPITAL==6){
                        DoctorPatientRelationService.reportAdditionalInpNo =1;
                    }
                    $state.go("doctor_patient_relation");
                }
            }
        });
    };
    var goToAutoLogin= function(resultData,skipRoute){
        var cache = CacheServiceBus.getMemoryCache();
        var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
        var hospitalId = objParams.hospitalID;

        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, resultData);
        LoginService.saveUserInfoToCacheQuyiApp(resultData, "", 0);
        if (!resultData.ID_NO) {
            AccountAuthenticationService.isAuthSuccess = '0';
        }
        if (hospitalId && hospitalId != "") {
            //切换医院
            LoginService.isMessageSkip = true;
            LoginService.skipRoute = decodeURIComponent(skipRoute);
            LoginService.isQrcodeSkip = 1;
            LoginService.handleSelectHos(resultData);
        } else {
            LoginService.isMessageSkip = true;
            LoginService.skipRoute = decodeURIComponent(skipRoute);
            LoginService.getSelectCustomInfo();//登陆成功，查询登陆账户下选择的就诊者
        }
    };
    /**
     * 跳转信息录入页面
     */
    var goTopatientRelation = function(resultData,skipRoute){
        var cache = CacheServiceBus.getMemoryCache();
        var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
        //关注医生二维码
        if(1==objParams.businessType){
            var cache = CacheServiceBus.getMemoryCache();
            var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
            DoctorPatientRelationService.DOCTOR_UUID =objParams.UUID;
            DoctorPatientRelationService.doctorName = objParams.doctorName;
            DoctorPatientRelationService.deptName = objParams.deptName;
            $state.go("record_patient_idCard");
        }
        if(2==objParams.businessType){
            getReportParam(null,resultData,skipRoute);
        }
        //就诊卡充值业务
        if(3==objParams.businessType){
            $state.go("doctor_patient_relation");
        }
        //门诊缴费业务
        if(4==objParams.businessType){
            $state.go("doctor_patient_relation");
        }
        //住院预缴业务
        if(5==objParams.businessType){
            $state.go("doctor_patient_relation");
        }
        //微信扫码标准医患互动二维码(医院二维码)点击推送的图文消息跳转至咨询医生列表
        if(8==objParams.businessType){
            $state.go("doctor_patient_relation");
        }
        if(9==objParams.businessType){
            if(objParams.registType== undefined || objParams.registType==0
                || ( objParams.registType==1 && objParams.deptType==undefined)){
                DoctorPatientRelationService.registType = objParams.registType;
                DoctorPatientRelationService.deptType = objParams.deptType;
                //录入患者信息页面
                $state.go("doctor_patient_relation");
            }else{
                DeptPatientRelationService.registType = objParams.registType;
                DeptPatientRelationService.deptType = objParams.deptType;
                if(objParams.isChild!=undefined){
                    DeptPatientRelationService.isChild=objParams.isChild;//是否儿童码
                }else{
                    DeptPatientRelationService.isChild = 0;
                }
                //根据科室类型录入指定患者信息页面
                $state.go("dept_patient_relation");
            }
        }
    };
    var loginOff =function(){
        //清除缓存数据记录
        LoginService.frontPage = "-1";
        var cache = CacheServiceBus.getMemoryCache();
        var storageCache = CacheServiceBus.getStorageCache();
        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, "");
        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, "");
        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE, "");
        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_PWD,undefined);  //MemoryCache中的密码
        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, undefined);
        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, undefined);
        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, undefined);
        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO,undefined);
        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO,undefined);
        LoginService.logoff();
        LoginService.phoneNumberFlag = undefined;
    }
})
 .build();