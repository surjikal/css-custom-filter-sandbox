(function() {

  app.service('CheckFeatureWidthPropertyPrefix', function() {
    var prefixes;
    prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"];
    return {
      check: function(property, value) {
        var $div, prefix, prefixedProperty, _i, _len;
        $div = $("<div />");
        for (_i = 0, _len = prefixes.length; _i < _len; _i++) {
          prefix = prefixes[_i];
          prefixedProperty = prefix + property;
          if ($div.css(prefixedProperty, value).css(prefixedProperty) == value) {
            return true;
          }
        }
        return false;
      }
    };
  });

  app.service('ShaderResource', function() {
    var loadFromLocalStorage, saveToLocalStorage, shaders;
    saveToLocalStorage = function(shaders) {
      var name, shader, shaderNames;
      shaderNames = [];
      for (name in shaders) {
        shader = shaders[name];
        shaderNames.push(name);
        localStorage.setItem(name, shader);
      }
      return localStorage.setItem('shaders', shaderNames.join(','));
    };
    loadFromLocalStorage = function() {
      var name, result, shader, shaderNames, _i, _len;
      result = {};
      shaderNames = ((localStorage.getItem('shaders')) || '').split(',');
      console.log("Loading saved shaders:", shaderNames);
      for (_i = 0, _len = shaderNames.length; _i < _len; _i++) {
        name = shaderNames[_i];
        shader = localStorage.getItem(name);
        result[name] = shader;
      }
      return result;
    };
    shaders = _.extend({
      defaultFragment: "precision mediump float;\n\n\n// Feel free to add new uniforms!\n// The GUI will update itself :D\n\nuniform vec3 colors;\nuniform float alpha;\n\n\nvoid main() {\n\n    css_ColorMatrix = mat4( colors[0], 0.0, 0.0, 0.0,\n                            0.0, colors[1], 0.0, 0.0,\n                            0.0, 0.0, colors[2], 0.0,\n                            0.0, 0.0, 0.0, alpha );\n}",
      defaultVertex: "// Copyright 2012 Adobe Systems, Incorporated\n// This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ .\n// Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .\n\nprecision mediump float;\n\n// Built-in attributes\n\nattribute vec4 a_position;\nattribute vec2 a_texCoord;\nattribute vec2 a_meshCoord;\n\n// Built-in uniforms\n\nuniform vec2 u_meshSize;//!\nuniform mat4 u_projectionMatrix;//!\n\n// Uniforms passed in from CSS\n\nuniform mat4 transform;\nuniform float waviness;\n\n// Constants\n\nconst float PI = 3.1415;\n\n// Varyings are passed from the vertex shader to the fragment shader.\n// The value of the varying in the fragment shader is interpolated\n// between the varying values at the three vertices of the triangle\n// which contains the fragment.\n\nvarying vec2 v_uv;\n\n// Construct perspective matrix\n\nmat4 perspective( float p ) {\n\n    float perspective = - 1.0 / p;\n    return mat4(\n        1.0, 0.0, 0.0, 0.0,\n        0.0, 1.0, 0.0, 0.0,\n        0.0, 0.0, 1.0, perspective,\n        0.0, 0.0, 0.0, 1.0 );\n\n}\n\n// Main\n\nvoid main() {\n\n    float curve = abs( cos( a_meshCoord.x * PI * 6.0 ) );\n\n    vec4 pos = a_position;\n    pos.z = 0.1 * waviness * ( curve - 1.0 );\n\n    gl_Position = u_projectionMatrix * perspective( 0.9 ) * transform * pos;\n\n    v_uv = a_texCoord;\n\n}"
    }, loadFromLocalStorage());
    return {
      load: function(id, done) {
        return shaders[id];
      },
      save: function(id, shader, done) {
        shaders[id] = shader;
        return saveToLocalStorage(shaders);
      }
    };
  });

  app.service('ShaderUniformParser', function() {
    var makeUniform, regexes;
    regexes = {
      uniform: new RegExp('uniform.*;((?!//\!))', 'g'),
      extraSpaces: new RegExp('[ ]+', 'g'),
      semicolon: new RegExp(';', 'g')
    };
    makeUniform = function(rawUniform) {
      var name, type, x;
      if (rawUniform.length !== 3) {
        return console.warn("Badly parsed uniform:", rawUniform);
      }
      x = rawUniform[0], type = rawUniform[1], name = rawUniform[2];
      return {
        type: type,
        name: name
      };
    };
    return {
      parse: function(shader) {
        var matches;
        if (!shader) {
          return [];
        }
        matches = (shader.match(regexes.uniform)) || [];
        matches = matches.map(function(match) {
          return match.replace(regexes.extraSpaces, ' ').replace(regexes.semicolon, '').split(' ');
        });
        return matches.map(makeUniform);
      }
    };
  });

  app.directive('vectorUniformControl', function() {
    return {
      restrict: 'CA',
      scope: {
        uniform: '='
      },
      link: function($scope, element) {
        return $scope.$watch('uniform', function(uniform) {
          return $scope.valueRange = _.range($scope.uniform.value.length);
        });
      }
    };
  });

  app.controller('MainController', function($scope, $timeout, ShaderResource, ShaderUniformParser, CheckFeatureWidthPropertyPrefix) {
    var getUniforms, setEditorText, uniformAdapter;
    $scope.customFiltersSupported = CheckFeatureWidthPropertyPrefix.check("filter", "custom(none mix(url(http://www.example.com/)))");
    $scope.fragmentShader = ShaderResource.load('defaultFragment');
    $scope.vertexShader = ShaderResource.load('defaultVertex');
    $scope.uniforms = [];
    $timeout(function() {
      return $scope.showFragmentEditor();
    });
    uniformAdapter = {
      vec2: function() {
        return [1.0, 1.0];
      },
      vec3: function() {
        return [1.0, 1.0, 1.0];
      },
      vec4: function() {
        return [1.0, 1.0, 1.0, 1.0];
      },
      float: function() {
        return 1.0;
      }
    };
    setEditorText = function(text) {
      $scope.editor.setValue(text);
      return $timeout(function() {
        var selection;
        selection = $scope.editor.getSession().selection;
        selection.clearSelection();
        return selection.moveCursorTo(0, 0, false);
      });
    };
    $scope.showVertexEditor = function() {
      $scope.shaderModel = $scope.vertexShader;
      $scope.vertexSelected = true;
      $scope.fragmentSelected = false;
      return $timeout(function() {
        return setEditorText($scope.vertexShader);
      });
    };
    $scope.showFragmentEditor = function() {
      $scope.shaderModel = $scope.fragmentShader;
      $scope.vertexSelected = false;
      $scope.fragmentSelected = true;
      return $timeout(function() {
        return setEditorText($scope.fragmentShader);
      });
    };
    $scope.$watch('fragmentShader', function(shader) {
      console.log('saving fragment shader');
      return ShaderResource.save('defaultFragment', shader);
    });
    $scope.$watch('vertexShader', function(shader, oldValue) {
      console.log('saving vertex shader');
      return ShaderResource.save('defaultVertex', shader);
    });
    getUniforms = function(shader) {
      var index, name, result, type, uniforms, value, _i, _len, _ref;
      index = 0;
      result = [];
      uniforms = ShaderUniformParser.parse(shader);
      for (_i = 0, _len = uniforms.length; _i < _len; _i++) {
        _ref = uniforms[_i], name = _ref.name, type = _ref.type;
        value = (function() {
          var uniform, usePreviousValue, _ref1;
          uniform = (_ref1 = $scope.uniforms) != null ? _ref1[index++] : void 0;
          console.log(uniform, name, type);
          usePreviousValue = uniform && uniform.type === type;
          if (usePreviousValue) {
            return uniform.value;
          } else {
            return typeof uniformAdapter[type] === "function" ? uniformAdapter[type]() : void 0;
          }
        })();
        result.push({
          name: name,
          type: type,
          value: value
        });
      }
      return result;
    };
    $scope.$watch('shaderModel', function(shader, oldValue) {
      if (_.isUndefined(shader)) {
        return;
      }
      if ($scope.fragmentSelected) {
        $scope.fragmentShader = shader;
      } else {
        $scope.vertexShader = shader;
      }
      return $scope.uniforms = (function() {
        var fragmentUniforms, vertexUniforms;
        vertexUniforms = getUniforms($scope.vertexShader);
        fragmentUniforms = getUniforms($scope.fragmentShader);
        console.log(vertexUniforms);
        return _.filter(vertexUniforms.concat(fragmentUniforms), (function() {
          var seen;
          seen = {};
          return function(_arg) {
            var name;
            name = _arg.name;
            return !seen[name] && (seen[name] = name);
          };
        })());
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
