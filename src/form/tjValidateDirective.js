'use strict';

angular.module('tj.form')
  .directive('tjValidate', function () {

    /** Utility function for determining if a value is "empty". */
    var isEmpty = function (value) {
      return angular.isUndefined(value) || value === '' || value === null || value !== value;
    };

    var builtinValidators = {
      required: function (isRequired, value) {
        return !isRequired || !isEmpty(value);
      },

      minlength: function (minlength, modelValue, viewValue) {
        return isEmpty(modelValue) || viewValue.length >= minlength;
      },

      maxlength: function (maxlength, modelValue, viewValue) {
        return isEmpty(modelValue) || viewValue.length <= maxlength;
      },

      pattern: function (regexp, value) {
        return isEmpty(value) || angular.isUndefined(regexp) || regexp.test(value);
      },
    };

    var generateValidators = function (validators, ngModel) {
      angular.forEach(validators, function (validatorValue, key) {
        if (angular.isFunction(validatorValue)) {
          ngModel.$validators[key] = validatorValue;

        } else if (builtinValidators.hasOwnProperty(key)) {
          ngModel.$validators[key] = function (modelValue, viewValue) {
            return builtinValidators[key](validatorValue, modelValue, viewValue);
          };

        } else {
          throw 'Validator key \'' + key + '\' not a function or builtin validator.';
        }
      });
    };

    var updateValidators = function (localValidators, formValidators, ngModel) {
      // Generate form-global validators
      generateValidators(formValidators, ngModel);

      // Override with specific input validators
      generateValidators(localValidators, ngModel);

      // Revalidate the input
      ngModel.$validate();
    };

    return {
      restrict: 'A',
      require: ['^form', '?ngModel'],
      link: {
        pre: function (scope, element, attrs, requires) {
          var form = requires[0];
          var ngModel = requires[1];

          var updateFunc,
              validators;

          // If ng-model isn't defined, assume this is on a form element
          if (!angular.isDefined(ngModel)) {

            updateFunc = function (value) {
              // Attach validators to the form
              form.$tjValidator = value;

              // Tell tj-validate directives on the form's inputs to update
              scope.$broadcast('tj.form.validatorUpdate');
            };

          } else {
            updateFunc = function (value) {
              validators = value;
              updateValidators(validators, form.$tjValidator, ngModel);
            };

            // When the form-global validator updates, regenerate this model's
            // validators
            scope.$on('tj.form.validatorUpdate', function () {
              updateValidators(validators, form.$tjValidator, ngModel);
            });
          }

          scope.$watch(function () {
            return scope.$eval(attrs.tjValidate);
          }, updateFunc, true);
        }
      }
    };

  });
