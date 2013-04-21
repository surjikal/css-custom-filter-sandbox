
app.controller 'MainController', ($scope) ->

    $scope.fragmentShader = """
    precision mediump float;

    // This uniform value is passed in using CSS.
    uniform vec3 channels;

    mat4 convertToDiagonalMatrix(vec3 v)
    {
        return mat4(v[0],  0.0,  0.0, 0.0,
                    0.0,  v[1],  0.0, 0.0,
                    0.0,   0.0, v[2], 0.0,
                    0.0,   0.0,  0.0, 1.0);
    }

    void main()
    {
       css_ColorMatrix = convertToDiagonalMatrix(channels);
    }
    """

    $scope.parseShaderUniforms = do ->

        regexes =
            uniform:     new RegExp('uniform.*;', 'g')
            extraSpaces: new RegExp('[ ]+', 'g')
            semicolon:   new RegExp(';', 'g')

        makeUniform = (rawUniform) ->
            console.warn "Badly parsed uniform:", rawUniform if rawUniform.length isnt 3
            [x, type, name] = rawUniform
            return {type, name}

        (shader) ->
            matches = (shader.match regexes.uniform) or []
            matches = matches.map (match) ->
                match.replace(regexes.extraSpaces, ' ')
                     .replace(regexes.semicolon, '')
                     .split(' ')
            return matches.map makeUniform


    uniformAdapter =
        vec3:  -> [0.5, 0.5, 0.5]
        float: ->  0.5


    $scope.$watch 'fragmentShader', (fragmentShader) ->
        $scope.uniforms = do ->
            index    = 0
            result   = []
            uniforms = $scope.parseShaderUniforms fragmentShader

            for {name, type} in uniforms
                value = do ->
                    uniform = $scope.uniforms?[index++]
                    usePreviousValue = uniform and uniform.type is type
                    return if usePreviousValue then (uniform.value) else uniformAdapter[type]()
                result.push {name, type, value}

            return result


    $scope.$watch 'uniforms', ((uniforms) ->
        $scope.uniformControls = do ->
            result = []
            for uniform in uniforms
                result[uniform.name] = uniform.value
            return result
    ), true
