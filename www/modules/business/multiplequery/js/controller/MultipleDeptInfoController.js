/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年10月27日20:06:25
 * 创建原因：模糊搜索页面查询搜索相关科室控制器
 * 任务号：KYEEAPPC-3675
 */
new KyeeModule()
    .group("kyee.quyiyuan.multipleDeptInfo.controller")
    .require([
        "kyee.quyiyuan.messagecenter.multiplequery.service",
        "kyee.quyiyuan.messagecenter.multipledeptinfo.service",
        "kyee.framework.base.support.listener",
        "kyee.quyiyuan.home.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.myquyi.my_care_doctors.service",
        "kyee.quyiyuan.appointment.service",
        "kyee.quyiyuan.multipleDeptInfo.controller",
        "kyee.quyiyuan.multipleHospitalInfo.controller"
    ])
    .type("controller")
    .name("MultipleDeptInfoController")
    .params(["$scope", "$state", "HospitalSelectorService", "CacheServiceBus", "HomeService","MultipleQueryService","MultipleDeptInfoService","MyCareDoctorsService","AppointmentDeptGroupService","KyeeI18nService"])
    .action(function ($scope, $state, HospitalSelectorService, CacheServiceBus, HomeService, MultipleQueryService,MultipleDeptInfoService,MyCareDoctorsService,AppointmentDeptGroupService,KyeeI18nService) {

        $scope.multipleDeptInfo = MultipleQueryService.allMetipleInfo.deptData;
        //跳转更多科室页面
        $scope.selectMultipleDept = function(item){
            MultipleQueryService.saveSearchHotInfo(item.INFO_MAPPING_ID, item.INFO_TYPE, item.CITY_ID);
            // 切换医院
            changeHospital(item);
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
                MyCareDoctorsService.queryHospitalInfo(data.HOSPITAL_ID, function(result){
                    // 切换医院
                    HospitalSelectorService.selectHospital(data.HOSPITAL_ID, result.HOSPITAL_NAME,
                        result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                        result.CITY_CODE, result.CITY_NAME, KyeeI18nService.get("multiple_query.switchHospital","医院正在切换中..."),
                        function (disableInfo) {
                            //预约挂号禁用权限
                            var hospitalInfo = CacheServiceBus.getStorageCache().get('hospitalInfo');
                            if(hospitalInfo && hospitalInfo.is_home_appoint_enable == '1'){
                                jumpView(data);
                            }else{
                                KyeeMessageService.broadcast({
                                    content:disableInfo
                                });
                            }
                        });
                });
            }
        }

        /**
         * 点击搜索结果跳转页面函数
         * @param data
         */
        var jumpView = function (data) {
            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.LAST_APPOINT_ENTRANCE, 1);
                var deptData = {};
                deptData.DEPT_CODE = data.DEPT_CODE;
                deptData.DEPT_NAME = data.DEPT_NAME;
                deptData.IS_ONLINE = '0';
                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                $state.go("appointment_doctor");
            };
    })
    .build();

