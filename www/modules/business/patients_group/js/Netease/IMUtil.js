var IMUtil = {
    browser: {
        versions: function () {
            var u = navigator.userAgent,
                app = navigator.appVersion;
            return {
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
                iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
                weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
                qq: u.match(/\sQQ/i) == " qq" //是否QQ
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase
    },

    isDeviceAvailable: function () {
        return window.device && (window.device.platform == "Android" || window.device.platform == "iOS");
    },
    dealMsg: function (msg) {
        var message = {};
        message.type = msg.type;
        message.fromNick = msg.fromNick;
        message.from = msg.from;
        message.id = msg.idClient;
        message.fromClientType = msg.fromClientType;
        message.to = msg.to;
        message.status = msg.status;
        message.time = msg.time;
        message.idServer = msg.idServer;
        message.resend = msg.resend;
        message.pushPayload = msg.pushPayload;
        message.pushContent = msg.pushContent;
        message.needPushNick = msg.needPushNick;
        message.apns = msg.apns;
        if (msg.scene && msg.scene == 'team') {
            message.scene = 1;
        } else if (msg.scene == 'p2p') {
            message.scene = 0;
        }
        switch (msg.flow) {
            case 'in':
                message.flow = 1;
                break;
            case 'out':
                message.flow = 0;
                break;
        }
        switch (msg.fromClientType) {
            case 'Android':
                message.fromClientType = 1;
                break;
            case 'iOS':
                message.fromClientType = 2;
                break;
            case 'MAC':
                message.fromClientType = 64;
                break;
            case 'REST':
                message.fromClientType = 32;
                break;
            case 'UNKNOW':
                message.fromClientType = 0;
                break;
            case 'Web':
                message.fromClientType = 16;
                break;
            case 'Windows':
                message.fromClientType = 4;
                break;
            case 'WP':
                message.fromClientType = 8;
                break;
            default:
                break;
        }
        message.customMessageConfig = {
            isHistoryable: msg.isHistoryable,
            isRoamingable: msg.isRoamingable,
            isSyncable: msg.isSyncable,
            isPushable: msg.isPushable,
            isUnreadable: msg.isUnreadable,
            isLocal: msg.isLocal,
            isOfflinable: msg.isOfflinable
        };
        if (msg.type == 'image' || msg.type == 'audio' || msg.type == 'file') {
            message.attach = msg.file;
            if (msg.file) {
                message.attach.filePath = msg.file.url;
            }
            if (msg.type == 'audio') {
                message.remark = '网页版暂不支持语音消息，请下载趣医院APP查看';
                message.content = '[语音]';
            }
        } else if (msg.type == 'geo') {
            message.attach = msg.geo;
        } else if (msg.type == 'notification') {
            message.attach = msg.attach;
        }
        //remoteExtension 自定义消息的自定义内容
        if (msg.type == 'tip') {
            message.content = msg.tip;
        }
        if (msg.custom == "" || msg.custom == undefined) {
            message.remoteExtension = "{}";
        } else if (msg.custom != undefined && msg.custom != null && msg.custom != {}) {
                message.remoteExtension = eval('(' + msg.custom + ')');
        }
        if(message.type == 'notification'){
            message.remoteExtension = {
                ver:IMChatting.currentVersion
            }
        }
        if (msg.type == 'text') {
            message.content = msg.text;
        } else if (msg.type == 'custom') {
            message.content = msg.content;
            if (typeof msg.content == 'string') {
                message.attach = eval('(' + msg.content + ')');
            }
        }
        if (msg.sessionId != undefined) {
            message.sessionId = msg.sessionId.substring(msg.sessionId.indexOf('-') + 1, msg.sessionId.length);
        }
        if (msg.type == 'notification') {
            message = IMUtil.dealNotification(message);
        }
        return message;
    },
    dealNotification: function (msg) {
        //若仅存在一个成员时将其转化成数组的形式
        if (msg.attach.account) {
            msg.attach.accounts = [];
            msg.attach.accounts.push(msg.attach.account);
        }else if(!msg.attach.accounts && msg.attach.users){
            msg.attach.accounts = [];
            for(var i = 0;i < msg.attach.users.length;i++){
                msg.attach.accounts.push(msg.attach.users[i].account);
            }
        }

        switch (msg.attach.type) {
            case 'addTeamMembers':
                msg.attach.type = 0;
                break;
            case 'removeTeamMembers':
                msg.attach.type = 1;
                break;
            case 'leaveTeam':
                msg.attach.type = 2;
                break;
            case 'updateTeam':
                msg.attach.type = 3;
                break;
            case 'dismissTeam':
                msg.attach.type = 4;
                break;
            case 'passTeamApply':
                msg.attach.type = 5;
                break;
            case 'transferTeam':
                msg.attach.type = 6;
                break;
            case 'addTeamManagers':
                msg.attach.type = 7;
                break;
            case 'removeTeamManagers':
                msg.attach.type = 8;
                break;
            case 'acceptTeamInvite':
                msg.attach.type = 9;
                break;
            case 'updateTeamMute':
                msg.attach.type = 10;
                break;
        }
        return msg;
    },
    reDealMsg: function (msg) {
        var message = {};
        message.type = msg.type;
        message.fromNick = msg.fromNick;
        message.from = msg.from;
        message.idClient = msg.id;
        message.fromClientType = msg.fromClientType;
        message.to = msg.to;
        message.status = msg.status;
        message.time = msg.time;
        message.idServer = msg.idServer;
        message.resend = msg.resend;
        message.pushPayload = msg.pushPayload;
        message.pushContent = msg.pushContent;
        message.needPushNick = msg.needPushNick;
        message.apns = msg.apns;
        message.target = msg.sessionId;
        if (msg.flow == 0) {
            message.flow = 'out';
        } else if (msg.flow == 1) {
            message.flow = 'in';
        }
        if (msg.customMessageConfig) {
            message.isHistoryable = msg.customMessageConfig.isHistoryable;
            message.isRoamingable = msg.customMessageConfig.isRoamingable;
            message.isSyncable = msg.customMessageConfig.isSyncable;
            message.isPushable = msg.customMessageConfig.isPushable;
            message.isUnreadable = msg.customMessageConfig.isUnreadable;
            message.isLocal = msg.customMessageConfig.isLocal;
            message.isOfflinable = msg.customMessageConfig.isOfflinable;
        }
        if (msg.type == 'tip') {
            message.tip = msg.content;
        } else {
            message.custom = msg.remoteExtension;
        }
        if (msg.type == 'text') {
            message.text = msg.content;
        }
        if (msg.type == 'image' || msg.type == 'audio' || msg.type == 'file') {
            msg.file = msg.attach;
        } else if (msg.type == 'geo') {
            message.geo = msg.attach;
        }
        if (msg.scene == 0) {
            message.scene = 'p2p';
        } else if (msg.scene == 1) {
            message.scene = 'team';
        }
        message.sessionId = message.scene + '-' + msg.sessionId;
        return message;
    },
    dealSession: function (session) {
        var newSession = {};
        newSession.lastMsg = session.lastMsg;
        newSession.msgReceiptTime = session.msgReceiptTime;
        newSession.lastMsgTime = session.updateTime;
        if (session.scene == 'p2p') {
            newSession.scene = 0;
        } else if (session.scene == 'team') {
            newSession.scene = 1;
        }
        newSession.id = session.id.substring(session.id.indexOf('-') + 1, session.id.length);
        newSession.unreadCount = session.unread;
        return newSession;
    },
    dealGroup: function (team) {
        var newTeam = {};
        newTeam.teamId = team.teamId;
        newTeam.name = team.name;
        newTeam.avatar = team.avatar;
        newTeam.announcement = team.announcement;
        newTeam.intro = team.intro;
        newTeam.owner = team.owner;
        newTeam.isMyTeam = team.valid && team.validToCurrentUser;
        newTeam.extension = team.serverCustom;
        newTeam.mute = team.mute;
        newTeam.extension = team.serverCustom;
        switch (team.joinMode) {
            case 'noVerify':
                newTeam.joinMode = 0;
                break;
            case 'needVerify':
                newTeam.joinMode = 1;
                break;
            case 'rejectAll':
                newTeam.joinMode = 1;
                break;
        }
        //被邀请入群模式
        switch (team.beInviteMode) {
            case 'needVerify':
                newTeam.beInviteMode = 0;
                break;
            case 'noVerify':
                newTeam.beInviteMode = 1;
                break;
        }
        //群邀请模式
        switch (team.inviteMode) {
            case 'manager':
                newTeam.inviteMode = 0;
                break;
            case 'all':
                newTeam.inviteMode = 1;
                break;
        }
        //群信息的修改权限
        switch (team.updateTeamMode) {
            case 'manager':
                newTeam.updateTeamMode = 0;
                break;
            case 'all':
                newTeam.updateTeamMode = 1;
                break;
        }
        //群自定义消息的修改权限
        switch (team.updateCustomMode) {
            case 'manager':
                newTeam.updateCustomMode = 0;
                break;
            case 'all':
                newTeam.updateCustomMode = 1;
                break;
        }
        return newTeam;
    },
    dealUser: function (user) {
        var newUser = {
            account: user.account,
            nick: user.nick,
            avatar: user.avatar,
            custom: user.custom
        };
        if (user.gender == 'male') {
            newUser.gender = 1;
        } else if (user.gender == 'female') {
            newUser.gender = 2;
        } else {
            newUser.gender = 0;
        }
        return newUser;
    },
    dealSysNotice: function (msg) {
        var sysNotice = {};
        sysNotice.time = msg.time;
        sysNotice.id = msg.idServer;
        sysNotice.read = msg.read;
        sysNotice.content = msg.ps;
        sysNotice.from = msg.from;
        sysNotice.to = msg.to;
        switch (msg.type) {
            case 'applyTeam':
                sysNotice.type = 0;
                break;
            case 'rejectTeamApply':
                sysNotice.type = 1;
                break;
            case 'teamInvite':
                sysNotice.type = 2;
                break;
            case 'rejectTeamInvite':
                sysNotice.type = 3;
                break;
            case 'addFriend':
                sysNotice.type = 6;
                break;
            case 'applyFriend':
                sysNotice.type = 7;
                break;
            case 'passFriendApply':
                sysNotice.type = 8;
                break;
            case 'rejectFriendApply':
                sysNotice.type = 9;
                break;
            case 'deleteMsg':
                msg = IMUtil.dealMsg(msg.msg);
                jsInterface.revokeListener(msg);
                break;
            default:
                break;
        }
        switch (msg.state) {
            case 'init':
                sysNotice.status = 0;
                break;
            case 'passed':
                sysNotice.status = 1;
                break;
            case 'rejected':
                sysNotice.status = 2;
                break;
        }
        if (msg.attach) {
            sysNotice.attach = msg.attach;
        }
        return sysNotice;
    },
    dealCustomMsg: function (msg) {
        var message = {};
        message.type = msg.type;
        message.fromNick = msg.fromNick;
        message.from = msg.from;
        message.id = msg.idClient;
        message.fromClientType = msg.fromClientType;
        message.to = msg.to;
        message.status = msg.status;
        message.time = msg.time;
        message.idServer = msg.idServer;
        message.resend = msg.resend;
        message.pushPayload = msg.pushPayload;
        message.pushContent = msg.pushContent;
        message.needPushNick = msg.needPushNick;
        message.apns = msg.apns;
        if (msg.sessionId != undefined) {
            message.sessionId = msg.sessionId.substring(msg.sessionId.indexOf('-') + 1, msg.sessionId.length);
        }
        if(msg.content && typeof msg.content == 'string'){
            msg.content = JSON.parse(msg.content);
        }
        message.attach = msg.content;
        message.resend = msg.resend;
        message.remoteExtension = eval('(' + msg.custom + ')');;
        if (msg.scene == 'p2p') {
            message.scene = 0;
        } else {
            message.scene = 1;
        }
        switch (msg.flow) {
            case 'in':
                message.flow = 1;
                break;
            case 'out':
                message.flow = 0;
                break;
        }
        switch (msg.fromClientType) {
            case 'Android':
                message.fromClientType = 1;
                break;
            case 'iOS':
                message.fromClientType = 2;
                break;
            case 'MAC':
                message.fromClientType = 64;
                break;
            case 'REST':
                message.fromClientType = 32;
                break;
            case 'UNKNOW':
                message.fromClientType = 0;
                break;
            case 'Web':
                message.fromClientType = 16;
                break;
            case 'Windows':
                message.fromClientType = 4;
                break;
            case 'WP':
                message.fromClientType = 8;
                break;
            default:
                break;
        }
        message.customMessageConfig = {
            isHistoryable: msg.isHistoryable,
            isRoamingable: msg.isRoamingable,
            isSyncable: msg.isSyncable,
            isPushable: msg.isPushable,
            isUnreadable: msg.isUnreadable,
            isLocal: msg.isLocal,
            isOfflinable: msg.isOfflinable
        };
        return message;
    }
}