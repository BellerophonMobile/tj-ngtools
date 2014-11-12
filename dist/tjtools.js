/*! tjtools.js 393f119 */'use strict';

angular.module('tj.form', ['ngMessages', 'toastr', 'tj.translation']);

'use strict';

angular.module('tj.translation', ['pascalprecht.translate']);

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

'use strict';

angular.module('tj.form')
  .directive('ngModel', function () {
    return {
      require: ['?^tjFormGroup', 'ngModel'],
      link: function (scope, element, attrs, requires) {
        var tjFormGroup = requires[0];
        var ngModel = requires[1];

        if (tjFormGroup !== null) {
          tjFormGroup.ngModel = requires[1];
        }
      }
    };
  });

'use strict';

angular.module('tj.form')
  .directive('tjForm', ["$translate", "toastr", function ($translate, toastr) {
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
  }]);

'use strict';

angular.module('tj.form')
  .directive('tjFormGroup', ["$translate", function ($translate) {
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
  }]);

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
          if (ngModel === null) {
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

/* global Spinner */
'use strict';

/**
 * spinner - Simple directive to show a busy spinner.
 *
 * Uses spin.js.  Available options documented at:
 *
 *    http://fgnass.github.io/spin.js/
 *
 * Can be used in a few ways:
 *
 * - as an element:
 *    <spinner></spinner>
 *
 * - as an attribute:
 *
 *    <div class="foo" spinner></div>
 *
 * The attribute form allows you to override spin.js parameters per-element:
 *
 *    <div spinner="{ lines: 5, speed: 10 }"></div>
 */
angular.module('tj.spinner', [])
  .directive('spinner', function () {
    var defaults = {
      lines: 7,             // The number of lines to draw
      length: 0,            // The length of each line
      width: 10,            // The line thickness
      radius: 10,           // The radius of the inner circle
      corners: 1,           // Corner roundness (0..1)
      rotate: 0,            // The rotation offset
      direction: 1,         // 1: clockwise, -1: counterclockwise
      color: '#000',        // #rgb or #rrggbb or array of colors
      speed: 1,             // Rounds per second
      trail: 60,            // Afterglow percentage
      shadow: true,         // Whether to render a shadow
      hwaccel: true,        // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9,          // The z-index (defaults to 2000000000)
      top: '50%',           // Top position relative to parent
      left: '50%'           // Left position relative to parent
    };

    return {
      restrict: 'E',
      link: function (scope, element, attrs) {
        var spinner = null;

        var update = function (value) {
          if (spinner !== null) {
            spinner.stop();
          }

          var overrides = scope.$eval(value);
          if (!angular.isObject(overrides)) {
            overrides = {};
          }

          var options = angular.copy(defaults);
          angular.extend(options, overrides);

          spinner = new Spinner(options).spin(element[0]);
        };
        attrs.$observe('spinner', update);
        update();

        element.on('$destroy', function () {
          spinner.stop();
        });
      }
    };
  });


'use strict';

/**
 * English translations.
 */
angular.module('tj.translation')
  .config(["$translateProvider", function ($translateProvider) {
    $translateProvider.translations('en', {
      TJ: {
        FORM: {
          ERROR_INVALID: 'Please fix the errors in the form.',
          ERROR_REQUIRED: '{{ label | translate }} is required.'
        }
      }
    });
  }]);

angular.module('tj.templates', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('tj/alert/alert.html',
    "<div class=\"alert\" ng-class=\"alertClasses\" role=\"alert\"> <button type=\"button\" class=\"close\" ng-if=\"isCloseable\" ng-click=\"alertClose()\"> <span aria-hidden=\"true\">&times;</span> <span class=\"sr-only\">Close</span> </button> <ng-transclude></ng-transclude> </div>"
  );


  $templateCache.put('tj/form/formGroup.html',
    "<div class=\"form-group\" ng-class=\"{\n" +
    "    'has-success': tjFormGroup.showValid(),\n" +
    "    'has-error': tjFormGroup.showInvalid()\n" +
    "  }\"> <label ng-if=\"tjFormGroup.label !== null\" for=\"{{ ::tjFormGroup.ngModel.$name }}\" translate> {{ ::tjFormGroup.label }} </label> <ng-transclude></ng-transclude> <span class=\"help-block\" ng-if=\"tjFormGroup.showInvalid()\" ng-messages=\"tjFormGroup.ngModel.$error\"> <span ng-message=\"required\"> <span translate translate-values=\"{ label: tjFormGroup.label }\"> TJ.FORM.ERROR_REQUIRED </span> </span> </span> </div>"
  );

}]);

//# sourceMappingURL=tjtools.js.map