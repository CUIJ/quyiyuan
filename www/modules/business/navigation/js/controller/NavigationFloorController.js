/**
 *产品名称：quyiyuan
 *创建者：赵婷
 *创建时间：2015/5/11
 *创建原因：医院导航控制器
 *修改者：
 *修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigationFloor.controller")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.navigation.service.NavigationFloor",
        "kyee.quyiyuan.navigation.service.navigationDetail",
        "kyee.quyiyuan.navigationOut.service",
        "kyee.quyiyuan.navigationDepartment.controller",
        "kyee.quyiyuan.navigation.service.navigationDepartment"])
    .type("controller")
    .name("NavigationFloorController")
    .params(["$scope",
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "CacheServiceBus",
        "NavigationFloorService",
        "NavigationDetailService",
        "NavigationOutService",
        "NavigationDepartmentService",
        "KyeeListenerRegister"
    ])
    .action(function ($scope,$state, KyeeMessageService, KyeeViewService,CacheServiceBus,
                      NavigationFloorService,NavigationDetailService,NavigationOutService,
                      NavigationDepartmentService,KyeeListenerRegister) {
        $scope.hospitalId=undefined;  //当前医院ID
        $scope.notice=undefined;
        $scope.hosPicSrc=undefined; //定义医院图片
        $scope.CoordinateSet=undefined;  //定义坐标集合
        $scope.hospitalMessage=undefined; //医院介绍
        $scope.hos_name=undefined; //医院名称
        $scope.isShow=false;
        $scope.param=undefined;
        $scope.isShowMessage=false; //是否显示暂无医院导航提示

        NavigationFloorService.scope= $scope;


        $scope.initView=function(){
            $scope.hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

            //KYEEAPPTEST-2710  修改医院定位缓存异常
            if(NavigationFloorService.lastClassName!="appointment_regist_detil"
                &&NavigationFloorService.lastClassName!="navigation_department"){
                //不获取定位信息时，对于相关服务中的值初始化
                NavigationFloorService.fixedPositionInfro=[];
                NavigationDepartmentService.checkDeptName=undefined;
            }else{
                $scope.param=NavigationFloorService.fixedPositionInfro; //获取从我的趣医（预约详情页面）/科室列表传递参数
                $scope.hospitalId=$scope.param.HOSPITAL_ID;  //如果从预约确认单跳转的导航，修改医院参数，预约确认单存在跨院可能
                NavigationDepartmentService.checkDeptName= $scope.param.DEPT_NAME; //为选择科室传递已经定位的科室名称
            }
            NavigationOutService.hospitalId=$scope.hospitalId;  //为院外导航传值

            loadData(); //加载院内导航相关信息
        }

        //加载院内导航相关信息
        var loadData=function(){
            NavigationFloorService.queryfloor(function(rsp){
                if (rsp.total>0) {
                    $scope.isShowMessage=false
                    var data=rsp.rows;
                   //获取医院导航信息集合
                    NavigationFloorService.allHospitalInfro=data;

                    $scope.hosPicSrc=data[0].HOSPITAL_FLOOR_PHOTO;  //获取医院平面图片

                    var coo=[];
                    var cood=[];
                    var navigationID=[];
                    var s = window.innerWidth;     //当前设备的宽度
                    for(var i=0;i<data.length;i++){
                        var cooll=[];
                        var cool=data[i].HOSPITAL_COORD.split(","); //得到每个位置点坐标
                        //计算每个坐标点中变化的位置
                        for(var j=0;j<cool.length;j++){
                            var y =s/300;        //扩大的倍数
                            var p =parseInt(y*parseInt(cool[j]));
                            cooll[j]=p;
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
                        cood.push(data[i].HOSPITAL_COORD);
                        navigationID.push(data[i].HEALTH_NAVIGATION_ID);
                    }
                    //坐标去重复
                    var cooUni=unique(coo);
                    var cooUnin=unique(cood);

                    //导航信息去重
                    navigationID=unique(navigationID);

                    //坐标集合
                    $scope.CoordinateSet=[];
                    for(var i=0;i<cooUni.length;i++){
                        $scope.CoordinateSet.push(
                            {
                                cooUni:cooUni[i],
                                cooUnin:cooUnin[i],
                                navigationID:navigationID[i]
                            }
                        );
                    }
                    //获取图片下方医院介绍
                    NavigationFloorService.queryallintro(function(resp){
                        if(resp.success){
                            var data=resp.data;
                            $scope.hos_name = data[0].HOSPITAL_NAME+'平面导航图';
                            if($scope.hospitalMessage==undefined){
                                $scope.hospitalMessage= "<p style='text-align: center;'>您若想了解某栋大楼的详细信息,请点击图片中标注处！</p>";
                            }
                        }else{
                         //   $scope.warnMessage(resp.message);
                        }

                    },$scope.hospitalId);

                    //当从预约详情单和科室选择（导航）进入时，定位科室信息
                    if(NavigationFloorService.lastClassName=="appointment_regist_detil"
                        ||NavigationFloorService.lastClassName=='navigation_department'){
                        getDepartLocation();
                    }


                }else{
                    $scope.isShowMessage=true;
                    $scope.notice='<div style="position: relative;top: 5em;font-size: 16px;color: #999;text-align: center;">暂无医院导航</div>';
                   // $scope.warnMessage(rsp.message);
                }
            },$scope.hospitalId);
        }

        //获取科室定位信息
        var getDepartLocation=function(){
            var s = window.innerWidth;     //当前设备的宽度
            //获取预约科室定位
            NavigationFloorService.queryDepartFloor(function(callBack){
                if(callBack.success){
                    var data = callBack.data;
                    if(data==null){
                        //未查询到科室的定位信息时，主要被调用在科室定位切换上
                        $scope.isShow=false;
                        $scope.hospitalMessage= "<p style='text-align: center;'>您若想了解某栋大楼的详细信息,请点击图片中标注处！</p>";
                        return;
                    }
                    if(data.ROUTE!=null){
                        $scope.hospitalMessage= "<p pad-t-10 pad-b-10 f14 qy_green>"+data.ROUTE+"</p>";
                    }
                    if(data.HOSPITAL_COORD!=""&&data.HOSPITAL_COORD!=null){
                        var cooll=[];
                        var cool=data.HOSPITAL_COORD.split(","); //得到每个位置点坐标
                        //计算每个坐标点中变化的位置
                        for(var j=0;j<cool.length;j++){
                            var y =s/300;        //扩大的倍数
                            var p =parseInt(y*parseInt(cool[j]));
                            cooll[j]=p;
                        }
                        $scope.showStyle='margin-top:'+(cooll[1]+cooll[1])/2+'px;margin-left:'+(cooll[0]+cooll[2])/2+'px;display:block;float: left;width:1.5em;height: 1.5em;position: absolute;';
                        $scope.isShow=true;
                    }

                }else{
                    $scope.isShow=false;
                    if($scope.param.length!=0){
                        //   $scope.warnMessage(callBack.message);
                    }
                }

            },$scope.param);
        }

        $scope.OpenNavigationDetail=function(id){
            NavigationDetailService.navigationID=id;
            NavigationDetailService.allNavigationInfro=NavigationFloorService.allHospitalInfro;
            $state.go("navigation_detail");
        }

        //跳转科室选择定位
        $scope.goChooseDept=function(){
            NavigationDepartmentService.hospitalId=$scope.hospitalId;  //为选择科室传递医院ID
            $state.go("navigation_department");
        }

        //预警提示
        $scope.warnMessage = function (message) {
            KyeeMessageService.broadcast({
                content:message
            });
        }

        //数组去重复
        var unique = function(arr)
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
        }
    })
    .build();