/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/16
 * 创建原因：预约挂号医生控制器
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.find_doctor_list.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.service",
        "kyee.quyiyuan.appointment.appointment_doctor.service",
        "kyee.quyiyuan.appointment.doctor_info.controller",
        "kyee.quyiyuan.appointment.doctor_detail.service",
        "kyee.quyiyuan.appoint.appoint_appointConfirm.service",
        "kyee.quyiyuan.regist.registConfirm.controller",
        "kyee.quyiyuan.appoint.appointConfirm.controller",
        "kyee.quyiyuan.regist.regist_registConfirm.service",
        "kyee.quyiyuan.appointment.register.controller"
    ])
    .type("controller")
    .name("FindDoctorListController")
    .params(["$scope", "$state","$ionicScrollDelegate", "KyeeViewService", "AppointmentDeptGroupService", "CacheServiceBus", "AppointmentDoctorService",
        "KyeeUtilsService", "AppointmentDoctorDetailService","KyeeMessageService","KyeeListenerRegister","HomeService",
        "FilterChainInvoker","AppointConfirmService","RegistConfirmService","HospitalSelectorService","KyeeI18nService","$ionicHistory","MultipleQueryCityService","$timeout"])
    .action(function ($scope, $state,$ionicScrollDelegate, KyeeViewService, AppointmentDeptGroupService,
                      CacheServiceBus, AppointmentDoctorService, KyeeUtilsService, AppointmentDoctorDetailService,
                      KyeeMessageService,KyeeListenerRegister,HomeService,FilterChainInvoker,AppointConfirmService,
                      RegistConfirmService,HospitalSelectorService,KyeeI18nService,$ionicHistory,MultipleQueryCityService,$timeout) {
     /*   //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "find_doctor_list",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
        //返回
        $scope.back = function () {
            if (AppointmentDoctorService.ROUTE_STATE == "appointment_result") {
                AppointmentDoctorService.ROUTE_STATE = "";
                $state.go("home->MAIN_TAB");
            }
            else {
                $ionicHistory.goBack(-1);
            }
        };*/
        //患者选择的日期
        var selectDate=[];
        //选择医院组件，被选择的医院的ID
        var theSelectHospitalId = "";
        var theSelectCityId = {};
        //缓存数据
        var storageCache= CacheServiceBus.getStorageCache();
        //日期选择组件显示三周日期
        var timeComponentSum="";//时间组件显示三周时间
        //医生列表分页
        var page="";
        //医院列表分页
        var hospitalPage="";
        //医院列表每次点击加载更多显示多少个医院
        var hospitalNum="";
        //刚进页面和切换地区时，要从缓存取市
        var cityData = "";
        //星期的计算
        function weekDayCompute(weekDay){
            var weekArr="";
            if(weekDay==0){
                weekArr="周日";
            }
            else if(weekDay==1){
                weekArr="周一";
            }
            else if(weekDay==2){
                weekArr="周二";
            }
            else if(weekDay==3){
                weekArr="周三";
            }
            else if(weekDay==4){
                weekArr="周四";
            }
            else if(weekDay==5){
                weekArr="周五";
            }
            else if(weekDay==6){
                weekArr="周六";
            }
            return weekArr;
        }
        //处理排班日期数据
        function doctorShowDate(){
            //根据当前日期获取本周起始日期，和结束日期
            var now = new Date();
            //当前日期周几
            var nowWeek= now.getDay() ;
            var dateArray =computeAllDate(nowWeek);
            var nextweek=new Date(now.getTime()+7 * 24 * 3600 * 1000);//下一周日期
            var nowDayOfWeek = now.getDay();         //今天本周的第几天
            var nowDay = now.getDate();              //当前日
            var nowMonth = now.getMonth();           //当前月
            var nowYear = now.getFullYear();             //当前年
            //获得本周的结束日期
            var WeekEndDate = new Date(nowYear, nowMonth, nowDay + (7 - nowDayOfWeek));
            //获得下周的结束日期
            var nextWeekEndDate=new Date(nextweek.getFullYear(),nextweek.getMonth(),nextweek.getDate()+(7-nextweek.getDay()));
            var weekArr=[];                //当前周星期
            var doctorDate=[];                //当前周日期
            var showweek=[];                //初始化显示选中的日期
            var nextWeekArr=[];             //下一周星期
            var nextdoctorDate=[];          //下周日期
            var shownextweek=[];           //初始化显示选中的下周日期
            var otherWeekArr=[];
            var otherdoctorDate=[];
            var showotherweek=[];
            //真实日期
            var doctorRealDate=[];
            var nextdoctorRealDate=[];
            var otherdoctorRealDate=[];

            for(var i=0;i<dateArray.length;i++){
                var doctorDateTime= new Date(dateArray[i]);
                if(doctorDateTime<=WeekEndDate){
                    weekArr.push(weekDayCompute(doctorDateTime.getDay()));
                    doctorDate.push((doctorDateTime.getMonth()+1)+"-"+doctorDateTime.getDate());
                    doctorRealDate.push(dateFormat(doctorDateTime));
                    if(doctorDateTime<now){
                        showweek.push(3)
                    }else{
                        showweek.push(0);
                    }
                }else if(WeekEndDate<doctorDateTime&&doctorDateTime<=nextWeekEndDate){
                    nextWeekArr.push(weekDayCompute(doctorDateTime.getDay()));
                    nextdoctorDate.push((doctorDateTime.getMonth()+1)+"-"+doctorDateTime.getDate());
                    nextdoctorRealDate.push( dateFormat(doctorDateTime));
                    shownextweek.push(0);
                }else{
                    otherWeekArr.push(weekDayCompute(doctorDateTime.getDay()));
                    otherdoctorDate.push((doctorDateTime.getMonth()+1)+"-"+doctorDateTime.getDate());
                    otherdoctorRealDate.push(dateFormat(doctorDateTime));
                    showotherweek.push(0);
                }
            }

            $scope.componentData={
                weekArr:weekArr,//第一周周几
                doctorDate:doctorDate,//第一周显示日期
                showweek:showweek,//第一周是否被选中标识
                doctorRealDate:doctorRealDate,//第一周年月日
                nextWeekArr:nextWeekArr,//第二周周几
                nextdoctorDate:nextdoctorDate,//第二周显示日期
                nextdoctorRealDate:nextdoctorRealDate,//第二周年月日
                shownextweek:shownextweek,//第二周是否被选中标识
                otherWeekArr:otherWeekArr,
                otherdoctorDate:otherdoctorDate,
                otherdoctorRealDate:otherdoctorRealDate,
                showotherweek:showotherweek,
                showChoseDate:2,//刚进页面默认显示选择医院tab为绿色
                hospitals:[],
                hospitalIndex:0//默认选中第1个医院
            };
        }
        //日期格式处理
        function dateFormat(doctorDateTime){
            var date=doctorDateTime.getFullYear()+"-"+(doctorDateTime.getMonth()+1)+"-"+doctorDateTime.getDate();
            var dateDeal=KyeeUtilsService.DateUtils.formatFromString(date, 'YYYY-MM-DD', 'YYYY/MM/DD');
            return dateDeal;
        }

        //初始化预约挂号条款不显示
        $scope.registNotificationShow=false;
        $scope.appointNotificationShow=false;
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "find_doctor_list",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
           // direction: "both",
            action: function (params) {
                $scope.hasmore=false;
                selectDate = [];
                theSelectHospitalId = "";
                theSelectCityId = {};
                timeComponentSum=21;//三周的时间
                page = 0;
                hospitalPage=0;
                hospitalNum=10;//先显示十个医院
                cityData = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
                //获取用户选择的二级科室
                var deptData  = AppointmentDoctorService.JUNIORDEPT_DEPT;
                $scope.deptData = deptData;
                //标题科室名称
                $scope.deptName= $scope.deptData.JUNIORDEPT_NAME;
                showCityName(cityData);
                $scope.doctorarr=null;
                //判断设备是否为ios
                if(window.device != undefined && ionic.Platform.platform() == "ios"){
                    var screenSize = KyeeUtilsService.getInnerSize();
                    $scope.deviceTop= 64+50;
                }else{
                    $scope.deviceTop=44+50;
                }
                queryDoctorInit();
            }
        });
        //获取医生排班列表初始化
        function queryDoctorInit(){
            //选择医院的向上箭头是否显示
            $scope.showDateUp=false;
            //选择时间的向上箭头是否显示
            $scope.showHospitalUp=false;
            //初始化医生排班列表为空
            $scope.showHospitalEmpty = false;
            theSelectCityId.CITY_CODE = cityData.CITY_CODE;
            theSelectCityId.CITY_NAME = cityData.CITY_NAME;
            doctorShowDate();
            $scope.hasmore=false;
            $scope.componentData.hospitalIndex = 0;//默认选中第一个医院
            var type = 2;//需要加载医院
            $scope.queryDoctorList(type);
        }
        //上拉加载
        $scope.loadMoreList= function(){
            if(!$scope.hasmore){
                return;
            }
            var type=1;//表示上拉加载接口过来的
            $scope.queryDoctorList(type)
        };
        //获取医生排班列表
        $scope.queryDoctorList=function(type){
            var params = {};
            //storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.DEPT_INFO,dept)
            cityData = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
            page=page+1;
            //先判断首页所选时间。1、在确定时间组件的时候，或者所选时间长度不为空，清掉首页时间
            //判断是否选择时间，返回空串有两种可能：1、不限时间2、没有选择时间（则取首页时间）
            var dateString=getTimeString();
            if(HomeService.selDateStr!=null&& HomeService.selDateStr!=undefined && HomeService.selDateStr!=""){
                var selDateStr=new Date(HomeService.selDateStr);
                dateString="'"+dateFormat(selDateStr)+"'";
            }
            //start 参数组装
            params.CLINIC_DATES = dateString;
            params.HOSPITAL_ID = theSelectHospitalId;
            //获取科室医生
            //选择城市下所有市改为所有医院 KYEEAPPC-5215
            if(theSelectCityId.CITY_NAME=="所有医院"){
                params.CITY_CODE ="";
            }else{
                params.CITY_CODE = theSelectCityId.CITY_CODE;
            }
            params.PROVINCE_CODE = cityData.PROVINCE_CODE;
            params.JUNIORDEPT_ID =$scope.deptData.JUNIORDEPT_ID;
            params.PAGE =page;
            //end 参数组装
            //获取医生数据
            AppointmentDoctorService.findDoctorData(params,function (hospitalList,doctor) {
                //doctor是医生列表
                for (var i = 0; i < doctor.length; i++){
                    //KYEEAPPC-5358   预约挂号页面改版  wangwan 2016年3月9日19:47:51
                    doctor[i].DOCTOR_SCORE = parseFloat(doctor[i].DOCTOR_SCORE);
                    if(doctor[i].DOCTOR_DESC==null && doctor.DOCTOR_DESC==undefined){
                        doctor[i].DOCTOR_DESC_SHOW="暂无信息";
                    }else{
                        doctor[i].DOCTOR_DESC_SHOW= doctor[i].DOCTOR_DESC;
                    }
                }
                AppointmentDoctorService.DOCTOR_LIST = doctor;//???????????
                if(!$scope.doctorarr){
                    $scope.doctorarr=doctor;
                }else{
                    $scope.doctorarr=$scope.doctorarr.concat(doctor);
                }
                $scope.hasMoreNew=doctor.length>0;
                //暂无数据
                if ($scope.doctorarr == undefined||$scope.doctorarr.length <= 0  || $scope.doctorarr == null) {
                    $scope.empty = true;
                    $scope.noDataReminder="暂无可预约医生，请重新选择";
                }else{
                    $scope.empty = false;
                }
                //只有在切换省市的时候，才会给选择医院页面赋值。
                if(type==2){
                    //医院列表
                    hospitalPage=0;
                    var hospitals = hospitalList;
                    if (hospitals.length == 0) {
                        $scope.showHospitalEmpty = false;
                        $scope.noDataReminder="该科室暂无可预约医生，请重新选择";
                    } else {
                        $scope.showHospitalEmpty = true;
                        //第一个医院后台传的肯定是全部医院，所以给全部医院赋值缓存中的省市code和市name
                        hospitals[0].CITY_CODE=cityData.CITY_CODE;//全部医院的省市code是缓存中的
                        hospitals[0].PROVINCE_CODE=cityData.PROVINCE_CODE;//全部医院的省市code是缓存中的
                        hospitals[0].CITY_NAME=cityData.CITY_NAME;//全部医院的省市code是缓存中的
                     /*   //初始化选择医院控件的每个医院都不打勾，只有被选择的才打钩
                        for(var i=0;i<hospitals.length;i++){
                            if(params.HOSPITAL_ID==hospitals[i].HOSPITAL_ID){
                                hospitals[i].showHospitalGreen = '1';
                                theSelectHospitalId=params.HOSPITAL_ID;
                                theSelectCityId.CITY_CODE =params.CITY_CODE;
                                theSelectCityId.CITY_NAME=params.CITY_NAME;
                            }else{
                                hospitals[i].showHospitalGreen = '0';
                            }
                        }*/
                    }
                    $scope.hospitalDataList=hospitals;
                    //页面初始化先显示固定条数，等点击加载更多显示剩余的
                    for(var i=0;i<$scope.hospitalDataList.length&&i<hospitalPage*hospitalNum+hospitalNum;i++){
                        $scope.componentData.hospitals[i]=$scope.hospitalDataList[i];
                        //如果i+1是医院列表的最后一个医院数据，则给加载更多隐藏
                        if((i+1)<$scope.hospitalDataList.length){
                            $scope.componentData.hasHospital=true;
                        }else{
                            $scope.componentData.hasHospital=false;
                        }
                    }
                }
                $scope.hasmore=false;
                //如果不是上拉加载过来的，则不回到页面顶部
                if(type!=1){
                    $ionicScrollDelegate.$getByHandle("find_doctor_list").scrollTop();
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $timeout(function(){
                        $scope.hasmore=$scope.hasMoreNew;
                },1000);

            });
        };
        //初始化日期筛选医生组件
        $scope.binds = function (params) {
            $scope.showOverlay = params.show;
            $scope.hideOverlay = params.hide;
            params.regist({
                confirmSelectDate:  $scope.confirmSelectDate,
                getDate:$scope.getDate,
                allDate:$scope.allDate,
                resetData:$scope.resetData,
                isallselect:$scope.isallselect,
                chooseItemHospital:$scope.chooseItemHospital,
                loadMoreHospital:$scope.loadMoreHospital,
                isoverToday:$scope.isoverToday

            });
        };

        $scope.doThingForHide =function(){
            $scope.showHospitalUp=false;
            $scope.showDateUp=false;
           }

        //根据日期筛选医生列表
        $scope.getDoctorbyDate=function(){
            $scope.showDateUp=!$scope.showDateUp;
            //wangwan
            if($scope.showDateUp){
                $scope.showHospitalUp=false;
                $scope.componentData.showChoseDate = '1';
                $scope.showOverlay();
                $ionicScrollDelegate.$getByHandle("select_hospital_component").scrollTop();
            }else{
                $scope.hideOverlay();
            }
        };
        //患者选择的日期
        $scope.confirmSelectDate=function(){
            $scope.hideOverlay();
            HomeService.selDateStr=null;//在选择时间页面，确认则清掉首页时间
            page=0;
            $scope.doctorarr=null;//页面医生数据清掉
            $scope.hasmore=false;
            $scope.queryDoctorList();
        };
        //将时间数组拼为字符串形式
        function getTimeString(){
            var confirmDate="";
            if(selectDate.length>0){
                for(var i= 0;i<selectDate.length;i++){
                    var oneDate = selectDate[i];
                    confirmDate = confirmDate+"'"+oneDate+"',";
                }
                //如果选择了时间，则清掉首页的时间
                HomeService.selDateStr=null;//清掉首页所选时间
            }
            if(confirmDate!=""){
                confirmDate=confirmDate.substring(0,confirmDate.length-1);//截掉最后一个逗号
            }
            return confirmDate;
        }
        //不限时间，将标识为1的置为0
        $scope.allDate=function(){
            var select=$scope.isallselect();
            if(select)
            {
                HomeService.selDateStr=null;//清掉首页所选时间
                if($scope.componentData.showweek.indexOf(1)>-1){
                    for(var i=0;i<$scope.componentData.showweek.length;i++){
                        if($scope.componentData.showweek[i]==1){
                            $scope.componentData.showweek[i]=0;
                        }
                    }
                }
                if($scope.componentData.shownextweek.indexOf(1)>-1){
                    for(var i=0;i<$scope.componentData.shownextweek.length;i++){
                        if($scope.componentData.shownextweek[i]==1){
                            $scope.componentData.shownextweek[i]=0;
                        }
                    }
                }
                if($scope.componentData.showotherweek.indexOf(1)>-1){
                    for(var i=0;i<$scope.componentData.showotherweek.length;i++){
                        if($scope.componentData.showotherweek[i]==1){
                            $scope.componentData.showotherweek[i]=0;
                        }
                    }
                }
            }
        };
        //重置患者选择的日期
        $scope.resetData=function(){
            //不限时间
            $scope.allDate();
        };
        //选中不限时间
        $scope.isallselect=function(){
            if($scope.componentData!=undefined){
                if($scope.componentData.showweek.indexOf(1)>-1 || $scope.componentData.shownextweek.indexOf(1)>-1||$scope.componentData.showotherweek.indexOf(1)>-1){
                    return true;
                }
                else{
                    for(var i=0;i<selectDate.length;i++){
                        selectDate.pop();
                    }
                    return false
                }
            }
        };
        //获取用户选中的日期
        $scope.getDate=function(type,date,index){
            //本周
            if(type==1){
                if($scope.componentData.showweek[index]==0){
                    $scope.componentData.showweek[index]=1;
                    if(selectDate.indexOf(date)<0){  //是否包含date
                        selectDate.push(date);
                    }
                }else if($scope.componentData.showweek[index]==1){
                    $scope.componentData.showweek[index]=0;
                    if(selectDate.indexOf(date)>-1){  //是否包含date
                        selectDate=KyeeKit.without(selectDate,date);
                    }
                }
            }
            else if(type==2){
                if($scope.componentData.shownextweek[index]==0){
                    $scope.componentData.shownextweek[index]=1;
                    if(selectDate.indexOf(date)<0){  //是否包含date
                        selectDate.push(date);
                    }
                }else{
                    $scope.componentData.shownextweek[index]=0;
                    if(selectDate.indexOf(date)>-1){  //是否包含date
                        selectDate=KyeeKit.without(selectDate,date);
                    }
                }
            }else{
                if($scope.componentData.showotherweek[index]==0){
                    $scope.componentData.showotherweek[index]=1;
                    if(selectDate.indexOf(date)<0){  //是否包含date
                        selectDate.push(date);
                    }
                }else{
                    $scope.componentData.showotherweek[index]=0;
                    if(selectDate.indexOf(date)>-1){  //是否包含date
                        selectDate=KyeeKit.without(selectDate,date);
                    }
                }
            }
        };
        /**
         * 跳转到医生详情页面
         * @param doctor
         */
        $scope.showDoctorInfo=function(doctor, index){
           // 切换医院
            HospitalSelectorService.selectHospital(doctor.HOSPITAL_ID, doctor.HOSPITAL_NAME,
                doctor.MAILING_ADDRESS, doctor.PROVINCE_CODE, doctor.PROVINCE_NAME,
                doctor.CITY_CODE, doctor.CITY_NAME, "医院正在切换中...", function () {
                    //先切换到当前记录的医院，再跳转到医生详情页
                    AppointmentDoctorDetailService.doctorInfo=doctor;
                    AppointmentDoctorDetailService.doctorInfo.DEPT_NAME = doctor.DEPT_NAME;
                    AppointmentDeptGroupService.SELECT_DEPTGROUPDATA =doctor;
                    //将点击的某一科室对象放入科室服务中
                    //storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.DEPT_INFO,dept);//??????????放缓存吗？
                    AppointmentDoctorDetailService.selectDate = null;
                    if(selectDate.length>0){
                        var selectDateArray = [];
                        for(var i=0;i<selectDate.length;i++){
                            var newDate=new Date(selectDate[i]);
                            selectDateArray[i]=newDate.getFullYear()+"-"+(newDate.getMonth()+1)+"-"+newDate.getDate();
                        }
                        AppointmentDoctorDetailService.selectDate = selectDateArray;//到医生详情页定位所选日期
                    }else{
                        if(HomeService.selDateStr!=null&& HomeService.selDateStr!=undefined && HomeService.selDateStr!=""){
                            var selectDateArray = [];
                            var selDateStr=new Date(HomeService.selDateStr);
                            selectDateArray[0]=selDateStr.getFullYear()+"-"+(selDateStr.getMonth()+1)+"-"+selDateStr.getDate();
                            AppointmentDoctorDetailService.selectDate = selectDateArray;//到医生详情页定位所选日期
                        }
                    }
                    AppointmentDoctorDetailService.doctorInfo.DOCTOR_SCHEDULE_LIST=undefined;
                    $state.go('doctor_info');
                });
        };
        /**
         * 移除字符串中的空格
         * 解决医生名中有空格的问题
         * @param value
         * @returns {*}
         */
        $scope.removeSpace = function (value) {
            if(value){
                return value.replace(/\s+/g,"");
            } else {
                return "";
            }
        };

        /**
         * 切换地区回退
         */
        KyeeListenerRegister.regist({
            focus : "find_doctor_list",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction : "back",
            action : function(params){
                cityData = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
                //页面切换显示的城市名
                showCityName(cityData);
                //在切换城市的时候，会将theSelectCityId={}清除掉。所以回退时，如果为空，说明是切换城市后的回退，不是从医生详情页的回退。
                if(theSelectCityId.CITY_CODE!=undefined&&theSelectCityId.CITY_CODE!=""&&theSelectCityId.CITY_CODE!=null){
                    //说明是从医生详情页的回退,任何操作都不做。
                    return;
                }else{
                    $scope.componentData.hospitalIndex=0;
                    //说明是从切换城市的回退
                    page=0;
                    theSelectCityId.CITY_CODE = cityData.CITY_CODE;
                    theSelectCityId.CITY_NAME = cityData.CITY_NAME;
                    $scope.hasmore=false;
                    var type = 2;
                    $scope.queryDoctorList(type);
                }
            }
        });
        //切换城市，进入省市列表
        $scope.switchToProvince = function () {
            //切换地区的时候，清掉页面医生数据，医院数据，选择医院的数据。关闭组件.因为切换地区的时候，医院列表会变化。
            $scope.componentData.hospitals=[];
            $scope.doctorarr=null;
            $scope.hideOverlay();
            theSelectHospitalId="";//选择医院后的HOSPITAL_ID
            theSelectCityId={};//所选择
            $scope.componentData.hospitalIndex = 0;
            MultipleQueryCityService.goState = "find_doctor_list";
            $state.go('multiple_city_list');
        };
        //医生排班页点击选择医院
        $scope.chooseHospital = function(){
            $scope.showHospitalUp=!$scope.showHospitalUp;
            if($scope.showHospitalUp){
                $scope.showDateUp=false;//如果选择医院，则选择日期箭头朝下
                $scope.componentData.showChoseDate = '2';
                $ionicScrollDelegate.$getByHandle("select_hospital_component").scrollTop();
                $scope.showOverlay();
            }else{
                $scope.hideOverlay();
            }
        };
        //组件选择一个医院
        $scope.chooseItemHospital = function(hospitalID,cityId,cityName,index){
            //所选择的医院放入全局
            theSelectHospitalId=hospitalID;//所选择的HOSPITAL_ID
            theSelectCityId.CITY_CODE = cityId;
            theSelectCityId.CITY_NAME=cityName;
            $scope.componentData.hospitalIndex = index;
            page=0;
            $scope.doctorarr=null;//页面医生数据清掉
            $scope.hideOverlay();
            $scope.hasmore=false;
            $scope.queryDoctorList();
        };
        //获取所有需要展示的时间数组
        function computeAllDate(nowWeek){
            var now = new Date();
            var dayArr = [];     //定义一个数组存储所有时间
            var dateNumber = computeDateNumber(nowWeek);
            //当天之前天数为
            var beforeDateNumber = timeComponentSum-dateNumber-1;
            for(var j=beforeDateNumber;j>0;j--){
                dayArr.push(new Date(now.getFullYear(),now.getMonth(),now.getDate() - j));   //把未来几天的时间放到数组里
            }
            //把当天放入数组
            dayArr.push(now);
            //把当天之后的两周时间放入数组
            for(var i=1;i<=dateNumber;i++){
                dayArr.push(new Date(now.getFullYear(),now.getMonth(),now.getDate() + i));   //把未来几天的时间放到数组里
            }
            return dayArr;   //返回一个数组。
        };
        //计算当前日期之后还有多少天
        function computeDateNumber(nowWeek){
            var afterDateNumber='';
            if(nowWeek==0){//周日
                afterDateNumber= timeComponentSum-7;
            }
            else if(nowWeek==1){//周一
                afterDateNumber= timeComponentSum-1;
            }
            else if(nowWeek==2){//周二
                afterDateNumber= timeComponentSum-2;
            }
            else if(nowWeek==3){//周三
                afterDateNumber= timeComponentSum-3;
            }
            else if(nowWeek==4){//周四
                afterDateNumber= timeComponentSum-4;
            }
            else if(nowWeek==5){//周五
                afterDateNumber= timeComponentSum-5;
            }
            else if(nowWeek==6){//周六
                afterDateNumber= timeComponentSum-6;
            }
            return afterDateNumber

        }
        //切换城市后显示城市名
        function showCityName(city){
            //判断选择医院页面显示城市信息，如果是省下的所有医院则显示省份，如果是省下具体市显示城市名  by 杜巍巍  KYEEAPPC-4008
            //选择城市下所有市改为所有医院 KYEEAPPC-5215
            if(city.CITY_NAME == "所有医院"){
                $scope.cityeName = city.PROVINCE_NAME;
            }else if(city.CITY_NAME!= "" && city.CITY_NAME.length >0){
                $scope.cityeName = city.CITY_NAME;
            }
        }
        //点击加载更多医院
        $scope.loadMoreHospital = function(){
            hospitalPage++;
            for(var i=hospitalPage*hospitalNum;i<$scope.hospitalDataList.length&&i<hospitalPage*hospitalNum+hospitalNum;i++){
                $scope.componentData.hospitals=$scope.componentData.hospitals.concat($scope.hospitalDataList[i]);
                //如果i+1是医院列表的最后一个医院数据，则给加载更多隐藏
                if((i+1)<$scope.hospitalDataList.length){
                    $scope.componentData.hasHospital=true;
                }else{
                    $scope.componentData.hasHospital=false;
                }
            }
            $ionicScrollDelegate.$getByHandle("select_hospital_component").resize();
        };
        //判断日期是否超过当天日期
        $scope.isoverToday=function(date){
            var date=new Date(date.replace(/-/g, '/'));
            var nowdate=new Date();
            if(date.getFullYear()+"-"+date.getMonth()+1+"-"+date.getDate()==nowdate.getFullYear()+"-"+nowdate.getMonth()+1+"-"+nowdate.getDate()){
                return false;
            }else{
                return date<nowdate;
            }
        };
        //KYEEAPPC-5358   预约挂号页面改版  wangwan 2016年3月9日19:47:51
        //获取当前星星的样式：空星、半星、满星
        $scope.getXingClass = function(score, idx){
            var cls = "";
            var x = score - idx;
            if(x >= 0){
                //满星
                cls = "icon-favorite2";//吴伟刚 KYEEAPPC-4773 满意度页面细节优化
            }else if(x >= -0.5){
                //半星
                cls = "icon-favorite1";
            }/*else if(x < -0.5){
                //空星
                cls = "icon-favorite empty_star";
            }*/
            return cls;
        };

    }).build();