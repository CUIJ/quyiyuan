/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016/5/10
 * 创建原因：2.2.20版 门诊待缴费服务层
 * 任务号：KYEEAPPC-6170
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.clinicPaymentRevise.service")
    .type("service")
    .name("ClinicPaymentReviseService")
    .params([
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeMessageService",
        "KyeeI18nService",
        "ClinicPaidService",
        "$timeout",
        "$ionicHistory"
    ])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService, KyeeI18nService,ClinicPaidService,$timeout,$ionicHistory) {

        var def = {
            hospitalId: undefined,
            //实际进入待缴费展示的医院（非跨院）
            HOSPITALID_TREE: undefined,
            configTips: undefined,//查询页默认提示语
            authFlag: false,//是否重实名认证跳转来 程铄闵 KYEEAPPC-4806
            fromHospitalView: undefined,//1--从医院首页跳入模块
            //全局参数
            lastRootState:undefined,//上个页面路由
            memoryCache: CacheServiceBus.getMemoryCache(),
            //缓存数据
            storageCache: CacheServiceBus.getStorageCache(),
            //从就医记录某条记录跳转来的医院名称
            fromGuideRecordHosName:undefined,
            //不请求预约挂号数据
            unNeedRegister:undefined,
            //从小铃铛来的hospitalId
            fromRecordHospitalId:undefined,
            //附加费用
            addInfo:undefined,
            //扫描专属二维码查询门诊代缴费新街口开关
            useNewPaymentInterface:false,
            //是否开通医保（true-开通-跳转到2.2.10前旧版页面）
            isMedicalInsurance:function(routerfrom,getData){
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    params: {
                        op: 'getIfMedicalInsurance'
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData('clinicPayment');
                        }
                        else{
                            if(routerfrom == 1){
                                getData('clinic_payment_hos');
                            }else {
                                getData('clinic_payment_revise');
                            }
                        }
                    },
                    onError: function () {
                    }
                })
            },
            //发送请求
            loadData: function (fromHospitalView, getData, isInit,fromMedicalGuide) {
                var patientId;
                var cardNo;
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalInfo = storageCache.get("hospitalInfo");//当前医院信息
                var hospitalId = undefined;//当前医院id
                var op = "paymentBusiness";
                var PHONE_NUMBER;
                var HOSPITALID_TREE;
                if (hospitalInfo) {
                    hospitalId = hospitalInfo.id;
                }
                //扫描专属二维码查询门诊代缴费新街口开关
                if(def.useNewPaymentInterface){
                    op = "paymentBusinessNew";
                }
                if(def.PHONE_NUMBER){
                    PHONE_NUMBER = def.PHONE_NUMBER;
                    def.PHONE_NUMBER = undefined;
                }
                if(def.HOSPITALID_TREE){
                    HOSPITALID_TREE = def.HOSPITALID_TREE;
                    def.HOSPITALID_TREE = undefined;
                }
                //输就诊卡号的操作
                if (def.queryObj) {
                    patientId = def.queryObj.patientId;
                    cardNo = def.queryObj.cardNo;
                    if (def.hospitalSelId) {
                        hospitalId = def.hospitalSelId;
                        def.hospitalSelId = undefined;
                    }
                    var obj = {
                        patientId: patientId,
                        hospitalId: hospitalId,
                        cardNo: cardNo
                    };
                    //存就诊卡号到缓存
                    var storageCache = CacheServiceBus.getStorageCache();
                    storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.CLINIC_PAYMENT_INFO, obj);
                    def.queryObj = undefined;
                }
                else {
                    patientId = undefined;
                    //选完医院后的传新医院
                    if (def.hospitalSelId) {
                        hospitalId = def.hospitalSelId;
                        def.hospitalSelId = undefined;
                    }
                    //若有就诊卡号缓存，则取缓存传数据
                    var info = storageCache.get('clinicPaymentInfo');
                    if (info != undefined && info.patientId != undefined && info.hospitalId == hospitalId && info.cardNo != undefined)  {
                        patientId = info.patientId;
                        cardNo = info.cardNo;
                    }
                }

                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    showLoading: isInit,
                    params: {
                        USER_VS_ID: this.memoryCache.get('currentCustomPatient').USER_VS_ID,
                        HOSPITALID_TREE: HOSPITALID_TREE,
                        INPUT_PATIENT_ID: patientId,
                        CARD_NO: cardNo,
                        hospitalID: hospitalId,
                        IS_NEED_APPOINT_OR_REGIST:def.unNeedRegister,//不请求预约挂号数据（小铃铛入口）
                        //KYEEAPPC-5128 程铄闵 从医院首页进入
                        FROM_HOSPITAL_VIEW: fromHospitalView,
                        //就医记录上方入口
                        FROM_MEDICAL_GUIDE:fromMedicalGuide,
                        PHONE_NUMBER:PHONE_NUMBER,
                        op: op
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            if (data.message) {
                                try { //KYEEAPPTEST-3181 程铄闵
                                    var message = JSON.parse(data.message);
                                    def.tips = message.TIPS;//底部提示信息
                                    def.configTips = message.CONFIG_TIPS;//查询页默认提示 //程铄闵 KYEEAPPC-4560 修改提示
                                }
                                catch (e) {
                                    def.tips = undefined;
                                }
                            }
                            //后端传过来的message不为空则无数据
                            var rec = data.data;
                            //有数据
                            if ((rec.PAY&&rec.PAY.length>0)||(rec.REG&&rec.REG.length>0)) {
                                var paymentData = rec.PAY;
                                def.roundTip = rec.CLINIC_TOTAL_FEE_INFO;//支付金额是否准确提示 KYEEAPPC-4673 程铄闵
                                if(paymentData.length>0){
                                    //已缴费
                                    if(paymentData[0].MONTH_OF_YEAR){
                                        var paid = [];
                                        for (var i = 0; i < paymentData.length; i++) {
                                            var info = paymentData[i].PAYMENT_INFO;
                                            if(info && info[0]=='"'&&info[info.length-1]=='"'){
                                                info = info.substring(1,paymentData[i].PAYMENT_INFO.length-1).toString();//截取前后多余引号
                                            }
                                            var paymentInfo = JSON.parse(info);
                                            if(paymentInfo){
                                                //KYEEAPPTEST-3818 去掉详情处理
                                                /*                                                for(var j=0;j<paymentInfo.length;j++){
                                                                                                    if(paymentInfo[j].PAYDETAIL){
                                                                                                        paymentInfo[j].PAYDETAIL = ClinicPaidService.getClassData(paymentInfo[j].PAYDETAIL);
                                                                                                    }
                                                                                                }*/
                                                paid = paid.concat(paymentInfo);
                                            }
                                        }
                                        rec.PAID = paid;
                                    }
                                    else{
                                        for (var i = 0; i < paymentData.length; i++) {
                                            paymentData[i].PAYMENT_INFO = JSON.parse(paymentData[i].PAYMENT_INFO);
                                            var payInfo = paymentData[i].PAYMENT_INFO;

                                            if(payInfo){
                                                for(var k=0; k<payInfo.length; k++){
                                                    var detail = payInfo[k].PAYDETAIL;
                                                    if(detail) {
                                                        for(var j=0; j<detail.length; j++){
                                                            var itemCost = detail[j].ITEM_COSTS;
                                                            var n = itemCost.toString().split('.')[1];
                                                            //小数点3位及以上原样显示
                                                            if(!n || (n && n.length>0 && n.length<3)){
                                                                payInfo[k].PAYDETAIL[j].ITEM_COSTS = itemCost.toFixed(2);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            def.getShowName(payInfo,i);
                                        }
                                    }
                                }
                                getData(rec,true,message.RETURN_MSG);
                            }
                            else {
                                getData(rec, false,message.RETURN_MSG);
                            }
                        }
                        else {
                            if (data.resultCode == '0030108') {
                                KyeeMessageService.broadcast({
                                    content: data.message,
                                    duration: 2000
                                });
                                /*$timeout(
                                    function(){
                                        $ionicHistory.goBack();
                                    },1000
                                );*/
                            } else {
                                getData('', false,data.message);
                            }
                        }
                    },
                    onError: function () {
                    }
                })
            },
            //执行科室等名称拆分显示
            getShowName:function(info,i){

                for(var j=0; j< info.length;j++){
                    //info[j].SHOW_NAMES = {};
                    var showName = [];
                    var name = info[j].SHOW_NAME;
                    if(name){
                        var names = name.split('，');
                        for(var k=0;k<names.length;k++){
                            var arr;
                            //兼容英文冒号 KYEEAPPTEST-3636 程铄闵
                            if(names[k].indexOf('：')>0){
                                arr = names[k].split('：');
                            }
                            else if(name.indexOf(':')>0){
                                arr = names[k].split(':');
                            }
                            //var arr = names[k].split('：');
                            if(arr){
                                var obj = {
                                    NAME : arr[0]+'：',
                                    VAL : arr[1]
                                };
                                showName.push(obj);
                            }
                        }
                    }
                    info[j].SHOW_NAMES = showName;
                }
            },
            //获取医院图标
            getHospitalLogo: function(id){
                var hospitalList = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);
                var logo;
                if(hospitalList){
                    for(var i=0;i<hospitalList.length;i++){
                        if(hospitalList[i].HOSPITAL_ID == id){
                            logo = hospitalList[i].LOGO_PHOTO;
                            break;
                        }
                    }
                }
                return logo;
            },
            //获取医院图标和名字
            getHospitalNameLogo: function(id){
                var hospitalList = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);
                var logo;
                var hospitalName;
                var data = {logo:'',hospitalName:''};
                if(hospitalList){
                    for(var i=0;i<hospitalList.length;i++){
                        if(hospitalList[i].HOSPITAL_ID == id){
                            logo = hospitalList[i].LOGO_PHOTO;
                            hospitalName = hospitalList[i].HOSPITAL_NAME;
                            break;
                        }
                    }
                }
                data = {logo:logo,hospitalName:hospitalName};
                return data;
            },
            //查询医保支付状态  已废弃
            loadPreSettlement: function (getData, serialNo, v_date, p_attr) {
                HttpServiceBus.connect({
                    url: "medicalSecurity/action/MedicalSecurityActionC.jspx",
                    params: {
                        SERIAL_NO: serialNo,
                        VISIT_DATE: v_date,
                        PRESC_ATTR: p_attr,
                        HOSPITAL_ID: this.hospitalId,
                        ID_NO: this.memoryCache.get('currentCustomPatient').ID_NO,
                        USER_VS_ID: this.memoryCache.get('currentCustomPatient').USER_VS_ID,
                        op: 'queryPreSettlementAndSettlementStatus'
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData(data);
                        }
                    },
                    onError: function () {
                    }
                })
            },
            //缴费/结算失败，还原为预结算完成状态
            backToPre: function (getData, tradeNo) {
                HttpServiceBus.connect({
                    url: "medicalSecurity/action/MedicalSecurityActionC.jspx",
                    params: {
                        hospitalID: this.hospitalId,
                        TRADE_NO: tradeNo,
                        op: 'backToPre'
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("clinicPayment.paySuccess", "结算成功。")
                            });
                        }
                    },
                    onError: function () {
                    }
                })
            },
            //获取订单
            PaymentGetOrder: function (getData, paymentData, IS_MS_PAY,ADD_KEY) {
                var me = this;
                //var total = paymentData.TOTAL;
                var seriesNos = [];
                var visitDate = [];
                var prescAttr = [];
                //分组信息
                var checkedItems = [];
                /*                if (paymentData.CHOOSE_MODEL == '2') {
                                    //如果为全选
                                    checkedItems = paymentData.PAYMENT_INFO;
                                } else {*/
                //如果为多选或单选、全选
                for (var i = 0; i < paymentData.PAYMENT_INFO.length; i++) {
                    //选中的
                    if (paymentData.PAYMENT_INFO[i].checked) {
                        checkedItems.push(paymentData.PAYMENT_INFO[i]);
                    }
                }
                /* }*/
                var total = checkedItems.length;
                var details = [];
                for (var i = 0; i < checkedItems.length; i++) {
                    seriesNos.push(checkedItems[i].SERIAL_NO);
                    visitDate.push(checkedItems[i].VISIT_DATE.substr(0, 10));
                    prescAttr.push(checkedItems[i].PRESC_ATTR);
                    details.push(
                        {
                            VISIT_DATE: checkedItems[i].VISIT_DATE,
                            SERIAL_NO: checkedItems[i].SERIAL_NO,
                            ITEM_CLASS: checkedItems[i].ITEM_CLASS,
                            PRESC_ATTR: checkedItems[i].PRESC_ATTR,
                            REC_MASTER_ID: checkedItems[i].REC_MASTER_ID
                        }
                    )
                }
                var mark_detail = "";
                var presc_attrs = "";
                var itemClass = "";
                if (details.length > 0) {
                    for (var i = 0; i < details.length; i++) {
                        mark_detail += details[i].ITEM_NAME + '：' + details[i].ITEM_COSTS + '元，';
                        presc_attrs += details[i].PRESC_ATTR + ",";
                    }
                    itemClass = details[0].ITEM_CLASS;
                    presc_attrs = presc_attrs.substr(0, presc_attrs.lastIndexOf(","));
                    mark_detail = mark_detail.substring(0, mark_detail.lastIndexOf('，'));
                }
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    type: "POST",
                    params: {
                        ADD_KEY:ADD_KEY,
                        op: 'getOrderNoForFee',
                        MODEL_HOSPITAL_ID: paymentData.HOSPITAL_ID,
                        hospitalID: paymentData.HOSPITAL_ID,//KYEEAPPC-4631 程铄闵 门诊去支付按钮权限
                        details: JSON.stringify(details),
                        MARK_DESC: this.memoryCache.get('currentCustomPatient').OFTEN_NAME + '-缴费单',
                        MARK_DETAIL: mark_detail,
                        TOTAL: total,
                        MS_STATUS: paymentData.PAYMENT_INFO[0].MS_STATUS,
                        USER_ID: this.memoryCache.get('currentUserRecord').USER_ID,
                        USER_NAME: this.memoryCache.get('currentCustomPatient').OFTEN_NAME,
                        IS_MS_PAY: IS_MS_PAY,
                        // begin 医保支付需要参数
                        USER_VS_ID: this.memoryCache.get('currentCustomPatient').USER_VS_ID,
                        ID_NO: this.memoryCache.get('currentCustomPatient').ID_NO,
                        PRESC_ATTR: presc_attrs.split(",")[0],
                        SERIAL_NO: seriesNos[0],
                        VISIT_DATE: visitDate[0]
                        // end  医保支付需要参数
                    },
                    onSuccess: function (result) {
                        if (result.success) {
                            //mark!!! from clinicPaymentReviseService
                            var data = result.data;
                            //订单编号
                            var tradeNo = data.OUT_TRADE_NO;
                            var total_fee = data.TOTAL_FEE;
                            var desc = data.DESC;
                            //医保支付金额
                            var pPayAmount = '';
                            var msAccountPayAmout = '';
                            var msPayAmout = '';
                            var cardPayAmount = '';
                            var originalFee = '';
                            var discountFee = '';
                            if (data.PATIENT_PAY_AMOUNT) {
                                pPayAmount = parseFloat(data.PATIENT_PAY_AMOUNT);
                            }
                            if (data.MEDICAL_SECURITY_ACCOUNT_PAY_AMOUNT) {
                                msAccountPayAmout = parseFloat(data.MEDICAL_SECURITY_ACCOUNT_PAY_AMOUNT);
                            }
                            if (data.MEDICAL_SECURITY_PAY_AMOUNT) {
                                msPayAmout = parseFloat(data.MEDICAL_SECURITY_PAY_AMOUNT);
                            }
                            if (data.VISITING_CARD_PAY_AMOUNT) {
                                cardPayAmount = parseFloat(data.VISITING_CARD_PAY_AMOUNT);
                            }
                            if (data.FEE_DISCOUNT_SWITCH == '1' && data.DISCOUNT_FEE > 0) {
                                originalFee = data.ORIGINAL_FEE;
                                discountFee = data.DISCOUNT_FEE;
                            }
                            var markDescName = KyeeI18nService.get("clinicPayment.markDescName", "缴费单");
                            var payData = {
                                'hospitalID': me.hospitalId,
                                'MARK_DESC': me.memoryCache.get('currentCustomPatient').OFTEN_NAME + '-' + markDescName,
                                'MARK_DETAIL': desc,
                                'AMOUNT': parseFloat(total_fee).toFixed(2),
                                'AMOUNT-TEXT': "¥" + total_fee,
                                'ORIGINAL_AMOUNT': originalFee,
                                'DISCOUNT_AMOUNT': discountFee,
                                'PRESC_ATTR': presc_attrs,
                                'ITEM_CLASS': itemClass,
                                // begin  医保支付需要参数
                                'SERIAL_NO': seriesNos[0],
                                'VISIT_DATE': visitDate,
                                'TRADE_NO': tradeNo,
                                'PATIENT_PAY_AMOUNT': pPayAmount,
                                'MEDICAL_SECURITY_ACCOUNT_PAY_AMOUNT': msAccountPayAmout,
                                'MEDICAL_SECURITY_PAY_AMOUNT': msPayAmout,
                                'VISITING_CARD_PAY_AMOUNT': cardPayAmount,
                                'DETAILS': details,
                                'IS_PAID': data.IS_PAID,
                                'PATIENT_ID': paymentData.PAYMENT_INFO[0].PATIENT_ID,
                                'CARD_NO': paymentData.PAYMENT_INFO[0].CARD_NO,
                                'TOTAL': paymentData.TOTAL
                                //增加卡号 程铄闵 KYEEAPPC-7823
                                // end  医保支付需要参数
                            };
                            getData(payData);
                        } else {
                            KyeeMessageService.broadcast({
                                content: result.message
                            });
                        }
                    },
                    onError: function () {
                    }
                })
            },


            //获取附加费用 by dongzhuo
            getExtraCharge: function (onSuccess, masterId) {
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    params: {
                        REC_MASTER_ID:masterId,     //需要处理
                        op: 'queryAddInfo'
                    },
                    onSuccess: function
                        (data) {
                        if (data.success) {
                            onSuccess(data);
                        }
                        else{
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                    }
                })
            },


            //预约后支付（继续支付）
            goToPay: function (onSuccess, params) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "afterAppoint2FeeActionC",
                        hospitalID: params.hospitalId,
                        PATIENT_ID: params.patientId,
                        USER_ID: params.userId,
                        C_REG_ID: params.cRegId,
                        MARK_DESC: params.markDesc,
                        AMOUNT: params.Amount,
                        postdata: params.postData
                    },
                    onSuccess: function (result) {
                        var data = result.data;
                        if (result.success) {
                            var paydata = params.postData;
                            paydata["TRADE_NO"] = data.OUT_TRADE_NO;
                            paydata["MARK_DETAIL"] = params.markDesc;
                            paydata["APPOINT_SUCCESS_PAY"] = 1;
                            paydata["ROUTER"] = "clinic_payment_revise";
                            paydata["REMAIN_SECONDS"] = data.REMAIN_SECONDS;
                            paydata["flag"] = 3;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费
                            paydata["isShow"] = data.isShow;
                            paydata["IS_OPEN_BALANCE"] = data.IS_OPEN_BALANCE;
                            paydata["USER_PAY_AMOUNT"] = data.USER_PAY_AMOUNT;
                            paydata["C_REG_ID"] = params.cRegId;
                            paydata["hospitalID"] = paydata.HOSPITAL_ID;
                            paydata["CARD_NO"] = paydata.CARD_NO;
                            onSuccess(paydata);
                        } else {
                            KyeeMessageService.broadcast({
                                content: result.message
                            });
                        }
                    }
                });
            },

            //挂号后支付（继续支付）
            goToPayRegist: function (onSuccess, params, appointDetil) {

                HttpServiceBus.connect({
                    url: "/register/action/RegisterActionC.jspx",
                    params: {
                        op: "afterRegist2FeeActionC",
                        HOSPITAL_ID: params.HOSPITAL_ID,
                        C_REG_ID: params.C_REG_ID
                    },
                    onSuccess: function (result) {
                        var data = result.data;
                        if (result.success) {
                            var paydata = appointDetil;
                            paydata["HOSPITAL_ID"] = appointDetil.HOSPITAL_ID;
                            paydata["TRADE_NO"] = data.OUT_TRADE_NO;
                            paydata["MARK_DETAIL"] = appointDetil.MARK_DESC;
                            paydata["APPOINT_SUCCESS_PAY"] = 1;
                            paydata["ROUTER"] = "clinic_payment_revise";
                            paydata["REMAIN_SECONDS"] = data.REMAIN_SECONDS;
                            paydata["flag"] = 4;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费 4挂号缴费
                            paydata["isShow"] = data.isShow;
                            paydata["IS_OPEN_BALANCE"] = data.IS_OPEN_BALANCE;
                            paydata["USER_PAY_AMOUNT"] = data.USER_PAY_AMOUNT;
                            paydata["C_REG_ID"] = appointDetil.C_REG_ID;
                            paydata["hospitalID"] = paydata.HOSPITAL_ID;
                            paydata["CARD_NO"] = paydata.CARD_NO;
                            onSuccess(paydata);
                        } else {
                            KyeeMessageService.broadcast({
                                content: result.message
                            });
                        }
                    }
                });
            },
            //门诊待缴费删除 by 杜巍巍
            deleteClinicPayment: function (getData,REC_MASTER_ID) {
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    params: {
                        PRIMARY_KEY: REC_MASTER_ID,
                        op: 'hiddenPayResByPrimaryKey'
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData(data);
                        }
                    },
                    onError: function () {
                    }
                })
            }
        };


        return def;
    })
    .build();