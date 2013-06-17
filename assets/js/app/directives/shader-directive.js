(function() {

  app.directive('shader', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      scope: {
        vertex: '=shaderVertex',
        fragment: '=shaderFragment',
        vertexMesh: '@shaderVertexMesh',
        blendMode: '@shaderBlendMode',
        alphaComp: '@shaderAlphaComp',
        params: '=shaderParams'
      },
      template: "<div class=\"shader\" style='\n    -webkit-filter: custom(\n        {{ renderVertex(vertex) }}\n        {{ renderFragment(fragment, blendMode, alphaComp) }}\n        {{ renderVertexMesh(vertexMesh, vertex) }}\n        {{ renderParams(params) }}\n    );\n' ng-transclude></div>",
      link: function($scope) {
        var fragmentShaderToDataURI, hasValidVertexShader, isShaderUri, shaderToDataURI, vertexShaderToDataURI;
        isShaderUri = function(shader) {
          return false;
        };
        hasValidVertexShader = function(vertex) {
          return vertex && vertex.replace(/\s+/g, '').length !== 0;
        };
        shaderToDataURI = function(shader, mimetype) {
          return "data:" + mimetype + ";base64," + (btoa(shader));
        };
        fragmentShaderToDataURI = function(shader) {
          return shaderToDataURI(shader, 'x-shader/x-fragment');
        };
        vertexShaderToDataURI = function(shader) {
          return shaderToDataURI(shader, 'x-shader/x-vertex');
        };
        $scope.renderVertex = function(vertex) {
          var uri;
          if (!hasValidVertexShader(vertex)) {
            return "none";
          }
          uri = isShaderUri(vertex) ? vertex : vertexShaderToDataURI(vertex);
          return "url(" + uri + ")";
        };
        $scope.renderFragment = function(fragment, blendMode, alphaComp) {
          var uri;
          if (blendMode == null) {
            blendMode = 'multiply';
          }
          if (alphaComp == null) {
            alphaComp = 'source-atop';
          }
          if (!fragment) {
            return "none";
          }
          uri = isShaderUri(fragment) ? fragment : fragmentShaderToDataURI(fragment);
          return "mix(url(" + uri + ") " + blendMode + " " + alphaComp + ")";
        };
        $scope.renderVertexMesh = function(vertexMesh, vertex) {
          if (!vertexMesh || !hasValidVertexShader(vertex)) {
            return "";
          }
          return ", " + vertexMesh;
        };
        return $scope.renderParams = function(params) {
          var param, result, value;
          if (!params) {
            return "";
          }
          result = [];
          for (param in params) {
            value = params[param];
            if (param === 'transform') {
              value = "rotateX(0deg)";
            }
            if (!value) {
              continue;
            }
            if (angular.isArray(value)) {
              value = value.join(" ");
            }
            result.push("" + param + " " + value);
          }
          return ', ' + (result.join(', '));
        };
      }
    };
  });

}).call(this);