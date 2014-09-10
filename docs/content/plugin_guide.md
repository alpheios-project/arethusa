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
grunt
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
