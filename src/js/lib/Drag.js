/**
 * 拖拽插件
 */
;
(function ($) {

    var Drag = (function ($) {
        var Drag = function (element) {
            this.element = element;     //当前的节点
            this.document = $(document);//html的插件根节点
            this.window = $(window);    //window的插件节点

            //鼠标点击下去的事件
            this._mouseDown();
            //屏幕大小发生变化时发生的事件
            this._resize();
        };
        Drag.prototype = {
            constructor:Drag,
            //鼠标按下去时的事件发生
            _mouseDown:function(){
                var _this = this;
                this.element.on("mousedown", function (e) {
                    var $this = $(this);
                    if($.trim($this.html()).length==0) e.preventDefault();//当拖拽区域里面为空时，才阻止默认行为，兼容低版本浏览器内容为空时，不好拖拽的Bug
                    _this.diffx = e.clientX - this.offsetLeft;    //点击时候，点击的x坐标与元素水平x偏移位置
                    _this.diffy = e.clientY - this.offsetTop;     //点击时候，点击的y坐标与元素水平y偏移位置

                    var flag = false;
                    if($.fn.DragDefaults.targetClassName.test(e.target.className)){ //按住指定区域，才可以进行拖拽移动
                        flag = true;
                    }

                    if(flag){
                        _this._mouseMove();      //鼠标移动时候的事件
                        _this._mouseUp();        //鼠标松开时的事件
                    }else{
                        _this.document.off("mousemove");
                        _this.document.off("mouseup");
                    }

                });
            },
            //鼠标移动时的事件发生
            _mouseMove:function(){
                var _this = this;
                this.document.on("mousemove", function (e) {
                    var moveX = e.clientX - _this.diffx;
                    var moveY = e.clientY - _this.diffy;

                    var maxMoveY = $.getInner().width + $.getScrollTop().left - _this.element.offset("width");
                    if(moveX<0){
                        moveX = 0;
                    }else if(moveX> maxMoveY){
                        moveX = maxMoveY;
                    }

                    var maxMoveY = $.getInner().height + $.getScrollTop().top - _this.element.offset("height");
                    if(moveY<0){
                        moveY = 0;
                    }else if(moveY>maxMoveY){
                        moveY = maxMoveY;
                    }

                    _this.element.css({"top": moveY+"px", "left": moveX+"px"});
                    _this.element.DragEvent("setCapture");//兼容ie拖拽鼠标移出时,让它失效
                });
            },
            //鼠标松开始时的事件发生
            _mouseUp:function(){
                var _this = this;
                this.document.on("mouseup", function () {
                    _this.element.DragEvent("releaseCapture");//限制ie私房鼠标时,控制住div元素
                    _this.document.off("mousemove");
                    _this.document.off("mouseup");
                });
            },
            //屏幕大小发生变化时的事件发生
            _resize:function(){
                var _this = this;
                this.window.on("resize",function(){
                    if(_this.element.css("display")=="block"){
                        var maxX = $.getInner().width + $.getScrollTop().left - _this.element.offset("width");
                        if (_this.element.offset("left") > maxX) {    //拖拽时的停放X位置
                            _this.element.css("left",maxX+"px");
                        }else if(_this.element.offset("left")<=0+$.getScrollTop().left){
                            _this.element.css("left", 0 + $.getScrollTop().left + "px");
                        }

                        var maxY = $.getInner().height + $.getScrollTop().top - _this.element.offset("height");
                        if (_this.element.offset("top") > maxY) {    //拖拽时的停放Y位置
                            _this.element.css("top",maxY+"px");
                        }else if(_this.element.offset("top")<=0+$.getScrollTop().top){
                            _this.element.css("top", 0 + $.getScrollTop().top + "px");
                        }
                    }
                });
            }
        };

        return Drag;
    })($);

    $.fn('Drag', function (){
        return this.each(function () {
            var instance = new Drag($(this));   //执行插件实例化
        });
    });

    $.fn.DragDefaults = {
        targetClassName:/(^|\s)mdal-move(\s|$)/ //可拖拽的区域
    };

})($);






