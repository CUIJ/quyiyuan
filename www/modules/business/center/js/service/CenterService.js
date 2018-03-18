/**
 * Created by Administrator on 2015/4/25.
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.service")
    .type("service")
    .name("CenterService")
    .params([
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "HttpServiceBus",
        "CacheServiceBus"
    ])
    .action(function ($state,
                      KyeeMessageService,
                      KyeeViewService,
                      HttpServiceBus,
                      CacheServiceBus) {
        var def = {

            //我的保险开关
            withMyInsurance:'0',
            MyInsuranceUrl:null,
            /**
             * 页面头像显示
             */
            dealWithImage: function (patients) {
                if (!patients.IMAGE_PATH) {
                    if (patients && patients.SEX && patients.SEX == 2) {
                        return 'resource/images/center/headF.png';//将头像字段与缓存中作区分
                    } else {
                        return 'resource/images/center/headM.png';//将头像字段与缓存中作区分
                    }
                }else{
                    return patients.IMAGE_PATH;
                }
            },


            /**
             * 将选中就诊者放入缓存中，如果没有则放入空{}
             */
            dealWithSelectPatients: function (patients, memoryCache) {
                memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, patients);
            },


            /**
             * 将选中就诊卡放入缓存中，如果没有则放入空{}
             */
            dealWithSelectCardInfo: function (patients, memoryCache) {
                if (patients.DETIAL_LIST && patients.DETIAL_LIST != "null" && patients.DETIAL_LIST.length > 0) {
                    var detailList = JSON.parse(patients.DETIAL_LIST);
                    for (var i = 0; i < detailList.length; i++) {
                        if (detailList[i].IS_DEFAULT == 1) {
                            memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, detailList[i]);
                            break;
                        } else {
                            memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, {})
                        }
                    }
                } else {
                    memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, {})
                }
            },

            /**
             * 查取登陆账户下选择的就诊者
             * @param currentUserRecord
             * @param storageCache
             * @param onSuccess
             */
            getSelectCustomInfo: function (currentUserRecord, storageCache, onSuccess) {
                var memoryCache = CacheServiceBus.getMemoryCache();//全局参数
                var storageCache = CacheServiceBus.getStorageCache();//缓存数据
                var userId = currentUserRecord.USER_ID;
                var image = 'resource/images/center/headM.png';
                HttpServiceBus.connect({
                    url: '/center/action/CustomPatientAction.jspx',
                    showLoading: false,
                    params: {
                        op: 'selectedCustomPatient',
                        userId: userId,
                        hospitalId: function () {
                            var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                            if (hospitalInfo) {
                                return hospitalInfo.id;
                            }
                            return "";
                        }
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var data = retVal.data;
                        if (success) {
                            var patients = data;
                            if (patients && patients.length > 0) {
                                def.dealWithSelectPatients(patients[0], memoryCache);//将选中就诊者放入缓存中
                                def.dealWithSelectCardInfo(patients[0], memoryCache);//将选中就诊卡放入缓存中
                                image = def.dealWithImage(patients[0]);//页面头像显示
                                onSuccess(true,image,patients[0]);
                            } else {
                                onSuccess(false,image,{OFTEN_NAME:""});
                            }
                        }
                    }
                });
            },
            //我的页面
            getNetParams: function (getData) {
                HttpServiceBus.connect({
                    url: "/config/action/ParamsystemActionC.jspx",
                    params: {
                        op: "querySysParams",
                        PARA_CODE: "RISK_SWITCH,RISK_URL,RISK_URL_WEIXIN,IS_HOSPITAL_CLINIC_REBATE,IS_PATIENT_CARD_REBATE,IS_HOSPITAL_PREFEE_REBATE,HEARTH_ARCHIVE_BO_ZHOU,HEARTH_ARCHIVE_APP,RISK_PROMOTION_SWITCH,RISK_PROMOTION_START_TIME"
                    },
                    onSuccess: function (data) {//回调函数
                        if (data.success) {
                            getData(data.data.RISK_SWITCH,data.data.RISK_URL,data.data.RISK_URL_WEIXIN,data.data.IS_HOSPITAL_CLINIC_REBATE,data.data.IS_PATIENT_CARD_REBATE,data.data.IS_HOSPITAL_PREFEE_REBATE, data.data.HEARTH_ARCHIVE_BO_ZHOU,data.data.HEARTH_ARCHIVE_APP,data.data.RISK_PROMOTION_SWITCH,data.data.RISK_PROMOTION_START_TIME);
                        } else {
                            getData('0',"","","false","false","false",'0','0',"0","");
                        }
                    },
                    onError: function () {
                    }
                });
            },
            /**
             * 查询保险参数
             * @param currentUserRecord
             * @param userVsId
             * @param onSuccess
             */
            queryInsuranceParameters: function (whereIComeFrom,url,currentUserRecord,backAdr,onSuccess) {
                HttpServiceBus.connect({
                    url: '/center/action/CustomPatientAction.jspx',
                    showLoading: false,
                    params: {
                        op: 'queryInsuranceParameters',
                        INSURANCE_URL:url,
                        USER_INFO: currentUserRecord,
                        WHERE_I_COME_FROM:whereIComeFrom,
                        BACKADR:backAdr
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var data = retVal.data;
                        if (success) {
                            onSuccess(data);
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();
