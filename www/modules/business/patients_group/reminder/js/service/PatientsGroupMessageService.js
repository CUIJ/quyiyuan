/**
 * 产品名称：quyiyuan
 * 创建者：李聪
 * 创建时间：2016年8月8日
 * 创建原因：病友圈消息中心服务层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.patients_group_message.service")
    .require([])
    .type("service")
    .name("PatientsGroupMessageService")
    .params([
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeEnv",
        "KyeeUtilsService",
        "MessageCenterService",
        "$rootScope",
        "HomeService",
        "OperationMonitor",
        "HospitalService"
    ])
    .action(function (HttpServiceBus,CacheServiceBus,KyeeEnv,KyeeUtilsService,MessageCenterService,$rootScope,HomeService,OperationMonitor,HospitalService) {

        var def = {

            storageCache: CacheServiceBus.getStorageCache(),
            memoryCache: CacheServiceBus.getMemoryCache(),
            // 禁言消息内容
            disableSendMsgParams: undefined,

            // 加载消息中心未读消息数量
            loadUnreadMessageNum: function(callback){

                var userRecord = def.memoryCache.get('currentUserRecord');
                var userId = userRecord.USER_ID;
                var customPatient = def.memoryCache.get('currentCustomPatient');
                if(customPatient){
                    var userVsId = customPatient.USER_VS_ID;
                }

                // 本地消息数据
                // READ_MESSAGE_DATA : 已读消息数据
                // UNREAD_MESSAGE_DATA : 未读消息数据
                // LAST_DATE : 本地消息最后更新时间
                // COMM_LAST_DATE : 公共消息的最后更新时间
                var localMessageData = MessageCenterService.getLocalMessage('LOCAL_MESSAGE');
                var lastDate = undefined;
                var commLastDate = undefined;
                if (localMessageData) {
                    //个人消息
                    if (localMessageData.LAST_DATE && userVsId) {
                        lastDate = localMessageData.LAST_DATE[userVsId];
                    } else {
                        lastDate = '';
                    }
                    //公共消息
                    if (localMessageData.COMM_LAST_DATE) {
                        commLastDate = localMessageData.COMM_LAST_DATE[userId];
                    } else {
                        commLastDate = '';
                    }
                } else {
                    lastDate = '';
                    commLastDate = '';
                }

                var appNum = 0;
                var patientsGroupNum = 0;
                var localNum = def.loadLocalUnreadMessageNum(userId, userVsId);
                $rootScope.unreadMessageCount = localNum;
             

                def.loadAppUnreadMessage(lastDate, commLastDate, function(data){
                    appNum = data;
                    $rootScope.unreadMessageCount = appNum + localNum;

                    def.loadPatientsGroupMsgNum(commLastDate, function(data){
                        patientsGroupNum = data;
                        $rootScope.unreadMessageCount = appNum + localNum + data;
                        if(callback){
                            callback();
                        }
                    });
                    //病友圈消息请求统计 add by wyn 20161110
                    OperationMonitor.record("msgMessageInfo","message->MAIN_TAB");
                });
            },

            // 加载本地未读消息数量
            loadLocalUnreadMessageNum: function(userId, userVsId){
                //筛选当前就诊者未读消息
                var localUnreadMessage = def.getLocalMessage('UNREAD_MESSAGE_DATA');
                localUnreadMessage = def.filterMessagesByUserVsId(userVsId, userId, localUnreadMessage);
                // 筛选当前就诊者欢迎消息
                var unreadWelcomeMessageNum = 0;
                var welcomeMessage = def.getLocalMessage('WELCOME_MESSAGE_DATA');
                if(welcomeMessage && welcomeMessage.length>0) {
                    welcomeMessage = def.filterMessagesByUserVsId(userVsId, userId, welcomeMessage);
                    angular.forEach(welcomeMessage, function(data){
                        if(data.READ_FLAG == 0) {
                            unreadWelcomeMessageNum++;
                        }
                    });
                }

                return localUnreadMessage.length + unreadWelcomeMessageNum;
            },

            // 加载APP云消息中心数量
            loadAppUnreadMessage: function(lastDate, commLastDate, callback){
                var unReadNum = 0;
                if( HospitalService.hosQueryNum = true){
                    HospitalService.hosQueryNum = false;
                    HttpServiceBus.connect({
                        url: "/messageCenter/action/MessageCenterActionC.jspx",
                        showLoading : false,
                        params: {
                            op: "queryMessageNum",
                            USER_LAST_DATE: commLastDate,
                            LAST_DATE: lastDate
                        },
                        cache: {
                            by: "TIME",
                            value: 30 * 60
                        },//半个小时
                        onSuccess: function (data) {
                            if (data.success) {
                                $rootScope.noticeNum = data.data.messageWindowNum;
                                unReadNum = parseInt(data.data.messageCenterNum);
                                callback(unReadNum);
                            }
                        },
                        onError: function () {
                            callback(unReadNum);
                        }
                    });
                }else{
                    HttpServiceBus.connect({
                        url: "/messageCenter/action/MessageCenterActionC.jspx",
                        showLoading : false,
                        params: {
                            op: "queryMessageNum",
                            USER_LAST_DATE: commLastDate,
                            LAST_DATE: lastDate
                        },
                        onSuccess: function (data) {
                            if (data.success) {
                                $rootScope.noticeNum = data.data.messageWindowNum;
                                unReadNum = parseInt(data.data.messageCenterNum);
                                callback(unReadNum);
                            }
                        },
                        onError: function () {
                            callback(unReadNum);
                        }
                    });
                }
            },

            // 加载病友圈消息中心数量
            loadPatientsGroupMsgNum: function(commLastDate, callback){
                HttpServiceBus.connect({
                    url: "third:messageController/getMessageNum",
                    showLoading : false,
                    params: {
                        "userLastDate": commLastDate
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            callback(data.data.MsgNum);
                        }
                    },
                    onError: function() {
                        callback(0);
                    }
                });
            },

            /**
             * 查询所有的消息
             */
            queryMessages: function (showLoadingFlag, onSuccess) {

                var userVsId = null;
                var currentCustomPatient = this.memoryCache.get('currentCustomPatient');
                if (currentCustomPatient && currentCustomPatient.USER_VS_ID){
                    userVsId = currentCustomPatient.USER_VS_ID;
                }
                var userId = this.memoryCache.get('currentUserRecord').USER_ID;

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
                    if (localMessageData.LAST_DATE && userVsId) {
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

                // 查询APP云的消息
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
                        if(resp.data && resp.data.rows && resp.data.rows.length>0) {
                            //合并服务器与本地消息并且更新时间
                            def.mergeMessages(resp.data.rows, userVsId, userId, 1);
                        }
                        // 获取病友圈消息
                        def.queryPatientsGroupMsg(showLoadingFlag,commLastDate, true, function(){
                            //设置全局未读消息个数
                            $rootScope.unreadMessageCount = def.loadLocalUnreadMessageNum(userId, userVsId);
                            var result = def.queryLocalMessage(userVsId, userId);
                            onSuccess(result);
                        });
                    },
                    onError: function(){
                        def.queryPatientsGroupMsg(showLoadingFlag,commLastDate, false,  function(){
                            //设置全局未读消息个数
                            $rootScope.unreadMessageCount = def.loadLocalUnreadMessageNum(userId, userVsId);
                            var result = def.queryLocalMessage(userVsId, userId);
                            onSuccess(result);
                        });
                    }
                });
            },

            /**
             * 查询病友圈消息
             */
            queryPatientsGroupMsg: function(showLoadingFlag,commLastDate, queryMsgSuccess, callback){
                var userVsId = this.memoryCache.get('currentCustomPatient').USER_VS_ID;
                var userId = this.memoryCache.get('currentUserRecord').USER_ID;
                HttpServiceBus.connect({
                    url: "third:messageController/getMessageList",
                    showLoading: showLoadingFlag,
                    params: {
                        "userLastDate": commLastDate
                    },
                    onSuccess: function(resp){
                        if (resp.data && resp.data.length) {
                            //合并服务器与本地消息并且更新时间
                            def.mergeMessages(resp.data, userVsId, userId, 2);
                        }
                        callback();
                    },
                    onError: function(){
                        if(queryMsgSuccess) {
                            callback();
                        }
                    }
                });
            },

            /**
             * 获取当前用户本地消息
             */
            queryLocalMessage: function(userVsId, userId){
                //筛选当前就诊者未读消息
                var localUnreadMessage = def.getLocalMessage('UNREAD_MESSAGE_DATA');
                localUnreadMessage = def.filterMessagesByUserVsId(userVsId, userId, localUnreadMessage);
                //筛选当前就诊者欢迎消息
                var welcomeMessage = def.getLocalMessage('WELCOME_MESSAGE_DATA');
                welcomeMessage = def.filterMessagesByUserVsId(userVsId, userId, welcomeMessage);

                // 欢迎消息7天内不能删除
                if(welcomeMessage.length > 0) {
                    for(var i = 0; i < welcomeMessage.length; i++) {
                        var createDate = KyeeUtilsService.DateUtils.parse(welcomeMessage[i].CREATE_DATE, "YYYY/MM/DD");
                        var now = KyeeUtilsService.DateUtils.getDate();
                        now = KyeeUtilsService.DateUtils.parse(now, "YYYY/MM/DD");

                        if ((now - createDate)/(24*60*60*1000) < 7) {
                            welcomeMessage[i].hideDelete = true;
                        }
                    }
                }

                //筛选当前就诊者已读消息
                var localReadMessage = def.getLocalMessage('READ_MESSAGE_DATA');
                localReadMessage = def.filterMessagesByUserVsId(userVsId, userId, localReadMessage);

                return welcomeMessage.concat(localUnreadMessage).concat(localReadMessage);
            },

            /**
             * 合并服务器和本地消息
             * params: msgSource   1 从app云获取的消息  2 从病友圈服务器获取的消息
             */
            mergeMessages: function (messages, userVsId, userId, msgSource) {
                var unreadMessage = [];
                var readMessage = [];
                var welcomeMessage = [];

                angular.forEach(messages, function (data) {
                    // 设置消息来源  1 app云  2 病友圈
                    data.MESSAGE_SOURCE = msgSource;

                    // app消息和病友圈消息日期格式不一致
                    if(msgSource == 2){
                        data.CREATE_DATE = KyeeUtilsService.DateUtils.formatFromString(data.CREATE_DATE, "YYYY/MM/DD HH:mm:ss", "YYYY-MM-DD HH:mm:ss")
                    }

                    // 筛选病友圈欢迎消息
                    if((msgSource == 1 && data.MESSAGE_TYPE == 14) || (msgSource == 2 && data.MESSAGE_TYPE == 1)){
                        welcomeMessage.push(data);
                    }

                    //筛选未读已读消息
                    else if (data.READ_FLAG == 0) {
                        unreadMessage.push(data);
                    } else if (data.READ_FLAG == 1) {
                        readMessage.push(data);
                    }
                });

                if(welcomeMessage.length > 0) {
                    this.mergeMessagesToCache('WELCOME_MESSAGE_DATA', welcomeMessage);
                }

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

                    if(msgSource != 2) {
                        // 普通消息的日期
                        for(var index = 0; index < messages.length; index ++){
	                        var messageType = messages[index].MESSAGE_TYPE;
                            if(messageType != '7' && messageType != '14' && messageType != '29' && messageType != '50' && messageType != '51' && messageType != '52' && messageType != '54'
                                && messageType != '55' && messageType != '56' && messageType != '57' && messageType != '66' && messageType != '67' ){
		                        lastDate[userVsId] = messages[index].CREATE_DATE;
		                        break;
	                        }
                        }
                    }

                    //公共消息只存入最大的日期
                    for(var index = 0; index < messages.length; index ++){
                        // 病友圈消息都是公共消息
                        var messageType = messages[index].MESSAGE_TYPE;

                        if(msgSource == 2 || messageType == '7' || messageType == '14'|| messageType == '29' || messageType == '50' || messageType == '51' || messageType == '52' || messageType == '54'
                           || messageType == '55' || messageType == '56' || messageType == '57'|| messageType == '66' || messageType == '67'){
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
                // 欢迎消息
                var welcomeMessage = this.getLocalMessage('WELCOME_MESSAGE_DATA');
                //合并
                localMessage_all.concat(localMessage_read).concat(welcomeMessage);

                //begin 合并并去除缓存与请求中重复的消息  By  章剑飞  KYEEAPPC-2965
                angular.forEach(messages, function (data) {
                    //遍历判断是否有重复消息
                    for (var i = 0; i < localMessage_all.length; i++) {
                        if (localMessage_all[i].MESSAGE_ID == data.MESSAGE_ID && localMessage_all[i].MESSAGE_SOURCE == data.MESSAGE_SOURCE) {
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
                    if ((data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '7')
                        ||(data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '14')
                        ||(data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '29')
                        || data.MESSAGE_SOURCE == 2) {
                        //公共消息不存在，则插入信息
                        comMessage.push(data);
                    } else {
                        personMessage.push(data);
                    }
                });

                // 去掉超出个数的公共消息  By  章剑飞  KYEEAPPC-2965
                if (comMessage.length > 40) {
                    comMessage.sort(function (a, b) {
                        return a.CREATE_DATE < b.CREATE_DATE ? 1 : -1;
                    });
                    comMessage.splice(40, comMessage.length - 40);
                }

                // 去掉超出个数的个人消息  By  章剑飞  KYEEAPPC-2965
                if (personMessage.length > 50) {
                    personMessage.sort(function (a, b) {
                        return a.CREATE_DATE < b.CREATE_DATE ? 1 : -1;
                    });
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
             * readFlag 0 未读消息  1 已读消息  2 欢迎消息
             */
            deleteMessage: function (messageSource, messageId, readFlag) {

                var key;
                if (readFlag == 0) {
                    key = 'UNREAD_MESSAGE_DATA';
                } else if (readFlag == 1) {
                    key = 'READ_MESSAGE_DATA';
                } else if (readFlag == 2) {
                    key = 'WELCOME_MESSAGE_DATA';
                }

                var localMessage = this.getLocalMessage(key);

                angular.forEach(localMessage, function (data, index) {
                    if (data.MESSAGE_ID == messageId && data.MESSAGE_SOURCE == messageSource) {
                        localMessage.splice(index, 1);
                    }
                });

                this.applyLocalMessage(key, localMessage);
            },

            /**
             * 更新消息已读未读状态
             */
            updateStatus: function (messageSource, messageId, readFlag) {

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
                    if (sourceMessage[index].MESSAGE_ID == messageId && sourceMessage[index].MESSAGE_SOURCE == messageSource) {
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
            },

            /**
             * 更新消息欢迎消息的已读未读状态
             */
            updateWelcomeMessageStatus: function(messageSource, messageId, readFlag){
                var localWelcomeMessage = this.getLocalMessage('WELCOME_MESSAGE_DATA');
                for (var index = 0; index < localWelcomeMessage.length; index++) {
                    if (localWelcomeMessage[index].MESSAGE_ID == messageId && localWelcomeMessage[index].MESSAGE_SOURCE == messageSource) {
                        localWelcomeMessage[index].READ_FLAG = readFlag;
                        break;
                    }
                }
                this.applyLocalMessage('WELCOME_MESSAGE_DATA', localWelcomeMessage);
            },

            /**
             * 获取消息缓存
             * return 消息数组
             */
            getLocalMessage: function (key) {
                var localMessage = this.storageCache.get('localMessageData');
                if (!localMessage) {
                    localMessage = {};
                    this.storageCache.set('localMessageData', localMessage);
                }
                var result = null;
                if ('UNREAD_MESSAGE_DATA' == key) {
                    result = localMessage.UNREAD_MESSAGE_DATA;
                } else if ('READ_MESSAGE_DATA' == key) {
                    result = localMessage.READ_MESSAGE_DATA;
                } else if ('WELCOME_MESSAGE_DATA' == key) {
                    result = localMessage.WELCOME_MESSAGE_DATA;
                } else {
                    result = localMessage;
                }
                return result ? result : [];
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
                    if ((userVsId && data.USER_VS_ID && data.USER_VS_ID != -1 && data.USER_VS_ID == userVsId )
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '7' && data.USER_ID == userId)
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '14' && data.USER_ID == userId)
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '29' && data.USER_ID == userId)
                        || (data.MESSAGE_SOURCE == 2 && data.USER_ID == userId)
	                    //药品推送的消息(MESSAGE_TYPE为50)以用户为单位，不以就诊者为单位 add by dangliming 2017年2月21日15:31:30
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '50' && data.USER_ID == userId)
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '51' && data.USER_ID == userId)
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '52' && data.USER_ID == userId)
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '54' && data.USER_ID == userId)
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '55' && data.USER_ID == userId)
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '56' && data.USER_ID == userId)
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '57' && data.USER_ID == userId)
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '66' && data.USER_ID == userId)
                        || (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == '67' && data.USER_ID == userId)
                    ) {
                        result.push(data);
                    }
                });
                return result;
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
