var jsInterface = {
    // add by zhangyi for KYEEAPPC-8731 深层嵌套的时候存放点击过的群租和个人ID
    firstAt: {},
    routerRecords: [],
    /**
     * 收到消息
     * @param msg
     */
    receiveMsg: function (msg) {
        if (msg.type == 'text') {
            jsInterface.receiveTextMessage(msg);
        } else if (msg.type == 'image') {
            jsInterface.receiveMessage(msg);
        } else if (msg.type == 'audio') {
            jsInterface.receiveMessage(msg);
        } else if (msg.type == 'file') {
            jsInterface.receiveFileMessage(msg);
        } else if (msg.type == 'custom') {
            jsInterface.receiveMessage(msg);
        } else if (msg.type == 'notification') {
            jsInterface.dealNotificationSession(msg);
            jsInterface.receiveMessage(msg);
        }else if (msg.type == 'tip') {
            jsInterface.receiveMessage(msg);            
        }
    },
    /**
     * 处理notification
     */
    dealNotificationSession:function(msg){
        var storageCache = angular.element(document.body).injector().get('CacheServiceBus').getStorageCache();        
        var sessionList = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);        
        if(msg.attach.type == 3){   //更新群信息
            if(msg.attach.team && msg.attach.team.announcement){
                var announcement = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.GROUP_ANNOUNCEMENT) || {};
                announcement[msg.sessionId] = false;
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.GROUP_ANNOUNCEMENT,announcement);
            }
            for(var i = 0,len=sessionList.length;i < len;i++){
                if(sessionList[i].id == msg.to){
                    if(msg.attach.team && msg.attach.team.name){
                        sessionList[i].petname = msg.attach.team.name;
                    }
                    if(msg.attach.team && msg.attach.team.avatar){
                        sessionList[i].sessionIcon = msg.attach.team.avatar;
                    }
                    break;
                }
            }
            angular.element(document.body).injector().get('KyeeBroadcastService').doSend('SESSION_LIST', sessionList);            
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST,sessionList);
        }
        angular.element(document.body).injector().get('ConversationService').getGroupMembersInfo(msg.sessionId);
    },
    /**
     * 消息发送完成回调
     */
    sendMsgDone: function (message, error) {
        if (message.errorCode && (message.errorCode == 802)){
            message.type = 'tip';
            message.content = '您已被禁言或已不是本群成员';
            IMDispatch.saveTipMessageToLocal(message.scene,message.sessionId,message.content,(new Date().getTime()));   
        }
        var storageCache = angular.element(document.body).injector().get('CacheServiceBus').getStorageCache();
        var session = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
        for (var i = 0,len=session.length; i < len; i++) {
            if (session[i].id == message.sessionId) {
                session[i].lastMsg = message;
                jsInterface.receiveSession([session[i]]);
                break;
            }
        }
        angular.element(document.body).injector().get('KyeeBroadcastService').doSend('sendMsgDone', message);
    },
    /**
     * 收到消息
     */
    receiveMessage: function (message) {
        angular.element(document.body).injector().get('KyeeBroadcastService').doSend('receiveMsg', message);
    },
    /**
     * 接收文本消息
     * @param ecMessage
     */
    receiveTextMessage: function (ecMessage) {
        this.dealAtInMsg(ecMessage);
        angular.element(document.body).injector().get('KyeeBroadcastService').doSend('receiveMsg', ecMessage);
    },
    dealAtInMsg: function (message) {
        if (message.remoteExtension != undefined && message.remoteExtension != "") {
            if (message.remoteExtension.atList && message.remoteExtension.atList.length > 0) {
                var storageCache = angular.element(document.body).injector().get('CacheServiceBus').getStorageCache();
                var sessionList = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
                var user = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO).yxUser;
                if (sessionList && sessionList.length > 0) {
                    for (var i = 0,len = message.remoteExtension.atList.length; i < len; i++) {
                        if (message.remoteExtension.atList[i] == user) {
                            for (var i = 0; i < sessionList.length; i++) {
                                if (sessionList[i].id == message.sessionId) {
                                    if (sessionList[i].atMsg && sessionList[i].atMsg != -1) {
                                        sessionList[i].atMsg.push(message.id);
                                    } else {
                                        sessionList[i].atMsg = [];
                                        sessionList[i].atMsg.push(message.id);
                                    }
                                    if (IMUtil.isDeviceAvailable()) {
                                        var params = {
                                            atMsg: sessionList[i].atMsg,
                                            sessionId: sessionList[i].id
                                        }
                                        IMDispatch.setRecentContactAited(params);
                                    }
                                    jsInterface.receiveSession(sessionList,1);
                                    break;
                                }  
                            }
                            break;
                        }
                    }
                    angular.element(document.body).injector().get('KyeeBroadcastService').doSend('SESSION_LIST', sessionList);
                } else {
                    for (var i = 0,len = message.remoteExtension.atList.length; i < len; i++) {
                        if (message.remoteExtension.atList[i] == user) {
                            jsInterface.firstAt[message.sessionId] = [];
                            jsInterface.firstAt[message.sessionId].push(message.id);
                            if (IMUtil.isDeviceAvailable()) {
                                var params = {
                                    atMsg: jsInterface.firstAt[message.sessionId],
                                    sessionId: message.sessionId
                                }
                                IMDispatch.setRecentContactAited(params);
                            }
                        }
                    }
                }
            }
        }
    },
    /**
     * 会话列表变更 处理会话列表的变更
     * @param ecMessage
     */
    receiveSession: function (ecSessions,localFlag) {
        var flag = false;
        var storageCache = angular.element(document.body).injector().get('CacheServiceBus').getStorageCache();
        var sessions = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
        if (sessions == undefined) {
            sessions = [];
            flag = true;
        }
        var newSessions = [];
        if (ecSessions != undefined) {
            //将已存在的会话列表进行更新(第一次收到的会话列表)
            for (var i = 0,len = ecSessions.length; i < len ; i++) {
                if (ecSessions[i].extension && ecSessions[i].extension.atMsg) {
                    ecSessions[i].atMsg = ecSessions[i].extension.atMsg;
                    ecSessions[i].extension.atMsg = undefined;
                }
                if (jsInterface.firstAt[ecSessions[i].id]) {
                    ecSessions[i].atMsg = jsInterface.firstAt[ecSessions[i].id];
                    var params = {
                        atMsg: jsInterface.firstAt[ecSessions[i].id],
                        sessionId: ecSessions[i].id
                    }
                    IMDispatch.setRecentContactAited(params);
                    jsInterface.firstAt[ecSessions[i].id] = undefined;
                }
                if (ecSessions[i].lastMsg) {
                    if (sessions == "" || sessions.length == 0) {
                        sessions = ecSessions;
                        flag = true;
                        break;
                    } else if (ecSessions.length > 1) {
                        //收到会话列表(完整的会话列表) 直接赋值即可
                        sessions = ecSessions;
                        flag = true;
                        break;
                    } else {
                        for (var j = 0,length = sessions.length; j < length; j++) {
                            if (ecSessions[i].id == sessions[j].id) {
                                if(localFlag == 1){
                                    ecSessions[i].unreadCount = sessions[j].unreadCount;
                                }
                                if (sessions[j].lastMsg.id == ecSessions[i].lastMsg.id) {
                                    var petname = sessions[j].petname;
                                    var sessionIcon = sessions[j].sessionIcon;
                                    var muteTeam = sessions[j].muteTeam;
                                    if (ecSessions[i].muteTeam) {
                                        muteTeam = ecSessions[i].muteTeam;
                                    }
                                    //收到服务端的session更新
                                    if (sessions[j].atMsg && !ecSessions[i].atMsg) {
                                        ecSessions[i].atMsg = sessions[j].atMsg;
                                    }
                                    sessions[j] = ecSessions[i];
                                    sessions[j].petname = petname;
                                    sessions[j].sessionIcon = sessionIcon;
                                    sessions[j].muteTeam = muteTeam;
                                    break;
                                } else {
                                    //已存在会话置顶更新了
                                    var petname = sessions[j].petname;
                                    var sessionIcon = sessions[j].sessionIcon;
                                    var muteTeam = sessions[j].muteTeam;
                                    if (ecSessions[i].muteTeam) {
                                        muteTeam = ecSessions[i].muteTeam;
                                    }
                                    if (sessions[j].atMsg && !ecSessions[i].atMsg) {
                                        ecSessions[i].atMsg = sessions[j].atMsg;
                                    }
                                    for (var k = j; k > 0; k--) {
                                        sessions[k] = sessions[k - 1];
                                    }
                                    sessions[0] = ecSessions[i];
                                    sessions[0].petname = petname;
                                    sessions[0].sessionIcon = sessionIcon;
                                    sessions[0].muteTeam = muteTeam;
                                    break;
                                }
                            }
                            //当前的ecSessions未匹配上任何一个sessions项（存在新增的ecSession项）
                            if (j == sessions.length - 1) {
                                newSessions.push(ecSessions[i]);
                            }
                        }
                    }
                }
            }
            if (newSessions.length > 0) {
                sessions.reverse();
                sessions.push.apply(sessions, newSessions);
                sessions.reverse();
                flag = true;
            }
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST, sessions);
            if (flag) {
                var sessionIdList = [];
                var groupIdList = [];
                for (var k = 0; k < sessions.length; k++) {
                    // 点对点聊天查询个人头像
                    if (sessions[k].scene == 0) {
                        sessionIdList.push(sessions[k].id);
                    }
                    if (sessions[k].scene == 1) {
                        groupIdList.push(sessions[k].id);
                    }
                }
                //从后端获取session的相关信息
                if (flag && sessionIdList && sessionIdList.length > 0) {
                    sessionIdList = JSON.stringify(sessionIdList);
                    angular.element(document.body).injector().get('MessageService').getUsersInfo(sessionIdList, 0, function (infoMap) {
                        for (var k = 0; k < sessions.length; k++) {
                            if (sessions[k].scene == 0 && infoMap[sessions[k].id]) {
                                sessions[k].sessionIcon = infoMap[sessions[k].id].userPhoto;
                                sessions[k].petname = infoMap[sessions[k].id].userPetname;
                            }
                        }
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST, sessions);
                        angular.element(document.body).injector().get('KyeeBroadcastService').doSend('SESSION_LIST', sessions);
                    }, function () {
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST, sessions);
                        angular.element(document.body).injector().get('KyeeBroadcastService').doSend('SESSION_LIST', sessions);
                    });
                }
                if (groupIdList && groupIdList.length > 0) {
                    var storageCache = angular.element(document.body).injector().get('CacheServiceBus').getStorageCache();
                    var user = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO).yxUser;
                    angular.element(document.body).injector().get('MessageService').getGroupsInfo(groupIdList, user, function (infoMap) {
                        var oldSession = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
                        for (var k = 0; k < sessions.length; k++) {
                            if (sessions[k].scene == 1 && infoMap[sessions[k].id]) {
                                sessions[k].sessionIcon = infoMap[sessions[k].id].icon;
                                sessions[k].petname = infoMap[sessions[k].id].tname;
                                sessions[k].muteTeam = infoMap[sessions[k].id].muteTeam;
                                for (var i = 0; i < oldSession.length; i++) {
                                    if (sessions[k].id == oldSession[i].id) {
                                        sessions[k].atMsg = oldSession[i].atMsg;
                                        break;
                                    }
                                }
                            }
                        }
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST, sessions);
                        angular.element(document.body).injector().get('KyeeBroadcastService').doSend('SESSION_LIST', sessions);
                    });
                }
            }
            if (!flag) {
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST, sessions);
                angular.element(document.body).injector().get('KyeeBroadcastService').doSend('SESSION_LIST', sessions);
            }
        }
    },
    /**
     * 状态栏推送消息点击事件
     * add by sph
     * @param params
     */
    clickStatusBarPushMessage: function (params) {
        angular.element(document.body).injector().get('StatusBarPushService').clickStatusBarMessage(params);
    },
    /**
     * 判断网络状态类型是否是ipv6
     * add by sph
     * @param params
     */
    currentNetworkType: function (params) {
        if (params.networkType == "ipv6") {
            DeploymentConfig.SERVER_URL_REGISTRY.default = params.ipv6Address + "APP/";
        }
    },
    /**
     * 撤回监听（别人撤回了一条消息）
     */
    revokeListener: function (msg) {
        var storageCache = angular.element(document.body).injector().get('CacheServiceBus').getStorageCache();
        var session = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
        for (var j = 0; j < session.length; j++) {
            if (msg.scene == 0) {
                if (session[j].id == msg.from) {
                    session[j].lastMsg.type = 'text';
                    session[j].lastMsg.content = '对方撤回了一条消息';
                    IMDispatch.saveTipMessageToLocal(0, msg.from, session[j].lastMsg.content, msg.time);
                    jsInterface.receiveSession([session[j]]);
                }
            } else {
                if (session[j].id == msg.to) {
                    session[j].lastMsg.type = 'text';
                    session[j].lastMsg.content = '';
                    if(msg.fromNick){
                        session[j].lastMsg.content += msg.fromNick;
                    }else{
                        session[j].lastMsg.content += '有成员';                        
                    }
                    session[j].lastMsg.content += '撤回了一条消息';
                    IMDispatch.saveTipMessageToLocal(1, msg.to, session[j].lastMsg.content, msg.time);                    
                    jsInterface.receiveSession([session[j]]);
                }
            }
        }
        angular.element(document.body).injector().get('KyeeBroadcastService').doSend('revokeMsg', msg);
    },
    /**
     * 获取群组是否需要通知完成
     */
    notifyForNewTeamMsgDone: function (teams) {},
    /**
     * 接收到群组列表并更新界面展示
     * @param teams
     */
    receiveTeam: function (teams) {},
    /**
     * 接收群组通知
     * @param ecMessage
     */
    receiveGroupNoticeMessage: function (ecMessage) {

    },
    /**
     * 接收文件消息
     */
    receiveFileMessage: function (ecMessage) {},
    /**
     * 接收系统通知
     */
    receiveSysNotice: function (sysNotice) {
        //处理系统通知
        if (sysNotice.type > 3) {
            return;
        } else {
            //处理关于加群等的系统通知
        }
    },
    //收到广播消息
    receiveBroadcastMsg: function (msg) {},
    /**
     * 连接状态监听
     * @param state
     */
    onConnectStateListener: function (state) {
        angular.element(document.body).injector().get('LoginService').onDisconnect(state);
    },
    /**
     * 保险事业部调用的JS接口
     * add by sph
     * @param params
     */
    onCallFromBX: function (params) {
        angular.element(document.body).injector().get('BootstrapService').onCallFromBX(params);
    },
    /**
     * 修改他人的群昵称成功
     */
    updateNickInTeamDone: function (obj, error) {},
    /**
     * 判断当前浏览器是否是微信浏览器(工具方法)
     * add by sph
     */
    isWeiXin: function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    },
    /**
     * 判断当前浏览器是否是支付宝浏览器(工具方法)
     * add by zhangyi
     */
    isZFB: function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/AlipayClient/i) == 'alipayclient') {
            return true;
        } else {
            return false;
        }
    },
    /**
     * add by zhangyi on 20161230 APPREQUIREMENT-2072 支付宝生活号URL配置处理方式改善
     * modified by zhangyi on 20170105 屏蔽支付宝入口
     * @returns {boolean}
     */
    isPatientGroupLegalWebApp: function () {
        return jsInterface.isWeiXin();
    },
    /**
     * 接收消息已读回执监听
     */
    messageReceiptsListener: function (arg) {
        if (arg) {
            var storageCache = angular.element(document.body).injector().get('CacheServiceBus').getStorageCache();
            var loginInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
            var yxUser = loginInfo.yxUser;
            var receipts = localStorage.getItem("receipts-" + yxUser);
            receipts = JSON.parse(receipts);
            if (!receipts) {
                receipts = {};
            }
            receipts[arg.sessionId] = arg.time;
            localStorage.setItem("receipts-" + yxUser, JSON.stringify(receipts));
            angular.element(document.body).injector().get('KyeeBroadcastService').doSend('messageReceiptsListener', arg);
        }
    },
    /**
     * web端多端登录监听
     */
    onLoginPortsChange: function (loginPort) {
        var storageCache = angular.element(document.body).injector().get('CacheServiceBus').getStorageCache();
        var loginTime = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TIME);
        if (loginPort && loginTime > loginPort.time) {
            var deviceIds = [];
            deviceIds.push(loginPort.deviceId);
            IMDispatch.kick(deviceIds);
        }
    },
    /**
     * 数据同步完成
     */
    onSyncDone: function () {
        IMDispatch.queryRecentContacts(function (sessions) {
            jsInterface.receiveSession(sessions);
        });
    },
    /**
     * 外壳发生错误时调用
     */
    onError: function (error) {
        
    }
};