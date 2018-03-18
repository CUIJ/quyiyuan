/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年10月28日19:22:46
 * 创建原因：疾病详情控制器
 * 任务：KYEEAPPC-3622
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.diseaseinfo.controller")
    .require([])
    .type("controller")
    .name("DiseaseInfoController")
    .params(["$scope", "$state","DiseaseInfoQueryService"])
    .action(function ($scope, $state, DiseaseInfoQueryService) {
        /*$scope.disease = DiseaseInfoQueryService.disease;*/
		//KYEEAPPC-10354 yangmingsi
        if(DiseaseInfoQueryService.disease&&DiseaseInfoQueryService.disease.diseaseInfo){
            $scope.dianosticDetail = DiseaseInfoQueryService.disease.diseaseInfo;
        }
        $scope.tipsIsShow = true;
        $scope.height = 95;
        /**
         * 关闭小黑框
         */
        $scope.tipIsShow = function(){
            $scope.tipsIsShow = false;
            $scope.height = 0;
        }
    })
    .build();