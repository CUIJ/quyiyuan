/**
 * Created by lwj on 2016/7/27.
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.search_group_list.controller")
    .require([
        "kyee.quyiyuan.patients_group.conversation.service",
        "kyee.quyiyuan.patients_group.group_details.controller",
        "kyee.quyiyuan.patients_group.message.controller",
        "kyee.quyiyuan.patients_group.group_search.controller"
    ])
    .type("controller")
    .name("SearchGroupListController")
    .params([
        "$scope",
        "$state",
        "KyeeListenerRegister",
        "CacheServiceBus",
        "GroupListService",
        "GroupDetailsService",
        "HospitalSelectorService"
    ])
    .action(function($scope,$state,KyeeListenerRegister,CacheServiceBus,GroupListService,GroupDetailsService,HospitalSelectorService){
        $scope.showEmptyIcon = false;//是否显示无数据提示，默认不显示 add by wyn 20170117
        KyeeListenerRegister.regist({
            focus: "search_group_list",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                HospitalSelectorService.isFindGroupByHospital = false; //edited by zhangyi at 20161121 for KYEEAPPC-8731 : 进入页面时初始化控制变量isFindGroupByHospital
                initView();
            }
        });

        /**
         * 监听物理返回键
         */
        KyeeListenerRegister.regist({
            focus: "search_group_list",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        $scope.goBack = function(){
            $state.go("message->MAIN_TAB");
        };

        /**
         * 初始化页面
         * modify by wyn 20170117 查询推荐群组时，优化显示方式，等待查询结果返回后处理界面显示内容
         */
        var initView = function(){
            var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            if(hospitalInfo) {
                var params = {
                    "provinceCode": hospitalInfo.provinceCode,
                    "cityCode": hospitalInfo.cityCode
                };
                GroupListService.getRecommendGroup(params, function(data){
                    // modify by wyn 查询完成后再显示是否有推荐群组
                    if(data.groupInfs && 0 < data.groupInfs.length){
                        $scope.recommendGroup = data.groupInfs;
                    } else {
                        $scope.showEmptyIcon = true;
                    }
                    angular.forEach($scope.recommendGroup, function(data){
                        if (!data.groupLabel || data.groupLabel == '' || 'null' == data.groupLabel) {
                            data.groupLabel = undefined;
                        }
                    });
                });
            } else {
                $scope.showEmptyIcon = true; // add by zhangyi 搜索群组功能优化 缓存中hospitalInfo为空，直接提示暂无推荐群组
            }
        };

        /**
         * 进入群组详情页
         * @param groupId
         */
        $scope.goGroupDetail = function(groupId){
            GroupDetailsService.groupId = groupId;
            $state.go("group_details");
        };

        /**
         * 选择医院科室
         */
        $scope.selectHospitalDept = function(){
            GroupListService.selectHospitalDept();
        };

        /**
         * 跳到群组搜索
         */
        $scope.goToGroupSearch = function () {
            $state.go("group_search");
        }
    })
    .build();
