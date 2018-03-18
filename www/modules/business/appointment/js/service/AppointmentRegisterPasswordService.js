/**
 * 产品名称：quyiyuan.
 * 创建用户：高玉楼
 * 日期：2015年8月31日14:45:02
 * 创建原因：预约挂号确认注册服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.register.password.service")
    .type("service")
    .name("AppointmentRegisterPasswordService")
    .params(["HttpServiceBus", "KyeeMessageService","CacheServiceBus","LoginService","RegistService"])
    .action(function (HttpServiceBus, KyeeMessageService,CacheServiceBus,LoginService,RegistService) {
        var def = {
            //提示
            remind : function(content){
                KyeeMessageService.broadcast({
                    content : content
                });
            },
            validateTwoPassword:function(password,repassword){
                if(def.validatePassword(password))
                {
                    if(password===repassword)
                    {
                        return true;
                    }
                    else
                    {
                        def.remind("两次输入密码不一致");
                        return false;
                    }
                }
                else
                {
                    return false;
                }
            },
            validatePassword :function(password){
                if(!password){
                    this.remind("密码必须输入！");
                    return false;
                }
                var passwordLen = password.length;
                if(passwordLen < 6 || passwordLen >16){
                    this.remind("密码必须大于5位，小于17位！");
                    return false;
                }
                var patrn = /^[!@#$*_A-Za-z0-9]+$/;
                if (!patrn.test(password)) {
                    this.remind("密码必须字母、数字或者特殊字符(!@#$*_ )！");
                    return false;
                }
                return true;
            },
            register:function(param,password,onSuccess){
                HttpServiceBus.connect({
                    url : '/user/action/LoginAction.jspx',
                    params : {
                        op: 'quickRigsterForAppoint',
                        HOSPITAL_ID:CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id,
                        isChildReg: param.isChildReg,
                        BIRTH_DATE : param.BIRTH_DATE,
                        sex : param.sex,
                        postdata:param
                    },
                    onSuccess : function(retVal){
                        var success = retVal.success;
                        if(success){
                            var memoryCache = CacheServiceBus.getMemoryCache();
                            var storageCache = CacheServiceBus.getStorageCache();
                            //将就诊者存放在缓存中
                            memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT,retVal.data.PATIENT_MODEL);
                            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, param.PHONE_NUMBER);
                            //修改缓存中记住密码存储明文问题 KYEEAPPC-3781 zhangjiahao
                            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, LoginService.encrypt(password));
                            //调用登录接口
                            var userInfo = {
                                user : param.PHONE_NUMBER,
                                pwd : password
                            };
                            //友盟渠道信息获取
                            RegistService.getUMengInfo({user_code:retVal.data.USER_MODEL.USER_CODE});
                            LoginService.doLogin(userInfo, onSuccess);
                        }else{
                            KyeeMessageService.broadcast({
                                content : retVal.message
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
