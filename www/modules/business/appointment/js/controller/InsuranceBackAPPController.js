/**
 * 产品名称：保险页面返回到APP
 * 创建者：高萌
 * 创建时间： 2017年1月18日15:36:40
 * 创建原因：登录页面的controller
 * 修改者：高萌
 * 任务号：KYEEAPPC-8861
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.insurancebackapp.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.insurancebackapp.service",
        "kyee.quyiyuan.login.service"
    ])
    .type("controller")

    .name("InsuranceBackAPPController")
    .params(["$scope","$timeout", "$state", "KyeeViewService","KyeeListenerRegister", "CacheServiceBus", "InsuranceBackAPPService",
        "HospitalSelectorService","MyCareDoctorsService","AppointmentDeptGroupService","LoginService","AppointmentRegistDetilService"])
    .action(function ($scope,$timeout, $state, KyeeViewService, KyeeListenerRegister, CacheServiceBus, InsuranceBackAPPService,
                      HospitalSelectorService,MyCareDoctorsService,AppointmentDeptGroupService,LoginService,AppointmentRegistDetilService) {
        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "insurance_back_app",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                var storageCache = CacheServiceBus.getStorageCache();
                var memoryCache = CacheServiceBus.getMemoryCache();
                var insuranceUserInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.INSURANCE_USER_INFO);
                InsuranceBackAPPService.insuranceBackAPP(insuranceUserInfo, function (data){
                    var routerURL = data.data.ROUTE;
                    var hospitalid = data.data.HOSPITAL_ID;
                    var regId = data.data.REG_ID;
                    //从保险页面返回到预约挂号完成页或者我的页面
                    if("appointment_result" == routerURL){
                           //重新给当前医院、当前用户和当前就诊者的缓存赋值
                           var memoryCacheLog = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                           memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, data.data.CURRENT_USER);
                           memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, data.data.CURRENT_PATIENT);
                           AppointmentRegistDetilService.RECORD.HOSPITAL_ID = hospitalid;
                           AppointmentRegistDetilService.RECORD.REG_ID = regId;
                            MyCareDoctorsService.queryHospitalInfo(hospitalid, function(result){
                                $state.go(routerURL);
                            });


                    }else{
                        //直接跳转到“我的页面”或者“首页”
                        $state.go(routerURL);
                    }
                });
            }
        });
    })
    .build();
