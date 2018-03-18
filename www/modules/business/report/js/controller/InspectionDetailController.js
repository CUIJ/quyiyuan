/**
 * 产品名称 quyiyuan.
 * 创建用户: WangYuFei
 * 日期: 2015年5月10日13:00:26
 * 创建原因：KYEEAPPC-1957 报告单-检验单明细controller
 * 修改时间：2015年7月7日14:04:32
 * 修改人：程铄闵
 * 任务号：KYEEAPPC-2669
 * 修改原因：体检单迁移为独立模块
 */
new KyeeModule()
    .group("kyee.quyiyuan.report.inspectionDetail.controller")
    .require(["kyee.quyiyuan.report.service"])
    .type("controller")
    .name("InspectionDetailController")
    .params(["$scope","ReportService","KyeeViewService","KyeeUtilsService"])
    .action(function($scope,ReportService,KyeeViewService,KyeeUtilsService){
        //初始化数据
        $scope.displayPic = false; //是否显示图片
        //ReportService.INSPECTION_DETAIL.PHOTO_URL= "http://c.hiphotos.baidu.com/zhidao/pic/item/71cf3bc79f3df8dc8baaddb1cc11728b4710287e.jpg";
        $scope.INSPECTION_DETAIL = ReportService.INSPECTION_DETAIL;
        var url = ReportService.INSPECTION_DETAIL.PHOTO_URL;
        if(url != null && url != undefined && url !=""){
            $scope.PHOTO_URL = ReportService.INSPECTION_DETAIL.PHOTO_URL;
            $scope.displayPic=true;
        }else{
            var detailResult = eval( ReportService.INSPECTION_DETAIL.LABDETAIL);
            $scope.INSPECTION_DETAIL_RESULT = detailResult;
        }
        //单击项目
        $scope.clickItem = function (index) {
            if($scope.isDisplay == index){
                $scope.isDisplay = -1;
            }
            else{
                $scope.isDisplay = index;
            }
        };
        //校验值是否正常（高或者低）
        $scope.checkHighOrLow = function(reference_range){
            if(reference_range != null && reference_range != ''){
                if(reference_range=='H'){
                    $scope.color = 'red';
                    return 1;  //阳
                }
                if(reference_range=='L'){
                    $scope.color = 'green';
                    return -1; //阴
                }else{
                    return 0;
                }
            }else{
                return 0;
            }
        };
        $scope.HighOrLowColor = function(reference_range){
            if(reference_range != null && reference_range != ''){
                if(reference_range=='H'){
                    return  'qy-red';  //阳
                }
                if(reference_range=='L'){
                    return 'qy-green'; //阴
                }else{
                    return '';
                }
            }
        };
        //日期格式化
        $scope.getDate = function(param){
            if(param !=undefined && param !=null && param !=""){
                return KyeeUtilsService.DateUtils.formatFromDate(param,'YYYY/MM/DD');
            }
        };
    })
    .build();