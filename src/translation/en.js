'use strict';

/**
 * English translations.
 */
angular.module('tj.translation')
  .config(function ($translateProvider) {
    $translateProvider.translations('en', {
      TJ: {
        FORM: {
          ERROR_INVALID: 'Please fix the errors in the form.',
          ERROR_REQUIRED: '{{ label | translate }} is required.',
          ERROR_EMAIL: '{{ label | translate }} is not a valid email address.'
        }
      }
    });
  });
