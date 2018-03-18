/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年10月8日10:34:08
 * 创建原因：门诊缴费凭证服务
 * 任务号：KYEEAPPC-8138
 */
new KyeeModule()
    .group("kyee.quyiyuan.clinicClaim.service")
    .type("service")
    .name("ClinicClaimService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeUtilsService"])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeUtilsService) {
        var def = {
            selectedTotal:0,//勾选总数
            largeChannelMsg:'',
            //获取已缴费数据
            getClinicData: function (getData) {
                        var storageCache = CacheServiceBus.getStorageCache();
                        var hospitalId = storageCache.get("hospitalInfo").id;//当前医院信息
                        HttpServiceBus.connect({
                            url: "payment/action/PaymentActionC.jspx",
                            params: {
                                op: "getClaimsPayHis",
                                HOSPITALID_TREE:hospitalId,
                                SORT_RULE:1,
                                FROM_HOSPITAL_VIEW:1,
                            },
                    onSuccess: function (data) {

                        if (data.success) {
                            var rows = data.data.rows;
                            if(rows && rows.length>0){
                                var paidData = [];
                                var payTime;
                                var amount;
                                //将JSON字符串装换为对象
                                for (var i = 0; i < rows.length; i++) {
                                    rows[i].PAYMENT_INFO = JSON.parse(rows[i].PAYMENT_INFO);
                                    paidData = paidData.concat(rows[i].PAYMENT_INFO);
                                }
                                for(var i=0;i<paidData.length;i++){
                                    //预约挂号数据
                                    if(paidData[i].DEPT_NAME){
                                        if(paidData[i].ORDER_TIME){
                                            payTime = paidData[i].ORDER_TIME;
                                        }
                                        else{
                                            payTime = paidData[i].REG_CREATE_TIME;
                                        }
                                        amount = paidData[i].ACTUAL_AMOUNT;
                                    }
                                    else{
                                        payTime = paidData[i].PAY_DATE;
                                        amount = paidData[i].ACCOUNT_SUM;
                                        def.largeChannelMsg=  JSON.parse(data.message).TIPS;
                                    }
                                    payTime = def.convertDate(payTime);
                                    paidData[i].payTime = payTime;
                                    paidData[i].amount = amount;
                                }
                                getData(true,paidData,def.largeChannelMsg);
                            }
                            else{
                                getData(false,'',def.largeChannelMsg);
                            }
                        }
                        else {
                            getData(false,'',def.largeChannelMsg);
                        }
                    },
                    onError: function () {
                    }
                })
            },

            //日期格式转换
            convertDate : function(v){
                if(v){
                    var time = v.substr(0,19);
                    //var time = KyeeUtilsService.DateUtils.formatFromDate(v,'YYYY/MM/DD');
                    return time;
                }
            }
        };
        return def;
    })
    .
    build();