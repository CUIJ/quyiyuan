/**
 * 产品名称：quyiyuan
 * 创建者：李聪
 * 创建时间：2016年6月23日
 * 创建原因：消息提醒服务层
 *
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.reminder.service")
    .require([])
    .type("service")
    .name("ReminderService")
    .params([
    "HttpServiceBus"
     ])
    .action(function(HttpServiceBus){
        var def = {
            // 检查检验单提醒
            reportData : undefined,
            // 医嘱提醒
            doctorOrdersData: undefined,
            // 病历提醒
            medicalRecordData: undefined,
            //检验检查单提醒是否是从微信跳转过来的  edit by wangsannv
            isReportFromWeiXin:false,
            //医嘱提醒是否是从微信跳转过来的  edit by wangsannv
            isDoctorOrderFromWeiXin:false,
            //病历提醒是否是从微信跳转过来的  edit by wangsannv
            isMedicalRecordFromWeiXin:false,
            //从微信传过来的消息主键
            messageId:undefined,
            loadData: function(messageId,successCall){
                var self = this;
                if(messageId){
                    HttpServiceBus.connect({
                        url: "messageCenter/action/MessageCenterActionC.jspx",
                        params: {
                            op: "loadMessageById",
                            messageId:messageId
                        },
                        onSuccess: function (data) {
                            if (data.success) {
                                var result=data.data.MESSAGE_PARAMETER;
                                var jsonData=JSON.parse(result);
                                successCall(jsonData);
                                /* if(pushType=="report"){
                                 self.reportData=result;
                                 }else if(pushType=="doctor"){
                                 self.doctorOrdersData=result;
                                 }else if(pushType=="case"){
                                 self.medicalRecordData=result;
                                 }*/
                            }
                        }
                    });
                    self.isReportFromWeiXin=false;
                    self.isDoctorOrderFromWeiXin=false;
                    self.isMedicalRecordFromWeiXin=false;
                    self.messageId=undefined;
                }
            }
        };
        return def;
    })
    .build();