/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/4/26
 * 创建原因：科室列表控制层
 * 修改者：
 * 修改原因：
 *
 * 任务号：KYEEAPPC-4468
 *修改人：huangxiaomei
 * 修改原因：个人中心页面废弃
 * 修改时间：2015年12月9日20:32:17
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.queue.select.dept.controller")
    .require([ "kyee.framework.service.view",
        "kyee.quyiyuan.queue.select.dept.service",
        "kyee.quyiyuan.queue.dept.info.controller",
        "kyee.quyiyuan.queue.clinic.controller",
        "kyee.quyiyuan.queue.dept.info.service",
        "kyee.quyiyuan.queue.clinic.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.service.QueryHisCardService",
        "kyee.quyiyuan.center.updateuser.service",
        "kyee.framework.directive.i18n.service"])
    .type("controller")
    .name("QueueSelectDeptController")
    .params(["$scope","$state", "KyeeViewService","QueueSelectDeptService","CacheServiceBus","QueueDeptInfoService","QueueClinicService","KyeeMessageService","QueryHisCardService","KyeeI18nService","$ionicScrollDelegate"])
    .action(function($scope ,$state,KyeeViewService,QueueSelectDeptService,CacheServiceBus,QueueDeptInfoService,QueueClinicService,KyeeMessageService,QueryHisCardService,KyeeI18nService,$ionicScrollDelegate){//一定要与params中的参数匹配
        $scope.bind = function(params){
            $scope.searchdept = params.search;
        };
        $scope.placetxt = KyeeI18nService.get("queue.placetxt","搜索科室关键词");

        /*从service获取数据*/
        var hospitalInfo= CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        QueueSelectDeptService.getDeptName(hospitalInfo.id,function(resultData){
            if(resultData!=''&&resultData!=null&&resultData!=undefined){
                $scope.data=resultData;
            }else{
                $scope.dataNotHidden=true;
                $scope.dataDetail=KyeeI18nService.get("queue.dataDetail","目前还没有可叫号的门诊");
            }

            });
       /*通过导航寻找科室叫号信息*/
        $scope.showQueueInfo=function(params){
            QueueDeptInfoService.deptName=params.item.deptData.DEPT_NAME;
            QueueDeptInfoService.doSetQueueDeptInfoParams(params.item.deptData);
            $state.go("queue_dept_info");//
        };
        /*通过导航寻找已预约门诊*/
        $scope.showQueueClinic=function(){
            //完善个人信息
            var patient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            if(patient.USER_VS_ID==undefined){
                var currentUserRecord=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                if(currentUserRecord.NAME=="" ||currentUserRecord.NAME==null||
                    currentUserRecord.ID_NO==""||currentUserRecord.ID_NO==null||
                    currentUserRecord.NAME==undefined || currentUserRecord.ID_NO==undefined){
                    KyeeMessageService.confirm({
                        title:KyeeI18nService.get("commonText.msgTitle","消息"),
                        content:KyeeI18nService.get("queue.confirmCont","您还没有选择就诊者，是否选择？"),
                        onSelect:function (buttonTap) {
                            if (buttonTap === true) {
                                //UpdateUserService.skipRoute="queue";
                                $state.go( "custom_patient");
                            }
                        }
                    });
                    return;
                }
            }else{
                ////获取当前就诊卡
                //var patientCard =CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
                ////该就诊者没有卡
                //if(patientCard == undefined||patientCard == null||patientCard == ''){
                //    KyeeMessageService.confirm({
                //        title:"消息",
                //        content:"您还没有选择就诊卡，是否选择？",
                //        onSelect:function (buttonTap) {
                //            if (buttonTap === true) {
                //                QueryHisCardService.lastClassFlag=8;
                //                $scope.openModal('modules/business/center/views/update_user/query_his_card.html');
                //            }
                //        }
                //    });
                //    return ;
                //}else {
                    hospitalInfo.hospitalID=hospitalInfo.id;
                    QueueClinicService.doSetQueueClinicParams(hospitalInfo);
                    $state.go("queue_clinic");
                }
           // }
        };
        //刷新
        $scope.onRefreshBtn=function(){
            QueueSelectDeptService.getDeptName(hospitalInfo.id,function(resultData){
                $scope.LETTERS=resultData.letters;
                $scope.DEPT_DATA=resultData.resultMap;
            });
            $scope.$broadcast('scroll.refreshComplete');
        };
        //搜索科室的keyup事件
        $scope.searchDept = function (keyWords) {
            $scope.searchdept(keyWords);
            $ionicScrollDelegate.resize();
        };
        //打开新的模态窗口
        $scope.openModal = function(url){
            KyeeViewService.openModalFromUrl({
                scope : $scope,
                url : url
            });
        };
        $scope.backPath=function(){
            if(QueueSelectDeptService.isHomeOrHospital=="home"){
                $state.go("home->MAIN_TAB");
            }else{
                $state.go("home->MAIN_TAB");
            }
        }
    })
    .build();
