/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/5/6
 * 时间: 11:06
 * 创建原因：
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.aboutquyi.weburl.controller")
    .require(["kyee.quyiyuan.aboutquyi.service"])
    .type("controller")
    .name("WebUrlController")
    .params(["$scope", "$sce", "AboutQuyiService"])
    .action(function($scope, $sce, AboutQuyiService){

        var url = AboutQuyiService.webUrl;

        $scope.openUrl = $sce.trustAsResourceUrl(url);
        $scope.name = AboutQuyiService.name;
    })
    .build();