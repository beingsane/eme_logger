/**
 * Copyright 2015 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @fileoverview Defines prototypes for EME method calls and events.
 */

var emeLogger = {};


/**
 * @typedef {{
 *   title: string,
 *   names: !Array.<string>,
 *   values: !Array.<string|Object>
 * }}
 */
emeLogger.LogItemData;


/**
 * Method call prototype.
 * @param {string} name The name of the method.
 * @param {!Array} args The arguments this call was made with.
 * @param {!Array.<string>} labels A list of the types of arguments. Should
 *    correspond in length to the args array. Need to be in order with the args.
 * @param {Object} result The result of this method call.
 * @param {Element} target The element this method was called on.
 * @param {Object} data The EME data to be parsed from the Event/Call.
 * @param {string} keySystem The keySystem used for this Event/Call.
 * @constructor
 */
emeLogger.EmeMethodCall = function(
    name, args, labels, result, target, data, keySystem) {
  this.title = name;
  for (var i = 0; i < args.length; i++) {
    this[labels[i]] = args[i];
  }
  this.returned = result;
  this.target = new emeLogger.TargetObject(target);
  this.formattedMessage =
      emeLogger.getFormattedMessage(this.name, data, keySystem);
};


/**
 * EME Event prototype.
 * @param {Event} e An EME event.
 * @constructor
 */
emeLogger.EmeEvent = function(e) {
  this.title = e.type + 'Event';
  this.event = e;
  this.timeStamp = new Date(e.timeStamp).toString();
  this.target = new emeLogger.TargetObject(e.target);
  this.formattedMessage = emeLogger.getFormattedMessage(
      this.event.type, this.event.message, this.event.keySystem);
};


/**
 * Gets a formatted message from the EME Formatters.
 * @param {string} name The name of the Event or Call being logged.
 * @param {Object} data The EME data to be parsed from the Event/Call.
 * @param {string} keySystem The keySystem used for this Event/Call.
 * @return {string|undefined} The formatted message.
 */
emeLogger.getFormattedMessage = function(name, data, keySystem) {
  if (!document.emeFormatters) {
    return;
  }

  var formattedMessage = '';
  for (var i = 0; i < document.emeFormatters.length; i++) {
    var formatter = document.emeFormatters[i];
    var formatFunctionName = 'format' + name;
    if (!formatter[formatFunctionName]) {
      continue;
    }
    // Only use formatters that support the |keySystem|, if specified.
    // (|keySystem| is not specified for some events.)
    if (keySystem && !formatter.isKeySystemSupported(keySystem)) {
      continue;
    }
    try {
      formattedMessage += formatter[formatFunctionName](data);
      if (i > 0) {
        formattedMessage += '\n';
      }
    } catch (e) {
      console.warn('Formatter', formatter, 'failed:', e);
    }
  }

  if (formattedMessage == '') {
    return;
  }

  return formattedMessage;
};


/**
 * TargetObject pulls out the useful information from the object.
 * @param {Object} obj The target object.
 * @constructor
 */
emeLogger.TargetObject = function(obj) {
  if (!obj) {
    return;
  }
  this.title = obj.constructor.name;
  this.id = obj.id;
  if (obj.classList) {
    this.classes = obj.classList.toString();
  }
};


/**
 * PromiseResult contains the information resulting from a
 * resolved/rejected Promise.
 * @param {string} title A title used to describe this Promise.
 * @param {string} status Status of the Promise.
 * @param {Object} result The result of the Promise.
 * @constructor
 */
emeLogger.PromiseResult = function(title, status, result) {
  this.title = title;
  this.status = status;
  this.result = result;
};


/**
 * Provides a simple representation of obj to be used for messaging. The
 * names and values returned in emeLogger.LogItemData will only reflect the
 * object's direct properties.
 * @param {Object} obj An object to format into emeLogger.LogItemData.
 * @return {!emeLogger.LogItemData} A formatted object.
 */
emeLogger.getMessagePassableObject = function(obj) {
  var names = [];
  var values = [];
  for (var prop in obj) {
    if (prop == 'title') continue;
    // We only care about direct properties of the object. Calling
    // hasOwnProperty will stop from checking down the object's prototype chain.
    if (obj.hasOwnProperty(prop)) {
      if (typeof(obj[prop]) == 'function') continue;
      names.push(prop);
      if (typeof(obj[prop]) == 'object' && obj[prop] != null) {
        // Give ArrayBuffers a view so they can be properly logged.
        var value = obj[prop].constructor.name == 'ArrayBuffer' ?
            new Uint8Array(obj[prop]) : obj[prop];
        values.push(emeLogger.getMessagePassableObject(value));
      } else {
        values.push(obj[prop]);
      }
    }
  }
  var data = {
    title: obj.title || obj.constructor.name,
    names: names,
    values: values
  };
  return data;
};

