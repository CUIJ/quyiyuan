/**
 * 产品名称：quyiyuan
 * 创建者：  付添
 * 创建时间： 2015年12月8日16:28:15
 * 创建原因：个人中心公共方法
 * 任务号：KYEEAPPC-4398
 */
new KyeeModule()
    .group("kyee.quyiyuan.center_util.service")
    .require([
        "kyee.framework.service.message"])
    .type("service")
    .name("CenterUtilService")
    .params([
        "$state", "KyeeMessageService", "HttpServiceBus", "KyeeI18nService"])
    .action(function ($state, KyeeMessageService, HttpServiceBus, KyeeI18nService) {
        var def = {
            /**
             * 公共判空
             * @param data
             * @returns {boolean}
             */
            isDataBlank: function (data) {
                return ( data == undefined || null == data || data == false || "" == data || "NULL" == data || "null" == data);
            },
            /**
             *  字段判空并给出提示
             * @param data
             * @param message
             * @returns {boolean}
             */
            isDataBlankAndHint: function (data, message) {
                if (data == undefined || null == data || data == false || "" == data || "NULL" == data || "null" == data) {
                    this.messagePrompt(message);
                    return false;
                } else {
                    return true;
                }
            },
            /**
             * 校验手机号
             * @param s
             * @returns {boolean}
             */
            validateMobil: function (phone) {
                var patrn = /^(\+86)?1[3|5|4|7|8|9|6]\d{9}$/;
                if (this.isDataBlank(phone)) {
                    this.messagePrompt(KyeeI18nService.get("add_patient_info.phoneNotNull", "手机号不能为空！"));
                    return false;
                }
                if (!patrn.test(this.trim(phone))) {
                    this.messagePrompt(KyeeI18nService.get("add_patient_info.phoneLangIsFalse", "手机号格式或长度错误！"));
                    return false;
                }
                return true;
            },
            /**
             * 校验身份证号
             * @param idNo
             * @returns {boolean}
             */
            validateIdNo: function (idNo) {
                //为空提示
                if (this.isDataBlank(idNo)) {
                    this.messagePrompt(KyeeI18nService.get("account_authentication.idNoNotImpty", "身份证不能为空！"));
                    return false;
                }
                if (this.idNoCheck(this.trim(idNo)) == false) {
                    this.messagePrompt(KyeeI18nService.get("account_authentication.idNoError", "请输入正确的身份证格式！"));
                    return false;
                }
                return true;
            },
            /**
             * 校验验证码
             * @param checkCode
             * @returns {boolean}
             */
            validateCheckCode: function (checkCode) {
                if (checkCode == undefined || null == checkCode || "" == checkCode || "NULL" == checkCode || "null" == checkCode) {
                    this.messagePrompt(KyeeI18nService.get("regist.emptyCode", "验证码不能为空！"));
                    return false;
                }
                var patrn = /^[0-9]+$/;
                if (checkCode.length > 1 && !patrn.test(this.trim(checkCode))) {
                    this.messagePrompt(KyeeI18nService.get("regist.CheckFormartAgain", " 请输入正确验证码"));
                    return false;
                } else {
                    return true;
                }
            },
            /**
             * 校验密码
             * @param password
             * @returns {boolean}
             */
            validatePassWord: function (password) {
                //为空提示
                if (this.isDataBlank(password)) {
                    this.messagePrompt(KyeeI18nService.get("login.emptyUserPass", "密码不能为空！"));
                    return false;
                }
                if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.exec(password)) {
                    this.messagePrompt(KyeeI18nService.get("login.passContainHan", "密码不能包含汉字！"));
                    return false;
                }
                var patrn = /^[!@#$*_A-Za-z0-9]+$/;
                if (!patrn.test(this.trim(password))) {
                    this.messagePrompt(KyeeI18nService.get("regist.PassFormartAgain", " 密码必须字母、数字或者特殊字符(!@#$*_ )！"));
                    return false;
                } else {
                    if (password.length > 16) {
                        this.messagePrompt(KyeeI18nService.get("change_pwd.newLess17", "密码必须小于17位！"));
                        return false;
                    }
                    if (password.length < 6) {
                        this.messagePrompt(KyeeI18nService.get("change_pwd.newMore5", "密码必须大于5位！"));
                        return false;
                    }
                    return true;
                }
                return true;
            },
            /**
             * 根据身份证计算性别  1 男 2女
             * @param idNo
             * @returns {*}
             */
            getSexByIdNo: function (idNo) {
                if (this.isDataBlank(idNo)) {
                    return false;
                }
                // 输入身份证号含字母的自动转换为大写字母   By  张家豪  KYEEAPPC-2749
                idNo = this.trim(idNo).toUpperCase();
                var sex = idNo.substring(16, 17);
                if (!isNaN(sex) && Id.length > 16) {
                    if (sex % 2 == 0) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            },
            /**
             * 根据身份证计算年龄
             * @param idNo
             * @returns {*}
             */
            getAgeByIdNo: function (idNo) {
                if (this.isDataBlank(idNo)) {
                    return false;
                }
                var year = new Date().getFullYear();
                var birthday = this.trim(idNo);
                if (birthday && birthday.length > 4) {
                    birthday = birthday.substring(6, 10);
                } else {
                    birthday = year;
                }
                if (year - birthday >= 0) {
                    var age = year - birthday;
                    return age;
                } else {                                    //无年龄数据
                    return false;
                }
            },
            /**
             * 密码加密
             * @param pwd
             * @returns {*}
             */
            encrypt: function (pwd) {
                if (!pwd || pwd.length <= 0) {
                    return "";
                }
                var monyer = new Array();
                var i;
                for (i = 0; i < pwd.length; i++) {
                    monyer += "\\" + pwd.charCodeAt(i).toString(8);
                }
                return monyer;
            },
            /**
             * 密码解密
             * @param pwd
             * @returns {*}
             */
            decrypt: function (pwd) {
                if (!pwd || pwd.length <= 0) {
                    return "";
                }
                var monyer = new Array();
                var i;
                var s = pwd.split("\\");
                for (i = 1; i < s.length; i++) {
                    monyer += String.fromCharCode(parseInt(s[i], 8));
                }
                return monyer;
            },
            /**
             * 身份证校验
             * @param idNo
             * @returns {*}
             */
            idNoCheck: function (idNo) {
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
            /**
             * 身份证最后一位校验
             * @param idNo
             * @returns {boolean}
             */
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
            /**
             * 删除左右端空格
             * @param str
             * @returns {*}
             */
            trim: function (str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
            },
            /**
             * 消息黑框提示
             * @param message
             */
            messagePrompt: function (message) {
                KyeeMessageService.broadcast({
                    content: message
                });
            },
            /**
             * 校验导医编号
             * @param s
             * @returns {boolean}
             */
            validateGuideNum: function (guideNum) {
                var patrn = /^[1-9]\d{4}$/;
                if (!this.isDataBlank(guideNum)&&!patrn.test(this.trim(guideNum))) {
                    return false;
                }
                return true;
            },
            /**
             * 根据生日计算年龄
             * @param dateOfBirth
             * @returns {*}
             */
            ageBydateOfBirth:function(dateOfBirth){
                if(dateOfBirth){
                    var date=new Date();
                    var year = date.getFullYear();
                    var month = date.getMonth()+1;
                    var day= date.getDate();
                    var birthMonth = 0;
                    var birthYear = 0;
                    var birthDay = 0;
                    if (dateOfBirth && dateOfBirth.length > 9) {
                        birthDay =  dateOfBirth.substring(8,10);
                        birthMonth = dateOfBirth.substring(5, 7);
                        birthYear = dateOfBirth.substring(0, 4);

                    } else {
                        birthYear = year;
                    }
                    var count = year - birthYear;
                    if(count>0){
                        if (month <= birthMonth) {
                            if (month == birthMonth) {
                                if (day < birthDay) {
                                    count=count-1;
                                }
                            } else {
                                count=count-1;
                            }
                        }
                    }
                    if (count > 0) {    //不是儿童
                        return count +"岁";
                    } else if(count == 0){
                        if(year - birthYear>0){
                            return 12-(birthMonth-month)+"个月";
                        }else{
                            if(month - birthMonth > 0){
                                return month - birthMonth +"个月";
                            }else{
                                return 1 +"个月";
                            }
                        }
                    }else{                                    //无年龄数据
                        return "";
                    }
                }else{
                    return "";
                }

            }
        };
        return def;

    })
    .build();

