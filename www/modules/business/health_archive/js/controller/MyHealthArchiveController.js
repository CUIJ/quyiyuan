/*
 * 产品名称：健康档案
 * 创建人: 王婉
 * 创建日期:2016年11月15日16:11:13
 * 创建原因：亳州平台健康档案
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.my.health.archive.controller")
    .require([
        "kyee.quyiyuan.health.archive.my.health.information.controller",
        "kyee.quyiyuan.health.archive.my.health.information.service",
        "kyee.quyiyuan.health.archive.my.personal.information.controller",
        "kyee.quyiyuan.health.archive.my.personal.information.service",
        "kyee.quyiyuan.health.archive.treatment.information.list.controller",
        "kyee.quyiyuan.health.archive.treatment.information.list.service"
    ])
    .type("controller")
    .name("MyHealthArchiveController")
    .params(["$scope", "$state","KyeeListenerRegister","MyPersonalInformationService","CacheServiceBus","$ionicHistory"])
    .action(function ($scope,$state,KyeeListenerRegister,MyPersonalInformationService,CacheServiceBus,$ionicHistory) {

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "my_health_archive",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backCenter();
            }
        });
        //返回
        $scope.backCenter = function () {
            var urlInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
            if(urlInfo && urlInfo.state == "my_health_archive"){
                javascript:window.myObject.goBack();//返回我家亳州
            }else{
                MyPersonalInformationService.BACK_ID = null;
                $ionicHistory.goBack(-1);
            }
        };
        $scope.config = [
            {
                id : "my_personal_information",
                tab : "<div class='pad-t-15'><div class='f16 qy-grey7 fw-b'>1</div><div class='f14 qy-grey5'>个人信息</div></div>",
                template : "modules/business/health_archive/views/my_personal_information.html"
            },
            {
                id : "my_health_information",
                tab : "<div class='pad-t-15'><div class='f16 qy-grey7 fw-b'>2</div><div class='f14 qy-grey5'>健康信息</div></div>",
                template : "modules/business/health_archive/views/my_health_information.html"
            },
            {
                id : "treatment_information_list",
                tab : "<div class='pad-t-15'><div class='f16 qy-grey7 fw-b'>3</div><div class='f14 qy-grey5'>诊疗信息</div></div>",
                template : "modules/business/health_archive/views/treatment_information_list.html"
            }
        ];
        KyeeListenerRegister.regist({
            focus: "my_health_archive",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.userSource = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);//用户来源
                if(MyPersonalInformationService.BACK_ID=='treatment_information_list'){
                   $scope.BACK_ID = 'treatment_information_list';
                }else{
                    $scope.BACK_ID ='my_personal_information';
                }
            }
        })
    })
    .build();

