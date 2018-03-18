new KyeeModule()
    .group("kyee.quyiyuan.appointment.add_clinic_management.schedule_calendar.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("ScheduleCalendarService")
    .params(["KyeeUtilsService"])
    .action(function (KyeeUtilsService) {
        var def = {
            // 当前日期的年份，月份
            theMonth : {
                year: (new Date()).getFullYear(),
                month: (new Date()).getMonth()
            },

            // 获取下个月的年份及月份
            nextMonth: function(currentYear, currentMonth){
                if(currentMonth == 11) {
                    return {
                        month: 0,
                        year: currentYear+1
                    };
                } else {
                    return {
                        month: currentMonth+1,
                        year: currentYear
                    };
                }
            },

            /**
             * 取某个月的总天数
             */
            getDaysInMonth : function(month, year) {
                var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                return month == 1 && year % 4 == 0 && (year % 100 != 0 || year % 400 == 0) ? 29 : days[month];
            },

            formatScheduleCalendarData : function(sceduleList) {
                var monthSceduleList = [];
                var scheduleItem = {};
                 if(sceduleList.length > 0){
                     var scheduleNum = sceduleList.length;
                     var startDateList = sceduleList[0].CLINIC_DATE.split("/");
                     // 第一个号源的日期
                     var startDate = {
                         year: startDateList[0],
                         month: startDateList[1],
                         day: startDateList[2],
                         date: new Date(startDateList[0], startDateList[1]-1, startDateList[2])
                     };
                 }

                 var today = (new Date).getDate();
                 var theMonth = new Date(def.theMonth.year, def.theMonth.month, 1);
                 //这个月第一天是星期几(1,2,3,4,5,6,7)
                 var weekOfFirstDay = theMonth.getDay() == 0 && theMonth ? 7 : theMonth.getDay();
                 //这个月的总天数
                 var days = def.getDaysInMonth(def.theMonth.month, def.theMonth.year);
                 // 加载这个月的号源数据
                 var scheduleIndex = 0;
                 for(var i = 1; i <= days; i++){
                     if(i < startDate.day || scheduleIndex >= scheduleNum){
                         scheduleItem = {
                             dayCode: i,
                             text: "",
                             clinicType: "",
                             styleClass: i < today ? "beforeToday" : "afterToday",
                             CLINIC_IS_TAKEN:""//已选中
                         };
                     } else {
                         scheduleItem = sceduleList[scheduleIndex];
                         scheduleItem.dayCode = i;
                         scheduleItem.text = sceduleList[scheduleIndex].SCHEDULE_TEXT;
                         scheduleItem.clinicType = sceduleList[scheduleIndex].SCHEDULE_TYPE;
                         scheduleItem.styleClass = sceduleList[scheduleIndex].SCHEDULE_COLOUR;
                         scheduleIndex++;
                     }
                     monthSceduleList.push(scheduleItem);
                 }

                var scheduleData = [];
                var schedulePageData = def.formatSlidePageData(monthSceduleList, weekOfFirstDay, days);
                var scheduleLineDataCurrent = "";//当前页的总行数
                if(schedulePageData != null && schedulePageData!=undefined && schedulePageData!=[]){
                    scheduleLineDataCurrent = schedulePageData.length;
                }

                var tempMaxLine = schedulePageData.length;
                var pageData = {
                    month: def.theMonth.month + 1,
                    data: schedulePageData,
                    monthLong: 0,
                    monthLongArry:[]
                };
                scheduleData.push(pageData);
                schedulePageData = [];

                 // 加载下个月的号源日历
                     var nextMonthSceduleList = [];
                     var nextMonth = def.nextMonth(def.theMonth.year, def.theMonth.month);
                     scheduleData[0].anotherMonth = nextMonth.month + 1;

                     var nextMonthDays = def.getDaysInMonth(nextMonth.month, nextMonth.year);
                     var nextMonthDate = new Date(nextMonth.year, nextMonth.month, 1);
                     //下个月第一天是星期几(0,1,2,3,4,5,6)
                     var nextMonthFirstDay = nextMonthDate.getDay() == 0 && nextMonthDate ? 7 : nextMonthDate.getDay();
                     var nextMonthScheduleNum = scheduleNum - scheduleIndex;
                     for(var i = 1; i <= nextMonthDays; i++){
                         if(i <= nextMonthScheduleNum){
                             scheduleItem = sceduleList[scheduleIndex];
                             scheduleItem.dayCode = i;
                             scheduleItem.text = sceduleList[scheduleIndex].SCHEDULE_TEXT;
                             scheduleItem.clinicType = sceduleList[scheduleIndex].SCHEDULE_TYPE;
                             scheduleItem.styleClass = sceduleList[scheduleIndex].SCHEDULE_COLOUR;
                             scheduleIndex++;
                             nextMonthSceduleList.push(scheduleItem);
                         } else {
                             scheduleItem = {
                                 dayCode: i,
                                 text: "",
                                 styleClass: "afterToday",
                                 CLINIC_IS_TAKEN:""//已选中
                             };
                             nextMonthSceduleList.push(scheduleItem);
                         }
                     }
                     var scheduleLineDataNext = "";
                     schedulePageData = def.formatSlidePageData(nextMonthSceduleList, nextMonthFirstDay, nextMonthDays);
                     pageData = {
                         month: nextMonth.month + 1,
                         anotherMonth: def.theMonth.month + 1,
                         data: schedulePageData,
                         monthLong: 0,
                         monthLongArry: []
                     };
                     scheduleData.push(pageData);
                     if(schedulePageData != null && schedulePageData!=undefined && schedulePageData!=[]){
                         if(tempMaxLine < schedulePageData.length){
                             //tempMaxLine = schedulePageData.length;
                             scheduleData[0].monthLong = schedulePageData.length - tempMaxLine;
                         } else if(tempMaxLine > schedulePageData.length){
                             scheduleData[1].monthLong = tempMaxLine - schedulePageData.length;
                         }
                     }
                     for(var m=0;m<scheduleData.length;m++){
                         var monthLongArrys = [];
                         for (var i=0;i<scheduleData[m].monthLong;i++){
                             monthLongArrys[i]=i;
                         }
                         scheduleData[m].monthLongArry = monthLongArrys;
                     }
                // console.log(scheduleData);
                 return scheduleData;

             },

            // 对号源分页分行处理
            formatSlidePageData: function(sceduleList, weekOfFirstDay, monthDays){
                var schedulePageData = [];
                var scheduleLineData = [];

                 if(weekOfFirstDay > 1){
                     var placeholderItem = {
                         dayCode: "",
                         text: "",
                         colspan: weekOfFirstDay-1
                     };
                     scheduleLineData.push(placeholderItem);
                 }

                angular.forEach(sceduleList, function(data){
                    data.colspan = 1;
                    scheduleLineData.push(data);
                    if((schedulePageData.length == 0 && scheduleLineData.length == (9-weekOfFirstDay))
                        || scheduleLineData.length == 7){
                        schedulePageData.push(scheduleLineData);
                        scheduleLineData = [];
                    }
                });

                if(scheduleLineData.length > 0){
                    schedulePageData.push(scheduleLineData);
                    scheduleLineData = [];
                }
               // console.log(schedulePageData);
                return schedulePageData;
            }
        };

        return def;
    })
    .build();