TODO intro

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
Mixin library [Bourbon](bourbon.io) to help us with vendor-prefixes and
other fun parts of `css`.

The `index.html` file will be our go-to place when we finally start up a
server and want to see work in the browser.

Most of our code will go into the `js` directory. The
`perseids.translations.js` file we usually won't have to touch: It just
contains the definition of our `Angular` module, which we will us to
place our code in. It's very important to do this to guarantee that
Arethusa can figure out where it can obtain our plugin code dynamically
on runtime.

The subdirectory `perseids.translations` holds the main business logic
of our plugin - we will play around (and add to) `translations.js` soon.

`static/configs` provides an example configuration file. Such
configuration files are one of the most important aspects in `Arethusa`.
They allow us to define the internals of an `Arethusa` application:
Plugins we'd like to participate and their behaviour, the HTML templates
we want to use, URLs to external services and much more.

Conf files are plain JSON files, which a slightly enhanced syntax to
facilitate reuse. `Arethusa` uses the `arethusa-cli` tool to parse these
files and compile them to valid JSON. This is of course another
automated process which we will encounter a little later.

All our HTML goes into the `templates` directory. A standard text
template for our `translations` plugin can already be found there. As we
will do our coding test-driven, we can pass over templating for now -
but will of course revisit this important chapter at a later stage.

The other directories in the `app` folder we can safely ignore:
`bower_components` and `node_modules` were automatically created during
our installation through our `init` command and hold all third-party
code we are dependent on, the `dist` folder is a placeholder and will be
the destination of all automatically generated files that our `grunt`
build tasks will produce.

The `spec` folder on the other hand is an important one and will also be
the first place we will enter to start coding. But before we do that,
let's take a step back and think about what our plugin should actually do.


### What the `translations` plugin should do


The goal is to add a simple plugin, which allows us to add
translations to a sentence during a treebanking session.

To achieve this we assume that we have access to a backend-server that
stores translations on the document level and exposes them through a RESTful JSON API.

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
time. We want to display the correct translation along the sentence's
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

We will do this **test-driven**.

Writing good tests is not easy - but the value they provide is
absolutely worth the effort. They not only give us automated tests,
which allow us to easily check in the future if our code is really still
running - they will guide our design decision and make sure that we
don't couple different participants of our business logic to tightly and
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

`arethusa.core` is `Arethusa`'s main module were all the important
services and factories are located. Every plugin will use at least some
of the code inside this module - `translations` is no exception here.

The `perseids.translations` module is, as we have mentioned before, the
place where all code of the plugin we are currently developing lives and
is therefore also mandatory to present inside the scope of this spec
file.

`inject` is a helper function provided by
[angular-mock](http://docs.angularjs.org/api/ngMock), which is declared
when using a testing framework like [jasmine](http://jasmine.github.io)
- which is exactly what we use to write our specs.

`Angular` relies heavily on [Dependency
Injection](http://docs.angularjs.org/guide/di). As we want to use
specific parts of the `Angular` and `Arethusa` code in our tests, we
have to inject these items into the scope of every unit test function.

`init` already injected our `translations` service and the
`configurator`. (if the weird underscore syntax is confusing you, be
sure to check out the documentation for [inject](http://docs.angularjs.org/api/ngMock/function/angular.mock.inject))

The `configurator` is one of the most important services offered by
`Arethusa`. It grants access to the configuration file that drive
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
function are very important and will get called frequently. They setup a
plugin and update the internal state of a plugin. When `Arethusa` moves
between chunks of documents, the annotation targets change. Everytime
this happens, the plugins react and update themselves.

This might sound a little too abstract, a real example will make this more clear: 
In treebanking the current annotation target will most likely be a
single sentence. When `Arethusa` loads a sentence, it exposes this
information to all plugins - they deal with the new information inside
their `init()` function. Once a user moves to a next sentence, this
workflow is repeated: `Arethusa` exposes the new annotation target
again, calls all `init()` functions to give the plugins a chance to
update.

`Arethusa`'s event chain is responsible to trigger this behaviour. Three
objects play an important role here: 
- The `ArethusaCtrl`, which is the top-level controller inside the
  browser and which will call the `init()` functions at the right time. 
- `state` which holds all information concerning the current annotation
  target. It also fires an event when this target changes - an event,
which the `ArethusaCtrl` reacts to.
- The `navigator` which is responsible for movement inside a document.
  It communicates with state to let it know when a user wants to look at
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
  plugins: {
    'perseids.translations' : {
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
configuration detail of a plugin. In this case the `init` command
already inserted the path to the default HTML template. A configuration
file can of course override this - but if it doesn't specify a template,
the `defaultConf` will step and provide a fallback.

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
plugin's scope, because we definetely want to have access to it from
other functions.

Inside the `configure()` function we assign a new retriever instance to
this variable. We use the `configurator`'s `getRetriever` function to do
this, as the `configurator` knows how to setup a retriever properly.

We need to pass the retriever's configuration to this function.
`self.conf` holds complete configuration of our plugin and was made
available to us by the `configurator`'s `getConfAndDelegate` function.;w

If we save our changes to `translations.js` we will see movement in our
`watch` task: It stills fails - but more dramatically as before.

As we have configured our plugin to us a retriever instance of
`PerseidsTranslationsRetriever`, our `configurator` now wants to
initialize such an object - which is impossible because it's nowhere
defined.

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

We want the retriever respond to a `get` functions, which takes two
arguments:
- The id of the current chunk (in our scenario, a sentence)
- and a callback function, which we pass the translation of the current
  sentence.

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
just `'1'`) and a callback function. Inside the callback function
`updateTranslation`, which takes a single argument - the current
translation itself - we assign `self.translation`. (it's important to
use `self` and not `this` - if you try to use `this` you will quickly
see, why this is not really a good idea)

If we save we can see that - our test is green!



