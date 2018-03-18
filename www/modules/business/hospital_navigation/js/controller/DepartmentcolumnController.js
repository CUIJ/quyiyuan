new KyeeModule()
    .group("kyee.quyiyuan.departmentcolumn.controller")
    .require([
        "kyee.quyiyuan.hospitalNavigation.service",
        "kyee.quyiyuan.navigationDeptInfo.controller",
        "kyee.quyiyuan.navigationDeptInfo.service",
        "kyee.quyiyuan.navigationDepartmentInfo.controller",
        "kyee.quyiyuan.navigationDepartmentInfo.service",
        "kyee.quyiyuan.outNavigation.controller"
    ])
    .type("controller")
    .name("DepartmentcolumnController")
    .params(["$ionicScrollDelegate","KyeeUtilsService","$scope", "$state", "$ionicHistory", "KyeeMessageService", "CacheServiceBus", "HospitalNavigationService",
        "NavigationDeptInfoService", "NavigationDepartmentInfoService", "KyeeListenerRegister", "KyeeI18nService", "OutNavigationService", "KyeeEffectService"])
    .action(function ($ionicScrollDelegate,KyeeUtilsService,$scope, $state, $ionicHistory, KyeeMessageService, CacheServiceBus, HospitalNavigationService,
                      NavigationDeptInfoService, NavigationDepartmentInfoService, KyeeListenerRegister, KyeeI18nService, OutNavigationService, KyeeEffectService) {
        $scope.hosp = "科室一览";
        $scope.hospitalId = NavigationDeptInfoService.hospitalId;
        HospitalNavigationService.lastView = "navigation_deptinfo";
        var info = angular.copy(HospitalNavigationService.deptDate);
        //处理后台返回的科室数据
        var dealDeptData =  function (deptTables) {
            for(var index=0;index<info.length;index++){
                info[index].FULL_UPPER_SPELL = info[index].HOSPITAL_FLOOR_DEPT_PINYIN;
                info[index].DEPT_NAME = info[index].HOSPITAL_FLOOR_DEPT;
                info[index].DEPT_CODE = "666";
            }
            var letters = [];//获取字母数组
            var resultMap = {};//获取字母对应的科室
            var result = {};//返回处理后的数据
            for (var i = 0; i < deptTables.length; i++) {
                if (resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)] == undefined) {
                    var list = [];
                    list.push(deptTables[i]);
                    resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)] = list;
                    letters.push(deptTables[i].FULL_UPPER_SPELL.substr(0, 1));
                    letters = letters.sort();
                } else {
                    resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)].push(deptTables[i]);
                }
            }
            var data = [];//组装后的数据
            for(var j=0;j<letters.length;j++){
                var datamap={};
                datamap["group"]=letters[j];
                var letterarr= resultMap[letters[j]];
                var items=[];
                for(var k=0;k<letterarr.length;k++){
                    var itemMap={};
                    itemMap["text"]=letterarr[k].DEPT_NAME;
                    itemMap["value"]=letterarr[k].DEPT_CODE;
                    itemMap["pinyin"]=letterarr[k].FULL_UPPER_SPELL;
                    itemMap["deptData"]=letterarr[k];
                    items.push(itemMap)
                }
                datamap["items"]=items;
                data.push(datamap);
            }
            $scope.data= data;
        };
        //点击某一科室后跳转
        $scope.selectDept=function(params){
            var dept = params.item.deptData;
            if(!dept.HOSPITAL_AREA){
                dept.HOSPITAL_AREA = dept.HOSPITAL_NAME;
            }
            //将点击的某一科室的信息放入科室服务中
            HospitalNavigationService.fixedPositionInfro = {
                HOSPITAL_ID: $scope.hospitalId,
                DEPT_NAME: dept.HOSPITAL_FLOOR_DEPT,
                FLOOR_NAME: dept.HOSPITAL_BUILD_NUMBER,
                DEPT_COORD: dept.HOSPITAL_COORD,
                DEPT_ROUTE: dept.ROUTE,
                HOSPITAL_AREA: dept.HOSPITAL_AREA,
                HOSPITAL_FLOOR_NUMBER: dept.HOSPITAL_FLOOR_NUMBER
            };
            $ionicHistory.goBack();
        };
        dealDeptData(info);
    })
    .build();