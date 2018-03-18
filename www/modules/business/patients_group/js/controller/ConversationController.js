/**
 * Created by lwj on 2016/7/27.
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.conversation.controller")
    .require([
        "kyee.quyiyuan.patients_group.conversation.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.emoji.service",
        "kyee.framework.service.broadcast3",
        "kyee.quyiyuan.patients_group.choose_at_members.controller",
        "kyee.quyiyuan.patients_group.group_details.controller",
        "kyee.quyiyuan.patients_group.message.service",
        "kyee.quyiyuan.patients_group.group_details.service",
        "kyee.quyiyuan.patients_group.personal_home.service",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.camera",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.patients_group.patients_group_web.service",
        "kyee.quyiyuan.patients_group.my_doctor_details.service",
        "kyee.quyiyuan.imUtil.service"
    ])
    .type("controller")
    .name("ConversationController")
    .params([
        "$http",
        "$scope",
        "$state",
        "$sce",
        "$ionicScrollDelegate",
        "$ionicHistory",
        "EmojiService",
        "KyeeListenerRegister",
        "KyeeMessageService",
        "KyeeBroadcastService",
        "KyeeViewService",
        "CacheServiceBus",
        "ConversationService",
        "MessageService",
        "GroupDetailsService",
        "PersonalHomeService",
        "KyeeCameraService",
        "KyeeDeviceInfoService",
        "GroupListService",
        "KyeeI18nService",
        "KyeeEnv",
        "KyeeUtilsService",
        "LoginService",
        "$ionicSlideBoxDelegate",
        "patientsGroupWebService",
        "$ionicViewSwitcher",
        "MyDoctorDetailsService",
        "IMUtilService"
    ])
    .action(function ($http, $scope, $state, $sce, $ionicScrollDelegate, $ionicHistory, EmojiService, KyeeListenerRegister, KyeeMessageService,
        KyeeBroadcastService, KyeeViewService, CacheServiceBus, ConversationService, MessageService, GroupDetailsService,
        PersonalHomeService, KyeeCameraService, KyeeDeviceInfoService, GroupListService, KyeeI18nService,
        KyeeEnv, KyeeUtilsService, LoginService, $ionicSlideBoxDelegate, patientsGroupWebService,
        $ionicViewSwitcher, MyDoctorDetailsService, IMUtilService) {
        // 变量的初始化
        $scope.isWeb = false;
        $scope.firstRecord = true;
        var groupDetail = {};
        $scope.yxLoginInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
        $scope.me = $scope.yxLoginInfo.yxUser;
        $scope.bigImageMessage = {};
        var groupMembers = {};
        var storageCache = CacheServiceBus.getStorageCache();
        // 解决ios键盘弹出时页面内容（包含header）被挤到上面的问题
        if (window.cordova && window.cordova.plugins.Keyboard) {
            var isIOS = window.ionic.Platform.isIOS();
            if (isIOS) {
                window.cordova.plugins.Keyboard.disableScroll(true);
                // 监听键盘弹出，隐藏
                window.addEventListener('native.keyboardshow', keyboardShowHandlerGC);
                window.addEventListener('native.keyboardhide', setFooterBarStyle);
            }
        }

        var keyboardShowHandlerGC = function () {
            $ionicScrollDelegate.$getByHandle("conversation_content").resize();
            $ionicScrollDelegate.$getByHandle("conversation_content").scrollBottom(true);
        };
        var imgLoadWatcherTimer = undefined;
        var keyboardLoadWatcherTimer = undefined;
        var img = new Image();
        // add by zhangyi on 20161230 APPREQUIREMENT-2072 支付宝生活号URL配置处理方式改善
        var isLegalWebApp = jsInterface.isPatientGroupLegalWebApp();
        var isDevice = IMUtil.isDeviceAvailable();
        if (isLegalWebApp || !isDevice) {
            $scope.isWeb = true;
        } else {
            $scope.isWeb = false;
        }
        /**
         * 绑定弹出图片层参数传递
         * @param params
         */
        $scope.bind = function (params) {
            var screenSize = KyeeUtilsService.getInnerSize();
            $scope.overlayPicData = {
                width: screenSize.width,
                height: screenSize.height,
                imgWidth: screenSize.width,
                imgHeight: screenSize.height
            };

            $scope.showOverlay = params.show;
            $scope.hideOverlay = params.hide;
            params.regist({
                hideImgShow: $scope.hideImgShow,
                showTipPanel: $scope.showTipPanel,
                animate: false //隐藏放大图片的是否显示动画 false不显示 true显示
            });
        };
        /**
         * 长按图片显示提示面板，暂仅提供保存图片至本地和取消功能 【注：仅支持移动端接收方保存图片】
         * add by wyn 20170123
         */
        $scope.showTipPanel = function () {
            if (IMUtilService.isDeviceAvailable()) {
                KyeeMessageService.actionsheet({
                    title: "",
                    buttons: [{
                        text: KyeeI18nService.get("patientsGroup.savePhotosToLocal", "保存图片")
                    }],
                    onClick: function (index) {
                        if (0 == index) {
                            IMDispatch.downloadAttachment($scope.bigImageMessage, function () {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("patientsGroup.savePhotoSuccess", "保存成功")
                                });
                            }, function () {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("patientsGroup.savePhotoFailed", "保存失败，请重试！")
                                });
                            });
                        }
                    },
                    cancelButton: true
                });
            }
        };
        /**
         * 页面进入时监听
         */
        KyeeListenerRegister.regist({
            focus: "conversation",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                initPageParams();
                initEmoJi();
                initView();
                setFooterBarStyle();
            }
        });
        /**
         * 页面离开监听
         */
        KyeeListenerRegister.regist({
            focus: "conversation",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function () {
                var arg = {
                    'isIn': false,
                    'pageType': 'CHAT',
                    'sessionType': 1,
                    'sessionId': $scope.groupInfo.tid
                };
                IMDispatch.setChattingAccount(arg);
                // 离开页面时销毁定时器
                if (imgLoadWatcherTimer != undefined) {
                    KyeeUtilsService.cancelInterval(imgLoadWatcherTimer);
                }
                if (keyboardLoadWatcherTimer != undefined) {
                    KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
                }
                //如果有正在播放的录音则将它停止
                if ($scope.voiceMessage.startRecordFlag) {
                    IMDispatch.endAudioRecording();
                }
                if ($scope.voiceMessage.playMsgId) {
                    //停止播放语音
                    IMDispatch.stopPlayAudio();
                }
                // 离开页面时删除键盘监听事件
                if (isIOS) {
                    window.removeEventListener('native.keyboardshow', keyboardShowHandlerGC);
                    window.removeEventListener('native.keyboardhide', setFooterBarStyle);
                }
                //清除播放语音的媒体资源

                ConversationService.pullMessageList = true;
                ConversationService.isUpdateMembers = false;

            }
        });
        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "conversation",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction(); //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });
        /**
         * 初始化界面参数
         */
        var initPageParams = function () {
            if (ConversationService.pullMessageList || !ConversationService.isUpdateMembers) {
                $scope.talkData = []; //聊天记录对象
                $scope.MsgListTmp = [];
            }
            $scope.noMoreMessage = ""; //下拉刷新加载更多提示
            $scope.showMenuIndex = -1; //是否有显示的删除消息、撤回菜单标识 默认-1 没有显示记录 大于-1 有显示记录
            $scope.oldTextContent = ""; //记录文本框输入的值
            $scope.yxLoginInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
            $scope.foo = ""; //初始化消息内容
            $scope.contentBottom = 56; //初始化底部高度
            $scope.atMembers = []; //群组at人员voipId
            $scope.emojiOpenFlag = false; //表情包显示或隐藏
            $scope.attachOpenFlag = false; //选择图片区域显示或隐藏
            $scope.allowSend = false; //是否允许发送
            $scope.firstGoIn = false; //首次进入标识
            // $scope.isAtMe = false;
            $scope.groupInfo = ConversationService.groupInfo //获取群组信息
            $scope.senderInfo = ConversationService.senderInfo(); //获取发送者信息
            $scope.senderInfo.userGroupPetname = $scope.groupInfo.userGroupPetname;
            $scope.voiceOpenFlag = false; //语音功能开启或隐藏
            $scope.voiceMessage = {
                playMsgId: null, //当前播放语音对象id
                showVoiceModal: false, //语音录制界面是否显示 false默认不显示 true显示
                cancel_tit: "手指上滑，取消发送", //语音录制界面文本提示
                cancelFlag: false, //默认不取消状态 true取消发送
                record_tit: "按住 说话", //语音发送按钮文本
                voiceAutoEnd: false, //默认为false 响应结束录音事件  true不响应结束录音事件  勿删
                startRecordFlag: false, //是否开始执行录音
                shortRecordFlag: false //录音时间短 默认false
            };
            $scope.groupAnnouncement = ""; //群公告内容字段
            if (isIOS) {
                $scope.announcementTop = 63; //初始化content顶部
            } else {
                $scope.announcementTop = 43; //初始化content顶部
            }
            //屏蔽网页版语音功能模块
            if (IMUtil.isDeviceAvailable()) {
                $scope.showVoiceArea = true;
            } else {
                $scope.showVoiceArea = false;
            }

        };
        /**
         * 初始化聊天界面
         */
        var initView = function () {
            var sessionId = $scope.groupInfo.tid; //群组id
            var arg = {
                'isIn': true,
                'pageType': 'CHAT',
                'sessionType': 1,
                'sessionId': $scope.groupInfo.tid
            };
            IMDispatch.setChattingAccount(arg);
            var msg = {
                'to': $scope.groupInfo.tid,
                'scene': 1,
            };
            var team = $scope.groupInfo.tid;
            //获取群成员信息并放入关联数组
            groupMembers = sessionStorage.getItem($scope.groupInfo.tid);
            if (ConversationService.isUpdateMembers || groupMembers == undefined || groupMembers == "" || groupMembers == []) {
                groupMembers = {};
                GroupDetailsService.queryGroupInfo($scope.groupInfo.tid, function (data) {
                    if (data.members) {
                        for (var i = 0; i < data.members.length; i++) {
                            groupMembers[data.members[i].accid] = data.members[i];
                        }
                        sessionStorage.setItem($scope.groupInfo.tid, JSON.stringify(groupMembers));
                        if (ConversationService.pullMessageList || !ConversationService.isUpdateMembers) {
                            IMDispatch.getMessageList(msg, 5, msg.endTime, function (msgList) {
                                formatHistory(msgList, 0);
                            });
                        }
                    }
                });
            } else {
                groupMembers = JSON.parse(groupMembers);
                if (ConversationService.pullMessageList || !ConversationService.isUpdateMembers) {
                    IMDispatch.getMessageList(msg, 5, msg.endTime, function (msgList) {
                        formatHistory(msgList, 0);
                    });
                }
            }
            var groupAnnouncement = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.GROUP_ANNOUNCEMENT) || {};
            if (!groupAnnouncement[$scope.groupInfo.tid]) {
                $scope.groupAnnouncement = ConversationService.groupInfo.announcement;
            } else {
                $scope.groupAnnouncement = '';
            }


            // $scope.groupAnnouncement = ConversationService.groupInfo.announcement;
            //首次进入该群的相关处理（未做）
        };
        /**
         * 初始化表情包
         */
        var initEmoJi = function () {
            var lineSize = 7;
            var initHeight = ($scope.KyeeEnv.innerSize.height / 2) - 56;
            $scope.emojiDivHeight = (initHeight >= 240) ? 240 : (initHeight <= 184 ? 200 : initHeight); //限制最小高度和最大高度
            $scope.emojiPadding = (($scope.KyeeEnv.innerSize.width - 28 - 25 * 7) / 14);
            $scope.clearOffLeft = ($scope.KyeeEnv.innerSize.width - 28) / 7 * 6 + 14;
            var lineNum = 3; //一页三行
            $scope.emojiData = []; //分页
            var emojiPageData = []; //分行
            var emojiLineData = []; //一行
            var pageIndex = 0;
            for (var i = 0; i < EmojiService.emojiData.length; i++) {
                emojiLineData.push(EmojiService.emojiData[i]);
                if ((i + 1 - pageIndex * 20) % lineSize == 0) { // 20 一页显示的个数
                    emojiPageData.push(emojiLineData);
                    emojiLineData = [];
                }
                if ((i + 1) % 20 == 0) {
                    emojiPageData.push(emojiLineData);
                    $scope.emojiData.push(emojiPageData);
                    pageIndex++;
                    emojiLineData = [];
                    emojiPageData = [];
                }
            }

            // 删除按钮,在每页的最后一行末尾添加
            var deleteIcon = {
                emojiUrl: "resource/images/patients_group/delete.png",
                chineseSign: "deleteIcon"
            };
            // 空白表情，占位
            var emptyIcon = {
                emojiUrl: "",
                chineseSign: "emptyIcon"
            };

            if (emojiLineData != []) {
                if (emojiLineData.length == lineSize) {
                    emojiPageData.push(emojiLineData);
                    emojiLineData = [];
                    emptyIcon.emptyBlock = (lineSize - 1) * (25 + 2 * $scope.emojiPadding);
                    emojiLineData.push(emptyIcon);
                    emojiLineData.push(deleteIcon);
                } else if (emojiLineData.length == lineSize - 1) {
                    emojiLineData.push(deleteIcon);
                } else {
                    emptyIcon.emptyBlock = (lineSize - 1 - emojiLineData.length) * (25 + 2 * $scope.emojiPadding);
                    emojiLineData.push(emptyIcon);
                    emojiLineData.push(deleteIcon);
                }

                emojiPageData.push(emojiLineData);
                emojiLineData = [];
            }
            if (emojiPageData != []) {
                $scope.emojiData.push(emojiPageData);
                emojiPageData = [];
            }

            if ($scope.emojiData && $scope.emojiData.length > 0) {
                for (var i = 0; i < $scope.emojiData.length - 1; i++) {
                    ($scope.emojiData[i])[lineNum - 1].push(deleteIcon);
                }
            }
        };
        /**
         * 清除输入框最后一个字符
         */
        $scope.clearLastWord = function () {
            if (!$scope.foo) {
                return;
            }
            var lastChar = $scope.foo.substring($scope.wholeCursor - 1, $scope.wholeCursor);
            var startIndex = $scope.wholeCursor - 1;
            var partFoo = $scope.foo.substring(0, $scope.wholeCursor);
            if (lastChar == "]" && partFoo.lastIndexOf("[") > -1) {
                var emoJiIndex = partFoo.lastIndexOf("[");
                var lastEmoJi = $scope.foo.substring(emoJiIndex, $scope.wholeCursor);
                for (var i in EmojiService.emojiCodeCompChineseSign) {
                    if (lastEmoJi == EmojiService.emojiCodeCompChineseSign[i]) {
                        startIndex = emoJiIndex;
                        break;
                    }
                }
            }
            $scope.foo = $scope.foo.substring(0, startIndex) + $scope.foo.substring($scope.wholeCursor, $scope.foo.length);
            $scope.wholeCursor = startIndex;
        };

        /**
         * 获取当前设备平台 iOS or android
         */
        KyeeDeviceInfoService.getInfo(function (info) {
            $scope.platform = info.platform;
        }, function () {});
        /**
         * 处理历史消息
         */
        var formatHistory = function (message, flag) {
            if (message.length == 0 && flag == 1) {
                $scope.noHisMsg = true;
                $scope.noMoreMessage = "没有更多历史记录";
            }
            for (var i = 0; i < message.length; i++) {
                var account = message[i].from;
                if (message[i].type == 'tip' && message[i].flow == 0 && message[i].remoteExtension) {
                    message[i].content = message[i].remoteExtension.localContent;
                }
                message[i].petname = message.fromNick;
                if (groupMembers && groupMembers[account]) {
                    message[i].userPhoto = groupMembers[account].user.icon;
                    message[i].sex = groupMembers[account].user.gender;
                }
                if (message[i].type == 'text') {
                    message[i].content = EmojiService.formatChineseSignToEmojiImage(message[i].content);
                }
                message[i].isShowSendFrame = (message[i].flow == 0 && message[i].type != 'tip'&& message[i].type != 'notification'&& !('audio' == message[i].type && $scope.isWeb));
                message[i].isShowReceiveFrame =(message[i].flow == 1 && message.type != 'tip'&& message[i].type != 'notification' && !('audio' == message[i].type && $scope.isWeb));
                $scope.MsgListTmp.push(message[i]);
            }
            
            formatHistoryList($scope.MsgListTmp, flag);
        };
        /**
         * 处理历史聊天记录
         * @param message
         */
        function formatHistoryList(message, flag) {
            $scope.talkData = [];
            for (var i = message.length - 1; i >= 0; i--) {
                message[i].showTimeFlag = getShowTimeFlag(message[i]);
                message[i].showTime = IMUtilService.formatCurDate(message[i].time);
                if (message[i].type == 'notification') {
                    message[i] = dealAccount(message[i], $scope.talkData.length);
                }
                $scope.talkData.push(message[i]);
            }
            checkApply(flag);
        };


        /**
         * 
         * @param {*收到的notification 获取群成员信息} msg 
         * @param {*} accounts 
         */
        function dealAccount(msg, curTalkIndex) {
            var accounts = msg.attach.accounts;
            msg.content = "";
            if (!accounts) {
                msg = dealNotificationMsgContent(msg);
                return msg;
            }
            var i = 0;
            for (i = 0; i < accounts.length; i++) {
                if (groupMembers && groupMembers[accounts[i]] &&
                    groupMembers[accounts[i]].nick) {
                    msg.content += groupMembers[accounts[i]].nick + ' ';
                    if (i == accounts.length - 1) {
                        msg = dealNotificationMsgContent(msg);
                        return msg;
                    } else {
                        continue;
                    }

                } else if (groupMembers && groupMembers[accounts[i]] &&
                    groupMembers[accounts[i]].user.name) {
                    msg.content += groupMembers[accounts[i]].user.name + ' ';
                    if (i == accounts.length - 1) {
                        msg = dealNotificationMsgContent(msg);
                        return msg;
                    } else {
                        continue;
                    }
                } else {
                    //没有匹配到任何的患者信息
                    var users = msg.attach.users;
                    if (users) { //web端存在user字段可直接使用
                        for (var j = 0; j < users.length; j++) {
                            if (accounts[i] == users[j].account) {
                                msg.content += users[j].nick + ' ';
                                if (i == accounts.length - 1) {
                                    msg = dealNotificationMsgContent(msg);
                                    return msg;
                                } else {
                                    continue;
                                }
                            }
                        }
                    } else if (msg.localExtension && msg.localExtension.users) {
                        var users = msg.localExtension.users;
                        if (typeof users == 'string') {
                            users = JSON.parse(users);
                        }
                        for (var j = 0; j < users.length; j++) {
                            msg.content += users[j].nick + ' ';
                        }
                        if (i == accounts.length - 1) {
                            msg = dealNotificationMsgContent(msg);
                            return msg;
                        } else {
                            continue;
                        }
                    } else { //移动端无users字段
                        var ids = JSON.stringify(accounts);
                        MessageService.getUsersInfo(ids, curTalkIndex, function (infoMap) {
                            var users = [];
                            var content = "";
                            for (var i = 0; i < accounts.length; i++) {
                                var user = {};
                                content += infoMap[accounts[i]].userPetname + ' ';
                                user.account = accounts[i];
                                user.avatar = infoMap[accounts[i]].userPhoto;
                                user.nick = infoMap[accounts[i]].userPetname;
                                users.push(user);
                            };
                            $scope.talkData[curTalkIndex] = msg;
                            if (msg.attach.type == 1) {
                                content += '被踢出群聊';
                                $scope.talkData[curTalkIndex].content = content;
                            } else if (msg.attach.type == 2) {
                                content += '退出了群聊';
                                $scope.talkData[curTalkIndex].content = content;
                            } else if (msg.attach.type == 0) {
                                content += '加入了群聊';
                                $scope.talkData[curTalkIndex].content = content;
                            }
                            $scope.MsgListTmp.reverse();
                            $scope.MsgListTmp[curTalkIndex] = $scope.talkData[curTalkIndex];
                            $scope.MsgListTmp.reverse();
                            var localExtension = {
                                users: users
                            }
                            IMDispatch.updateMessageExt($scope.talkData[curTalkIndex].id, localExtension, $scope.talkData[curTalkIndex]);
                            checkApply();
                        });
                    }
                }
            }
        }
        /**
         * 处理通知消息的内容
         */
        function dealNotificationMsgContent(msg) {
            if (msg.attach) {
                switch (msg.attach.type) {
                    case 0:
                        msg.content += '加入了群聊';
                        break;
                    case 1:
                        msg.content += '被踢出群聊';
                        break;
                    case 2:
                        msg.content += '退出了群聊';
                        break;
                    case 3:
                        msg.content = '群信息更新了';
                        break;
                    case 4:
                        msg.content = '群组被解散了';
                        ConversationService.deteleSessionByTId($scope.groupInfo.tid);
                        KyeeMessageService.broadcast({
                            content: '该群已被管理员解散了',
                            duration: 1000
                        });
                        break;
                    case 5:
                        msg.content += '通过入群申请';
                        break;
                    case 6:
                        msg.content = '本群群主已变更';
                        break;
                    case 7:
                        msg.content += '被添加为管理员';
                        break;
                    case 8:
                        msg.content += '被移除管理员权限了';
                        break;
                    case 9:
                        msg.content += '接受入群邀请';
                        break;
                    case 10:
                        if (msg.attach.mute) {
                            msg.content += '被禁言了';
                        } else {
                            msg.content += '被解除禁言';
                        }
                        break;
                }
            }
            return msg;
        };
        /**
         * 获取消息是否显示时间
         * @returns {*}
         */
        function getShowTimeFlag(message) {
            var time = message.time;
            var nowTime = new Date().getTime();
            var preMsgTime = ($scope.talkData.length > 0 && $scope.talkData[$scope.talkData.length - 1]) ? $scope.talkData[$scope.talkData.length - 1].time : nowTime;
            return IMUtilService.getShowTimeFlag(preMsgTime, time);
        }
        /**
         * 脏值检测及强制刷新
         */
        function checkApply(flag) {
            $scope.$evalAsync(function () {
                if (flag == 0) {
                    $ionicScrollDelegate.$getByHandle('conversation_content').resize();
                    $ionicScrollDelegate.$getByHandle('conversation_content').scrollBottom(true);
                } else if (flag == 1) {
                    $ionicScrollDelegate.$getByHandle('conversation_content').resize();
                    $ionicScrollDelegate.$getByHandle('conversation_content').scrollTop(true);
                }
            });
        };
        /**
         * 跳转至群组详情界面
         */
        $scope.goGroupDetails = function (group) {
            GroupDetailsService.preGroupId = $scope.groupInfo.tid;
            GroupDetailsService.groupId = group.tid;
            $state.go("group_details");
        };
        /**
         * 跳转至个人详情界面
         */
        $scope.goPersonalDetails = function (message) {
            if (message.from.indexOf('qydr') > -1) {
                $scope.goDoctorDetails(message);
            } else {
                PersonalHomeService.userInfo = {
                    userId: message.from.substring(4),
                    fromGroupId: $scope.groupInfo.tid
                };
                $state.go("personal_home");
            }
            ConversationService.getGroupMembersInfo($scope.groupInfo.tid);
        };
        /**
         * 进入医生详情
         * addBy liwenjuan 2016/12/26
         */
        $scope.goDoctorDetails = function (message) {
            var yxUser = message.from;
            MyDoctorDetailsService.doctorInfo = {
                'yxUser': yxUser,
                'userRole': 2,
            };
            $state.go('my_doctor_details');
        };
        /**
         * 进入个人设置
         */
        $scope.goPersonalSetting = function () {
            $state.go("personal_setting");
        };
        /**
         * 发送消息响应
         * addBy lwj 20160726
         * modify by wyn :增加异常处理，发送消息时判断容联连接状态，若失败，重新登录容联
         */
        $scope.sendImMsg = function () {
            var text = $scope.foo.trim();
            if (text.length > 1000) {
                KyeeMessageService.broadcast({
                    content: "输入字符已超上限！"
                });
                return;
            }
            clearInputText(); //清除输入框内容
            $scope.wholeCursor = 0; //发送之后重置游标位置
            if (!$scope.emojiOpenFlag) {
                $scope.getFocus();
            }
            resetContentBottom();
            realSend(text);
        };
        /**
         * 重新发送(未考虑云信是否登录情况)
         */
        $scope.reSend = function (data, index) {
            data.resend = true;
            $scope.talkData[index].status = 'sending';
            checkApply();
            var userInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
            if (!userInfo) {} else {
                if(data.type == 'audio'){
                    IMDispatch.sendAudioMessage(data);
                }else{
                    sendContent(data);
                }
            }
        };
        /**
         * 进入公告详情页，查看所有公告详情
         */
        $scope.goAnnouncementDetail = function () {
            GroupDetailsService.groupId = $scope.groupInfo.tid;
            $state.go("group_announcement");
        };
        /**
         * ng-bind-html需要安全绑定
         */
        $scope.TrustInputContent = function (text) {
            var newText = text;
            if (IMUtilService.urlValid(newText)) {
                newText = '<a href="javascript:void(0);" class="qy-blue text_href">' + newText + '</a>';
            }
            return $sce.trustAsHtml(newText);
        };
        /**
         * 发送消息请求
         * @param text
         */
        var realSend = function (text) {
            var remoteExtension = {};
            remoteExtension = {
                "ver": IMChatting.currentVersion,
            };
            if ($scope.atMembers && $scope.atMembers.length > 0) {
                remoteExtension.atList = $scope.atMembers;
                var apns = {
                    accounts: $scope.atMembers,
                    forcePush: true
                }
            }
            var tmpMessage = {
                "scene": 1,
                "type": 'text',
                "from": $scope.me,
                "to": $scope.groupInfo.tid,
                "flow": 0,
                "content": EmojiService.formatEmojiImageToChineseSignTo(text),
                "remoteExtension": remoteExtension,
                "pushContent": EmojiService.formatSendText(text),
                "apns": apns
            };
            $scope.atMembers = [];
            sendContent(tmpMessage); //-1 首次发送
        };
        /**
         * 选择图片
         * add by wyn 21060804
         */
        $scope.choosePicture = function () {
            if (isLegalWebApp) {
                document.getElementById("webChoosePictureGroup").click();
            } else {
                deviceChoosePicture();
            }
            $scope.hideBottomContent();
        };

        /**
         * 给页面上隐藏的input标签绑定监听函数，选择完图片后调用发送图片函数(sendImgMsg)
         * Created by zhangyi at 20161101
         */
        document.getElementById("webChoosePictureGroup").addEventListener("change", function () {
            var webSelectImg = this.files[0];
            var validFlag = IMUtilService.validSelectFile(webSelectImg);
            if (validFlag) {
                KyeeMessageService.loading({
                    mask: true
                });
                $scope.sendImgMsg(webSelectImg, true);
                var groupTimer = setInterval(function () {
                    var isReady = localStorage.getItem("isReady");
                    if (isReady == "yes") {
                        console.log("isReady", isReady);
                        KyeeMessageService.hideLoading();
                        localStorage.removeItem("isReady");
                        clearInterval(groupTimer);

                    }
                }, 100)
            }
            this.value = ""; //清除选择文件
        });
        /**
         * 设备设备选择相册图片
         * add by wyn 20161027
         */
        var deviceChoosePicture = function () {
            if ($scope.platform == "Android") {
                var options = {
                    quality: 50,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900, //设置图片宽度
                    targetHeight: 900, //设置图片高度
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                    sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                    invokeEC: true
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        if (-1 < retVal.indexOf("file://")) {
                            retVal = retVal.substr(7);
                        }
                        $scope.sendImgMsg(retVal, false);
                        $scope.$digest();
                    },
                    // 调用失败时返回的值
                    function (retVal) {}, options);
            } else if ($scope.platform == "iOS") {
                var options = {
                    quality: 50,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900, //设置图片宽度
                    targetHeight: 900, //设置图片高度
                    saveToPhotoAlbum: false,
                    allowEdit: false,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    invokeEC: true
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        $scope.sendImgMsg(retVal, false);
                        $scope.$digest();
                    },
                    // 调用失败时返回的值
                    function (retVal) {}, options);
            }
        };
        $scope.sendImgMsg = function (imgMsg, isWebFlag) {
            var remoteExtension = {};
            remoteExtension = {
                "ver": IMChatting.currentVersion,
            };
            if (!IMUtil.isDeviceAvailable()) {
                var fileName = "";
                var fileExt = "";
                var localPath = "";
                var webImgFile = ""; //网页版图片文件
                // 创建 一个FileReader对象
                var reader = new FileReader();
                // 读取文件作为URL可访问地址
                reader.readAsDataURL(imgMsg);
                reader.onprogress = function (e) {
                    //异步加载文件成功
                    reader.onload = function (e) {
                        // this 对象为reader
                        // reader.result 表示图片地址
                        var DataURL = reader.result;
                        var tmpImgMsg = {
                            "filePath": DataURL,
                            "scene": 1,
                            "from": $scope.me,
                            "to": $scope.groupInfo.tid,
                            "time": new Date(),
                            "type": 'image',
                            "target": $scope.receiver,
                            "flow": 0,
                            "remoteExtension": remoteExtension
                        };
                        checkApply();
                        sendContent(tmpImgMsg);
                    }
                }
            } else {
                var tmpImgMsg = {
                    "filePath": imgMsg,
                    "scene": 1,
                    "from": $scope.me,
                    "to": $scope.groupInfo.tid,
                    "time": new Date(),
                    "type": 'image',
                    "flow": 0,
                    "remoteExtension": remoteExtension
                }
                sendContent(tmpImgMsg);
            }

        };
        /**
         * 点击拍照，发送图片消息
         * modify by wyn 增加调用微信拍照入口
         */
        $scope.goToCamera = function () {
            if (isLegalWebApp) {
                document.getElementById("webChoosePictureGroup").click();
            } else {
                deviceTakePicture();
            }
            $scope.hideBottomContent();
        };
        /**
         * 移动设备拍照
         * add by wyn 20161027
         */
        var deviceTakePicture = function () {
            if ($scope.platform == "Android") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900, //设置图片宽度
                    targetHeight: 1200, //设置图片高度
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        var cameraPhoto = retVal.replace("file://", "").trim();
                        $scope.sendImgMsg(cameraPhoto, false);
                        $scope.$digest();
                    },
                    // 调用失败时返回的值
                    function (retVal) {}, options);
            } else if ($scope.platform == "iOS") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900, //设置图片宽度
                    targetHeight: 1200, //设置图片高度
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        var cameraPhoto = retVal.replace("file://", "").trim();
                        $scope.sendImgMsg(cameraPhoto, false);
                        $scope.$digest();
                    },
                    // 调用失败时返回的值
                    function (retVal) {}, options);
            }
        };
        $scope.wholeCursor = 0;
        var KEY_CODE = {
            BACKSPACE: 8
        };
        /**
         * 显示/隐藏表情区域
         */
        $scope.showOrHideEmojiDiv = function () {
            if (isIOS) {
                var isDalay = true;
            } else {
                var isDalay = false;
            }

            // 附加区域切换表情区域
            if ($scope.attachOpenFlag) {
                $scope.attachOpenFlag = !$scope.attachOpenFlag;
                isDalay = false;
            }

            if ($scope.voiceOpenFlag) {
                $scope.voiceOpenFlag = !$scope.voiceOpenFlag;
                isDalay = false;
            }
            // 隐藏表情区域
            if ($scope.emojiOpenFlag) {
                isDalay = false;
            }

            $scope.emojiOpenFlag = !$scope.emojiOpenFlag;
            $ionicSlideBoxDelegate.$getByHandle('emoji-slide').update();

            //关闭之前正在运行键盘定时器
            if (keyboardLoadWatcherTimer != undefined) {
                KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
            }

            if (isDalay) {
                keyboardLoadWatcherTimer = KyeeUtilsService.interval({
                    time: 100,
                    action: function () {
                        if (keyboardLoaded) {
                            KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
                            setFooterBarStyle();
                        }
                    }
                });
            } else {
                setFooterBarStyle();
            }
        };
        /**
         * 显示/隐藏附加区域
         */
        $scope.showOrHideAttachDiv = function () {
            if (isIOS) {
                var isDalay = true;
            } else {
                var isDalay = false;
            }

            // 表情区域切换附加区域
            if ($scope.emojiOpenFlag) {
                $scope.emojiOpenFlag = !$scope.emojiOpenFlag;
                $ionicSlideBoxDelegate.$getByHandle('emoji-slide').update();
                isDalay = false;
            }
            //语音区域
            if ($scope.voiceOpenFlag) {
                $scope.voiceOpenFlag = !$scope.voiceOpenFlag;
                isDalay = false;
            }

            // 隐藏附加区域
            if ($scope.attachOpenFlag) {
                isDalay = false;
            }

            $scope.attachOpenFlag = !$scope.attachOpenFlag;

            //关闭之前正在运行键盘定时器
            if (keyboardLoadWatcherTimer != undefined) {
                KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
            }

            if (isDalay) {
                keyboardLoadWatcherTimer = KyeeUtilsService.interval({
                    time: 100,
                    action: function () {
                        if (keyboardLoaded) {
                            KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
                            setFooterBarStyle();
                        }
                    }
                });
            } else {
                setFooterBarStyle();
            }
        };
        /**
         * 判断键盘是否完全隐藏
         */
        var keyboardLoaded = function () {
            var inputEle = document.getElementById('inputDiv');
            var taHeight = inputEle.offsetHeight;
            var newFooterHeight = taHeight + 16;
            newFooterHeight = (newFooterHeight > 56) ? newFooterHeight : 56;
            var footerEle = document.getElementById('footerBar');
            return footerEle.offsetHeight == newFooterHeight;
        };
        /**
         * 根据textarea高度动态调整footer高度
         */
        var setFooterBarStyle = function () {
            var inputEle = document.getElementById('inputDiv');
            var taHeight = inputEle.offsetHeight;
            var newFooterHeight = taHeight + 16;
            newFooterHeight = (newFooterHeight > 56) ? newFooterHeight : 56;

            //调整ion-footer-bar高度
            if ($scope.emojiOpenFlag || $scope.attachOpenFlag) {
                $scope.footerBarHeight = newFooterHeight + $scope.emojiDivHeight - 12; //-12：表情和聊天插件高度包含了原始底部所有高度；
                $scope.contentBottom = newFooterHeight + $scope.emojiDivHeight - 12;
            } else {
                $scope.footerBarHeight = newFooterHeight;
                $scope.contentBottom = newFooterHeight;
            }
            if (ConversationService.pullMessageList || !ConversationService.isUpdateMembers) {
                $ionicScrollDelegate.$getByHandle("conversation_content").resize();
                $ionicScrollDelegate.$getByHandle("conversation_content").scrollBottom(true);
            }
        };
        /**
         * textarea获得焦点事件
         * @param $event
         */
        $scope.inputFocus = function ($event) {
            if ($scope.emojiOpenFlag) {
                $scope.showOrHideEmojiDiv();
            }
            if ($scope.attachOpenFlag) {
                $scope.showOrHideAttachDiv();
            }
            
        };
        /**
         * textarea 点击事件
         */
        $scope.inputClick = function ($event) {
            $scope.wholeCursor = $event.target.selectionStart; //$scope.foo.length;//$event.target.selectionStart;
            $ionicScrollDelegate.$getByHandle('conversation_content').resize();
            $ionicScrollDelegate.$getByHandle('conversation_content').scrollBottom(true);
            $scope.getFocus();
        };

        /**
         * textarea keyUp事件
         */
        $scope.inputKeyup = function ($event) {
            $scope.wholeCursor = $event.target.selectionStart;
            var target = $event.target;
            var cursor = target.selectionStart;
        };
        /**
         * textarea keydown事件
         */
        $scope.inputKeydown = function ($event) {
            var target = $event.target;
            var cursor = target.selectionStart; //通过 selectionStart 获得光标所在位置
            if ($event.keyCode == KEY_CODE.BACKSPACE) { //删除事件
                if (target.value.charAt(cursor - 1) === ']') {
                    var res = forEachText($scope.foo, cursor);
                    $scope.foo = res.text;
                    checkApply();
                    target.setSelectionRange(res.cursor, res.cursor);
                    return false;
                }
                if (target.value.charCodeAt(cursor - 1) === 20) { //删除@成员
                    var res = delAtMember($scope.foo, cursor);
                    $scope.foo = res.text;
                    checkApply();
                    target.setSelectionRange(res.cursor, res.cursor);
                    return false;
                }
            }
            $scope.oldTextContent = $scope.foo;
        };
        //遍历文本，是否含有表情，转换为表情图片
        var forEachText = function (text, cursor) {
            var res = "";
            for (var i = cursor - 1; i > -1; i--) {
                if (text.charAt(i) == '[') {
                    var temp = text.substring(i, cursor);
                    var m = KyeeKit.filter(EmojiService.emojiData, function (x) {
                        return x.chineseSign == temp;
                    });
                    if (m) {
                        res = text.substring(0, i) + " " + text.substring(cursor, text.length + 1);
                        cursor = cursor - (m[0].chineseSign.length - 1); //焦点位置
                        break;
                    }
                }
            }
            return {
                text: res,
                cursor: cursor
            };
        };
        //textarea 一次性移除@成员
        var delAtMember = function (text, cursor) {
            var res = "";
            for (i = cursor - 1; i > -1; i--) {
                if (text.charAt(i) == '@') {
                    var atContent = text.substring(i, cursor);
                    var atMember = text.substring(i + 1, cursor - 1);

                    //从atMembers系列中移除该成员
                    if (removeAtMember(atMember)) {
                        res = text.substring(0, i) + " " + text.substring(cursor, text.length + 1);
                        cursor = cursor - (atContent.length - 1); //焦点位置
                        break;
                    }
                }
            }
            return {
                text: res,
                cursor: cursor
            };
        };

        //数组中移除@成员
        var removeAtMember = function (groupPetname) {
            for (var i = $scope.atMembers.length - 1; i > -1; i--) {
                if ($scope.atMembers[i].groupPetname == groupPetname) {
                    $scope.atMembers.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        /**
         * 选择表情（转换成表情中文字符）
         * @param emojiData
         */
        $scope.chooseEmoji = function (emojiData) {
            if (emojiData.chineseSign == 'emptyIcon') {
                return;
            }
            if (emojiData.chineseSign == 'deleteIcon') {
                $scope.clearLastWord();
            } else {
                var chineseSign = EmojiService.emojiCodeCompChineseSign[emojiData.emojiCode];
                if ($scope.foo) {
                    if ($scope.wholeCursor > $scope.foo.length) {
                        $scope.wholeCursor = $scope.foo.length;
                    }
                    $scope.foo = $scope.foo.substring(0, $scope.wholeCursor) + chineseSign + $scope.foo.substring($scope.wholeCursor, $scope.foo.length);
                } else {
                    $scope.foo = chineseSign;
                }
                $scope.wholeCursor += (chineseSign.length);
                $scope.oldTextContent = $scope.foo;
            }
        };
        //事件监控：textarea自动扩展事件
        $scope.$on("taResize", function (e, ta) {
            setFooterBarStyle();
        });

        //重置内容区距离底部的距离
        var resetContentBottom = function () {
            if ($scope.emojiOpenFlag || $scope.attachOpenFlag || $scope.voiceOpenFlag) {
                $scope.contentBottom = 56 + $scope.emojiDivHeight - 12;
            } else {
                $scope.contentBottom = 56;
            }
            $ionicScrollDelegate.$getByHandle("conversation_content").scrollBottom(true);
            $ionicScrollDelegate.$getByHandle("conversation_content").resize();
        };
        //发送成功后清空输入框内容
        var clearInputText = function () {
            $scope.foo = '';
            $scope.oldTextContent = "";
        };

        //收起表情/附加/语音 区域
        $scope.hideBottomContent = function () {

            if ($scope.emojiOpenFlag) {
                $scope.showOrHideEmojiDiv();
            }
            if ($scope.attachOpenFlag) {
                $scope.showOrHideAttachDiv();
            }
        };
        /**
         * 选择@患者成员
         * @param member
         */
        $scope.chooseMember = function (member) {
            var atContent = "";
            if (member.accid.indexOf('qydr') != -1) { // 艾特医生
                atContent = (member.nick || member.user.name) + " " + String.fromCharCode(20);
                $scope.atMembers.push(member.accid);
            } else { // 艾特患者
                atContent = (member.nick || member.user.name) + " " + String.fromCharCode(20);
                $scope.atMembers.push(member.accid);
            }
            if ($scope.foo) {
                if ($scope.wholeCursor > $scope.foo.length) {
                    $scope.wholeCursor = $scope.foo.length;
                }
                $scope.foo = $scope.foo.substring(0, $scope.wholeCursor + 1) + atContent + $scope.foo.substring($scope.wholeCursor + 1, $scope.foo.length);
            } else {
                $scope.foo = atContent;
            }
            $scope.oldTextContent = $scope.foo;
            $scope.wholeCursor += (atContent.length + 1);
            checkApply();
            $scope.removePage();
            $scope.getFocus();
        };
        /**
         * 移除当前页
         */
        $scope.removePage = function () {
            var me = this;
            if ($scope._kyee_framwwork_modal && $scope._kyee_framwwork_modal.length > 0) {
                var length = $scope._kyee_framwwork_modal.length;
                if ($scope._kyee_framwwork_modal[length - 1].modalEl.id == "choose_at_member") {
                    KyeeViewService.removeModal({
                        scope: $scope
                    });
                    //离开@页面的时候将一次性事件卸载掉
                    KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);
                }
            }
        };
        /**
         * 处理文本域获取焦点
         */
        $scope.getFocus = function () {
            var currentObj = document.getElementById("inputDiv");
            var curTxt = $scope.foo.trim();
            var target_index = curTxt ? curTxt.length : 0;
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
         * 让其输入框失焦
         */
        $scope.getBlur = function () {
            var currentObj = document.getElementById("inputDiv");
            currentObj.blur();
            $ionicScrollDelegate.$getByHandle("conversation_content").resize();
            $ionicScrollDelegate.$getByHandle("conversation_content").scrollBottom(true);
        };
        /**
         * 下拉加载更多数据函数
         * 每次加载5条数据
         */
        $scope.doRefresh = function (callback) {
            var msg = $scope.talkData[0];
            msg.to = $scope.groupInfo.tid;
            IMDispatch.getMessageList(msg, 5, msg.time, function (msgList) {
                formatHistory(msgList, 1);
            });
            // 发送刷新完成广播
            $scope.$broadcast('scroll.refreshComplete');
        };
        /**
         * 处理@成员响应跳转兼容IOS 勿删
         */
        $scope.inputChange = function () {
            if ($scope.foo.length < $scope.oldTextContent.length) { //回删时不需要跳出@成员列表
                return;
            }
            $scope.oldTextContent = $scope.foo;
            // 此判断逻辑 勿删
            if ($scope.foo && ($scope.foo.length - 1 == $scope.foo.lastIndexOf("@"))) {
                GroupDetailsService.queryGroupInfo($scope.groupInfo.tid, function (data) {
                    if (data && data.members) {
                        $scope.getBlur();
                        showModolOfAt(ConversationService.groupMembers);
                    }
                });
            }
        };
        /**
         * 发送消息为超链接时，点击链接跳转方法
         * @param text
         */
        $scope.openUrl = function (text) {
            if (!IMUtilService.urlValid(text)) {
                return;
            }
            var webUrl = text;
            if (0 > webUrl.indexOf("http")) {
                webUrl = "http://" + webUrl;
            }
            //判断是移动端还是网页版 网页跳至对应页面
            if (window.device && window.device.platform) {
                var params = [];
                params.push(webUrl);
                if ($scope.platform == 'iOS') {
                    var url = {
                        'url': webUrl
                    };
                    navigator.pubplugin.openOutBrowser(function () {},
                        function () {}, params);
                } else {
                    window.open(webUrl, '_blank', 'location=yes');
                }

            } else {
                patientsGroupWebService.webUrl = webUrl;
                $state.go("patient_group_web");
            }
        };
        /**
         * 消息长按响应事件
         * @param curMsg
         * @param index
         */
        $scope.longPressEvent = function (curMsg, index) {
            $scope.hiddenMenuTab();
            if ('sending' == curMsg.status) {
                return;
            }
            $scope.showMenuIndex = index;
            curMsg.showMenuFlag = true;
        };
        /**
         * 隐藏消息菜单显示
         */
        $scope.hiddenMenuTab = function () {
            if (-1 < $scope.showMenuIndex) {
                var index = $scope.showMenuIndex;
                $scope.talkData[index].showMenuFlag = false;
                $scope.showMenuIndex = -1;
            }
        };
        /**
         * 发送文本、图片信息 addBy liwenjuan 2016/11/1
         * @param tmpMessage
         * @param index
         */
        var sendContent = function (tmpMessage) {
            //发送文本消息
            if (tmpMessage.type == 'text') {
                IMDispatch.sendTextMessage(tmpMessage, function (msg) {
                    if (!tmpMessage.resend) {
                        formatSendingMessage(msg);
                    }
                }, function (msg) {
                    if (msg.statusCode && msg.statusCode != 2) {
                        if (msg.errorCode && (msg.errorCode == '408' || msg.errorCode == '1000')) {
                            LoginService.getIMLoginInfo();
                        }
                    }
                });
            } else if (tmpMessage.type == 'image') {
                IMDispatch.sendImageMessage(tmpMessage, function (msg) {
                    if (!tmpMessage.resend) {
                        formatSendingMessage(msg);
                    }
                }, function (msg) {
                    if (msg.statusCode && msg.statusCode != 2) {
                        if (msg.errorCode && (msg.errorCode == '408' || msg.errorCode == '1000')) {
                            LoginService.getIMLoginInfo();
                        }
                    }
                });
            } else if (tmpMessage.type == 'audio') {
                IMDispatch.sendAudioMessage(tmpMessage, function (msg) {
                    if (!tmpMessage.resend) {
                        formatSendingMessage(msg);
                    }
                }, function (msg) {
                    if (msg.statusCode && msg.statusCode != 2) {
                        if (msg.errorCode && (msg.errorCode == '408' || msg.errorCode == '1000')) {
                            LoginService.getIMLoginInfo();
                        }
                    }
                });
            } else if (tmpMessage.type == 'custom') {
                IMDispatch.sendCustomMessage(tmpMessage, function (msg) {
                    if (!tmpMessage.resend) {
                        formatSendingMessage(msg);
                    }
                }, function (msg) {
                    if (msg.statusCode && msg.statusCode != 2) {
                        if (msg.errorCode && (msg.errorCode == '408' || msg.errorCode == '1000')) {
                            LoginService.getIMLoginInfo();
                        }
                    }
                    if (msg.errorCode && (msg.errorCode == 802)) {
                        msg.type = 'tip';
                        msg.content = '您已被禁言或踢出群聊';
                        formatSendMessage(msg);
                    }
                });
            }
        };
        /**
         * 删除某条消息
         * @param {*} message 
         * @param {*} index 
         */
        $scope.deleteMessage = function (message, index) {
            IMDispatch.deleteChattingHistory(message);
            dealDeleteMessage(index);
        };
        /**
         * 处理撤回/删除的消息的界面展示
         * @param index
         */
        var dealDeleteMessage = function (index) {
            //撤回语音消息时将播放playId置空
            for (var i = index; i < $scope.talkData.length - 1; i++) {
                $scope.talkData[i] = $scope.talkData[i + 1];
            }
            var start = $scope.talkData.length - index - 1;
            for (var i = start; i < $scope.MsgListTmp.length - 1; i++) {
                $scope.MsgListTmp[i] = $scope.MsgListTmp[i + 1];
            }
            $scope.talkData.pop();
            $scope.MsgListTmp.pop();
            checkApply();
        };
        /**
         * 撤回消息
         * @param rlParams
         * @param curMsg
         */
        $scope.revokeMessage = function (curMsg, index) {
            $scope.revokeIndex = index;
            if (curMsg.type == 'audio') {
                //停止正在播放的语音消息
                IMDispatch.stopPlayAudio(function (res) {
                    $scope.$apply(function () {
                        $scope.voiceMessage.playMsgId = null;
                    })
                });
            }
            IMDispatch.revokeMessage(angular.copy(curMsg), function (message) {
                var notice = "您撤回了一条消息";
                var tipMsg = revokeMessageDone(index);
                IMDispatch.saveTipMessageToLocal(1, tipMsg.sessionId, tipMsg.content, tipMsg.time);
            }, function (errorMsg) {
                KyeeMessageService.message({
                    content: "发送时间超过2分钟的消息，不能被撤回。"
                });
            });
        };
        /**
         * 发送消息监听
         */
        var formatSendMessage = function (message) {
            if (message.type != 'custom') {
                message.content = EmojiService.formatChineseSignToEmojiImage(message.content);
            }
            if (message.type == 'custom') {
                if (message.attach.scMsgType == 5) {
                    localStorage.setItem(message.attach.scRecordId, true);
                }
            }
            if (message.type == 'tip' && message.flow == 0 && message.remoteExtension) {
                if (message.remoteExtension.localContent) {
                    message.content = message.remoteExtension.localContent;
                }
            }
            for (var i = 0; i < $scope.talkData.length; i++) {
                if (message.preId && $scope.talkData[i].id == message.preId) {
                    message.showTimeFlag = $scope.talkData[i].showTimeFlag;
                    message.showTime = $scope.talkData[i].showTime;
                    message.isShowSendFrame = $scope.talkData[i].isShowSendFrame;
                    message.isShowReceiveFrame = $scope.talkData[i].isShowReceiveFrame;
                    if(message.errorCode == 802){
                        message.isShowSendFrame = false;
                    }
                    $scope.talkData[i] = message;
                    break;
                } else if ($scope.talkData[i].id == message.id) {
                        message.showTimeFlag = $scope.talkData[i].showTimeFlag;
                        message.showTime = $scope.talkData[i].showTime;
                        message.isShowSendFrame = $scope.talkData[i].isShowSendFrame;
                        message.isShowReceiveFrame = $scope.talkData[i].isShowReceiveFrame;
                        if(message.errorCode == 802){
                            message.isShowSendFrame = false;
                        }
                        $scope.talkData[i] = message;
                        break;
                }
            }
            for (var j = 0; j < $scope.MsgListTmp.length; j++) {
                if (message.preId && $scope.MsgListTmp[j].id == message.preId) {
                    $scope.MsgListTmp[j] = message;
                    break;
                } else if ($scope.MsgListTmp[j].id == message.id) {
                        $scope.MsgListTmp[j] = message;
                    break;
                }
            }
            checkApply();
            var storageCache = CacheServiceBus.getStorageCache();
            var session = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
            for (var i = 0; i < session.length; i++) {
                if (session[i].id == message.sessionId) {
                    session[i].lastMsg = message;
                    jsInterface.receiveSession([session[i]]);
                    break;
                }
            }
        };
        /**
         * 发送消息监听
         */
        var formatSendingMessage = function (message) {
            if (message.type == 'text') {
                message.content = EmojiService.formatChineseSignToEmojiImage(message.content);
            }
            message.isShowSendFrame = (message.type != 'tip'&& message.type != 'notification'&& !('audio' == message.type && $scope.isWeb));
            $scope.MsgListTmp.reverse();
            $scope.MsgListTmp.push(message);
            $scope.MsgListTmp.reverse();
            message.showTimeFlag = getShowTimeFlag(message);
            message.showTime = IMUtilService.formatCurDate(message.time);
            $scope.talkData.push(message);
            checkApply(0);
        };
        KyeeBroadcastService.doRegister($scope, 'sendMsgDone', function (message) {
            formatSendMessage(message);
        });
        KyeeBroadcastService.doRegister($scope, 'revokeMsg', function (message) {
            for (var i = 0; i < $scope.talkData.length; i++) {
                if ($scope.talkData[i].id == message.id) {
                    $scope.talkData[i].type = 'tip';
                    $scope.talkData[i].isShowReceiveFrame = false;
                    var name = '';
                    if (groupMembers && groupMembers[message.from]) {
                        name = groupMembers[message.from].nick || groupMembers[message.from].user.nick || message.fromNick;
                    }
                    $scope.talkData[i].content = name + '撤回了一条消息';
                    checkApply();
                    return;
                }
            }
        });
        KyeeBroadcastService.doRegister($scope, 'receiveMsg', function (msg) {
            if (msg.sessionId == $scope.groupInfo.tid) {
                if (groupMembers && groupMembers[msg.from]) {
                    msg.userPhoto = groupMembers[msg.from].user.icon;
                    msg.sex = groupMembers[msg.from].user.gender;
                    msg.groupPetname = groupMembers[msg.from].nick;
                }
                if (msg.type == 'notification') {
                    msg = dealAccount(msg);
                }
                if (msg.type == 'image') {
                    if (IMUtil.isDeviceAvailable()) {
                        if (msg.attach.thumbPath != null && msg.attach.thumbPath != undefined) {
                            msg.filePath = msg.attach.thumbPath;
                        } else if (msg.attach.filePath) {
                            msg.filePath = msg.attach.filePath;
                        } else {
                            msg.filePath = msg.attach.url;
                        }
                    } else {
                        msg.filePath = msg.attach.url;
                    }
                } else if (msg.type == 'audio') {
                    msg.filePath = msg.attach.path;
                } else if (msg.type == 'text') {
                    msg.content = EmojiService.formatChineseSignToEmojiImage(msg.content);
                }
                msg.isShowReceiveFrame =(msg.type != 'tip'&& msg.type != 'notification' && !('audio' == msg.type && $scope.isWeb));
                $scope.MsgListTmp.reverse();
                $scope.MsgListTmp.push(msg);
                $scope.MsgListTmp.reverse();
                msg.showTimeFlag = getShowTimeFlag(msg);
                msg.showTime = IMUtilService.formatCurDate(msg.time);
                $scope.talkData.push(msg);
                $ionicScrollDelegate.$getByHandle("conversation_content").resize();
                $ionicScrollDelegate.$getByHandle("conversation_content").scrollBottom(true);
                checkApply(0);
            }
        });
        /**
         * 撤回消息监听
         */
        var revokeMessageDone = function (index) {
            var tipMsg = $scope.talkData[index];
            tipMsg.isShowSendFrame = false;
            tipMsg.type = 'tip';
            tipMsg.content = '您撤回了一条消息';
            //处理session变更
            var session = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
            for (var i = 0; i < session.length; i++) {
                if (session[i].id == $scope.talkData[index].sessionId) {
                    session[i].lastMsg.type = 'text';
                    session[i].lastMsg.content = '您撤回了一条消息';
                    jsInterface.receiveSession([session[i]]);
                }
            }
            $ionicScrollDelegate.$getByHandle("conversation_content").resize();
            $ionicScrollDelegate.$getByHandle("conversation_content").scrollBottom(true);
            checkApply();
            return tipMsg;
        };
        KyeeBroadcastService.doRegister($scope, 'historyMsg', function (message) {
            formatHistory(message);
        });
        KyeeBroadcastService.doRegister($scope, 'TEAM_MEMBER', function (members) {
            ConversationService.teamId = members.groupId;
            var membersList = members.members;
            showModolOfAt(membersList);
        });
        /**
         * at群成员处理模态页面
         */
        var showModolOfAt = function (membersList) {
            var patientList = [];
            var doctorList = [];
            for (var i = 0; i < membersList.length; i++) {
                if (membersList[i].accid.indexOf('qydr') != -1 && membersList[i].accid != $scope.senderInfo.yxUser) {
                    //医生账号
                    membersList[i].doctorName = membersList[i].nick || membersList[i].user.name;
                    doctorList.push(membersList[i]);
                } else if (membersList[i].accid.indexOf('qypa') != -1 && membersList[i].accid != $scope.senderInfo.yxUser) {
                    //病人账号账号
                    membersList[i].patientName = membersList[i].nick || membersList[i].user.name;
                    patientList.push(membersList[i]);
                }
            }
            ConversationService.doctorList = doctorList;
            ConversationService.patientList = patientList;
            if (!$scope._kyee_framwwork_modal || $scope._kyee_framwwork_modal.length == 0) {
                KyeeViewService.openModalFromUrl({
                    id: "chooseAtMembers",
                    url: "modules/business/patients_group/views/choose_at_members.html",
                    scope: $scope,
                    animation: "slide-in-right"
                });
            }
        };

        /**
         * 显示/隐藏语音区域
         * addBy liwenjuan 2017/6/8
         */
        $scope.showOrHideVoiceDiv = function () {
            var isDalay = Boolean(isIOS);
            // 表情区域切换附加区域
            if ($scope.emojiOpenFlag) {
                $scope.emojiOpenFlag = !$scope.emojiOpenFlag;
                $ionicSlideBoxDelegate.$getByHandle('emoji-slide').update();
                isDalay = false;
            }
            // 隐藏附加区域
            if ($scope.attachOpenFlag) {
                $scope.attachOpenFlag = !$scope.attachOpenFlag;
                isDalay = false;
            }
            if ($scope.voiceOpenFlag) {
                isDalay = false;
            }
            $scope.voiceOpenFlag = !$scope.voiceOpenFlag;
            //关闭之前正在运行键盘定时器
            if (keyboardLoadWatcherTimer != undefined) {
                KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
            }
            if (isDalay) {
                keyboardLoadWatcherTimer = KyeeUtilsService.interval({
                    time: 100,
                    action: function () {
                        if (keyboardLoaded) {
                            KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
                            setFooterBarStyle();
                        }
                    }
                });
            } else {
                setFooterBarStyle();
            }
        };
        /**
         * 开始录音
         */
        $scope.startRecording = function () {
            $scope.voiceMessage.shortRecordFlag = false;
            $scope.voiceMessage.cancelFlag = false;
            $scope.voiceMessage.startRecordFlag = true;
            $scope.voiceMessage.showVoiceModal = true;
            $scope.voiceMessage.record_tit = "松开 结束";
            $scope.voiceMessage.cancel_tit = "手指上滑，取消发送";            
            var remoteExtension = {};
            remoteExtension = {
                "ver": IMChatting.currentVersion,
            };
            var msg = {
                "scene": 1,
                "to": $scope.groupInfo.tid,
                "remoteExtension": remoteExtension
            }
            IMDispatch.startAudioRecording(msg, function (data) {
                if (data && data.recordStatus) {
                    if (data.recordStatus == 'recordTimeout') {
                        //录音时间超过60s自动结束录音
                        $scope.voiceMessage.voiceAutoEnd = true;
                        $scope.endAudioRecording(true);
                    } else if (data.recordStatus == 'recordCancel') {
                        //取消发送
                    } else if (data.recordStatus == 'recordBelowMinTime') {
                        $scope.voiceMessage.startRecordFlag = false;
                        $scope.voiceMessage.voiceAutoEnd = false;
                        $scope.endAudioRecording(true);
                    }
                } else {
                    //消息发送完成回调
                    formatSendingMessage(data);
                }
            }, function (msg) {
                if (msg) {
                    if (msg.statusCode && msg.statusCode != 2) {
                        if (msg.errorCode && (msg.errorCode == '408' || msg.errorCode == '1000')) {
                            LoginService.getIMLoginInfo();
                        }
                    }
                } else {
                    updateVoiceTit({
                        'msg': '录音失败',
                    });
                }
            });
            //停止播放当前正在播放的语音消息
            if ($scope.voiceMessage.playMsgId != null) {
                IMDispatch.stopPlayAudio(function (res) {
                    $scope.$apply(function () {
                        $scope.voiceMessage.playMsgId = null;
                    });
                }, function (res) {
                    $scope.$apply(function () {
                        $scope.voiceMessage.playMsgId = null;
                    });
                });
            }
        };
        /**
         * 结束录音
         */
        $scope.endAudioRecording = function (flag) {
            //从开始录音 超过60s的自动结束录音处理
            if (!flag && $scope.voiceMessage.voiceAutoEnd) {
                //录音自动结束
                $scope.voiceMessage.voiceAutoEnd = false;
                return;
            }
            //处理未触发长按事件的操作
            if (!$scope.voiceMessage.startRecordFlag) {
                //未触发长按事件
                $scope.voiceMessage.showVoiceModal = true;
                $scope.voiceMessage.record_tit = "松开 结束";
                if ($scope.voiceMessage.cancelFlag) {
                    updateVoiceTit({
                        "msg": "手指上滑，取消发送"
                    });
                } else {
                    $scope.voiceMessage.shortRecordFlag = true;
                    updateVoiceTit({
                        "msg": "录音时间太短"
                    });
                }
                return;
            }
            $scope.voiceMessage.showVoiceModal = false;
            $scope.voiceMessage.startRecordFlag = false;
            $scope.voiceMessage.record_tit = "按住 说话";
            IMDispatch.endAudioRecording();
        };
        /**
         * 取消录音
         */
        $scope.cancelRecording = function () {
            $scope.voiceMessage.cancel_tit = "松开手指，取消发送";
            $scope.voiceMessage.cancelFlag = true;
            IMDispatch.cancelAudioRecording();
        };
        /**
         * 播放语音
         * addBy liwenjuan 2017/6/8
         * @param message
         */
        $scope.playAudio = function (message, index) {
            message.showMenuFlag = false;
            //如果正在播放则使其停止播放
            if ($scope.voiceMessage.playMsgId) {
                IMDispatch.stopPlayAudio();
                if ($scope.voiceMessage.playMsgId == message.id) {
                    $scope.voiceMessage.playMsgId = null;
                    return;
                }
                $scope.voiceMessage.playMsgId = null;
            }
            //更新语音消息的已读状态并更新到界面
            message.voiceUnreadState = 0;
            $scope.voiceMessage.playMsgId = message.id;
            $scope.talkData[index].status = 'read';
            checkApply();
            IMDispatch.playAudio(message, 3, function (flag) {
                if (message.id == $scope.voiceMessage.playMsgId) {
                    $scope.voiceMessage.playMsgId = null;
                    checkApply();
                }
            }, function (message) {
                $scope.$apply(function () {
                    $scope.voiceMessage.playMsgId = null;
                });
            });
        };
        /**
         * 处理语音资源文件转为安全格式
         * addBy liwenjuan 2017/6/8
         * @param url
         * @returns {*}
         */
        $scope.trustAsResourceUrl = function (url) {
            return $sce.trustAsResourceUrl(url);
        };
        /**
         * 更新录音状态以及对应的提示信息
         * addBy liwenjuan 2017/6/9
         * @param params
         */
        function updateVoiceTit(params) {
            $scope.voiceMessage.cancel_tit = params.msg;
            checkApply();
            var index = KyeeUtilsService.delay({
                time: 1000,
                action: function () {
                    $scope.voiceMessage.showVoiceModal = false;
                    $scope.voiceMessage.cancel_tit = "手指上滑，取消发送";
                    $scope.voiceMessage.record_tit = "按住 说话";
                    $scope.voiceMessage.cancelFlag = false;
                    $scope.voiceMessage.shortRecordFlag = false;
                    KyeeUtilsService.cancelDelay(index);
                    checkApply();
                }
            });
        };
        /**
         * 图片的放大时间
         * @param {*} imgUrl 
         * @param {*} direction 
         * @param {*} event 
         */
        $scope.showBigPic = function (imgUrl, direction, event, message) {
            $scope.bigImageMessage = message;
            $scope.showBigImg = true;
            img.src = imgUrl;
            img.setAttribute("direction", direction);
            //关闭之前正在运行的定时器
            if (imgLoadWatcherTimer != undefined) {
                KyeeUtilsService.cancelInterval(imgLoadWatcherTimer);
            }
            imgLoadWatcherTimer = KyeeUtilsService.interval({
                time: 200,
                action: function () {
                    if (img.width > 0) {
                        KyeeUtilsService.cancelInterval(imgLoadWatcherTimer);
                        initImg(event);
                        $scope.showOverlay();
                    }
                }
            });
        };
        // 计算放大图片的尺寸
        var initImg = function (event) {
            var screenSize = KyeeUtilsService.getInnerSize();
            var imgWidth = screenSize.width;
            // add by zhang at 20161214 for KYEEAPPC-9226 ios微信网页版，消息图片放大变形问题修复
            var iOSWebImageFlag = isLegalWebApp &&
                (event && event.target &&
                    ((event.target.offsetHeight > event.target.offsetWidth && img.height < img.width) ||
                        (event.target.offsetHeight < event.target.offsetWidth && img.height > img.width))
                );
            var imgHeight = iOSWebImageFlag ? (img.width * imgWidth) / img.height : (img.height * imgWidth) / img.width;
            imgHeight = Math.round(imgHeight * 100) / 100;
            var top = imgHeight > screenSize.height ? 0 : (screenSize.height - imgHeight) / 2;

            $scope.overlayPicData = {
                width: screenSize.width,
                height: screenSize.height,
                imgWidth: imgWidth,
                imgHeight: imgHeight,
                imgTop: top,
                imgUrl: img.src
            };
        };
        /**
         * 复制消息到系统剪切板功能实现
         * @param {Object} message 消息体对象
         * @date 2017-01-24
         * @author 张毅
         */
        $scope.copyMessage = function (message) {
            var copyContent = message.content;
            // 文本内容为表情时,将表情转换为对应的中文字符
            if (copyContent.indexOf("class='emoji_msg'") > -1) {
                copyContent = EmojiService.formatEmojiImageToChineseSignTo(copyContent);
            }
            try {
                cordova.plugins.clipboard.copy(copyContent);
            } catch (e) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("patientsGroup.clickCopyError", "您的设备暂不支持消息复制功能")
                });
            }
        };

        /**
         * 隐藏放大图片
         */
        $scope.hideImgShow = function () {
            $scope.bigImageMessage = {};
            $scope.showBigImg = false;
            $scope.hideOverlay();
        };
        $scope.back = function () {
            if ($scope.showBigImg) {
                // 隐藏放大图片
                $scope.hideImgShow();
            } else { //edited by zhangyi at 20161124 for KYEEAPPC-8731 聊天页面点击返回键的时候跳转到聊天列表页面
                jsInterface.routerRecords = [];
                $ionicViewSwitcher.nextDirection("back");

                if ($scope.receiverInfo && $scope.receiverInfo.userRole) {
                    var userRole = $scope.receiverInfo.userRole;
                }
                //医患聊天 返回至订单详情页面和待接诊页面
                if (userRole == 2 && $scope.consultData && PersonalChatService.fromView) {
                    PersonalChatService.fromView = false;
                    // ConsultOrderDetailService.consultOrderID = $scope.consultData.lastViewScConsultId;
                    ConsultOrderDetailService.getOrderDetail(function (response) {
                        if (response.success) {
                            var state = response.data.orderState;
                            //1,2,3,7,8,10状态跳转至等待接诊页面
                            if (state === 1 || state === 2 || state === 3 || state === 7 || state === 8 || state === 10) {
                                $state.go("wait_chatting");
                            } else if (state === 4 || state === 5 || state === 6 || state === 9) {
                                //4,5,6,9状态跳转至订单详情页
                                $state.go("consult_order_detail");
                            } else if (state === 0) {

                            }
                        }
                    });
                } else {
                    $state.go("message->MAIN_TAB");
                }
            }
        };
        /**
         * 删除群公告
         * 将其缓存中的公告内容置空
         */
        $scope.deleteAnnouncement = function () {
            var announcement = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.GROUP_ANNOUNCEMENT) || {};
            announcement[$scope.groupInfo.tid] = true;
            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.GROUP_ANNOUNCEMENT, announcement);
            $scope.groupAnnouncement = "";
        };
    }).build();