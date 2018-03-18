new KyeeModule()
    .group("kyee.quyiyuan.imUtil.service")
    .require([])
    .type("service")
    .name("IMUtilService")
    .params([
        "KyeeUtilsService",
        'KyeeEnv',
        'HttpServiceBus',
        'KyeeMessageService',
        'KyeeI18nService',
        "CacheServiceBus"
    ]).action(function (KyeeUtilsService, KyeeEnv, HttpServiceBus, KyeeMessageService, KyeeI18nService, CacheServiceBus) {

        var utils = {

            storageCache: CacheServiceBus.getStorageCache(),
            /**
             * 转换聊天界面日期
             * @param miliSeconds
             * @returns {string}
             */
            formatCurDate: function (value) {
                //value 不存在时将日期返回现在的时间
                if (!value || 0 == value || "0"== value || "undefined" == value) {
                    var now = new Date().getTime();
                    return KyeeUtilsService.DateUtils.formatFromDate(new Date(now), "HH:mm");
                }
                var miliSeconds = parseInt(value); //转换成整型
                var dateFormat = "";
                var year = new Date(miliSeconds).getFullYear();
                var curYear = new Date().getFullYear();
                var month = new Date(miliSeconds).getMonth() + 1;
                var curMonth = new Date().getMonth() + 1;
                var day = new Date(miliSeconds).getDate();
                var curDay = new Date().getDate();

                // if (year != curYear) {
                //     dateFormat = KyeeUtilsService.DateUtils.formatFromDate(new Date(miliSeconds), "YYYY年M月D日 HH:mm");
                // } else {
                    if (month == curMonth && day == curDay) {
                        dateFormat = KyeeUtilsService.DateUtils.formatFromDate(new Date(miliSeconds), "HH:mm");
                    } else if (month == curMonth && (curDay - day) == 1) {
                        dateFormat = "昨天 " + KyeeUtilsService.DateUtils.formatFromDate(new Date(miliSeconds), "HH:mm");
                    } else {
                        dateFormat = KyeeUtilsService.DateUtils.formatFromDate(new Date(miliSeconds), "M月D日 HH:mm");
                    }
                // }

                return dateFormat;
            },

            /**
             * 转换session列表日期
             * @param miliSeconds
             * @returns {string}
             */
            formatSessionDate: function (value) {
                if (!value || 0 == value || "0"== value || "undefined" == value) {
                    var now = new Date().getTime();
                    return KyeeUtilsService.DateUtils.formatFromDate(new Date(now), "HH:mm");
                }
                var miliSeconds = parseInt(value); //转换成整型
                var dateFormat = "";
                var year = new Date(miliSeconds).getFullYear();
                var curYear = new Date().getFullYear();
                var month = new Date(miliSeconds).getMonth() + 1;
                var curMonth = new Date().getMonth() + 1;
                var day = new Date(miliSeconds).getDate();
                var curDay = new Date().getDate();

                if (year != curYear) {
                    dateFormat = KyeeUtilsService.DateUtils.formatFromDate(new Date(miliSeconds), "YY/M/D");
                } else {
                    if (month == curMonth && day == curDay) {
                        dateFormat = KyeeUtilsService.DateUtils.formatFromDate(new Date(miliSeconds), "HH:mm");
                    } else if (month == curMonth && (curDay - day) == 1) {
                        dateFormat = "昨天";
                    } else {
                        dateFormat = KyeeUtilsService.DateUtils.formatFromDate(new Date(miliSeconds), "M月D日");
                    }
                }

                return dateFormat;
            },

            /**
             * 获得显示时间的标志
             * @param now
             */
            getShowTimeFlag: function (endTime, nowTime) {
                var showTimeFlag = 0;
                if ((nowTime - endTime) > (60000 * 6) || 0 == (nowTime - endTime)) {
                    showTimeFlag = 1;
                }
                return showTimeFlag;
            },
            /**
             * 获取日期时间,兼容苹果浏览器
             * @param dateTime
             * @returns {Date}
             */
            getDateTime: function (dateTime) {
                var yyyy = dateTime.substr(0, 4);
                var mm = (parseInt(dateTime.substr(5, 2)) - 1).toString();
                mm = mm.length == 2 ? mm : "0" + mm;
                var dd = dateTime.substr(8, 2);
                var hh = dateTime.substr(11, 2);
                var min = dateTime.substr(14, 2);
                var ss = dateTime.substr(17.2);
                return new Date(yyyy, mm, dd, hh, min, ss);
            },

            /**
             * 匹配超链接
             * @param url
             * @returns {boolean}
             */
            urlValid: function (url) {
                var flag = false;
                var urlReg=/^(((ht|f)tp(s?)):\/\/)?(www(\:[0-9]+)?.|[a-zA-Z](\:[0-9]+)?.)[a-zA-Z0-9\-\.]+\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk|cn)(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\;\?\'\\\+&amp;%\$#\=~_\-]+))*$/;
                //var urlReg = /^^(ht|f)tp(s?)\:\/\/[a-zA-Z0-9\-\._]+(\.[a-zA-Z0-9\-\._]+){2,}(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?$/;
                //var urlReg2 = /^\b(([\w-]+:\/\/?|www[.])[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|\/)))$/;
                if(urlReg.test(url)){
                    flag = true;
                }
                return flag;
            },

            //是否为可用设备
            isDeviceAvailable: function () {
                if (KyeeEnv.IS_IN_DEVICE && navigator.NeteaseIMPlugin) {
                    if (KyeeEnv.PLATFORM == 'android' || KyeeEnv.PLATFORM == 'ios') {
                        return true;
                    }
                }
                return false;
            },

            /**
             * 判断当前浏览器是否是微信浏览器
             * modified by zhangyi at 20161230 变量优化
             * @returns {boolean}
             */
            isWeiXin: function () {
                var ua = window.navigator.userAgent.toLowerCase();
                if ('micromessenger' == ua.match(/MicroMessenger/i)) {
                    return true;
                } else {
                    return false;
                }
            },

            /**
             * guid算法生成消息Id
             * @param len
             * @param radix
             * @returns {string}
             * addBy liwenjuan 2016/11/3
             */
            uuid: function (len, radix) {
                var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
                var uuid = [], i;
                radix = radix || chars.length;
                if (len) {
                    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
                } else {
                    var r;
                    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                    uuid[14] = '4';
                    // Fill in random data.  At i==19 set the high bits of clock sequence as
                    // per rfc4122, sec. 4.1.5
                    for (i = 0; i < 36; i++) {
                        if (!uuid[i]) {
                            r = 0 | Math.random() * 16;
                            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                        }
                    }
                }
                return uuid.join('');
            },

            /**
             * 校验发送方选择图片
             * add by wyn 20161116
             * @param webImgFile
             * @returns {boolean}
             */
            validSelectFile: function (webImgFile) {
                var validFlag = true;
                if (null === webImgFile || undefined === webImgFile) {
                    KyeeMessageService.message({
                        content: KyeeI18nService.get("byq_chat.pleaseSelectFile", "图片选择出错，请重新选择")
                    });
                    validFlag = false;
                }
                var imgSize = Math.floor(webImgFile.size / 1024);
                if (imgSize > 7000) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("byq_chat.fileSizeNoMoreThan5", "图片过大（超过7M）,不允许发送！"),
                        duration: 2000
                    });
                    validFlag = false;
                }
                return validFlag;
            },

            /**
             * 处理跨应用消息id保持匹配低版本的数据表名一致
             * addBy liwenjuan 2016/12/24
             * @param sessionId
             */
            formatSessionId: function (sessionId) {
                var newSessionId = sessionId;
                if (-1 < newSessionId.lastIndexOf("#")) {
                    var startIdx = newSessionId.lastIndexOf("#");
                    newSessionId = newSessionId.slice(startIdx + 1);
                }
                return newSessionId;
            },

            /**
             * 获取ios图片路径
             * addBy liwenjuan 2016/12/23
             * @returns {*}
             */
            getIosFilePath: function (localPath) {
                var iosFIlePath = utils.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.IOS_FILE_PATH);
                var filePath = localPath || "";
                var isIOS = window.ionic.Platform.isIOS(); //判断是否是ios
                if (isIOS && filePath && iosFIlePath) { //处理ios的图片路径问题
                    filePath = iosFIlePath + localPath.slice(localPath.lastIndexOf("/"));
                }
                return filePath;
            },

            /**
             * 判断当前浏览器是否是支付宝浏览器(工具方法)
             * add by zhangyi
             * @returns {boolean}
             */
            isZFB: function () {
                var ua = window.navigator.userAgent.toLowerCase();
                if ('alipayclient' == ua.match(/AlipayClient/i)) {
                    return true;
                } else {
                    return false;
                }
            },

            /**
             * 获取当前设备是ios还是android
             * addBy liwnejuan 2016/12/30
             */
            judgeIOSDevice: function(){
                var isIOS = window.ionic.Platform.isIOS(); //判断是否是ios
                return isIOS;
            },

            /**
             * 获取用户定位信息
             * add by wyn 20170105
             */
            getUserPosition: function(){
                var userPosition = "";
                var nowPosition = utils.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO);
                if(nowPosition && nowPosition.PROVINCE_NAME){
                    userPosition = nowPosition.PROVINCE_NAME;
                    if(nowPosition.CITY_NAME){
                        userPosition = userPosition + "-" + nowPosition.CITY_NAME;
                        if(nowPosition.PLACE_NAME){
                            userPosition = userPosition + "-" + nowPosition.PLACE_NAME;
                        }
                    }
                }
                return userPosition;
            },

            /**
             * 获取跨应用容联Id
             * addBy liwenjuan 2017/1/10
             */
            getCrossApplicationId: function(id){
                var rlParams = utils.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
                if (!rlParams || !rlParams.doctorAppId) {  //若是没有荣联信息 则获取熔炼信息并登录荣联
                    var http = new XMLHttpRequest(),
                        userId = MEMORY_CACHE_STORE.currentUserRecord.value.USER_ID;
                    url = DeploymentConfig.SERVER_URL_REGISTRY.third + 'userManage/user/accountinfo/get/rl?USER_ID=' + userId;
                    http.open('GET', url, false);
                    http.send();
                    if (http.responseText) {
                        try {
                            var response = JSON.parse(http.responseText),
                                rlInfo = response.data;
                            utils.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO, rlInfo);
                            http = null;
                            return rlInfo.doctorAppId + "#" +id;
                        } catch (e) {
                            return id;
                        }
                    }
                }
                return rlParams.doctorAppId ? (rlParams.doctorAppId + "#" +id) : id;
            }
        };
        return utils;
    })
    .build();
