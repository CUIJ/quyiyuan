/**
 * Created by dangl on 2017-04-20.
 * description: 医生 诊前/诊后 咨询服务层
 */
new KyeeModule()
.group("kyee.quyiyuan.appointment.doctor_consultation.service")
.require([])
.type("service")
.name("DoctorConsultationService")
.params(["HttpServiceBus", "KyeeMessageService"])
.action(function (HttpServiceBus, KyeeMessageService) {
	'use strict';
	return {

		/**
		 * @description 获取医生付费咨询的数据
		 * @param param
		 * @param success
		 * @param fail
		 */
		getDoctorConsultationData: function(param, success, fail){
			HttpServiceBus.connect({
				url: "third:pay_consult/getConsultDoctorInf",
				showLoading: false,
				params: {
					hospitalId: param.hospitalId,
					doctorCode: param.doctorCode,
					deptCode: param.deptCode
				},
				onSuccess: function (response) {
					typeof success === 'function' && success(response);
				},
				onError: function(error){
					KyeeMessageService.broadcast({
						content: data.message,
						duration: 3000
					});
					typeof fail === 'function' && fail(error);
				}
			});
		},

		/**
		 * [getPhoneOrVideoSchedule 获取医生的电话咨询或者视频咨询排班]
		 * @param  {[type]} params  [description]
		 * @param  {[type]} success [description]
		 * @param  {[type]} fail    [description]
		 * @return {[type]}         [description]
		 */
		getPhoneOrVideoSchedule: function(params, success, fail){
			HttpServiceBus.connect({
				url: "third:pay_consult/doctor/duration/query",
				showLoading: true,
				params: {
					hospitalId: params.hospitalId,
					doctorCode: params.doctorCode,
					deptCode: params.deptCode,
					consultType: params.consultType   //类型: 1-电话; 2-视频
				},
				onSuccess: function (response) {
					typeof success === 'function' && success(response);
				},
				onError: function(error){
					KyeeMessageService.broadcast({
						content: data.message,
						duration: 3000
					});
					typeof fail === 'function' && fail(error);
				}
			});
		}
	};
})
.build();

