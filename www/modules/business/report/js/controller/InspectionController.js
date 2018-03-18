/**
 * 产品名称 quyiyuan.
 * 创建用户: WangYuFei
 * 日期: 2015年5月6日09:05:22
 * 创建原因：KYEEAPPC-1957 报告单-主界面、检验单controller
 * 修改时间：2015年7月7日14:04:32
 * 修改人：程铄闵
 * 任务号：KYEEAPPC-2669
 * 修改原因：体检单迁移为独立模块
 * 修改人: 程铄闵
 * 修改日期:2015/7/29
 * 原因：报告单儿童显示具体年龄
 * 任务号：KYEEAPPC-2879
 * 修改人: 吴伟刚
 * 修改日期:2015/11/16
 * 原因：检查检验单页面数据超过一页显示时，点击“本周”、“本月”按钮显示不全修复
 * 任务号：KYEEAPPTEST-3116
 */
new KyeeModule()
.group("kyee.quyiyuan.report.inspeciton.controller")
.require(["kyee.quyiyuan.report.service",
        "kyee.quyiyuan.report.inspectionDetail.controller",
        "kyee.quyiyuan.center.authentication.controller"
    ])
.type("controller")
.name("InspectionController")
.params(["$scope","ReportService",
        "KyeeMessageService","CacheServiceBus",
        "KyeeViewService","KyeeUtilsService",
        "$state","QueryHisCardService",
        "AuthenticationService", "$rootScope", "PatientCardService","$ionicScrollDelegate"])
