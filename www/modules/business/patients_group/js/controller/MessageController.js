/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间： 2016/7/22
 * 创建原因：消息tab界面
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.message.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.framework.service.broadcast3",
        "kyee.quyiyuan.patients_group.message.service",
        "kyee.quyiyuan.patients_group.personal_setting.controller",
        "kyee.quyiyuan.patients_group.group_list.controller",
        "kyee.quyiyuan.patients_group.search_group_list.controller",
        "kyee.quyiyuan.patients_group.add_friends.controller",
        "kyee.quyiyuan.patients_group.new_friends.controller",
        "kyee.quyiyuan.patients_group.conversation.controller",
        "kyee.quyiyuan.patients_group.group_details.controller",
        "kyee.quyiyuan.patients_group.contracts_list.service",
        "kyee.quyiyuan.patients_group.personal_home.service",
        "kyee.quyiyuan.patients_group.patients_group_message.controller",
        "kyee.quyiyuan.patients_group.patients_group_message.service",
        "kyee.quyiyuan.patients_group.conversation.service",
        "kyee.quyiyuan.emoji.service",
        "kyee.quyiyuan.patients_group.personal_chat.controller",
        "kyee.quyiyuan.login.service",
        "kyee.framework.device.deviceinfo",
        "monospaced.elastic",
        "kyee.quyiyuan.patients_group.patients_group_web.controller",
        "Kyee.quyiyuan.patients_group.upgrade.controller",
        "kyee.quyiyuan.patients_group.my_doctor.select_patients.controller", //备用
        "kyee.quyiyuan.patients_group.my_doctor.select_hospital_list.controller",
        "kyee.quyiyuan.patients_group.my_doctor_list.controller",
        "kyee.quyiyuan.patients_group.personal_chat.service",
        "kyee.quyiyuan.imUtil.service"
    ])
    .type("controller")
    .name("MessageController")
    .params([
        "$scope",
        "$rootScope",
        "$state",
        "$sce",
        "$timeout",
        "CacheServiceBus",
        "KyeeListenerRegister",
        "KyeeI18nService",
        "KyeeBroadcastService",
        "MessageService",
        "ContractsListService",
        "PersonalHomeService",
        "$ionicScrollDelegate",
        "PatientsGroupMessageService",
        "EmojiService",
        "LoginService",
        "ConversationService",
        "KyeeUtilsService",
        "KyeeDeviceInfoService",
        "OperationMonitor",
        "PersonalChatService",
        "StatusBarPushService",
        "IMUtilService",
        "GroupDetailsService",
        "$ionicListDelegate"
    ])
    .action(function ($scope, $rootScope, $state, $sce, $timeout, CacheServiceBus, KyeeListenerRegister,
        KyeeI18nService, KyeeBroadcastService, MessageService, ContractsListService,
        PersonalHomeService, $ionicScrollDelegate, PatientsGroupMessageService,
        EmojiService, LoginService, ConversationService, KyeeUtilsService, KyeeDeviceInfoService, OperationMonitor, PersonalChatService,
        StatusBarPushService, IMUtilService, GroupDetailsService, $ionicListDelegate) {
        //变量的初始化
        var storageCache = CacheServiceBus.getStorageCache();
        $scope.activeTab = MessageService.menuTabFlag; //初始化选项卡状态 0会话列表 1 联系人列表
        $scope.showRightTopMenuFalg = false; //右上菜单显示或隐藏 true 显示 false 隐藏
        $scope.setStick = {
            name: KyeeI18nService.get("messagecenter.setRead", "置顶")
        };
        $scope.setNoStick = {
            name: KyeeI18nService.get("messagecenter.setNoRead", "取消置顶")
        };
        $scope.rightTopMenu = { //右上菜单栏显示
            addGroupName: KyeeI18nService.get("messagecenter.addGroupName", "添加群"),
            addFriendsName: KyeeI18nService.get("messagecenter.addFriendsName", "添加好友"),
            addDoctors: KyeeI18nService.get("messagecenter.addDoctors", "添加医生")
        };
        //外部通知跳转进来，显示返回键
        if (StatusBarPushService.webJump) {
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        }
        // add by zhangyi at 20161207 for KYEEAPPC-9098 START
        $scope.words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#']; //字母索引列表
        $scope.showWordInfo = { //控制页面显示
            text: "",
            flag: false,
            top: 0
        };
        $scope.showIndexListFlag = false; //控制侧边导航条的显示与否(正常接收到后台返回的联系人信息后才显示)
        /**
         * 页面进入监听
         */
        KyeeListenerRegister.regist({
            focus: "message->MAIN_TAB",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                //同步当前用户头像
                syncPersonalPhoto();
                //获取用户登录信息，在没有信息的情况下重新登录
                //获取YX登录信息，若无则重新登录
                $scope.isWeb = !(IMUtil.isDeviceAvailable());
                $scope.yxLoginInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
                if (!$scope.yxLoginInfo) {
                    LoginService.getIMLoginInfo();
                    setTimeout(function () {
                        $scope.yxLoginInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
                        $scope.me = $scope.yxLoginInfo.yxUser;
                    }, 3000);
                } else {
                    $scope.me = $scope.yxLoginInfo.yxUser;
                }
                //设置进入会话列表页
                var arg = {
                    'isIn': true,
                    'pageType': 'SESSION',
                };
                IMDispatch.setChattingAccount(arg);
                //初始化会话列表
                dealMessageCenter();
                initSession();
                jsInterface.routerRecords = []; // add by zhangyi at 20161124 for KYEEAPPC-8731 初始化路由栈列表

            }
        });
        /**
         * 离开页面监听
         * 标识离开session界面
         */
        KyeeListenerRegister.regist({
            focus: "message->MAIN_TAB",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            direction: "both",
            action: function () {
                var arg = {
                    'isIn': false,
                    'pageType': 'SESSION',
                };
                IMDispatch.setChattingAccount(arg);
            }
        });
        /**
         * 脏值检测及强制刷新
         */
        function checkApply() {
            $scope.$evalAsync();
        };

        /**
         * 查询app云和病友圈的消息
         * false 是否显示加载状态
         * author licong
         */
        var dealMessageCenter = function () {
            PatientsGroupMessageService.queryMessages(false, function (data) {
                if (0 < $rootScope.unreadMessageCount) {
                    var memoryCache = CacheServiceBus.getMemoryCache();
                    var userVsId = memoryCache.get('currentCustomPatient').USER_VS_ID;
                    var userId = memoryCache.get('currentUserRecord').USER_ID;
                    var localUnreadMessage = PatientsGroupMessageService.getLocalMessage('UNREAD_MESSAGE_DATA');
                    localUnreadMessage = PatientsGroupMessageService.filterMessagesByUserVsId(userVsId, userId, localUnreadMessage);
                    var welcomeMessage = PatientsGroupMessageService.getLocalMessage('WELCOME_MESSAGE_DATA');
                    welcomeMessage = PatientsGroupMessageService.filterMessagesByUserVsId(userVsId, userId, welcomeMessage);
                    if (welcomeMessage && 0 < welcomeMessage.length) {
                        angular.forEach(welcomeMessage, function (data) {
                            if (0 == data.READ_FLAG) {
                                localUnreadMessage.push(data);
                            }
                        });
                    }
                    //排序
                    localUnreadMessage.sort(function (a, b) {
                        return a.CREATE_DATE < b.CREATE_DATE ? 1 : -1;
                    });
                    var message = localUnreadMessage[0];
                    var messageTime = KyeeUtilsService.DateUtils.parse(message.CREATE_DATE, "YYYY-MM-DD HH:mm:ss").getTime();
                    messageTime = IMUtilService.formatSessionDate(messageTime);

                    $scope.lastUnreadMessage = {
                        context: message.MESSAGE_DESCRIPTION,
                        datetime: messageTime
                    };
                } else { //处理已读和未读消息中心最后一条消息显示 addBy liwenjuan 2017/1/12
                    $scope.lastUnreadMessage = {
                        context: "",
                        datetime: ""
                    };
                }
            });
        };

        /**
         * 格式化sessionList
         * @param sessionList
         */
        var formatSession = function (sessionList) {
            var tmpSessionList = angular.copy(sessionList);
            //群组属性设置暂未处理
            if (tmpSessionList.length > 0) {
                for (var i = 0; i < tmpSessionList.length; i++) {
                    if (tmpSessionList[i].lastMsg && tmpSessionList[i].lastMsg.type == 'text') {
                        tmpSessionList[i].text = EmojiService.formatEmojiImageToChineseSignTo(tmpSessionList[i].lastMsg.content);
                    } else if (tmpSessionList[i].lastMsg && tmpSessionList[i].lastMsg.type == 'image') {
                        tmpSessionList[i].text = '[图片]';
                    } else if (tmpSessionList[i].lastMsg && tmpSessionList[i].lastMsg.type == 'audio') {
                        tmpSessionList[i].text = '[语音]';
                    } else if (tmpSessionList[i].lastMsg && tmpSessionList[i].lastMsg.type == 'notification') {
                        tmpSessionList[i].text = '[群通知消息]';
                    } else if (tmpSessionList[i].lastMsg && tmpSessionList[i].lastMsg.type == 'custom') {
                        if (tmpSessionList[i].lastMsg.attach && tmpSessionList[i].lastMsg.attach.scMsgType) {
                            if (tmpSessionList[i].lastMsg.attach.scMsgType == 3) {
                                tmpSessionList[i].text = '[购药开单信息]';
                            } else if (tmpSessionList[i].lastMsg.attach.scMsgType == 5) {
                                tmpSessionList[i].text = '[患者信息]';
                            }
                        }
                        // tmpSessionList[i].text = tmpSessionList[i].lastMsg.pushContent;
                    } else if (tmpSessionList[i].lastMsg && tmpSessionList[i].lastMsg.type == 'tip') {
                        if (tmpSessionList[i].lastMsg.flow == 0 && tmpSessionList[i].lastMsg.remoteExtension && tmpSessionList[i].lastMsg.remoteExtension.localContent) {
                            tmpSessionList[i].text = tmpSessionList[i].lastMsg.remoteExtension.localContent;
                        } else {
                            tmpSessionList[i].text = tmpSessionList[i].lastMsg.content;
                            tmpSessionList[i].lastMsg.status = 'success';
                        }
                    }
                    if (tmpSessionList[i].text == "正在等您回复，请尽快查看") {
                        tmpSessionList[i].text = "提醒信息已为您发送"
                    }
                    tmpSessionList[i].dateTime = IMUtilService.formatSessionDate(tmpSessionList[i].lastMsgTime);
                    if (!tmpSessionList[i].groupLabel || tmpSessionList[i].groupLabel == '' || tmpSessionList[i].groupLabel == 'null') {
                        tmpSessionList[i].groupLabel = "";
                    }
                    if (tmpSessionList[i].customData) {
                        //session的扩展字段（暂未处理）
                        var customData = JSON.parse(tmpSessionList[i].extension);
                    }
                    if (tmpSessionList[i].scene == 1) {
                        if (tmpSessionList[i].atMsg && tmpSessionList[i].atMsg != -1 && tmpSessionList[i].unreadCount > 0) {
                            tmpSessionList[i].isAt = 1;
                        } else {
                            tmpSessionList[i].isAt = 0;
                        }
                    } else {
                        //个人聊天不设置消息不提醒功能
                        tmpSessionList[i].isNotice = 0;
                    }
                }
            }
            $scope.sessionList = tmpSessionList;
            //计算所有未读数
            doSetTotalCount($scope.sessionList);
            $ionicScrollDelegate.$getByHandle("message_content").resize();
            checkApply();
        };
        /**
         * 初始化获取会话列表
         */
        var initSession = function () {
            $scope.sessionList = [];
            var sessions = [];
            sessions = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
            if (IMUtil.isDeviceAvailable()) {
                IMDispatch.getTotalUnreadCount(function (count) {
                    $rootScope.unreadImMessageCount += count;
                });
            }
            if (sessions && sessions.length > 0) {
                formatSession(sessions);
            } else {
                IMDispatch.queryRecentContacts(function (sessions) {
                    jsInterface.receiveSession(sessions);
                });
            }
        };
        /**
         * 处理已被删除的session
         * @param sessionItem
         */
        function dealDeleteSession(sessionItem) {
            for (var i = 0; i < $scope.sessionList.length; i++) {
                if (sessionItem.id == $scope.sessionList[i].id) {
                    for (var j = i; j < $scope.sessionList.length - 1; j++) {
                        $scope.sessionList[j] = $scope.sessionList[j + 1];
                    }
                    $scope.sessionList.pop();
                    break;
                }
            }
        };
        /**
         * 同步个人照片
         * add by wyn 20160826
         * 修复在联系人菜单点击上传图像主界面未同步更新问题；
         */
        var syncPersonalPhoto = function () {
            $scope.userActInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO);
            if (!$scope.userActInfo) {
                var loginUser = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD) || {};
                $scope.userPhoto = (loginUser.sex == 2 ?
                    'resource/images/patients_group/user_female.png' :
                    'resource/images/patients_group/user_male.png');
                MessageService.getLoginUserInfo(function (data) {
                    CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO, data);
                    $scope.userActInfo = data;
                    $scope.userPhoto = $scope.userActInfo.userPhoto || ($scope.userActInfo.sex == 2 ?
                        'resource/images/patients_group/user_female.png' : 'resource/images/patients_group/user_male.png');
                });
            } else {
                $scope.userPhoto = $scope.userActInfo.userPhoto || ($scope.userActInfo.sex == 2 ?
                    'resource/images/patients_group/user_female.png' : 'resource/images/patients_group/user_male.png');
            }
        };
        /**
         * 获取联系人列表
         * @author licong
         */
        var loadContactsData = function () {
            ContractsListService.getContactData(function (data) {
                $scope.showIndexListFlag = true; //显示侧边导航条
                $scope.wordHeight = (KyeeUtilsService.getInnerSize().height - 150) / 27; //根据屏幕大小动态设置单词高度
                $scope.friendsCount = data.userAttenList.length;
                $scope.contactData = ContractsListService.dealContactData(data.userAttenList);
                $scope.newFriendNum = data.newFriendNum;
            });
            //联系人点击统计 add by wyn 20161110
            OperationMonitor.record("msgContactList", "message->MAIN_TAB");
        };
        /**
         * 获取当前设备平台 iOS or android
         */
        // KyeeDeviceInfoService.getInfo(function (info) {
        //     $scope.platform = info.platform;
        // }, function () {});
        /**
         * 计算未读消息总数 
         */
        var doSetTotalCount = function (sessionList) {
            var totalCount = 0;
            for (var i in sessionList) {
                totalCount += parseInt(sessionList[i].unreadCount);
            }
            $rootScope.messageCount = totalCount;
            //及时监听消息未读数总数并广播到tabController addBy liyanhui
            KyeeBroadcastService.doSend('unreadImMessage', totalCount);
            //设置桌面icon未读消息角标
            // IMChattingService.setAppleBadgeNumber(totalCount);
        };
        //ng-bind-html需要安全绑定 addBy lwj 2016/7/29
        $scope.TrustInputContent = function (text) {
            return $sce.trustAsHtml(text);
        };
        /**
         * 进入个人设置 add by lwj 2016/7/29
         */
        $scope.goPersonalSetting = function () {
            $state.go("personal_setting");
            //个人设置界面统计 add by wyn 20161110
            OperationMonitor.record("msgPersonalSetting", "message->MAIN_TAB");
        };
        /**
         * 跳转至消息中心
         */
        $scope.goMessageCenter = function () {
            OperationMonitor.record("msgMessageCenter", "message->MAIN_TAB");
            $state.go("patients_group_message");
        };
        /**
         * 点击某条消息响应事件 addBy lwj 2016/7/29
         * @param sessionItem
         */
        $scope.onMessageClick = function (sessionItem) {
            $rootScope.unreadImMessageCount -= sessionItem.unreadCount;
            IMDispatch.markMsgRead(sessionItem.lastMsg);
            var groupInfo = {};
            if (sessionItem.atMsg) {
                IMDispatch.clearRecentContactAited(sessionItem.id);
                sessionItem.atMsg = -1;
                var sessions = [];
                sessions.push(sessionItem);
                jsInterface.receiveSession(sessions);
            }
            if (sessionItem.scene == 1) {
                MessageService.lastReadtime = "";
                ConversationService.goConversation(sessionItem.id, $scope);
            } else {
                MessageService.lastMsg = sessionItem.lastMsg;
                MessageService.lastReadtime = sessionItem.msgReceiptTime;
                MessageService.goMessageWin(sessionItem);
            }
        };
        /**
         * 删除某一条会话session addBy lwj 2016/7/29
         * @param sessionItem
         */
        $scope.deleteSession = function (sessionItem) {
            $ionicListDelegate.closeOptionButtons();
            IMDispatch.deleteRecentContact(sessionItem.id, sessionItem.scene);
            dealDeleteSession(sessionItem);
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST, $scope.sessionList);
            initSession();
        };
        /**
         * 清空某条对话的未读数
         * @param {*} session 
         */
        $scope.clearUnreadCount = function (session) {
            $ionicListDelegate.closeOptionButtons();
            IMDispatch.clearUnreadCount(session.id, session.scene);
        };
        /**
         * 显示右上菜单栏 addBy lwj 2016/7/29
         * @param $event
         */
        $scope.onRightPopoverMenu = function ($event) {
            $scope.showRightTopMenuFalg = true;
        };
        /**
         * 隐藏右上菜单 addBy lwj 2016/7/29
         */
        $scope.hideRightTopMenu = function () {
            $scope.showRightTopMenuFalg = false;
        };
        /**
         * 跳转到群聊列表页
         * modify by wyn 20161125 处理该方法名称和容联WEBsdk方法名同名问题
         */
        $scope.goMyGroupList = function () {
            $state.go("group_list");
            //群组列表点击统计 add by wyn 20161120
            OperationMonitor.record("msgGroupList", "message->MAIN_TAB");
        };
        /**
         * 进入病友详情页
         * @param user
         */
        $scope.goPersonalPage = function (user) {
            PersonalHomeService.userInfo = {
                userId: user.userId,
                fromGroupId: ""
            };
            $state.go("personal_home");
            //个人详情点击统计 add by wyn 20161110
            OperationMonitor.record("msgPersonalHome", "message->MAIN_TAB");
        };
        /**
         * 索引列表单击时
         * @param evt
         * add by zhangyi at 20161207 for KYEEAPPC-9098
         */
        $scope.doIndexedBarClick = function (evt) {
            //获取点击动作的具体位置
            var y = evt.clientY;
            //计算当前所处的字母
            var index = Math.floor((y - 100) / $scope.wordHeight);
            //定义合法范围
            if (index >= 0 && index <= 26) {
                $scope.showWordInfo.text = $scope.words[index];
                $scope.showWordInfo.flag = true;
                $scope.showWordInfo.top = y - 30;
                if (document.getElementById("group_id_" + $scope.words[index])) {
                    $ionicScrollDelegate.$getByHandle("message_content").scrollTo(0, document.getElementById("group_id_" + $scope.words[index]).offsetTop, false);
                }
            }
            // 高亮 250ms 后消失
            $timeout(function () {
                $scope.showWordInfo.flag = false;
            }, 250);
        };
        /**
         * 索引列表拖动时
         * @param evt
         * add by zhangyi at 20161207 for KYEEAPPC-9098
         */
        $scope.doIndexedBarDrag = function (evt) {
            //获取拖拽动作的具体位置
            var y = evt.gesture.center.pageY;
            //计算当前所处的字母
            var index = Math.floor((y - 100) / $scope.wordHeight);

            //定义合法范围
            if (index >= 0 && index <= 26) {
                $scope.showWordInfo.text = $scope.words[index];
                $scope.showWordInfo.flag = true;
                $scope.showWordInfo.top = y - 30;

                if (document.getElementById("group_id_" + $scope.words[index])) {
                    $ionicScrollDelegate.$getByHandle("message_content").scrollTo(0, document.getElementById("group_id_" + $scope.words[index]).offsetTop, false);
                }
            }
        };
        /**
         * session列表的监听
         */
        KyeeBroadcastService.doRegister($scope, 'SESSION_LIST', function (result) {
            formatSession(result);
            checkApply();
        });
        /**
         * 索引列表释放时
         * add by zhangyi at 20161207 for KYEEAPPC-9098
         */
        $scope.doIndexedBarRelease = function () {
            $scope.showWordInfo.flag = false;
        };
        /**
         * 接收消息监听
         */
        KyeeBroadcastService.doRegister($scope, 'sendMsgDone', function (result) {
            initSession();
        });
        /**
         * 接收到groupInf
         */
        KyeeBroadcastService.doRegister($scope, 'GROUP_INF', function (groupInfo) {
            ConversationService.goConversation(groupInfo, $scope);
        });
    })
    .build();