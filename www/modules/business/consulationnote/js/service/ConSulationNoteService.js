/**
* Created by lizhihu on 2017/7/5.
* 我的会诊记录对应的service
*/
new KyeeModule()
.group("kyee.quyiyuan.consulation.note.service")
.require([
    "kyee.quyiyuan.service_bus.cache",
    "kyee.framework.service.message",
    "kyee.framework.service.utils",
    "kyee.quyiyuan.consulation.note.detail.service"
])
.type("service")
.name("ConsulationNoteService")
.params(["$filter", "HttpServiceBus",
    "KyeeMessageService",
    "$state",
    "CacheServiceBus",
    "KyeeI18nService",
    "KyeeUtilsService",
    "ConsulationNoteDetailService"
])
.action(function ($filter, HttpServiceBus, KyeeMessageService, $state, CacheServiceBus, KyeeI18nService, KyeeUtilsService,ConsulationNoteDetailService) {
    return {
        formatDateTime: function (now) {
            return $filter('date')(now, 'yyyy-MM-dd HH:mm:ss');
        },

        /**
         * 获取当前就诊者的身份证号
         * @returns {null}
         */
        getCurrentCustomPatientIdNo: function(){
            var patientInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            if (!patientInfo || !patientInfo.ID_NO){
                return null;
            }
            return patientInfo.ID_NO;
        },

        /**
         * 获取MDT会诊记录接口
         * 详情见:http://w.quyiyuan.com/pages/viewpage.action?pageId=28049747#id-我的会诊记录前后端接口文档-1获取所有MDT会诊记录列表（APP提供）
         * @param param
         *      {
         *          idNo,        [string]   //就诊者身份证号
         *          currentPage， [number]   //分页当前页数，起始值为0
         *          pageSize,    [number]   //分页数据大小
         *          showLoading  [boolean]  //是否显示加载圈圈
         *      }
         * @param success        [function] //成功回调
         * @param error          [function] //失败回调
         */
        getMdtList: function (param, success, error) {
            var idNo = param.idNo || this.getCurrentCustomPatientIdNo();
            if (!idNo) { return; }

            HttpServiceBus.connect({
               url: 'consultation/action/ConsultationRecordActionC.jspx',
               params: {
                   op: "getAllConsultationRecordsActionC",
                   idCardNo: idNo,
                   currentPage: param.currentPage || 0,
                   pageSize: param.pageSize || 100
               },
               showLoading: param.showLoading,
               onSuccess: function (response) {
                   if (response.success) {
                       typeof success === 'function' && success(response.data);
                   } else {
                       //显示无数据提示
                       // KyeeMessageService.broadcast({
                       //     content: data.message,
                       //     duration: 3000
                       // });
                       typeof error === 'function' && error(response);
                   }
               },
                onError: function(err) {
                   typeof error === 'function' && error(err);
                }
           });
        },

        /**
         * 获取病理会诊记录列表
         * 详情见http://w.quyiyuan.com/pages/viewpage.action?pageId=28049747#id-我的会诊记录前后端接口文档-3获取所有病理会诊记录列表（APP提供）
         * @param param
         * @param success
         * @param fail
         */
        getRppList: function(param, success, fail) {
            var idNo = param.idNo || this.getCurrentCustomPatientIdNo();
            if (!idNo) { return; }

            HttpServiceBus.connect({
                url: 'consultation/action/ConsultationRecordActionC.jspx',
                params: {
                    op: "getPathologyConsultationRecordsActionC",
                    idCardNo: idNo,
                    currentPage: param.currentPage || 0,
                    pageSize: param.pageSize || 100
                },
                showLoading: param.showLoading,
                onSuccess: function (response) {
                    if (response.success) {
                        typeof success === 'function' && success(response.data);
                    } else {
                        typeof fail === 'function' && fail(response);
                    }
                },
                onError: function (err) {
                    typeof fail === 'function' && fail(err);
                }
            });
        }
    };

})
.build();


