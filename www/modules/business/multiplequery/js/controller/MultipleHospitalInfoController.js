/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年10月27日20:06:25
 * 创建原因：模糊搜索页面查询搜索相关医院控制器
 * 任务号：KYEEAPPC-3675
 */
new KyeeModule()
    .group("kyee.quyiyuan.multipleHospitalInfo.controller")
    .require([
        "kyee.quyiyuan.messagecenter.multiplequery.service",
        "kyee.quyiyuan.messagecenter.multiplehospitalinfo.service",
        "kyee.framework.base.support.listener",
        "kyee.quyiyuan.home.service",
        "kyee.framework.service.message"
    ])
    .type("controller")
    .name("MultipleHospitalInfoController")
    .params(["$scope", "$state", "HospitalSelectorService", "CacheServiceBus", "HomeService","MultipleQueryService","MultipleDeptInfoService","MyCareDoctorsService","AppointmentDeptGroupService","KyeeI18nService"])
    .action(function ($scope, $state,  HospitalSelectorService, CacheServiceBus, HomeService,MultipleQueryService,MultipleDeptInfoService,MyCareDoctorsService,AppointmentDeptGroupService,KyeeI18nService) {
        $scope.FeatureDeptHasData = [];
        $scope.noHospitalAddress={ name :KyeeI18nService.get("multiple_query.multiple_hospitalInfo.noHospitalAddress","暂无医院地址")};

        $scope.multipleFeatureDept = [];

        $scope.multipleHospitalInfo = MultipleQueryService.allMetipleInfo.hospitalData;

        //点击特色科室时页面跳转
        $scope.goFeatureDept = function(item,items){
            $scope.FeatureDeptFlag = false;
            MultipleQueryService.saveSearchHotInfo(items.INFO_MAPPING_ID, items.INFO_TYPE, items.CITY_ID);
            // 切换医院
            changeHospitalFeatureDept(item,items);

        };
        //点击特色科室切换医院
        var changeHospitalFeatureDept = function (data,datas) {
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            if(data.HOSPITAL_ID == hospitalId){
                jumpFeatureDeptView(data,datas);
            } else {
                MyCareDoctorsService.queryHospitalInfo(data.HOSPITAL_ID, function(result){
                    // 切换医院
                    HospitalSelectorService.selectHospital(data.HOSPITAL_ID, result.HOSPITAL_NAME,
                        result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                        result.CITY_CODE, result.CITY_NAME, KyeeI18nService.get("multiple_query.switchHospital","医院正在切换中..."),
                        function (disableInfo) {
                            //预约挂号禁用权限
                            var hospitalInfo = CacheServiceBus.getStorageCache().get('hospitalInfo');
                            if(hospitalInfo && hospitalInfo.is_home_appoint_enable == '1'){
                                jumpFeatureDeptView(data,datas);
                            }else{
                                KyeeMessageService.broadcast({
                                    content:disableInfo
                                });
                            }
                        });
                });
            }
        };
        //点击特色科室跳转科室列表
        var jumpFeatureDeptView = function (data,datas) {
            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.LAST_APPOINT_ENTRANCE, 1);
            var deptData = {};
            deptData.DEPT_CODE = datas.DEPT_CODE;
            deptData.DEPT_NAME = datas.DEPT_NAME;
            AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
            $state.go("appointment_doctor");
        };

        //挑转更多医院的信息
        $scope.selectMultipleHospital = function(item) {
            if ($scope.FeatureDeptFlag) {
                MultipleQueryService.saveSearchHotInfo(item.INFO_MAPPING_ID, item.INFO_TYPE, item.CITY_ID);
                // 切换医院
                changeHospital(item);
            }else{
                $scope.FeatureDeptFlag = true;
            }
        };

        /**
         * 切换医院函数
         * @param data
         */
        var changeHospital = function (data) {
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            if(data.HOSPITAL_ID == hospitalId){
                jumpView(data);
            } else {
                // 切换医院
                HospitalSelectorService.selectHospital(data.HOSPITAL_ID, data.HOSPITAL_NAME,
                    data.MAILING_ADDRESS, data.PROVINCE_CODE, data.PROVINCE_NAME,
                    data.CITY_CODE, data.CITY_NAME, KyeeI18nService.get("multiple_query.switchHospital","医院正在切换中..."), function () {
                        jumpView(data);
                    });
            }
        };

        /**
         * 点击搜索结果跳转页面函数
         * @param data
         */
        var jumpView = function (data) {
            //转诊标识2转诊  0不转诊
            AppointmentDeptGroupService.IS_REFERRAL = 0;
            $state.go("appointment");
        };
    })
    .build();

