var a = require('./createManifest');
var fs = require('fs');

function getFiles(dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

function format(data, filter) {
    "use strict";
    var str = '';
    data.forEach(function (item) {
        item = item.replace(filter, 'monecjs/');
        item = item.replace('.ts', '.js');
        str += str == '' ? item : '\n' + item;
    });
    return str;
}

module.exports = function (root, main) {

    var arr = getFiles(root);

    var dep = a.getModuleReferenceInfo(arr).referenceInfoList;

    var all = Object.keys(dep).length;

    var deps = [];

    dep[main].forEach(function (item) {
        deps.push(item);
    })

    var findout = {};

    function cur() {
        all--;
        for (var i = 0, len = deps.length; i < len; i++) {
            if (dep[deps[i]] && dep[deps[i]].length > 0 && !findout[deps[i]]) {
                findout[deps[i]] = 1;
                dep[deps[i]].forEach(function (item) {
                    deps.splice(i, 0, item);
                })
            }
        }
        if (all > 0) {
            cur()
        }
    }

    cur();
    var result = [];
    deps.forEach(function (item) {
        result.indexOf(item) == -1 && result.push(item);
    });

    return result.map(function (item) {
        return item.replace('.ts', '.js')
    });
}


