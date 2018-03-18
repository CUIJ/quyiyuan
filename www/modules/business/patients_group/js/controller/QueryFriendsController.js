/**
 * 产品名称：quyiyuan
 * 创建者：licong
 * 创建时间： 2016/7/22
 * 创建原因：搜索朋友控制层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.query_friends.controller")
    .require(["kyee.quyiyuan.patients_group.personal_home.controller",
        "kyee.quyiyuan.patients_group.contracts_list.service",
        "kyee.quyiyuan.patients_group.personal_home.service"])
    .type("controller")
    .name("QueryFriendsController")
    .params(["$scope", "$state", "ContractsListService", "PersonalHomeService",
        "KyeeListenerRegister","$ionicScrollDelegate","KyeeUtilsService","$ionicHistory"])
    .action(function($scope, $state, ContractsListService, PersonalHomeService,
                     KyeeListenerRegister,$ionicScrollDelegate,KyeeUtilsService,$ionicHistory){

        KyeeListenerRegister.regist({
            focus: "query_friends",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                $scope.keywords = { // 搜索关键字
                    value: ContractsListService.queryFriendKeywords
                };
                $scope.queryFriends($scope.keywords.value);
            }
        });

        /**
         * 监听页面加载完毕
         */
        KyeeListenerRegister.regist({
            focus: "query_friends",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction: "forward",
            action: function() {
                getFocus("keywords");
            }
        });

        /**
         * 输入框获取光标
         * @param eleId
         */
        var getFocus = function(eleId){
            var currentObj = document.getElementById(eleId);
            var target_index = currentObj.value.trim().length;
            if(currentObj.setSelectionRange){ //兼容火狐
                var delayIndex = KyeeUtilsService.delay({
                    time: 5,
                    action:function(){
                        currentObj.setSelectionRange(target_index, target_index);
                        currentObj.focus();
                        KyeeUtilsService.cancelDelay(delayIndex);
                    }
                });
            } else if (currentObj.createTextRange){ //兼容IE
                var rng = currentObj.createTextRange();
                rng.move('character', target_index);
                rng.select();
            }
        };

        /**
         * 用昵称，手机号搜索好友
         * @param keywords
         */
        $scope.queryFriends = function(keywords){
            var keywords = keywords.trim();
            ContractsListService.queryFriendKeywords = keywords;
            if(keywords){
                ContractsListService.queryFriends(keywords, function(data){
                    $scope.resultData = data;
                });
            } else {
                $scope.resultData = [];
            }
            $ionicScrollDelegate.$getByHandle("friend_list").resize();
        };

        /**
         * 清空搜索框内容
         */
        $scope.clearInput = function() {
            $scope.keywords.value = "";
            $scope.resultData = [];
            getFocus("keywords");
        };

        /**
         * 显示病友详情
         * @param user
         */
        $scope.getDetail = function(user){
            PersonalHomeService.userInfo = {
                userId: user.userId,
                fromGroupId: ""
            };
            $state.go("personal_home");
        };

        /**
         * 返回按钮点击事件
         * add by zhangyi at 20161208 for KYEEAPPC-9098 返回时隐藏键盘事件
         */
        $scope.back = function () {
            setTimeout(function () {
                $ionicHistory.goBack(-1);
            }, 300);
        }
    })
    .build();