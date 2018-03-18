/**
 * 产品名称 quyiyuan.
 * 创建用户: 淳思博
 * 日期: 2015/6/8.
 * 创建原因：
 * 修改： By
 * 修改： By
 */

new KyeeModule()
    .group("kyee.quyiyuan.boZhouLogin.service")
    .require(["kyee.quyiyuan.login.service",
        "kyee.quyiyuan.hospital.hospital_selector.service"])
    .type("service")
    .name("BoZhouLoginService")
    .params(["$state", "HttpServiceBus","KyeeMessageService", "RsaUtilService", "CacheServiceBus","LoginService"
        ,"HospitalSelectorService", "HospitalFilterDef", "MultipleQueryCityService","HospitalService"])
    .action(function($state, HttpServiceBus,KyeeMessageService, RsaUtilService, CacheServiceBus, LoginService
        ,HospitalSelectorService, HospitalFilterDef, MultipleQueryCityService,HospitalService) {
        var def = {
            //我家亳州网页版参数
            phoneNumber:"",
            idCard:"",
            name :"",
            objectid :"",

            //传参：{用户名，用户ID，邮箱，平台认证名，平台认证密码, 医院ID, 用户来源, 姓名, 性别, 身份证号, 手机号}
        //thirdPartyParams = new String[]{"13700001111","523","asd@163.com","WoJiaBoZhou341600","WJBZ13824341600","1501","3","张嘉译","男","52262619800410121X","13700001111"};

            loginOrRegisit : function(user,userId,email,pubUSer,pubPwd,hospitalId,userSource,name,sex,UID,phoneNo){
                var me = this;
                var storage = CacheServiceBus.getStorageCache();
                storage.set(CACHE_CONSTANTS.STORAGE_CACHE.CURRENT_USER_SOURCE, userSource);
                var pwdRas = RsaUtilService.getRsaResult(pubPwd);   //rsa加密 密码
                var thirdUserInfo = {
                    USER_CODE : user,
                    EMAIL : email,
                    SEX : sex,
                    USER_SOURCE : userSource,
                    CO_USERCODE : userId,
                    HOSPITAL_ID : hospitalId,
                    NAME : name,
                    ID_NO : UID,
                    PHONE_NUMBER : phoneNo,
                    P_USER_CODE:pubUSer,//吴伟刚 KYEEAPPC-2840 APP接入安全认证前台整改
                    P_PASSWORD:pwdRas
                };

                me.loginAuthForBoZhou(pubUSer, pubPwd, thirdUserInfo);
            },

            loginAuthForBoZhou : function (pubUSer, pubPwd, thirdUserInfo){
                var me = this;
                thirdUserInfo.TOKEN = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK);
                var params = {
                    postdata : thirdUserInfo,
                    op : 'loginPersonalization'
                };
                HttpServiceBus.connect({
                    url : "/user/action/LoginAction.jspx",
                    showLoading : false,
                    params : params,
                    onSuccess : function (resp) {
                        if(!resp){
                            return;
                        }else if(resp.success){
                            var retUserInfo = resp.data;
                            if (retUserInfo) {
                                var storage = CacheServiceBus.getStorageCache();
                                var cache = CacheServiceBus.getMemoryCache();

                                //为避免影响其他模块，登录成功后处理，统一调用LoginService
                                var userInfo = {
                                    user : pubUSer,
                                    pwd : pubPwd,
                                    rememberPwd : false,
                                    autoLogin : false
                                };
                                //判断是否需要记住密码与自动登录,并将信息写入localStorage
                                LoginService.saveUserInfo(userInfo, storage);
                                //刷新页面footer的第四个，个人中心登录名
                                LoginService.login(pubUSer, retUserInfo);
                                //将respons的用户信息写入缓存
                                LoginService.saveUserInfoToCache(retUserInfo, pubUSer, pubPwd);
                                //百度推送
                                LoginService.savaPushUserId(retUserInfo, storage, cache);
                                //在登录后，传递userId参数判断是否属于白名单用户，调用白名单apk升级接口。zm
                                LoginService.checkUserIsWhite(retUserInfo.USER_ID);
                                //查询医院信息并选择医院，及就诊者
                                me.queryUserHospitalBoZhou();

                            }

                        }else{
                            var message=resp.message;
                            KyeeMessageService.message({
                                title: "提示",
                                content: message,
                                okText: "知道了",
                                onOk: function () {
                                    if (navigator.app) {
                                        navigator.app.exitApp();//直接退出趣医院
                                    }
                                }
                            });
                        }
                    },
                    onError: function (retVal) {
                        KyeeMessageService.message({
                            title: "提示",
                            content: "加载失败，请稍后再试！(点击知道了将会退回上一页面)",
                            okText: "知道了",
                            onOk: function () {
                                if (navigator.app) {
                                    navigator.app.exitApp();//直接退出趣医院
                                }
                            }
                        });
                    }
                });
            },

            queryUserHospitalBoZhou : function(){
                var me = this;
                var cache = CacheServiceBus.getMemoryCache();
                var storage = CacheServiceBus.getStorageCache();
                var currentUserRecord = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var userHospitalInfo = storage.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if (currentUserRecord.HOSPITAL_ID == undefined || currentUserRecord.HOSPITAL_ID == '0'
                    || (userHospitalInfo && currentUserRecord.HOSPITAL_ID == userHospitalInfo.id)){
                    //查询登陆账户下选择的就诊者
                    LoginService.getSelectCustomInfo(currentUserRecord, cache, storage);
                    return;
                }
                HttpServiceBus.connect({
                    url : '/area/action/AreaHospitalActionImplC.jspx',
                    showLoading : false,
                    params : {
                        op:'queryHospitalName',
                        USER_TYPE: currentUserRecord.USER_TYPE,
                        individual_Hospital: currentUserRecord.HOSPITAL_ID,
                        operateUserSource : 3
                    },
                    onSuccess : function(retVal){
                        var success = retVal.success;
                        var records = retVal.data;
                        if (success && records.rows.length > 0) {
                            var data = records.rows[0];
                            HospitalSelectorService.selectHospital(data.HOSPITAL_ID, data.HOSPITAL_NAME
                                ,data.MAILING_ADDRESS, data.PROVINCE_CODE, data.PROVINCE_NAME, data.CITY_CODE
                                ,data.CITY_NAME, '', function(){
                                    //更新九宫格页面
                                    HospitalService.updateUI();

                                });
                        }else{
                            //查询登陆账户下选择的就诊者
                            LoginService.getSelectCustomInfo(currentUserRecord, cache, storage);

                        }
                    }
                });
            },

            //亳州网页版
            receiveBoZhouParams:function(urlInfo){
                //我家亳州url传递的参数
                this.phoneNumber = urlInfo.phoneNumber;
                this.idCard  = urlInfo.idCard ;
                this.name = urlInfo.name;
                this.objectid = urlInfo.objectid;

                //给亳州单独用这边直接默认安徽亳州
                if((this.name == null || this.name == "") && (this.phoneNumber != null && this.phoneNumber != "")){
                    //返回我家亳州完善信息
                    javascript:myObject.completeKBGH('请完善姓名和身份证号');
                }else if((this.name != null && this.name != "") && (this.phoneNumber != null && this.phoneNumber != "")){
                    //联合登录
                    this.loginForBoZhouWeb(this.phoneNumber,this.idCard,this.name,this.objectid);
                }
            },

            loginForBoZhouWeb : function(phoneNo,idCard,name,userId){
                var me = this;
                var pubUSer="WoJiaBoZhou341600";
                var pubPwd=RsaUtilService.getRsaResult("WJBZ13824341600");
                var thirdUserInfo = {
                    USER_CODE : phoneNo,
                    USER_SOURCE : "3",
                    CO_USERCODE : userId,
                    NAME : name,
                    ID_NO : idCard,
                    PHONE_NUMBER : phoneNo,
                    HOSPITAL_ID:"5580002",
                    P_USER_CODE:pubUSer,
                    P_PASSWORD:pubPwd,
                    TOKEN:CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK)
                };
                var params = {
                    postdata : thirdUserInfo,
                    op : 'loginPersonalization'
                };
                HttpServiceBus.connect({
                    url : "/user/action/LoginAction.jspx",
                    showLoading : false,
                    params : params,
                    onSuccess : function (resp) {
                        if(!resp){
                            return;
                        }else if(resp.success){
                            var retUserInfo = resp.data;
                            if (retUserInfo) {
                                var storage = CacheServiceBus.getStorageCache();
                                var cache = CacheServiceBus.getMemoryCache();

                                //为避免影响其他模块，登录成功后处理，统一调用LoginService
                                var userInfo = {
                                    user : phoneNo,
                                    pwd : "",
                                    rememberPwd : false,
                                    autoLogin : false
                                };
                                //判断是否需要记住密码与自动登录,并将信息写入localStorage
                                LoginService.saveUserInfo(userInfo, storage);
                                //刷新页面footer的第四个，个人中心登录名
                                LoginService.login(phoneNo, retUserInfo);
                                //将respons的用户信息写入缓存
                                LoginService.saveUserInfoToCache(retUserInfo, phoneNo, "");
                                //百度推送
                                LoginService.savaPushUserId(retUserInfo, storage, cache);
                                //在登录后，传递userId参数判断是否属于白名单用户，调用白名单apk升级接口。zm
                                LoginService.checkUserIsWhite(retUserInfo.USER_ID);
                                //查询登陆账户下选择的就诊者
                                LoginService.getSelectCustomInfo(retUserInfo, cache, storage);
                                //查询医院信息并选择医院，及就诊者
                                //me.queryHospitalForBoZhou(retUserInfo);

                            }
                        }
                    }
                });
            },

            queryHospitalForBoZhou : function(retUserInfo){
                HttpServiceBus.connect({
                    url : '/area/action/AreaHospitalActionImplC.jspx',
                    showLoading : false,
                    params : {
                        op:'queryHospitalName',
                        USER_TYPE: retUserInfo.USER_TYPE,
                        individual_Hospital: "5580002"
                    },
                    onSuccess : function(retVal){
                        var success = retVal.success;
                        var records = retVal.data;
                        if (success && records.rows.length > 0) {
                            var data = records.rows[0];
                            HospitalSelectorService.selectHospital(data.HOSPITAL_ID, data.HOSPITAL_NAME
                                ,data.MAILING_ADDRESS, data.PROVINCE_CODE, data.PROVINCE_NAME, data.CITY_CODE
                                ,data.CITY_NAME, '', function(){
                                    //更新九宫格页面
                                    HospitalService.updateUI();
                                });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();
