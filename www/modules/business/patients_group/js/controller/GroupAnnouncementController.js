/**
 * Created by liwenjuan on 2017/6/20.
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.group_announcement.controller")
    .require([
        "kyee.quyiyuan.patients_group.group_details.service"
        ])
    .type("controller")
    .name("GroupAnnouncementController")
    .params([
        "$scope",
        "$state",
        "$ionicHistory",
        "$sce",
        "GroupDetailsService",
        "KyeeListenerRegister"
    ])
    .action(function($scope, $state, $ionicHistory,$sce, GroupDetailsService,KyeeListenerRegister){
        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "group_announcement",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                init();
            }
        });
        /**
         * 监听物理键返回
         */
        KyeeListenerRegister.regist({
            focus: "group_details",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.goBack();
            }
        });

        /**
         * 初始化历史公告数据
         */
        var init = function(){
            GroupDetailsService.getAnnouncementList(function(data){
             $scope.announcementList = data || [];
             });
        };

        /**
         * 返回群详情
         */
        $scope.goBack = function(){
            $ionicHistory.goBack(-1);
        };

        /**
         * 处理文本字符格式化
         * @param text
         */
        $scope.trustContent = function(text){
            return $sce.trustAsHtml(text);
        };
    })
    .build();