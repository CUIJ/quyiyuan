// add by huabo KYEEAPPC-4436 诊所介绍页面controller
new KyeeModule()
    .group("kyee.quyiyuan.hospital.clinic_introduce.controller")
    .require(["kyee.framework.filter.common"
        ,"kyee.quyiyuan.hospital.hospitalWeb.controller"])
    .type("controller")
    .name("ClinicIntroduceController")
    .params(["$state","$scope", "$rootScope", "CacheServiceBus", "HospitalDetailService", "HospitalService", "KyeeListenerRegister", "KyeeUtilsService"])
    .action(function($state, $scope, $rootScope, CacheServiceBus, HospitalDetailService, HospitalService, KyeeListenerRegister, KyeeUtilsService){

        $scope.HOSPITAL_INFO = {
            SCORE:''
        };
        $scope.SHOW_SCORE = false;
        KyeeListenerRegister.regist({
            focus: "clinic_introduce",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            action: function (params) {
                var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                HospitalDetailService.loadHospitalIntroduce(hospitalId,function(data){
                    $scope.HOSPITAL_NAME = data.HOSPITAL_NAME;
                    $scope.HOSPITAL_LEVEL = data.HOSPITAL_LEVEL;
                    $scope.HOSPITAL_INFO.SCORE = data.HOSPITAL_SCORE;
                    $scope.SCORE = data.HOSPITAL_SCORE;
                    $scope.ADV_HOSPITAL_INTRO = data.ADV_HOSPITAL_INTRO;
                    $scope.LOGO_PHOTO = data.LOGO_PHOTO;
                    $scope.SHOW_SCORE = data.SHOW_SCORE;
                    $scope.ADV_LOCAL = undefined;
                    if(1001 != hospitalId && 'http://www.quyiyuan.com/' != data.ADV_LOCAL&&((data.ADV_LOCAL.indexOf('https'))>-1)){
                        $scope.ADV_LOCAL =  data.ADV_LOCAL;
                    }
                    HospitalService.hospitalWebUrl = data.ADV_LOCAL;
                });
            }
        });
    })
    .build();