new KyeeModule()
    .group("kyee.quyiyuan.dept.patient.relation.service")
    .type("service")
    .name("DeptPatientRelationService")
    .params(["HttpServiceBus", "KyeeMessageService","RsaUtilService","KyeeI18nService","CacheServiceBus"])
    .action(function (HttpServiceBus, KyeeMessageService,RsaUtilService,KyeeI18nService,CacheServiceBus) {
        var def = {
            DOCTOR_UUID:undefined,
            paymentAdditionalCard:false,    //是否显示就诊卡
            //短信验证
            sendCheckCode: function (PHONE_NUMBER,onSuccess) {
                HttpServiceBus.connect({
                    url: "/user/action/DataValidationActionC.jspx",
                    params: {
                        messageType: 2,
                        PHONE_NUMBER: RsaUtilService.getRsaResult(PHONE_NUMBER),
                        modId: 10001,
                        businessType:'1',
                        op: "sendRegCheckCodeActionC"
                    },
                    // 将短信验证码倒计时改为ionic自带的定时器   By  张家豪  KYEEAPPTEST-2890
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data);
                        }else{
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
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
            //手机号格式校验
            isMobil: function (s) {
                var patrn = /^(\+86)?1[3|5|4|7|8|9|6]\d{9}$/;
                if (!patrn.test(s)) {
                    return false;
                }
                return true;
            },
            //身份证校验算法
            idNoCheck: function (idNo) {
                idNo=idNo.trim();//清空字符串前后无用字符
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
            //失去焦点时，身份证转化为日期
            convertIdNo: function (idno) {
                if (idno != null && idno != undefined && idno != "") {
                    var ID_NO = idno;     //获取输入的身份证值
                    var birthday = this.createBirthday(ID_NO);
                    return birthday;
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
            //添加就诊者
            addCustomPatient: function (postdata, hospitalID,isNeedMessageCode, onSuccess) {
                var userType = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_TYPE;
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    params: {
                        postdata: postdata,
                        hospitalID: hospitalID,
                        USER_TYPE : userType ,
                        isNeedMessageCode: isNeedMessageCode,
                        op: "addCustomPatient"

                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();