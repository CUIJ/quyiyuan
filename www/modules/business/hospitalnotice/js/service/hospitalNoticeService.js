/**
 * Created by Administrator on 2015/5/19.
 */
new KyeeModule()
    .group("kyee.quyiyuan.hospitalnotice.service")
    .type("service")
    .name("HospitalNoticeService")
    .params(["KyeeMessagerService","HttpServiceBus"])
    .action(function(KyeeMessageService,HttpServiceBus){
        var def = {
            //查询公告信息类型
            queryHospitalNoticeType:function(Callback,hospitalId){
                HttpServiceBus.connect({
                    url : "announcement/AnnouncementAction.jspx",
                    showLoading:false,//禁用后台发送请求的加载滚动条  KYEEAPPTEST-2716
                    params : {
                        loc : "c",
                        op : "onFirstClickAnnouncementBtn",
                        HOSPITAL_ID:hospitalId
                    },
                    onSuccess : function (resp) {
                        if (resp!=null && resp!=undefined) {
                            Callback(resp);
                        }
                    }
                });
            },
            queryHospitalNoticeInfro:function(Callback,hospitalId,typeId,page,pageSize){
                HttpServiceBus.connect({
                    url : "announcement/AnnouncementAction.jspx",
                    showLoading:false, //禁用后台发送请求的加载滚动条  KYEEAPPTEST-2716
                    params : {
                        loc : "c",
                        op : "queryAnnouncementList",
                        HOSPITAL_ID:hospitalId,
                        TYPE:typeId,
                        start: 0,
                        PAGE:page,
                        PAGECOUNT: pageSize  //每页接收记录条数
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