/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪
 * 创建日期:2015年5月4日10:18:09
 * 创建原因：个人信息维护服务
 * 修改人: 朱学亮
 * 修改原因: 添加上传头像功能
 * 修改时间: 2015年5月22日
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.updateuser.service")
    .require(["kyee.framework.file.upload"])
    .type("service")
    .name("UpdateUserService")
    .params([
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeUtilsService",
        "Md5UtilService",
        "KyeeUploadFileService",
        "HomeUserService",
        "RsaUtilService",
        "$ionicHistory",
        "KyeeI18nService",
        "HospitalService"
    ])
    .action(function ($state,
                      KyeeMessageService,
                      KyeeViewService,
                      HttpServiceBus,
                      CacheServiceBus,
                      KyeeUtilsService,
                      Md5UtilService,
                      KyeeUploadFileService,
                      HomeUserService,
                      RsaUtilService,
                      $ionicHistory,
                      KyeeI18nService,
                      HospitalService) {
        var def = {
            checkNum: "",//验证码问题   By  张家豪  KYEEAPPTEST-2840
            /*begin 程铄闵 c端首页跳转*/
            skipRoute: "center->MAIN_TAB",
            goOut: function () {
                $ionicHistory.goBack();
            },
            /*end 程铄闵 c端首页跳转*/
            DadNoShow: function () {
                $state.go("center->MAIN_TAB");
            },
            //个人信息请求
            queryUserInfo: function (userId, onSuccess) {
                HttpServiceBus.connect({
                    url: "/user/action/LoginAction.jspx",
                    params: {
                        userId: userId,
                        op: "queryUserInfo"
                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            },
            //给医保卡参数
            HOSPITAL_YB: undefined,
            //给实名认证参数
            HOSPITAL_SM: undefined,
            //给就诊卡参数
            HOSPITAL_JZ: undefined,
            //综合标记
            F_LAG: undefined,
            //物理卡请求
            showCard: function (hospitalId, paramName, onSuccess) {
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
            //切换医院之获取默认就诊者信息
            getDefaultUserVsId: function (userId, idNo, name, onSuccess) {
                HttpServiceBus.connect({
                    url: "/user/action/LoginAction.jspx",
                    params: {
                        userId: userId,
                        idNo: idNo,
                        name: name,
                        op: "getDefaultUserVsId"
                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);

                        }
                    }
                });
            },
            //切换医院之选中就诊者查询
            selectedCustomPatient: function (userId, hospitalId, onSuccess) {
                var sourceFlag = "";
                if(HospitalService.hosSelectCustomPatient){
                    HospitalService.hosSelectCustomPatient = false;//重置表示
                    sourceFlag = "HOME";
                }

                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    params: {
                        userId: userId,
                        hospitalId: hospitalId,
                        sourceFlag: sourceFlag,
                        op: "selectedCustomPatient"
                    },
                    showLoading: false,
                    onSuccess: function (data) {
                        if (data.data != null && data.data != undefined && data.data.length > 0) {
                            var isNoVs = data.data[0];
                            var currentCustomPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                            if (!currentCustomPatient) {
                                currentCustomPatient = {};
                                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, currentCustomPatient);
                            }
                            currentCustomPatient.OFTEN_NAME = isNoVs.OFTEN_NAME;
                            currentCustomPatient.SEX = isNoVs.SEX;
                            currentCustomPatient.USER_VS_ID = isNoVs.USER_VS_ID;
                            currentCustomPatient.USER_ID = isNoVs.USER_ID;
                            currentCustomPatient.IS_DEFAULT = isNoVs.IS_DEFAULT;
                            currentCustomPatient.ID_NO = isNoVs.ID_NO;
                            currentCustomPatient.DATE_OF_BIRTH = isNoVs.DATE_OF_BIRTH;
                            currentCustomPatient.PHONE = isNoVs.PHONE;
                            currentCustomPatient.FLAG = isNoVs.FLAG;
                            currentCustomPatient.IS_CHILD = isNoVs.IS_CHILD;
                            currentCustomPatient.LAST_SELECT = isNoVs.LAST_SELECT;
                            currentCustomPatient.IS_SELECTED = isNoVs.IS_SELECTED;
                            currentCustomPatient.STATUS = isNoVs.STATUS;
                            currentCustomPatient.ROLE_CODE = isNoVs.ROLE_CODE;
                            if (isNoVs.IMAGE_PATH != undefined && isNoVs.IMAGE_PATH != null && isNoVs.IMAGE_PATH != "") {
                                currentCustomPatient.IMAGE_PATH = isNoVs.IMAGE_PATH;
                            } else {
                                currentCustomPatient.IMAGE_PATH = "";
                            }
                            if (isNoVs.CARD_NO != null && isNoVs.CARD_NO != undefined) {
                                currentCustomPatient.CARD_NO = isNoVs.CARD_NO;
                            } else {
                                currentCustomPatient.CARD_NO = "";
                            }
                            var detailList = JSON.parse(isNoVs.DETIAL_LIST);
                            if (isNoVs.DETIAL_LIST != null && isNoVs.DETIAL_LIST != undefined && isNoVs.DETIAL_LIST != "null" && isNoVs.DETIAL_LIST.length > 0 && detailList.length > 0) {
                                currentCustomPatient.DETIAL_LIST = isNoVs.DETIAL_LIST;
                                currentCustomPatient.PATIENT_CARD = isNoVs.DETIAL_LIST;
                                var cardInfo = undefined;
                                for (var i = 0; i < detailList.length; i++) {
                                    if (detailList[i].IS_DEFAULT == 1) {
                                        cardInfo = detailList[i];
                                    }
                                    CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, cardInfo);
                                }
                            } else {
                                currentCustomPatient.DETIAL_LIST = "";
                                currentCustomPatient.PATIENT_CARD = "";
                                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, {});
                            }
                        }else{
                            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, {});
                        }
                        onSuccess(data);
                    }
                });
            },
            //查取就诊卡
            queryBindCardNo: function (userVsId, hospitalId, onSuccess) {
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    params: {
                        userVsId: userVsId,
                        hospitalId: hospitalId,
                        op: "queryBindCardNo"
                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            },
            //是否显示医保卡
            getHospitalParam: function (HOSPITAL_ID, PARAM_NAME, onSuccess) {
                HttpServiceBus.connect({
                    url: "/medicalSecurity/action/MedicalSecurityActionC.jspx",
                    params: {
                        HOSPITAL_ID: HOSPITAL_ID,
                        PARAM_NAME: PARAM_NAME,
                        op: "getHospitalParam"
                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            },
            //医保卡请求
            queryMedicalSecurityCardInfo: function (HOSPITAL_ID, userInfo, onSuccess) {
                HttpServiceBus.connect({
                    url: "/medicalSecurity/action/MedicalSecurityActionC.jspx",
                    params: {
                        HOSPITAL_ID: HOSPITAL_ID,
                        USER_VS_ID: userInfo.userVsId,
                        OFTEN_NAME: userInfo.OFTEN_NAME,
                        ID_NO: userInfo.ID_NO,
                        op: "queryMedicalSecurityCardInfo"
                    },
                    onSuccess: function (resp) {
                        var data = resp.data;
                        onSuccess(data);
                    }
                });
            },
            //提交
            updateuser: function (CHECK_USER_ID, postdata, cardNo, hospitalID, onSuccess) {
                HttpServiceBus.connect({
                    url: "/user/action/LoginAction.jspx",
                    params: {
                        CHECK_USER_ID: CHECK_USER_ID,
                        postdata: postdata,
                        cardNo: cardNo,
                        //修改人：张家豪
                        //修改时间：2015/7/13
                        //任务号：KYEEAPPTEST-2707
                        //修改原因：在个性化app上用正常app上注册过的手机号注册完善个人信息后会挤掉正常app的账号
                        op: "updateuser"

                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            },
            //短信验证
            sendRegCheckCodeActionC: function (hospitalId, PHONE_NUMBER, USER_NAME, onSuccess) {
                HttpServiceBus.connect({
                    url: "/user/action/DataValidationActionC.jspx",
                    params: {
                        hospitalId: hospitalId,
                        messageType: 2,
                        PHONE_NUMBER: RsaUtilService.getRsaResult(PHONE_NUMBER),
                        USER_NAME: USER_NAME,
                        modId: 10001,
                        op: "sendRegCheckCodeActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess();
                        }
                        KyeeMessageService.broadcast({
                            content: data.message
                        });
                    }
                });
            },
            //先校验姓名
            validateXingMing: function (xingming) {
                if (xingming == 0) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("add_patient_info.nameNotNull", "姓名不能为空！")

                    });
                    return false;
                }
                return true;
            },
            //创建生日，目前没有格式日期，先写死
            createBirthday: function (idNo) {
                idNo = idNo.trim();//清空字符串前后无用字符
                if (isNaN(idNo.substring(0, 14))) {
                    //不是数字,显示当前日期
                    return KyeeUtilsService.DateUtils.getDate("YYYY-MM-DD");// 附加就诊者时间格式传入错误   By  张家豪  APPCOMMERCIALBUG-987
                }
                else {
                    //是数字
                    var year = idNo.substring(6, 10);//年
                    var month = idNo.substring(10, 12);//月
                    var day = idNo.substring(12, 14);//日
                    //格式不正确
                    if (month > 12 || month < 1 || day > 31 || day < 1) {
                        return KyeeUtilsService.DateUtils.getDate("YYYY-MM-DD");// 附加就诊者时间格式传入错误   By  张家豪  APPCOMMERCIALBUG-987
                    }
                    return year + "-" + month + "-" + day;
                }
            },
            //失去焦点时，身份证转化为日期，目前没有格式日期，先写死
            convertIdNo: function (idno) {
                if (idno != null && idno != undefined && idno != "") {
                    //修改人：张家豪
                    //修改时间：2015/7/13
                    //任务号：KYEEAPPTEST-2707
                    //修改原因：在个性化app上用正常app上注册过的手机号注册完善个人信息后会挤掉正常app的账号
                    var ID_NO = idno;     //获取输入的身份证值
                    var birthday = this.createBirthday(ID_NO);
                    return birthday;
                }
            },
            //根据身份证号码获取年龄
            getAgeByIdNo: function (idNo) {
                var year = new Date().getFullYear();
                var birthday = idNo;
                if (birthday && birthday.length > 4) {
                    birthday = birthday.substring(6, 10);
                } else {
                    birthday = year;
                }
                if (year - birthday >= 0) {
                    age = year - birthday;
                    return age;
                } else {                                    //无年龄数据
                    return "";
                }
            },
            //校验手机号（是否为空、格式是否错误、长度是否错误、是否被绑定)
            validatePhoneNum: function (phoneNum) {
                var phoneNum = phoneNum.trim();
                //为空则提示并返回
                if (!phoneNum) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("add_patient_info.phoneNotNull", "手机号不能为空！")
                    });
                    return false;
                } else if (!this.isMobil(phoneNum)) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("add_patient_info.phoneLangIsFalse", "手机号格式或长度错误！")
                    });
                    return false;
                }
                return true;
            },
            validateLoginNum: function (loginNum, ophone) {  //验证码问题   By  张家豪  KYEEAPPTEST-2840
                if (ophone != 1) {
                    if (!loginNum) {
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("add_patient_info.codeIsNull", "验证码不能为空！")

                        });
                        return false;
                    }
                    return true;
                } else if (ophone = 1) {
                    return true;
                }
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
            IDisNull: function () {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("comm_patient_detail.nameAndIdNotNull", "姓名或身份证不能为空！")
                    // content: "姓名或身份证为空！"
                });
            },
            isNulls: function () {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("comm_patient_detail.nameAndIdNotNull", "姓名或身份证不能为空！")
                });
            },
            PHONEisNulls: function () {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("add_patient_info.phoneNotNull", "手机号不能为空！")
                });
            },
            SmsisNulls: function () {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("change_pwd.validationFailure", "效验注册码失败！")
                });
            },
            isSucess: function () {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("update_user.improveSuccess", "完善信息成功！")
                });
            },
            //为跳转查取就诊卡页面传值
            lastClassInfro: undefined,
            Translation: function ($scope) {
                var phoneNum = $scope.userInfo.PHONE_NUMBER.trim();
                var ophone = $scope.userInfo.AZURE
                var loginNum = $scope.userInfo.loginNum;
                var xm = $scope.userInfo.NAME.trim();
                var sf = $scope.userInfo.ID_NO.trim();
                //校验姓名是否为空
                if (!this.validateXingMing(xm)) {
                    return false;
                }
                //校验身份证的格式啊吧啦吧啦~~
                if (!this.idNoCheck(sf)) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("add_patient_info.idNoIsFalse", "身份证格式错误！")
                    });
                    return false;
                }
                //效验手机号
                if (!this.validatePhoneNum(phoneNum)) {
                    return false;
                }
                //效验注册码
                if (!this.validateLoginNum(loginNum, ophone)) { //验证码问题   By  张家豪  KYEEAPPTEST-2840
                    return false;
                }
                return true;
            },
            scope: {},
            updateView: function () {
                this.scope.searchInit();
            },
            // 上传头像 朱学亮修改
            uploadImage: function (userVsId, image, onSuccess) {
                var rootServerURL = AppConfig.SERVER_URL;
                var serverURL = rootServerURL + "center/action/CustomPatientAction.jspx?" + "loc=c&op=uploadPatientImage";
                var params = {};
                params.userVsId = userVsId;
                KyeeUploadFileService.uploadFile(
                    function (response) {
                        // 上传成功，解析返回数据
                        var data = JSON.parse(response.response);
                        if (data.success == true) {
                            onSuccess(true);
                        } else {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("comm_patient_detail.loadHearFalse", "上传头像失败请重试！")
                            });
                        }
                    },
                    function (error) {
                        // 上传失败
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("comm_patient_detail.loadHearFalse", "上传头像失败请重试！")
                        });
                    }, image, serverURL, "image/jpeg", params);
            },
            //查取登陆账户下选择的就诊者
            //begin 二维码信息优化，用户信息维护完成，不能直接看到二维码信息   By  张家豪  APPCOMMERCIALBUG-1087
            getSelectCustomInfo: function (userId, hospitalInfo, onSuccess) {
                HttpServiceBus.connect({
                    url: '/center/action/CustomPatientAction.jspx',
                    params: {
                        userId: userId,
                        op: 'selectedCustomPatient',
                        hospitalId: hospitalInfo
                    },
                    onSuccess: function (retVal) {
                        onSuccess(retVal);
                        var success = retVal.success;
                        var data = retVal.data;
                        if (success) {
                            if (data) {
                                for (var i = 0; i < data.length; i++) {
                                    if (data[i].IS_SELECTED == 1) {
                                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, data[i]);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                });
            },   //end 二维码信息优化，用户信息维护完成，不能直接看到二维码信息   By  张家豪  APPCOMMERCIALBUG-1087
            //获取拍照option
            getCameraOption: function (platform) {
                var option = undefined;
                if (platform == "Android") {
                    option = {
                        quality: 40,
                        destinationType: Camera.DestinationType.FILE_URI,
                        targetWidth: 900,  //设置图片宽度
                        targetHeight: 900,//设置图片高度
                        allowEdit: true,
                        encodingType: Camera.EncodingType.JPEG,
                        sourceType: Camera.PictureSourceType.CAMERA
                    };
                } else if (platform == "iOS") {
                    option = {
                        quality: 40,
                        destinationType: Camera.DestinationType.FILE_URI,
                        targetWidth: 900,  //设置图片宽度
                        targetHeight: 900,//设置图片高度
                        saveToPhotoAlbum: true,
                        allowEdit: true,
                        sourceType: Camera.PictureSourceType.CAMERA
                    };
                }
                return option;
            },
            //获取相册option
            getAlbumOption: function (platform) {
                var option = undefined;
                if (platform == "Android") {
                    option = {
                        quality: 40,
                        destinationType: Camera.DestinationType.FILE_URI,
                        targetWidth: 900,//设置图片宽度
                        targetHeight: 900,//设置图片高度
                        allowEdit: false,
                        encodingType: Camera.EncodingType.JPEG,
                        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM
                    };
                } else if (platform == "iOS") {
                    option = {
                        quality: 40,
                        destinationType: Camera.DestinationType.FILE_URI,
                        targetWidth: 900,//设置图片宽度
                        targetHeight: 900,//设置图片高度
                        saveToPhotoAlbum: true,
                        allowEdit: true,
                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                    };
                }
                return option;
            },
            getPostData: function (userInfo) {
                var post = JSON.stringify({
                    ID_NO: userInfo.ID_NO,
                    USER_ID: userInfo.userId,
                    NAME: userInfo.NAME,
                    PHONE_NUMBER: userInfo.PHONE_NUMBER,
                    SECURITY_CODE: userInfo.loginNum,
                    BIRTHDAY: userInfo.BIRTHDAY,
                    SEX: userInfo.SEX
                });
                return post;
            },
            //处理数据
            handleUserInfo: function (data, userInfo) {
                userInfo.PHONE_NUMBER = data.PHONE_NUMBER;
                userInfo.ORG_PHONE_NUMBER = data.PHONE_NUMBER;
                userInfo.NAME = data.NAME;
                userInfo.ID_NO = data.ID_NO;
                userInfo.SEX = data.SEX;
                this.item = data.PHONE_NUMBER;
                userInfo.BIRTHDAY = this.convertIdNo(userInfo.ID_NO);//计算出生日期
                userInfo.age = this.getAgeByIdNo(data.ID_NO);
            },
            //整理数据
            handleData: function (data, userInformation, userInfo, AuthenticationService, CommPatientDetailService) {
                userInformation.DEFAULT_USER_VS_ID = data.USER_VS_ID;
                userInformation.DEFAULT_CARD_NO = data.CARD_NO;
                userInformation.DEFAULT_FLAG = data.FLAG;

                userInfo.LAST_SELECT = data.LAST_SELECT;
                userInfo.IS_CHILD = data.IS_CHILD;
                userInfo.IS_SELECTED = data.IS_SELECTED;
                userInfo.ROLE_CODE = data.ROLE_CODE;
                userInfo.STATUS = data.STATUS;
                userInfo.IS_DEFAULT = data.IS_DEFAULT;
                userInfo.FLAG = data.FLAG;

                //存一次缓存
                if (data.IS_SELECTED == 1) {


                    var memoryCache = CacheServiceBus.getMemoryCache();
                    var patientCache = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    patientCache.OFTEN_NAME = userInfo.NAME;
                    patientCache.SEX = userInfo.SEX;
                    patientCache.USER_VS_ID = data.USER_VS_ID;
                    patientCache.USER_ID = data.USER_ID;
                    patientCache.IS_DEFAULT = data.IS_DEFAULT;
                    patientCache.ID_NO = userInfo.ID_NO;
                    patientCache.PHONE = userInfo.PHONE_NUMBER;
                    patientCache.FLAG = data.FLAG;
                    patientCache.DATE_OF_BIRTH = userInfo.BIRTHDAY;
                    patientCache.IS_CHILD = data.IS_CHILD;
                    patientCache.IS_SELECTED = data.IS_SELECTED;
                    patientCache.LAST_SELECT = data.LAST_SELECT;
                    patientCache.STATUS = data.STATUS;
                    patientCache.ROLE_CODE = data.ROLE_CODE;
                    patientCache.CARD_NO = data.CARD_NO;
                    if (data.IMAGE_PATH) {
                        patientCache.IMAGE_PATH = data.IMAGE_PATH;
                    } else {
                        patientCache.IMAGE_PATH = "";
                    }
                    if (data.DETIAL_LIST) {
                        patientCache.DETIAL_LIST = data.DETIAL_LIST;
                    }
                    if (data.PATIENT_CARD) {
                        patientCache.PATIENT_CARD = data.PATIENT_CARD;
                    }
                }

                //就诊者头像字段
                if (data.IMAGE_PATH) {
                    userInfo.IMAGE_PATH = data.IMAGE_PATH;
                    userInfo.imgUrl = data.IMAGE_PATH;
                } else {
                    userInfo.imgUrl = 'resource/images/center/headM.png';//默认头像路径
                }

                userInfo.nameAndIdentityCcardInput = false;// 实名认证通过后不允许更改个人信息和就诊者信息  By  张家豪  KYEEAPPC-2939
                //实名认证的状态
                if (userInfo.FLAG == 0) {

                    userInfo.ID_FLAG = KyeeI18nService.get("comm_patient_detail.isBeingProcessed", "正在处理...");
                    userInfo.realName = true;
                } else if (userInfo.FLAG == 1) {

                    userInfo.ID_FLAG = KyeeI18nService.get("comm_patient_detail.isBeingOk", "已通过");
                    userInfo.realName = true;
                    userInfo.nameAndIdentityCcardInput = true;// 实名认证通过后不允许更改个人信息和就诊者信息  By  张家豪  KYEEAPPC-2939
                } else if (userInfo.FLAG == 2) {

                    userInfo.ID_FLAG = KyeeI18nService.get("comm_patient_detail.isBeingFalse", "认证失败");
                } else if (userInfo.FLAG == 3) {

                    userInfo.ID_FLAG = KyeeI18nService.get("comm_patient_detail.isBeingNoKnow", "未认证");
                }
                userInfo.userVsId = data.USER_VS_ID;
                userInfo.OFTEN_NAME = data.OFTEN_NAME;

                //跳转时，将本页的信息注入将要跳转页面的服务中
                this.HOSPITAL_YB = {
                    USER_ID: userInfo.userId,
                    USER_VS_ID: userInfo.userVsId,
                    OFTEN_NAME: userInfo.OFTEN_NAME,
                    ID_NO: userInfo.ID_NO
                };
                AuthenticationService.lastClass = "UPDATE_USER";

                AuthenticationService.HOSPITAL_SM = {
                    OFTEN_NAME: userInfo.OFTEN_NAME,
                    ID_NO: userInfo.ID_NO,
                    PHONE: userInfo.PHONE_NUMBER,
                    USER_VS_ID: userInfo.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                    FLAG: userInfo.FLAG
                };
                this.HOSPITAL_JZ = {
                    USER_ID: userInfo.userId,
                    USER_VS_ID: userInfo.userVsId,
                    OFTEN_NAME: userInfo.OFTEN_NAME,
                    ID_NO: userInfo.ID_NO,
                    PHONE: userInfo.PHONE_NUMBER
                };
                this.F_LAG = 1;
                CommPatientDetailService.F_LAG = 0;
            },
            //处理默认数据
            handleDefualtData: function (userInformation, userInfo) {
                userInformation.DEFAULT_USER_VS_ID = "-1";
                userInformation.DEFAULT_CARD_NO = "";
                userInformation.DEFAULT_FLAG = "3";
                userInfo.FLAG = "3";
                userInfo.ID_FLAG = KyeeI18nService.get("comm_patient_detail.isBeingNoKnow", "未认证");
                userInfo.CARD_NO = "";
                userInfo.CARD_SHOW = "";
                userInfo.USER_VS_ID = "-1";
                userInfo.imgUrl = 'resource/images/center/headM.png';//默认头像路径
            },
            //处理绑定就诊卡数据
            handleBindCardData: function (userInfo, data, userInformation) {
                userInfo.CARD_NO = data.CARD_NO;
                userInfo.CARD_SHOW = data.CARD_SHOW;
                userInfo.VCARD_NO = data.VCARD_NO;
                userInfo.CARD_DESC = data.CARD_DESC;

                if (userInfo.CARD_NO && userInfo.CARD_NO == userInfo.VCARD_NO
                    && userInfo.CARD_SHOW && userInfo.isShowJiu) {

                    userInfo.showText = true;
                } else {

                    userInfo.showText = false;
                }
                //给查取就诊卡页面传值（必须写在回调函数中，确保有值）
                this.lastClassInfro = {
                    current_user_record: userInformation,
                    commCardNo: userInfo.CARD_NO
                };
            },
            //处理当前就诊者数据
            handleCurrentCustomPatient: function (userInfo, userInformation, currentCustomPatient, hospitalId) {
                //用户缓存中的身份证是否为空
                if (!userInformation.ID_NO) {

                    if (currentCustomPatient) {  //就诊者缓存为空时增加
                        currentCustomPatient.OFTEN_NAME = userInfo.NAME;
                        currentCustomPatient.SEX = userInfo.SEX;
                        currentCustomPatient.USER_ID = userInfo.userId;
                        currentCustomPatient.IS_DEFAULT = 1;
                        currentCustomPatient.ID_NO = userInfo.ID_NO;
                        currentCustomPatient.PHONE = userInfo.PHONE_NUMBER;
                        currentCustomPatient.FLAG = 3;
                        currentCustomPatient.IS_CHILD = 0;
                        currentCustomPatient.IS_SELECTED = 1;
                        currentCustomPatient.STATUS = 1;
                        currentCustomPatient.ROLE_CODE = 4;
                    }
                    if (hospitalId) { //判断是否选择了医院
                        // 二维码信息优化，用户信息维护完成，不能直接看到二维码信息  By  张家豪  APPCOMMERCIALBUG-1087
                        this.getSelectCustomInfo(userInfo.userId, hospitalId, function (retVal) {
                        });
                    }
                }
                userInformation.ID_NO = userInfo.ID_NO;
                userInformation.NAME = userInfo.NAME;
                userInformation.PHONE_NUMBER = userInfo.PHONE_NUMBER;
                userInformation.BIRTHDAY = userInfo.BIRTHDAY;
                userInformation.SEX = userInfo.SEX;
            },
            //处理就诊者数据
            handlePatientData: function (patientCache, userInfo, data) {
                patientCache.OFTEN_NAME = userInfo.NAME;
                if (data.IMAGE_PATH) {
                    patientCache.IMAGE_PATH = data.IMAGE_PATH;
                } else {
                    patientCache.IMAGE_PATH = "";
                }
                patientCache.SEX = userInfo.SEX;
                patientCache.USER_VS_ID = data.USER_VS_ID;
                patientCache.USER_ID = data.USER_ID;
                patientCache.IS_DEFAULT = data.IS_DEFAULT;
                patientCache.ID_NO = userInfo.ID_NO;
                patientCache.PHONE = userInfo.PHONE_NUMBER;
                patientCache.FLAG = data.FLAG;
                patientCache.DATE_OF_BIRTH = userInfo.BIRTHDAY;
                patientCache.IS_CHILD = data.IS_CHILD;
                patientCache.IS_SELECTED = data.IS_SELECTED;
                patientCache.LAST_SELECT = data.LAST_SELECT;
                patientCache.STATUS = data.STATUS;
                patientCache.ROLE_CODE = data.ROLE_CODE;
                patientCache.CARD_NO = data.CARD_NO;
                if (data.DETIAL_LIST) {
                    patientCache.DETIAL_LIST = data.DETIAL_LIST;
                }
                if (data.PATIENT_CARD) {
                    patientCache.PATIENT_CARD = data.PATIENT_CARD;
                }
            },
            //获取性别
            getSex: function (userInfo) {
                if (userInfo.ID_NO) {
                    // 输入身份证号含字母的自动转换为大写字母   By  张家豪  KYEEAPPC-2749
                    userInfo.ID_NO = userInfo.ID_NO.toUpperCase();
                }
                var ID_NO = userInfo.ID_NO;
                if (ID_NO) {
                    var Id = ID_NO.trim();
                    var sex = Id.substring(16, 17);
                    if (!isNaN(sex) && Id.length > 16) {
                        if (sex % 2 == 0) {
                            userInfo.SEX = 2;
                            if (!userInfo.IMAGE_PATH) {
                                userInfo.imgUrl = "resource/images/center/headF.png";
                            }
                            return KyeeI18nService.get("update_user.women", "女");
                        } else {
                            userInfo.SEX = 1;
                            if (!userInfo.IMAGE_PATH) {
                                userInfo.imgUrl = "resource/images/center/headM.png";
                            }
                            return KyeeI18nService.get("update_user.man", "男");
                        }
                    }
                }
            }
        };
        return def;
    })
    .build();

