# Arethusa: Annotation Environment

[![Dependencies](http://allthebadges.io/latin-language-toolkit/arethusa/gemnasium.png)](http://allthebadges.io/latin-language-toolkit/arethusa/gemnasium)
[![Build Status](http://allthebadges.io/latin-language-toolkit/arethusa/travis.png)](http://allthebadges.io/latin-language-toolkit/arethusa/travis)
[![Coverage](http://allthebadges.io/latin-language-toolkit/arethusa/coveralls.png)](http://allthebadges.io/latin-language-toolkit/arethusa/coveralls)
[![Code Climate](http://allthebadges.io/latin-language-toolkit/arethusa/code_climate.png)](http://allthebadges.io/latin-language-toolkit/arethusa/code_climate)
![codeship](https://www.codeship.io/projects/1fbcf7f0-b01d-0131-a029-52deea7632c1/status)


[![Selenium Test Status](https://saucelabs.com/browser-matrix/arethusa.svg)](https://saucelabs.com/u/arethusa)

Be sure to check out our [wiki](https://github.com/latin-language-toolkit/llt-annotation_environment/wiki) for conceptual notes.

## Install

Make sure [node.js](http://nodejs.org) and [ruby](http://www.ruby-lang.org) is installed.

```
sudo npm install grunt-cli -g
sudo npm install bower -g

npm install
grunt install
```

If you want to run the e2e tests also execute `grunt e2e:setup`.

## Usage

To display a rough demo start a webserver with

```
grunt server
```

or

```
grunt reloading-server
```

which will also watch any code changes you make and trigger a reload of
your browser when needed.

(Optionally pass `--port=PORT` to these server tasks to start them on a
custom port instead of the default, which is 8081)

A good place to navigate your browser to would be Arethusa's
[landing page](http://localhost:8081/app/#/), which you can also visit
on of the servers that has Arethusa deployed ([Arethusa at Perseids](http://sosol.perseids.org/tools/arethusa/app/#/)).


If you want to see Arethusa's source code inside your browser
unminified, set the environmental variable `DEV` as in `DEV=1 grunt
server`.

To set up a completely local environment run `grunt import` to import
example data and explore it in a web-browser based file browser at
[http://localhost:8081/browse](http://localhost:8081/browse).

## Funders

This project has received support from the [Andrew W. Mellon Foundation](http://www.mellon.org/) and the [Institute of Museum and Library Services](http://imls.gov/).

## Varia

Be sure to check out the following Arethusa-related projects:
- [Arethusa CLI tools](http://github.com/latin-language-toolkit/arethusa-cli)
