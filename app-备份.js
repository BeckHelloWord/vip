(function(){

var publicArr = {
	'ver' : '20150526',
	'IMG_SERVER' : '/',
	'SERVER_ADDRESS' : '/',
	'rejump' : 'customers',
	'debug' : false
};
window.addEventListener("popstate", function(e) {
	var state = e.state;
	//console.log(state);
	//if (state == null){
		page.showtab = publicArr.rejump;
		page.pagenavClass = top_nav.shownav == false ? 'pageNonav' : 'pageNav';
		top_nav.showgoback = false;
		history.replaceState(null, "理财师", "");
	//}
});


//top_nav
var top_nav = new Vue({
	el: '#top_nav',
	data: {
		showgoback: false,
		shownav: true
	},
	methods: {
		goback: function(){
			try{
				history.back();
			}catch(r){
				history.go(-1);
			}
		}
	},created: function () {
		var ua = navigator.userAgent.toLowerCase();
		
		//if(navigator.standalone == true){
		//IOS桌面版本运行
		
		if(ua.indexOf('baoxiang') != -1){
			//宝象APP内运行
			this.shownav = false;
		}else if(ua.indexOf('micromessenger/') != -1){
			//微信内运行
			this.shownav = false;
		}else if(ua.indexOf('qq/') != -1){
			this.shownav = false;
		}
		
		setTimeout(function(){
			if(top_nav.shownav == false){
				top_nav.$el.style.display='none';
			}
		},0);
	}
});




var Auth = {
	get: function () {
		var result = {};
		try{
			result = JSON.parse(sessionStorage['persion']);
		}catch(r){
			result = publicArr['persion'];
		}
		if("object" === typeof result && null != result){
			return result['accessToken'];
		}
		return 0;
	},
	set: function (_user) {
		try{
			sessionStorage['persion'] = JSON.stringify(_user);
		}catch(r){
			publicArr['persion'] = _user;
		}
	},
	remove: function () {
		sessionStorage.removeItem('persion');
		publicArr['persion'] = {};
	}
};

window.setToken = function(accessToken){
	Auth.set({"accessToken": accessToken});
	page.setType('customers');
}


var API_GET = function(config){
	var data = config['data'] || {};
	config['success'] = config['success'] || function(){};
	config['error'] = config['error'] || function(xhr, type){
		if(publicArr.debug && top_nav.shownav == false){
			alert('访问接口时发生意外错误：\r\n接口地址: ' + config.url + '\r\n请将此错误截图，反馈给工作人员谢谢！');
		}
	};
	
	var _config = {
		'API_KEY' : Auth.get(), //不可为null
		'SECRET' : 'UYGGYG876T6759HUHI975T7GGKJO9786456EDC08'
	};
	
	var param = function(obj) {
		//console.log(_config);
		var newobj = { 'api_key' : _config['API_KEY'], 'ct' : 1, 'bt' : 2 },
			tmparr = ['api_key', 'ct', 'bt'],
			query = [], name, value, subName, querytext;

		for(name in obj) {
			tmparr.push(name);
			newobj[name] = obj[name]; //复制一个新的obj,为了不影响原有formData数据
		}
		tmparr.sort();

		for(var i = 0, len = tmparr.length; i < len; i++) {
			name = tmparr[i];
			value = newobj[name];
			if(value instanceof Array) {
				value = value.join(',');
			}else if(value instanceof Object) { //解决 select BUG
				for(subName in value) {
					value = value[subName];
					break;
				}
			}
			if(value !== undefined && value !== null){
				query.push(name + '=' + value);
				//query.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
			}
		}
		querytext = _config['SECRET'] + query.join('').split('=').join('');
		return query.join('&') + '&sign=' + MD5(querytext).toUpperCase();
	};
	
	$.ajax({
		type: 'POST',
		url: publicArr['SERVER_ADDRESS'] + config['url'],
		data: (String(data) == '[object Object]' ? param(data) : data),
		dataType: 'json',
		success: function(response){
			if(response.data == null){
				response.data = [];
			}
			if(publicArr.debug && _config.API_KEY == 0 && page.showtab=='customers'){
				var str=prompt('是否需要改改？','');
				if(str){ setToken(str); }
			}
			//if(response.isSuccess == false){
			//	alert('访问接口时发生意外错误：\r\n接口地址: ' + config.url + '\r\n错误信息：' + response.message);
			//}else{
				config['success'](response);
			//}
		},
		error: config['error']
	});

}




$(window).on('scroll',function() {
	var raw = $("a.page_button[when-visibled]")
	
	raw.each(function(){
		if(page.showtab == 'view'){ return; }
		if(page.pagedata[page.showtab]['stillMore'] == false){ return; }
		var me = $(this);
		var meTop = me.offset().top,
			scrollTop = $("body").scrollTop(),
			windowHeight = $(window).height();
		
		//alert((scrollTop + windowHeight * 1.5) + ' loadNextPage ' + meTop + ' = ' + (scrollTop + windowHeight * 1.5 >= meTop));
		//窗口卷出距离 + 窗口高度 * 1.5 >= 元素距离顶部的距离
		if ((scrollTop + windowHeight * 1.5 >= meTop)) {
			page.pagedata[page.showtab]['stillMore'] = false;
			page[this.getAttribute("when-visibled")]();
		}
		
	});
});




var page = new Vue({
	el: '#page',
	data: {
		viewbgc : /micromessenger/.test(navigator.userAgent.toLowerCase()) ? '#1b1c20' : '#2d449f',
		pagenavClass : top_nav.shownav == false ? 'pageNonav' : 'pageNav',
		showtab : 'customers',
		//客户一览
		customers: {isSuccess:'', message:'', data : [] },
		//客户回款
		receipts: {isSuccess:false, message:'正在查询客户回款信息，请耐心等待...', data : [] },
		//客户投资
		invests: {isSuccess:false, message:'正在查询客户投资信息，请耐心等待...', data : [] },
		//客户详情
		customer : {
			info : {isSuccess:false, message:'加载中...',data:{realName:'',mobile:'',availableMoney:'',waitingReceiptAllMoney:''}},
			list : {isSuccess:false, message:'加载中...',data:[]}
		},
		busy : false, //ajax请求中
		pagedata: {
			max : 10,
			customers: {totalCount: false, offset: 0, stillMore: false, url: 'wd_api/financialPlanner/getRecommendMemberList'},
			receipts:  {totalCount: false, offset: 0, stillMore: false, url: 'wd_api/financialPlanner/getRecommendMemberReceipt'},
			invests:   {totalCount: false, offset: 0, stillMore: false, url: 'wd_api/financialPlanner/getRecommendMemberInvest'}
		}
	},
	methods: {
		setType: function(type,id){
			//console.log(type);
			//console.log(id);
			
			if(/#view_/.test(location.hash)){
				if(type == 'customers' || type == 'receipts'){ return; }
				type = 'view';
				id = location.hash.replace('#view_','');
			}
			
			window.scrollTo(0, 0);
			publicArr.rejump = this.showtab;
			this.showtab = type;
			
			
			
			switch(type){
				case 'view':
					//清除上一次看的
					this.customer = {
						info : {isSuccess:false,message:'加载中...',data:{realName:'',mobile:'',availableMoney:'',waitingReceiptAllMoney:''}},
						list : {isSuccess:false,message:'加载中...',data:[]}
					};
					this.pagenavClass = top_nav.shownav == false ? 'pageNotop' : 'pageNonav';
					top_nav.showgoback = true;
					if(location.hash != '#view_'+ id){
						history.pushState({'view':id}, '客户详情', '#view_'+ id);
					}
					this.getCustomer(id);
				break;
				default:
					this.pagenavClass = top_nav.shownav == false ? 'pageNonav' : 'pageNav';
					top_nav.showgoback = false;
					this.getlist();
			}
		},
		getCustomer: function (UID) {
			/*
			this.customer.info = {isSuccess:true,data:{realName:'熊庭羲',mobile:'18516509650',availableMoney:'123',waitingReceiptAllMoney:'3123'}};
			
			this.customer.list = {isSuccess:true,data:[
				{borrowName:'投资项目名称1',amount:'金额',nextReceipt:'回款日期'},
				{borrowName:'投资项目名称2',amount:'金额',nextReceipt:'回款日期'},
				{borrowName:'投资项目名称3',amount:'金额',nextReceipt:'回款日期',dateInterest:'2016-06-13'},
				{borrowName:'投资项目名称4',amount:'金额',nextReceipt:'回款日期',dateInterest:'2016-06-13'}
			]};
			
			return;
			*/
			
			//客户资料
			API_GET({
				url : 'wd_api/financialPlanner/getRecommendMember',
				data : {registerId:UID},
				success : function(result){
					result.data.tel = 'tel:' + result.data.mobile;
					result.data.sms = 'sms:' + result.data.mobile;
					page.customer.info = result;
				}
			});
			
			//客户回款记录
			API_GET({
				url : 'wd_api/financialPlanner/getRecommendMemberInvestReceipt',
				data : {registerId:UID,offset:0,max:30},
				success : function(result){
					//console.log(result);
					page.customer.list = result;
				}
			});
			
			/*
			//客户投资记录
			API_GET({
				url : 'wd_api/financialPlanner/getRecommendMemberInvestDetail',
				data : {registerId:UID,offset:0,max:30},
				success : function(result){
					//console.log(result);
					page.customer.list = result;
				}
			});
			*/
		},
		getlist: function () {
			var postData = this.pagedata[this.showtab];
			API_GET({
				url : postData.url,
				data : {offset:postData.offset, max:this.pagedata.max},
				success : function(result){
					/*
					if(publicArr.debug && top_nav.shownav == false){
						alert(JSON.stringify(result));
					}
					*/
					if(page[page.showtab].data == result.data){ return; } //重复请求
					//postData.totalCount = result.totalCount || 1000; //同步总记录数
					
					//隐藏继续加载按钮
					//总数量 > 已经加载的数量
					//if(result.totalCount > page.pagedata[page.showtab]['offset']){
					//当前取到的数量 小于 要取的数量
					if(result.data.length < page.pagedata.max){
						page.pagedata[page.showtab]['stillMore'] = false;
					}else{
						page.pagedata[page.showtab]['stillMore'] = true;
					}
					
					
					if(result.data.length == 0){ //如果没有记录
						result.data = []; //解决数据为null，遍历失败的问题
						page.pagedata[page.showtab]['stillMore'] = false; //无数据，去除加载更多按钮
					}else{
						//设置下次请求的 开始值
						page.pagedata[page.showtab]['offset'] += result.data.length;
					}
					
					var newData = page[page.showtab].data.concat(result.data);
					result.data = newData;
					
					
					page[page.showtab] = result;
					

					//解除ajax请求锁
					page.busy = false;
					
				}
			});

		},
		loadMore : function() {
			//下拉刷新记载更多
			var postData = this.pagedata[this.showtab];
			var totalCount = postData['totalCount'], //总记录数
				offset = postData['offset']; //起始记录数

			//已经获得总数量 && 将要开始取的数量 == 总数量  Mark: 应该用 == 为了容错所以用 <=
			if(totalCount !== false && totalCount <= offset){
				this.pagedata[this.showtab]['stillMore'] = false;
				return;
			}
			
			//尚未发起过请求(未取得总数量) || 将要开始取的数量 < 总数量
			if(totalCount === false || offset < totalCount){
				//防止重复触发ajax请求
				if(this.busy){ return false; }
				//开启ajax请求锁
				this.busy = true;
				//开始请求
				this.getlist();
			}
			
		}
	},created: function () {
		if(Auth.get() != 0){
			this.setType('customers');
		}
	}
});


})();