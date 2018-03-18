/*
 * 产品名称：quyiyuan
 * 创建人:
 * 创建日期:
 * 创建原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.healthManageHome.controller")
    .require([
        "kyee.quyiyuan.health.weightManage.controller",
        "kyee.quyiyuan.health.healthManage.service"
    ])
    .type("controller")
    .name("HealthManageHomeController")
    .params([
        "$scope",
        "$state",
        "KyeeListenerRegister",
        "WeightManageService",
        "CacheServiceBus",
        "HealthManageService",
        "CenterUtilService",
        "WeightAddService"
    ])
    .action(function ($scope,
                      $state,
                      KyeeListenerRegister,
                      WeightManageService,
                      CacheServiceBus,
                      HealthManageService,
                      CenterUtilService,
                      WeightAddService
                     ) {
        /**
         * 所有字段初始化
         * @type {{}}
         */
        $scope.userId = "";
        $scope.userInfo = {
            NAME: "",                   //姓名
            sexView: "",                //性别
            age:"",                     //年龄
            weight:"",                  //体重
            height:"",                      //身高
            BMI:"",             //bmi
            weightLevel:"",    //体重标准水平
            weightValue:"",
            weightData:"",              //体重时间
            weightRate:"",
            show:[false,false,false,false],
            pressureLevel:"",           //血压分数
            pressureValue:"",
            pressureHeight:"",          //高压
            pressureLow:"",             //低压
            pressData:"",               //血压时间
            sugar:"",                   //血糖
            sugarLevel:"",              //血糖分数
            sugarValue:"",
            sugarData:"",                          //血糖日期
            measureTime:"",                //测量时间
            sportLevel:"",              //运动强度
            sportValue:"",
            sportTime:"",           //运动时长
            sportData:"",                //运动时间
            sportType:""            //运动类型

        };
        var memoryCache = CacheServiceBus.getMemoryCache();
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "health_manage",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });
        KyeeListenerRegister.regist({
            focus: "health_manage",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                var userInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                $scope.userId = userInfo.USER_ID;
                $scope.userInfo.NAME = userInfo.NAME;
                $scope.userInfo.sexView = userInfo.SEX == "1"?"男":"女";
                HealthManageService.getAll($scope.userId,function (data) {
                    if(data[data.length-1].healthDate == '' || data[data.length-1].healthDate == undefined){
                        $scope.userInfo.age = "未知";
                    }else{
                        $scope.userInfo.age = CenterUtilService.ageBydateOfBirth(data[data.length-1].healthDate);
                    }
                    for(var i= 0;i<data.length-1;i++) {
                        if (data[i].healthName == "血压管理") {
                            $scope.userInfo.show[1] = true;
                            $scope.userInfo.pressData = data[i].healthDate;
                            $scope.userInfo.pressureHeight = data[i].healthKey1;
                            $scope.userInfo.pressureLow = data[i].healthKey2;
                            $scope.userInfo.pressureLevel = data[i].healthStatus;
                            dealPressure($scope.userInfo.pressureLevel);
                            continue;
                        } else if (data[i].healthName == "血糖管理") {
                            $scope.userInfo.show[2] = true;
                            $scope.userInfo.sugarData = data[i].healthDate;
                            $scope.userInfo.sugar = data[i].healthKey1;
                            $scope.userInfo.measureTime = data[i].healthKey2;
                            $scope.userInfo.sugarLevel = data[i].healthStatus;
                            dealSugar($scope.userInfo.sugarLevel);
                            dealSugarTime($scope.userInfo.measureTime);
                        }else if (data[i].healthName == "体重管理") {
                            $scope.userInfo.show[0] = true;
                            $scope.userInfo.weightData = data[i].healthDate;
                            $scope.userInfo.height = data[i].healthKey1;
                            $scope.userInfo.weight = data[i].healthKey2;
                            $scope.userInfo.BMI = data[i].healthKey3;
                            dealBMI($scope.userInfo.BMI);
                        }else if (data[i].healthName == "运动管理") {
                            $scope.userInfo.show[3] = true;
                            $scope.userInfo.sportData = data[i].healthDate;
                            $scope.userInfo.sportLevel = data[i].healthKey1;
                            $scope.userInfo.sportTime = data[i].healthKey2;
                            $scope.userInfo.sportType = data[i].healthKey3;
                            dealSport($scope.userInfo.sportLevel);
                        }
                    }
                });
            }
        });
            var dealBMI = function (bmi) {
                if(bmi<18.5){
                    $scope.userInfo.weightLevel = "偏瘦";
                    $scope.userInfo.weightValue = 1;
                }else if(18.5<=bmi&&bmi<=23.9){
                    $scope.userInfo.weightLevel = "正常";
                    $scope.userInfo.weightValue = 2;
                }else if(23.9<bmi&&bmi<26.9){
                    $scope.userInfo.weightLevel = "偏胖";
                    $scope.userInfo.weightValue = 3;
                }else if(26.9<bmi&&bmi<29.9){
                    $scope.userInfo.weightLevel = "肥胖";
                    $scope.userInfo.weightValue = 4;
                }else if(29.9<bmi){
                    $scope.userInfo.weightLevel = "重度肥胖";
                    $scope.userInfo.weightValue = 7;
                }
            };


        var dealPressure = function (level) {
            var result = level.split("-");
            switch(Number(result[0])){
                case 0: $scope.userInfo.pressureLevel = "偏低";
                    $scope.userInfo.pressureValue =1;
                    break;
                case 1: $scope.userInfo.pressureLevel = "正常";
                    $scope.userInfo.pressureValue =2;
                    break;
                case 2: $scope.userInfo.pressureLevel = "偏高";
                    $scope.userInfo.pressureValue =3;
                    break;
                case 3: $scope.userInfo.pressureLevel = "轻度高压";
                    $scope.userInfo.pressureValue =4;
                    break;
                case 4: $scope.userInfo.pressureLevel = "中度高压";
                    $scope.userInfo.pressureValue =5;
                    break;
                case 5: $scope.userInfo.pressureLevel = "重度高压";
                    $scope.userInfo.pressureValue =6;
                    break;
                case 6: $scope.userInfo.pressureLevel = "单纯收缩期高血压";
                    $scope.userInfo.pressureValue =7;
                    break;
            }
        };

        var dealSugar = function (level) {
            var result = level.split("-");
            switch(Number(result[0])){
                case 0: $scope.userInfo.sugarLevel = "低血糖";
                    $scope.userInfo.sugarValue =1;
                    break;
                case 1: $scope.userInfo.sugarLevel = "偏低";
                    $scope.userInfo.sugarValue =2;
                    break;
                case 2: $scope.userInfo.sugarLevel = "正常";
                    $scope.userInfo.sugarValue =3;
                    break;
                case 3: $scope.userInfo.sugarLevel = "偏高";
                    $scope.userInfo.sugarValue =4;
                    break;
                case 4: $scope.userInfo.sugarLevel = "过高";
                    $scope.userInfo.sugarValue =7;
                    break;
            }
        };

        var dealSugarTime = function (time) {
            switch(Number(time)){
                case 0 : $scope.userInfo.measureTime = "早餐前(空腹)";
                    break;
                case 1 : $scope.userInfo.measureTime = "早餐后";
                    break;
                case 2 : $scope.userInfo.measureTime = "午餐前";
                    break;
                case 3 : $scope.userInfo.measureTime = "午餐后";
                    break;
                case 4 : $scope.userInfo.measureTime = "晚餐前";
                    break;
                case 5 : $scope.userInfo.measureTime = "晚餐后";
                    break;
                case 6 : $scope.userInfo.measureTime = "睡前";
                    break;
            }
        };

        var dealSport = function(level){
            switch(Number(level)){
                case 0 : $scope.userInfo.sportLevel = "非常轻松";
                    $scope.userInfo.sportValue = 1;
                    break;
                case 1 : $scope.userInfo.sportLevel = "很轻松";
                    $scope.userInfo.sportValue = 2;
                    break;
                case 2 : $scope.userInfo.sportLevel = "尚轻松";
                    $scope.userInfo.sportValue = 3;
                    break;
                case 3 : $scope.userInfo.sportLevel = "稍累";
                    $scope.userInfo.sportValue = 4;
                    break;
                case 4 : $scope.userInfo.sportLevel = "累";
                    $scope.userInfo.sportValue = 5;
                    break;
                case 5 : $scope.userInfo.sportLevel = "很累";
                    $scope.userInfo.sportValue = 6;
                    break;
                case 6 : $scope.userInfo.sportLevel = "精疲力竭";
                    $scope.userInfo.sportValue = 7;
                    break;
            }
        };
        $scope.goBack = function () {
          $ionicHistory.goBack(-1);
        };
        //添加数据
        $scope.addManage = function (type,isFirst) {
            var i;
            switch(type){
                case 'weight': i=1;
                    break;
                case 'pressure': i=2;
                    break;
                case 'sugar': i=3;
                    break;
                case 'sport': i=4;
                    break;}
            WeightAddService.HEALTH_MANAGE_TYPE = i;
            if(isFirst){
                WeightAddService.firstIn = true;
                WeightManageService.number = 1;
            }
            else{
                WeightAddService.firstIn = false;
            }
            $state.go("weight_add");
        }
        $scope.goToWeightManage = function () {
            WeightManageService.showType = "weight";
            WeightAddService.firstIn = false;
            WeightManageService.firstIn = false;
            WeightManageService.saves = 0;
            $state.go("weight_manage");
        };
        $scope.goToPressureManage = function () {
            WeightManageService.showType = "pressure";
            WeightAddService.firstIn = false;
            WeightManageService.firstIn = false;
            WeightManageService.saves = 0;
            $state.go("weight_manage");
        };
        $scope.goToSugarManage = function () {
            WeightManageService.showType = "sugar";
            WeightAddService.firstIn = false;
            WeightManageService.firstIn = false;
            WeightManageService.saves = 0;
            $state.go("weight_manage");
        };
        $scope.goToSportManage = function () {
            WeightManageService.showType = "sport";
            WeightAddService.firstIn = false;
            WeightManageService.firstIn = false;
            WeightManageService.saves = 0;
            $state.go("weight_manage");
        }

    })
    .build();