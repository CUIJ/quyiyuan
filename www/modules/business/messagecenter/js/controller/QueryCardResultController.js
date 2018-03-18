/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：查卡结果页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.queryCardResult.controller")
    .require(["kyee.quyiyuan.messagecenter.queryCardResult.service"])
    .type("controller")
    .name("QueryCardResultController")
    .params(["$scope", "$state", "QueryCardResultService", "CacheServiceBus"])
    .action(function($scope, $state, QueryCardResultService, CacheServiceBus){

        // 获取初始化数据
        $scope.data = QueryCardResultService.data;
        $scope.data.CARDS = JSON.parse($scope.data.CARDS);

        // 判空显示
        if($scope.data.CARDS.length > 0){
            $scope.showEmpty = false;
        } else {
            $scope.showEmpty = true;
        }

        /**
         * 选择就诊卡点击函数
         * @param cardIndex
         * 任务号：KYEEAPPTEST-3906
         * 修改人：杨明思
         * 描述：查卡结果的APP消息推送，点击就诊卡号不做跳转
         */
        //$scope.messageClick = function (cardIndex) {
        //    var hospitalId = $scope.data.HOSPITAL_ID ;
        //    var userVsId = $scope.data.USER_VS_ID;
        //    var cardNo = $scope.data.CARDS[cardIndex].CARD_NO;
        //    QueryCardResultService.saveDefaultCard(userVsId, cardNo, hospitalId, function (data) {
        //        if(data.success){
        //            $scope.refreshData(userVsId, hospitalId);
        //        }
        //    });
        //    $state.go("messagecenter");
        //};

        //刷新当前就诊者信息
        $scope.refreshData = function(userVsId, hospitalId) {

            if (userVsId != CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID ||
                hospitalId != CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id) {
                return;
            }

            QueryCardResultService.refreshData(hospitalId, function (result) {
                if (result.length <= 0) {
                    return;
                }

                var data = result[0];
                //成功并且有数据，解析该就诊者的卡信息
                var detialList = JSON.parse(data.DETIAL_LIST);
                data.PATIENT_CARD = [];
                if (detialList != null) {
                    for(var index = 0; index < detialList.length; index++){
                        detialList[index].USER_VS_ID = data.USER_VS_ID;
                        //排除重复的卡号，并且清理空的身份证
                        var isExist = true;
                        for(var indexCard = 0; indexCard < data.PATIENT_CARD.length; indexCard++){
                            if (data.PATIENT_CARD[indexCard].PATIENT_ID == detialList[index].PATIENT_ID) {
                                if (data.PATIENT_CARD[indexCard].ID_NO == null
                                    || data.PATIENT_CARD[indexCard].ID_NO == undefined) {
                                    data.PATIENT_CARD[indexCard] = detialList[index];
                                }
                                else {
                                    isExist = false;
                                }
                            }
                        }
                        if (isExist) {
                            data.PATIENT_CARD.push(detialList[index]);
                        }
                    }
                }


                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO,
                    data.PATIENT_CARD[0]);
                data.CARD_NO = CacheServiceBus.getMemoryCache().get(
                    CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO).CARD_NO;
                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT,
                    data);
            });
        }
    })
    .build();
