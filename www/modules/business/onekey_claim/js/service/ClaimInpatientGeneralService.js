/**
 * 产品名称：quyiyuan
 * 创建者：董茁
 * 创建时间：2016年10月08日10:18:39
 * 创建原因：一键理赔住院已结算页面service
 * 任务号：KYEEAPPC-8139
 */
new KyeeModule()
    .group("kyee.quyiyuan.claim_inpatient_general.service")
    .require([])
    .type("service")
    .name("ClaimInpatientGeneralService")
    .params(["HttpServiceBus", "KyeeMessageService","CacheServiceBus", "KyeeUtilsService", "KyeeI18nService"])
    .action(function (HttpServiceBus, KyeeMessageService,CacheServiceBus, KyeeUtilsService, KyeeI18nService) {
        var def = {
            paidDetail:undefined,//住院缴费详情
            selectedTotal:0,//总数

            //获取住院记录数据
            queryInHospitalPatientHistoryFeeNew: function (onSuccess) {
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalId = storageCache.get("hospitalInfo").id;
                HttpServiceBus.connect({
                    url: "inHospitalPat/action/InHospitalPatientHistoryFeeActionC.jspx",
                    params: {
                        HOSPITALID_TREE:hospitalId,
                        op: "queryInHospitalPatientHistoryClaimsFeeNew"
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            var data = data.data;
                            data.success = true;
                            var info = [];
                            //有数据
                            if(data.TOTAL>0){
                                for(var i=0;i<data.INFO.length;i++){
                                    var payInfo = data.INFO[i].PAYMENT_INFO;
                                    if(payInfo){
                                        payInfo = JSON.parse(payInfo);
                                        for(var j=0;j<payInfo.length;j++){
                                            var detail = payInfo[j].DETAIL_DATA;
                                            if(detail){
                                                payInfo[j].DETAIL_DATA = JSON.parse(detail);
                                            }
                                            payInfo[j] = def.convertDate(payInfo[j]);
                                            info.push(payInfo[j]);
                                        }
                                    }
                                }
                                data.INFO = info;
                            }
                            onSuccess(true,data.INFO);

                        }
                        else{
                            data.success = false;
                            data.emptyText = data.message;
                            onSuccess(false,data);
                        }
                    }
                })
            },
            //取权限
            loadPermission:function(onSuccess){
                HttpServiceBus.connect({
                    url: "inHospitalPat/action/InHosPatientFeeActionC.jspx",
                    params: {
                        op: "getHospitalFeePermission"
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            var data = data.data;
                            onSuccess(data);
                        }
                    }
                })
            },
            convertDate:function(payInfo){
                var date = payInfo.ADMISSION_DATE;
                payInfo.year = date.substr(0,4);
                var m = KyeeI18nService.get("inpatient_paid_record.month","月");
                payInfo.month = date.substr(5,5).replace('/',m);
                var cur = KyeeUtilsService.DateUtils.formatFromDate(new Date(),'YYYY/MM/DD');
                var dateNew = KyeeUtilsService.DateUtils.formatFromDate(date,'YYYY/MM/DD');
                payInfo.isCurrent = cur==dateNew;
                return payInfo;
            }
        };
        return def;
    })
    .build();