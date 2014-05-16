"use strict";

describe('configurator', function() {
  var mock1 = {};
  var mock2 = {};

  // stubs that mimick the markup of configuration JSON files.
  // Drawn out to different variables for easier testing, usually this
  // would come as a single file.


  var mainConf = {
    template: 'templates/main.html',
    retrievers: [
      'treebankRetriever'
    ],
    plugins: [
      'text',
      'morph'
    ]
  };

  var morphConf = {
    name: 'morph',
    template: 'templates/morph.html',
    retrievers: [
      'fakeMorphRetriever',
      'bspMorphRetriever'
    ],
    attributes: {
      fileUrl: 'confics/morph/aldt.json'
    }
  };

  var morphRetrieverConf = {
    resource: 'morphologyService'
  };

  var perseidsRoute = "http://services.perseids.org/:doc.xml";

  var perseidsConf = {
    route: perseidsRoute,
    params: ["doc"]
  };

  var conf1 = {
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

    retrievers: {
      treebankRetriever: {
        resource: 'perseids' // this could be an array at some point - fallback resources?
      },
      bspMorphRetriever: morphRetrieverConf
    },

    resources: {
      perseids: perseidsConf,
      morphologyService: {
        route: "http://services.perseids.org/bsp"
      }
    }
  };

  beforeEach(module('arethusa', function($provide) {
    $provide.value('x', mock1);
    $provide.value('y', mock2);
  }));

  describe('this.defineConfiguration', function() {
    it('sets a configuration file', inject(function(configurator) {
      expect(configurator.configuration).toBeUndefined();
      configurator.defineConfiguration(conf1);
      expect(configurator.configuration).toBeDefined();
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
      // retrievers
      expect(getConf('bspMorphRetriever')).toEqual(morphRetrieverConf);
      // resources
      expect(getConf('perseids')).toEqual(perseidsConf);
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
