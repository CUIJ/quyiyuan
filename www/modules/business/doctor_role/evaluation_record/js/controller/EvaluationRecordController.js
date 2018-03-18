/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年7月22日11:17:02
 * 创建原因：医生角色评价记录页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctor_role.controller.evaluation_record")
    .require(["kyee.quyiyuan.doctor_role.evaluation_record.service"])
    .type("controller")
    .name("EvaluationRecordController")
    .params(["$scope", "EvaluationRecordService", "CacheServiceBus","KyeeI18nService"])
    .action(function ($scope, EvaluationRecordService, CacheServiceBus,KyeeI18nService) {

        $scope.showEmpty = false;
        $scope.page = 0;
        $scope.moreDataCanBeLoadedFlag = false;

        //查询所有我的评价
        $scope.queryDoctorSatisfactionRecord = function () {
            $scope.page ++;

            var doctorCode = CacheServiceBus.getMemoryCache().
                get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).DOCTOR_CODE;
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

            EvaluationRecordService.queryDoctorSatisfactionRecord($scope.page, 8, doctorCode, hospitalId, function (data) {


                if(data.length != 8){
                    $scope.moreDataCanBeLoadedFlag = false;
                } else {
                    $scope.moreDataCanBeLoadedFlag = true;
                }

                for (var i = 0; i < data.length; i++) {
                    if(data[i].PATIENT_NAME!=undefined&&data[i].PATIENT_NAME!= null
                        &&data[i].PATIENT_AGE!=undefined&&data[i].PATIENT_AGE!= null
                        &&data[i].PATIENT_SEX!=undefined&&data[i].PATIENT_SEX!= null
                        &&data[i].SUGGEST_SCORE!=undefined&&data[i].SUGGEST_SCORE!= null){
                        if(data[i].SUGGEST_VALUE!=undefined&&data[i].SUGGEST_VALUE!= null&&data[i].SUGGEST_VALUE!= ""){

                        }else{
                            data[i].SUGGEST_VALUE = KyeeI18nService.get("evaluation_record.noComment", "此用户没有填写评论！")
                        }
                    }else{
                        data.splice(i,1);
                    }
                    if (data[i].PATIENT_SEX == 1) {
                        data[i].PATIENT_SEX = KyeeI18nService.get('evaluation_record.man', '男', null);
                    } else {
                        data[i].PATIENT_SEX = KyeeI18nService.get('evaluation_record.woman', '女', null);
                    }
                }

                if($scope.all == undefined){
                    $scope.all = [];
                }

                for(var index = 0; index < data.length ; index++){
                    $scope.all.push(data[index]);
                }

                if ($scope.all == 0) {
                    $scope.showEmpty = true;
                } else {
                    $scope.showEmpty = false;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };

        $scope.queryDoctorSatisfactionRecord();

        /**
         * 判断是否还有更多数据
         * @returns {boolean}
         */
        $scope.moreDataCanBeLoaded = function(){
            return $scope.moreDataCanBeLoadedFlag;
        };
    })
    .build();
