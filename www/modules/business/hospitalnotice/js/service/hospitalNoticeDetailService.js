/**
 * Created by Administrator on 2015/5/19.
 */
new KyeeModule()
    .group("kyee.quyiyuan.hospitalNoticeDetail.service")
    .type("service")
    .name("HospitalNoticeDetailService")
    .params(["KyeeMessagerService","HttpServiceBus"])
    .action(function(KyeeMessageService,HttpServiceBus){
        var def = {
            hospitalNoticeDetail:[],  //定义获取公告标题信息
            queryHospitalNoticeInfroDetail:function(Callback,id){
                HttpServiceBus.connect({
                    url : "announcement/AnnouncementAction.jspx",
                    params : {
                        loc : "c",
                        op : "queryAnnouncementById",
                        ANCID:id
                    },
                    onSuccess : function (resp) {
                        if (resp!=null && resp!=undefined) {
                            Callback(resp);
                        }
                    }
                });
            }


        }

        return def;
    })
    .build();