/**
 * 产品名称 KYMH
 * 创建用户: 姚斌
 * 时间：2015年11月22日12:33:24
 * 功能：选择首页预约挂号日期
 */
new KyeeModule()
    .group("kyee.quyiyuan.home.selectDate.controller")
    .require([
        "kyee.quyiyuan.home.selectDate.service",
        "kyee.quyiyuan.appointment.find_doctor_dept_info.controller"
    ])
    .type("controller")
    .name("SelectAppointDateController")
    .params(["$scope", "$state", "KyeeUtilsService", "SelectAppointDateService",
        "KyeeMessageService", "HomeService","KyeeI18nService","CacheServiceBus","MultipleQueryCityService"])
    .action(function($scope, $state, KyeeUtilsService, SelectAppointDateService,
                     KyeeMessageService, HomeService,KyeeI18nService,CacheServiceBus,MultipleQueryCityService){

        //当前月份是否可选上月或下月
        $scope.curCursor = 0;

        //初始化头部日期：默认当天
        $scope.DateMoth = KyeeUtilsService.DateUtils.formatFromDate(new Date(),'YYYY年MM月');

        //选择
        $scope.itemClick = function(params){
            var month = params.month, day = params.day, selDateStr = '';
            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }

            //在C端首页选择预约挂号时间格式与去预约挂号返回的日期格式一样  By 杜巍巍 KYEEAPPTEST-3158
            selDateStr = params.year + '/' + month + '/' + day;
            if (selDateStr < KyeeUtilsService.DateUtils.getDate('YYYY/MM/DD')) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("seletAppointDate.selectDateTips","只支持今天及以后的日期")
                });
                return;
            }

            HomeService.selDateStr = selDateStr;
            SelectAppointDateService.querySystemParam(function (findDoctorParam){
                if(findDoctorParam=="0"){
                    HomeService.goState = "seletAppointDate";
                    HomeService.goToAppointment();
                }else{
                    //记录从首页选择预约挂号时间过去的标志 By 杜巍巍  KYEEAPPTEST-3158
                    HomeService.goState = "find_doctor_dept_info";
                    //如果没选城市，则先选择城市，否则选择医院
                    var storageCache = CacheServiceBus.getStorageCache();
                    var selected = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
                    if(selected){
                        $state.go('find_doctor_dept_info');
                    }else{
                        MultipleQueryCityService.goState = "find_doctor_dept_info";
                        $state.go('multiple_city_list');
                    }
                }
            });
        };
        //绑定选择事件
        $scope.bind = function (params) {
            $scope.nextMonth = params.nextMonth;
            $scope.prevMonth = params.prevMonth;
            $scope.yearmonth = params.setYearAndMonth;
            $scope.getYearmonth = params.getYearAndMonth;
        };

        //点击上月、下月
        $scope.changeDateMonth=function(AddMonthCount){
            $scope.curCursor += AddMonthCount;
            if(AddMonthCount==-1){
                $scope.prevMonth();
            }else{
                $scope.nextMonth();
            }
            var currDate = $scope.getYearmonth();
            $scope.DateMoth=currDate.year + "年" + (currDate.month < 10 ? "0" + currDate.month : currDate.month)  + "月";
        };

        //统计进入模块次数  By  章剑飞  KYEEAPPC-4536  2015年12月14日15:54:38
        SelectAppointDateService.enterSelectDate();

    })
    .build();