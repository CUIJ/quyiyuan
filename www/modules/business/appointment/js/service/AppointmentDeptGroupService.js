/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/16
 * 创建原因：科室分级服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("AppointmentDeptGroupService")
    .params(["HttpServiceBus", "KyeeMessageService","CacheServiceBus"])
    .action(function (HttpServiceBus, KyeeMessageService,CacheServiceBus) {
        //获取预约科室
        var deptGroupData = {
            //用户选择的科室数据
            SELECT_DEPTGROUPDATA:{},
            ////预约，挂号，预约挂号
            ROUTER_STATE:{},
            //转诊标识
            IS_REFERRAL:null,
            REFERRAL_REG_ID:null,
            REFERRAL_DIRECTION:null,

            //获取预约科室分级列表
            queryGroupDept: function (hospitalId, onSuccess) {
                HttpServiceBus.connect({
                    url: "/triage/action/DeptClassificActionC.jspx",
                    params: {
                        op: "getAppoinDeptDictForAPP",
                        hospitalId: hospitalId
                    },
                    cache : {
                        by : "TIME",
                        value : 5 * 60
                    },
                    onBeforeCache : function(data){

                        if(data != undefined && data != null && data.success != undefined
                            && data.data != undefined && data.data != null
                            && data.data.total <= 0){

                            return false;
                        }
                        return true;
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }

                });
            },
            //根据地区获取分级科室
            queryGroupDeptByCity: function (onSuccess) {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getDeptByAreaActionC"
                    },
                    /*cache : {
                     by : "TIME",
                     value : 5 * 60
                     },*/
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //获取预约挂号不分级科室列表
            queryDept: function (hospitalId, onSuccess) {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getAppointAndRegistDeptActionC",
                        hospitalId: hospitalId
                    },
                    cache : {
                        by : "TIME",
                        value : 5 * 60
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var deptTables = [];
                            var resultData = [];
                            if(data.data != undefined){
                                //如果非分级科室，则要对数据特殊处理
                                if(parseInt(data.data.isGroupDept)==0){
                                    deptTables = data.data.rows;
                                    resultData = deptGroupData.dealDeptData(deptTables);
                                }else{
                                    deptTables = data.data.rows;
                                    resultData= deptGroupData.dealGroupDeptData(deptTables);
                                }
                            }
                            onSuccess(resultData,data.data.isGroupDept,data.data.DEPT_REASON_TIPS);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //处理后台返回的科室数据
            dealDeptData: function (deptTables) {
                var letters = [];//获取字母数组
                var resultMap = {};//获取字母对应的科室
                var result = {};//返回处理后的数据
                for (var i = 0; i < deptTables.length; i++) {
                    if (resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)] == undefined) {
                        var list = [];
                        list.push(deptTables[i]);
                        resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)] = list;
                        letters.push(deptTables[i].FULL_UPPER_SPELL.substr(0, 1));
                        letters = letters.sort();
                    } else {
                        resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)].push(deptTables[i]);
                    }
                }
                var data = [];//组装后的数据
                for(var j=0;j<letters.length;j++){
                    var datamap={};
                    datamap["group"]=letters[j];
                    var letterarr= resultMap[letters[j]];
                    var items=[];
                    //begin 科室列表展示按照前两个汉字的拼音先后顺序排序 By 张毅  KYEEAPPC-7735
                    //add by zhangyi at 20161017 先根据权重排序，权重相同的按照拼音全拼排序 From 设计-刘秒曲
                    //add by zhangyi at 20161017 为了避免直接对INT排序后出现1,11,2,25,3...这种情况，使用DISPLAY_ORDER的长度和数据本身拼接后的字符串进行排序
                    letterarr.sort(function (a,b) {
                        var sortA = a.DISPLAY_ORDER.toString().length + a.DISPLAY_ORDER.toString() + a.FULL_UPPER_SPELL;
                        var sortB = b.DISPLAY_ORDER.toString().length + b.DISPLAY_ORDER.toString() + b.FULL_UPPER_SPELL;
                        return sortA > sortB ? 1: -1; // modified by zhangyi at 20170116 解决个别机型微信浏览器使用"localeCompare"报错的问题
                    });
                    // end 科室列表展示按照前两个汉字的拼音先后顺序排序 By 张毅  KYEEAPPC-7735
                    for(var k=0;k<letterarr.length;k++){
                        var itemMap={};
                        itemMap["text"]=letterarr[k].DEPT_NAME;
                        itemMap["value"]=letterarr[k].DEPT_CODE;
                        itemMap["pinyin"]=letterarr[k].FULL_UPPER_SPELL;
                        itemMap["deptData"]=letterarr[k];
                        if(letterarr[k].IS_ONLINE==1){
                            itemMap["leftIcons"]=["appoint-shipin-img"];
                        }
                        if(letterarr[k].IS_KEY=="1"){
                            itemMap["rightIcons"]=["features_dept_img"];
                        }
                        items.push(itemMap)
                    }
                    datamap["items"]=items;
                    data.push(datamap);
                }
                return data;
            },

            //begin 科室列表展示按照前两个汉字的拼音先后顺序排序 By 张毅  KYEEAPPC-7735
            dealGroupDeptData: function (deptTables) {
                for(var i=0,j=deptTables.length; i<j; i++){
                    // add by zhangyi at 20161017 [deptTables[i].children]为数组的时候才进行排序
                    if(deptTables[i].children){
                        deptTables[i].children.sort(function (a,b) {
                            var sortA = a.DISPLAY_ORDER.toString().length + a.DISPLAY_ORDER.toString() + a.FULL_UPPER_SPELL;
                            var sortB = b.DISPLAY_ORDER.toString().length + b.DISPLAY_ORDER.toString() + b.FULL_UPPER_SPELL;
                            return sortA > sortB ? 1: -1; // modified by zhangyi at 20170116 解决个别机型微信浏览器使用"localeCompare"报错的问题
                        });
                    }
                }
                return deptTables;
            },
            // end 科室列表展示按照前两个汉字的拼音先后顺序排序 By 张毅  KYEEAPPC-7735


            hidRemindCare: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "hidRemindActionC",
                        hospitalID: params.hospitalId,
                        DEPT_CODE: params.deptCode,
                        DEPT_NAME: params.deptName,
                        REMIND_CARE: params.hidCare,
                        USER_ID:params.userID
                    },
                    onSuccess: function (data) {
                        onSuccess(data);
                    }
                });
            }
        };
        return deptGroupData;
    })
    .build();

