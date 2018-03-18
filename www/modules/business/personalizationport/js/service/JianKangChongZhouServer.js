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

            //���Σ�{ƽ̨��֤����ƽ̨��֤���룬�û���Դ��ҽԺID���û�����, �û����֤��, �û��绰����, �û��Ա�}
            //thirdPartyParams = new String[]{"JianKangWeiPingTai510184","JKWPT11274510184","9","1501","�ż���","52262619800410121X","13700001111","��"};

            loginOrRegisit : function(pubUSer,pubPwd,userSource,hospitalId,name,UID,phoneNo,sex){
                var pwdRas = RsaUtilService.getRsaResult(pubPwd);   //rsa���� ����
                var thirdUserInfo = {
                    USER_CODE : phoneNo,
                    USER_SOURCE:userSource,
                    HOSPITAL_ID :hospitalId,
                    NAME : name,
                    ID_NO : UID,
                    PHONE_NUMBER : phoneNo,
                    SEX : sex,
                    P_USER_CODE:pubUSer,//��ΰ�� KYEEAPPC-2840 APP���밲ȫ��֤ǰ̨����
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

                                //Ϊ����Ӱ������ģ�飬��¼�ɹ�����ͳһ����LoginService
                                var userInfo = {
                                    user : pubUSer,
                                    pwd : pubPwd,
                                    rememberPwd : false,
                                    autoLogin : false
                                };
                                //�ж��Ƿ���Ҫ��ס�������Զ���¼,������Ϣд��localStorage
                                LoginService.saveUserInfo(userInfo, storage);
                                //ˢ��ҳ��footer�ĵ��ĸ����������ĵ�¼��
                                LoginService.login(pubUSer, retUserInfo);
                                //��respons���û���Ϣд�뻺��
                                LoginService.saveUserInfoToCache(retUserInfo, pubUSer, pubPwd);
                                //�ٶ�����
                                LoginService.savaPushUserId(retUserInfo, storage, cache);
                                //�ڵ�¼�󣬴���userId�����ж��Ƿ����ڰ������û������ð�����apk�����ӿڡ�zm
                                LoginService.checkUserIsWhite(retUserInfo.USER_ID);
                                //��ѯҽԺ��Ϣ��ѡ��ҽԺ����������
                                me.queryUserHospitalPer();
                            }
                        }else{
                            var message=resp.message;
                            KyeeMessageService.message({
                                title: "��ʾ",
                                content: message,
                                okText: "֪����",
                                onOk: function () {
                                    if (navigator.app) {
                                        navigator.app.exitApp();//ֱ���˳�ȤҽԺ
                                    }
                                }
                            });
                        }
                    },
                    onError: function (retVal) {
                        KyeeMessageService.message({
                            title: "��ʾ",
                            content: "����ʧ�ܣ����Ժ����ԣ�(���֪���˽����˻���һҳ��)",
                            okText: "֪����",
                            onOk: function () {
                                if (navigator.app) {
                                    navigator.app.exitApp();//ֱ���˳�ȤҽԺ
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
                    ////��ȡĬ�Ͼ����ߵ�����ֵ  �ѷϳ����¸��汾ɾ�� �żҺ� KYEEAPPC-4406  todo
                    //LoginService.getDefaultUserVsId(currentUserRecord);
                    //��λ�û����ڳ���
                    setTimeout(LoginService.cityPositioning(storage, cache), 1000);
                    //��ѯ��½�˻���ѡ��ľ�����
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
                                    //���¾Ź���ҳ��
                                    HospitalService.updateUI();

                                });
                        }else{
                            //��ѯ��½�˻���ѡ��ľ�����
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
