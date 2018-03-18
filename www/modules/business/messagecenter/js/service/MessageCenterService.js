/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：消息中心主页面服务
 *
 * 修改人：姚斌
 * 修改时间：2015年7月14日19:52:59
 * 任务号：KYEEAPPTEST-2354
 * 修改原因：消息本地缓存
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.messageCenter.service")
    .require([])
    .type("service")
    .name("MessageCenterService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeEnv", "KyeeUtilsService", "KyeeMessageService"])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeEnv, KyeeUtilsService, KyeeMessageService) {

        var def = {

            storageCache: CacheServiceBus.getStorageCache(),
            memoryCache: CacheServiceBus.getMemoryCache(),

            /**
             * 查询所有的消息
             */
            queryMessages: function (showLoadingFlag, readFlag, onSuccess) {

                var userVsId = this.memoryCache.get('currentCustomPatient').USER_VS_ID;
                var userId = this.memoryCache.get('currentUserRecord').USER_ID;

                // 读取已读消息
                if (readFlag == 1) {
                    var localMessage = this.storageCache.get('localMessageData').READ_MESSAGE_DATA;
                    localMessage = def.filterMessagesByUserVsId(userVsId, userId, localMessage);
                    onSuccess(localMessage);

                    return;
                }

                // 本地消息数据
                // READ_MESSAGE_DATA : 已读消息数据
                // UNREAD_MESSAGE_DATA : 未读消息数据
                // LAST_DATE : 本地消息最后更新时间
                // COMM_LAST_DATE : 公共消息的最后更新时间
                var localMessageData = this.getLocalMessage('LOCAL_MESSAGE');
                var lastDate = undefined;
                var commLastDate = undefined;
                if (localMessageData) {
                    //个人消息
                    if (localMessageData.LAST_DATE) {
                        lastDate = localMessageData.LAST_DATE[userVsId];
                    } else {
                        lastDate = '';
                    }
                    //公共消息  By  章剑飞  KYEEAPPC-2965
                    if (localMessageData.COMM_LAST_DATE) {
                        commLastDate = localMessageData.COMM_LAST_DATE[userId];
                    } else {
                        commLastDate = '';
                    }
                } else {
                    lastDate = '';
                    commLastDate = '';
                }

                HttpServiceBus.connect({
                    url: "/messageCenter/action/MessageCenterActionC.jspx",
                    showLoading: showLoadingFlag,
                    params: {
                        op: "queryMessagesList",
                        USER_LAST_DATE: commLastDate,
                        LAST_DATE: lastDate,
                        USER_ID: userId,
                        USER_VS_ID: userVsId
                    },
                    onSuccess: function (resp) {
                        var result = undefined;
                        if (!resp.data || !resp.data.rows || !resp.data.rows.length) {
                            result = def.getLocalMessage('UNREAD_MESSAGE_DATA')
                        } else {
                            //合并服务器与本地消息并且更新时间
                            result = def.mergeMessages(resp.data.rows, userVsId, userId);
                        }

                        //筛选当前就诊者数据
                        result = def.filterMessagesByUserVsId(userVsId, userId, result);
                        onSuccess(result);
                    }
                });
            },

            /**
             * 合并服务器和本地消息
             */
            mergeMessages: function (messages, userVsId, userId) {
                var unreadMessage = [];
                var readMessage = [];

                //筛选未读已读消息
                angular.forEach(messages, function (data) {
                    if (data.READ_FLAG == 0) {
                        unreadMessage.push(data);
                    } else if (data.READ_FLAG == 1) {
                        readMessage.push(data);
                    }
                });

                // 存入缓存
                var localMessage = this.mergeMessagesToCache('UNREAD_MESSAGE_DATA', unreadMessage);
                this.mergeMessagesToCache('READ_MESSAGE_DATA', readMessage);

                // 更新最后查询时间
                if (messages && messages.length > 0) {
                    var localMessageData = this.getLocalMessage('LOCAL_MESSAGE');
                    //普通消息
                    var lastDate = localMessageData.LAST_DATE;
                    //公共消息
                    var commLastDate = localMessageData.COMM_LAST_DATE;
                    if (!lastDate) {
                        lastDate = {};
                    }
                    if (!commLastDate) {
                        commLastDate = {};
                    }

                    // 普通消息的日期
                    for(var index = 0; index < messages.length; index ++){
	                    var messageType = messages[index].MESSAGE_TYPE;
	                    if(messageType != '7' && messageType != '14' && messageType != '29' && messageType != '50' && messageType != '51' && messageType != '52'  && messageType != '54'){
		                    lastDate[userVsId] = messages[index].CREATE_DATE;
		                    break;
	                    }
                    }

                    //公共消息只存入最大的日期
                    for(var index = 0; index < messages.length; index ++){
	                    var messageType = messages[index].MESSAGE_TYPE;
                        if(messageType == '7' || messageType == '14'|| messageType == '29' || messageType == '50' || messageType == '51' || messageType == '52' || messageType == '54'){
                            commLastDate[userId] = messages[index].CREATE_DATE;
                            break;
                        }
                    }

                    this.applyLocalMessage('LAST_DATE', lastDate);
                    //存入公共消息  By  章剑飞  KYEEAPPC-2965
                    this.applyLocalMessage('COMM_LAST_DATE', commLastDate);
                }

                return localMessage;
            },

            /**
             * 合并未读/已读消息到缓存消息
             * @param messages
             * @param key
             * @returns {*}
             */
            mergeMessagesToCache: function (key, messages) {
                var localMessage = this.getLocalMessage(key);
                // 未读
                var localMessage_all = this.getLocalMessage('UNREAD_MESSAGE_DATA');
                //已读
                var localMessage_read = this.getLocalMessage('READ_MESSAGE_DATA');
                //合并
                localMessage_all.concat(localMessage_read);

                //begin 合并并去除缓存与请求中重复的消息  By  章剑飞  KYEEAPPC-2965
                angular.forEach(messages, function (data) {
                    //遍历判断是否有重复消息
                    for (var i = 0; i < localMessage_all.length; i++) {
                        if (localMessage_all[i].MESSAGE_ID == data.MESSAGE_ID) {
                            //有重复消息则跳出循环
                            break;
                        }
                    }
                    //遍历完成后无重复消息
                    if (i == localMessage_all.length) {
                        localMessage.push(data);
                    }
                });
                //end 合并并去除缓存与请求中重复的消息  By  章剑飞  KYEEAPPC-2965

                //公共消息
                var comMessage = [];
                //个人消息
                var personMessage = [];
                //从缓存中剥离公共消息和个人消息  By  章剑飞  KYEEAPPC-2965
                angular.forEach(localMessage, function (data) {
                    if (data.MESSAGE_TYPE == '7' || data.MESSAGE_TYPE == '14' || data.MESSAGE_TYPE == '29') {
                        //公共消息不存在，则插入信息
                        comMessage.push(data);
                    } else {
                        personMessage.push(data);
                    }
                });
                // 去掉超出个数的公共消息  By  章剑飞  KYEEAPPC-2965
                if (comMessage.length > 20) {
                    comMessage.splice(20, comMessage.length - 10);
                }
                // 去掉超出个数的个人消息  By  章剑飞  KYEEAPPC-2965
                if (personMessage.length > 50) {
                    personMessage.splice(50, personMessage.length - 50);
                }
                //合并消息存入缓存  By  章剑飞  KYEEAPPC-2965
                localMessage = comMessage.concat(personMessage);
                //排序
                localMessage.sort(function (a, b) {
                    return a.CREATE_DATE < b.CREATE_DATE ? 1 : -1;
                });
                // 存入缓存
                this.applyLocalMessage(key, localMessage);

                return localMessage;
            },

            /**
             * 删除消息
             */
            deleteMessage: function (messageId, readFlag) {
                if (readFlag == 0) {
                    var key = 'UNREAD_MESSAGE_DATA';
                } else {
                    var key = 'READ_MESSAGE_DATA';
                }
                var localMessage = this.getLocalMessage(key);

                angular.forEach(localMessage, function (data, index, arrays) {
                    if (data.MESSAGE_ID == messageId) {
                        localMessage.splice(index, 1);
                    }
                });
                this.applyLocalMessage(key, localMessage);
                //从表中删除数据
                HttpServiceBus.connect({
                    url: "/messageCenter/action/MessageCenterActionC.jspx",
                    params: {
                        op: "deleteMessageById",
                        MESSAGE_ID: messageId
                    },onSuccess:function(resp){

                },onError:function(errResp){
                    }
                });

            },

            /**
             * 更新消息已读未读状态
             */
            updateStatus: function (messageId, readFlag) {
                var localUnreadMessage = this.getLocalMessage('UNREAD_MESSAGE_DATA');
                var localReadMessage = this.getLocalMessage('READ_MESSAGE_DATA');
                if (readFlag == 0) {
                    var desMessage = localUnreadMessage;
                    var sourceMessage = localReadMessage;
                } else {
                    var desMessage = localReadMessage;
                    var sourceMessage = localUnreadMessage;
                }
                for (var index = 0; index < sourceMessage.length; index++) {
                    if (sourceMessage[index].MESSAGE_ID == messageId) {
                        var message = sourceMessage[index];
                        sourceMessage.splice(index, 1);
                        message.READ_FLAG = readFlag;
                        break;
                    }
                }

                if (desMessage.length < 50) {
                    desMessage.push(message);
                } else {
                    desMessage = desMessage.slice(0, 49);
                    desMessage.push(message);
                }

                desMessage.sort(function (a, b) {
                    return a.CREATE_DATE < b.CREATE_DATE ? 1 : -1;
                });

                if (readFlag == 0) {
                    this.applyLocalMessage('UNREAD_MESSAGE_DATA', desMessage);
                    this.applyLocalMessage('READ_MESSAGE_DATA', sourceMessage);
                } else {
                    this.applyLocalMessage('UNREAD_MESSAGE_DATA', sourceMessage);
                    this.applyLocalMessage('READ_MESSAGE_DATA', desMessage);
                }
                //修改消息表中的读状态 wenpengkun
                HttpServiceBus.connect({
                    url: "/messageCenter/action/MessageCenterActionC.jspx",
                    params: {
                        op: "updateMessageReadStatus",
                        MESSAGE_ID: messageId,
                        READ_FLAG: readFlag
                    },onSuccess:function(resp){

                    },onError:function(errResp){
                    }

                });

            },

            /**
             * 获取消息缓存
             */
            getLocalMessage: function (key) {
                var localMessage = this.storageCache.get('localMessageData');

                if (!localMessage) {
                    localMessage = {};
                    this.storageCache.set('localMessageData', localMessage);
                }

                if (key == 'UNREAD_MESSAGE_DATA') {
                    var result = localMessage.UNREAD_MESSAGE_DATA;
                } else if (key == 'READ_MESSAGE_DATA') {
                    var result = localMessage.READ_MESSAGE_DATA;
                } else {
                    var result = localMessage;
                }

                if (!result) {
                    result = [];
                }

                return result;
            },

            /**
             * 更新消息缓存
             */
            applyLocalMessage: function (key, value) {
                this.storageCache.apply('localMessageData',
                    key, value);
            },

            /**
             * 筛选当前就诊者的消息
             */
            filterMessagesByUserVsId: function (userVsId, userId, messages) {
                var result = [];
                angular.forEach(messages, function (data) {
                    //添加本用户的公共消息提取  By  章剑飞  KYEEAPPC-2965
                    if ((userVsId && data.USER_VS_ID && data.USER_VS_ID == userVsId)
                        || (data.MESSAGE_TYPE == '7' && data.USER_ID == userId)
                        || (data.MESSAGE_TYPE == '14' && data.USER_ID == userId)
                        || (data.MESSAGE_TYPE == '29' && data.USER_ID == userId)
                        //药品推送的消息(MESSAGE_TYPE为50)以用户为单位，不以就诊者为单位 add by dangliming 2017年2月21日15:31:30
                        || (data.MESSAGE_TYPE == '50' && data.USER_ID == userId)
                        || (data.MESSAGE_TYPE == '51' && data.USER_ID == userId)
                        || (data.MESSAGE_TYPE == '52' && data.USER_ID == userId)
                        || (data.MESSAGE_TYPE == '54' && data.USER_ID == userId)
                    ) {
                        result.push(data);
                    }
                });

                return result;
            },

            /**
             * 更新当前就诊者的未读消息个数
             */
            updateUnreadMessageCount: function () {

                //添加延迟
                KyeeUtilsService.delay({
                    time: 3000,
                    action: function () {

                        if (def.memoryCache.get('currentCustomPatient')) {
                            def.queryMessages(false, 0, function (result) {
                                KyeeEnv.ROOT_SCOPE.unreadMessageCount = result.length;
                            });
                        }
                    }
                });
            },
            /**
             * 获取html代码
             * @param messageId
             * @param onSuccess
             */
            getHtml: function (messageId, onSuccess) {

                HttpServiceBus.connect({
                    url: "/messageCenter/action/MessageCenterActionC.jspx",
                    params: {
                        op: "queryHtmlMessageById",
                        MESSAGE_ID: messageId
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
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
