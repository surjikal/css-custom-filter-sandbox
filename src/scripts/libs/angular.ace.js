angular.module('ace', []).directive('ace', function($timeout) {
  var ACE_EDITOR_CLASS = 'ace-editor';

  function loadAceEditor(element, mode) {
    var editor = ace.edit('ace-editor');
    editor.getSession().setMode("ace/mode/" + mode);
    return editor;
  }

  return {
    restrict: 'A',
    scope: {
      ngModel: '=',
      scopeInstance: '='
    },
    template: '<div id="ace-editor" class="' + ACE_EDITOR_CLASS + '"></div>',

    link: function($scope, element, attrs, ngModel) {
      var editor = $scope.scopeInstance = loadAceEditor(element, attrs.ace);

      editor.getSession().on('change', function() {
        $scope.ngModel = editor.getValue();
        $scope.$apply();
      });
    }
  }
});
