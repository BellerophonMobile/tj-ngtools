'use strict';

angular.module('tj.form')
  .directive('tjFormGroup', function ($translate) {
    return {
      restrict: 'E',
      require: ['tjFormGroup', '^form'],
      scope: {
        label: '@'
      },
      templateUrl: 'tj/form/formGroup.html',
      transclude: true,
      controllerAs: 'tjFormGroup',
      controller: function () {
        this.form = null;
        this.ngModel = null;

        this.isTouched = function () {
          return this.form.$submitted || this.ngModel.$touched;
        };

        this.showValid = function () {
          return this.isTouched() && this.ngModel.$valid;
        };

        this.showInvalid = function () {
          return this.isTouched() && this.ngModel.$invalid;
        };

        this.getErrorMessage = function () {
          $translate(this.label).then(function (label) {
            return label + ' error!';
          });
        };
      },
      link: function (scope, element, attrs, requires) {
        var tjFormGroup = requires[0];
        var form = requires[1];

        tjFormGroup.form = form;

        if (angular.isDefined(scope.label)) {
          tjFormGroup.label = scope.label;
        }
      }
    };
  });

//      controllerAs: 'tjFormGroup',
//      controller: function () {
//        this.form = null;
//        this.ngModel = null;
//        this.label = null;
//
//      },
//      link: function (scope, element, attrs, requires) {
//
//        var input = element.find('input');
//
//        input.addClass('form-control');
//
//        if (angular.isString(attrs.name)) {
//          input.attr('id', attrs.name);
//        }
//
//      }
//    };
//  });
