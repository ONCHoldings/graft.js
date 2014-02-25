var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var _ = require('underscore');
var debug = require('gulp-debug');
var transform = require('vinyl-transform');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var glob = require('glob');

var Graft = require('./graftfile.js');
var wrapTransform = require('./lib/wrap.transform');
var jade = require('gulp-jade');
var browserify = require('browserify');

gulp.task('default', function(){
    var vendorBundle = browserify({
        exposeAll: true
    });

    loadDeps(vendorBundle, Graft.bundles.vendor);

    function loadDeps(bundle, deps) {
        _(deps).each(reqFn);
        function reqFn(v) { bundle.require(v); }
    }

    vendorBundle.bundle()
        .pipe(source('vendor.js'))
        .pipe(gulp.dest('./build/js'));


    var modelBundle = browserify({
        exposeAll: true,
        transform: [wrapTransform.through]
    });
    modelBundle.external(vendorBundle);

    var dirs = Graft.systems.Model.directories;
    var files = _(dirs).chain().map(getGlob).flatten().value();

    loadDeps(modelBundle,files);

    console.log(files);
    function getGlob(d) {
        var g = makeGlob('js')(d);
        return glob.sync(g, {cwd: Graft.__graftPath}) ;
    }

    modelBundle.bundle()
        .pipe(source('models.js'))
        .pipe(gulp.dest('./build/js'));

    function loadDirs(dirs) {
        return function(bundle) {
            console.trace();
            var files = _(dirs).map(getGlob);
            console.log(files);
        };
        function getGlob(d) {
            var g = makeGlob('js')(d);
            return glob.sync(path.basename(g), { cwd: path.dirname(g) });
        }
    }

    function external(extBundle) {
        return function(bundle) {
            console.trace();
            console.log(bundle);
            bundle.external(extBundle);
        };
    }
/* 
    var sys = Graft.systems.Model;

    var glob = _(sys.directories).map(makeGlob('js'));

    var models  = browserify();
    models.external(vendor);

    gulp.src(glob)
        .pipe(transform(wrapTransform.through))
        .pipe(models)
        .pipe(concat('models.js'))
        .pipe(gulp.dest('./build/js'));


    var templates = 
    var tdirs = Graft.systems.Template.directories;
    var tglob = _(tdirs).map(makeGlob('jade'));

    gulp.src(tglob)
        .pipe(jade({ client: true }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./build/js'));


    gulp.src(glob)
        .pipe(transform(wrapTransform.through))
        .pipe(bundle('models'))
        .pipe(concat('models.js'))
        .pipe(gulp.dest('./build/js'));
*/
    function loadDeps(bundle, deps) {
        _(deps).each(reqFn);
        function reqFn(v) { bundle.require(v); }
    }
    function makeGlob(extension) {
        return function(d) { return d + '/*.' + extension; };
    }
});
