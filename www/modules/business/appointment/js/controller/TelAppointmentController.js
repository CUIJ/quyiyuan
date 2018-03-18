/**
 * 产品名称：电话预约中间跳转页面
 * 创建者：王坤
 * 创建时间： 2016/8/22
 * 创建原因：登录页面的controller
 * 修改者：王坤
 * 任务号：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.telappointment.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.telappointment.service",
        "kyee.quyiyuan.login.service"
    ])
    .type("controller")

    .name("TelAppointmentController")
    .params(["$scope","$timeout", "$state", "KyeeViewService","KyeeListenerRegister", "CacheServiceBus", "TelAppointmentService",
        "HospitalSelectorService","MyCareDoctorsService","AppointmentDeptGroupService","LoginService","AppointmentRegistDetilService"])
    .action(function ($scope,$timeout, $state, KyeeViewService, KyeeListenerRegister, CacheServiceBus, TelAppointmentService,
                      HospitalSelectorService,MyCareDoctorsService,AppointmentDeptGroupService,LoginService,AppointmentRegistDetilService) {
        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "tel_appointment",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                var storageCache = CacheServiceBus.getStorageCache();
                var memoryCache = CacheServiceBus.getMemoryCache();
                var telUserInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.TEL_USER_INFO);
                TelAppointmentService.telAppointRedict(telUserInfo, function (data){
                    var routerURL = data.data.ROUTE;
                    var hospitalid = data.data.HOSPITAL_ID;
                    var regId = data.data.REG_ID;
                    // 3分钟内登陆过免登陆  gaomeng 2016年8月31日20:58:23
                   if("appointment_regist_list" == routerURL) {
                          //模拟登录过程
                           var memoryCacheLog = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                           memoryCacheLog.set(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN,true);
                           //var token = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK);
                           //保存token信息 防止框架拦截
                           memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK,data.data.CURRENT_USER.TOKEN);
                           memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, data.data.CURRENT_USER);
                           memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, data.data.CURRENT_PATIENT);
                           var currentRecord = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                           var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                           MyCareDoctorsService.queryHospitalInfo(hospitalid, function(result){
                                // 切换医院
                               HospitalSelectorService.selectHospital(hospitalid, result.HOSPITAL_NAME,
                                    result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                                    result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                        AppointmentDeptGroupService.HOSPITAL_ID_HISTORY = hospitalid;
                                        $state.go('appointment_regist_list');
                                    });
                            });
                        }else{
                       if("login" == routerURL){
                           //清除缓存数据记录，gaomeng 2016年8月31日20:58:23
                           LoginService.frontPage = "-1";
                           var cache = CacheServiceBus.getMemoryCache();
                           storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, "");
                           storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, "");
                           //storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TYPE, "");
                           storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE, "");
                           cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_PWD,undefined);  //MemoryCache中的密码
                           cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, undefined);
                           cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, undefined);
                           cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, undefined);
                           storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO,undefined);
                           storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO,undefined);
                           LoginService.logoff();
                           LoginService.logoutRongLian();
                           LoginService.phoneNumberFlag = undefined;
                           LoginService.registByPhone = 1;//传给登录界面的标识，为1表示从电话预约链接过来，需要登录后跳转到预约挂号记录页面
                              }
                            $state.go(routerURL);
                        }
                });
            }
        });
    })
    .build();
