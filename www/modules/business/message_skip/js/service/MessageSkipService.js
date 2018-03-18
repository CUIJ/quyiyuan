/**
 * 产品名称：quyiyuan
 * 任务号：KYEEAPPC-9543
 * 创建者：杨旭平
 * 创建时间： 2017/1/9
 * 创建原因：短信跳转控制页面服务
 */

new KyeeModule()
    .group("kyee.quyiyuan.messageSkip.service")
    .require([
        "kyee.quyiyuan.center.custom_patient.service",
        "kyee.quyiyuan.hospital.hospital_selector.service"
    ])
    .type("service")
    .name("MessageSkipService")
    .params(["HttpServiceBus","$state","CenterUtilService","CacheServiceBus","LoginService",
        "AccountAuthenticationService","CustomPatientService","KyeeI18nService","KyeeMessageService",
        "HospitalSelectorService","KyeeUtilsService","Md5UtilService"])
    .action(function (HttpServiceBus,$state,CenterUtilService,CacheServiceBus,LoginService,
                      AccountAuthenticationService,CustomPatientService,KyeeI18nService,KyeeMessageService,
                      HospitalSelectorService,KyeeUtilsService,Md5UtilService) {

        var def = {
            cache : CacheServiceBus.getMemoryCache(),
            storageCache : CacheServiceBus.getStorageCache(),
            /**
             * 根据用户ID和就诊者ID查询用户信息状态
             */
            queryUserInfoStatus:function(showLoadingFlag, objParams, token, onSuccess){
                var timestamp = (Date.parse(new Date())/1000000).toString().split(".")[0];
                var mdKey = Md5UtilService.md5("userId="+objParams.userId+"&timestamp="+timestamp+"&key=quyi");
                HttpServiceBus.connect({
                    url: "/user/action/BusinessMessagePushActionC.jspx",
                    showLoading: showLoadingFlag,
                    params: {
                        op: "queryUserInfoStatus",
                        userId: objParams.userId,
                        userVsId: objParams.userVsId,
                        notCheckUserVsId: objParams.notCheckUserVsId,
                        token:token,
                        key:mdKey
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                            $state.go("home->MAIN_TAB");
                        }
                    }
                });
            },
            /**
             * 记录用户关于就医全流程URL点击跳转的记录
             * @param objParams
             */
            addRecord : function(objParams){
                var opRecords = [];
                var record = {
                    "PAGE_CODE": "messageSkip",
                    "ELEMENT_CODE": objParams.skipRoute,
                    "OPERATE_TIME": KyeeUtilsService.DateUtils.getDate("YYYY-MM-DD HH:mm:ss"),
                    "USER_ID":objParams.userId,
                    "HOSPITAL_ID":objParams.hospitalId
                };
                opRecords.push(record);
                // 延迟3秒向后台发送操作记录
                setTimeout(
                    function(){
                        HttpServiceBus.connect({
                            type: "POST",
                            url : "/CloudManagement/operation/action/OperationRecordsActionC.jspx?",
                            showLoading: false,
                            params : {
                                op: "monitorRecords",
                                monitorRecords : opRecords
                            }
                        });
                    },
                    3000);
            }
        };

        return def;
    })
    .build();
