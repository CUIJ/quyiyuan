/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年8月25日14:48:19
 * 创建原因：免挂号费页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.registerFree.service")
    .require([])
    .type("service")
    .name("RegisterFreeService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeMessageService",
        "$state", "KyeeViewService", "QueryHisCardService","KyeeI18nService"])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService,
                      $state, KyeeViewService, QueryHisCardService,KyeeI18nService) {

        var def = {
            /**
             * 获取免挂号费记录
             */
            getRegisterFreeRecords : function(onSuccess){

                var currentHospitalId = CacheServiceBus.getStorageCache().
                    get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

                HttpServiceBus.connect({
                    url: 'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params : {
                        op: "queryFreePayRecord"
                    },
                    onSuccess : function (resp) {
                        if(resp.success){
                            onSuccess(resp.data);
                        } else if(resp.alertType == 'ALERT'){
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            },

            /**
             * 同步按钮点击
             */
            onGetNjRecordBtn:function($scope){

                var patient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                //获取当前就诊卡
                var patientCard = CacheServiceBus.getStorageCache().get('currentCardInfo');
                var currentUserRecord = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                //用户未选择就诊人
                if(patient == undefined){
                    if(currentUserRecord.NAME=="" ||currentUserRecord.NAME==null||
                        currentUserRecord.ID_NO==""||currentUserRecord.ID_NO==null){
                        KyeeMessageService.confirm({
                            title: KyeeI18nService.get('commonText.msgTitle',"消息",null),
                            content: KyeeI18nService.get('register_free.improvePatientMsg','您还没有完善个人信息，是否完善？',null),
                            onSelect: function (res) {
                                if(res){
                                    $state.go('update_user');
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
                }else{
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
                }
                var me = this;
                HttpServiceBus.connect({
                    url: 'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params: {
                        op:'getNJVisitStatusActionC',
                        USER_ID:currentUserRecord.USER_ID,
                        PATIENT_ID:patientCard.PATIENT_ID
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
            }

        };

        return def;
    })
    .build();
