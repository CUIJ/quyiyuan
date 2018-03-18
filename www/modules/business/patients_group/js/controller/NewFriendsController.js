/**
 * 产品名称：quyiyuan
 * 创建者：licong
 * 创建时间： 2016/7/22
 * 创建原因：新的朋友控制层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.new_friends.controller")
    .require(["kyee.quyiyuan.patients_group.new_friends.controller",
        "kyee.quyiyuan.patients_group.add_friends.controller",
        "kyee.quyiyuan.patients_group.query_friends.controller",
        "kyee.quyiyuan.patients_group.personal_home.controller",
        "kyee.quyiyuan.patients_group.contracts_list.service",
        "kyee.quyiyuan.patients_group.personal_home.service"
    ])
    .type("controller")
    .name("NewFriendsController")
    .params(["$scope", "$state", "ContractsListService", "PersonalHomeService", "KyeeListenerRegister"])
    .action(function($scope, $state, ContractsListService, PersonalHomeService, KyeeListenerRegister){

        KyeeListenerRegister.regist({
            focus: "new_friends",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                loadData();
            }
        });

        var loadData = function(){
            ContractsListService.getNewFriendsData(function(data){
                $scope.newFriends = data.friendList;
            });
        };

        /**
         * 跳转至添加好友页面
         */
        $scope.goToAddFriends = function(){
            $state.go("add_friends");
        };

        /**
         * 显示病友详情
         * @param user
         */
        $scope.getDetail = function(user){
           /* PersonalHomeService.userInfo = {
                userId: user.userId,
                personalInfo: user,
                isMyFriend: (user.userStatusFlag == 2)
            };*/
			PersonalHomeService.userInfo = {
                userId: user.userId,
                fromGroupId: ""
            };
            $state.go("personal_home");
        };
    })
    .build();