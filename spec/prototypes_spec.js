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
 * @fileoverview emeLogger unit tests.
 */

describe('emeLogger', function() {
  describe('EmeMethodCall', function() {
    var defaultMethodCall;

    beforeEach(function() {
      defaultMethodCall = new emeLogger.EmeMethodCall(
        'TestMethodCall',
        ['arg1', ['arg 2 array']],
        ['Argument 1', 'Argument 2'],
        {resultName: 'Name', resultValue: 'Result Value'},
        document.createElement('video'));
    });

    it('constructs a method call message object', function() {
      var result = emeLogger.getMessagePassableObject(defaultMethodCall);
      expect(result.title).toEqual('TestMethodCall');
      expect(result.names).toEqual([
          'Argument 1',
          'Argument 2',
          'returned',
          'target',
          'formattedMessage']);
      expect(result.values[0]).toEqual('arg1');
      expect(result.values[1]).toEqual(
          {title: 'Array', names: ['0'], values: ['arg 2 array']});
      expect(result.values[2]).toEqual(
          {title: 'Object',
          names: ['resultName', 'resultValue'],
          values: ['Name', 'Result Value']});
      expect(result.values[3]).toEqual(
          {title: 'HTMLVideoElement',
          names: ['id', 'classes'],
          values: ['', '']});
      expect(result.values[4]).toEqual(undefined);
    });
  });

  describe('EmeEvent', function() {
    var defaultEvent;

    beforeEach(function() {
      var event = new Event('Test');
      document.dispatchEvent(event);
      defaultEvent = new emeLogger.EmeEvent(event);
    });

    it('constructs an event message object', function() {
      var result = emeLogger.getMessagePassableObject(defaultEvent);
      expect(result.title).toEqual('TestEvent');
      expect(result.names).toEqual(
          ['event', 'timeStamp', 'target', 'formattedMessage']);
      expect(result.values[0]).toEqual(
          {title: 'Event', names: ['isTrusted'], values: [false]});
      // Value 1 will be the string timeStamp
      expect(result.values[1]).toEqual(jasmine.any(String));
      expect(result.values[2]).toEqual(
          {title: 'HTMLDocument', names: ['id'], values: [undefined]});
      expect(result.values[3]).toEqual(undefined);
    });
  });

  describe('PromiseResult', function() {
    var defaultPromise;

    beforeEach(function() {
      defaultPromise = new emeLogger.PromiseResult(
        'Promise Result Description', 'resolved', {result: 'Result Object'});
    });

    it('constructs a promise result message object', function() {
      var result = emeLogger.getMessagePassableObject(defaultPromise);
      expect(result.title).toEqual('Promise Result Description');
      expect(result.names).toEqual(['status', 'result']);
      expect(result.values[0]).toEqual('resolved');
      expect(result.values[1]).toEqual(
          {title: 'Object', names: ['result'], values: ['Result Object']});
    });
  });
});
