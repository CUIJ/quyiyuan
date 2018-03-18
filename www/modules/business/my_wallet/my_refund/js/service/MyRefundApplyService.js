/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年8月20日
 * 创建原因：申请退款页面Service
 * 修改者：程铄闵
 * 修改时间：2015年10月17日13:24:46
 * 修改原因：2.0.80版本需求修改
 * 任务号：KYEEAPPC-3596
 */
new KyeeModule()
    .group("kyee.quyiyuan.myRefundApply.service")
    .type("service")
    .name("MyRefundApplyService")
    .params([
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeMessageService",
        "KyeeI18nService"
    ])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService,KyeeI18nService) {

        var def = {
            //申请退费信息
            applyInfo: undefined,
            //从哪个页面进入申请退费
            from:'',
            //申请退费
            refundApply: function (getData, data) {
                //var storageCache = CacheServiceBus.getStorageCache();
                var type = def.applyInfo.PAYMENT_TYPE;
                var modelCode = def.applyInfo.MODEL_CODE;
                HttpServiceBus.connect({
                    url: "payment/action/ReturnActionC.jspx",
                    params: {
                        op: 'saveReturnMoney',
                        //HOSPITAL_ID: storageCache.get('hospitalInfo').id,
                        postdata: JSON.stringify(data),
                        PAYMENT_TYPE:type,
                        MODEL_CODE:modelCode,
                        TYPE:this.applyInfo.TYPE
                    },
                    onSuccess: function (data) {
                        KyeeMessageService.broadcast({
                            content: data.message
                        });
                        getData();
                    },
                    onError: function () {
                    }
                });
            },
            //检测数据是否合法
            checkData: function (getData, data) {
                var name = data.USER_NAME;
                var bankNum = data.USER_BANK_LASTCARD;
                var phoneNum = data.USER_PHONE_NUMBER;
                if (name == "" || name == null) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("refund_apply.checkName","姓名不能为空！") //KYEEAPPC-3800 国际化翻译 by 程铄闵
                    });
                    return;
                } else if (bankNum == "" || bankNum == null) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("refund_apply.checkCardNull","银行卡号不能为空！") //KYEEAPPC-3800 国际化翻译 by 程铄闵
                    });
                    return;
                } else if (!this.checkCardNo(bankNum)) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("refund_apply.checkCard","银行卡号错误，请重新输入！") //KYEEAPPC-3800 国际化翻译 by 程铄闵
                    });
                    return;
                } else if (phoneNum == "" || phoneNum == null) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("refund_apply.checkPhoneNull","手机号不能为空！") //KYEEAPPC-3800 国际化翻译 by 程铄闵
                    });
                    return;
                } else if (phoneNum.length != 11) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("refund_apply.checkPhoneLen","手机号长度输入错误，请重新输入！") //KYEEAPPC-3800 国际化翻译 by 程铄闵
                    });
                    return;
                } else if (!this.checkPhoneNo(phoneNum)) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("refund_apply.checkPhone","手机号格式错误！") //KYEEAPPC-3800 国际化翻译 by 程铄闵
                    });
                    return;
                }
                //检验通过
                this.refundApply(getData, data);
            },
            //检验银行卡
            checkCardNo: function (cardNo) {
                var patrn = /^\d{4}$/;
                if (!patrn.test(cardNo)) {
                    return false;
                }
                return true;
            },
            //校验联系方式
            checkPhoneNo: function (phoneNo) {
                var patrn = /^1[3|4|5|7|8]\d{9}$/;
                if (!patrn.test(phoneNo)) {
                    return false;
                }
                return true;
            }
        };

        return def;
    })
    .build();