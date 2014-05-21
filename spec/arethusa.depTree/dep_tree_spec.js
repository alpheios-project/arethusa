"use strict";

describe('arethus.depTree', function() {
  var mockState = {
    tokens : {
      1: {
        "id": "0001",
        head: {
          "id": "0002"
        },
        string: "Cum",
        relation: {
          label: "AuxC"
        }
      },
      2: {
        "id": "0002",
        head: {
          "id": "0000"
        },
        string: "que",
        relation:  {
          label: "Coord"
        }
      }
    }
  };

  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },
    getServices: function(name) {
      return [];
    }
  };

  beforeEach(module('arethusa.depTree', function($provide) {
    $provide.value('state', mockState);
    $provide.value('configurator', mockConfigurator);
  }));

  // The following code was moved to a directive, which is a little harder
  // to test unfortunately...

  //describe('createDigraph', function() {
    //it('creates nodes and edges', inject(function(depTree, state, configurator) {
      //var digraph = depTree.createDigraph();

      //expect(digraph).toBeDefined();
      //expect(digraph.nodes().length).toEqual(3);
      //expect(digraph.edges().length).toEqual(2);
    //}));
  //});
});
