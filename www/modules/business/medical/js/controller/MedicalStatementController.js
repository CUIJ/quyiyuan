/**
 * 产品名称 quyiyuan.
 * 创建用户: WangYuFei
 * 日期: 2015年5月7日13:46:40
 * 创建原因：KYEEAPPC-1959 报告单-体检单医学申明controller
 * 修改时间：2015年7月7日14:04:32
 * 修改人：程铄闵
 * 任务号：KYEEAPPC-2669
 * 修改原因：体检单迁移为独立模块
 */
new KyeeModule()
    .group("kyee.quyiyuan.medicalStatement.controller")
    .require(["kyee.quyiyuan.medical.service"])
    .type("controller")
    .name("MedicalStatementController")
    .params(["$scope","MedicalService","KyeeViewService","KyeeI18nService"])
    .action(function($scope,MedicalService,KyeeViewService,KyeeI18nService){
        //返回按钮操作
        $scope.close = function(){
            KyeeViewService.removeModal({
                scope:$scope
            });
        };
        //初始化数据
        $scope.MEDICAL_STATE = MedicalService.MEDICAL_STATE;
    })
    .build();