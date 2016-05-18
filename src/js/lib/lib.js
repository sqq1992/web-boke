

;(function(){
    //启动函数
    var $ = function (args) {
        return new Base(args);
    };

    var Base = (function () {

        var Base = function(args){
            //存储私有的原生节点
            this.elements = [];

            if(typeof args=="string"){      //当参数为普通字符串的时候为dom查找器
                this.getDom(args);
            }else if(typeof args=="function"){  //为function的话，为DOmContentLoaded事件
                this.ready(args);
            }else if(typeof args=="object"){    //直接传入document等对象
                if(args!=undefined){
                    this.elements[0] = args;
                }
            }

        };

        var on = {};    //on方法的辅助对象
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
                if(this.trustElements){            //如果存在的事件委托的话
                    for(var n= 0,m=this.trustElements.length;n<m;n++){     //遍历查找到的子元素节点
                        var node = this.trustElements[n];                  //如果此时点击到的元素等于要委托的元素的话，执行函数
                        if(e.target===node){
                            this.events[e.type][i].call(node,e);
                        }
                    }
                }else{
                    this.events[e.type][i].call(this,e);
                }
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

        Base.fn = Base.prototype = {
            constructor:Base,
            /**
             * 查找dom
             * @param args
             */
            getDom:function(args){
                if(args.indexOf(" ")!="-1"){    //可查找层级关系的节点 如 #test .li
                    var argsList = args.split(" ");
                    var node = [];          //存放dom父元素的数组
                    var tempNodes = [];     //临时数组
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
            },

            /**
             * 原生id节点的查询
             * @param args  传入的参数
             * @returns {Element}   返回这个原生id节点
             */
            getId:function (args) {
                return document.getElementById(args);
            },
            /**
             * 通过class名来寻找节点
             * @param className 传入的className
             * @param parentNode    父元素
             * @returns {Array}
             */
            getCls:function (className,parentNode) {
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
            },
            /**
             * 通过html标签名来寻找节点
             * @param tagName   传入的节点名
             * @param parentNode    传入的父节点
             * @returns {NodeList}
             */
            getTagName:function (tagName,parentNode) {
                var node = null;
                if(parentNode==undefined){
                    node = document;
                }else{
                    node = parentNode;
                }
                var allNode = node.getElementsByTagName(tagName);
                return allNode;
            },

            /**
             * 根据父节点来向下寻找子节点
             * @param args  传入的节点类型
             * @returns {Base}
             */
            find:function (args) {
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
                return this.newBase(tempsArry);  //返回新的base对象
            },
            /**
             * 查找元素的下一个兄弟节点
             */
            next:function () {
                var tempArry = [],  //存储找到节点的临时数组
                    tempNode = null;//查找到的节点
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var node = this.elements[i];
                    tempNode = node.nextSibling;
                    if(tempNode.nodeType===1){          //节点为元素节点的时候
                        tempArry.push(tempNode);
                    }else if(tempNode==null){       //节点找不到的时候
                        throw new Error("找不到下一个同级元素的节点");
                        continue;
                    }else if(tempNode.nodeType===3){    //兼容非ie浏览器找到文本节点的时候，继续循环找元素节点
                        while(tempNode.nodeType===3){
                            tempNode = tempNode.nextSibling;
                            if(tempNode.nodeType===1){
                                tempArry.push(tempNode);
                            }else if(tempNode==null){
                                break;
                            }
                        }
                    }
                }
                return this.newBase(tempArry);  //返回新的base对象
            },

            /**
             * 查找元素的上一个兄弟节点
             */
            prev:function () {
                var tempArry = [],  //存储找到节点的临时数组
                    tempNode = null;//查找到的节点
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var node = this.elements[i];
                    tempNode = node.previousSibling;
                    if(tempNode.nodeType===1){      //节点为元素节点的时候
                        tempArry.push(tempNode);
                    }else if(tempNode==null){       //节点找不到的时候
                        throw new Error("找不到下一个同级元素的节点");
                        continue;
                    }else if(tempNode.nodeType===3){    //兼容非ie浏览器找到文本节点的时候，继续循环找元素节点
                        while(tempNode.nodeType===3){
                            tempNode = tempNode.previousSibling;
                            if(tempNode.nodeType===1){
                                tempArry.push(tempNode);
                            }else if(tempNode==null){
                                break;
                            }
                        }
                    }
                }
                return this.newBase(tempArry);  //返回新的base对象
            },

            /**
             * 返回出一个新的base对象
             * @param elements  传入私有的节点数组
             */
            newBase:function (elements) {
                var base = new Base();
                base.elements = elements;
                return base;
            },
            /**
             * 获取form表单下的input
             * @param name  input的name值
             * @returns {Base}
             */
            form:function (name) {
                var tempArry = [];
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var tempNode = this.elements[i][name];
                    tempArry.push(tempNode);
                }
                this.elements = tempArry;
                return this;
            },

            /**
             * 查找当前元素处于的索引位置
             * @param obj   传入的jq节点对象
             */
            index:function(obj){
                for(var i= 0,j=this.elements.length;i<j;i++){
                    if(this.elements[i]===obj.elements[0]){
                        return i;
                    }
                }
            },

            /**
             * 对节点进行复制，若flag为true为深复制,flag为false为浅复制
             * @param flag  传入深复制和浅复制的布尔值
             */
            clone:function (flag) {
                var tempArry = [];
                for(var i= 0,j=this.elements.length;i<j;i++){
                    tempArry.push(this.elements[i].cloneNode(flag));        //复制每个节点
                }
                return this.newBase(tempArry);          //返回新的base对象
            },

            /**
             * 创造一个根据某个特定需求的新的jq节点
             * @param num   传入的索引
             */
            eq:function (num) {
                return this.newBase([this.elements[num]]);
            },

            /**
             * 取某个jq节点中的第一个节点,返回新的base对象
             */
            first:function () {
                return this.newBase([this.elements[0]]);
            },

            /**
             * 取某个jq节点中的最后一个节点,返回新的base对象
             */
            last:function () {
                return this.newBase([this.elements[this.elements.length - 1]]);
            },

            /**
             * 将某个节点插入在某些节点的前面
             * @param obj   被插入节点的base对象
             */
            insertBefore:function (obj) {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var element = this.elements[i];         //要插入的节点
                    for(var n= 0,m=obj.elements.length;n<m;n++){    //被插入的节点
                        var byElement = obj.elements[n];
                        byElement.parentNode.insertBefore(element,byElement);
                    }
                }
                return this;
            },

            /**
             * 对dom节点进行删除
             */
            remove:function () {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var element = this.elements[i];         //要插入的节点
                    var parentElement = element.parentNode; //当前元素的父节点
                    parentElement.removeChild(element);
                }
                return this;
            },

            /**
             * 将某个节点插入在某些节点的后面
             * @param obj   被插入节点的base对象
             */
            append:function (obj) {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var element = this.elements[i];         //要插入的节点
                    for(var n= 0,m=obj.elements.length;n<m;n++){    //被插入的节点
                        var byElement = obj.elements[n];
                        byElement.parentNode.appendChild(element);
                    }
                }
                return this;
            },

            /**
             * 插入html元素，如有有字符串，则进行插入操作，没有则为读取操作
             * @param str   传入的html字符串
             * @returns {*}
             */
            html:function (str) {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    if(str){
                        return this.elements[i].innerHTML;
                    }else{
                        this.elements[i].innerHTML = str;
                    }
                }
                return this;
            },

            /**
             * 设置css样式,传入2个字符串可改变样式，传入一个参数：如果参数为
             * @param attr
             * @param value
             * @returns {Base}
             */
            css:function (attr,value) {
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
                    }else if(arguments.length==2){
                        node.style[attr] = value;
                    }
                }
                return this;
            },

            /**
             * 对标签添加或者返回特定的属性
             * @param key   属性
             * @param value 属性值
             * @returns {*}
             */
            attr:function (key, value) {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var node = this.elements[i];
                    if(arguments.length==1){
                        return node.getAttribute(key);
                    }else if(arguments.length==2){
                        node.setAttribute(key, value);
                    }
                }
                return this;
            },

            /**
             * 对标签删除某个属性
             * @param key   属性
             * @returns {Base}
             */
            removeAttr:function (key) {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var node = this.elements[i];
                    node.removeAttribute(key);
                }
                return this;
            },

            /**
             * 获取节点元素的offsetWidth,offsetHeight
             * @param str   传入需要得到的值
             */
            offset:function (str) {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var node = this.elements[i];
                    return node['offset' + $.firstUppercase(str)];
                }
            },

            /**
             * 获取元素到顶部的top距离
             */
            offsetTop:function () {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var node = this.elements[i];
                    var top = node.offsetTop;     //到顶部的top
                    var parent = node.offsetParent;   //当前节点的父元素
                    while(parent!=null){                //兼容ie，offsetTop只到上一级父元素
                        top += parent.offsetTop;
                        parent = parent.offsetParent;
                    }
                }
                return top;
            },

            /**
             * 返回出当前原生节点的个数
             * @returns {Number}
             */
            size:function () {
                return this.elements.length;
            },
            //透明动画的变化  以ie的透明度为主
            //obj.attr 为测试的动画效果名        //可选参数, 默认为left
            //obj.step 每次位移的量              //可选参数, 默认为10
            //obj.t 为每多少时间执行一次动画     //可选参数，默认为50
            //obj.target 为动画的终点            //必填的参数
            //obj.speed 为缓存动画的速度         //可选的参数 默认为6
            //obj.type 为动画的类型              //可选的参数 默认为缓冲
            //obj.callBack为回调函数             //可选参数 默认为五
            //obj.mul为同步动画                  //可选参数 默认为无
            animate:function(obj){
                var callBackFlag = false,       //回调函数的标志
                    callBackTimer = null;       //回调函数的定时器
                for(var n= 0,m=this.elements.length;n<m;n++){
                    //配置基本信息
                    var node = this.elements[n];            //每个目标节点                  闭包下的唯一变量
                    var attr = obj.attr?obj.attr:"left";    //动画的效果名默认为left         闭包下的唯一变量          多组动画需要变动
                    var step = obj.step?obj.step:10;        //动画每次运动的默认量为10         闭包下的唯一变量        多组动画需要变动
                    var t = obj.t ? obj.t : 50;             //动画运动的默认间隔时间为50        闭包下的唯一变量
                    var target = obj.target;                //必填的目标位置                   闭包下的唯一变量        多组动画需要变动
                    var speed = obj.speed ? obj.speed : 6;  //动画的缓存速度默认为6           闭包下的唯一变量
                    var type = obj.type ? obj.type : "buffer";  //动画类型默认为缓冲         闭包下的唯一变量
                    var mul = obj.mul;                      //执行多组同步动画
                    var aniObj = {};                        //动画运动属性的集合

                    if(!mul){   //若没有多组同步动画，用单组动画进行兼容多组同步动画
                        mul = {};
                        mul[attr] = target;
                    }

                    for(var i in mul){                  //存储运动动画属性数据 i为动画属性,
                        aniObj[i] = {};
                        aniObj[i].target = mul[i];      //这个动画属性的目标位置
                        aniObj[i].start = i==="opacity"?parseFloat(getStyle(node, i))*100:   //动画属性的初始位置 若动画属性是透明的话，则以ie的透明度为主 多组动画需要变动
                            parseInt(getStyle(node, i));
                        aniObj[i].step = aniObj[i].start > aniObj[i].target ? -step : step; //动画的运动量 如果起始点位置比目标值大,每间隔时间的位移为负
                    }


                    /**
                     * 闭包环境下将某些变量独立出来
                     */
                    ;(function(node,aniObj){
                        //内部进行动画效果
                        clearInterval(node.timer);   //清除定时器
                        var attr,       //运动动画属性的属性值
                            target,     //运动动画属性的目标值
                            step,       //运动动画属性的运动量
                            start,      //运动动画属性的初始值
                            flag = true;//清楚动画定时器的标志
                        node.timer = setInterval(function(){

                            for(var i in aniObj){
                                attr = i;
                                target = aniObj[i].target;
                                step = aniObj[i].step;
                                start = aniObj[i].start;


                                //在缓存动画下运动的量的变化
                                if(type==="buffer"){
                                    step = attr==="opacity"?(target - start) / speed://缓冲动画运动的量，量一起以ie的opacity为主
                                    (target - start) / speed;
                                    step = step > 0 ? Math.ceil(step) : Math.floor(step);       //若为正方向运动,step向上取,否则向下取  //让动画过度平稳
                                }

                                if(attr==="opacity"){        //透明度的动画变化
                                    if(step==0){
                                        clearOpacityAnimate(node,attr,target);
                                    }else if(step>0 && Math.abs(aniObj[i].start-target)<step){       //若运动到的点的位置与目标点小于step之内,直接到达目的地
                                        clearOpacityAnimate(node,attr,target);
                                    }else if(step<0 && (aniObj[i].start-target)<-step){        //若运动到的点的位置与目标点小于step之内,直接到达目的地
                                        clearOpacityAnimate(aniObj[i].start,attr,target);
                                    }else{
                                        aniObj[i].start += step;
                                        node.style.opacity = (aniObj[i].start + step)/100 ;    //每隔时间段,进行位移量的添加或者减少
                                        node.style.filter = 'alpha(opacity=' + (aniObj[i].start + step) + ')';
                                    }

                                    if(parseInt(target)!=aniObj[i].start){
                                        flag = false;
                                        callBackFlag = false;
                                    }else{
                                        callBackFlag = true;
                                    }


                                }else{                      //其他动画的变化
                                    if(step==0){                                                    //缓冲动画时最后的step
                                        clearAnimate(node,attr,target);
                                    }else if(step>0 && Math.abs(aniObj[i].start-target)<step){       //若运动到的点的位置与目标点小于step之内,直接到达目的地
                                        clearAnimate(node,attr,target);
                                    }else if(step<0 && (aniObj[i].start-target)<-step){        //若运动到的点的位置与目标点小于step之内,直接到达目的地
                                        clearAnimate(node,attr,target);
                                    }else{
                                        aniObj[i].start += step;
                                        node.style[attr] = aniObj[i].start + "px";    //每隔时间段,进行位移量的添加或者减少
                                    }

                                    if(parseInt(target)!=aniObj[i].start){
                                        flag = false;
                                        callBackFlag = false;
                                    }else{
                                        callBackFlag = true;
                                    }

                                }

                            }

                            if(flag){
                                clearInterval(node.timer);
                            }
                            flag = true;

                        },t);


                    })(node,aniObj);

                }

                //回调函数的定时器
                clearInterval(callBackTimer);
                callBackTimer = setInterval(function(){
                    if(callBackFlag){
                        clearInterval(callBackTimer);
                        obj.callBack && obj.callBack();     //执行回调函数
                    }
                },t);


                /**
                 * 清楚透明动画定时器,结束运动
                 */
                function clearOpacityAnimate(node,target){
                    node.style.opacity = target;
                    node.style.filter = 'alpha(opacity=' + target + ')';
                }

                /**
                 * 清楚其他动画定时器，结束运动
                 */
                function clearAnimate(node,attr,target){
                    node.style[attr] = target + "px";
                }

                return this;
            },
            /**
             * 设置元素为显示状态
             * @returns {Base}
             */
            show:function () {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    this.elements[i].style.display = "block";
                }
                return this;
            },

            /**
             * 设置元素为消失状态
             * @returns {Base}
             */
            hide:function () {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    this.elements[i].style.display = "none";
                }
                return this;
            },

            /**
             * 点击某个元素节点进行函数的多种切换
             * @returns {Base}
             */
            toggle:function () {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var node = this.elements[i];
                    var args = Array.prototype.slice.call(arguments,0); //传入的函数数组
                    var argsLen = args.length;                          //传入的函数数组的长度
                    node.count = 0;
                    node.onclick = function () {                        //点击进行的事件
                        args[this.count++ % argsLen].call(this);        //事件函数的切换
                    };
                }
                return this;
            },

            /**
             * 遍历每个jq节点
             * @param fn    传入的函数
             * @returns {Base}
             */
            each:function (fn) {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    fn.call(this.elements[i],i);
                }
                return this;
            },
            /**
             * 绑定点击事件
             * @param fn    传入的事件函数
             * @returns {Base}
             */
            click:function(fn){
                for(var i= 0,j=this.elements.length;i<j;i++){
                    this.elements[i].onclick = fn;
                }
                return this;
            },

            /**
             * 鼠标的移入和移出事件
             * @param fn1   移入事件
             * @param fn2   移出事件
             */
            hover:function (fn1, fn2) {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    this.elements[i].onmouseover = fn1;
                    this.elements[i].onmouseout = fn2;
                }
                return this;
            },

            /**
             * 居中事件
             * @param height    区域的高度
             * @param width     区域的宽度
             * @returns {Base}
             */
            center:function (height,width) {
                var top = (document.documentElement.clientHeight - height) / 2 + $.getScrollTop().top;
                var left = (document.documentElement.clientWidth-width)/2 +$.getScrollTop().left;
                for(var i= 0,j=this.elements.length;i<j;i++){
                    this.elements[i].style.top = top + "px";
                    this.elements[i].style.left = left + "px";
                }
                return this;
            },

            /**
             * 通过addEventListener绑定事件,顺便修复ie下的bug
             * @param type  传入的事件
             * @param fn    传入的函数
             * @returns {Base}
             */
            on:function (type,selector,fn) {
                var argsLen = arguments.length;         //参数的长度
                var fn;             //绑定的方法
                selector;       //寻找节点的方法
                if(argsLen===2){            //当没有委托节点的时候
                    fn = arguments[1];
                }else if(argsLen===3){      //有委托节点的时候
                    var newBase = this.find(selector);      //新的jq对象
                    //this.trustElements = newBase.elements;
                }


                for(var i= 0,j=this.elements.length;i<j;i++){
                    var node = this.elements[i];
                    if(argsLen==3) node.trustElements = newBase.elements;   //将委托节点放入node对象的trustElement的委托节点上
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
            },

            /**
             * 取消事件绑定
             * @param type  传入的事件名词
             * @param fn    传入的事件函数
             * @returns {Base}
             */
            off:function(type,fn){
                for(var i= 0,j=this.elements.length;i<j;i++){
                     //var node = this.elements[i];
                     //if(typeof node.removeEventListener!="undefined"){
                     //   node.removeEventListener(type,fn,false);
                     //}else{
                     //    if(node.events){
                     //       for(var n= 0,m=node.events[type].length;n<m;n++){
                     //            if(node.events[type][n]==fn){
                     //               delete node.events[type][n];
                     //            }
                     //        }
                     //    }
                     //}
                    if(type=="hover"){
                        this[type](null,null);
                    }else{
                        this.elements[i]['on' + type] = null;
                    }
                }
                return this;
            },


            /**
             * 如果节点没有这个名称的class，就为这个节点添加class
             * @param className class名
             * @returns {Base}
             */
            addClass:function (className) {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    if(!(new RegExp('(\\s|^)'+className+'(\\s|$)')).test(this.elements[i].className)){
                        this.elements[i].className += " " + className;
                    }
                }
                return this;
            },

            /**
             * 如果这个节点有这个名称的class，就讲这个class给删除
             * @param className 传入的className
             * @returns {Base}
             */
            removeClass:function (className) {
                for(var i= 0,j=this.elements.length;i<j;i++){
                    this.elements[i].className = this.elements[i].className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), "");
                }
                return this;
            },

            /**
             *  封装dom节点树立完成之后的回调函数
             * @param fn    传入要执行的回调函数
             */
            ready:function(fn){
                var isReady = false;
                var timer = null;

                function doready(){
                    if(timer) clearInterval(timer);
                    if(isReady) return;
                    isReady = true;
                    fn();
                }

                if(document.addEventListener){
                    var _this = this;
                    document.addEventListener("DOMContentLoaded",function(){
                        fn();
                        document.removeEventListener("DOMContentLoaded", arguments.callee, false);  //清除之前的事件
                    },false);
                }else if($.sys.ie && $.sys.ie<9){
                    var timer = null;
                    timer = setInterval(function () {
                        try{
                            document.documentElement.doScroll("left");  //通过文档的滚动条是否成行，来模拟DOMCOntentLoaded事件
                            doready();
                        }catch(e){}
                    }, 1);
                }
            },

            /**
             * 兼容事件
             * @param type  传入的事件名称
             * @returns {Base}
             * @constructor
             */
            DragEvent:function(type){
                for(var i= 0,j=this.elements.length;i<j;i++){
                    var node = this.elements[i];
                    if (typeof node[type] != "undefined") {   //兼容ie拖拽鼠标移出时,让它失效
                        node[type]();
                    }
                }
                return this;
            }




        };


        return Base;
    })();

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
     * 对象属性的替换，类型与jquery中$.extend的作用
     * @returns {{}}
     */
    $.extend = function () {
        var obj = {};           //新的对象
        var args = Array.prototype.slice.call(arguments, 0);    //将传入的对象变为数组
        for(var i= 0,j=args.length;i<j;i++){
            for(var n in args[i]){
                if(args[i][n] instanceof Array){
                    obj[n] = args[i][n];
                }else if(args[i][n] instanceof Object){
                    obj[n] = arguments.callee(args[i][n]);
                }else{
                    obj[n] = args[i][n];
                }
            }
        }
        return obj;
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
     * 封装ajax请求， 具体api参考jquery即可
     * @param obj
     */
    $.ajax = function(obj){
        //创建XMLHttpRequest对象
        function createXhr(){
            if(typeof XMLHttpRequest!="undefined"){
                return new XMLHttpRequest();
            }else if(typeof ActiveXObject!="undefined"){
                var version = [     //ie下不同版本的xmlHttpRequest对象
                    'MSXML2.XMLHttp.6.0',
                    'MSXML2.XMLHttp.3.0',
                    'MSXML2.XMLHttp'
                ];
                for(var i= 0,j=version.length;i<j;i++){
                    try{
                        return new ActiveXObject(version[i]);
                    }catch(e){
                        console.log(e);
                    }
                }
            }else{
                throw new Error("您的浏览器不支持xhr对象!");
            }
        }

        var xhr = createXhr();          //xhr对象的创建
        var url = obj.url;              //传入的请求地址
        var data = params(obj.data);    //传入的数据
        var method = obj.method;        //get请求还是post请求
        var async = obj.async ? obj.async : true;   //同步还是异步,默认为异步

        if(method=="get") url = url + "?" + data;   //get请求的话,url后直接加上参数传

        xhr.open(method, url, async);       //建立发送请求

        if(method=="post"){                 //若是post请求的话
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  //post请求中,更改请求头信息,模拟表单请求
            xhr.send(data);
        }else if(method=="get"){            //若是get请求的话
            xhr.send(null);
        }

        if(async){                          //若为异步
            xhr.onreadystatechange = function () {
                //http状态码为200时并且异步响应readyState为4，响应数据完毕
                if(xhr.status==200 && xhr.readyState==4){
                    obj.success && obj.success(xhr.responseText);   //成功请求信息的回调函数
                }else if(xhr.status!=200){                              //失败请求的回调函数
                    obj.error && obj.error();
                }else if(xhr.readyState==0){        //请求之前的回调函数
                    obj.before && obj.before();
                }else if(xhr.readyState==4){
                    obj.complete && obj.complete(); //请求完成之后的回调函数
                }
            };
        }else{                          //若为同步
            if(xhr.status==200){
                obj.success && obj.success(xhr.responseText);   //成功请求信息的回调函数
            }else{
                obj.error && obj.error();       //失败请求的回调函数
            }
        }

        /**
         * 将传入的数据参数进行格式化
         * @param data      对象参数
         * @returns {string}    返回格式化后的参数
         */
        function params(data){
            var arr = [];
            for(var i in data){
                arr.push(encodeURIComponent(i) + "=" + encodeURIComponent(data[i]));
            }
            return arr.join("&");
        }

    }

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