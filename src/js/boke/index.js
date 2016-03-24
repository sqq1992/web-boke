

$(function () {
    //个人中心
    $("#header-member-box").hover(function(){
        $("#header-member-list").addClass("active");
    },function(){
        $("#header-member-list").removeClass("active");
    });

    //分享栏的交互
    Share.init();

    //登录功能
    Login.init();

    //开启注册的校验数据
    $("#register").Verify();
});

/**
 * 分享栏的功能模块
 */
;(function($){
    var Share = function () {
        //配置基本信息
        this._init();
        //配置基本函数
        this._initEvent();
    };
    Share.prototype = {
        constructor:Share,
        //配置基本信息
        _init:function(){
            this.share = $("#share");   //分享栏窗口
        },
        //配置基本函数信息
        _initEvent:function(){
            var _this = this;
            //配置html5的动画效果
            if($.isH5Animate()){
                this._hoverH5();
            }else{  //配置不支持html5的动画效果
                this._hover();
            }
            //分享栏的top值
            this._resizeTop();
            $(window).on("scroll", function () {
                _this._srcollTop();
            });
        },
        //分享栏的H5的效果
        _hoverH5:function(){
            var _this = this;
            this.share.hover(function () {
                _this.share.addClass("active");
            }, function () {
                _this.share.removeClass("active");
            });
        },
        //分享栏的js动画
        _hover:function(){
            var _this = this;
            this.share.css({"left":"-211px"}).hover(function () {
                _this.share.animate({
                    attr:"left",
                    target:"0"
                });
            }, function () {
                _this.share.animate({
                    attr:"left",
                    target:"-211"
                });
            });
        },
        //分享栏的初始化top的变化
        _resizeTop:function(){
            var top = ($.getInner().height - parseInt(this.share.css("height"))) / 2;
            this.share.css({
                "top":top+"px"
            });
        },
        //分享栏的top随着滑轮滑动时的变化
        _srcollTop:function(){
            var top = $.getScrollTop().top+($.getInner().height - parseInt(this.share.css("height")))/2;
            this.share.css({
                "top":top+"px"
            });
        }
    };
    //启动函数
    Share.init = function () {
        return new this();
    };
    //外部接口
    window['Share'] = Share;
})($);


/**
 * 登录的功能模块
 */
;(function($){
    var Login = function () {
        //配置基本信息
        this._init();
        //启动函数
        this._initEvent();
    };
    Login.prototype = {
        constructor:Login,
        //配置基本信息
        _init:function(){
            this.headerBoxLogin = $("#header-box-login");   //登录按钮
            this.loginModal = $("#login-modal");            //登录模态框
            this.modalBg = $("#modal-bg");                  //模态框背景
            this.html = $("html");                          //html节点
            this.modalClose = $("#modal-close");            //关闭登录模态框按钮
        },
        //配置基本信息
        _initEvent:function(){
            var _this = this;
            //登录按钮点击启动
            this.headerBoxLogin.on("click", function () {
                _this.loginModal.show().center(250,350);
                _this.modalBg.show();
                _this.html.css("overflow", "hidden");
            });
            //取消模态框
            this.modalClose.on("click", function () {
                _this.loginModal.hide();
                _this.modalBg.hide();
                _this.html.css("overflow", "auto");
            });
            //执行拖拽
            $("#login-modal").Drag();
        }
    };

    //启动函数
    Login.init = function () {
        return new this();
    };
    //外部接口
    window['Login'] = Login;
})($);
