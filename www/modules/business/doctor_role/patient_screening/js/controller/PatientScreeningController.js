/*
 * 产品名称：quyiyuan
 * 创建人: 章剑飞
 * 创建日期：2015年6月29日09:41:12
 * 创建原因：诊疗病人控制层
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctor_role.patient_screening.controller")
    .require(["kyee.quyiyuan.doctor_role.patient_screening.service",
        "kyee.quyiyuan.doctorRole.messageBoard.service"])
    .type("controller")
    .name("patientScreeningController")
    .params(["$scope", "$state", "patientScreeningService",
        "MessageBoardService", "KyeeMessageService", "CacheServiceBus",
        "KyeeUtilsService", "KyeeListenerRegister", "$ionicScrollDelegate","KyeeI18nService"])
    .action(function ($scope, $state, patientScreeningService,
                      MessageBoardService, KyeeMessageService, CacheServiceBus,
                      KyeeUtilsService, KyeeListenerRegister, $ionicScrollDelegate,KyeeI18nService) {

        // 初始化页面时间显示方式
        $scope.timeShowType = 1;

        var startDate = new Date();
        var endDate = new Date();
        $scope.yearRange = (startDate.getFullYear() - 10) + '->' + (startDate.getFullYear() + 10);
        //转换开始时间和结束时间
        function format() {
            $scope.startDate = KyeeUtilsService.DateUtils.formatFromDate(startDate, 'YYYY/MM/DD');
            $scope.endDate = KyeeUtilsService.DateUtils.formatFromDate(endDate, 'YYYY/MM/DD');
        }

        format();
        //前一天
        $scope.prevDay = function () {
            var time = startDate.getTime();
            startDate = new Date(time - 24 * 60 * 60 * 1000);
            endDate = new Date(time - 24 * 60 * 60 * 1000);
            format();
            loadData(true);
        };
        //后一天
        $scope.nextDay = function () {
            var time = startDate.getTime();
            startDate = new Date(time + 24 * 60 * 60 * 1000);
            endDate = new Date(time + 24 * 60 * 60 * 1000);
            format();
            loadData(true);
        };

        //是否选中已就诊
        $scope.visitStatus = '';
        //就诊次数标识
        $scope.visitTimes = 0;
        //是否显示过滤器
        $scope.showFilters = true;
        //可滚动的高度
        $scope.height = window.innerHeight - 224;
        //是否无数据
        $scope.isEmpty = false;
        //选择就诊次数
        $scope.chooseVisitTime = function (index) {
            //重复选择则取消选择
            if ($scope.visitTimes == index) {
                $scope.visitTimes = 0;
            } else {
                $scope.visitTimes = index;
            }
            loadData(true);
        };
        //选择是否就诊
        $scope.visitOrNot = function (VISITED) {
            //重复选择则取消选择
            if ($scope.visitStatus == VISITED) {
                $scope.visitStatus = '';
            } else {
                $scope.visitStatus = VISITED;
            }
            loadData(true);
        };

        //显示或隐藏过滤器
        $scope.showFiltersOrNot = function () {
            $scope.showFilters = !$scope.showFilters;
            if ($scope.showFilters) {
                //显示过滤器时，滚动条的高度
                $scope.height = window.innerHeight - 224;
            } else {
                //不显示过滤器时，滚动条的高度
                $scope.height = window.innerHeight - 116;
            }
        };
        /*
         * 初始化加载数据
         * showLoading表示是否显示加载图片
         * oneDay表示是否搜索的内容为一天
         * */
        function loadData(showLoading) {
            patientScreeningService.loadData(function (data) {
                $scope.patientData = data;

                // 处理患者列表数据 姚斌 KYEEAPPTEST-2807 2015年7月30日13:00:41
                processPatientData();

                if (data.length == 0) {
                    $scope.isEmpty = true;
                } else {
                    $scope.isEmpty = false;
                }
                // KYEEAPPTEST-2846 医院互动医生角色列表显示优化
                // 修改人：朱学亮
                // 修改时间：2015-8-6 13:14
                // 刷新数据成功的回调方法中，列表滚动到顶部
                $ionicScrollDelegate.scrollTop();
            }, $scope.visitStatus, $scope.visitTimes, $scope.startDate, $scope.endDate, showLoading);
        }

        //初始化加载数据
        loadData(true);

        //绑定日期组件方法
        $scope.bind = function (params) {
            $scope.show = params.show;
        };

        //选择日期完成
        $scope.onFinash = function (params) {
            if (chooseStartDate) {
                if (params.fullDateString > $scope.endDate) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("patientScreening.startDateTips", "起始日期不能大于结束日期！")
                    });
                    return true;
                }
                startDate.setYear(params[0].value);
                startDate.setMonth(params[1].value - 1);
                startDate.setDate(params[2].value);
                $scope.startDate = params.fullDateString;
            } else {
                if (params.fullDateString < $scope.startDate) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("patientScreening.startDateTips", "起始日期不能大于结束日期！")
                    });
                    return true;
                }
                endDate.setYear(params[0].value);
                endDate.setMonth(params[1].value - 1);
                endDate.setDate(params[2].value);
                $scope.endDate = params.fullDateString;
            }
            loadData(true);
            return true;
        };
        //是否选择起始日期
        var chooseStartDate = true;
        //点击日期
        $scope.chooseDate = function (flag) {
            var defaultValue = {};
            if (flag == 'start') {
                chooseStartDate = true;
                defaultValue = {
                    "0": startDate.getFullYear(),
                    "1": startDate.getMonth() + 1,
                    "2": startDate.getDate()
                };
                $scope.show(defaultValue);
            } else if (flag == 'end') {
                chooseStartDate = false;
                defaultValue = {
                    "0": endDate.getFullYear(),
                    "1": endDate.getMonth() + 1,
                    "2": endDate.getDate()
                };
                $scope.show(defaultValue);
            }
        };

        //跳转到患者信息
        $scope.toPatientDetail = function (patientInfo, index) {

            //初始化未读消息对象
            var unReadWord = {};
            unReadWord.index = index;
            MessageBoardService.unReadWord = unReadWord;

            MessageBoardService.paramData = patientInfo;
            $state.go('patientInfo.doctorMessageBoard');
        };

        /**
         * 添加页面回退相应事件
         */
        KyeeListenerRegister.regist({
            focus : "patientScreening",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction : "back",
            action : function(params){

                var unReadWord = MessageBoardService.unReadWord;

                if($scope.patientData && $scope.patientData.length > 0
                    && unReadWord.readFlag){
                    angular.forEach($scope.patientData, function (item, index, items) {
                        if(unReadWord.index == index){
                            $scope.patientData[index].READ_NUM = 0;
                        }
                    });
                }
            }
        });

        /**
         * 处理后台返回的患者列表 姚斌 KYEEAPPTEST-2807 2015年7月30日13:00:41
         */
        var processPatientData = function () {

            if($scope.patientData && $scope.patientData.length > 0){

                // 判断显示方式
                if($scope.visitTimes > 1){
                    $scope.timeShowType = 3;
                } else if($scope.startDate < $scope.endDate){
                    $scope.timeShowType = 2;
                } else {
                    $scope.timeShowType = 1;
                }

                angular.forEach($scope.patientData, function (item, index, items) {
                    // 生成显示时间
                    if($scope.timeShowType == 1){
                        $scope.patientData[index].showTime = $scope.patientData[index].CLINIC_DURATION;
                    } else if($scope.timeShowType == 2){
                        $scope.patientData[index].showTime =
                            KyeeUtilsService.DateUtils.formatFromDate($scope.patientData[index].REG_DATE, 'YYYY/MM/DD');
                    }

                    // 就诊状态
                    if ($scope.patientData[index].VISIT_STATUS == 2) {
                        $scope.patientData[index].visitStatusStr = KyeeI18nService.get("patientScreening.seeDoctor", "已就诊")
                    } else {
                        $scope.patientData[index].visitStatusStr = KyeeI18nService.get("patientScreening.notSeeDoctor", "未就诊")
                    }
                });

            }
        }

    })
    .build();