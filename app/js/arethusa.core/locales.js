"use strict";

/**
 * @ngdoc object
 * @name arethusa.core.LOCALES
 *
 * @description
 * This constant is used to grant access to different localizations
 * of the Arethusa interface.
 *
 * We plan to at least support the following in the future:
 *
 * - de
 * - en
 * - es
 * - fa
 * - fr
 * - hr
 * - it
 * - pt
 *
 * Steps to add a new locale are as follows:
 * 1. add the file named per the iso locale code to dist/i18n
 * 2. add the iso locale code to this constant
 * 3. add a flags css style to _images.scss to represent the flag
 *    on the navbar
 *
 * For the flags css, we use base64 encoded urls, which can be created
 * by using an online converter e.g. like
 * http://www.greywyvern.com/code/php/binary2base64
 *
 * Flag source for most countries is from
 * http://l10n.xwiki.org/xwiki/bin/view/L10N/Flags (but this is missing some)
**/
angular.module('arethusa.core').constant('LOCALES', [
  'en',
  'de',
  'fr',
  'hr',
  'pt_BR',
  'ka'
]);
