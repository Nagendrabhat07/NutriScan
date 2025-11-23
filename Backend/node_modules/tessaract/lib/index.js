var _ = require('lodash')
  , Promise = require('bluebird')
  , async = require('async')
  , fs = require('fs')
  , jade = require('jade');

var read = function(directory, name, done) {
  fs.readFile(directory + '/' + name + '.html', 'utf8', done);
};

var load = function(paths, name, done) {
  var template = null;

  async.forEach(paths, function(path, next) {
    read(path, name, function(err, file) {

      if (!err && file && !template) {
        template = file;
        return done(null, file);
      }
      next();
    });

  }, done);
};

module.exports = function(paths) {
  if (_(paths).isArray() === false) paths = [ paths ];

  return function(name, data) {
    return new Promise(function(resolve, reject) {
      
      load(paths, name, function(err, template) {
        if (err) return reject(err);
        if (template == null) return resolve();

        try {
          var text = jade.compile(template)(data);
          return resolve(text);
        } catch(err) {
          return reject(err);
        }
      });
    });
  };
};
