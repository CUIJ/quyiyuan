/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪
 * 创建日期:2015年5月4日10:18:09
 * 创建原因：选择就诊者控制
 * 修改人：付添
 * 修改原因：增加就诊者删除个数限制
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.controller.custom_patient")
    .require([
        "kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.custom_patient.service",
        "kyee.framework.service.view",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.home.noticeCenter.service",
        "kyee.quyiyuan.consultation.add_information.service",
        "kyee.quyiyuan.appointment.doctor_detail.service"
    ])
    .type("controller")
    .name("CustomPatientController")
    .params([
        "$scope",
        "$state",
        "KyeeViewService",
        "CustomPatientService",
        "CacheServiceBus",
        "LoginService",
        "HospitalSelectorService",
        "AddPatientInfoService",
        "AddCustomPatientService",
        "SelectCustomPatientDef",
        "CommPatientDetailService",
        "KyeeMessageService",
        "AuthenticationService",
        "UpdateUserService",
        "KyeeI18nService",
        "KyeeListenerRegister",
        "$ionicHistory",
        "CenterUtilService",
        "PerpaidService",
        "PerpaidPayInfoService",
        "InpatientPaymentService",
        "PatientCardRechargeService",
        "AddInformationService",
        "AppointmentDoctorDetailService",
        "AppointmentDoctorService"
    ])
    .action(function ($scope,
                      $state,
                      KyeeViewService,
                      CustomPatientService,
                      CacheServiceBus,
                      LoginService,
                      HospitalSelectorService,
                      AddPatientInfoService,
                      AddCustomPatientService,
                      SelectCustomPatientDef,
                      CommPatientDetailService,
                      KyeeMessageService,
                      AuthenticationService,
                      UpdateUserService,
                      KyeeI18nService,
                      KyeeListenerRegister,
                      $ionicHistory,
                      CenterUtilService,
                      PerpaidService,
                      PerpaidPayInfoService,
                      InpatientPaymentService,
                      PatientCardRechargeService,
                      AddInformationService,
                      AppointmentDoctorDetailService,
                      AppointmentDoctorService) {

        $scope.userInfo = {
            LAST_SELECT: "",                //最后一次选中的就诊者
            IS_SELECTED: "",              //是否选中就诊者
            USER_VS_ID: "",             //就诊者ID
            IS_DEFAULT: "",           //是否默认就诊者
            OFTEN_NAME: "",         //就诊者姓名
            ROLE_CODE: "",        //角色编号
            IS_CHILD: "",       //是否儿童标记
            USER_ID: "",      //用户ID
            STATUS: "",     //状态
            BIRTH: "",    //生日
            ID_NO: "",  //身份证号
            SEX: "",  //性别

            isNot: false                //空数据显示控制
        };
        $scope.NotShowWhenSuperType = false;
        $scope.authenBoolean = false;
        $scope.authenFlag = "";
        $scope.msg = "";

        CustomPatientService.scope = $scope;
        var memoryCache = CacheServiceBus.getMemoryCache();//全局参数
        var storageCache = CacheServiceBus.getStorageCache();//缓存数据
        var hosId = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;//医院ID
        var phoneNum = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER);
        /**
         * 页面初始化
         */
        $scope.$on("$ionicView.enter", function () {
            $scope.queryCustomPatient();
        });


        /**
         * 选择就诊者按钮触发事件
         * @param patient
         */
        $scope.choosePatient = function (patient){
            patient.orgphone = patient.PHONE;//储存一个手机号来对比手机号是否产生变化
            patient.idnumber = patient.ID_NO;//储存一个身份证号来对比手机号是否产生变化
            patient.loginNum = "";//短信验证码制空
            CommPatientDetailService.item = patient;
            //获取patientId
            var patientId = '';
            if(patient.DETIAL_LIST != 'null'){
                var detailList = JSON.parse(patient.DETIAL_LIST);
                detailList.length > 0 && (patientId = detailList[0].PATIENT_ID)
                // patientId = JSON.parse(patient.DETIAL_LIST)[0].PATIENT_ID;
            }

            AddInformationService.patientId = patientId;

            // 从付费咨询-补充信息页面跳转过来 需要做一些处理 add by dangliming
            var cUser = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            if (cUser.USER_VS_ID != patient.USER_VS_ID && hosId != 1001 && AddInformationService.switchCPforConsult){
                var consultParam = AddInformationService.consultParam;

                var param = {
                    userId: patient.USER_ID,
                    userVsId: patient.USER_VS_ID,
                    hospitalId: consultParam.hospitalId,
                    patientName: patient.OFTEN_NAME,
                    idCardNo: patient.ID_NO,
                    phone: patient.PHONE,
                    deptCode: consultParam.deptCode,
                    doctorCode: consultParam.doctorCode,
                    patientId: patientId
                };
                AppointmentDoctorService.queryIsSecondVisit(param, function (data) {
                    if(data!= null && data.isSecondVisit && !consultParam.isRegular){
                        KyeeMessageService.confirm({
                            content: '该就诊者是医生名下的复诊患者，完成切换可以享受优惠的咨询价格。',
                            onSelect: function(flag){
                                if (flag) {
                                    var tmp = $scope.consultParam = angular.copy(consultParam);
                                    tmp.isRegular = !tmp.isRegular;
                                    $scope.changePriceForConsult = true;
                                    updateSelectFlag(patient);//选中就诊者
                                }
                            }
                        });
                    } else if (data!= null && !data.isSecondVisit && consultParam.isRegular) {
                        KyeeMessageService.confirm({
                            content: '该就诊者非复诊患者，切换就诊者将无法享受优惠的价格。',
                            onSelect: function(flag){
                                if (flag) {
                                    var tmp = $scope.consultParam = angular.copy(consultParam);
                                    tmp.isRegular = !tmp.isRegular;
                                    $scope.changePriceForConsult = true;
                                    updateSelectFlag(patient);//选中就诊者
                                }
                            }
                        });
                    } else {
                        updateSelectFlag(patient);//选中就诊者
                    }
                });
                return;
            }
            updateSelectFlag(patient);//选中就诊者
        };

        /**
         * 删除就诊者触发事件
         * @type {Function}
         */
        $scope.removePatient = function (patient) {
            var patientInfo = {
                OFTEN_NAME: patient.OFTEN_NAME,
                USER_VS_ID: patient.USER_VS_ID,
                IS_CHILD: patient.IS_CHILD,
                USER_ID: patient.USER_ID,
                ID_NO: patient.ID_NO,
                PHONE: patient.PHONE,
                FLAG: patient.FLAG,
                STATUS: 0
            };
            messageDelete(JSON.stringify(patientInfo));
        };


        /**
         * 编辑就诊者触发事件
         * @type {Function}
         */
        $scope.editPatient = function (patient) {
            patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
            patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
            patient.loginNum = "";            //短信验证码制空
            CommPatientDetailService.item = patient;
            $state.go("comm_patient_detail");
        };
        /**
         * 增加就诊者触发事件
         */
        $scope.addPatient = function () {
            if(addPatientJudgment()){
                AddCustomPatientService.Mark = 1;
                AddCustomPatientService.currentUserPhoneNum = phoneNum;
                openModal('modules/business/center/views/add_patient_info/add_custom_patient.html');
            }
        };


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
         * 处理年龄
         * @param patient
         */
        var handleAge = function (patient) {
            var birthday = patient.DATE_OF_BIRTH;
            patient.age = CenterUtilService.ageBydateOfBirth(birthday);

        };


        /**
         * 处理性别
         * @param patient
         */
        var handleSex = function (patient) {
            if (patient.SEX == 1) {
                patient.SEX_TEXT = KyeeI18nService.get("update_user.man", "男");
            } else {
                patient.SEX_TEXT = KyeeI18nService.get("update_user.women", "女");
            }
        };


        /**
         * 处理身份证和手机号的展示问题
         * @param patient
         */
        var handleIdNoAndPhone = function(patient){
            if (patient.ID_NO && patient.ID_NO.substring(0, 4) != 'XNSF') {
                patient.customIdNoShow = (patient.ID_NO.replace(/(.{3}).*(.{4})/,"$1********$2"));
            }
            if(patient.PHONE){
                patient.customPhoneShow = (patient.PHONE.replace(/(.{3}).*(.{4})/,"$1****$2"));
            }
        };


        /**
         * 处理体验就诊者
         * @param patient
         * @param allPatients
         * @param index
         */
        var handleExpericenPatient = function (patient, allPatients, index) {
            //非体验医院查询出体验就诊者
            if (hosId != 1001 && patient.PATIENT_TYPE == 0) {
                allPatients.splice(index, 1);//非体验医院去除体验就诊者
            }
        };

        /**
         * 查询所有可切换的就诊者
         */
        $scope.queryCustomPatient = function () {
            var userId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            //查询常用就诊者
            CustomPatientService.queryCustomPatient(userId, function (data) {
                var patients;
                if (data && data.data && data.success) {
                    patients = data.data;
                    if (!patients || patients.length == 0) {
                        $scope.userInfo.isNot = true;

                    } else {
                        $scope.userInfo.isNot = false;
                        var currentCustomPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                        for (var l = 0; l < patients.length; l++) {
                            var patient = patients[l];
                            handleExpericenPatient(patient, patients, l);   //3.处理体验就诊者
                        }
                        $scope.patientsCount = patients.length;
                        if(patients.length>0){
                            $scope.isWhiteUser = patients[0].IS_WHITE_USER;
                        }else{
                            $scope.isWhiteUser = 0;
                        }

                        for (var i = 0; i < patients.length; i++) {
                            var patient = patients[i];
                            handleAge(patient);                 //1.处理年龄
                            handleSex(patient);                 //2.处理性别
                            handleIdNoAndPhone(patient);        //3.处理身份证和手机号的展示问题
                            //实名认证状态同步更新至缓存中
                            if (currentCustomPatient && patients && patients[i].IS_SELECTED == 1) {
                                currentCustomPatient.FLAG = patients[i].FLAG;
                                memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, patients[i]);
                                if (patients[i].DETIAL_LIST && patients[i].DETIAL_LIST != "null" && JSON.parse(patients[i].DETIAL_LIST).length > 0) {

                                    var detailList = JSON.parse(patients[i].DETIAL_LIST);
                                    for (var j = 0; j < detailList.length; j++) {
                                        if (detailList[j].IS_DEFAULT == 1) {
                                            patients[i].CARD_NO = detailList[j].CARD_NO;
                                            patients[i].CARD_SHOW = detailList[j].CARD_SHOW;
                                            memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, detailList[j]);
                                            break;
                                        } else {
                                            memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, {})
                                        }
                                    }
                                } else {
                                    memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, {})
                                }
                            }
                        }
                        $scope.allPatients = patients;
                        if ($scope.allPatients && $scope.allPatients.length > 0) {
                            $scope.userInfo.isNot = false;
                        } else {
                            $scope.userInfo.isNot = true;
                        }
                    }
                } else {
                    $scope.userInfo.isNot = true;
                }
                $scope.queryPatientAllowCount();
            });
        };


        /**
         * 返回到指定的页面，重置拦截器字段
         */
        var goIonView = function () {
            var isFromFiler = SelectCustomPatientDef.isFromFiler;
            if (isFromFiler) {
                SelectCustomPatientDef.doFinashIfNeed({
                    onBefore: function () {
                        $ionicHistory.currentView($ionicHistory.backView());
                        SelectCustomPatientDef.isFromFiler = false;
                    }
                });
            } else {
                var lastPage = $ionicHistory.backView().stateId;
                //住院预缴模块跳转来的操作  KYEEAPPC-6601 程铄闵
                if (lastPage == 'perpaid'){
                    PerpaidService.changePatientOrHospital(function(data){
                        if(data){
                            $ionicHistory.goBack();
                        }
                    });
                }
                else if (lastPage == 'perpaid_pay_info') {
                    PerpaidPayInfoService.changePatientOrHospital(false,function(route){
                        if(route){
                            $ionicHistory.goBack();
                        }
                    });
                }
                //住院费用模块跳转来   KYEEAPPC-6603 程铄闵
                else if (lastPage == 'inpatient_payment_record') {
                    InpatientPaymentService.changePatient(function(){
                        $ionicHistory.goBack();
                    });
                }
                //就诊卡费用模块跳转来 程铄闵
                else if (lastPage == 'patient_card_recharge') {
                    PatientCardRechargeService.getModule(function () {
                        PatientCardRechargeService.isFirstEnter = true;
                        $ionicHistory.goBack();
                    },$state);
                }
                else{
                    $ionicHistory.goBack();
                }
            }
        };

        /**
         * 选中就诊者
         * @param customPatient
         */
        var updateSelectFlag = function (customPatient) {
            CustomPatientService.updateSelectFlag(customPatient, hosId, function (data) {
                if (data && data.success) {

                    LoginService.setPatientName(customPatient.OFTEN_NAME);

                    var cardInfo;

                    if (!customPatient.IMAGE_PATH) {
                        customPatient.IMAGE_PATH = "";
                    }

                    customPatient.IS_SELECTED = 1;

                    if (customPatient.DETIAL_LIST && customPatient.DETIAL_LIST != "null" && JSON.parse(customPatient.DETIAL_LIST).length > 0) {
                        var detailList = JSON.parse(customPatient.DETIAL_LIST);
                        for (var i = 0; i < detailList.length; i++) {
                            if (detailList[i].IS_DEFAULT == 1) {
                                customPatient.CARD_NO = detailList[i].CARD_NO;
                                customPatient.CARD_SHOW = detailList[i].CARD_SHOW;
                                cardInfo = detailList[i];
                                memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, cardInfo);
                                break;
                            } else {
                                memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, {});
                            }
                        }
                    } else {
                        memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, {});
                    }
                    memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, customPatient);


                    //返回到指定页面
                    goIonView();

                } else {
                    //begin 实名认证页面跳转   By  张家豪  KYEEAPPC-2861
                    if (data && data.message) {
                        if (data.resultCode == "0011401") {
                            //begin 实名认证消息提示按钮的修改，可统一实名认证消息提示   By  张家豪  KYEEAPPTEST-2786
                            KyeeMessageService.confirm({
                                title: KyeeI18nService.get("update_user.sms", "消息"),
                                content: data.message,
                                cancelText:KyeeI18nService.get("custom_patient.giveUp","放弃"),
                                okText:KyeeI18nService.get("custom_patient.toCertification","去认证"),
                                onSelect: function (select) {
                                    if (select) {
                                        AuthenticationService.HOSPITAL_SM = {
                                            OFTEN_NAME: customPatient.OFTEN_NAME,
                                            ID_NO: customPatient.ID_NO,
                                            PHONE: customPatient.PHONE,
                                            USER_VS_ID: customPatient.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                                            FLAG: customPatient.FLAG
                                        };
                                        AuthenticationService.lastClass = "CustomPatient";
                                        openModal('modules/business/center/views/authentication/authentication.html');
                                    }
                                    //end 实名认证消息提示按钮的修改，可统一实名认证消息提示   By  张家豪  KYEEAPPTEST-2786

                                }
                            });
                        } else {
                            //异常接收与提示
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

        /**
         * 删除就诊者信息
         * @param patientInfoStr
         */
        var deleteCustomPatient = function (patientInfoStr) {
            AddPatientInfoService.deleteCustomPatient(patientInfoStr, function (data) {
                if (data.success) {
                    $scope.queryCustomPatient();
                }
                if (data.message) {
                    AddPatientInfoService.remind(data.message);
                }
            });
        };

        /**
         * 删除就诊者的弹框
         * @param patientInfoStr
         */
        var messageDelete = function (patientInfoStr) {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("update_user.sms", "消息"),
                content: KyeeI18nService.get("custom_patient.sureToDeleteIt", "该就诊者的数据将全部丢失，您是否确认删除？"),
                onSelect: function (flag) {
                    if (flag) {
                        deleteCustomPatient(patientInfoStr);
                    }
                }
            });
        };

        /**
         * 离开页面时触发器
         */
        KyeeListenerRegister.regist({
            focus: "custom_patient",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                SelectCustomPatientDef.isFromFiler = false;

                if (AddInformationService.switchCPforConsult) {  //付费咨询 切换就诊者处理
                    AddInformationService.switchCPforConsult = false;
                    if ($scope.changePriceForConsult){ //切换就诊者前后价格不一致
                        var con = $scope.consultParam;
                        con.payAmount = con.isRegular ? con.afterConsultAmount : con.beforeConsultAmount;
                        AddInformationService.consultParam = con;
                    }
                }
            }
        });

        /**
         * 查询系统允许可维护就诊者的数量上限
         */
        $scope.queryPatientAllowCount = function () {
            CustomPatientService.queryParamsystem(function (ValidPatientMaxCount) {
                $scope.patientAllowCount = ValidPatientMaxCount;     //系统允许有效就诊者最大数量

                var count =  parseInt( $scope.patientAllowCount)-parseInt($scope.patientsCount);
                if(count<0){
                    $scope.canAddPatientCount =0;
                }else{
                    $scope.canAddPatientCount = count;
                }
                //用户信息缓存
                var userInformation = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                if(userInformation.USER_TYPE == 1|| $scope.isWhiteUser >0){      //超级用户||医院+白名单用户没有参数限制
                    $scope.NotShowWhenSuperType = false;
                }else{
                    $scope.NotShowWhenSuperType = true;
                }
            });

        };
        /**
         * 添加就诊者逻辑判断
         * @returns {boolean}
         * 修改人：付添
         * 任务号：KYEEAPPC-4825
         */
        var  addPatientJudgment = function(){
            //用户信息缓存
            var userInformation = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            if(userInformation.USER_TYPE == 1|| $scope.isWhiteUser >0){      //超级用户||医院+白名单用户没有参数限制
                return true;
            }
            if ($scope.patientsCount >=  $scope.patientAllowCount ) {
                KyeeMessageService.broadcast({
                    content:  KyeeI18nService.get("custom_patient.customAll", "就诊者数目已达上限")
                });
                return false;
            }else{
                return  true;
            }
        };
    })
    .build();
