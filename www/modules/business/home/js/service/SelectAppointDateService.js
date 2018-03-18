/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年12月14日11:06:02
 * 创建原因：选择首页预约挂号日期服务
 * 任务号：
 */
new KyeeModule()
    .group("kyee.quyiyuan.home.selectDate.service")
    .require([])
    .type("service")
    .name("SelectAppointDateService")
    .params([
        "HttpServiceBus","CenterUtilService"
    ])
    .action(function (HttpServiceBus,CenterUtilService) {

        var def = {
            //统计进入模块次数  By  章剑飞  KYEEAPPC-4536  2015年12月14日15:54:38
            enterSelectDate : function(){
                HttpServiceBus.connect({
                    url : "/multipleQuery/action/MultipleQueryActionC.jspx",
                    params: {
                        op: "enterSelectDate"
                    },
                    showLoading: false,
                    onSuccess: function (data) {
                    }
                });
            },
            querySystemParam: function (handleResult) {
                HttpServiceBus.connect({
                    url: "/config/action/ParamsystemActionC.jspx",
                    showLoading: false,
                    params: {
                        op: "querySysParams",
                        PARA_CODE: "SYS_FIND_DOCTOR"
                    },
                    onSuccess: function (retVal) {
                        if (retVal.success && retVal.data) {
                            var findDoctorParam = retVal.data.SYS_FIND_DOCTOR;
                            if(findDoctorParam!=undefined&&findDoctorParam!=null&&findDoctorParam!=""){
                                handleResult(findDoctorParam);
                            }else{
                                handleResult(1);  //出现异常赋值为1（默认值）
                            }
                        } else {
                            handleResult(1);  //出现异常赋值为1（默认值）
                        }
                    },
                    onError:function(){
                        handleResult(1);  //出现异常赋值为1（默认值）
                    }
                });
            }
        };
        return def;
    })
    .build();
