/**
 * 产品名称：quyiyuan
 * 创建者：付添
 * 创建时间： 2015年12月8日16:28:15
 * 创建原因：账户认证
 * 任务号：KYEEAPPC-4398
 * 修改人：付添
 * 任务号：KYEEAPPC-4506
 */
new KyeeModule()
    .group("kyee.quyiyuan.account_authentication.service")
    .require([
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.updateuser.service",
        "kyee.quyiyuan.center_util.service"
    ])
    .type("service")
    .name("AccountAuthenticationService")
    .params([
        "$state",
        "KyeeMessageService",
        "HttpServiceBus",
        "KyeeI18nService",
        "CacheServiceBus",
        "UpdateUserService",
        "CenterUtilService"
    ])
    .action(function($state, KyeeMessageService,
                     HttpServiceBus,KyeeI18nService,CacheServiceBus,UpdateUserService,CenterUtilService){
        var def = {
            scope: {},
            isAuthSuccess:"0", //是否实名认证成功
            ifFromRegist:"0", //是否注册页面过来
            smRegHospitalId : "0",
            smRegFlag : 0,
            smRegName : "",
            /**
             * 由查取就诊卡界面跳转传值
             */
            updateView: function () {
                this.scope.enterFun();
            },
            /**
             * 账户信息请求
             * @param userId
             * @param onSuccess
             */
            queryUserInfo: function (userId, onSuccess) {
                HttpServiceBus.connect({
                    url: "/user/action/LoginAction.jspx",
                    params: {
                        userId: userId,
                        op: "queryUserInfo"
                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            var name = data.data.NAME;
                            var idNo= data.data.ID_NO;
                            if(name&&idNo){
                                var cache = CacheServiceBus.getMemoryCache();
                                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, data.data);
                            }
                            onSuccess(data);
                        }
                    }
                });
            },

            /**
             * 根据user_id查询用户实名认证状态
             * @param phoneNum
             * @param name
             * @param idNo
             * @param backSuccess
             */
            goAuthUser : function(phoneNum, name,idNo, backSuccess){

                if(!CenterUtilService.isDataBlankAndHint(name, KyeeI18nService.get("account_authentication.nameNotImpty","姓名不能为空！"))
                    ||!CenterUtilService.validateIdNo(idNo)){
                    return;
                }
                HttpServiceBus.connect({
                    url : '/user/action/LoginAction.jspx',
                    showLoading : false,
                    params : {
                        op : 'updateUserAccountInfo',
                        PHONE_NUMBER : phoneNum,
                        NAME : name,
                        ID_NO : idNo
                    },
                    onSuccess : function(retVal) {
                        if(retVal){
                            var success = retVal.success;
                            var message = retVal.message;
                            var data= retVal.data;
                            KyeeMessageService.broadcast({
                                content: message
                            });
                            if (success && data) {
                                var cache = CacheServiceBus.getMemoryCache();
                                if(cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD)){
                                    cache.apply(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, "ID_NO", idNo);
                                    cache.apply(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, "NAME", name);
                                }
                                //保存当前就诊者信息
                                def.saveSelectedPatient(retVal.data)
                                backSuccess(retVal);
                            }
                        }
                    }
                });
            },
            /**
             * 保存选中就诊者数据
             * @param data
             */
            saveSelectedPatient:function(data){
                if(data && data.length > 0) {
                    var cache = CacheServiceBus.getMemoryCache();
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, data[0]);
                }
            }
        };
        return def;
    })
    .build();

