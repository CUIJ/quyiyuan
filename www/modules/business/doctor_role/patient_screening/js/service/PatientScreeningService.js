/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年6月29日09:47:16
 * 创建原因：诊疗病人服务层
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctor_role.patient_screening.service")
    .type("service")
    .name("patientScreeningService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeMessageService","KyeeUtilsService"])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService,KyeeUtilsService) {

        var def = {
            storageCache: CacheServiceBus.getStorageCache(),
            memoryCache: CacheServiceBus.getMemoryCache(),
            cacheData:[],
            //初始化加载数据
            loadData: function (onSuccess, visitStatus, visitTimes, startDate, endDate, flag) {
                var visitTimesMin = 0;
                var visitTimesMax = '';
                //起止次数
                if (visitTimes == 1) {
                    visitTimesMin = 1;
                    visitTimesMax = 1;
                } else if (visitTimes == 2) {
                    visitTimesMin = 2;
                    visitTimesMax = 5;
                } else if (visitTimes == 6) {
                    visitTimesMin = 6;
                    visitTimesMax = 10;
                } else if (visitTimes == 10) {
                    visitTimesMin = 10;
                    visitTimesMax = 10;
                }

                var doctorCode = CacheServiceBus.getMemoryCache().
                    get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).DOCTOR_CODE;

                HttpServiceBus.connect({
                    url: "patientwords/action/PatientWordsActionC.jspx",
                    showLoading: flag,
                    params: {
                        op: "queryTreatMentPatientList",
                        HOSPITAL_ID: this.storageCache.get('hospitalInfo').id,
                        DOCTOR_CODE: doctorCode,
                        SCREENING_FLAG: '1',//筛选标识
                        VISIT_STATUS: visitStatus,//就诊状态
                        REG_DATE_BEGIN: KyeeUtilsService.DateUtils.formatFromString(startDate,"YYYY/MM/DD","YYYY-MM-DD"),//就诊起始日期
                        REG_DATE_END: KyeeUtilsService.DateUtils.formatFromString(endDate,"YYYY/MM/DD","YYYY-MM-DD"),//就诊终止日期
                        REG_COUNT_BEGIN: visitTimesMin,//就诊起始次数
                        REG_COUNT_END: visitTimesMax//就诊终止次数
                    },
                    onSuccess: function (resp) {
                        if(resp.success){
                            onSuccess(resp.data.rows);
                        } else if(resp.alertType == 'ALERT'){
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();