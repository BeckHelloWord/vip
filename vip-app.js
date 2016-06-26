/**
 * Created by yy on 2016/6/23.
 */
(function () {

	//主页个人信息
	var personInfo = {
		integral: '1111',
		name: 'David Beckham',
		headimg: '',
		grade: '银象',
		crownimg: ''
	};

	var titleTxt = '宝象会员';

	var vip = new Vue({
		el: '#vip-page',
		data: {
			showPage: 'mainPage',
			homepage: personInfo, //主页信息
		},
		methods: {
			//跳转
			skip: function (type) {
				switch (type) {
				case 'history':
					this.showPage = 'history';
					topNav.titleInfo='成长值记录';
					break;
				case 'growUp':
					this.showPage = 'growUp';
					topNav.titleInfo='成长值帮助';
					break;
				case 'power':
					this.showPage = 'power';
					topNav.titleInfo='权益介绍';
					break;
				}

			}
		}
	});

	var topNav = new Vue({
		el: '#topNav',
		data: {
			titleInfo: titleTxt
		}
	})

})();