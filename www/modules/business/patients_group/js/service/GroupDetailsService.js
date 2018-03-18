/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间：2016/7/27
 * 创建原因：群组详情界面开发 KYEESUPPORT-47
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.group_details.service")
    .require([
        "kyee.framework.service.message",
    ])
    .type("service")
    .name("GroupDetailsService")
    .params([
        "$state",
        "HttpServiceBus",
        "KyeeMessageService",
        "KyeeUtilsService",
        "KyeeI18nService",
        "CacheServiceBus"
    ])
    .action(function($state,HttpServiceBus,KyeeMessageService,KyeeUtilsService,
                     KyeeI18nService,CacheServiceBus){

        var def = {
            groupId: "",//群组ID
            preGroupId:"",//来自群聊天的群组Id
            groupCard: "",//用户群名片
            group: null,
            backHistory:'',
            groupName:"",//群组名称
            memberCount:"",//群组成员数量

            /**
             * 查询群组详情信息
             * @param groupId
             * @param callBack
             * modify by wyn 20170117 增加请求进度条
             */
            queryGroupInfo: function(groupId, callBack,onError){
                HttpServiceBus.connect({
                    url: "third:groupmanage/groupinfo",
                    params: {
                       groupId: groupId,
                       opVersion: AppConfig.VERSION
                    },
                    showLoading:false,
                    onSuccess: function (data) {
                        if (data.success) {
                            callBack(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    },
                    onError:function(){
                        onError&&onError();
                    }
                });
            },

            /**
             * 切换群组通知状态
             * @param groupId
             * @param isNotice
             * @param callBack
             */
            doSwitchNoticeStatus: function(params,callBack){
                HttpServiceBus.connect({
                    url: "third:groupmanage/isNotice",
                    params: {
                        "tid":params.tid,
                        "accid":params.accid,
                        "owner":params.owner,
                        "ope":params.ope
                    },
                    onSuccess: function(data){
                        if(data.success){
                            callBack && callBack(true);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                            callBack && callBack(false);
                        }
                    }
                });
            },

            /**
             * 清除当前群组聊天记录
             * @param groupId
             * @param callBack
             */
            clearCurGroupData: function(groupId){
                //YX 删除指定会话
                var storageCache = CacheServiceBus.getStorageCache();
                var recommendGroup = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.RECOMMEND_GROUP) || {};
                recommendGroup[groupId] = null;
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.RECOMMEND_GROUP,recommendGroup);
                //清除群公告
                var groupAnnouncement = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.GROUP_ANNOUNCEMENT) || {};
                groupAnnouncement[groupId] = "";
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.GROUP_ANNOUNCEMENT,groupAnnouncement);
            },

            /**
             * 退出群组
             * @param groupId
             * @param callBack
             */
            doQuitGroup: function(groupId, yxUser,callBack){
                HttpServiceBus.connect({
                    url: "third:groupmanage/removeFromGroup",
                    params: {
                        "groupId": groupId,
                        "yxUser":yxUser
                    },
                    onSuccess: function(data){
                        if (data.success){
                            callBack();
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
             * 申请加入群组
             * @param groupId
             * @param callback
             */
            doApplyJoinGroup: function(param,callback){
                var params = {
                    yxUser:param.yxUser,
                    tid:param.tid,
                    owner:param.owner
                };
                HttpServiceBus.connect({
                    url: 'third:group_manage/group/joinGroupYx',
                    params: params,
                    onSuccess: function (retVal) {
                        if (retVal) {
                            var success = retVal.success;
                            var message = retVal.message;
                            if (success) {
                                callback && callback(retVal.data);
                            }else{
                                KyeeMessageService.broadcast({
                                    content: message || KyeeI18nService.get("commonText.networkErrorMsg", message),
                                    duration: 2000
                                });
                            }
                        }
                    }
                });
            },

            /**
             * 修改群名片
             * @param groupCard
             * @param callBack
             */
            saveGroupCard: function(params,success,error){
                HttpServiceBus.connect({
                    url: "third:groupmanage/updateUserGroupPetname",
                    params: {
                        groupId: params.groupId,
                        owner:params.owner,
                        userGroupPetname: params.nick
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            success(data);
                        } else {
                            error(data);
                        }
                    }
                });
            },

            /**
             * 获取所在群组的相关属性
             * @param callBack
             */
            getGroupAtrrInfo: function(callBack){
                HttpServiceBus.connect({
                    url: 'third:groupmanage/groupProperties',
                    showLoading: false,
                    params: {},
                    onSuccess: function (retVal) {
                        if (retVal.success) {
                            var groupList = retVal.data.GroupList ? retVal.data.GroupList: [];
                            callBack && callBack(groupList);
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
             * 查询群组详情信息
             * @param groupId
             * @param callBack
             * added by zhangyi at 20161130 for KYEEAPPC-8902 [KYEEAPPC-8285 病友圈三期]
             */
            queryGroupMember: function(groupId, callBack){
                HttpServiceBus.connect({
                    url: "third:groupmanage/groupMember",
                    params: {
                        groupId: groupId
                    },
                    showLoading: true,
                    onSuccess: function (data) {
                        if (data.success) {
                            callBack(data.data);
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
             * 获取群的历史公告
             * addBy liwenjuan 2017/06/22
             */
            getAnnouncementList: function(callback){
                HttpServiceBus.connect({
                    url: "third:groupmanage/declared/query",
                    params:{
                        groupId: def.groupId
                    },
                    showLoading: true,
                    onSuccess: function(data){
                        if (data.success) {
                            callback && callback(data.data.declaredList);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();