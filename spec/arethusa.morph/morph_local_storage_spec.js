"use strict";

describe("morphLocalStorage", function() {
  var morphLocalStorage;

  beforeEach(function() {
    module("arethusa.core", function($provide) {
      $provide.value('configurator', arethusaMocks.configurator());
      $provide.value('plugins', arethusaMocks.plugins());
      $provide.value('arethusaLocalStorage',arethusaMocks.arethusaLocalStorage());
    });

    module('arethusa.morph');

    inject(function(_morphLocalStorage_) {
      morphLocalStorage = _morphLocalStorage_;
      morphLocalStorage.comparator = function(a,b) { return a.lemma === b.lemma && a.postag === b.postag; };
    });
  });

  describe('this.addForm', function() {
    it('adds a new Form', function() {
      var form = { lemma: 'ma', postag: 'a-------', selected: true };
      var form_stored = { lemma: 'ma', postag: 'a-------', selected: false };
      morphLocalStorage.addForm('mare',form);
      var retrieved;
      morphLocalStorage.retriever.getData('mare',function(data){retrieved = data;});
      expect(retrieved).toEqual([form_stored]);
    });

    it('updates a form', function() {
      var form = { lemma: 'ma', postag: 'a-------', selected: false };
      var form2 = { lemma: 'ma', postag: 'v-------', selected: false };
      morphLocalStorage.addForm('mare',form);
      morphLocalStorage.addForm('mare',form2);
      var retrieved;
      morphLocalStorage.retriever.getData('mare',function(data){retrieved = data;});
      expect(retrieved).toEqual([form,form2]);
    });
  });

  describe('this.addForms', function() {
    it('adds a set of new Forms', function() {
      var forms = [ { lemma: 'ma', postag: 'a-------', selected: false }, { lemma: 'mas', postag: 'n-------', selected: false }];
      morphLocalStorage.addForms('mare',forms);
      var retrieved;
      morphLocalStorage.retriever.getData('mare',function(data){retrieved = data;});
      expect(retrieved).toEqual(forms);
    });
    it('updates a set of new Forms', function() {
      var form = { lemma: 'ma', postag: 'a-------', selected: false };
      morphLocalStorage.addForm('mare',form);
      var forms = [ { lemma: 'ma', postag: 'v-------', selected: false }, { lemma: 'mas', postag: 'n-------', selected: false }];
      morphLocalStorage.addForms('mare',forms);
      var retrieved;
      morphLocalStorage.retriever.getData('mare',function(data){retrieved = data;});
      forms.unshift(form); 
      expect(retrieved).toEqual(forms);
    });
  });

  describe('this.removeForm', function() {
    it('removes a form', function() {
      var form = { lemma: 'ma', postag: 'a-------', selected: false };
      morphLocalStorage.addForm('mare',form);
      var retrieved;
      morphLocalStorage.retriever.getData('mare',function(data){retrieved = data;});
      expect(retrieved).toEqual([form]);
      morphLocalStorage.removeForm('mare', { lemma: 'ma', postag: 'a-------'});
      morphLocalStorage.retriever.getData('mare',function(data){retrieved = data;});
      expect(retrieved).toEqual([]);
    });
    it('does not remove a non-matching form', function() {
      var form = { lemma: 'ma', postag: 'a-------', selected: false };
      morphLocalStorage.addForm('mare',form);
      var retrieved;
      morphLocalStorage.retriever.getData('mare',function(data){retrieved = data;});
      expect(retrieved).toEqual([form]);
      var badForm = { lemma: 'ma', postag: 'v-------', selected: false };
      morphLocalStorage.removeForm('mare', badForm);
      morphLocalStorage.retriever.getData('mare',function(data){retrieved = data;});
      expect(retrieved).toEqual([form]);
    });
  });

  describe('this.addPreference', function() {
    it('stores a form preference',function(){
      var form = { lemma: 'ma', postag: 'a1' };
      morphLocalStorage.addPreference('mare',form);
      var retrieved = morphLocalStorage.getPreferences();
      expect(retrieved.mare).toEqual('1$$ma|-|a1@@1');
    });

    it('adds to a list of form preferences',function(){
      var form = { lemma: 'ma', postag: 'a1' };
      morphLocalStorage.addPreference('mare',form);
      var retrieved = morphLocalStorage.getPreferences();
      expect(retrieved.mare).toEqual('1$$ma|-|a1@@1');
      var form2 = { lemma: 'mas', postag: 'b---------' };
      morphLocalStorage.addPreference('mare',form2);
      retrieved = morphLocalStorage.getPreferences();
      expect(retrieved.mare).toEqual('1$$ma|-|a1@@1;;mas|-|b---------@@1');
    });
    it('updates the count of a preference',function(){
      var form = { lemma: 'ma', postag: 'a1' };
      morphLocalStorage.addPreference('mare',form);
      var retrieved = morphLocalStorage.getPreferences();
      expect(retrieved.mare).toEqual('1$$ma|-|a1@@1');
      morphLocalStorage.addPreference('mare',form);
      retrieved = morphLocalStorage.getPreferences();
      expect(retrieved.mare).toEqual('1$$ma|-|a1@@2');
      var form2 = { lemma: 'mas', postag: 'b---------' };
      morphLocalStorage.addPreference('mare',form2);
      morphLocalStorage.addPreference('mare',form);
      retrieved = morphLocalStorage.getPreferences();
      expect(retrieved.mare).toEqual('1$$ma|-|a1@@3;;mas|-|b---------@@1');
      morphLocalStorage.addPreference('mare',form2);
      retrieved = morphLocalStorage.getPreferences();
      expect(retrieved.mare).toEqual('1$$ma|-|a1@@3;;mas|-|b---------@@2');
    });
  });

  describe('this.addPreferences',function() {
    it('imports and updates a preference', function() {
      var form = { lemma: 'ma', postag: 'a1' };
      morphLocalStorage.addPreference('mare',form);
      var imported = '1$$ma|-|a1@@3;;mas|-|b---------@@2';
      morphLocalStorage.addPreferences('mare',imported);
      var retrieved = morphLocalStorage.getPreferences();
      expect(retrieved.mare).toEqual('1$$ma|-|a1@@4;;mas|-|b---------@@2');
    });
    it('imports a new preference',function() {
      var imported = '1$$ma|-|a1@@3;;mas|-|b---------@@2';
      morphLocalStorage.addPreferences('mare',imported);
      var retrieved = morphLocalStorage.getPreferences();
      expect(retrieved.mare).toEqual('1$$ma|-|a1@@3;;mas|-|b---------@@2');
    });
  });

  describe('this.sortByPreference', function() {
    it('sorts form preferences', function() {
      var imported = '1$$ma|-|a1@@3;;mas|-|b1@@2';
      morphLocalStorage.addPreferences('mare',imported);
      var formsToSort =  [ { lemma: 'mas', postag: 'b1' }, {lemma: 'ma', postag: 'a1'}, {lemma: 'mas', postag: 'c1'} ];
      var sorted = morphLocalStorage.sortByPreference('mare',formsToSort);
      expect(sorted).toEqual( [ { lemma: 'ma', postag: 'a1' }, {lemma: 'mas', postag: 'b1'}, {lemma: 'mas', postag: 'c1'} ]);
    });
    it('handles unknown forms', function() {
      var formsToSort =  [ { lemma: 'mas', postag: 'b1' }, {lemma: 'ma', postag: 'a1'}, {lemma: 'mas', postag: 'c1'} ];
      var sorted = morphLocalStorage.sortByPreference('mare',formsToSort);
      expect(sorted).toEqual( formsToSort);
    });
  });

  describe('this.getPreferences', function() {
    it('gets preferences', function() {
      var retrieved = morphLocalStorage.getPreferences();
      expect(retrieved).toEqual({});
      var form = { lemma: 'ma', postag: 'a1' };
      morphLocalStorage.addPreference('mare',form);
      retrieved = morphLocalStorage.getPreferences();
      expect(retrieved).toEqual({mare: '1$$ma|-|a1@@1'});
    });
  });

  describe('this.getForms', function() {
    it('gets forms', function() {
      var retrieved = morphLocalStorage.getForms();
      expect(retrieved).toEqual({});
      var form = { lemma: 'ma', postag: 'a1', selected: true };
      morphLocalStorage.addForm('mare',form);
      retrieved = morphLocalStorage.getForms();
      expect(retrieved).toEqual({mare: [ { lemma: 'ma', postag: 'a1', selected: false} ]});
    });
  });

  describe('this.readPreference', function() {
    it('reads a properly versioned preference', function() {
      var read = morphLocalStorage.readPreference('1$$ma|-|aa@@1');
      expect(read).toEqual([{form: { lemma: 'ma', postag: 'aa' }, count: 1}]);
      read = morphLocalStorage.readPreference('1$$ma|-|aa@@1;;xx|-|bb@@2');
      expect(read).toEqual([{form: { lemma: 'ma', postag: 'aa' }, count: 1}, {form: { lemma: 'xx', postag: 'bb'}, count: 2 }]);
    });
    it('ignores unsupported versioned preferences', function() {
      var read = morphLocalStorage.readPreference('2$$ma|-|aa@@1');
      expect(read).toEqual([]);
      read = morphLocalStorage.readPreference('0$$ma|-|aa@@1');
      expect(read).toEqual([]);
    });
    it('ignores an unversioned preference', function() {
      var read = morphLocalStorage.readPreference('ma|-|aa@@1');
      expect(read).toEqual([]);
    });

  });

});
