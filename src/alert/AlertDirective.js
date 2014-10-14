'use strict';

angular.module('tj.alert', [])
  .directive('alert', function () {
    return {
      restrict: 'E',
      templateUrl: 'tj/alert/alert.html',
      transclude: true,
      scope: true,
      link: function (scope, element, attrs) {

        scope.isCloseable = false;

        var generateClasses = function () {
          scope.alertClasses = [];

          if (angular.isDefined(attrs.alertClass)) {
            scope.alertClasses.push(attrs.alertClass);
          } else {
            scope.alertClasses.push('alert-danger');
          }

          if (angular.isDefined(attrs.alertClose)) {
            scope.isCloseable = true;
            scope.alertClasses.push('alert-dismissible');
          } else {
            scope.isCloseable = false;
          }
        };

        attrs.$observe('alertClass', function () {
          generateClasses();
        });

        attrs.$observe('alertClose', function () {
          generateClasses();
        });

        scope.alertClose = function () {
          scope.$eval(attrs.alertClose);
        };
      }
    };
  });
