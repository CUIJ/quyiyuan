/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年8月26日14:39:30
 * 创建原因：已缴费用消息记录服务层
 * 任务号：KYEEAPPC-7609
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.clinicPaidMessage.service")
    .type("service")
    .name("ClinicPaidMessageService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeMessageService","PaidRecordService"])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService,PaidRecordService) {
        var def = {

            //获取多笔已缴费列表
            getPaidList:function($state,params){
                PaidRecordService.params = params;
                PaidRecordService.loadPaidRecord(params,function(success,data){
                    if(success){
                        if(data == 'clinic_paid_message'){
                            $state.go(data);
                        }
                        else{
                            $state.go("paid_record");
                        }
                    }
                    else{
                        KyeeMessageService.broadcast({
                            content: data
                        });
                    }
                });
            }
        };
        return def;
    })
    .
    build();