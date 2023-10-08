

class MapPage {

    map = L.map('map').setView([-39.19340, 173.98926], 15);
    availableLayers = [];       // a collection of all available tile/base layers; used to swap between them
    currentLayer = null;        // holds the a reference to the current layer (so that we can remove it if required)
    self = null;

    constructor() {
        
        self = this;

        this.SetupAvailableLayers()

        // create a custom button for changing layers
        // we're going to build up the actions for the button based on how many available layers we have
        let actions = [];
        for (let possibleLayer of this.availableLayers) {
            (function(label){
                actions.push({ text: label, onClick: () => { self.LoadTileLayer(label); } });
            })(possibleLayer.label);
        }
        actions.push('finishMode') // this is the finish button
        // create the custom control with the above given actions
        this.map.pm.Toolbar.createCustomControl({
            name: 'LayersButton',
            block: 'custom',
            className: 'leaflet-pm-icon-layers',
            title: 'Choose base layer',
            toggle: true,
            actions: actions
        });
        // hide the toolbar to start with
        this.map.pm.toggleControls();

        // setup some handlers for the html to interact with this model
        this.map.on('zoom zoomend',(e)=>{
            this.ResizeTextMarkersBasedOnZoom();
        })

        var elm = document.getElementById("savebtn");
        elm.onclick = function() { self.SaveDataToDb() };

        var elm = document.getElementById("loadbtn");
        elm.onclick = function() { self.LoadDataFromDb() };

        var elm = document.getElementById("clearbtn");
        elm.onclick = function() { self.ClearAllDrawingLayers() };

        document.getElementById("toolBarVisibilityToggle").onclick = function() { self.ToggleToolBar_handler() };

        // load this layer by default
        this.LoadTileLayer("Thunderforest Outdoors")
        // load the map data from the database and display it on the page
        this.LoadDataFromDb();
    }

    // toggle the visibility of the toolbar
    ToggleToolBar_handler() {
        console.log("attempting to toggle toolbar visibility")
        console.log(document.getElementById("toolBarVisibilityToggle").textContent);
        this.map.pm.toggleControls();
        // update the text on the visibility toggle link
        if(this.map.pm.controlsVisible()) {
            console.log("setting to show")
            document.getElementById("toolBarVisibilityToggle").textContent="Hide tools"
        } else {
            console.log("setting to hide")
            document.getElementById("toolBarVisibilityToggle").textContent="Show tools"
        }
    }

