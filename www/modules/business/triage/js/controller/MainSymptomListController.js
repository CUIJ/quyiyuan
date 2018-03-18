/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年6月26日17:03:03
 * 创建原因：主症列表控制器
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.MainSymptomList.controller")
    .require(["kyee.quyiyuan.bodySymptomList.service","kyee.quyiyuan.onSetList.controller"])
    .type("controller")
    .name("MainSymptomListController")
    .params(["$scope", "$state","$ionicHistory","KyeeMessageService","BodySymptomListService"])
    .action(function($scope, $state, $ionicHistory,KyeeMessageService,BodySymptomListService){

        $scope.onMainSymptomItemClick=function(mainId,mainName)
        {
            BodySymptomListService.mainId=mainId;
            BodySymptomListService.mainName=mainName;
            $state.go("onSetList");
        }
    })
    .build();