/**
 *产品名称：quyiyuan
 *创建者：赵婷
 *创建时间：2015/6/25
 *创建原因：平面导航根据科室定位（选择科室）控制器
 *修改者：
 *修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigationDepartment.controller")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.navigation.service.navigationDepartment",
        "kyee.quyiyuan.navigation.service.NavigationFloor"])
    .type("controller")
    .name("NavigationDepartmentController")
    .params(["$scope",
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "CacheServiceBus",
        "NavigationDepartmentService",
        "NavigationFloorService"
    ])
    .action(function ($scope,$state, KyeeMessageService, KyeeViewService,CacheServiceBus,
                      NavigationDepartmentService,NavigationFloorService) {
        $scope.departmentInfro=[];
        $scope.placeText=KyeeMessageService.get('navigation_department.placeText','搜索 科室 关键词');
        $scope.hospitalId=NavigationDepartmentService.hospitalId;
        //组件绑定
        $scope.bind = function(params){
            $scope.searchdept = params.search;
        };
        $scope.initView=function(){
            NavigationDepartmentService.queryDepatmentInfro($scope.hospitalId,function(rsp) {
                if (rsp.success) {
                    var deptTables = rsp.data.rows;
                    var resultData = dealDeptData(deptTables);
                    $scope.departmentInfro=resultData;
                }else{
                    KyeeMessageService.broadcast({
                        content:rsp.message
                    });
                }
            });

        };
            //处理后台返回的科室数据
          var dealDeptData= function(deptTables) {
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
            };
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
                    if(NavigationDepartmentService.checkDeptName==letterarr[k].DEPT_NAME){
                        itemMap["class"]="check_department_itemStyle";
                    }
                    if(letterarr[k].IS_ONLINE==1){
                        itemMap["leftIcons"]=["appoint-shipin-img"];
                    }
                    items.push(itemMap)
                }
                datamap["items"]=items;
                data.push(datamap);
            }
            return data;
        };
        //搜索科室的keyup事件
        $scope.searchDept = function (keyWords) {
            $scope.searchdept(keyWords);
        };
        //点击某一科室后跳转到平面导航定位界面
        $scope.onClick=function(params){
            //将点击的某一科室对象放入科室服务中
            NavigationFloorService.fixedPositionInfro={
                HOSPITAL_ID:params.item.deptData.HOSPITAL_ID,
                DEPT_NAME:params.item.deptData.DEPT_NAME
            }
            NavigationFloorService.lastClassName='navigation_department'; //KYEEAPPTEST-2710  修改医院定位缓存异常
            NavigationFloorService.scope.initView();
            $state.go("navigation");
        };

    })
    .build();