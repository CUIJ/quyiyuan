/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年8月31日14:46:12
 * 创建原因：预约挂号注册控制层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.register.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.register.service",
        "kyee.quyiyuan.appointment.register.password.controller"
    ])
    .type("controller")
    .name("AppointmentRegisterController")
    .params(["$scope","$interval","KyeeDeviceMsgService", "$state", "$ionicHistory", "CacheServiceBus", "KyeeMessageService", "KyeeUtilsService", "AppointmentRegisterService",
        "KyeeViewService", "LoginService", "AddCustomPatientService", "AppointmentDoctorDetailService", "KyeeScanService", "$ionicScrollDelegate",
        "RegistService", "KyeeListenerRegister","KyeeI18nService","HospitalService"])
    .action(function ($scope,$interval,KyeeDeviceMsgService, $state, $ionicHistory, CacheServiceBus, KyeeMessageService, KyeeUtilsService, AppointmentRegisterService, KyeeViewService, LoginService, AddCustomPatientService, AppointmentDoctorDetailService, KyeeScanService, $ionicScrollDelegate, RegistService, KyeeListenerRegister,KyeeI18nService,HospitalService) {


        var storageCache = CacheServiceBus.getStorageCache();

        /**
         * 手机验证码倒计时任务
         */
        var surplusTask;
        /**
         * 默认剩余时间为两分钟
         * @type {number}
         */
        var surplusSecond = 120;
        var timeCtrl = 60;//定时器定时 60秒  By  付添  KYEEAPPC-3540
        var isTimer = undefined;//倒计时60s是否结束  By  付添  KYEEAPPC-3540
        var timer = "";
        var startDate = new Date();
         $scope.appointmentRegister=[];
        $scope.yearRange = (startDate.getFullYear() - 18) + '->' + (startDate.getFullYear());
        //输入框底部文字
        $scope.placeholderName= KyeeI18nService.get("appointment_register.placeholderName","请输入就诊人姓名");
        $scope.placeholderidNo= KyeeI18nService.get("appointment_register.placeholderidNo","请输入就诊人身份证号码");
        $scope.placeholderPhone= KyeeI18nService.get("appointment_register.placeholderPhone","请输入联系电话");
        $scope.placeholderCode= KyeeI18nService.get("appointment_register.placeholderCode","请输入验证码");
        $scope.placeholderNumber= KyeeI18nService.get("appointment_register.placeholderNumber","请输入导医编号（选填）");
        $scope.placeholderRemarks= KyeeI18nService.get("appointment_register.placeholderRemarks","请输入备注信息");
        $scope.placeholderbristolDate= KyeeI18nService.get("add_patient_info.chooseBirthDate","请选择出生日期");
        //控制语音短信验证码的字段
        $scope.isVoiceVerificationCode = false;
        KyeeListenerRegister.regist({
            focus: "appointment_register",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            action: function (params) {
                $scope.regPatientSelect="0";
                //初始化用户注册信息
                $scope.appointmentRegister = {
                    HOSPITAL_NAME: AppointmentDoctorDetailService.doctorInfo.HOSPITAL_NAME,
                    DOCTOR_NAME: AppointmentDoctorDetailService.doctorInfo.DOCTOR_NAME,
                    CLINIC_LABEL: AppointmentDoctorDetailService.selSchedule.CLINIC_LABEL,
                    DEPT_NAME: AppointmentDoctorDetailService.doctorInfo.DEPT_NAME,
                    CLINIC_DATE: AppointmentDoctorDetailService.selSchedule.CLINIC_DATE,
                    IS_SHOW_FEE_DETAIL: AppointmentDoctorDetailService.selSchedule.IS_SHOW_FEE_DETAIL,
                    IS_SHOW_FEE_DETAIL: AppointmentDoctorDetailService.selSchedule.IS_SHOW_FEE_DETAIL,
                    //手机号
                    phoneNum: "",
                    //身份证号码
                    idCardNum: "",
                    //用名
                    userName: "",
                    //校验码
                    validateCode: "",
                    //医导编号
                    guideNum: "",
                    //备注
                    remark: "",
                    //手机号输入框是否可输入 true不可输入;false可以输入
                    phoneNumDisabled: false,
                    //获取验证码按钮是否不可用 true不可用;false可用
                    validateBtnDisabled: false,
                    //趣医网软件许可协议是否被选中
                    contractSelected: true,
                    validateCodeText: KyeeI18nService.get("appointment_register.toVerificationcode","发送验证码"),
                    isGuideShow: false,                   //是否显示导医
                    isRemarkShow: false,                   //是否显示备注
                    isCheckMsg: false                       //是否显示验证码
                };
                $scope.userInfo = {
                    phoneNum: "",
                    isAgree: true,
                    sexView:1,
                    CLINIC_DATE:"",
                };
                RegistService.isShow($scope.appointmentRegister);
                var ClinicSource = AppointmentDoctorDetailService.CLINIC_SOURCE;
                var expenseDetail = '';
                if (ClinicSource != null && ClinicSource != undefined && ClinicSource.text != null && ClinicSource.text != undefined) {
                    $scope.CLINIC_DURATION = ClinicSource.text;//获取用户选择的午别
                    if (ClinicSource.value2) {
                        expenseDetail = ClinicSource.value2.EXPENSE_DETAIL;
                    }
                } else {
                    //不需要用户选择号源
                    $scope.CLINIC_DURATION = AppointmentDoctorDetailService.CLINIC_DETAIL.rows[0].HB_TIME;
                    expenseDetail = AppointmentDoctorDetailService.CLINIC_DETAIL.rows[0].EXPENSE_DETAIL;
                }
                if (expenseDetail != '') {
                    var expenseDetailStart = expenseDetail.indexOf('[');
                    var expenseDetailEnd = expenseDetail.indexOf(']');
                    expenseDetail = expenseDetail.substring(expenseDetail.indexOf('['), expenseDetail.indexOf(']') + 1);
                    try{
                        $scope.EXPENSE_DETAIL = JSON.parse(expenseDetail);
                    }catch(err) {
                        $scope.EXPENSE_DETAIL = null;
                        console.log(err);
                    }
                }

                //将预约费用显示增加￥符号
                if (!AppointmentDoctorDetailService.selSchedule.SUM_FEE) {
                    $scope.appointAmount = "";
                } else {
                    $scope.appointAmount = "¥" + AppointmentDoctorDetailService.selSchedule.SUM_FEE;
                }
                //获取缓存中医院信息
                var hospitalinformation = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                $scope.isShowAptFee = 1;
                HospitalService.getParamValueByName(hospitalinformation.id, "IS_SHOW_APT_FEE,REG_FEE_REPLACE",function (hospitalPara) {
                    /*医院参数：是否显示预约费用：IS_SHOW_APT_FEE*/
                    $scope.isShowAptFee = hospitalPara.data.IS_SHOW_APT_FEE;
                    $scope.showFee = 1;
                    // 修改挂号费用为诊查费 edit by cuijin KYEEAPPC-11628
                    $scope.REG_FEE_REPLACE = hospitalPara.data.REG_FEE_REPLACE;
                    $scope.FeeType = 0;
                    if($scope.REG_FEE_REPLACE != undefined && $scope.REG_FEE_REPLACE != "" && $scope.REG_FEE_REPLACE != null && $scope.REG_FEE_REPLACE.length>0 && $scope.REG_FEE_REPLACE.length <= 10){
                        $scope.REG_FEE_REPLACE = $scope.REG_FEE_REPLACE + "： "
                        $scope.FeeType = 1;
                    }
                    var fee = $scope.appointAmount;
                    if (('0' == $scope.isShowAptFee) && (('¥0' == fee) || ('¥0.0' == fee) || ('¥0.00' == fee))) {
                        $scope.showFee = 0;
                    }
                });
                AppointmentRegisterService.getHosChildRegLimit(hospitalinformation.id,AppointmentDoctorDetailService.doctorInfo.DEPT_CODE,function (data) {
                    $scope.HOS_CHILD_REG = data.HOS_CHILD_REG;
                    if($scope.HOS_CHILD_REG=="1"){
                        $scope.APPOINT_LIMIT_CODE = data.APPOINT_LIMIT_CODE;
                        if($scope.APPOINT_LIMIT_CODE =='01'){
                            $scope.regPatientSelect='1';
                        }else{
                            $scope.regPatientSelect='0';
                        }
                    }
                })
            }
        });

        $scope.showRegistCostMsg = function () {
            var diageFeeStr, pharmacyFeeStr, regFeeStr;

            if (!AppointmentDoctorDetailService.selSchedule.REG_FEE) {
                regFeeStr = '';
            }
            else {
                regFeeStr = KyeeI18nService.get("appointment_register.REG_FEE","挂号费：¥") + AppointmentDoctorDetailService.selSchedule.REG_FEE;
            }
            //诊疗费用显示增加￥符号
            if (!AppointmentDoctorDetailService.selSchedule.DIAG_FEE) {
                diageFeeStr = "";
            } else {
                diageFeeStr = KyeeI18nService.get("appointment_register.DIAG_FEE","<br>诊疗费：¥") + AppointmentDoctorDetailService.selSchedule.DIAG_FEE;
            }
            //药事费用显示增加￥符号
            if (!AppointmentDoctorDetailService.selSchedule.PHARMACY_FEE) {
                pharmacyFeeStr = "";
            } else {
                pharmacyFeeStr = KyeeI18nService.get("appointment_register.PHARMACY_FEE","<br>药事费：¥") + AppointmentDoctorDetailService.selSchedule.PHARMACY_FEE;
            }
            //end 药事服务费 By 高玉楼
            KyeeMessageService.message({
                title: KyeeI18nService.get("appointment_register.registAmount","挂号费明细"),
                content: regFeeStr + pharmacyFeeStr + diageFeeStr
            });
        };
        /**
         * 趣医网软件许可协议
         */
        $scope.readContract = function () {
            $state.go("q_agreement");//模态改路由 付添  KYEEAPPC-3658
        };

        $scope.goToLogin = function () {
            LoginService.frontPage = "4";  //标志从预约挂号确认跳转到登录页面
            $state.go("login");

        };

        $scope.openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };
        //是否显示语音的逻辑
        $scope.isVoiceVerificationCodeFalse = function () {
            $scope.isVoiceVerificationCode = false;
        };
        //获取语音验证码间隔 定时器内容   付添  KYEEAPPC-3540
        var setBtnState = function (timer) {
            try {
                if (timeCtrl != -1) {
                    timeCtrl--;
                } else {
                    isTimer = undefined;
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }

            } catch (e) {
                isTimer = undefined;
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        };
        //语音获取验证码    By  付添  KYEEAPPC-3540
        $scope.voiceVerificationCode = function () {
            if (!isTimer) {
                //语音短信验证码标记
                AddCustomPatientService.voiceCode.voiceCode = 1;
                //是否倒计时  此处为否
                AddCustomPatientService.voiceCode.isCountdown = 1;
                $scope.getValidateCodeOther(1);
            } else {
                KyeeMessageService.broadcast({
                    content: '操作频繁，请于60秒后重试',
                    duration: 1000
                });
            }
        };
        //点击发送短信会触发的新方法
        $scope.getValidateCode = function () {
            //语音短信验证码标记
            AddCustomPatientService.voiceCode.voiceCode = undefined;
            //是否倒计时
            AddCustomPatientService.voiceCode.isCountdown = undefined;
            if (RegistService.NORMAL_PROCESS == 1) {
                $scope.getValidateCodeOther(2);
            } else {
                $scope.getValidateCodeOther(3);
            }

        };
        //发送验证码
        $scope.getValidateCodeOther = function (vioceFlge) {

            var phoneNum = $scope.appointmentRegister.phoneNum;
            var userName = $scope.appointmentRegister.userName;
            $scope.userInfo.phoneNum = $scope.appointmentRegister.phoneNum;
            if (AddCustomPatientService.validatePhoneNum(phoneNum)) {
                if (vioceFlge == 2) {
                    //正常流程
                    sendValidateCode(phoneNum, userName);
                    RegistService.NORMAL_PROCESS = undefined;
                } else if (vioceFlge == 1) {
                    //正常流程
                    sendValidateCode(phoneNum, userName);
                } else {
                    mobilePhoneNumberIsInvalid(phoneNum, userName);
                }
            }
        };
        //新校验规则，是否大于90天未登录//优化注册、找回密码逻辑（前台）   By  张家豪  KYEEAPPC-3317
        var mobilePhoneNumberIsInvalid = function (phoneNum, userName) {
            var phoneNumber = $scope.userInfo.phoneNum;
            RegistService.mobilePhoneNumberIsInvalid(
                phoneNumber,
                $scope,
                function (data) {
                    if (data.success) {
                        var data = data.data;
                        //判断是否是已注册//优化注册、找回密码逻辑（前台）   By  张家豪  KYEEAPPC-3317
                        if (data.isRegist == true || data.isRegist == "true") {
                            //判断是否大于90天未使用//优化注册、找回密码逻辑（前台）   By  张家豪  KYEEAPPC-3317
                            if (data.isGreaterThanNinety == false || data.isGreaterThanNinety == "false") {
                                KyeeMessageService.confirm({
                                    title: "提示",
                                    content: "您的账号已经注册过，是否去找回密码？",
                                    onSelect: function (flag) {
                                        if (flag) {
                                            //跳转到找回密码页面
                                           // $scope.openModal("modules/business/login/views/find_password.html");
                                            $state.go("find_password");  // 	模态该路由 付添  KYEEAPPC-3658
                                            //存储phoneNum，以便带入到找回密码页面
                                            LoginService.userInfo.user = phoneNumber;
                                            //记录从注册页面跳转到找回密码页面
                                            LoginService.toFindPwdFrontPage = "3";
                                        }
                                    }
                                });
                            } else if (data.isGreaterThanNinety == true || data.isGreaterThanNinety == "true") {
                                //存储phoneNum，以便带入那一页
                                RegistService.IS_PHONE_NUMBER = phoneNumber;
                                //手机号置灰
                                $scope.appointmentRegister.phoneNumDisabled = true;
                                KyeeMessageService.confirm({
                                    title: "注册提醒",
                                    content: "此手机号已被注册，若此账号已由您本人注册，请找回账户后登录；非本人注册，请重新注册。",
                                    okText: "找回信息",
                                    cancelText: "重新注册",
                                    onSelect: function (string) {
                                        if (string) {
                                         //   $scope.openModal("modules/business/login/views/verify_name.html");
                                            $state.go("verify_name");//模态改路由 付添  KYEEAPPC-3658
                                        } else {
                                            //正常流程
                                            sendValidateCode(phoneNum, userName);
                                        }
                                    }
                                });
                            }
                        } else {
                            //正常流程
                            sendValidateCode(phoneNum, userName);
                        }
                    } else if (data.message) {
                        KyeeMessageService.broadcast({
                            content: data.message
                        });
                    }
                }
            );

        };
        /**
         * 发送获取手机验证码的请求
         */
        var sendValidateCode = function (phoneNum, userName) {
            AddCustomPatientService.sendRegCheckCodeActionC('0',
                storageCache.get('hospitalInfo').id, phoneNum, userName,
                function (data) {
                    //语音验证分支  付添  KYEEAPPC-3540
                    if (AddCustomPatientService.voiceCode.isCountdown == 1) {
                        $scope.appointmentRegister.phoneNumDisabled = true;
                        AddCustomPatientService.voiceCode.isCountdown = undefined;
                        timeCtrl = 60;
                        //倒计时60秒  By  付添  KYEEAPPC-3540
                        timer = KyeeUtilsService.interval({
                            time: 1000,
                            action: function () {
                                setBtnState(timer);
                            }
                        });
                        isTimer = 1;
                    } else {
                        $scope.appointmentRegister.phoneNumDisabled = true;
                        $scope.appointmentRegister.validateBtnDisabled = true;
                        if(data){
                            if(data.data.SECURITY_CODE=='007'){
                                surplusSecond = data.data.secondsRange;
                            }
                            else {
                                surplusSecond =120;
                            }
                        }
                        surplusTask = KyeeUtilsService.interval({
                            time: 1000,
                            action: function () {
                                showTime();
                            }
                        });
                    }
                    setTimeout(function () {
                        $scope.isVoiceVerificationCode = true;
                    }, 1000);
                });
            //手机验证码自动回填
            KyeeDeviceMsgService.getMessage(
                function (validateNum) {
                    $scope.appointmentRegister.validateCode = validateNum;
                    setTimeout(function () {
                        $scope.$apply();
                    }, 1);
                }
            );
        };
        /**
         * 监听验证码输入框不为空 语音短信提示显示
         */
        $scope.$watch('appointmentRegister.validateCode', function () {
            if($scope.appointmentRegister.validateCode){
                $scope.isVoiceVerificationCode = false;
            }
        });
        /**
         * 显示验证码倒计时时间
         */
        var showTime = function () {
            try {
                if (surplusSecond != -1) {
                    //直接操作$scope中的模型效率低下并且页面无法更新,因此直接操作dom
                    $scope.appointmentRegister.validateCodeText = KyeeI18nService.get("appointment_register.Surplus","剩余")+'<font style="color:#666666;">' + surplusSecond + '</font>'+KyeeI18nService.get("appointment_register.Seconds","秒");
                    surplusSecond--;
                } else {
                    $scope.appointmentRegister.phoneNumDisabled = false;
                    $scope.appointmentRegister.validateBtnDisabled = false;
                    $scope.appointmentRegister.validateCodeText =  KyeeI18nService.get("appointment_register.getValidateCode","获取验证码");
                    //关闭定时器
                    if (surplusTask != undefined) {
                        KyeeUtilsService.cancelInterval(surplusTask);
                    }
                }
            } catch (e) {
                $scope.appointmentRegister.phoneNumDisabled = false;
                $scope.appointmentRegister.validateBtnDisabled = false;
                $scope.appointmentRegister.validateCodeText = KyeeI18nService.get("appointment_register.getValidateCode","获取验证码");
                //关闭定时器
                if (surplusTask != undefined) {
                    KyeeUtilsService.cancelInterval(surplusTask);
                }
            }
        };
        //扫描二维码
        $scope.scan = function () {
            KyeeScanService.scan(
                function (code) {
                    $scope.appointmentRegister.guideNum = code;
                },
                function () {
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("appointment_register.faileBarCode","扫描二维码失败！")
                    });
                }
            );
        };

        /**
         * 选中或反选趣医网软件许可协议
         */
        $scope.selectAgrreContract = function () {
            $scope.appointmentRegister.contractSelected = !$scope.appointmentRegister.contractSelected;
        };

        /**
         * 跳转到输入密码页面
         */
        $scope.goToInputPassword = function () {
            if (AppointmentRegisterService.validateAgreeContract($scope.appointmentRegister.contractSelected) &&
                AppointmentRegisterService.validateName($scope.appointmentRegister.userName) &&
                AppointmentRegisterService.validatePhoneNum($scope.appointmentRegister.phoneNum)
            ) {
                if (AddCustomPatientService.idNoCheck($scope.appointmentRegister.idCardNum)&&$scope.regPatientSelect!='1') {
                    if ($scope.appointmentRegister.isCheckMsg) {
                        if (AppointmentRegisterService.validateLoginNum($scope.appointmentRegister.validateCode)) {
                            AppointmentRegisterService.registerInfo = {
                                phoneNum: $scope.appointmentRegister.phoneNum,
                                idCardNum: $scope.appointmentRegister.idCardNum,
                                userName: $scope.appointmentRegister.userName,
                                validateCode: $scope.appointmentRegister.validateCode,
                                guideNum: $scope.appointmentRegister.guideNum,
                                remark: $scope.appointmentRegister.remark

                            };
                            if($scope.regPatientSelect=='1'){
                                AppointmentRegisterService.registerInfo.isChildReg= $scope.regPatientSelect;
                                AppointmentRegisterService.registerInfo.BIRTH_DATE = $scope.userInfo.CLINIC_DATE;
                                AppointmentRegisterService.registerInfo.sex = $scope.userInfo.sexView;
                            }
                            $state.go('appointmentRegisterPassword');
                            if (surplusTask != undefined) {
                                KyeeUtilsService.cancelInterval(surplusTask);
                            }
                            $scope.appointmentRegister.phoneNumDisabled = false;
                            $scope.appointmentRegister.validateBtnDisabled = false;
                            $scope.appointmentRegister.validateCodeText =  KyeeI18nService.get("appointment_register.getValidateCode","获取验证码");
                        }
                    }
                    else {
                        AppointmentRegisterService.registerInfo = {
                            phoneNum: $scope.appointmentRegister.phoneNum,
                            idCardNum: $scope.appointmentRegister.idCardNum,
                            userName: $scope.appointmentRegister.userName,
                            validateCode: $scope.appointmentRegister.validateCode,
                            guideNum: $scope.appointmentRegister.guideNum,
                            remark: $scope.appointmentRegister.remark
                        };
                        if($scope.regPatientSelect=='1'){
                            AppointmentRegisterService.registerInfo.isChildReg= $scope.regPatientSelect;
                            AppointmentRegisterService.registerInfo.BIRTH_DATE = $scope.userInfo.CLINIC_DATE;
                            AppointmentRegisterService.registerInfo.sex = $scope.userInfo.sexView;
                        }
                        $state.go('appointmentRegisterPassword');
                    }
                }
                else if($scope.regPatientSelect=='1' &&$scope.APPOINT_LIMIT_CODE!='10'){
                    if($scope.userInfo.CLINIC_DATE==''||$scope.userInfo.CLINIC_DATE==undefined){
                        KyeeMessageService.broadcast({
                            content:  KyeeI18nService.get("comm_patient_detail.pleaseSelectDate", "请选择出生日期！")
                        });
                    }
                    else if ($scope.appointmentRegister.isCheckMsg) {
                        if (AppointmentRegisterService.validateLoginNum($scope.appointmentRegister.validateCode)) {
                            AppointmentRegisterService.registerInfo = {
                                phoneNum: $scope.appointmentRegister.phoneNum,
                                idCardNum: $scope.appointmentRegister.idCardNum,
                                userName: $scope.appointmentRegister.userName,
                                validateCode: $scope.appointmentRegister.validateCode,
                                guideNum: $scope.appointmentRegister.guideNum,
                                remark: $scope.appointmentRegister.remark

                            };
                            if($scope.regPatientSelect=='1'){
                                AppointmentRegisterService.registerInfo.isChildReg= $scope.regPatientSelect;
                                AppointmentRegisterService.registerInfo.BIRTH_DATE = $scope.userInfo.CLINIC_DATE;
                                AppointmentRegisterService.registerInfo.sex = $scope.userInfo.sexView;
                            }
                            $state.go('appointmentRegisterPassword');
                            if (surplusTask != undefined) {
                                KyeeUtilsService.cancelInterval(surplusTask);
                            }
                            $scope.appointmentRegister.phoneNumDisabled = false;
                            $scope.appointmentRegister.validateBtnDisabled = false;
                            $scope.appointmentRegister.validateCodeText =  KyeeI18nService.get("appointment_register.getValidateCode","获取验证码");
                        }
                    }
                    else {
                        AppointmentRegisterService.registerInfo = {
                            phoneNum: $scope.appointmentRegister.phoneNum,
                            idCardNum: $scope.appointmentRegister.idCardNum,
                            userName: $scope.appointmentRegister.userName,
                            validateCode: $scope.appointmentRegister.validateCode,
                            guideNum: $scope.appointmentRegister.guideNum,
                            remark: $scope.appointmentRegister.remark
                        };
                        if($scope.regPatientSelect=='1'){
                            AppointmentRegisterService.registerInfo.isChildReg= $scope.regPatientSelect;
                            AppointmentRegisterService.registerInfo.BIRTH_DATE = $scope.userInfo.CLINIC_DATE;
                            AppointmentRegisterService.registerInfo.sex = $scope.userInfo.sexView;
                        }
                        $state.go('appointmentRegisterPassword');
                    }
                }
                else if($scope.regPatientSelect=='1'&& ($scope.userInfo.CLINIC_DATE==''||$scope.userInfo.CLINIC_DATE==undefined)){
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("comm_patient_detail.pleaseSelectDate", "请选择出生日期！")
                    });
                }
                else if(($scope.appointmentRegister.idCardNum ==""||$scope.appointmentRegister.idCardNum==null)&&$scope.regPatientSelect!='1'){
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("appointment_register.idNoerror","身份证号不能为空！")
                    });
                }
                else if($scope.regPatientSelect!='1'){
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("appointment_register.idNoerror","身份证号格式错误！")
                    });
                }
            }
            else {
                $ionicScrollDelegate.scrollBottom();
            }
        };
        $scope.selectedChange=function (regPatientSelect) {
            if(regPatientSelect!=$scope.regPatientSelect){
                $scope.regPatientSelect = regPatientSelect;
                $scope.userInfo = {
                    isAgree: true,
                    sexView:1,
                    CLINIC_DATE:"",
                };
                $scope.appointmentRegister.userName = '';
                $scope.appointmentRegister.idCardNum = '';
            }
        };
        /**
         * 儿童的生日
         */
        $scope.selectChildAge = function () {
                $scope.show();
        };

        /**
         * 自动计算年龄
         * @returns {*}
         */
        $scope.autoBirthday = function () {
            $scope.textColor = "qy-grey7";
            if ($scope.userInfo.CLINIC_DATE) {
                return $scope.userInfo.CLINIC_DATE;
            }else{
                $scope.textColor = "greyText";
                return KyeeI18nService.get("add_patient_info.chooseBirthDate", "请选择出生日期");
            }
        };

        /**
         * 男性按钮触发事件
         */
        $scope.selectMen = function () {
            $scope.userInfo.sexView = 1;
        };


        /**
         * 女性按钮的触发事件
         */
        $scope.selectWomen = function () {
            $scope.userInfo.sexView = 2;
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
                $scope.userInfo.CLINIC_DATE = "";
                return false;
            }else{
                $scope.userInfo.CLINIC_DATE = params[0].value + "-" + params[1].value + "-" + params[2].value;
                return true;
            }
        };

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
            focus: "appointment_register",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backToFrom();
            }
        });

        KyeeListenerRegister.regist({
            focus: "appointment_register",
            when:  KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                $interval.cancel(surplusTask);
            }
        });
    }).build();
