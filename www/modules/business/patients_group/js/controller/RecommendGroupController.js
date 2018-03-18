/**
 * 产品名称：quyiyuan
 * 创建者：licong
 * 创建时间： 2016/8/10
 * 创建原因：根据医院科室推荐群组控制层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.recommend_group.controller")
    .require(["kyee.quyiyuan.patients_group.group_details.controller",
        "kyee.quyiyuan.patients_group.group_list.service",
        "kyee.quyiyuan.patients_group.search_group_list.controller"
    ])
    .type("controller")
    .name("RecommendGroupController")
    .params(["$scope", "$state", "GroupListService", "KyeeListenerRegister", "GroupDetailsService", "AppointmentDeptGroupService", "$ionicHistory"])
    .action(function($scope, $state, GroupListService, KyeeListenerRegister, GroupDetailsService, AppointmentDeptGroupService, $ionicHistory){
        KyeeListenerRegister.regist({
            focus: "recommend_group",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                var params = GroupListService.recommendGroupsParams;
                //获取省份医院下面的群
                GroupListService.getGroupByHospitalDept(params, function(data){
                    $scope.groups = data.groupInfs;
                    angular.forEach($scope.groups, function(data){
                        if (!data.groupLabel || data.groupLabel == '' || data.groupLabel == 'null') {
                            data.groupLabel = undefined;
                        }
                    });
                });
            }
        });

        $scope.goBack = function(){
            $ionicHistory.goBack(-1); //edited by zhangyi at 20161121 for KYEEAPPC-8731 : 点击返回按钮跳转到上一个页面
        };

        /**
         * 监听物理返回键
         */
        KyeeListenerRegister.regist({
            focus: "recommend_group",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        /**
         * 跳转至群组详情界面
         */
        $scope.goGroupDetails = function(groupId){
            GroupDetailsService.groupId = groupId;
            $state.go("group_details");
        };

    })
    .build();