var fs = require( "fs" );
var path = require( "path" );

var File = function File( Storage ){
    var $this = this;

    this.parent;

    this.required;

    this.raw;

    this.data;

    this.path;

    this.types = [ '.json' ];

    this._info;

    this.info = function( item ){
        $this._info = {
            path: $this.getPath(),
            name: $this.getName(),
            type: $this.getType(),
            prop: $this.getProp(),
            full: $this.getFull(),
            tiny: $this.getTiny(),
            file: { encoding: "utf8" }
        };

        if( item === undefined ) return $this._info;

        if( $this._info.hasOwnProperty( item )) return $this._info[ item ];

        return undefined;
    };

    this.hasStub = function(){
        return $this.raw.indexOf( ':' ) !== -1;
    };

    this.hasPath = function(){
        return $this.hasStub() || $this.raw.indexOf( '/' ) !== -1;
    };

    this.getPath = function(){
        if( $this.hasPath()){
            var folders = $this.raw.split( '/' );

            folders.splice( folders.length -1, 1 );

            return $this.path.resolved( folders.join( '/' ));
        }

        return '';
    };

    this.hasFile = function(){
        var file;

        //TODO this is gonna fail when there is a stub AND path

        if( $this.hasStub()) file = $this.raw.split( ':' ).splice( $this.raw.split( ':' ).length -1, 1 );
        if( $this.hasPath()) file = file.split( '/' ).splice( file.split( '/' ).length -1, 1 );

        return file.length > 0;
    }

    this.getFile = function(){
        var file = '';

        if( $this.hasFile()){
            if( $this.hasStub()) file = $this.raw.split( ':' ).splice( $this.raw.split( ':' ).length -1, 1 );
            if( $this.hasPath()) file = file.split( '/' ).splice( file.split( '/' ).length -1, 1 );
        }

        return file;
    }

    this.hasType = function(){
        for( var key in Object.keys( $this.types ))
            if( $this.getFile().indexOf( $this.types[ Object.keys( $this.types )[ key ]]) !== -1 ) return true;

        return false;
    };

    this.getType = function(){
        for( var key in Object.keys( $this.types ))
            if( $this.getFile().indexOf( $this.types[ Object.keys( $this.types )[ key ]]) !== -1 )
                return $this.types[ Object.keys( $this.types )[ key ]];

        return '.json';
    };

    this.hasProp = function(){
        return $this.getFile().replace( $this.getType(), '' ).indexOf( '.' ) !== -1;
    };

    this.getProp = function(){
        if( $this.hasProp()){
            var pieces = $this.getFile().replace( $this.getType(), '' ).split( '.' );

            pieces.splice( 0, 1 );

            return pieces.join( '.' );
        }

        return ''
    };

    this.hasName = function(){
        var file = $this.getFile();

        if( $this.hasType()) file = file.replace( $this.getType(), '' );
        if( $this.hasProp()) file = file.replace( $this.getProp(), '' );

        if( file.indexOf( '.' ) !== -1 ) file = file.replace( '.', '' );

        return file.length > 0;
    };

    this.getName = function(){
        if( $this.hasName()){
            return $this.getFile().split( '.' ).splice( 0, 1 );
        }

        return '';
    };

    this.getFull = function(){
        return $this.getPath() +
            $this.getName() +
            $this.getType() +
            ( $this.hasProp() ? '.' + $this.getProp() : '' );
    };

    this.getTiny = function(){
        return $this.path.stubbed( $this.getPath()) +
            $this.getName() +
            ( $this.hasType() ? $this.getType() : '' ) +
            ( $this.hasProp() ? '.' + $this.getProp() : '' );
    };

    this.exists = function(){
        try {
            return fs.lstatSync( $this.info( 'full' )).isFile();
        } catch (e) {
            return false;
        }
    };

    this.push = function( data ){
        if( ! $this.exists()) fs.openSync( $this.info( 'full' ), 'w' );

        $this.data = data || $this.data || {};

        return $this.save();
    };

    this.pull = function( required ){
        $this.require( required );

        for( var key in Object.keys( $this.required ))
            if( $this.data[ Object.keys( $this.required )[ key ]] === undefined ) $this.data[ Object.keys( $this.required )[ key ]] = $this.required[ Object.keys( $this.required )[ key ]];

        return $this;
    }

    this.load = function(){
        if( ! $this.exists()) $this.push();

        $this.data = JSON.parse( fs.readFileSync( $this.info( 'full' ), $this.info( 'file' )));

        return $this;
    };

    this.save = function(){
        $this.data = $this.pull();

        var data = JSON.stringify( $this.data, null, 2 );

        fs.writeFileSync( $this.info( 'full' ), data, $this.info( 'file' ));

        return $this;
    };

    this.wipe = function(){
        return $this.push({});
    };

    this.require = function( required ){
        $this.required = required || $this.required || {};

        return $this;
    };

    this.init = function(){
        if( $this.parent ){
            $this.raw = $this.parent._file;
            $this.path = $this.parent.path;

            $this.load();
        }

        return $this;
    };

    return $this;
};

module.exports = function( storage ){
    var file = new File();

    if( storage && storage.constructor && storage.constructor.name === "Storage" ) file.parent = storage;

    return file.init();
}