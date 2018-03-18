new KyeeModule()
    .group("kyee.quyiyuan.dept.patient.relation.controller")
    .require([
        "kyee.quyiyuan.dept.patient.relation.service",
        "kyee.quyiyuan.patients_group.questionnaire_search.controller",
        "kyee.quyiyuan.patients_group.questionnaire_search.service"
    ])
    .type("controller")
    .name("DeptPatientRelationController")
    .params(["$timeout","$ionicHistory","$interval","ReportMultipleService","$scope","$state","KyeeListenerRegister",
        "KyeeMessageService","CacheServiceBus","DeptPatientRelationService","AttendingDoctorService","KyeeUtilsService",
        "ShowWebPageService","DeptPatientRelationService","CenterUtilService","DoctorPatientRelationService",
        "LoginService","KyeeI18nService","QuestionnaireSearchService","AddCustomPatientService","AuthenticationService",
        "CustomPatientService"])
    .action(function ($timeout,$ionicHistory,$interval,ReportMultipleService,$scope,$state,KyeeListenerRegister,
                      KyeeMessageService,CacheServiceBus,DeptPatientRelationService,AttendingDoctorService,KyeeUtilsService,
                      ShowWebPageService,DeptPatientRelationService,CenterUtilService,DoctorPatientRelationService,
                      LoginService,KyeeI18nService,QuestionnaireSearchService,AddCustomPatientService,AuthenticationService,
                      CustomPatientService) {
        //定时器
        var timer = {};
        var second;
        var startDate = new Date();
        $scope.yearRange = (startDate.getFullYear() - 18) + '->' + (startDate.getFullYear());
        $scope.count = 1;
        var cacheMemory = CacheServiceBus.getMemoryCache(); //Memory缓存
        $scope.userAddType = "register_user";
        KyeeListenerRegister.regist({
            focus: "dept_patient_relation",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction : "both",
            action: function (params) {
                $scope.patientInfo = {
                    CLINIC_DATE:"",//当前日期或选择的日期或根据身份证号转换的日期
                    BIRTHDAY:"",//出生日期
                    patientName:"",
                    phoneNumber:"",
                    phoneNumberReadonly:false,
                    idNoView:"",
                    msgCode:"",
                    hospitalizationNo:"",
                    clinicNo:"",
                    isNeedMessageCode:true,
                    showAge:1,
                    isChild:0,
                    sexView:"", //性别
                    sexBox: true //性别控制
                };
                $scope.currentUserInfo = cacheMemory.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                if($scope.currentUserInfo &&$scope.currentUserInfo.PHONE_NUMBER ){
                    $scope.patientInfo.phoneNumber = $scope.currentUserInfo.PHONE_NUMBER;
                    DeptPatientRelationService.currentUserPhoneNum = $scope.currentUserInfo.PHONE_NUMBER;
                    $scope.patientInfo.isNeedMessageCode = false;
                    $scope.userAddType = "add_userVsId";
                }
                if(DeptPatientRelationService.isChild){
                    $scope.patientInfo.isChild = DeptPatientRelationService.isChild;
                    if(DeptPatientRelationService.isChild==1){
                        $scope.patientInfo.sexBox = false;
                    }
                }
                $scope.msgText = "获取验证码";
                second = 120;
                $scope.btnDisabled = true;
                $scope.deptType = DeptPatientRelationService.deptType;

            }
        });

        /**
         * 是否选择儿童选项的点击事件
         */
        $scope.isSelectChild = function () {
            isShowBirthday();    //是否展示生日的逻辑改变
            isAllowSelectSex();  //是否可以选择性别控制
        };

        /**
         * 儿童的生日
         */
        $scope.selectChildAge = function () {
            if (!$scope.patientInfo.idNoView) {
                $scope.show();
            }
        };
        /**
         * 处理生日数据
         */
        var dealWithBirthday = function () {
            if ($scope.patientInfo.BIRTHDAY && $scope.patientInfo.BIRTHDAY != "") {

            } else if ($scope.patientInfo.isChild == 1) {
                $scope.patientInfo.BIRTHDAY = $scope.patientInfo.CLINIC_DATE;
            } else {
                $scope.patientInfo.BIRTHDAY = KyeeUtilsService.DateUtils.getDate("YYYY-MM-DD"); //什么都没有的情况下返回当前日期
            }
        };
        /**
         * 绑定日期组件方法
         * @param params
         */
        $scope.bind = function (params) {
            $scope.show = params.show;
        };
        /**
         * 选择日期完成
         * @param params
         * @returns {boolean}
         */
        $scope.onFinash = function (params) {
            var tempDate=new Date(params[0].value,parseInt(params[1].value-1),params[2].value);
            var currentDate = new Date();
            if(tempDate>currentDate){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("add_patient_info.checkBirthDate", "出生日期不能大于当天！")
                });
                $scope.patientInfo.CLINIC_DATE = "";
                return false;
            }else{
                if(params[1].value<10){
                    params[1].value ="0"+params[1].value;
                }
                if(params[2].value<10){
                    params[2].value ="0"+params[2].value;
                }
                $scope.patientInfo.CLINIC_DATE = params[0].value + "-" + params[1].value + "-" + params[2].value;
                return true;
            }
        };
        /**
         * 身份证号改变触发性别改变
         */
        $scope.idNoChangeSex = function () {
            $scope.patientInfo.idNoView = $scope.patientInfo.idNoView.toUpperCase();
            var ID_NO = $scope.patientInfo.idNoView;
            var Id = ID_NO.trim();
            var sex = Id.substring(16, 17);
            if (!isNaN(sex)) {
                if (Id.length > 16) {
                    if (sex % 2 == 0) {
                        $scope.patientInfo.sexView = 2;
                    } else {
                        $scope.patientInfo.sexView = 1;
                    }
                }
            }
        };
        /**
         * 是否展示生日选择框控制
         */
        var isShowBirthday = function () {
            $scope.patientInfo.showAge = !$scope.patientInfo.showAge;
            if ($scope.patientInfo.isChild == '0' || $scope.patientInfo.isChild == 0) {
                $scope.patientInfo.isChild = 1;
            } else {
                $scope.patientInfo.isChild = 0;
            }
        };
        /**
         * 自动计算年龄
         * @returns {*}
         */
        $scope.autoBirthday = function () {
            $scope.textColor = "qy-grey7";
            if ($scope.patientInfo.idNoView && DeptPatientRelationService.idNoCheck($scope.patientInfo.idNoView)) {
                $scope.patientInfo.CLINIC_DATE = DeptPatientRelationService.convertIdNo($scope.patientInfo.idNoView);
            }
            if ($scope.patientInfo.CLINIC_DATE) {
                return $scope.patientInfo.CLINIC_DATE;
            }else{
                $scope.textColor = "qy-grey5";
                return KyeeI18nService.get("add_patient_info.chooseBirthDate", "请选择出生日期");
            }
        };
        /**
         * 是否可以选择性别控制
         */
        var isAllowSelectSex = function () {
            $scope.patientInfo.sexBox = !$scope.patientInfo.sexBox;
        };
        /**
         * 男性按钮触发事件
         */
        $scope.selectMen = function () {
            $scope.patientInfo.sexView = 1;
        };
        /**
         * 女性按钮的触发事件
         */
        $scope.selectWomen = function () {
            $scope.patientInfo.sexView = 2;
        };

        //当用户重新编辑手机号码时，获取验证码那一栏会展示。当重新录入的手机号码跟原用户手机号码一致时，验证码又消失。
        $scope.checkEmptyPhoneNumber = function(){
            if($scope.patientInfo.phoneNumber != DeptPatientRelationService.currentUserPhoneNum){
                //需短信验证
                $scope.patientInfo.isNeedMessageCode = true;
            }else{
                //不需要短信验证
                $scope.patientInfo.isNeedMessageCode = false;
            }
        };

        /**
         * 提交
         * @param count
         */
        $scope.submitPatientData = function(count){
            if(isEmpty($scope.patientInfo.patientName)){
                KyeeMessageService.broadcast({
                    content:"请输入您的真实姓名"
                });
                return ;
            }
            if(count==1 && $scope.deptType==0 && isEmpty($scope.patientInfo.hospitalizationNo)){
                KyeeMessageService.broadcast({
                    content:"请输入您的住院号"
                });
                return ;
            }
            if(count==1 && $scope.deptType==1 && isEmpty($scope.patientInfo.clinicNo)){
                KyeeMessageService.broadcast({
                    content:"请输入您的门诊号"
                });
                return ;
            }
            if(count==2&&isEmpty($scope.patientInfo.phoneNumber)){
                KyeeMessageService.broadcast({
                    content:"请输入您的手机号码"
                });
                return ;
            }
            //校验手机号
            if (count==2&&!DeptPatientRelationService.validatePhoneNum($scope.patientInfo.phoneNumber)) {
                return ;
            }
            if(count==2&&$scope.patientInfo.isChild==0&&isEmpty($scope.patientInfo.idNoView)){
                KyeeMessageService.broadcast({
                    content:"请输入您的身份证号码"
                });
                return ;
            }
            //校验身份证
            if (count==2&&!isEmpty($scope.patientInfo.idNoView)&&!CenterUtilService.idNoCheck($scope.patientInfo.idNoView)) {
                KyeeMessageService.broadcast({
                    content:"身份证格式错误！"
                });
                return ;
            }
            if(count==2&&$scope.patientInfo.isChild==1&&isEmpty($scope.patientInfo.idNoView)&&isEmpty($scope.patientInfo.CLINIC_DATE)){
                KyeeMessageService.broadcast({
                    content:"请选择出生日期"
                });
                return ;
            }
            //检验验证码
            if(count==2&& $scope.patientInfo.isNeedMessageCode &&isEmpty($scope.patientInfo.msgCode)){
                KyeeMessageService.broadcast({
                    content: "请输入验证码！"
                });
                return ;
            }
            if(count==2&&$scope.patientInfo.isChild==1&&isEmpty($scope.patientInfo.sexView)){
                KyeeMessageService.broadcast({
                    content: "请选择性别！"
                });
                return ;
            }
            dealWithBirthday();
            toSubmitInfo(10);

        };
        /**
         *提交用户信息
         */
        var toSubmitInfo = function(REGISTER_SOURCE){
            var objParams = cacheMemory.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
            var openId = objParams.openId;
            var userInfo = {
                PHONE_NUMBER:$scope.patientInfo.phoneNumber,
                ID_NO:$scope.patientInfo.idNoView,
                NAME:$scope.patientInfo.patientName,
                REGISTER_SOURCE:REGISTER_SOURCE,
                OPEN_ID:openId,
                CHECK_CODE:$scope.patientInfo.msgCode,
                isCheckSecurityCode:$scope.patientInfo.isNeedMessageCode,
                IS_CHILD:$scope.patientInfo.isChild,
                DATE_OF_BIRTH:$scope.patientInfo.BIRTHDAY,
                SEX:$scope.patientInfo.sexView
            };

            if($scope.count==2){
                QuestionnaireSearchService.deptType=objParams.deptType;
                QuestionnaireSearchService.clinicNo = $scope.patientInfo.clinicNo;
                QuestionnaireSearchService.hospitalizationNo = $scope.patientInfo.hospitalizationNo;
                objParams.skipRoute = "questionnaire_search";
                if($scope.userAddType == "register_user"){
                    LoginService.autoRegisterAndLogin(userInfo,objParams.skipRoute,objParams.hospitalID);
                }else if($scope.userAddType == "add_userVsId"){
                    addCustomPatient();
                }
            }else{
                var checkParams = {
                    hospitalizationNo:$scope.patientInfo.hospitalizationNo,//住院号
                    clinicNo:$scope.patientInfo.clinicNo,//门诊号
                    phoneNumber:$scope.patientInfo.phoneNumber,//手机号
                    idNo:$scope.patientInfo.idNoView,//身份证号
                    patientName:$scope.patientInfo.patientName,//姓名
                    deptType:objParams.deptType,//科室类型
                    deptCode:objParams.deptCode,
                    hospitalId:objParams.hospitalId,
                    isChild:$scope.patientInfo.isChild //是否儿童
                };
                AttendingDoctorService.getHplusUserInf(checkParams,function (response) {
                    if (response.success) {
                        var data = response.data;
                        var followCode = data.followCode;
                        if(followCode=="000"){
                            if($scope.userAddType == "register_user"){
                                userInfo.isCheckSecurityCode = false;
                                userInfo.ID_NO = data.userInfo.idNo;
                                userInfo.DATE_OF_BIRTH = data.userInfo.dateOfBirth;
                                userInfo.SEX =data.userInfo.sex;
                                if(!$scope.patientInfo.phoneNumber){
                                    userInfo.PHONE_NUMBER = data.userInfo.phoneNumber;
                                }
                                QuestionnaireSearchService.deptType=objParams.deptType;
                                QuestionnaireSearchService.hospitalizationNo = $scope.patientInfo.hospitalizationNo;
                                QuestionnaireSearchService.clinicNo = $scope.patientInfo.clinicNo;
                                objParams.skipRoute = "questionnaire_search";
                                LoginService.autoRegisterAndLogin(userInfo,objParams.skipRoute,objParams.hospitalID);
                            }else if($scope.userAddType == "add_userVsId"){
                                $scope.patientInfo.phoneNumber = data.userInfo.phoneNumber;
                                $scope.patientInfo.idNoView = data.userInfo.idNo;
                                $scope.patientInfo.BIRTHDAY= data.userInfo.dateOfBirth;
                                $scope.patientInfo.sexView =data.userInfo.sex;
                                addCustomPatient();
                            }

                        }else{
                            //跳转到补录信息页面
                            $scope.count = 2;
                            $state.go("dept_patient_relation");
                        }
                    }else{
                        //跳转到补录信息页面
                        $scope.count = 2;
                        $state.go("dept_patient_relation");
                    }
                });
            }
        };
        //添加新就诊者并切换为当前就诊者
        var addCustomPatient = function () {
            $scope.post = JSON.stringify(
                {
                    STATUS: 1,
                    SECURITY_CODE: $scope.patientInfo.msgCode,
                    SEX: $scope.patientInfo.sexView,
                    IS_CHILD: $scope.patientInfo.isChild,
                    DATE_OF_BIRTH: $scope.patientInfo.BIRTHDAY,
                    USER_ID:$scope.currentUserInfo.USER_ID,
                    OFTEN_NAME: $scope.patientInfo.patientName,
                    PHONE: $scope.patientInfo.phoneNumber,
                    ID_NO: $scope.patientInfo.idNoView,
                    FLAG: 1,
                    ID_NO_SECERT: $scope.patientInfo.idNoView
                });
            var objParams = cacheMemory.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
            DeptPatientRelationService.addCustomPatient($scope.post, objParams.hospitalID,$scope.patientInfo.isNeedMessageCode, function (data) {
                if (data.success) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("add_patient_info.addPeopleSuccess", "添加就诊者成功！")
                    });
                    changePatient(data.data.USER_VS_ID,objParams.hospitalID);
                } else if (data && data.message) {
                    //异常接收与提示
                    KyeeMessageService.broadcast({
                        content: data.message
                    });
                } else {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("add_patient_info.addPeopleFalse", "添加就诊者失败！")
                    });
                }
            });
        };

        //切换就诊者
        var changePatient = function(userVsId,hospitalId) {
            var customPatient;
            //查询常用就诊者
            CustomPatientService.queryCustomPatient($scope.currentUserInfo.USER_ID, function (data) {
                var patients;
                if (data && data.data && data.success) {
                    patients = data.data;
                    if (patients && patients.length > 0) {
                        for (var i = 0; i < patients.length; i++) {
                            var patient = patients[i];
                            if (patient.USER_VS_ID == userVsId) {
                                customPatient = patient;
                            }
                        }
                        changeCurrentPatient(customPatient, hospitalId);
                    }
                }
            });
        }
        //切换为当前就诊者
        var changeCurrentPatient=function(customPatient, hospitalId){
            CustomPatientService.updateSelectFlag(customPatient, hospitalId, function (data) {
                if (data && data.success) {
                    LoginService.setPatientName(customPatient.OFTEN_NAME);
                    var cardInfo;
                    if (!customPatient.IMAGE_PATH) {
                        customPatient.IMAGE_PATH = "";
                    }
                    customPatient.IS_SELECTED = 1;

                    cacheMemory.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, {});
                    cacheMemory.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, customPatient);

                    //返回到指定页面
                    $state.go("questionnaire_search");

                } else {
                    if (data && data.message) {
                        if (data.resultCode != "0011401") {//0011401 为实名认证code，不进行随访业务拦截
                            KyeeMessageService.message({
                                title: KyeeI18nService.get("update_user.sms", "消息"),
                                content: data.message,
                                okText: KyeeI18nService.get("custom_patient.iRealKnow", "我知道了！")
                            });
                        }
                    } else {
                        //异常接收与提示
                        KyeeMessageService.message({
                            title: KyeeI18nService.get("update_user.sms", "消息"),
                            content: KyeeI18nService.get("custom_patient.switchPatientsFailed", "切换就诊者失败！"),
                            okText: KyeeI18nService.get("custom_patient.iRealKnow", "我知道了！")
                        });
                    }
                }
            });
        };

        //非空判断
        var isEmpty = function(data){
            if(data==undefined||data==null||data==''){
                return true;
            }else{
                return false;
            }
        };

        /**
         * 获取验证码点击事件
         */
        $scope.getMsgCode = function () {
            //效验手机号
            if (!DeptPatientRelationService.validatePhoneNum($scope.patientInfo.phoneNumber)) {
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
                    $scope.patientInfo.phoneNumberReadonly = true;
                    var remainder = "剩余";
                    var sec = "秒";
                    $scope.msgText = remainder + second + sec;
                } else {
                    $scope.btnDisabled = false;
                    $scope.patientInfo.phoneNumberReadonly = false;
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
            focus: "dept_patient_relation",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backToFrom();
            }
        });


    })
    .build();