"use strict";

angular.module('arethusa.tei').service('tei', [
  'state',
  'configurator',
  function(state, configurator) {
    // TODO
    //
    // - Retrieval stuff needs to be extracted from here - don't want
    //   to call this on init really.
    // - Communication with the navigator to determine chunks

    var self = this;
    this.name = 'tei';

    var retriever, tei;

    this.defaultConf = {
      template: 'templates/arethusa.tei/tei.html'
    };

    function configure() {
      configurator.getConfAndDelegate(self);
      retriever = configurator.getRetriever(self.conf.retriever);
    }

    function xPath(xml, xpath) {
      xpath = xpath || '//w|//pc';
      return xml.evaluate(xpath, xml, null, 5, null);
    }

    function serialize(xml) {
      return serializer.serializeToString(xml);
    }

    var parser = new DOMParser();
    var serializer = new XMLSerializer();

    function get(res) {
      tei = parser.parseFromString(res, 'text/xml');
      defineTeiTemplate(tei, '//body');
    }

    function defineTeiTemplate() {
      var body = xPath(tei, '//body');
      self.teiTemplate = serialize(body.iterateNext());
    }

    this.init = function() {
      configure();
      retriever.get(get);
    };
  }
]);
