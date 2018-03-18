/**
 * 产品名称：quyiyuan
 * 创建者：付添
 * 创建时间： 2015年12月8日16:28:15
 * 创建原因：更换手机号
 * 任务号：	KYEEAPPC-4400
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.changephone.service")
    .require([
        "kyee.quyiyuan.login.regist.service",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.center_util.service"
    ])
    .type("service")
    .name("ChangePhoneService")
    .params([
        "$state", "RegistService", "LoginService",   "HttpServiceBus", "KyeeMessageService", "CacheServiceBus",  "RsaUtilService","KyeeI18nService", "CenterUtilService"
    ])
    .action(function ($state, RegistService, LoginService, HttpServiceBus, KyeeMessageService, CacheServiceBus, RsaUtilService,KyeeI18nService,CenterUtilService) {
        var def = {
            /**
             * 发送验证码之前校验手机号
             * @param user
             */
            getCodeByPhone: function (user) {
                //校验手机号
                if(CenterUtilService.validateMobil(user.phone)==false){
                    return ;
                 }
                def.getMsgData(user);
            },
            /**
             * 发送短信获取验证码请求
             * @param user
             */
            getMsgData: function (user) {
                //+86开头手机号去掉前三位
                var phone = user.phone;
                if(phone==14){
                    phone=phone.substring(3)
                }
                var hospitalId = "";
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalInfo=  storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if(hospitalInfo){
                    hospitalId= hospitalInfo.id;
                }

                HttpServiceBus.connect({
                    url: '/user/action/DataValidationActionC.jspx',
                    params: {
                        op: 'sendRegCheckCodeActionC',
                        hospitalId: hospitalId,
                        PHONE_NUMBER: RsaUtilService.getRsaResult(phone),
                        modId: '10001',
                        messageType: '2',
                        businessType:'0'
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var message = retVal.message;
                        if (success) {
                            user.phoneNumDisabled = true;
                            user.validateBtnDisabled = true;
                            def.onRefreshDataviewDelay(retVal);
                        } else {
                            KyeeMessageService.broadcast({
                                content: message
                            });
                        }
                    }
                });
            },
            /**
             * 取消倒计时任务
             */
            clearTask: function () {
                if (def.task) {
                    clearInterval(def.task);
                }
            },
            /**
             *  进入倒计时
             */
            onRefreshDataviewDelay: function (retVal) {
                if(retVal){
                    if('007'==retVal.data.SECURITY_CODE){
                        def.second=retVal.data.secondsRange;
                    }
                    else{
                        def.second = 120;
                    }
                }

                var validateMsgBtn = document.getElementById("change_phone.validateMsgBtn");
                var phoneNumInput = document.getElementById("change_phone.phoneNumInput");
                def.task = window.setInterval(def.setBtnState, 1000, validateMsgBtn, phoneNumInput);
            },
            /**
             * 修改页面元素倒计时
             * @param validateMsgBtn
             * @param phoneNumInput
             */
            setBtnState: function (validateMsgBtn, phoneNumInput) {
                try {
                    if (def.second != -1) {
                        //直接操作$scope中的模型效率低下并且页面无法更新,因此直接操作dom
                        validateMsgBtn.innerText =
                            KyeeI18nService.get("change_phone.Surplus","剩余 ")+
                                def.second +
                                KyeeI18nService.get("change_phone.seconds","秒") ;
                        def.second--;
                        //验证旧密码成功
                    } else {
                        //直接操作$scope中的模型使页面无法更新,因此直接操作dom
                        validateMsgBtn.removeAttribute("disabled");
                        phoneNumInput.removeAttribute("disabled");
                        validateMsgBtn.innerText =  KyeeI18nService.get("change_phone.getCode","获取验证码");
                        clearInterval(def.task);
                    }
                } catch (e) {
                    clearInterval(def.task);
                }
            },
            /**
             * 请求更改手机号
             * @param phone
             * @param checkCode
             * @param Callback
             */
           requestChangePhone:function(phone,checkCode,Callback){
               if(!CenterUtilService.isDataBlankAndHint(phone, KyeeI18nService.get("regist.emptyPhone","手机号不能为空！"))){
                        return ;
               }
                if (!CenterUtilService.validateCheckCode(checkCode) ){
                    return false;
                }
               //从缓存中取USER_ID
               var cache = CacheServiceBus.getMemoryCache();
               var currentUserRecord = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
               var userId=currentUserRecord.USER_ID;
                if (phone.length == 14) {
                       phone = phone.substring(3);
                }
                HttpServiceBus.connect({
                       url :"user/action/LoginAction.jspx" ,
                       params : {
                           loc : "c",
                           op : "updateUserAccountPhone",//不一样
                           PHONE_NUMBER:phone,
                           SECURITY_CODE:checkCode,
                           USER_ID:userId,
                           OLD_PHONE:false
                       },
                       onSuccess : function (resp) {
                           KyeeMessageService.broadcast({
                               content:resp.message
                           });
                           if (resp.success) {
                               var storageCache = CacheServiceBus.getStorageCache();
                               storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD,"");
                               storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, phone);
                               Callback(resp);
                               //取消倒计时恢复状态
                               def.second=-1;
                               var validateMsgBtn = document.getElementById("change_phone.validateMsgBtn");
                               validateMsgBtn.innerText =  KyeeI18nService.get("change_phone.getCode","获取验证码");
                               clearInterval(def.task);
                           }
                       }
                   });
           }
        };
        return def;
    })
    .build();
