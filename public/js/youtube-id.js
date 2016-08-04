function getYouTubeId( url ){
    var id = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
    return id && id[ 1 ];
}

export default getYouTubeId;
