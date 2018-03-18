/*
 * 产品名称：quyiyuan
 * 创建人:
 * 创建日期:
 * 创建原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.weightManage.controller")
    .require([
        "kyee.quyiyuan.health.weightManage.service",
        "kyee.quyiyuan.health.healthManage.service",
        "kyee.quyiyuan.health.weight.add.controller",
        "kyee.quyiyuan.health.weight.add.service",
        "kyee.quyiyuan.center.controller.blood_pressure_standard",
        "kyee.quyiyuan.center.controller.blood_sugar_standard",
        "kyee.quyiyuan.center.controller.weight_standard"
    ])
    .type("controller")
    .name("WeightManageController")
    .params([
        "$scope",
        "$state",
        "WeightManageService",
        "KyeeListenerRegister",
        "KyeeUtilsService",
        "CacheServiceBus",
        "WeightAddService",
        "CenterUtilService",
        "$ionicHistory"
    ])
    .action(function ($scope,
                      $state,
                      WeightManageService,
                      KyeeListenerRegister,
                      KyeeUtilsService,
                      CacheServiceBus,
                      WeightAddService,
                      CenterUtilService,
                      $ionicHistory
    ) {

        /**
         * 所有字段初始化
         * @type {{}}
         */
        $scope.userInfo = {
            NAME: "",              //姓名
            sexView: "",              //性别
            age:"",                   //年龄
            showType:WeightManageService.showType,
            marginRate:0,
            height:"",              //身高
            weight:[],                //体重
            weightWeek:[],
            weightShow:false,           //今日是否已录入
            weightLevel:"",          //体重分数
            weightValue:"",             //体重等级
            weightData:[],              //体重时间
            weightWeekData:[],              //体重时间
            weightDataNew:"",
            BMI: "",                  //BMI
            dataShow:'day',
            sugarTime:1,

            pressureLevel:"",           //血压分数
            pressureValue:"",
            pressureHeight:[],          //高压
            pressureLow:[],             //低压
            heartRate:"",               //心率
            pressureData:[],               //血压时间
            pressureDataNew:"",

            sugar:[],
            sugarNew:"",
            sugarData:[],
            allSugar:[],
            sugarDataNew:"",
            sugarLevel:"",
            sugarTimeNew:"",
            measureTimeNew:"",
            sugarItem:WeightManageService.sugarItem,

            sportLevel:"",              //运动强度
            sportValue:"",
            sportTime:[],           //运动时长
            sportData:[],                //运动时间
            sportDataNew:"",
            sportType:[]         //运动类型

        };
        $scope.dataLength = 0;
        $scope.tagPos = {
          'margin-left':$scope.userInfo.marginRate
        };
        var memoryCache = CacheServiceBus.getMemoryCache();
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "weight_manage",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goToHealth();
            }
        });
        KyeeListenerRegister.regist({
            focus: "weight_manage",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
                getAppUser();
                if(WeightManageService.showType == "weight"){
                    WeightManageService.queryWeight($scope.userId,0,500,0,"CONTINUE","getsWeightActionC",function (data) {
                        var lenght = data[0].length;
                        for(var i = 0; i<lenght;i++){
                             $scope.userInfo.weightData[i] = data[0][lenght-1-i].WEIGHT_DATE;
                             $scope.userInfo.weight[i] = data[0][lenght-1-i].WEIGHT;
                        }
                        for(var i=0; i<data[1].length;i++){
                            $scope.userInfo.weightWeekData[i] = data[1][data[1].length-1-i].WEIGHT_DATE_WEEK;
                            $scope.userInfo.weightWeek[i] = Number(parseFloat(data[1][data[1].length-1-i].WEIGHT_WEEK).toFixed(2));
                        }
                        $scope.userInfo.weightDataNew = data[0][0].WEIGHT_DATE;
                        $scope.userInfo.height = data[0][0].HEIGHT;
                        $scope.userInfo.BMI = data[0][0].BMI;
                        $scope.dataLength = data[0].length;
                        $scope.userInfo.dataShow = 'day';
                        dealWeight($scope.userInfo.weight,"w");
                        dealData($scope.userInfo.weightData);
                        dealBMI($scope.userInfo.BMI);
                        showWeightDay();
                    });
                }else if(WeightManageService.showType == "pressure"){
                    WeightManageService.queryWeight($scope.userId,0,500,0,"CONTINUE","getsBloodPressureActionC",function (data) {
                        for(var i = 0; i<data.length;i++){
                            $scope.userInfo.pressureData[i] = data[data.length-1-i].PRESSURE_DATE;
                            $scope.userInfo.pressureHeight[i] = data[data.length-1-i].SYSTOLIC_PRESSURE;
                            $scope.userInfo.pressureLow[i] = data[data.length-1-i].DIASTOLIC_PRESSURE;

                        }
                        $scope.userInfo.heartRate = data[0].HEART_RATE;
                        $scope.userInfo.pressureDataNew = data[0].PRESSURE_DATE;
                        $scope.userInfo.pressureLevel = Number(data[0].PRESSURE_TYPE.split("-")[0])+1;
                        var left = Number(data[0].PRESSURE_TYPE.split("-")[1]);
                        if(left == 1){
                            $scope.tagPos = {
                                'margin-left':"16.7%"
                            };
                        }else if(left == 2){
                            $scope.tagPos = {
                                'margin-left':"50%"
                            };
                        }else if(left == 3){
                            $scope.tagPos = {
                                'margin-left':"83.3%"
                            };
                        }
                        dealWeight($scope.userInfo.pressureHeight,"p");
                        dealWeight($scope.userInfo.pressureLow,"p");
                        dealData($scope.userInfo.pressureData);
                        showPressure();
                    });
                 }else if(WeightManageService.showType == "sugar"){
                    WeightManageService.queryWeight($scope.userId,0,500,500,"CONTINUE","getsBloodSugarActionC",function (data) {
                        $scope.userInfo.allSugar = data[1];
                        for(var i = 0; i<data[1][0].length;i++){
                            $scope.userInfo.sugarData[i] = data[1][0][data[1][0].length-1-i].BLOOD_SUGAR_DATE;
                            $scope.userInfo.sugar[i] = data[1][0][data[1][0].length-1-i].BLOOD_SUGAR;
                        }

                        $scope.userInfo.sugarDataNew = data[0].BLOOD_SUGAR_DATE;
                        $scope.userInfo.sugarNew = data[0].BLOOD_SUGAR;
                        $scope.userInfo.measureTimeNew = data[0].MEASURE_TIME;
                        var level = Number(data[0].BLOOD_SUGAR_TYPE.split("-")[0]);
                        if(level == 4){
                            level = 6;
                        }
                        $scope.userInfo.sugarLevel = level+1;
                        var left = Number(data[0].BLOOD_SUGAR_TYPE.split("-")[1]);
                        if(left == 1){
                            $scope.tagPos = {
                                'margin-left':"16.7%"
                            };
                        }else if(left == 2){
                            $scope.tagPos = {
                                'margin-left':"50%"
                            };
                        }else if(left == 3){
                            $scope.tagPos = {
                                'margin-left':"83.3%"
                            };
                        }
                        $scope.dataLength = data[0].length-1;
                        dealWeight($scope.userInfo.sugar,"su");
                        dealData($scope.userInfo.sugarData);
                        dealMeasureTime($scope.userInfo.measureTimeNew);
                        if(WeightManageService.sugarItem !=undefined){
                            $scope.userInfo.sugarTime = WeightManageService.sugarItem;
                            $scope.turnSugar($scope.userInfo.sugarTime);
                        }else{
                            showSugar();
                        }
                    });
                }else if(WeightManageService.showType == "sport"){
                    WeightManageService.queryWeight($scope.userId,0,500,0,"CONTINUE","getsExerciseActionC",function (data) {
                        for(var i = 0; i<data.length;i++){
                            $scope.userInfo.sportData[i] = data[data.length-1-i].EXERCISE_DATE;
                            $scope.userInfo.sportTime[i] = data[data.length-1-i].EXERCISE_TIME;
                            $scope.userInfo.sportType[i] = data[data.length-1-i].EXERCISE_TYPE.split(",");
                        }
                        $scope.dataLength = data.length-1;
                        $scope.userInfo.sportLevel = data[0].EXERCISE_INTENSITY;
                        $scope.userInfo.sportDataNew = data[0].EXERCISE_DATE;
                        $scope.userInfo.sportTimeNew = data[0].EXERCISE_TIME;
                        dealData($scope.userInfo.sportData);
                        dealWeight($scope.userInfo.sportTime,"sp");
                        dealSportLevel( $scope.userInfo.sportLevel);
                        dealSportType($scope.userInfo.sportType);
                        showSport();
                    });
                }
            }
        });
        var getMin = function (data) {
            var min = 1000;
            for(var i = 0;i<data.length;i++){
                if(data[i] == null ){
                    continue;
                }
                if(min>data[i]){
                    min=data[i];
                }
            };
            return min;
        };
        var showWeightDay = function () {
            var weightChart = echarts.init(document.getElementById('containerW'));
            var length = $scope.userInfo.weightData.length;
            var max = 100;
            var min = 0;
            var startvalue;
            var endvalue;
            var interval;
            var data = {
                    categories:$scope.userInfo.weightData.slice(0,length),
                    data:$scope.userInfo.weight.slice(0,length)
                };
            if(length > 1) {
                max = Math.ceil(Math.max.apply(Math, data.data));
                min = Math.floor(getMin($scope.userInfo.weight));
                interval = Math.ceil((max - min) / 3);
                if(interval == 0){
                    interval = 1;
                }
                max = (interval - (max - min) % interval) + max+interval;
                min = min-interval;
                if(min < 0){
                    min = 0;
                    max = 0+interval*5;
                }
            }else if(length == 1){
                max = data.data[0];
                interval = Math.ceil((max - min) / 3);
                if(interval == 0){
                    interval = 1;
                }
                max = (interval - (max - min) % interval) + max+interval;
                min = min-interval;
                if(min < 0){
                    min = 0;
                    max = 0+interval*5;
                }
            }
                startvalue = length-1;
                endvalue = length-4;
                data.data[data.data.length-1]={
                    value:$scope.userInfo.weight[length-1],
                    symbol:'circle',
                    symbolSize:7
                };
            var option = {
                xAxis:  {
                    type: 'category',
                    boundaryGap: true,
                    data: data.categories,
                    axisLine: {show: false},
                    axisTick: {
                        show: false
                    }
                },
                grid:{
                    show:true,
                    left:"10%",
                    right:"5%",
                    top:20,
                    bottom:20,
                    borderWidth:0
                } ,
                yAxis: {
                    max:max,
                    min:min,
                    axisLine: {show: false},
                    interval:interval,
                    // 控制网格线是否显示
                    // 去除y轴上的刻度线
                    axisTick: {
                        show: false
                    },
                    splitLine: {           // 分隔线
                        show: true,        // 默认显示，属性show控制显示与否
                        // onGap: null,
                        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                            color: ['#d9d9d9'],
                            width: 1,
                            type: 'dash'
                        }
                    },
                    splitArea: {           // 分隔区域
                        show: true,       // 默认不显示，属性show控制显示与否
                        // onGap: null,
                        areaStyle: {       // 属性areaStyle（详见areaStyle）控制区域样式
                            color: ['#f6fffc']
                        }
                    }
                },
                dataZoom: [
                    {
                        type: 'inside',
                        xAxisIndex: [0],
                        startValue: startvalue,
                        endValue:endvalue,
                    }
                ],
                series: [
                    {
                        smooth:true,  //这句就是让曲线变平滑的
                        type:'line',
                        connectNulls:true ,
                        data:data.data,
                        symbolSize:7,
                        itemStyle : {
                            normal : {
                                color:'#5baa8a',
                                fillerColor:'#5baa8a',
                                width:1,
                                lineStyle:{
                                    color:'#5baa8a',
                                    width:1
                                }
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                formatter: '{c} kg',

                                textStyle:{
                                    fontSize:12,
                                    color:"green"
                                }
                            }
                        }
                    }
                ]
            };
            if(length == 1){
                option.dataZoom = [];
            }
            weightChart.setOption(option);
        };
        var showWeightWeek = function () {
            var weightChart = echarts.init(document.getElementById('containerW'));
            var length = $scope.userInfo.weightData.length;
            var length2 = $scope.userInfo.weightWeekData.length;
            var max = 100;
            var min = 0;
            var startvalue;
            var endvalue;
            var interval;
            var data = {
                    categories:$scope.userInfo.weightWeekData.slice(0,length2),
                    data:$scope.userInfo.weightWeek.slice(0,length2)
                };
            if(length2 > 1) {
                max = Math.ceil(Math.max.apply(Math, data.data));
                min = Math.floor(getMin($scope.userInfo.weightWeek));
                interval = Math.ceil((max - min) / 3);
                if(interval == 0){
                    interval = 1;
                }
                max = (interval - (max - min) % interval) + max+interval;
                min = min-interval;
                if(min < 0){
                    min = 0;
                    max = 0+interval*5;
                }
            }else if(length2 == 1){
                max = data.data[0];
                interval = Math.ceil((max - min) / 3);
                if(interval == 0){
                    interval = 1;
                }
                max = (interval - (max - min) % interval) + max+interval;
                min = min-interval;
                if(min < 0){
                    min = 0;
                    max = 0+interval*5;
                }
            }
                startvalue = length2-1;
                endvalue = length2-4;
                data.data[data.data.length-1]={
                    value:$scope.userInfo.weightWeek[length2-1],
                    symbol:'circle',
                    symbolSize:7
                };
            weightChart.clear();
            var option = {
                xAxis:  {
                    type: 'category',
                    boundaryGap: true,
                    data: data.categories,
                    axisLine: {show: false},
                    axisTick: {
                        show: false
                    }
                },
                grid:{
                    show:true,
                    left:"10%",
                    right:"5%",
                    top:20,
                    bottom:20,
                    borderWidth:0
                } ,
                yAxis: {
                    max:max,
                    min:min,
                    axisLine: {show: false},
                    interval:interval,
                    // 控制网格线是否显示
                    // 去除y轴上的刻度线
                    axisTick: {
                        show: false
                    },
                    splitLine: {           // 分隔线
                        show: true,        // 默认显示，属性show控制显示与否
                        // onGap: null,
                        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                            color: ['#d9d9d9'],
                            width: 1,
                            type: 'dash'
                        }
                    },
                    splitArea: {           // 分隔区域
                        show: true,       // 默认不显示，属性show控制显示与否
                        // onGap: null,
                        areaStyle: {       // 属性areaStyle（详见areaStyle）控制区域样式
                            color: ['#f6fffc']
                        }
                    }
                },
                dataZoom: [
                    {
                        type: 'inside',
                        xAxisIndex: [0],
                        startValue: startvalue,
                        endValue:endvalue,
                    }
                ],
                series: [
                    {
                        smooth:true,  //这句就是让曲线变平滑的
                        type:'line',
                        connectNulls:true ,
                        data:data.data,
                        symbolSize:7,
                        itemStyle : {
                            normal : {
                                color:'#5baa8a',
                                fillerColor:'#5baa8a',
                                width:1,
                                lineStyle:{
                                    color:'#5baa8a',
                                    width:1
                                }
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                formatter: '{c} kg',

                                textStyle:{
                                    fontSize:12,
                                    color:"green"
                                }
                            }
                        }
                    }
                ]
            };
            if(length2 == 1){
                option.dataZoom = [];
            }
            weightChart.setOption(option);
        };

        var showPressure = function () {
            var pressureChart = echarts.init(document.getElementById('containerP'));
            var length = $scope.userInfo.pressureData.length;
            var max = 200;
            var min = 0;
            var startvalue;
            var endvalue;
            var interval;
            var data = {
                categories:$scope.userInfo.pressureData,
                data: $scope.userInfo.pressureHeight.slice(0,length),
                data2:$scope.userInfo.pressureLow.slice(0,length)
            };
            if(length>=1) {
                max = Math.max.apply(Math, data.data);
                min = getMin($scope.userInfo.pressureLow);
                interval = Math.ceil((max - min) / 4);
                if(interval == 0){
                 interval = 1;
                }
                min = min - 2;
                max = min + interval*5;
            }
            data.data[data.data.length-1]={
                value:$scope.userInfo.pressureHeight[length-1],
                symbol:'circle',
                symbolSize:7
            };
            data.data2[data.data2.length-1]={
                value:$scope.userInfo.pressureLow[length-1],
                symbol:'circle',
                symbolSize:7
            };
            pressureChart.clear();
            var option = {
                xAxis:  {
                    type: 'category',
                    boundaryGap: true,
                    data: data.categories,
                    axisLine: {show: false},
                    axisTick: {
                        show: false
                    },
                },
                grid:{
                    show:true,
                    left:"10%",
                    right:"5%",
                    top:20,
                    bottom:20,
                    borderWidth:0
                } ,

                yAxis: {
                    interval:interval,
                    max:max,
                    min:min,
                    axisLine: {show: false},
                    // 控制网格线是否显示
                    // 去除y轴上的刻度线
                    axisTick: {
                        show: false
                    },
                    splitLine: {           // 分隔线
                        show: true,        // 默认显示，属性show控制显示与否
                        // onGap: null,
                        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                            color: ['#d9d9d9'],
                            width: 1,
                            type: 'dashed'
                        }
                    },
                    splitArea: {           // 分隔区域
                        show: true,       // 默认不显示，属性show控制显示与否
                        // onGap: null,
                        areaStyle: {       // 属性areaStyle（详见areaStyle）控制区域样式
                            color: ['#f6fffc']
                        }
                    }
                },
                dataZoom: [
                    {
                        type: 'inside',
                        xAxisIndex: [0],
                        startValue: length-1,
                        endValue:length-4
                    }
                ],

                series: [
                    {
                        smooth:true,  //这句就是让曲线变平滑的
                        type:'line',
                        connectNulls:true ,
                        data:data.data,
                        symbolSize:7,
                        itemStyle : {
                            normal : {
                                color:'#3591ef',
                                fillerColor:'#3591ef',
                                width:1,
                                lineStyle:{
                                    color:'#3591ef',
                                    width:1
                                }
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                formatter: '{c} mmHg',

                                textStyle:{
                                    fontSize:12,
                                    color:"#3591ef"
                                }
                            }
                        }
                    },
                    {
                        smooth:true,  //这句就是让曲线变平滑的
                        type:'line',
                        connectNulls:true ,
                        data:data.data2,
                        symbolSize:7,
                        itemStyle : {
                            normal : {
                                color:'#ff9900',
                                fillerColor:'#ff9900',
                                width:1,
                                lineStyle:{
                                    color:'#ff9900',
                                    width:1
                                }
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                formatter: '{c} mmHg',

                                textStyle:{
                                    fontSize:12,
                                    color:"#ff9900"
                                }
                            }
                        }
                    }
                ]
            };
            if(length == 1){
                option.dataZoom = [];
            }
            pressureChart.setOption(option);
        };
        var showSugar = function () {
            var sugarChart = echarts.init(document.getElementById('containerSu'));
            var length = $scope.userInfo.sugarData.length;
            var max = 15;
            var min = 0;
            var interval;
            var data = {
                categories:$scope.userInfo.sugarData.slice(0,length),
                data:$scope.userInfo.sugar.slice(0,length)
            };
            if(data.categories.length == 0){
                length = 1;
                var now =((new Date().getMonth()+1)>9)?(new Date().getMonth()+1):("0"+(new Date().getMonth()+1))+"."+new Date().getDate();
                data.categories = [now];
                data.data = [0];
                data.data[0]={
                    value:0,
                    symbol:'circle',
                    symbolSize:7
                };
            }else{
                max = Math.ceil(Math.max.apply(Math, data.data))+2;
                min = Math.floor(getMin($scope.userInfo.sugar))-2;
                interval = Math.ceil((max-min)/4);
                if(min<0){
                    min = 0;
                }
                if(interval == 0){
                    interval = 1;
                }
                max = (interval-(max-min)%interval)+max;
                data.data[data.data.length-1]={
                    value:$scope.userInfo.sugar[length-1],
                    symbol:'circle',
                    symbolSize:7
                };
            }

            var startvalue = length-1;
            var endvalue = length-4;
            sugarChart.clear();
            var option = {
                xAxis:  {
                    type: 'category',
                    boundaryGap: true,
                    data: data.categories,
                    axisLine: {show: false},
                    axisTick: {
                        show: false
                    },
                },
                grid:{
                    show:true,
                    left:"10%",
                    right:"5%",
                    top:20,
                    bottom:20,
                    borderWidth:0
                } ,

                yAxis: {
                    max:max,
                    min:min,
                    interval:interval,
                    axisLine: {show: false},
                    // 控制网格线是否显示
                    // 去除y轴上的刻度线
                    axisTick: {
                        show: false
                    },
                    splitLine: {           // 分隔线
                        show: true,        // 默认显示，属性show控制显示与否
                        // onGap: null,
                        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                            color: ['#d9d9d9'],
                            width: 1,
                            type: 'dash'
                        }
                    },
                    splitArea: {           // 分隔区域
                        show: true,       // 默认不显示，属性show控制显示与否
                        // onGap: null,
                        areaStyle: {       // 属性areaStyle（详见areaStyle）控制区域样式
                            color: ['#f6fffc']
                        }
                    }
                },
                dataZoom: [
                    {
                        type: 'inside',
                        xAxisIndex: [0],
                        startValue: startvalue,
                        endValue:endvalue
                    }
                ],

                series: [
                    {
                        smooth:true,  //这句就是让曲线变平滑的
                        type:'line',
                        connectNulls:true ,
                        data:data.data,
                        symbolSize:7,
                        itemStyle : {
                            normal : {
                                color:'#5baa8a',
                                fillerColor:'#5baa8a',
                                width:1,
                                lineStyle:{
                                    color:'#5baa8a',
                                    width:1
                                }
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                formatter: '{c} mmol/L',

                                textStyle:{
                                    fontSize:12,
                                    color:"green"
                                }
                            }
                        }
                    }
                ]
            };
            if(length == 1){
                option.dataZoom = [];
            }
            sugarChart.setOption(option);
        };
        var showSport = function () {
            var sportChart = echarts.init(document.getElementById('containerSp'));
            var length = $scope.userInfo.sportData.length;
            var max = 200;
            var min = 0;
            var interval;
            var startvalue = length-1;
            var endvalue = length-4;
            var data = {
                categories:$scope.userInfo.sportData.slice(0,length),
                data:$scope.userInfo.sportTime.slice(0,length)
            };
            if(length > 1) {
                max = Math.ceil(Math.max.apply(Math, data.data));
                min = Math.floor(getMin($scope.userInfo.sportTime));
                interval = Math.ceil((max - min) / 3);
                if(interval == 0){
                    interval = 1;
                }
                max = (interval - (max - min) % interval) + max+interval;
                min = min-interval;
                if(min < 0){
                    min = 0;
                    max = 0+interval*5;
                }
            }else if(length == 1){
                max = data.data[0];
                interval = Math.ceil((max - min) / 3);
                if(interval == 0){
                    interval = 1;
                }
                max = (interval - (max - min) % interval) + max+interval;
                min = min-interval;
                if(min < 0){
                    min = 0;
                    max = 0+interval*5;
                }
            }
            data.data[data.data.length-1] = {
                value:$scope.userInfo.sportTime[length-1],
                symbol:'circle',
                symbolSize:7
            };
            sportChart.clear();
            var option = {
                xAxis:  {
                    type: 'category',
                    boundaryGap: true,
                    data: data.categories,
                    axisLine: {show: false},
                    axisTick: {
                        show: false
                    },
                },
                grid:{
                    show:true,
                    left:"10%",
                    right:"5%",
                    top:20,
                    bottom:20,
                    borderWidth:0
                } ,

                yAxis: {
                    max:max,
                    min:min,
                    interval:interval,
                    axisLine: {show: false},
                    // 控制网格线是否显示
                    // 去除y轴上的刻度线
                    axisTick: {
                        show: false
                    },
                    splitLine: {           // 分隔线
                        show: true,        // 默认显示，属性show控制显示与否
                        // onGap: null,
                        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                            color: ['#d9d9d9'],
                            width: 1,
                            type: 'dash'
                        }
                    },
                    splitArea: {           // 分隔区域
                        show: true,       // 默认不显示，属性show控制显示与否
                        // onGap: null,
                        areaStyle: {       // 属性areaStyle（详见areaStyle）控制区域样式
                            color: ['#f6fffc']
                        }
                    }
                },
                dataZoom: [
                    {
                        type: 'inside',
                        xAxisIndex: [0],
                        startValue: startvalue,
                        endValue:endvalue
                    }
                ],

                series: [
                    {
                        smooth:true,  //这句就是让曲线变平滑的
                        type:'line',
                        connectNulls:true ,
                        data:data.data,
                        symbolSize:7,
                        itemStyle : {
                            normal : {
                                color:'#5baa8a',
                                fillerColor:'#5baa8a',
                                width:1,
                                lineStyle:{
                                    color:'#5baa8a',
                                    width:1
                                }
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                formatter: '{c} min',
                                textStyle:{
                                    fontSize:12,
                                    color:"green"
                                }
                            }
                        }
                    }
                ]
            };
            if(length == 1){
                option.dataZoom = [];
            }
            sportChart.setOption(option);
        };
        var dealBMI = function (bmi) {
            bmi = Number(bmi);
            if(bmi<18.5){
                $scope.userInfo.weightLevel = "偏瘦";
                $scope.userInfo.weightValue = 1;
                $scope.userInfo.marginRate = ((bmi)/18.5).toFixed(2)*100+"%";
            }else if(18.5<=bmi&&bmi<=23.9){
                $scope.userInfo.weightLevel = "正常";
                $scope.userInfo.weightValue = 2;
                $scope.userInfo.marginRate = ((bmi-18.5)/(23.9-18.5)).toFixed(2)*100+"%";
            }else if(23.9<bmi&&bmi<26.9){
                $scope.userInfo.weightLevel = "偏胖";
                $scope.userInfo.weightValue = 3;
                $scope.userInfo.marginRate = ((bmi-23.9)/(26.9-23.9)).toFixed(2)*100+"%";
            }else if(26.9<bmi&&bmi<29.9){
                $scope.userInfo.weightLevel = "肥胖";
                $scope.userInfo.weightValue = 4;
                $scope.userInfo.marginRate = ((bmi-26.9)/(29.9-26.9)).toFixed(2)*100+"%";
            }else if(29.9<bmi){
                $scope.userInfo.weightLevel = "重度肥胖";
                $scope.userInfo.weightValue = 7;
                $scope.userInfo.marginRate = ((bmi-29.9)/bmi).toFixed(2)*100+"%";
            }
            $scope.tagPos = {
                'margin-left':$scope.userInfo.marginRate
            }
        };

        var dealWeight = function (weight,type) {
            for(var i = 0;i<weight.length;i++){
                if(weight[i] == "NULL" && i == 0){
                    weight.splice(0,1);
                    i--;
                }else if(weight[i] == "NULL"){
                    weight[i] = null;
                }
                else{
                    weight[i] = Number(weight[i]);
                }
            }
          switch(type){
              case "w": $scope.userInfo.weightData = $scope.userInfo.weightData.splice($scope.userInfo.weightData.length-weight.length,$scope.userInfo.weightData.length);
                break;
              case "p":  $scope.userInfo.pressureData = $scope.userInfo.pressureData.splice($scope.userInfo.pressureData.length-weight.length,$scope.userInfo.pressureData.length);
                break;
              case "su": $scope.userInfo.sugarData = $scope.userInfo.sugarData.splice($scope.userInfo.sugarData.length-weight.length,$scope.userInfo.sugarData.length);
                break;
              case "sp": $scope.userInfo.sportData = $scope.userInfo.sportData.splice($scope.userInfo.sportData.length-weight.length,$scope.userInfo.sportData.length);

          }
            $scope.dataLength = weight.length-1;
        };

        var dealData = function (data) {
            for(var i=0;i<data.length;i++){
                data[i] = data[i].substring(5,data[i].length).replace("-",".");
            }
        };

        var dealMeasureTime = function (time) {
              switch(Number(time)){
                  case 0 : $scope.userInfo.measureTimeNew = "空腹";
                      break;
                  case 1 : $scope.userInfo.measureTimeNew = "早餐后";
                      break;
                  case 2 : $scope.userInfo.measureTimeNew = "午餐前";
                      break;
                  case 3 : $scope.userInfo.measureTimeNew = "午餐后";
                      break;
                  case 4 : $scope.userInfo.measureTimeNew = "晚餐前";
                      break;
                  case 5 : $scope.userInfo.measureTimeNew = "晚餐后";
                      break;
                  case 6 : $scope.userInfo.measureTimeNew = "睡前";
                      break;
              }
        };
        var dealSportLevel = function (level) {
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
        var dealSportType = function (type) {
            for(var i=0;i<type.length;i++){
                for(var j=0;j<type[i].length;j++){
                switch(type[i][j]){
                    case "0" : $scope.userInfo.sportType[i][j] = "散步";
                        break;
                    case "1" : $scope.userInfo.sportType[i][j] = "快走";
                        break;
                    case "2" : $scope.userInfo.sportType[i][j] = "慢跑";
                        break;
                    case "3" : $scope.userInfo.sportType[i][j] = "跑步";
                        break;
                    case "4" : $scope.userInfo.sportType[i][j] = "游泳";
                        break;
                    case "5" : $scope.userInfo.sportType[i][j] = "登山";
                        break;
                    case "6" : $scope.userInfo.sportType[i][j] = "打球";
                        break;
                    case "7" : $scope.userInfo.sportType[i][j] = "其他";
                        break;
                }
                }
            }
        };

        //获取user_id
        var getAppUser = function () {
            var userInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            $scope.userId = userInfo.USER_ID;
        };
        $scope.goToHealth = function () {
            if(!WeightManageService.firstIn&&WeightManageService.saves >=2){
                $ionicHistory.goBack(-2);
            }else if(!WeightManageService.firstIn&&WeightManageService.saves == 1){
                $ionicHistory.goBack(-2);
            }else if(WeightManageService.firstIn&&WeightManageService.saves == 0){
                $ionicHistory.goBack(-2);
            }else if(!WeightManageService.firstIn){
                $ionicHistory.goBack(-1);
            }
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
            if(!isFirst){
                WeightAddService.firstIn = false;
            }
            else{
                WeightAddService.firstIn = true;
            }
            $state.go("weight_add");
        }
        $scope.turn = function (time) {
            time == 'day'?(showWeightDay(),$scope.userInfo.dataShow = 'day'):(showWeightWeek(),$scope.userInfo.dataShow = 'week');
        };
        $scope.turnSugar = function (time) {
            var allSugar = $scope.userInfo.allSugar;
            $scope.userInfo.sugarData = [];
            $scope.userInfo.sugar = [];
            switch (time){
                case 1 : $scope.userInfo.sugarTime = 1;

                    for (var i = 0; i < allSugar[0].length; i++) {
                        $scope.userInfo.sugarData[i] = allSugar[0][allSugar[0].length - 1 - i].BLOOD_SUGAR_DATE;
                        $scope.userInfo.sugar[i] = allSugar[0][allSugar[0].length - 1 - i].BLOOD_SUGAR;
                    }
                    dealData($scope.userInfo.sugarData);
                    dealWeight($scope.userInfo.sugar,"su");
                    showSugar();
                    break;
                case 2 : $scope.userInfo.sugarTime = 2;
                        for (var i = 0; i < allSugar[1].length; i++) {
                            $scope.userInfo.sugarData[i] = allSugar[1][allSugar[1].length - 1 - i].BLOOD_SUGAR_DATE;
                            $scope.userInfo.sugar[i] = allSugar[1][allSugar[1].length - 1 - i].BLOOD_SUGAR;
                        }
                    dealData($scope.userInfo.sugarData);
                    dealWeight($scope.userInfo.sugar,"su");
                    showSugar();
                    break;
                case 3 : $scope.userInfo.sugarTime = 3;
                        for (var i = 0; i < allSugar[2].length; i++) {
                            $scope.userInfo.sugarData[i] = allSugar[2][allSugar[2].length - 1 - i].BLOOD_SUGAR_DATE;
                            $scope.userInfo.sugar[i] = allSugar[2][allSugar[2].length - 1 - i].BLOOD_SUGAR;
                        }
                        dealData($scope.userInfo.sugarData);
                    dealWeight($scope.userInfo.sugar,"su");
                    showSugar();
                    break;
                case 4 : $scope.userInfo.sugarTime = 4;
                        for (var i = 0; i < allSugar[3].length; i++) {
                            $scope.userInfo.sugarData[i] = allSugar[3][allSugar[3].length - 1 - i].BLOOD_SUGAR_DATE;
                            $scope.userInfo.sugar[i] = allSugar[3][allSugar[3].length - 1 - i].BLOOD_SUGAR;
                        }
                        dealData($scope.userInfo.sugarData);
                    dealWeight($scope.userInfo.sugar,"su");
                    showSugar();
                    break;
                case 5 : $scope.userInfo.sugarTime = 5;
                        for (var i = 0; i < allSugar[4].length; i++) {
                            $scope.userInfo.sugarData[i] = allSugar[4][allSugar[4].length - 1 - i].BLOOD_SUGAR_DATE;
                            $scope.userInfo.sugar[i] = allSugar[4][allSugar[4].length - 1 - i].BLOOD_SUGAR;
                        }
                        dealData($scope.userInfo.sugarData);
                    dealWeight($scope.userInfo.sugar,"su");
                    showSugar();
                    break;
                case 6 : $scope.userInfo.sugarTime = 6;
                        for (var i = 0; i < allSugar[5].length; i++) {
                            $scope.userInfo.sugarData[i] = allSugar[5][allSugar[5].length - 1 - i].BLOOD_SUGAR_DATE;
                            $scope.userInfo.sugar[i] = allSugar[5][allSugar[5].length - 1 - i].BLOOD_SUGAR;
                        }
                        dealData($scope.userInfo.sugarData);
                    dealWeight($scope.userInfo.sugar,"su");
                    showSugar();
                    break;
                case 7 : $scope.userInfo.sugarTime = 7;
                        for (var i = 0; i < allSugar[6].length; i++) {
                            $scope.userInfo.sugarData[i] = allSugar[6][allSugar[6].length - 1 - i].BLOOD_SUGAR_DATE;
                            $scope.userInfo.sugar[i] = allSugar[6][allSugar[6].length - 1 - i].BLOOD_SUGAR;
                        }
                        dealData($scope.userInfo.sugarData);
                    dealWeight($scope.userInfo.sugar,"su");
                    showSugar();
                    break;
            }
        };
        $scope.gotoWeightStandardStandard = function () {
            $state.go("weight_standard");
        }
        $scope.gotoBloodSugarStandard = function () {
            $state.go("blood_sugar_standard");
        }
        $scope.gotoBloodPressureStandard = function () {
            $state.go("blood_pressure_standard");
        }

    })
    .build();