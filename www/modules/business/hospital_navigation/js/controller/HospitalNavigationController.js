new KyeeModule()
    .group("kyee.quyiyuan.hospitalNavigation.controller")
    .require([
        "kyee.quyiyuan.hospitalNavigation.service",
        "kyee.quyiyuan.navigationDeptInfo.controller",
        "kyee.quyiyuan.navigationDeptInfo.service",
        "kyee.quyiyuan.navigationDepartmentInfo.controller",
        "kyee.quyiyuan.navigationDepartmentInfo.service",
        "kyee.quyiyuan.outNavigation.controller",
        "kyee.quyiyuan.departmentcolumn.controller"
    ])
    .type("controller")
    .name("HospitalNavigationController")
    .params(["$ionicScrollDelegate","KyeeUtilsService","$scope", "$state", "$ionicHistory", "KyeeMessageService", "CacheServiceBus", "HospitalNavigationService",
        "NavigationDeptInfoService", "NavigationDepartmentInfoService", "KyeeListenerRegister", "KyeeI18nService", "OutNavigationService", "KyeeEffectService"])
    .action(function ($ionicScrollDelegate,KyeeUtilsService,$scope, $state, $ionicHistory, KyeeMessageService, CacheServiceBus, HospitalNavigationService,
                      NavigationDeptInfoService, NavigationDepartmentInfoService, KyeeListenerRegister, KyeeI18nService, OutNavigationService, KyeeEffectService) {
        var hospitalId = undefined;  //当前医院ID
        $scope.hospitalMessage = undefined; //医院介绍
        $scope.hosp = KyeeI18nService.get("hospital_navigation.title","医院导航");
        var setTime = undefined;
        $scope.isShow = false;
        $scope.transparentModule = false;
        $scope.param = undefined;
        $scope.isShowText = false;//文本框5秒消失控制
        $scope.isShowMessage = false; //是否显示暂无医院导航提示
        $scope.isShowMessageTitle = true; //是否显示暂无医院导航提示
        var index = 0;
        $scope.deptSearch = {
            keywords: ""
        };
        $scope.searchInfo = KyeeI18nService.get('hospital_navigation.searchTip', '科室名称/简拼');
        //让手势图片在加载完图片后显示
        $scope.isShowInfo = false;
        $scope.emptyMsg = KyeeI18nService.get('hospital_navigation.emptyMsg', '暂无院内导航');
        HospitalNavigationService.scope = $scope;
        $scope.goBack = function () {
            HospitalNavigationService.lastView = undefined;
            HospitalNavigationService.lastClassName = undefined;
            HospitalNavigationService.fixedPositionInfro = undefined;
            HospitalNavigationService.currentArea = undefined;
            HospitalNavigationService.currentAreaIndex = undefined;
            if (HospitalNavigationService.ROUTE_STATE == "appointment_result") {
                HospitalNavigationService.ROUTE_STATE = "";
                $state.go('appointment_result');
            } else if (HospitalNavigationService.ROUTE_STATE == "appointment_regist_detil") {
                HospitalNavigationService.ROUTE_STATE = "";
                $state.go('appointment_regist_detil');
            } else {
                $ionicHistory.goBack(-1);
            }
        };
        KyeeListenerRegister.regist({
            focus: "hospital_navigation",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                KyeeEffectService.ClickEffect.removeCircleEffect();
            }
        });
        //院内导航添加监听器，让进入此界面刷新数据和刷新页面。
        KyeeListenerRegister.regist({
            focus: "hospital_navigation",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: 'both',
            action: function (params) {
                var hosp = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if(hosp){
                    $scope.hosp = hosp.name;
                }
                $scope.transparentModule = false;
                KyeeEffectService.ClickEffect.addCircleEffect({
                    onBefore: function (cfg) {
                        return (cfg.top >= 90 && cfg.top <= window.innerHeight);
                    }
                });
                if (HospitalNavigationService.lastClassName == "appointment_regist_detil" || HospitalNavigationService.lastClassName == "appointment_result") {
                    $scope.param = HospitalNavigationService.fixedPositionInfro; //获取从我的趣医（预约详情页面）/科室列表传递参数
                    hospitalId = $scope.param.HOSPITAL_ID;  //如果从预约确认单跳转的导航，修改医院参数，预约确认单存在跨院可能
                    NavigationDepartmentInfoService.checkDeptName = $scope.param.DEPT_NAME; //为选择科室传递已经定位的科室名称
                } else {
                    hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                }
                NavigationDepartmentInfoService.hospitalId = hospitalId;
                NavigationDeptInfoService.hospitalId = hospitalId;
                loadData(); //加载院内导航相关信息
            }
        });

        /**
         * 监听物理返回键
         */
        KyeeListenerRegister.regist({
            focus: "hospital_navigation",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        //新版本加载院内导航相关信息
        var loadData = function () {
            HospitalNavigationService.queryfloor(function (data) {
                if (data.length > 0) {
                    $scope.isShowMessage = false;
                    $scope.resultData = data;
                    $scope.mainStyle = {
                        height: ""
                    };
                    if ($scope.resultData.length > 1) {
                        $scope.mainStyle.height = (window.innerHeight - 100 - 50 - 100) + 'px';//吴伟刚 KYEEAPPTEST-3223 导航图片过长时，科室导航信息看不到
                    } else {
                        $scope.mainStyle.height = (window.innerHeight - 100 - 100) + 'px';
                    }
                    setTime = setTimeout(function () {
                        if ($scope.resultData.length > 1) {
                            $scope.mainStyle.height = (window.innerHeight - 100 - 50 - 100) + 'px';//吴伟刚 KYEEAPPTEST-3223 导航图片过长时，科室导航信息看不到
                        } else {
                            $scope.mainStyle.height = (window.innerHeight - 100 - 100) + 'px';
                        }
                        $scope.$apply();
                    }, 500);
                    if (HospitalNavigationService.currentArea && HospitalNavigationService.currentAreaIndex) {
                        $scope.currentArea = HospitalNavigationService.currentArea;
                        $scope.currentAreaIndex = HospitalNavigationService.currentAreaIndex;
                    } else {
                        $scope.currentArea = $scope.resultData[0];
                        $scope.currentAreaIndex = 0;
                    }
                    if ($scope.hospitalMessage == undefined) {
                        $scope.hospitalMessage = KyeeI18nService.get('hospital_navigation.InfoMsg', '您若想了解某栋大楼的详细信息,请点击图片中标注处！');
                    }
                    if (HospitalNavigationService.fixedPositionInfro && HospitalNavigationService.fixedPositionInfro.DEPT_COORD
                        && HospitalNavigationService.lastView == "navigation_deptinfo") {
                        $scope.isShow = true;//是否显示定位小水滴
                        $scope.isShowText = true;//是否显示小水滴下面的文本框,5秒消失
                        //文本框7秒消失
                        setTime = setTimeout(function () {
                            $scope.isShowText = false;
                            $scope.$apply();
                        }, 7000);
                        setTime;
                        getDepartLocationDetail();
                        HospitalNavigationService.lastView = undefined;
                    }
                    $scope.isShowInfo = true;//是否显示提示信息
                    //当从预约详情单和科室选择（导航）进入时，定位科室信息
                    if (HospitalNavigationService.fixedPositionInfro && HospitalNavigationService.lastClassName == "appointment_regist_detil"
                        || HospitalNavigationService.lastClassName == "appointment_result") {
                        getDepartLocation();
                    }
                    HospitalNavigationService.querySearchDept(function (data,buildNumber) {
                        if (data.length > 0) {
                            $scope.DeptInfo = data;
                            if(buildNumber && buildNumber.length>0){
                                $scope.buildNumberAll = buildNumber;
                                //匹配初次进入院内导航时:院区与楼层科室
                                for(var i = 0; i < buildNumber.length ; i++){
                                    if(buildNumber[i].AREA_NAME){
                                        if($scope.resultData[0].HOSPITAL_AREA ==  buildNumber[i].AREA_NAME){
                                            $scope.buildNumberName = buildNumber[i].AREA;
                                            $scope.buildNumberInfo = $scope.buildNumberName[0].INFO;
                                            index = i;
                                        }
                                    }else{
                                        $scope.buildNumberName = buildNumber[index].AREA;
                                        $scope.buildNumberInfo = $scope.buildNumberName[0].INFO;
                                    }
                                }
                                $scope.buildSelect = 0;
                                $scope.floorSelect = 0;
                            }
                            $scope.isShowMessageTitle = false;
                        } else {
                            $scope.isShowMessageTitle = true;
                            $scope.DeptInfo = [];
                        }
                    }, hospitalId, "");
                } else {
                    $scope.isShowMessage = true;
                    $scope.isShowMessageTitle = true;
                }
                HospitalNavigationService.lastView = undefined;

            }, hospitalId);
        };

        //获取科室定位信息
        var getDepartLocation = function () {
            //获取搜索科室去定位的数据是否为空
            if (HospitalNavigationService.fixedPositionInfro == null) {
                //未查询到科室的定位信息时，主要被调用在科室定位切换上
                $scope.isShow = false;
                //$scope.hospitalMessage= KyeeI18nService.get('hospital_navigation.InfoMsg','您若想了解某栋大楼的详细信息,请点击图片中标注处！');
                return;
            }
            if (HospitalNavigationService.lastClassName == "appointment_regist_detil" || HospitalNavigationService.lastClassName == "appointment_result") {  //从预约挂号详情界面或完成页面跳转过来后，需要从后台获取科室所在位置坐标
                HospitalNavigationService.queryDepartFloor(function (callBack) {
                    if (callBack.success && callBack.data) {
                        var data = callBack.data;
                        HospitalNavigationService.fixedPositionInfro.DEPT_COORD = data.HOSPITAL_COORD;
                        HospitalNavigationService.fixedPositionInfro.DEPT_ROUTE = data.ROUTE;
                        HospitalNavigationService.fixedPositionInfro.HOSPITAL_AREA = data.HOSPITAL_AREA;
                    } else {
                        HospitalNavigationService.fixedPositionInfro.DEPT_COORD = null;
                        HospitalNavigationService.fixedPositionInfro.DEPT_ROUTE = null;
                        HospitalNavigationService.fixedPositionInfro.HOSPITAL_AREA = null;
                    }
                    getDepartLocationDetail();

                }, HospitalNavigationService.fixedPositionInfro);
            } else {
                getDepartLocationDetail();
            }

        };
        var getDepartLocationDetail = function () {
            var s = window.innerWidth;     //当前设备的宽度
            //判断从搜索科室选择的定位科室的路线提示语是否有
            if (HospitalNavigationService.fixedPositionInfro.DEPT_ROUTE != "") {
                $scope.hospitalMessage = HospitalNavigationService.fixedPositionInfro.DEPT_ROUTE;
            } else {
                $scope.hospitalMessage = HospitalNavigationService.fixedPositionInfro.HOSPITAL_FLOOR_NUMBER;
            }
            //判断从搜索科室选择的科室所在的大楼坐标是否为空，不为空去根据坐标去定位。
            if (HospitalNavigationService.fixedPositionInfro.DEPT_COORD != "" && HospitalNavigationService.fixedPositionInfro.DEPT_COORD != null) {
                var cooll = [];
                var cool = HospitalNavigationService.fixedPositionInfro.DEPT_COORD.split(","); //得到每个位置点坐标
                //计算每个坐标点中变化的位置
                for (var i = 0; i < cool.length; i++) {
                    var y = s / 300;        //扩大的倍数
                    var p = parseInt(y * parseInt(cool[i]));
                    cooll[i] = p;
                }
                //吴伟刚 KYEEAPPC-4469 院内导航医院名称过长导致定位不准确修复
                $scope.showStyle = 'top:' + ((cooll[1] + cooll[3]) / 2 - 20) + 'px;left:' + ((cooll[0] + cooll[2]) / 2) + 'px;position: absolute;';
                if (((cooll[0] + cooll[2]) / 2 - 6) <= window.innerWidth / 2) {
                    $scope.showClass = 'out';
                    $scope.showMsgStyle = 'top:' + ((cooll[1] + cooll[3]) / 2 - 20 + 30) + 'px;left:' + ((cooll[0] + cooll[2]) / 2 - 6 - 14) + 'px;';
                } else {
                    $scope.showClass = 'out_right';
                    $scope.showMsgStyle = 'top:' + ((cooll[1] + cooll[3]) / 2 - 20 + 30) + 'px;right:' + (window.innerWidth - ((cooll[0] + cooll[2]) / 2 - 6) - 40) + 'px;';
                }
                $scope.isShow = true;
                $scope.isShowText = true;//是否显示小水滴下面的文本框,5秒消失
                //文本框7秒消失
                setTime = setTimeout(function () {
                    $scope.isShowText = false;
                    $scope.$apply();
                }, 7000);
                setTime;
                $scope.showShake = "shake";
                var index = HospitalNavigationService.areas.indexOf(HospitalNavigationService.fixedPositionInfro.HOSPITAL_AREA);
                if (index != -1) {
                    $scope.currentArea = $scope.resultData[index];
                    $scope.currentAreaIndex = index;
                } else {
                    $scope.currentArea = $scope.resultData[0];
                    $scope.currentAreaIndex = 0;
                }
            }
        };
        //点击楼层跳转到楼层界面
        $scope.OpenNavigationDetail = function (record,id) {
            NavigationDeptInfoService.navigationID = id;
            NavigationDeptInfoService.allNavigationInfro = HospitalNavigationService.allHospitalInfro;
            NavigationDeptInfoService.flag = 1;
            NavigationDeptInfoService.nowCooUni = record.cooUnin;
            HospitalNavigationService.deptInfo = '';
            HospitalNavigationService.currentArea = $scope.currentArea;
            HospitalNavigationService.currentAreaIndex = $scope.currentAreaIndex;
            $state.go("navigation_deptinfo");
        };

        $scope.flag = true;
        //搜索框查询跳转
        $scope.goDeptInfo = function () {
            HospitalNavigationService.deptInfo = $scope.deptSearch.keywords;
            NavigationDeptInfoService.flag = 2;
            if (HospitalNavigationService.deptInfo == '' || HospitalNavigationService.deptInfo == null || HospitalNavigationService.deptInfo == undefined) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get('hospital_navigation.searchInfoMsg', '您当前没有选择要查询的科室，请输入要搜索的科室名！')
                });
            }
            else {
                $state.go("navigation_deptinfo");
            }
        };

        //预警提示
        $scope.warnMessage = function (message) {
            KyeeMessageService.broadcast({
                content: message
            });
        };
            $scope.areaSwitch = function (index,record) {
                $scope.currentAreaIndex = index;
                $scope.currentArea = $scope.resultData[index];
                $scope.isShow = false;
                //修改：导航图下面楼层信息 wenpengkun 任务单号：KYEEAPPTEST-3771
                for(var i = 0; i <  $scope.buildNumberAll.length; i++){
                    if(record.HOSPITAL_AREA == $scope.buildNumberAll[i].AREA_NAME){
                        $scope.buildNumberName = $scope.buildNumberAll[i].AREA;
                        $scope.buildNumberInfo = $scope.buildNumberName[0].INFO;
                        $scope.buildSelect = 0;
                        $scope.floorSelect = 0;
                    }
                }
                HospitalNavigationService.currentArea = $scope.currentArea;
                HospitalNavigationService.currentAreaIndex = $scope.currentAreaIndex;
                if (HospitalNavigationService.fixedPositionInfro) {
                    HospitalNavigationService.fixedPositionInfro.DEPT_COORD = null;
                    HospitalNavigationService.fixedPositionInfro.DEPT_ROUTE = null;
                    HospitalNavigationService.fixedPositionInfro.HOSPITAL_AREA = null;
                }
        };
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
        $scope.searchDept = function () {//吴伟刚 KYEEAPPC-4807 院内导航优化(前台)
            $scope.showShake = "";
            search();
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
                HOSPITAL_FLOOR_NUMBER: dept.HOSPITAL_FLOOR_NUMBER
            };
            getDepartLocationDetail();
            $scope.deptSearch.keywords = "";
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
         * 浮动层
         */
        var screenSize = KyeeUtilsService.getInnerSize();
        $scope.data = {};

        $scope.overlayData = {
            width: screenSize.width - 50 * 2,
            height: screenSize.height / 2 + 200
        };
        $scope.bind = function (params) {
            $scope.showOverlay = params.show;
            $scope.hideOverlay = params.hide;
        };
        /**
         * 选中楼
         * @param index
         */
        $scope.selectBuild = function(index){
            $scope.buildNumberInfo = $scope.buildNumberName[index].INFO;
            $scope.buildSelect = index;
            $scope.floorSelect = 0;
            $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
        };
        /**
         * 选中楼层
         * @param index
         */
        $scope.selectFloor = function(index){
            $scope.data.DEPT = $scope.buildNumberName[$scope.buildSelect].INFO[index].DEPT;
            $scope.data.SELECT = $scope.selectDept;
            $scope.data.HIDE = $scope.hideOverlay;
            $ionicScrollDelegate.$getByHandle('smartWin').scrollTop();
            $scope.showOverlay();
            $scope.floorSelect = index;
        };
        /**
         * 选中科室
         * @param index
         */
        $scope.selectDept = function(index){
            if(setTime){
                clearTimeout(setTime);
            }
            $scope.showShake = "";
            $scope.isShow = false;
            HospitalNavigationService.fixedPositionInfro = {
                HOSPITAL_ID: $scope.data.DEPT[index].HOSPITAL_ID,
                DEPT_NAME: $scope.data.DEPT[index].HOSPITAL_FLOOR_DEPT,
                FLOOR_NAME: $scope.data.DEPT[index].HOSPITAL_BUILD_NUMBER,
                DEPT_COORD: $scope.data.DEPT[index].HOSPITAL_COORD,
                DEPT_ROUTE: $scope.data.DEPT[index].ROUTE,
                HOSPITAL_AREA: $scope.data.DEPT[index].HOSPITAL_AREA,
                HOSPITAL_FLOOR_NUMBER:$scope.data.DEPT[index].HOSPITAL_FLOOR_NUMBER
            };
            setTimeout(function () {
                getDepartLocationDetail();
                $scope.$apply();
            }, 500);
            $scope.data.HIDE();
        };
        $scope.frontClick = function(){
            //if($scope.deptSearch.keywords){
            //    KyeeEffectService.ClickEffect.removeCircleEffect();
            //    return true;
            //}else{
            //    $ionicScrollDelegate.$getByHandle('mainContent').scrollTop();
            //    //loadData(); //加载院内导航相关信息
            //    setTimeout(function () {
            //        KyeeEffectService.ClickEffect.addCircleEffect({
            //            onBefore: function (cfg) {
            //                return (cfg.top >= 90 && cfg.top <= window.innerHeight);
            //            }
            //        });
            //        $scope.$apply();
            //    }, 1000);
            //    return false;
            //}

            if($scope.deptSearch.keywords){
                return true;
            }else{
                $ionicScrollDelegate.$getByHandle('mainContent').scrollTop();
                return false;
            }
        };
        $scope.groundClick = function() {
            if ($scope.deptSearch.keywords) {
                $scope.deptSearch.keywords = "";
            }
        }
    })
    .build();