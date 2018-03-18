/**
 * Created by shing on 2015/7/17.
 */
new KyeeModule()
    .group("kyee.quyiyuan.jiankangwpt.service")
    .require([
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.hospital.hospital_selector.service"])
    .type("service")
    .name("JianKangChongZhouService")
    .params(["$state", "HttpServiceBus","KyeeMessageService", "RsaUtilService", "CacheServiceBus","LoginService"
              ,"HospitalSelectorService", "HospitalFilterDef", "MultipleQueryCityService","HospitalService"])
    .action(function($state, HttpServiceBus,KyeeMessageService, RsaUtilService, CacheServiceBus, LoginService
                      ,HospitalSelectorService, HospitalFilterDef, MultipleQueryCityService,HospitalService) {
        var def = {

            //传参：{平台认证名，平台认证密码，用户来源，医院ID，用户姓名, 用户身份证号, 用户电话号码, 用户性别}
            //thirdPartyParams = new String[]{"JianKangWeiPingTai510184","JKWPT11274510184","9","1501","张嘉译","52262619800410121X","13700001111","男"};

            loginOrRegisit : function(pubUSer,pubPwd,userSource,hospitalId,name,UID,phoneNo,sex){
                var pwdRas = RsaUtilService.getRsaResult(pubPwd);   //rsa加密 密码
                var thirdUserInfo = {
                    USER_CODE : phoneNo,
                    USER_SOURCE:userSource,
                    HOSPITAL_ID :hospitalId,
                    NAME : name,
                    ID_NO : UID,
                    PHONE_NUMBER : phoneNo,
                    SEX : sex,
                    P_USER_CODE:pubUSer,//吴伟刚 KYEEAPPC-2840 APP接入安全认证前台整改
                    P_PASSWORD:pwdRas
                };
                def.loginAuthForChongZhou(pubUSer, pubPwd, thirdUserInfo);
            },

            loginAuthForChongZhou : function (pubUSer, pubPwd, thirdUserInfo){
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
                                me.queryUserHospitalPer();
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

            queryUserHospitalPer : function(){
                var me = this;
                var cache = CacheServiceBus.getMemoryCache();
                var storage = CacheServiceBus.getStorageCache();
                var currentUserRecord = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var userHospitalInfo = storage.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if (currentUserRecord.HOSPITAL_ID == undefined || currentUserRecord.HOSPITAL_ID == '0'
                    || (userHospitalInfo && currentUserRecord.HOSPITAL_ID == userHospitalInfo.id)){
                    ////获取默认就诊者的主键值  已废除，下个版本删除 张家豪 KYEEAPPC-4406  todo
                    //LoginService.getDefaultUserVsId(currentUserRecord);
                    //定位用户所在城市
                    setTimeout(LoginService.cityPositioning(storage, cache), 1000);
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
                        individual_Hospital: currentUserRecord.HOSPITAL_ID
                    },
                    onSuccess : function(retVal){
                        var success = retVal.success;
                        var records = retVal.data;
                        var message = retVal.message;
                        //setTimeout(LoginService.cityPositioning(storage, cache), 1000);
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

                            KyeeMessageService.broadcast({
                                content: message,
                                duration:3000
                            });

                        }
                    }
                });
            }
        };

        return def;
    })
    .build();
