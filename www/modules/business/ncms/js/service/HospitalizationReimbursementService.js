/**
 * Created by zxy on 15-5-27.
 */
new KyeeModule()
    .group("kyee.quyiyuan.ncms.hospitalizationreimbursement.service")
    .require(["kyee.framework.file.upload"])
    .type("service")
    .name("HospitalizationReimbursementService")
    .params([
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeUtilsService",
        "LoginService",
        "Md5UtilService",
        "KyeeUploadFileService",
        "HomeUserService"
    ])
    .action(function(
        $state,
        KyeeMessageService,
        KyeeViewService,
        HttpServiceBus,
        CacheServiceBus,
        KyeeUtilsService,
        LoginService,
        Md5UtilService,
        KyeeUploadFileService,
        HomeUserService
        ){
        var def = {
            //获取信息
            getHospitalReimbursement : function(FAMILY_CODE,YEAR,ID_NO,HOSPITALIZED_DATE,onSuccess){
                HttpServiceBus.connect({
                    url : "/ncms/action/NCMSAction.jspx",
                    params : {
                        FAMILY_CODE : FAMILY_CODE,
                        areaCode : 341602,//KYEEAPPC-4337 新农合查询，默认向服务端传递谯城区的编码。
                        YEAR : YEAR,
                        ID_NO : ID_NO,
                        HOSPITALIZED_DATE : HOSPITALIZED_DATE,
                        op : "getHospitalReimbursement"
                    },
                    onSuccess : function(data){
                        if(data != null&&data!=undefined){
                            onSuccess(data);

                        }
                    }
                });
            }
        };
        return def;
    })
    .build();