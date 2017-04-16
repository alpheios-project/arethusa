TODO intro

-------------------------

We will cover the following topics:

- Using [arethusa-cli](https://github.com/latin-language-toolkit/arethusa-cli) to rapidly create our development environment
- Writing a simple plugin that enhances Arethusa's treebanking environment through test-driven development

Make sure you have the following components installed before we begin
- git
- node.js
- ruby

### Setting up the dev environment

[arethusa-cli](https://github.com/latin-language-toolkit/arethusa-cli)
provides a command line interface to help with common tasks needed when
working with Arethusa. It especially provides lots of code generators,
that help us to reduce the amount of boilerplate code we have to write
and also guarantees us stylistic coherence.

We can install by executing

```
$ gem install arethusa-cli
```
in our terminal.

This gives us access to the executable `arethusa`. If we type `arethusa`
in our terminal we can see a list of available commands - we will become
acquainted with some of them during the course of this tutorial.

The command we are interested in right now is
```
$ arethusa init NAMESPACE NAME
```

The `init` command will setup a new git repository that will contain a
code skeleton for our plugin, as well as lots of development tools to
speed up our workflow.

The command takes two arguments:
- The namespace under which we want to release our plugin
- And the name of the plugin itself.

Let's start by executing

```
$ arethusa init perseids translations
```

This will create a new directory, backed up by git, called
`perseids.translations`. Mind that the command will take a while to be
finished - the amount of `node.js` dependencies that need to be drawn in
is truly absurd. All of these dependencies are only needed for our
development tools, they will not affect the physical size of your
plugin.

Once the `init` command has finally come to an end, let us take a look
at the files it generated:

```
$ cd perseids.translations
$ ls

app/ bower_components/ bower.json dist/ Gruntfile.js node_modules/
package.json spec/

```

If we look at the `bower.json` file first, you'll see that a
`perseids.translations` package has been setup, with a dependency to the
main `arethusa` application.

`package.json` uncovers why the `init` command took so long to execute:
Lots of development dependencies, almost all of them related to `grunt`.

`Arethusa` uses `grunt` as its task runner. `grunt` will allow us to
automate minification, compilation, unit testing, linting and much more.

`init` also provides us with a fully functional `Gruntfile.js`. We won't
go into details here - the last 4 commands are really all we will need.

To get a first glance at what `grunt` is doing for us, type

```
$ grunt
```

The default `grunt` tasks executes our automated spec suite and runs the
`jshint` linter, which will detect errors and potential problems in our
javascript code, ideally before they start to bite us.

You should see that we already have a green unit test and 4 files that
are lint free.

We will get back to `grunt` a little later, but first let's resume our
tour through the generated files.

The `app` folder will be the place where almost all of our code goes.
It's important to follow the structure that's already been setup to make
the most out of automated build tasks.

```
app/
  css/
    perseids.translations.scss
  index.html
  js/
    perseids.translations/
      translations.js
    perseids.translations.js
  static/
    configs/
      staging.json
  templates/
    perseids.translations/
      compiled/
      translations.html
```

The `css` directory uncovers that we are using
[scss](http://sass-lang.com/guide) extension to streamline the work with
our stylesheets. You don't have to bother about compiling such files to
proper `css` - `grunt` will take care of this for us. We also use the
Mixin library [Bourbon](http://bourbon.io) to help us with vendor-prefixes and
other fun parts of `css`.

The `index.html` file will be our go-to place when we finally start up a
server and want to see work in the browser.

Most of our code will go into the `js` directory. The
`perseids.translations.js` file we usually won't have to touch: It just
contains the definition of our `Angular` module, which we will use to
place our code in. It's very important to do this to guarantee that
Arethusa can figure out where it can obtain our plugin code dynamically
at runtime.

The subdirectory `perseids.translations` holds the main business logic
of our plugin - we will play around (and add to) `translations.js` soon.

`static/configs` provides an example configuration file. Such
configuration files are one of the most important aspects of `Arethusa`.
They allow us to define the internals of an `Arethusa` application:
Plugins we'd like to participate and their behaviour, the HTML templates
we want to use, URLs to external services and much more.

Conf files are plain JSON files, with a slightly enhanced syntax to
facilitate reuse. `Arethusa` uses the `arethusa-cli` tool to parse these
files and compile them to valid JSON. This is of course another
automated process which we will encounter a little later.

All our HTML goes into the `templates` directory. A standard text
template for our `translations` plugin can already be found there. As we
will do our coding in a test-driven way, we can pass over templating for now -
but will of course revisit this important chapter at a later stage.

The other directories in the `app` folder we can safely ignore:
`bower_components` and `node_modules` were automatically created during
our installation through our `init` command and hold all third-party
code on which we are dependent, the `dist` folder is a placeholder and will be
the destination of all automatically generated files that our `grunt`
build tasks will produce.

The `spec` folder on the other hand is an important one and will also be
the first place we will enter to start coding. But before we do that,
let's take a step back and think about what our plugin should actually do.


### What the `translations` plugin should do


The goal is to add a simple plugin, which allows us to add
translations to a sentence during a treebanking session.

To achieve this we assume that we have access to a backend-server that
stores translations at the document level and exposes them through a RESTful JSON API.

```
GET /translations/DOC_ID

```

Given a document with an identifier `caes1`, which contains the
following two sentences
```
Gallia est omnis divisa in partes tres.
Quarum unam incolunt Belgae.

```
a call to our API `GET /translations/caes1` will give us the JSON

```
{ 
  "1" : "Gaul as a whole is divided into three parts.",
  "2" : "The Belgae inhabit one of these."
}

```

`Arethusa`'s treebanking interface displays documents one sentence at a
time. We want to display the correct translation along with the sentence's
tree.

Eventually we will also want to edit a translation and save it
back to our server through

```
POST /translations/DOC_ID 
```

Mind that this is a very simplified example. In the real world we would
most likely deal with additional problems:
- Translations will not be perfectly aligned on a sentence level
- Our backend-server will not respond with such easy to parse JSON

We will enhance our plugin in future guides to deal with these issues -
for now let's keep it simple and focus on the `Arethusa` mechanics
first.


### Coding the plugin - test-driven

Now that we know what we want to we're ready to start.

We will do this in a **test-driven** manner.

Writing good tests is not easy - but the value they provide is
absolutely worth the effort. They not only give us automated tests,
which allow us to easily check in the future if our code is really still
running - they will guide our design decisions and make sure that we
don't couple different participants of our business logic too tightly and
keep all concerns separated. In addition, they will also clearly document the
behaviour of our code.

If we take a look at `spec/perseids.translations/translations_spec.js`
we will see that the `init` command has already spared us from writing
roughly 20 lines of boilerplate code.

```javascript
"use strict";

describe('translations', function() {
  var translations;

  var conf = {};

  beforeEach(function() {
    module("arethusa.core");

    module('perseids.translations');

    inject(function(_translations_, configurator) {
      translations = _translations_;
      configurator.defineConfiguration(conf);
      translations.init();
    });
  });

  // Write your specs here!
  it('succeeds to load the plugin', function() {
    expect(translations).toBeDefined();
  });
});

```

The most important thing here is the call of `beforeEach`. This function
will setup a clean test and functional environment before every unit
test we are going to write.

First it defines two modules:

```javascript
  module("arethusa.core");
  module('perseids.translations');
```

`arethusa.core` is `Arethusa`'s main module where all the important
services and factories are located. Every plugin will use at least some
of the code inside this module - `translations` is no exception here.

The `perseids.translations` module is, as we have mentioned before, the
place where all code of the plugin we are currently developing lives and
is therefore also mandatory to present inside the scope of this spec
file.

`inject` is a helper function provided by
[angular-mock](http://docs.angularjs.org/api/ngMock), which is declared
when using a testing framework like [jasmine](http://jasmine.github.io) - which is exactly what we use to write our specs.

`Angular` relies heavily on [Dependency
Injection](http://docs.angularjs.org/guide/di). As we want to use
specific parts of the `Angular` and `Arethusa` code in our tests, we
have to inject these items into the scope of every unit test function.

`init` already injected our `translations` service and the
`configurator`. (if the weird underscore syntax is confusing you, be
sure to check out the documentation for [inject](http://docs.angularjs.org/api/ngMock/function/angular.mock.inject))

The `configurator` is one of the most important services offered by
`Arethusa`. It grants access to the configuration files that drive
`Arethusa` and provides functions to organize your communication with
them. You should never have to deal with configuration files directly -
always do this through the `configurator`.

As we can see, `init` has placed a call to
`configurator.defineConfiguration(conf)`, where `conf` currently is just
an empty object.

This is a function you will also **never** have to call directly. When
`Arethusa` runs in a browser, specific events will trigger such a call
automatically. Only in our spec suite, we want to control the flow of
the application by hand and have to deal with `Arethusa`'s low level
functions.

The same goes for the next call `translations.init()`. Plugins' init
functions are very important and will get called frequently. They setup a
plugin and update the internal state of a plugin. When `Arethusa` moves
between chunks of documents, the annotation targets change. Every time
this happens, the plugins react and update themselves.

This might sound a little too abstract, a real example will make this more clear: 
In treebanking the current annotation target will most likely be a
single sentence. When `Arethusa` loads a sentence, it exposes this
information to all plugins - they deal with the new information inside
their `init()` function. Once a user moves to a next sentence, this
workflow is repeated: `Arethusa` exposes the new annotation target
again, calls all `init()` functions to give the plugins a chance to
update.

`Arethusa`'s event chain is responsible for triggering this behaviour. Three
objects play an important role here: 
- The `ArethusaCtrl`, which is the top-level controller inside the
  browser and which will call the `init()` functions at the right time. 
- `state` which holds all information concerning the current annotation
  target. It also fires an event when this target changes - an event
which the `ArethusaCtrl` reacts to.
- The `navigator` which is responsible for movement inside a document.
  It communicates with `state` to let it know when a user wants to look at
a different document chunk.

These three objects build the main event chain:
- `navigator` broadcasts the move to a new chunk
- `state` loads the new chunk and broadcasts when ready
- `ArethusaCtrl` re-`init()`s the plugins

When unit testing we have to (and want to) control this event flow
manually. With this knowledge in the back of our head, we can start to
write our first (failing) unit test.


### Writing specs

Let's add translations for two sentences which we can test against. We
will want to have access to them in many places, so we define them
inside the scope of the main `describe` function:

```javascript
"use strict";

describe('translations', function() {
  var translations;

  var conf = {};

  var s1 = "Gaul as a whole is divided into three parts.";
  var s2 = "The Belgae inhabit one of these.";

  // ...
```

Our `beforeEach` function already called `translations.init()` - when
nothing else is explicitly declared, we can safely assume, that an
annotation session will start at the first sentence of a document. After
the first `init()` we should therefore hold a reference to "Gaul as a
whole...".

To run our spec suite let's open another terminal window, move to our
new plugin repository and execute

```
$ grunt spec
```

You should now see something like

```
Running "watch:spec" (watch) task
Waiting...
```

This is a very handy task: Everytime we make a change to one of our
source or spec files, it will automatically run our test suite - we
don't want to execute it manually and can completely focus on our code.

In another terminal window we open up our
`spec/perseids.translations/translations_spec.js` file again and add the
following:


```javascript
describe('on startup', function() {
  it('exposes the translation of the current (i.e. first) sentence', function() {
    expect(translations.translation).toEqual(s1);
  });
});
```

Once you saved your changes, you will see our `watch` task executing -
and we will have a first failing spec. `translations.translation` is of
course `undefined` as we haven't written any code for this yet.

The first thing we need to do is to actually obtain our translation data
from somewhere. `Arethusa` provides tools for doing this: the so-called
`Retrievers`.


### Our first `Retriever`

One of `Arethusa`'s key principles is to stay as backend-independent as
possible, while still making use of as many external services as
possible.

This approach has two immediate benefits:
- We don't couple our plugin code to the API of a specific backend - we
  can therefore exchange backends without touching our plugin code.
- If we need to write a service that doesn't exist yet, it's a good
  practice to do it in a RESTful way - other people might be able to
leverage such APIs to solve completely different problems.

It therefore goes that a plugin service should never directly
communicate with a backend. It should use `Retrievers` to do so. The
plugin's responsibility is to define an interface which declares what
kind of data a `Retriever` should provide - one (or in other cases
several) `Retrievers` will then call external services, work with their
response and transform it to something the plugin can easily work with.

A plugin knows which `retrievers` to use by configuration. Let's add to
the empty conf object at the top of our spec file.

```javascript
var conf = {
  "plugins": {
    "perseids.translations" : {
      "retriever" : {
        "PerseidsTranslationRetriever" : {}
      }
    }
  },
};
```

All plugin configuration goes inside a `plugins` object. We specify the
full name of our plugin and add a single retriever for it. The empty
object for it would usually contain the configuration of this retriever
instance - but as we are testing our plugin service here and **not** the
retriever we are not interested in this right now.

In a realistic scenario the configuration we just defined in this `conf` object is normally a JSON file - our repository already holds one such file in `app/static/configs/staging.json`. If you take a look at this file, you'll see that we just mimicked the structure of the JSON's plugin configuration.

After we saved our changes, the `watch` task reveals that nothing has
changed. We have written the configuration, but we still have to tell
the `translations` service that we want to make use of it.

Time to take a look at the service's code in
`app/js/perseids.translations/translations.js`.


### The main business logic of a plugin

```javascript
"use strict";

angular.module('perseids.translations').service('translations', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    this.name = 'perseids.translations';

    this.defaultConf = {
      template: 'templates/perseids.translations/translations.html'
    };

    function configure() {
      configurator.getConfAndDelegate(self);
    }

    this.init = function() {
      configure();
    };
  }
]);
```

The CLI tool has already provided us with a skeleton for our plugin
service.
We see that it injected two of `Arethusa`'s main services already:
`state` and `configurator`. Usually plugins will want to communicate
with the `state` to know what a user is doing - we'll keep this for
later, even if we don't need it during our next steps.

The `configurator` on the other hand is of immediate use, as it grants us
access to the plugins configuration - and will also help us to set up
our retriever.

We already hold a reference to `this` in a `self` variable, so that we
never run into scoping issues of `this` when we don't want to.

The plugin's name is important: It reads `perseids.translations`. This
is the internal name `Arethusa` will use to reference this plugin. If
you think back on the `conf` object we just defined in our `spec` file,
this was also the name we used to store the plugin's configuration.

It's usually a good practice to define a `defaultConf` object inside a
plugin, so that others don't have to define each and every trivial
configuration detail of a plugin. This is a naming convention used by
`Arethusa`'s `configurator`. It will look for a property with this 
name on the plugin object during the initialization process for a plugin,
as initiated by the `configurator.getConfAndDelegate` method call issued 
from the plugin's `configure` method. The `defaultConf` method in our
`perseids.translations` boilerplate code defines the path to the default 
HTML template. A configuration file can of course override this - but if 
it doesn't specify a template, the `defaultConf` will step and provide a 
fallback.

Here we also find the `init()` function we have already talked about
quite a bit in one of the sections above - as a reminder: This function
will always get called, when `Arethusa`'s `state` changed - and so give
the plugin a chance to update itself.

The CLI tool has already placed a call to the private `configure`
function there - a function, that calls
`configurator.getConfAndDelegate(self)`.

As we have properly defined the `name` of our plugin, the configurator
will know how to setup our plugin correctly. It will also delegate
important configuration properties directly to the service, so that we
can easily access them inside our application code.

It might seem redundant to re-configure the plugin on every `init()`
call - but it is not. Documents are allowed to override details
of `Arethusa`s  configuration. It is therefore possible that a move to a
next document chunk (which will trigger a call of `init()`) re-defines a
plugins configuration. This is not a very frequent case, but as it
possible, we need to be careful and check if our configuration is always
up-to-date.

Let's fetch our retriever:

```javascript
function(state, configurator) {
  var self = this;
  this.name = 'perseids.translations';

  var retriever;

  // ...

  function configure() {
    configurator.getConfAndDelegate(self);
    retriever = configurator.getRetriever(self.conf.retriever);
  }

  // ...
```

We just declared a private `retriever` variable, placed inside the
plugin's scope, because we definitely want to have access to it from
other functions.

Inside the `configure()` function we assign a new retriever instance to
this variable. We use the `configurator`'s `getRetriever` function to do
this, as the `configurator` knows how to setup a retriever properly.

We need to pass the retriever's configuration to this function.
`self.conf` holds complete configuration of our plugin and was made
available to us by the `configurator`'s `getConfAndDelegate` function.

If we save our changes to `translations.js` we will see movement in our
`watch` task: It stills fails - but more dramatically than before.

As we have configured our plugin to use a retriever instance of
`PerseidsTranslationsRetriever`, our `configurator` now wants to
initialize such an object - which is impossible because it's not
defined anywhere.

We've mentioned before that our current spec isn't interested in the
internals of a retriever at all, we can therefore safely mock it up
inside our `translations_spec.js` file.

```javascript
beforeEach(function() {
  module("arethusa.core");

  module('perseids.translations', function($provide) {
    $provide.value("PerseidsTranslationRetriever", function() {});
  });

  // ...
```
`Angular` provides fantastic tools to mock-up complete instances or
decorate them efficiently. In this case we use the `$provide` service to
declare a `PerseidsTranslationRetriever` inside our
`perseids.translations` module. `Arethusa`'s retrievers are factories
that return constructor functions - the `configurator` deals with
`new`'ing them correctly.

Right now we just say that `PerseidsTranslationRetriever` is an empty
function to get rid of the long error message we have just seen in our
`watch` task.

When we save, we can examine that we are back to our first error message - `translations.translation` is still `undefined`, but we're already an important step closer.

Let's define how we want our retrievers to behave:

```javascript
module('perseids.translations', function($provide) {
  $provide.value("PerseidsTranslationRetriever", function() {
    this.get = function(chunkId, callback) {
      callback(chunkId === "1" ? s1 : s2);
    };
  });
});
```

We want the retriever respond to a `get` function, which takes two
arguments:
- The id of the current chunk (in our scenario, a sentence)
- and a callback function, to which we pass the translation of the current
  chunk.

When the `chunkId` is `"1"`, we pass the first sentence, otherwise the
second - this should suffice to produce a valid test.

Remember that we have defined the variables `s1` and `s2` before:

```javascript
var s1 = "Gaul as a whole is divided into three parts.";
var s2 = "The Belgae inhabit one of these.";
```

We can make use of this `get` function inside of our service now.


```javascript
function updateTranslation(translation) {
  self.translation = translation;
}

this.init = function() {
  configure();
  retriever.get('1', updateTranslation);
};
```
Inside of `init()` we call the retriever right after we have configured
our plugin. We pass the `retriever`'s get function a `chunkId` (so far
just `'1'` - this hardcoded reference will be dealt with later) and a 
callback function. Inside the callback function
`updateTranslation`, which takes a single argument - the current
translation itself - we assign `self.translation`. (It's important to
use `self` and not `this` - if you try to use `this` you will quickly
see why this is not really a good idea).

If we save we can see that - our test is green!


### Reacting to changes of the current chunk

Let's add another spec. We want when we move to the next sentence
for our plugin to know how to update its translation. We've mentioned
before that moves between document chunks are handled by the
`navigator`.

```javascript
describe('when a chunk is changed', function() {
  it('updates the current translation properly', function() {
    navigator.nextSentence();
    expect(translations.translation).toEqual(s2);
  });
});
```

The `navigator` has a `nextSentence()` function - which does just what
it should: It moves `Arethusa` to the next sentence.
After we call `navigator.nextSentence()` we expect our plugin to provide
the translation of our second test sentence.

Our `watch` spec immediately tells us, that `navigator` is `undefined`,
which is of course correct - we haven't defined it yet.


```javascript
"use strict";

describe('translations', function() {
  var translations, navigator;

  // ...

  beforeEach(function() {

    // ...

    inject(function(_translations_, _navigator_, configurator) {
      translations = _translations_;
      navigator = _navigator_;
      configurator.defineConfiguration(conf);
      translations.init();
    });
  });
```

Now that we successfully injected the `navigator` we can again see our
error message change. The backtrace tells us that it still originates
from our `navigator.nextSentence()` call. 

Normally - when `Arethusa` is started inside your browser - the
`ArethusaCtrl` and `state` will start a chain of events that setup the
`navigator`. As we're running our tests in isolation, we have to do this
manually again.


```javascript
var sentences = [
  { id: '1' },
  { id: '2' }
];

beforeEach(function() {

  // ...

  inject(function(_translations_, _navigator_, configurator) {
    translations = _translations_;
    navigator = _navigator_;
    configurator.defineConfiguration(conf);

    navigator.init();
    navigator.addSentences(sentences);
    navigator.updateId();
    translations.init();
  });
});
```

`navigator` also has an `init()` function, that gets called once on
application startup. It has an internal data store, where it holds
references to a document's sentences. These sentences are objects that
have an id - they usually have other properties as well (such as
tokens), but they don't interest us here. We add these sentences by passing
an array of objects in `navigator.addSentences(sentences)` and call
`navigator.updateId()` to finish the initialization of the `navigator`.

Take care to do all this **after** you have called
`configurator.defineConfiguration(conf)` - the `navigator`, as with almost
every core part of `Arethusa`, already communicates with the `configurator` to
set itself up properly.

The error message in our `watch` task should now uncover, that we have
still one failing spec: We expected `"Gaul as a whole..."` (our `s1`) to equal
`"The Belage inhabit..."` (our `s2`).

If we get back to our service code in `translations.js`, we see that we
have still hardcoded the chunkId to `'1'` - the error was therefore to
be expected.


```javascript
"use strict";

angular.module('perseids.translations').service('translations', [
  'state',
  'configurator',
  'navigator',
  function(state, configurator, navigator) {
    
    // ...

    this.init = function() {
      configure();
      retriever.get(navigator.status.currentId, updateTranslation);
    };
  }
]);
```

We inject the `navigator` into our service so that we are able to
communicate with it. Our hardcoded reference `'1'` we replace with
looking at the current chunkId through `navigator.status.currentId`. The
`navigator` will update this `status` object every time
`navigator.updateId()` is called - something we just manually do to fire up
 the `navigator`, but which is usually done automatically - e.g. by a call of
`navigator.nextSentence()`.

Unfortunately this didn't fix our spec immediately. There is still one
thing left to do - in fact, our business logic is already sound, but the
`spec` we have written is not.

```javascript
describe('when a chunk is changed', function() {
  it('updates the current translation properly', function() {
    navigator.nextSentence();
    translations.init();
    expect(translations.translation).toEqual(s2);
  });
});
```

If we remember what we have said above about when `init()` calls of
plugins are made by `ArethusaCtrl`, it's clear that inside of our spec suite we have to
re-`init()` manually. Once we do this - we should see a nice green
`SUCCESS` message in our `watch` task.


### Coding the Retriever

While we can now say the basic functionality of our `translations`
service works, we still couldn't really use it as we haven't coded our
retriever yet.

We can again use `arethusa-cli` to avoid writing too much boilerplate
code. From the root of our perseids.translations directory:

```
$ arethusa generate retriever perseids.translations perseids_translations_retriever
```

The `generate` command for retrievers takes two arguments:
- The name of the retriever's module
- and the name of the retriever itself

Note that we use snakeCase to specify retrievers on the command line!
The CLI tool will take care of formatting all names properly.

Immediately after we do this, we'll see that our test suite has gone red
again. The `generate` command not only set up the retriever for us, but
also its spec file.

Let's take a look at the retriever in
`app/js/perseids.translations/perseids_translation_retriever.js` first

```javascript
"use strict";

angular.module('perseids.translations').factory('PerseidsTranslationsRetriever', [
  'configurator',
  function(configurator) {
    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      this.get = function(callback) {
        resource.get().then(function(res) {
          var data = res.data;
          callback(data);
        });
      };
    };
  }
]);
```

Some pieces of this might already look a bit familiar. The retriever is
a factory, that returns a constructor function, which takes a single
argument - its configuration.

We see here that the retriever communicates with the `configurator` to
obtain a `resource`. `Arethusa` provides a wrapper around `Angular`s
`$resource` service, which is itself a wrapper around the `$http`
service, which is a wrapper around XMLHttpRequest and JSONP requests.
Lots of wrapping...

Such a `resource` further abstracts handling of external APIs and
gives us access to clever URL pattern matching, as well as handling
Authentication tasks. This goes a little bit beyond the scope of this
guide, but to wrap this up a little we can say the following:

- A plugin service handles the business logic and communicates with a
  retriever
- A retriever transforms external data from an external service and
  communicates with a resource
- A resource deals with making actual calls to external services and
  handles authentication

We can also see that the `configurator`'s `provideResource` function
expects to get the `resource` property of the retriever configuration
passed. We'll soon take a look at what kind of data this actually should
be.

The `get` function we expected to be present for our `translations`
service is already setup - we'll have to customize it to our needs of
course, which we will start to do so soon.

The accompanying `spec` file  looks like this:

```javascript
"use strict";

describe('PerseidsTranslationsRetriever', function() {
  var retriever, backend;

  var backendUrl = '';

  var conf = {
    resources: {
      testResource: {
        route: backendUrl
      }
    }
  };

  beforeEach(function() {
    module('arethusa.core');
    module('perseids.translations');

    inject(function($httpBackend, configurator, locator) {
      backend = $httpBackend;
      configurator.defineConfiguration(conf);
      retriever = configurator.getRetriever({
        PerseidsTranslationsRetriever : {
          resource: 'testResource' 
        }
      });
      locator.watchUrl(false);
      locator.set({});
    });
  });

  describe('get', function() {
    it('...', function() {
      var response = {};

      backend.when('GET', backendUrl).respond(response);

      // Your GET code goes here!

      backend.flush();

      // Your first expectation goes here!
    });
  });
});
```

Let's jump right into the `inject` function first. We'll see two new
things here. The `$httpBackend` and the `locator`.

`Angular`'s `$httpBackend` allows us to mock up calls to external
servers. This is very useful, as we wouldn't want to make requests to a
real server during testing. We store a reference to this service in a
variable that's accessible from everywhere inside this file, called
`backend`.

The `locator` is an `Arethusa` service that is used to watch the URL of
a current browser session. A `resource` can watch the URL to know which
address it has to call and it does so by communicating with the
`locator`.

There are occasions where we can't (during tests) or don't want (when `Arethusa` is used as a [widget]()) to look at a URL - our `inject` function therefore declares `locator.watchUrl(false)`, which allows us to set wannabe URL params by hand. The `generate` command just filled in an empty object here for now - we'll customize this to our needs later.

We also assign the retriever which we want to test here through
`configurator.getRetriever`, which we pass the retriever's configuration.

The object
```
{
  PerseidsTranslationsRetriever : {
    resource: 'testResource'
  }
}
```
is equivalent to what we defined earlier in the configuration of the
`translations` plugin.

```
plugins: {
  'perseids.translations' : {
    "retriever" : {
      "PerseidsTranslationRetriever" : {}
    }
  }
```
Only this time, we really add a configuration for the retriever. All
retrievers need to define their resource - which can simply be the name
of a `resource` instance.

The configurator will know where to read in the configuration for this
`resource` then. We called `configurator.defineConfiguration` with the
following configuration.

```
var conf = {
  resources: {
    testResource: {
      route: backendUrl
    }
  }
};
```

Just as plugins, `resource`s have their own section inside a
configuration file. This is to leverage their reuse - different
retrievers might still want to use the same `resource`.

We see that our so called `testResource` right now has configured a
route, which is obtained from the `backendUrl` variable.

Back then, when we specified what our assumed external API looks like, we
said that a `GET` route would look like this:

```
GET /translations/DOC_ID
```

Let's make our `resource` conform to this:

```
var backendUrl = 'http://www.test.com/translations/';

var conf = {
  resources: {
    testResource: {
      route: backendUrl + ':doc'
    }
  }
};
```
Our mock-up backend URL is `http://www.test.com/translations`. The full route
of our testResource is `www.test.com/translations/:doc`. The interesting
part here is `:doc`. This allows us for example to pass an object with

```
{ doc: 'caes1' }
```
to the `resource`, which would then make a call to the expanded route
`http://www.test.com/translations/caes1`.

In our case we will not pass the `doc` param directly - we want it to be
read from URL. If we remember our initial specifications once more, we
said that we will be confronted with a treebank document that has a
document id of `caes1` and we expect our `retriever` to get data from an
external service that stores translations with the `caes1` identifier as
well.

The URL for this particular `Arethusa` session will therefore already
contain a param like `doc=caes1`, which we can read inside of our
resource as well.

We do this by adding a `params` array to the `resource`'s configuration.
All params specified there will be read from the URL.

```
var conf = {
  resources: {
    testResource: {
      route: backendUrl + ':doc',
      params: [
        'doc'
      ]
    }
  }
};
```

When we discussed the `inject` function we said that we still have to
customize `Arethusa`'s `locator` service, which is the wrapper around
URL handling. As we don't really have an URL accessible in our spec
suite, we mock up this parameter by hand.


```
inject(function($httpBackend, configurator, locator) {

  // ...

  locator.watchUrl(false);
  locator.set('doc', 'caes1');
});
```

Enough of setting up for now - time to update the first spec that was
set up for us.

```
var s1 = "Gaul as a whole is divided into three parts.";
var s2 = "The Belgae inhabit one of these.";

var response = {
  '1' : s1,
  '2' : s2
};

describe('get', function() {
  it('retrieves data through a document id URL param', function() {
    var doc;

    backend.when('GET', backendUrl + 'caes1').respond(response);

    retriever.get('1', function(res) {
      doc = res;
    });

    backend.flush();

    expect(doc).toBeDefined();
  });
});
```

First we prepare a response, where we define that our external services
provides us with a JSON object, where the keys are sentence ids and the
values are sentence strings.

Inside our spec we say that the backend should respond with this mock-up
response everytime when we call `GET` with the url
`http://www.test.com/translations/caes1`.

We then call our retriever's `get` function and pass it a chunkId and a
callback function. This callback function doesn't really do a whole lot,
all we are interested in is that it gives us back some data, which we
store in a `doc` variable on which we can test our expectation. The
first test just asks, if `doc` received any data after we made our `GET`
request.

Take note of the `backend.flush()` call. All requests to external APIs
in `Arethusa` (and more generally in `Angular`) are asynchronous. We'll
never want to wait for such calls unnecessarily - a user should be able
to go on with his work while the application is dealing with HTTP work.

The `flush()` function is needed to mock-up the resolution of such an
HTTP call - in real life it would resolve at any point in the future, in
our test suite we declare a specific moment when this should happen.

If we save our changes, we set that our spec dramatically explodes. A
TypeError - `'1'` is not a function. We have to update our retriever
code now.

```javascript
this.get = function(chunkId, callback) {
  resource.get().then(function(res) {
    var data = res.data;
    callback(data);
  });
};
```

The automatically generated code couldn't foresee, that we
wanted to add a second argument (the chunkId) to our `get()` function.
If we add this, we should see all green tests again.

The `get` function delegates the call to its `resource` and calls its
`get` function. All functions of `Arethusa` `resource` objects return
[promises](http://docs.angularjs.org/api/ng/service/$q). These
`promises` have a `then` function which will execute once the
asynchronous request is finished. A successful request calls a callback
function and passes a response object to it. This response object (what
is simply called `res` in our retriever) holds headers and other status
information about the request, but also the actual data. This data we
use to pass to our own callback function.

This first spec is very unspecific and only guarantees that we are
getting something back from our API - but this something is not
necessarily the right thing. Let's add another test.


```javascript
it('returns a selection of the document, specified by a chunkId', function() {
  var doc;

  backend.when('GET', backendUrl + 'caes1').respond(response);

  retriever.get('1', function(res) {
    doc = res;
  });

  backend.flush();

  expect(doc).toEqual(s1);
});
```

As we can see, this test is almost completely the same - it's usually
really not good to have so much duplicate code anywhere. In this case it
probably makes sense, as the two tests don't really test the same thing.
- The first one establishes that the communication with the external
  service is OK
- The second one tests whether the `retriever` is preparing the data for
  our plugin service correctly

If we ever run into problems with our retriever, this differentiation
might help us to determine at exactly which point in the code we are
having issues.

In the second test we want to know, that when we specify a chunkId of `'1'`, 
we really get back the translation of the first sentence.

Checking this spec, we see that it fails - we get back all translations
of the complete document.

If we make this minor change inside the retriever's `get' function`

```javascript
this.get = function(chunkId, callback) {
  resource.get().then(function(res) {
    var data = res.data;
    callback(data[chunkId]);
  });
};
```
where we use the `chunkId` param to select the correct sentence. The
tests should be all green again.

While we are basically done with the minimal functionality of both the
plugin service and its first retriever, there is one glaring problem
with the retriever we will immediately fix.

As the retriever pulls in data that contains translations for a complete
document already, it makes not much sense to make the request to the
external API several times while we are still looking at the same document. 
Some sort of caching is therefore probably in order.

Thinking about this also sheds some light on why `Arethusa` uses its
retriever approach. It is entirely possible that at another point in
time, we'll want to communicate with a different external API, that
would not respond with complete translation documents, but with
individual chunks/sentences, but this is not the concern of the
`translations` plugin service.

All `translations` wants is to get a translation for the current chunk -
it does not care what the external API that provides this data looks
like. If we were to leverage a sentence-based API, we would configure
the `translations` plugin with a different retriever, that knows how to
transform the incoming data in a such way, that the `translations` service
can easily understand.


