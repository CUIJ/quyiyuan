/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪、付添
 * 创建日期:2015年9月25日10:18:09
 * 创建原因：医院-价格公示-药品价格
 */
new KyeeModule()
    .group("kyee.quyiyuan.price.controller")
    .require([
        "kyee.quyiyuan.price.service",
        "kyee.quyiyuan.price.medicaldetail.controller",
        "kyee.quyiyuan.price.medicaldetail.service"
    ])
    .type("controller")
    .name("PriceController")
    .params(["$scope", "$state", "PriceService", "$ionicScrollDelegate", "KyeeI18nService", "KyeeUtilsService", "$ionicHistory","KyeeListenerRegister"])
    .action(function ($scope, $state, PriceService, $ionicScrollDelegate, KyeeI18nService, KyeeUtilsService, $ionicHistory,KyeeListenerRegister) {
        //初始化数据
        var page = 0;                              //页数数据（第几页）
        var limit = 20;                            //每页显示数据为20条
        var pageFront = 1;                         //页数数据（第几页）
        var limitFront = 20;                       //每页显示数据为20条
        var currentStatus = 0;                     //当前搜索项目，初始化时为0 （0：药品  1：项目）
        $scope.keyWords = {keyWordsValue: ""};   //搜索事件绑定内容的初始化
        $scope.searchStatus = 1;                  //页面显示状态状态（ 1：才进入页面，显示历史记录 2：点击搜索有搜索结果，显示搜索结果）
        $scope.activityClass = 0;                 //当前搜索项目，初始化时为0 （0：药品  1：项目）
        $scope.searchResults = [];                //搜索结果初始化
        $scope.search = false;                     //‘大家都在搜’是否显示的控制字段
        $scope.brokenEffect = 0;                  //搜索框一次性遮罩效果
        $scope.front = true;                      //假遮罩层
        $scope.fonkIcon = false;                  //叉叉---清空搜索框
        $scope.isEmpty = false;                   //首页制空
        $scope.isQueryList = 0;                   //是否查询价格公示列表

        //项目或者药品的搜索框默认文字
        if ($scope.activityClass == 0) {
            // $scope.textType = "请输入药品名称或药品拼音的首字母";
            // $scope.historicalRecords = "最近的药品搜索记录";
            $scope.textType = KyeeI18nService.get("price.pointMedical", "请输入药品名称或药品拼音的首字母");
            $scope.historicalRecords = KyeeI18nService.get("price.CurrentMedicalRecord", "最近的药品搜索记录");

        } else {
//            $scope.textType = "请输入项目名称或项目拼音的首字母";
//            $scope.historicalRecords = "最近的项目搜索记录";
            $scope.textType = KyeeI18nService.get("price.pointProject", "请输入项目名称或项目拼音的首字母");
            $scope.historicalRecords = KyeeI18nService.get("price.CurrentProjectRecord", "最近的项目搜索记录");
        }


        //分页查询药品或项目
        $scope.queryPrice = function () {
            page++;
            $scope.query(page);
        };

        $scope.data = {};

        var screenSize = KyeeUtilsService.getInnerSize();

        $scope.overlayData = {
            width: screenSize.width - 50 * 2,
            height: screenSize.height / 2 + 200
        };
        $scope.bind = function (params) {
            $scope.showOverlay = params.show;
            //   $scope.hideOverlay = params.hide;
            //请勿删除
            //$scope.hideOverlay = params.hide;
            //params.regist({
            //    doAction : $scope.doAction
            //});
        };

        //分页查询---药品
        $scope.query = function (page) {
            //首先取得搜索框内输入的关键字
            var keyWords = $scope.keyWords.keyWordsValue;
            //如果搜索框内输入的关键字为空，则不继续搜索
            if (!keyWords) {
                return;
            }
            //分页搜索请求
            PriceService.queryPrice(currentStatus, keyWords, page, limit, function (data) {
                if (data.success) {
                    //第一次分页查询没有查到数据
                    if (data.data) {
                        if (page == 1 && data.data.length < 1) {
                            $scope.isEmpty = true;
                            //     $scope.emptyText = "没有搜索结果，请更换关键字查询"
                            $scope.emptyText = KyeeI18nService.get("price.emptyMedicalRecord", "没有搜索结果，请更换关键字查询");

                        }
                    }
                    //判断是否还需分页查询
                    if (data.data.length != limit) {
                        $scope.moreDataCanBeLoadedFlag = false;
                    } else {
                        $scope.moreDataCanBeLoadedFlag = true;
                    }

                    if ($scope.searchResults == undefined && page==1) {
                        $scope.searchResults = [];
                    }
                    if($scope.searchResults.length > 0 && page==1){
                        $scope.searchResults = [];//清空上次查询结果避免异步导致重复
                    }

                    //遍历结果拿到名称和种类
                    for (var index = 0; index < data.data.length; index++) {
                        data.data[index].flag = false;
                        data.data[index].TYPES = data.data[index].NAME_LIST.length;
                        $scope.searchResults.push(data.data[index]);
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            });

        };
        /**
         * 判断是否还有更多数据
         */
        $scope.moreDataCanBeLoaded = function () {
            return $scope.moreDataCanBeLoadedFlag;
        };
        /**
         * 搜索按钮监听事件
         */
        $scope.onKeyup = function () {
            //上次搜索结果清空
            $scope.searchResults = []; 
            PriceService.ITEM_NAME = [];
            $scope.emptyText = "";
            //处于搜索状态
            if ($scope.keyWords.keyWordsValue != null && $scope.keyWords.keyWordsValue != "") {
                $scope.searchStatus = 2;
                $scope.doSearch();
                $scope.fonkIcon = true;
            } else {
                $scope.searchStatus = 1;
                $scope.fonkIcon = false;
            }
        };
        /**
         选项卡点击事件
         */
        $scope.selectStatus = function (status) {
            pageFront = 1;
            $scope.all = [];
            $scope.isEmpty = false;
            $scope.openBotten = [];               //弹开按钮用数组控制
            $scope.frntAll = [];
            $scope.brokenEffect = 0;
            $scope.front = true;
            $scope.moreDataCanBeLoadedFlag = false;
            $scope.moreDataCanBeLoadedFlagFront = false;
            $scope.activityClass = status;
            $scope.keyWords.keyWordsValue = "";//搜索框清空
            $scope.searchStatus = 1;//设置当前状态未搜索
            currentStatus = status;//设置处于药品检索还是项目检索
            $scope.searchResults = [];//上次搜索结果清空
            PriceService.fromPage = status;//记录当前处于药品还是项目
            $scope.isEmpty = false;
            //读取相应的历史搜索记录
            $scope.searchHistorys = PriceService.ReadSearchHistories(status);
            //项目或者药品的搜索框默认文字
            if ($scope.activityClass == 0) {

                $scope.textType = KyeeI18nService.get("price.pointMedical", "请输入药品名称或药品拼音");
                $scope.historicalRecords = KyeeI18nService.get("price.CurrentMedicalRecord", "最近的药品搜索记录");
            } else {
                $scope.textType = KyeeI18nService.get("price.pointProject", "请输入项目名称或项目拼音");
                $scope.historicalRecords = KyeeI18nService.get("price.CurrentProjectRecord", "最近的项目搜索记录");
            }
            if($scope.isQueryList ==1){


                //分页查询---价格公示首页
                $scope.queryFront = function (pageFront) {
                    //分页搜索请求
                    PriceService.queryPriceFront(currentStatus, pageFront, limitFront, function (data) {
                        if (data.success) {
                            //第一次分页查询没有查到数据
                            if (data.data) {
                                if (pageFront == 1 && data.data.length < 1) {
                                    $scope.isEmpty = true;
                                    $scope.emptyText = "暂无数据。";
                                }
                            }
                            //判断是否还需分页查询
                            if (data.data.length != limitFront) {
                                $scope.moreDataCanBeLoadedFlagFront = false;
                            } else {
                                $scope.moreDataCanBeLoadedFlagFront = true;
                            }

                            if ($scope.frntAll == undefined) {
                                $scope.frntAll = [];
                            }
                            //遍历结果拿到名称和种类
                            for (var index = 0; index < data.data.length; index++) {
                                data.data[index].flag = false;
                                data.data[index].TYPES = data.data[index].length;
                                $scope.frntAll.push(data.data[index]);
                            }
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                            $ionicScrollDelegate.$getByHandle("mainScroll").resize();
                        }
                    });

                };
                $scope.queryFront(1);
                $ionicScrollDelegate.scrollTop();
            }
        };
        var queryHotspot = function () {
            //查询热点
            PriceService.queryHotspot(currentStatus, function (data) {
                if (data.success) {
                    if (status == 0) {
                        if (data.data) {
                            for (var i = 0; i < data.data.rows.length; i++) {
                                //药品长度显示10个字节以内
                                if (data.data.rows[i].INFO_NAME.length > 10) {
                                    data.data.rows[i].INFO_NAMES = data.data.rows[i].INFO_NAME.substring(0, 10);
                                    data.data.rows[i].INFO_NAME_SHOW = data.data.rows[i].INFO_NAMES + "…";
                                } else {
                                    data.data.rows[i].INFO_NAME_SHOW = data.data.rows[i].INFO_NAME;
                                }
                            }
                            $scope.all = data.data.rows;
                            if ($scope.all && $scope.all.length > 0) {
                                $scope.search = true;
                            } else {
                                $scope.search = false;
                            }
                        }
                    } else {
                        if (data.data) {
                            for (var i = 0; i < data.data.rows.length; i++) {
                                //项目长度限制25个字节以内
                                if (data.data.rows[i].INFO_NAME.length > 25) {
                                    data.data.rows[i].INFO_NAMES = data.data.rows[i].INFO_NAME.substring(0, 25);
                                    data.data.rows[i].INFO_NAME_SHOW = data.data.rows[i].INFO_NAMES + "…";
                                } else {
                                    data.data.rows[i].INFO_NAME_SHOW = data.data.rows[i].INFO_NAME;
                                }
                            }
                            $scope.all = data.data.rows;
                        }
                    }

                }
            });
        };
        /**
         * 清除历史记录
         */
        $scope.onClearHistory = function () {
            $scope.searchHistorys = PriceService.ClearSearchHistories(currentStatus);
        };
        //搜索按钮点击事件
        $scope.doSearch = function () {
            var keyWords = $scope.keyWords.keyWordsValue;
            if (!keyWords) {
                return;
            }
            //搜索记录写入本地
            $scope.searchHistorys = PriceService.WriteSearchHistories($scope.searchHistorys, currentStatus, keyWords);
            //第一次分页查询
            page = 1;
            $scope.query(page);
        };
        /**
         * 点击历史搜索记录事件
         * @param item
         */
        $scope.onHistoryClick = function (item) {
            $scope.keyWords.keyWordsValue = item;
            $scope.searchStatus = 2;
        };
        /**
         *  点击搜索结果事件
         */
        $scope.onSearchResultClick = function (item) {
            //保存热度
            if (PriceService.ITEM_NAME.length < 1) {
                PriceService.ITEM_NAME.push(item.ITEM_NAME);
                //保存热度关键字flag
                PriceService.saveHotpot(currentStatus, item.ITEM_NAME);
                item.flag = true;
            } else {
                if (!item.flag) {
                    PriceService.ITEM_NAME.push(item.ITEM_NAME);
                    //保存热度关键字flag
                    PriceService.saveHotpot(currentStatus, item.ITEM_NAME);
                    item.flag = true;
                }
            }
            $scope.overlayData = {
                width: screenSize.width - 50 * 2,
                height: screenSize.height / 2 - 100
            };
            //跳转功能
            if (item.TYPES > 1) {
                PriceService.data = item;
                //跳转到药品或项目详情页面
                $state.go("price_medical_detail");
            } else {
                $scope.data = {
                    type: $scope.activityClass,
                    data: item.NAME_LIST[0]
                };
                $scope.showOverlay();
            }

        };
        /**
         * 热点点击事件
         */
        $scope.pitchOn = function (item) {
            $scope.keyWords.keyWordsValue = item;
            $scope.searchStatus = 2;
        };


        $scope.openBotten = [];               //弹开按钮用数组控制

        //分页查询价格公示首页
        $scope.queryPriceFront = function () {
            pageFront++;
            $scope.queryFront(pageFront);
        };

        /**
         * 判断是否还有更多数据
         */
        $scope.moreDataCanBeLoadedFront = function () {
            return $scope.moreDataCanBeLoadedFlagFront;
        };

        //将所有弹开的按钮置为未点击
        if ($scope.frntAll) {
            $scope.openBotten.push(false);
            for (var i = 1; i < $scope.frntAll.length; i++) {
                $scope.openBotten.push(false);
            }
        }


        //弹开按钮的绑定事件
        $scope.open = function (index) {
            $scope.openBotten[index] = !$scope.openBotten[index];
            $ionicScrollDelegate.$getByHandle("mainScroll").resize();
        };

        /**
         * 破除遮罩效果
         */
        $scope.brokenMagic = function () {
            if ($scope.brokenEffect == 0) {
                $scope.brokenEffect = 1;
                $scope.front = false;
                queryHotspot();
            }
        };

        /**
         * 回退
         */
        $scope.fallback = function () {
            if ($scope.brokenEffect == 1) {
                $scope.brokenEffect = 0;
                $scope.front = true;
                $scope.keyWords.keyWordsValue = "";
                $scope.isEmpty = false;
                $scope.$apply();
                return;
            }
            $ionicHistory.goBack(-1);
        };

        /**
         * 清空搜索框
         */
        $scope.fork = function () {
            $scope.keyWords.keyWordsValue = "";
        };

        /**
         * 模糊匹配
         */
        $scope.$watch('keyWords.keyWordsValue', function () {
                $scope.onKeyup();
        });

        /**
         * 监听物理返回键
         */
        KyeeListenerRegister.regist({
            focus: "price",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.fallback();
            }
        });


        /**
         * 任务号：KYEEAPPC-9597
         * 作者：yangmingsi
         * 描述：进入页面前，查询查询医院所配置的价格公示参数
         * 时间：2017年1月12日17:16:41
         */
        KyeeListenerRegister.regist({
            focus: "price",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                PriceService.queryPriceBoardParams(function(data){
                    if(data.success){
                        //初始化页面是否查询价格公示列表
                        $scope.isQueryList = data.data.IS_QUERY_LIST;
                    }

                    if($scope.isQueryList == 1){
                        // 刚进入页面处于药品搜索状态
                        $scope.selectStatus(0);
                    }

                });
            }
        });
    })
    .build();