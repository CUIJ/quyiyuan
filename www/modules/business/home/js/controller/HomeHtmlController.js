/**
 * 创建人：章剑飞
 * 创建时间：2015年12月22日11:00:09
 * 创建原因：展示后台配置广告内容
 * 任务号：KYEEAPPC-4634
 */
new KyeeModule()
    .group("kyee.quyiyuan.home.homeHtml.controller")
    .require([])
    .type("controller")
    .name("HomeHtmlController")
    .params(["$scope","HomeService","HospitalDetailService"])
    .action(function($scope,HomeService,HospitalDetailService){
        $scope.advName = HomeService.ADV_DATA.ADV_NAME;
        //加载html简介
        HospitalDetailService.loadHospitalDetail('-1',HomeService.ADV_DATA.ADV_ID, function(data){
            $scope.ADV_HOSPITAL_INTRO = data.ADV_HOSPITAL_INTRO;
        });
    })
    .build();