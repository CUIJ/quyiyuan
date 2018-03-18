/**
 * Created by 刘健 on 2016/4/21.
 */
new KyeeModule()
    .group("kyee.quyiyuan.waitingqueue.dept.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.waitingqueue.dept.service",

    ])
    .type("controller")
    .name("WaitingQueueDeptController")
    .params(["$scope","$state","$ionicHistory","WaitingQueueDeptService","KyeeListenerRegister","KyeeUtilsService","AppointmentDoctorDetailService","$ionicScrollDelegate","KyeeI18nService"])
    .action(function($scope ,$state,$ionicHistory,WaitingQueueDeptService,KyeeListenerRegister,KyeeUtilsService,AppointmentDoctorDetailService,$ionicScrollDelegate,KyeeI18nService){
        $scope.placetxt= KyeeI18nService.get("multiple_query.querySomeInfo", "搜索科室/医生");
        //初始化叫号科室是否展开
        $scope.QueueDepIndex=-1;
        $scope.showdeptBool = false;

        //监听进入当前页面
        KyeeListenerRegister.regist({
            focus: "waiting_queue_dept",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
                //获取数据
                $scope.refreshQueue();
                $scope.keywords="";
            }
        });
        /**
         * 点击【查看】展开医生叫号
         * @param index
         */
        $scope.showdeptInfo=function(index,dept){
            $scope.QueueDepIndex=index;
            $scope.showdeptBool = true;
            $ionicScrollDelegate.$getByHandle("waiting_queue").resize();
        };
        /**
         * 点击【收起】隐藏医生叫号
         */
        $scope.hideDoctor=function(){
            $scope.QueueDepIndex=-1;
            $scope.showdeptBool = false;
        };
        /**
         * 点击【刷新】重新加载叫号数据
         */
        $scope.refreshQueue=function(){
            $scope.keywords="";
            //获取叫号数据
            WaitingQueueDeptService.getDeptInfoData(function(queueDeptData){
                $scope.dataNotHidden=false;
                if(queueDeptData==undefined||queueDeptData ==""||queueDeptData==null){
                    $scope.dataNotHidden=true;
                }else{
                    $scope.queueDeptData=queueDeptData;
                }
            });
            var date=new Date();
            $scope.refreshDate= KyeeUtilsService.DateUtils.formatFromDate(date, 'HH点mm分');
            $scope.QueueDepIndex=-1;
            $scope.showdeptBool = false;
        };
        /**
         * 跳转到我的叫号
         */
        $scope.showQueueClinic=function(){
            $state.go("waiting_queue_clinic");
        };
        /**
         * 跳转到医生详情页面
         */
        $scope.toDoctorSchedule=function(doctor){
            if(doctor.DOCTOR_STATUS==-1){
                return;
            }
            AppointmentDoctorDetailService.doctorInfo=doctor;
            $state.go('doctor_info');
        };
        ///**
        // * 清空搜索输入框
        // */
        //$scope.deletekeyWords=function(){
        //    $scope.  $scope.keywords="";
        //};
        /**
         * 科室/医生搜索
         */


        $scope.searchDept=function(keyWords){
            var queueDeptD= WaitingQueueDeptService.QUEUE_DEPT;
            if(keyWords !="" && keyWords !=undefined){
                var result=[];
                for(var i in queueDeptD){
                    var deptQueue = queueDeptD[i];
                    var doctorQueueList = deptQueue.QUEUE_CURRENT_CALL_NUMBER_EXT_LIST;
                    for (var i in doctorQueueList) {
                        var doctorQueue = doctorQueueList[i];
                        //使用正则表达式模式匹配全拼，不支持分词搜索
                        var regExpress = "";
                        for(var i = 0; i < keyWords.length; i++){
                            if(i==0||i%3!==0){
                                regExpress += keyWords.charAt(i);
                            }else{
                                regExpress += keyWords.charAt(i) + ".*";
                            }
                        }
                        var reg = new RegExp(regExpress.toUpperCase());
                        //如果科室名称符合
                        if(reg.test(deptQueue.FULL_UPPER_SPELL.toUpperCase()) || deptQueue.DEPT_NAME.indexOf(keyWords) != -1){
                            //保留此科室,并将科室及医生的删除状态置为false
                            deptQueue.isDeleted = false;
                            var doctorQueueList = deptQueue.QUEUE_CURRENT_CALL_NUMBER_EXT_LIST;
                            for (var i in doctorQueueList) {
                                doctorQueueList[i].isDeleted =false;
                            }
                            //如果result初始值为空,直接将信息存入
                            if( result.length == 0){
                                result.push(deptQueue);
                            }else{
                                //判断该科室信息是否已存入result
                                var count = 0;
                                for(i=0; i<result.length; i++){
                                    if (doctorQueue.DEPT_NAME == result[i].DEPT_NAME) {
                                        count++;
                                    }
                                }
                                //如果result中不包含当前科室，将科室信息保存到result中
                                if (count == 0){
                                    result.push(deptQueue);
                                }

                            }
                            //如果输入值和医生姓名匹配
                        }else if (reg.test(doctorQueue.FULL_UPPER_SPELL.toUpperCase()) || doctorQueue.DOCTOR_NAME.indexOf(keyWords) != -1){
                            ////保留此科室,并将科室及该医生的删除状态置为false
                            deptQueue.isDeleted = false;
                            doctorQueue.isDeleted = false;
                            //如果result初始值为空,直接将信息存入
                            if( result.length == 0){
                                result.push(deptQueue);
                            }else{
                                //判断该科室信息是否已存入result
                                var count = 0;
                                for(i=0; i<result.length; i++){
                                    if (doctorQueue.DEPT_NAME == result[i].DEPT_NAME) {
                                        count++;
                                    }
                                }
                                //如果result中没有存该科室信息，将科室存入result中
                                if (count == 0){
                                    result.push(deptQueue);
                                }
                            }
                            //将科室和医生的删除状态都置为true
                        }else{
                            doctorQueue.isDeleted = true;
                            deptQueue.isDeleted = true;
                        }
                    }
                }
                queueDeptD=result;
                //将搜索结果默认展开第一条
                $scope.QueueDepIndex=0;
                $scope.showdeptBool = true;
            }else{
                //还原删除状态为false
                for(var i in queueDeptD){
                    queueDeptD[i].isDeleted = false;
                    var doctorQueueList = queueDeptD[i].QUEUE_CURRENT_CALL_NUMBER_EXT_LIST;
                    for (var i in doctorQueueList) {
                        doctorQueueList[i].isDeleted =false;
                    }
                }
                $scope.QueueDepIndex=-1;
                $scope.showdeptBool = false;
            }
            $scope.queueDeptData=queueDeptD;
        };
        //返回
        $scope.back = function () {
            if ($ionicHistory.backView().stateName == "doctor_patient_relation" ||$ionicHistory.backView().stateName == "login" || $ionicHistory.backView().stateName == "set_up"){
                $state.go('home->MAIN_TAB');
            }else{
                $ionicHistory.goBack();
            }
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "waiting_queue_dept",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });
    })
    .build();