/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年8月25日14:48:19
 * 创建原因：申请提现页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.applyCash.service")
    .require([])
    .type("service")
    .name("ApplyCashService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeMessageService", "KyeeUtilsService","KyeeI18nService","KyeePhoneService"])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService, KyeeUtilsService,KyeeI18nService,KyeePhoneService) {

        var def = {
            /**
             * 获取提现记录数据
             */
            getApplyCashRecord:function(onSuccess){

                HttpServiceBus.connect({
                    url:'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params: {
                        op:'queryGetBackRecordOut',
                        loc:'c',
                        USER_ID:CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID
                    },
                    onSuccess: function (resp) {
                        if(resp.success){
                            var resultData = resp.data.LIST;
                            for(var i=0;i<resultData.length;i++){
                                resultData[i].OPERATE_TIME = KyeeUtilsService.DateUtils.formatFromString(
                                    resultData[i].OPERATE_TIME, 'YYYY-MM-DD', 'YYYY/MM/DD');
                                resultData[i].AMOUNT = def.convertAmount(resultData[i].AMOUNT);
                                resultData[i].AMOUNT = def.convertAmount(resultData[i].AMOUNT);
                                resultData[i].BANK_CARD_NO_F = def.convertBankCardNoF(resultData[i].BANK_CARD_NO);
                                var flagDetail = def.convertFlag(resultData[i].FLAG);
                                resultData[i].FLAG = flagDetail[0];
                                resultData[i].FLAG_COLOR = flagDetail[1];
                                if(flagDetail[1]=='#ef3737'){
                                    resultData[i].SHOW_DETAIL_ICON = true;
                                }
                                //resultData[i].showDetailIcon = false;
                                //if(resultData[i].FLAG == '正在处理'){
                                //    resultData[i].FLAG_COLOR = '#f18229';
                                //}else if(resultData[i].FLAG=='申请成功' || resultData[i].FLAG=='充值成功'){
                                //    resultData[i].FLAG_COLOR = '#42d56f';
                                //}else{
                                //    resultData[i].FLAG_COLOR = '#ef3737';
                                //    resultData[i].SHOW_DETAIL_ICON = true;
                                //}
                            }
                            resp.data.LIST = resultData;
                            onSuccess(resp.data);
                        } else if(resp.alertType == 'ALERT'){
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            },

            //查询所有记录
            getRecord: function(onSuccess, flag){

                HttpServiceBus.connect({
                    url:'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params: {
                        op:'queryFreeDetailActionC'
                    },
                    showLoading: flag,
                    onSuccess: function (data) {
                        if(data.success){
                            var result = data.data;
                            var resultData = data.data.DETAIL_RECORD;
                            //TYPE： 0 入账记录，1 提现记录
                            for(var i=0;i<resultData.length;i++){
                                //提现记录数据转换
                                if(resultData[i].TYPE == '1'){
                                    resultData[i].OPERATE_TIME = KyeeUtilsService.DateUtils.formatFromString(
                                        resultData[i].OPERATE_TIME, 'YYYY-MM-DD', 'YYYY/MM/DD');
                                    resultData[i].AMOUNT = "-"+def.convertAmount(resultData[i].AMOUNT);
                                    resultData[i].BANK_CARD_NO_F = def.convertBankCardNoF(resultData[i].BANK_CARD_NO);
                                    var flagDetail = def.convertFlag(resultData[i].FLAG);
                                    resultData[i].FLAG = flagDetail[0];
                                    resultData[i].FLAG_COLOR = flagDetail[1];
                                    if(flagDetail[1]=='#ef3737'){
                                        resultData[i].SHOW_DETAIL_ICON = true;
                                    }
                                }else{
                                    //入账记录数据转换
                                    resultData[i].OPERATE_TIME = KyeeUtilsService.DateUtils.formatFromString(
                                        resultData[i].OPERATE_TIME, 'YYYY-MM-DD', 'YYYY/MM/DD');
                                    resultData[i].AMOUNT = "+"+def.convertAmount(resultData[i].AMOUNT);
                                }
                            }
                            result.DETAIL_RECORD = resultData;
                            onSuccess(result);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                            onSuccess(false);
                        }
                    }
                });

            },

            //状态匹配
            convertFlag: function(value){
                if(value==0 || value==10 || value==7){
                    //return '正在处理';
                    return [KyeeI18nService.get('apply_cash.handling','正在处理',null),'#f18229'];
                }else if(value==1){
                    //return '申请成功';
                    return [KyeeI18nService.get('apply_cash.handledSuccess','申请成功',null),'#5baa8a'];
                }else if(value==8){
                    //return '充值成功';
                    return [KyeeI18nService.get('apply_cash.rechargeSuccess','充值成功',null),'#5baa8a'];
                }else if(value==9){
                    //return '充值失败';
                    return [KyeeI18nService.get('apply_cash.rechargeFail','充值失败',null),'#ef3737'];
                }else{
                    //return '申请失败'
                    return [KyeeI18nService.get('apply_cash.handledFail','申请失败',null),'#ef3737'];
                }
            },
            //转换为两位小数
            convertAmount: function (amount) {
                if(amount==undefined){
                    return "0";
                }
                amount = parseFloat(amount);
                return amount.toFixed(2);
            },
            //取银行卡后四位
            convertBankCardNoF: function (cardNo) {
                if(!cardNo){
                    return KyeeI18nService.get('apply_cash.hasDeleted','已删',null);
                }
                cardNo = cardNo.substr(cardNo.length-4, cardNo.length);
                return cardNo;
            },

            /**
             * 同步按钮点击
             */
            onGetNjRecordBtn:function($state){

                var patient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                //获取当前就诊卡
               // var patientCard = CacheServiceBus.getStorageCache().get('currentCardInfo');
                //var patientCard = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO).CARD_NO;
                var currentUserRecord = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                //用户未选择就诊人
                if(patient == undefined){
                    if(!currentUserRecord.NAME || !currentUserRecord.ID_NO){
                        KyeeMessageService.confirm({
                            title: KyeeI18nService.get('commonText.msgTitle',"消息",null),
                            content: KyeeI18nService.get('register_free.improvePatientMsg','您还没有完善个人信息，是否完善？',null),
                            onSelect: function (res) {
                                if(res){
                                    $state.go('account_authentication');
                                }
                            }
                        });
                        return ;
                    }
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get('commonText.msgTitle',"消息",null),
                        content:KyeeI18nService.get('register_free.pleaseSelectUserVsId','您还没有选择就诊者，是否选择？',null) ,
                        onSelect: function (res) {
                            if(res){
                                $state.go('custom_patient');
                            }
                        }
                    });
                    return;
                }/*else{
                    //该就诊者没有卡，进入查取就诊卡界面
                    if(patientCard == undefined){
                        KyeeMessageService.confirm({
                            title: KyeeI18nService.get('commonText.msgTitle',"消息",null),
                            content: KyeeI18nService.get('register_free.pleaseSelectPatient','您还没有选择就诊卡，是否选择？',null),
                            onSelect: function (res) {
                                if(res){
                                    $state.go("patient_card_select");
                                }
                            }
                        });
                        return ;
                    }
                }*/

                HttpServiceBus.connect({
                    url: 'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params: {
                        op:'getNJVisitStatusActionC',
                        USER_ID:currentUserRecord.USER_ID
                       /* PATIENT_ID:patientCard.PATIENT_ID*/
                    },
                    onSuccess: function (records) {
                        if (records.success) {
                            var msg = records.message;
                            KyeeMessageService.message({
                                title:KyeeI18nService.get('commonText.msgTitle',"消息",null),
                                content:msg
                            });
                        }
                        else {
                            var errorMsg = records.message;
                            var isBindPhone = records.isBindPhone;
                            // 不符合校验规则
                            KyeeMessageService.message({
                                title:KyeeI18nService.get('commonText.sysTipsMsg',"系统提示",null),
                                content:errorMsg
                            });
                            if(isBindPhone=='bindPhone'){
                                $state.go('binding12320');
                            }
                        }
                    }
                });
            },
            //检查是否是黑名单用户  任务:KYEEAPPC-4663
            checkBlackList:function(onSuccess){
                HttpServiceBus.connect({
                    url:'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params: {
                        op:'checkBlackListProcess'
                    },
                    onSuccess: function (resp) {
                        onSuccess(resp);
                    }
                });
            }

        };

        return def;
    })
    .build();
