/**
 * Created by lwj on 2016/7/27.
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.choose_at_members.controller")
    .require([
        "kyee.quyiyuan.patients_group.conversation.service",
        "kyee.quyiyuan.patients_group.group_details.service"
    ])
    .type("controller")
    .name("ChooseAtMembersController")
    .params([
        "$scope",
        "$filter",
        "KyeeViewService",
        "ConversationService",
        "CacheServiceBus",
        "GroupDetailsService",
        "KyeeListenerRegister",
        "$ionicScrollDelegate"
    ])
    .action(function ($scope, $filter, KyeeViewService, ConversationService,
        CacheServiceBus, GroupDetailsService, KyeeListenerRegister, $ionicScrollDelegate) {
        $scope.searchObj = { //搜索关键字
            searchKey: ''
        };
        /**
         * 脏值检测及强制刷新
         */
        function checkApply() {
            if ($scope.$$phase != '$apply' && $scope.$$phase != '$digest') {
                $scope.$apply();
            }
        };

        /**
         * 初始化页面数据
         * addBy liwenjuan 2016/12/30
         */
        var initView = function () {
            var storageCache = CacheServiceBus.getStorageCache();
            var yxLoginInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
            var account = yxLoginInfo.yxUser;
            $scope.doctorList = ConversationService.doctorList; //医生成员
            $scope.patientList = ConversationService.patientList;
            checkApply();
        };

        initView();

        /**
         * 监听物理返回
         */
        KyeeListenerRegister.once({
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction(); //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.removePage();
            }
        });

        /**
         * 移除当前页
         */
        $scope.removePage = function () {
            ConversationService.atViewOpenFlag = false;
            KyeeViewService.removeModal({
                id: "chooseAtMembers",
                scope: $scope
            });
            //离开此页面的时候将一次性事件卸载掉
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);

        };

        /**
         * 清除搜索关键字
         */
        $scope.clearInput = function () {
            $scope.searchObj.searchKey = "";
        };

        $scope.repeatFinash = function () {
            $ionicScrollDelegate.$getByHandle("choose_member_list").scrollTop();
        }
    })
    .build();