.action(function($scope,ReportService,KyeeMessageService,CacheServiceBus,
                 KyeeViewService,KyeeUtilsService,$state,QueryHisCardService,
                 AuthenticationService, $rootScope, PatientCardService,$ionicScrollDelegate){
        $scope.searchObj = {
            searchNo : ""
        };
        //点击页签过滤
        $scope.clickTab = function(index){
            $rootScope.isInspectionTabActive = index;
            $ionicScrollDelegate.resize();
            $ionicScrollDelegate.scrollTop();
        };
        //初始化默认选中第一项(检验单)
        $scope.isTabActive='0';
        //初始化默认选中第一项(全部)
        $rootScope.isInspectionTabActive='0';
        //页签数据过滤器
        $scope.isDisplayAll = true; //日期过滤时是否显示“已全部加载”
        $scope.isShowMarkedWords=false;//引导信息是否显示
        $scope.searchNo = '';
        $scope.filterData = function(data){
            if($rootScope.isInspectionTabActive=='1'){
                //本周数据
                var _day = 1000 * 60 * 60 * 24;
                var now = new Date();
                // 第一天日期
                var firstDay = new Date(now - (now.getDay() - 1) * _day);
                // 最后一天日期
                var lastDay = new Date((firstDay * 1) + 6 * _day);
                //格式化日期
                var formatFirstDay = ReportService.getNowFormatDate(firstDay);
                var formatLastDay = ReportService.getNowFormatDate(lastDay);
                //返回本周数据
                $scope.isDisplayAll = false;
                return (data.REQUESTED_DATE_TIME >= formatFirstDay &&
                        data.REQUESTED_DATE_TIME <= formatLastDay)|| data.REQUESTED_DATE_TIME == null;
            }else if($rootScope.isInspectionTabActive=='2'){
                //本月数据
                var date = new Date();
                //计算当前和下个月日期
                var currentDate = date;
                currentDate.setDate(1);
                var currentMonth=date.getMonth();
                var nextMonth=++currentMonth;
                var nextMonthFirstDay=new Date(date.getFullYear(),nextMonth,1);
                var oneDay=1000*60*60*24;
                var nextDate = new Date(nextMonthFirstDay-oneDay);
                //格式化日期
                var formatCurrentDate = ReportService.getNowFormatDate(currentDate);
                var formatNextDate = ReportService.getNowFormatDate(nextDate);
                //返回本月数据
                $scope.isDisplayAll = false;
                var time = null;
                if(data.REQUESTED_DATE_TIME){
                    time = data.REQUESTED_DATE_TIME.substr(0,10);
                }
                return (time >= formatCurrentDate &&
                    time <= formatNextDate)|| time == null;
            }else{
                //返回全部数据
                $scope.isDisplayAll = true;
                return data;
            }
        };

        //单击某一项目
        $scope.clickItem= function(index,inspectionDetailData){
            ReportService.INSPECTION_DETAIL = inspectionDetailData; //明细信息
            //如果明细信息不为空或者明细图片不为空，跳转至明细页面
            if(this.getLengths(inspectionDetailData.LABDETAIL)!=0 || !this.getUrl(inspectionDetailData.PHOTO_URL)){
                $state.go('inspectiondetail');
            }
        };
        //获得某数据的长度
        $scope.getLengths = function(data){
            if(data!=null&&data!=undefined){
                data = JSON.parse(data);
                return data.length;
            }else{
                return 0;
            }
        };
        //校验图片地址是否存在
        $scope.getUrl = function(PHOTO_URL){
            if(PHOTO_URL==null || PHOTO_URL==undefined || PHOTO_URL ==""){
                return true;
            }
        };

        //初始化分页加载信息
        ReportService.scope = $scope;
        var currentPage = 1; //当前是第一页
        var count = 10; //每页显示数据为10条
        var startNo = 0; //数据开始NO
        var rows = currentPage * count;
        //是否显示数据已加载完毕标识
        $scope.noLoad = true;
        //默认当前数据为空
        $scope.inspectionData=[];
        //加载更多
        $scope.loadMore = function(){
            var datas ="";
            ReportService.loadData(startNo,currentPage,rows,$scope,function(data,success){
                $scope.searchShow = false;
                if(success){
                    $scope.searchShow = true;
                    if(data.data.total==0){
                        $scope.isEmpty = true;
                        $scope.isDisplayAll = false;
                        if(data.message==undefined||data.message==''){
                            $scope.emptyText = '您目前还没有检验单记录';
                        }
                        else{
                            $scope.emptyText = data.message;
                        }
                        return;
                    }
                    $scope.isEmpty = false;
                    var total = data.data.total;//记录总数
                    datas = data.data.rows;
                    if(data.message!='' && data.message!=null && data.message!=undefined){
                        $scope.isShowMarkedWords=true;
                        $scope.markedWords=data.message;
                    }
                    //校验数据是否加载完
                    var currentNum =  $scope.inspectionData.length+datas.length;
                    if(currentNum >= total){
                        $scope.noLoad = false;//已加载完成
                    }
                    //追加加载数据
                    for(var i=0;i<datas.length;i++){
                        $scope.inspectionData.push(datas[i]);
                    }
                    currentPage = currentPage+1; //下一页
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
                else{
                    $scope.isEmpty = true;
                    $scope.isShowMarkedWords=false;
                    if(data.message != '' && data.message != null && data.message != undefined){
                        var array = data.message.split('|');
                        //功能未开放
                        if((array[0] == 0||array[0] == '0')&&array[1]!=undefined){
                            $scope.emptyText = array[1];
                        }
                        //实名认证正在处理--HANGLEING 实名认证失败--FAILURE 实名认证未认证--UNAUTHENTICATED
                        else if((array[0] == 'HANGLEING'|| array[0] == 'FAILURE' || array[0] == 'UNAUTHENTICATED')
                            && array[1]!=undefined){
                            KyeeMessageService.confirm({
                                title:'消息',
                                content:array[1],
                                onSelect:function(btnId){
                                    if(btnId){
                                        //点击确定，页面跳转到“实名认证”页面
                                        AuthenticationService.lastClass = 1;
                                        KyeeViewService.openModalFromUrl({
                                            scope : $scope,
                                            url :  'modules/business/center/views/authentication/authentication.html'
                                        });
                                    }
                                }
                            });
                            return;
                        }
                        //选择就诊卡
                        else if((array[0] == 'CARD')&&array[1]!=undefined){
                            $scope.searchShow = true;
                            KyeeMessageService.confirm({
                                title:'消息',
                                content:array[1],
                                onSelect:function(btnId){
                                    if(btnId){
                                        //点击确定，页面跳转到“查询就诊卡”页面
                                        PatientCardService.fromPage = 'inpection';
                                        $state.go("patient_card_select");
                                    }
                                }
                            });
                            return;
                        }
                        //后台错误提示
                        else if((array[0] == 'WARN')&&array[1]!=undefined){
                            $scope.searchShow = true;
                            $scope.emptyText = array[1];
                            return;
                        }
                        else if(data.alertType == 'ALERT'&&data.message!=undefined){
                            $scope.searchShow = true;
                            $scope.emptyText = data.message;
                            return;
                        }
                        else{
                            $scope.searchShow = true;
                            $scope.emptyText = '当前网络不太给力';
                        }
                    }
                    else{
                        $scope.searchShow = true;
                        $scope.emptyText = '当前网络不太给力';
                    }
                }
            });
        };

        //控制是否显示搜索框
        $scope.QUERY_LAB_SHOW='0'; //'0'表示不显示搜索框，'1'表示显示搜索框
        ReportService.getIsDisplayQueryParam(function(data){
            $scope.QUERY_LAB_SHOW = data.data.QUERY_LAB_SHOW;
        });

        //检索报告单
        $scope.search = function(){
            currentPage=1;
            $scope.inspectionData=[];
            var searchData =$scope.searchObj.searchNo;
            if(searchData=="" || searchData==undefined || searchData==null){
                $scope.noLoad = true;
                this.loadMore();
            }else{
                var testNo = searchData;
                testNo = testNo.replace(/(^\s*)|(\s*$)/g, "");
                if(testNo=="" || testNo==undefined || testNo==null){
                    $scope.noLoad = true;
                    this.loadMore();
                }else{
                    $scope.noLoad = false;//不使用加载更多
                    ReportService.searchData($scope,testNo,function(success,data){
                        $scope.isShowMarkedWords=false;
                        if(success){
                            if(data.alertType == 'ALERT'&&data.message!=undefined){
                                $scope.isEmpty = true;
                                $scope.emptyText = data.message;
                            }
                            else if(data.data.total==0){
                                $scope.isEmpty = true;
                                $scope.emptyText = data.message;
                            }
                            else{
                                if(data.message!='' && data.message!=null && data.message!=undefined){
                                    $scope.isShowMarkedWords=true;
                                    $scope.markedWords=data.message;
                                }
                                $scope.isEmpty = false;
                                $scope.inspectionData = data.data.rows;
                            }
                        }
                        else{
                            $scope.isEmpty = true;
                            $scope.isShowMarkedWords=false;
                            if(data.message != '' && data.message != null && data.message != undefined){
                                var array = data.message.split('|');
                                if((array[0] == 'WARN')&&array[1]!=undefined){
                                    $scope.emptyText = array[1];
                                    return;
                                }
                                else if(data.alertType == 'ALERT'&&data.message!=undefined){
                                    $scope.emptyText = data.message;
                                    return;
                                }
                                else{
                                    $scope.emptyText = '当前网络不太给力';
                                }
                            }else{
                                $scope.emptyText = '当前网络不太给力';
                            }
                        }
                    });
                }
            }
        };

        //当前就诊者信息
        var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
        if(userInfo){
            //就诊者信息不为空
            $scope.patientEmpty = false;
            //姓名
            $scope.USER_NAME = userInfo.OFTEN_NAME;
            //年龄判空
            var age = -1;
            if(userInfo.DATE_OF_BIRTH && userInfo.DATE_OF_BIRTH!=""){
                var birthYear = KyeeUtilsService.DateUtils.formatFromDate(userInfo.DATE_OF_BIRTH,'YYYY');
                age = new Date().getFullYear()-birthYear;//new Date(userInfo.DATE_OF_BIRTH).getFullYear();
            }
            if(age==0||(age && age != -1)){
                $scope.AGE = age;
                $scope.ageEmpty = false;//年龄非空显示岁
            }
            else{
                $scope.AGE = '';
                $scope.ageEmpty = true;//年龄为空不显示岁
            }
            //性别判空转换
            var sex = userInfo.SEX;
            if(sex && (sex==1 || sex=='1' || sex=='男')){
                $scope.sexEmpty = false;//性别判空显示斜杠
                $scope.SEX = '男';
            }
            else if(sex && (sex==2 || sex=='2' || sex=='女')){
                $scope.sexEmpty = false;//性别判空显示斜杠
                $scope.SEX = '女';
            }
            else{
                $scope.SEX = '';
                $scope.sexEmpty = true;//性别判空不显示斜杠
            }
        }
        else{
            $scope.patientEmpty = 'none';//就诊者信息为空不显示头部用户信息栏
        }
        //日期格式化
        $scope.getDate = function(param){
            if(param && param !=""){
                return KyeeUtilsService.DateUtils.formatFromDate(param,'YYYY/MM/DD');
            }
        };
    })
.build();