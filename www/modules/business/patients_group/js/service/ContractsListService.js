/**
 * 产品名称：quyiyuan
 * 创建者：licong
 * 创建时间： 2016/7/28
 * 创建原因：联系人服务层
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.contracts_list.service")
    .require([
    ])
    .type("service")
    .name("ContractsListService")
    .params([
        "HttpServiceBus",
        "KyeeMessageService",
        "KyeeI18nService",
        "CacheServiceBus"
    ])
    .action(function(HttpServiceBus,KyeeMessageService,KyeeI18nService,CacheServiceBus){
        var def = {
            storageCache: CacheServiceBus.getStorageCache(),
            queryFriendKeywords : undefined, // 搜索好友关键字

            /**
             * 搜索病友圈用户
             * @param keywords
             * @param callback
             */
            queryFriends: function(keywords, callback){
                HttpServiceBus.connect({
                    url: "third:userManage/user/accountinfo/search",
                    showLoading: false,
                    params: {
                        text: keywords
                    },
                    onSuccess: function(data){
                        if(data.success){
                            callback && callback(def.formatSearchResult(data.data.userList, keywords));
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
             * 格式化搜索好友的结果
             * @param data
             * @param keyWords
             * @returns {*}
             */
            formatSearchResult: function(data, keyWords){
                if (1 == data.length && data[0].userPhone == keyWords) {// 手机号精确搜索
                    // data[0].showText = data[0].userPetname;
                    if (data[0].remark) {
                        data[0].showText = '<div class="line20 mar-t-5">' + data[0].remark + '</div><div class="line20 mar-d-5 color_9 f12">昵称: ' + data[0].userPetname + '</div>';
                    } else {
                        data[0].showText = data[0].userPetname;
                    }
                    return data;
                } else { // 昵称搜索
                    for(var i=0; i<data.length; i++) {
                        if(data[i].remark){ //如有备注，则分两行显示备注和昵称，不高亮 add by dangliming 20170224
                            data[i].showText = '<div class="line20 mar-t-5">' + data[i].remark + '</div><div class="line20 mar-d-5 color_9 f12">昵称: ' + data[i].userPetname + "</div>";
                        } else {
                            data[i].showText = data[i].userPetname.replace(new RegExp(keyWords,"g"),'<font class="qy-green">'+keyWords+'</font>');
                        }
                    }
                    return data;
                }
            },

            /**
             * 获取用户的联系人列表
             * 后台返回的联系人列表按userName,或fullUpperSpell排序
             * @param callback
             */
            getContactData: function(callback){
                HttpServiceBus.connect({
                    url: "third:userAtten/getUserAtten",
                    showLoading: false,
                    onSuccess: function (retVal) {
                        if (retVal) {
                            var success = retVal.success;
                            var message = retVal.message;
                            if (success) {
                                var contactsList = retVal.data;
                                callback && callback(contactsList);
                            }else{
                                KyeeMessageService.broadcast({
                                    content: message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                    duration: 2000
                                });
                            }
                        }
                    }
                });
            },

            /**
             * 处理后台返回的联系人列表数据
             * @param dataTable
             * @returns {Array}
             */
            dealContactData: function(dataTable){
                var letters = [],//获取字母数组
                    resultMap = {},//获取字母对应的联系人
                    lastGroup = []; //#号下的好友数组
                for (var i = 0; i < dataTable.length; i++) {
                    if (resultMap[dataTable[i].petNameFPY] == undefined) {
                        var list = [dataTable[i]];
                        if(dataTable[i].petNameFPY == "#"){
                            lastGroup.push(dataTable[i]);
                        } else {
                            resultMap[dataTable[i].petNameFPY] = list;
                            letters.push(dataTable[i].petNameFPY);
                            letters = letters.sort();
                        }
                    } else {
                        resultMap[dataTable[i].petNameFPY].push(dataTable[i]);
                    }
                }
                var data = [];//组装后的数据
                for(var j=0; j<letters.length; j++){
                    var dataMap = {};
                    dataMap["group"] = letters[j];
                    dataMap["users"] = resultMap[letters[j]];
                    data.push(dataMap);
                }
                // petNameFPY 为#的联系人排在后面
                if(lastGroup.length>0){
                    var lastDataMap = {};
                    lastDataMap["group"] = "#";
                    lastDataMap["users"] = lastGroup;
                    data.push(lastDataMap);
                }
                return data;
            },

            /**
             * 获取用户的新朋友列表
             * @param callback
             */
            getNewFriendsData: function(callback){
                HttpServiceBus.connect({
                    url: "third:userAtten/getUserNewFriend",
                    onSuccess: function(data) {
                        if (data.success) {
                            callback && callback(data.data);
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
             * 加好友
             * @param friendId
             * @param scope
             * @param callback
             */
            addFriendDialog: function(friendId, scope, callback){
                var userPetname = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO).userPetname;
                scope.remarksObj = {
                    remarkTitle:"请填写验证信息:",
                    remarkValue:"我是"+ userPetname
                };
                scope.dialog = KyeeMessageService.dialog({
                    tapBgToClose : true,
                    template: "modules/business/patients_group/views/modify_remarks.html",
                    scope: scope,
                    title: KyeeI18nService.get("group_members.Title", "好友验证"),
                    buttons: [
                        {
                            text: KyeeI18nService.get("group_members.send", "发送"),
                            style: 'button-size-l',
                            click: function () {
                                var params = {
                                    "friendId":friendId,
                                    "message":scope.remarksObj.remarkValue
                                };
                                //添加好友申请内容可以为空
                                if(scope.remarksObj.remarkValue){
                                    var regx = /^[\u4E00-\u9FA5A-Za-z 0-9]+$/;
                                    if(!regx.test(scope.remarksObj.remarkValue)){
                                        KyeeMessageService.broadcast({
                                            content: KyeeI18nService.get("contracts_list.invaildContent","请勿输入中文、英文、数字和空格之外的内容！")
                                        });
                                        return;
                                    }
                                }

                                def.addFriend(params,function(data){
                                    callback(data);
                                });
                                scope.dialog.close();
                            }
                        }
                    ]
                });
            },

            /**
             * 添加好友 addBy lwj 2016/8/2
             * @param params
             * @param callback
             */
            addFriend: function(params,callback){
                HttpServiceBus.connect({
                    url: "third:userManage/user/accountinfo/addfriend",
                    params: params,
                    onSuccess: function(data){
                        if(data.success){
                            callback(data);
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
             * 处理添加好友请求 1 同意加好友， 2 拒绝加好友
             * @param friendId
             * @param flag
             * @param callback
             */
            handleFriendRequest: function(friendId, flag, callback){
                HttpServiceBus.connect({
                    url: "third:userManage/user/accountinfo/handlerAdd",
                    params: {
                        "friendId": friendId,
                        "flag": flag
                    },
                    onSuccess: function(data){
                        if(data.success){
                            callback && callback();
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
             * 删除好友
             * @param friendId
             * @param callback
             */
            deleteFriend: function(friendId, callback){
                HttpServiceBus.connect({
                    url: "third:userAtten/deleteFriend",
                    params: {"friendId": friendId},
                    onSuccess: function(data){
                        if(data.success){
                            callback();
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