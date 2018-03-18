/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/4/26
 * 创建原因：科室列表服务层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.queue.select.dept.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("QueueSelectDeptService")
    .params(["HttpServiceBus","KyeeMessageService"])
    .action(function(HttpServiceBus,KyeeMessageService){

        var deptData = {
            //获取排队科室列表
            getDeptName:function(paras,onSuccess){
                HttpServiceBus.connect({
                    url: "/sortquery/action/SortQueryActionC.jspx",
                    params: {
                        op: "getSortDeptList",
                        hospitalId: paras
                    },
                    onSuccess: function (data) {
                        var isSuccess = data.success;
                        var resultData=null;
                        if(isSuccess){
                            if(data.data!=null){
                                var callBackData=data.data.rows;
                                var resultData = deptData.dealDeptData(callBackData);
                            }
                        }else{//查询失败
                            var errorMsg = data.message;
                            KyeeMessageService.broadcast({
                                content : errorMsg
                            });
                        }
                        onSuccess(resultData);
                    },
                    onError : function(retVal){
                    }
                });
            },
            //处理后台返回的科室数据
            dealDeptData:function(deptTables){
                var letters = [];//获取字母数组
                var resultMap = {};//获取字母对应的科室
                var result = {};//返回处理后的数据
                for (var i = 0; i < deptTables.length; i++) {
                    //科室名拼音
                    if (resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)] == undefined) {
                        var list = [];
                        list.push(deptTables[i]);//科室
                        resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)] = list;
                        letters.push(deptTables[i].FULL_UPPER_SPELL.substr(0, 1));
                        letters = letters.sort();
                    } else {
                        resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)].push(deptTables[i]);
                    }
                }
                var data = [];//组装后的数据
                for(var j=0;j<letters.length;j++){//字母循环
                    var datamap={};
                    datamap["group"]=letters[j];
                    var letterarr= resultMap[letters[j]];
                    var items=[];
                    for(var k=0;k<letterarr.length;k++){//字母下的科室循环
                        var itemMap={};
                        //itemMap["text"]=letterarr[k].DEPT_NAME;
                        itemMap["value"]=letterarr[k].DEPT_CODE;
                        itemMap["pinyin"]=letterarr[k].FULL_UPPER_SPELL;
                        itemMap["deptData"]=letterarr[k];
                        //   if(letterarr[k].IS_ONLINE!=0){
                       // itemMap["leftIcons"]=["icon-person red"];//appoint-shipin-img
                        //   }
                        //start是否拥挤
                        var hasQueue=letterarr[k].HAS_QUEUE;
                        var averageTime=letterarr[k].AVERAGE_TIME;
                        var type = letterarr[k].TYPE;
                        if (type != null && type != "" && type != undefined){
                            if(type == 1){
                                itemMap["rightIcons"]=["icon-personal red_person marRight"]; //拥挤
                                itemMap["text"]=letterarr[k].DEPT_NAME;
                            }else if(type ==-2){
                                itemMap["rightIcons"]=["icon-personal green_person marRight"];//顺畅
                                itemMap["text"]=letterarr[k].DEPT_NAME;
                            }else if(type ==-1){
                                itemMap["rightIcons"]=["icon-personal grey_person marRight"];//无数据
                                itemMap["text"]=letterarr[k].DEPT_NAME;
                            }else{
                                itemMap["text"]=letterarr[k].DEPT_NAME;// {DEPT_NAME}(暂无数据)
                            }
                        }else if(deptData.checkHasQueue(hasQueue)==1){
                            if(deptData.checkAvgTime(averageTime) == 1){
                                itemMap["rightIcons"]=["icon-personal green_person marRight"];//顺畅
                                itemMap["text"]=letterarr[k].DEPT_NAME;
                            }else if(deptData.checkAvgTime(averageTime) ==2){
                                itemMap["rightIcons"]=["icon-personal red_person marRight"]; //拥挤
                                itemMap["text"]=letterarr[k].DEPT_NAME;
                            }else if(deptData.checkAvgTime(averageTime) ==0){
                                itemMap["rightIcons"]=["icon-personal grey_person marRight"];//无数据
                                itemMap["text"]=letterarr[k].DEPT_NAME;
                            }
                        }else if(deptData.checkHasQueue(hasQueue)==0){
                            if(deptData.checkAvgTime(averageTime) != 0){
                                itemMap["rightIcons"]=["icon-personal grey_person marRight"];//无数据
                                itemMap["text"]=letterarr[k].DEPT_NAME;
                            }else{
                                itemMap["text"]=letterarr[k].DEPT_NAME;// {DEPT_NAME}(暂无数据)
                            }
                        }
                        //end 是否拥挤
                        items.push(itemMap)
                    }
                    datamap["items"]=items;
                    data.push(datamap);
                }
                return data;

            },
            //是否有排队
            checkHasQueue: function(reference_range){
                if(reference_range != null && reference_range != ''){
                    if(reference_range=='0'){
                        return 0; //阴
                    }
                }
                return 1;
            },
            //平均等待时间
            checkAvgTime:function(time){
                if(time == undefined || time == '' || time == null){
                    return 0;//不显示科室平均等待时间
                }else if(time <= 60){
                    return 1;
                }else if(time >=60){
                    return 2;
                }
            }
        };
        return deptData;
    })
    .build();
