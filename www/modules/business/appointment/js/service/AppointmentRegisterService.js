/**
 * 产品名称：quyiyuan.
 * 创建用户：高玉楼
 * 日期：2015年8月31日14:45:02
 * 创建原因：预约挂号确认注册服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.register.service")
    .type("service")
    .name("AppointmentRegisterService")
    .params(["HttpServiceBus", "KyeeMessageService","CacheServiceBus"])
    .action(function (HttpServiceBus, KyeeMessageService,CacheServiceBus) {
        var def = {
            registerInfo:{
                //手机号
                phoneNum : "",
                //身份证号码
                idCardNum : "",
                //用名
                userName:"",
                //校验码
                validateCode:"",
                //医导编号
                guideNum:"",
                //备注
                remark:""
            },
            //提示
            remind : function(title, content){
                KyeeMessageService.broadcast({
                    content : content
                });
            },
            //效验是否同意协议
            validateAgreeContract : function(isAgree){
                if(!isAgree)
                {
                    def.remind("消息", "您需要同意我们的协议！");
                    return false;
                }
                else
                {
                    return true;
                }
            },
            //校验手机号（是否为空、格式是否错误、长度是否错误、是否被绑定)
            validatePhoneNum: function (phoneNum) { //验证码问题   By  张家豪  KYEEAPPTEST-2840
                var phoneNum = phoneNum.trim();
                //为空则提示并返回
                if (!phoneNum) {
                    KyeeMessageService.broadcast({
                        content: "联系电话不能为空！"
                    });
                    return false;
                } else if (!this.isMobil(phoneNum)) {
                    KyeeMessageService.broadcast({
                        content: "联系电话格式或长度错误！"
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
            validateLoginNum: function (loginNum) {
                if (!loginNum) {
                    KyeeMessageService.broadcast({
                        content: "验证码不能为空！"
                    });
                    return false;
                }
                return true;
            },
            validateName:function(name){
                if (!name) {
                    KyeeMessageService.broadcast({
                        content: "就诊人不能为空！"
                    });
                    return false;
                }
                return true;
            },
            /**
             * 判断手机号码是否已经注册
             * @param phoneNum
             * @param onSuccess
             * @param onFailure
             */
            getPhoneNumExisted : function(phoneNum,onSuccess,onFailure){
                HttpServiceBus.connect({
                    url : '/user/action/LoginAction.jspx',
                    params : {
                        op: 'PhoneNumExist',
                        PHONE_NUMBER: phoneNum,
                        userSource: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE)
                    },
                    onSuccess : function(retVal){
                        var success = retVal.success;
                        var status = retVal.data;
                        if(success){
                            //手机号不存在
                            if (status==0){
                                onSuccess();
                            }
                        }else{
                            try{
                                if (status==1)
                                {
                                    onFailure();
                                }
                                else{
                                    KyeeMessageService.broadcast({
                                        content : retVal.message
                                    });
                                }
                            }catch(e){
                                def.remind("消息", "网络异常！");
                            }
                        }
                    },
                    onError : function(retVal){
                    }
                });
            },
            /**
             * 判断验证码是否正确
             * @param phoneNum
             * @param onSuccess
             * @param onFailure
             */
            checkValidateCodeExisted : function(phoneNum,validateCode,onSuccess){
                HttpServiceBus.connect({
                    url : '/user/action/DataValidationActionC.jspx',
                    params : {
                        op: 'checkMsgCodeActionC',
                        PHONE_NUMBER: phoneNum,
                        securityCode:validateCode
                    },
                    onSuccess : function(data){
                        var success = data.success;
                        if(success){
                            onSuccess();
                        }else{
                            KyeeMessageService.broadcast({
                                content : data.message
                            });
                        }
                    },
                    onError : function(retVal){
                    }
                });
            },
            getHosChildRegLimit : function(hospitalId,DEPT_CODE,onSuccess){
                HttpServiceBus.connect({
                    url : '/appoint/action/AppointActionC.jspx',
                    params : {
                        op: 'getHosChildRegLimitActionC',
                        hospitalId: hospitalId,
                        DEPT_CODE:DEPT_CODE
                    },
                    onSuccess : function(data){
                        var success = data.success;
                        if(success){
                            onSuccess(data.data);
                        }else{
                            KyeeMessageService.broadcast({
                                content : data.message
                            });
                        }
                    },
                    onError : function(retVal){
                    }
                });
            }
        };
        return def;
    })
    .build();
