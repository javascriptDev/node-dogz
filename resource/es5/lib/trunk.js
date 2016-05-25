! function(win, doc) {
    window.cache = {};
    var __defineQueue = [],
        cmtReg = /\/\*___meta___.*\*\//,
        LS = {
            isSupported: (function() {
                try {
                    if (!("localStorage" in window && window["localStorage"])) {
                        return false
                    }
                    localStorage.setItem("~_~", 1);
                    localStorage.removeItem("~_~")
                } catch (err) {
                    return false
                }
                return true
            })(),
            getItem: function(key) {
                try {
                    return localStorage.getItem(key)
                } catch (e) {}
            },
            setItem: function(key, val) {
                try {
                    localStorage.setItem(key, val)
                } catch (e) {}
            },
            removeItem: function(key) {
                try {
                    localStorage.removeItem(key)
                } catch (e) {}
            }
        },
        assets = {
            config: function(options) {
                var defaults = {
                        cacheKey: "rslist",
                        cachePrefix: "s~",
                        prefix: "zcm/posmis:",
                        isDev: false
                    },
                    override = false;
                util.extend(options, defaults, override);
                return this.config = options
            },
            resources: null,
            initialize: function() {
                var that = this,
                    config;
                if (util.isFunction(that.config)) {
                    this.config()
                }
                config = that.config;
                if (config.revision && LS.isSupported) {
                    that.resources = localStorage[config.cachePrefix + config.cacheKey];
                    if (that.resources) {
                        that.resources = JSON.parse(that.resources);
                        that._updateWholeCache()
                    } else {
                        that.resources = {}
                    }
                    try {
                        localStorage.setItem(config.cachePrefix + config.cacheKey, JSON.stringify(that.resources))
                    } catch (err) {
                        localStorage.clear();
                        that.resources = {}
                    }
                } else {
                    that.resources = {}
                }
            },
            _updateWholeCache: function() {
                var that = this,
                    config = that.config,
                    rses = that.resources,
                    rev = config.revision,
                    k, v, isFresh;
                for (k in rev) {
                    isFresh = rev.hasOwnProperty(k) && (rses.hasOwnProperty(k) && (v = rev[k]) === rses[k].v && localStorage[config.cachePrefix + k] && (localStorage[config.cachePrefix + k].length === rses[k].l));
                    if (!isFresh) {
                        rses[k] = undefined
                    }
                }
            },
            updateCachedItem: function(id, newStr) {
                if (!LS.isSupported) {
                    return false
                }
                var that = this,
                    resources = that.resources,
                    config = that.config,
                    resVersion = config.revision;
                resources[id] = {
                    v: (resVersion && resVersion[id]),
                    l: newStr.length
                };
                if (resources[id].v) {
                    LS.setItem(config.cachePrefix + id, newStr);
                    LS.setItem(config.cachePrefix + config.cacheKey, JSON.stringify(resources))
                }
            },
            getCachedItem: function(moduleInstance) {
                return LS.getItem(this.config.cachePrefix + moduleInstance.id)
            }
        },
        util = {
            id2Url: function(id, md5, prefix) {
                return (prefix || assets.config.prefix) + id + "@" + md5
            },
            geval: function(src, name) {
                try {
                    if (name) {
                        src += "\n //@ sourceURL=" + name
                    }
                    eval(src)
                } catch (e) {
                    console.log(e)
                }
            },
            isFunction: function(fun) {
                return Object.prototype.toString.call(fun) === "[object Function]"
            },
            rt: function(str, begin, end, news) {
                var result = "";
                if (!end) {
                    result = news
                } else {
                    result = [str.substr(0, begin), news, str.substr(end, str.length - begin)].join("")
                }
                return this.rm(result)
            },
            rm: function(str) {
                return !str ? "" : str.replace(cmtReg, "").replace(/\r\n/ig, "")
            },
            extend: function(target, source, override) {
                for (var k in source) {
                    if (k.indexOf(0) !== "_" && ((!override && !target[k]) || override)) {
                        target[k] = source[k]
                    }
                }
                return target
            },
            addScript: function(src) {
                var script = doc.createElement("script");
                script.src = MTVars.jsServer + src;
                doc.body.appendChild(script);
                return script
            }
        };

    function getCache(name) {
        return cache[name]
    }

    function _define(name, callback) {
        if (util.isFunction(name)) {
            callback = name
        }
        if (!cache[name]) {
            var module = {};
            callback.apply(null, [getCache, {},
                module
            ]);
            cache[name] = module.exports
        }
    }
    var require = {
        modules: [],
        _require: function(name, cb) {
            name = "es5/" + name;
            var me = this;
            if (!pageConfig) {
                return
            }
            var combo = pageConfig.combo,
                revision = pageConfig.revision,
                url = combo.url,
                deps = combo.deps,
                params = [];
            if ("dev" == MTVars.env) {
                name.indexOf(".js") == -1 && (name += ".js");
                var len = deps[name].length;
                if(len == 0){
                    util.addScript(name);
                    return;
                }
                deps[name].forEach(function(js) {
                    var script = util.addScript(js);
                    script.onload = script.onreadystatechange = function() {
                        len--;
                        if (len == 0) {
                            util.addScript(name)
                        }
                    }
                });
                return
            }
            if (util.isFunction(this.config)) {
                this.config(pageConfig)
            }
            if (util.isFunction(assets.config)) {
                assets.config(this.config);
                assets.initialize()
            }
            this.modules = deps[name].concat(name);
            this.modules.forEach(function(item) {
                if (!assets.resources[item]) {
                    params.push(util.id2Url(item, revision[item] || "", me.config.prefix))
                }
            });
            if (params.length == 0) {
                this.excute()
            } else {
                this._xhr(url + params.join(";"), this.excute)
            }
        },
        config: function(options) {
            return this.config = options
        },
        excute: function() {
            this.modules.forEach(function(mod) {
                util.geval(LS.getItem(assets.config.cachePrefix + mod))
            })
        },
        _xhr: function(url, cb) {
            var me = this,
                xhr = new XMLHttpRequest(),
                protocol = /^([\w]+:)\/\//.test(url) ? RegExp.$1 : window.location.protocol;
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && protocol === "file:")) {
                        xhr.onreadystatechange = null;
                        JSON.parse(xhr.responseText).forEach(function(mod) {
                            var name = mod.file;
                            mod.diff.forEach(function(diff) {
                                var txt = decodeURI(diff.content);
                                if (diff.end > 0) {
                                    util.rt(LS.getItem(assets.config.cachePrefix + name) || "", diff.start, diff.end, txt)
                                }
                                assets.updateCachedItem(name, util.rm(txt))
                            })
                        });
                        typeof cb == "function" && cb.call(me)
                    }
                }
            };
            xhr.send(null)
        }
    };
    win.require = function() {
        require._require.apply(require, arguments)
    };
    win.define = _define;
    win.define.cmd = true;
    win.trunk = {
        config: require.config
    }
}(window, document);