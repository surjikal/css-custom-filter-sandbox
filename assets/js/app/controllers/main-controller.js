(function() {

  app.controller('MainController', function($scope) {
    var uniformAdapter;
    $scope.fragmentShader = "precision mediump float;\n\n// This uniform value is passed in using CSS.\nuniform vec3 channels;\n\nmat4 convertToDiagonalMatrix(vec3 v)\n{\n    return mat4(v[0],  0.0,  0.0, 0.0,\n                0.0,  v[1],  0.0, 0.0,\n                0.0,   0.0, v[2], 0.0,\n                0.0,   0.0,  0.0, 1.0);\n}\n\nvoid main()\n{\n   css_ColorMatrix = convertToDiagonalMatrix(channels);\n}";
    $scope.parseShaderUniforms = (function() {
      var makeUniform, regexes;
      regexes = {
        uniform: new RegExp('uniform.*;', 'g'),
        extraSpaces: new RegExp('[ ]+', 'g'),
        semicolon: new RegExp(';', 'g')
      };
      makeUniform = function(rawUniform) {
        var name, type, x;
        if (rawUniform.length !== 3) {
          console.warn("Badly parsed uniform:", rawUniform);
        }
        x = rawUniform[0], type = rawUniform[1], name = rawUniform[2];
        return {
          type: type,
          name: name
        };
      };
      return function(shader) {
        var matches;
        matches = (shader.match(regexes.uniform)) || [];
        matches = matches.map(function(match) {
          return match.replace(regexes.extraSpaces, ' ').replace(regexes.semicolon, '').split(' ');
        });
        return matches.map(makeUniform);
      };
    })();
    uniformAdapter = {
      vec3: function() {
        return [0.5, 0.5, 0.5];
      },
      float: function() {
        return 0.5;
      }
    };
    $scope.$watch('fragmentShader', function(fragmentShader) {
      return $scope.uniforms = (function() {
        var index, name, result, type, uniforms, value, _i, _len, _ref;
        index = 0;
        result = [];
        uniforms = $scope.parseShaderUniforms(fragmentShader);
        for (_i = 0, _len = uniforms.length; _i < _len; _i++) {
          _ref = uniforms[_i], name = _ref.name, type = _ref.type;
          value = (function() {
            var uniform, usePreviousValue, _ref1;
            uniform = (_ref1 = $scope.uniforms) != null ? _ref1[index++] : void 0;
            usePreviousValue = uniform && uniform.type === type;
            if (usePreviousValue) {
              return uniform.value;
            } else {
              return uniformAdapter[type]();
            }
          })();
          result.push({
            name: name,
            type: type,
            value: value
          });
        }
        return result;
      })();
    });
    return $scope.$watch('uniforms', (function(uniforms) {
      return $scope.uniformControls = (function() {
        var result, uniform, _i, _len;
        result = [];
        for (_i = 0, _len = uniforms.length; _i < _len; _i++) {
          uniform = uniforms[_i];
          result[uniform.name] = uniform.value;
        }
        return result;
      })();
    }), true);
  });

}).call(this);
