/**
 * 群组搜搜控制器
 * 作者：李延辉
 * 时间：2017年03月21日11:36:11
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.group_search.controller")
    .require([
        "kyee.quyiyuan.patients_group.group_search.service"
    ])
    .type("controller")
    .name("GroupSearcherController")
    .params(["$scope", "$state", "GroupSearchService", "$ionicHistory", "KyeeListenerRegister", "$ionicScrollDelegate", "GroupDetailsService", "PersonalHomeService", "ConversationService", "CacheServiceBus","KyeeUtilsService"])
    .action(function ($scope, $state, GroupSearchService, $ionicHistory, KyeeListenerRegister, $ionicScrollDelegate, GroupDetailsService, PersonalHomeService, ConversationService, CacheServiceBus,KyeeUtilsService) {

        KyeeListenerRegister.regist({
            focus: "group_search",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "forward",
            action: function () {
                $scope.keywords = {
                    value: GroupSearchService.searchKey
                };
                $scope.searchGroups($scope.keywords.value);
            }
        });

        KyeeListenerRegister.regist({
            focus: "group_search",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction: "forward",
            action: function () {
                getFocus("searchKey");
            }
        });

        /**
         * 搜索
         * @param keywords
         */
        $scope.searchGroups = function (keywords) {
            $ionicScrollDelegate.$getByHandle("group_search_list").scrollTop();
            if (keywords) {
                keywords = keywords.trim();
                var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                var params = {
                    searchKey: keywords,
                    provinceCode: hospitalInfo.provinceCode
                };
                GroupSearchService.searchGroupListData(params, function (data) {
                    $scope.groups = data;
                });
            } else {
                $scope.groups = [];
            }
        };

        /**
         * 获取焦点
         * @param eleId
         */
        var getFocus = function (eleId) {
            var currentObj = document.getElementById(eleId);
            var target_index = currentObj.value.trim().length;
            if (currentObj.setSelectionRange) { //兼容火狐
                var delayIndex = KyeeUtilsService.delay({
                    time: 5,
                    action: function () {
                        currentObj.setSelectionRange(target_index, target_index);
                        currentObj.focus();
                        KyeeUtilsService.cancelDelay(delayIndex);
                    }
                });
            } else if (currentObj.createTextRange) { //兼容IE
                var rng = currentObj.createTextRange();
                rng.move('character', target_index);
                rng.select();
            }
        };

        /**
         * 清空搜索框内容
         */
        $scope.clearInput = function () {
            $scope.groups = [];
            $scope.keywords.value = "";
            getFocus("searchKey");
            $ionicScrollDelegate.$getByHandle("group_search_list").scrollTop();
        };

        /**
         * 跳转至群组详情界面或聊天界面
         */
        $scope.goGroupDetails = function (groupId) {
            PersonalHomeService.isInGroup(groupId, function (data) {
                if (data.isInGroup) {
                    ConversationService.goConversation(groupId, $scope);
                } else {
                    GroupDetailsService.groupId = groupId;
                    $state.go("group_details");
                }
            });
        };


        $scope.back = function () {
            setTimeout(function () {
                $ionicHistory.goBack(-1);
            }, 300);
        }
    })
    .build();