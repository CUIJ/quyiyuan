/**
 * 产品名称 quyiyuan
 * 创建用户: 张毅
 * 日期: 2017/05/16
 * 创建原因：评价页面service
 * 修改原因：
 * 修改用户：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.consult_satisfaction.service")
    .require([])
    .type("service")
    .name("ConsultSatisfactionService")
    .params(["HttpServiceBus", "ConsultOrderDetailService"])
    .action(function (HttpServiceBus, ConsultOrderDetailService) {
        var def = {

            /**
             * 获取评价项目
             * @param hospitalID
             * @param onSuccess
             * @param onError
             */
            querySurveyItems: function (hospitalID, onSuccess, onError) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/EachBusinessSatisfactionActionC.jspx",
                    params: {
                        op: "getSatisfactionItem",
                        itemHospitalId: hospitalID,
                        businessType: 1, //固定值 1-问诊模块
                        itemType: 2
                    },
                    onSuccess: function (resp) {
                        onSuccess && onSuccess(resp);
                    },
                    onError: function (resp) {
                        onError && onError(resp);
                    }
                });
            },

            /**
             * 提交订单时计算医生此次评价的平均分
             * @param postData
             * @param hospitalID
             * @param onSuccess
             * @param onError
             */
            calculateDoctorScore: function (postData, hospitalID, onSuccess, onError) {
                HttpServiceBus.connect({
                    type: "POST",
                    url: "/satisfaction/action/EachBusinessSatisfactionActionC.jspx",
                    params: {
                        op: "calculateDataScore",
                        forceSatification: "YES",
                        postdata: postData,
                        hospitalId: hospitalID
                    },
                    onSuccess: function (resp) {
                        onSuccess && onSuccess(resp);
                    },
                    onError: function (resp) {
                        onError && onError(resp);
                    }
                });
            },

            /**
             * 提交评价数据
             * @param postData
             * @param onSuccess
             * @param onError
             */
            submitSatisfactionData: function (postData, onSuccess, onError) {
                HttpServiceBus.connect({
                    type: "POST",
                    url: "third:pay_consult/doctor/satisfy/write",
                    params: {
                        forceSatification: "YES",
                        postData: postData
                    },
                    onSuccess: function (resp) {
                        onSuccess && onSuccess(resp);
                    },
                    onError: function () {
                        onError && onError(resp);
                    }
                });
            }
        };
        return def;
    })
    .build();