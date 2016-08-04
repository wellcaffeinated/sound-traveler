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
    constructor(){
        this.el = document.createElement('div');
        this.el.id = 'map';

        this.modal = Monkberry.render(Modal, document.body);
    }

    inject( parent ){
        parent = parent || document.body;
        parent.appendChild( this.el );

        this.map = new mapbox.Map({
            container: this.el,
            style: 'mapbox://styles/thesoundtraveler/cinhs70rj000saaktqychkibp'
        });

        this.map.on('load', this.initMap.bind(this));
    }

    initMap(){
        var map = this.map;
        // Add a new source from our GeoJSON data and set the
        // 'cluster' option to true.
        map.addSource("st-data", {
            type: "geojson",
            // data: "https://a.tiles.mapbox.com/v4/thesoundtraveler.pm8inaji/features.json?access_token=pk.eyJ1IjoidGhlc291bmR0cmF2ZWxlciIsImEiOiJjaW4wbGhhbHUwYTh5dmhtNGE4NTF2anliIn0.CBcwSbDPfEHfSBLVt_rmOA",
            data: markerData,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

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

        // Display the earthquake data in three layers, each filtered to a range of
        // count values. Each range gets a different fill color.
        var layers = [
            [150, '#f28cb1'],
            [20, '#f1f075'],
            [0, '#51bbd6']
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


        // When a click event occurs near a marker icon, open a popup at the location of
        // the feature, with description HTML from its properties.
        map.on('click', (e) => {
            var features = map.queryRenderedFeatures(e.point, { layers: ['non-cluster-markers'] });

            if (!features.length) {
                return;
            }

            var feature = features[0];

            this.modal.update({
                title: feature.properties.title
                ,youtube: feature.properties.youtube
            }).show();

            // // Populate the popup and set its coordinates
            // // based on the feature found.
            // var popup = new mapbox.Popup()
            //     .setLngLat(feature.geometry.coordinates)
            //     .setHTML(feature.properties.description)
            //     .addTo(map);
        });

        // Use the same approach as above to indicate that the symbols are clickable
        // by changing the cursor style to 'pointer'.
        map.on('mousemove', (e) => {
            var features = map.queryRenderedFeatures(e.point, { layers: ['non-cluster-markers'] });
            map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
        });
    }
}

function init(){

    var app = new SoundTravelerMap();
    app.inject();
}

domready( init );
