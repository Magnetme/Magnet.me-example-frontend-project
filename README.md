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

## External libraries.

External libraries are compiled alongside the main application. To add a new external library you'll have to do the following (not ideal unfortunately, but the result is pretty decent):

1. Find the library on bower
2. `bower install <library> --save-dev`
3. Define an alias for the library in `package.json` in the `browser` hash, such that we don't need full paths (see `package.json` for examples).
4. (optional): if the library is *not* browserify compatible (=it doesn't set `module.exports`) you'll need to setup a shim config in `package.json`. If it does NOT depend on anything you can simply add a `"library" : "globalVariable"` pair to the `browserify-shim` object. `globalVariable` is here the global variable that is exported by the library and `library` is the name of the library (should be equal to the name defined in step 3.). If the library has dependencies you should use the `"library" : { "depends" : [/*dependencies*/], "exports" : "globalVariable"}` syntax, where `dependencies` is an array of dependency names. If a library doesn't export anything (e.g. pure Angular module) you should set the globalVariable to `null`. See `package.json` for examples of both versions.

Now you can simply `require('library')` the library in the app using the alias defined in step 3.

Note: multiple `require` calls for the same library only evaluate the library once. Therefore you can require a single library as much as you want, and thus there is no need to define all dependencies globally up front.
