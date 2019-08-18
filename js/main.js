/* SHB, 2019 */

//initialize function called when the script loads

 {
	var map = L.map('map').setView([38, -78], 7);

L.tileLayer.provider('Stamen.Toner').addTo(map);
L.Control.MousePosition = L.Control.extend({
  options: {
    position: 'bottomleft',
    separator: ' : ',
    emptyString: 'Unavailable',
    lngFirst: false,
    numDigits: 5,
    lngFormatter: undefined,
    latFormatter: undefined,
    prefix: ""
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
    L.DomEvent.disableClickPropagation(this._container);
    map.on('mousemove', this._onMouseMove, this);
    this._container.innerHTML=this.options.emptyString;
    return this._container;
  },

  onRemove: function (map) {
    map.off('mousemove', this._onMouseMove)
  },

  _onMouseMove: function (e) {
    var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
    var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
    var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
    var prefixAndValue = this.options.prefix + ' ' + value;
    this._container.innerHTML = prefixAndValue;
  }

});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.mousePosition = function (options) {
    return new L.Control.MousePosition(options);
};


function processData(data) {
		var timestamps = [2010,2011,2012,2013,2014,2015,2016,2017];
		var min = Infinity;
		var max = -Infinity;

		for (var feature in data.features) {

			var properties = data.features[feature].properties;

			for (var attribute in properties) {

				if ( attribute != ‘id’ &&
				  attribute != ‘name’ &&
				  attribute != ‘lat’ &&
				  attribute != ‘lon’ ) {

					if ( $.inArray(attribute,timestamps) === -1) {
						timestamps.push(attribute);
					}

					if (properties[attribute] < min) {
						min = properties[attribute];
					}

					if (properties[attribute] > max) {
						max = properties[attribute];
					}
				}
			}
		}

		return {
			timestamps : timestamps,
			min : min,
			max : max
		}
	}
};


//call the initialize function when the document has loaded
