module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            options: {
                expr: true,
                node: true,
                strict: false
            },
            all: ['*.js', 'lib/*.js', 'middleware/*.js', 'views/*.js', 'models/*.js', 'routers/*.js']

        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
};
