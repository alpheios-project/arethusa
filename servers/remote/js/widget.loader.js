(function($) {
    $.getStylesheet = function (href) {
        var $d = $.Deferred();
        var $link = $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: href
        }).appendTo('head');
        $d.resolve($link);
        return $d.promise();
    };
})(jQuery);

function loadArethusaWidget (id,url,conf,deps) {
    widget = {};
    $.when(
        $.getStylesheet(deps.css.arethusa), //arethusa.min.css
        $.getStylesheet(deps.css.foundation), //vendor/foundation-icons/foundation-icons.css
        $.getStylesheet(deps.css.font_awesome), //vendor/font-awesome-4.1.0/css/font-awesome.min.css
        $.getStylesheet(deps.css.colorpicker), //vendor/angular-foundation-colorpicker/css/colorpicker.css
        $.getScript(deps.js.packages, function(){$.when(
            $.getScript(deps.js.arethusa) //arethusa.min.js
        ).then(function () {
            widget = new Arethusa();
            widget.on(id).from(url).with(conf);//.start();
        })}) //arethusa_packages.min.js
    )
    return widget;
}