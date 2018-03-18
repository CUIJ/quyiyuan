/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间： 2016/7/22
 * 创建原因：消息tab界面
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.message.service")
    .require([
        "kyee.quyiyuan.patients_group.conversation.service",
        "kyee.quyiyuan.patients_group.group_details.service",
        "kyee.quyiyuan.patients_group.personal_chat.service",
        "kyee.quyiyuan.imUtil.service"
    ])
    .type("service")
    .name("MessageService")
    .params([
        "$state",
        "KyeeMessageService",
        "ConversationService",
        "CacheServiceBus",
        "HttpServiceBus",
        "GroupDetailsService",
        "PersonalChatService",
        "$ionicViewSwitcher",
        "IMUtilService",
        "KyeeI18nService",
        "$ionicViewSwitcher"
    ])
    .action(function ($state, KyeeMessageService, ConversationService,
        CacheServiceBus, HttpServiceBus, GroupDetailsService, PersonalChatService, 
        $ionicViewSwitcher, IMUtilService,KyeeI18nService,$ionicViewSwitcher) {
        var def = {
            menuTabFlag: 0, //选项卡选中状态,默认为会话列表
            groupListAttr: [], //该用户所在的所有群组属性列表
            storageCache: CacheServiceBus.getStorageCache(),
            atList:[],
            lastMsg:{},
            lastReadtime:"",
            /**
             *获取该用户信息
             * @param callBack
             */
            getLoginUserInfo: function (callBack) {
                HttpServiceBus.connect({
                    url: 'third:userManage/user/accountinfo/get',
                    showLoading: false,
                    params: {},
                    onSuccess: function (retVal) {
                        if (retVal.success) {
                            callBack(retVal.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: retVal.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },
            /**
             * 进入对应消息窗口 addBy lwj 2016/7/29
             * @param sessionItem
             */
            goMessageWin: function (sessionItem) {
                var userRole = -1;
                if(sessionItem.id.indexOf('qypa') > -1){
                    userRole = 1;
                }else if(sessionItem.id.indexOf('qydr') > -1){
                    userRole = 2;
                }
                PersonalChatService.receiverInfo = {
                    yxUser: sessionItem.id,
                    userId: sessionItem.id.substring(4),
                    userPhoto:sessionItem.sessionIcon,
                    userPetname:sessionItem.petname,
                    userRole:userRole
                };
                $ionicViewSwitcher.nextDirection("forwoard");
                $state.go('personal_chat');
            },
            /**
             * 置顶消息并更新数据库 addBy lwj 2016/7/29
             */
            changeStickStatus: function (sessionItem, index) {
                var tmpStickTime = new Date().getTime();
                var stick = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.STICK) || {};
                if (0 == sessionItem.stickStatus) { //设置置顶
                    sessionItem.stickStatus = 1;
                    sessionItem.stickTime = tmpStickTime;
                    stick[sessionItem.sessionId] = index; //存储置顶session原位置
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.STICK, stick);
                } else { //取消置顶
                    sessionItem.stickStatus = 0;
                    sessionItem.stickTime = -1; //默认显示时间
                    stick[sessionItem.sessionId] = null; //清空置顶session原位置
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.STICK, stick);
                }
            },
            /**
             * 获取用户信息通过用户Id sessionId addBy lwj 2016/8/1
             * @param sessionId
             * @param callback
             */
            getUserInfoById: function (sessionId, callback) {

            },

            /**
             * 获取用户信息通过用户Id sessionId addBy lwj 2016/8/1
             * @param sessionId
             * @param callback
             */
            getGroupInfoByGroupId: function (sessionId, callback) {

            },

            /**
             * 获取群详情
             */
            getGroupInfo: function (groupId, callback) {
                GroupDetailsService.queryGroupInfo(groupId, function (data) {
                    callback && callback(data);
                });
            },

            /**
             * 获取所在群组的相关属性
             * @param callback
             */
            getGroupAtrrInfo: function (callback) {
                GroupDetailsService.getGroupAtrrInfo(function (data) {
                    callback && callback(data);
                });
            },
            /**
             * 获取session列表数据
             * @param sessionIds
             * @param callback
             */
            getUsersInfo: function (sessionIds,curTalkIndex,callback, error) {
                HttpServiceBus.connect({
                    url: 'third:userManage/getUsersYxInfo',
                    showLoading: false,
                    params: {
                        yxUsersArray: sessionIds
                    },
                    onSuccess: function (retVal) {
                        if (retVal.success) {
                            callback(retVal.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: retVal.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    },
                    onError: function () {
                        error();
                    }

                });
            },
            /**
             * 获取session列表数据
             * @param sessionIds
             * @param callback
             */
            getGroupsInfo: function (sessionIds,yxUser,callback, error) {
                HttpServiceBus.connect({
                    url: 'third:group_manage/group/getYxGroupsInfo',
                    showLoading: false,
                    params: {
                        yxGroupIds: sessionIds,
                        yxUser:yxUser
                    },
                    onSuccess: function (retVal) {
                        if (retVal.success) {
                            callback(retVal.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: retVal.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    },
                    onError: function () {
                       
                    }

                });
            }
        };
        return def;
    })
    .build();