/**
 * Created by Administrator on 2015/5/19.
 */
new KyeeModule()
    .group("kyee.quyiyuan.hospitalNoticeDetail.controller")
    .require([
        "kyee.quyiyuan.hospitalnotice.service",
        "kyee.quyiyuan.hospitalNoticeDetail.service"
    ])
    .type("controller")
    .name("HospitalNoticeDetailController")
    .params(["$scope", "$state","KyeeMessageService", "KyeeViewService","CacheServiceBus","HospitalNoticeDetailService"])
    .action(function($scope, $state, KyeeMessageService, KyeeViewService,CacheServiceBus,HospitalNoticeDetailService){

        $scope.initView=function(){
            $scope.noticeDetailInfro=HospitalNoticeDetailService.hospitalNoticeDetail;
            HospitalNoticeDetailService.queryHospitalNoticeInfroDetail(function (rsp) {
                if (rsp.success) {
                    var data=rsp.data;
                    var body=data.BODY;
                    //处理图片信息 img
                    if(body.indexOf("src") > 0){
                        var infro = body.split("src");
                        var style = "style='width:100%'";
                        /*begin KYEEAPPTEST-2636 程铄闵 公告不能显示多张图片*/
                        var len = infro.length;
                        body = infro[0]+style+"src";
                        for(var i=1; i<len; i++){
                            if(i == len-1){
                                body = body + infro[len-1];
                            }
                            else{
                                body = body + infro[i] + style + "src";
                            }
                        }
                        /*end KYEEAPPTEST-2636*/
                    }
                    $scope.noticeContent = body;
                }
                else {
                }
            }, $scope.noticeDetailInfro[0].ID);
        }



    })
    .build();

