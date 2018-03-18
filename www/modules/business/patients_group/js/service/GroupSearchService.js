/**
 * 群组搜索服务层
 * 作者：李延辉
 * 时间：2017年03月21日11:37:05
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.group_search.service")
    .require([])
    .type("service")
    .name("GroupSearchService")
    .params([
        "$state",
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeI18nService"
    ])
    .action(function ($state, HttpServiceBus, CacheServiceBus,
                      KyeeI18nService) {
        var def = {
            searchKey: null,
            searchGroupListData: function (params, callback) {
                HttpServiceBus.connect({
                    url: 'third:groupmanage/group/search',
                    showLoading: true,
                    params: params,
                    onSuccess: function (retVal) {
                        if (retVal) {
                            var success = retVal.success;
                            var message = retVal.message;
                            if (success) {
                                callback && callback(retVal.data.groupSearchList);
                            } else {
                                KyeeMessageService.broadcast({
                                    content: message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                    duration: 2000
                                });
                            }
                        }
                    }
                });
            }

        };
        return def;
    })
    .build();