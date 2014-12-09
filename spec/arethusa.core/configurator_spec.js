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

  var configurator, userPreferences;

  beforeEach(inject(function(_configurator_, _userPreferences_) {
    configurator = _configurator_;
    userPreferences = _userPreferences_;
  }));


  describe('this.defineConfiguration', function() {
    it('sets a configuration file', inject(function(configurator) {
      expect(configurator.configuration.main).toEqual({});
      configurator.defineConfiguration(conf1);
      expect(configurator.configuration.main).toEqual(mainConf);
    }));

    xit('resolves references to external files inside a configuration', inject(function(configurator) {
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

    xit('resolves references recursively - when an external file itself uses external files', inject(function(configurator) {
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

  describe('this.shallowMerge', function() {
    var conf1, conf2, result;

    beforeEach(function() {
      conf1 = {
        main: {
          debug: true,
          showKeys: false,
          plugins: ["text", "morph"]
        },
        plugins: {
          text: {
            main: false
          },
          morph: {
            retrievers: {
              morphRetriever: {
                resource: 'x'
              }
            },
            noRetrieval: false,
            attributes: {
              pos: 'posVal'
            }
          }
        }
      };

      conf2 = {
        main: {
          foldSidepanel: true,
          showKeys: true,
          plugins: ["text", "morph", "sg"]
        },
        plugins: {
          text: {
            main: true
          },
          morph: {
            retrievers: {
              morphRetriever: {
                resource: 'y'
              }
            },
            noRetrieval: true,
            attributes: {
              tmp: 'tmpVal'
            }
          }
        }
      };

      result = {
        main: {
          debug: true,
          foldSidepanel: true,
          showKeys: true,
          plugins: ["text", "morph", "sg"]
        },
        plugins: {
          text: {
            main: true
          },
          morph: {
            retrievers: {
              morphRetriever: {
                resource: 'y'
              }
            },
            noRetrieval: true,
            attributes: {
              tmp: 'tmpVal'
            }
          }
        }
      };

    });

    describe('shallow merges two configuration files', function() {
      it('merges main sections', function() {
        configurator.shallowMerge(conf1, conf2);
        expect(conf1.main).toEqual(result.main);
      });

      it('merges each defined plugin', function() {
        configurator.shallowMerge(conf1, conf2);
        expect(conf1.plugins).toEqual(result.plugins);
      });

      it('merges the complete files', function() {
        configurator.shallowMerge(conf1, conf2);
        expect(conf1).toEqual(result);
      });
    });
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
        'displayName',
        'main',
        'template',
        'external',
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
        'main',
        'template',
        'external',
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

    it('reads from an optional defaultConf property if need be', inject(function(configurator) {
      configurator.configuration = conf1;
      var obj = {
        defaultConf: {
          contextMenu: true
        }
      };
      obj.conf = configurator.configurationFor('morph');

      configurator.delegateConf(obj);
      expect(obj.contextMenu).toBeTruthy();
    }));

    it('sets global default values', inject(function(configurator) {
      configurator.configuration = conf1;
      var obj = {};
      obj.conf = configurator.configurationFor('morph');
      configurator.delegateConf(obj);
      expect(obj.mode).toEqual('editor');
    }));

    it('sets the displayName to the value of name when not specified explicitly', function() {
      configurator.configuration = conf1;
      var obj = { name: 'morph' };
      obj.conf = configurator.configurationFor('morph');
      configurator.delegateConf(obj);
      expect(obj.name).toEqual('morph');
      expect(obj.displayName).toEqual(obj.name);
    });

    it('allows to set displayName through configuration', function() {
      configurator.configuration = conf1;
      var obj = {
        name: "morph",
        conf: {
          displayName: 'morphology'
        }
      };
      configurator.delegateConf(obj);
      expect(obj.displayName).toEqual('morphology');
      expect(obj.name).toEqual('morph');
    });

    it("defaults don't override when they shouldn't", inject(function(configurator) {
      configurator.configuration = conf1;
      var obj = {};
      var conf = configurator.configurationFor('morph');
      obj.conf = angular.extend({ mode: 'viewer' }, conf);

      configurator.delegateConf(obj);
      expect(obj.mode).toEqual('viewer');
    }));

    it('globalDefaults can be configured', inject(function(configurator) {
      configurator.configuration = {
        main: {
          globalDefaults: {
            mode: 'customMode'
          },
          plugins: ['aPlugin']
        },
        plugins: {
          aPlugin: {}
        }
      };
      var obj = {
        conf: configurator.configurationFor('aPlugin')
      };

      configurator.delegateConf(obj);
      expect(obj.mode).toEqual('customMode');
    }));

    it('can honor sticky arguments through a third true arguemnt', function() {
      configurator.configuration = conf1;
      var obj = { conf: configurator.configurationFor('morph') };
      obj.defaultConf = {
        x: true,
        y: true
      };

      configurator.delegateConf(obj, ['x', 'y']);
      expect(obj.x).toBeTruthy();
      expect(obj.y).toBeTruthy();

      obj.x = false;
      obj.y = false;

      configurator.delegateConf(obj, ['x', 'y'], true);
      expect(obj.x).toBeFalsy();
      expect(obj.y).toBeFalsy();
    });

    it('retrieves configurations from userPreferences', function() {
      userPreferences.get = function(plugin, property) {
        if (plugin === 'morph' && property === 'x') {
          return 'success';
        }
      };

      configurator.configuration = conf1;
      var obj = { name: 'morph', conf: configurator.configurationFor('morph') };
      configurator.delegateConf(obj, ['x']);

      expect(obj.x).toEqual('success');
    });
  });

  describe('this.getConfAndDelegate', function() {
    it('convenience fn to get conf and delegate in one step', inject(function(configurator) {
      configurator.configuration = conf1;
      var obj = { name: 'morph' };
      configurator.getConfAndDelegate(obj, ['a']);
      expect(obj.conf).toBeTruthy();
      expect(obj.hasOwnProperty('a')).toBeTruthy();
    }));

    it('returns the given object', inject(function(configurator) {
      configurator.configuration = conf1;
      var obj = { name: 'morph' };
      var res = configurator.getConfAndDelegate(obj);
      expect(obj).toBe(res);
    }));
  });

  describe('this.getStickyConf', function() {
    function setup() {
      configurator.configuration = conf1;
      var obj = {
       name: 'morph',
       defaultConf: { preselect: true }
      };
      configurator.getStickyConf(obj, ['preselect']);
      return obj;
    }

    it('acts just like getConfAndDelegate when the value is undefined', inject(function(configurator) {
      var obj = setup();
      expect(obj.preselect).toBeTruthy();
    }));

    it('will not override a manually set value on a second call', function() {
      var obj = setup();
      expect(obj.preselect).toBeTruthy();
      obj.preselect = false;
      configurator.getStickyConf(obj, ['preselect']);
      expect(obj.preselect).toBeFalsy();
    });
  });

  describe('this.addPluginConf', function() {
    var pluginName = 'added_plugin';
    function confForAddedPlugin(configurator) {
      return configurator.configuration.plugins[pluginName];
    }
    it('adds configuration for a plugin', function() {
      configurator.configuration = conf1;

      expect(confForAddedPlugin(configurator)).toBeUndefined();

      var newConf = { x: true };

      configurator.addPluginConf(pluginName, newConf);
      var result = confForAddedPlugin(configurator);

      expect(result).toBe(newConf);
    });
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
