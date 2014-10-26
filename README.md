This project is a small example application that shows how the actual Angular projects for Magnet.me should be structured. It's a live documentation project.

## Running

1. `npm install`
2. `bower install`
3. `gulp live`
4. go to: `localhost:8080/{app1,app2}`

## Overview in 2 minutes
- Each component creates it's own Angular module.
- Each component `require()`s all its dependencies -both local and external- and also defines the dependencies as module dependencies.
- Each component has an `index.js` that is the entry point for a component. This sets up all elements of that component and will be loaded when its containing folder is `require()`d.
- Each component exports an object with: (should be done in `index.js`)
	- a `module` property (required). This property is the Angular module created for this component.
	- a `states` object (optional, only relevant for page components). This object defines all states created in the module. The keys are names for the states, and the values are objects with a `controller` and `templateUrl` property.
- The application config *only* depends on the pages and optionally on modules it needs for itself.
- The application config defines all routes using the exported `states` objects of modules.
- All non-index files do *not* create controllers/directives/etc. directly: instead they export the functions such that they can be bound to the correct module in their `index.js` file. (This is to prevent circular dependencies)
- If a function depends on dependency injection it should be placed in an `ngInject(<function>)` call. (`ngAnnotate` cannot detect when regular functions need injections. Therefore we need to annotate it with this function call)

## Apps

This project contains 2 apps (app1 and app2) that are accessible via the url mentioned above. They both share the foo page, but the bar page is only set for app2. There is no explicit shared module, since each module simply depends on the components its interested in.

## Why this setup?
- Dependencies are explicitly defined in each file, thus it's trivial to see where functionality comes from.
- The build chain does not need to know anything about dependencies, it only needs to know the entry points.
- The build chain will only compile those resources that are actually required (instead of everything that matches a certain glob pattern).
- Dependencies are managed by bower, no need to manually upload them to a cdn and embed them in html.
- No need for big shared modules. Each application can just `require` whatever they need.
- It results in just one compiled file per application, instead of dozens separate files that needs to be embedded with script tags.
- Since external dependencies are compiled alongside our own code we can simply refer to the non-minimized versions of dependencies, which makes debugging easier.
- Dependency management for unit testing becomes trivial: only the component under test needs to be required, all it's dependencies will be loaded automatically!


## What are the downsides?
- It's not a trivial setup, you need to have knowledge of several tools to work with this.
- With the current setup individual dependencies cannot be cached. (We might improve this later by distributing dependencies in *one* compiled filed).

## Creating a custom component

### Angular based component:
1. Create a folder in the `components` directory for your component
2. Create any controllers/directives/filters etc. you like. These files should follow the following convention;
	- Each file contains only one element. Everything is compiled together so there is no reason to cram everything together in one file.
	- The relevant functions are *exported* and not directly attached to any Angular module<sup>1</sup>.
	- Any function the needs dependency injection by angular should be wrapped in a call to `ngInject()`<sup>2</sup> (e.g. `ngInject(function($scope) { /*..*/ });`) This includes the exported function.
