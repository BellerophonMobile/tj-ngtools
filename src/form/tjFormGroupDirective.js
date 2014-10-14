'use strict';

angular.module('tj.form')
  .directive('tjFormGroup', function ($translate) {
    return {
      priority: 1000,
      replace: true,
      require: ['tjFormGroup', '^form', 'ngModel'],
      restrict: 'A',
      scope: {},
      templateUrl: 'tj/form/formGroup.html',
      transclude: 'element',
      controllerAs: 'tjFormGroup',
      controller: function () {
        this.form = null;
        this.ngModel = null;
        this.label = null

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
        var ngModel = requires[2];

        tjFormGroup.form = form;
        tjFormGroup.ngModel = ngModel;

        // XXX HACK XXX: The transclude seems to copy classes onto the new root
        // form-group div.  Reset it to just have a "form-group" class.
        element.attr('class', 'form-group');

        var input = element.find('input');

        input.addClass('form-control');

        if (angular.isString(attrs.name)) {
          input.attr('id', attrs.name);
        }

        if (angular.isString(attrs.label)) {
          tjFormGroup.label = attrs.label;
        }
      }
    };
  });
