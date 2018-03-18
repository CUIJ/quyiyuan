/**
 * Created by zxy on 15-5-27.
 */
new KyeeModule()
    .group("kyee.quyiyuan.ncms.myfamily.service")
    .require(["kyee.framework.file.upload"])
    .type("service")
    .name("myFamilyService")
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
        FAMILY_CODE:undefined,
        FAMILY_DATA:undefined,
        FAMILY_YEAR:undefined,
        FAMILY_FALSE_FLAG:undefined,
//            获取信息
            getUserInfo : function(ID_NO,NAME,onSuccess){
                HttpServiceBus.connect({
                    url : "/ncms/action/NCMSAction.jspx",
                    params : {
                        ID_NO : ID_NO,
                        NAME : NAME,
                        areaCode : 341602,//KYEEAPPC-4337 新农合查询，默认向服务端传递谯城区的编码。
                        op : "getFamilyInfo"
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
