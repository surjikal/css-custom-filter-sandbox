
app.service 'CheckFeatureWidthPropertyPrefix', ->
    prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"]

    check: (property, value) ->
        $div = $("<div />")
        for prefix in prefixes
            prefixedProperty = prefix + property
            if (`$div.css(prefixedProperty, value).css(prefixedProperty) == value`)
                return true
        return false


app.service 'ShaderResource', ->

    saveToLocalStorage = (shaders) ->
        shaderNames = []
        for name, shader of shaders
            shaderNames.push name
            localStorage.setItem name, shader
        localStorage.setItem 'shaders', shaderNames.join(',')

    loadFromLocalStorage = ->
        result = {}
        shaderNames = ((localStorage.getItem 'shaders') or '').split ','
        console.log "Loading saved shaders:", shaderNames
        for name in shaderNames
            shader = localStorage.getItem name
            result[name] = shader
        return result

    shaders = _.extend
        defaultFragment: """
        precision mediump float;

        // Uniform values from CSS

        uniform vec3 colors;
        uniform float alpha;


        void main() {

            css_ColorMatrix = mat4( colors[0], 0.0, 0.0, 0.0,
                                    0.0, colors[1], 0.0, 0.0,
                                    0.0, 0.0, colors[2], 0.0,
                                    0.0, 0.0, 0.0, alpha );
        }
        """

        defaultVertex: """
        // Copyright 2012 Adobe Systems, Incorporated
        // This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ .
        // Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .

        precision mediump float;

        // Built-in attributes

        attribute vec4 a_position;
        attribute vec2 a_texCoord;
        attribute vec2 a_meshCoord;

        // Built-in uniforms

        uniform vec2 u_meshSize;//!
        uniform mat4 u_projectionMatrix;//!

        // Uniforms passed in from CSS

        uniform mat4 transform;
        uniform float waviness;

        // Constants

        const float PI = 3.1415;

        // Varyings are passed from the vertex shader to the fragment shader.
        // The value of the varying in the fragment shader is interpolated
        // between the varying values at the three vertices of the triangle
        // which contains the fragment.

        varying vec2 v_uv;

        // Construct perspective matrix

        mat4 perspective( float p ) {

            float perspective = - 1.0 / p;
            return mat4(
                1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, perspective,
                0.0, 0.0, 0.0, 1.0 );

        }

        // Main

        void main() {

            float curve = abs( cos( a_meshCoord.x * PI * 6.0 ) );

            vec4 pos = a_position;
            pos.z = 0.1 * waviness * ( curve - 1.0 );

            gl_Position = u_projectionMatrix * perspective( 0.9 ) * transform * pos;

            v_uv = a_texCoord;

        }
        """
    , loadFromLocalStorage()

    load: (id, done) ->
        return shaders[id]

    save: (id, shader, done) ->
        shaders[id] = shader
        saveToLocalStorage shaders


app.service 'ShaderUniformParser', ->
    regexes =
        uniform:     new RegExp('uniform.*;((?!//\!))', 'g')
        extraSpaces: new RegExp('[ ]+', 'g')
        semicolon:   new RegExp(';', 'g')

    makeUniform = (rawUniform) ->
        return (console.warn "Badly parsed uniform:", rawUniform) if rawUniform.length isnt 3
        [x, type, name] = rawUniform
        return {type, name}

    return parse: (shader) ->
        return [] if not shader

        matches = (shader.match regexes.uniform) or []
        matches = matches.map (match) ->
            match.replace(regexes.extraSpaces, ' ')
                 .replace(regexes.semicolon, '')
                 .split(' ')
        return matches.map makeUniform



app.directive 'vectorUniformControl', ->
    restrict: 'CA'
    scope:
        uniform: '='
    link: ($scope, element) ->
        $scope.$watch 'uniform', (uniform) ->
            $scope.valueRange = _.range $scope.uniform.value.length


app.controller 'MainController', ($scope, $timeout, ShaderResource, ShaderUniformParser, CheckFeatureWidthPropertyPrefix) ->
    $scope.customFiltersSupported = CheckFeatureWidthPropertyPrefix.check "filter", "custom(none mix(url(http://www.example.com/)))"

    $scope.fragmentShader = ShaderResource.load 'defaultFragment'
    $scope.vertexShader   = ShaderResource.load 'defaultVertex'
    $scope.uniforms = []

    $timeout ->
        $scope.showFragmentEditor()

    uniformAdapter =
        vec2:  -> [1.0, 1.0]
        vec3:  -> [1.0, 1.0, 1.0]
        vec4:  -> [1.0, 1.0, 1.0, 1.0]
        float: ->  1.0


    setEditorText = (text) ->
        $scope.editor.setValue text
        $timeout ->
          selection = $scope.editor.getSession().selection
          selection.clearSelection()
          selection.moveCursorTo(0, 0, false)


    $scope.showVertexEditor = ->
        $scope.shaderModel = $scope.vertexShader
        $scope.vertexSelected = true
        $scope.fragmentSelected = false
        $timeout -> setEditorText $scope.vertexShader


    $scope.showFragmentEditor = ->
        $scope.shaderModel = $scope.fragmentShader
        $scope.vertexSelected = false
        $scope.fragmentSelected = true
        $timeout -> setEditorText $scope.fragmentShader


    $scope.$watch 'fragmentShader', (shader) ->
        # return if not shader
        console.log 'saving fragment shader'
        ShaderResource.save 'defaultFragment', shader


    $scope.$watch 'vertexShader', (shader, oldValue) ->
        console.log 'saving vertex shader'
        ShaderResource.save 'defaultVertex', shader


    getUniforms = (shader) ->
        index    = 0
        result   = []
        uniforms = ShaderUniformParser.parse shader

        for {name, type} in uniforms
            value = do ->
                uniform = $scope.uniforms?[index++]
                console.log uniform, name, type
                usePreviousValue = uniform and uniform.type is type
                return if usePreviousValue then (uniform.value) else uniformAdapter[type]?()
            result.push {name, type, value}

        return result


    $scope.$watch 'shaderModel', (shader, oldValue) ->
        return if _.isUndefined shader

        if $scope.fragmentSelected
            $scope.fragmentShader = shader
        else
            $scope.vertexShader = shader

        $scope.uniforms = do ->
            vertexUniforms = getUniforms $scope.vertexShader
            fragmentUniforms = getUniforms $scope.fragmentShader
            console.log vertexUniforms
            _.filter (vertexUniforms.concat fragmentUniforms), do ->
                seen = {}
                ({name}) -> (not seen[name] and seen[name] = name)


    $scope.$watch 'uniforms', ((uniforms) ->
        $scope.uniformControls = do ->
            result = []
            for uniform in uniforms
                result[uniform.name] = uniform.value
            return result
    ), true
