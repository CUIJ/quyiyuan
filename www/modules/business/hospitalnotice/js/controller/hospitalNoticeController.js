/**
 * Created by Administrator on 2015/5/19.
 *健康资讯的控制器，属于根控制器
 * 赵婷
 *
 *
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.hospitalnotice.controller")
    .require([
        "kyee.quyiyuan.hospitalnotice.service",
        "kyee.quyiyuan.hospitalNoticeDetail.service",
        "kyee.framework.service.utils",
        "kyee.quyiyuan.hospitalNoticeDetail.controller"
    ])
    .type("controller")
    .name("HospitalNoticeController")
    .params(["$scope", "$state","KyeeMessageService", "KyeeViewService","CacheServiceBus",
        "HospitalNoticeService","HospitalNoticeDetailService","KyeeUtilsService","$ionicScrollDelegate","KyeeI18nService"])
    .action(function($scope, $state, KyeeMessageService, KyeeViewService,CacheServiceBus,
                     HospitalNoticeService,HospitalNoticeDetailService,KyeeUtilsService,$ionicScrollDelegate,KyeeI18nService){

        $scope.ANNOUNCEMENT_TYPE=[]; //所有公告类型
        $scope.titleList=[];
        $scope.widthCpyOmg = {}; //

        $scope.ANNOUNCEMENT_INFRO=[]; //公告主题内容

        $scope.isShowMessage=false; //无公告时是否提示标记

        $scope.check_typeID=-1;  //当前选中类型标记  默认选中最新资讯
        $scope.hospitalId=undefined;

        $scope.moreDataCanBeLoadedFlag = true;

         $scope.initView=function() {
             //获取医院缓存数据
             var StorageCache = CacheServiceBus.getStorageCache();
             var hospital_info = StorageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
             if(hospital_info==null){
                 $scope.hospitalId="";
             }else
             {
                 $scope.hospitalId = hospital_info.id;
             }
             LoadNoticeType();
             $scope.getHospitalNoticeInfro($scope.check_typeID); //KYEEAPPTEST-2748 修改首次进入发送2次请求的情形
         };
        //查询公告信息类型
        var LoadNoticeType=function(){
            HospitalNoticeService.queryHospitalNoticeType(function (rsp) {
                if (rsp.success) {
                    var titleList = rsp.data.ANNOUNCEMENT_TYPE;
                    titleList.unshift({  //为公告类型增加“最新”公告类型
                        C_TYPE: KyeeI18nService.get("hospitalNotice.newNews","最新资讯"),
                        STATUS: '',
                        S_TYPE: '',
                        TYPEID: -1,
                        UPDTIME: ''
                    });
                    //处理公告类型加载的异常  赵婷 KYEEAPPTEST-2716
                    $scope.ANNOUNCEMENT_TYPE = titleList;
                    $scope.check_typeID = titleList[0].TYPEID;

                    for (var i = 0; i < titleList.length; i++) {
                        $scope.titleList.push({
                            C_TYPE: titleList[i].C_TYPE,
                            TYPEID: titleList[i].TYPEID
                        });
                    }
                    if($scope.titleList && $scope.titleList.length>0 && $scope.titleList.length<6){
                        $scope.widthCpyOmg = {"width" : 100/$scope.titleList.length+"%"};
                    }

                }
                else {
                }
            }, $scope.hospitalId );
        };

        //查询公告标题内容
        var page = 0;//当前页码
        var pageSize = 7;//每次请求数据量
        var arr = [];
        var pTypeId = -1;//默认type
        $scope.getHospitalNoticeInfro=function(typeID){
            if(typeID != pTypeId){
                //切换标签，清空数组
                arr = [];
                page = 0;
            }
            pTypeId = typeID;
            page++;
            HospitalNoticeService.queryHospitalNoticeInfro(function (rsp) {
                if (rsp.success) {
                    var data=rsp.data;
                    if(data.length==0&&arr.length<0){  //没有任何数据的情况
                        $scope.moreDataCanBeLoadedFlag = false;
                        $scope.isShowMessage=true;
                    }else
                    {
                        $scope.isShowMessage=false;
                        if(data.length < pageSize){
                            $scope.moreDataCanBeLoadedFlag = false;
                        }
                        for(var i=0;i<data.length;i++){
                            data[i].ADDTIME= $scope.getDate(data[i].ADDTIME); //处理日期格式
                            arr.push(data[i]);
                        }
                        $scope.ANNOUNCEMENT_INFRO=arr;
                        //通知directive已加载完成
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                }
                else {
                    $scope.isShowMessage=true;
                }
            }, $scope.hospitalId ,typeID,page,pageSize);
        };

        //跳转明细页面
        $scope.openNoticeDetail= function (index) {
            var noticeDetail=[];
            noticeDetail.push({
                ID:$scope.ANNOUNCEMENT_INFRO[index].ID,
                C_TYPE:$scope.ANNOUNCEMENT_INFRO[index].C_TYPE,
                TITLE:$scope.ANNOUNCEMENT_INFRO[index].TITLE,
                ADDTIME:$scope.ANNOUNCEMENT_INFRO[index].ADDTIME
            });
            HospitalNoticeDetailService.hospitalNoticeDetail=noticeDetail;

            $state.go("hospitalNoticeDetail");
        }

        //选择公告类型
        $scope.chooseNoticeType=function(index){
          //  $ionicScrollDelegate.scrollTop();
            $scope.check_typeID=index;
            $scope.moreDataCanBeLoadedFlag = true;  //开启上拉加载数据
            $scope.getHospitalNoticeInfro(index);

        }

        //判断公告类型是否被选中
        $scope.isChecked=function(index){
            return $scope.check_typeID==index;
        }

        $scope.getImgUrl=function(url){
            return url==undefined ? " " :url;
        }

        //日期格式化
        $scope.getDate = function(param){
            if(param !=undefined && param !=null && param !=""){
                return KyeeUtilsService.DateUtils.formatFromDate(param,'YYYY/MM/DD');
            }
        };
    })
    .build();
