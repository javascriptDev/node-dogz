"use strict";
const through2 = require('through2');
const path = require('path');
const sep = path.sep;
module.exports = function() {
    return through2.obj(function(file, encoding, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }
        if (file.isStream()) {
            return cb(new PluginError('gulp-amd', 'Streaming not supported'));
        }
        let fileStr = file.contents.toString(encoding);
        file.contents = new Buffer(`;!function(){${fileStr}}()`);
        cb(null, file)
    })
}