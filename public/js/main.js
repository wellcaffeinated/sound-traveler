import './main.scss';
import _ from 'lodash';
import mapbox from 'mapbox-gl';
import domready from 'domready';
import Monkberry from 'monkberry';
import 'monkberry-events';
import Modal from './modal/modal';
import markerData from '../features.json';

mapbox.accessToken = 'pk.eyJ1IjoidGhlc291bmR0cmF2ZWxlciIsImEiOiJjaW4wbGhhbHUwYTh5dmhtNGE4NTF2anliIn0.CBcwSbDPfEHfSBLVt_rmOA';

class SoundTravelerMap {
    constructor( opts ){
        this.el = document.createElement('div');
        this.el.id = 'map';

        this.dataUrl = opts.dataUrl;

        this.modal = Monkberry.render(Modal, document.body);
    }

    inject( parent ){
        parent = parent || document.body;
        parent.appendChild( this.el );

        // this.debugEl = document.createElement('pre');
        // this.debugEl.id = 'debug-el';
        // parent.appendChild( this.debugEl );

        if ( this.dataUrl ){

            this.map = new mapbox.Map({
                container: this.el,
                style: 'mapbox://styles/thesoundtraveler/cinhs70rj000saaktqychkibp'
            });

            this.map.on('load', this.initMap.bind(this));
        } else {
            this.modal.update({
                title: 'Media Map Setup'
                ,embedMsg: true
            }).show();
        }
    }

    initMap(){
        var map = this.map;
        // Add a new source from our GeoJSON data and set the
        // 'cluster' option to true.
        map.addSource("st-data", {
            type: "geojson",
            // data: "https://a.tiles.mapbox.com/v4/thesoundtraveler.pm8inaji/features.json?access_token=pk.eyJ1IjoidGhlc291bmR0cmF2ZWxlciIsImEiOiJjaW4wbGhhbHUwYTh5dmhtNGE4NTF2anliIn0.CBcwSbDPfEHfSBLVt_rmOA",
            // data: markerData,
            data: this.dataUrl,
            cluster: true,
            clusterMaxZoom: 50, // Max zoom to cluster points on
            clusterRadius: 100 // Radius of each cluster when clustering points (defaults to 50)
        });

        this.initLayers();
        this.initEvents();
    }

    initLayers(){
        var map = this.map;
        // Use the data source to create five layers:
        // One for non-clustered markers, three for each cluster category,
        // and one for cluster labels.
        map.addLayer({
            "id": "non-cluster-markers",
            "type": "symbol",
            "source": "st-data",
            "layout": {
                "icon-image": "marker-15",
                // "icon-color": "{marker-color}",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
        });

        // Display the data in three layers, each filtered to a range of
        // count values. Each range gets a different fill color.
        var layers = [
            [20, '#ff2a2a'],
            [10, '#ff7734'],
            [1, '#ff881b']
        ];

        layers.forEach( (layer, i) => {
            map.addLayer({
                "id": "cluster-" + i,
                "type": "circle",
                "source": "st-data",
                "paint": {
                    "circle-color": layer[1],
                    "circle-radius": 18
                },
                "filter": i === 0 ?
                    [">=", "point_count", layer[0]] :
                    ["all",
                        [">=", "point_count", layer[0]],
                        ["<", "point_count", layers[i - 1][0]]]
            });
        });

        // Add a layer for the clusters' count labels
        map.addLayer({
            "id": "cluster-count",
            "type": "symbol",
            "source": "st-data",
            "layout": {
                "text-field": "{point_count}",
                "text-font": [
                    "DIN Offc Pro Medium",
                    "Arial Unicode MS Bold"
                ],
                "text-size": 12
            }
        });
    }

    initEvents(){
        var map = this.map
            ,canvas = map.getCanvasContainer();

        // When a click event occurs near a marker icon, open a popup at the location of
        // the feature, with description HTML from its properties.
        map.on('click', (e) => {

            var features = map.queryRenderedFeatures(e.point, { layers: ['non-cluster-markers'] })
                ,feature
                ,props;

            if (features.length) {

                feature = features[0];
                props = feature.properties;

                // open a modal with marker content
                this.modal.update({
                    title: props.title
                    ,description: props.description
                    ,youtube: props.youtube
                    ,image: props.image
                    ,caption: props.caption
                }).show();

            } else {

                features = map.queryRenderedFeatures(e.point, { filter: ['==', 'cluster', true] });
                if (!features.length) {
                    return;
                }

                feature = features[0];
                map.flyTo({
                    center: feature.geometry.coordinates
                    ,zoom: map.getZoom() + 3
                });
            }
        });

        // Cursor pointer hover
        map.on('mousemove', (e) => {
            var features = map.queryRenderedFeatures(e.point, { filter: ['==', '$type', 'Point'] });
            map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
        });
    }
}

function getHashData(){
    var data;
    try {
        data = JSON.parse(window.atob(window.location.hash.substr(1)));
    } catch( e ){}
    return data || {};
}

function init(){

    var hashdata = getHashData();

    var app = new SoundTravelerMap({ dataUrl: hashdata.dataUrl });
    app.inject();
}

domready( init );
