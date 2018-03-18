/*
 * 产品名称：quyiyuan
 * 创建人:
 * 创建日期:
 * 创建原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.weight.add.controller")
    .require([
    ])
    .type("controller")
    .name("WeightAddController")
    .params([
        "$scope","KyeeListenerRegister","WeightAddService","KyeeMessageService","CacheServiceBus","CenterUtilService",
        "$state","WeightManageService","$ionicHistory"
    ])
    .action(function ($scope,KyeeListenerRegister,WeightAddService,KyeeMessageService,CacheServiceBus,CenterUtilService,
                      $state,WeightManageService,$ionicHistory) {

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "health_manage",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.gotoManage();
            }
        });
        $scope.gotoManage = function () {
            if(WeightAddService.firstIn) {
                $ionicHistory.goBack(-1);
            }
            else{
                $state.go("weight_manage");
            }
        };
        var saves = 0;
        var today = new Date().getFullYear()+"/"+"0"+(new Date().getMonth()+1)+"/"+new Date().getDate();
        KyeeListenerRegister.regist({
            focus: "weight_add",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params){
                $scope.healthManageType = WeightAddService.HEALTH_MANAGE_TYPE;//1：体重；2：血压；3：血糖；4：运动
                var startDate = new Date();
                $scope.yearRange = (startDate.getFullYear() - 18) + '->' + (startDate.getFullYear());
                //初始值
                var menus = [];
                if($scope.healthManageType==1){
                    //体重
                    $scope.weightInfo = {high: "", weight: "",date:today}; //页面参数初始化
                    //如果有身高，则默认上
                    if(WeightAddService.WEIGHT__INFO_HIGH){
                        $scope.weightInfo.high = WeightAddService.WEIGHT__INFO_HIGH;
                    }
                }else if($scope.healthManageType==2){
                    //血压
                    $scope.bloodPressureInfo =  {systolicPressure: "", diastolicPressure: "",heartRate:"",date:today};
                }else if($scope.healthManageType==3){
                    //血糖
                    $scope.bloodSugarInfo = {sugarType: "", sugarValue: "",date:today};
                    $scope.title = "请选择类型";
                    //血糖类型列表初始化
                    menus = [
                        {"text":"空腹","value":0},
                        {"text":"早餐后","value":1},
                        {"text":"午餐前","value":2},
                        {"text":"午餐后","value":3},
                        {"text":"晚餐前","value":4},
                        {"text":"晚餐后","value":5},
                        {"text":"睡前","value":6}
                    ];
                    $scope.pickerItems = menus;
                    var currentUserRecord =  CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);//用户缓存
                    //用户年龄、姓名、性别
                    if(currentUserRecord){
                        $scope.userName =currentUserRecord.NAME;
                        $scope.userSex = currentUserRecord.SEX==1?"男":"女";
                        $scope.userAge = CenterUtilService.ageBydateOfBirth(currentUserRecord.BIRTHDAY);
                    }else{
                        $scope.userName ="";
                        $scope.userSex = "";
                        $scope.userAge = "";
                    }
                }else if($scope.healthManageType==4){
                    //运动
                    $scope.moveInfo =  {moveIntensity: "", whenLong: "",date:today,moveType:""};
                    //运动类型列表初始化
                    $scope.moveTypeList = [
                        {"moveType":"散步","moveTypeValue":0,"selectFlag":false},
                        {"moveType":"快走","moveTypeValue":1,"selectFlag":false},
                        {"moveType":"慢跑","moveTypeValue":2,"selectFlag":false},
                        {"moveType":"跑步","moveTypeValue":3,"selectFlag":false},
                        {"moveType":"游泳","moveTypeValue":4,"selectFlag":false},
                        {"moveType":"登山","moveTypeValue":5,"selectFlag":false},
                        {"moveType":"打球","moveTypeValue":6,"selectFlag":false},
                        {"moveType":"其他","moveTypeValue":7,"selectFlag":false}
                    ];
                    $scope.title = "请选择运动强度";
                    //运动强度列表初始化
                    menus = [
                        {"text":"非常轻松","value":0},
                        {"text":"很轻松","value":1},
                        {"text":"尚轻松","value":2},
                        {"text":"稍累","value":3},
                        {"text":"累","value":4},
                        {"text":"很累","value":5},
                        {"text":"精疲力竭","value":6}
                    ];
                    $scope.pickerItems = menus;
                }
            }
        });
        /**
         * 点击选择日期
         */
        $scope.selectHealthDate = function () {
            $scope.show();
        };
        /**
         * 绑定日期组件方法
         * @param params
         */
        $scope.weightBind = function (params) {
            $scope.show = params.show;
        };
        /**
         * 选择日期完成
         * @param params
         * @returns {boolean}
         */
        $scope.onFinash = function (params) {
            if($scope.healthManageType==1){
                $scope.weightInfo.date = params[0].value + "/" + (params[1].value>9?params[1].value:("0"+params[1].value)) + "/" + (params[2].value>9?(params[2].value):("0"+params[2].value));
            }else if($scope.healthManageType==2){
                $scope.bloodPressureInfo.date = params[0].value + "/" + (params[1].value>9?params[1].value:("0"+params[1].value)) + "/" + (params[2].value>9?(params[2].value):("0"+params[2].value));
            }else if($scope.healthManageType==3){
                $scope.bloodSugarInfo.date = params[0].value + "/" + (params[1].value>9?params[1].value:("0"+params[1].value)) + "/" + (params[2].value>9?(params[2].value):("0"+params[2].value));
            }else if($scope.healthManageType==4){
                $scope.moveInfo.date = params[0].value + "/" + (params[1].value>9?params[1].value:("0"+params[1].value)) + "/" + (params[2].value>9?(params[2].value):("0"+params[2].value));
            }
            return true;
        };
        //列表组件的绑定
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
        };
        //选择列表组件
        $scope.selectItem = function (params) {
            //运动强度
            if($scope.healthManageType==4){
                $scope.itemValue = params.item.value;
                $scope.moveInfo.moveIntensity =params.item.text;
            }else if($scope.healthManageType==3){
                //血糖类型
                $scope.bloodSugarInfo.sugarType =params.item.text;
                $scope.itemValue = params.item.value;
            }
        };
        //点击展示列表组件
        $scope.selectMoveIntensity = function(){
            if(($scope.bloodSugarInfo!=undefined&&$scope.bloodSugarInfo.sugarValue == "" && $scope.healthManageType==3)
                ||($scope.moveInfo!=undefined&&$scope.moveInfo.moveType == "" && $scope.healthManageType==4)){
                $scope.itemValue = undefined;
            }
            $scope.showPicker($scope.itemValue);
        };
        //选择运动类型
        $scope.selectMoveType = function(index,typeText){
            $scope.moveTypeList[index].selectFlag = !$scope.moveTypeList[index].selectFlag;
            if($scope.moveInfo.moveType){
                $scope.moveInfo.moveType = $scope.moveInfo.moveType+","+typeText;
            }else{
                $scope.moveInfo.moveType = typeText;
            }
        };
        //限制数字位数
        $scope.tofix = function(param){
            switch (param){
                case  'high':
                    if($scope.weightInfo.high <= 300.0){
                        if(($scope.weightInfo.high+"").indexOf(".")>-1){
                            var index = ($scope.weightInfo.high+"").indexOf(".");
                            $scope.weightInfo.high = ($scope.weightInfo.high+"").substr(0,index+2);
                        }
                        $scope.weightInfo.highOld = $scope.weightInfo.high;
                    }
                    else if($scope.weightInfo.high > 300.0){
                        $scope.weightInfo.high = $scope.weightInfo.highOld;
                        KyeeMessageService.broadcast({
                            content: "身高输入范围为：20.0cm～300.0cm"
                        });
                    }
                    break;
                case 'weight':
                    if($scope.weightInfo.weight <= 200.0){
                        if(($scope.weightInfo.weight+"").indexOf(".")>-1){
                            var index = ($scope.weightInfo.weight+"").indexOf(".");
                            $scope.weightInfo.weight = ($scope.weightInfo.weight+"").substr(0,index+2);
                        }
                        $scope.weightInfo.weightOld = $scope.weightInfo.weight;
                    }
                    else if($scope.weightInfo.weight > 200.0){
                        $scope.weightInfo.weight = $scope.weightInfo.weightOld;
                        KyeeMessageService.broadcast({
                            content: "体重输入范围为：2.0kg～200.0kg"
                        });
                    }
                    break;
                case 'pressH':
                    if($scope.bloodPressureInfo.systolicPressure <= 300.0){
                        if(($scope.bloodPressureInfo.systolicPressure+"").indexOf(".")>-1){
                            var index = ($scope.bloodPressureInfo.systolicPressure+"").indexOf(".");
                            $scope.bloodPressureInfo.systolicPressure = ($scope.bloodPressureInfo.systolicPressure+"").substr(0,index);
                        }
                        $scope.bloodPressureInfo.systolicPressureOld = $scope.bloodPressureInfo.systolicPressure;
                    }
                    else if($scope.bloodPressureInfo.systolicPressure > 300.0){
                        $scope.bloodPressureInfo.systolicPressure = $scope.bloodPressureInfo.systolicPressureOld;
                        KyeeMessageService.broadcast({
                            content: "收缩压输入范围为：30mmHg～300mmHg"
                        });
                    }
                    break;
                case 'pressL':
                    if($scope.bloodPressureInfo.diastolicPressure <= 300.0){
                        if(($scope.bloodPressureInfo.diastolicPressure+"").indexOf(".")>-1){
                            var index = ($scope.bloodPressureInfo.diastolicPressure+"").indexOf(".");
                            $scope.bloodPressureInfo.diastolicPressure = ($scope.bloodPressureInfo.diastolicPressure+"").substr(0,index);
                        }
                        $scope.bloodPressureInfo.diastolicPressureOld = $scope.bloodPressureInfo.diastolicPressure;
                    }
                    else if($scope.bloodPressureInfo.diastolicPressure > 300.0){
                        $scope.bloodPressureInfo.diastolicPressure = $scope.bloodPressureInfo.diastolicPressureOld;
                        KyeeMessageService.broadcast({
                            content: "舒张压输入范围为：30mmHg～300mmHg"
                        });
                    }
                    break;
                case 'rate':
                    if($scope.bloodPressureInfo.heartRate <= 200.0){
                        if(($scope.bloodPressureInfo.heartRate+"").indexOf(".")>-1){
                            var index = ($scope.bloodPressureInfo.heartRate+"").indexOf(".");
                            $scope.bloodPressureInfo.heartRate = ($scope.bloodPressureInfo.heartRate+"").substr(0,index);
                        }
                        $scope.bloodPressureInfo.heartRateOld = $scope.bloodPressureInfo.heartRate;
                    }
                    else if($scope.bloodPressureInfo.heartRate > 200.0){
                        $scope.bloodPressureInfo.heartRate = $scope.bloodPressureInfo.heartRateOld;
                        KyeeMessageService.broadcast({
                            content: "心率输入范围为：30bpm～200bpm"
                        });
                    }
                    break;
                case 'sugar':
                    if($scope.bloodSugarInfo.sugarValue <= 33.8){
                        if(($scope.bloodSugarInfo.sugarValue+"").indexOf(".")>-1){
                            var index = ($scope.bloodSugarInfo.sugarValue+"").indexOf(".");
                            $scope.bloodSugarInfo.sugarValue = ($scope.bloodSugarInfo.sugarValue+"").substr(0,index+2);
                        }
                        $scope.bloodSugarInfo.sugarValueOld = $scope.bloodSugarInfo.sugarValue;
                    }
                    else if($scope.bloodSugarInfo.sugarValue > 33.8){
                        $scope.bloodSugarInfo.sugarValue = $scope.bloodSugarInfo.sugarValueOld;
                        KyeeMessageService.broadcast({
                            content: "血糖输入范围为：0.6mmol/L～33.8mmol/L"
                        });
                    }
                    break;
                case 'sport':
                    if($scope.moveInfo.whenLong <= 300.0){
                        if(($scope.moveInfo.whenLong+"").indexOf(".")>-1){
                            var index = ($scope.moveInfo.whenLong+"").indexOf(".");
                            $scope.moveInfo.whenLong = ($scope.moveInfo.whenLong+"").substr(0,index+2);
                        }
                        $scope.moveInfo.whenLongOld = $scope.moveInfo.whenLong;
                    }
                    else if($scope.moveInfo.whenLong > 300.0){
                        $scope.moveInfo.whenLong = $scope.moveInfo.whenLongOld;
                    }
                    break;
            }



        };
        //校验输入的是否正浮点数，返回false，不是数字返回true
        var validNumber = function(str){
            var reg = new RegExp("^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$");
            if(reg.test(str)){
                return false;
            }else{
                return true;
            }
        };
        //校验输入的是否为正整数，是返回false，不是返回true
        var validIntNumber = function(str){
            var reg = new RegExp("^[0-9]*[1-9][0-9]*$");
            if(reg.test(str)){
                return false;
            }else{
                return true;
            }
        };
        //校验输入的是否是今天之前的日期，是返回false，不是返回true
        var validDate = function(str){
            var now = new Date();
            var nowDay = now.getFullYear()+"/"+((now.getMonth()+1)>9?(now.getMonth()+1):("0"+(now.getMonth()+1)))+"/"+(now.getDate()>9?now.getDate():("0"+now.getDate()));
            if(str>nowDay){
                KyeeMessageService.broadcast({
                    content: "请选择今天或之前的日期"
                });
                return false;
            }else{
                return true;
            }
        };
        var validWeightInfo = function(weightInfo){
            var validFlag  = true;
            if(!weightInfo.date){
                KyeeMessageService.broadcast({
                    content: "请选择测量日期"
                });
                validFlag  = false;
                return validFlag;
            }
            if(weightInfo.high){
                var tem = parseFloat(weightInfo.high);
                if(parseFloat(weightInfo.high)<20.0||parseFloat(weightInfo.high)>300.0){
                    KyeeMessageService.broadcast({
                        content: "身高输入范围为：20.0cm～300.0cm"
                    });
                    validFlag  = false;
                    return validFlag;
                }
                if(validNumber(weightInfo.high)){
                    KyeeMessageService.broadcast({
                        content: "身高输入有误，请重新输入"
                    });
                    validFlag  = false;
                    return validFlag;
                }
            }else{
                KyeeMessageService.broadcast({
                    content: "请输入身高"
                });
                validFlag  = false;
                return validFlag;
            }
            if(weightInfo.weight){
                if(validNumber(weightInfo.weight)){
                    KyeeMessageService.broadcast({
                        content: "体重输入有误，请重新输入"
                    });
                    validFlag  = false;
                    return validFlag;
                }else{
                    var tem = parseFloat(weightInfo.weight);
                    if(parseFloat(weightInfo.weight)<2.0||parseFloat(weightInfo.weight)>300.0){
                        KyeeMessageService.broadcast({
                            content: "体重输入范围为：2.0kg～300.0kg"
                        });
                        validFlag  = false;
                        return validFlag;
                    }
                }
            }else{
                KyeeMessageService.broadcast({
                    content: "请输入体重值"
                });
                validFlag  = false;
                return validFlag;
            }
            return validFlag;
        };
        var validBloodPressureInfo = function(bloodPressureInfo){
            var validFlag  = true;
            if(!bloodPressureInfo.date){
                KyeeMessageService.broadcast({
                    content: "请选择测量日期"
                });
                validFlag  = false;
                return validFlag;
            }
            if(bloodPressureInfo.systolicPressure){
                if(validIntNumber(bloodPressureInfo.systolicPressure)){
                    KyeeMessageService.broadcast({
                        content: "收缩压输入有误，请重新输入"
                    });
                    validFlag  = false;
                    return validFlag;
                }else{
                    if(parseInt(bloodPressureInfo.systolicPressure)>300||parseInt(bloodPressureInfo.systolicPressure)<30){
                        KyeeMessageService.broadcast({
                            content: "血压输入范围为：30～300mmol/L"
                        });
                        validFlag  = false;
                        return validFlag;
                    }
                }
            }else{
                KyeeMessageService.broadcast({
                    content: "请输入收缩压"
                });
                validFlag  = false;
                return validFlag;
            }
            if(bloodPressureInfo.diastolicPressure){
                if(validIntNumber(bloodPressureInfo.diastolicPressure)){
                    KyeeMessageService.broadcast({
                        content: "舒张压输入有误，请重新输入"
                    });
                    validFlag  = false;
                    return validFlag;
                }else{
                    if(parseInt(bloodPressureInfo.diastolicPressure)<30||parseInt(bloodPressureInfo.diastolicPressure)>300){
                        KyeeMessageService.broadcast({
                            content: "血压输入范围为：30～300mmHg"
                        });
                        validFlag  = false;
                        return validFlag;
                    }
                }
            }else{
                KyeeMessageService.broadcast({
                    content: "请输入舒张压"
                });
                validFlag  = false;
                return validFlag;
            }
            if(bloodPressureInfo.heartRate){
                if(validNumber(bloodPressureInfo.heartRate)){
                    KyeeMessageService.broadcast({
                        content: "心率输入有误，请重新输入"
                    });
                    validFlag  = false;
                    return validFlag;
                }
            }else{
                KyeeMessageService.broadcast({
                    content: "请输入心率"
                });
                validFlag  = false;
                return validFlag;
            }
            return validFlag;
        };
        var validBloodSugarInfo = function(bloodSugarInfo){
            var validFlag  = true;
            if(!bloodSugarInfo.date){
                KyeeMessageService.broadcast({
                    content: "请选择测量日期"
                });
                validFlag  = false;
                return validFlag;
            }
            if(!bloodSugarInfo.sugarType){
                KyeeMessageService.broadcast({
                    content: "请选择类型"
                });
                validFlag  = false;
                return validFlag;
            }
            if(bloodSugarInfo.sugarValue){
                if(validNumber(bloodSugarInfo.sugarValue)){
                    KyeeMessageService.broadcast({
                        content: "血糖值输入有误，请重新输入"
                    });
                    validFlag  = false;
                    return validFlag;
                }else{
                    if(parseFloat(bloodSugarInfo.sugarValue)<0.6||parseFloat(bloodSugarInfo.sugarValue)>33.8){
                        KyeeMessageService.broadcast({
                            content: "血糖输入范围为：0.6～33.8mmol/L"
                        });
                        validFlag  = false;
                        return validFlag;
                    }
                }
            }else{
                KyeeMessageService.broadcast({
                    content: "请输入血糖值"
                });
                validFlag  = false;
                return validFlag;
            }
            return validFlag;
        };
        var validMoveInfo = function(moveInfo){
            var validFlag  = true;
            if(!moveInfo.date){
                KyeeMessageService.broadcast({
                    content: "请选择运动日期"
                });
                validFlag  = false;
                return validFlag;
            }
            if(!moveInfo.moveIntensity){
                KyeeMessageService.broadcast({
                    content: "请选择运动强度"
                });
                validFlag  = false;
                return validFlag;
            }
            if(moveInfo.whenLong){
                if(validIntNumber(moveInfo.whenLong)){
                    KyeeMessageService.broadcast({
                        content: "运动时长输入有误，请重新输入"
                    });
                    validFlag  = false;
                    return validFlag;
                }
            }else{
                KyeeMessageService.broadcast({
                    content: "请输入运动时长"
                });
                validFlag  = false;
                return validFlag;
            }
            if(moveInfo.moveType === ""){
                KyeeMessageService.broadcast({
                    content: "请选择运动类型"
                });
                validFlag  = false;
                return validFlag;
            }
            return validFlag;
        };
        //保存
        $scope.healthSave = function() {
            var params = {};
            var currentUserRecord =  CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);//用户缓存
            if(!currentUserRecord){
                //如果用户没登录，则不能保存
                return ;
            }
            if ($scope.healthManageType == 1) {
                if(!validDate($scope.weightInfo.date)||!validWeightInfo($scope.weightInfo)){
                    return ;
                }
                params = {
                    USER_ID:currentUserRecord.USER_ID,
                    HEIGHT:$scope.weightInfo.high,
                    WEIGHT:$scope.weightInfo.weight,
                    WEIGHT_DATE:$scope.weightInfo.date,
                    op:"recordWeightActionC"
                }
            } else if ($scope.healthManageType == 2) {
                if(!validDate($scope.bloodPressureInfo.date)||!validBloodPressureInfo($scope.bloodPressureInfo)){
                    return ;
                }
                params = {
                    USER_ID:currentUserRecord.USER_ID,
                    SYSTOLIC_PRESSURE:$scope.bloodPressureInfo.systolicPressure,
                    DIASTOLIC_PRESSURE:$scope.bloodPressureInfo.diastolicPressure,
                    HEART_RATE:$scope.bloodPressureInfo.heartRate,
                    PRESSURE_DATE:$scope.bloodPressureInfo.date,
                    op:"recordBloodPressureActionC"
                }
            } else if ($scope.healthManageType == 3) {
                if(!validDate($scope.bloodSugarInfo.date)||!validBloodSugarInfo($scope.bloodSugarInfo)){
                    return ;
                }

                params = {
                    USER_ID:currentUserRecord.USER_ID,
                    MEASURE_TIME:$scope.itemValue,
                    BLOOD_SUGAR:$scope.bloodSugarInfo.sugarValue,
                    BLOOD_SUGAR_DATE:$scope.bloodSugarInfo.date,
                    op:"recordBloodSugarActionC"
                }
            } else if ($scope.healthManageType == 4) {
                if(!validDate($scope.moveInfo.date)||!validMoveInfo($scope.moveInfo)){
                    return ;
                }
                params = {
                    USER_ID:currentUserRecord.USER_ID,
                    EXERCISE_TYPE:$scope.moveInfo.moveType,
                    EXERCISE_INTENSITY:$scope.itemValue,
                    EXERCISE_TIME:$scope.moveInfo.whenLong,
                    EXERCISE_DATE:$scope.moveInfo.date,
                    op:"recordExerciseActionC"
                }
            }else{
                return;
            }
            WeightAddService.addHealthInfo(params,function(result){
                //体重添加
                if ($scope.healthManageType == 1) {
                    WeightManageService.showType = "weight";
                    WeightAddService.firstIn?(WeightManageService.firstIn = true):(WeightManageService.firstIn = false);
                    WeightManageService.saves = saves++;
                    $state.go("weight_manage");
                } else if ($scope.healthManageType == 2) {
                    //血压
                    WeightManageService.showType = "pressure";
                    WeightAddService.firstIn?(WeightManageService.firstIn = true):(WeightManageService.firstIn = false);
                    WeightManageService.hasSaved = true;
                    WeightManageService.saves = saves++;
                    $state.go("weight_manage");
                } else if ($scope.healthManageType == 3) {
                    //血糖
                    $scope.bloodSugarInfo = {sugarType: "", sugarValue: "",date:today};
                    WeightManageService.showType = "sugar";
                    WeightManageService.sugarItem = $scope.itemValue+1;
                    WeightAddService.firstIn?(WeightManageService.firstIn = true):(WeightManageService.firstIn = false);
                    WeightManageService.hasSaved = true;
                    WeightManageService.saves = saves++;
                    $state.go("weight_manage");
                } else if ($scope.healthManageType == 4) {
                    //运动
                    $scope.moveInfo =  {moveIntensity: "", whenLong: "",date:today,moveType:""};
                    WeightManageService.showType = "sport";
                    WeightAddService.firstIn?(WeightManageService.firstIn = true):(WeightManageService.firstIn = false);
                    WeightManageService.hasSaved = true;
                    WeightManageService.saves = saves++;
                    $state.go("weight_manage");
                }
            })
        }
    })
    .build();