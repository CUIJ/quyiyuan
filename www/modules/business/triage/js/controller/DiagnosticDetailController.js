/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年10月14日11:44:10
 * 创建原因：疾病详情控制器
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.DiagnosticDetail.controller")
    .require(["kyee.quyiyuan.triageSelectDept.controller"])
    .type("controller")
    .name("DiagnosticDetailController")
    .params(["$scope", "$state", "DiagnosticResultService"])
    .action(function ($scope, $state, DiagnosticResultService) {
      if(DiagnosticResultService.diseaseInfo){
          $scope.dianosticDetail = DiagnosticResultService.diseaseInfo;
      }
    })
    .build();