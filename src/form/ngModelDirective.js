'use strict';

angular.module('tj.form')
  .directive('ngModel', function () {
    return {
      require: ['?^tjFormGroup', 'ngModel'],
      link: function (scope, element, attrs, requires) {
        var tjFormGroup = requires[0];
        var ngModel = requires[1];

        if (tjFormGroup !== null) {
          tjFormGroup.ngModel = ngModel;
        }
      }
    };
  });
