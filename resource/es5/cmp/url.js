define("cmp/url",function(require,exports,module){
'use strict';

/**
     * url字符串转成对象
     * @param  {String} str url字符串=location.search
     * @return {Object}     url对象
     */
function urlParse(str) {
    if (typeof str !== 'string') {
        return {};
    }

    str = $.trim(str).replace(/^(\?|#|&)/, '');

    if (!str) {
        return {};
    }

    return str.split('&').reduce(function (ret, param) {
        var parts = param.replace(/\+/g, ' ').split('=');
        var key = parts[0];
        var val = parts[1];

        key = decodeURIComponent(key);

        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (!ret.hasOwnProperty(key)) {
            ret[key] = val;
        } else if (Array.isArray(ret[key])) {
            ret[key].push(val);
        } else {
            ret[key] = [ret[key], val];
        }

        return ret;
    }, {});
}
module.exports = {
    parse: urlParse
};
})