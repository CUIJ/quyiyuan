/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年7月22日11:17:02
 * 创建原因：医生角色关注我的页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctor_role.controller.care_me")
    .require([
        "kyee.quyiyuan.doctor_role.care_me.service",
        "kyee.quyiyuan.doctorRole.messageBoard.service",
        "kyee.quyiyuan.doctorRole.messageBoard.controller"])
    .type("controller")
    .name("CareMeController")
    .params([
        "$scope", "$state", "CacheServiceBus",
        "CareMeService", "MessageBoardService","KyeeI18nService"])
    .action(function (
        $scope, $state, CacheServiceBus,
        CareMeService, MessageBoardService,KyeeI18nService) {

        //初始化数据
        $scope.page = 0;
        $scope.moreDataCanBeLoadedFlag = false;

        $scope.currentUserRecord = CacheServiceBus.getMemoryCache().
            get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);

        $scope.hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

        //查询所有关注我的
        $scope.queryDoctorFuns = function () {

            $scope.page++;

            CareMeService.queryDoctorFuns($scope.currentUserRecord.DOCTOR_CODE,
                $scope.hospitalId, $scope.page, 12,function (data) {

                    if(!data){
                        $scope.showEmpty = true;
                        return;
                    }

                    if(data.length != 12){
                        $scope.moreDataCanBeLoadedFlag = false;
                    } else {
                        $scope.moreDataCanBeLoadedFlag = true;
                    }

                    //分辨男女IS_SELECTED
                    for (var i = 0; i < data.length; i++) {
                        if(!(data[i].OFTEN_NAME!=undefined&&data[i].OFTEN_NAME!= null
                            &&data[i].SEX!=undefined&&data[i].SEX!= null
                            &&data[i].AGE!=undefined&&data[i].AGE!= null
                            &&data[i].REGIST_NUMBER!=undefined&&data[i].REGIST_NUMBER!= null
                            &&data[i].HEAT!=undefined&&data[i].HEAT!= null)){

                            data.splice(i,1);
                        }

                        if (data[i].SEX == 1) {
                            data[i].SEX = KyeeI18nService.get('care_me.man', '男');
                        } else {
                            data[i].SEX = KyeeI18nService.get('care_me.woman', '女');
                        }
                    }

                    if($scope.records == undefined){
                        $scope.records = [];
                    }

                    for(var index = 0; index < data.length ; index++){
                        $scope.records.push(data[index]);
                    }

                    // 判空显示
                    if(!$scope.records || $scope.records.length == 0){
                        $scope.showEmpty = true;
                    } else {
                        $scope.showEmpty = false;
                    }

                    $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };

        $scope.queryDoctorFuns();

        /**
         * 判断是否还有更多数据
         * @returns {boolean}
         */
        $scope.moreDataCanBeLoaded = function(){
            return $scope.moreDataCanBeLoadedFlag;
        };

        /**
         * 点击关注记录
         */
        $scope.onItemClick = function (item)  {
            MessageBoardService.paramData = item;
            MessageBoardService.paramData.DOCTOR_CODE = $scope.currentUserRecord.DOCTOR_CODE;

            $state.go("patientInfo.doctorMessageBoard");
        };

    })
    .build();
