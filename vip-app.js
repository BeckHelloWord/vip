/**
 * Created by yy on 2016/6/23.
 */
(function () {

    //主页个人信息
    var personInfo={
        integral:'2224',
        name:'David Beckham',
        headimg:'',
        grade:'银象',
        crownimg:''
    };

    var vip=new Vue({
        el:'#vip-page',
        data:{
            homepage:personInfo,    //主页信息
        },
        methods:{
            skipIntegral:function () {
                
            },
            skipGrade:function () {

            }
        }
    })
})();