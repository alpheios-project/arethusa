// Currently unused, cf. the comment in loader.js
//
//
//"use strict";

//describe("Loader", function() {
  //beforeEach(module("arethusa.core"));

  //var loader;
  //beforeEach(inject(function(_Loader_) {
    //// this indirection is just there to satisfy jshint
    //var Constructor = _Loader_;
    //loader = new Constructor();
  //}));

  //describe("declareUnloaded", function() {
    //it('declares an object unloaded', function() {
      //var obj = {};
      //loader.declareUnloaded(obj);
      //expect(loader.allLoaded()).toBeFalsy();
    //});

    //it('obj can be declaredUnloaded multiple times', function() {
      //var obj = {};
      //loader.declareUnloaded(obj);
      //loader.declareUnloaded(obj);

      //expect(loader.allLoaded()).toBeFalsy();

      //loader.declareLoaded(obj);
      //expect(loader.allLoaded()).toBeFalsy();

      //loader.declareLoaded(obj);
      //expect(loader.allLoaded()).toBeTruthy();
    //});
  //});

  //describe('declareLoaded', function() {
    //it('declares an object loaded', inject(function(Loader) {
      //var loader = new Loader();
      //var obj = {};
      //loader.declareUnloaded(obj);
      //loader.declareLoaded(obj);
      //expect(loader.allLoaded()).toBeTruthy();
    //}));
  //});
//});
