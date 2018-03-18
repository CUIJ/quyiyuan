var IMPlugin = {
    kick: function (deviceIds) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallback && onSuccessCallback(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'kick',
                'params': {
                    'deviceIds': deviceIds
                }
            }
        );
    },
    loginImDuration: 1000 * 30, //登录遮罩时延
    /**
     * 移动端登录云信
     */
    loginNIM: function (appKey, account, token, onSuccessCallback, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallback && onSuccessCallback(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'loginNIM',
                'params': {
                    'appKey': appKey,
                    'account': account,
                    'token': token
                }
            }
        );
    },
    /**
     * 移动端登出IM
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    logoutNIM: function (onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'logoutNIM'
            }
        );
    },
    /**
     * 发送文本消息
     */
    sendTextMessage: function (msg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'sendTextMessage',
                'params': msg
            }
        );
    },
    /**
     * 开始录音（发送语音消息）
     */
    startAudioRecording: function (msg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'startAudioRecording',
                'params': msg
            }
        );
    },
    /**
     * 停止录音
     */
    endAudioRecording: function (onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'endAudioRecording',
            });
    },
    /**
     * 取消录音
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    cancelAudioRecording: function (onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'cancelAudioRecording',
            });
    },
    /**
     * 开始播放录音
     * @param msg
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    playAudio: function (msg, type, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'playAudio',
                'params': {
                    'msg': msg,
                    'audioStreamType': type
                }
            }
        );
    },
    /**
     * 停止播放录音
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    stopPlayAudio: function (onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'stopPlayAudio',
            });
    },
    /**
     * 发送图片消息
     */
    sendImageMessage: function (msg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'sendImageMessage',
                'params': msg
            }
        );
    },
    /**
     * 发送语音消息
     */
    sendAudioMessage:function(msg, onSuccessCallBack, onErrorCallback){
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'sendAudioMessage',
                'params': msg
            }
        );
    },
    /**
     * 发送自定义消息
     */
    sendCustomMessage: function (msg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'sendCustomMessage',
                'params': msg
            }
        );
    },
    /**
     * 发送一条本地消息
     */
    saveMessageToLocal: function (msg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'saveMessageToLocal',
                'params': msg
            }
        );
    },
    /**
     * 保存一条本地提醒消息
     * @param scene
     * @param sessionId
     * @param content
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    saveTipMessageToLocal: function (scene, sessionId, content, time, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'saveTipMessageToLocal',
                'params': {
                    'scene': scene,
                    'sessionId': sessionId,
                    'content': content,
                    'time': time
                }
            }
        );
    },
    /**
     * 撤回消息
     */
    revokeMessage: function (msg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'revokeMessage',
                'params': msg
            }
        );
    },
    /**
     * 发送提醒消息
     */
    sendTipMessage: function (msg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'sendTipMessage',
                'params': msg
            }
        );
    },
    /**
     * 转发消息
     */
    createForwardMessage: function (msg, sessionId, sessionType, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'createForwardMessage',
                'params': {
                    'msg': msg,
                    'to': sessionId,
                    'scene': sessionType
                }
            }
        );
    },
    /**
     * 开始录音
     */
    startAudioRecording: function (msg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'startAudioRecording',
                'params': msg,
            }
        );
    },
    /**
     * 结束录音
     *                */
    endAudioRecording: function (onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'endAudioRecording',
            }
        );
    },
    /**
     * 停止播放语音消息
     */
    stopPlayAudio: function (onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'stopPlayAudio',
            }
        );
    },
    /**
     * 保存本地localExtension
     */
    updateMessageExt: function (msgId,localExtension,message,onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'updateMessageExt',
                'params':{
                    'msgId':msgId,
                    'localExtension':localExtension,
                    'message':message
                }
            }
        );
    },
    //************************************会话******************************************
    /**
     * 设置会话at
     */
    setRecentContactAited: function (params, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'setRecentContactAited',
                'params': params
            }
        )
    },
    /**
     * 清除会话at信息
     */
    clearRecentContactAited: function (sessionId, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'clearRecentContactAited',
                'params': {
                    'sessionId':sessionId
                }
            }
        )
    },
    /**
     * 插入一条本地会话
     */
    saveMessageToLocal: function (session, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'saveMessageToLocal',
                'params': session
            }
        )
    },
    /**
     * 获取会话未读数
     */
    getTotalUnreadCount: function (onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'getTotalUnreadCount',
            }
        );
    },
    /**
     * 进入聊天/会话列表页面
     */
    setChattingAccount: function (arg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'setChattingAccount',
                'params': arg
            }
        );
    },
    /**
     * 获取最近会话列表
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    queryRecentContacts: function (onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'queryRecentContacts',
            }
        );
    },
    /**
     * 将指定的会话未读数清零
     * @param sessionId
     * @param sessionType
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    clearUnreadCount: function (account, sessionType, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'clearUnreadCount',
                'params': {
                    'to': account,
                    'scene': sessionType
                }
            }
        );
    },
    /**
     * 删除指定的最近会话
     * @param account
     * @param sessionType
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    deleteRecentContact: function (to, scene, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {},
            function (result) {}, {
                'function': 'deleteRecentContact',
                'params': {
                    'to': to,
                    'scene': scene
                },
            }
        );
    },
    //************************************历史记录******************************************
    /**
     * 删除指定的历史聊天记录
     * @param msg
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    deleteChattingHistory: function (msg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'deleteChattingHistory',
                'params': msg
            }
        );
    },
    /**
     * 删除本地与某人的全部历史记录
     * @param account
     * @param sessionType
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    clearChattingHistory: function (account, sessionType, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'clearChattingHistory',
                'params': {
                    'account': account,
                    'scene': sessionType
                }
            }
        );
    },
    /**
     * 获取某session的历史记录
     */
    getMessageList: function (msg, limit, endTime, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'getMessageList',
                'params': {
                    'msg': msg,
                    'limit': limit,
                    'endTime': endTime
                }
            }
        );
    },
    /**
     * 获取云端某session的历史记录
     */
    pullMessageList: function (msg, limit, endTime, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'pullMessageList',
                'params': {
                    'msg': msg,
                    'limit': limit,
                    'endTime': endTime,
                }
            }
        );
    },
    /**
     * 清除用户的所有聊天记录
     */
    clearMessageData: function (onSuccessCallback, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'clearMessageData',
            }
        );
    },
    //************************************群组******************************************
    /**
     * 获取群成员禁言列表
     * @param teamId
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    fetchTeamMutedMembers: function (teamId, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'fetchTeamMutedMembers',
                'params': {
                    'teamId': teamId
                }
            }
        );
    },
    /**
     * 根据群组ID获取群组信息
     * @param teamId
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    getTeamInfoByTeamId: function (teamId, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'getTeamInfoByTeamId',
                'params': {
                    'teamId': teamId
                }
            }
        );
    },
    /**
     * 根据群 ID 和成员帐号获取群成员资料
     * @param teamId
     * @param account
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    queryTeamMember: function (teamId, account, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'queryTeamMember',
                'params': {
                    'teamId': teamId,
                    'account': account
                }
            }
        );
    },
    /**
     * 根据群组ID获取群成员列表
     * @param teamId
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    fetchTeamMembers: function (teamId, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'fetchTeamMembers',
                'params': {
                    'teamId': teamId
                }
            }
        );
    },
    /**
     * 获取我的所有群列表
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    getAllMyTeams: function (onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'getAllMyTeams',
            }
        );
    },
    /**
     * 根据群ID查询是否需要群通知
     * @param teamIds
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    notifyForNewTeamMsg: function (teamIds, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'notifyForNewTeamMsg',
                'params': {
                    'teamIds': teamIds
                }
            }
        );
    },
    /**
     * 修改别人的群昵称
     * 群主可以修改所有人的群昵称。
     * 管理员只能修改普通群成员的群昵称。
     * @param teamId
     * @param account
     * @param nickInTeam
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    updateNickInTeam: function (teamId, account, nickInTeam, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'updateNickInTeam',
                'params': {
                    'account': account,
                    'teamId': teamId,
                    'nickInTeam': nickInTeam, //昵称
                }
            }
        );
    },
    /**
     * 接受入群邀请
     * @param idServer
     * @param teamId
     * @param from
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    acceptTeamInvite: function (idServer, teamId, from, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'acceptTeamInvite',
                'params': {
                    'idServer': idServer,
                    'teamId': teamId,
                    'from': from //邀请方账号
                }
            }
        );
    },
    /**
     * 拒绝入群邀请
     * @param idServer
     * @param teamId
     * @param from
     * @param ps
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    rejectTeamInvite: function (idServer, teamId, from, ps, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'rejectTeamInvite',
                'params': {
                    'idServer': idServer,
                    'teamId': teamId,
                    'ps': ps, //附言
                    'from': from //邀请方账号
                }
            }
        );
    },
    /**
     * 通过入群申请
     * @param idServer
     * @param teamId
     * @param from
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    passTeamApply: function (idServer, teamId, from, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'passTeamApply',
                'params': {
                    'idServer': idServer,
                    'teamId': teamId,
                    'from': from //邀请方账号
                }
            }
        );

    },
    /**
     * 拒绝入群申请
     * @param idServer
     * @param teamId
     * @param from
     * @param ps
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    rejectTeamApply: function (idServer, teamId, from, ps, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'rejectTeamApply',
                'params': {
                    'idServer': idServer,
                    'teamId': teamId,
                    'ps': ps, //附言
                    'from': from //申请方账号
                }
            }
        );
    },
    /**
     * 查询群成员资料
     * web端SDK无此方法
     * @param teamId
     * @param account
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    queryTeamMember: function (teamId, account, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'queryTeamMember',
                'params': {
                    'account': account,
                    'teamId': teamId
                }
            }
        );
    },
    //************************************系统通知相关接口******************************************
    /**
     * 标记系统消息为已读
     * @param sysMsg
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    markSysMsgReadDone: function (sysMsg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'markSysMsgReadDone',
                'params': sysMsg
            }
        );
    },
    /**
     * 获取本地系统通知
     * @param lastIdServer 该值为-1时默认为首次
     * @param limit
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    getLocalSysMsgs: function (lastIdServer, limit, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'markSysMsgReadDone',
                'params': {
                    'lastIdServer': lastIdServer,
                    'limit': limit
                }
            }
        );
    },
    /**
     * 发送自定义系统消息
     * @param msg
     * @param onSuccessCallBack
     * @param onErrorCallback
     */
    sendCustomSysMsg: function (msg, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'sendCustomSysMsg',
                'params': msg
            }
        );
    },
    //**********************************用户信息托管**********************************************
    /**
     * 更新我的用户信息
     */
    updateMyInfo: function (info, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'updateMyInfo',
                'params': info
            }
        );
    },
    /**
     * 获取其他人的用户信息
     */
    getUser: function (account, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'getUser',
                'params': {
                    "account": account
                }
            }
        );
    },
    /**
     * 获取其他人（多人）的用户信息
     */
    getUsers: function (accounts, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'getUsers',
                'params': {
                    "accounts": accounts
                }
            }
        );
    },
    //**********************************消息已读回执**********************************************
    /**
     * 发送消息已读回执
     */
    sendMessageReceipt: function (message, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'sendMessageReceipt',
                'params': message
            }
        );
    },
    /**
     * 下载图片
     */
    downloadAttachment: function (message, onSuccessCallBack, onErrorCallback) {
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'downloadAttachment',
                'params': message
            }
        );
    },
    /**
     * 保存图片到本地
     */
    saveImgToGallery:function(imgPath,onSuccessCallBack,onErrorCallback){
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'saveImgToGallery',
                'params': {
                    'imgUrl':imgPath
                }
            }
        );
    },
    /**
     * 判断该手机是否需要设置角标
     * onSuccessCallBack[0,1]
     */
    isBadgeCounterSupported:function(params,onSuccessCallback,onErrorCallback){
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'isBadgeCounterSupported',
                'params':params
            }
        );
    },
    /**
     * 设置角标
     */
    updateBadgerCount:function(unreadNum,onSuccessCallback,onErrorCallback){
        navigator.NeteaseIMPlugin.imMethod(
            function (result) {
                onSuccessCallBack && onSuccessCallBack(result);
            },
            function (result) {
                onErrorCallback && onErrorCallback(result);
            }, {
                'function': 'updateBadgerCount',
                'params':{
                    'unreadNum':unreadNum
                }
            }
        );
    }
}