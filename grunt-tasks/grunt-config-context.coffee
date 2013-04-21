
module.exports = (grunt) ->

    utils = require '../grunt-utils'

    getGruntConfig = (grunt, configs) ->
        config = utils.resolveGruntConfig grunt, configs
        config.build_directory ?= 'build' # setting default otherwise bad things could happen, like deleting /
        config.tmp_directory   ?= 'tmp'
        config

    grunt.registerMultiTask 'configContext',
        'Sets the `config` property based on selected context.', ->
            context = @data
            config  = getGruntConfig grunt, context
            grunt.log.writeln "\nUsing grunt config [#{context.join ' <- '}]:"
            grunt.log.writeln (JSON.stringify config, null, 4)
            grunt.config.set 'config', config