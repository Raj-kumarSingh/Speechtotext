(function() {
  "use strict";

  describe('annyang', function() {

    it('should exist in global namespace', function () {
      expect(annyang).toEqual(jasmine.any(Object));
    });

    it('should expose init method', function () {
      expect(annyang.init).toEqual(jasmine.any(Function));
    });

    it('should expose start method', function () {
      expect(annyang.start).toEqual(jasmine.any(Function));
    });

    it('should expose abort method', function () {
      expect(annyang.abort).toEqual(jasmine.any(Function));
    });

    it('should expose pause method', function () {
      expect(annyang.pause).toEqual(jasmine.any(Function));
    });

    it('should expose resume method', function () {
      expect(annyang.resume).toEqual(jasmine.any(Function));
    });

    it('should expose debug method', function () {
      expect(annyang.debug).toEqual(jasmine.any(Function));
    });

    it('should expose debug method', function () {
      expect(annyang.debug).toEqual(jasmine.any(Function));
    });

    it('should expose setLanguage method', function () {
      expect(annyang.setLanguage).toEqual(jasmine.any(Function));
    });

    it('should expose addCommands method', function () {
      expect(annyang.addCommands).toEqual(jasmine.any(Function));
    });

    it('should expose removeCommands method', function () {
      expect(annyang.removeCommands).toEqual(jasmine.any(Function));
    });

    it('should expose addCallback method', function () {
      expect(annyang.addCallback).toEqual(jasmine.any(Function));
    });

    it('should expose isListening method', function () {
      expect(annyang.isListening).toEqual(jasmine.any(Function));
    });

    it('should expose getSpeechRecognizer method', function () {
      expect(annyang.getSpeechRecognizer).toEqual(jasmine.any(Function));
    });

  });

  describe('annyang.isListening', function() {

    it('should return false when called before annyang starts', function () {
      expect(annyang.isListening()).toBe(false);
    });

    it('should return true when called after annyang starts', function () {
      annyang.start();
      expect(annyang.isListening()).toBe(true);
    });

    it('should return false when called when annyang is paused', function () {
      annyang.abort();
      expect(annyang.isListening()).toBe(false);
      annyang.start();
      expect(annyang.isListening()).toBe(true);
      annyang.pause();
      expect(annyang.isListening()).toBe(false);
    });

    it('should return true when called after annyang is resumed', function () {
      annyang.start();
      expect(annyang.isListening()).toBe(true);
      annyang.pause();
      expect(annyang.isListening()).toBe(false);
      annyang.resume();
      expect(annyang.isListening()).toBe(true);
    });

  });

  describe('annyang.abort', function() {
    var spyOnEnd;
    beforeEach(function() {
      annyang.abort();
      spyOnEnd = jasmine.createSpy();
      annyang.addCallback('end', spyOnEnd);
    });

    it('should stop annyang and Speech Recognition if it is started', function () {
      annyang.start();
      expect(annyang.isListening()).toBe(true);
      expect(spyOnEnd).not.toHaveBeenCalled();
      annyang.abort();
      expect(annyang.isListening()).toBe(false);
      expect(spyOnEnd).toHaveBeenCalledTimes(1);
    });

    it('should stop annyang if it is paused', function () {
      annyang.start();
      expect(annyang.isListening()).toBe(true);
      expect(spyOnEnd).not.toHaveBeenCalled();
      annyang.abort();
      expect(annyang.isListening()).toBe(false);
      expect(spyOnEnd).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when annyang is stopped', function () {
      expect(annyang.isListening()).toBe(false);
      expect(spyOnEnd).not.toHaveBeenCalled();
      annyang.abort();
      expect(annyang.isListening()).toBe(false);
      expect(spyOnEnd).not.toHaveBeenCalled();
    });

  });

  describe('annyang.debug', function() {

    beforeEach(function(){
      spyOn(console, 'log');
    });

    it('should be off by default', function () {
      annyang.addCommands({'test command': function() {}});
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should turn on debug messages when called without a parameter', function () {
      annyang.debug();
      annyang.addCommands({'test command': function() {}});
      expect(console.log).toHaveBeenCalled();
    });

    it('should turn off debug messages when called with a parameter that is false', function () {
      annyang.debug(true);
      annyang.debug(false);
      annyang.addCommands({'test command': function() {}});
      expect(console.log).not.toHaveBeenCalled();
      annyang.debug(0);
      annyang.addCommands({'test command': function() {}});
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should turn on debug messages when called with a parameter that is true', function () {
      annyang.debug(false);
      annyang.debug(1);
      annyang.addCommands({'test command': function() {}});
      expect(console.log).toHaveBeenCalledTimes(1);
      annyang.debug(true);
      annyang.addCommands({'test command': function() {}});
      expect(console.log).toHaveBeenCalledTimes(2);
    });

  });

  describe('annyang.addCallback', function() {

    beforeEach(function() {
      annyang.abort();
    });

    it('should always return undefined', function () {
      expect(annyang.addCallback()).toEqual(undefined);
      expect(annyang.addCallback('blergh')).toEqual(undefined);
      expect(annyang.addCallback('start', function() {})).toEqual(undefined);
      expect(annyang.addCallback('start', function() {}, this)).toEqual(undefined);
    });

    it('should be able to register multiple callbacks to one event', function () {
      var spyOnStart = jasmine.createSpy();
      var spyOnStart2 = jasmine.createSpy();
      annyang.addCallback('start', spyOnStart);
      annyang.addCallback('start', spyOnStart2);
      expect(spyOnStart).not.toHaveBeenCalled();
      expect(spyOnStart2).not.toHaveBeenCalled();
      annyang.start();
      expect(spyOnStart).toHaveBeenCalledTimes(1);
      expect(spyOnStart2).toHaveBeenCalledTimes(1);
    });

    it('should run callback in the context of annyang by default', function () {
      annyang.variableChanged = false;
      var changeVariable = function() {
        annyang.variableChanged = true;
      };
      annyang.addCallback('start', changeVariable);
      annyang.start();
      expect(annyang.variableChanged).toEqual(true);
      annyang.abort();
    });

    it('should run callbacks in the context given as the third parameter', function () {
      // First test it in this context
      this.variableChanged = false;
      var changeVariable = function() {
        this.variableChanged = true;
      };
      annyang.addCallback('start', changeVariable, this);
      annyang.start();
      expect(this.variableChanged).toEqual(true);
    });

  });

  describe("annyang.addCallback('start')", function() {

    beforeEach(function() {
      annyang.abort();
    });

    it('should add a callback which will be called when annyang starts', function () {
      var spyOnStart = jasmine.createSpy();
      annyang.addCallback('start', spyOnStart);
      expect(spyOnStart).not.toHaveBeenCalled();
      annyang.start();
      expect(spyOnStart).toHaveBeenCalledTimes(1);
    });

    it('should not fire callback when annyang resumes from a paused state', function () {
      // Turn off debugging during this test, as it logs a message when resuming from a paused state which we are not testing for here
      annyang.debug(false);
      var spyOnStart = jasmine.createSpy();
      annyang.start();
      annyang.pause();
      annyang.addCallback('start', spyOnStart);
      expect(spyOnStart).not.toHaveBeenCalled();
      annyang.resume();
      expect(spyOnStart).not.toHaveBeenCalled();
      annyang.debug(true);
    });

    it('should fire callback when annyang resumes from an aborted (stopped) state', function () {
      var spyOnStart = jasmine.createSpy();
      annyang.start();
      annyang.abort();
      annyang.addCallback('start', spyOnStart);
      expect(spyOnStart).not.toHaveBeenCalled();
      annyang.resume();
      expect(spyOnStart).toHaveBeenCalledTimes(1);
    });

  });

  describe("annyang.addCallback('end')", function() {

    beforeEach(function() {
      annyang.debug(false);
      annyang.start();
      annyang.debug(true);
    });

    it('should add a callback which will be called when annyang aborts', function () {
      var spyOnAbort = jasmine.createSpy();
      annyang.addCallback('end', spyOnAbort);
      expect(spyOnAbort).not.toHaveBeenCalled();
      annyang.abort();
      expect(spyOnAbort).toHaveBeenCalledTimes(1);
    });

    it('should not fire callback when annyang enters paused state', function () {
      var spyOnPause = jasmine.createSpy();
      annyang.addCallback('end', spyOnPause);
      expect(spyOnPause).not.toHaveBeenCalled();
      annyang.pause();
      expect(spyOnPause).not.toHaveBeenCalled();
    });

  });

  describe("annyang.getSpeechRecognizer", function() {

    beforeEach(function() {
      annyang.abort();
    });

    it('should return the instance of SpeechRecognition used by annyang', function () {
      var spyOnStart = jasmine.createSpy();
      var recognition = annyang.getSpeechRecognizer();
      recognition.addEventListener('start', spyOnStart);
      expect(spyOnStart).not.toHaveBeenCalled();
      annyang.start();
      expect(spyOnStart).toHaveBeenCalledTimes(1);
    });

  });

  describe("annyang.addCommands", function() {

    var recognition;

    beforeEach(function() {
      annyang.debug(false);
      annyang.abort();
      annyang.removeCommands();
      recognition = annyang.getSpeechRecognizer();
      spyOn(console, 'log');
    });

    it('should accept an object consisting of key (sentence) and value (callback function)', function () {
      expect(function() {
        annyang.addCommands(
          {'Time for some thrilling heroics': function() {}}
        );
      }).not.toThrowError();
    });

    it('should match commands when a sentence is recognized and call the callback', function () {
      var spyOnMatch = jasmine.createSpy();
      annyang.addCommands(
        {'Time for some thrilling heroics': spyOnMatch}
      );
      expect(spyOnMatch).not.toHaveBeenCalled();
      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch).toHaveBeenCalledTimes(1);
    });

    it('should match commands even if a recognition is not the first SpeechRecognitionAlternative', function () {
      var spyOnMatch = jasmine.createSpy();
      // For this test, the command text is what simulate saying plus 'and so on'.
      // This is the structure of alternative text recognitions in Corti.
      annyang.addCommands(
        {'Time for some thrilling heroics and so on': spyOnMatch}
      );
      expect(spyOnMatch).not.toHaveBeenCalled();
      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch).toHaveBeenCalledTimes(1);
    });

    it('should ignore commands in subsequent addCommands calls with existing command texts', function () {
      var spyOnMatch1 = jasmine.createSpy();
      var spyOnMatch2 = jasmine.createSpy();
      annyang.addCommands(
        {
          'Time for some thrilling heroics': spyOnMatch1
        }
      );
      annyang.addCommands(
        {
          'Time for some thrilling heroics':  spyOnMatch2
        }
      );
      expect(spyOnMatch1).not.toHaveBeenCalled();
      expect(spyOnMatch2).not.toHaveBeenCalled();
      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch1).toHaveBeenCalledTimes(1);
      expect(spyOnMatch2).not.toHaveBeenCalled();
    });

    it("should accept callbacks in commands object by reference. e.g. {'hello': helloFunc}", function () {
      var spyOnMatch = jasmine.createSpy();
      annyang.addCommands(
        {
          'Time for some thrilling heroics': spyOnMatch
        }
      );
      expect(spyOnMatch).not.toHaveBeenCalled();
      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch).toHaveBeenCalledTimes(1);
    });

    it("should accept callbacks in commands object by reference. e.g. {'hello': 'helloFunc'}", function () {
      window.globalSpy = jasmine.createSpy();
      annyang.addCommands(
        {
          'Time for some thrilling heroics': 'globalSpy'
        }
      );
      expect(window.globalSpy).not.toHaveBeenCalled();
      recognition.say('Time for some thrilling heroics');
      expect(window.globalSpy).toHaveBeenCalledTimes(1);
    });

    it('should write to console each command that was successfully added when debug is on', function () {
      annyang.debug(true);
      expect(console.log).not.toHaveBeenCalled();
      annyang.addCommands(
        {
          'Time for some thrilling heroics': function() {}
        }
      );
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('Command successfully loaded: %cTime for some thrilling heroics', 'font-weight: bold; color: #00f;');
      annyang.addCommands(
        {
          'That sounds like something out of science fiction': function() {},
          'We should start dealing in those black-market beagles': function() {}
        }
      );
      expect(console.log).toHaveBeenCalledTimes(3);
    });

    it('should write to console when commands could not be added', function () {
      annyang.debug(true);
      expect(console.log).not.toHaveBeenCalled();
      annyang.addCommands(
        {
          'Time for some thrilling heroics': 'not_a_function'
        }
      );
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('Can not register command: %cTime for some thrilling heroics', 'font-weight: bold; color: #00f;');
    });

    it('should accept commands with an object as the value which consists of a regexp and callback', function () {
      expect(function() {
        annyang.addCommands(
        {
          'It is time': {
            regexp: /\w* for some thrilling.*/,
            callback: function() {}
          }
        });
      }).not.toThrowError();
    });

    it('should match commands passed as an object as the value which consists of a regexp and callback', function () {
      var spyOnMatch = jasmine.createSpy();
      annyang.addCommands(
        {
          'It is time': {
            regexp: /\w* for some thrilling.*/,
            callback: spyOnMatch
          }
        }
      );
      expect(spyOnMatch).not.toHaveBeenCalled();
      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch).toHaveBeenCalledTimes(1);
    });

    it('should pass variables from regexp capturing groups to the callback function', function () {
      var capture1 = '';
      var capture2 = '';
      var getVariablesCaptured = function(s1, s2) {
        capture1 = s1;
        capture2 = s2;
      };

      annyang.addCommands(
        {
          'It is time': {
            regexp: /Time for some (\w*) (\w*)/,
            callback: getVariablesCaptured
          }
        }
      );
      recognition.say('Time for some thrilling heroics');
      expect(capture1).toEqual('thrilling');
      expect(capture2).toEqual('heroics');
    });

    it('should match commands with named variables', function () {
      var spyOnMatch = jasmine.createSpy();
      annyang.addCommands(
        {
          'Time for some thrilling :stuff': spyOnMatch
        }
      );
      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch).toHaveBeenCalledTimes(1);
    });

    it('should pass named variables to the callback function', function () {
      var capture = '';
      var getVariablesCaptured = function(s) {
        capture = s;
      };
      annyang.addCommands(
        {
          'Time for some thrilling :stuff': getVariablesCaptured
        }
      );
      recognition.say('Time for some thrilling heroics');
      expect(capture).toEqual('heroics');
    });

    it('should match commands with splats', function () {
      var spyOnMatch = jasmine.createSpy();
      annyang.addCommands(
        {
          'Time for some *stuff': spyOnMatch
        }
      );
      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch).toHaveBeenCalledTimes(1);
    });

    it('should pass splats to the callback function', function () {
      var capture = '';
      var getVariablesCaptured = function(s) {
        capture = s;
      };
      annyang.addCommands(
        {
          'Time for some *stuff': getVariablesCaptured
        }
      );
      recognition.say('Time for some thrilling heroics');
      expect(capture).toEqual('thrilling heroics');
    });

    it('should match commands with optional words when the word is in the sentence', function () {
      var spyOnMatch = jasmine.createSpy();
      annyang.addCommands(
        {
          'Time for some (thrilling) heroics': spyOnMatch
        }
      );
      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch).toHaveBeenCalledTimes(1);
    });

    it('should match commands with optional words when the word is not in the sentence', function () {
      var spyOnMatch = jasmine.createSpy();
      annyang.addCommands(
        {
          'Time for some (thrilling) heroics': spyOnMatch
        }
      );
      recognition.say('Time for some heroics');
      expect(spyOnMatch).toHaveBeenCalledTimes(1);
    });

  });

})();