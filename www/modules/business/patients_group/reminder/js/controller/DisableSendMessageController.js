/**
 * 产品名称：quyiyuan
 * 创建者：李聪
 * 创建时间：2016年8月11日
 * 创建原因：禁言消息控制层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.disable_send_message.controller")
    .require(["kyee.quyiyuan.patients_group.patients_group_message.service"])
    .type("controller")
    .name("DisableSendMessageController")
    .params(["$scope", "PatientsGroupMessageService"])
    .action(function($scope, PatientsGroupMessageService){
        $scope.data = PatientsGroupMessageService.disableSendMsgParams;
    })
    .build();