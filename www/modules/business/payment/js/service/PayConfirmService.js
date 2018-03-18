/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2016年1月19日15:48:47
 * 创建原因：确认支付服务
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.payConfirm.service")
    .type("service")
    .name("PayConfirmService")
    .params(["HttpServiceBus", "CacheServiceBus", "BoZhouLoginService", "KyeeMessageService", "RsaUtilService","KyeeI18nService"])
    .action(function (HttpServiceBus, CacheServiceBus, BoZhouLoginService, KyeeMessageService, RsaUtilService,KyeeI18nService) {
        var def = {
            //应支付的金额
            AMOUNT: '',
            //支付订单所在的医院ID
            HOSPITAL_ID: '',
            //支付订单号
            TRADE_NO: '',
            //支付卡列表
            CARD_LIST: '',
            //获取短信验证码
            getMsgCode: function (onSuccess,cardInfo) {
                var me = this;
                var phoneNo = BoZhouLoginService.phoneNumber;
                //翻转电话号码
                var ResPhoneNo = "";
                for (var i = 0; i < phoneNo.length; i++) {
                    ResPhoneNo += phoneNo.charAt(phoneNo.length - i - 1);
                }
                HttpServiceBus.connect({
                    url: "/apppay/action/PayActionC.jspx",
                    params: {
                        hospitalID: me.HOSPITAL_ID,
                        userNo: BoZhouLoginService.objectid,
                        messageType: '2',
                        PHONE_NUMBER: cardInfo.mobile?cardInfo.mobile:RsaUtilService.getRsaResult(ResPhoneNo),
                        USER_NAME: BoZhouLoginService.name,
                        modId: '10001',
                        op: "sendRegCheckCodeActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }

                    },
                    onError: function () {
                    }
                })
            },
            //点击支付
            paySubmit: function (onSuccess, msgCode, pswd, cardInfo) {
                var me = this;
                var phoneNo = BoZhouLoginService.phoneNumber;
                var cardAmt = '';
                var balanceAmt = '';
                var payTypeYd = '';
                if (cardInfo.mobile) {//卡支付
                    payTypeYd = '01';
                    cardAmt = me.AMOUNT;
                } else {
                    payTypeYd = '02';
                    //余额支付
                    balanceAmt = me.AMOUNT;
                }
                //翻转电话号码
                var ResPhoneNo = "";
                for (var i = 0; i < phoneNo.length; i++) {
                    ResPhoneNo += phoneNo.charAt(phoneNo.length - i - 1);
                }
                HttpServiceBus.connect({
                    url: "/apppay/action/PayActionC.jspx",
                    params: {
                        hospitalId: me.HOSPITAL_ID,
                        userNo: BoZhouLoginService.objectid,
                        totalAmt: me.AMOUNT,
                        out_trade_no: me.TRADE_NO,
                        PHONE_NUMBER: cardInfo.mobile?cardInfo.mobile:RsaUtilService.getRsaResult(ResPhoneNo),
                        MSG_CODE: msgCode,
                        cardAmt: cardAmt,
                        balanceAmt: balanceAmt,
                        paySecurt: RsaUtilService.getRsaResult(pswd),
                        businessType: 'APP',
                        payType: payTypeYd,
                        cardNo: cardInfo.cardNo ? RsaUtilService.getRsaResult(cardInfo.cardNo) : "",
                        areaCode: '',
                        op: "ydpay"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(true);
                        } else {
                            onSuccess(false);
                            if(data.message){
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }else if(data.data){
                                KyeeMessageService.broadcast({
                                    content: data.data
                                });
                            }else {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("payConfirm.payFail","支付失败")
                                });
                            }
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