/**
 * 产品名称 quyiyuan
 * 创建用户: 张毅
 * 日期: 2017/04/25
 * 创建原因：图文问诊订单详情页面service
 * 修改原因：
 * 修改用户：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.consult_order_detail.service")
    .require([])
    .type("service")
    .name("ConsultOrderDetailService")
    .params(["KyeeMessageService", "HttpServiceBus"])
    .action(function (KyeeMessageService, HttpServiceBus) {
        var def = {
            // 查询订单详情额接口所需要的参数:订单主键
            consultOrderID: '',
            isShowLoading: true,  //http请求是否展示遮罩层，默认展示
            isFromWeiXin:false,
            /**
             * 后台获取的订单详情信息
             */
            orderDetail: {
                consultType: '',     //订单类型 (等待接诊+订单详情)
                orderState: '',      //订单状态 (等待接诊+订单详情)
                scConsultId: '',     //订单主键 (等待接诊)
                orderCreateTime: '', //订单创建时间(订单详情)
                free: '',            //是否免费(等待接诊)
                payAmount: '',       //不免费的话订单费用(等待接诊)
                remark: '',          //驳回状态存储医生驳回信息(等待接诊)
                doctorDueTime: '',   //医生剩余接诊时间(等待接诊)
                doctorName: '',      //医生姓名(等待接诊+订单详情)
                doctorPhoto: '',     //医生头像(订单详情)
                doctorTitle: '',     //医生标题(订单详情)
                doctorCode: '',      //医生主键(医生主页)
                evaluationTime: '',  //评价医生次数
                satisfyResult: '',   //评价医生具体信息
                hospitalId: '',      //医院主键(医生主页)
                hospitalName: '',    //医院名称(订单详情)
                deptCode: '',        //科室主键(医生主页)
                deptName: '',        //科室名称(订单详情)
                diseaseName: '',     //疾病名称(订单详情)
                diseaseDescription: '',//病情描述(订单详情)
                diseaseHistory: '',  //疾病史(订单详情)
                diseaseImg: '',      //疾病图片(订单详情)
                patientName: '',     //患者姓名(订单详情)
                patientAge: '',      //患者年龄(订单详情)
                patientSex: '',      //患者性别(订单详情)
                patientPhone: '',    //患者手机号(订单详情)
                patientDateOfBirth: '',//患者生日(订单详情)
                doctorSex: '',       //医生性别(聊天)
                doctorRlUser: '',    //医生RL账号(聊天)
                scUserVsId: ''       //患者ID(聊天)
            },

            /**
             * 获取订单详情接口,调用此接口前，需给此service复值consultOrderID
             */
            getOrderDetail: function (onsuccess, onerror) {
                var me = this,
                    showLoading = me.isShowLoading;
                me.isShowLoading = true;
                HttpServiceBus.connect({
                    url: 'third:pay_consult/order/view',
                    params: {
                        scConsultId: me.consultOrderID
                    },
                    showLoading: showLoading,
                    onSuccess: function (retVal) {
                        if (retVal.success) {
                            // 更新订单详情数据
                            me.orderDetail = retVal.data;
                            me.consultOrderID = retVal.data.scConsultId;
                        } else {
                            KyeeMessageService.broadcast({
                                content: retVal.message,
                                duration: 2000
                            });
                        }
                        typeof onsuccess === 'function' && onsuccess(retVal);
                    },
                    onError: function (retVal) {
                        KyeeMessageService.broadcast({
                            content: retVal.message,
                            duration: 2000
                        });
                        typeof onerror === 'function' && onerror(retVal);
                    }
                });
            }
        };
        return def;
    })
    .build();