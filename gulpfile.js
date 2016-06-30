var gulp = require('gulp');
var _ = require('lodash');
var jshintConfig = require('./config/jshint.json');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jade = require('gulp-jade');
var connect = require('gulp-connect');
var browserify = require('gulp-browserify');

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

gulp.task( 'jade', function() {
    return gulp.src( $('dev.jade', '/**/*.jade') )
        .pipe( jade() )
        .pipe( gulp.dest( $('dist.html') ) );
});

// Lint Task
gulp.task('lint', function() {
    return gulp.src( $('dev.js', '/**/*.js') )
        .pipe( jshint( jshintConfig ) )
        .pipe( jshint.reporter('default') );
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src( $('dev.scss', '/**/*.scss') )
        .pipe( sass() )
        .pipe( gulp.dest( $('dist.css') ) );
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src( $('dev.js', '/**/*.js') )
        .pipe(browserify({
            insertGlobals: true,
            debug: false
		}))
        .pipe( concat( 'all.js' ) )
        .pipe( gulp.dest( $('dist.js') ) );
});

gulp.task('scripts-min', ['scripts'], function(){
    return gulp.src( $('dist.js', '/all.js') )
        .pipe( rename( 'all.min.js' ) )
        .pipe( uglify() )
        .pipe( gulp.dest( $('dist.js') ) );
});

gulp.task('copy', function() {
    gulp.src( $('dev.data') )
        .pipe( gulp.dest( $('dist.root') ) );
});

gulp.task('server', ['copy'], function() {
    return connect.server({
        root: $('dist.root'),
        livereload: true
    });
});

gulp.task('reload-server', function() {
    return gulp.src( $('dist.root', '/**/*.html') )
        .pipe( connect.reload() );
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch( $('dev.data'), ['copy'] );
    gulp.watch( $('dev.jade', '/**/*.jade'), ['jade'] );
    gulp.watch( $('dev.js', '/**/*.js'), ['lint', 'scripts'] );
    gulp.watch( $('dev.scss', '/**/*.scss'), ['sass'] );
    gulp.watch( $('dist.root', '/**/*.{js,html,css,json}'), ['reload-server'] );
});

// Default Task
gulp.task( 'default', ['lint', 'sass', 'scripts', 'scripts-min', 'jade'] );

gulp.task( 'dev', ['sass', 'scripts', 'jade', 'watch', 'server'] );
