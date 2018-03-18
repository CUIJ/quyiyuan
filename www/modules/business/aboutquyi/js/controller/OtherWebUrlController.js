/**
 * 产品名称 KYMH
 * 创建用户: 赵婷
 * 日期: 2015/6/9
 * 时间: 11:06
 * 创建原因：
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.aboutquyi.otherweburl.controller")
    .require(["kyee.quyiyuan.aboutquyi.service"])
    .type("controller")
    .name("OtherWebUrlController")
    .params(["$scope", "$sce", "AboutQuyiService"])
    .action(function($scope, $sce, AboutQuyiService){

        var url = AboutQuyiService.webUrl;

        $scope.openUrl = $sce.trustAsResourceUrl(url);
        $scope.name = AboutQuyiService.name;
    })
    .build();
