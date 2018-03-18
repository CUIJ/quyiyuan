/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/4/26
 * 创建原因：已预约门诊控制层
 * 修改者：
 * 修改原因：
 *
 */

new KyeeModule()
    .group("kyee.quyiyuan.queue.clinic.controller")
    .require([ "kyee.framework.service.view","kyee.quyiyuan.queue.clinic.service","kyee.framework.directive.i18n.service"])
    .type("controller")
    .name("QueueClinicController")
    .params(["$scope","$state","$ionicHistory","KyeeViewService","QueueClinicService","KyeeUtilsService","CacheServiceBus","KyeeListenerRegister","KyeeI18nService","KyeeMessageService"])
    .action(function($scope ,$state,$ionicHistory,KyeeViewService,QueueClinicService,KyeeUtilsService,CacheServiceBus,KyeeListenerRegister,KyeeI18nService,KyeeMessageService){//一定要与params中的参数匹配
        //监听进入当前页面
        KyeeListenerRegister.regist({
            focus: "queue_clinic",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
                //获取数据
                QueueClinicService.myQueueInfo(function(queueClinicData,queueUnclinicData){
                    $scope.dataNotHidden=false;
                    if((queueClinicData!=''&&queueClinicData!=null&&queueClinicData!=undefined)||
                        (queueUnclinicData!=''&&queueUnclinicData!=null&&queueUnclinicData!=undefined)){
                        $scope.queueClinicData=queueClinicData;
                        $scope.queueUnclinicData=queueUnclinicData;
                    }else{
                        $scope.dataNotHidden=true;
                        $scope.emptyflag = QueueClinicService.emptyflag;
                        $scope.dataDetail=QueueClinicService.emptydetail;
                    }
                });

            }
        });

        //30秒刷新一次
        KyeeUtilsService.cancelInterval(timer);
        var timer = KyeeUtilsService.interval({
            time :300000,
            action : function(){
                $scope.queueClinicData = null;
                $scope.queueUnclinicData = null;
                if($state.current.name == 'queue_clinic'){
                    QueueClinicService.myQueueInfo(function(queueClinicData,queueUnclinicData){
                        $scope.dataNotHidden=false;
                        if((queueClinicData!=''&&queueClinicData!=null&&queueClinicData!=undefined)||
                            (queueUnclinicData!=''&&queueUnclinicData!=null&&queueUnclinicData!=undefined)){
                            $scope.queueClinicData=queueClinicData;
                            $scope.queueUnclinicData=queueUnclinicData;
                        }else{
                            $scope.dataNotHidden=true;
                            $scope.emptyflag = QueueClinicService.emptyflag;
                            $scope.dataDetail=QueueClinicService.emptydetail;
                        }
                    });
                }else{
                    KyeeUtilsService.cancelInterval(timer);
                }
            }
        });

        //刷新
        $scope.onRefreshBtn=function(){
            $scope.queueClinicData = null;
            $scope.queueUnclinicData = null;
            QueueClinicService.myQueueInfo(function(queueClinicData,queueUnclinicData){
                $scope.dataNotHidden=false;
                if((queueClinicData!=''&&queueClinicData!=null&&queueClinicData!=undefined)||
                    (queueUnclinicData!=''&&queueUnclinicData!=null&&queueUnclinicData!=undefined)){
                    $scope.queueClinicData=queueClinicData;
                    $scope.queueUnclinicData=queueUnclinicData;
                }else{
                    $scope.dataNotHidden=true;
                    $scope.deptCall=true;
                    $scope.emptyflag = QueueClinicService.emptyflag;
                    $scope.dataDetail=QueueClinicService.emptydetail;
                }
            });
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.backPath=function(){
            var cache = CacheServiceBus.getMemoryCache();
            var queueJump=cache.get(CACHE_CONSTANTS.MEMORY_CACHE.QUEUE_JUMP_VIEW);
            var backView=$ionicHistory.backView();
            if(backView.stateId=="home->MAIN_TAB" && queueJump=="1"){// queueJump=="1"医院我的叫号直接返回主页
                $state.go("home->MAIN_TAB");
            }else if(backView.stateId=="home->MAIN_TAB" && queueJump=="1"){
                $state.go("home->MAIN_TAB");
            }else{
                $state.go("queue");
            }
        };
    })
    .build();

