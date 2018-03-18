/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年10月27日20:06:25
 * 创建原因：模糊搜索页面查询搜索相关医生控制器
 * 任务号：KYEEAPPC-3675
 */
new KyeeModule()
    .group("kyee.quyiyuan.multipleDoctorInfo.controller")
    .require([
        "kyee.quyiyuan.messagecenter.multiplequery.service",
        "kyee.quyiyuan.messagecenter.multipledoctorinfo.service",
        "kyee.framework.base.support.listener",
        "kyee.quyiyuan.home.service",
        "kyee.framework.service.message"
    ])
    .type("controller")
    .name("MultipleDoctorInfoController")
    .params(["$scope", "$state", "HospitalSelectorService", "CacheServiceBus", "HomeService", "MultipleQueryService","MultipleDeptInfoService","MyCareDoctorsService","AppointmentDeptGroupService","AppointmentDoctorDetailService","KyeeI18nService"])
    .action(function ($scope, $state, HospitalSelectorService, CacheServiceBus, HomeService,MultipleQueryService,MultipleDeptInfoService,MyCareDoctorsService,AppointmentDeptGroupService,AppointmentDoctorDetailService,KyeeI18nService) {

        $scope.noDoctorDic={ name :KyeeI18nService.get("multiple_query.multiple_doctorInfo.noDoctorDic","暂无医生简介")};
        //页面显示医院明和科室名在同一行时的问题
        for (var i=0; i < MultipleQueryService.allMetipleInfo.doctorData.length; i++) {
            if(MultipleQueryService.allMetipleInfo.doctorData[i].DOCTOR_DIC && MultipleQueryService.allMetipleInfo.doctorData[i].DOCTOR_DIC.length>33){
                MultipleQueryService.allMetipleInfo.doctorData[i].DOCTOR_DIC = MultipleQueryService.allMetipleInfo.doctorData[i].DOCTOR_DIC.substr(0, 33) + '...';
            }
        }
        $scope.multipleDoctorInfo = MultipleQueryService.allMetipleInfo.doctorData;

        $scope.selectMultipleDoctor = function(item){
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
        };

        /**
         * 点击搜索结果跳转页面函数
         * @param data
         */
        var jumpView = function (data) {
            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.LAST_APPOINT_ENTRANCE, 1);
                //跳转医生详情
                var deptData = {};
                deptData.DEPT_CODE = data.DEPT_CODE;
                deptData.DEPT_NAME = data.DEPT_NAME;
                deptData.DOCTOR_CODE = data.DOCTOR_CODE;
                deptData.DOCTOR_TITLE = data.DOCTOR_TITLE;
                deptData.DOCTOR_DESC = data.DOCTOR_DESC;
                deptData.DOCTOR_NAME = data.DOCTOR_NAME;
                deptData.HOSPITAL_ID = data.HOSPITAL_ID;
                deptData.HOSPITAL_NAME = data.HOSPITAL_NAME;
                deptData.IS_ONLINE = '0';
                AppointmentDoctorDetailService.doctorInfo = deptData;
                //医生列表的缓存
                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;//医生列表的缓存   By  张家豪  KYEEAPPTEST-2933
                $state.go("doctor_info");// 首页搜索模块搜索结果跳转问题   By  张家豪  KYEEAPPTEST-2933
        };
    })
    .build();