3. Define an `index.js` in the components folder that:
	- `require()`s the angular dependencies for that module (these are needed for the angular module creation)
	- `require()`s any JavaScript file defined in that module
	- Creates a new `angular` module
	- Attaches the required angular elements to the module (e.g. `app.directive("foo", require("./fooController"))`
	- Exports an object that defines: (see also the overview above for more info)
		- a `module` property that refers to the angular app created in this module (required)
		- a `states` object that defines the states exported by this component (optional). Each state should contain a `controller` and a `templateUrl` property that can be used in a state definition for `ui-router`.
4. `require()` the component in the main file(s) for the app(s) that use it.
5. Define new states in the app config. The config should define the url and state name, the `controller` and `templateUrl` should come from the component.

### Non-angular component
For now this can best be refactored into an angular service when possible, and thus follow the above instructions.

Notes:

1. It is impossible to directly attach an element to Angular here since that would result in circular dependencies (an app depends on the component, but the component depends on the app). Moreover, it's none of an elements business to which app it will be attached, hence it should not be defined here.
2. Since the elements are not directly passed to angular, `ngAnnotate` (the tool that makes angular code minification safe) cannot automatically pick up which functions needs to be annotated. Therefore the explicit `ngInject` call is needed, which will be picked up by `ngAnnotate` at compile time. (`ngAnnotate` also support a comment based syntax, but that doesn't work 100% of the time, and since comments are not intended to contain code it must not be used).

## External libraries.

External libraries are compiled alongside the main application. To add a new external library you'll have to do the following (not ideal unfortunately, but the result is pretty decent):

1. Find the library on bower
2. `bower install <library> --save-dev`
3. Define an alias for the library in `package.json` in the `browser` hash, such that we don't need full paths (see `package.json` for examples).
4. (optional): if the library is *not* browserify compatible (=it doesn't set `module.exports`) you'll need to setup a shim config in `package.json`. If it does NOT depend on anything you can simply add a `"library" : "globalVariable"` pair to the `browserify-shim` object. `globalVariable` is here the global variable that is exported by the library and `library` is the name of the library (should be equal to the name defined in step 3.). If the library has dependencies you should use the `"library" : { "depends" : [/*dependencies*/], "exports" : "globalVariable"}` syntax, where `dependencies` is an array of dependency names. If a library doesn't export anything (e.g. pure Angular module) you should set the globalVariable to `null`. See `package.json` for examples of both versions.
5. (optional): if the (angular) library requires some configuration you can best create a wrapper component that does so (such that you only need to define it at one place).

Now you can simply `require('library')` the library in the app using the alias defined in step 3.

Note: multiple `require` calls for the same library only evaluate the library once. Therefore you can require a single library as much as you want, and thus there is no need to define all dependencies globally up front.

## FAQ

### What's the difference between `require('foo');` and `require('./foo')`?
`require('foo')` takes the **globally defined** roots as starting point to search for modules. These are `bower-components` and the root folder of the project. `require('./foo')` searches for files **relative to the file**.

### How can I let one component define different functionality for different apps?
This is quite common, e.g. resources might be viewable by all apps, but only editable from one. Recommended is to provide multiple main files for these modules and require the right module in the right app. E.g.:

Directory structure:
```
components
|-foo
| |-index.js
| |-editable.js
| |-baseTemplate.html
| |-editableTemplate.html
| |-baseController.js
| |-editableController.js
```

Component files:
```JavaScript
//index.js
var app = angular.module('foo', []);
module.exports = {
	module : app,
	states : {
		root : {
			controller : require('./baseController'),
			templateUrl : __dirname + '/baseTemplate.html'
		}
	}
};
```
```JavaScript
//editable.js
var _ = require('lodash');
var base = require('./index');
var app = angular.module('foo.editable', [base.module.name]);

module.exports = {
	module : app,
	states : _.extend(base.states, {
		//State override
		root : {
			controller : require('./editableController'),
			templateUrl : __dirname + '/editableTemplate.html'
		}
	})
};
```

App files:
```
//app1.js
/* .. */ //all boilerplate here
var foo = require('components/foo');
app.config(function($stateProvider) {
	$stateProvider
		.state('foo', {
			url : '/foo',
			controller : foo.states.root.controller,
			tempalteUrl : foo.states.root.templateUrl
		});
});
```

```
//app2.js
/* .. */ //all boilerplate here
var foo = require('components/foo/editable');
app.config(function($stateProvider) {
	$stateProvider
		.state('foo', {
			url : '/foo',
			controller : foo.states.root.controller,
			tempalteUrl : foo.states.root.templateUrl
		});
});
```

**NOTE:** Do **not** use conditionals in code to determine which file should be required: `browserify` is not able to execute conditionals and thus will include *any* file that is required anywhere in the file, even though it will never be used. The above strategy makes sure only those files are embedded that are actually necessary.
