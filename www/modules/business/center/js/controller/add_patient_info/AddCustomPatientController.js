/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪
 * 创建日期:2015年5月4日10:18:09
 * 创建原因：新增就诊者控制
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.controller.add_custom_patient")
    .require([
        "kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.center.controller.add_custom_patient",
        "kyee.quyiyuan.center.add_custom_patient.service",
        "kyee.framework.device.message"])
    .type("controller")
    .name("AddCustomPatientController")
    .params([
        "$scope",
        "OperationMonitor",
        "KyeeMessageService",
        "KyeeViewService",
        "AddCustomPatientService",
        "CacheServiceBus",
        "$state",
        "UpdateUserService",
        "KyeeDeviceMsgService",
        "AddPatientInfoService",
        "CustomPatientService",
        "KyeeListenerRegister",
        "AuthenticationService",
        "KyeeUtilsService",
        "KyeeI18nService"
    ])
    .action(function ($scope,
                      OperationMonitor,
                      KyeeMessageService,
                      KyeeViewService,
                      AddCustomPatientService,
                      CacheServiceBus,
                      $state,
                      UpdateUserService,
                      KyeeDeviceMsgService,
                      AddPatientInfoService,
                      CustomPatientService,
                      KyeeListenerRegister,
                      AuthenticationService,
                      KyeeUtilsService,
                      KyeeI18nService) {

        //首次进入默认展示当前用户的手机号、隐藏短信验证码模块，且不需要短信验证   KYEEAPPC-10873   yangxuping
        $scope.showVerificationCode = false;
        AddCustomPatientService.isNeedMessageCode = false;

        /**
         * 所有字段初始化
         * @type {{PHONE_NUMBER: string, CLINIC_DATE: string, BIRTHDAY: string, NAME: string, validateMsgText: *, validateBtnDisabled: boolean, paramName: string, phoneNumDisabled: boolean, showAge: boolean, idNoView: string, loginNum: string, sexBox: boolean, sexView: string, isChild: number, sms: string}}
         */
        $scope.userInfo = {
            PHONE_NUMBER: AddCustomPatientService.currentUserPhoneNum,       //手机号
            CLINIC_DATE: "",      //儿童生日
            BIRTHDAY: "",       //出生日期
            NAME: "",         //姓名

            validateMsgText: KyeeI18nService.get("update_user.validateMsgText", "获取验证码"), //验证码显示控制
            validateBtnDisabled: false,                                                       //发送验证码按钮置灰
            paramName: "idNo_Check",                                                        //身份证是否显示
            phoneNumDisabled: false,                                                      //手机号输入栏置灰
            showAge: false,                                                              //出生日期显示控制
            idNoView: "",                                                             //身份证
            loginNum: "",                                                           //短信验证码
            sexBox: true,                                                         //性别控制
            sexView: "",                                                        //性别
            isChild: 0,                                                       //儿童控制字段
            sms: ""                                                         //作为验证码的中转
        };

        $scope.placeholder = {
            idNo: KyeeI18nService.get("update_user.purYouId", "请输入就诊者身份证号"),
            valiteCode: KyeeI18nService.get("update_user.purYouCode", "请输入验证码"),
            phone: KyeeI18nService.get("update_user.purYouPhone", "请在此输入手机号"),
            sex: KyeeI18nService.get("update_user.purYouSex", "根据身份证自动识别"),
            name: KyeeI18nService.get("update_user.purYouName", "请输入就诊者姓名")
        };

        var cacheStorage = CacheServiceBus.getStorageCache(); //Storage缓存
        var cacheMemory = CacheServiceBus.getMemoryCache(); //Memory缓存
        var startDate = new Date();
        var isTimer = undefined;
        var timeCtrl = 60;
        var second = 120;


        if(cacheStorage.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO) && cacheStorage.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id){
            $scope.hospitalId =cacheStorage.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;//已选择的医院
        }
        $scope.yearRange = (startDate.getFullYear() - 18) + '->' + (startDate.getFullYear());
        $scope.isVoiceVerificationCode = false;//控制语音短信验证码的字段
        $scope.authenBoolean = false;
        $scope.authenFlag = "";
        $scope.msg = "";



        //KYEEAPPC-10873  当用户重新编辑手机号码时，获取验证码那一栏会展示。当重新录入的手机号码跟原用户手机号码一致时，验证码又消失。
        $scope.phoneNumChange = function(){
            if($scope.userInfo.PHONE_NUMBER != AddCustomPatientService.currentUserPhoneNum){
                $scope.showVerificationCode = true;
                //需短信验证
                AddCustomPatientService.isNeedMessageCode = true;
            }else{
                $scope.showVerificationCode = false;
                //不需要短信验证
                AddCustomPatientService.isNeedMessageCode = false;
            }
        }

        /**
         * 提交点击事件
         */
        $scope.submit = function () {

            OperationMonitor.record("submit", "add_patient_info");
            getParameterOfParameter();        //取得传参需要的参数
            //校验输入框内容格式
            if (AddCustomPatientService.submit($scope)) {
                dealWithBirthday();           //处理生日数据
                dealWithPostData();           //处理传参需要的POST数据集合
                determineRoad();              //根据情况成人儿童和身份证号判断需要进入的请求
            }
        };


        /**
         * 是否选择儿童选项的点击事件
         */
        $scope.isSelectChild = function () {
            OperationMonitor.record("isSelectChild", "add_patient_info");
            isShowBirthday();    //是否展示生日的逻辑改变
            isAllowSelectSex();  //是否可以选择性别控制

        };


        /**
         * 男性按钮触发事件
         */
        $scope.selectMen = function () {

            OperationMonitor.record("selectMen", "add_patient_info");
            $scope.userInfo.sexView = 1;
        };


        /**
         * 女性按钮的触发事件
         */
        $scope.selectWomen = function () {
            OperationMonitor.record("selectWomen", "add_patient_info");
            $scope.userInfo.sexView = 2;
        };


        /**
         * 发送短信按钮的触发事件，点击发送验证码之后对按键的置灰
         */
        $scope.getValiteCode = function () {


            OperationMonitor.record("getValiteCode", "add_patient_info");
            //语音短信验证码标记
            AddCustomPatientService.voiceCode.voiceCode = undefined;
            //是否倒计时  此处为否
            AddCustomPatientService.voiceCode.isCountdown = undefined;
            $scope.sendCheckCode();
        };


        /**
         *发送短信的请求
         */
        $scope.sendRegCheckCodeActionC = function () {
            AddCustomPatientService.sendRegCheckCodeActionC('1',$scope.hospitalId, $scope.userInfo.PHONE_NUMBER, $scope.userInfo.NAME,
                function (data) {
                    //语音验证分支  By  付添  KYEEAPPC-3540
                    if (AddCustomPatientService.voiceCode.isCountdown == 1) {
                        $scope.userInfo.phoneNumDisabled = true;
                        AddCustomPatientService.voiceCode.isCountdown = undefined;
                        //倒计时60秒  By  付添  KYEEAPPC-3540
                        timeCtrl = 60;
                        var timer = KyeeUtilsService.interval({
                            time: 1000,
                            action: function () {
                                setBtnStateVoice(timer);
                            }
                        });
                        isTimer = 1;
                    } else {
                        // 将短信验证码倒计时改为ionic自带的定时器   By  张家豪  KYEEAPPTEST-2890
                        //按钮冻结时间为120秒
                        if(data){
                            if(data.data.SECURITY_CODE=='007'){
                                second = data.data.secondsRange;
                            }
                            else {
                                second =120;
                            }
                        }
                        setBtnState();
                        $scope.userInfo.validateBtnDisabled = true;
                        $scope.userInfo.phoneNumDisabled = true;
                        var timer = KyeeUtilsService.interval({
                            time: 1000,
                            action: function () {
                                second--;
                                setBtnState(timer);
                            }
                        });
                    }
                    setTimeout(function () {
                        $scope.isVoiceVerificationCode = true;
                    }, 1000);
                });
        };


        /**
         * 新增就诊者请求
         */
        $scope.addCustomPatient = function () {
            AddCustomPatientService.addCustomPatient($scope.post, $scope.hospitalId, function (data) {
                //begin 实名认证页面跳转   By  张家豪  KYEEAPPC-2861
                if (data.success) {
                    if (data.data.needAuth) {
                        $scope.authenBoolean = data.data.needAuth;
                        $scope.authenFlag = data.data.FLAG;
                        $scope.msg = data.data.msg;
                    }
                    if ($scope.authenBoolean && $scope.authenBoolean != "false") {
                        AuthenticationService.HOSPITAL_SM = {
                            OFTEN_NAME: $scope.userInfo.NAME,
                            ID_NO: $scope.userInfo.idNoView,
                            PHONE: $scope.userInfo.PHONE_NUMBER,
                            USER_VS_ID: data.data.USER_VS_ID,
                            FLAG: $scope.authenFlag
                        };
                        AuthenticationService.AUTH_TYPE = 0;
                        AuthenticationService.AUTH_SOURCE = 0;
                        var msg = $scope.msg;
                        KyeeMessageService.confirm({
                            title: KyeeI18nService.get("update_user.sms", "消息"),
                            content: msg,
                            cancelText:KyeeI18nService.get("add_patient_info.giveUp","放弃"),
                            okText:KyeeI18nService.get("add_patient_info.toCertification","去认证"),
                            onSelect: function (select) {
                                if (select) {
                                    $scope.hideModal();
                                    $scope.openModal('modules/business/center/views/authentication/authentication.html');
                                    $scope.backToFront();
                                } else {
                                    $scope.backToFront();
                                }
                            }
                        });
                    } else {
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("add_patient_info.addPeopleSuccess", "添加就诊者成功！")
                        });
                        $scope.backToFront();
                    }
                    //异常接收与提示
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

        /**
         * 是否显示语音的逻辑
         */
        $scope.isVoiceVerificationCodeFalse = function () {
            OperationMonitor.record("isVoiceVerificationCodeFalse", "add_patient_info");
            $scope.isVoiceVerificationCode = false;
        };


        /**
         * 身份证监听事件，用来判断性别
         */
        $scope.$watch('userInfo.idNoView', function () {
            $scope.userInfo.idNoView = $scope.userInfo.idNoView.toUpperCase();
            var ID_NO = $scope.userInfo.idNoView;
            var Id = ID_NO.trim();
            var sex = Id.substring(16, 17);
            if (!isNaN(sex)) {
                if (Id.length > 16) {
                    if (sex % 2 == 0) {
                        $scope.userInfo.sexView = 2;
                    } else {
                        $scope.userInfo.sexView = 1;
                    }
                }
            }
        });


        /**
         * 隐藏模态窗口
         */
        $scope.hideModal = function () {
            //离开此页面的时候将物理返回事件监听卸载掉，否则会影响到其他的物理回退
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);
            KyeeViewService.removeModal({
                scope: $scope
            });
        };


        /**
         * 物理返回键监听事件
         */
        KyeeListenerRegister.once({
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();  //拦截物理返回键本身的操作
                $scope.hideModal();  //执行本身返回需要执行的操作
            }
        });


        /**
         * 儿童的生日
         */
        $scope.selectChildAge = function () {
            OperationMonitor.record("selectChildAge", "add_patient_info");
            if (!$scope.userInfo.idNoView) {
                $scope.show();
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
                $scope.userInfo.CLINIC_DATE = "";
                return false;
            }else{
                $scope.userInfo.CLINIC_DATE = params[0].value + "-" + params[1].value + "-" + params[2].value;
                return true;
            }
        };

        /**
         * 短信倒计时
         * @param timer
         */
        var setBtnState = function (timer) {
            try {
                if (second != -1) {
                    $scope.userInfo.validateMsgText =
                        KyeeI18nService.get("update_user.surplus", "剩余")
                        + second +
                        KyeeI18nService.get("update_user.seconds", "秒");
                } else {
                    $scope.userInfo.phoneNumDisabled = false;
                    $scope.userInfo.validateBtnDisabled = false;
                    $scope.userInfo.validateMsgText = KyeeI18nService.get("update_user.validateMsgText", "获取验证码");
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            } catch (e) {
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        };


        /**
         * 对手机号码的校验以及短信自动回填功能
         */
        $scope.sendCheckCode = function () {
            if (AddCustomPatientService.getValiteCode($scope.userInfo.PHONE_NUMBER)) {
                $scope.sendRegCheckCodeActionC();
                //手机验证码自动回填
                KyeeDeviceMsgService.getMessage(
                    function (validateNum) {
                        $scope.userInfo.loginNum = validateNum;
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);
                    },
                    function () {

                    }
                );
            }
        };


        /**
         * 语音短信验证码
         */
        $scope.voiceVerificationCodePop = function () {

            OperationMonitor.record("voiceVerificationCodePop", "add_patient_info");
            if (!isTimer) {
                //语音短信验证码标记
                AddCustomPatientService.voiceCode.voiceCode = 1;
                //是否倒计时  此处为否
                AddCustomPatientService.voiceCode.isCountdown = 1;
                //发送短信验证码流程
                $scope.sendCheckCode();

            } else {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("add_patient_info.againAfter60", "操作频繁，请于60秒后重试"),
                    duration: 1000
                });
            }
        };


        /**
         * 获取语音验证码间隔 定时器内容
         * @param timer
         */
        var setBtnStateVoice = function (timer) {
            try {
                if (timeCtrl != -1) {
                    timeCtrl--;
                } else {
                    isTimer = undefined;
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }

            } catch (e) {
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        };


        /**
         * 自动计算年龄
         * @returns {*}
         */
        $scope.autoBirthday = function () {
            $scope.textColor = "qy-grey7";
            if ($scope.userInfo.idNoView && AddCustomPatientService.idNoCheck($scope.userInfo.idNoView)) {
                $scope.userInfo.CLINIC_DATE = "";
                return AddCustomPatientService.convertIdNo($scope.userInfo.idNoView);
            } else if ($scope.userInfo.CLINIC_DATE) {
                return $scope.userInfo.CLINIC_DATE;
            }else{
                $scope.textColor = "greyText";
                return KyeeI18nService.get("add_patient_info.chooseBirthDate", "请选择出生日期");
            }
        };

        /**
         * 返回到上一个页面，销毁本模态页面
         */
        $scope.backToFront = function () {
            AddCustomPatientService.goSource();
            $scope.hideModal();
        };


        /**
         * 取得传参需要的参数
         */
        var getParameterOfParameter = function () {
            if(cacheStorage.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO)&&cacheStorage.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id){
                $scope.hospitalId = cacheStorage.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            }
            $scope.userInfo.BIRTHDAY = AddCustomPatientService.convertIdNo($scope.userInfo.idNoView);
            if(cacheMemory.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD)&&cacheMemory.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID){
                $scope.userId = cacheMemory.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            }
        };


        /**
         * 处理生日数据
         */
        var dealWithBirthday = function () {
            if ($scope.userInfo.BIRTHDAY && $scope.userInfo.BIRTHDAY != "") {

            } else if ($scope.userInfo.isChild == 1) {
                $scope.userInfo.BIRTHDAY = $scope.userInfo.CLINIC_DATE;
            } else {
                $scope.userInfo.BIRTHDAY = KyeeUtilsService.DateUtils.getDate("YYYY-MM-DD"); //什么都没有的情况下返回当前日期
            }
        };

        /**
         * 处理传参需要的POST数据集合
         */
        var dealWithPostData = function () {
            $scope.post = JSON.stringify(
                {
                    STATUS: 1,
                    SECURITY_CODE: $scope.userInfo.loginNum,
                    SEX: $scope.userInfo.sexView,
                    IS_CHILD: $scope.userInfo.isChild,
                    DATE_OF_BIRTH: $scope.userInfo.BIRTHDAY,
                    USER_ID: $scope.userId,
                    OFTEN_NAME: $scope.userInfo.NAME,
                    PHONE: $scope.userInfo.PHONE_NUMBER,
                    ID_NO: $scope.userInfo.idNoView,
                    FLAG: 1,
                    ID_NO_SECERT: $scope.userInfo.idNoView
                });
        };


        /**
         * 根据情况成人儿童和身份证号判断需要进入的请求
         */
        var determineRoad = function () {
            var userInfo = cacheMemory.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            if(userInfo&&userInfo.USER_ID){
                $scope.userId = userInfo.USER_ID;
            }
            if (($scope.userInfo.BIRTHDAY || $scope.userInfo.BIRTHDAY == "") && $scope.userInfo.isChild == 1) {
                if ($scope.userInfo.BIRTHDAY.length > 0) {
                    $scope.addCustomPatient();
                } else if ($scope.userInfo.isChild == 1) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("add_patient_info.selectBirthDate", "请选择出生日期！")
                    });
                }
            } else {
                $scope.addCustomPatient();
            }
        };

        /**
         * 是否展示生日选择框控制
         */
        var isShowBirthday = function () {
            $scope.userInfo.showAge = !$scope.userInfo.showAge;
            if ($scope.userInfo.isChild == '0' || $scope.userInfo.isChild == 0) {
                $scope.userInfo.isChild = 1;
            } else {
                $scope.userInfo.isChild = 0;
            }
        };

        /**
         * 是否可以选择性别控制
         */
        var isAllowSelectSex = function () {
            $scope.userInfo.sexBox = !$scope.userInfo.sexBox;
        };

    })
    .build();