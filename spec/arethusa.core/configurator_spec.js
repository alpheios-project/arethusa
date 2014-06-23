"use strict";

describe('configurator', function() {
  var mock1 = {};
  var mock2 = {};

  // stubs that mimick the markup of configuration JSON files.
  // Drawn out to different variables for easier testing, usually this
  // would come as a single file.

  var mainConf,
    morphConf,
    morphAttributes,
    morphRetrieverConf,
    perseidsRoute,
    perseidsConf,
    conf1;

  // We have to restore the conf variables before every spec,
  // as we might mangle with these values.
  beforeEach(function() {
    mainConf = {
      template: 'templates/main.html',
      retrievers: {
        'treebankRetriever': {
          resource: perseidsConf
        }
      },
      plugins: [
        'text',
        'morph'
      ]
    };

    morphConf = {
      name: 'morph',
      template: 'templates/morph.html',
      retrievers: {
        'fakeMorphRetriever' : morphRetrieverConf,
        'bspMorphRetriever' : {}
      },
      attributes: {
        fileUrl: 'configs/morph/aldt.json'
      }
    };

    morphAttributes = {
      postagSchema: []
    };

    morphRetrieverConf = {
      resource: 'morphologyService'
    };

    perseidsRoute = "http://services.perseids.org/:doc.xml";

    perseidsConf = {
      route: perseidsRoute,
      params: ["doc"]
    };

    conf1 = {
      main: mainConf,

      navbar: {
        template: 'templates/navbar.html'
      },

      plugins: {
        text: {
          name: 'text',
          main: true,
          template: 'templates/text2.html'
        },
        morph: morphConf
      },

      resources: {
        perseids: perseidsConf,
        morphologyService: {
          route: "http://services.perseids.org/bsp"
        }
      }
    };
  });


  beforeEach(module('arethusa', function($provide) {
    $provide.value('x', mock1);
    $provide.value('y', mock2);
  }));

  var $httpBackend;

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
  }));

  describe('this.defineConfiguration', function() {
    it('sets a configuration file', inject(function(configurator) {
      expect(configurator.configuration).toBeUndefined();
      configurator.defineConfiguration(conf1);
      expect(configurator.configuration).toBeDefined();
    }));

    it('resolves references to external files inside a configuration', inject(function(configurator) {
      // the morph plugin's conf includes a fileUrl property
      expect(morphConf.attributes.fileUrl).toBeDefined();
      // the defineConfiguration function will resolve this property
      // and replace it with the contents of an external file
      $httpBackend.when('GET', morphConf.attributes.fileUrl).respond(morphAttributes);

      configurator.defineConfiguration(conf1);
      $httpBackend.flush();

      var morphAttributesConf =
        configurator.configuration.plugins.morph.attributes;

      expect(morphAttributesConf).toEqual(morphAttributes);
    }));

    it('resolves references recursively - when an external file itself uses external files', inject(function(configurator) {
      var conf = {
        a: 1,
        fileUrl: 'x'
      };

      var file1 = {
        b: 2,
        fileUrl: 'y'
      };

      var file2 = {
        c: 3
      };

      var result = {
        a: 1,
        b: 2,
        c: 3
      };

      $httpBackend.when('GET', 'x').respond(file1);
      $httpBackend.when('GET', 'y').respond(file2);

      configurator.defineConfiguration(conf);
      $httpBackend.flush();

      expect(configurator.configuration).toEqual(result);
    }));
  });

  describe('this.mergeConfigurations', function() {
    it('merges two conf files', inject(function(configurator) {
      var conf1 = {
        x: {
          a: 1,
          d: [5],
          e: 7
        },
      };

      var conf2 = {
        x: {
          b: 2,
          d: [6],
          e: 8
        },
        y: {
          c: 3
        }
      };

      var expected = {
        x: {
          a: 1,
          b: 2,
          d: [5, 6],
          e: 8
        },
        y: {
          c: 3
        }
      };

      var actual = configurator.mergeConfigurations(conf1, conf2);
      expect(actual).toEqual(expected);
    }));
  });

  describe('this.configurationFor', function() {
    it('provides the configuration for a given plugin', inject(function(configurator) {
      // the configuration is usually provide from an external route
      configurator.configuration = { "text" : 'conf' };
      expect(configurator.configurationFor('text')).toEqual('conf');
    }));

    it('works on the top level (like main), as well as on sublevels (like plugins)', inject(function(configurator) {
      configurator.configuration = conf1;
      var getConf = function(name) {
        return configurator.configurationFor(name);
      };

      // main level
      expect(getConf('main')).toEqual(mainConf);
      // plugins
      expect(getConf('morph')).toEqual(morphConf);
      // resources
      expect(getConf('perseids')).toEqual(perseidsConf);
    }));
  });

  describe('this.delegateConf', function() {
    it('delegates a basic set of conf options to a given object', inject(function(configurator) {
      configurator.configuration = conf1;
      var obj = {};
      var defaultKeys = [
        'name',
        'main',
        'template',
        'external',
        'listener',
        'contextMenu',
        'contextMenuTemplate',
        'noView',
        'mode'
      ];

      obj.conf = configurator.configurationFor('morph');
      configurator.delegateConf(obj);

      angular.forEach(defaultKeys, function(key, i) {
        expect(obj.hasOwnProperty(key)).toBeTruthy();
      });
    }));

    it('an array of additional properties to delegate can be given', inject(function(configurator) {
      configurator.configuration = conf1;
      var obj = {};
      var results = [
        'name',
        'main',
        'template',
        'external',
        'listener',
        'contextMenu',
        'contextMenuTemplate',
        'noView',
        'a',
        'b'
      ];

      obj.conf = configurator.configurationFor('morph');
      configurator.delegateConf(obj, ['a', 'b']);

      angular.forEach(results, function(key, i) {
        expect(obj.hasOwnProperty(key)).toBeTruthy();
      });
    }));
  });

  describe('this.getConfAndDelegate', function() {
    it('convenience fn to get conf and delegate in one step', inject(function(configurator) {
      configurator.configuration = conf1;
      var obj = {};
      configurator.getConfAndDelegate('morph', obj, ['a']);
      expect(obj.name).toEqual('morph');
      expect(obj.conf).toBeTruthy();
      expect(obj.hasOwnProperty('a')).toBeTruthy();
    }));

    it('returns the given object', inject(function(configurator) {
      configurator.configuration = conf1;
      var obj = {};
      var res = configurator.getConfAndDelegate('morph', obj);
      expect(obj).toBe(res);
    }));
  });

  describe('this.getService', function() {
    it('retrieves an angular instance by name', inject(function(configurator) {
      expect(configurator.getService('x')).toEqual(mock1);
    }));
  });

  describe('this.getServices', function() {
    it('retrieves an object of angular instances by name', inject(function(configurator) {
      var names = ['x', 'y'];
      var services = configurator.getServices(names);
      expect(services).toEqual({ 'x' : mock1, 'y' : mock2 });
    }));

    it('returns an empty array when no service names are given', inject(function(configurator) {
      var services = configurator.getServices(undefined);
      expect(services).toEqual([]);
    }));
  });

  describe('this.provideResource', function() {
    it('provides resource objects', inject(function(configurator) {
      configurator.configuration = conf1;
      var perseidsResource = configurator.provideResource('perseids');

      expect(perseidsResource.route).toEqual(perseidsRoute);
    }));
  });
});
