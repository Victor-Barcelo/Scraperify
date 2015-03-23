'use strict';

var browserify = require('browserify'),
    gulp = require('gulp'),
    transform = require('vinyl-transform'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    gulpif = require('gulp-if'),
    del = require('del'),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass'),
    changed = require('gulp-changed'),
    minifyCSS = require('gulp-minify-css'),
    runSequence = require('run-sequence'),
    imagemin = require('gulp-imagemin'),
    size = require('gulp-size'),
    gutil = require('gulp-util'),
    mocha = require('gulp-mocha'),
    fs = require('fs'),
    yargs = require('yargs'),
    browserSync = require('browser-sync'),
    ftp = require('vinyl-ftp'),
    ngannotate = require('gulp-ng-annotate');

var config = require('./gulpUserConfig.json');

var env = yargs.argv.env || 'env';

var gulpSSH = require('gulp-ssh')({
    ignoreErrors: false,
    sshConfig: {
        host: config.ssh.host,
        port: config.ssh.port,
        username: config.ssh.username,
        passphrase: config.ssh.passphrase,
        privateKey: require('fs').readFileSync(config.ssh.privateKeyPath)
    }
});

console.log('Enviroment: ' + env);

gulp.task('default', ['build:dev']);

gulp.task('test', function () {
    console.log(config.ftp.remoteSSHPath);
});

//---- Assorted
gulp.task('js', function () {
    return gulp.src(['./src/js/**/*.js'], {base: './src/js'})
        .pipe(ngannotate())
        .pipe(uglify())
        .pipe(gulpif(env === 'dev', sourcemaps.init({loadMaps: true})))
        .pipe(gulpif(env === 'dev', sourcemaps.write('./')))
        .pipe(gulp.dest('./build/js'));
});

gulp.task('html', function () {
    return gulp.src(['./src/*.html', './src/views/*.html'], {base: './src'})
        .pipe(gulpif(env === 'prod', htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('./build'));
});

gulp.task('sass', function () {
    return gulp.src('./src/scss/*.scss')
        .pipe(changed('./build/css'))
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(gulp.dest('./build/css'));
});

gulp.task('images', function () {
    return gulp.src('./src/images/**/*.{jpg,jpeg,png,gif}')
        .pipe(changed('./build/images'))
        .pipe(imagemin())
        .pipe(gulp.dest('./build/images'))
        .pipe(size());
});

gulp.task('clean', function (cb) {
    del(['./build/*', '!./build/api'], cb);
});

//---- Watch & Browsersync
gulp.task('watch', function () {
    gulp.watch('./src/js/**/*.js', ['js']);
    gulp.watch('./src/images/*', ['images']);
    gulp.watch('./src/scss/*.scss', ['sass']);
    gulp.watch(['src/*.html', 'src/views/*.html'], ['html']);
});

gulp.task('browser-sync', function () {
    var files = [
        './build/index.html',
        './build/views/*.html',
        './build/js/**/*.js',
        './build/css/*.css',
        './src/images/*'
    ];

    browserSync.init(files, {
        server: {
            baseDir: './build'
        }
    });
});

//---- Build
gulp.task('build:dev', function () {
    env = 'dev';
    runSequence('clean',
        ['html', 'js', 'sass', 'images']
    );
});
gulp.task('build:prod', function () {
    env = 'prod';
    runSequence('clean',
        ['html', 'js', 'sass', 'images']
    );
});

//----Deploy
gulp.task('deploy:run', function () {
    runSequence('build:prod', 'deploy:clean', 'deploy:uploadAll', 'deploy:uploadConfigs', 'deploy:copyConfigs', 'deploy:runComposer');
});

gulp.task('deploy:clean', function () {
    return gulpSSH
        .shell(['cd ' + config.ftp.remoteSSHPath, 'rm -rf *'])
        .pipe(gutil.noop());
});

gulp.task('deploy:uploadAll', function () {
    var conn = ftp.create({
        host: config.ftp.host,
        user: config.ftp.user,
        password: config.ftp.pass,
        parallel: 1,
        log: gutil.log
    });

    var globs = [
        'build/**/*',
        '!build/api/app/logs/**/*',
        '!build/api/bin/**/*',
        '!build/api/app/cache/**/*',
        '!build/api/vendor/**/*',
        '!build/api/web/bundles/**/*',
        '!build/api/app/config/routing.yml',
        '!build/js/constants.js'
    ];

    return gulp.src(globs, {base: './build', buffer: false})
        .pipe(conn.newer('/')) // only upload newer files
        .pipe(conn.dest('/'));
});

gulp.task('deploy:uploadConfigs', function () {
    var conn = ftp.create({
        host: config.ftp.host,
        user: config.ftp.user,
        password: config.ftp.pass,
        parallel: 1,
        log: gutil.log
    });

    var globs = [
        'deployConfigs/routing.yml',
        'deployConfigs/constants.js',
        'deployConfigs/.htaccess'
    ];

    return gulp.src(globs, {base: './deploy_configs', buffer: false})
        .pipe(conn.newer('/')) // only upload newer files
        .pipe(conn.dest('/deployConfigs'));
});

gulp.task('deploy:copyConfigs', function () {
    return gulpSSH
        .shell(['cd ' + config.ftp.remoteSSHPath, 'cp deployConfigs/constants.js js/', 'cp deployConfigs/.htaccess api/'])
        .pipe(gutil.noop());
});

gulp.task('deploy:runComposer', function () {
    return gulpSSH
        .shell(['cd '+ config.ftp.remoteSSHPath, 'export SYMFONY_ENV=prod', 'cd api', 'php composer.phar install --no-dev --optimize-autoloader', 'php app/console cache:clear --env=prod --no-debug'])
        .pipe(gutil.noop());
});