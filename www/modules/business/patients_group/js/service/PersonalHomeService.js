/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间： 2016/7/22
 * 创建原因：病友个人详情服务层
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.personal_home.service")
    .require([
        "kyee.framework.service.message",
    ])
    .type("service")
    .name("PersonalHomeService")
    .params(["HttpServiceBus", "KyeeMessageService","KyeeI18nService"])
    .action(function(HttpServiceBus, KyeeMessageService,KyeeI18nService){
        var def = {
            userInfo: {
                userId: undefined,
                personalInfo: null, //个人信息
                fromGroupId: undefined,  // 群成员列表进入详情页需记录群组id
                isMyFriend: false
            },

            // 根据userId获取用户信息,与当前用户是否为好友
            getUserInfoByUserId: function(id, getData) {
                HttpServiceBus.connect({
                    url: "third:userManage/user/accountinfo/single",
                    params: {"userId": id},
                    onSuccess: function(data){
                        if(data.success) {
                            getData(data.data.userInfo);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },
            // 判断当前用户是否已经加入群组
            isInGroup: function(groupId, getData){
                HttpServiceBus.connect({
                    url: "third:groupmanage/isInGroup",
                    params: {"groupId": groupId},
                    onSuccess: function(data) {
                        if (data.success) {
                            getData(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },

            // 获取共同群组
            getCommonGroups: function(userId, getData){
                HttpServiceBus.connect({
                    url: "third:groupmanage/commonGroups",
                    showLoading: false,
                    params: {
                        otherId: userId
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData(data.data);
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