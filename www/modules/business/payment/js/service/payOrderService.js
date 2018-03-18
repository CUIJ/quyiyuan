/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月10日14:41:28
 * 创建原因：支付订单服务
 * 修改者：程铄闵
 * 修改原因：点支付按钮时增加遮罩
 * 任务号：KYEEAPPTEST-3078
 * 修改者：程铄闵
 * 修改时间：2015年11月10日21:36:27
 * 修改原因：国际化翻译
 * 任务号：KYEEAPPC-3800
 * 修改者：程铄闵
 * 修改时间：2015年11月25日17:54:50
 * 修改原因：1.微信支付完成后的回调优化（仅在支付失败时发请求查询）；2.增加趣医微信公众号支付方式
 * 任务号：KYEEAPPC-4263
 * 修改者：程铄闵
 * 修改时间：2015年11月26日11:33:40
 * 修改原因：待缴费2.1.0优化
 * 任务号：KYEEAPPC-4102
 * 修改者：张婧
 * 修改时间：2015年12月15日15:26:08
 * 修改原因：前端console.log日志整改
 * 任务号：KYEEAPPC-4437
 */
new KyeeModule()
    .group("kyee.quyiyuan.payOrder.service")
    .type("service")
    .name("PayOrderService")
    .params([
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeePayService",
        "KyeeMessageService",
        "Md5UtilService",
        "WebPayService",
        "KyeeEnv",
        "RsaUtilService",
        "KyeeI18nService",
        "PayConfirmService",
        "BoZhouLoginService",
        "WXPublicCodeService",
        "$timeout",
        "KyeeEnv",
        "$location"
    ])
    .action(function (HttpServiceBus, CacheServiceBus, KyeePayService, KyeeMessageService, Md5UtilService,
                      WebPayService, KyeeEnv, RsaUtilService,KyeeI18nService, PayConfirmService,BoZhouLoginService,
                      WXPublicCodeService,$timeout,KyeeEnv,$location) {
        var def = {
            allPayType: [],
            hospitalId: undefined,
            //全局参数
            memoryCache: CacheServiceBus.getMemoryCache(),
            //缓存数据
            storageCache: CacheServiceBus.getStorageCache(),
            //用户输入的短信验证码
            msgCode: undefined,
            IS_OPEN_BALANCE: '',
            //上一页传过来的数据
            payData: undefined,
            //免挂号费短信验证
            VerifyMsgForFree: undefined,
            //预交金短信验证
            prefee: undefined,
            //预约挂号声明
            registExplain: undefined,
            //电话类型
            phoneFlag: undefined,
            //点击支付，完成后返回上一页
            backToLastPage: undefined,
            //手机号
            phoneNum: '',
            //his手机号
            hisPhone:'',
            //非趣医订单页面延迟时间
            delayTime:undefined,
            //上一笔订单信息
            lastPayData:undefined,
            //进入充值订单页标记
            fromRechargeOrder:false,
            //支付方式
            payTypes:[],
            fromPayOrderNew: false,
            //绑定支付方式
            isHealthCard:false,
            //是否选择了电子健康卡进行业务
            bindPayType: function (getData) {
                var businessType = '';
                var router = this.payData.ROUTER;
                var cardNo = this.payData.CARD_NO;
                var cardType = this.payData.CARD_TYPE;//KYEEAPPC-7818
                var businessType = this.getBusinessType(this.payData);
                if (this.payData.flag) {
                    cardNo = this.payData.CARD_NO;
                    if (cardNo == '') {
                        //表示申请新卡预约挂号
                        cardNo = -1;
                    }else{
                        //后台自己查询卡号
                        cardNo = '';
                    }
                }
                var me = this;
                var hospitalId = this.getHospitalId();
                var IS_ELECTRONIC_HEALTH_CARD = 0;
                if(this.isHealthCard){
                    IS_ELECTRONIC_HEALTH_CARD = 1;
                    this.isHealthCard = false;
                }else {
                    IS_ELECTRONIC_HEALTH_CARD = 0;
                }
                var FEE_TYPE = this.payData.FEE_TYPE;
                if(FEE_TYPE && FEE_TYPE==1) {
                    HttpServiceBus.connect({
                        url: "/payment/action/PaymentActionC.jspx",
                        params: {
                            op: "getPayMethodForSuffCircle",
                            hospitalId: hospitalId,  //该医院的hospitalId
                            modeCode: "10",  	//10-付费咨询
                            orderNo: this.payData.TRADE_NO		//订单号
                        },
                        onSuccess: function(response){
                            if (response.success) {
                                //获取payment_prompt参数，如果不为空则弹框提示
                                def.paymentPrompt = "";//是否支持退费提示
                                var paytype = [];
                                var payStyle = response.data.payStyle;
                                paytype = (typeof payStyle === 'string') ? JSON.parse(payStyle): (Array.isArray(payStyle) ? payStyle : []);


                                if (me.payData.isShow == '1') {
                                    //免挂号费时，屏蔽其他支付方式  By  章剑飞  KYEEAPPC-2866
                                    var rebate = KyeeI18nService.get("payOrder.rebate", "免挂号费");
                                    paytype = [{ITEM_VALUE: '6', ITEM_NAME: rebate}];
                                }
                                var payType_inUse = [];
                                if (paytype != null) {
                                    //begin  创建支付方式列表项  By  章剑飞  KYEEAPPC-1362
                                    for (var i = 0; i < paytype.length; i++) {
                                        //获取支付方式图片
                                        var payImg = me.payImage(paytype[i].ITEM_VALUE);
                                        paytype[i].IMAGE = payImg;
                                        //版本过低导致无此支付方式
                                        if (payImg == '0') {
                                            continue;
                                        }
                                        //就诊卡充值不支持预交金
                                        if (me.payData.PATIENT_RECHARGE && paytype[i].ITEM_VALUE == '3') {
                                            continue;
                                        }
                                        payType_inUse.push(paytype[i]);
                                    }
                                    var changePay = response.data.changePay;//零钱支付金额
                                    var paymentExplain = "";//底部支付提示语
                                    var isQyPayOrder = "";//是否显示趣医支付订单

                                    def.payTypes = payType_inUse;//增加平台编码 程铄闵 KYEEAPPC-7818

                                    typeof getData === 'function' && getData(true, changePay, payType_inUse, paymentExplain, isQyPayOrder);
                                }
                            } else {
                                getData(false);//此请求回调后调请求医院参数 程铄闵 KYEEAPPC-4605
                                KyeeMessageService.broadcast({
                                    content: response.message
                                });
                            }
                        },
                        onError: function(error){

                        }
                    });
                }else{
                    HttpServiceBus.connect({
                        url: "payment/action/PaymentActionC.jspx",
                        params: {
                            publicServiceType: this.memoryCache.get('currentUserPublicServerType'),
                            hospitalID: hospitalId,
                            userSource: this.memoryCache.get('currentUserSource'),
                            CARD_NO: cardNo,
                            CARD_TYPE: cardType,
                            IS_SHOW: me.payData.isShow,
                            BUSINESSPAYTYPE: businessType,
                            MASTER_ID: this.payData.MASTER_ID,
                            TRADE_NO: this.payData.TRADE_NO,
                            PRE_PAY_MARK: me.payData.PRE_PAY_MARK,  //抢号预付费标识;1表示是预付费数据
                            op: "getPaymentMethod",
                            KYEE_HOSPITAL:me.payData.KYEE_HOSPITAL,
                            IS_ELECTRONIC_HEALTH_CARD: IS_ELECTRONIC_HEALTH_CARD   //是否选择了电子健康卡进行业务
                        },
                        onSuccess: function (data) {
                            if (data.success) {
                                //获取payment_prompt参数，如果不为空则弹框提示
                                def.paymentPrompt = data.data.paymentPrompt;//是否支持退费提示
                                var paytype = [];
                                if (data.data.payStyle) {
                                    paytype = JSON.parse(data.data.payStyle);
                                }

                                if (me.payData.isShow == '1') {
                                    //免挂号费时，屏蔽其他支付方式  By  章剑飞  KYEEAPPC-2866
                                    var rebate = KyeeI18nService.get("payOrder.rebate", "免挂号费");
                                    paytype = [{ITEM_VALUE: '6', ITEM_NAME: rebate}];
                                }
                                var payType_inUse = [];
                                if (paytype != null) {
                                    //begin  创建支付方式列表项  By  章剑飞  KYEEAPPC-1362
                                    for (var i = 0; i < paytype.length; i++) {
                                        //获取支付方式图片
                                        var payImg = me.payImage(paytype[i].ITEM_VALUE);
                                        paytype[i].IMAGE = payImg;
                                        //版本过低导致无此支付方式
                                        if (payImg == '0') {
                                            continue;
                                        }
                                        //就诊卡充值不支持预交金
                                        if (me.payData.PATIENT_RECHARGE && paytype[i].ITEM_VALUE == '3') {
                                            continue;
                                        }
                                        payType_inUse.push(paytype[i]);
                                    }
                                    var changePay = data.data.changePay;//零钱支付金额
                                    var paymentExplain = data.data.paymentExplain;//底部支付提示语
                                    var isQyPayOrder = data.data.IS_ENABLE_AUTO_SKIP_PAY_PAGE;//是否显示趣医支付订单

                                    def.payTypes = payType_inUse;//增加平台编码 程铄闵 KYEEAPPC-7818

                                    getData(true, changePay, payType_inUse, paymentExplain, isQyPayOrder);//KYEEAPPC-4996 程铄闵 门诊住院和就诊卡充值支付页面提示语
                                }
                            }
                            else {
                                getData(false);//此请求回调后调请求医院参数 程铄闵 KYEEAPPC-4605
                                if (data.message && data.alertType == 'ALERT') {
                                    KyeeMessageService.broadcast({
                                        content: data.message
                                    });
                                }
                            }
                        },
                        onError: function () {
                        }
                    })
                }
            },
            //获取支付方式图片
            payImage: function (payType) {
                var payImg = '';
                if (payType == '0' || payType == '28' || payType == '36' || payType == '38' || payType == '39' || payType == '40'||payType == '49') {     //支付宝支付
                    payImg = 'resource/images/payment/zfb_15.png';
                } else if (payType == '1') {        //银联支付
                    payImg = 'resource/images/payment/zgyl_11.png';
                } else if (payType == '2' || payType == '26') {        //微信支付
                    payImg = 'resource/images/payment/wxzf.png';
                } else if (payType == '3') {       //预交金支付
                    payImg = 'resource/images/payment/yjjzf_21.png';
                } else if (payType == '4') {        //全民支付
                    payImg = 'resource/images/payment/qmf_21.png';
                } else if (payType == '5') {        //交行支付
                    payImg = 'resource/images/payment/jtyh_19.png';
                } else if (payType == '6') {        //免挂号费
                    payImg = 'resource/images/payment/mghfzf_07.png';
                } else if (payType == '7') {        //微信网页支付
                    payImg = 'resource/images/payment/wxwyzf_03.png';
                } else if (payType == '8') {        //趣医支付
                    payImg = 'resource/images/payment/zgyl_11.png';
                } else if (payType == '10') {      //汉口银行
                    payImg = 'resource/images/payment/hkyh_03.png';
                } else if (payType == '11') {        //工行支付
                    payImg = 'resource/images/payment/ghzf_07.png';
                } else if (payType == '12') {       //全民付网页版
                    payImg = 'resource/images/payment/qmf_21.png';
                    //} else if (payType == '13') {       //通联支付
                    //    payImg = 'resource/images/payment/tlzf_13.png';
                    //} else if (payType == '14') {       //快捷支付
                    //    payImg = 'resource/images/payment/qmf_21.png';
                } else if (payType == '15') {        //趣医微信支付
                    payImg = 'resource/images/payment/wxzf.png';
                } else if (payType == '16') {        //药都银行支付
                    payImg = 'resource/images/payment/yd_16.png';
                } else if (payType == '19' || payType == '27') {       //趣医微信公众号支付||京颐微信公众号
                    payImg = 'resource/images/payment/wxzf_21.png';
                } else if (payType == '21') {        //趣医银联网页支付
                    payImg = 'resource/images/payment/zgyl_11.png';
                } else if (payType == '22') {        //湘雅三院专用支付
                    payImg = 'resource/images/payment/xyszy.png';
                } else if (payType == '24') {        //交大一附院支付
                    payImg = 'resource/images/payment/zfb_15.png';
                } else if (payType == '25') {        //健康卡支付
                    payImg = 'resource/images/payment/jkkzf.png';
                } else if (payType == '30') {        //综合支付银联支付
                    payImg = 'resource/images/payment/zgyl_11.png';
                } else if (payType == '31') {        //综合支付银联web支付
                    payImg = 'resource/images/payment/zgyl_11.png';
                } else if (payType == '32') {        //综合支付微信支付
                    payImg = 'resource/images/payment/wxzf.png';
                } else if (payType == '33') {        //综合支付微信公众号支付
                    payImg = 'resource/images/payment/wxzf_21.png';
                }else if (payType == '34') {        //银川支付微信支付
                    payImg = 'resource/images/payment/wxzf.png';
                } else if (payType == '35') {        //银川支付微信公众号支付
                    payImg = 'resource/images/payment/wxzf_21.png';
                } else if (payType == '45') {        //皖南中信支付
                    payImg = 'resource/images/payment/wxzf_21.png';
                } else if(payType == '48'){//一卡通电子健康卡微信网页支付
                    payImg = 'resource/images/payment/wxwyzf_03.png';
                }else {
                        //版本过低导致无此支付方式
                        payImg = '0'
                    };
                return payImg;
            },
            //获取医院参数
            loadParams: function (getData) {
                var me = this;
                var hospitalId = this.getHospitalId();
                HttpServiceBus.connect({
                    url: "hospitalInform/action/HospitalinforActionC.jspx",
                    params: {
                        op: 'queryHospitalParam',
                        hospitalId: hospitalId,
                        paramName: 'prefee,phoneFlag,registExplain,VerifyMsgForFree'
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            me.VerifyMsgForFree = data.data.VerifyMsgForFree;
                            me.prefee = data.data.prefee;
                            me.registExplain = data.data.registExplain;
                            me.phoneFlag = data.data.phoneFlag;
                            getData(me.registExplain, me.prefee, me.VerifyMsgForFree, me.phoneFlag);
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //提交订单
            paySubmit: function (backToLastPage, payType, msgCode, $state) {
                this.backToLastPage = backToLastPage;
                this.msgCode = msgCode;
                var tradeNo = this.payData.TRADE_NO;
                var hospitalID = this.getHospitalId();
                var productDesc = this.payData.MARK_DETAIL;
                var payamount = this.payData.AMOUNT.toString();
                //标识0元可挂号
                var flagZeroRegist = false;
                if (this.payData.IS_OPEN_BALANCE == 'success') {
                    //@start KYEEAPP-1047       2014年11月27日22:57:58
                    payamount = this.payData.USER_PAY_AMOUNT;
                }
                if (payamount == 0) {
                    flagZeroRegist = true;
                }
                var userId = this.memoryCache.get("currentUserRecord").USER_ID;
                var productName = this.payData.MARK_DESC;
                var paymentType = payType;
                var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                var publicServiceType = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE);
                var currentUserSource = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
                var params = new Array(tradeNo, productName, productDesc, payamount, paymentType, hospitalID, userId,publicServiceType,currentUserSource);
                if (flagZeroRegist) {
                    // 支持0元挂号
                    this.requestNoRegistAmount(tradeNo, paymentType, this.payData.flag);
                } else {
                    if($state.currentPayType != '3' &&  $state.currentPayType != '6'
                        && (this.payData.flag=='1' ||  this.payData.flag=='2' || this.payData.flag=='3')
                        &&this.payData.PRE_PAY_MARK!='1'){//抢号预缴费，不更新预约挂号状态
                        //支付时更新预约挂号业务状态为支付中
                        this.afterPay();
                    }
                    this.paymentSubmit(payType, tradeNo, payamount, params, $state);
                }
            },
            //支付
            paymentSubmit: function (payType, tradeNo, payamount, params, $state) {
                this.phoneNum = this.memoryCache.get("currentUserRecord").PHONE_NUMBER;
                if (this.phoneFlag == '1') {
                    //this.phoneNum = this.memoryCache.get("currentCardInfo").PHONE;
                    this.phoneNum = this.hisPhone;
                }
                var me = this;
                var pageData = this.payData;
                pageData.PAY_TYPE = $state.currentPayType;
                var hospitalId = this.getHospitalId();
                KyeeMessageService.loading({
                    mask: true
                });//增加遮罩
                if (payType == '0' || payType == '28'  || payType == '36' ) {
                    //支付宝支付 京颐支付宝支付-28 综合支付支付宝支付-36
                    if (KyeeEnv.PLATFORM != 'android' && KyeeEnv.PLATFORM != "ios") {
                        KyeeMessageService.hideLoading();//取消遮罩
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("payOrder.platformTip","网页暂不支持此支付方式，请下载趣医院客户端！")
                        });
                        return;
                    }
                    params[4] = this.convertPayType(pageData,payType);//增加平台编码 程铄闵 KYEEAPPC-7818; KYEEAPPTEST-3886 修改支付类型
                    KyeePayService.pay(
                        "alipay",
                        function (info) {
                            //支付后先查询
                            me.checkResult(hospitalId, pageData, tradeNo, payType,true);
                        },
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,false);
                            KyeeLogger.error("thr error is: " + info);
                        },
                        params
                    );
                }
                else if (payType == '1') {
                    //银联支付
                    if (KyeeEnv.PLATFORM != 'android' && KyeeEnv.PLATFORM != "ios") {
                        KyeeMessageService.hideLoading();//取消遮罩
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("payOrder.platformTip","网页暂不支持此支付方式，请下载趣医院客户端！")
                        });
                        return;
                    }
                    params[4] = this.convertPayType(pageData,payType);//增加平台编码 程铄闵 KYEEAPPC-7818; KYEEAPPTEST-3886 修改支付类型
                    KyeePayService.pay(
                        "uppay",
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,true);
                        },
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,false);
                            KyeeLogger.error("thr error is: " + info);
                        },
                        params
                    );
                }
                else if (payType == '2' || payType == '15' || payType=='34' || payType=='26') {
                    //微信支付-2 ；趣医微信支付-15 京颐微信支付-26  银川支付微信公众号支付-34
                    if (KyeeEnv.PLATFORM != 'android' && KyeeEnv.PLATFORM != "ios") {
                        KyeeMessageService.hideLoading();//取消遮罩
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("payOrder.platformTip","网页暂不支持此支付方式，请下载趣医院客户端！")
                        });
                        return;
                    }
                    params[4] = this.convertPayType(pageData,payType);//增加平台编码 程铄闵 KYEEAPPC-7818; KYEEAPPTEST-3886 修改支付类型
                    KyeePayService.pay(
                        "wxpay",
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,true);
                        },
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,false);
                            KyeeLogger.error("thr error is: " + info);
                        },
                        params
                    );
                }
                else if (payType == '3') {
                    //预交金支付
                    KyeeMessageService.hideLoading();//取消遮罩
                    if (pageData.flag == '3') { //预约支付
                        this.appointPrepaidPay(tradeNo);
                    } else if (pageData.flag != undefined) { //预约转挂号或挂号支付
                        this.prepaidPay(tradeNo);
                    } else {  //普通支付
                        this.prePayFee(tradeNo, pageData.PAY_TYPE, pageData.PRESC_ATTR, pageData.ITEM_CLASS);
                    }
                }
                else if (payType == '4') {
                    //全民付
                    if (KyeeEnv.PLATFORM != 'android') {
                        KyeeMessageService.hideLoading();//取消遮罩
                        if (KyeeEnv.PLATFORM == "ios") {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("payOrder.platformIosTip","IOS暂不支持此支付方式！")
                            });
                        } else {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("payOrder.platformTip","网页暂不支持此支付方式，请下载趣医院客户端！")
                            });
                        }
                        return;
                    }
                    //全民付插件版仅支持安卓
                    KyeePayService.pay(
                        "umspay",
                        function (info) {
                            /*                            if (pageData.flag == undefined) {
                             //普通支付完成
                             me.normalPaymentSuccess(pageData);
                             } else {
                             //预约挂号支付完成
                             me.paymentSuccess(pageData, tradeNo);
                             }*/
                            me.checkResult(hospitalId, pageData, tradeNo, payType,true);//csm
                        },
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,false);//csm
                            KyeeLogger.error("thr error is: " + info);
                        },
                        params
                    );
                }
                else if (payType == '5') {
                    //交行支付插件版仅支持安卓
                    if (KyeeEnv.PLATFORM != 'android' && KyeeEnv.PLATFORM != "ios") {
                        KyeeMessageService.hideLoading();//取消遮罩
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("payOrder.platformTip","网页暂不支持此支付方式，请下载趣医院客户端！")
                        });
                        return;
                    }
                    if (KyeeEnv.PLATFORM != 'android') {
                        KyeeMessageService.hideLoading();//取消遮罩
                        //通用网页支付支付链接
                        WebPayService.url = AppConfig.SERVER_URL + 'webPayment/submitForm.jsp?'
                            + 'TRADE_NO=' + tradeNo + '&AMOUNT=' + payamount + '&TRANS_CODE=01&PAY_TYPE=' + payType;
                        //跳转支付网页
                        $state.go('webPay');
                        return;
                    }
                    KyeePayService.pay(
                        "bocom",
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,true);//csm
                        },
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,false);//csm
                            KyeeLogger.error("thr error is: " + info);
                        },
                        params
                    );
                }
                else if (payType == '6') {
                    //免挂号费支付
                    KyeeMessageService.hideLoading();//取消遮罩
                    if (pageData.flag == '3') {
                        this.appointForFree(tradeNo);
                    } else {
                        this.registForFree(tradeNo);
                    }
                }
                else if (payType == '7'||payType == '19' || payType=='35' || payType=='27' || payType=='45' || payType == '48'){
                    //微信网页支付 -7     趣医微信公众号支付 -19  京颐微信公众号 -27 银川支付微信公众号支付 -35
                    KyeeMessageService.hideLoading();//取消遮罩
                    //传参--openid 程铄闵 KYEEAPPC-5231 微信网页支付增加传入openId参数
                    var cache = CacheServiceBus.getMemoryCache();
                    var openId;
                    openId = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.WX_OPEN_ID);
                    if(payType == '7'&&(openId==undefined||openId=='')&&WXPublicCodeService.openIdNullTip){
                        KyeeMessageService.broadcast({
                            content: WXPublicCodeService.openIdNullTip
                        });
                        return;
                    }
                    if(payType == '35'&&(openId==undefined||openId=='')&&WXPublicCodeService.openIdNullTip){
                        KyeeMessageService.broadcast({
                            content: WXPublicCodeService.openIdNullTip
                        });
                        return;
                    }
                    var payTypePlus = this.convertPayType(pageData,payType);//增加平台编码 程铄闵 KYEEAPPC-7818; KYEEAPPTEST-3886 修改支付类型
                    HttpServiceBus.connect({
                        url: "apppay/action/PayActionC.jspx",
                        params: {
                            op: "wxWebPay",
                            out_trade_no: tradeNo,
                            AMOUNT: payamount,
                            paymentType:payTypePlus,
                            openId:openId
                        },
                        /* url: "payment/action/PaymentActionC.jspx",
                         params: {
                         op: "wxWebPay",
                         out_trade_no: tradeNo,
                         AMOUNT: payamount,
                         paymentType:payType
                         },*/
                        onSuccess: function (data) {
                            if (data.success) {
                                var result = data.data;
                                wx.config({
                                    debug: false,
                                    appId: result.appId, // 必填，公众号的唯一标识
                                    timestamp: result.timeStamp, // 必填，生成签名的时间戳
                                    nonceStr: result.nonceStr, // 必填，生成签名的随机串
                                    signature: result.paySign,// 必填，签名，见附录1
                                    jsApiList: ['chooseWXPay'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                                });

                                wx.ready(function(){
                                    wx.chooseWXPay({
                                        timestamp: result.timeStamp, // 支付签名时间戳
                                        nonceStr: result.nonceStr, // 支付签名随机串，不长于 32 位
                                        package: result.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                                        signType: result.signType, // 签名方式
                                        paySign: result.paySign, // 支付签名
                                        complete: function (res) {// 支付成功后的回调函数
                                            //if (res.err_msg == "get_brand_wcpay_request:ok") {
                                            if (res.errMsg == "chooseWXPay:ok") {
                                                if (pageData.flag == undefined) {
                                                    //普通支付完成
                                                    me.normalPaymentSuccess(pageData);
                                                } else {
                                                    //预约挂号支付完成
                                                    me.paymentSuccess(pageData, tradeNo);
                                                }
                                            }
                                        }
                                    });
                                });
                            } else {
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }

                        },
                        onError: function () {
                        }
                    });
                }
                else if (payType == '8') {
                    //趣医支付
                    if (KyeeEnv.PLATFORM != 'android' && KyeeEnv.PLATFORM != "ios") {
                        KyeeMessageService.hideLoading();//取消遮罩
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("payOrder.platformTip","网页暂不支持此支付方式，请下载趣医院客户端！")
                        });
                        return;
                    }
                    params[4] = this.convertPayType(pageData,payType);//增加平台编码 程铄闵 KYEEAPPC-7818; KYEEAPPTEST-3886 修改支付类型
                    KyeePayService.pay(
                        "qypay",
                        function (info) {
                            //支付后先查询
                            me.checkResult(hospitalId, pageData, tradeNo, payType,true);
                        },
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,false);
                            KyeeLogger.error("thr error is: " + info);
                        },
                        params
                    );
                }
                //统一所有支付方式页面的缓冲样式 KYEEAPPC-5701 程铄闵
                else if(payType == '10'||payType == '12'  || payType == '29'){
                    //汉口银行 -10  全民付网页版 -12  京颐支付宝WEB-29
                    HttpServiceBus.connect({
                        url: "apppay/action/PayActionC.jspx",
                        params: {
                            op: 'payHandle',
                            TRADE_NO: tradeNo,
                            AMOUNT:payamount,
                            TRANS_CODE: '01',
                            PAY_TYPE:payType
                        },
                        onSuccess: function (data) {
                            if(data.success){
                                WebPayService.payType = payType;
                                KyeeMessageService.hideLoading();//取消遮罩
                                var url;
                                var params='';
                                var rec = data.data;
                                if(rec){
                                    for (var i = 0; i < rec.length; i++) {
                                        if(rec[i].name == 'PAYMENT_URL'){
                                            url = rec[i].value;
                                        }else{
                                            if(params==''){
                                                params = '?';
                                            }
                                            params = params.concat(rec[i].name).concat('=').concat(rec[i].value).concat('&');
                                        }
                                    }
                                    params = params.substring(0,params.length-1);
                                    WebPayService.url = url+params;

                                    //跳转支付网页
                                    $state.go('webPay');
                                }
                                else{
                                    //获取信息时报，弹出提示框
                                    KyeeMessageService.broadcast({
                                        content: data.message
                                    });
                                }
                            }
                            else{
                                //支付失败,弹出提示框
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        },
                        onError: function () {
                        }
                    });
                }
                else if (payType == '13') {
                    //通联移动支付
                    if (KyeeEnv.PLATFORM != 'android' && KyeeEnv.PLATFORM != "ios") {
                        KyeeMessageService.hideLoading();//取消遮罩
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("payOrder.platformTip","网页暂不支持此支付方式，请下载趣医院客户端！")
                        });
                        return;
                    }
                    KyeePayService.pay(
                        "allinpay",
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,true);//csm
                        },
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,false);//csm
                            KyeeLogger.error("thr error is: " + info);
                        },
                        params
                    );
                }
                else if (payType == '14') {
                    //快捷支付
                    if (KyeeEnv.PLATFORM != 'android') {
                        KyeeMessageService.hideLoading();//取消遮罩
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("payOrder.platformAndroidTip","此支付方式目前仅支持安卓系统！")
                        });
                        return;
                    }
                    KyeePayService.pay(
                        "quickpay",
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,true);
                        },
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,false);
                            KyeeLogger.error("thr error is: " + info);
                        },
                        params
                    );
                }
                else if (payType == '16') {
                    //药都银行
                    var userSource = this.memoryCache.get('currentUserSource');
                    if (userSource != '3') {
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("payOrder.errorType","错误的支付方式")
                        });
                        return;
                    }
                    //获取卡表
                    def.getCardList(function(data){
                        PayConfirmService.AMOUNT = payamount;
                        PayConfirmService.HOSPITAL_ID = hospitalId;
                        PayConfirmService.TRADE_NO = tradeNo;
                        PayConfirmService.CARD_INFO = data;
                        $state.go('payConfirm');
                    },payamount,tradeNo,hospitalId);
                }
                else if (payType == '20') {
                    //零钱支付
                    this.smallPay(hospitalId,tradeNo);
                }
                else if(payType == '21'){
                    var payTypePlus = this.convertPayType(pageData,payType);//KYEEAPPTEST-3886 修改支付类型 增加平台编码 程铄闵 KYEEAPPC-7818
                    //趣医银联网页支付 程铄闵 KYEEAPPC-5420
                    HttpServiceBus.connect({
                        url: "apppay/action/PayActionC.jspx",
                        params: {
                            op: 'payHandle',
                            TRADE_NO: tradeNo,
                            AMOUNT:payamount,
                            TRANS_CODE: '01',
                            PAY_TYPE:payTypePlus,
                        },
                        onSuccess: function (data) {
                            if(data.success){
                                WebPayService.payType = payType;
                                WebPayService.url = WebPayService.setUrl(data.data.html);//增加请求的框架参数 KYEEAPPC-6546
                                KyeeMessageService.hideLoading();//取消遮罩
                                //跳转支付网页
                                $state.go('webPay');
                            }
                            else{
                                //支付失败,弹出提示框
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        },
                        onError: function () {
                        }
                    });
                }
                else if(payType == '22'){
                    //湘雅三院专用支付 KYEEAPPC-5741 程铄闵
                    HttpServiceBus.connect({
                        url: "apppay/action/PayActionC.jspx",
                        params: {
                            op: 'payHandle',
                            TRADE_NO: tradeNo,
                            AMOUNT:payamount,
                            TRANS_CODE: '01',
                            PAY_TYPE:payType
                        },
                        onSuccess: function (data) {
                            if(data.success){
                                WebPayService.payType = payType;
                                WebPayService.url = data.data.PAY_URL;
                                var time = data.data.DELAY_TIME;//返回延迟时间
                                if(time && (typeof(time)=='number'||typeof(time)=='string')){
                                    WebPayService.delayTime = parseFloat(time);
                                }
                                KyeeMessageService.hideLoading();//取消遮罩
                                CacheServiceBus.getStorageCache().set("payTradeNo",tradeNo);
                                var url = location.origin;
                                var payUrl = url + "/quyiyuan/payIndex.html?url="+data.data.PAY_URL;
                                window.open(payUrl,"_self");
                                //跳转支付网页
                                //$state.go('webPay');
                            }
                            else{
                                //支付失败,弹出提示框
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        },
                        onError: function () {
                        }
                    });
                }
                else if(payType == '24'){
                    //交大一附院专用支付 程铄闵 KYEEAPPC-7176
                    HttpServiceBus.connect({
                        url: "apppay/action/PayActionC.jspx",
                        params: {
                            op: 'payHandle',
                            TRADE_NO: tradeNo,
                            AMOUNT:payamount,
                            TRANS_CODE: '01',
                            PAY_TYPE:payType
                        },
                        onSuccess: function (data) {
                            if(data.success){
                                def.delayTime = data.data.waitTime;
                                me.backToLastPage(data.data.html);
                            }
                            else{
                                //支付失败,弹出提示框
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        },
                        onError: function () {
                        }
                    });
                }
                else if(payType == '25'){
                    //健康卡支付 程铄闵 KYEEAPPC-7176
                    var me = this;
                    var businessType = me.getBusinessType(me.payData);
                    var payTypePlus = me.convertPayType(pageData,payType);//KYEEAPPTEST-3886 修改支付类型
                    var platformId = me.getPlatformId(payType);
                    HttpServiceBus.connect({
                        url: "apppay/action/PayActionC.jspx",
                        params: {
                            op: 'healthCardPay',
                            TRANS_CODE:'01',
                            hospitalID:hospitalId,
                            TRADE_ORDER_NO: tradeNo,
                            PAY_TYPE: payTypePlus,
                            BUSINESSPAYTYPE:businessType,
                            HEALTH_CARD_PLATFORM_ID:platformId
                        },
                        onSuccess: function (data) {
                            if(data.success){
                                me.backToLastPage();
                            }
                            else{
                                //支付失败,弹出提示框
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        },
                        onError: function () {
                        }
                    });
                }
                else if (payType == '30') {
                    //综合支付银联支付
                    if (KyeeEnv.PLATFORM != 'android' && KyeeEnv.PLATFORM != "ios") {
                        KyeeMessageService.hideLoading();//取消遮罩
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("payOrder.platformTip","网页暂不支持此支付方式，请下载趣医院客户端！")
                        });
                        return;
                    }
                    params[4] = this.convertPayType(pageData,payType);//增加平台编码 程铄闵 KYEEAPPC-7818; KYEEAPPTEST-3886 修改支付类型
                    KyeePayService.pay(
                        "qypay",
                        function (info) {
                            //支付后先查询
                            me.checkResult(hospitalId, pageData, tradeNo, payType,true);
                        },
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,false);
                            KyeeLogger.error("thr error is: " + info);
                        },
                        params
                    );
                }
                else if(payType == '31'){
                    var payTypePlus = this.convertPayType(pageData,payType);//KYEEAPPTEST-3886 修改支付类型 增加平台编码 程铄闵 KYEEAPPC-7818
                    //综合支付银联web支付
                    HttpServiceBus.connect({
                        url: "apppay/action/PayActionC.jspx",
                        params: {
                            op: 'payHandle',
                            TRADE_NO: tradeNo,
                            AMOUNT:payamount,
                            TRANS_CODE: '01',
                            PAY_TYPE:payTypePlus,
                        },
                        onSuccess: function (data) {
                            if(data.success){
                                WebPayService.payType = payType;
                                WebPayService.url = WebPayService.setUrl(data.data.html);//增加请求的框架参数 KYEEAPPC-6546
                                KyeeMessageService.hideLoading();//取消遮罩
                                //跳转支付网页
                                $state.go('webPay');
                            }
                            else{
                                //支付失败,弹出提示框
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        },
                        onError: function () {
                        }
                    });
                }
                else if (payType == '32') {
                    //综合支付微信支付
                    if (KyeeEnv.PLATFORM != 'android' && KyeeEnv.PLATFORM != "ios") {
                        KyeeMessageService.hideLoading();//取消遮罩
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("payOrder.platformTip","网页暂不支持此支付方式，请下载趣医院客户端！")
                        });
                        return;
                    }
                    params[4] = this.convertPayType(pageData,payType);//增加平台编码 程铄闵 KYEEAPPC-7818; KYEEAPPTEST-3886 修改支付类型
                    KyeePayService.pay(
                        "wxpay",
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,true);
                        },
                        function (info) {
                            me.checkResult(hospitalId, pageData, tradeNo, payType,false);
                            KyeeLogger.error("thr error is: " + info);
                        },
                        params
                    );
                }
                else if (payType == '33') {
                    //综合支付微信公众号支付
                    KyeeMessageService.hideLoading();//取消遮罩
                    //传参--openid 程铄闵 KYEEAPPC-5231 微信网页支付增加传入openId参数
                    var cache = CacheServiceBus.getMemoryCache();
                    var openId;
                    openId = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.WX_OPEN_ID);
                    if(payType == '7'&&(openId==undefined||openId=='')&&WXPublicCodeService.openIdNullTip){
                        KyeeMessageService.broadcast({
                            content: WXPublicCodeService.openIdNullTip
                        });
                        return;
                    }
                    var payTypePlus = this.convertPayType(pageData,payType);//增加平台编码 程铄闵 KYEEAPPC-7818; KYEEAPPTEST-3886 修改支付类型
                    HttpServiceBus.connect({
                        url: "apppay/action/PayActionC.jspx",
                        params: {
                            op: "wxWebPay",
                            out_trade_no: tradeNo,
                            AMOUNT: payamount,
                            paymentType:payTypePlus,
                            openId:openId
                        },
                        onSuccess: function (data) {
                            if (data.success) {
                                var result = data.data;
                                wx.config({
                                    debug: false,
                                    appId: result.appId, // 必填，公众号的唯一标识
                                    timestamp: result.timeStamp, // 必填，生成签名的时间戳
                                    nonceStr: result.nonceStr, // 必填，生成签名的随机串
                                    signature: result.paySign,// 必填，签名，见附录1
                                    jsApiList: ['chooseWXPay'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                                });

                                wx.ready(function(){
                                    wx.chooseWXPay({
                                        timestamp: result.timeStamp, // 支付签名时间戳
                                        nonceStr: result.nonceStr, // 支付签名随机串，不长于 32 位
                                        package: result.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                                        signType: result.signType, // 签名方式
                                        paySign: result.paySign, // 支付签名
                                        complete: function (res) {// 支付成功后的回调函数
                                            //if (res.err_msg == "get_brand_wcpay_request:ok") {
                                            if (res.errMsg == "chooseWXPay:ok") {
                                                if (pageData.flag == undefined) {
                                                    //普通支付完成
                                                    me.normalPaymentSuccess(pageData);
                                                } else {
                                                    //预约挂号支付完成
                                                    me.paymentSuccess(pageData, tradeNo);
                                                }
                                            }
                                        }
                                    });
                                });
                            } else {
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }

                        },
                        onError: function () {
                        }
                    });
                } else if ( payType == '38' ||payType == '39') {
                    // 38-复旦肿瘤医院支付宝支付   39-趣医支付宝支付
                    if (KyeeEnv.PLATFORM != 'android' && KyeeEnv.PLATFORM != "ios") {
                        KyeeMessageService.hideLoading();//取消遮罩
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("payOrder.platformTip","网页暂不支持此支付方式，请下载趣医院客户端！")
                        });
                        return;
                    }
                    params[4] = this.convertPayType(pageData,payType);//增加平台编码 程铄闵 KYEEAPPC-7818; KYEEAPPTEST-3886 修改支付类型

                    HttpServiceBus.connect({
                        url: "apppay/action/PayActionC.jspx",
                        params: {
                            op: 'payHandle',
                            TRADE_NO: tradeNo,
                            AMOUNT:payamount,
                            TRANS_CODE: '01',
                            PAY_TYPE:payType
                        },
                        onSuccess: function (data) {
                            if(data.success){
                                def.delayTime = data.data.DELAY_TIME;
                                var time = data.data.DELAY_TIME;//返回延迟时间
                                if(time && (typeof(time)=='number'||typeof(time)=='string')){
                                    WebPayService.delayTime = parseFloat(time);
                                }
                                KyeePayService.pay(
                                    "alipay",
                                    function (info) {
                                        //支付后先查询
                                        $timeout(
                                            function(){
                                                HttpServiceBus.connect({
                                                    url: "apppay/action/PayActionC.jspx",
                                                    params: {
                                                        op: 'payHandle',
                                                        hospitalId: hospitalId,
                                                        TRADE_NO: tradeNo,
                                                        TRANS_CODE: '05'
                                                    },
                                                    onSuccess: function (data) {
                                                        me.checkResult(hospitalId, pageData, tradeNo, payType,true);
                                                    },
                                                    onError: function () {
                                                    }
                                                });

                                            },WebPayService.delayTime
                                        );

                                    },
                                    function (info) {
                                        $timeout(
                                            function(){
                                                me.checkResult(hospitalId, pageData, tradeNo, payType,false);
                                                KyeeLogger.error("thr error is: " + info);
                                            },WebPayService.delayTime
                                        );
                                    },
                                    params
                                );
                            }
                            else{
                                //支付失败,弹出提示框
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        },
                        onError: function () {
                        }
                    });


                }else if(payType == '40'||payType == '49'){//复旦支付宝网页支付
                    var payTypePlus = this.convertPayType(pageData,payType);//KYEEAPPTEST-3886 修改支付类型 增加平台编码 程铄闵 KYEEAPPC-7818
                    //趣医银联网页支付 程铄闵 KYEEAPPC-5420
                    HttpServiceBus.connect({
                        url: "apppay/action/PayActionC.jspx",
                        params: {
                            op: 'payHandle',
                            TRADE_NO: tradeNo,
                            AMOUNT:payamount,
                            TRANS_CODE: '01',
                            PAY_TYPE:payTypePlus,
                        },
                        onSuccess: function (data) {
                            if(data.success){
                                WebPayService.payType = payType;
                                WebPayService.url = WebPayService.setUrl(data.data.html);//增加请求的框架参数 KYEEAPPC-6546
                                KyeeMessageService.hideLoading();//取消遮罩
                                //跳转支付网页
                                $state.go('webPay');
                            }
                            else{
                                //支付失败,弹出提示框
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        },
                        onError: function () {
                        }
                    });
                }
                else{
                    //工行支付 -11
                    //银行通用网页支付
                    //通用网页支付支付链接
                    WebPayService.url = AppConfig.SERVER_URL + 'webPaymentNew/submitForm.jsp?'
                        + 'TRADE_NO=' + tradeNo + '&AMOUNT=' + payamount + '&TRANS_CODE=01&PAY_TYPE=' + payType;
                    WebPayService.payType = payType;
                    KyeeMessageService.hideLoading();//取消遮罩
                    //跳转支付网页
                    $state.go('webPay');
                }
            },
            //零钱支付 by 杜巍巍 KYEEAPPC-5272
            smallPay: function (hospitalId,tradeNo) {
                var me = this;
                var businessType = this.getBusinessType(this.payData);
                HttpServiceBus.connect({
                    url: "apppay/action/PayActionC.jspx",
                    params: {
                        op: 'changePay',
                        TRANS_CODE:'01',
                        hospitalID:hospitalId,
                        TRADE_ORDER_NO: tradeNo,
                        PAY_TYPE: '20',
                        BUSINESSPAYTYPE:businessType
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            me.backToLastPage();
                        } else {
                            //begin 免挂号费、预缴金支付时输入验证码错误，点击支付后界面不应跳转   By  张家豪 KYEEAPPTEST-2889
                            if(data.resultCode == "0021501"){
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }else{
                                //支付失败,弹出提示框
                                //me.backToLastPage('failed');
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //普通支付成功
            normalPaymentSuccess: function (data, tradeNo,status) {
                //非医保自费
                if (data.PATIENT_PAY_AMOUNT === '' || data.PATIENT_PAY_AMOUNT === undefined) {
                    if(status == '0'){
                        //用户取消则不做任何操作
                    }
                    else{
                        /*                        KyeeMessageService.broadcast({
                         content: KyeeI18nService.get("payOrder.payProcessing","缴费正在处理中，请耐心等待！")
                         });*/
                        this.backToLastPage();
                    }
                }
                //医保方式
                else {
                    this.updateStatus(data, tradeNo);
                }
            },
            //预约挂号支付成功
            paymentSuccess: function (data, tradeNo,status) {
                //edit by wangwan KYEEAPPC-3372 直连医院模式下，挂号成功后底部不显示处理中信息的问题
                /*if (data.flag == '3') {
                 KyeeMessageService.broadcast({
                 content: "预约正在处理中，请耐心等待！"
                 });
                 } else {
                 KyeeMessageService.broadcast({
                 content: "挂号正在处理中，请耐心等待！"
                 });
                 }*/
                if(status == '0'){
                    //用户取消则不做任何操作
                }
                else{
                    this.backToLastPage();
                }
            },
            //前台验证，返回true为成功
            msgVali: function () {
                var msgText = this.msgCode;
                if (msgText == '' || msgText == null) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("payOrder.checkMsgCode","验证码不能为空！")
                    });
                    return false;
                }
                return true;
            },
            //普通支付预交金支付
            prePayFee: function (tradeNo, payType, prescAttr, itemClass) {
                var me = this;
                var hospitalId = this.getHospitalId();
                //预交金支付
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    params: {
                        op: 'prePayFee',
                        hospitalID: hospitalId,
                        TRADE_NO: tradeNo,
                        PAY_TYPE: payType,
                        PRESC_ATTR: prescAttr,
                        ITEM_CLASS: itemClass,
                        MSG_CODE: this.msgCode,
                        PHONE_NUMBER: this.phoneNum
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //edit by wangwan KYEEAPPC-3372 直连医院模式下，挂号成功后底部不显示处理中信息的问题
                            /*KyeeMessageService.broadcast({
                             content: data.message
                             });*/
                            me.backToLastPage();
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //预约支付
            appointPrepaidPay: function (tradeNo) {
                var me = this;
                var pageData = this.payData;
                HttpServiceBus.connect({
                    type: "POST",
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: 'AppointPrepaiedPayActionC',
                        HID: pageData.HID,
                        TRADE_NO: tradeNo,
                        postdata: JSON.stringify(pageData),
                        PAY_TYPE: '3',
                        MSG_CODE: this.msgCode,
                        PHONE_NUMBER: this.phoneNum
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //edit by wangwan KYEEAPPC-3372 直连医院模式下，挂号成功后底部不显示处理中信息的问题
                            /*KyeeMessageService.broadcast({
                             content: data.message
                             });*/
                            me.backToLastPage();
                        } else {
                            //begin 免挂号费、预缴金支付时输入验证码错误，点击支付后界面不应跳转   By  张家豪 KYEEAPPTEST-2889
                            if(data.resultCode == "0021501"){
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }else{
                                //支付失败，取消订单并退出页面
                                me.backToLastPage('failed');
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                            //end 免挂号费、预缴金支付时输入验证码错误，点击支付后界面不应跳转  By  张家豪  KYEEAPPTEST-2889
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //预约转挂号或挂号支付
            prepaidPay: function (tradeNo) {
                var me = this;
                var pageData = this.payData;
                HttpServiceBus.connect({
                    url: "register/action/RegisterActionC.jspx",
                    type:"POST",
                    params: {
                        op: 'prepaiedPayActionC',
                        HID: pageData.flag == '2' ? pageData.HID : pageData.HID + '/' + pageData.CLINIC_DURATION,
                        TRADE_NO: tradeNo,
                        postdata: JSON.stringify(pageData),
                        PAY_TYPE: '3',
                        MSG_CODE: this.msgCode,
                        PHONE_NUMBER: this.phoneNum
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            if (pageData.flag == '2') {
                                me.backToLastPage();
                            } else {
                                me.backToLastPage();
                            }
                            //edit by wangwan KYEEAPPC-3372 直连医院模式下，挂号成功后底部不显示处理中信息的问题
                            /*KyeeMessageService.broadcast({
                             content: data.message
                             });*/
                        } else {
                            //begin 免挂号费、预缴金支付时输入验证码错误，点击支付后界面不应跳转   By  张家豪 KYEEAPPTEST-2889
                            if(data.resultCode == "0021501"){
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }else{
                                //支付失败，取消订单并退出页面
                                me.backToLastPage('failed');
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                            //end 免挂号费、预缴金支付时输入验证码错误，点击支付后界面不应跳转  By  张家豪  KYEEAPPTEST-2889
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //预约免挂号费支付
            appointForFree: function (tradeNo) {
                var me = this;
                var pageData = this.payData;
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: 'appointForFreeActionC',
                        HID: pageData.CLINIC_DURATION,
                        TRADE_NO: tradeNo,
                        postdata: JSON.stringify(pageData),
                        PAY_TYPE: '6',
                        MSG_CODE: this.msgCode,
                        PHONE_NUMBER: this.phoneNum
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //edit by wangwan KYEEAPPC-3372 直连医院模式下，挂号成功后底部不显示处理中信息的问题
                            /* KyeeMessageService.broadcast({
                             content: data.message
                             });*/
                            me.backToLastPage();
                        } else {
                            //begin 免挂号费、预缴金支付时输入验证码错误，点击支付后界面不应跳转   By  张家豪 KYEEAPPTEST-2889
                            if(data.resultCode == "0021501"){
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }else{
                                //支付失败，取消订单并退出页面
                                me.backToLastPage('failed');
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                            //end 免挂号费、预缴金支付时输入验证码错误，点击支付后界面不应跳转  By  张家豪  KYEEAPPTEST-2889
                        }
                    },
                    onError: function () {
                    }
                });
            },

            //挂号免挂号费支付
            registForFree: function (tradeNo) {
                var me = this;
                var pageData = this.payData;
                HttpServiceBus.connect({
                    url: "register/action/RegisterActionC.jspx",
                    params: {
                        op: 'registForFreeActionC',
                        HID: pageData.flag == '2' ? pageData.HID : pageData.HID + '/' + pageData.CLINIC_DURATION,
                        TRADE_NO: tradeNo,
                        //postdata: JSON.stringify(pageData),
                        PAY_TYPE: '6',
                        MSG_CODE: this.msgCode,
                        PHONE_NUMBER: this.phoneNum
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //edit by wangwan KYEEAPPC-3372 直连医院模式下，挂号成功后底部不显示处理中信息的问题
                            /*KyeeMessageService.broadcast({
                             content: data.message
                             });*/
                            me.backToLastPage();
                        } else {
                            //begin 免挂号费、预缴金支付时输入验证码错误，点击支付后界面不应跳转   By  张家豪 KYEEAPPTEST-2889
                            if(data.resultCode == "0021501"){
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }else{
                                //支付失败，取消订单并退出页面
                                me.backToLastPage('failed');
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                            //end 免挂号费、预缴金支付时输入验证码错误，点击支付后界面不应跳转  By  张家豪  KYEEAPPTEST-2889
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //取消订单
            cancelPayOrder: function (getData, hid, flag) {
                //begin 取消订单合并  By  章剑飞  APPCOMMERCIALBUG-884
                var me = this;
                var hospitalId = this.getHospitalId();
                //取消订单
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: 'cancelPayOrder',
                        TRADE_ORDER_NO: me.payData.TRADE_NO,
                        hospitalID:hospitalId,
                        IS_RUSH_RECORD:me.payData.IS_RUSH_RECORD
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData();
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                    }
                });
                //end 取消订单合并  By  章剑飞  APPCOMMERCIALBUG-884
            },
            //获取验证码
            getValiteCode: function (getData, payType) {
                var me = this;
                var date = this.payData;
                var patientId = date.PATIENT_ID;
                if (patientId == undefined && this.memoryCache.get("currentCardInfo")) {
                    patientId = this.memoryCache.get("currentCardInfo").PATIENT_ID;
                }
                var hospitalId = this.getHospitalId();
                var userId = this.memoryCache.get("currentUserRecord").USER_ID;
                var userVsId = this.memoryCache.get("currentCustomPatient").USER_VS_ID;
                var messageType = '1';
                var cardNo = '';
                if (this.phoneFlag == '1' && payType == '3') {
                    messageType = '5';
                    cardNo = this.payData.CARD_NO;
                }
                HttpServiceBus.connect({
                    url: "messagepush/action/MessageCheckActionC.jspx",
                    params: {
                        op: 'sendRegCheckCodeActionC',
                        hospitalId: hospitalId,
                        userId: userId,
                        modId: '10001',
                        messageType: messageType,
                        patientId: patientId,
                        cardNo:cardNo,
                        userVsId:userVsId,
                        //edit 增加短信类型  KYEEAPPC-6683 hemeng 2016年6月19日22:34:54
                        messageBusinessType:'1'

                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            if (data.data != undefined) {
                                getData(data);
                            }
                        }
                        else {//短信发送失败
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //获取医保验证码
            getMdValiteCode: function (getData, payType) {
                var data = this.payData;
                var hospitalId = this.getHospitalId();
                var userVsId = this.memoryCache.get("currentCustomPatient").USER_VS_ID;
                HttpServiceBus.connect({
                    url: "medicalSecurity/action/MedicalSecurityActionC.jspx",
                    params: {
                        op: 'getMessageCodeRequest',
                        HOSPITAL_ID: hospitalId,
                        USER_VS_ID: userVsId,
                        TRADE_NO: data.TRADE_NO,
                        SERIAL_NO: data.SERIAL_NO,
                        BUSINESS_TYPE: '4003'
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData();
                        }
                        else {//短信发送失败
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //无自费部分医保支付
            mdNoPatientPay: function (getData, msgCode, password, pageData) {
                //自费为0元，或支付成功结算失败过的订单
                var onlinePwd = password;
                onlinePwd = Md5UtilService.md5(onlinePwd);
                onlinePwd = onlinePwd + '|' + msgCode;
                onlinePwd = Md5UtilService.md5(onlinePwd);
                var hospitalId = this.getHospitalId();
                HttpServiceBus.connect({
                    url: "medicalSecurity/action/MedicalSecurityActionC.jspx",
                    params: {
                        op: 'settlementRequest',
                        HOSPITAL_ID: hospitalId,
                        USER_VS_ID: this.memoryCache.get("currentCustomPatient").USER_VS_ID,
                        ID_NO: this.memoryCache.get("currentCustomPatient").ID_NO,
                        OFTEN_NAME: this.memoryCache.get("currentCustomPatient").OFTEN_NAME,
                        TRADE_NO: pageData.TRADE_NO,
                        //SERIAL_NO: pageData.SERIAL_NO,       //流水号
                        //VISIT_DATE: pageData.VISIT_DATE,
                        //PRESC_ATTR: pageData.PRESC_ATTR,     //处方号
                        MSG_CODE: msgCode,
                        MS_ONLINE_PASSWORD: onlinePwd
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("payOrder.mdPatientPayTip","您的医保结算请求已发送，请耐心等候！")
                            });
                            getData();
                        }
                        else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //医保支付创建子订单，即自费支付部分
            subPayorder: function (getData, msgCode, password, model, payType, $state) {
                var me = this;
                //密码加密
                var onlinePwd = password;
                onlinePwd = Md5UtilService.md5(onlinePwd);
                onlinePwd = onlinePwd + '|' + msgCode;
                onlinePwd = Md5UtilService.md5(onlinePwd);
                var hospitalId = this.getHospitalId();
                HttpServiceBus.connect({
                    url: "medicalSecurity/action/MedicalSecurityActionC.jspx",
                    params: {
                        op: 'ownPayRequest',
                        MODEL_HOSPITAL_ID: hospitalId,
                        details: JSON.stringify(model.DETAILS, true),
                        MARK_DESC: model.MARK_DESC,
                        MARK_DETAIL: model.MARK_DETAIL,
                        AMOUNT: model.PATIENT_PAY_AMOUNT,
                        USER_ID: this.memoryCache.get("currentUserRecord").USER_ID,
                        TRADE_NO: model.TRADE_NO,
                        SERIAL_NO: model.SERIAL_NO,
                        TOTAL: model.TOTAL,
                        MS_ONLINE_PASSWORD: onlinePwd,
                        MSG_CODE: msgCode,
                        IS_SUB: '1'
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //订单编号
                            var tradeNo = data.OUT_TRADE_NO;
                            var hospitalID = hospitalId;
                            var productDesc = model.MARK_DETAIL;
                            var payamount = model.PATIENT_PAY_AMOUNT;
                            var userId = me.memoryCache.get("currentUserRecord").USER_ID;
                            var productName = model.MARK_DESC;
                            var paymentType = payType;
                            var params = new Array(tradeNo, productName, productDesc, payamount, paymentType, hospitalID, userId);
                            me.backToLastPage = getData;
                            me.paymentSubmit(payType, tradeNo, payamount, params, $state);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //更新医保自费状态
            updateStatus: function (data, tradeNo) {
                var me = this;
                var hospitalId = this.getHospitalId();
                HttpServiceBus.connect({
                    url: "medicalSecurity/action/MedicalSecurityActionC.jspx",
                    params: {
                        op: 'ownPaySetStatusRequest',
                        hospitalID: hospitalId,
                        TRADE_NO: data.TRADE_NO,
                        SERIAL_NO: data.SERIAL_NO,
                        TRADE_NO_SUB: tradeNo
                    },
                    onSuccess: function (data) {
                        /*                        KyeeMessageService.broadcast({
                         content: KyeeI18nService.get("payOrder.payProcessing","缴费正在处理中，请耐心等待！")
                         });*/
                        me.backToLastPage();
                    },
                    onError: function () {
                    }
                });
            },
            //0元预约挂号请求
            requestNoRegistAmount: function (tradeOrderNo, payType, flag) {
                var me = this;
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    params: {
                        op: 'registNoAmountPay',
                        TRADE_ORDER_NO: tradeOrderNo,
                        PAY_TYPE: payType
                    },
                    onSuccess: function (data) {
                        if (data.success == 'success') {
                            //预约挂号支付完成
                            me.paymentSuccess(me.payData, tradeOrderNo);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //begin 预约挂号成功后，向后台发送支付成功请求 By 高玉楼
            /**
             * 预约挂号支付完成后发送支付成功请求
             */
            afterPay: function () {
                var hospitalId = this.getHospitalId();
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    showLoading: false,
                    params: {
                        op: 'updatePayStatusByAppRegTypeActionC',
                        C_REG_ID: this.payData.C_REG_ID,
                        HOSPITAL_ID:hospitalId
                    },
                    onSuccess: function (data) {

                    },
                    onError: function () {
                    }
                });
            },
            //end 预约挂号成功后，向后台发送支付成功请求 By 高玉楼
            //支付后查询方法  By  章剑飞  KYEEAPPC-3037
            checkResult: function (hospitalId, pageData, tradeNo, payType,success) {
                var me = this;
                //支付成功后直接跳转
                if(success){
                    KyeeMessageService.hideLoading();//取消遮罩
                    //普通支付
                    if (pageData.flag == undefined) {
                        //普通支付完成
                        me.normalPaymentSuccess(pageData, tradeNo);
                    } else {
                        //预约挂号支付完成
                        me.paymentSuccess(pageData, tradeNo);
                    }
                }
                else{
                    //支付后先查询再跳转页面  By  章剑飞  KYEEAPPC-2834
                    HttpServiceBus.connect({
                        url: "apppay/action/PayActionC.jspx",
                        params: {
                            op: 'payHandle',
                            hospitalId: hospitalId,
                            TRADE_NO: me.payData.TRADE_NO,
                            TRANS_CODE: '05'
                        },
                        onSuccess: function (data) {
                            KyeeMessageService.hideLoading();//取消遮罩
                            //支付失败后跳转
                            if (payType == '12') {
                                //如果为全民付网页支付
                                if (data.success &&
                                    (data.data.TRADE_STATUS == '1' || data.data.TRADE_STATUS == '3')) {
                                    if (pageData.flag == undefined) {
                                        //普通支付完成
                                        me.normalPaymentSuccess(pageData, tradeNo);
                                    } else {
                                        //预约挂号支付完成
                                        me.paymentSuccess(pageData, tradeNo);
                                    }
                                }
                            } else {
                                var status = data.data.TRADE_STATUS;
                                //普通支付
                                if (pageData.flag == undefined) {
                                    //普通支付完成
                                    me.normalPaymentSuccess(pageData, tradeNo,status);
                                } else {
                                    //预约挂号支付完成
                                    me.paymentSuccess(pageData, tradeNo,status);
                                }
                            }
                        },
                        onError: function () {
                        }
                    });
                }
            },

            //根据医院id和userId查询
            queryCustomPatient:function(onSuccess){
                var hospitalId = this.getHospitalId();
                var userId = this.memoryCache.get("currentUserRecord").USER_ID;
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    params: {
                        userId: userId,
                        hospitalId: hospitalId,
                        op: "selectedCustomPatient"
                    },
                    showLoading: false,
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                    }
                });
            },

            //清除未交费订单号
            cleanOrderNo: function(onSuccess){
                var me = this;
                var hospitalId = this.getHospitalId();
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    params: {
                        op: "cleanOrderNo",
                        MOEDL_HOSPITAL_ID: hospitalId,
                        ORDER_NO: me.payData.TRADE_NO
                    },
                    onSuccess: function (data) {
                        onSuccess();
                    }
                });
            },

            //药都银行获取卡表
            getCardList:function(onSuccess,amount,tradeNo,hospitalId){
                var me = this;
                HttpServiceBus.connect({
                    url: "/apppay/action/PayActionC.jspx",
                    params: {
                        hospitalID : hospitalId,
                        userNo: BoZhouLoginService.objectid,
                        AMOUNT : amount,
                        out_trade_no: tradeNo,
                        op: "queryCards"
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            onSuccess(data.data);
                        }else{
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }

                    },
                    onError: function () {
                    }
                })
            },

            //查询订单是否支付完成 程铄闵
            checkOrder:function(param,getData){
                var hospitalId = '';
                if (param == undefined) {
                    hospitalId = this.storageCache.get('hospitalInfo').id;
                } else {
                    hospitalId = param;
                }
                var me = this;
                HttpServiceBus.connect({
                    url: "apppay/action/PayActionC.jspx",
                    params: {
                        op: 'payHandle',
                        hospitalId: hospitalId,
                        TRADE_NO: me.payData.TRADE_NO,
                        TRANS_CODE: '05'
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            var status = data.data.TRADE_STATUS;
                            //失败
                            if(status == '0'){
                                getData('fail');
                            }
                            else{
                                getData('success');
                            }
                        }
                        else{
                            getData('fail');
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //转换支付方式 程铄闵 KYEEAPPC-7818 健康卡充值增加渠道id
            convertPayType:function(pageData,payType){
                var businessType = this.getBusinessType(pageData);
                var type = payType;
                var payTypes = def.payTypes;
                //就诊卡充值时增加平台号
                if(businessType == 3){
                    for(var i=0;i<payTypes.length;i++){
                        //如果有渠道号再加
                        if(payType == payTypes[i].ITEM_VALUE && payTypes[i].HEALTH_CARD_PLATFORM_ID){
                            type = payType + '-' + payTypes[i].HEALTH_CARD_PLATFORM_ID;
                        }
                    }
                }
                return type;
            },
            //获取就诊卡余额 程铄闵 KYEEAPPC-7823
            getCardBalance:function(payAmount,cardNo,onSuccess){
                var hospitalId = this.getHospitalId();
                HttpServiceBus.connect({
                    url: "/patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        INPUT_NAME: this.memoryCache.get("currentCustomPatient").OFTEN_NAME,
                        hospitalID: hospitalId,
                        PAY_AMOUNT: payAmount,
                        CARD_NO: cardNo,
                        op: "checkPatientRecharge"
                    },
                    showLoading:false,
                    onSuccess: function (data) {
                        if(data.success){
                            onSuccess(true,data.data);
                        }else{
                            onSuccess(false);
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //获取医院id
            getHospitalId : function(){
                var hospitalId = '';
                if (this.hospitalId == undefined) {
                    hospitalId = this.storageCache.get('hospitalInfo').id;
                } else {
                    hospitalId = this.hospitalId;
                }
                return hospitalId;
            },
            //获取businessType
            getBusinessType : function(payData){
                var businessType;
                var router = payData.ROUTER;
                if (payData.flag == undefined) {
                    //增加新版住院预缴 KYEEAPPC-6601
                    if (router == 'inpatient_payment_pay_info'||router == 'perpaid_record') {
                        //住院业务
                        businessType = 2;
                    } else if (router == 'recharge_records'||router == 'patient_card_records') {
                        // KYEEAPPC-8088 程铄闵 2.3.10充值功能改版
                        //添加就诊卡充值个性化支付方式  KYEEAPPC-2625  By  章剑飞
                        businessType = 3;
                    } else if (router == 'medicineOrder') {
                        businessType = 4;
                    } else {
                        //普通支付
                        businessType = 1;
                    }
                } else {
                    //预约挂号支付
                    businessType = 0;
                }
                return businessType;
            },
            //获取健康卡支付方式的平台id 程铄闵 KYEEAPPC-7820
            getPlatformId : function(payType){
                var platformId;
                var payTypes = def.payTypes;
                for(var i=0;i<payTypes.length;i++){
                    //如果有渠道号再加
                    if(payType == payTypes[i].ITEM_VALUE && payTypes[i].HEALTH_CARD_PLATFORM_ID){
                        platformId = payTypes[i].HEALTH_CARD_PLATFORM_ID;
                    }
                }
                return platformId;
            }
        };
        return def;
    })
    .build();