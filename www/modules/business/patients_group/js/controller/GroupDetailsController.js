/**
 * 产品名称：quyiyuan
 * 创建者：王亚宁
 * 创建时间： 2016/7/27
 * 创建原因：群组详情界面开发 KYEESUPPORT-47
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.group_details.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.patients_group.group_details.service",
        "kyee.quyiyuan.patients_group.group_members.controller",
        "kyee.quyiyuan.patients_group.modify_group_card.controller",
        "kyee.quyiyuan.patients_group.conversation.controller",
        "kyee.quyiyuan.patients_group.personal_home.service",
        "kyee.quyiyuan.patients_group.my_doctor_details.service",
        "kyee.quyiyuan.patients_group.group_announcement.controller",
        "kyee.quyiyuan.hospital.service"
    ])
    .type("controller")
    .name("GroupDetailsController")
    .params([
        "$scope",
        "$state",
        "$ionicHistory",
        "KyeeListenerRegister",
        "CacheServiceBus",
        "KyeeMessageService",
        "KyeeI18nService",
        "GroupDetailsService",
        "GroupListService",
        "ConversationService",
        "KyeeUtilsService",
        "PersonalHomeService",
        "MyDoctorDetailsService",
        "HospitalService"
    ])
    .action(function ($scope, $state, $ionicHistory, KyeeListenerRegister, CacheServiceBus, KyeeMessageService,
                      KyeeI18nService, GroupDetailsService, GroupListService, ConversationService,
                      KyeeUtilsService, PersonalHomeService,
                      MyDoctorDetailsService,HospitalService) {
        var storageCache = CacheServiceBus.getStorageCache(); //localStroage存储
        $scope.group = {
            isNotice: false, //群组消息免打扰开关
            isInGroup: null //当前用户是否已加群
        };
        $scope.quitFlag = false;

        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "group_details",
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
                params.stopAction(); //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.goBack();
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
         * 进入医生详情
         * addBy liwenjuan 2016/12/26
         */
        $scope.goDoctorDetails = function () {
            var yxUser = $scope.receiverInfo.yxUser; //进详情去掉跨应用appKey前缀 addBy liwnejuan 2017/1/11
            MyDoctorDetailsService.doctorInfo = {
                "yxUser": yxUser,
                "userRole": $scope.receiverInfo.userRole
            };
            $state.go("my_doctor_details");
        };
        /**
         * 界面初始化
         * modified by zhangyi at 20161128 for KYEEAPPC-8899 群详情中增加医生相关信息 [KYEEAPPC-8285 病友圈三期]
         */
        var init = function () {
            var lastView = $ionicHistory.backView().stateId;
            if (lastView == 'conversation' && !$scope.quitFlag) {
                ConversationService.pullMessageList = false;
            } else if (lastView == 'personal_chat') {
                PersonalChatService.pullMessageList = false;
            }
            if($scope.quitFlag){
                ConversationService.pullMessageList = true;
                $scope.quitFlag = !$scope.quitFlag;
            }

            $scope.groupIsId = GroupDetailsService.groupId ? GroupDetailsService.groupId:HospitalService.tid;
            //获取群信息
            GroupDetailsService.queryGroupInfo($scope.groupIsId, function (data) {
                $scope.groupInfo = data;
                $scope.groupId = data.tid;
                GroupDetailsService.groupName = data.tname;
                GroupDetailsService.owner = data.owner;
                GroupDetailsService.memberCount = data.members.length;
                var showGroupNum = Math.floor((KyeeUtilsService.getInnerSize().width - 92) / 60);
                $scope.pageShowMembers = data.members || [];
                if ($scope.pageShowMembers.length >= showGroupNum) { //超过页面可以显示的数量，则截取一部分
                    $scope.pageShowMembers = $scope.pageShowMembers.slice(0, showGroupNum);
                }
                $scope.groupCard = data.groupPetName; //用户群名片
                $scope.group.isInGroup = (data.isInGroup != 0); //当前用户是否已加群
                $scope.group.isNotice = (data.muteTeam == 1); //群组是否设置消息免打扰 1.免打扰 2.打扰
                $scope.isScanApply = GroupDetailsService.isScan;

            });
        };

        /**
         * 返回方法
         * 返回聊天界面时更新用户群名片
         * edited by zhangyi at 20161124 for KYEEAPPC-8731
         */
        $scope.goBack = function () {
            var backView = $ionicHistory.backView() || {}; //默认赋值为{}
            if (jsInterface.routerRecords.length > 0) { //KYEEAPPC-8731 如果是从个人详情进入的群详情页面，返回到记录过的个人详情页面。
                var endItem = jsInterface.routerRecords.pop();
                if ("string" == typeof (endItem)) {
                    PersonalHomeService.userInfo.userId = endItem;
                } else {
                    MyDoctorDetailsService.doctorInfo = endItem;
                }
            }
            if (!$scope.group.isInGroup && "conversation" == backView.stateId &&
                (GroupDetailsService.preGroupId == GroupDetailsService.groupId)) {
                $ionicHistory.goBack(-2);
            }
            else if(!$scope.group.isInGroup){
                $state.go("group_list")
            }
            else {
                if($scope.quitFlag && "conversation" == backView.stateId){
                    $ionicHistory.goBack(-2);
                }else if ("conversation" == backView.stateId) {
                    ConversationService.groupInfo.userGroupPetname = $scope.groupCard;
                    $ionicHistory.goBack(-1);

                } else {
                    $state.go("conversation")
                }
            }
        };

        /**
         * 跳转至群组成员界面
         */
        $scope.goGroupMembers = function () {
            GroupListService.groupInfo.groupId = $scope.groupInfo.tid;
            PersonalHomeService.userInfo.fromGroupId = "";
            $state.go("group_members");
        };

        /**
         * 跳转至修改群名片界面
         * @param groupId
         */
        $scope.goModifyGroupCard = function (groupId) {
            //如果是游客，不能修改群名片，需给出提示
            /*if($scope.groupInfo.groupType != 2 && $scope.currentUserStatus != 1){
             $scope.showTipsForTourist();
             return;
             }*/
            GroupDetailsService.groupId = groupId;
            GroupDetailsService.groupCard = $scope.groupCard;
            $state.go("modify_group_card");
        };

        /**
         * 清除当前群组聊天记录
         */
        $scope.clearGroupChatData = function (groupId) {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("group_details.tips", "提示"),
                content: KyeeI18nService.get("group_details.sureToDelete", "确认删除聊天记录？"),
                onSelect: function (flag) {
                    if (flag) {
                        GroupDetailsService.clearCurGroupData(groupId);
                        ConversationService.curMessageList = [];
                    }
                }
            });
        };

        /**
         * 切换消息通知状态
         * 状态栏通知消息：默认为接收（0）；不接收（1）
         */
        $scope.pushGroupNoticeChange = function (groupId) {
            var isNotice = $scope.group.isNotice ? 1 : 2;
            var loginInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
            var params = {
                tid:groupId,
                owner:$scope.groupInfo.owner,
                accid:loginInfo.yxUser,
                ope:isNotice
            }
            GroupDetailsService.doSwitchNoticeStatus(params, function (res) {
                if (res) {
                    if (ConversationService.groupInfo) {
                        ConversationService.groupInfo.muteTeam = ConversationService.groupInfo.muteTeam == 1?2:1;  //更新聊天界面群组信息
                        var sessions = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
                        for(var i = 0;i<sessions.length;i++){
                            if(sessions[i].id == groupId){
                                sessions[i].muteTeam = ConversationService.groupInfo.muteTeam;
                                jsInterface.receiveSession(sessions);
                            }
                        }
                    }
                } else {
                    $scope.group.isNotice = !$scope.group.isNotice;
                }
            });
        };
        /**
         *退出群组
         * @param groupId
         */
        $scope.quitGroup = function (groupId) {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("group_details.tips", "提示"),
                content: KyeeI18nService.get("group_details.sureToQuitGroup", "确认退出该群组？"),
                onSelect: function (flag) {
                    if (flag) {
                        var yxUser =CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO).yxUser;
                        GroupDetailsService.doQuitGroup(groupId, yxUser,function (data) {
                            GroupDetailsService.isScan = "noInitScan";
                            $scope.quitFlag = true;
                            init();
                            GroupDetailsService.clearCurGroupData(groupId);
                            ConversationService.curMessageList = [];
                            ConversationService.deteleSessionByTId(groupId);
                        });
                    }
                }
            });
        };

        /**
         * 申请加入
         * @param groupId
         */
        $scope.applyJoinGroup = function(){
            var param = {
                yxUser:HospitalService.yxUser,
                tid:$scope.groupIsId,
                owner: GroupDetailsService.owner//HospitalService.owner
            }
            GroupDetailsService.clearCurGroupData($scope.groupIsId); //申请加群之前清除该群的聊天记录
            GroupDetailsService.doApplyJoinGroup(param, function(groupInfo){
                GroupDetailsService.isScan = "noInitScan"
                KyeeMessageService.broadcast({
                    content: groupInfo.msg || KyeeI18nService.get("commonText.networkErrorMsg", "加群成功"),
                    duration: 2000
                });
                init();
                ConversationService.goConversation($scope.groupIsId,$scope);

            });
        };
        /**
         * 游客点击修改群名片时给出提示信息
         */
        /* $scope.showTipsForTourist = function(){
         KyeeMessageService.message({
         title: KyeeI18nService.get("commonText.msgTitle","提示"),
         content: KyeeI18nService.get("personal_setting_modify_sucess",
         "您的身份为游客，暂无权限修改昵称！"),
         okText: KyeeI18nService.get("commonText.iknowMsg","我知道了")
         });
         };*/

        /**
         * 进入公告详情页，查看所有公告详情
         */
        $scope.goAnnouncementDetail = function () {
            $state.go("group_announcement");
        };
    })
    .build();