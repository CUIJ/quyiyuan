/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪
 * 创建日期:2015年5月4日10:18:09
 * 创建原因：新增就诊者服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.add_custom_patient.service")//baobing
    .require(["kyee.framework.service.messager"])//input
    .type("service")
    .name("AddCustomPatientService")
    .params([
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "HttpServiceBus",
        "KyeeUtilsService",
        "Md5UtilService",
        "AddPatientInfoService",
        "CustomPatientService",
        "RsaUtilService",
        "KyeeI18nService",
        "CacheServiceBus",
        "CenterUtilService"
    ])
    .action(function (
        $state,
        KyeeMessageService,
        KyeeViewService,
        HttpServiceBus,
        KyeeUtilsService,
        Md5UtilService,
        AddPatientInfoService,
        CustomPatientService,
        RsaUtilService,
        KyeeI18nService,
        CacheServiceBus,
        CenterUtilService) {
        var def = {

            checkNum: "",//验证码问题   By  张家豪  KYEEAPPTEST-2840
            //分别进入不同来源的标记  3:来源于就医记录跳转
            Mark: "",
            currentUserPhoneNum:"", //当前登录用户的手机号    By  杨旭平   KYEEAPPC-10873
            isNeedMessageCode:"true",   //是否需要验证短信验证码
            //begin 实名认证页面跳转   By  张家豪  KYEEAPPC-2861
            HOSPITAL_SM: undefined,
            Restart:{},
            //语音验证码
            voiceCode: {
                voiceCode: undefined,  //是否是语音验证码
                isCountdown: undefined  //是否倒计时
            },
            //分别进入不同来源页面
            goSource: function () {
                if (def.Mark == 1) {
                    CustomPatientService.updateView();
                } else if (def.Mark == 2) {
                    AddPatientInfoService.updateView();
                } else if (def.Mark == 3){
                    var memoryCache = CacheServiceBus.getMemoryCache();//全局参数
                    if(memoryCache && memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD) && memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID){
                        var userId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
                        this.Restart.queryCustomPatient(userId);
                    }
                }
            },
            //是否显示儿童
            queryHospitalParam: function (hospitalId, paramName, onSuccess) {
                HttpServiceBus.connect({
                    url: "/hospitalInform/action/HospitalinforActionC.jspx",
                    params: {
                        hospitalId: hospitalId,
                        paramName: paramName,
                        op: "queryHospitalParam"
                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            },
            //短信验证
            sendRegCheckCodeActionC: function (businessType,hospitalId, PHONE_NUMBER, USER_NAME, onSuccess) {
                //语音验证  分支    By  付添  KYEEAPPC-3540
                if (def.voiceCode.voiceCode == 1) {
                    var url = '/user/action/DataValidationActionC.jspx';
                    var params = {
                        op: 'requestVoiceCodeActionC',
                        PHONE_NUMBER: RsaUtilService.getRsaResult(PHONE_NUMBER),
                        USER_NAME: USER_NAME,
                        MOD_ID: '100698',
                        businessType:businessType,
                        VOICE_TYPE: '6',
                        HOSPITAL_ID: hospitalId
                    };
                    def.voiceCode.voiceCode = undefined;
                    def.voiceCode.isCountdown = 1;
                } else {
                    //短信验证  分支    By  付添  KYEEAPPC-3540
                    var url = "/user/action/DataValidationActionC.jspx";
                    var params = {
                        hospitalId: hospitalId,
                        messageType: 2,
                        businessType:businessType,
                        PHONE_NUMBER: RsaUtilService.getRsaResult(PHONE_NUMBER),
                        USER_NAME: USER_NAME,
                        modId: 10001,
                        op: "sendRegCheckCodeActionC"
                    };
                }
                HttpServiceBus.connect({
                    url: url,
                    params: params,
                    // 将短信验证码倒计时改为ionic自带的定时器   By  张家豪  KYEEAPPTEST-2890
                    onSuccess: function (data) {
                        if (data.success) {
                            if (def.voiceCode.isCountdown == 1) {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("add_patient_info.waitPhone","请您稍等，[语音验证码]电话马上就来"),
                                    duration: 5000
                                });
                            } else if(data.data.SECURITY_CODE!='007') {
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                            onSuccess(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }


                    }
                });
            },

            //提交
            addCustomPatient: function (postdata, hospitalID, onSuccess) {
                var userType = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_TYPE;
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    params: {
                        postdata: postdata,
                        hospitalID: hospitalID,
                        USER_TYPE : userType ,
                        isNeedMessageCode: def.isNeedMessageCode,
                        op: "addCustomPatient"

                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            },
            ok: function () {
                KyeeMessageService.broadcast({
                    content:KyeeI18nService.get("add_patient_info.idNoIsMore","身份证重复！")
                });
            },
            //创建生日，目前没有格式日期，先写死
            createBirthday: function (idNo) {
                idNo = idNo.trim();//清空字符串前后无用字符
                if (isNaN(idNo.substring(0, 14))) {
                    //不是数字,显示当前日期
                    return "";// 选择儿童出生年月日   By  张家豪  KYEEAPPC-2877
                }
                else {
                    //是数字
                    var year = idNo.substring(6, 10);//年
                    var month = idNo.substring(10, 12);//月
                    var day = idNo.substring(12, 14);//日
                    //格式不正确
                    if (month > 12 || month < 1 || day > 31 || day < 1) {
                        return "";// 选择儿童出生年月日   By  张家豪  KYEEAPPC-2877
                    }
                    return year + "-" + month + "-" + day;
                }
            },
            //失去焦点时，身份证转化为日期
            convertIdNo: function (idno) {
                if (idno != null && idno != undefined && idno != "") {
                    var ID_NO = idno;     //获取输入的身份证值
                    idNo = ID_NO.trim();//清空字符串前后无用字符
                    var birthday = this.createBirthday(ID_NO);
                    return birthday;
                }
            },
            //先校验姓名
            validateNameView: function (xingming) {
                if (xingming == 0) {
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("add_patient_info.nameNotNull","姓名不能为空！")
                    });
                    return false;
                }
                return true;
            },
            //校验手机号（是否为空、格式是否错误、长度是否错误、是否被绑定)
            validatePhoneNum: function (phoneNum) { //验证码问题   By  张家豪  KYEEAPPTEST-2840
                var phoneNum = phoneNum.trim();
                //为空则提示并返回
                if (!phoneNum) {
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("add_patient_info.phoneNotNull","手机号码不能为空！")
                    });
                    return false;
                } else if (!this.isMobil(phoneNum)) {
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("add_patient_info.phoneLangIsFalse","手机号格式或长度错误！")
                    });
                    return false;
                }
                return true;
            },
            validateLoginNum: function (loginNum) {
                if (!loginNum) {
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("add_patient_info.codeIsNull","验证码不能为空！")
                    });
                    return false;
                }
                return true;
            },
            //校验性别
            validateExce: function (sex) {
                if (sex == "") {
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("add_patient_info.notSelectSex","尚未选择性别！")
                    });
                    return false;
                }
                return true;
            },
            //身份证校验算法
            idNoCheck: function (idNo) {
                //idNo=idNo.trim();//清空字符串前后无用字符
                if (idNo.length != 18) //判断身份证号是否大于18位
                {
                    return false;
                }
                else if (isNaN(idNo.substring(0, 17))) //切割字符串从第0个开始，长度为17-0位,第0位到第17位,判断是否为非数值
                {
                    return false;
                }
                else if (isNaN(idNo.substring(17))) //切割字符串从第0个开始，长度为17位
                {
                    //判断是否最后一位为X，需要进行大小写转换，避免由于大小写问题造成的验证失败
                    if (idNo.substring(17, 18).toUpperCase() != 'X') //判断最后以为是否为X
                    {
                        return false;
                    }
                }
                return this.authIdNo(idNo); //身份证最后一位验证算法
            },
            //校验算法
            authIdNo: function (idNo) {
                //系数枚举
                var authArray = new Array();
                authArray[0] = 7;
                authArray[1] = 9;
                authArray[2] = 10;
                authArray[3] = 5;
                authArray[4] = 8;
                authArray[5] = 4;
                authArray[6] = 2;
                authArray[7] = 1;
                authArray[8] = 6;
                authArray[9] = 3;
                authArray[10] = 7;
                authArray[11] = 9;
                authArray[12] = 10;
                authArray[13] = 5;
                authArray[14] = 8;
                authArray[15] = 4;
                authArray[16] = 2;

                //对照值枚举
                var refArray = new Array();
                refArray[0] = 1;
                refArray[1] = 0;
                refArray[2] = 'X';
                refArray[3] = 9;
                refArray[4] = 8;
                refArray[5] = 7;
                refArray[6] = 6;
                refArray[7] = 5;
                refArray[8] = 4;
                refArray[9] = 3;
                refArray[10] = 2;

                //初始化总数
                var total = 0;
                idNo = idNo.trim();//清空字符串前后无用字符
                for (var i = 0; i < 17; i++) //计算总值
                {
                    total += Number(idNo[i]) * authArray[i];
                }
                if (refArray[Number(total % 11)] == idNo[17]) //判断验证位是否符合
                {
                    return true;
                }
                else {
                    return false;
                }
            },
            //手机号格式校验
            isMobil: function (s) {
                var patrn = /^(\+86)?1[3|5|4|7|8|9|6]\d{9}$/;
                if (!patrn.test(s)) {
                    return false;
                }
                return true;
            },
            getValiteCode: function (phoneNum) {
                if (!this.validatePhoneNum(phoneNum)) {
                    return false;
                }
                return true;
                var phoneNum = phoneNum.trim();
                if (phoneNum.length == 14) {
                    phoneNum = phoneNum.substring(3);
                }
            },
            submit: function ($scope) {
                var phoneNum = $scope.userInfo.PHONE_NUMBER.trim();
                var loginNum = $scope.userInfo.loginNum;
                var fullName = $scope.userInfo.NAME.trim();
                var identification = $scope.userInfo.idNoView.trim();
                var sexuality = $scope.userInfo.sexView; 
                var isSelectChild = $scope.userInfo.isChild;
                //校验姓名是否为空
                if (!this.validateNameView(fullName)) {
                    return false;
                }
                //个人中心主页开发（APK）  By  张家豪  KYEEAPPC-4404
                if ($scope.userInfo.idNoView) {
                    //校验身份证的格式,添加就诊者修改（APK） By 张家豪 KYEEAPPC-4424
                    if (!CenterUtilService.idNoCheck(identification)) {
                        KyeeMessageService.broadcast({
                            content:KyeeI18nService.get("add_patient_info.idNoIsFalse","身份证格式错误！")
                        });
                        return false;
                    }
                } else if (!$scope.userInfo.idNoView && isSelectChild == 0){
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("add_patient_info.idNoIsFalse","请输入您的身份证！")
                    });
                    return false;
                }
                //效验手机号
                if (!this.validatePhoneNum(phoneNum)) {
                    return false;
                }
                //效验注册码
                if (def.isNeedMessageCode && !this.validateLoginNum(loginNum)) { //验证码问题   By  张家豪  KYEEAPPTEST-2840
                    return false;
                }
                //校验性别
                if (!this.validateExce(sexuality)) {
                    return false;
                }
                return true;
            },
            otherAdd: function (clickCount, phoneNum) {
                //效验手机号
                if (this.validatePhoneNum(phoneNum)) {
                    if (clickCount <= 3) {

                    }
                }
            }
        };
        return def;
    })
    .build();

