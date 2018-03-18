/**
 * 产品名称：趣医院
 * 创建者：张毅
 * 创建时间：2016/12/19
 * 创建原因：病友圈三期[精准医患管理系统]之随访回访列表获取\提交service
 * 修改者：
 * 修改原因：
 *
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.questionnaire_survey.service")
    .require([])
    .type("service")
    .name("QuestionnaireSurveyService")
    .params([
        "$http",
        "HttpServiceBus",
        "KyeeMessageService",
        "KyeeI18nService"
    ])
    .action(function ($http,HttpServiceBus, KyeeMessageService, KyeeI18nService) {
        var def = {
            //存放页面参数
            queryQuestionInfoParams:{
                hospitalId: null,
                deptCode: null,
                doctorCode: null,
                scUserId: null,
                scUserVsId: null,
                scRecordId: null,
                patientName: null
            },
            //聊天界面判断来自随访回访提交按钮时要特殊处理，模拟用户发送一条消息。
            isFromQuestionnairePageFlag:false,
            /**
             * 根据相关参数获取对应的随访回访表单数据
             * @param onSuccessCallBack
             */
            queryQuestionInfo: function (onSuccessCallBack) {
                HttpServiceBus.connect({
                    url: "third:backVisitFormForApp/get/BackVisitForm",
                    params: {
                        hospitalId: def.queryQuestionInfoParams.hospitalId,
                        deptCode: def.queryQuestionInfoParams.deptCode,
                        doctorCode: def.queryQuestionInfoParams.doctorCode,
                        scUserId: def.queryQuestionInfoParams.scUserId,
                        scUserVsId: def.queryQuestionInfoParams.scUserVsId,
                        scRecordId: def.queryQuestionInfoParams.scRecordId
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccessCallBack && onSuccessCallBack(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },

            /**
             * 收集用户的答案，提交至后台
             * @param answer
             * @param onSuccessCallBack
             */
            submitAnswer: function (answer, onSuccessCallBack) {
                HttpServiceBus.connect({
                    url: "third:backVisitFormForApp/save/saveBackVisitFormInfo",
                    type: "POST",
                    params: {
                        postData:JSON.stringify(answer)
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccessCallBack && onSuccessCallBack(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            }

        };
        return def;
    }).build();