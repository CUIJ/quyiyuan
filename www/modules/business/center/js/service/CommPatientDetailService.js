/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪
 * 创建日期:2015年5月4日10:18:09
 * 创建原因：就诊者信息服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.comm_patient_detail.service")//baobing
    .require(["kyee.framework.service.messager", "kyee.framework.file.upload"])//input
    .type("service")
    .name("CommPatientDetailService")
    .params([
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "HttpServiceBus",
        "KyeeUtilsService",
        "Md5UtilService",
        "KyeeUploadFileService",
        "CacheServiceBus",
        "AddPatientInfoService",
        "$ionicHistory",
        "RsaUtilService",
        "KyeeI18nService",
        "CenterUtilService"
    ])
    .action(function ($state,
                      KyeeMessageService,
                      KyeeViewService,
                      HttpServiceBus,
                      KyeeUtilsService,
                      Md5UtilService,
                      KyeeUploadFileService,
                      CacheServiceBus,
                      AddPatientInfoService,
                      $ionicHistory,
                      RsaUtilService,
                      KyeeI18nService,
                      CenterUtilService) {

        var def = {

            checkNum: "",//验证码问题   By  张家豪  KYEEAPPTEST-2840
            goOut: function () {
                $ionicHistory.goBack();
            },
            //实名认证的返回问题
            goCenter: function () {
                $state.go("center->MAIN_TAB");
            },
            //给实名认证参数
            HOSPITAL_SM: undefined,
            authenBoolean: undefined,
            authenFlag: undefined,
            msg: "",
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
                        businessType:'1',
                        op: "sendRegCheckCodeActionC"
                    },
                    // 将短信验证码倒计时改为ionic自带的定时器   By  张家豪  KYEEAPPTEST-2890
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data);
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
            iDisNull: function () {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("comm_patient_detail.nameAndIdNotNull", "姓名或身份证不能为空！")
                });
            },
            phoneIsNull: function () {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("add_patient_info.phoneNotNull", "手机号码不能为空！")
                });
            },
            idNoNull: function () {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("add_patient_info.idNoIsFalse", "身份证号不能为空！")
                });
            },
            //医保卡请求
            queryMedicalSecurityCardInfo: function (HOSPITAL_ID, USER_VS_ID, OFTEN_NAME, ID_NO, onSuccess) {
                HttpServiceBus.connect({
                    url: "/medicalSecurity/action/MedicalSecurityActionC.jspx",
                    params: {
                        HOSPITAL_ID: HOSPITAL_ID,
                        USER_VS_ID: USER_VS_ID,
                        OFTEN_NAME: OFTEN_NAME,
                        ID_NO: ID_NO,
                        op: "queryMedicalSecurityCardInfo"
                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            },
            //提交时候的判空，我只写了手机号，因为其他可能几乎没有，除非数据错误
            onClickTo: function () {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("add_patient_info.phoneNotNull", "手机号码不能为空！")
                });
            },
            //校验手机号（是否为空、格式是否错误、长度是否错误、是否被绑定)
            validatePhoneNum: function (phoneNum) {
                if (phoneNum != undefined) {
                    var phoneNum = phoneNum.trim();
                    //为空则提示并返回
                    if (!phoneNum) {
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("add_patient_info.phoneNotNull", "手机号码不能为空！")
                        });
                        return false;
                    } else if (!this.isMobil(phoneNum)) {
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("add_patient_info.phoneLangIsFalse", "手机号格式或长度错误！")
                        });
                        return false;
                    }
                    return true;
                } else {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("add_patient_info.phoneNotNull", "手机号码不能为空！")
                    });
                }
            },
            validateLoginNum: function (loginNum, ophone) { //验证码问题   By  张家豪  KYEEAPPTEST-2840
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
            //失去焦点时，身份证转化为日期，目前没有格式日期，先写死
            convertIdNo: function (idno) {
                if (idno != null && idno != undefined && idno != "") {
                    var ID_NO = idno;     //获取输入的身份证值
                    idNo = ID_NO.trim();//清空字符串前后无用字符
                    var birthday = this.createBirthday(ID_NO);
                    return birthday;
                }
            },
            //提交
            updateCustomPatient: function (postdata, hospitalID, address,onSuccess) {
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    params: {
                        postdata: postdata,
                        hospitalID: hospitalID,
                        expandInfo: address,
                        op: "updateCustomPatient"

                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data);
                        } else if(data.message) {
                            //异常接收与提示
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        } else{
                            //提示
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get('comm_patient_detail.updateOften','修改常用就诊者失败！')
                            });
                        }
                    }
                });
            },
            //为跳转查取就诊卡页面传值
            lastClassInfro: undefined,
            //查取就诊卡
            queryBindCardNo: function (userVsId,onSuccess) {
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    params: {
                        userVsId: userVsId,
                        op: "queryBindCardNo"
                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            },
            //判断是否显示请求
            queryHospitalParam: function (paramName, hospitalId, onSuccess) {
                //给医保卡参数
                HttpServiceBus.connect({
                    url: "/hospitalInform/action/HospitalinforActionC.jspx",
                    params: {
                        paramName: paramName,
                        hospitalId: hospitalId,
                        op: "queryHospitalParam"

                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            },
            CustomPatientSms: function (Sms) {
                KyeeMessageService.broadcast({
                    content: Sms
                });
                def.goOut();
            },

            submit: function ($scope) {
                var phoneNum = $scope.item.PHONE.trim();
                var loginNum = $scope.item.loginNum;
                var ophone = $scope.userInfo.isDisplayed;
                var xm = $scope.item.OFTEN_NAME.trim();
                var sf='';
                //$scope.saveIdNo是刚进来copy的虚拟身份证号
                if($scope.saveIdNo && $scope.item.ID_NO){
                    sf = $scope.item.ID_NO.trim();
                }else if($scope.saveIdNo && !$scope.item.ID_NO){
                    sf = $scope.saveIdNo.trim();
                }else{
                   sf = $scope.item.ID_NO.trim();
                }
                //校验姓名是否为空
                // 就诊者实名修改（APK）  By  张家豪  KYEEAPPC-4434
                if (!this.validateXingMing(xm)) {
                    return false;
                }
                if(sf && sf.substring(0, 4) != 'XNSF'){//如果用户没有修改身份证，虚拟身份证不需要校验
                    //校验身份证的格式
                    if (!CenterUtilService.idNoCheck(sf)) {
                        //弹框统一   By  张家豪  KYEEAPPTEST-3068
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("add_patient_info.idNoIsFalse", "身份证格式错误！")
                        });
                        return false;
                    }
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
            //由查取就诊卡界面跳转传值
            updateView: function () {
                this.scope.initialize();
            },
            //上传头像 朱学亮修改
            uploadImage: function (userVsId, image, isSelect) {
                //出圈
                KyeeMessageService.loading({
                    mask: true
                });
                var rootServerURL = AppConfig.SERVER_URL;
                var serverURL = rootServerURL + "center/action/CustomPatientAction.jspx?" + "loc=c&op=uploadPatientImage";
                var params = {};
                params.userVsId = userVsId;
                KyeeUploadFileService.uploadFile(
                    function (response) {
                        //收圈
                        KyeeMessageService.hideLoading();
                        // 上传成功，解析返回数据
                        var data = JSON.parse(response.response);
                        if (data.success == true) {
                            var one = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                            if (isSelect == 1) {
                                one.IMAGE_PATH = image;
                            }
                            if (def.authenBoolean && def.authenBoolean != "false") {
                                //begin 实名认证消息提示按钮的修改，可统一实名认证消息提示   By  张家豪  KYEEAPPTEST-2786
                                KyeeMessageService.confirm({
                                    title: KyeeI18nService.get("update_user.sms", "消息"),
                                    content: def.msg,
                                    onSelect: function (select) {
                                        if (select) {
                                            $scope.openModal('modules/business/center/views/authentication/authentication.html');
                                        }
                                    }
                                });
                                //end 实名认证消息提示按钮的修改，可统一实名认证消息提示   By  张家豪  KYEEAPPTEST-2786
                            } else {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("comm_patient_detail.changeUserSuccess", "修改常用就诊者信息成功！")
                                });
                                def.goOut();
                            }
                        } else {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("comm_patient_detail.loadHearFalse", "上传头像失败请重试！")
                            });
                        }
                    },
                    function (error) {
                        //收圈
                        KyeeMessageService.hideLoading();
                        // 上传失败
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("comm_patient_detail.loadHearFalse", "上传头像失败请重试！")
                        });
                    }, image, serverURL, "image/jpeg", params);
            },
            //编辑就诊者
            editPatient: function (patient) {
                    patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                    patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                    patient.loginNum = "";         //短信验证码制空
                    this.item = patient;
                    $state.go("comm_patient_detail");
                },
                //end 修改默认就诊者信息后与注册用户信息不同步的问题  By  张家豪  KYEEAPPC-3199
            uploadImageToWxServer : function(userVsId, image, isSelect){
                wx.uploadImage({
                    localId: '' + image,
                    isShowProgressTips: 1,
                    success: function(res) {
                        HttpServiceBus.connect({
                            url: 'center/action/CustomPatientAction.jspx',
                            params: {
                                userVsId:userVsId,
                                serverId:res.serverId,
                                op:'uploadPatientImageFromWx'
                            },
                            onSuccess: function (data) {
                                if (data.success) {
                                  // 上传成功，解析返回数据
                                    if (data.success == true) {
                                        var one = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                                        if (isSelect == 1) {
                                            one.IMAGE_PATH = image;
                                        }
                                        if (def.authenBoolean && def.authenBoolean != "false") {
                                            //begin 实名认证消息提示按钮的修改，可统一实名认证消息提示   By  张家豪  KYEEAPPTEST-2786
                                            KyeeMessageService.confirm({
                                                title: KyeeI18nService.get("update_user.sms", "消息"),
                                                content: def.msg,
                                                onSelect: function (select) {
                                                    if (select) {
                                                        $scope.openModal('modules/business/center/views/authentication/authentication.html');
                                                    }
                                                }
                                            });
                                            //end 实名认证消息提示按钮的修改，可统一实名认证消息提示   By  张家豪  KYEEAPPTEST-2786
                                        } else {
                                            KyeeMessageService.broadcast({
                                                content: KyeeI18nService.get("comm_patient_detail.changeUserSuccess", "修改常用就诊者信息成功！")
                                            });
                                            def.goOut();
                                        }
                                }
                                else
                                {
                                    KyeeMessageService.broadcast({
                                        content: data.message
                                    });
                                }
                            }else{
                                    KyeeMessageService.broadcast({
                                        content: data.message
                                    });
                                }
                        }})},
                    fail : function(res){
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get('comm_patient_detail.uploadPhotoFail','上传照片信息失败，请稍后重试.')
                        });
                    }
                });
            }
        };
        return def;
    })
    .build();
