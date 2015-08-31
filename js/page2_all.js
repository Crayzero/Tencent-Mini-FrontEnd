
var placeList = new Array();

require.config({
			paths:{
				echarts:'/js/dist'
			}
		});
		require(
			[
				"echarts",
				"echarts/chart/map",
                "echarts/chart/pie"
			],
			function(ec){
				var myChart = ec.init(document.getElementById("map2"));
                var mypieChart =  ec.init(document.getElementById("pie1"));

				var ecConfig = require('echarts/config');
				var zrEvent = require('zrender/tool/event');
				var curIndx = 0;
				var mapType = [
				    'china',
				    // 23个省
				    '广东', '青海', '四川', '海南', '陕西',
				    '甘肃', '云南', '湖南', '湖北', '黑龙江',
				    '贵州', '山东', '江西', '河南', '河北',
				    '山西', '安徽', '福建', '浙江', '江苏',
				    '吉林', '辽宁', '台湾',
				    // 5个自治区
				    '新疆', '广西', '宁夏', '内蒙古', '西藏',
				    // 4个直辖市
				    '北京', '天津', '上海', '重庆',
				    // 2个特别行政区
				    '香港', '澳门'
				];
				myChart.on(ecConfig.EVENT.MAP_SELECTED, function (param){
				    var len = mapType.length;
				    var mt = mapType[curIndx % len];
				    if (mt == 'china') {
				        // 全国选择时指定到选中的省份
				        var selected = param.selected;
				        for (var i in selected) {
				            if (selected[i]) {
				                mt = i;
				                while (len--) {
				                    if (mapType[len] == mt) {
				                        curIndx = len;
				                    }
				                }
				                break;
				            }
				        }
				        map_option.tooltip.formatter = '点击返回全国<br/>{b}';
				    }
				    else {
				        curIndx = 0;
				        mt = 'china';
				        map_option.tooltip.formatter = '点击进入该省<br/>{b}';

				    }
				    map_option.series[0].mapType = mt;
				    map_option.title.subtext = mt;

                    $.ajax({
                        type: "GET",
                        url: '/page2/prov/' + (mt == 'china'? 'all': mt),
                        success: function (data) {
                            var city_data = []
                            if (mt == 'china') {
                                city_data = data.citys;
                            }
                            else {
                                city_data = data.city
                                var datas = [];
                                city_data.forEach(function (item, index) {
                                    var value_count = item.value/1000;
                                    for(var i = 0; i < value_count; i++) {
                                        datas.push({
                                            name: item.name,
                                            value: item.value,
                                            geoCoord: [
                                                item.geoCoord[0] + Math.random()/3,
                                                item.geoCoord[1] + Math.random()/3,
                                            ]
                                        });
                                    }
                                });
                                city_data = datas;
                            }
                            map_option.series[0].markPoint.data = city_data;
                            myChart.setOption(map_option, true);

                            var top10 = data.top10;
                            var data = [];
                            var titles = [];
                            top10.forEach(function(item, index) {
                                if (mt != 'china') {
                                    titles[index] = item.name;
                                    data[index] = {value: item.value,
                                        name: item.name,
                                    };
                                }
                                else {
                                    titles[index] = item[1][0];
                                    data[index] = {value: item[0][0],
                                                vid: item[0][1],
                                                name: item[1][0],
                                                type: item[1][1],
                                                png: item[1][2]
                                    };
                                }
                            });
                            pie1_op.legend.data = titles;
                            pie1_op.series[0].data = data;
                            mypieChart.setOption(pie1_op, true);
                        },
                        error: function (data) {
                            console.log(data);
                        }
                    });
				});

                mypieChart.on(ecConfig.EVENT.CLICK, function(param) {
                    var len = mapType.length;
				    var mt = mapType[curIndx % len];

                    if (mt == 'china' && $('#pie1').data('type') == 'top') {
                        $.ajax({
                            'type': 'GET',
                            'url': '/page2/distribute/' + param.data.vid,
                            'dataType': "json",
                            success: function(data) {
                                var titles = [];
                                titles = data.map(function(item) {
                                    return item.name;
                                });
                                $('#pie1').data('type', 'stats');
                                pie2_op.title.subtext = param.data.name;
                                pie2_op.legend.data = titles;
                                pie2_op.series[0].data = data;
                                mypieChart.setOption(pie2_op, true);
                            },
                            error: function(err) {
                                console.log(err);
                            }
                        });
                    }
                    else if (mt == 'china' && $('#pie1').data('type') == 'stats') {
                        $('#pie1').data('type', 'top');
                        mypieChart.setOption(pie1_op, true);
                    }
                });

				map_option = {
					color: [
						'rgba(255, 255, 255, 0.8)',
						'rgba(14, 241, 242, 0.8)',
						'rgba(37, 140, 249, 0.8)'
						],
					title: {
			       		text : '全国34个省市自治区用户分布',
			       		x:'center',
			   		},
			    	tooltip : {
			     	   trigger: 'item',
			     	   formatter : '点击进入该省<br/>{b}'
			   		},
					legend: {
						orient: 'vertical',
						x:'left',
						data:['弱'],
						textStyle : {
							color: '#fff'
							}
						},
				    series : [
						{
							name: '弱',
							type: 'map',
							mapType: 'china',
							selectedMode : 'single',
							itemStyle:{
								normal:{
									borderColor:'rgba(100,149,237,1)',
									borderWidth:1.5,
									areaStyle:{
										color: '#ccc'
									},
									label:{show:true}
                            		},
								},

							data : [],
							markPoint : {
                                symbol: 'emptyCircle',
								symbolSize: 6,
								large: true,
								effect : {
									show: true,
									color: '#f36',
                                    period: 8,
								},
								data : null,
							}
						}
				    ]
				};

                $.ajax({
                    type: "GET",
                    url: "/page2/prov",
                    dataType: "json",
                    success: function(data) {
                        var cityData = data.citys;
                        if (typeof cityData === 'undefined') {
                            return ;
                        }

                        map_option.series[0].markPoint.data =
                            cityData.map(function (item) {
                                return {name: item.name,
                                        value: item.value || 1,
                                        geoCoord: item.geoCoord}
                            });
                        myChart.setOption(map_option, true);

                        var top10 = data.top10;
                        var data = [];
                        var titles = [];
                        top10.forEach(function (item, index) {
                                titles[index] = item[1][0];
                                data[index] = {value: item[0][0],
                                            name: item[1][0],
                                            vid: item[0][1],
                                            type: item[1][1],
                                            png: item[1][2]
                            };
                        });
                        pie1_op.legend.data = titles;
                        pie1_op.series[0].data = data;
                        $('#pie1').data('type', 'top');
                        mypieChart.setOption(pie1_op, true);
                    },
                    error: function(error) {
                        console.log(error);
                    }
                });


                var pie1_op =  {
					title : {
						text: '视频TOP10',
						x:'center'
					},
					tooltip : {
						trigger: 'item',
						formatter: "{a} <br/>{b} : {c} ({d}%)"
					},
					legend: {
						orient : 'vertical',
						selectedMode:false,
						x : 'left',
						data: null,
                    },
					calculable : true,
					series : [
						{
							name:'访问来源',
							type:'pie',
							radius : '55%',
							center: ['50%', '60%'],
							data: null,
                        }
					]
				};
                var pie2_op =  {
					title : {
						text: '视频地区分布',
                        subtext: '',
						x:'center'
					},
					tooltip : {
						trigger: 'item',
						formatter: "{a} <br/>{b} : {c} ({d}%)"
					},
					legend: {
						orient : 'vertical',
						selectedMode:false,
						x : 'left',
						data: null,
                    },
					calculable : true,
					series : [
						{
							name:'访问来源',
							type:'pie',
							radius : '55%',
							center: ['50%', '60%'],
							data: null,
                        }
					]
				};
			}
		);
