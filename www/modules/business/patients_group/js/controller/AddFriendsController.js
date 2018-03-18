/**
 * 产品名称：quyiyuan
 * 创建者：licong
 * 创建时间： 2016/7/22
 * 创建原因：添加朋友控制层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.add_friends.controller")
    .require(["kyee.quyiyuan.patients_group.query_friends.controller",
        "kyee.quyiyuan.patients_group.group_members.controller",
        "kyee.quyiyuan.patients_group.contracts_list.service",
        "kyee.quyiyuan.patients_group.group_list.service"])
    .type("controller")
    .name("AddFriendsController")
    .params([
        "$scope",
        "$state",
        "ContractsListService",
        "GroupListService",
        "GroupDetailsService",
        "KyeeListenerRegister",
        "CacheServiceBus"])
    .action(function($scope, $state, ContractsListService,
                     GroupListService, GroupDetailsService, KyeeListenerRegister,CacheServiceBus){

        var memoryCache = CacheServiceBus.getMemoryCache();//memoryCache存储
        var userId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
        KyeeListenerRegister.regist({
            focus: "add_friends",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                $scope.loadGroupData();
            }
        });

        $scope.loadGroupData = function(){
            GroupListService.getGroupListData(userId,function(data){
                $scope.groups = data;
                angular.forEach($scope.groups, function(data){
                    if (!data.groupLabel || data.groupLabel == '' || data.groupLabel == 'null') {
                        data.groupLabel = undefined;
                    }
                });
            });
        };

        // 搜索好友
        $scope.goQueryFriends = function(){
            ContractsListService.queryFriendKeywords = "";
            $state.go("query_friends");
        };

        // 跳转至群成员页面
        //李延辉 2017年03月29日17:25:21 修复从添加好友页面跳到群成员时没有给群详情群名字、群成员数量赋值
        $scope.showGroupMembers = function(group) {
            GroupListService.groupInfo.groupId = group.groupId;
            GroupDetailsService.groupName = group.groupName;
            GroupDetailsService.memberCount = group.groupMemberCounts;
            $state.go("group_members");
            // 获取群成员信息
           /* GroupDetailsService.queryGroupInfo(groupId, function(data){
                GroupListService.groupInfo = {
                    groupId: data.groupId,
                    groupType: data.groupType,
                    isInGroup: data.isInGroup,
                    groupMembers: data.userInfo,
                    groupName: data.groupInfo.groupName,
                    memberCount: data.groupInfo.groupMemberCounts
                };

                $state.go("group_members");
            });*/
        };
    })
    .build();