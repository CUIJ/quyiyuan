/**
 * 产品名称 quyiyuan.
 * 创建用户: 淳思博
 * 日期: 2015/6/4.
 * 创建原因：新农合门诊报销服务
 * 修改： By
 * 修改： By
 */
new KyeeModule()
    .group("kyee.quyiyuan.ncms.outReim.service")
    .require([])
    .type("service")
    .name("OutReimService")
    .params(["HttpServiceBus","KyeeMessageService"])
    .action(function(HttpServiceBus,KyeeMessageService) {
        var def = {
            loadOutReim : function(familyCode, idNo, year, clinicDate, onSuccess){
                HttpServiceBus.connect({
                    url : "/ncms/action/NCMSAction.jspx",
                    params : {
                        op : "getClinicReimbursement",
                        FAMILY_CODE : familyCode,
                        YEAR : year,
                        areaCode : 341602,//KYEEAPPC-4337 新农合查询，默认向服务端传递谯城区的编码。
                        CLINIC_DATE: clinicDate,
                        ID_NO: idNo
                    },
                    onSuccess : function (resp) {
                        if(!resp){
                            return;
                        }else if(resp.success){
                            onSuccess(resp.data.rows);
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