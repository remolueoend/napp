[![npm version](https://badge.fury.io/js/nappd.svg)](http://badge.fury.io/js/nappd)
[![Build Status](https://travis-ci.org/remolueoend/nappd.svg?branch=master)](https://travis-ci.org/remolueoend/nappd)
[![Dependencies](https://david-dm.org/remolueoend/nappd.svg)](https://david-dm.org/remolueoend/nappd)

# nappd
nappd stands for node app daemon and can be used to create app daemons running in the background from any NodeJS script.
Furthermore, nappd allows you to register apps locally which simplifies the management of your apps.

If you wish to manage your NodeJS app daemons straight from your terminal, have a look at [nappd-cli](https://www.npmjs.com/package/nappd-cli).

## Registration
Registering an app together with its config makes the handling of its daemon much easier.
After an app was registered with a unique app name, The daemon and the app's configuration can be received at any time by simply providing the app's unique name.
The apps' configuration will be saved in a JSON based file. The default location is: ```nappd_module_folder/cfg/apps.json```. This location can be overwritten at any time (See [Usage](https://github.com/remolueoend/nappd#usage))

## Output (stdout / stderr)
Because all nappd daemons are running in the background, the app's console output won't be visible anymore.
nappd allows redirecting the console output (stdout and stderr) to an output file at any given location.

## Installation
```
npm install nappd [--save]
```

## Usage
```javascript
// Returns a default nappd instance:
var nappd = require('nappd');

// Returns a new nappd instance with a custom config location.
// The path can be absolute or relative to the current working directory.
// If the pat does not exist, it will be created recursively:
var nappd = require('nappd')('path/to/config.json');

require('nappd') === require('nappd')       // true
require('nappd')() === require('nappd')()   // false
require('nappd') === require('nappd')()     // false
require('nappd').config.cfgPath === require('nappd')().config.cfgPath   // true
```

## Nappd Methods
All public methods provided by nappd (except ```nappd.isDaemon```) return a promise object as defined in https://www.npmjs.com/package/deferred.  

### fromAppPath
Resolves a daemon instance by a file path of an app:
```javascript
nappd.fromAppPath(appPath, [output]).then(function(daemon){ }, function(err){ });
```
* ```appPath```: Required. The file path of the script to execute.
* ```output```: Optional path to the app output log. The path will be created recursively if necessary.

### fromRegisteredApp
Resolves a daemon instance by the name of a registered app:
```javascript
nappd.fromRegisteredApp(appName).then(function(daemon){ }, function(err){ });
```
* ```appName```: Required. The unique name of the app.

### register
Registers an app under a unique app name:
```javascript
nappd.register(appName, appPath, [output], [overwrite=false]).then(function(){}, function(err){}); 
```
* ```appName```: Required. A unique name of the app to register.
* ```appPath```: Required. The absolute file path to the app's script file.
* ```output```: An optional absolute path to the app's output file.
* ```overwrite```: Optional. Set to true to overwrite the config of an app with the same name.

### unregister
Unregisters a previously registered app:
```javascript
nappd.unregister(appName).then(function(){}, function(err){}); 
```
* ```appName```: Required. The unique name of the app.

### isDaemon
Returns if the specified object is a daemon instance:
```javascript
var isDaemon = nappd.isDaemon(instance); 
```
* ```instance```: The object to test.

## Nappd Properties
* ```nappd.config```: The current configuration instance used to manage registered apps.

## Daemon Methods
Once a daemon was created from an app (see ```nappd.fromAppPath``` or ```nappd.fromRegisteredApp```), it provides following methods:

### start
Starts the app of the daemon and returns a promise resolving the app's current process ID (PID):
```javascript
daemon.start([args]).then(function(pid){}, function(err){});
```
* ```args```: Optional array of start arguments which will be passed to the script.

### stop
Stops the app of the daemon and returns a promise resolving the app's original process ID (PID):
```javascript
daemon.stop().then(function(pid){}, function(err){});
```

### kill
Kills the app of the daemon and returns a promise resolving the app's original process ID (PID):
```javascript
daemon.kill().then(function(pid){}, function(err){});
```

### status
Returns a promise resolving the app's PID or rejects if the app is currently not running:
```javascript
daemon.status().then(function(pid){}, function(err){});
```

### unregister
Unregisters the daemon:
```javascript
daemon.unregister().then(function(){}, function(err){});
```

### tail
Tails the output file of the daemon's app. If no output is defined, an exception will be thrown. To check whether an output is defined or not, check if the property ```daemon.output``` is set.
This function returns a function which can be called to stop tailing the file.
Signature:
```javascript
var handler = daemon.tail(callback);

// stop tailing:
handler();
```
* ```callback (function(err, line){})```: A function which gets called for each new line created in the output file or whenever an error during the tailing occurs.

### on
Adds a listener to the specified event and returns the new listener instance (See [Daemon Events](https://github.com/remolueoend/nappd#daemon-events) for more details).
```javascript
var listener = daemon.on(eventName, handler);

// remove the listener:
listener.remove();
```
* ```eventName```: The name of the event.
* ```handler```: The listener function to be called. The signature may vary from event to event. See [Daemon Events](https://github.com/remolueoend/nappd#daemon-events) for more details.

### trigger
Triggers the specified event by calling all attached listeners. Use this method with caution, because the event system is used internally too. 
```javascript
daemon.trigger(eventName, eventData);
```
* ```eventName```: The name of the event to trigger.
* ```eventData```: An optional array of data to send to the event's handler functions.

## Daemon Properties
* ```daemon.name```: The name of the daemon. This is rather the unique name of a registered app or the name of an app's executable file.
* ```daemon.path```: The full path to the daemon's app's executable file.
* ```daemon.output```: The path to the app's output file.
* ```events```: Internal collection of events and their listeners. Use ```daemon.on``` and ```daemon.trigger``` to manage events.

## Daemon Events
This paragraph shows all available default events and the signature of the listener calls.
The first parameter of a handler's call is always a reference to the event listener which has following attributes:
* ```id```: The listener ID applied by its registration.
* ```event```: The name of the event this listener is applied to.
* ```handler```: A reference to the listener's function.
* ```remove```: A function which can be called to remove the listener from the event.

###### Default Events:
* ```starting```: As soon as the daemon's app is trying to start up: ```function(listener){}```.
* ```started```: When the app started successfully: ```function(listener, pid){}```.
* ```stopping```: When the app got the signal to stop: ```function(listener){}```.
* ```stopped```: When the app's process was stopped successfully: ```function(listener, pid){}```.
* ```error```: Everytime an error occurrs while trying to start or stop the app's process: ```function(listener, err){}```.
* ```running```: When ```daemon.start()``` is called while the app is already running: ```function(listener, pid){}```.
* ```notrunning```: When ```daemon.stop()``` or ```daemon.kill()``` is called while the app is not running: ```function(listener){}```.

Additionally, the method ```daemon.on``` allows you to register any custom events, which can be triggered by calling ```daemon.trigger```.
