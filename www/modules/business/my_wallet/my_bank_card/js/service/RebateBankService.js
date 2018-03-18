/**
 * 产品名称：quyiyuan.
 * 创建用户：张文华
 * 日期：2015年5月11日23:01:26
 * 创建原因：账户信息页面控制层
 */
new KyeeModule()
    .group("kyee.quyiyuan.rebate.rebateBank.service")
    .require([
        "kyee.framework.service.message",
        "kyee.quyiyuan.service_bus.http",
        "kyee.quyiyuan.service_bus.cache"
    ])
    .type("service")
    .name("RebateBankService")
    .params(["KyeeMessageService", "$state", "CacheServiceBus", "AuthenticationService",
        "HttpServiceBus", "UpdateUserService", 'KyeeI18nService', "KyeeViewService"])
    .action(function (KyeeMessageService, $state, CacheServiceBus, AuthenticationService,
                      HttpServiceBus, UpdateUserService, KyeeI18nService, KyeeViewService) {

        var def = {

            cardId: undefined,//银行卡编号

            //上个页面传入的银行卡信息
            cardInfo: undefined,
            //页面间参数
            pagedata: {
                BANK_CARD_TYPE: '',
                BANK_CARD_TYPE_F: '',
                BANK_CARD_ID: ''
            },
            lastView: '',//上一页面
            setLastView: function (lastView) {
                this.lastView = lastView;
            },
            getLastView: function () {
                return this.lastView;
            },
            setPagedata: function (pagedata) {
                this.pagedata = pagedata;
            },
            getPageData: function () {
                return this.pagedata;
            },

            initView: function (initViewCallBackFunc) {
                //参数初始化
                var data = this.getPageData();
                var lastView = this.getLastView();
                //获取到上一个页面，然后清空，以防影响下次初始化
                this.setLastView('');
                //接收恢复默认值，防止影响下次初始化
                this.pagedata = {};
                //本地缓存的银行卡
                var cardId = CacheServiceBus.getStorageCache().get('BANK_CARD_ID');
                if (cardId != undefined && cardId != null && cardId != "") {
                    this.cardId = cardId;
                } else {
                    this.cardId = undefined;
                }

                //上一页面为添加银行卡页面
                if (lastView == "RebateBankAdd" && data != undefined) {
                    var result = {
                        cardId: data.BANK_CARD_ID,
                        bankName: data.BANK_CARD_TYPE,
                        bankNo: data.BANK_CARD_TYPE_F
                    };

                    CacheServiceBus.getStorageCache().set("BANK_CARD_TYPE_F", result.bankNo);
                    CacheServiceBus.getStorageCache().set("BANK_NAME", result.bankName);
                    CacheServiceBus.getStorageCache().set("BANK_CARD_ID", result.cardId);
                    initViewCallBackFunc(result);//将数据返回页面
                    return;
                }
                //上一页面是编辑银行卡页面
                if (lastView == "EditRebateBankMsg") {
                    this.cardInfo = data;
                }
                //其他情况
                this.loadStore(initViewCallBackFunc, lastView);
            },

            loadStore: function (initViewCallBackFunc, lastView) {
                var me = this;
                HttpServiceBus.connect({
                        url: 'freeRgtPay/action/freeRgtPayActionC.jspx',
                        params: {
                            op: 'getUserBankMsg',
                            USER_ID: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID
                        },
                        onSuccess: function (resultRecords) {
                            var records = resultRecords.data.rows;
                            var result = {
                                cardId: '',
                                bankName: '',
                                bankNo: ''
                            };
                            if (records.length > 0) {
                                //如果上一个页面时编辑银行卡，则根据新增的银行卡号显示银行卡
                                if (lastView == 'EditRebateBankMsg') {
                                    var cardNum = me.cardInfo.BANK_CARD_NO;
                                    for (var i = 0; i < records.length; i++) {
                                        if (records[i].BANK_CARD_NO == cardNum) {
                                            result.cardId = records[i].BANK_CARD_ID;
                                        }
                                    }
                                    result.bankName = me.cardInfo.BANK_NAME;
                                    result.bankNo = me.cardInfo.BANK_CARD_TYPE_F;
                                    CacheServiceBus.getStorageCache().set("BANK_CARD_TYPE_F", result.bankNo);
                                    CacheServiceBus.getStorageCache().set("BANK_NAME", result.bankName);
                                    CacheServiceBus.getStorageCache().set("BANK_CARD_ID", result.cardId);
                                } else {
                                    //如果本地缓存的银行卡ID不为空
                                    // 根据ID匹配后台请求的银行卡集合，并显示
                                    if (me.cardId != undefined && records.length > 0) {
                                        for (var i = 0; i < records.length; i++) {
                                            if (records[i].BANK_CARD_ID == me.cardId) {
                                                result.cardId = records[i].BANK_CARD_ID;
                                                result.bankName = records[i].BANK_CARD_TYPE;
                                                result.bankNo = me.convertBankCardF(records[i].BANK_CARD_NO);
                                            }
                                        }
                                    } else {
                                        result.bankName = records[0].BANK_CARD_TYPE;
                                        result.cardId = records[0].BANK_CARD_ID;
                                        result.bankNo = me.convertBankCardF(records[0].BANK_CARD_NO);
                                    }
                                }
                            } else {
                                me.doClearLocalStorageCardInfo();
                            }
                            initViewCallBackFunc(result);
                        },
                        onError: function () {
                            me.doClearLocalStorageCardInfo();
                        }
                    }
                );
            },
            convertBankCardF: function (cardNo) {
                if (cardNo == null) {
                    return "";
                } else if (cardNo == undefined) {
                    return "";
                }
                var firstCardNo = cardNo.substr(0, 4);
                cardNo = cardNo.substr(cardNo.length - 4, cardNo.length);

                var result = KyeeI18nService.get('rebateBankAdd.cardNum', '卡号：', null) + firstCardNo + "********" + cardNo;
                return result;
            },
            doClearLocalStorageCardInfo: function () {
                CacheServiceBus.getStorageCache().set("BANK_CARD_TYPE_F", undefined);
                CacheServiceBus.getStorageCache().set("BANK_NAME", undefined);
                CacheServiceBus.getStorageCache().set("BANK_CARD_ID", undefined);
            },
            //显示银行卡列表
            doShowRebateBankAdd: function () {
                $state.go("rebateBankAdd");
            },
            onShowEditBankCardMsgTap: function () {
                $state.go("editBankCardMsg");
            },
            //提交按钮点击
            onSubmitBtn: function (amount, BankCardInfo, callback) {
                if (BankCardInfo.cardId == undefined || BankCardInfo.cardId == '') {
                    KyeeMessageService.message({
                        title: KyeeI18nService.get('commonText.msgTitle', '消息', null),
                        content: KyeeI18nService.get('rebateBank.selectBankCard', '请您先选择银行卡！', null)
                    });
                    return;
                }
                //APPCOMMERCIALBUG-1030  金额输入验证  赵婷
                // 错误提示信息修改 KYEEAPPTEST-2808 yaobin 2015年7月30日14:10:16
                var reg = new RegExp('^[0-9]+(.[0-9]+)?$');
                if (!reg.test(amount)) {
                    KyeeMessageService.message({
                        title: KyeeI18nService.get('commonText.msgTitle', '消息', null),
                        content: KyeeI18nService.get('rebateBank.errorAmount', '输入金额有误', null)
                    });
                    return;
                }

                amount = amount.replace(/\s+/g, "");
                amount = amount.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
                if (!this.checkIllegalChar(amount)) {
                    KyeeMessageService.message({
                        title: KyeeI18nService.get('commonText.msgTitle', '消息', null),
                        content: KyeeI18nService.get('rebateBank.errorAmount', '输入金额有误', null)
                    });
                    return;
                }
                if (amount < 1) {
                    KyeeMessageService.message({
                        title: KyeeI18nService.get('commonText.msgTitle', '消息', null),
                        content: KyeeI18nService.get('rebateBank.leastMoney', '最少申请一元', null)
                    });
                    return;
                }
                if (amount < 0) {
                    KyeeMessageService.message({
                        title: KyeeI18nService.get('commonText.msgTitle', '消息', null),
                        content: KyeeI18nService.get('rebateBank.errorAmount', '输入金额有误', null)
                    });
                    return;
                }
                if (amount == undefined) {
                    KyeeMessageService.message({
                        title: KyeeI18nService.get('commonText.msgTitle', '消息', null),
                        content: KyeeI18nService.get('rebateBank.errorAmount', '输入金额有误', null)
                    });
                    return;
                }
                if (amount == null) {
                    KyeeMessageService.message({
                        title: KyeeI18nService.get('commonText.msgTitle', '消息', null),
                        content: KyeeI18nService.get('rebateBank.errorAmount', '输入金额有误', null)
                    });
                    return;
                }
                this.saveStore(BankCardInfo.cardId, amount, callback);
            },
            //提取操作
            saveStore: function (cardId, amount, callback) {
                var currentCardInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
                var userInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                var opreateName = '';
                var patientId = '';
                if (userInfo) {
                    opreateName = userInfo.OFTEN_NAME;
                }
                // 获取就诊卡信息
                if (currentCardInfo) {
                    patientId = currentCardInfo.PATIENT_ID;
                }
                HttpServiceBus.connect({
                    url: 'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params: {
                        op: 'getPersonalAccount',
                        HOSPITAL_ID: CacheServiceBus.getStorageCache().get("hospitalInfo").id,
                        USER_ID: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                        OPERATE_NAME: opreateName,
                        PATIENT_ID: patientId,
                        BANK_CARD_ID: cardId,
                        GETMONEY: amount
                    },
                    onSuccess: function (resultRecords) {
                        if (resultRecords.success) {
                            var message = resultRecords.message;
                            KyeeMessageService.broadcast({
                                content: message,
                                duration: 5000
                            });
                            callback();
                        } else if (resultRecords.resultCode == '0150101' || resultRecords.resultCode == '0150102') {
                            //提示实名认证
                            def.processError(resultRecords);
                        } else if (resultRecords.resultCode == '0150103') {
                            KyeeMessageService.confirm({
                                content: resultRecords.message,
                                okText: '立即前往',
                                cancelText: '以后再说',
                                onSelect: function (res) {
                                    if (res) {
                                        $state.go('rebateBankAdd');
                                    }
                                }
                            });
                        } else {
                            KyeeMessageService.broadcast({
                                content: resultRecords.message
                            });
                        }
                    }
                });
            },

            /**
             * 提现错误处理函数 姚斌 2015年7月23日18:58:22 KYEEAPPC-2857
             */
            processError: function (resultRecords) {
                KyeeMessageService.confirm({
                    title: "消息",
                    content: resultRecords.message,
                    okText: '立即前往',
                    cancelText: '以后再说',
                    onSelect: function (res) {
                        if (res) {
                            var flag = '';
                            if (resultRecords.resultCode == '0150101') {
                                flag = 2;
                            }
                            var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                            AuthenticationService.HOSPITAL_SM = {
                                OFTEN_NAME: userInfo.NAME,
                                ID_NO: userInfo.ID_NO,
                                PHONE: userInfo.PHONE_NUMBER,
                                FLAG: flag
                            };
                            //认证类型： 0：实名认证，1：实名追述
                            AuthenticationService.AUTH_TYPE = 0;
                            //0：就诊者，1：用户
                            AuthenticationService.AUTH_SOURCE = 1;

                            KyeeViewService.openModalFromUrl({
                                scope: def.scope,
                                url: 'modules/business/center/views/authentication/authentication.html'
                            });

                        }
                    }
                });
            },

            onInputAmount: function (amount) {
                amount = amount.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
                return amount;
            },
            checkIllegalChar: function (amount) {
                var IllegalString = "\`~!#$%^&*()+{}|\\:\"<>?-=/,\'`qwertyuiopasdfghjklzxcvbnm·";
                for (var j = 0; j < amount.length; j++) {
                    if (IllegalString.indexOf(amount.charAt(j)) >= 0) {
                        return false;
                    }
                }
                return true;
            }
        };
        return def;
    })
    .build();
