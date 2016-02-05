# Bootstrapping Arethusa

Arethusa’s index.html has the ng-app directive with parameter “arethusa” on the html tag.

```coffee
@app/index.html:2
<html ng-app="arethusa" ng-di-strict>
```

This causes the Angular framework to first load all attached constants and then all configurations in the order they were registered with the “arethusa” module. There’s one config and it’s used to define the routes, in particular the MAIN\_ROUTE.

```coffee
@app/js/arethusa.js:37
$routeProvider.when('/:conf', MAIN_ROUTE);
```

Throught he resolve property, the main route loads a configuration file `(@main.js:19)` and runs it through the configurator service.

```coffee
@app/js/arethusa.core/routes/main.js:21
configurator.defineConfiguration(res.data, url);
```

After the configuration service saved the settings in a variable it broadcasts a ‘confLoaded’ event.

```coffee
@app/js/arethusa.core/configurator.js:102
$rootScope.$broadcast('confLoaded');
```

The event is caught by two event listeners in the Global Settings service and the Arethusa controller.

```coffee
@app/js/arethusa.core/global_settings.js:302
$rootScope.$on('confLoaded', loadLayouts);
```

```coffee
@app/js/arethusa.core/arethusa_ctrl.js:22
$scope.$on('confLoaded', bootstrap);
```

