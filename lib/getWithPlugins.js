var isFunction = require("lodash/isFunction");
var isString = require("lodash/isString");
var isPlainObject = require("lodash/isPlainObject");


module.exports = function(grunt) {

	// Get options from this.data
	function getWithPlugins(ns) {
		var obj = grunt.config(ns) || {};

		if (obj.plugins) {

			// getRaw must be used or grunt.config will clobber the types (i.e.
			// the array won't a BannerPlugin, it will contain an Object)
			obj.plugins = fixPlugins(grunt.config.getRaw(ns.concat(["plugins"])));
		}

		return obj;
	}

	function fixPlugins(plugins) {

		// See https://github.com/webpack/grunt-webpack/pull/9
		var fixPlugin = function(plugin) {
			if (isFunction(plugin)) {
				return plugin;
			}

			// Operate on a copy of the plugin, since the webpack task
			// can be called multiple times for one instance of a plugin
			function processConfigDeep(obj) {
				var instance = Object.create(obj);
				Object.keys(obj).forEach(function(key) {
					var val = obj[key];
					instance[key] = isPlainObject(val)
						? processConfigDeep(val)
						: isString(val)
						    ? grunt.template.process(val)
						    : val;
				});
				return instance;
			}

			return processConfigDeep(plugin);
		};

		return plugins.map(fixPlugin);
	}

	return getWithPlugins;
};
