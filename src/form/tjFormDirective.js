'use strict';

angular.module('tj.form')
  .directive('tjForm', function ($translate, toastr) {
    return {
      restrict: 'A',
      require: 'form',
      link: function (scope, element, attrs, form) {
        // Don't let the browser do validation
        element.attr('novalidate', true);

        // Let screen readers know this is a form
        element.attr('role', 'form');

        // Call tjSubmit expression if form is valid
        element.on('submit', function () {
          scope.$apply(function () {
            // If the form is invalid, show a warning message
            if (form.$invalid) {
              $translate('TJ.FORM.ERROR_INVALID').then(function (text) {
                toastr.warning(text);
              });
            } else if (form.$valid && angular.isDefined(attrs.tjSubmit)) {
              scope.$eval(attrs.tjSubmit);
            }
          });
        });
      }
    };
  });
