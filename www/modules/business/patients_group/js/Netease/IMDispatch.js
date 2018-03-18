var IMDispatch = {
    /**
     * 踢其他端(WEB端)
     */
    kick: function (deviceIds, onSuccess, onError) {
        //web端登录操作
        IMChatting.kick(deviceIds, function (error, obj) {
            if (!error) {
                onSuccess && onSuccess(obj);
            } else {
                onError && onError(error);
            }
        });
    },
    /**
     * 登录IM
     */
    loginNIM: function (appKey, account, token, onSuccess, onError) {
        //判断是否为移动端设备
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.loginNIM(appKey, account, token, function (code) {
                jsInterface.onConnectStateListener(6);
                IMDispatch.queryRecentContacts(function (sessions) {
                    jsInterface.receiveSession(sessions);
                });
                //成功 true
            }, function (code) {
                //失败 false
                switch (code) {
                    case 408:
                    case 415:
                        jsInterface.onConnectStateListener(2);
                        break;
                    case 431:
                        jsInterface.onConnectStateListener(6);
                        break;
                    case 422:
                        jsInterface.onConnectStateListener(9);
                        break;
                    case 302:
                        jsInterface.onConnectStateListener(11);
                        break;
                    case 514:
                        jsInterface.onConnectStateListener(0);
                        break;
                }
            });
        } else {
            //web端登录操作
            IMChatting.loginNIM(appKey, account, token);
        }
    },
    /**
     * 登出IM(web端无回调)
     */
    logOutNIM: function () {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.logoutNIM();
            jsInterface.onConnectStateListener(1);
        } else {
            //web端登录操作
            IMChatting.logoutNIM();
        }
    },
    //************************************消息******************************************
    /**
     * 发送文本消息
     */
    sendTextMessage: function (msg, onSuccess, onError) {
        if (msg.remoteExtension) {
            msg.remoteExtension.ver = IMChatting.currentVersion;
        } else {
            msg.remoteExtension = {
                ver: IMChatting.currentVersion
            }
        }
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.sendTextMessage(msg, onSuccess, onError);
        } else {
            msg.remoteExtension = JSON.stringify(msg.remoteExtension);
            IMChatting.sendTextMessage(msg, function (error, message) {
                if (!error) {
                    message = IMUtil.dealMsg(message);
                    onSuccess && onSuccess(message);
                } else {
                    message = IMUtil.dealMsg(message);
                    onError && onError(message);
                }
            });
        }
    },
    /***
     * 发送图片消息
     * @param msg
     */
    sendImageMessage: function (msg, onSuccess, onError) {
        if (msg.remoteExtension) {
            msg.remoteExtension.ver = IMChatting.currentVersion;
        } else {
            msg.remoteExtension = {
                ver: IMChatting.currentVersion
            }
        }

        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.sendImageMessage(msg, onSuccess, onError);
        } else {
            msg.remoteExtension = JSON.stringify(msg.remoteExtension);
            IMChatting.sendImageMessage(msg, function (error, message) {
                if (!error) {
                    message = IMUtil.dealMsg(message);
                    onSuccess && onSuccess(message);
                } else {
                    message = IMUtil.dealMsg(message);
                    onError && onError(message);
                }
            });
        }
    },
    /***
     * 发送文件消息
     * @param msg
     */
    sendFileMessage: function (msg, onSuccess, onError) {
        if (msg.remoteExtension) {
            msg.remoteExtension.ver = IMChatting.currentVersion;
        } else {
            msg.remoteExtension = {
                ver: IMChatting.currentVersion
            }
        }

        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.sendFileMessage(msg, onSuccess, onError);
        } else {
            msg.remoteExtension = JSON.stringify(msg.remoteExtension);
            IMChatting.sendFileMessage(msg, function (error, message) {
                if (!error) {
                    message = IMUtil.dealMsg(message);
                    onSuccess && onSuccess(message);
                } else {
                    message = IMUtil.dealMsg(message);
                    onError && onError(message);
                }
            });
        }
    },
    /**
     * 发送语音消息
     */
    sendAudioMessage:function(msg, onSuccess, onError){
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.sendAudioMessage(msg, function (res) {
                onSuccess && onSuccess(res);
            }, function (res) {
                onError && onError(res);
            });
        } 
    },
    /**
     * 发送自定义消息
     * @param msg
     * @param onSuccess
     * @param onError
     */
    sendCustomMessage: function (msg, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.sendCustomMessage(msg, function (res) {
                //成功
                onSuccess && onSuccess(res);
            }, function (res) {
                //失败
                onError && onError(res);
            });
        } else {
            msg.remoteExtension = JSON.stringify(msg.remoteExtension);
            IMChatting.sendCustomMessage(msg, function (error, message) {
                if (!error) {
                    message = IMUtil.dealCustomMsg(message);
                    onSuccess && onSuccess(message);
                } else {
                    message = IMUtil.dealCustomMsg(message);
                    onError && onError(message);
                }
            });
        }
    },
    /**
     * 开始录音
     */
    startAudioRecording: function (msg, onSuccess, onError) {
        if (msg.remoteExtension) {
            msg.remoteExtension.ver = IMChatting.currentVersion;
        } else {
            msg.remoteExtension = {
                ver: IMChatting.currentVersion
            }
        }
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.startAudioRecording(msg, onSuccess, onError);
        }
    },
    /**
     * 结束录音
     */
    endAudioRecording: function (onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.endAudioRecording(onSuccess, onError);
        }
    },
    /**
     * 取消录音
     */
    cancelAudioRecording: function (onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.cancelAudioRecording(onSuccess, onError);
        }
    },
    /**
     * 播放语音
     */
    playAudio: function (msg, type, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.playAudio(msg, type, onSuccess, onError);
        }
    },
    /**
     * 停止播放语音消息
     */
    stopPlayAudio: function (onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.stopPlayAudio(onSuccess, onError);
        }
    },
    /**
     * 发送提醒消息
     */
    sendTipMessage: function (msg, onSuccess, onError) {
        if (msg.remoteExtension) {
            msg.remoteExtension.ver = IMChatting.currentVersion;
        } else {
            msg.remoteExtension = {
                ver: IMChatting.currentVersion
            }
        }
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.sendTipMessage(msg, onSuccess, onError);
        } else {
            msg.remoteExtension = JSON.stringify(msg.remoteExtension);
            IMChatting.sendTipMessage(msg, function (error, message) {
                if (!error) {
                    message = IMUtil.dealMsg(message);
                    onSuccess && onSuccess(message);
                } else {
                    message = IMUtil.dealMsg(message);
                    onError && onError(message);
                }
            });
        }
    },
    /**
     * 撤回消息
     */
    revokeMessage: function (msg, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.revokeMessage(msg, onSuccess, onError);
        } else {
            IMChatting.revokeMessage(msg, function (error, message) {
                if (!error) {
                    onSuccess && onSuccess(message);
                } else {
                    onError && onError(error);
                }
            });
        }
    },
    /**
     *  转发消息
     */
    createForwardMessage: function (msg, sessionId, sessionType, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.createForwardMessage(msg, sessionId, sessionType, onSuccess, onError);
        } else {
            if (sessionType == 1) {
                sessionType = 'team';
            } else if (sessionType == 0) {
                sessionType = 'p2p';
            }
            sessionId = sessionType + '-' + sessionId;
            IMChatting.createForwardMessage(msg, sessionId, sessionType, function (error, message) {
                if (!error) {
                    message = IMUtil.dealMsg(message);
                    onSuccess && onSuccess(message);
                } else {
                    message = IMUtil.dealMsg(message);
                    onError && onError(message);
                }
            });
        }
    },

    /**
     * 保存一条本地提醒消息
     */
    saveTipMessageToLocal: function (scene, sessionId, content, time, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.saveTipMessageToLocal(scene, sessionId, content, time, onSuccess, onError);
        }
    },
    /**
     * 更新localExtension
     */
    updateMessageExt: function (msgId, localExtension,message,onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.updateMessageExt(msgId, localExtension,message,onSuccess, onError);
        }
    },
    //************************************会话******************************************
    /**
     * 设置at信息
     */
    setRecentContactAited: function (params, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.setRecentContactAited(params, onSuccess, onError);
        }
    },
    /**
     * 清除at信息
     */
    clearRecentContactAited: function (params, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.clearRecentContactAited(params, onSuccess, onError);
        }
    },
    /**
     * 获取会话未读总数
     */
    getTotalUnreadCount: function (onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.getTotalUnreadCount(onSuccess, onError);
        }
    },
    /**
     * 获取最近会话列表（本地）
     */
    queryRecentContacts: function (onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.queryRecentContacts(onSuccess, onError);
        } else {
            IMChatting.queryRecentContacts(function (error, obj) {
                if (!error && obj.sessions && obj.sessions.length > 0) {
                    for (var i = 0; i < obj.sessions.length; i++) {
                        obj.sessions[i] = IMUtil.dealSession(obj.sessions[i]);
                        obj.sessions[i].lastMsg = IMUtil.dealMsg(obj.sessions[i].lastMsg);
                    }
                    onSuccess && onSuccess(obj.sessions);
                } else if (obj.sessions && obj.sessions.length == 0) {
                    onSuccess && onSuccess(obj.sessions);
                } else if (error) {
                    onError && onError(error);
                }
            });
        }
    },
    /**
     * 更新本地会话
     */
    updateLocalSession: function (params, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.updateLocalSession(params, onSuccess, onError);
        } else {
            if (params.scene == 0) {
                params.id = 'p2p-' + params.id;
            } else {
                params.id = 'team-' + params.id;
            }
            IMChatting.updateLocalSession(params, function (error, obj) {
                if (!error) {
                    onSuccess && onSuccess(obj);
                } else {
                    onError && onError(error);
                }
            });
        }
    },
    /**
     * 进入离开session/聊天界面
     */
    setChattingAccount: function (arg, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.setChattingAccount(arg, onSuccess, onError);
        } else {
            if (arg.pageType == 'CHAT') {
                if (arg.isIn && arg.sessionType == 0) {
                    var Id = 'p2p-' + arg.sessionId;
                    IMChatting.setSessionUnread(Id);
                } else if (arg.isIn && arg.sessionType == 1) {
                    var Id = 'team-' + arg.sessionId;
                    IMChatting.setSessionUnread(Id);
                } else if (!arg.isIn) {
                    IMChatting.resetCurrSession();
                }
            }
        }
    },
    /**
     * 将当前会话的未读数清零(无回调)
     * @param onSuccess
     * @param onError
     */
    clearUnreadCount: function (account, sessionType, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.clearUnreadCount(account, sessionType, onSuccess, onError);
        } else {
            if (sessionType == 1) {
                sessionType = 'team';
            } else if (sessionType == 0) {
                sessionType = 'p2p';
            }
            account = sessionType + '-' + account;
            IMChatting.resetSessionUnread(account);
        }
    },
    /**
     * 删除指定最近会话（外壳无回调）
     * @param onSuccess
     * @param onError
     */
    deleteRecentContact: function (sessionId, scene) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.deleteRecentContact(sessionId, scene);
        } else {
            if (scene == 0) {
                sessionId = 'p2p-' + sessionId;
            } else {
                sessionId = 'team-' + sessionId;
            }
            IMChatting.deleteRecentContact(sessionId);
        }
    },
    /**
     * 保存本地消息到数据库但不发送到数据库
     * @param msg
     * @param onSuccess
     * @param onError
     */
    saveMessageToLocal: function (msg, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.saveMessageToLocal(msg, onSuccess, onError);
        } else {
            IMChatting.saveMessageToLocal(msg, function (error, obj) {
                if (!error) {
                    onSuccess && onSuccess(obj.session);
                } else {
                    onError && onError(error);
                }
            });
        }
    },
    /**
     * 将会话手动标记为已读
     */
    markMsgRead: function (message) {
        if (!IMUtil.isDeviceAvailable()) {
            var msg = IMUtil.reDealMsg(message);
            IMChatting.markMsgRead(msg);
        }
    },
    //************************************历史记录******************************************
    /**
     * 获取本地某session的历史记录
     */
    getMessageList: function (msg, limit, endTime, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.getMessageList(msg, limit, endTime, onSuccess, onError);
        } else {
            //获取与某人的云端历史记录
            IMChatting.pullMessageList(msg, limit, endTime, function (error, obj) {
                if (!error) {
                    for (var i = 0; i < obj.msgs.length; i++) {
                        if (obj.msgs[i].type != 'custom') {
                            obj.msgs[i] = IMUtil.dealMsg(obj.msgs[i]);
                        } else {
                            obj.msgs[i] = IMUtil.dealCustomMsg(obj.msgs[i]);
                        }
                    }
                    onSuccess && onSuccess(obj.msgs);
                } else {
                    onError && onError(error);
                }
            });
        }
    },

    /**
     * 删除单条指定历史记录
     * @param msg
     * @param onSuccess
     * @param onError
     */
    deleteChattingHistory: function (msg, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.deleteChattingHistory(msg, onSuccess, onError);
        }
    },
    /**
     * 删除某人的指定历史记录
     * @param account
     * @param sessionType
     * @param onSuccess
     * @param onError
     */
    clearChattingHistory: function (account, sessionType, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.clearChattingHistory(account, sessionType, onSuccess, onError);
        }
    },
    clearMessageData: function (onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.clearMessageData(onSuccess, onError);
        }
    },
    //************************************群组相关接口******************************************
    /**
     * 获取我的所有群
     * @param onSuccess
     * @param onError
     */
    getAllMyTeams: function (onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.getAllMyTeams(onSuccess, onError);
        } else {
            IMChatting.getAllMyTeams(function (error, teams) {
                if (!error) {
                    for (var i = 0; i < teams.length; i++) {
                        teams[i] = IMUtil.dealGroup(teams[i]);
                    }
                    onSuccess && onSuccess(teams);
                } else {
                    onError && onError(error);
                }
            });
        }
    },
    /**
     * 根据群ID获取禁言群成员列表
     * @param teamId
     * @param onSuccess
     * @param onError
     */
    fetchTeamMutedMembers: function (teamId, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.fetchTeamMutedMembers(teamId, onSuccess, onError);
        } else {
            IMChatting.fetchTeamMutedMembers(teamId, function (error, obj) {
                if (!error) {
                    console.log('获取群禁言成员列表成功')
                    onSuccess && onSuccess(obj.members);
                } else {

                }
            });
        }
    },
    /**
     * 根据群ID获取群信息
     * @param teamId
     * @param onSuccess
     * @param onError
     */
    getTeamInfoByTeamId: function (teamId, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.getTeamInfoByTeamId(teamId, onSuccess, onError);
        } else {
            IMChatting.getTeamInfoByTeamId(teamId, function (error, info) {
                if (!error) {
                    var team = [];
                    team.push(info.teamId);
                    IMChatting.notifyForNewTeamMsg(team, function (error, teamMap) {
                        if (!error) {
                            if (teamMap[info.teamId]) {
                                info.messageNotifyType = 0;
                            } else {
                                info.messageNotifyType = 2;
                            }
                            onSuccess && onSuccess(info);
                        } else {
                            onError && onError(error);
                        }
                    });
                } else {
                    onError && onError(error);
                }
            });
        }
    },
    /**
     * 根据群ID获取群组成员
     * @param teamId
     * @param onSuccess
     * @param onError
     */
    fetchTeamMembers: function (teamId, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.fetchTeamMembers(teamId, onSuccess, onError);
        } else {
            IMChatting.fetchTeamMembers(teamId, function (error, obj) {
                if (!error) {
                    onSuccess && onSuccess(obj.members);
                } else {
                    onError && onError(error);
                }

            });
        }
    },
    /**
     * 根据teamIds查询是否需要群通知（仅H5）
     */
    notifyForNewTeamMsg: function (teamIds, onSuccess, onError) {
        IMChatting.notifyForNewTeamMsg(teamIds, function (error, map) {
            if (!error) {
                onSuccess && onSuccess(map);
            } else {
                onError && onError(error);
            }
        });
    },
    /**
     * 修改别人的群昵称
     * @param teamId
     * @param account
     * @param nickInTeam
     * @param onSuccess
     * @param onError
     */
    updateNickInTeam: function (teamId, account, nickInTeam, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.updateNickInTeam(teamId, account, nickInTeam, onSuccess, onError);
        } else {
            IMChatting.updateNickInTeam(teamId, account, nickInTeam, function (error, obj) {
                if (!error) {
                    onSuccess && onSuccess(obj);
                } else {
                    onError && onError(error);
                }
            });
        }
    },
    /**
     * 查询群成员具体资料
     * web端不支持该方式
     * @param teamId
     * @param account
     * @param onSuccess
     * @param onError
     */
    queryTeamMember: function (teamId, account, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.queryTeamMember(teamId, account, onSuccess, onError);
        }
    },
    //************************************系统通知相关接口******************************************
    /**
     * 标记系统消息为已读
     * @param sysMsg
     * @param onSuccess
     * @param onError
     */
    markSysMsgRead: function (sysMsg, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.markSysMsgRead(sysMsg, onSuccess, onError);
        } else {
            IMChatting.markSysMsgRead(sysMsg, function (error, obj) {
                if (!error) {
                    onSuccess && onSuccess(obj);
                } else {
                    onError && onError(error);
                }
            });
        }
    },
    /**
     * 获取本地系统通知
     * @param lastIdServer
     * @param limit
     * @param onSuccess
     * @param onError
     */
    getLocalSysMsgs: function (lastIdServer, limit, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.getLocalSysMsgs(lastIdServer, limit, onSuccess, onError);
        }
    },
    /**
     * 发送自定义的系统消息
     * @param sysCustomMsg
     * @param onSuccess
     * @param onError
     */
    sendCustomSysMsg: function (sysCustomMsg, onSuccess, onError) {
        if (msg.remoteExtension) {
            msg.remoteExtension.ver = IMChatting.currentVersion;
        } else {
            msg.remoteExtension = {
                ver: IMChatting.currentVersion
            }
        }

        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.sendCustomSysMsg(sysCustomMsg, onSuccess, onError);
        } else {
            msg.remoteExtension = JSON.stringify(msg.remoteExtension);
            IMChatting.sendCustomSysMsg(sysCustomMsg, function (error, message) {
                if (!error) {
                    message = IMUtil.dealMsg(message);
                    onSuccess && onSuccess(message);
                } else {
                    onError && onError(error);
                }
            });
        }
    },
    //************************************用户信息托管******************************************
    /**
     * 更新我的用户资料
     */
    updateMyInfo: function (info, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.updateMyInfo(info, onSuccess, onError);
        } else {
            if (info.gender) {
                switch (info.gender) {
                    case 0:
                        info.gender = 'unknown';
                        break;
                    case 1:
                        info.gender = 'male';
                        break;
                    case 2:
                        info.gender = 'female';
                        break;
                    default:
                        info.gender = 'unknown';
                        break;
                }
            }
            IMChatting.updateMyInfo(info, function (error, user) {
                if (!error) {
                    onSuccess(user);
                } else {
                    onError(error);
                }
            });
        }
    },
    /**
     * 获取单个用户信息
     */
    getUser: function (account, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.getUser(account, onSuccess, onError);
        } else {
            IMChatting.getUser(account, function (error, user) {
                if (!error) {
                    user = IMUtil.dealUser(user);
                    onSuccess(user);
                } else {
                    onError(error);
                }
            });
        }
    },
    /**
     * 获取多个用户信息
     */
    getUsers: function (accounts, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.getUsers(accounts, onSuccess, onError);
        } else {
            IMChatting.getUsers(accounts, function (error, users) {
                if (!error) {
                    for (var i = 0; i < users.length; i++) {
                        users[i] = IMUtil.dealUser(users[i]);
                    }
                    onSuccess(users);
                } else {
                    onError(error);
                }
            });
        }
    },
    //************************************消息已读回执******************************************    
    /**
     * 发送消息已读回执
     */
    sendMessageReceipt: function (message, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.sendMessageReceipt(message, onSuccess, onError);
        } else {
            IMChatting.sendMessageReceipt(message, function (error, obj) {
                if (!error) {
                    if (obj) {
                        console.log(JSON.stringify(obj));
                        onSuccess(obj);
                    }
                } else {
                    onError(error);
                }
            });
        }
    },
    /**
     * 查询某条消息是否已读
     * @param message onSuccess onError
     */
    isMsgRemoteRead: function (message, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {

        } else {
            IMChatting.isMsgRemoteRead(message, function (isRemoteRead) {
                if (isRemoteRead) {
                    onSuccess(isRemoteRead);
                } else {
                    onError(isRemoteRead);
                }
            });
        }
    },
    /**
     * 将图片消息保存到本地
     */
    downloadAttachment: function (message, onSuccess, onError) {
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.downloadAttachment(message, onSuccess, onError);
        }
    },
    /**
     * 将图片保存到本地url方法
     */
    saveImgToGallery:function(imgPath,onSuccess,onError){
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.saveImgToGallery(imgPath, onSuccess, onError);
        }
    },
    /**
     * 判断该手机是否需要角标
     */
    isBadgeCounterSupported:function(onSuccess,onError){
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.isBadgeCounterSupported(null, onSuccess, onError);
        }
    },
    /**
     * 设置角标
     */
    updateBadgerCount:function(unreadNum,onSuccess,onError){
        if (IMUtil.isDeviceAvailable()) {
            IMPlugin.updateBadgerCount(unreadNum, onSuccess, onError);
        }
    },
}