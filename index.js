/**
 * Primary module requirements.
 * @type {exports}
 */
var fs = require( "fs" );
var util = require( "util" );
var path = require( "path" );
var events = require( "events" );
var error = require( "./error" );

/**
 * Simple wrapper to force adding of whitespace
 * to JSON string, when writing it to a file.
 * @param string
 * @param spaces
 * @returns {*}
 */
JSON.stringForFile = function( string, spaces ){
    spaces = spaces || 2;

    return JSON.stringify( string, null, spaces );
}

/**
 * Handles storage of trivial data for requiring modules within a JSON file.
 * File will be created if it doesn't exist.
 * Primary functions: load( index ), save( index, value )
 * @param relativePath *REQUIRED
 * @constructor
 */
var Storage = function(){
    var $this = this;
    events.EventEmitter.call( this );

    /**
     * Relative path provided upon instantiation
     */
    this.storagePath;

    /**
     * Sets the file path of the instance.
     * @param relativePath
     */
    this.file = function( relativePath ){
        if( relativePath.substr( relativePath.length - 5 ) != ".json" ) relativePath += ".json";

        $this.storagePath = path.resolve( relativePath );

        return $this;
    };

    /**
     * Load file.
     * If no file found create it.
     * If found and empty, write values from "default".
     * If found and not empty, but it doesnt contain ALL keys in "defaults" then add those keys and their values.
     * If found and not empty, and includes all keys, BUT those keys MATCH the default values for the keys, tell the user to fix the values.
     * Otherwise it will just load the file contents.
     * @param index
     * @param value
     * @param callback
     */
    this.get = function( loadingPath, requiredPath, callback ){
        var directories = requiredPath.split( "/" );
        var loadName = directories[ directories.length -1 ];

        $this.file( requiredPath ).load( function( required ){
            $this.file( loadingPath ).load( function( loading ){
                var altered = [];
                var needToChangeValues = [];
                var errorMsg = "There was a problem loading the config file for \""+ loadName +"\" module.";
                var alterMsg = loadName +" config options are located in config.json. Populate values before continuing.";

                for( var item in required ){
                    if( ! loading[ item ]) altered.push( item );
                    else if( loading[ item ] == required[ item ]) needToChangeValues.push( item );
                    else required[ item ] = loading[ item ];
                }

                if( altered.length > 0 ) storage.save( required, function( saved ){
                    if( saved.def_env ) return console.log( alterMsg );
                    else return error( errorMsg );
                });
                else if( needToChangeValues.length > 0 ) return console.log( alterMsg, needToChangeValues );
                else callback( loading );
            });
        });
    }

    /**
     * Saves the data into the JSON file
     * @param index
     * @param value
     * @param callback( saved = {boolean} )
     */
    this.save = function( index, value, callback ){
        $this.open( function( data ){
            if( typeof value == "function" && typeof index == "object" ){
                data = index;
                callback = value;
            } else{
                data[ index ] = value;
            }

            $this.push( data, function( data ){
                var saved = data || false;

                callback( saved );
            });
        });
    };

    /**
     * Loads the value of the index within this.storagePath file.
     * Returns {boolean} false if the index is not in the file.
     * @param index
     * @param callback ( value {*} )
     */
    this.load = function( index, callback ){
        $this.open( function( data ){
            if( typeof index == "function" ) return index( data );

            data = data[ index ] || false;

            callback( data );
        });
    };

    /**
     * Destroys data index from the file.
     * @param index
     * @param callback
     */
    this.wipe = function( index, callback ){
        $this.open( function( data ){
            delete data[ index ];

            $this.push( data, callback );
        });
    };

    /**
     * Returns the full path of the JSON storage file for the instance.
     */
    this.path = function(){
        return $this.storagePath;
    };

    /**
     * If the file exists at path, callback fires with this.read()
     * output. If not, callback fires with this.make() output.
     * @param callback
     * @returns {{}}
     */
    this.open = function( callback ){
        fs.exists( $this.path(), function( exists ){
            if( ! exists ) $this.make( callback );
            else $this.pull( callback );
        });
    };

    /**
     * Creates a new file containing a stringified, empty object at this.realtivePath.
     * @param data
     * @returns {*}
     */
    this.make = function( callback ){
        fs.open( $this.path(), 'w', function( err, fd ){
            if( err ) return error( "File create error", err.stack );

            $this.push( {}, callback );
        });
    };

    /**
     * Reads and parses the contents of the file at this.storagePath.
     * Returns {boolean} false if the file does not exist at path.
     * @returns {*}
     */
    this.pull = function( callback ){
        var readOptions = { encoding: "utf8" };

        fs.readFile( $this.path(), readOptions, function( err, contents ){
            if( err ) return error( "File read error", err.stack );

            callback( JSON.parse( contents ));
        });
    };

    /**
     * Stringifies and writes the file to this.storagePath.
     * @param data
     * @returns {*}
     */
    this.push = function( data, callback ){
        var writeOptions = { encoding: "utf8" };
        var prettyContents = JSON.stringForFile( data );

        fs.writeFile( $this.path(), prettyContents, writeOptions, function( err ){
            if( err ) return error( "File write error", err.stack );

            $this.pull( callback );
        });
    };

    /**
     * The module's bootstrap function.
     * @param relativePath
     */
    this.boot = function(){};

    /**
     * Execute the module's bootstrap function on instantiation.
     */
    $this.boot();
}

/**
 * Storage inheritance from the EventEmitter module
 * @type {Object|Function|exports.EventEmitter}
 * @private
 */
util.inherits( Storage, events.EventEmitter );

/**
 * Called PRIOR TO export to ensure that all variable values from "config.json"
 * have been loaded. Sets all initial variables to their respective values.
 * Instantiates any modules requiring instantiation, prior to exporting.
 */
var bootstrap = function(){
    storage = new Storage();
};

/**
 * Execute the bootstrap command before exporting
 */
bootstrap();

/**
 * Exports an instantiation of the Storage module.
 */
module.exports = storage;