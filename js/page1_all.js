
var countList  = [];
var cityList  = [];
var cityCount  = [];
var timeList  = [];//时间
var timeCount  = [];//每段时间的全国访问总量

function begin()//请求数据部分
{
    $.ajax({
        type: "GET",
        url: "/page1/prov/all",
        dataType: "json",
        success: function (data) {
            var map_data = data.prov;
            var max = 0;
            map_data.forEach(function (item) {
                max = Math.max(max, item.value);
            });
            page1_map_option.title.subtext = "总访问量：" + data.total;
            page1_map_option.series[0].data = map_data;
            page1_map_option.dataRange.max = Math.ceil(max/1000000)*1000000;

            var count_data = data.time_count;
            var time = count_data.time;
            var visitTimes = count_data.count;
            page1_line_option.xAxis[0].data = time;
            visitTimes = visitTimes.map(function(item) {
                return item/10000.0;
            });
            page1_line_option.series[0].data = visitTimes;

            var topData = data.top10;
            var city = topData.prov;
            visitTimes = topData.value;
            city = city.map(function(item, index) {
                return city[city.length - 1 - index];
            });
            visitTimes = visitTimes.map(function(item, index) {
                return visitTimes[visitTimes.length -1 - index];
            });
            page1_bar_option.yAxis[0].data = city;
            page1_bar_option.series[0].data = visitTimes;
        }
    });
}

require.config({
            paths:{
                echarts:'/js/dist'
            }
});


require(
	[
	    "echarts",
	    "echarts/chart/map",
	    "echarts/chart/bar",
	    "echarts/chart/line"
	],
	function(ec){

		//图表变量定义

	    var my_page1_map_Chart = ec.init(document.getElementById("map"));
	    var my_page1_bar_Chart = ec.init(document.getElementById("bar"));
	    var my_page1_line_Chart = ec.init(document.getElementById('line'));

	    //page1地图属性参数

	    page1_map_option = {
	        title : {
	            text: '全国访问量实时展示',
	            x:'center',
                subtext: ''
	        },
	        tooltip : {
	            trigger: 'item'
	        },
	        legend: {
	            orient: 'vertical',
	            x:'left',
	            data:['流媒体访问量']
	        },
	        dataRange: {
	            min: 0,
	            max: 10000,
	            x: 'left',
	            y: 'bottom',
	            text:['高','低'],           // 文本，默认为数值文本
	            calculable : true
	        },
	        roamController: {
	            show: false,
	            x: 'right',
	            mapTypeControl: {
	                'china': true
	            }
	        },
	        series : [
	            {
	                name: '流媒体访问量',
	                type: 'map',
	                mapType: 'china',
	                roam: false,
	                itemStyle:{
	                    normal:{label:{show:true}},
	                    emphasis:{label:{show:true}}
	                },
	                data:countList,
	            }
	        ]
	    };

	   //page1柱状图图形属性定义

		page1_bar_option = {
			tooltip : {
				trigger: 'axis',
				axisPointer : {            // 坐标轴指示器，坐标轴触发有效
					type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
				}
			},
			legend: {
				data:['总访问量']
			},
			calculable : true,
			xAxis : [
				{
					type : 'value'
				}
			],
			yAxis : [
				{
					type : 'category',
					data :cityList,
				}
			],
			series : [
				{
					name:'总访问量',
					type:'bar',
					stack: '总量',
					itemStyle : { normal: {label : {show: true, position: 'insideRight'}}},
					data:cityCount
				}
			]
		};

		//page1曲线图图形属性设置

		page1_line_option = {
            title : {
                text: '5s的全国访问量',
                x:'center',
                subtext: '单位:(万次/5秒)'
            },

			tooltip : {
				trigger: 'axis'
			},
			dataZoom: {
				show : true,
				start : 10,
				fillerColor : '#fff',
				handleColor : '#0f0',
				backgroundColor : '#66f',
				handleSize : 4

			},
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    data : timeList,
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} 万次/5秒'
                    }
                }
            ],
            series : [
                {
                    name:'访问量',
                    type:'line',
                    smooth:'true',
                    data:timeCount,
                    markPoint : {
                        data : [
                            {type : 'max', name: '最大值'},
                            {type : 'min', name: '最小值'}
                        ]
                    },
                    markLine : {
                        data : [
                            {type : 'average', name: '平均值'}
                        ]
                    }
                }
                ]
            };
        //loading data
        (function f() {
        	setTimeout(function(){
        		my_page1_map_Chart.setOption(page1_map_option);
	            my_page1_line_Chart.setOption(page1_line_option);
	            my_page1_bar_Chart.setOption(page1_bar_option);
        	},1000);
     })();//自己调用自己,先判断data是否为空，为空则延时后再调用自己
	}//function
);
/*
function myrefresh()
{
       window.location.reload();
}

setInterval('myrefresh()',5000); */
