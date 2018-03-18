/**
 * Created by Hr_ on 2017/9/18.
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.my_healthy.controller")
    .require(["kyee.quyiyuan.messagecenter.my_healthy.service"])
    .type("controller")
    .name("MyHealthyController")
    .params(["$scope", "$state", "$sce", "MyHealthyService","CacheServiceBus","KyeeListenerRegister"])
    .action(function ($scope, $state, $sce, MyHealthyService,CacheServiceBus,KyeeListenerRegister) {
        KyeeListenerRegister.regist({
            focus: "my_healthy",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                var patientInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                var phone = patientInfo.PHONE;
                var id_no = patientInfo.ID_NO;
                var name = patientInfo.OFTEN_NAME;
                MyHealthyService.getHtml(function (response) {
                    MyHealthyService.url = MyHealthyService.url +"/appPush/myHealth/html/myHealth.html?id_no="+id_no+"&phone_no="+phone+"&name="+name;
                    $scope.openUrl = $sce.trustAsResourceUrl(MyHealthyService.url);
                });
            }
        });
        //页面标题
        $scope.title = MyHealthyService.title;
        $scope.buttonText = MyHealthyService.buttoText;
        $scope.jumpRouter = MyHealthyService.jumpRouter;
    })
    .build();
