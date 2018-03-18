/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年10月28日19:22:46
 * 创建原因：疾病列表控制器
 * 任务：KYEEAPPC-3622
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.multiplequery.diseaselist.controller")
    .require([])
    .type("controller")
    .name("DiseaseListController")
    .params(["$scope","$state","MultipleQueryService","DiseaseInfoQueryService","KyeeI18nService"])
    .action(function ($scope,$state,MultipleQueryService,DiseaseInfoQueryService,KyeeI18nService) {
        $scope.diseaseList = MultipleQueryService.resultData.diseaseData;

        $scope.goTodiseaseInfo = function(data){
            DiseaseInfoQueryService.diseaseName = data.DISEASE_NAME;
            DiseaseInfoQueryService.diseaseId = data.DISEASE_ID;
            //记录页面跳转的路由栈  By 杜巍巍  KYEEAPPC-3927
            MultipleQueryService.ChangeRouter("multiple_query.disease_list_query","multiple_query.disease_info_query");
            MultipleQueryService.historyStack.push('multiple_query.disease_list_query');
            $state.go("multiple_query.disease_info_query");
        }

    })
    .build();