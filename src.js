var through = require('through2');
var supplant = require('./supplant.js');
var vfs = require('vinyl-fs');
var path = require('path');

function prependPath (dep) {
    return function (str) {
        return path.join(dep.path, str);
    };
}

function src (glob, options) {
    if (!isValidGlob(glob)) {
        throw new Error('Invalid glob argument: ' + glob);
    }

    if (typeof glob === 'string') { glob = [ glob ]; }

    function findFile (dep, enc, cb) {
        var newGlobs = glob
            .map(supplant(dep))
            .map(prependPath(dep));

        vfs.src(newGlobs, options)
            .on('data', this.push.bind(this))
            .on('error', cb)
            .on('end', cb);
    }

    return through.obj(findFile);
}

function isValidGlob(glob) {
    if (typeof glob === 'string') {
        return true;
    }
    if (Array.isArray(glob) && glob.length !== 0) {
        return true;
    }
    return false;
}

module.exports = src;