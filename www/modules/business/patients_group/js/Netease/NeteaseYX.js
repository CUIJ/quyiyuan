var YX = {
    data: {},
    nim: null,
    onlineMsg: {},
    sessions: {},
    supportDB: false,
    init: function (appKey, account, token) {
        var me = this;
        var cfg = {
            db: true,
            autoMarkRead: false,
            syncMsgReceipts: true,
            debug: false,
            syncRoamingMsgs: false,
            appKey: appKey,
            account: account,
            token: token,
            onconnect: YX.onConnect,
            onwillreconnect: YX.onWillReconnect,
            ondisconnect: YX.onDisconnect,
            onerror: YX.onError,
            onroamingmsgs: YX.onRoamingMsgs,
            onofflinemsgs: YX.onOfflineMsgs,
            onmsg: YX.onMsg,
            onsessions: YX.onSessions,
            onupdatesession: YX.onUpdateSession,
            onteams: YX.onTeams,
            onteammembers: YX.onTeamMembers,
            onsyncteammembersdone: YX.onSyncTeamMembersDone,
            onupdateteammember: YX.onUpdateTeamMember,
            onofflinesysmsgs: YX.onOfflineSysMsgs,
            onsysmsg: YX.onSysMsg,
            onupdatesysmsg: YX.onUpdateSysMsg,
            onsysmsgunread: YX.onSysMsgUnread,
            onupdatesysmsgunread: YX.onUpdateSysMsgUnread,
            onofflinecustomsysmsgs: YX.onOfflineCustomSysMsgs,
            oncustomsysmsg: YX.onCustomSysMsg,
            onbroadcastmsg: YX.onBroadcastMsg,
            onbroadcastmsgs: YX.onBroadcastMsgs,
            onloginportschange: YX.onLoginPortsChange,
            onsyncdone: YX.onSyncDone
        };
        YX.nim = NIM.getInstance(cfg);
        return YX.nim;
    },
    onSyncDone: function () {
        jsInterface.onSyncDone();
    },
    onLoginPortsChange: function (loginPorts) {
        for (var i = 0; i < loginPorts.length; i++) {
            jsInterface.onLoginPortsChange(loginPorts[i]);
        }
    },
    onConnect: function () {
        jsInterface.onConnectStateListener(6);
    },
    onWillReconnect: function (obj) {
        jsInterface.onConnectStateListener(3);
    },
    onDisconnect: function (error) {
        if (error) {
            switch (error.code) {
                // 账号或者密码错误, 请跳转到登录页面并提示错误
                case 302:
                    jsInterface.onConnectStateListener(11);
                    break;
                    // 重复登录, 已经在其它端登录了, 请跳转到登录页面并提示错误
                case 417:
                    jsInterface.onConnectStateListener(1);
                    break;
                    // 被踢, 请提示错误后跳转到登录页面
                case 'kicked':
                    jsInterface.onConnectStateListener(7);
                    break;
                default:
                    jsInterface.onConnectStateListener(1);
                    break;
            }
        }
    },
    onError: function (error) {},
    onRoamingMsgs: function (obj) {
        for (var i = 0; i < obj.msgs.length; i++) {
            if (obj.msgs[i].type != 'custom') {
                obj.msgs[i] = IMUtil.dealMsg(obj.msgs[i]);
            } else {
                obj.msgs[i] = IMUtil.dealCustomMsg(obj.msgs[i]);
            }
            jsInterface.receiveMsg(obj.msgs[i]);
        }
    },
    onOfflineMsgs: function (obj) {
        for (var i = 0; i < obj.msgs.length; i++) {
            if (obj.msgs[i].type != 'custom') {
                obj.msgs[i] = IMUtil.dealMsg(obj.msgs[i]);
            } else {
                obj.msgs[i] = IMUtil.dealCustomMsg(obj.msgs[i]);
            }
            jsInterface.receiveMsg(obj.msgs[i]);
        }
    },
    onMsg: function (msg) {
        if (msg.type != 'custom') {
            msg = IMUtil.dealMsg(msg);
        } else {
            msg = IMUtil.dealCustomMsg(msg);
        }
        jsInterface.receiveMsg(msg);
    },
    onCustomMsg: function (msg) {
        //处理自定义消息
    },
    onSysMsg: function (sysMsg) {
        sysMsg = IMUtil.dealSysNotice(sysMsg);
        jsInterface.receiveSysNotice(sysMsg);
    },
    onOfflineCustomSysMsgs: function (sysMsgs) {
        for (var i = 0; i < sysMsgs.length; i++) {
            jsInterface.receiveSysNotice(sysMsgs[i]);
        }
    },
    onCustomSysMsg: function (sysMsg) {
        jsInterface.receiveSysNotice(sysMsg);
    },
    onSessions: function (sessions) {

        for (var i = 0; i < sessions.length; i++) {
            sessions[i] = IMUtil.dealSession(sessions[i]);
            if (sessions[i].lastMsg) {
                if (sessions[i].lastMsg.type == 'custom') {
                    sessions[i].lastMsg = IMUtil.dealCustomMsg(sessions[i].lastMsg);
                } else {
                    sessions[i].lastMsg = IMUtil.dealMsg(sessions[i].lastMsg);
                }
            }
            if (sessions[i].msgReceiptTime) {
                arg = {
                    sessionId: sessions[i].id,
                    time: sessions[i].msgReceiptTime
                }
                jsInterface.messageReceiptsListener(arg);
            }
        }
        jsInterface.receiveSession(sessions);
    },
    onUpdateSession: function (session) {
        session = IMUtil.dealSession(session);
        if (session.lastMsg) {
            if (session.lastMsg.type == 'custom') {
                session.lastMsg = IMUtil.dealCustomMsg(session.lastMsg);
            } else {
                session.lastMsg = IMUtil.dealMsg(session.lastMsg);
            }
        }
        if (session.msgReceiptTime) {
            arg = {
                sessionId: session.id,
                time: session.msgReceiptTime
            }
            jsInterface.messageReceiptsListener(arg);
        }
        jsInterface.receiveSession([session]);
    },
    onBroadcastMsg: function (msg) {
        msg = IMUtil.dealMsg(msg);
        jsInterface.receiveBroadcastMsg(msg);
    },
    onBroadcastMsgs: function (msgs) {
        for (var i = 0; i < msgs.length; i++) {
            msg[i] = IMUtil.dealMsg(msg[i]);
            jsInterface.receiveBroadcastMsg(msg[i]);
        }
    },
    //*****************群组****************************************
    /**
     * 收到群组列表
     * @param teams
     */
    onTeams: function (teams) {
        YX.data.teams = YX.nim.mergeTeams(YX.data.teams, teams);
        YX.onInvalidTeams(teams.invalid);
        for (var i = 0; i < YX.data.teams.length; i++) {
            YX.data.teams[i] = IMUtil.dealGroup(YX.data.teams[i]);
        }
        jsInterface.receiveTeam(YX.data.teams);
    },
    /**
     * 保存无效的群组
     * @param teams
     */
    onInvalidTeams: function (teams) {
        YX.data.teams = YX.nim.cutTeams(YX.data.teams, teams);
        YX.data.invalidTeams = YX.nim.mergeTeams(YX.data.invalidTeams, teams);
    },
    onTeamMembers: function (obj) {
        var teamId = obj.teamId;
        var members = obj.members;
        YX.data.teamMembers = YX.data.teamMembers || {};
        YX.data.teamMembers[teamId] = YX.nim.mergeTeamMembers(YX.data.teamMembers[teamId], members);
        YX.data.teamMembers[teamId] = YX.nim.cutTeamMembers(YX.data.teamMembers[teamId], members.invalid);
    },
    onSyncTeamMembersDone: function () {},
    onUpdateTeamMember: function (teamMember) {
        YX.onTeamMembers({
            teamId: teamMember.teamId,
            members: teamMember
        });
    },
    onOfflineSysMsgs: function (sysMsgs) {
        for (var i = 0; i < sysMsgs.length; i++) {
            sysMsgs[i] = IMUtil.dealSysNotice(sysMsgs[i]);
            jsInterface.receiveSysNotice(sysMsgs[i]);
        }
        YX.pushSysMsgs(sysMsgs);
    },
    onUpdateSysMsg: function (sysMsg) {
        YX.pushSysMsgs(sysMsg);
    },
    pushSysMsgs: function (sysMsgs) {
        YX.data.sysMsgs = YX.nim.mergeSysMsgs(YX.data.sysMsgs, sysMsgs);
    },
    onSysMsgUnread: function (obj) {
        YX.data.sysMsgUnread = obj;
    },
    onUpdateSysMsgUnread: function (obj) {
        YX.data.sysMsgUnread = obj;
    },
    //***********************处理群消息通知****************************************
    onAddTeamMembers: function (team, accounts, members) {
        var teamId = team.teamId;
        /*
         * 如果是别人被拉进来了，那么拼接群成员列表
         * 如果是自己被拉进来了，那么同步一次群成员列表
         */
        if (accounts.indexOf(YX.data.account) === -1) {
            YX.onTeamMembers({
                teamId: teamId,
                members: members
            });
        } else {
            YX.nim.getTeamMembers({
                teamId: teamId,
                sync: true,
                done: function (error, obj) {
                    if (!error) {
                        YX.onTeamMembers(obj);
                    }
                }
            });
        }
        YX.onTeams(team);
    },
    onRemoveTeamMembers: function (team, teamId, accounts) {
        /**
         *  如果是别人被踢了，那么移除群成员
         *  如果是自己被踢了，那么离开该群
         */
        if (accounts.indexOf(YX.data.account) === -1) {
            if (team) {
                YX.onTeams(team);
            }
            YX.data.teamMembers[teamId] = YX.nim.cutTeamMembersByAccounts(YX.data.teamMembers[teamId], teamId, accounts);
        } else {
            YX.leaveTeam(teamId);
        }
    },
    updateTeamManagers: function (teamId, members) {
        YX.onTeamMembers({
            teamId: teamId,
            members: members
        });
    },
    leaveTeam: function (teamId) {
        YX.onInvalidTeams({
            teamId: teamId
        });
        YX.removeAllTeamMembers(teamId);
    },
    dismissTeam: function (teamId) {
        YX.onInvalidTeams({
            teamId: teamId
        });
        YX.removeAllTeamMembers(teamId);
    },
    removeAllTeamMembers: function (teamId) {
        delete YX.data.teamMembers[teamId];
    },
    transferTeam: function (team, members) {
        var teamId = team.teamId;
        YX.onTeamMembers({
            teamId: teamId,
            members: members
        });
        YX.onTeams(team);
    }
}