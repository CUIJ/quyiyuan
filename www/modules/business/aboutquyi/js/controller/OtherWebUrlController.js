/**
 * ��Ʒ���� KYMH
 * �����û�: ����
 * ����: 2015/6/9
 * ʱ��: 11:06
 * ����ԭ��
 * �޸�ԭ��
 * �޸�ʱ�䣺
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
