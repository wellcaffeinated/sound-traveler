var gulp = require('gulp');
var _ = require('lodash');
var jshintConfig = require('./config/jshint.json');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var monkberrify = require('monkberrify');
var babelify = require('babelify');
var gutil = require("gulp-util");
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./webpack.config.js");

// var sourcemaps = require('gulp-sourcemaps');


var $ = (function(){
    var folders = {
        dev: {
            data: 'public/features.json'
            ,js: 'public/js'
            ,scss: 'public/stylesheets'
            ,jade: 'templates'
        }
        ,dist: {
            root: 'build'
            ,js: 'build/js'
            ,css: 'build/css'
            ,html: 'build'
        }
    };

    return function folder( name, append ){
        var pfx = _.result( folders, name );

        if ( !pfx ){
            throw new Error('Folder "'+name+'" not configured');
        }

        return pfx + (append || '');
    };
})();

// Lint Task
gulp.task('lint', function() {
    return gulp.src( $('dev.js', '/**/*.js') )
        .pipe( jshint( jshintConfig ) )
        .pipe( jshint.reporter('default') );
});
//
// // Compile Our Sass
// gulp.task('sass', function() {
//     return gulp.src( $('dev.scss', '/**/*.scss') )
//         .pipe( sass() )
//         .pipe( gulp.dest( $('dist.css') ) );
// });
//
// // Concatenate & Minify JS
// gulp.task('scripts', function() {
//
//     var options = {
//         insertGlobals: true,
//         debug: true
//     };
//
//     var b = browserify( $('dist.js', '/all.js'), options );
//     b.transform( monkberrify );
//     b.transform( babelify, { presets: ['es2015'] } );
//     b.bundle()
//         .pipe( source( $('dist.js', '/all.js') ) )
//         .pipe( buffer() )
//         .pipe( concat( 'all.js' ) )
//         .pipe( gulp.dest( $('dist.js') ) );
//
//     // return gulp.src( $('dev.js', '/**/*.js') )
//     //     // .pipe(sourcemaps.init())
//     //     .pipe( browserified )
//     //     .pipe( concat( 'all.js' ) )
//     //     // .pipe( sourcemaps.write( $('dist.js') ) )
//     //     .pipe( gulp.dest( $('dist.js') ) );
// });
//
// gulp.task('scripts-min', ['scripts'], function(){
//     return gulp.src( $('dist.js', '/all.js') )
//         .pipe( rename( 'all.min.js' ) )
//         .pipe( uglify() )
//         .pipe( gulp.dest( $('dist.js') ) );
// });
//
// gulp.task('copy', function() {
//     gulp.src( $('dev.data') )
//         .pipe( gulp.dest( $('dist.root') ) );
// });
//
// gulp.task('server', ['copy'], function() {
//     return connect.server({
//         root: $('dist.root'),
//         livereload: true
//     });
// });
//
// gulp.task('reload-server', function() {
//     return gulp.src( $('dist.root', '/**/*.html') )
//         .pipe( connect.reload() );
// });
//
// // Watch Files For Changes
// gulp.task('watch', function() {
//     gulp.watch( $('dev.data'), ['copy'] );
//     gulp.watch( $('dev.jade', '/**/*.jade'), ['jade'] );
//     gulp.watch( $('dev.js', '/**/*.{js,monk}'), ['lint', 'scripts'] );
//     gulp.watch( $('dev.scss', '/**/*.scss'), ['sass'] );
//     gulp.watch( $('dist.root', '/**/*.{js,html,monk,css,json}'), ['reload-server'] );
// });

// Webpack
gulp.task('webpack:build', function(callback) {
	// modify some webpack config options
	var myConfig = Object.create(webpackConfig);
	myConfig.plugins = myConfig.plugins.concat(
		new webpack.DefinePlugin({
			'process.env': {
				// This has effect on the react lib size
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	);

	// run webpack
	webpack(myConfig, function(err, stats) {
		if (err) {
            throw new gutil.PluginError('webpack:build', err);
        }
		gutil.log('[webpack:build]', stats.toString({
			colors: true
		}));
		callback();
	});
});

// create a single instance of the compiler to allow caching
gulp.task('webpack-dev-server', function(callback) {
	// modify some webpack config options
	var myConfig = Object.create(webpackConfig);
    myConfig.entry.map.unshift("webpack-dev-server/client?http://localhost:8080/");
	myConfig.debug = true;

	// Start a webpack-dev-server
	new WebpackDevServer(webpack(myConfig), {
		// publicPath: '/' + myConfig.output.publicPath,
		stats: {
			colors: true
		},
        contentBase: $('dist.root')
	}).listen(8080, 'localhost', function(err) {
		if (err) {
            throw new gutil.PluginError('webpack-dev-server', err);
        }
		gutil.log('[webpack-dev-server]', 'http://localhost:8080');
	});
});


// Default Task
gulp.task( 'default', ['lint', 'sass', 'scripts', 'scripts-min', 'jade'] );

gulp.task( 'dev', ['sass', 'scripts', 'jade', 'watch', 'server'] );

gulp.task( 'dev-wp', ['webpack-dev-server'] );
gulp.task( 'build', ['webpack:build'] );
