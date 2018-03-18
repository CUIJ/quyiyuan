/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年6月26日17:03:03
 * 创建原因：起病列表
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.onSetList.controller")
    .require(["kyee.quyiyuan.onSetList.service", "kyee.quyiyuan.auxiliarySymptomList.controller"])
    .type("controller")
    .name("OnSetListController")
    .params(["$scope", "$state", "$ionicHistory", "BodySymptomListService", "OnSetListService", "KyeeMessageService","TriagePicService","AuxiliarySymptomListService"])
    .action(function ($scope, $state, $ionicHistory, BodySymptomListService, OnSetListService, KyeeMessageService,TriagePicService,AuxiliarySymptomListService) {
        var mainId = BodySymptomListService.mainId;
        var mainName = BodySymptomListService.mainName;
        var sex = TriagePicService.currentSex;
        var noSex = TriagePicService.noSex;
        OnSetListService.loadOnSetData(mainId, mainName, sex, noSex, function (data) {
            $scope.onSetList = data;
        });

        $scope.onOnSetItemClick = function (originId, originName) {
            OnSetListService.originId = originId;
            OnSetListService.originName = originName;
            AuxiliarySymptomListService.isChecked=[];
            //begin 清除用户选中的辅症 By 高玉楼 KYEEAPPTEST-2711
            AuxiliarySymptomListService.auxiliarySymptomIdList=[];
            AuxiliarySymptomListService.auxiliarySymptomNameList=[];
            //end 清除用户选中的辅症 By 高玉楼 KYEEAPPTEST-2711
            $state.go("auxiliarySymptomList");
        }
    })
    .build();