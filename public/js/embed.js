function lastLoadedScript(){
    var scripts = document.getElementsByTagName( 'script' );
    return scripts[ scripts.length - 1 ];
}

function getCurrentScript(){
    if ( document.currentScript ){
        return document.currentScript;
    } else {
        return lastLoadedScript();
    }
}

function injectEmbededMap(){
    var iframe = document.createElement('iframe')
        , s = getCurrentScript()
        , dataUrl = s.dataset.geojson
        , url = s.src.replace(/embed\.js/, '');

    iframe.src = url + '#' + window.btoa( JSON.stringify({ dataUrl }) );
    iframe.width = '100%';
    iframe.height = 500;
    iframe.frameBorder = '0';
    s.parentNode.insertBefore( iframe, s );
}

injectEmbededMap();
