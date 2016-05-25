"use strict";

const through2   = require('through2');
const path       = require('path');
const sep        = path.sep;
module.exports = function(){
  return through2.obj(function(file,encoding,cb){
     if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError('gulp-cmd', 'Streaming not supported'));
    }

    let fpath = file.path;
    let fileStr = file.contents.toString(encoding);
    let result  = '';
    let obj     = path.parse(fpath);

    let moduleName = obj.dir.split(`${sep}es6${sep}`)[1] +'/'+obj.name;
    file.contents = new Buffer('define('+ ( moduleName ? ('"' +moduleName + '",' ) : '' ) + 'function(require,exports,module){\r\n'+fileStr+'\r\n})');
    cb(null,file)

  })
}