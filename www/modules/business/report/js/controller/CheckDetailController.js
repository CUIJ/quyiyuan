/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015/7/13
 * 创建原因：检查单详情控制
 * 任务号：KYEEAPPC-2640
 */
new KyeeModule()
    .group("kyee.quyiyuan.report.checkDetail.controller")
    .require(["kyee.quyiyuan.checkDetail.service",
        "kyee.quyiyuan.report.checkDetailImg.controller"])
    .type("controller")
    .name("CheckDetailController")
    .params(["$scope","CheckDetailService","CheckService","KyeeUtilsService","KyeeViewService"])
    .action(function ($scope,CheckDetailService,CheckService,KyeeUtilsService,KyeeViewService) {

        $scope.imgData = [];//定义图片数组
        //初始化详情文字内容
        $scope.checkDetailData = CheckService.selectDetailData;//选中记录的数据

        var status = CheckService.selectDetailData.PICTURE_STATUS;//此条记录是否包含图片 0-不包含图片；1-包含图片；
        //若有图片
        if(status == 1){
            //初始化图片内容
            CheckDetailService.loadData(CheckService.selectDetailData,function(data,success){
                if(success){
                    var picData = data.data.rows;
                    var len = picData.length;
                    var picArr = [];//图片路径数组
                    if(len>0){
                        for(var i=0;i<len;i++){
                            picArr[i] = 'data:image/jpg;base64,' + picData[i].EXAM_PICTURE;
                        }
                        $scope.imgData = picArr;
                    }
                }
            });
        }

        //日期格式化
        $scope.getDate = function(param){
            if(param !=undefined && param !=null && param !=""){
                return KyeeUtilsService.DateUtils.formatFromDate(param,'YYYY/MM/DD');
            }
        };

        //点击单张图片显示大图页面
        $scope.clickImg = function(imgData){
            KyeeViewService.openModalFromUrl({
                url : "modules/business/report/views/check_detail_img.html",
                scope : $scope,
                animation : "scale-in"
            });
            CheckDetailService.imgData = imgData;
            //$scope.selectImg = imgData;
        };

        //点击大图页面消失
        $scope.removeImgModal = function(id){
            KyeeViewService.removeModal({
                id : id,
                scope : $scope
            });
        };
    })
    .build();