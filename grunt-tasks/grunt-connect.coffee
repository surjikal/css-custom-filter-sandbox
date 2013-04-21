
module.exports = (grunt) ->

  path    = require 'path'
  connect = require 'connect'

  DEFAULTS =
      port: 8000
      path: '.'
      host: '0.0.0.0'

  TASKNAME = 'connect'

  getConfigValue = (query) ->
      grunt.config "#{TASKNAME}.#{query}"

  grunt.registerTask TASKNAME, 'Start a static web server.', ->
      port = (getConfigValue 'port') or DEFAULTS.port
      base = (getConfigValue 'base') or DEFAULTS.path
      host = (getConfigValue 'host') or DEFAULTS.host
      base = base grunt if grunt.utils._.isFunction base

      middleware  = (getConfigValue 'middleware')? grunt, connect, base
      middleware ?= [
          # Serve static files.
          connect.static base
          # Make empty directories browsable.
          connect.directory base
      ]

      if grunt.option 'debug'
          connect.logger.format 'grunt', (
              '[D] server :method :url :status :res[content-length] - :response-time ms'
          ).magenta
          middleware.unshift (connect.logger 'grunt')

      grunt.log.writeln "Starting static web server on #{host}:#{port}."
      (connect middleware...).listen port, host
