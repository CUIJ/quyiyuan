/**
 * Created by liwenjuan on 2016/10/20.
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.patients_group_web.controller")
    .require([
        "kyee.quyiyuan.patients_group.patients_group_web.service"
    ])
    .type("controller")
    .name("patientsGroupWebController")
    .params(["$scope","$sce","patientsGroupWebService"])
    .action(function($scope, $sce,patientsGroupWebService){
        $scope.webUrl = $sce.trustAsResourceUrl(patientsGroupWebService.webUrl);
        patientsGroupWebService.webUrl = "";
    })
    .build();
