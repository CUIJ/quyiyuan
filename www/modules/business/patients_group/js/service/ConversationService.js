/**
 * Created by lwj on 2016/7/27.
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.conversation.service")
    .require([
        "kyee.quyiyuan.emoji.service",
        'kyee.framework.service.broadcast3',
        "kyee.quyiyuan.patients_group.group_details.service"
    ])
    .type("service")
    .name("ConversationService")
    .params([
        "$state",
        "HttpServiceBus",
        "CacheServiceBus",
        "EmojiService",
        "KyeeBroadcastService",
        "KyeeMessageService",
        "KyeeI18nService",
        "$ionicViewSwitcher",
        "KyeeUtilsService",
        "GroupDetailsService"
    ])
    .action(function ($state, HttpServiceBus, CacheServiceBus, EmojiService, KyeeBroadcastService,
        KyeeMessageService, KyeeI18nService,
        $ionicViewSwitcher, KyeeUtilsService, GroupDetailsService) {
        var def = {
            pullMessageList: true,
            sessionId: "",
            atViewOpenFlag: false, //at成员界面是否打开，防止点击一次二次打开
            doctorList: [], //对应群组医生成员列表
            patientList: [], //对应群组患者成员列表
            storageCache: CacheServiceBus.getStorageCache(),
            groupInfo: {}, //群组信息
            curMessageList: [], //当前聊天界面最新10条消息
            groupMembers: [],
            isUpdateMembers: false,

            /**
             * 发送者信息
             * @returns {Object}
             */
            senderInfo: function () {
                var rlLoginInfo = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO) || {};
                var userActInfo = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO) || {};
                var userId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
                return angular.extend({
                    "userId": userId
                }, rlLoginInfo, userActInfo);
            },
            /**
             * 进入群聊界面
             * mofidy by wyn 20161010:增加判断用户昵称是否修改功能
             * isRealName值为0：不是真实姓名 |（userStatus值为0）用户身份为游客时 不需要修改;
             * isRealName值为1代表是真实姓名 需要修改
             * modify by wyn 20161118 任务号：KYEEAPPC-8729：去除游客角色
             */
            goConversation: function (groupId, scope) {
                GroupDetailsService.queryGroupInfo(groupId, function (data) {
                    if(!data.tid){
                        KyeeMessageService.broadcast({
                           content: '该群组已解散',
                           duration: 3000
                        });
                        return;
                    }
                    def.groupInfo = data;
                    def.groupMembers = data.members; //edited by zhangyi at 20161124 for KYEEAPPC-8731 控制页面跳转方向
                    def.goGroupChat();
                }, function () {
                    // KyeeMessageService.broadcast({
                    //     content: '请检测您的网络状态是否正常',
                    //     duration: 3000
                    // });
                    // def.goGroupChat();
                });

            },
            /**
             * 显示修改昵称弹出面板
             * add by wyn 20161010
             */
            showModifyNickNamePanel: function (groupInfo, scope) {
                var userNickName = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO).userPetname;
                scope.nickNameObj = {
                    showTips: false,
                    validTips: "",
                    remarkTitle: "为保护个人隐私，建议您使用自定义昵称！",
                    remarkValue: userNickName
                };
                scope.dialog = KyeeMessageService.dialog({
                    tapBgToClose: true,
                    template: "modules/business/patients_group/views/modify_nickName.html",
                    scope: scope,
                    title: KyeeI18nService.get("group_members.Title", "请修改或确认您的昵称"),
                    buttons: [{
                        text: KyeeI18nService.get("group_members.send", "确定"),
                        style: 'button-size-l',
                        click: function () {
                            if (def.isNickNameValid(scope.nickNameObj)) {
                                def.callModifyNickName(groupInfo, scope);
                            }
                        }
                    }]
                });
            },

            /**
             * 校验通过，调用修改昵称方法
             * @param groupInfo
             * @param scope
             */
            callModifyNickName: function (groupInfo, scope) {
                var params = {
                    "newPetname": scope.nickNameObj.remarkValue
                };
                def.modifyNickName(params, function (callback) {
                    var imUserInfo = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO);
                    imUserInfo.userPetname = scope.nickNameObj.remarkValue;
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO, imUserInfo);
                    groupInfo.userGroupPetname = scope.nickNameObj.remarkValue;
                    //$state.go('conversation');
                    def.goGroupChat();
                    scope.dialog.close();
                });
            },

            /**
             * 校验用户昵称
             * 不能为空、输入内容校验、不能重复
             */
            isNickNameValid: function (nickNameObj) {
                if (nickNameObj.remarkValue) {
                    var regx = /^[\u4E00-\u9FA5A-Za-z 0-9]+$/;
                    if (!regx.test(nickNameObj.remarkValue)) {
                        nickNameObj.showTips = true;
                        nickNameObj.validTips = "请勿输入中文、英文、数字和空格之外的内容！";
                        return false;
                    } else {
                        nickNameObj.showTips = false;
                        nickNameObj.validTips = "";
                        return true;
                    }
                } else {
                    nickNameObj.showTips = true;
                    nickNameObj.validTips = "昵称不能为空！";
                    return false;
                }
            },

            /**
             * add by wyn 20161010
             * 修改用户昵称，成功则进入聊天界面
             */
            modifyNickName: function (params, callback) {
                HttpServiceBus.connect({
                    url: 'third:groupmanage/updateUserGroupPetnameAll',
                    showLoading: false,
                    params: params,
                    onSuccess: function (data) {
                        if (data.success) {
                            callback && callback(true);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },

            /**
             * 跳转到群组聊天界面时查询最后10条数据
             * addBy liwenjuan 2016/12/09 倒叙从0开始查询10条数据
             */
            goGroupChat: function () {
                //YX 跳转至群聊界面
                $ionicViewSwitcher.nextDirection("forwoard");
                $state.go('conversation');
            },
            deteleSessionByTId: function (groupId) {
                var session = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
                for (var i = 0; i < session.length; i++) {
                    if (session[i].id == groupId) {
                        for (var j = i; j < session.length - 1; j++) {
                            session[j] = session[j + 1];
                        }
                        session.pop();
                        CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST, session);
                    }
                }
                KyeeBroadcastService.doSend('SESSION_LIST', session);                
                IMDispatch.deleteRecentContact(groupId, 1);
            },
            /**
             * 更新缓存中的群成员信息
             */
            getGroupMembersInfo: function (tid) {
                def.isUpdateMembers = true;
                GroupDetailsService.queryGroupInfo(tid, function (data) {
                    if (data.members) {
                        groupMembers = {};
                        for (var i = 0; i < data.members.length; i++) {
                            groupMembers[data.members[i].accid] = data.members[i];
                        }
                        sessionStorage.setItem(tid, JSON.stringify(groupMembers));
                    }
                });
            }
        };
        return def;
    })
    .build();