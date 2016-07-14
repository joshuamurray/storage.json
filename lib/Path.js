var path = require( "path" );

var Path = function Path(){
    var $this = this;

    this.parent;

    this.paths;

    this.list;

    /**
     * Functions to assist with manipulating slashes within a path string value.
     * @type {{
     *      string: string,
     *      get: Function,
     *      set: Function,
     *      before: Function,
     *      after: Function,
     *      wrap: Function,
     *      trim: Function,
     *      clean: Function
     * }}
     */
    this.slash = {

        /**
         * The current string representing "slash".
         * @type {string}
         */
        string: '/',

        /**
         * Returns the current string representing "slash".
         * @returns {string}
         */
        get: function(){
            return $this.slash.string;
        },

        /**
         * Assigns the provided String as the current string representing "slash".
         * @param slash
         * @returns {Path}
         */
        set: function( slash ){
            slash = typeof slash === 'string' && slash !== '' ? slash : '/';

            $this.slash.string = slash;

            return $this;
        },

        /**
         * Adds the value of "slash.string" to the start of the provided string,
         * unless the first character is already the value of "slash.string".
         * @param {string} string
         * @returns {string}
         */
        before: function( string ){
            if( string[ 0 ] !== $this.slash.get()) string = $this.slash.get() + string;

            return string;
        },

        /**
         * Adds the value of "slash.string" to the end of the provided string,
         * unless the last character is already the value of "slash.string".
         * @param {string} string
         * @returns {string}
         */
        after: function( string ){
            if( string[ string.length -1 ] !== $this.slash.get()) string = string + $this.slash.get();

            return string;
        },

        /**
         * Adds the value of "slash.string" to the start AND end of the provided string,
         * unless the first AND last characters contain the value of "slash.string".
         * @param {string} string
         * @returns {string}
         */
        wrap: function( string ){
            return $this.slash.after( $this.slash.before( string ));
        },

        /**
         * Removes the value of "slash.string" from the start AND end of the provided string,
         * unless the first AND last characters do not match the value of "slash.string".
         * @param {string} string
         * @returns {string}
         */
        trim: function( string ){
            string = $this.slash.clean( string );

            if( string[ 0 ] === $this.slash.get()) string = string.substr( 1 );
            if( string[ string.length -1 ] === $this.slash.get()) string = string.substr( 0, string.length -1 );

            return string;
        },

        /**
         * Removes any redundant slashes found within the provided string.
         * e.g. "path/to//the///directory" => "path/to/the/directory"
         * @param {string} string
         * @returns {string}
         */
        clean: function( string ){
            for( var i = 0; i < string.length; i++ ) string = string.replace( $this.slash.get() + $this.slash.get(), $this.slash.get());

            return string;
        }
    };

    /**
     * Returns the "stubbed" version of the provided path
     * @param path
     * @returns {string}
     */
    this.stubbed = function( raw_path ){
        raw_path = $this.resolved( raw_path );

        for( var key in Object.keys( $this.parent._path )){
            var value = Object.keys( $this.parent._path )[ key ];

            if( raw_path.indexOf( $this.parent._path[ value ]) !== -1 )
                raw_path = raw_path.replace( $this.parent._path[ value ], $this.parent._path[ value ] === $this.parent._path.root ? 'root:' : value + ':' );

            if( raw_path.substr( raw_path.length -2 ) === ':/' ) raw_path = raw_path.replace( '/', '' );
        }

        return raw_path;
    };

    /**
     * Returns the "resolved" version of the provided path
     * @param path
     * @returns {string}
     */
    this.resolved = function( raw_path ){
        var paths = Object.keys( $this.parent._path );

        if( raw_path.indexOf( ':' ) !== -1 && paths.indexOf( raw_path.split( ':' )[ 0 ]) === -1 ) raw_path = raw_path.replace( raw_path.substr( 0, raw_path.indexOf( ':' )), 'root' );

        for( var key in paths ){
            var value = paths[ key ];
            var try_path = $this.parent._path[ value ];

            if( raw_path === value ) raw_path = value + ':';

            if( $this.slash.before( raw_path ).indexOf( try_path ) !== -1 ) raw_path = $this.slash.before( raw_path ).replace( $this.slash.after( try_path ), value + ':' );

            if( raw_path.indexOf( value + ':' ) !== -1 ) raw_path = raw_path.replace( value + ':', $this.slash.after( try_path ));
        }

        return $this.slash.after( path.resolve( raw_path ));
    };

    /**
     * Initializes the instance upon first call.
     * @returns {Path}
     */
    this.init = function(){
        if( $this.parent ){
            $this.paths = typeof $this.parent._path === 'object' ? $this.parent.absorb({ app: '', root: '', storage: '' }, $this.parent._path ) : { app: '', root: '', storage: '' };

            for( var key in Object.keys( $this.paths )) $this.paths[ Object.keys( $this.paths )[ key ]] = $this.slash.after( path.resolve( $this.paths[ Object.keys( $this.paths )[ key ]]));

            $this.list = Object.keys( $this.paths );
        }

        return $this;
    };

    return $this;
};

/**
 * Creates an instance of the Path class, then assigns its parent
 * property as the provided Storage instance, then returns Path.
 * @param storage
 * @returns {Path}
 */
module.exports = function( storage ){
    var path = new Path();

    if( storage && storage.constructor && storage.constructor.name === "Storage" ) path.parent = storage;

    return path.init();
};
