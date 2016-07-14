var fs = require( "fs" );
var path = require( "path" );
var File = require( "./lib/File" );
var Path = require( "./lib/Path" );

module.exports = function( file ){
    return new Storage( file );
}

/**
 * Handles storage of trivial data within JSON files.
 * @constructor
 * @returns {Storage}
 */
var Storage = function Storage( file ){
    var $this = this;

    this._path;
    this._file;

    this.path;

    this.has = function( property ){

    };

    this.get = function( property ){

    };

    this.set = function( property, value ){

    };

    this.del = function( property ){

    };

    this.list = function(){
        return []//TODO list of all dot property names currently within the file object
    }

    this.require = function( required ){

    };

    /**
     * Bind the instance to the provided file.
     * @param file
     * @returns {Storage}
     */
    this.bind = function( file ){
        $this._path = { app: process.cwd(), root: '.', storage: __dirname };
        $this.path = $this.path || Path( $this );

        $this._file = typeof file === 'string' ? file : false;
        $this.file = !! $this._file ? File( $this ) : false;

        return $this;
    }

};


var Garbage = function Garbage(){

    /**
     * The file within the module which will store the "required" and "included" key/value pairs.
     * @type {string}
     */
    this.fileName = "app:config.json";

    /**
     * The name of the index which holds an extending module's
     * required properties. This will be generated within the
     * base directory of any module that uses storage.json.
     */
    this.required = $this.fileName + '.required';

    /**
     * The name of the file which holds an extending module's
     * configuration data. This will be generated within the
     * base directory of any module that uses storage.json.
     */
    this.rootFileName = 'root:options.json';

    /**
     * A list of files used by third party applications to list "ignored" files.
     * Used to ignore any configuration files, when using version control.
     * @type {string[]}
     */
    this.fileExtensions = [ '.gitignore', '.npmignore', '.json' ];

    /**
     * Asserts that a "dot" notation file/property exists and contains a value.
     * @param dot_index
     * @returns {boolean}
     */
    this.has = function( property ){
        if( $this._file === false )

        return $this.read( dot_index ) !== undefined;
    };

    /**
     * Returns the value of a "dot" notation file/property.
     * @param dot_index
     * @param revert
     * @returns {*}
     */
    this.get = function( dot_index, revert ){
        if( ! $this.has( dot_index ) && revert !== undefined ) return revert;

        return $this.read( dot_index );
    };

    /**
     * Sets the value of a "dot" notation file/property to value.
     * @param dot_index
     * @param value
     * @returns {boolean}
     */
    this.set = function( dot_index, value ){
        var before = $this.has( dot_index ) ? $this.get( dot_index ) : false;

        $this.inject( value, dot_index );

        var after = $this.has( dot_index ) ? $this.get( dot_index ) : false;

        if( typeof after === 'object' ) after = JSON.stringify( after );
        if( typeof before === 'object' ) before = JSON.stringify( before );

        return before !== after;
    };

    /**
     * Inject the required properties/values into the instance, and into the file at this.fileName
     * @param filename
     * @param required
     */
    this.require = function( required ){
        required = typeof required === 'object' ? required : {};

        $this.inject( required, $this.required );

        return $this;
    };

    /**
     * Return the contents of the root config file, after
     * ensuring that the app config has been injected.
     * @param options
     * @param filename
     * @returns {Storage}
     */
    this.config = function( filename, options ){
        if( typeof filename === 'object' )
            options = typeof options === 'object' ? $this.absorb( options, filename ) : filename;

        if( typeof filename === 'string' ){
            if( filename === 'require' ) options = { require: options };
            else options.rootFileName = filename;
        }

        $this.require( $this.absorb(
            $this.exists( $this.fileName ) ? $this.get( $this.filename ) : {},
            $this.pluck( options, 'required', $this.pluck( options, 'defaults', $this.pluck( options, 'require', {})))
        ));

        options = $this.setup( $this.absorb( options, $this.get( $this.required )));

        //TODO REMOVE
        if( $this.fileName === false ) console.log( 'fileName false' );
        if( $this.rootFileName === false ) console.log( 'rootFileName false' );

        if( $this.directory.app() !== $this.directory.root() && $this.exists( $this.fileName )) $this.inject( $this.fileName, $this.rootFileName )
        else $this.inject( options, $this.rootFileName );

        return $this;
    };

    /**
     * Basic methods to return specific directory paths for resolution.
     * @type {{app: Function, root: Function, config: Function, _storage: Function}}
     */
    this.directory = {
        /**
         * The values used when locating paths.
         */
        list: {
            app: '',
            root: '.',
            storage: 'node_modules/storage.json/'
        },

        /**
         * Returns the path to the current Node.js module
         * @returns {*}
         */
        app: function(){
            var appFolder = this.list.app.length ? '/' + this.list.app : '';

            return path.resolve( process.cwd() + appFolder );
        },

        /**
         * Returns the path to the current root directory
         * @returns {*}
         */
        root: function(){
            return path.resolve( this.list.root );
        },

        /**
         * Returns the path to the storage.json module directory
         * @returns {*}
         */
        storage: function(){
            return path.resolve( __dirname );
        },

        prefix: function( path ){
            for( var index in Object.keys( this.list )){
                var item = Object.keys( this.list )[ index ];
                if( item === 'app' && path === this.app()) return path === this.root() ? 'root:' : 'app:';

                if( path === this[ item ]()) return item + ':';
            }

            if( path.length && path[ path.length - 1 ] !== '/' ) path = path + '/';

            return path;
        }
    };

    /**
     * Asserts that the filename/path does not include a file extension.
     * @param filename
     * @returns {boolean}
     */
    this.extended = function( filename ){
        filename = filename.split( '/' )[ filename.split( '/' ).length -1 ];


        for( var key in Object.keys( $this.fileExtensions )){
            var index = Object.keys( $this.fileExtensions )[ key ];
            if( filename.indexOf( $this.fileExtensions[ index ]) !== -1 ) return true;
        }

        return false;
    };

    /**
     * Adds the .json file extension if no file extension is present.
     * @param filename
     * @returns {*}
     */
    this.extend = function( filename ){
        filename = filename.replace( '~', '.' );

        if( $this.extended( filename )) return filename;

        return filename + '.json';
    };

    /**
     * Extracts the path from the filename string, when prefixed and separated with a colon.
     * (e.g. {PATH}:{FILENAME})
     * @param filename
     * @returns {*}
     */
    this.parse = function( filename ){
        $this.file = File( $this.path )

        return $this.file.parse();
    };

    /**
     * Returns the resolved path to the file, after
     * adding the ".json" extension, if not present.
     * @param filename
     * @returns {boolean|string}
     */
    this.resolve = function( filename ){
        var file = $this.parse( filename );

        if( file.name === false ) return false;

        file.path = file.path.length && file.path.indexOf( '/' ) !== -1 ? file.path.split( '/' ) : [ file.name ];

        if( file.path.indexOf( file.name ) === -1 ) file.path.push( file.name );

        file.path = file.path.join( '/' );

        return path.resolve( file.path );
    };

    /**
     * Asserts that a file exists at the provided path.
     * @param filename
     * @returns {boolean}
     */
    this.exists = function( filename ){
        var path = $this.resolve( filename );

        try {
            return fs.lstatSync( path ).isFile();
        } catch (e) {
            return false;
        }
    };

    /**
     * Formats the object into a "human-readable" JSON string.
     * Providing spaces = 0 will dehumanize the string.
     * @param filename
     * @param contents
     * @param spacing
     * @returns {*|string}
     */
    this.format = function( filename, contents, spacing ){
        if( $this.parse( filename ).name.indexOf( '.json' ) === -1 ){
            return contents || '';
        }

        contents = contents || {};

        spacing = typeof spacing === 'number' ? spacing : 2;

        if( typeof contents === 'string' ) contents = JSON.parse( contents );

        return JSON.stringify( contents, null, spacing );
    };

    /**
     * Deletes a file from the path, if the file exists.
     * @param filename
     */
    this.delete = function( filename ){
        var exists = this.exists( filename );

        if( exists ) fs.unlinkSync( this.resolve( filename ));

        return exists && ! this.exists( filename );
    };

    /**
     * Creates a file at the desired path.
     * @param filename
     * @param contents
     * @param overwrite
     * @returns {boolean}
     */
    this.build = function( filename, contents, overwrite ){
        console.log( filename );
        if(( filename === false || filename === '.json' ) || ( $this.exists( filename ) && overwrite !== true )) return false;

        $this.delete( filename );

        if( ! $this.exists( filename )){
            fs.openSync( $this.resolve( filename ), 'w' );
            fs.writeFileSync( $this.resolve( filename ), $this.format( filename, contents ), { encoding: "utf8" });

            if( $this.exists( filename )) return true;
        }

        return false;
    };

    /**
     * Wrapper: Insist that the filename exists before continuing.
     * @param {string} filename
     * @returns {string}
     */
    this.insist = function( filename ){
        if( ! $this.exists( filename )) $this.build( filename );

        return $this.parse( filename ).file;
    };

    /**
     * Updates the contents of the JSON file to match "object"
     * @param filename
     * @param contents
     */
    this.update = function( filename, contents ){
        if( ! this.exists( filename )) return false;

        return $this.build( filename, contents, true );
    };

    /**
     * Returns the contents of a file as a parsed Object or Array
     * @param filename
     * @param revert
     * @returns {*}
     */
    this.read = function( filename, revert ){
        if( $this.exists( filename )){
            if( $this.parse( filename ).name.indexOf( '.json' ) === -1 ) return fs.readFileSync( $this.resolve( filename ), { encoding: "utf8" });

            var object = {};
            var parsed = $this.parse( filename );
            var contents = fs.readFileSync( $this.resolve( filename ), { encoding: "utf8" });

            if( parsed.name.indexOf( '.json' ) !== -1 ) object = JSON.parse( contents );

            if( parsed.prop.length > 0 ) return $this.extract( object, parsed.prop, revert );

            return object;
        }

        return revert;
    };

    /**
     * Inserts a new property into an object, using a "dot" notation string.
     * @param object
     * @param dotProp
     * @param value
     * @returns {*}
     */
    this.insert = function( object, dotProp, value ){
        if( $this.search( object, dotProp ) === undefined ){
            object = $this.scaffold( dotProp, value, object );
        } else {
            var insert = {};

            insert[ dotProp ] = value;

            object = $this.absorb( object, $this.inflate( insert ));
        }

        return object;
    };

    /**
     * Inject the properties from one file into another, unless those properties already exist.
     * @param inject
     * @param target
     * @returns {*}
     */
    this.inject = function( inject, target ){
        if( target === false ) return false;

        if( typeof inject === 'object' && typeof target === 'object' ) return $this.absorb( target, inject );

        var injection = typeof target === 'string' && $this.parse( target ).prop.length ? $this.parse( target ).prop : undefined;

        if( typeof inject === 'string' && $this.read( inject ) !== undefined ) inject = $this.read( inject );

        if( typeof inject !== 'object' ){
            inject = $this.scaffold( injection, inject );
            injection = false;
        }

        var contents = typeof target === 'string' && $this.exists( target ) || $this.build( target ) ? $this.read( $this.parse( target ).file ) : {};

        contents = ! injection ? $this.absorb( contents, inject ) : $this.insert( contents, injection, inject );

        return $this.update( target, contents );
    };

    /**
     * Overwrite/create properties within an object, using another object.
     * @param {object} original
     * @param {object} absorb
     * @returns {*}
     */
    this.absorb = function( original, absorb ){
        if( typeof original === 'object' && typeof absorb === 'object' ){
            for( var index in Object.keys( absorb )){
                var property = Object.keys( absorb )[ index ];
                if( original.hasOwnProperty( property ) && typeof original[ property ] === 'object' && typeof absorb[ property ] === 'object' ){
                    original[ property ] = $this.absorb( original[ property ], absorb[ property ]);
                } else{
                    original[ property ] = absorb[ property ];
                }
            }
        }

        return original;
    };

    /**
     * Remove all nested objects, and replace them with "dot" notation indexes containing their assigned values
     * @param object
     * @param layer
     * @param flat
     * @returns {*|{}}
     */
    this.flatten = function( object, layer, flat ){
        flat = flat || {};
        layer = layer || '';

        var keys = typeof object === 'object' ? Object.keys( object ) : [];

        for( var key in Object.keys( keys )){
            var property = keys[ Object.keys( keys )[ key ]];
            var currentLayer = layer === '' ? property : layer + '.' + property;

            if( typeof object[ property ] === 'object' && Object.keys( object[ property ]).length > 0 ) flat = $this.flatten( object[ property ], currentLayer, flat );

            else flat[ currentLayer ] = object[ property ];
        }

        return flat;
    };

    /**
     * Remove all "dot" notation indexes, and replace them with nested objects containing their assigned values
     * @param flattened
     * @param layer
     * @param full
     * @returns {*|{}}
     */
    this.inflate = function( flattened, layer, full ){
        full = full || {};

        var keys = typeof flattened === 'object' ? Object.keys( flattened ) : [];

        for( var key in Object.keys( keys )){
            var property = keys[ Object.keys( keys )[ key ]];

            if( property.indexOf( '.' ) !== -1 ) full = $this.absorb( full, $this.scaffold( property, flattened[ property ]));

            else full[ property ] = flattened[ property ];
        }

        return full;
    };

    /**
     * Creates or populates a deep index within an object.
     * @param dotProp
     * @param value
     * @param object
     */
    this.scaffold = function( dotProp, value, object ){
        object = object || {};

        if( typeof object !== 'object' && typeof value === 'object' ) return value;

        var layers = dotProp.split( '.' );
        dotProp = layers.splice( 0, 1 )[ 0 ];

        object[ dotProp ] = layers.length === 0 ? value : $this.scaffold( layers.join( '.' ), value, object[ dotProp ]);

        return object;
    };

    /**
     * Parses a "dot" notation index and returns the corresponding value from within the object.
     * @param object
     * @param dotProp
     * @returns {*}
     */
    this.search = function( object, dotProp ){
        var layers = dotProp.split( '.' );
        var prop = layers.splice( 0, 1 )[ 0 ];

        if( layers.length > 0 && typeof object[ prop ] === 'object' ) return $this.search( object[ prop ], layers.join( '.' ));

        return object[ prop ] || undefined;
    };

    /**
     * Extract a specific property from an object.
     * @param object
     * @param property
     * @param revert
     * @returns {*}
     */
    this.extract = function( object, property, revert ){
        var extracted = $this.search( object, property );

        if( extracted !== undefined ) return extracted;

        return revert;
    };

    /**
     * Extract a specific property from an object, and remove it from the object.
     * @param object
     * @param property
     * @param revert
     * @returns {*}
     */
    this.pluck = function( object, property, revert ){
        object = object || {};
        property = property || "";

        if( typeof object !== 'object' || typeof property !== 'string' ) throw new Error( 'Invalid argument passed for "storage.pluck()"' );

        var value = object[ property ];

        if( value !== undefined ){
            delete object[ property ];
            return value;
        }

        return revert;
    };

    /**
     * Generates the configuration file for a module importing storage.json.
     * @param options
     * @returns {boolean}
     */
    this.generate = function( options ){
        return $this.build( 'app:' + $this.rootFileName, options );
    };

    /**
     * Returns an object containing each of the possible resolved paths for the file.
     * @param filename
     * @param list
     * @returns {{}}
     */
    this.paths = function( filename, list ){
        var paths = {};

        list = typeof list === typeof [] ? list : Object.keys( $this.directory.list );

        if( $this.hasStub( filename )) filename = filename.substr( filename.indexOf( ':' ) + 1 );

        for( var key in Object.keys( list )){
            var index = Object.keys( list )[ key ]
            var item = list[ index ];

            if( item === 'storage' && __dirname.indexOf( 'storage.json' ) === -1 ) list.splice( index, 1 );

            if( $this.fileExtensions.indexOf( filename ) === -1 || item === 'app' || item === 'root' ) paths[ item ] = $this.resolve( item + ':' + filename );
        }

        for( var k in Object.keys( paths ))
            if( Object.keys( paths )[ k ] !== 'root' && paths[ Object.keys( paths )[ k ]] === paths.root ) delete paths[ Object.keys( paths )[ k ]];

        return paths;
    };

    /**
     * Uses preset options to setup options for storage.json.
     * These presets are removed from the returned options.
     * @param options
     * @returns {*}
     */
    this.setup = function( options ){
        var overrides = [ 'npmIgnore', 'gitIgnore', 'rootFileName', 'fileName' ];

        for( var key in Object.keys( overrides )){
            var property = overrides[ Object.keys( overrides )[ key ]];
            var value = $this.pluck( options, property );

            if( value !== undefined ){
                if([ 'rootFileName', 'fileName' ].indexOf( property ) !== -1 && ( value === false || typeof value === 'string' )) $this[ property ] = value;
            }
        }

        /* Ensure that the fileName and rootFileName variables are not generated within the same directory */
        $this.fileName = $this.directory.app() === $this.directory.root() ? $this.rootFileName : $this.fileName;

        return options;
    };

    /**
     * Bind the instance to the provided file.
     * @param file
     * @returns {Storage}
     */
    this.bind = function( file ){
        $this._path = { app: process.cwd(), root: '.', storage: __dirname };
        $this.path = $this.path || Path( $this );

        $this._file = typeof file === 'string' ? file : false;
        $this.file = !! $this._file ? File( $this ) : false;

        return $this;
    }

    return $this.bind( file );
}