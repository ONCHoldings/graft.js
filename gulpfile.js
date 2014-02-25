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
var jadeify2 = require('jadeify2');
var browserify = require('browserify');

function vendorBundle() {
    var bundle = browserify({ exposeAll: true });

    loadDeps(bundle, Graft.bundles.vendor);

    bundle.bundle()
        .pipe(source('vendor.js'))
        .pipe(gulp.dest('./build/js'));

    return bundle;
}

function templateBundle(bundles) {
    var bundle = browserify({ exposeAll: true });
    
    bundle.transform('jadeify');

    var dirs = Graft.systems.Template.directories;
    loadDeps(bundle, getFiles(dirs, 'jade'));

    bundle.bundle()
        .pipe(source('template.js'))
        .pipe(gulp.dest('./build/js'));

    return bundle;

}

function shareBundle(bundles) {
    var bundle = browserify({ exposeAll: true });


    bundle.external(bundles.vendor);
    bundle.external(bundles.template);

    loadDeps(bundle, Graft.bundles.shared);

    bundle.bundle()
        .pipe(source('shared.js'))
        .pipe(gulp.dest('./build/js'));

    return bundle;
}

function modelBundle(bundles) {
    var bundle = browserify({ exposeAll: true  });

    bundle.transform(wrapTransform.through);

    bundle.external(bundles.vendor);
    bundle.external(bundles.template);
    bundle.external(bundles.share);

    var dirs = Graft.systems.Model.directories;

    loadDeps(bundle, getFiles(dirs));

    bundle.bundle()
        .pipe(source('models.js'))
        .pipe(gulp.dest('./build/js'));

    return bundle;
}

function viewBundle(bundles) {
    var bundle = browserify({ exposeAll: true  });

    bundle.transform(wrapTransform.through);

    bundle.external(bundles.vendor);
    bundle.external(bundles.template);
    bundle.external(bundles.share);
    bundle.external(bundles.model);

    var dirs = Graft.systems.View.directories;

    loadDeps(bundle, getFiles(dirs));

    bundle.bundle()
        .pipe(source('views.js'))
        .pipe(gulp.dest('./build/js'));

    return bundle;
}

function routerBundle(bundles) {
    var bundle = browserify({ exposeAll: true  });

    bundle.transform(wrapTransform.through);

    bundle.external(bundles.vendor);
    bundle.external(bundles.template);
    bundle.external(bundles.share);
    bundle.external(bundles.model);
    bundle.external(bundles.view);

    var dirs = Graft.systems.Router.directories;

    loadDeps(bundle, getFiles(dirs));

    bundle.bundle()
        .pipe(source('router.js'))
        .pipe(gulp.dest('./build/js'));

    return bundle;
}

function entryPoint(bundles) {
    var bundle = browserify();

    bundle.external(bundles.vendor);
    bundle.external(bundles.template);
    bundle.external(bundles.share);
    bundle.external(bundles.model);
    bundle.external(bundles.view);
    bundle.external(bundles.router);
    
    bundle.bundle()
        .pipe(source('client.js'))
        .pipe(gulp.dest('./build/js'));

    return bundle;
}


gulp.task('default', function(){
    var bundles      = {};
    bundles.vendor   = vendorBundle();
    bundles.template = templateBundle(bundles);
    bundles.share    = shareBundle(bundles);
    bundles.model    = modelBundle(bundles);
    bundles.view     = viewBundle(bundles);
    bundles.router   = routerBundle(bundles);
   
    bundles.entry    = entryPoint(bundles);
});

function getFiles(dirs, ext) {
    return _(dirs).chain()
    .map(getGlob)
    .flatten()
    .value();
    function getGlob(d) {
        var g = makeGlob(ext || 'js')(d);
        return glob.sync(g, {cwd: Graft.__graftPath}) ;
    }

    function makeGlob(extension) {
        return function(d) { return d + '/*.' + extension; };
    }

}

function loadDeps(bundle, deps) {
    _(deps).each(reqFn);
    function reqFn(v, k) {
        console.log(v, k);
        bundle.require(v, { expose: true });
    }
}


module.exports = gulp;
