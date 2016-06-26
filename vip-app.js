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
                        topNav.titleInfo = '成长值记录';
                        topNav.showgoback = true;
                        break;
                    case 'growUp':
                        this.showPage = 'growUp';
                        topNav.titleInfo = '成长值帮助';
                        topNav.showgoback = true;
                        break;
                    case 'power':
                        this.showPage = 'power';
                        topNav.titleInfo = '权益介绍';
                        topNav.showgoback = true;
                        break;
                }

            }
        }
    });

    var topNav = new Vue({
        el: '#topNav',
        data: {
            showgoback: false,
            shownav: true,
            titleInfo: '宝象会员'
        }, methods: {
            goback: function () {
                try {
                    history.back();
                } catch (r) {
                    history.go(-1);
                }
            }
        }, created: function () {
            //是否显示头部
            var ua = navigator.userAgent.toLowerCase();

            if (ua.indexOf('baoxiang') != -1) {
                //宝象APP内运行
                this.shownav = false;
            } else if (ua.indexOf('micromessenger/') != -1) {
                //微信内运行
                this.shownav = false;
            } else if (ua.indexOf('qq/') != -1) {
                this.shownav = false;
            }

            setTimeout(function () {
                if (topNav.shownav == false) {
                    top_nav.$el.style.display = 'none';
                }
            }, 0);
        }
    })

})();