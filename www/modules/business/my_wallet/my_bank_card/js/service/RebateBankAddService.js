/**
 * 产品名称：quyiyuan.
 * 创建用户：张文华
 * 日期：2015年5月11日23:01:26
 * 创建原因：银行卡列表页面服务层
 */
new KyeeModule()
    .group("kyee.quyiyuan.rebate.rebateBankAdd.service")
    .require([
        "kyee.framework.service.message",
        "kyee.quyiyuan.service_bus.http",
        "kyee.quyiyuan.service_bus.cache",
        "kyee.quyiyuan.rebate.rebateBank.service"
    ])
    .type("service")
    .name("RebateBankAddService")
    .params(["HttpServiceBus","CacheServiceBus","$state","RebateBankService","KyeeMessageService","$ionicHistory",'KyeeI18nService'])
    .action(function(HttpServiceBus,CacheServiceBus,$state,RebateBankService,KyeeMessageService,$ionicHistory,KyeeI18nService){

        var def = {

            initView:function(initViewCallBackFunc){
                this.loadStore(initViewCallBackFunc);
            },
            loadStore:function(initViewCallBackFunc){
                var me = this;
                HttpServiceBus.connect({
                    url:'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params:{
                        op:'getUserBankMsg',
                        USER_ID:CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID
                    },
                    onSuccess:function(record){
                        if(record.success){
                            var result = record.data.rows;
                            if(result !=null && result!=undefined && result.length>0){
                                for(var i=0;i<result.length;i++){
                                    result[i].BANK_CARD_TYPE_F = me.convertBankCardF(result[i].BANK_CARD_NO);
                                }
                            }
                            initViewCallBackFunc(result);
                        }else{
                            if(record.message!=null && record.message !=undefined){
                                KyeeMessageService.message({
                                    title:KyeeI18nService.get('commonText.sysTipsMsg','系统提示',null),
                                    content:record.message
                                });
                            }else{
                                KyeeMessageService.message({
                                    title:KyeeI18nService.get('commonText.sysTipsMsg','系统提示',null),
                                    content:KyeeI18nService.get('commonText.networkErrorMsg','网络异常，请稍后重试！',null)
                                });
                            }
                            $ionicHistory.goBack();
                        }
                    }
                })
            },
            //将卡号转为尾号格式
            convertBankCardF: function (value) {
                if(value==null){
                    return "";
                }else if(value == undefined){
                    return "";
                }
                var firstCardNo= value.substr(0,4);
                value = value.substr(value.length-4, value.length);
                value= KyeeI18nService.get('rebateBankAdd.cardNum','卡号：',null)+firstCardNo+"********"+value;
                return value;
            },

            //列表点击
            onBankCardListTap:function(record){
                //edit by huabo 任务号：KYEEAPPTEST-2962 提现界面里的银行卡，无法切换
                var lastView = $ionicHistory.backView();
                if(lastView.stateName=='rebateBank'){
                    CacheServiceBus.getStorageCache().set("BANK_CARD_TYPE_F",record.BANK_CARD_TYPE_F);
                    CacheServiceBus.getStorageCache().set("BANK_NAME",record.BANK_CARD_TYPE);
                    CacheServiceBus.getStorageCache().set("BANK_CARD_ID",record.BANK_CARD_ID);
                    RebateBankService.setPagedata(record);
                    RebateBankService.setLastView('RebateBankAdd');
                    $state.go('rebateBank');
                }
            },
            //点击删除
            doDeleteCard:function(record,deleteCallBackFunc){
                var me = this;
                var cardId = record.BANK_CARD_ID;
                if((cardId == undefined)||(cardId =="")){
                    KyeeMessageService.message({
                        title:KyeeI18nService.get('commonText.msgTitle','消息',null),
                        content:KyeeI18nService.get('rebateBankAdd.selectWillDeleteBank','请先选择要删除的银行卡',null)
                    });
                    return;
                }
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get('commonText.msgTitle','消息',null),
                    content: KyeeI18nService.get('rebateBankAdd.sureDeleteTheCard','确定删除{{bank_card_type_f}}的银行卡吗？',{bank_card_type_f:record.BANK_CARD_TYPE_F}),
                    onSelect: function (res) {
                        if(res){
                            if(cardId == localStorage.BANK_CARD_ID){
                                CacheServiceBus.getStorageCache().set("BANK_CARD_TYPE_F","");
                                CacheServiceBus.getStorageCache().set("BANK_NAME","");
                                CacheServiceBus.getStorageCache().set("BANK_CARD_ID","");
                            }
                            me.deleteBankOK(cardId,deleteCallBackFunc);
                        }
                    }
                });
            },
            //确认删除
            deleteBankOK:function(cardId,deleteCallBackFunc){
                var me = this;
                HttpServiceBus.connect({
                    url:'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params:{
                        op:'deleteUserBankMsg',
                        loc:'c',
                        BANK_CARD_ID:cardId
                    },
                    onSuccess:function(record){
                        //add by huabo 任务号:KYEEAPPTEST-3025
                        if (record.success) {
                            me.loadStore(deleteCallBackFunc);
                            CacheServiceBus.getStorageCache().set("BANK_CARD_TYPE_F", undefined);
                            CacheServiceBus.getStorageCache().set("BANK_NAME", undefined);
                            CacheServiceBus.getStorageCache().set("BANK_CARD_ID", undefined);
                        }else{
                            KyeeMessageService.broadcast({
                                content: record.message,
                                duration: 3000
                            });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();
