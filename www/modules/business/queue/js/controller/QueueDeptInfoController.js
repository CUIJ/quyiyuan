/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/4/27
 * 创建原因：科室排队控制层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.queue.dept.info.controller")
    .require(["kyee.framework.service.view","kyee.quyiyuan.queue.select.dept.service","kyee.quyiyuan.queue.dept.info.service","kyee.framework.directive.i18n.service"])
    .type("controller")
    .name("QueueDeptInfoController")
    .params(["$scope","QueueSelectDeptService","QueueDeptInfoService","KyeeI18nService"])
    .action(function($scope,QueueSelectDeptService,QueueDeptInfoService,KyeeI18nService){
       /*将科室名字传给科室排队信息页面，用于标题栏动态获取所点击的科室名*/
        $scope.deptName=QueueDeptInfoService.deptName;
        //科室对是否登录和是否有就诊卡进行判断
        QueueDeptInfoService.initView=function(){};
        //请求科室排队信息
        QueueDeptInfoService.getDeptInfoData(function(queueClinicData,queueUnclinicData){
            $scope.dataNotHidden=false;
            if((queueClinicData!=''&&queueClinicData!=null&&queueClinicData!=undefined)||
                (queueUnclinicData!=''&&queueUnclinicData!=null&&queueUnclinicData!=undefined)){
                $scope.queueClinicData=queueClinicData;
                $scope.queueUnclinicData=queueUnclinicData;
            }else{
                $scope.dataNotHidden=true;
                $scope.dataDetail=KyeeI18nService.get("queue_dept_info.dataDetail","目前还没有相关叫号信息");
            }
        });
        ////创建是否显示叫号情况
        //$scope.displayRecord=[];
        ////点击叫号历史小角标
        //$scope.onQueueHistory= function(index){
        //    // start是否显示叫号历史
        //    $scope.tableId = index;
        //    //获得当前显示标记
        //    var currentDisplay = $scope.displayRecord[index];
        //    //将当前显示标记置相反值
        //    $scope.displayRecord[index]=(currentDisplay==undefined?true:!currentDisplay);
        //    //将其余的显示标记置否
        //    for(var i=0;i<$scope.displayRecord.length;i++){
        //        if(i != index){
        //            $scope.displayRecord[i] = false;
        //        }
        //    }
        //    //end 是否显示叫号历史
        //};
        /*刷新页面函数*/
        $scope.onRefreshBtn = function(){
            $scope.dataNotHidden=false;
            QueueDeptInfoService.getDeptInfoData(function(queueClinicData,queueUnclinicData){
                if((queueClinicData!=''&&queueClinicData!=null&&queueClinicData!=undefined)||
                    (queueUnclinicData!=''&&queueUnclinicData!=null&&queueUnclinicData!=undefined)) {
                    $scope.queueClinicData = queueClinicData;
                    $scope.queueUnclinicData = queueUnclinicData;
                }else{
                    $scope.dataNotHidden=true;
                    $scope.dataDetail=KyeeI18nService.get("queue_dept_info.dataDetail","目前还没有相关叫号信息");
                }
            });
            $scope.$broadcast('scroll.refreshComplete');
        };


    })
    .build();


