

registerGruntTask = (grunt, task, subtasks) ->
    grunt.registerTask task, subtasks.join '\n'


loadTask = (grunt, baseDir, task) ->
    (require "#{baseDir}/#{task}").call grunt, grunt


module.exports = {
    registerGruntTask
    loadTask
}