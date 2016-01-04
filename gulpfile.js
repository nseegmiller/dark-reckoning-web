// initialize all of our variables
var app, hostname, server;

//load all of our dependencies
//add more here if you want to include more libraries
var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var connect = require('connect');
var http = require('http');
var serveIndex = require('serve-index');
var serveStatic = require('serve-static');
var path = require('path');
var lr = require('tiny-lr');
var fs = require('fs');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-htmlmin');
var del = require('del');
var usemin = require('gulp-usemin');

//start our server
server = lr();

// Global config object
var config = {
    dirs: {
        app: 'app',
        dist: 'dist',
        tmp: '.tmp'
    },
    ports: {
        main: 9111,
        web: 9000,
        api: 8080
    }
};

////////////////////////////////////////////////////////////////////////////
// Tasks for running a local development server
////////////////////////////////////////////////////////////////////////////

// This starts the server that serves the static content
gulp.task('webserver', function () {
    hostname = null;
    //start up the server
    app = connect()
    // Serve files from /app
        .use(serveStatic(path.resolve(config.dirs.app)))
        // Serve the main.css that resides in /.tmp
        .use(serveStatic(path.resolve(config.dirs.tmp), {'dotfile': 'allow'}))
        // Serve the index.html
        .use(serveIndex(path.resolve(config.dirs.app)));
    http.createServer(app).listen(config.ports.web, hostname);
});

// This will do a sass compile and concat of our scss files when they change
gulp.task('styles', function () {
    return gulp.src('app/**/*.scss')
        // Do the sass compile and make sure we don't fail on errors
        .pipe(sass().on('error', sass.logError))
        // Concat into a single css file
        .pipe(concat('app.css'))
        //catch errors
        .on('error', gutil.log)
        // Put main.css in the .tmp folder
        .pipe(gulp.dest('.tmp'))
        // Notify LiveReload to refresh
        .pipe(livereload());
});

////////////////////////////////////////////////////////////////////////////
// Tasks used for builds/deploys
////////////////////////////////////////////////////////////////////////////

// This task compresses and copies all the images
gulp.task('images-deploy', function () {
    return gulp.src(['app/img/**/*'])
        .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
        .pipe(gulp.dest('dist/img'));
});

// This task copies all the videos
//TODO: Is there a way to compress video with gulp?
gulp.task('video-deploy', function() {
    return gulp.src(['app/video/**/*'])
        .pipe(gulp.dest('dist/video'));
});

// This task does a sass compile, concatenation, minification, and copy for deployment
gulp.task('styles-deploy', function () {
    return gulp.src('app/styles/**/*.scss')
        // Do the sass compile and make sure we don't fail on errors
        .pipe(sass())
        // Concat into a single css file
        .pipe(concat('main.css'))
        .pipe(minifyCSS())
        // Where to save our final, compressed css file
        .pipe(gulp.dest('dist'));
});

// This task copies our html files over for deployment
gulp.task('minify-and-copy-html', function () {
    return gulp.src('app/**/*.html')
        .pipe(minifyHTML())
        .pipe(gulp.dest('dist'));
});

// This task will minify the HTML, copy it, and do the individual js replacements
gulp.task('html-deploy', ['minify-and-copy-html'], function() {
    gulp.src('app/index.html')
        // usemin replaces the individual script includes in
        // index.html with the single scripts.js include
        .pipe(usemin({
            html: [minifyHTML()],
            js: [uglify()]
        }))
        .pipe(gulp.dest('dist'));
});

// This task copies all of our required static files over
gulp.task('files-deploy', function() {
    gulp.src([
            'app/views/*.txt',
            'app/*.{png,ico,txt}',
        ], {'base': 'app'})
        .pipe(gulp.dest('dist'));
});

////////////////////////////////////////////////////////////////////////////
// Shared, general purpose tasks
////////////////////////////////////////////////////////////////////////////

// This task cleans our dist and .tmp directories
gulp.task('clean', function () {
    return del(['.tmp/**/*', 'dist/**/*']);
});

// This is the default task. It starts a server for development
// purposes with all files being watched for live reload purposes
gulp.task('default', [], function () {
    gulp.start('webserver', 'styles');
    livereload.listen();
    // Watch these files and reload if any of them change
    gulp.watch(config.dirs.app + '/**/*.{html,jpg,js,jpeg,gif,png,woff,ttf,svg}').on('change', function(file) {
        livereload.changed(file.path);
    });
    gulp.watch('app/**/*.scss', ['styles']);
    // Uncomment the next line to turn back on the JavaScript linter with every js update
    // gulp.watch('app/**/*.js', ['jshint']);
});

// This is an alias for the default server task to ease t
gulp.task('server', ['default']);

//this is our deployment task, it will set everything for deployment-ready files
gulp.task('build', ['clean'], function () {
    gulp.start('styles-deploy', 'html-deploy', 'images-deploy', 'video-deploy', 'files-deploy');
});