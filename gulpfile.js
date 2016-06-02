var gulp = require('gulp');
var _ = require('lodash');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jade = require('gulp-jade');

var $ = (function(){
    var folders = {
        dev: {
            js: 'public/js'
            ,sass: 'public/stylesheets'
            ,jade: 'templates'
        }
        ,dist: {
            js: 'build/js'
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
        .pipe( jshint() )
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
        .pipe( concat( 'all.js' ) )
        .pipe( gulp.dest( $('dist.js') ) )
        .pipe( rename( 'all.min.js' ) )
        .pipe( uglify() )
        .pipe( gulp.dest( $('dist.js') ) );
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch( $('dev.js', '/**/*.js'), ['lint', 'scripts'] );
    gulp.watch( $('dev.scss', '/**/*.scss'), ['sass'] );
});

// Default Task
gulp.task( 'default', ['lint', 'sass', 'scripts', 'watch'] );