    // sets up the possible base layers that can be used by the map
    SetupAvailableLayers() {
        // possible maps https://leaflet-extras.github.io/leaflet-providers/preview/

        // sat images
        var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });
        this.availableLayers.push({ label: "Esri Satelite", layer: Esri_WorldImagery })

        // topo map
        var Thunderforest_Outdoors = L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}', {
            attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            apikey: '6ceeda90965642818c0223946515f2e5',
            maxZoom: 19
        });
        this.availableLayers.push({ label: "Thunderforest Outdoors", layer: Thunderforest_Outdoors });
        
        // open topo map
        // var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        //     maxZoom: 19,
        //     attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        // });
        // availableLayers.push({ label: "OpenTopoMap", layer: OpenTopoMap });

        var OpenStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })
        this.availableLayers.push({ label: "OpenStreetMap", layer: OpenStreetMap });

        this.map.pm.addControls({  
            position: 'topleft',  
            drawCircleMarker: false,
            rotateMode: false,
        });
    }

    // attempts to load the given tile/base layer
    LoadTileLayer(layerNameToLoad) {
        if(this.currentLayer) {
            // if we're already displaying a tile layer then remove it
            this.map.removeLayer(this.currentLayer);
        }
        // locate the wanted layer in our collection of available layers, once found load it
        for (let possibleLayer of this.availableLayers) {
            if(possibleLayer.label === layerNameToLoad) {
                this.map.addLayer(possibleLayer.layer);
                this.currentLayer = possibleLayer.layer;
                break;
            }
        }
    }

    // get the key from the query string
    GetMapKey() {
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        return params.key;
    }

    // removes all geoman/annotation layers
    ClearAllDrawingLayers() {
        this.map.eachLayer(function(layer){
            if(layer instanceof L.Path || layer instanceof L.Marker){
                layer.remove();
            }
        });
    }

    // takes a set of configuration and layer data and displays it on the map
    ShowDataOnMap(config, data) {

        // configure the map as per data from db
        let configJson =  JSON.parse(config);
        if(configJson) {
            this.map.setView(new L.LatLng(configJson.center.lat, configJson.center.lng), configJson.zoom);
        }

        var geoLayers = JSON.parse(data);
        if(geoLayers) {
            for (let geoLayer of geoLayers){
                //console.log("we're adding a layer of type " + geoLayer.geometry.type)
                // we have to treat point layers differently - circles and markers are built from points, but are not supported in
                // the geojson format, so we need to reconstruct them using the options we crammed in the geojson layers when no one was looking
                if(geoLayer.geometry.type === "Point") {
                    //console.log("it's a point");
                    L.geoJSON(geoLayer, {
                        pointToLayer: function (feature, latlng) {
                            // it's a marker - so it could be a circle or a marker (a marker can also be a text marker! yay!)
                            // if its got a radius then it must be a circle right?!?
                            if(feature.properties && feature.properties.radius) {
                                // console.log("it's a circle");
                                // console.log(feature.properties)
                                return L.circle(latlng, feature.properties);
                            } else {
                                // it's a marker! If it's a text marker then that is determined by the properties
                                // console.log("it's a marker");
                                // console.log(feature.properties)
                                // if we just throw the feature properies at the new marker as its options then it messes up some stuff internally on the marker (icon property)
                                // so just copy the ones we care about to maintain our marker state
                                let featureOptions = {};
                                if(feature.properties && feature.properties.textMarker == true) {
                                    featureOptions.textMarker = true;
                                    featureOptions.text = feature.properties.text;
                                }
                                //console.log(featureOptions);
                                return L.marker(latlng, featureOptions);
                            }
                        }
                    }).addTo(this.map);
                } else {
                    //console.log("I don't think we need to do anything special for this type of layer");
                    L.geoJSON(geoLayer).addTo(this.map);
                }
            }
        }
        this.HideLoadingPanel();
    }

    // used to display feedback information to the user
    ShowUserMessage(type, message) {
        // if it's an error message then the user has to close it; -1 duration means manual close
        let duration = type === 'danger' ? -1  : 8000;
        Toastify({
            text: message,
            className: "alert-"+type,
            duration: duration,
            close: true
        }).showToast();
    }

    // used to load from the database map configuration and annotations based on the key value in the query params
    LoadDataFromDb() {
        this.ShowLoadingPanel();
        this.ClearAllDrawingLayers();

        let mapKey = this.GetMapKey();
        if(mapKey) {
            // using the key, request data from the db
            let postData = { 'key' : mapKey };
            fetch('/getmapdata?' + new URLSearchParams({
                    key: mapKey
                }), { headers: {
                        'Content-Type': 'application/json'
                } })
            .then((response) => {
                if(response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            })
            .then((dataResponse) => {
                // we don't need the whole record, just the config and the data fields
                this.ShowDataOnMap(dataResponse.Config,dataResponse.Data);
            })
            .catch(err => {
                // there's got to be a better way!
                console.log("we're in the error handler")
                console.log(err)
                if(err.json) {
                    err.json().then((json) => {
                        this.ShowUserMessage("danger", json.error)
                    })
                } else {
                    this.ShowUserMessage("danger", err)
                }
                this.HideLoadingPanel();
            })
        } else {
            this.ShowUserMessage("info", "No key was supplied in query string params so I couldn't load any data.")
            this.HideLoadingPanel();
        }
    }

    // used to save whatever is on the current map into the database, using the key value in the query params
    SaveDataToDb(){
        // we're going to check if we're editing and if we are we want to turn off editing
        // otherwise we end up saving all the temp edit shapes, and that sucks.
        // these methods seem weirdly named, but they seem to do what we want ...?
        if(this.map.pm.globalEditModeEnabled()) {
            this.map.pm.disableGlobalEditMode();
        }

        let mapKey = this.GetMapKey();
        if(!mapKey) {
            // show user an error
            this.ShowUserMessage("info", "I can't save anything because there's no key in the query string params - stop messing around!")
            return;
        }

        var geoJsonLayers = [];
        
        this.map.eachLayer(function(layer){
            if(layer instanceof L.Path || layer instanceof L.Marker){
                // console.log("we're saving a layer! This is the layer:")
                // console.log(layer)
                let geoJsonLayer = layer.toGeoJSON();
                // cram the layer options into the geoJson layer. The options hold information that isn't supported by the 
                // geojson format that we can use to reconstruct the layer later
                // console.log("These are the layer.options")
                // console.log(layer.options)
                // set the radius - after a circle is edited the radius isn't set right??????
                layer.options.radius = layer._mRadius;
                geoJsonLayer.properties = layer.options;
                //console.log("the _mRadius is " + layer._mRadius)
                geoJsonLayers.push(geoJsonLayer);
            }
        });

        let mapConfigJson = {
            center : this.map.getCenter(),
            zoom : this.map.getZoom()
        }

        let postData = JSON.stringify({ 'key' : mapKey, 'data' : geoJsonLayers, 'config' : mapConfigJson});

        fetch('/setmapdata', { method: "POST", body: postData, 
            headers: {
                'Content-Type': 'application/json'
            } })
        .then((response) => {
            if(response.ok) {
                this.ShowUserMessage("success", "Map annotations have been saved!")
                // there is no data to process ... don't need to return anything to next .then
            } else {
                return Promise.reject(response);
            }
        })
        .catch(err => {
            // [unhappy emoji]
            if(err.json) {
                err.json().then((json) => {
                    this.ShowUserMessage("danger", json.error)
                })
            } else {
                this.ShowUserMessage("danger", err)
            }
        })
    }

    // text markers don't normally scale. This function scales them based on the current zoom level
    ResizeTextMarkersBasedOnZoom() {
        var rootCSS = document.querySelector(':root');
        let layers = this.map.pm.getGeomanLayers();

        //var size = 18 * (map.getZoom() / 18);
        var size = this.map.getZoom() - 4;
        // set the font size in relation to the current zoom level
        rootCSS.style.setProperty('--fontSize', size+'px');
        // for each textmarker layer we need the text area to resize
        layers.forEach((layer)=>{
            if(layer.defaultOptions && layer.defaultOptions.textMarker) {
                // we're going to force it to resize the text area by setting the content
                let currentText = layer.pm.getText()
                layer.pm.setText(currentText)
            }
        });
    }
    
    ShowLoadingPanel() {
        document.getElementsByClassName('loader')[0].style.display  = 'block';
    }
    HideLoadingPanel() {
        document.getElementsByClassName('loader')[0].style.display  = 'none';
    }
  }
