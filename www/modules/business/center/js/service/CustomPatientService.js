/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪
 * 创建日期:2015年5月4日10:18:09
 * 创建原因：选择就诊者服务
 * 修改人：付添
 * 修改原因：增加就诊者删除个数限制
 * 时间：2016年5月4日10:27:36
 * 任务号：KYEEAPPC-6001
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.custom_patient.service")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("CustomPatientService")
    .params(["$state",
        "KyeeMessageService",
        "KyeeViewService",
        "HttpServiceBus",
        "KyeeI18nService",
        "$ionicHistory",
    "CenterUtilService",
    "CacheServiceBus"])
    .action(function ($state, KyeeMessageService, KyeeViewService, HttpServiceBus,KyeeI18nService,$ionicHistory,CenterUtilService,CacheServiceBus) {

        var def = {
            //分别返回各自的页面
            goOut: function () {
                $ionicHistory.goBack();
            },
            //查询切换就诊者请求
            queryCustomPatient: function (USER_ID, onSuccess) {
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    showLoading: true,
                    params: {
                        USER_ID: USER_ID,
                        FLAG: "cloud",
                        op: "queryCustomPatient"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            },
            //切换就诊者请求
            updateSelectFlag: function (item, hospitalId, onSuccess) {
                var userType = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_TYPE;
                var userId = item.USER_ID;
                var userVsId = item.USER_VS_ID;
                if(hospitalId == 1001){
                    //PATIENT_TYPE 0：体验就诊者  1：普通就诊者 KYEEAPPC-4627
                    if(item.PATIENT_TYPE == 1){
                        KyeeMessageService.message({
                            title : KyeeI18nService.get("update_user.sms","消息"),
                            content :KyeeI18nService.get("comm_patient_detail.testTip","您当前在趣医体验医院，只能使用体验就诊者体验，其他就诊者无法在体验医院进行相关业务操作!" ),
                            okText : KyeeI18nService.get("custom_patient.iRealKnow","我知道了！"),
                            onOk: function () {
                                def.goOut();
                            }
                        });
                    }
                }else{
                    HttpServiceBus.connect({
                        url: "/center/action/CustomPatientAction.jspx",
                        params: {
                            userId: userId,
                            userVsId: userVsId,
                            op: "updateSelectFlag",
                            USER_TYPE:userType
                        },
                        onSuccess: function (data) {
                            onSuccess(data);
                        }
                    });
                }
            },
            //强制刷新
            scope: {},
            updateView: function () {
                this.scope.queryCustomPatient();
            },

            //查询系统允许可维护就诊者的数量上限    --获取参数成功，则赋值为参数值，出现异常赋值为8（默认值）
            queryParamsystem: function (handleResult) {
                HttpServiceBus.connect({
                    url: "/config/action/ParamsystemActionC.jspx",
                    showLoading: false,
                    params: {
                        op: "querySysParams",
                        PARA_CODE: "PATIENT_ALLOW_COUNT"
                    },
                    onSuccess: function (retVal) {
                        if (retVal.success && retVal.data) {
                            var ValidPatientMaxCount = retVal.data.PATIENT_ALLOW_COUNT;
                            if(!CenterUtilService.isDataBlank( ValidPatientMaxCount)){
                                handleResult(ValidPatientMaxCount);
                            }else{
                                handleResult(8);  //出现异常赋值为8（默认值）
                            }
                        } else {
                            handleResult(8);  //出现异常赋值为8（默认值）
                        }
                    },
                    onError:function(){
                        handleResult(8);  //出现异常赋值为8（默认值）
                    }
                });
            }
        };
        return def;
    })
    .build();

