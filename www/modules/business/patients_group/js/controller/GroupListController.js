/**
 * 产品名称：quyiyuan
 * 创建者：licong
 * 创建时间： 2016/7/22
 * 创建原因：群聊列表控制层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.group_list.controller")
    .require([
        "kyee.quyiyuan.patients_group.group_list.service",
        "kyee.quyiyuan.patients_group.conversation.service",
        "kyee.quyiyuan.patients_group.message.service"
    ])
    .type("controller")
    .name("GroupListController")
    .params([
        "$scope",
        "GroupListService",
        "KyeeListenerRegister",
        "CacheServiceBus",
        "ConversationService",
        "KyeeBroadcastService",
        "MessageService",
        "$state"
    ])
    .action(function ($scope, GroupListService, KyeeListenerRegister, CacheServiceBus, ConversationService, KyeeBroadcastService, MessageService,$state) {
        var memoryCache = CacheServiceBus.getMemoryCache(); //memoryCache存储
        var userId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
        KyeeListenerRegister.regist({
            focus: "group_list",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                $scope.showGroup = false;
                /**
                 * web端接收到群群列表
                 */
                var groupIds = [];
                // KyeeBroadcastService.doRegister($scope, "GROUP_LIST", function (teams) {
                //     $scope.groups = teams;
                // });
                /**
                 * 查询我的所有群列表
                 */
                // IMDispatch.getAllMyTeams(function (teams) {
                //     $scope.groups = teams;
                //     angular.forEach(teams, function (team) {
                //         groupIds.push(team.teamId);
                //     });
                //     if (groupIds.length > 0) {
                //         MessageService.getGroupsInfo(groupIds, function (infoMap) {
                //             for (var i = 0; i < $scope.groups.length; i++) {
                //                 if (infoMap[$scope.groups[i].teamId]) {
                //                     $scope.groups[i].groupPhoto = infoMap[$scope.groups[i].teamId].groupPhoto;
                //                 }
                //             }
                //             $scope.showGroup = true;
                //         });

                //     }
                // });
                var memoryCache = CacheServiceBus.getMemoryCache();
                var userId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
                GroupListService.getGroupListData(userId,function(data){
                    $scope.showGroup = true;
                    $scope.groups = data;
                    checkApply();
                })

            }
        });
         /**
         * 脏值检测及强制刷新
         */
        function checkApply() {
            if ($scope.$$phase != '$apply' && $scope.$$phase != '$digest') {
                $scope.$apply();
            }
        };
        /**
         * 进入群聊天界面
         * @param group
         */
        $scope.sendMessageToGroup = function (group) {
            ConversationService.goConversation(group.tid, $scope);
        };
        $scope.goBack = function(){
            $state.go("message->MAIN_TAB");
        }
    })
    .build();