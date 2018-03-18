/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪、付添
 * 创建日期:2015年9月25日10:18:09
 * 创建原因：医院-价格公示-药品价格
 */
new KyeeModule()
    .group("kyee.quyiyuan.price.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("PriceService")
    .params(["HttpServiceBus", "KyeeMessageService", "CacheServiceBus"])
    .action(function (HttpServiceBus, KyeeMessageService, CacheServiceBus) {

        var def = {
            ITEM_NAME: [],
            data: undefined,
            fromPage: 0,//记录从哪块跳转过来
            //文本长度处理程序 药品名称8汉字内  项目名称15汉字内
            TextLengthHandler: function (type, text) {
                if (text != "" && text != null) {
                    if (type == 0) {//药品
                        if (text.length > 8) {
                            text = text.substring(0, 7) + "...";
                        }
                    } else {//项目
                        if (text.length > 15) {
                            text = text.substring(0, 15) + "...";
                        }
                    }
                }
                return text;
            },
            /**
             * 从本地读取历史搜索记录
             */
            ReadSearchHistories: function (status) {
                var searchHistorys = [];
                //读药品搜索记录
                if (status == 0) {
                    searchHistorys = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.MEDICAL_SEARCH_HISTORIES);
                    if (!searchHistorys) {
                        CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.MEDICAL_SEARCH_HISTORIES, searchHistorys);
                    }
                } else {//读项目搜索记录
                    searchHistorys = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.PROJECT_SEARCH_HISTORIES);
                    if (!searchHistorys) {
                        CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.PROJECT_SEARCH_HISTORIES, searchHistorys);
                    }
                }
                return searchHistorys;
            },
            /**
             在本地存储历史搜索记录
             */
            WriteSearchHistories: function (searchHistorys, status, keyWords) {
                var searchHistoriesSize = 8;
                if (searchHistorys) {
                    if (searchHistorys.length > searchHistoriesSize) {
                        //pop超出的元素，处理无用处数据
                        var popCount = searchHistorys.length - searchHistoriesSize;
                        for (var i = 0; i < popCount; i++) {
                            searchHistorys.pop();
                        }
                    }
                    //判断本地存储是否包含当前keywords
                    var containKeyWordsFlag = false;
                    for (var i = 0; i < searchHistorys.length; i++) {
                        if (searchHistorys[i] == keyWords) {
                            containKeyWordsFlag = true;
                            break;
                        }
                    }
                    if (!containKeyWordsFlag) {
                        //本地存储不包含当前关键字
                        if (searchHistorys.length == searchHistoriesSize) {
                            //缓存只能保持8个历史搜索记录
                            searchHistorys.pop();
                        }
                        searchHistorys.unshift(keyWords);
                    }
                } else {
                    searchHistorys = [];
                    searchHistorys.unshift(keyWords);
                }
                //存入缓存
                if (status == 0) {
                    CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.MEDICAL_SEARCH_HISTORIES, searchHistorys);
                } else {
                    CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.PROJECT_SEARCH_HISTORIES, searchHistorys);
                }
                return searchHistorys;
            },
            /**
             *   清除存储历史搜索记录
             */
            ClearSearchHistories: function (status) {
                var searchHistorys = [];
                //缓存清空
                if (status == 0) {
                    CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.MEDICAL_SEARCH_HISTORIES, searchHistorys);
                } else {
                    CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.PROJECT_SEARCH_HISTORIES, searchHistorys);
                }
                return searchHistorys;
            },
            /**
             * 分页查询价格
             */
            queryPrice: function (type, keywords, page, limit, onSuccess) {
                HttpServiceBus.connect({
                    url: "priceBoard/action/PriceBoardActionC.jspx?",
                    showLoading: false,
                    params: {
                        op: "queryPriceBoardInfo",
                        PAGE: page,
                        COUNT: limit,
                        QUERY_TYPE: type,
                        KEY_WARDS: keywords
                    },
                    onSuccess: function (resp) {
                        if (resp.data) {
                            onSuccess(resp);
                        }

                    }
                });
            },
            /**
             * 分页查询热点详情
             */
            queryPriceFront: function (type, page, limit, onSuccess) {
                HttpServiceBus.connect({
                    url: "priceBoard/action/PriceBoardActionC.jspx?",
                    params: {
                        op: "queryHotInfoDetails",
                        PAGE: page,
                        COUNT: limit,
                        QUERY_TYPE: type
                    },
                    onSuccess: function (resp) {
                        if (resp.data) {
                            onSuccess(resp);
                        }

                    }
                });
            },
            /**
             * 查热点
             */
            queryHotspot: function (type, onSuccess) {
                HttpServiceBus.connect({
                    url: "priceBoard/action/PriceBoardActionC.jspx?",
                    showLoading: false,
                    params: {
                        op: "queryHotInfo",
                        QUERY_TYPE: type
                    },
                    onSuccess: function (resp) {
                        if (resp.data) {
                            onSuccess(resp);
                        }

                    }
                });
            },
            /**
             保存热度
             */
            saveHotpot: function (type, keywords) {
                HttpServiceBus.connect({
                    url: "priceBoard/action/PriceBoardActionC.jspx",
                    showLoading: false,
                    params: {
                        op: "saveSearchHotInfo",
                        QUERY_TYPE: type,
                        KEY_WARDS: keywords
                    }
                });
            },

            /**
             * 任务号：KYEEAPPC-9597
             * 作者：yangmingsi
             * 描述：查询价格公示医院参数
             * 时间：2017年1月12日17:16:41
             */
            queryPriceBoardParams: function (onSuccess) {
                HttpServiceBus.connect({
                    url: "priceBoard/action/PriceBoardActionC.jspx?",
                    showLoading: false,
                    params: {
                        op: "queryPriceBoardParams"
                    },
                    onSuccess: function (resp) {
                        if (resp.data) {
                            onSuccess(resp);
                        }

                    }
                });
            }
        };
        return def;
    })
    .build();