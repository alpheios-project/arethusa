# Arethusa: Annotation Environment

[![Dependencies](http://allthebadges.io/latin-language-toolkit/arethusa/gemnasium.png)](http://allthebadges.io/latin-language-toolkit/arethusa/gemnasium)
[![Build Status](http://allthebadges.io/latin-language-toolkit/arethusa/travis.png)](http://allthebadges.io/latin-language-toolkit/arethusa/travis)
[![Coverage](http://allthebadges.io/latin-language-toolkit/arethusa/coveralls.png)](http://allthebadges.io/latin-language-toolkit/arethusa/coveralls)
[![Code Climate](http://allthebadges.io/latin-language-toolkit/arethusa/code_climate.png)](http://allthebadges.io/latin-language-toolkit/arethusa/code_climate)
![codeship](https://www.codeship.io/projects/1fbcf7f0-b01d-0131-a029-52deea7632c1/status)


[![Selenium Test Status](https://saucelabs.com/browser-matrix/arethusa.svg)](https://saucelabs.com/u/arethusa)

Be sure to check out our [wiki](https://github.com/latin-language-toolkit/llt-annotation_environment/wiki) for conceptual notes.

## Install

Make sure [node.js](http://nodejs.org) is installed.

```
sudo npm install grunt-cli -g
sudo npm install bower -g

npm install
bower install
```

## Prerequisites

- Chrome >= 32

## Usage

To display a rough demo, minify and start a webserver with

```
grunt minify
grunt server
```
A good place to navigate your browser to at the moment would be [http://localhost:8081/app/#/staging2?doc=1&s=2](http://localhost:8081/app/#/staging2?doc=1&s=2)


During development a watch task (`grunt reloader`) can optionally be
started - it will live-reload the browser on every change of a js or
html file. 
