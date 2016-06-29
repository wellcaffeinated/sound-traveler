var _ = require( 'lodash' )
    , mapbox = require( 'mapbox-gl' )
    , domready = require( 'domready' )
    ;

mapbox.accessToken = 'pk.eyJ1IjoidGhlc291bmR0cmF2ZWxlciIsImEiOiJjaW4wbGhhbHUwYTh5dmhtNGE4NTF2anliIn0.CBcwSbDPfEHfSBLVt_rmOA';

function init(){
    var map = new mapbox.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9'
    });
}

domready( init );
