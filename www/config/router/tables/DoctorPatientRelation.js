/**
 * Created by Administrator on 2017/5/15 0015.
 */
/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/30
 * 时间: 13:12
 * 创建原因：关于趣医页面的路由
 * 修改原因：
 * 修改时间：
 */
var DOCTOR_PATIENT_RELATION={
    /**
     * 录入患者信息页面
     */
    "doctor_patient_relation":{
        url:"/doctor_patient_relation",
        views:{
            "main_view":{
                templateUrl:"modules/business/doctor_patient_relation/views/doctor_patient_relation.html",
                controller:"DoctorPatientRelationController"
            }

        }
    },
    /**
     * 记录患者身份证号页面
     */
    "record_patient_idCard":{
      url:"/record_patient_idCard",
        views:{
          "main_view":{
              templateUrl:"modules/business/doctor_patient_relation/views/record_patient_idCard.html",
              controller:"RecordPatientInfoController"
          }
        }
    },
    /**
     * 记录患者手机号页面
     */
    "record_patient_number":{
        url:"/record_patient_number",
        views:{
            "main_view":{
                templateUrl:"modules/business/doctor_patient_relation/views/record_patient_number.html",
                controller:"RecordPatientInfoController"
            }
        }
    },
    "dept_patient_relation":{
        url:"/dept_patient_relation",
        views:{
            "main_view":{
                templateUrl:"modules/business/doctor_patient_relation/views/dept_patient_relation.html",
                controller:"DeptPatientRelationController"
            }
        }
    }
};