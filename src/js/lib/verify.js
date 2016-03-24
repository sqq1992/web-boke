/**
 * input的校验插件
 */
;
(function ($) {

    var Verify = (function ($) {
        var Verify = function (element) {
            this.element = element;     //总的form节点
            //配置基本信息
            this._init();
        };
        Verify.prototype = {
            construct:Verify,
            //配置基本信息
            _init:function(){
                this.userName = this.element.form("userName");

            }
        };

        return Verify;
    })($);

    //插件绑定在类库的实例化中
    $.fn('Verify', function (){
        return this.each(function () {
            var instance = new Verify($(this));   //执行插件实例化
        });
    });

    //默认配置参数
    $.fn.VerifyDefaults = {

    };

})($);