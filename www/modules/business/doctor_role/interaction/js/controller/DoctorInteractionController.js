/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月28日20:02:32
 * 创建原因：患者信息页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.interaction.controller")
    .require([
        "kyee.quyiyuan.doctorRole.interaction.service",
        "kyee.quyiyuan.doctorRole.messageBoard.controller",
        "kyee.quyiyuan.doctorRole.messageBoard.service",
        "kyee.quyiyuan.doctorRole.visitRecords.controller"
    ])
    .type("controller")
    .name("DoctorInteractionController")
    .params(["$scope", "$state", "CacheServiceBus", "MessageBoardService"])
    .action(function($scope, $state, CacheServiceBus, MessageBoardService){

        $scope.data = MessageBoardService.paramData;

        /**
         * 点击留言按钮事件
         */
        $scope.onPostRootClick = function () {

            $state.go("patientInfo.doctorMessageBoard");

            if(!document.querySelector('#submitInout')){
                return;
            }

            if(document.querySelector('#submitInout').style.display == 'none'){
                MessageBoardService.scopeData.chatFlag = 0;
                document.querySelector('#submitInout').style.display = '';
            } else {
                document.querySelector('#submitInout').style.display = 'none';
            }
        };

    })
    .build();
