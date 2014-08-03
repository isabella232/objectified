/*
 * cf-objectify
 *
 * A work of the public domain from the Consumer Financial Protection Bureau.
 */

'use strict';

var debounce = require('debounce'),
    unformatUSD = require('unformat-usd');

var objectifier = {},
    objectified = {},
    cachedElements = {};

function _tokenize( str ) {

  var arr = str.split(' '),
      tokens = [],
      patterns;

  patterns = {
    operator: /^[+\-\*\/\%]$/, // +-*/%
    // @TODO Improve this regex to cover numbers like 1,000,000
    number: /^\$?\d+[\.,]?\d+$/
  };

  function _pushToken( val, type ) {
    var token = {
      value: val,
      type: type
    };
    tokens.push( token );
  }

  // @TODO DRY this up.
  for ( var i = 0, len = arr.length; i < len; i++ ) {
    if ( patterns.operator.test(arr[i]) ) {
      _pushToken( arr[i].match(patterns.operator)[0], 'operator' );
    } else if ( patterns.number.test(arr[i]) ) {
      _pushToken( unformatUSD( arr[i].match(patterns.number)[0] ), 'number' );
    } else {
      _pushToken( arr[i], 'name' );
    }
  }
  return tokens;
}

/**
 * _getDOMElementValue returns a reference to the element's value.
 * This needs to be modified to work with radios.
 * @param  {[type]} $el [description]
 * @return {[type]}     [description]
 */
// function _getDOMElementValue( el ) {
//   return el.value;
// }

/**
 * This only grabs the first applicable element.
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function _getDOMElement( str ) {
  var el = document.querySelector( '[cf-objectify=' + str + ']' );
  return el ? el : null;
}

// down = [{
//   type: "name"
//   value: "house-price"
// },{
//   type: "operator"
//   value: "-"
// },{
//   type: "name"
//   value: "down-payment"
// }]
function _deTokenize( arr ) {
  var el,
      tokens = [];
  for ( var i = 0, len = arr.length; i < len; i++ ) {
    var token = arr[i];
    if ( token.type === 'operator' || token.type === 'number' ) {
      tokens.push( token.value );
    } else {
      try {
        // @TODO accommodate radio and other elements that don't use .value
        el = _getDOMElement( arr[i].value );
        tokens.push( el.value || 0 );
      } catch ( e ) {}
    }
  }
  return eval( tokens.join(' ') );
}

function _parseSource( source ) {
  var src = _tokenize( source );
  if ( src ) {
    return src;
  }
  return null;
}

function objectify( props ) {
  var i,
      len;
  for ( i = 0, len = props.length; i < len; i++ ) {
    if ( props[i].hasOwnProperty('source') ) {
      objectifier[ props[i].name ] = _parseSource( props[i].source );
    } else {
      objectifier[ props[i].name ] = undefined;
    }
  }
  for ( i = 0, len = objectifier.length; i < len; i++ ) {

  }
  return objectified;
}

function update() {
  for (var key in objectifier) {
    objectified[ key ] = _deTokenize( objectifier[ key ] );
  }
}

var controllers = document.querySelectorAll('[cf-objectify]');

for ( var i = 0, len = controllers.length; i < len; i++ ) {

  controllers[i].addEventListener('change', function(){
    update();
  });

  controllers[i].addEventListener('keyup', debounce(function(){
    update();
  }, 100));

}

module.exports = objectify;
module.exports.update = update;