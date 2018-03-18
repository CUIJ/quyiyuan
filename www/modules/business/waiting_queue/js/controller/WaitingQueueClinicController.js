/**
 * Created by 刘健 on 2016/4/21.
 */
new KyeeModule()
    .group("kyee.quyiyuan.waitingqueue.clinic.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.waitingqueue.clinic.service"

    ])
    .type("controller")
    .name("WaitingQueueClinicController")
    .params(["$scope","$state","$ionicHistory","WaitingQueueClinicService","KyeeListenerRegister","$ionicScrollDelegate","KyeeUtilsService","CacheServiceBus"])
    .action(function($scope ,$state,$ionicHistory,WaitingQueueClinicService,KyeeListenerRegister,$ionicScrollDelegate,KyeeUtilsService,CacheServiceBus){
        //初始化默认不展开历史叫号
        $scope.showQueueClled=-1;
        //全局参数
        var memoryCache = CacheServiceBus.getMemoryCache();
        //定时器
        var timer = undefined;
        //页面离开，销毁定时器
        KyeeListenerRegister.regist({
            focus: "waiting_queue_clinic",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if (timer != undefined) {
                    KyeeUtilsService.cancelInterval(timer);
                }
            }
        });
        //监听进入当前页面
        KyeeListenerRegister.regist({
            focus: "waiting_queue_clinic",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
                 var cache = CacheServiceBus.getMemoryCache();
                $scope.heidQueueDept=cache.get(CACHE_CONSTANTS.MEMORY_CACHE.QUEUE_JUMP_VIEW) == 1 ? false : true;
                //获取数据
                $scope.showPoint = true;
                $scope.refreshQueue(1);
            }
        });
        /**
         * 刷新页面加载数据
         */
        $scope.refreshQueue=function(type){
            var showArr=[];
            if(type==0){
                //获取我的叫号数据
                WaitingQueueClinicService.getQueueClinicData(function(queueData){
                    if(queueData==undefined||queueData ==""||queueData==null){
                        queueData.USER_LIST = [];
                    }
                    $scope.queueData = $scope.dealhistryQeue(queueData.USER_LIST)
                    $scope.dataNotHidden=false;
                   /* var PATIENT_ID = "";
                    var cardInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
                    if (cardInfo){
                        PATIENT_ID = cardInfo.PATIENT_ID;
                    } else{
                        $scope.dataNotHidden=true;
                    }*/
                    if($scope.queueData==undefined||$scope.queueData ==""||$scope.queueData==null){
                        $scope.dataNotHidden=true;
                    }else{
                        $scope.queueClinicData=$scope.queueData;
                        for(var i=0;i<$scope.queueData.length;i++){
                            showArr.push(-1);
                        }
                        $scope.showClledArr=showArr;
                    }
                });
            }else{
                //获取我的叫号数据
                WaitingQueueClinicService.getQueueClinicData(function(queueData){
                    if(queueData==undefined||queueData ==""||queueData==null){
                        queueData.USER_LIST = [];
                    }
                    $scope.queueData = $scope.dealhistryQeue(queueData.USER_LIST)
                    $scope.dataNotHidden=false;
                    $scope.text = queueData.TEXT;
                    $scope.title = queueData.TITLE;
                    if($scope.queueData==undefined||$scope.queueData ==""||$scope.queueData==null){
                        $scope.dataNotHidden=true;
                    }else{
                        $scope.queueClinicData=$scope.queueData;
                        for(var i=0;i<$scope.queueData.length;i++){
                            showArr.push(-1);
                        }
                        $scope.showClledArr=showArr;
                    }
                });
                if(! $scope.dataNotHidden){
                    $scope.refTime();
                }
            }

        };

        $scope.closeRefreshGuide=function() {
            $scope.showPoint = false;
        }
        /**
         * 跳转到科室排队界面
         */
        $scope.showQueueClinic=function(){
            $state.go("waiting_queue_dept");
        };

        //判断值是否为空
        $scope.isEmpty = function(data){
            if(data!=undefined&&data!=''&&data!=null){
                return false;
            }else{
                return true;
            }
        };

        $scope.dealhistryQeue=function(data){
            for(var i=0;i<data.length;i++){
                if(data[i].REMAINING_NUMBER==undefined || data[i].REMAINING_NUMBER=="" ||data[i].REMAINING_NUMBER==null){
                    data[i].REMAINING_NUMBER="- -";
                }
                if(data[i].REMAINING_NUMBER<0){
                    data[i].REMAINING_NUMBER=0;
                }
                for(var j=0;j<data[i].T_QUEUE_CALLED_NUMBER_LIST.length;j++){
                    var calledTime=new Date(data[i].T_QUEUE_CALLED_NUMBER_LIST[j].CALLED_TIME);
                    data[i].T_QUEUE_CALLED_NUMBER_LIST[j].CALLED_TIME_SHOW=KyeeUtilsService.DateUtils.formatFromDate(calledTime, 'HH点mm分');
                }
            }
            return data;
        }


        /**
         * 展开或收起历史叫号
         */
        $scope.showQueueCalled=function(index){

            for(var i=0;i<$scope.showClledArr.length;i++){
                if(i==index ){
                    if($scope.showClledArr[i]==-1){
                        $scope.showClledArr[i]=0;
                    }else{
                        $scope.showClledArr[i]=-1;
                    }
                }
            }
            $ionicScrollDelegate.$getByHandle("queue_clinic").resize();
        };
        /**
         * 下拉刷新页面
         */
        $scope.onRefreshBtn = function() {
            $scope.refreshQueue(0);
            $scope.$broadcast('scroll.refreshComplete');
            $ionicScrollDelegate.$getByHandle("queue_clinic").resize();
        };
        /**
         * 60秒定时器
         */
        $scope.refTime=function(){
            //60秒定时刷新
            var time=60;
            timer = KyeeUtilsService.interval({
                time: 1000,
                action: function () {
                    time -= 1;
                    if (time > 0) {
                        if(time<10){
                            $scope.REFRESH_TIME ="0"+time;
                        }else{
                            $scope.REFRESH_TIME =time;
                        }
                    } else {
                        //关闭定时器
                        if (timer != undefined) {
                            KyeeUtilsService.cancelInterval(timer);
                        }
                        time=60;
                        $scope.REFRESH_TIME = '00';
                        $scope.refreshQueue(1);
                    }
                }
            });
        }
    })
    .build();