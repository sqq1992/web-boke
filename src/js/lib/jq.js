

;(function(){
    //启动函数
    var $ = function (args) {
        return new Base(args);
    };

    //逻辑函数
    var Base = function(args){
        //存储原生节点
        this.elements = [];

        //查询节点
        if(typeof args=="string"){
            if(args.indexOf(" ")!="-1"){    //可查找层级关系的节点 如 #test .li
                var argsList = args.split(" ");
                var node = [];
                var tempNodes = [];
                for(var i= 0,j=argsList.length;i<j;i++){
                    if (node.length == 0) node.push(document);
                    switch (argsList[i].charAt(0)){
                        case "#":
                            tempNodes = [];
                            tempNodes.push(this.getId(argsList[i].substring(1)));
                            node = tempNodes;
                            break;
                        case ".":
                            tempNodes = [];
                            for(var n= 0,m=node.length;n<m;n++){
                                var temps = this.getCls(argsList[i].substring(1),node[n]);
                                for(var q= 0,w=temps.length;q<w;q++){
                                    tempNodes.push(temps[q]);
                                }
                            }
                            node = tempNodes;
                            break;
                        default:
                            tempNodes = [];
                            for(var n= 0,m=node.length;n<m;n++){
                                var temps = this.getTagName(argsList[i],node[n],node[n]);
                                for(var q= 0,w=temps.length;q<w;q++){
                                    tempNodes.push(temps[q]);
                                }
                            }
                            node = tempNodes;
                            break;
                    }
                }
                this.elements = tempNodes;
            }else{  //单个层级的节点
                switch (args.charAt(0)) {
                    case "#":
                        this.elements.push(this.getId(args.substring(1)));
                        break;
                    case ".":
                        this.elements = this.getCls(args.substring(1));
                        break;
                    default :
                        this.elements = this.getTagName(args);
                        break;
                }
            }
        }else if(typeof args=='function'){
            this.ready(args);
        }else if(typeof args=='object'){
            if(args!=undefined){
                this.elements[0] = args;
            }
        }
    };

    /**
     * 原生id节点的查询
     * @param args  传入的参数
     * @returns {Element}   返回这个原生id节点
     */
    Base.prototype.getId = function (args) {
        return document.getElementById(args);
    };

    /**
     * 通过class名来寻找节点
     * @param className 传入的className
     * @param parentNode    父元素
     * @returns {Array}
     */
    Base.prototype.getCls = function (className,parentNode) {
        var node = null;
        var temps = [];
        if(parentNode==undefined){
            node = document;
        }else{
            node = parentNode;
        }
        var allNode = node.getElementsByTagName("*");
        for(var i= 0,j=allNode.length;i<j;i++){
            var oneNode = allNode[i];
            if(new RegExp('(\\s|^)'+className+'(\\s|$)').test(oneNode.className)){
                temps.push(oneNode);
            }
        }
        return temps;
    };

    /**
     * 通过html标签名来寻找节点
     * @param tagName   传入的节点名
     * @param parentNode    传入的父节点
     * @returns {NodeList}
     */
    Base.prototype.getTagName = function (tagName,parentNode) {
        var node = null;
        if(parentNode==undefined){
            node = document;
        }else{
            node = parentNode;
        }
        var allNode = node.getElementsByTagName(tagName);
        return allNode;
    };

    /**
     * 根据父节点来向下寻找子节点
     * @param args  传入的节点类型
     * @returns {Base}
     */
    Base.prototype.find = function (args) {
        var temps = [];
        var tempsArry = [];
        for(var i= 0,j=this.elements.length;i<j;i++){
            if(typeof args=="string"){
                var node = this.elements[i];
                switch (args.charAt(0)){
                    case ".":
                        temps = this.getCls(args.substring(1), node);
                        for(var n= 0,m=temps.length;n<m;n++){
                            tempsArry.push(temps[n]);
                        }
                        break;
                    default :
                        temps = this.getTagName(args, node);
                        for(var n= 0,m=temps.length;n<m;n++){
                            tempsArry.push(temps[n]);
                        }
                        break;
                }
            }
        }
        this.elements = tempsArry;
        return this;
    };

    /**
     * 获取form表单下的input
     * @param name  input的name值
     * @returns {Base}
     */
    Base.prototype.form = function (name) {
        var tempArry = [];
        for(var i= 0,j=this.elements.length;i<j;i++){
            var tempNode = this.elements[i][name];
            tempArry.push(tempNode);
        }
        this.elements = tempArry;
        return this;
    };

    /**
     * 插入html元素，如有有字符串，则进行插入操作，没有则为读取操作
     * @param str   传入的html字符串
     * @returns {*}
     */
    Base.prototype.html = function (str) {
        for(var i= 0,j=this.elements.length;i<j;i++){
            if(arguments.length==0){
                return this.elements[i].innerHTML;
            }else{
                this.elements[i].innerHTML = str;
            }
        }
        return this;
    };

    /**
     * 设置css样式,传入2个字符串可改变样式，传入一个参数：如果参数为
     * @param attr
     * @param value
     * @returns {Base}
     */
    Base.prototype.css = function (attr,value) {
        for(var i= 0,j=this.elements.length;i<j;i++){
            var node = this.elements[i];
            if(arguments.length==1){
                if(typeof attr=="object"){
                    for(var n in attr){
                        node.style[n] = attr[n];
                    }
                }else{
                    return getStyle(node, attr);
                }
            }
            node.style[attr] = value;
        }
        return this;
    };

    /**
     * 获取节点元素的offsetWidth,offsetHeight,offsetLeft,offsetTop的值
     * @param str   传入需要得到的值
     */
    Base.prototype.offset = function (str) {
        for(var i= 0,j=this.elements.length;i<j;i++){
            var node = this.elements[i];
            return node['offset' + $.firstUppercase(str)];
        }
    };

    /**
     * 兼容w3c和ie，寻找出这个样式的值
     * @param node  传入的节点
     * @param attr  样式属性
     * @returns {string}    样式属性值
     */
    function getStyle(node,attr){
        var value = "";
        if(typeof window.getComputedStyle!="undefined"){
            value = window.getComputedStyle(node, null)[attr];
        }else if(typeof node.currentStyle!="undefined"){
            value = node.currentStyle[attr];
        }
        return value;
    }

    /**
     * 动画功能
     * @param obj
     */
    Base.prototype.animate = function (obj) {
        for(var i= 0,j=this.elements.length;i<j;i++){
            var elements = this.elements[i];

            //动画属性
            var attr = obj.attr;

            //这个节点对应动画刚开始的运动状态
            var start = obj.start != undefined ? obj.start :
                            attr = "opacity" ? parseFloat(getStyle(elements, attr)) * 100 :
                                parseInt(getStyle(elements, attr));
            //运动速率,默认为10
            var step = obj.step != undefined ? obj.step : 10;

            //运动速率事件，默认为20毫秒
            var t = obj.t != undefined ? obj.t : 20;

            //配置增量或者常量
            var alter = obj.alter;  //增量
            var target = obj.target;    //目标量
            var mul = obj['mul'];   //运动的属性集合
            if(alter!==undefined && target ==undefined){
                target = start + alter;
            }else if(alter ==undefined && target ==undefined && mul == undefined){
                throw new Error("增量和目标量一定要有一个");
            }

            //设置运动速率，默认为6
            var speed = obj.speed != undefined ? obj.speed : 6;

            //设置运动方式：0为匀速，1为对冲
            var type = obj.type == 0 ? "constant" : obj.type == 1 ? "buffer" : "buffer";

            //如果开始值大于目标值，则运动为负方向
            if(start>target) step = -step;
            if(obj.attr=="opacity"){
                elements.style.opacity = start / 100;
                elements.style.filter = "alpha(opacity=" + start + ")";
            }else{
                elements.style[attr] = start + "px";
            }

            //创建多个同步动画时，创建动画属性集合
            if(mul == undefined){
                mul = {};
                mul[attr] = target;
            }

            //为每个动画单独开盘一个定时器
            clearInterval(elements.timer);
            elements.timer = setInterval(function () {
                var flag = true;
                for(var i in mul){
                    attr = i == "X" ? "left" : i == "y" ? "top" : i == "w" ? "width" : i == "h" ? "height" : i == "o" ? "opacity" : i == undefined ? i : "left";
                    target = mul[i];
                }
                //运动方式为减速度
                if(type=="buffer"){
                    step = attr == 'opacity' ? (target - parseFloat(getStyle(elements, attr)) * 100) / speed:
                        (target-parseInt(getStyle(elements,attr)))/speed;
                    step = step > 0 ? Math.ceil(step) : Math.floor(step);
                }
                if(attr=="opacity"){
                    var absOpacityStep = Math.abs(parseFloat(getStyle(elements, attr)) * 100 - target);
                    if(step==0){
                        setOpacity();
                    }else if(step>0 && absOpacityStep<=step){
                        setOpacity();
                    }else if(step<0 && absOpacityStep<=Math.abs(step)){
                        setOpacity();
                    }else{
                        var temp = parseFloat(getStyle(elements, attr)) * 100;
                        elements.style.opacity = parseInt(temp+step)/100;
                        elements.style.filter = 'alpha(opacity='+parseInt(temp+step)+')';
                    }
                    if(parseInt(target)!=parseInt(parseFloat(getStyle(elements,att))*100)) flag = false;
                }else{
                    var absStep = Math.abs(parseInt(getStyle(elements, attr)) - target);
                    if (step == 0) {
                        setSports();
                    } else if (step > 0 && absStep <= step) {
                        setSports();
                    } else if (step < 0 && absStep <= Math.abs(step)) {
                        setSports();
                    } else {
                        elements.style[attr] = parseInt(getStyle(elements, attr)) + step + "px";
                    }
                    if(parseInt(target)!=parseInt(getStyle(elements, attr))) flag = false;
                }

                //可以增加回调函数，等动画结束之后
                if(flag){
                    clearInterval(elements.timer);
                    if(obj.fn) obj.fn();
                }
            }, t);


            //设置透明结束时的函数
            function setOpacity(){
                elements.style.opacity = parseInt(target)/100;
                elements.style.filter = "alpha(opacity="+parseInt(target)+")";
            }

            //运动结束时的函数
            function setSports(){
                elements.style[attr] = target + "px";
            }

        }
        return this;
    };

    /**
     * 设置元素为显示状态
     * @returns {Base}
     */
    Base.prototype.show = function () {
        for(var i= 0,j=this.elements.length;i<j;i++){
            this.elements[i].style.display = "block";
        }
        return this;
    };

    /**
     * 设置元素为消失状态
     * @returns {Base}
     */
    Base.prototype.hide = function () {
        for(var i= 0,j=this.elements.length;i<j;i++){
            this.elements[i].style.display = "none";
        }
        return this;
    };

    /**
     * 遍历每个jq节点
     * @param fn    传入的函数
     * @returns {Base}
     */
    Base.prototype.each = function (fn) {
        for(var i= 0,j=this.elements.length;i<j;i++){
            fn.call(this.elements[i]);
        }
        return this;
    };

    /**
     * 绑定点击事件
     * @param fn    传入的事件函数
     * @returns {Base}
     */
    Base.prototype.click = function(fn){
        for(var i= 0,j=this.elements.length;i<j;i++){
            this.elements[i].onclick = fn;
        }
        return this;
    };

    /**
     * 鼠标的移入和移出事件
     * @param fn1   移入事件
     * @param fn2   移出事件
     */
    Base.prototype.hover = function (fn1, fn2) {
        for(var i= 0,j=this.elements.length;i<j;i++){
            this.elements[i].onmousemove = fn1;
            this.elements[i].onmouseout = fn2;
        }
        return this;
    };

    /**
     * 居中事件
     * @param height    区域的高度
     * @param width     区域的宽度
     * @returns {Base}
     */
    Base.prototype.center = function (height,width) {
        var top = (document.documentElement.clientHeight - height) / 2 + $.getScrollTop().top;
        var left = (document.documentElement.clientWidth-width)/2 +$.getScrollTop().left;
        for(var i= 0,j=this.elements.length;i<j;i++){
            this.elements[i].style.top = top + "px";
            this.elements[i].style.left = left + "px";
        }
        return this;
    };

    /**
     * 通过addEventListener绑定事件,顺便修复ie下的bug
     * @param type  传入的事件
     * @param fn    传入的函数
     * @returns {Base}
     */
    var on = {};    //on方法的辅助对象
    Base.prototype.on = function (type, fn) {
        for(var i= 0,j=this.elements.length;i<j;i++){
            var node = this.elements[i];
/*            if(typeof node.addEventListener!="undefined"){
                node.addEventListener(type, fn,false);
            }else{  //兼容ie下的addEventListener方法*/
            if(!node.events) node.events = {};
            if(!node.events[type])node.events[type] = [];

            //如果是相同事件，则不进行重复绑定
            if(on.equal(node.events[type],fn)) return false;
            node.events[type].push(fn);
            node['on'+type] = on.Exec;
            //}
        }
        return this;
    };

    //如果重复，则不进行绑定
    on.equal = function (types,fn) {
        for(var i = 0,j=types.length;i<j;i++){
            if(types[i]==fn){
                return true;
            }
            return false;
        }
    };

    //修复ie的绑定事件
    on.Exec = function (e) {
        var e = e || on.fixEvent(window.event);
        for(var i= 0,j=this.events[e.type].length;i<j;i++){
            this.events[e.type][i].call(this,e);
        }
    };

    //修复ie下的event对象，使其与w3c符合
    on.fixEvent = function (event) {
        event.preventDefault = on.fixEvent.preventDefault;  //给ie的event对象绑定阻止默认事件发生的函数
        event.stopPropagation = on.fixEvent.stopPropagation;//给ie的event对象绑定阻止冒泡事件发生的函数
        event.target = event.srcElement;        //修复ie下的event的target对象
        return event;
    };

    //ie下的阻止默认事件
    on.fixEvent.preventDefault = function () {
        this.returnValue = false;
    };
    //ie下的阻止冒泡事件
    on.fixEvent.stopPropagation = function () {
        this.cancelBubble = true;
    };

    /**
     * 取消事件绑定
     * @param type  传入的事件名词
     * @param fn    传入的事件函数
     * @returns {Base}
     */
    Base.prototype.off = function(type,fn){
        for(var i= 0,j=this.elements.length;i<j;i++){
/*            var node = this.elements[i];
            if(typeof node.removeEventListener!="undefined"){
                node.removeEventListener(type,fn,false);
            }else{
                if(node.events){
                    for(var n= 0,m=node.events[type].length;n<m;n++){
                        if(node.events[type][n]==fn){
                            delete node.events[type][n];
                        }
                    }
                }
            }*/
            if(type=="hover"){
                this[type](null,null);
            }else{
                this.elements[i]['on' + type] = null;
            }
        }
        return this;
    };


    /**
     * 如果节点没有这个名称的class，就为这个节点添加class
     * @param className class名
     * @returns {Base}
     */
    Base.prototype.addClass = function (className) {
        for(var i= 0,j=this.elements.length;i<j;i++){
            if(!(new RegExp('(\\s|^)'+className+'(\\s|$)')).test(this.elements[i].className)){
                this.elements[i].className += " " + className;
            }
        }
        return this;
    };

    /**
     * 如果这个节点有这个名称的class，就讲这个class给删除
     * @param className 传入的className
     * @returns {Base}
     */
    Base.prototype.removeClass = function (className) {
        for(var i= 0,j=this.elements.length;i<j;i++){
            this.elements[i].className = this.elements[i].className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), "");
        }
        return this;
    };

    /**
     *  封装dom节点树立完成之后的回调函数
     * @param fn    传入要执行的回调函数
     */
    Base.prototype.ready = function(fn){
        var isReady = false;
        var timer = null;

        function doready(){
            if(timer) clearInterval(timer);
            if(isReady) return;
            isReady = true;
            fn();
        }

        if(($.sys.opera && $.sys.opera<9) || ($.sys.firefox && $.sys.firefox<3) || ($.sys.webkit && $.sys.webkit <525)){
            timer = setInterval(function(){
                if(document && document.getElementById && document.getElementsByTagName && document.body){
                    doready();
                }
            },1);
        }else if(document.addEventListener){
            var _this = this;
            document.addEventListener("DOMContentLoaded",function(){
                fn();
            },false);
        }else if($.sys.ie && $.sys.ie<9){
            var timer = null;
            timer = setInterval(function () {
                try{
                    document.documentElement.doScroll("left");
                    doready();
                }catch(e){}
            }, 1);
        }
    };

    /**
     * 兼容事件
     * @param type  传入的事件名称
     * @returns {Base}
     * @constructor
     */
    Base.prototype.DragEvent = function(type){
        for(var i= 0,j=this.elements.length;i<j;i++){
            var node = this.elements[i];
            if (typeof node[type] != "undefined") {   //兼容ie拖拽鼠标移出时,让它失效
                node[type]();
            }
        }
        return this;
    };

    /**
     * 判断浏览器的信息
     */
    ;
    (function ($) {
        $.sys = {};
        var ua = navigator.userAgent.toLocaleLowerCase();
        var s;
        (s = ua.match(/msie ([\d.]+)/)) ? $.sys.ie = s[1] :
            (s = ua.match(/firefox\/([\d.]+)/)) ? $.sys.firefox = s[1] :
                (s = ua.match(/chrome\/([\d.]+)/)) ? $.sys.chrome = s[1]:
                    (s = ua.match(/opera\/.*version\/([\d.]+)/)) ? sys.opera = s[1] :
                        (s = ua.match(/version\/([\d.]+).*safari/)) ? sys.safari = s[1] : 0;

        if(/webkit/.test(ua)) $.sys.webkit = ua.match(/webkit\/([\d.]+)/)[1];
    })($);

    /**
     * 插件扩展
     * @param name  传入的名称
     * @param fn    传入的方法
     */
    $.fn = function (name,fn) {
        Base.prototype[name] = fn;
    };

    /**
     * 去除字符串的左边和右边的空格，并返回新的字符串
     * @param str   传入的字符串
     * @returns {string|void|XML}
     */
    $.trim = function(str){
        return str.replace(/(^\s*)|(\s*$)/g,"");
    };

    /**
     * 事件委托
     * @param fn    要委托的函数
     * @param obj   委托给哪个对象
     */
    $.proxy = function (fn,obj) {
        fn.call(obj);
    };

    /**
     * 获取浏览器可视区域的宽高
     * @returns {*}
     */
    $.getInner = function () {
        if(typeof window.innerWidth!="undefined"){
            return{
                width:window.innerWidth,
                height:window.innerHeight
            }
        }else{
            return{
                width:document.documentElement.clientWidth,
                height:document.documentElement.clientHeight
            }
        }
    };

    /**
     * 讲英文单子的首个字母变为大写
     * @param str   传入的英文字符串
     * @returns {string|void|XML}
     */
    $.firstUppercase = function (str) {
        return str.replace(/\b\w+\b/g, function (value) {
            return value.substring(0, 1).toUpperCase() + value.substring(1);
        });
    };

    /**
     * 获取滚动条滚动时的值
     * @returns {{top: number, left: number}}
     */
    $.getScrollTop = function () {
        return{
            top:document.documentElement.scrollTop || document.body.scrollTop,
            left:document.documentElement.scrollLeft || document.body.scrollLeft
        }
    };

    //能否支持html5的动画属性
    $.isH5Animate = function () {
        var flag = false;
        var testNode = document.createElement("div");
        var transitionEnd = {
            WebkitTransition :"webkitTransitionEnd",
            MozTransition    :"transitionend",
            OTransition      : 'oTransitionEnd otransitionend',
            transition       : 'transitionend'
        };
        for(var i in transitionEnd){
            if(testNode.style[i]!==undefined){
                flag = true;
            }
        }
        return flag;
    };

    //外部接口
    window['$'] = $;
})();