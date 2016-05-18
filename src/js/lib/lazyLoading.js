/**
 * input的校验插件
 */
;
(function ($) {

    var LazyLoading = (function () {
        var LazyLoading = function (element) {
            this.element = element;     //图片的节点
            //配置基本信息
            this._init();
            //配置函数信息
            this._initFunc();
        };
        LazyLoading.prototype = {
            construct:LazyLoading,
            //配置基本信息
            _init:function(){
                var _this = this;
                this.img = this.element.find("img");    //查找到的图片节点
                this.windowHeight = $.getInner().height;    //可视区域的高度
                this.window = $(window);                 //window的jq节点
                this.offsetTop = [];                    //每个img的offsetTop值
                this.isLoadArry = 0;                    //加载过的数量
                this.imgSize = this.img.size();         //图片的数量
                this.img.each(function (n) {            //遍历每个图片，插入它的offsetTop值
                    var top = $(this).offsetTop();
                    _this.offsetTop.push(top);
                });

            },
            //配置函数信息
            _initFunc:function(){
                var _this = this;
                //当前鼠标滚动时,发生懒加载图片
                this.window.on("scroll", function () {
                    if(_this.isLoadArry==_this.imgSize) return false;   //若加载完毕，则不执行函数
                    _this._lazyLoading();
                });

                //当屏幕发生大小改变时，可能发生的懒加载图片
                this.window.on("resize", function () {
                    if(_this.isLoadArry==_this.imgSize) return false;   //若加载完毕，则不执行函数
                    _this._lazyLoading();
                });
            },
            //进行图片懒加载
            _lazyLoading:function(){
                var _this = this;
                var top = document.documentElement.scrollTop || document.body.scrollTop;        //鼠标下拉的高度
                this.img.each(function (n) {
                    var $this = $(this);
                    if((top+_this.windowHeight)>_this.offsetTop[n] && $this.attr("data-load")!="loaded"){
                        $this.attr("src", $this.attr("data-src")).css("opacity",0).animate({
                            attr:"opacity",
                            target:"100",
                            type:"constant",
                            t:10
                        }).attr("data-load","loaded");
                        //加载过的数量
                        _this.isLoadArry++;
                    }
                });

            }
        };

        return LazyLoading;
    })();

    //插件绑定在类库的实例化中
    $.fn('lazyLoading', function (){
        return this.each(function () {
            var instance = new LazyLoading($(this));   //执行插件实例化
        });
    });

    //默认配置参数
    $.fn.LazyLoadingdefaults = {

    };

})($);

