/**
 *产品名称：quyiyuan
 *创建者：杜巍巍
 *任务号：KYEEAPPC-3461
 *创建时间：2015/9/1
 *创建原因：医院搜索科室信息控制器
 *修改者：
 *修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigationDeptInfo.controller")
    .require([
        "kyee.quyiyuan.navigationDeptInfo.service",
        "kyee.quyiyuan.navigationDepartmentInfo.service"
    ])
    .type("controller")
    .name("NavigationDeptInfoController")
    .params(["$ionicScrollDelegate","KyeeEffectService","$scope", "$state","$ionicHistory","KyeeMessageService", "NavigationDeptInfoService", "HospitalNavigationService",
        "NavigationDepartmentInfoService","KyeeI18nService"])
    .action(function ($ionicScrollDelegate,KyeeEffectService,$scope, $state,$ionicHistory,KyeeMessageService, NavigationDeptInfoService, HospitalNavigationService,
                      NavigationDepartmentInfoService,KyeeI18nService) {
        $scope.DeptInfo = [];
        //是否显示以显示所有结果的提示信息
        $scope.floor = KyeeI18nService.get("navigation_deptinfo.yardNavigation","院内导航");
        $scope.isShowFloorInfo = false;
        $scope.noShowFloorInfo = false;
        $scope.navigationInfro = [];
        $scope.navigationFloorInfro = [];
        $scope.checkIndex = undefined;
        var flag = undefined;
        $scope.keywords = HospitalNavigationService.deptInfo;
        $scope.hospitalId = NavigationDeptInfoService.hospitalId;
        $scope.navigationID = NavigationDeptInfoService.navigationID;
        $scope.searchInfo = KyeeI18nService.get('hospital_navigation.searchInfo', '科室名称/简拼');
        $scope.deptSearch = {
            keywords: ""
        };
        $scope.backView=function(){
            setTimeout(function () {
                $ionicHistory.goBack();
            }, 400);
        };
        var floorData = [];
        HospitalNavigationService.lastView = "navigation_deptinfo";
        var index = 0;
        $scope.DeptInfo = HospitalNavigationService.deptDate;
        if (NavigationDeptInfoService.flag == 1) {
            //点击大楼去查询大楼的科室信息
            NavigationDeptInfoService.queryFloorInfo(function (data) {
                $scope.navigationFloorInfro = data;
                $scope.floor = data[0].HOSPITAL_BUILD_NUMBER;
                floorData = data;
                $scope.isShowClick = true;//吴伟刚 KYEEAPPC-4465 院内导航去掉搜索结果页的过滤搜索框
            }, $scope.navigationID);
            $scope.isShowFloorInfo = false;
            $scope.isShowSearch = false;
        }

        else {
            //点击搜索框去查询要搜索科室的信息
            NavigationDeptInfoService.querySearchDept(function (data) {
                if (data.length > 0) {
                    $scope.DeptInfo = data;
                    floorData = data;
                    $scope.isShowFloorInfo = true;
                } else {
                    $scope.noShowFloorInfo = true;//吴伟刚 KYEEAPPC-4807 院内导航优化(前台)
                }
            }, $scope.hospitalId, $scope.keywords);
            $scope.isShowClick = false;
            $scope.isShowSearch = true;
        }
        //NavigationDeptInfoService.flag ='';
        //跳转科室选择定位
        $scope.goDepartmentInfo = function () {
            // NavigationDepartmentInfoService.hospitalId=$scope.hospitalId;  //为选择科室传递医院ID
            NavigationDepartmentInfoService.hospitalId;
            $state.go("navigation_departmentInfo");
        };
        $scope.ischeck = function (index) {
            $scope.checkIndex = index;
        };
        $scope.isChangeStyle = function (index) {
            return $scope.checkIndex == index;
        };

        //搜索科室的keyup事件
        $scope.searchFloorDept = function (keywords) {
            if (NavigationDeptInfoService.flag == 1) {
                $scope.navigationFloorInfro = [];
                for (var i = 0; i < floorData.length; i++) {
                    if (floorData[i].HOSPITAL_FLOOR_DEPT.indexOf(keywords) != -1) {
                        $scope.navigationFloorInfro.push(floorData[i]);
                    }
                }
            }
            else {
                $scope.DeptInfo = [];
                for (var i = 0; i < floorData.length; i++) {
                    if (floorData[i].HOSPITAL_FLOOR_DEPT.indexOf(keywords) != -1) {
                        $scope.DeptInfo.push(floorData[i]);
                    }
                }
            }
        };

        //点击搜索出来的科室去进行定位
        $scope.onLocationSearch = function (index) {
            var dept = $scope.DeptInfo[index];
            //将点击的某一科室的信息放入科室服务中
            HospitalNavigationService.fixedPositionInfro = {
                HOSPITAL_ID: $scope.hospitalId,
                DEPT_NAME: dept.HOSPITAL_FLOOR_DEPT,
                FLOOR_NAME: dept.HOSPITAL_BUILD_NUMBER,
                DEPT_COORD: dept.HOSPITAL_COORD,
                DEPT_ROUTE: dept.ROUTE,
                HOSPITAL_AREA: dept.HOSPITAL_AREA,
                HOSPITAL_FLOOR_NUMBER:dept.HOSPITAL_FLOOR_NUMBER
            };
            HospitalNavigationService.lastView = "navigation_deptinfo";
            $ionicHistory.goBack();
        };
        $scope.searchDept = function () {//吴伟刚 KYEEAPPC-4807 院内导航优化(前台)
            $scope.showShake = "";
            search();
        };
        /**
         * 搜索
         */
        var search = function () {
            $scope.DeptInfo.sort(compare);
            //显示全部数据
            var keywords = "";
            if ($scope.deptSearch.keywords) {
                keywords = $scope.deptSearch.keywords;
            }
            if (['a', 'o', 'i', 'u', 'v'].indexOf(keywords[0]) != -1) {//'e',
                keywords = "";
            }
            var shengmu = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];
            var isQuanPin = false;
            for (var j = 0; j < keywords.length; j++) {
                if (shengmu.indexOf(keywords.charAt(j)) == -1) {
                    isQuanPin = true;
                    break;
                }
            }
            if (keywords == 'e') {
                isQuanPin = false;
            }
            for (var i in $scope.DeptInfo) {
                var item = $scope.DeptInfo[i];
                if (keywords == "") {
                    item.isDeleted = true;
                } else {
                    //使用正则表达式模式匹配全拼或简拼
                    var regExpress = keywords + ".*";
                    var reg = new RegExp(regExpress.toUpperCase());
                    if (reg.test(item.HOSPITAL_FLOOR_DEPT_SZM.toUpperCase())) {
                        item.isDeleted = false;
                        for (var j = 0; j < keywords.length; j++) {
                            if (keywords[j].toUpperCase() == item.HOSPITAL_FLOOR_DEPT_SZM.toUpperCase()[j]) {
                                item.flag = j;
                            } else {
                                item.flag = -1;
                            }
                        }
                    } else {
                        //删除此条目
                        item.isDeleted = true;
                    }
                    if (isQuanPin) {
                        if (reg.test(item.HOSPITAL_FLOOR_DEPT_PINYIN.toUpperCase()) || item.HOSPITAL_FLOOR_DEPT.indexOf(keywords) != -1) {
                            //保留此条目
                            item.isDeleted = false;
                            for (var j = 0; j < keywords.length; j++) {
                                if (keywords[j].toUpperCase() == item.HOSPITAL_FLOOR_DEPT_PINYIN.toUpperCase()[j] ||
                                    keywords[j].toUpperCase() == item.HOSPITAL_FLOOR_DEPT[j]) {
                                    item.flag = j;
                                } else {
                                    item.flag = -1;
                                }
                            }
                        }
                    }
                }
            }
            var deletedCount = 0;
            for (var i in $scope.DeptInfo) {
                var item = $scope.DeptInfo[i];
                if (item.isDeleted != undefined && item.isDeleted == true) {
                    deletedCount++;
                }
            }
            if (deletedCount == $scope.DeptInfo.length) {
                $scope.searchMsg = KyeeI18nService.get("hospital_navigation.nowNoResult","暂无结果");
            } else {
                $scope.searchMsg = KyeeI18nService.get("hospital_navigation.allResult","已显示所有结果");
            }
            $scope.DeptInfo.sort(function (a, b) {
                return b.flag - a.flag
            });
        };
        function compare(val1, val2) {
            // 转换为拼音
            val1 = val1.HOSPITAL_FLOOR_DEPT_SZM.toLowerCase();
            val2 = val2.HOSPITAL_FLOOR_DEPT_SZM.toLowerCase();

            // 获取较长的拼音的长度
            var length = val1.length > val2.length ? val1.length : val2.length;
            // 依次比较字母的unicode码，相等时返回0，小于时返回-1，大于时返回1
            for (var i = 0; i < length; i++) {
                var differ = val1.charCodeAt(i) - val2.charCodeAt(i);
                if (differ == 0) {
                    continue;
                } else {
                    if (val1.charAt(i) == '_') {
                        return -1;
                    }
                    return differ;
                }
            }
            if (i == length) {
                return val1.length - val2.length;
            }
        }
        /**
         * 点击科室跳转回去
         */
        $scope.selectDeptJump = function (dept) {

            for(var i=0;i<$scope.DeptInfo.length;i++){
                if($scope.DeptInfo[i].HOSPITAL_FLOOR_DEPT == dept){
                    dept = $scope.DeptInfo[i];
                    break;
                }
            }
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
        $scope.frontClick = function(){
            if($scope.deptSearch.keywords){
                KyeeEffectService.ClickEffect.removeCircleEffect();
                return true;
            }else{
                setTimeout(function () {
                    KyeeEffectService.ClickEffect.addCircleEffect({
                        onBefore: function (cfg) {
                            return (cfg.top >= 90 && cfg.top <= window.innerHeight);
                        }
                    });
                    $scope.$apply();
                }, 1000);
                return false;
            }
        }
    })
    .build();