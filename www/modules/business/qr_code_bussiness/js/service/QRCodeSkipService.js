new KyeeModule()
    .group("kyee.quyiyuan.qrcodeSkip.service")
    .require([
    ])
    .type("service")
    .name("QRCodeSkipService")
    .params(["KyeeUtilsService","HttpServiceBus","$state","CacheServiceBus","Md5UtilService","KyeeMessageService"])
    .action(function (KyeeUtilsService,HttpServiceBus,$state,CacheServiceBus,Md5UtilService,KyeeMessageService) {
        var def = {
            cache : CacheServiceBus.getMemoryCache(),
            storageCache : CacheServiceBus.getStorageCache(),
            /**
             * 根据用户ID和就诊者ID查询用户信息状态
             */
            queryUserInfoByOpenId:function(showLoadingFlag, openId,hospitalId,token, onSuccess){
                var timestamp = (Date.parse(new Date())/1000000).toString().split(".")[0];
                var mdKey = Md5UtilService.md5("openId="+openId+"&timestamp="+timestamp+"&key=quyi");
                HttpServiceBus.connect({
                    url: "/user/action/QRCodeBusinessActionC.jspx",
                    showLoading: showLoadingFlag,
                    params: {
                        op: "checkUserExist",
                        openId:openId,
                        token:token,
                        key:mdKey,
                        hospitalId:hospitalId
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
                var pageCode = "qyCodeMessageSkip";
                if(1==objParams.isLogin){
                    pageCode = "qyCodeMessageSkipHadLogin"
                }
                var record = {
                    "PAGE_CODE":pageCode,
                    "ELEMENT_CODE": objParams.skipRoute,
                    "OPERATE_TIME": KyeeUtilsService.DateUtils.getDate("YYYY-MM-DD HH:mm:ss"),
                    "HOSPITAL_ID":objParams.hospitalID,
                    "USER_ID":objParams.USER_ID
                };
                if(record.ELEMENT_CODE == 'attending_doctor'){
                    record.DEPT_CODE =  decodeURI(objParams.deptCode);
                }else if(record.ELEMENT_CODE == 'doctor_info'){
                    record.DOCTOR_CODE = decodeURI(objParams.doctorCode);
                    record.DEPT_CODE =  decodeURI(objParams.deptCode);
                }
                opRecords.push(record);
                // 延迟5秒向后台发送操作记录
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
                    5000);
            }
        };

        return def;
    })
    .build();
