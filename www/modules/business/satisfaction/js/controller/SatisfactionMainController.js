/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：满意度选择医生页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.satisfactionMain.controller")
    .require([
        "kyee.quyiyuan.satisfaction.satisfactionMain.service",
        "kyee.quyiyuan.satisfaction.satisfactionHospital.service",
        "kyee.quyiyuan.satisfaction.satisfactionHospital.controller",
        "kyee.quyiyuan.satisfaction.satisfactionDoctor.service",
        "kyee.quyiyuan.satisfaction.satisfactionDoctor.controller",
        "kyee.quyiyuan.satisfaction.satisfactionMenu.controller",
        "kyee.quyiyuan.satisfaction.satisfactionMenu.service",
        "kyee.quyiyuan.satisfaction.satisfactionClinic.controller",
        "kyee.quyiyuan.satisfaction.hospitalList.controller",
        "kyee.quyiyuan.satisfaction.hospitalMenu.controller",
        "kyee.quyiyuan.satisfaction.hospitalDoctor.service",
        "kyee.quyiyuan.satisfaction.hospitalHospital.service",
        "kyee.quyiyuan.myquyi.service"
    ])
    .type("controller")
    .name("SatisfactionMainController")
    .params(["$scope", "$state", "SatisfactionMainService",
        "SatisfactionDoctorService", "SatisfactionMenuService", "KyeeMessageService",
        "SatisfactionHospitalService", "CacheServiceBus", "$ionicScrollDelegate","MyquyiService","KyeeListenerRegister"])
    .action(function($scope, $state, SatisfactionMainService,
                     SatisfactionDoctorService, SatisfactionMenuService, KyeeMessageService,
                     SatisfactionHospitalService, CacheServiceBus, $ionicScrollDelegate,MyquyiService,KyeeListenerRegister){

        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "satisfaction",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
                //MyquyiService.setBackTabIndex(-1);
            }
        });
    })
    .build();
