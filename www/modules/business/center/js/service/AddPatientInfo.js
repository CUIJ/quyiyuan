/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪
 * 创建日期:2015年5月4日10:18:09
 * 创建原因：附加就诊者服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.add_patient_info.service")//baobing
    .require(["kyee.framework.service.messager"])//input
    .type("service")
    .name("AddPatientInfoService")
    .params(["$state",
        "KyeeMessageService",
        "KyeeViewService",
        "HttpServiceBus",
        "KyeeI18nService"])//
    .action(function($state, KyeeMessageService, KyeeViewService,HttpServiceBus,KyeeI18nService){

        var def = {
            //查询切换就诊者请求
            queryCommPatient : function(USER_ID,FLAG, onSuccess){
                HttpServiceBus.connect({
                    url : "/center/action/CustomPatientAction.jspx",
                    params : {
                        USER_ID : USER_ID,
                        FLAG:FLAG,
                        op : "queryCommPatient"
                    },
                    onSuccess : function(data){
                        if(data != null&&data!=undefined){
                            onSuccess(data);
                        }else{
                        }
                    }
                });
            },
            ToNewFalse:function(){
                KyeeMessageService.message({
                    title : KyeeI18nService.get("add_patient_info.msg","消息"),
                    content : KyeeI18nService.get("add_patient_info.noHospitalTip","没有选择医院不能新增附加就诊者！"),
                    okText : KyeeI18nService.get("add_patient_info.iKnow","我知道了")
                });
            },
            //弹出框提示
            remind : function(message){
                KyeeMessageService.message({
                    title : KyeeI18nService.get("add_patient_info.msg","消息"),
                    content : message,
                    okText :  KyeeI18nService.get("add_patient_info.iKnow","我知道了")
                });
            },
            //强制刷新
            scope : {},
            updateView : function(){
                this.scope.selecthid();
            },
            //删除就诊者请求
            deleteCustomPatient : function(patientInfoStr, onSuccess){
                HttpServiceBus.connect({
                    url : "/center/action/CustomPatientAction.jspx",
                    params : {
                        postdata : patientInfoStr,
                        op : "deleteCustomPatient"
                    },
                    onSuccess : function(data){
                        if(data){
                            onSuccess(data);
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();

