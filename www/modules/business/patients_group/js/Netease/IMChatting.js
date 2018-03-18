var IMChatting = {
    currentVersion:'0.0',
    currentCustomVersion:'0.0',
    /**
     * 获取云信nim对象
     * @returns {nim|{}|*}
     */
    getNIM: function () {
        return YX.nim;
    },
    /**
     * Web端 登录IM
     */
    loginNIM: function (appKey, account, token) {
        YX.init(appKey, account, token);
    },
    /**
     * Web 端 登出IM
     */
    logoutNIM: function () {
        var nim = IMChatting.getNIM();
        if (nim && nim != null) {
            nim.disconnect();
            delete nim;
        }
    },
    //*****************************多端登录*****************************************
    kick: function (deviceIds, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.kick({
            deviceIds: deviceIds,
            done: onSuccess
        });
    },
    //*****************************消息*****************************************
    /**
     * 发送文本消息
     */
    sendTextMessage: function (message, onSuccess, onError) {
        if(message.resend){
            message.status = 'fail';
            IMChatting.resendMsg(message);
            return;
        }
        var nim = IMChatting.getNIM();
        var msg = nim.sendText({
            scene: message.scene == 0 ? 'p2p' : 'team',
            to: message.to,
            type: 'text',
            text: message.content,
            custom: message.remoteExtension,            
            pushContent: message.pushContent,
            pushPayload: message.pushPayload,
            idClient: message.resend ? message.id : null,
            apns: message.apns,
            resend: message.resend ? message.resend : false,
            needPushNick: message.customMessageConfig ? message.customMessageConfig.needPushNick : true,
            isHistoryable: message.customMessageConfig ? message.customMessageConfig.isHistoryable : true,
            isRoamingable: message.customMessageConfig ? message.customMessageConfig.isRoamingable : true,
            isSyncable: message.customMessageConfig ? message.customMessageConfig.isSyncable : true,
            isPushable: message.customMessageConfig ? message.customMessageConfig.isPushable : true,
            isOfflinable: message.customMessageConfig ? message.customMessageConfig.isOfflinable : true,
            isUnreadable: message.customMessageConfig ? message.customMessageConfig.isUnreadable : true,
            isLocal: message.customMessageConfig ? message.customMessageConfig.isLocal : false,
            done: IMChatting.sendMsgDone
        });
        onSuccess(null, msg);
    },
    /**
     * 预览图片消息
     * @param msg
     */
    sendImageMessage: function (message, onSuccess) {
        if(message.resend){
            message.status = 'fail';
            IMChatting.resendMsg(message);
            return;
        }
        var nim = IMChatting.getNIM();
        message.status = 'sending';
        var msg = nim.sendFile({
            scene: message.scene == 0 ? 'p2p' : 'team',
            to: message.to,
            type: 'image',
            dataURL: message.filePath,
            custom:message.remoteExtension,
            pushContent: message.pushContent,
            pushPayload: message.pushPayload,
            idClient: message.resend ? message.id : null,
            apns: message.apns,
            resend: message.resend ? message.resend : false,
            needPushNick: message.customMessageConfig ? message.customMessageConfig.needPushNick : true,
            isHistoryable: message.customMessageConfig ? message.customMessageConfig.isHistoryable : true,
            isRoamingable: message.customMessageConfig ? message.customMessageConfig.isRoamingable : true,
            isSyncable: message.customMessageConfig ? message.customMessageConfig.isSyncable : true,
            isPushable: message.customMessageConfig ? message.customMessageConfig.isPushable : true,
            isOfflinable: message.customMessageConfig ? message.customMessageConfig.isOfflinable : true,
            isUnreadable: message.customMessageConfig ? message.customMessageConfig.isUnreadable : true,
            isLocal: message.customMessageConfig ? message.customMessageConfig.isLocal : false,
            beginupload: function (upload) {},
            uploadprogress: function (obj) {
                console.log('上传进度: ' + obj.percentage);
            },
            uploaddone: function (error, file) {
                console.log(error);
                console.log(file);
                console.log('上传' + (!error ? '成功' : '失败'));
            },
            beforesend: function (msg) {
                onSuccess(null,msg);
                console.log('正在发送p2p image消息, id=' + msg.idClient);
                localStorage.setItem("isReady","yes");               
            },
            done: IMChatting.sendMsgDone
        });
       
    },

    // },
    /**
     * 发送文件消息
     */
    sendFileMessage: function (msg, onSuccess) {
        if(message.resend){
            message.status = 'fail';
            IMChatting.resendMsg(msg);
            return;
        }
        var nim = IMChatting.getNIM();
        var msg = nim.sendFile({
            scene: msg.scene == 0 ? 'p2p' : 'team',
            to: msg.to,
            type: 'file',
            dataURL: msg.filePath,
            custom:msg.remoteExtension,
            pushContent: msg.pushContent,
            pushPayload: msg.pushPayload,
            idClient: msg.resend ? msg.id : null,
            apns: msg.apns,
            resend: msg.resend ? msg.resend : false,
            needPushNick: msg.customMessageConfig ? msg.customMessageConfig.needPushNick : true,
            isHistoryable: msg.customMessageConfig ? msg.customMessageConfig.isHistoryable : true,
            isRoamingable: msg.customMessageConfig ? msg.customMessageConfig.isRoamingable : true,
            isSyncable: msg.customMessageConfig ? msg.customMessageConfig.isSyncable : true,
            isPushable: msg.customMessageConfig ? msg.customMessageConfig.isPushable : true,
            isOfflinable: msg.customMessageConfig ? msg.customMessageConfig.isOfflinable : true,
            isUnreadable: msg.customMessageConfig ? msg.customMessageConfig.isUnreadable : true,
            isLocal: msg.customMessageConfig ? msg.customMessageConfig.isLocal : false,
            beginupload: function (upload) {
                onSuccess(null, msg);
            },
            uploadprogress: function (obj) {
                console.log('文件总大小: ' + obj.total + 'bytes');
                console.log('已经上传的大小: ' + obj.loaded + 'bytes');
                console.log('上传进度: ' + obj.percentage);
                console.log('上传进度文本: ' + obj.percentageText);
            },
            uploaddone: function (error, file) {
                console.log(error);
                console.log(file);
                console.log('上传' + (!error ? '成功' : '失败'));
            },
            beforesend: function (msg) {
                onSuccess(null,msg);
                console.log('正在发送p2p image消息, id=' + msg.idClient);
            },
            done: IMChatting.sendMsgDone
        });
    },
    /**
     * 发送一条自定义消息
     * @param msg
     */
    sendCustomMessage: function (message, onSuccess) {
        if(message.resend){
            IMChatting.resendMsg(msg);
            return;
        }
        if(message.attach){
            message.attach = JSON.stringify(message.attach)
        }
        var nim = IMChatting.getNIM();
        var msg = nim.sendCustomMsg({
            scene: message.scene == 0 ? 'p2p' : 'team',
            to: message.to,
            target:message.to,
            fromNick: message.fromNick,
            custom:message.remoteExtension,
            content: message.attach,
            pushContent: message.pushContent,
            pushPayload: message.pushPayload,
            idClient: message.resend ? msg.id : null,
            apns: message.apns,
            resend: message.resend ? message.resend : false,
            needPushNick: message.customMessageConfig ? message.customMessageConfig.needPushNick : true,
            isHistoryable: message.customMessageConfig ?message.customMessageConfig.isHistoryable : true,
            isRoamingable: message.customMessageConfig ? message.customMessageConfig.isRoamingable : true,
            isSyncable: message.customMessageConfig ? message.customMessageConfig.isSyncable : true,
            isPushable: message.customMessageConfig ? message.customMessageConfig.isPushable : true,
            isOfflinable: message.customMessageConfig ? message.customMessageConfig.isOfflinable : true,
            isUnreadable: message.customMessageConfig ? message.customMessageConfig.isUnreadable : true,
            isLocal: message.customMessageConfig ? message.customMessageConfig.isLocal : false,
            done: IMChatting.sendMsgDone
        });
        onSuccess(null, msg);
    },
    /**
     * 消息撤回
     */
    revokeMessage: function (msg, onSuccess) {
        var nim = IMChatting.getNIM();
        msg.idClient = msg.id;
        msg.scene = msg.scene == 0 ? 'p2p' : 'team';
        msg.sessionId = msg.scene + "-" + msg.sessionId;
        msg.flow = 'out';
        nim.deleteMsg({
            msg: msg,
            done: onSuccess
        });
    },
    /**
     * 发送提醒消息
     */
    sendTipMessage: function (msg, onSuccess) {
        if(msg.resend){
            IMChatting.resendMsg(msg);
            return;
        }
        var nim = IMChatting.getNIM();
        var msg = nim.sendTipMsg({
            scene: msg.scene == 0 ? 'p2p' : 'team',
            to: msg.to,
            tip: msg.content,
            custom:msg.remoteExtension,
            pushContent: msg.pushContent,
            pushPayload: msg.pushPayload,
            idClient: msg.resend ? msg.id : null,
            apns: msg.apns,
            resend: msg.resend ? msg.resend : false,
            needPushNick: msg.customMessageConfig ? msg.customMessageConfig.needPushNick : true,
            isHistoryable: msg.customMessageConfig ?msg.customMessageConfig.isHistoryable : true,
            isRoamingable: msg.customMessageConfig ? msg.customMessageConfig.isRoamingable : true,
            isSyncable: msg.customMessageConfig ? msg.customMessageConfig.isSyncable : true,
            isPushable: msg.customMessageConfig ? msg.customMessageConfig.isPushable : true,
            isOfflinable: msg.customMessageConfig ? msg.customMessageConfig.isOfflinable : true,
            isUnreadable: msg.customMessageConfig ? msg.customMessageConfig.isUnreadable : true,
            isLocal: msg.customMessageConfig ? msg.customMessageConfig.isLocal : false,
            done: IMChatting.sendMsgDone
        });
        onSuccess(null,msg);
    },
    /**
     * 转发消息
     */
    createForwardMessage: function (msg, sessionId, sessionType, onSuccess) {
        if(message.resend){
            IMChatting.resendMsg(msg);
            return;
        }
        var nim = IMChatting.getNIM();
        var msg = nim.forwardMsg({
            msg: msg,
            scene: sessionType,
            to: sessionId,
            done: IMChatting.sendMsgDone
        });
        onSuccess(null,msg);
    },
    resendMsg:function(msg){
        var nim = IMChatting.getNIM();
        msg = IMUtil.reDealMsg(msg);
        nim.resendMsg({
            msg: msg,
            done: IMChatting.sendMsgDone
          });
    },
    sendMsgDone: function (error, message) {
        if(message.type != 'custom'){
            message = IMUtil.dealMsg(message);
        }else{
            message =  IMUtil.dealCustomMsg(message);
        }
        if(error &&  error.code){
           message.errorCode = error.code;
        }
        jsInterface.sendMsgDone(message, error);        
    },
    //*****************************历史记录*****************************************
    /**
     * 获取历史消息记录
     */
    pullMessageList: function (msg, limit, endTime, onSuccess) {
        var nim = YX.nim;
        nim.getHistoryMsgs({
            scene: msg.scene == 0 ? 'p2p' : 'team',
            limit: limit,
            to: msg.to,
            lastMsgId: msg.idServer,
            endTime: endTime,
            done: onSuccess
        });
    },
    /**
     * 获取本地历史记录
     */
    getLocalMsgs:function(msg,limit,endTime,onSuccess){
    },
    //*****************************会话*****************************************
    /**
     * 获取本地最近会话列表
     */
    queryRecentContacts: function (onSuccess) {
        var nim = IMChatting.getNIM();
        nim.getLocalSessions({
            limit: 10,
            done: onSuccess
        });
    },
    /**
     * 插入一条本地会话列表
     */
    saveMessageToLocal: function (msg, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.insertLocalSession({
            scene: msg.scene == 0 ? 'p2p' : 'team',
            to: msg.to,
            done: onSuccess
        });
    },
    /**
     * 更新本地会话
     */
    updateLocalSession: function (session, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.updateLocalSession({
            id: session.id,
            localCustom: session.localCustom,
            done: onSuccess
        });
    },
    /**
     * 删除指定的本地会话
     */
    deleteRecentContact: function (sessionId, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.deleteLocalSession({
            id: sessionId,
            done: IMChatting.deleteRecentContactDone
        });
    },
    /**
     * 重置指定会话未读数
     * @param sessionId
     */
    resetSessionUnread: function (account) {
        var nim = IMChatting.getNIM();
        nim.resetSessionUnread(account);
    },
    /**
     * 重置所有会话的会话未读数
     * @param sessionId
     * @param sessionType
     */
    resetCurrSession: function (onSuccess, onError) {
        var nim = IMChatting.getNIM();
        nim.resetCurrSession();
    },
    /**
     * 设置会话未读数
     * @param sessionId
     */
    setSessionUnread: function (sessionId, onSuccess, onError) {
        var nim = IMChatting.getNIM();
        nim.setCurrSession(sessionId);
    },
    /**
     * 标记消息为已收到
     */
    markMsgRead: function(msg){
        var nim = IMChatting.getNIM();
        nim.markMsgRead(msg);
    },
    //*****************************群组*****************************************
    /**
     * 获取群成员禁言列表
     * @param teamId
     */
    fetchTeamMutedMembers: function (teamId, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.getMutedTeamMembers({
            teamId: teamId,
            done: onSuccess
        })
    },
    /**
     * 根据群ID获取群信息
     * @param teamId
     */
    getTeamInfoByTeamId: function (teamId, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.getTeam({
            teamId: teamId,
            done: onSuccess,
        });
    },
    /**
     * 获取我的群列表
     */
    getAllMyTeams: function (onSuccess) {
        var nim = IMChatting.getNIM();
        nim.getTeams({
            done: onSuccess
        });
    },
    /**
     * 根据群ID获取群成员
     * @param teamId
     */
    fetchTeamMembers: function (teamId, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.getTeamMembers({
            teamId: teamId,
            done: onSuccess
        });
    },
    /**
     * 根据群列表获取群消息是否需要提醒
     * @param teamIds
     * @param onSuccess
     * @param onError
     */
    notifyForNewTeamMsg: function (teamIds, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.notifyForNewTeamMsg({
            teamIds: teamIds,
            done: onSuccess
        })
    },
    /**
     * 接受入群邀请
     * @param idServer
     * @param teamId
     * @param from
     */
    acceptTeamInvite: function (idServer, teamId, from, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.acceptTeamInvite({
            idServer: idServer,
            teamId: teamId,
            from: from,
            done: onSuccess
        });
    },
    /**
     * 拒绝入群邀请
     * @param idServer
     * @param teamId
     * @param from
     * @param ps
     */
    rejectTeamInvite: function (idServer, teamId, from, ps, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.rejectTeamInvite({
            idServer: idServer,
            teamId: teamId,
            from: from,
            ps: ps,
            done: onSuccess
        });
    },
    /**
     * 通过入群申请
     * @param idServer
     * @param teamId
     * @param from
     */
    passTeamApply: function (idServer, teamId, from, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.passTeamApply({
            idServer: idServer,
            teamId: teamId,
            from: from,
            done: onSuccess
        });
    },
    /**
     * 拒绝入群申请
     * @param idServer
     * @param teamId
     * @param from
     * @param ps
     */
    rejectTeamApply: function (idServer, teamId, from, ps, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.rejectTeamApply({
            idServer: idServer,
            teamId: teamId,
            from: from,
            ps: ps,
            done: onSuccess
        });
    },
    /**
     * 修改别人的群昵称
     * @param teamId
     * @param account
     * @param nickInTeam
     */
    updateNickInTeam: function (teamId, account, nickInTeam, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.updateNickInTeam({
            teamId: teamId,
            account: account,
            nickInTeam: nickInTeam,
            done: onSuccess
        });
    },
    //************************************系统通知相关接口******************************************
    /**
     * 标记系统消息为已读状态
     * @param sysMsg
     */
    markSysMsgRead: function (sysMsg, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.markSysMsgRead({
            sysMsgs: sysMsg, // or [someSysMsg]
            done: onSuccess
        });
    },
    /**
     * 发送自定义系统消息
     * @param sysCustomMsg
     */
    sendCustomSysMsg: function (sysCustomMsg, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.sendCustomSysMsg({
            scene: sysCustomMsg.scene == 0 ? 'p2p' : 'Team',
            to: sysCustomMsg.to,
            content: sysCustomMsg.content,
            sendToOnlineUsersOnly: false,
            apnsText: sysCustomMsg.content,
            done: onSuccess
        });
    },
    //******************************用户名片**************************************
    /**
     * 更新我的用户名片
     */
    updateMyInfo: function (info, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.updateMyInfo({
            nick: info.nick,
            avatar: info.avatar,
            gender: info.gender,
            custom: JSON.stringify(info.custom),
            done: onSuccess
        });
    },
    /**
     * 获取用户名片
     */
    getUser: function (account, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.getUser({
            account: account,
            done: onSuccess
        });
    },
    /**
     * 获取用户名片数组
     */
    getUsers: function (accounts, onSuccess) {
        var nim = IMChatting.getNIM();
        nim.getUsers({
            accounts: accounts,
            done: onSuccess
        });
    },
    /**
     * 获取会话未读数
     * @returns {number}
     */
    getTotalUnreadCount: function () {
        var sessions = [];
        if (YX.data.sessions) {
            sessions = YX.data.sessions;
        }
        var count = 0;
        for (var i = 0; i < sessions.length; i++) {
            count += sessions[i].unreadCount;
        }
        return count;

    },
    //*****************************消息已读回执**************************************
    sendMessageReceipt: function (message, onSuccess) {
        var nim = IMChatting.getNIM();
        message = IMUtil.reDealMsg(message);
        nim.sendMsgReceipt({
            msg: message,
            done: onSuccess
        });
    },
    isMsgRemoteRead: function (message, onSuccess) {
        var nim = IMChatting.getNIM();
        var isRemoteRead = nim.isMsgRemoteRead(msg);
        onSuccess(isRemoteRead);
    },
    deleteRecentContactDone:function(error,obj){
    }
}