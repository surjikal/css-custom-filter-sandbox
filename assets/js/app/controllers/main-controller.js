(function() {

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
      defaultFragment: "precision mediump float;\n\n// Uniform values from CSS\n\nuniform float amount;\n\n// Varyings passed in from vertex shader\n\nvarying vec2 v_uv;\n\n// WebGL noise (start)\n// from https://github.com/ashima/webgl-noise\n\n// Copyright (C) 2011 by Ashima Arts (Simplex noise)\n// Copyright (C) 2011 by Stefan Gustavson (Classic noise)\n\n// Permission is hereby granted, free of charge, to any person obtaining a copy\n// of this software and associated documentation files (the \"Software\"), to deal\n// in the Software without restriction, including without limitation the rights\n// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n// copies of the Software, and to permit persons to whom the Software is\n// furnished to do so, subject to the following conditions:\n\n// The above copyright notice and this permission notice shall be included in\n// all copies or substantial portions of the Software.\n\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n// THE SOFTWARE.\n\nvec4 permute( vec4 x ) {\n\n    return mod( ( ( x * 34.0 ) + 1.0 ) * x, 289.0 );\n\n}\n\nvec4 taylorInvSqrt( vec4 r ) {\n\n    return 1.79284291400159 - 0.85373472095314 * r;\n\n}\n\nfloat snoise( vec3 v ) {\n\n    const vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );\n    const vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );\n\n    // First corner\n\n    vec3 i  = floor( v + dot( v, C.yyy ) );\n    vec3 x0 = v - i + dot( i, C.xxx );\n\n    // Other corners\n\n    vec3 g = step( x0.yzx, x0.xyz );\n    vec3 l = 1.0 - g;\n    vec3 i1 = min( g.xyz, l.zxy );\n    vec3 i2 = max( g.xyz, l.zxy );\n\n    vec3 x1 = x0 - i1 + 1.0 * C.xxx;\n    vec3 x2 = x0 - i2 + 2.0 * C.xxx;\n    vec3 x3 = x0 - 1. + 3.0 * C.xxx;\n\n    // Permutations\n\n    i = mod( i, 289.0 );\n    vec4 p = permute( permute( permute(\n             i.z + vec4( 0.0, i1.z, i2.z, 1.0 ) )\n           + i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) )\n           + i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );\n\n    // Gradients\n    // ( N*N points uniformly over a square, mapped onto an octahedron.)\n\n    float n_ = 1.0 / 7.0; // N=7\n\n    vec3 ns = n_ * D.wyz - D.xzx;\n\n    vec4 j = p - 49.0 * floor( p * ns.z *ns.z );  //  mod(p,N*N)\n\n    vec4 x_ = floor( j * ns.z );\n    vec4 y_ = floor( j - 7.0 * x_ );    // mod(j,N)\n\n    vec4 x = x_ *ns.x + ns.yyyy;\n    vec4 y = y_ *ns.x + ns.yyyy;\n    vec4 h = 1.0 - abs( x ) - abs( y );\n\n    vec4 b0 = vec4( x.xy, y.xy );\n    vec4 b1 = vec4( x.zw, y.zw );\n\n\n    vec4 s0 = floor( b0 ) * 2.0 + 1.0;\n    vec4 s1 = floor( b1 ) * 2.0 + 1.0;\n    vec4 sh = -step( h, vec4( 0.0 ) );\n\n    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;\n    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;\n\n    vec3 p0 = vec3( a0.xy, h.x );\n    vec3 p1 = vec3( a0.zw, h.y );\n    vec3 p2 = vec3( a1.xy, h.z );\n    vec3 p3 = vec3( a1.zw, h.w );\n\n    // Normalise gradients\n\n    vec4 norm = taylorInvSqrt( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) );\n    p0 *= norm.x;\n    p1 *= norm.y;\n    p2 *= norm.z;\n    p3 *= norm.w;\n\n    // Mix final noise value\n\n    vec4 m = max( 0.6 - vec4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ), 0.0 );\n    m = m * m;\n    return 42.0 * dot( m*m, vec4( dot( p0, x0 ), dot( p1, x1 ),\n                                  dot( p2, x2 ), dot( p3, x3 ) ) );\n\n}\n\n// WebGL noise (end)\n\n// Construct height map out of base noise function\n\nfloat surface( vec2 p, float time ) {\n\n    vec3 coord = vec3( p, -time * 0.001125 );\n\n    float n = 0.3;\n\n    n += 0.5   * abs( snoise( coord * 128.0 ) );\n    n += 0.25  * abs( snoise( coord * 256.0 ) );\n    n += 0.125 * abs( snoise( coord * 512.0 ) );\n\n    return n;\n\n}\n\n// Main\n\nvoid main() {\n\n    //float time = 0.075 + amount * 0.75;\n    float time = 0.0;\n\n    // compute height\n\n    float n = surface( 0.035 * v_uv, time );\n\n    // height thresholds\n\n    float t0 = amount + 0.2;\n    float t1 = amount + 0.25;\n    float t2 = amount + 0.275;\n    float t3 = amount + 0.3;\n\n    float r = 0.0;\n    float g = 0.0;\n    float b = 0.0;\n    float a = 0.0;\n\n    if ( n < t0 ) {\n\n        r = g = b = n * 0.95;\n        a = 1.0;\n\n        if ( n < 0.5 ) {\n\n            r = g = b = 0.0;\n            if ( n < 0.45 ) a = 0.0;\n\n        }\n\n    } else if ( n < t1 ) {\n\n    } else if ( n > t3 ) {\n\n        r = g = b = a = 1.0;\n\n    } else if ( n > t2 ) {\n\n        r = 1.0;\n        g = 0.75;\n        b = 0.5;\n        a = 1.0;\n\n    } else {\n\n        r = 1.0;\n        g = 0.5;\n        b = 0.5;\n        a = 1.0;\n\n    }\n\n    css_ColorMatrix = mat4( r, 0.0, 0.0, 0.0,\n                            0.0, g, 0.0, 0.0,\n                            0.0, 0.0, b, 0.0,\n                            0.0, 0.0, 0.0, a );\n}",
      defaultVertex: "// Copyright 2012 Adobe Systems, Incorporated\n// This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ .\n// Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .\n\nprecision mediump float;\n\n// Built-in attributes\n\nattribute vec4 a_position;\nattribute vec2 a_texCoord;\nattribute vec2 a_meshCoord;\n\n// Built-in uniforms\n\nuniform vec2 u_meshSize;//!\nuniform mat4 u_projectionMatrix;//!\n\n// Uniforms passed in from CSS\n\nuniform mat4 transform;\nuniform float amount;\n\n// Constants\n\nconst float PI = 3.1415;\n\n// Varyings are passed from the vertex shader to the fragment shader.\n// The value of the varying in the fragment shader is interpolated\n// between the varying values at the three vertices of the triangle\n// which contains the fragment.\n\nvarying vec2 v_uv;\n\n// Construct perspective matrix\n\nmat4 perspective( float p ) {\n\n    float perspective = - 1.0 / p;\n    return mat4(\n        1.0, 0.0, 0.0, 0.0,\n        0.0, 1.0, 0.0, 0.0,\n        0.0, 0.0, 1.0, perspective,\n        0.0, 0.0, 0.0, 1.0 );\n\n}\n\n// Main\n\nvoid main() {\n\n    float curve = abs( cos( a_meshCoord.x * PI * 6.0 ) );\n\n    vec4 pos = a_position;\n    pos.z = 0.1 * amount * ( curve - 1.0 );\n\n    gl_Position = u_projectionMatrix * perspective( 0.9 ) * transform * pos;\n\n    v_uv = a_texCoord;\n\n}"
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

  app.controller('MainController', function($scope, $timeout, ShaderResource, ShaderUniformParser) {
    var getUniforms, uniformAdapter;
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
    $scope.showVertexEditor = function() {
      $scope.shaderModel = $scope.vertexShader;
      $scope.vertexSelected = true;
      $scope.fragmentSelected = false;
      return $timeout(function() {
        return $scope.editor.setValue($scope.vertexShader);
      });
    };
    $scope.showFragmentEditor = function() {
      $scope.shaderModel = $scope.fragmentShader;
      $scope.vertexSelected = false;
      $scope.fragmentSelected = true;
      return $timeout(function() {
        return $scope.editor.setValue($scope.fragmentShader);
      });
    };
    $scope.$watch('fragmentShader', function(shader) {
      console.log('saving fragment shader');
      return ShaderResource.save('defaultFragment', shader);
    });
    $scope.$watch('vertexShader', function(shader, oldValue) {
      console.log('lol', shader);
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
        console.log($scope.vertexShader);
        $scope.vertexShader = shader;
      }
      return $scope.uniforms = (function() {
        var fragmentUniforms, vertexUniforms;
        vertexUniforms = getUniforms($scope.vertexShader);
        fragmentUniforms = getUniforms($scope.fragmentShader);
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
