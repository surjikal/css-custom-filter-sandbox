
utils = require './grunt-utils'

NPM_TASKS = [
    'grunt-coffee'
    'grunt-compass'
    'grunt-contrib-copy'
    'grunt-contrib-clean'
    'grunt-jade'
]

TASKS = [
    'grunt-connect'
    'grunt-config-context'
]


module.exports = (grunt) ->

    _ = grunt.utils._


    NPM_TASKS.forEach (task) ->
        grunt.loadNpmTasks task


    TASKS.forEach (task) ->
        utils.loadTask grunt, './grunt-tasks', task


    # Should be called init tasks... it would make more sense.
    grunt.initConfig

        config:
            build_directory: 'build'
            tmp_directory:   'tmp'


        # Remove some directories
        clean:
            build_directory: '<%= config.build_directory %>'
            tmp_directory:   '<%= config.tmp_directory   %>'


        # Compile the coffee files
        coffee:
            app:
                src:  'src/scripts/app/**/*.coffee'
                dest: '<%= config.build_directory %>/assets/js/app'
                options:
                    base_path: 'src/scripts/app'
                    preserve_dirs: true
                    bare: false


        # Compile the jade files
        jade:
            app:
                # FIXME: Can't get folder exclusion syntax to work...
                src:  'src/jade/**/*.jade'
                dest: '<%= config.build_directory %>'
                options:
                    client: false
                    pretty: true
                    compileDebug: true


        # Copy some assets...
        copy:
            #css_libs:
            #   files: '<%= config.build_directory %>/assets/css/libs/': 'src/styles/libs/**'
            js_libs:
                files: '<%= config.build_directory %>/assets/js/libs/': 'src/scripts/libs/**'
            #images:
            #    files: '<%= config.build_directory %>/assets/images/': 'src/images/**'
            raw_files:
                files: '<%= config.build_directory %>/assets/files/': 'src/files/**'



        # CSS Compass compilation
        compass:
            dev:
                src: 'src/styles'
                dest: '<%= config.build_directory %>/assets/css'
                images: 'src/images'
                fonts: 'src/fonts'
                relativeassets: true
                linecomments: true
                # This should enable source maps for sass, but it doesn't work for me.
                # debugsass: true
                # outputstyle: 'nested'


        # Create HTTP Server on a directory
        connect:
            debug: true
            port: 8000
            base: ->
                grunt.config.get 'config.build_directory'


        # Rebuild everything when something changes
        watch:
            files: [
                'grunt.coffee'
                'grunt.js'
                'src/**/*'
            ]
            tasks: 'build'


    utils.registerGruntTask grunt, 'build', [
        'clean:build_directory'
        'coffee'
        'jade'
        'compass'
        'copy'
        'clean:tmp_directory'
    ]

    utils.registerGruntTask grunt, 'run', [
        'default'
        'connect'
        'watch'
    ]

    utils.registerGruntTask grunt, 'default', [
        'build'
    ]
