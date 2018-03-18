/**
 * 产品名称 KYMH
 * 创建用户: chun_sibo
 * 日期: 2015/5/6
 * 时间: 11:06
 * 创建原因：
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.hospital.hospitalWeb.controller")
    .require(["kyee.quyiyuan.hospital.service"])
    .type("controller")
    .name("HospitalWebController")
    .params(["$scope","$rootScope","$sce","HospitalService"])
    .action(function($scope,$rootScope, $sce,HospitalService){
        $scope.openUrl = $sce.trustAsResourceUrl(HospitalService.hospitalWebUrl);
    })
    .build();