new KyeeModule()
    .group("kyee.quyiyuan.hospitalNavigation.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("HospitalNavigationService")
    .params(["KyeeMessageService","HttpServiceBus"])
    .action(function(KyeeMessageService,HttpServiceBus){
        var def = {
            allHospitalInfro:[],  //获取医院各个楼宇分布的总数据
            fixedPositionInfro:undefined,  //获取从预约详情跳转定位
            lastClassName:undefined,  //获取上一个跳转页面的路由
            deptInfo:undefined,
            scope:undefined,
            areas:undefined,
            lastView:undefined,
            floorDate:undefined,
            deptDate:undefined,
            //查询图片
            queryHospitalParam:function(Callback,hospitalId){
                HttpServiceBus.connect({
                    url : "hospitalInform/action/HospitalinforActionC.jspx",
                    params : {
                        op : "queryHospitalParam",
                        hospitalId:hospitalId,
                        paramName:'NAVIGTO'
                    },
                    onSuccess : function (resp) {
                        Callback(resp);
                    }
                });
            },
            //查询楼层
            queryfloor:function(Callback,hospitalId){
                HttpServiceBus.connect({
                    url : "health/action/HospitalNavigationActionC.jspx",
                    params : {
                        op : "queryfloor",
                        hospitalID:hospitalId
                    },
                    onSuccess : function (resp) {
                        if(resp && resp.success && resp.data && resp.data.rows){
                            def.floorDate = resp.data.rows;
                        }
                        var data = def.formatData(resp);
                        Callback(data);
                    }
                });
            },
            //搜索科室信息
            querySearchDept:function(Callback,hospitalId,keywords){
                HttpServiceBus.connect({
                    url : "health/action/HospitalNavigationActionC.jspx",
                    params : {
                        loc : "c",
                        op : "getHospitalSerchResult",
                        hospitalId:hospitalId,
                        KEY_WORDS:keywords
                    },
                    onSuccess : function (data) {
                        if (data.success) {
                            var searchDeptInfo = data.data.rows;
                            def.deptDate = data.data.rows;
                            var buildNumber = def.formatNavigationBar();
                            Callback(searchDeptInfo,buildNumber);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //查询图片下方医院提示
            queryallintro:function(Callback,hospitalId){
                HttpServiceBus.connect({
                    url : "health/action/HospitalNavigationActionC.jspx",
                    params : {
                        op : "queryallintro",
                        hospitalID:hospitalId
                    },
                    onSuccess : function (resp) {
                        Callback(resp);
                    }
                });
            },

            //查询预约科室定位
            queryDepartFloor:function(Callback,param){
                HttpServiceBus.connect({
                    url : "health/action/HospitalNavigationActionC.jspx",
                    params : {
                        op : "queryDepartFloor",
                        hospitalId:param.HOSPITAL_ID,//'1501' 预约医院
                        DEPART:param.DEPT_NAME,//'急诊科'  预约科室
                        hospitalArea:param.HOSPITAL_AREA
                    },
                    onSuccess : function (resp) {
                        Callback(resp);
                    }
                });
            },
            //处理返回的数据
            formatData:function(result){
                if (result.data&&result.data.rows.length>0) {
                    var data = result.data.rows;
                    var resultAreas = [];
                    //按院区分组
                    for(var i=0;i<data.length;i++){
                        var HOSPITAL_AREA = data[i].HOSPITAL_AREA;
                        if(resultAreas.indexOf(HOSPITAL_AREA)==-1){
                            resultAreas.push(HOSPITAL_AREA);
                        }
                    }
                    def.areas = resultAreas;
                    var resultData = [];
                    for(var i=0;i<resultAreas.length;i++){
                        var area = resultAreas[i];
                        var areaData = {
                            areas:[]
                        };
                        for(var j=0;j<data.length;j++){
                            var HOSPITAL_AREA = data[j].HOSPITAL_AREA;
                            if(area == HOSPITAL_AREA){
                                areaData.HOSPITAL_FLOOR_PHOTO = data[j].HOSPITAL_FLOOR_PHOTO;
                                areaData.HOSPITAL_AREA = data[j].HOSPITAL_AREA;
                                areaData.areas.push(data[j]);
                            }
                        }
                        resultData.push(areaData);
                    }
                    //转换坐标
                    for(var i=0;i<resultData.length;i++){
                        var areas = resultData[i].areas;
                        var coo=[];
                        var cood=[];
                        var navigationID=[];
                        var s = window.innerWidth;     //当前设备的宽度
                        for(var j=0;j<areas.length;j++){
                            var cooll=[];
                            if(areas[j].HOSPITAL_COORD){
                                var cool=areas[j].HOSPITAL_COORD.split(","); //得到每个位置点坐标
                                //计算每个坐标点中变化的位置
                                for(var m=0;m<cool.length;m++){
                                    var y =s/300;        //扩大的倍数
                                    var p =parseInt(y*parseInt(cool[m]));
                                    cooll[m]=p;
                                }
                                var b="";
                                for(var k=0;k<cooll.length;k++){
                                    if(k!=(cooll.length-1)){
                                        b += cooll[k]+",";
                                    }
                                    else {
                                        b += cooll[k];
                                    }
                                }
                                coo.push(b);
                                cood.push(areas[j].HOSPITAL_COORD);
                            }

                            navigationID.push(areas[j].HEALTH_NAVIGATION_ID);
                            //坐标去重复
                            var cooUni = def.unique(coo);
                            var cooUnin = def.unique(cood);
                            //导航信息去重
                            navigationID = def.unique(navigationID);
                            //坐标集合
                            resultData[i].CoordinateSet=[];
                            for(var k=0;k<cooUni.length;k++){
                                resultData[i].CoordinateSet.push(
                                    {
                                        cooUni:cooUni[k],
                                        cooUnin:cooUnin[k],
                                        navigationID:navigationID[k]
                                    }
                                );
                            }
                        }
                    }
                    return resultData;
                }else{
                    return [];
                }
            },
            //数组去重复
            unique:function(arr)
            {
                var n = {},r=[]; //n为hash表，r为临时数组
                for(var i = 0; i < arr.length; i++) //遍历当前数组
                {
                    if (!n[arr[i]]) //如果hash表中没有当前项
                    {
                        n[arr[i]] = true; //存入hash表
                        r.push(arr[i]); //把当前数组的当前项push到临时数组里面
                    }
                }
                return r;
            },
            /**
             * 导航栏格式化
             */
            formatNavigationBarData:function(){
                var navigationBarData = {};

                for(var i=0;i<def.deptDate.length;i++){
                    var data = def.deptDate[i];
                    if(!data.HOSPITAL_AREA){
                        data.HOSPITAL_AREA = " ";
                    }
                    if(!navigationBarData[data.HOSPITAL_AREA]){
                        navigationBarData[data.HOSPITAL_AREA] = {};
                    }
                    if(!navigationBarData[data.HOSPITAL_AREA][data.HOSPITAL_BUILD_NUMBER]){
                        navigationBarData[data.HOSPITAL_AREA][data.HOSPITAL_BUILD_NUMBER] = {};
                    }
                    if(!navigationBarData[data.HOSPITAL_AREA][data.HOSPITAL_BUILD_NUMBER][data.HOSPITAL_FLOOR_NUMBER]){
                        navigationBarData[data.HOSPITAL_AREA][data.HOSPITAL_BUILD_NUMBER][data.HOSPITAL_FLOOR_NUMBER] = [];
                    }
                    navigationBarData[data.HOSPITAL_AREA][data.HOSPITAL_BUILD_NUMBER][data.HOSPITAL_FLOOR_NUMBER].push(data);
                }
                var arr = [];
                for(var item in navigationBarData){
                    arr.push(navigationBarData[item]);
                }
                return arr;
            },
            /**
             * 导航栏数据格式化
             */
            formatNavigationBar:function(){
                var data = def.deptDate;
                var group = [];
                for (var i=0;i<data.length;i++) {
                    var area = data[i].HOSPITAL_AREA;
                    if(!area){
                        break;
                    }
                    if(group.indexOf(area)==-1){
                        group.push(area);
                    }
                }
                var data1 = [];
                if(group.length==0){
                    data1.push({
                        AREA_NAME:null,
                        AREA1:data,
                        AREA:[]
                    });
                }else{
                    for (var i=0;i<group.length;i++) {
                        var area = group[i];
                        var areas = [];
                        for (var j = 0; j < data.length; j++) {
                            var currArea = data[j].HOSPITAL_AREA;
                            if(area==currArea){
                                areas.push(data[j]);
                            }
                        };
                        data1.push({
                            AREA_NAME:area,
                            AREA1:areas,
                            AREA:[]
                        });
                    }
                }

                for (var i = 0; i < data1.length; i++) {
                    var currData = data1[i].AREA1;
                    var builds = [];
                    for (var j = 0; j < currData.length; j++) {
                        var build = currData[j].HOSPITAL_BUILD_NUMBER;
                        if(builds.indexOf(build)==-1){
                            builds.push(build);
                        }
                    };
                    for (var j=0;j<builds.length;j++) {
                        var build = builds[j];
                        var info = [];
                        for (var k = 0; k < currData.length; k++) {
                            var currBuild = currData[k].HOSPITAL_BUILD_NUMBER;
                            if(build==currBuild){
                                info.push(currData[k]);
                            }
                        };
                        var floors = [];
                        for (var k = 0; k < info.length; k++) {
                            var floor = info[k].HOSPITAL_FLOOR_NUMBER;
                            if(floors.indexOf(floor)==-1){
                                floors.push(floor);
                            }
                        };
                        var depts = [];
                        for (var k=0;k<floors.length;k++) {
                            var floor = floors[k];
                            var dept = [];
                            for (var m = 0; m < info.length; m++) {
                                var currFloor = info[m].HOSPITAL_FLOOR_NUMBER;
                                if(floor==currFloor){
                                    dept.push(info[m]);
                                }
                            };
                            depts.push({
                                DEPT:dept,
                                FLOOR:floor
                            });
                        }
                        data1[i].AREA.push({
                            INFO:depts,
                            NAME:build
                        });
                    }
                }
                return data1;
            }
        };
        return def;
    })
    .build();
