
var fs = require( "fs" );
var path = require( "path" );

module.exports = new Storage();

/**
 * Handles storage of trivial data within JSON files.
 * @constructor
 * @returns {Storage}
 */
function Storage(){
    var $this = this;

    this.defaultsFileName = 'defaults.json';

    /**
     * The name of the file which holds an extending module's
     * configuration data. This will be generated within the
     * base directory of any module that uses storage.json.
     */
    this.rootFileName = 'options.json';

    /**
     * The name of the file which holds an extending module's
     * configuration data. This will be generated within the
     * base directory of any module that uses storage.json.
     */
    this.moduleFileName = 'app.json';

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
    this.has = function( dot_index ){
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
     * Return the contents of the root config file, after
     * ensuring that the app config has been injected.
     * @param filename
     * @param options
     * @param defaults
     * @returns {Storage}
     */
    this.config = function( filename, options, defaults ){
        defaults = defaults || {};
        defaults = typeof filename === 'object' && typeof options === 'object' ? options : defaults;

        options = options || {};
        options = typeof filename === 'object' ? filename : options;

        if( typeof options.defaults === 'object' ){
            defaults = $this.absorb( defaults, options.defaults );
            delete options.defaults;
        }

        filename = typeof filename === 'string' ? filename : false;
        if( filename !== false ) options.rootFileName = filename;

        options = $this.setup( $this.absorb( defaults, options ));

        if( $this.moduleFileName !== false && $this.directory.app() !== $this.directory.root()) $this.inject( options, 'app:' + $this.moduleFileName );

        if( $this.rootFileName !== false ){
            if( $this.exists( 'app:' + $this.moduleFileName )) $this.inject( 'app:' + $this.moduleFileName, 'root:' + $this.rootFileName );
            else $this.inject( options, 'root:' + $this.rootFileName );
        }

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
            config: 'node_modules/config/',
            storage: 'node_modules/storage.json/'
        },

        /**
         * Returns the path to the current Node.js module
         * @returns {*}
         */
        app: function(){
            var appFolder = this.list.app.length ? '/' + this.list.app : '';

            return path.resolve( process.cwd()) + appFolder;
        },

        /**
         * Returns the path to the current root directory
         * @returns {*}
         */
        root: function(){
            return path.resolve( this.list.root );
        },

        /**
         * Returns the path to the application's config directory
         * @returns {*}
         */
        config: function(){
            return [ this.root(), this.list.config ].join( '/' );
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
        var parts = { path: '', prop: '', name: '' };

        if( typeof filename === 'string' ){
            for( var key in Object.keys( $this.fileExtensions )){
                var index = Object.keys( $this.fileExtensions )[ key ];
                if( filename.indexOf( $this.fileExtensions[ index ]) !== -1 )
                    filename = filename.replace( $this.fileExtensions[ index ], $this.fileExtensions[ index ].replace( '.', '~' ));
            }

            if( filename.indexOf( '/' ) !== -1 ){
                parts.path = filename.split( '/' );
                parts.name = parts.path.splice( parts.path.length - 1, 1 )[ 0 ];
                parts.path = parts.path.join( '/' ).replace( '~', '.' );
            } else if( filename.indexOf( ':' ) !== -1 ){
                parts.path = filename.split( ':' );
                parts.name = parts.path.splice( 1, 1 )[ 0 ];
                parts.path = $this.directory[ parts.path[ 0 ]]();
            } else{
                parts.path = '';
                parts.name = filename;
            }

            parts.prop = parts.name.split( '.' );
            parts.name = $this.extend( parts.prop.splice( 0, 1 )[ 0 ]);

            parts.prop = parts.prop.length ? parts.prop.join( '.' ) : '';
            parts.file = $this.directory.prefix( parts.path ) + parts.name;
        } else {
            parts.value = filename;
        }

        return parts;
    };

    /**
     * Returns the resolved path to the file, after
     * adding the ".json" extension, if not present.
     * @param filename
     * @returns {string}
     */
    this.resolve = function( filename ){
        var file = $this.parse( filename );

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
        if( $this.exists( filename ) && overwrite !== true ) return false;

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
     * Extract a specific property from a json file.
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

        list = list || Object.keys( $this.directory.list );

        if( filename.indexOf( ':' ) !== -1 ) filename = filename.substr( filename.indexOf( ':' ) + 1 );

        for( var key in Object.keys( list )){
            var index = Object.keys( list )[ key ];
            if( $this.fileExtensions.indexOf( filename ) !== -1 && [ 'app', 'root' ].indexOf( list[ index ]) === -1 ) delete list[ index ];

            if( list[ index ] === 'storage' && __dirname.indexOf( 'storage.json' ) === -1 ) delete list[ index ];
        }

        for( var kee in Object.keys( list )) paths[ list[ Object.keys( list )[ kee ]]] = $this.resolve( list[ Object.keys( list )[ kee ]] + ':' + filename );

        for( var kie in Object.keys( paths )) if( Object.keys( paths )[ kie ] !== 'root' && paths[ Object.keys( paths )[ kie ]] === paths.root ) delete paths[ Object.keys( paths )[ kie ]];

        return paths;
    };

    /**
     * Uses preset options to setup options for storage.json.
     * These presets are removed from the returned options.
     * @param options
     * @returns {*}
     */
    this.setup = function( options ){
        var files = { storage: 'defaultsFileName', app: 'moduleFileName', root: 'rootFileName' };

        for( var key in Object.keys( files ))
            if( typeof options[ files[ Object.keys( files )[ key ]]] === 'string' || options[ files[ Object.keys( files )[ key ]]] === false )
                $this[ files[ Object.keys( files )[ key ]]] = options[ files[ Object.keys( files )[ key ]]];

        if( options.fileExtensions ){
            if( typeof options.fileExtensions === 'string' ) options.fileExtensions = [ options.fileExtensions ];
            if( typeof options.fileExtensions === typeof [] && options.fileExtensions.forEach ) $this.fileExtensions = options.fileExtensions;
        }

        if( options.npmIgnore === true ) $this.ignore( '.npmignore' );
        if( options.npmIgnore === false ) $this.include( '.npmignore' );

        if( options.gitIgnore === true ) $this.ignore( '.npmignore' );
        if( options.gitIgnore === false ) $this.include( '.npmignore' );

        var overrides = [ 'npmIgnore', 'gitIgnore', 'defaultsFileName', 'rootFileName', 'moduleFileName', 'fileExtensions' ];

        for( var kee in Object.keys( overrides )) delete options[ overrides[ Object.keys( overrides )[ kee ]]];

        return options;
    };

    /**
     * Appends the configuration file names to the root/module's
     * ".npmignore" AND / OR ".gitignore" file(s).
     * @param filename
     * @returns {boolean}
     */
    this.ignore = function( filename ){
        var paths = $this.paths( filename );

        var files = { defaults: "\n" + $this.defaultsFileName };

        if( !! $this.rootFileName ) files.root = "\n" + $this.rootFileName;
        if( !! $this.moduleFileName ) files.app = "\n" + $this.moduleFileName;

        for( var key in Object.keys( paths )){
            var path = Object.keys( paths )[ key ];
            if( ! $this.exists( paths[ path ])) fs.openSync( paths[ path ], 'w' );

            var contents = fs.readFileSync( paths[ path ], { encoding: "utf8" });

            for( var kee in Object.keys( files )) if( contents.indexOf( files[ Object.keys( files )[ kee ]].trim()) === -1 ) contents = contents + files[ Object.keys( files )[ kee ]];

            fs.writeFileSync( paths[ path ], contents.trim(), { encoding: "utf8" });
        }

        return false;
    };

    /**
     * Removes storage.json references from all .npmignore files
     * @param filename
     * @returns {boolean}
     */
    this.include = function( filename ){
        var paths = $this.paths( filename );

        var files = { defaults: "\n" + $this.defaultsFileName };

        if( !! $this.rootFileName ) files.root = "\n" + $this.rootFileName;
        if( !! $this.moduleFileName ) files.app = "\n" + $this.moduleFileName;

        for( var key in Object.keys( paths )){
            var path = Object.keys( paths )[ key ];
            if( $this.exists( paths[ path ])) {
                var contents = fs.readFileSync( paths[ path ], { encoding: "utf8" });

                for( var kee in Object.keys( files )) if( contents.indexOf( files[ Object.keys( files )[ kee ]].trim()) !== -1 ) contents = contents.replace( files[ Object.keys( files )[ kee ]].trim(), '' );

                fs.writeFileSync( paths[ path ], contents.trim(), { encoding: "utf8" });
            }
        }

        return false;
    };

    return $this;
}