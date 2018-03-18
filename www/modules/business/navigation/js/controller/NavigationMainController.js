/**
 * 产品名称：quyiyuan
 * 创建者：赵婷
 * 创建时间： 2015年5月12日10:41:05
 * 创建原因：医院介绍控制器
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigationMain.controller")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.navigation.service.NavigationMain",
        "kyee.quyiyuan.navigation.service.NavigationFloor",
        "kyee.quyiyuan.navigationOut.service"])
    .type("controller")
    .name("NavigationMainController")
    .params(["$scope",
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "CacheServiceBus",
        "NavigationMainService",
        "NavigationFloorService",
        "NavigationOutService"
    ])
    .action(function ($scope,$state, KyeeMessageService, KyeeViewService,CacheServiceBus,
                      NavigationMainService,NavigationFloorService,NavigationOutService) {
        $scope.hospitalInfro=undefined;  //医院介绍
        $scope.hospitaId=undefined;  //当前医院ID
        $scope.notice='';
        $scope.param=undefined;

        $scope.getHospitalInfo=function(){
            $scope.hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            $scope.param=NavigationFloorService.fixedPositionInfro; //获取从我的趣医（预约详情页面）传递参数
            var lastClass=  NavigationFloorService.lastClassName;
            if(lastClass=="appointment_regist_detil"){
                $scope.hospitalId=$scope.param.HOSPITAL_ID;
            }
            NavigationOutService.hospitalId=$scope.hospitalId;  //为院外导航传值

            NavigationMainService.queryallintro(function(rsp) {
                if (rsp.success) {
                    var data=rsp.data;
                    if(data.length<1){
                        $scope.notice='<div style=" position: relative;top: 5em;font-size: 16px;color: #999;text-align: center;">暂无医院介绍</div>';
                        return;
                    }
                    else{
                        var strInfro=data[0].HOSPITAL_NAVIGATION_INTRO;
                        var url=data[0].HOSPITAL_PHOTO;
                        if(strInfro.indexOf("src=") > 0){
                            //医院图片路径处理
                            var infro=strInfro.split("src=");  //以路径标签分割医院信息
                            var fistIndex=infro[1].indexOf("style="); //获取image图片url标签的末尾
                            var str= infro[1].substring(0,fistIndex)  //截取出图片的路径地址
                            var url="src=\""+url+"\"";
                            var lastInfro=infro[1].substring(fistIndex,infro[1].length);
                            var style="style='width:100%'";
                            strInfro=infro[0]+style+url+lastInfro;
                        }

                        $scope.notice=strInfro;
                    }
                }
                else{
                    $scope.notice='<div style="position: relative;top: 5em;font-size: 16px;color: #999;text-align: center;">暂无医院介绍</div>';
                }
            },$scope.hospitalId);
        }
    })
    .build();