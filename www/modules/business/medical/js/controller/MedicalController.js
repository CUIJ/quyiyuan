/**
 * 产品名称 quyiyuan.
 * 创建用户: WangYuFei
 * 日期: 2015年5月7日13:46:40
 * 创建原因：KYEEAPPC-1959 报告单-体检单controller
 * 修改时间：2015年7月7日14:04:32
 * 修改人：程铄闵
 * 任务号：KYEEAPPC-2669
 * 修改原因：体检单迁移为独立模块
 * 修改人:gaoyulou
 * 任务号:KYEEAPPC-5391
 * 修改原因:如果从就医记录进入体检单页面，显示跨院数据
 */
new KyeeModule()
.group("kyee.quyiyuan.medical.controller")
 .require(["kyee.quyiyuan.medical.service",
    "kyee.quyiyuan.medicalDetail.controller",
    "kyee.quyiyuan.medicalStatement.controller"
])
 .type("controller")
 .name("MedicalController")
 .params(["$scope","$ionicHistory","MedicalService","KyeeViewService","CacheServiceBus","$state","KyeeUtilsService","$ionicScrollDelegate","KyeeI18nService","KyeeListenerRegister","$ionicListDelegate","KyeeMessageService"])
 .action(function($scope,$ionicHistory,MedicalService,KyeeViewService,CacheServiceBus,$state,KyeeUtilsService,$ionicScrollDelegate,KyeeI18nService,KyeeListenerRegister,$ionicListDelegate,KyeeMessageService){
    var ifOpenSelectRecord = false;
    //初始化
    $scope.isDisplay=0;

    $scope.ifShowSearch = true;
    //隐藏的展开按钮下标，初始时不隐藏展开按钮
    $scope.medical_hidden_index = -1;
    var page ={};
    //搜索单号
    $scope.searchObj = {
        searchNo:''
    };
    //记录搜索为空时所有数据
    var AllData=[];
    //记录是否处于搜索状态
    var isSerching = false;
    var isSuccess = true;
    $scope.placeHoderText = KyeeI18nService.get('medical.medicalNo', '请输入体检单编号', null);
    var pageInit = function(){
        $ionicScrollDelegate.$getByHandle("medical_index_content").scrollTop();
        page =  {
            currentPage :1,
            limit:5
        };
        $scope.hasMore = false;
        $scope.medicalData = [];
    };
    pageInit();
    var loadSuccess = function(data){
        //begin KYEEAPPTEST-3556 如果不是跨院体检单，记录不累加
        if(!ifOpenSelectRecord){
            $scope.medicalData = [];
        }
        //end KYEEAPPTEST-3556
        if(data.alertType == 'ALERT'&&data.message!=undefined){
            $scope.isEmpty = true;
            $scope.emptyText = data.message;
        }
        else if(data.data.total==0 && !ifOpenSelectRecord){
            $scope.isEmpty = true;
            $scope.emptyText = data.message;
        }
        else{
            $scope.isEmpty = false;
            if(data.data.rows.length==0){
                return ;
            }
            $scope.medicalData =  $scope.medicalData.concat(data.data.rows);
            $ionicScrollDelegate.$getByHandle("medical_index_content").resize();
            //如果需要展开选择的体检单,展开体检单并将体检单显示当顶部
            if(ifOpenSelectRecord){
                for(var i=0;i<data.data.rows.length;i++){
                    var physicalRecord = data.data.rows[i];
                    if(physicalRecord.C_ID===MedicalService.recordId ){
                        $ionicScrollDelegate.$getByHandle("medical_index_content").scrollTo(0,i*77);
                        $scope.isDisplay=i;
                        break;
                    }
                }
            }
            page.currentPage ++;
            if(data.data.rows.length>=page.limit && ifOpenSelectRecord){
                $scope.hasMore = true;
            }
            else
            {
                $scope.hasMore = false;
            }
        }
    };

    var loadFail = function(data){
        $scope.isEmpty = true;
        if(data.message != '' && data.message != null && data.message != undefined) {
            var array = data.message.split('|');
            //功能未开放
            if ((array[0] == 0 || array[0] == '0') && array[1] != undefined) {
                $scope.emptyText = array[1];
            }
            else if(data.alertType == 'ALERT'&&data.message!=undefined){
                $scope.emptyText = data.message;
            }
            else {
                $scope.emptyText =  KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null);
            }
        }
    };


    //单击项目
    $scope.clickItem= function(index){
        //如果展开按钮隐藏则点击不触发展开事件  KYEEAPPC-5024
        if(index == $scope.medical_hidden_index){
            return ;
        }
        if($scope.isDisplay == index){
            $scope.isDisplay = -1;
        }
        else{
            $scope.isDisplay = index;
        }
        $ionicScrollDelegate.$getByHandle('medical_index_content').resize();
    };

    //打开详细信息界面
    $scope.openMedicalDetail= function(medicalDetailData){
        MedicalService.medicalDetailData=medicalDetailData;
        $state.go('medical_detail');
    };

    //初始化体检单页面,如果从医院首页进入，则查询当前医院的体检单数据
    KyeeListenerRegister.regist({
        focus: "medical",
        when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
        action: function (params) {
            $scope.isDisplay=0;
            ifOpenSelectRecord = false;
            pageInit();
            //初始化数据
            MedicalService.loadData(0,1,0,"","",function(data,success){
                AllData = data;
                isSuccess = success;
                initQuery(data,success);
            });
        }
    });

    //初始化体检单页面，如果从就医记录进入体检单页面，则查询体检单的跨院数据
    KyeeListenerRegister.regist({
        focus: "my_medical",
        when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
        action: function (params) {
            $ionicScrollDelegate.$getByHandle("medical_index_content").scrollTop();
            pageInit();
            //如果从就医记录跳转过来的体检单，则显示体检单的跨院云记录
            if(params&&'myquyi->MAIN_TAB.medicalGuide' === params.from){
                //跨院体检单不显示搜索框
                $scope.ifShowSearch = false;
                ifOpenSelectRecord = true;
                //初始化数据
                MedicalService.loadDataFromCloud(page.currentPage,page.limit,true,function(data,success){
                    if(success){
                        loadSuccess(data);
                    }
                    else{
                        loadFail(data);
                    }
                });
            }
        }
    });
    var  initQuery = function(data,success){
        if(success){
            loadSuccess(data);
        }
        else{
            loadFail(data);
        }
    }
    //搜索功能
    $scope.doSearchMedical = function(){
        var searchData = $scope.searchObj.searchNo;
        if (searchData.length > 50) { //对用户输入体检单号长度进行限制 by wenpengkun
            $scope.searchObj.searchNo = null;
            KyeeMessageService.broadcast({
                content: KyeeI18nService.get("medical.overLengthTips","体检单号不能超过50字"),
                duration: 3000
            });
            return;
        }
        if(searchData=="" || searchData==undefined || searchData==null){
            MedicalService.loadData(0,1,1,"","",function(data,success){
                if(success){
                    loadSuccess(data);
                }
                else{
                    loadFail(data);
                }
                isSerching = true;
            });
        }else{
            var examId =searchData;
            examId = examId.replace(/(^\s*)|(\s*$)/g, "");//去除前后空格
            if(examId=="" || examId==undefined || examId==null){
                MedicalService.loadData(0,1,1,"","",function(data,success){
                    if(success){
                        loadSuccess(data);
                    }
                    else{
                        loadFail(data);
                    }
                    isSerching = true;
                });

            }else{
                MedicalService.loadData(0,1,1,examId,"",function(data,success){
                    if(success){
                        loadSuccess(data);
                    }
                    else{
                        loadFail(data);
                    }
                    isSerching = true;
                });

            }
        }
    };

    //打开医学申明页面
    $scope.openMedicalStatement = function(MEDICAL_STATE){
        //存储到缓存
        MedicalService.MEDICAL_STATE = MEDICAL_STATE;
        $state.go('medical_statement');
    };

    //判断为空
    $scope.checkEmpty = function(value){
        if((value == '' ||  value == undefined || value == null)){
            return true;
        } else {
            return false;
        }
    };

    //日期格式化
    $scope.getDate = function(param){
        if(param !=undefined && param !=null && param !=""){
            return KyeeUtilsService.DateUtils.formatFromDate(param,'YYYY/MM/DD');
        }
    };

    //姓名判空是否显示斜杠
    $scope.isNameEmpty = function(data){
        if(data!=undefined&&data!=''){
            return true;
        }
        else{
            return false;
        }
    };

    //性别判空是否显示斜杠
    $scope.isSexEmpty = function(data){
        if(data!=undefined&&data!=''){
            return true;
        }
        else{
            return false;
        }
    };

    //性别转换
    $scope.getSex = function(data){
        if (data != undefined && data != '') {
            if (data == '1' || data == '男') {
                return KyeeI18nService.get('commonText.man', '男', null);
            }
            else if (data == '2' || data == '女') {
                return KyeeI18nService.get('commonText.woman', '女', null);
            }
        }
    };

    //上滑加载更多
    $scope.loadMore = function(){
        MedicalService.loadDataFromCloud(page.currentPage,page.limit,false,function(data,success){
            if(success){
                loadSuccess(data);
            }
            else{
                loadFail(data);
            }
        });
    };

    //滑动监听  KYEEAPPC-5024
    $scope.dragPhysicalData = function(index){
        //当删除按钮划开时，隐藏展开按钮
        var medicalItemContentTrans = document.getElementById('medical_item_'+index).firstChild.style["-webkit-transform"];
        var transLeft = '0px';
        if(medicalItemContentTrans){
            transLeft = medicalItemContentTrans.substring(12,medicalItemContentTrans.indexOf('px'));
            if(parseFloat(transLeft)<=-26){
                //如果当前项目已经展开，则先收缩当前项
                if($scope.isDisplay == index){
                    $scope.isDisplay = -1;
                }
                if($scope.medical_hidden_index == index){
                    $scope.medical_hidden_index = -1;
                }
                else{
                    $scope.medical_hidden_index = index;
                }
            }
            else{
                $scope.medical_hidden_index = -1;
            }
        }
        else{
            $scope.medical_hidden_index = -1;
        }
    };

    //删除当前项
    $scope.deleteRecord = function(item,index){
        $ionicScrollDelegate.$getByHandle('medical_index_content').resize();
        MedicalService.deletePhysicalRecord(item,function(){
            $scope.medical_hidden_index = -1;
            $scope.medicalData.splice(index,1);
        });
    };
    /**
     * 页面回退键监听
     */
    $scope.backTo = function () {
        if( $scope.ifShowSearch==true&& isSerching == true){//非跨院体检单显示搜索框的情况&&处于搜索状态下
            $scope.placeHoderText = KyeeI18nService.get('medical.medicalNo', '请输入体检单编号', null);
            MedicalService.loadData(0,1,0,"","",function(data,success){
                AllData = data;
                isSuccess = success;
                initQuery(data,success);
            });
            setTimeout(function () {
                $scope.$apply();
            }, 1);
            isSerching = false;
            $scope.searchObj.searchNo=null;//搜索关键词制空

        }else{
            $ionicHistory.goBack();//从历史页面中返回
        }
        //KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK); //卸载一次性事件
    };
    //监听物理键返回
    KyeeListenerRegister.regist({
        focus: "medical",
        when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
        action: function (params) {
            params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
            $scope.backTo();
        }
    });

    //监听物理键返回
    KyeeListenerRegister.regist({
        focus: "my_medical",
        when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
        action: function (params) {
            params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
            $ionicHistory.goBack();//从历史页面中返回
        }
    });
})
 .build();