/**
 * 产品名称：quyiyuan.
 * 创建用户：吴伟刚
 * 日期：2015年6月26日09:49:43
 * 创建原因：住院满意度页面控制器
   修改人：张明 修改时间：2015年12月02日14:37:22
 * 任务号：KYEEAPPC-4387 修改原因：提示信息修改
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.hospitalList.controller")
    .require([
        "kyee.quyiyuan.satisfaction.hospitalList.service",
        "kyee.quyiyuan.satisfaction.satisfactionHospital.service",
        "kyee.quyiyuan.satisfaction.satisfactionHospital.controller",
        "kyee.quyiyuan.satisfaction.satisfactionDoctor.service",
        "kyee.quyiyuan.satisfaction.satisfactionDoctor.controller",
        "kyee.quyiyuan.satisfaction.satisfactionMenu.controller",
        "kyee.quyiyuan.satisfaction.satisfactionMenu.service",
        "kyee.quyiyuan.satisfaction.hospitalMenu.controller",
        "kyee.quyiyuan.satisfaction.hospitalDoctor.controller",
        "kyee.quyiyuan.satisfaction.hospitalHospital.controller",
        "kyee.quyiyuan.satisfaction.hospitalMenu.service",
        "kyee.quyiyuan.myquyi.service"
    ])
    .type("controller")
    .name("HospitalListController")
    .params(["$scope", "$state", "HospitalListService",
        "HospitalDoctorService", "HospitalMenuService", "KyeeMessageService",
        "HospitalHospitalService", "CacheServiceBus", "$ionicScrollDelegate","KyeeI18nService"])
    .action(function($scope, $state, HospitalListService,
                     HospitalDoctorService, HospitalMenuService, KyeeMessageService,
                     HospitalHospitalService, CacheServiceBus, $ionicScrollDelegate,KyeeI18nService){

        $scope.activityClass = 0;
        $scope.suggestStatus = "";
        $scope.page = "";
        $scope.limit = "";
        $scope.emptyText = "";
        $scope.placeText = KyeeI18nService.get('satisfaction_hospital_list.zhuYuan_placeTxt', '请输入住院编号', null);
        $scope.search = {
            searchNo:''
        };

        $scope.inHospitalNoPwd = "";

        if(HospitalListService.data && HospitalListService.data.doctorCode){
            var hospitalId = HospitalListService.data.hospitalId;
            var doctorCode = HospitalListService.data.doctorCode;
            HospitalListService.data = undefined;
        } else {
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var doctorCode = "";
        }

        /**
         * 判空显示函数
         * @param data
         * @param text
         */
        $scope.changeEmptyText = function (data, text) {
            if(!data || data.length == 0){
                $scope.showEmpty = true;
                $scope.emptyText = text;
            } else {
                $scope.showEmpty = false;
            }
        };

        /**
         * 已读未读筛选函数
         * @param status
         */
        $scope.selectStatus = function (status) {
            $scope.activityClass = status;
            $scope.suggestStatus = status;
            $scope.moreDataCanBeLoadedFlag = false;


            HospitalListService.queryItems($scope.search.searchNo, hospitalId,
                $scope.suggestStatus, $scope.page, $scope.limit,
                function(data){
                    if(data.success){
                        $scope.moreDataCanBeLoadedFlag = false;
                        $scope.appointItems = data.data;
                        $scope.inHospitalNoPwd = data.data[0].inHospitalNoPwd;
                        if($scope.inHospitalNoPwd==1){
                            $scope.inHospitalNoPwdTop = 47+'px';
                        }else{
                            $scope.inHospitalNoPwdTop = 0;
                        }
                    }else{
                        $scope.inHospitalNoPwd =data.message.split('|')[1];
                        $scope.changeEmptyText($scope.appointItems, data.message.split('|')[0]);
                    }
                    $ionicScrollDelegate.scrollTop();
                });
        };

        //初始化显示未评价记录
        $scope.selectStatus(0);

        /**
         * 满意度记录点击事件
         * @param item
         */
        $scope.itemClick = function (item) {
            if($scope.buttonTap == true){
                $scope.buttonTap = false;
                return;
            }

            if(item.DOCTOR_SUGGEST_SCORE == '0' && item.HOSPITAL_SUGGEST_SCORE != '0'){
                gotoHospitalSuggest(item);
            } else {
                gotoDoctorSuggest(item);
            }
        };

        /**
         * 跳转到医生满意度
         */
        var gotoDoctorSuggest = function (item) {
            HospitalMenuService.isTabActive = 1;
            HospitalDoctorService.data = item;

            // 判断如果评价过则直接跳转页面
            if(item.DOCTOR_SUGGEST_SCORE == '0'){
                HospitalDoctorService.querySurveyData(
                    HospitalDoctorService.data.HOSPITAL_ID,
                    function(data){

                        if(data.success == false){
                            KyeeMessageService.message({
                                title: KyeeI18nService.get('commonText.温馨提示', 'warmTipMsg', null),
                                content: data.message
                            });
                        } else {
                            HospitalDoctorService.pageData = {};
                            HospitalDoctorService.pageData.items = data.rows;
                            $state.go("satisfaction_hospital_menu.hospital_doctor");
                        }
                    })
            } else {
                $state.go("satisfaction_hospital_menu.hospital_doctor");
            }
        };

        /**
         * 跳转到医院满意度
         */
        var gotoHospitalSuggest = function (item) {
            HospitalMenuService.isTabActive = 2;
            HospitalHospitalService.data = item;

            // 判断如果评价过则直接跳转页面
            if(item.HOSPITAL_SUGGEST_SCORE == '0'){
                HospitalHospitalService.querySurveyData(
                    HospitalHospitalService.data.HOSPITAL_ID,
                    function(data){

                        if(data.success == false){
                            KyeeMessageService.message({
                                title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                content: data.message
                            });
                        } else {
                            HospitalHospitalService.pageData = {};
                            HospitalHospitalService.pageData.items = data.rows;
                            $state.go("satisfaction_hospital_menu.hospital_hospital");
                        }
                    })
            } else {
                $state.go("satisfaction_hospital_menu.hospital_hospital");
            }
        }

        /**
         * 跳转到主治医生评价页面
         */
        $scope.gotoDoctor = function(item){
            $scope.buttonTap = true;
            gotoDoctorSuggest(item);
        };

        /**
         * 跳转到住院环境评价页面
         */
        $scope.gotoHospital = function (item){
            $scope.buttonTap = true;
            gotoHospitalSuggest(item);
        };

        /**
         * 住院号查询事件
         */
        $scope.doSearchInPatient = function(){
            $scope.changeEmptyText($scope.appointItems, "");
            HospitalListService.queryItems($scope.search.searchNo, hospitalId,
                $scope.suggestStatus, $scope.page, $scope.limit,
                function(data){
                    if(data.success){
                        if($scope.inHospitalNoPwd==1){
                            $scope.inHospitalNoPwdTop = 47+'px';
                        }else{
                            $scope.inHospitalNoPwdTop = 0;
                        }
                        $scope.appointItems = data.data;
                        $scope.showEmpty = false;
                    }else{
                        if($scope.appointItems&&$scope.appointItems.length>0){
                            KyeeMessageService.message({
                                title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                content: data.message.split('|')[0]
                            });
                        }
                        $scope.changeEmptyText($scope.appointItems, data.message.split('|')[0]);
                    }
                    $ionicScrollDelegate.scrollTop();
                });
        };

        $scope.$watch('search.searchNo', function () {
            $scope.onKeyup();
        });

        $scope.onKeyup = function () {
            if ($scope.search.searchNo == null || $scope.search.searchNo == "") {
                $scope.doSearchInPatient();
            }
        };
    })
    .build();