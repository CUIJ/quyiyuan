/**
 * 产品名称 quyiyuan.
 * 创建用户: 淳思博
 * 日期: 2015/5/20.
 * 创建原因：C端口 home页面公告部分
 * 修改： By
 * 修改： By
 */
new KyeeModule()
    .group("kyee.quyiyuan.home.noticeCenter.service")
    .type("service")
    .name("NoticeCenterService")
    .params(["HttpServiceBus", "CacheServiceBus","KyeeMessageService"])
    .action(function(HttpServiceBus,CacheServiceBus,KyeeMessageService){
        var def = {
            //根据id删除公告
            delNotice : function(param, onSuccess){
                HttpServiceBus.connect({
                    showLoading : false,
                    url : "/medicalGuideWindow/action/MedicalGuideWindowActionC.jspx",
                    params : {
                        op: "deleteMedicalGuideWindowById",
                        MESSAGE_ID: param.msgId
                    },
                    onSuccess : function (resp) {
                        if(resp.success){
                            onSuccess();
                        }else{
                            KyeeMessageService.broadcast({
                                content: resp.message,
                                duration:3000
                            });
                        }
                    }
                });
            },

            //加载
            loadNoticeSucess : null,
            loadNotice : function(flag){
                var me = this;
                var customPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                var userVsId = customPatient ? customPatient.USER_VS_ID : "";
                HttpServiceBus.connect({
                    url : "/medicalGuideWindow/action/MedicalGuideWindowActionC.jspx",
                    params : {
                        op: "queryActiveMedicalGuideWindowList",
                        USER_VS_ID: userVsId
                    },
                    onSuccess : function (resp) {
                        if(resp.success){
                            if(me.loadNoticeSucess != null){
                                //防止其他处回调登录、切换，连带回调此处
                                me.loadNoticeSucess(resp.data,flag);
                            }
                        }else{
                            KyeeMessageService.broadcast({
                                content: resp.message,
                                duration:3000
                            });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();



