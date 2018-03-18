/**
 * Created by lwj on 2016/7/27.
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.personal_chat.service")
    .require([
        "kyee.quyiyuan.emoji.service",
        'kyee.framework.service.broadcast3',
    ])
    .type("service")
    .name("PersonalChatService")
    .params([
        "$state",
        "HttpServiceBus",
        "CacheServiceBus",
        "EmojiService",
        "KyeeBroadcastService",
        "KyeeMessageService",
        "KyeeI18nService",
        "KyeeUtilsService",
        "$ionicViewSwitcher"
    ])
    .action(function ($state, HttpServiceBus, CacheServiceBus, EmojiService, KyeeBroadcastService,
        KyeeMessageService, KyeeI18nService,
        KyeeUtilsService,$ionicViewSwitcher) {
        var def = {
            //接受者信息
            receiverInfo: {},
            pullMessageList: true,
            storageCache: CacheServiceBus.getStorageCache(),
            curMessageList: [], //初始化进入聊天界面显示消息记录最后10条数据
            scRecordId: -1, //add by zhangyi on 20170106 任务ID
            scMsgType: -1, // add by zhangyi on 20170106 自定义消息类型

            //从医生付费咨询跳转过来需要的参数
            //consultParam若有值，是个对象，有以下字段: visitName, sex, age, diseaseName, diseaseDesc, scRecordId, scMsgType, consultType
            consultParam: null, //从医生接诊/订单详情页面 跳转至和医生聊天页面时需缓存的数据(用于患者向医生发送卡片消息)
            consultParamList: {}, //此对象key-value取值为: key取值是scConsultId+"", value取值是{sendTimes,visitName, sex, age, diseaseName, diseaseDesc, scRecordId, scMsgType, consultType}

            getRlUser: function (rlUser) {
                return rlUser.slice(rlUser.indexOf("#") + 1);
            },
            /**
             * 发送者信息
             * @returns {Object}
             */
            senderInfo: function () {
                var self = this,
                    storage = self.storageCache,
                    rlLoginInfo = storage.get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO) || {},
                    userActInfo = storage.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO) || {},
                    userId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
                return angular.extend({
                    "userId": userId
                }, rlLoginInfo, userActInfo);
            },
            /**
             *  跳转到个人聊天界面时查询最后10条数据
             */
            goPersonalChat: function () {
                $ionicViewSwitcher.nextDirection("forwoard");
                $state.go("personal_chat");
            },
            /**
             * [getIsChatOpen 获取能否和医生聊天参数]
             * @param  {[object]} param   [description]
             * @param  {[function]} success [description]
             * @param  {[function]} error   [description]
             * @return {[type]}         [description]
             */
            getIsChatOpen: function (param, success, error) {
                var self = this;
                HttpServiceBus.connect({
                    url: "third:pay_consult/order/config/load",
                    showLoading: true,
                    params: { //此接口还需要USER_ID,但是框架层会传
                        scConsultId: param.scConsultId || self.scRecordId, //可以不传
                        // rlUser: param.rlUser              //医生容联账号
                        yxUser: param.yxUser //医生的云信账号
                    },
                    onSuccess: function (response) {
                        typeof success === 'function' && success(response);
                    },
                    onError: function (error) {
                        typeof error === 'function' && error(error);
                    }
                });
            },

            /**
             * 患者和医生图文咨询完成后 向后台发送的请求
             * @param param [Object：
             *                  scConsultId - 订单记录主键ID
             *                  orderState - 订单状态:9:咨询超时后完成 5：患者点击咨询完成]
             * @param success [function]
             * @param fail    [function]
             */
            finishConsult: function (param, success, fail) {
                HttpServiceBus.connect({
                    url: "third:pay_consult/order/finish",
                    params: {
                        scConsultId: param.scConsultId,
                        orderState: param.orderState
                    },
                    showLoading: Boolean(param.showLoading),
                    onSuccess: function (response) {
                        typeof success === 'function' && success(response);
                    },
                    onError: function (error) {
                        typeof fail === 'function' && fail(error);
                    }
                });
            },
            SentReminderConsult: function (param, success, fail) {
                HttpServiceBus.connect({
                    url: "third:pay_consult/order/reminder",
                    params: {
                        scConsultId: param,
                    },
                    onSuccess: function (response) {
                        typeof success === 'function' && success(response);
                    },
                    onError: function (error) {
                        typeof fail === 'function' && fail(error);
                    }
                });
            }
        };
        return def;
    })
    .build();