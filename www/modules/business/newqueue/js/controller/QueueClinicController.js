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
    .group("kyee.quyiyuan.newqueue.clinic.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.newqueue.clinic.service",
        "kyee.quyiyuan.newqueue.dept.info.service",
        "kyee.framework.directive.i18n.service"
    ])
    .type("controller")
    .name("NewQueueClinicController")
    .params(["$scope","$state","$ionicHistory","CacheServiceBus","KyeeViewService","NewQueueClinicService","KyeeUtilsService","CacheServiceBus","KyeeListenerRegister", "NewQueueDeptInfoService","KyeeMessageService","KyeeI18nService"])
    .action(function($scope ,$state,$ionicHistory,CacheServiceBus,KyeeViewService,NewQueueClinicService,KyeeUtilsService,CacheServiceBus,KyeeListenerRegister, NewQueueDeptInfoService,KyeeMessageService,KyeeI18nService){//一定要与params中的参数匹配

        var memoryCache = CacheServiceBus.getMemoryCache();
        var storageCache = CacheServiceBus.getStorageCache();

        //只开启我的叫号的标记位(1:开启  0：关闭)
        $scope.onlyCall = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.QUEUE_JUMP_VIEW);

        //进入页面时执行的方法
        var enterFun = function(){

            //进入页面前先将原有数据置空，防止页面闪烁现象（先出现老数据，刷新后出现新数据）


            var callBack = function(clinicData,unclinicData){
                $scope.queueClinicData = null;
                $scope.queueUnClinicData = null;
                if((clinicData!=''&&clinicData!=null&&clinicData!=undefined)||
                    (unclinicData!=''&&unclinicData!=null&&unclinicData!=undefined)){
                    $scope.dataNotHidden=false;
                    $scope.queueClinicData=clinicData;
                     $scope.queueUnClinicData=unclinicData;
                }else{
                    $scope.dataNotHidden=true;
                    $scope.emptydetail = NewQueueClinicService.emptydetail;
                    $scope.emptyflag = NewQueueClinicService.emptyflag;
                }
            };
            var deptcallBack = function(clinicData,unclinicData){
                $scope.queueClinicData = null;
                $scope.queueUnClinicData = null;
                if((clinicData!=''&&clinicData!=null&&clinicData!=undefined)||
                    (unclinicData!=''&&unclinicData!=null&&unclinicData!=undefined)){
                    $scope.queueClinicData=clinicData;
                    $scope.queueUnClinicData=unclinicData;
                    $scope.dataNotHidden=false;
                }else{
                    $scope.dataNotHidden=true;
                    $scope.onlyCall = 1;
                    $scope.emptyflag = 0;
                    $scope.emptydetail =  KyeeI18nService.get("new_queue_clinic.deptNoData","该科室目前还没有排队信息");
                }
            };
            var frontPage = NewQueueClinicService.frontPage;
            //获取数据
            if(frontPage == 1){    //从科室选择跳到科室即时叫号
                NewQueueDeptInfoService.getDeptInfoData(deptcallBack);
            }else{                                //从医生列表跳到科室即时叫号
                NewQueueClinicService.myQueueInfo(callBack);
            }
        };

        //监听进入当前页面
        KyeeListenerRegister.regist({
            focus: "new_queue_clinic",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                enterFun();
            }
        });

        //30秒刷新一次
        KyeeUtilsService.cancelInterval(timer);
        var timer = KyeeUtilsService.interval({
            time :30000000,
            action : function(){
                if($state.current.name == 'new_queue_clinic'){

                    enterFun();
                }else{
                    KyeeUtilsService.cancelInterval(timer);
                }
            }
        });

        //刷新
        $scope.onRefreshBtn=function(){

            enterFun();
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
                $state.go("new_queue");
            }
        };

        //获取当前科室的叫号信息
        $scope.getCurrentDeptQueues = function(){
            var deptInfo = storageCache.get("deptInfo");
            if(!deptInfo){   //没选择科室跳到选择科室页面
                $state.go("new_queue");
            }else{          //选择科室后直接展示当前科室叫号信息
                NewQueueDeptInfoService.deptName=deptInfo.DEPT_NAME;
                NewQueueDeptInfoService.doSetQueueDeptInfoParams(deptInfo);
                //设置前一个页面状态位(1：选择科室)
                NewQueueClinicService.frontPage = 1;
                enterFun();
            }
        };
    })
    .build();

