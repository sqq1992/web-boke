/**
 * 轮播的插件
 */
;
(function ($) {

    var TurnPic = (function () {
        var TurnPic = function (element,options) {
            this.element = element;     //
            this.options = $.extend({}, $.fn.TurnPicDefaults, options);

            //配置基本信息
            this._init();
            //绑定事件函数
            this._initFunc();
        };
        TurnPic.prototype = {
            construct:TurnPic,
            //配置基本信息
            _init:function(){
                var options = this.options;
                this.bannerPic = this.element.find(options.bannerPic);  //图片列表的总区域
                this.bannerPicList = this.bannerPic.find("li"); //图片列表们
                this.bannerPicListSize = this.bannerPicList.size(); //图片列表的数量们
                this.bannerPicList.first().clone(true).append(this.bannerPicList.last());   //第一个图片复杂插入到最后面去
                this.bannerPicList.last().clone(true).insertBefore(this.bannerPicList.first());//最后张图片复杂插入到最前面去
                this.newBannerPicList = this.bannerPic.find("li");  //新的图片列表们
                this.newBannerPicListSize = this.newBannerPicList.size();   //新的图片列表的数量
                this.oneWidth = this.element.offset("width");   //单个图片列表的宽度
                this.bannerPic.css({
                    "width":this.newBannerPicListSize*this.oneWidth+"px",
                    "marginLeft":-this.oneWidth+"px"
                });
                //插入导航圆点
                this._initDots();
                this.bannerDotsLi = this.bannerDots.find("li");         //要查找的子元素导航点们

            },
            //绑定事件函数
            _initFunc:function(){
                var _this = this;
                var timer = null;
                this.moveFlag = true;    //能否运动动画的标志
                this.index = 0;          //当前运动的索引
                this.bannerDots.on("click", "li", function () {
                    var currentIndex = _this.bannerDotsLi.index($(this));
                    if(_this.index===currentIndex) return false;
                    _this.index = currentIndex;               //当前点击的index
                    //执行动画
                    _this._playPic(_this.index);
                });

                //定时器动画
                timer = setInterval(function () {
                    _this._autoMove();
                }, 1500);
                //移入清除自动轮播，移出加入自动轮播
                this.element.hover(function () {
                    clearInterval(timer);
                }, function () {
                    timer = setInterval(function () {
                        _this._autoMove();
                    }, 1500);
                });

            },
            //自动运动
            _autoMove:function(){
                var _this = this;
                if(!this.moveFlag){
                    return false;
                }
                this.index++;
                _this.moveFlag = false;
                if(_this.index==_this.bannerPicListSize){
                    _this.bannerDotsLi.removeClass("active").eq(0).addClass("active");
                }else{
                    _this.bannerDotsLi.removeClass("active").eq(_this.index).addClass("active");
                }
                var target = -this.oneWidth - this.index * this.oneWidth;
                this.bannerPic.animate({
                    attr:"marginLeft",
                    target:target,
                    step:50,
                    t:25,
                    type:"constant",
                    callBack:function(){
                        if(_this.index==_this.bannerPicListSize){
                            _this.index = 0;
                            _this.bannerPic.css("marginLeft", -_this.oneWidth + "px");
                            _this.bannerDotsLi.removeClass("active").eq(0).addClass("active");
                        }
                        _this.moveFlag = true;
                    }
                });
            },
            /**
             * 图片的运动动画
             * @param index 当前图片的索引
             * @private
             */
            _playPic:function(index){
                var _this = this;
                var target = -this.oneWidth - index * this.oneWidth;
                _this.bannerDotsLi.removeClass("active").eq(index).addClass("active");
                this.bannerPic.animate({
                    attr:"marginLeft",
                    target:target,
                    step:50,
                    t:25,
                    type:"constant",
                    callBack:function(){
                        _this.moveFlag = true;
                    }
                });
            },
            //插入导航圆点
            _initDots:function(){
                this.bannerDots = this.element.find(this.options.bannerDots);   //导航圆点区域
                var tempStr = "";
                var sumStr = "";
                for(var i= 0,j=this.bannerPicListSize;i<j;i++){
                    if(i===0){
                        tempStr = '<li class="active"></li>';
                    }else{
                        tempStr = '<li></li>';
                    }
                    sumStr += tempStr;
                }
                this.bannerDots.html(sumStr);
            }
        };

        return TurnPic;
    })();

    //插件绑定在类库的实例化中
    $.fn('TurnPic', function (options){
        return this.each(function () {
            var instance = new TurnPic($(this),options);   //执行插件实例化
        });
    });

    //默认配置参数
    $.fn.TurnPicDefaults = {
        bannerPic:".banner-pic", //图片列表的区域
        bannerDots:".banner-dots"   //导航圆点的区域
    };

})($);
