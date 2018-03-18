/**
 * 产品名称：quyiyuan
 * 创建者：liujian
 * 创建时间：2015年11月25日09:48:54
 * 创建原因：排班模块--按医生查看医生排班控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.scheduleByDoctor.controller")
    .require(["kyee.framework.service.view","kyee.quyiyuan.scheduleByDoctor.service","kyee.framework.service.message"])
    .type("controller")
    .name("ScheduleByDoctorController")
    .params(["$scope","$state","ScheduleByDoctorService","ScheduleDeptService","KyeeMessageService","AppointmentDoctorDetailService","CacheServiceBus","$ionicScrollDelegate","KyeeUtilsService","$timeout"])
    .action(function($scope,$state,ScheduleByDoctorService,ScheduleDeptService,KyeeMessageService,AppointmentDoctorDetailService,CacheServiceBus,$ionicScrollDelegate,KyeeUtilsService,$timeout){


        $scope.deptDisplay = 0;//默认收起科室介绍
        $scope.doctorDisplay=0;//默认收起医生介绍
        $scope.doctorpage=0;//初始化医生当前页数
        $scope.schedulepage=0;//初始化医生排班页数
        //初始化展示第一页第一行第一列的医生的排班
        $scope.doctor_x=0;
        $scope.doctor_y=0;
        $scope.doctor_z=0;
        //排班数据是否为空
        $scope.empty = false;
        //获取科室服务中用户已选的科室对象
        $scope.deptData=ScheduleDeptService.deptData;
        //定义一个比较器
        function compare(propertyName) {
            return function (object1, object2) {
                var value1 = object1[propertyName];
                var value2 = object2[propertyName];
                if (value2 > value1) {
                    return -1;
                }
                else if (value2 < value1) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        }
        //从全局里获取hospitalid
        var hospitalinfo= CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        //获取缓存中的当前就诊者信息
        var currentPatient= CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);

        var params={"hospitalId":hospitalinfo.id,"deptCode":$scope.deptData.DEPT_CODE};

        //处理排班日期
        function detailWeekDate(maxClinicDate){
            var maxClinicDateIsSunday = false;
            //var maxClinicDate="2015/12/16";
            //根据最大日期获取所在日期的星期日的日期
            var clinicDate = new Date(maxClinicDate);          //当前日期
            var clinicDayOfWeek = clinicDate.getDay();         //当前周的第几天
            var clinicDay = clinicDate.getDate();              //当前日
            var clinicMonth = clinicDate.getMonth();           //当前月
            var clinicYear = clinicDate.getYear();             //当前年
            if(clinicDayOfWeek == 0) {
                maxClinicDateIsSunday = true;
            }
            //获取下一天日期
            function NextDay(d){
                d = +d + 1000*60*60*24;
                d = new Date(d);
                return d;
            }
            //获得最大日期所在周的开始日期
            //var maxWeekStartDate = new Date(clinicYear, clinicMonth, clinicDay - clinicDayOfWeek);
           // var getMaxWeekStartDate=(maxWeekStartDate.getMonth()+1)+"月"+NextDay(maxWeekStartDate).getDate()+"日";
            //获得最大日期所在周的结束日期
            var maxWeekEndDate = new Date(clinicYear, clinicMonth, clinicDay + (6 - clinicDayOfWeek));
           // var getMaxWeekEndDate= (maxWeekEndDate.getMonth()+1)+"月"+NextDay(maxWeekEndDate).getDate()+"日";

            //根据当前日期获取本周起始日期，和结束日期
            var now = new Date();                    //当前日期
            //如果当前日期是周日，则开始日期为当前周的周一
            if(now.getDay()==0){
                //获取周日的前一天日期
                now = new Date(now.getTime() - 24*60*60*1000);
                var sunDay=7;
            }
            var nowDayOfWeek = now.getDay();         //今天本周的第几天
            var nowDay = now.getDate();              //当前日
            var nowMonth = now.getMonth();           //当前月
            var nowYear = now.getYear();             //当前年
            //(getNextDay(getWeekEndDate).getMonth()+1)+"月"+getNextDay(getWeekEndDate).getDate()+"日";
            //获得本周的开始日期
            var WeekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
            $scope.WeekStartDate=WeekStartDate;
            var getWeekStartDate=(NextDay(WeekStartDate).getMonth()+1)+"月"+NextDay(WeekStartDate).getDate()+"日";
            //获得本周的结束日期
            var WeekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek));
            $scope.WeekEndDate=WeekEndDate;
            var getWeekEndDate= (NextDay(WeekEndDate).getMonth()+1)+"月"+NextDay(WeekEndDate).getDate()+"日";
            $scope.weekMouthDate=getWeekStartDate+"-"+getWeekEndDate;
            // 给日期类对象添加日期差方法，返回日期与diff参数日期的时间差，单位为天
            Date.prototype.diff = function(date){
                return (this.getTime() - date.getTime())/(24 * 60 * 60 * 1000);
            };
            //星期
            var weekArr=[];
            //日期
            var weekDate=[];
            var weekDateShow=[];
            var diff = maxWeekEndDate.diff(WeekStartDate)+1;
            //当前数据有几页
            var pageArr=[];
            var tempIon = false;//排班下按钮的样式显示
            for(var i=0;i<diff/7;i++){
                if(maxClinicDateIsSunday) {
                    maxClinicDateIsSunday = false;
                    tempIon = true;
                    continue;
                }
                if(tempIon) {
                    pageArr.push(i-1);
                } else {
                    pageArr.push(i);
                }
            }
            $scope.pageArr=pageArr;
            if(pageArr.length != diff/7) {
                //若不相等表示排班的最大日期是周日，下一周的排班都将为空，因此将减去7天的显示。
                diff = diff - 7;
            }
            for(var i=0;i<diff;i++){

                function getNextDay(d){
                    d = +d + 1000*60*60*24*(i+1);
                    d = new Date(d);
                    return d;
                }
                weekDate.push((getNextDay(WeekStartDate).getMonth()+1)+"-"+getNextDay(WeekStartDate).getDate());
                weekDateShow.push((getNextDay(WeekStartDate).getMonth()+1)+"-"+getNextDay(WeekStartDate).getDate());
                if(i%7==0){
                    weekArr.push("周一");
                }
                else if(i%7==1){
                    weekArr.push("周二");
                }
                else if(i%7==2){
                    weekArr.push("周三");
                }
                else if(i%7==3){
                    weekArr.push("周四");
                }
                else if(i%7==4){
                    weekArr.push("周五");
                }
                else if(i%7==5){
                    weekArr.push("周六");
                }
                else if(i%7==6){
                    weekArr.push("周日");
                }
            }
            //如果当前日期是周日
            if(sunDay==7){
                weekArr[6]="今天";
            }else{
                weekArr[nowDayOfWeek-1]="今天";
            }
            //计算每一周的起始时间和结束时
                var weekMouth=[];
                weekMouth[0]=getWeekStartDate+"-"+getWeekEndDate;
                for(var i=1;i<$scope.pageArr.length;i++){
                    function NextWeek(d){
                        d = +d + (1000*60*60*24*(i*7+1));
                        d = new Date(d);
                        return d;
                    }
                    var getWeekStartDate=(NextWeek($scope.WeekStartDate).getMonth()+1)+"月"+NextWeek($scope.WeekStartDate).getDate()+"日";
                    var getWeekEndDate= (NextWeek($scope.WeekEndDate).getMonth()+1)+"月"+NextWeek($scope.WeekEndDate).getDate()+"日";
                    weekMouth[i]=getWeekStartDate+"-"+getWeekEndDate;
                }
            $scope.weekMouth=weekMouth;
            $scope.weekList=weekArr;
            $scope.weekDate=weekDate;
            //如果当前日期是周日
            /*if(sunDay==7){
                weekDateShow[6]="";
            }else{
                weekDateShow[nowDayOfWeek-1]="";
            }*/
            $scope.weekDateList=weekDateShow;
        }
        //处理排班数据
        function detailSchedule(doctorScheduleArr){
            //上午排班
            var amScheduleArr=[];
            //下午排班
            var pmScheduleArr=[];
            for(var i=0;i< $scope.weekDate.length;i++){
                for(var j=0;j<doctorScheduleArr.length;j++){
                    var clinicDate= KyeeUtilsService.DateUtils.formatFromString(doctorScheduleArr[j].CLINIC_DATE,'YYYY/MM/DD', 'MM-DD');
                    var weekDateList= KyeeUtilsService.DateUtils.formatFromString($scope.weekDate[i],'MM-DD', 'MM-DD');
                   if(clinicDate== weekDateList){

                       if(doctorScheduleArr[j].CLINIC_DURATION=="昼夜"){
                           amScheduleArr.push("白班");
                           pmScheduleArr.push("晚班");
                       }
                       if(doctorScheduleArr[j].CLINIC_DURATION=="上午"||doctorScheduleArr[j].CLINIC_DURATION=="白天"||doctorScheduleArr[j].CLINIC_DURATION=="全天"){
                           if(doctorScheduleArr[j].CLINIC_DURATION=="上午"){
                               amScheduleArr.push("上午");
                           }else if(doctorScheduleArr[j].CLINIC_DURATION=="白天"){
                               amScheduleArr.push("白班");
                           }else if(doctorScheduleArr[j].CLINIC_DURATION=="全天"){
                               amScheduleArr.push("白班");
                           }
                       }
                      else if(doctorScheduleArr[j].CLINIC_DURATION=="下午"){
                               pmScheduleArr.push("下午");
                       }
                   }
                }
                //无上午排班
                if (amScheduleArr.length <= i) {
                    amScheduleArr.push(' ');
                }
                //无下午排班
                if (pmScheduleArr.length <= i) {
                    pmScheduleArr.push(' ');
                }
            }
            $scope.amScheduleArr=amScheduleArr;
            $scope.pmScheduleArr=pmScheduleArr;
        }
        //处理医生介绍数据
        function detaildoctordesc(doctordesc){
            if(doctordesc==null && doctordesc==undefined){
                $scope.doctor.DOCTOR_DIC_SHOW="暂无信息";
            }else{
                if (doctordesc.length > 45) {
                    $scope.doctor.DOCTOR_DIC_SHOW= doctordesc.substring(0,45) + "...";
                }
                else{
                    $scope.doctor.DOCTOR_DIC_SHOW= doctordesc;
                }
            }
            $scope.doctor.DOCTOR_DESC=$scope.doctor.DOCTOR_DIC_SHOW;
        };
        //查询预约按医生排班
        ScheduleByDoctorService.querySchedule(params, function(doctorScheduleTable) {
            if (doctorScheduleTable == undefined || doctorScheduleTable.length == 0) {
                $scope.empty = true;
            }else{
                //预约排班所有数据
                $scope.doctorSchedule = doctorScheduleTable;
                //默认显示第一个医生的排班
                $scope.doctor=doctorScheduleTable[$scope.doctor_x][$scope.doctor_y][$scope.doctor_z];

                //处理医生介绍
                detaildoctordesc($scope.doctor.DOCTOR_DIC);
                //将排班按时间从大到小排序
                var doctorScheduleArr=$scope.doctor.DOCTOR_SCHEDULE_LIST.sort(compare("CLINIC_DATE"));
                var maxindex=doctorScheduleArr.length-1;
                //获取最大排班时间
                var maxClinicDate=doctorScheduleArr[maxindex].CLINIC_DATE;
                //计算排班星期及日期
                detailWeekDate(maxClinicDate);
                //计算医生排班
                detailSchedule(doctorScheduleArr);
            }
        });
        //展示日期
        $scope.getweeklist=function(index){
            return $scope.weekList[index];
        };
        //选择某一医生时
        $scope.chooseDoctor=function(col,row,page,doctor){
            $ionicScrollDelegate.$getByHandle("doctor_schedule").scrollTo(0, 0,true);
            $scope.deptDisplay = 0;//默认收起科室介绍
            $scope.doctorDisplay=0;//默认收起医生介绍
            $scope.schedulepage=0;
            $scope.doctor_x=page;
            $scope.doctor_y=row;
            $scope.doctor_z=col;
            $scope.doctor=doctor;
            //将排班按时间从大到小排序
            var doctorScheduleArr=$scope.doctor.DOCTOR_SCHEDULE_LIST.sort(compare("CLINIC_DATE"));
            var maxindex=doctorScheduleArr.length-1;
            //获取最大排班时间
            var maxClinicDate=doctorScheduleArr[maxindex].CLINIC_DATE;
            //处理医生介绍
            detaildoctordesc($scope.doctor.DOCTOR_DIC);
            //计算排班星期及日期
            detailWeekDate(maxClinicDate);
            //计算医生排班
            detailSchedule(doctorScheduleArr);
            $ionicScrollDelegate.$getByHandle("doctor_schedule_content").resize();
        };
        var lastUpdateTime = -10;
        $scope.start = function(){
            var ts = KyeeUtilsService.interval({
                time: 250,
                action: function () {

                    if((new Date().getTime() - lastUpdateTime) > 250){
                        KyeeUtilsService.cancelInterval(ts);
                        $scope.doctorpage = (Math.round($ionicScrollDelegate.$getByHandle("doctor_list").getScrollPosition().left / (KyeeUtilsService.getInnerSize().width - 16*2)));
                    }
                }
            });
        };
        //监听用户滑动
        $scope.lestionScroll=function(){
            lastUpdateTime = new Date().getTime();
        };
        //点击右侧医生，切换下一页医生
        $scope.torightDoctor=function(){
            var screenSize = KyeeUtilsService.getInnerSize();
            $scope.doctorpage++;
            $ionicScrollDelegate.$getByHandle("doctor_list").scrollTo(screenSize.width*($scope.doctorpage),0,true);
        };
        //点击左侧医生，切换下一页医生
        $scope.toleftDoctor=function(){
            var screenSize = KyeeUtilsService.getInnerSize();
            $scope.doctorpage--;
            $ionicScrollDelegate.$getByHandle("doctor_list").scrollTo(screenSize.width*($scope.doctorpage),0,true);
        };
       var schlastUpdateTime=-10;
        $scope.startSchedule = function(){

            var ts = KyeeUtilsService.interval({
                time: 200,
                action: function () {

                    if((new Date().getTime() - schlastUpdateTime) > 200){
                        KyeeUtilsService.cancelInterval(ts);
                        $scope.schedulepage = (Math.round($ionicScrollDelegate.$getByHandle("doctor_schedule").getScrollPosition().left / (KyeeUtilsService.getInnerSize().width - 16*2)));
                        $scope.weekMouthDate=$scope.weekMouth[$scope.schedulepage];
                    }
                }
            });
        };

        //监听用户滑动
        $scope.lestionScheduleScroll=function(){
            schlastUpdateTime = new Date().getTime();
        };
        //点击下一周
        $scope.nextWeekSchedule=function(){
            var screenSize = KyeeUtilsService.getInnerSize();
            if( $scope.schedulepage!=$scope.pageArr.length-1){
                $scope.schedulepage++;
                $ionicScrollDelegate.$getByHandle("doctor_schedule").scrollTo(screenSize.width*($scope.schedulepage),0,true);
                $scope.weekMouthDate=$scope.weekMouth[$scope.schedulepage];
            }
        };
        //点击上一周
        $scope.lastWeekSchedule=function(){
            var screenSize = KyeeUtilsService.getInnerSize();
            if( $scope.schedulepage!=0){
                $scope.schedulepage--;
                $ionicScrollDelegate.$getByHandle("doctor_schedule").scrollTo(screenSize.width*($scope.schedulepage),0,true);
                $scope.weekMouthDate=$scope.weekMouth[$scope.schedulepage];
            }
        };
        //点击更多科室介绍
        $scope.getMoreDeptDic=function(deptDisplay){
            if(deptDisplay==0){
                $scope.deptDisplay=1;
            }else{
                $scope.deptDisplay=0;
                $ionicScrollDelegate.$getByHandle("doctor_schedule_content").scrollTop();
            }
            $ionicScrollDelegate.$getByHandle("doctor_schedule_content").resize();
        };
        //点击更多医生介绍
        $scope.getMoreDoctorDic=function(doctorDisplay){
            if(doctorDisplay==0){
                $scope.doctorDisplay=1;
                $scope.doctor.DOCTOR_DESC=$scope.doctor.DOCTOR_DIC;
            }else{
                $scope.doctorDisplay=0;
                $scope.doctor.DOCTOR_DESC=$scope.doctor.DOCTOR_DIC_SHOW;
            }
            $ionicScrollDelegate.$getByHandle("doctor_schedule_content").resize();
        };
        //可上下滑动医生列表容器
        $timeout(function () {
            if(!$scope.empty){
                var sv = $ionicScrollDelegate.$getByHandle('doctor_list').getScrollView();
                var container = sv.__container;

                var originaltouchStart = sv.touchStart;
                var originaltouchMove = sv.touchMove;

                container.removeEventListener('touchstart', sv.touchStart);
                document.removeEventListener('touchmove', sv.touchMove);

                sv.touchStart = function(e) {
                    e.preventDefault = function(){};
                    originaltouchStart.apply(sv, [e]);
                };

                sv.touchMove = function(e) {
                    e.preventDefault = function(){};
                    originaltouchMove.apply(sv, [e]);
                };

                container.addEventListener("touchstart", sv.touchStart, false);
                document.addEventListener("touchmove", sv.touchMove, false);
            }
        },200);
        //可上下滑动排班容器
        $timeout(function () {
            if(!$scope.empty){
                var sv = $ionicScrollDelegate.$getByHandle('doctor_schedule').getScrollView();
                var container = sv.__container;

                var originaltouchStart = sv.touchStart;
                var originaltouchMove = sv.touchMove;

                container.removeEventListener('touchstart', sv.touchStart);
                document.removeEventListener('touchmove', sv.touchMove);

                sv.touchStart = function(e) {
                    e.preventDefault = function(){};
                    originaltouchStart.apply(sv, [e]);
                };

                sv.touchMove = function(e) {
                    e.preventDefault = function(){};
                    originaltouchMove.apply(sv, [e]);
                };
                container.addEventListener("touchstart", sv.touchStart, false);
                document.addEventListener("touchmove", sv.touchMove, false);
            }
        },200);

    })
    .build();

