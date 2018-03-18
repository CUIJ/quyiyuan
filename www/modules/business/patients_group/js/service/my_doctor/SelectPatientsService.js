/**
 * Created by liwenjuan on 2016/11/29.
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.my_doctor.select_patients.service")
    .require(["kyee.quyiyuan.center.custom_patient.service"])
    .type("service")
    .name("SelectPatientsService")
    .params([
        "$state",
        "HttpServiceBus",
        "KyeeMessageService",
        "CacheServiceBus",
        "KyeeI18nService",
        "CustomPatientService"
    ])
    .action(function($state,HttpServiceBus,KyeeMessageService,CacheServiceBus,KyeeI18nService,
                     CustomPatientService){
        var def = {
            storageCache: CacheServiceBus.getStorageCache(),
            memoryCache : CacheServiceBus.getMemoryCache(),
            customsPatientsList: [], //当前就诊者信息列表,
            curDoctorInfo: null, //当前医生信息
            isFormPage: "", //来自于哪个页面
            /**
             * 发送报道申请(自动识别就诊者)
             * addBy liwenjuan 2016/11/29
             */
            sendReportRequest: function(scope,doctorInfo,patientInfo,callback){
                scope.remarksObj = {
                    remarkTitle:"请填写验证信息:",
                    remarkValue:"我是"+ patientInfo.OFTEN_NAME
                };
                scope.dialog = KyeeMessageService.dialog({
                    tapBgToClose : true,
                    template: "modules/business/patients_group/views/modify_remarks.html",
                    scope: scope,
                    title: KyeeI18nService.get("group_members.Title", "温馨提示"),
                    buttons: [
                        {
                            text: KyeeI18nService.get("group_members.send", "发送"),
                            style: 'button-size-l',
                            click: function () {
                                var regx = /^[\u4E00-\u9FA5A-Za-z 0-9]+$/;
                                if(scope.remarksObj.remarkValue && !regx.test(scope.remarksObj.remarkValue)){ //验证信息可以为空
                                    KyeeMessageService.broadcast({
                                        content: KyeeI18nService.get("contracts_list.invaildContent","请勿输入中文、英文、数字和空格之外的内容！")
                                    });
                                    return;
                                };
                                patientInfo.friendDesc = scope.remarksObj.remarkValue;
                                def.addDoctorRequest(doctorInfo,patientInfo,function(res){
                                    callback && callback(res);
                                });
                                scope.dialog.close();
                            }
                        }
                    ]
                });
            },

            /**
             * 向医生报道
             * addBy liwenjuan 2016/12/06
             * @param paramsInfo
             * @param callback
             */
            addDoctorRequest: function(doctorInfo,patientInfo,callback){
                var paramsInfo = {
                    "userVsId": patientInfo.USER_VS_ID,
                    "visitName": patientInfo.OFTEN_NAME,
                    "idNo": patientInfo.ID_NO,
                    "sex":patientInfo.SEX,
                    "dateOfBirth":patientInfo.DATE_OF_BIRTH,
                    "phone":patientInfo.PHONE,
                    "hospitalId": doctorInfo.hospitalId,
                    "deptCode":doctorInfo.deptCode,
                    "doctorCode": doctorInfo.doctorCode,
                    "doctorName":doctorInfo.doctorName,
                    "deptName":doctorInfo.deptName,
                    "friendDesc": patientInfo.friendDesc || ""
                };
                HttpServiceBus.connect({
                    url: "third:patientDoctor/add",
                    params: paramsInfo,
                    onSuccess: function(result){
                        if(result.success){
                            KyeeMessageService.message({
                                title: KyeeI18nService.get("commonText.tipMsg","温馨提示"),
                                content: "您的报道申请已成功发送,请等待医生审核。",
                                onOk: function(){
                                    callback && callback(result.success);
                                }
                            });
                        }else{
                            KyeeMessageService.broadcast({
                                content: result.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },

            /**
             * 获取当前用户就诊者列表
             * addBy liwenjuan 2016/11/30
             * @param callback
             */
            getCustomsPatients: function(scope,doctorInfo,callback){
                var userId = def.memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
                CustomPatientService.queryCustomPatient(userId,function(result){
                    if(result.success){
                        if(result.data && result.data.length >0){
                            if(1 == result.data.length){
                                var patientInfo = result.data[0];
                                def.sendReportRequest(scope,doctorInfo,patientInfo,callback);
                            }else{
                                def.customsPatientsList = result.data;
                                def.curDoctorInfo = doctorInfo;
                                $state.go("select_patients");
                            }
                        }else{
                            KyeeMessageService.confirm({
                                title: KyeeI18nService.get("commonText.warmTipMsg","温馨提示"),
                                content: KyeeI18nService.get("commonText.selectPatientMsg","您目前还没有就诊者信息，是否立即添加"),
                                okText: KyeeI18nService.get("commonText.selectOk","前往添加"),
                                cancelText: KyeeI18nService.get("commonText.selectCancel","以后再说"),
                                onSelect: function(res){
                                    if(res){
                                        $state.go("account_authentication");
                                    }
                                }
                            });
                        }
                    }else{
                        KyeeMessageService.broadcast({
                            content: result.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                            duration: 2000
                        });
                    }
                });
            },

            /**
             * 判断是否有默认的绑定就诊者信息
             * addBy liwenjuan 2016/12/01
             */
            getBindUserInfo: function(hospitalInfo,callback){
                var userId = def.memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
                HttpServiceBus.connect({
                    url: "third:/patientDoctor/getRelationStatus",
                    params: {
                        "userId": userId,
                        "hospitalId": hospitalInfo.hospitalId,
                        "deptCode": hospitalInfo.deptCode,
                        "doctorCode": hospitalInfo.doctorCode
                    },
                    onSuccess: function(result){
                        if(result.success){
                            var data = result.data || {};
                           callback && callback(data);
                        }else{
                            KyeeMessageService.broadcast({
                                content: result.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();