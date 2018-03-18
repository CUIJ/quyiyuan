/*
 * 产品名称：quyiyuan
 * 创建人: 田新
 * 创建日期:2015年9月7日10:15:00
 * 创建原因：停诊通知控制层
 */
new KyeeModule()
    .group("kyee.quyiyuan.notice.controller")
    .require([
        "kyee.quyiyuan.notice.service",
        "kyee.quyiyuan.appointment.doctor_detail.service"
    ])
    .type("controller")
    .name("NoticeController")
    .params(["$scope", "$state", "NoticeService", "AppointmentDoctorDetailService","AppointmentDeptGroupService"])
    .action(function ($scope, $state, NoticeService, AppointmentDoctorDetailService,AppointmentDeptGroupService) {

        //页面显示信息
        $scope.hasData=true   //是否有数据


        //进入页面执行的方法
        var enterFun = function(type){

            var callBack = function(resp){
                if(resp && resp.data && resp.data.length != 0){
                    $scope.allNotices = resp.data;
                    $scope.hasData = true;
                } else{
                    $scope.allNotices = null;
                    $scope.hasData = false;
                }
            };

            if(NoticeService.noticeData){   //进来前已经请求好了的数据
                callBack(NoticeService.noticeData);
                NoticeService.noticeData = null;   //清空数据，使得刷新时候展示最新数据
                return;
            }

            NoticeService.getAllNotices(type,function(result){
                if(result && result.data && result.data.length != 0){
                    $scope.allNotices = result.data;
                    $scope.hasData = true;
                } else{
                    $scope.allNotices = null;
                    $scope.hasData = false;
                }
            });
        };

        enterFun();

        //下拉刷新
        $scope.onRefresh = function(){
            var type='1';
            enterFun(type);
            $scope.$broadcast('scroll.refreshComplete');  //停止下拉刷新转圈
        };
        //处理数据(逗号变成斜杠)
        $scope.handleData = function(time){
            return time.replace(",", "\\");
        };

    })
    .build();
