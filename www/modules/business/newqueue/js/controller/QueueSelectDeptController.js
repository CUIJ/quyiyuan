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
    .group("kyee.quyiyuan.newqueue.select.dept.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.newqueue.select.dept.service",
        "kyee.quyiyuan.newqueue.dept.info.controller",
        "kyee.quyiyuan.newqueue.clinic.controller",
        "kyee.quyiyuan.newqueue.dept.info.service",
        "kyee.quyiyuan.newqueue.clinic.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.service.QueryHisCardService",
        "kyee.quyiyuan.center.updateuser.service",
        "kyee.framework.directive.i18n.service"
    ])
    .type("controller")
    .name("NewQueueSelectDeptController")
    .params(["$scope","$state", "KyeeViewService","NewQueueSelectDeptService","CacheServiceBus","NewQueueDeptInfoService","NewQueueClinicService","KyeeMessageService","QueryHisCardService","KyeeI18nService","$ionicScrollDelegate"])
    .action(function($scope ,$state,KyeeViewService,NewQueueSelectDeptService,CacheServiceBus,NewQueueDeptInfoService,NewQueueClinicService,KyeeMessageService,QueryHisCardService,KyeeI18nService,$ionicScrollDelegate){//一定要与params中的参数匹配
        $scope.bind = function(params){
            $scope.searchdept = params.search;
        };
        $scope.placetxt = KyeeI18nService.get("new_queue.placetxt","搜索科室关键词");
        /*从service获取数据*/
        var hospitalInfo= CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        NewQueueSelectDeptService.getDeptName(hospitalInfo.id,function(resultData){
            if(resultData!=''&&resultData!=null&&resultData!=undefined){
                $scope.data=resultData;
            }else{
                $scope.dataNotHidden=true;
                $scope.dataDetail=KyeeI18nService.get("new_queue.dataDetail","目前还没有可叫号的门诊");
            }
        });

       /*通过导航寻找科室叫号信息*/
        $scope.showQueueInfo=function(params){
            NewQueueDeptInfoService.deptName=params.item.deptData.DEPT_NAME;
            NewQueueDeptInfoService.doSetQueueDeptInfoParams(params.item.deptData);
            //设置前一个页面状态位(1：选择科室)
            NewQueueClinicService.frontPage = 1;
           //NewQueueDeptInfoService.frontPage = 1;
           //$state.go("new_queue_dept_info");
            $state.go("new_queue_clinic");
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
                        content:KyeeI18nService.get("new_queue.confirmCont","您还没有选择就诊者，是否进行选择？"),
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
                hospitalInfo.hospitalID=hospitalInfo.id;
                NewQueueClinicService.doSetQueueClinicParams(hospitalInfo);
                NewQueueClinicService.frontPage = -1;  //重置状态位
                $state.go("new_queue_clinic");
            }
        };
        //刷新
        $scope.onRefreshBtn=function(){
            NewQueueSelectDeptService.getDeptName(hospitalInfo.id,function(resultData){
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

        $scope.backPath=function(){
            if(NewQueueSelectDeptService.isHomeOrHospital=="home"){
                $state.go("home->MAIN_TAB");
            }else{
                $state.go("home->MAIN_TAB");
            }

        }
    })
    .build();
