
app.directive 'shader', ->
    restrict: 'EA'
    replace: true
    transclude: true
    scope:
        vertex:     '=shaderVertex'
        fragment:   '=shaderFragment'
        vertexMesh: '@shaderVertexMesh'
        blendMode:  '@shaderBlendMode'
        alphaComp:  '@shaderAlphaComp'
        params:     '=shaderParams'

    template: """
    <div class="shader" style="
        -webkit-filter: custom(
            {{ renderVertex(vertex) }}
            {{ renderFragment(fragment, blendMode, alphaComp) }}
            {{ renderVertexMesh(vertexMesh) }}
            {{ renderParams(params) }}
        );
    "ng-transclude></div>
    """

    link: ($scope) ->

        isShaderUri = (shader) ->
            # (shader.search /\n/) isnt -1
            false

        shaderToDataURI = (shader, mimetype) ->
            "data:#{mimetype};base64,#{btoa(shader)}"

        fragmentShaderToDataURI = (shader) ->
            shaderToDataURI shader, 'x-shader/x-fragment'

        vertexShaderToDataURI = (shader) ->
            shaderToDataURI shader, 'x-shader/x-vertex'

        $scope.renderVertex = (vertex) ->
            return "none" if not vertex
            uri = if (isShaderUri vertex) then vertex else (vertexShaderToDataURI vertex)
            return "url(#{uri})"

        $scope.renderFragment = (fragment, blendMode = 'normal', alphaComp = 'source-atop') ->
            return "none" if not fragment
            uri = if (isShaderUri fragment) then fragment else (fragmentShaderToDataURI fragment)
            return "mix(url(#{uri}) #{blendMode} #{alphaComp})"

        $scope.renderVertexMesh = (vertexMesh) ->
            return "" if not vertexMesh
            return ", #{vertexMesh}"

        $scope.renderParams = (params) ->
            return "" if not params
            result = []
            for param, value of params
                value = (value.join " ") if angular.isArray value
                result.push "#{param} #{value}"
            return ', ' + (result.join ', ')
