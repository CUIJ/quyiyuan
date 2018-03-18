/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年5月6日15:25:02
 * 创建原因：辅症列表控制器
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.auxiliarySymptomList.controller")
    .require(["kyee.quyiyuan.auxiliarySymptomList.service", "kyee.quyiyuan.DiagnosticResult.controller"])
    .type("controller")
    .name("AuxiliarySymptomListController")
    .params(["$scope", "$state", "$ionicHistory", "BodySymptomListService", "OnSetListService", "AuxiliarySymptomListService", "HttpServiceBus", "KyeeMessageService", "TriagePicService","KyeeMessageService","KyeeI18nService"])
    .action(function ($scope, $state, $ionicHistory, BodySymptomListService, OnSetListService, AuxiliarySymptomListService, HttpServiceBus, KyeeMessageService, TriagePicService, KyeeMessageService, KyeeI18nService) {
        var mainId = BodySymptomListService.mainId, mainName = BodySymptomListService.mainName,
            originId = OnSetListService.originId, originName = OnSetListService.originName,
            sex = TriagePicService.currentSex, noSex = TriagePicService.noSex;
        //选中项
        $scope.isChecked =  AuxiliarySymptomListService.isChecked;
        //begin 记住用户选中的辅症 By 高玉楼 KYEEAPPTEST-2711
        //选中辅症ID列表
        var auxiliarySymptomIdList = AuxiliarySymptomListService.auxiliarySymptomIdList,
            auxiliarySymptomNameList = AuxiliarySymptomListService.auxiliarySymptomNameList;
        //end 记住用户选中的辅症 By 高玉楼 KYEEAPPTEST-2711
        AuxiliarySymptomListService.loadData(mainId, mainName, originId, originName, sex, noSex, function (data) {
            $scope.auxiliarySymptomList = data;
        });
        //点击选项
        $scope.check = function (index, auxiliarySymptomId, auxiliarySymptomName) {
            if ($scope.isChecked[index] == undefined || !$scope.isChecked[index]) {
                $scope.isChecked[index] = true;
                auxiliarySymptomIdList.push(auxiliarySymptomId);
                auxiliarySymptomNameList.push(auxiliarySymptomName);
            } else {
                $scope.isChecked[index] = !$scope.isChecked[index];
                var idArray = [], nameArray = [];
                for (var i = 0; i < auxiliarySymptomIdList.length; i++) {
                    if (auxiliarySymptomIdList[i] != $scope.auxiliarySymptomList[index].symptomCode) {
                        idArray.push(auxiliarySymptomIdList[i]);
                        nameArray.push(auxiliarySymptomNameList[i])
                    }
                }
                auxiliarySymptomIdList = idArray;
                auxiliarySymptomNameList = nameArray;
            }
        };
        //点击下一步
        $scope.nextStep = function () {
            //begin 记住用户选中的辅症 By 高玉楼 KYEEAPPTEST-2711
            //判断是否已经选中伴随症状  By 杨旭平 KYEEAPPTEST-3983
            if(auxiliarySymptomIdList.length<=0){
                KyeeMessageService.broadcast({
                    content : KyeeI18nService.get("triage.select_symptom", "请选择伴随症状")
                });
            }else{
                AuxiliarySymptomListService.auxiliarySymptomIdList = auxiliarySymptomIdList;
                AuxiliarySymptomListService.auxiliarySymptomNameList = auxiliarySymptomNameList;
                //end 记住用户选中的辅症 By 高玉楼 KYEEAPPTEST-2711
                AuxiliarySymptomListService.isChecked=$scope.isChecked;
                $state.go('DiagnosticResult');
            }
        };
    })
    .build();