var gulp        = require('gulp'),
	 watch       = require('gulp-watch'),
	 sass        = require('gulp-sass'),
	 sourcemaps  = require('gulp-sourcemaps'),
	 del         = require('del'),
	 prefixer    = require('gulp-autoprefixer'),
	 csscomb     = require('gulp-csscomb'),
	 csso        = require('gulp-csso'),
	 imagemin    = require('gulp-imagemin'),
	 rename      = require('gulp-rename'),
	 pngquant    = require('imagemin-pngquant'),
	 spritesmith = require('gulp.spritesmith'),
	 browserSync = require('browser-sync'),
	 reload      = browserSync.reload;

var config = {
    server: {
        baseDir: "dist"
    },
    tunnel: true,
    host: 'localhost',
    port: 3000,
    logPrefix: "Frontend_Devil"
};

gulp.task('buildHtml', function() {
	return gulp.src('src/*.html')
			 .pipe(gulp.dest('dist'))
			 .pipe(reload({stream: true}))
});

gulp.task('buildCss', function() {
	return gulp.src('src/styles/*.scss')
			 .pipe(sourcemaps.init())
			 .pipe(sass())
			 .pipe(prefixer({
            browsers: ['last 3 versions'],
            cascade: false
        	 }))
			 .pipe(csscomb())
			 .pipe(sourcemaps.write())
			 .pipe(gulp.dest('dist/styles'))
			 .pipe(reload({stream: true}))
});

gulp.task('buildImage', function() {
	return gulp.src('src/img/*.*')
			 .pipe(imagemin([
			 	imagemin.gifsicle({interlaced: true}),
			   imagemin.jpegtran({progressive: true}),
			   imagemin.optipng({
			   	plugins: [
			   		pngquant()
			   	]
			   }),
			   imagemin.svgo({
			      plugins: [
			         {removeViewBox: true}
			      ]
			   })
			 ]))
			 .pipe(gulp.dest('dist/img'))
			 .pipe(reload({stream: true}))
});

gulp.task('buildFonts', function() {
	return gulp.src('src/fonts/**/*.*')
			 .pipe(gulp.dest('dist/fonts'))
});

gulp.task('buildSprites', function() {
	var spriteData =
		gulp.src('src/img/sprites/*.*')
		.pipe(spritesmith({
			imgName: 'sprite.png',
	    	cssName: '_sprite.scss',
	    	algorithm: 'binary-tree'
		}));

	spriteData.img.pipe(gulp.dest('dist/img'))

	spriteData.css.pipe(gulp.dest('dist/styles'))

	.pipe(reload({stream: true}))

	return spriteData
});

gulp.task('buildLibsCss', function() {
	return gulp.src('src/styles/libs/*.*')
			.pipe(csso())
			.pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest('dist/styles/libs'))
			.pipe(reload({stream: true}))
});

gulp.task('build', gulp.parallel('buildHtml', 'buildCss', 'buildImage', 'buildFonts', 'buildSprites', 'buildLibsCss'));

gulp.task('watch', function() {
	gulp.watch('src/*.html', gulp.parallel('buildHtml'));
	gulp.watch('src/styles/*.scss', gulp.parallel('buildCss'));
	gulp.watch('src/img/*.*', gulp.parallel('buildImage'));
	gulp.watch('src/fonts/**/*.*', gulp.parallel('buildFonts'));
	gulp.watch('src/img/sprites/*.*', gulp.parallel('buildSprites'));
	gulp.watch('src/styles/libs/*.*', gulp.parallel('buildLibsCss'));
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function(cb) {
	del('dist');
	cb();
});

gulp.task('default', gulp.parallel('build', 'webserver', 'watch'));