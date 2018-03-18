/**
 * 产品名称：quyiyuan
 * 创建原因：就诊卡充值(2.1.60版后)服务层
 * 创建者：程铄闵
 * 任务号：KYEEAPPC-5217
 * 创建时间：2016年2月22日15:09:26
 * 修改者：程铄闵
 * 修改时间：2016年9月27日15:10:43
 * 修改原因：2.3.10版修改增加退费记录
 * 任务号：KYEEAPPC-8088
 */
new KyeeModule()
    .group("kyee.quyiyuan.patient_card_recharge.service")
    .require([])
    .type("service")
    .name("PatientCardRechargeService")
    .params(["HttpServiceBus", "KyeeMessageService", "KyeeUtilsService", "CacheServiceBus", "KyeeI18nService",
        "PatientCardService", "CardRechargeConfirmService", "patientRechargeService"])
    .action(function (HttpServiceBus, KyeeMessageService, KyeeUtilsService, CacheServiceBus, KyeeI18nService,
                      PatientCardService, CardRechargeConfirmService, patientRechargeService) {
        var def = {
            emptyText: undefined,//无权限提示语
            rechargeCardInfo: undefined,//就诊卡信息
            selectCard: false,//通过选择按钮跳转到查卡页面
            fromView:undefined,//模块入口
            isFirstEnter:false,//是否第一次进入模块
            currentCardNo:undefined,//最新显示的卡
            message:true,
            flag:false,
            webJump:undefined,//web页面跳转标识

            //加载权限及提示语
            getModule: function (getData,$state,IS_QUERY_BY_TEMP_CARD) {
                //拦截医院选择&&就诊者
                var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
                if (hospitalInfo == null || hospitalInfo.id == "" || currentCustomPatient == null || currentCustomPatient.USER_VS_ID == null) {
                    KyeeMessageService.hideLoading();//取消遮罩
                    $state.go('patient_card_recharge');
                    return;
                }
                var showLoading=false;
                if(IS_QUERY_BY_TEMP_CARD==1){
                    showLoading=true;
                }
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        op: "queryPatientCharge",
                        IS_QUERY_BY_TEMP_CARD:IS_QUERY_BY_TEMP_CARD
                    },
                    showLoading: showLoading,
                    onSuccess: function (data) {
                        if (data.success) {
                            def.emptyText = undefined;
                            def.IS_OPEN_RHCMS=data.data.IS_OPEN_RHCMS;
                            //根据版本判断跳转模块页面
                            var terminalVersion = data.data.T_VERSION;
                            if (terminalVersion) {
                                var version = terminalVersion.split('.');
                                var v1 = parseFloat(version[0]);
                                var v2 = parseFloat(version[1]);
                                var v3 = parseFloat(version[2]);
                                //2.1.60为分界线
                                if (!isNaN(v1) && v1 < 2) {
                                    def.loadOld(getData);
                                }
                                else if (!isNaN(v1) && v1 == 2) {
                                    if (!isNaN(v2) && v2 < 1) {
                                        def.loadOld(getData);
                                    }
                                    else if (!isNaN(v2) && v2 == 1) {
                                        if (!isNaN(v3) && v3 < 60) {
                                            def.loadOld(getData);
                                        }
                                        else {
                                            def.loadNew(data, getData);
                                        }
                                    }
                                    else {
                                        def.loadNew(data, getData);
                                    }
                                }
                                else {
                                    def.loadNew(data, getData);
                                }
                            }
                            else {
                                def.loadOld(getData);
                            }
                        } else {
                            def.emptyText = data.message;
                            getData('patient_card_recharge');
                        }
                    }
                });
            },

            //加载权限及提示语
            getRecordModule: function (getData,$state,IS_QUERY_BY_TEMP_CARD) {
                //拦截医院选择&&就诊者
                var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
                if (hospitalInfo == null || hospitalInfo.id == "" || currentCustomPatient == null || currentCustomPatient.USER_VS_ID == null) {
                    $state.go('patient_card_recharge');
                    return;
                }
                var showLoading=false;
                if(IS_QUERY_BY_TEMP_CARD==1){
                    showLoading=true;
                }
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        op: "queryPatientCharge",
                        IS_QUERY_BY_TEMP_CARD:IS_QUERY_BY_TEMP_CARD
                    },
                    showLoading: showLoading,
                    onSuccess: function (data) {
                        if (data.success) {
                            if(data.data){
                                def.rechargeInfo = data.data;
                                if(data.data.CARD_LIST){
                                    def.rechargeCardInfo = JSON.parse(data.data.CARD_LIST).rows;
                                    delete def.rechargeInfo.CARD_LIST;
                                }else{
                                    def.rechargeCardInfo=null;
                                }
                            }
                            def.emptyText = undefined;
                            def.IS_OPEN_RHCMS=data.data.IS_OPEN_RHCMS;
                            getData('patient_card_records');
                        } else {
                            def.emptyText = data.message;
                            getData('patient_card_records');
                        }
                    }
                });
            },
            //充值按钮事件  //KYEEAPPC-7818 程铄闵 增加cardType
            goRecharge: function (params, getData) {
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        CARD_NO: params.CARD_SHOW,
                        CARD_TYPE: params.CARD_TYPE,
                        PATIENT_ID: params.PATIENT_ID,
                        INPUT_FLAG:params.INPUT_FLAG,
                        QUERY_TYPE:'0',
                        op: "queryPatientRechargeMasterActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var data = data.data;
                            //有卡数据--跳转确认页面
                            if (data && data.total > 0) {
                                if(data.CARD_LIST) {
                                    def.rechargeCardInfo = data.CARD_LIST.rows;
                                }
                                CardRechargeConfirmService.rechargeInfo = data;
                                getData('card_recharge_confirm');
                            }
                            //无卡数据
                            else {
                                //非直连
                                if(data.STRAIGHT == '0'){
                                    CardRechargeConfirmService.lastCardParams = params;
                                    if(data.CARD_LIST) {
                                        def.rechargeCardInfo = data.CARD_LIST.rows;
                                    }
                                    CardRechargeConfirmService.rechargeInfo = data;
                                    getData('card_recharge_confirm');
                                }
                                else{
                                    KyeeMessageService.broadcast({
                                        content: data.ERROR_MSG,
                                        duration: 3000
                                    });
                                }
                            }
                        }
                        else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //2.1.60版后的模块初始化数据
            loadNew: function (data, getData) {
                if(data.data){
                    def.rechargeInfo = data.data;
                    if(data.data.CARD_LIST){
                        def.rechargeCardInfo = JSON.parse(data.data.CARD_LIST).rows;
                        delete def.rechargeInfo.CARD_LIST;
                    }else{
                        def.rechargeCardInfo=null;
                    }
                }
                getData('patient_card_recharge');
            },

            //2.1.60版前的模块初始化数据
            loadOld: function (getData) {
                patientRechargeService.loadMsg(function (route) {
                    getData(route);
                });
            },

            //查询就诊卡余额
            queryBalance : function(params,getData){
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        CARD_NO: params.CARD_SHOW,
                        INPUT_NAME: params.INPUT_NAME,
                        CARD_TYPE: params.CARD_TYPE,
                        PATIENT_ID: params.PATIENT_ID,
                        QUERY_TYPE:params.QUERY_TYPE,
                        op: "queryPatientRestAmount"
                    },
                    showLoading:!(params.QUERY_TYPE==1),
                    onSuccess: function (data) {
                        if (data.success) {
                            if(data.data && data.data.CARD_LIST) {
                                def.rechargeCardInfo = JSON.parse(data.data.CARD_LIST).rows;
                            }
                            getData(data.data);
                        }
                        else{
                            if(params.QUERY_TYPE == 0){
                                KyeeMessageService.broadcast({
                                    content: data.message,
                                    duration: 3000
                                });
                            }
                        }
                    }
                });
            },

            //判断跳转到就诊卡添加页面or就诊卡充值页 -- 废弃
            isPermission: function (permission,rec, getData) {
                var isReadonly = true;
                var view = 'patient_card_recharge';//跳转的页面，默认就诊卡充值首页
                var cardSelView = 'patient_card_select';//查卡页面
                //开通权限
                if (permission) {
                    //查卡接口返回数据不为空
                    if(rec.queryCardInAppoint){
                        var data = JSON.parse(rec.queryCardInAppoint);
                        isReadonly = (data.CARDNO_TO_APPOINT == 0);//就诊卡是否可输，1-可输；0-不可输
                        def.isReadonly = isReadonly;//就诊卡是否可输
                        var cardList = data.rows;//就诊卡列表
                        //有卡
                        if(cardList){
                            def.rechargeCardInfo = cardList;//就诊卡信息
                            //不可输入就诊卡
                            if (isReadonly) {
                                var card = CacheServiceBus.getMemoryCache().get('currentCardInfo');
                                //有卡
                                if (card && card.CARD_TYPE) {
                                    //如果是虚拟卡（趣医）,拦截
                                    if (card.CARD_TYPE == 0 && card.CARD_NO != undefined && card.CARD_NO.substring(0, 1) == "Q") {
                                        PatientCardService.filteringVirtualCard.isFilteringVirtual = true;
                                        PatientCardService.filteringVirtualCard.routingAddress = "patient_card_recharge";
                                        //无卡直接跳转到查卡页面
                                        PatientCardService.selectUserInfo = undefined;//进入查卡页前清除旧卡信息 程铄闵  KYEEAPPTEST-3469
                                        view = cardSelView;
                                    }
                                }
                                else {
                                    PatientCardService.selectUserInfo = undefined;//进入查卡页前清除旧卡信息  KYEEAPPTEST-3469
                                    //无卡直接跳转到查卡页面
                                    view = cardSelView;
                                }
                            }
                        }
                        else{
                            PatientCardService.selectUserInfo = undefined;//进入查卡页前清除旧卡信息 KYEEAPPTEST-3469
                            view = cardSelView;
                        }
                    }
                    else{
                        PatientCardService.selectUserInfo = undefined;//进入查卡页前清除旧卡信息 KYEEAPPTEST-3469
                        view = cardSelView;
                    }
                }
                getData(view);
            }

        };
        return def;
    })
    .build();