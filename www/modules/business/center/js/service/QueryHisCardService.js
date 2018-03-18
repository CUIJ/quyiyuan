/**
 * Created by Administrator on 2015/4/28.
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.service.QueryHisCardService")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("QueryHisCardService")
    .params(["KyeeMessagerService", "HttpServiceBus", "CacheServiceBus"])
    .action(function (KyeeMessagerService, HttpServiceBus, CacheServiceBus) {
        var def = {
            //控制器对应的scope
            controllerScope: {},
            cardN0: '', //获取输入框中输入的卡号，也与C端首页输入框挂勾
            lastClassFlag: 0,  //标志上上一个页面是哪个页面 0自己 1个人信息维护页面  2就诊者信息维护页面
            queryHisPatCardInfo: function (Callback, hospitalId, name, idNo, cardNo, phone, uservsId) {
                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        loc: "c",
                        op: "queryCardList",
                        hospitalId: hospitalId,
                        NAME: name,
                        ID_NO: idNo,
                        CARD_NO: cardNo,
                        PHONE: phone,
                        USER_VS_ID: uservsId,
                        isAutoQueryHisCard: false
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },
            getCorrespondCardInfo: function (Callback, userVsId, hospitalId) {
                HttpServiceBus.connect({
                    url: "user/action/LoginAction.jspx",
                    params: {
                        loc: "c",
                        op: "getCorrespondCardInfo",
                        userVsId: userVsId,
                        hospitalID: hospitalId
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },
            queryCardRecord: function (Callback, userVsId) {
                HttpServiceBus.connect({
                    url: "center/action/UserCardRecordAction.jspx",
                    params: {
                        loc: "c",
                        op: "queryCardRecord",
                        USER_VS_ID: userVsId
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },
            getHint: function (Callback) {
                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        loc: "c",
                        op: "getHint"
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },
            updateCardByUserVsId: function (Callback, userVsId,cardNo, hospitalId,showLoding) {
                var me = this;
                if (showLoding){
                   var showLoad= false;
                }else{
                    var showLoad= true;
                }
                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    showLoading: showLoad,
                    params: {
                        loc: "c",
                        op: "updateCardByUserVsId",
                        userVsId: userVsId,
                        cardNo: cardNo,
                        hospitalId: hospitalId
                    },
                    onSuccess: function (resp) {
                        if (resp.success) {
                            //缓存中存入选中的就诊者和就诊卡  By  章剑飞  KYEEAPPTEST-2754
                            if(me.lastClassFlag!=2){//从就诊者选择进入选卡不要刷新缓存,仅保存后台默认卡就行
                                me.refreshData(userVsId, Callback);
                            }
                            else{
                                Callback();
                            }

                        }
                        else {

                        }
                    }
                });
            },
            //缓存中存入选中的就诊者和就诊卡  By  章剑飞  KYEEAPPTEST-2754
            refreshData: function (userVsId, Callback) {
                var memoryCache = CacheServiceBus.getMemoryCache();
                //获取当前就诊者信息
                var currentCustomPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                //获取登陆用户缓存数据
                var currentUserRecord = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);

                //获取医院缓存数据
                var Cache = CacheServiceBus.getStorageCache();
                var hospital_info = Cache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                var hospitalId = hospital_info.id;

                if (userVsId == currentCustomPatient.USER_VS_ID) {
                    var useId = currentUserRecord.USER_ID;
                    this.selectedCustomPatient(function (rsp) {
                        if (rsp.success) {
                            if (rsp.data.length <= 0) {
                                return;
                            }
                            var data = rsp.data;
                            //成功并且有数据，解析该就诊者的卡信息
                            var detialList = JSON.parse(data[0].DETIAL_LIST);
                            data[0].PATIENT_CARD = [];
                            if (detialList != null) {
                                for (var index = 0; index < detialList.length; index++) {
                                    detialList[index].USER_VS_ID = data[0].USER_VS_ID;
                                    //排除重复的卡号，并且清理空的身份证
                                    var isExist = true;
                                    for (var indexCard = 0; indexCard < data[0].PATIENT_CARD.length; indexCard++) {
                                        if (data[0].PATIENT_CARD[indexCard].PATIENT_ID == detialList[index].PATIENT_ID) {
                                            if (data[0].PATIENT_CARD[indexCard].ID_NO == null
                                                || data[0].PATIENT_CARD[indexCard].ID_NO == undefined) {
                                                data[0].PATIENT_CARD[indexCard] = detialList[index];
                                            }
                                            else {
                                                isExist = false;
                                            }
                                        }
                                    }
                                    if (isExist) {
                                        data[0].PATIENT_CARD.push(detialList[index]);
                                    }
                                }
                            }
                            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, data[0].PATIENT_CARD[0]);
                            data[0].CARD_NO = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO).CARD_NO;
                            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, data[0]);
                            Callback();
                        }
                        else {

                        }
                    }, useId, hospitalId);
                }
            },
            selectedCustomPatient: function (Callback, useId, hospitalId) {
                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    showLoading: false,
                    params: {
                        loc: "c",
                        op: "selectedCustomPatient",
                        userId: useId,
                        hospitalId: hospitalId
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },
            queryHospitalParam: function (Callback, hospitalId) {
                HttpServiceBus.connect({
                    url: "hospitalInform/action/HospitalinforActionC.jspx",
                    params: {
                        loc: "c",
                        op: "queryHospitalParam",
                        hospitalId: hospitalId,
                        paramName: 'QUERYCARDTYPE'
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },
            queryDeletedPatCardInfo: function (Callback, hospitalId, userVsId) {
                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        loc: "c",
                        op: "queryDeletedPatCardInfo",
                        hospitalId: hospitalId,
                        uservsId: userVsId
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },
            updateCardStatus: function (Callback, hospitalId, cardNo, pId) {
                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        loc: "c",
                        op: "updateCardStatus",
                        hospitalId: hospitalId,
                        cardNo: cardNo,
                        pId: pId
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },
            changeVCardToPCard: function (Callback, hospitalId, userVsID, pCardId, vCardId) {
                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        loc: "c",
                        op: "changeVCardToPCard",
                        hospitalId: hospitalId,
                        userVsId: userVsID,
                        pCardId: pCardId,
                        vCardId: vCardId
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },
            //查取生成虚拟卡的条件
            getVisualCardSupport: function (Callback, hospitalId) {
                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        loc: "c",
                        op: "getVisualCardSupport",
                        hospitalId: hospitalId
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },
            //生成虚拟卡
            createVisualCard: function (Callback, hospitalId, userVsID) {
                HttpServiceBus.connect({
                    url: "visualCardMgr/VisualCardAction.jspx",
                    params: {
                        loc: "c",
                        op: "createVisualCard",
                        hospitalID: hospitalId,
                        userVsId: userVsID
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },
            //查询被删除的就诊卡
            queryDeletedPatCardInfo: function (Callback, hospitalId, userVsID) {
                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        loc: "c",
                        op: "queryDeletedPatCardInfo",
                        hospitalId: hospitalId,
                        uservsId: userVsID
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            },

            //恢复已经删除的就诊卡
            retrieveCardStatus: function (Callback, patientId) {
                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        loc: "c",
                        op: "retrieveCardStatus",
                        sysPatientId: patientId
                    },
                    onSuccess: function (resp) {
                        Callback(resp);
                    }
                });
            }
        };

        return def;
    })
    .build();
