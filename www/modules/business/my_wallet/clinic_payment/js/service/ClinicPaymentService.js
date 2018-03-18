/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月6日15:23:36
 * 创建原因：待缴费用服务
 * 任务号：KYEEAPPC-3275
 * 修改者：程铄闵
 * 修改时间：2015年12月13日21:10:53
 * 修改原因：门诊费用增加切换医院的功能（2.1.10）
 * 任务号：KYEEAPPC-4451
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.clinicPayment.service")
    .type("service")
    .name("ClinicPaymentService")
    .params([
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeMessageService",
        "KyeeI18nService"
    ])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService,KyeeI18nService) {

        var def = {
            hospitalId: undefined,
            HOSPITALID_TREE:undefined,
            configTips:undefined,//查询页默认提示语
            authFlag:false,//是否重实名认证跳转来 程铄闵 KYEEAPPC-4806
            fromHospitalView:undefined,//1--从医院首页跳入模块
            //全局参数
            memoryCache: CacheServiceBus.getMemoryCache(),
            //缓存数据
            storageCache: CacheServiceBus.getStorageCache(),
            //发送请求
            loadData: function (fromHospitalView,getData, isInit) {
                var patientId;
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalInfo = storageCache.get("hospitalInfo");//当前医院信息
                var hospitalId = undefined;//当前医院id
                if(hospitalInfo){
                    hospitalId = hospitalInfo.id;
                }

                //输就诊卡号的操作
                if(def.queryObj){
                    patientId = def.queryObj.patientId;
                    if(def.hospitalSelId){
                        hospitalId = def.hospitalSelId;
                        def.hospitalSelId = undefined;
                    }
                    var obj = {
                        patientId:patientId,
                        hospitalId:hospitalId
                    };
                    //存就诊卡号到缓存
                    var storageCache = CacheServiceBus.getStorageCache();
                    storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.CLINIC_PAYMENT_INFO,obj);
                    def.queryObj = undefined;
                }
                else{
                    patientId = undefined;
                    //选完医院后的传新医院
                    if(def.hospitalSelId){
                        hospitalId = def.hospitalSelId;
                        def.hospitalSelId = undefined;
                    }
                    //若有就诊卡号缓存，则取缓存传数据
                    var info = storageCache.get('clinicPaymentInfo');
                    if(info!=undefined&&info.patientId!=undefined&&info.hospitalId==hospitalId){
                        patientId = info.patientId;
                    }
                }
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    showLoading: isInit,
                    params: {
                        USER_VS_ID: this.memoryCache.get('currentCustomPatient').USER_VS_ID,
                        HOSPITALID_TREE:def.HOSPITALID_TREE,
                        INPUT_PATIENT_ID:patientId,
                        hospitalID:hospitalId,
                        FROM_HOSPITAL_VIEW:fromHospitalView,
                        IS_MEDICAL_INSURANCE:'1',//医保入口
                        //KYEEAPPC-5128 程铄闵 从医院首页进入
                        op: "paymentBusiness"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            if(data.message){
                                try{ //KYEEAPPTEST-3181 程铄闵
                                    var message = JSON.parse(data.message);
                                    def.tips = message.TIPS;//底部提示信息
                                    def.configTips= message.CONFIG_TIPS;//查询页默认提示 //程铄闵 KYEEAPPC-4560 修改提示
                                }
                                catch(e){
                                    def.tips = undefined;
                                }
                            }
                            //后端传过来的message不为空则无数据
                            if (message.RETURN_MSG) {
                                getData(data.data, false, message.RETURN_MSG, data.resultCode);
                            }
                            else {
                                //当前医院无记录，提示用户
/*                                if (data.data.RETURN_INFO) {
                                    KyeeMessageService.broadcast({
                                        content: data.data.RETURN_INFO
                                    })
                                }*/
                                var paymentData = data.data.PAY;
                                def.roundTip = data.data.CLINIC_TOTAL_FEE_INFO;//支付金额是否准确提示 KYEEAPPC-4673 程铄闵
                                for (var i = 0; i < paymentData.length; i++) {
                                    paymentData[i].PAYMENT_INFO = JSON.parse(paymentData[i].PAYMENT_INFO);
                                }
                                getData(data.data, true);
                            }
                        } else {
                            def.tips = undefined;//底部提示信息
                            var resultModel = data;
                            if (resultModel.message) {
                                var array = resultModel.message.split('|');
                                //功能暂未开放
                                if (array[1] != undefined) {
                                    getData(data.data, false, array[1], resultModel.resultCode);
                                    return;
                                }
                                else {
                                    getData(data.data, false, resultModel.message, resultModel.resultCode);
                                    return;
                                }
                            }
                        }
                    },
                    onError: function () {
                    }
                })
            },
            //查询医保支付状态
            loadPreSettlement: function (getData, serialNo,v_date,p_attr) {
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
                                content: KyeeI18nService.get("clinicPayment.payStatus","结算成功。")
                            });
                        }
                    },
                    onError: function () {
                    }
                })
            },
            //获取订单
            PaymentGetOrder: function (getData, paymentData, IS_MS_PAY) {
                var me = this;
                var total = paymentData.TOTAL;
                var seriesNos = [];
                var visitDate = [];
                var prescAttr = [];
                //分组信息
                var checkedItems = [];
                if (paymentData.CHOOSE_MODEL == '2') {
                    //如果为全选
                    checkedItems = paymentData.PAYMENT_INFO;
                } else {
                    //如果为多选或单选
                    for (var i = 0; i < paymentData.PAYMENT_INFO.length; i++) {
                        //选中的
                        if (paymentData.PAYMENT_INFO[i].checked) {
                            checkedItems.push(paymentData.PAYMENT_INFO[i]);
                        }
                    }
                }
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
                            var markDescName = KyeeI18nService.get("clinicPayment.markDescName","缴费单");
                            var payData = {
                                'hospitalID': me.hospitalId,
                                'MARK_DESC': me.memoryCache.get('currentCustomPatient').OFTEN_NAME + '-'+markDescName,
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
                                'PATIENT_ID':paymentData.PAYMENT_INFO[0].PATIENT_ID,
                                'TOTAL': paymentData.TOTAL

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
                            paydata["ROUTER"] = "clinicPayment";
                            paydata["REMAIN_SECONDS"] = data.REMAIN_SECONDS;
                            paydata["flag"] = 3;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费
                            paydata["isShow"] = data.isShow;
                            paydata["IS_OPEN_BALANCE"] = data.IS_OPEN_BALANCE;
                            paydata["USER_PAY_AMOUNT"] = data.USER_PAY_AMOUNT;
                            paydata["C_REG_ID"] = params.cRegId;
                            paydata["hospitalID"] = paydata.HOSPITAL_ID;
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
                            paydata["ROUTER"] = "clinicPayment";
                            paydata["REMAIN_SECONDS"] = data.REMAIN_SECONDS;
                            paydata["flag"] = 4;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费 4挂号缴费
                            paydata["isShow"] = data.isShow;
                            paydata["IS_OPEN_BALANCE"] = data.IS_OPEN_BALANCE;
                            paydata["USER_PAY_AMOUNT"] = data.USER_PAY_AMOUNT;
                            paydata["C_REG_ID"] = appointDetil.C_REG_ID;
                            paydata["hospitalID"] = paydata.HOSPITAL_ID;
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
        deleteClinicPayment: function (getData,REG_ID) {
            HttpServiceBus.connect({
                url: "payment/action/PaymentActionC.jspx",
                params: {
                    PRIMARY_KEY: REG_ID,
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