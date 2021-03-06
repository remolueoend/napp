var nappd = require('../../lib/nappd'),
    path = require('path'),
    c = require('../constants')();

describe('isDaemon', function(){

    it('should return true for a daemon instance', function(done){
        nappd.fromAppPath(c.appPath)(function(daemon){
            done(!nappd.isDaemon(daemon) ? new Error('Did not recognise a valid instance.') : void 0);
        }, done);
    });

    it('should return false for a anything else than a daemon instance', function(done){
        if(nappd.isDaemon({}) || nappd.isDaemon('') || nappd.isDaemon(42) || nappd.isDaemon(true) || nappd.isDaemon()){
            done(new Error('Recognised invalid instance as daemon.'));
        }else{
            done();
        }
    });

});