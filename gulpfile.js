var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var _ = require('underscore');
var transform = require('vinyl-transform');
var concat = require('gulp-concat');

var Graft = require('./graftfile.js');
var jadeify2 = require('jadeify2');
var wrapTransform = require('./lib/wrap.transform');
var browserify = require('gulp-browserify');


function makeRelative(file) {
    var rel = path.relative(process.cwd(), file);
    return (/^\./).test(rel) ? rel : './' + rel;
}

var jadeTransFn = _.wrap(jadeify2, function(fn, file, options) {
    return fn(file, {
        client: true,
        filename: makeRelative(file),
        compileDebug: false });
});

gulp.task('default', function(){
    var history = [];

    gulp.src('./vendor.js', {read: false})
        .pipe(bundle('vendor'))
        .pipe(gulp.dest('./build/js'));

    console.log(JSON.stringify(Graft.systems, null, 2));


    var sys = Graft.systems.Model;
    var glob = _(sys.directories).map(function(d) { return d + '/*.js';});

    gulp.src(glob)
        .pipe(transform(wrapTransform.through))
        .pipe(concat('models.js'))
        .pipe(gulp.dest('./build/js'));

    function bundle(name) {
        var pipe = browserify()
            .on('prebundle', prebundle)
            .on('postbundle', postbundle);

        return pipe;

        function prebundle(bundle) {
            _(Graft.bundles[name]).each(req);
            function req(v) {
                bundle.require(v);
                history.push(v);
            }
        }
        function postbundle(bundle) {
            console.log(history);
        }
    }
});
