/**
 * 日历构建器
 *
 * @type {{config: {year: string, month: string, monthNames: string[], dayNames: string[]}, initialize: Function, setMark: Function, setDate: Function, getYearAndMonth: Function, setYearAndMonth: Function, nextMonth: Function, prevMonth: Function, getDaysInMonth: Function, today: Function, drawCalendar: Function, run: Function}}
 */
var KyeeCalendarBuilder = {

    config : {

        year : '年',
        month : '月',
        //月份列表
        monthNames : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        //星期列表
        dayNames : [ '一', '二', '三', '四', '五', '六', '日']
    },

    /**
     * 初始化
     */
    initialize : function() {

        var me = this;

        this.now = new Date;
        //设置今天的年月日
        this.setDate(this.value || this.now);
    },

    /**
     * 设置标志
     *
     * @param mark
     */
    setMark : function(mark){
        this.mark = mark;
    },

    /**
     * 设置年月日
     *
     * @param now
     */
    setDate :function(now) {

        this.day = now.getDate();
        this.month = now.getMonth();
        this.year = now.getFullYear();
        this.value = now;
    },

    /**
     * 获取当前年月
     *
     * @returns {{year: (number|*), month: *}}
     */
    getYearAndMonth : function(){

        var me = this;
        return {
            year : me.year,
            month : me.month + 1
        }
    },

    /**
     * 设置年月
     *
     * @param params
     */
    setYearAndMonth : function(params){

        this.year = params.year;
        this.month = params.month - 1;
    },

    /**
     * 下个月
     */
    nextMonth : function() {

        if (this.month == 11) {
            this.month = 0;
            this.year = this.year + 1;
        } else{
            this.month = this.month + 1;
        }
    },

    /**
     * 上个月
     */
    prevMonth : function() {

        if (this.month == 0) {
            this.month = 11;
            this.year = this.year - 1;
        } else {
            this.month = this.month - 1;
        }
    },

    /**
     * 下一年
     */
    nextYear : function() {

        this.year ++;
    },

    /**
     * 上一年
     */
    prevYear : function() {

        this.year --;
    },

    /**
     * 取某个月的总天数
     *
     * @param month
     * @param year
     * @returns {number}
     */
    getDaysInMonth : function(month, year) {

        var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return month == 1 && year % 4 == 0 && (year % 100 != 0 || year % 400 == 0) ? 29 : days[month]
    },

    /**
     * 定位到今天
     */
    today : function() {

        this.now = new Date;
        this.setDate(this.now);
    },

    /**
     * 绘制日历
     *
     * @returns {string}
     */
    drawCalendar : function() {

        var me = this;

        var year = this.year;
        var month = this.month;
        var fullTextMonth = ((month + 1) + "").length < 2 ? ("0" + (month + 1)) : (month + 1);

        var calendar = [];
        calendar.push("<div>");
        //设置按钮显示的日期
        calendar.push('<table class="calendar-month" cellspacing="0" style="font-size:14px;">');
        calendar.push('<tr>');
        //绘制星期栏
        for ( var i = 0; i < 7; i++){
            if(i==5 || i==6){
                calendar.push('<th class="weekday" style="color: red">'+ this.config.dayNames[i]+ '</th>');
            }else{
                calendar.push('<th class="weekday">'+ this.config.dayNames[i]+ '</th>');
            }
        }
        calendar.push('</tr>');
        calendar.push('<tr>');
        calendar.push('<td colspan="7"><div style="border-bottom:1px double #cccccc;"></div></td>');
        calendar.push('</tr>');
        //设置选中月
        var theMonth = new Date(year, month, 1);
        //选中月第一天是星期几(0,1,2,3,4,5,6)
        var weekOfFirstDay = theMonth.getDay();
        //周日放在最后
        var IndexOfWeek = weekOfFirstDay == 0 && theMonth ? 6 : --weekOfFirstDay;
        //选中月的总天数
        var days = this.getDaysInMonth(month, year);
        //上个月
        var lastMonth = month == 0 ? 11 : month - 1;
        //上个月对应的年
        var yearOfLastMonth = lastMonth == 11 ? year - 1 : year;
        //上个月的天数
        var daysOfLastMonth = this.getDaysInMonth(lastMonth, yearOfLastMonth);
        //下个月
        var nextMonth = month == 12 ? 0 : month + 1;
        //下个月对应的年
        var yearOfNextMonth = month == 12 ? year + 1 : year;
        //下个月的日期
        var dayOfNextMonth = 0;
        //日期
        var dayCode;
        //绘制日历主体
        for ( var j = 0; j < 42; j++) {
            if (j < IndexOfWeek) {
                //上个月的日期
                dayCode = daysOfLastMonth - IndexOfWeek + j + 1;
                calendar.push('<td width="14%" class="calendar-other" style="vertical-align: middle;" date="'+ yearOfLastMonth+ ","+ daysOfLastMonth+ ","+ dayCode+ ","+j % 7+  '"><span>'+ dayCode+ "</span></td>");
            } else if (j >= IndexOfWeek + days) {
                //下个月的日期
                dayOfNextMonth = dayOfNextMonth + 1;
                calendar.push('<td width="14%" class="calendar-other" style="vertical-align: middle;" date="'+ yearOfNextMonth+ ","+ nextMonth+ ","+dayOfNextMonth+","+j % 7+  '"><span>'+ dayOfNextMonth+ "</span></td>");
            } else {
                dayCode = j - IndexOfWeek + 1;

                var fullTextDay = (dayCode + "").length < 2 ? ("0" + dayCode) : dayCode;
                var curr = year + "/" + fullTextMonth + "/" + fullTextDay;

                //高亮显示当日
                if(this.now.getFullYear()==year && this.now.getMonth() == month && this.now.getDate() == dayCode){
                    calendar.push('<td width="14%" style="vertical-align: middle;" ng-click="dayClick(' + dayCode + ')" class="current-month ' + (me.mark != undefined && me.mark[curr] != undefined ? me.mark[curr] : "") + '" date="'+ year + ","+ month+ ","+ dayCode+ ","+j % 7+ '">');
                    calendar.push('<span class="calendar-today" date="' + year+","+ month+ ","+dayCode+","+j % 7,'">'+ dayCode+ "</span>");
                    calendar.push('</td>');
                }else{

                    //注意处理日期标记
                    calendar.push('<td width="14%" style="vertical-align: middle;" ng-click="dayClick(' + dayCode + ')" class="current-month ' + (me.mark != undefined && me.mark[curr] != undefined ? me.mark[curr] : "") + '" date="', year, ",", month, ",", dayCode, ",",j % 7,'">');
                    calendar.push('<span date="', year, ",", month, ",", dayCode, ",",j % 7,'">'+dayCode+"</span>");
                    calendar.push('</td>');
                }
            }
            j % 7 == 6 && calendar.push("</tr>")
        }
        calendar.push('</table>');
        calendar.push("</div>");

        var str = "";
        for(var i in calendar){
            str += calendar[i];
        }

        return str;
    },

    /**
     * 运行
     *
     * @returns {*}
     */
    run : function(){

        var me = this;

        if(this.now == undefined){
            me.initialize();
        }

        return me.drawCalendar();
    }
};