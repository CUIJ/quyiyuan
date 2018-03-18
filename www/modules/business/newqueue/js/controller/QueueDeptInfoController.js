/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/4/27
 * 创建原因：科室排队控制层
 * 修改者：邵鹏辉
 * 修改原因：我的排队功能改进（KYEEAPPC-2655）
 * 修改时间：2015/07/14
 */
new KyeeModule()
    .group("kyee.quyiyuan.newqueue.dept.info.controller")
    .require(["kyee.framework.service.view","kyee.quyiyuan.newqueue.select.dept.service","kyee.quyiyuan.newqueue.dept.info.service","kyee.framework.directive.i18n.service"])
    .type("controller")
    .name("NewQueueDeptInfoController")
    .params(["$scope","NewQueueSelectDeptService","NewQueueDeptInfoService","KyeeI18nService"])
    .action(function($scope,NewQueueSelectDeptService,NewQueueDeptInfoService,KyeeI18nService){
       /*将科室名字传给科室排队信息页面，用于标题栏动态获取所点击的科室名*/
        $scope.deptName=NewQueueDeptInfoService.deptName;
        //科室对是否登录和是否有就诊卡进行判断
        NewQueueDeptInfoService.initView=function(){};
        //请求科室排队信息
        NewQueueDeptInfoService.getDeptInfoData(function(resultData){
            $scope.isShowPtTitlebar=false;//普通门诊标题显示控制
            $scope.isShowZjTitlebar=false;//专家门诊标题显示控制
            if(resultData!=''&&resultData!=null&&resultData!=undefined){
                $scope.resultDataList= resultData;
                $scope.zjResultDataList= [];
                $scope.ptResultDataList= [];
                for(var i=0;i<resultData.length;i++){
                    if(resultData[i].CLINIC_TYPE=="0"){//专家号
                        $scope.zjResultDataList.push(resultData[i]);
                        if($scope.zjResultDataList.length>0){
                            $scope.isShowZjTitlebar=true;
                            $scope.zjResultDataList.sort(function(a,b){//排序，有我的叫号item放在前面
                                return a.PATIENT_NUMBER<b.PATIENT_NUMBER;
                            })
                        }

                    }else{
                        resultData[i].DOCTOR_NAME=KyeeI18nService.get("new_queue_dept_info.normalClinic","普通门诊");
                        $scope.ptResultDataList.push(resultData[i]);
                        if($scope.ptResultDataList.length>0){
                            $scope.isShowPtTitlebar=true;
                        }
                    }
                }
            }else{
                $scope.dataNotHidden=true;
                $scope.dataDetail=KyeeI18nService.get("new_queue_dept_info.noCallMsg","目前还没有相关叫号信息");
            }

        });

        /*刷新页面函数*/
        $scope.onRefreshBtn = function(){
            NewQueueDeptInfoService.getDeptInfoData(function(resultData){
                $scope.resultDataList= resultData;
            });
            $scope.$broadcast('scroll.refreshComplete');
        };

    })
    .build();


