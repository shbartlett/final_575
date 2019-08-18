var toner = L.tileLayer.provider('Stamen.Toner'),
			    voyager = L.tileLayer.provider('CartoDB.Voyager');
			var map = L.map('map', {
	    layers: [toner] // only add one!
    })
    .setView([38, -78], 7);
			var baseLayers = {
	"Stamen Toner": toner,
	"Carto DB Voyager": voyager};
	L.control.layers(baseLayers).addTo(map);
	var myIcon = L.icon({
    iconUrl: 'images/SVG/Asset 7.svg',
    popupAnchor: [38, -77],

});
L.marker([39, -74.5], {icon: myIcon}).addTo(map);

	var MyCustomControl = L.Control.extend({
	    options: {
	        // Default control position
	        position: 'bottomleft'
	    },
	    onAdd: function (map) {
	        // Create a container with classname and return it
	        return L.DomUtil.create('div', 'my-custom-control');
	    },
	    setContent: function (content) {
	        // Set the innerHTML of the container
	        this.getContainer().innerHTML = content;
	    }
	});


	// Assign to a variable so you can use it later and add it to your map
	var myCustomControl =  new MyCustomControl().addTo(map);
			var latlon = L.control.mousePosition('js/L.Control.Mouse.Position.js').addTo(map);

			var myStyle = { // Define your style object
			    "color": "#14C5CB"
			};
			$.getJSON("data/DMV_STATES.geojson",function(data){
			// add GeoJSON layer to the map once the file is loaded
			var states = L.geoJson(data ,{
				style: myStyle, // Assign the style object to the "style" property of the layer
			onEachFeature: function(feature, featureLayer) {
			featureLayer.bindPopup(feature.properties.NAME);
			}
			}).addTo(map);
			map.fitBounds(datalayer.getBounds());

			geojson_layer.eachLayer(function (layer) {
  if(layer.states.properties.NAME = 'Virginia') {
    layer.setStyle({strokeColor :'#14C5CB'});
  };

});
			});


			function createLegend(map, attributes){
			    var LegendControl = L.Control.extend({
			        options: {
			            position: 'topright'
			        },

			        onAdd: function (map) {
			            // create the control container with a particular class name
			            var container = L.DomUtil.create('div', 'legend-control-container');

			            //add temporal legend div to container
			            $(container).append('<div id="temporal-legend">')

			            //Step 1: start attribute legend svg string
			            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

			            //array of circle names to base loop on
			            var circles = {
			                max: 20,
			                mean: 40,
			                min: 60
			            };

			            //Step 2: loop to add each circle and text to svg string
			            for (var circle in circles){
			                //circle string

			                svg += '<circle class="legend-circle" id="' + circle + '" fill="#E34132" fill-opacity="0.9" stroke="#000000" cx="30"/>';

			                //text string
			                svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';

			            };

			            //close svg string
			            svg += "</svg>";
			            //add attribute legend svg to container
			            $(container).append(svg);

			            return container;
			        }
			    });

			    map.addControl(new LegendControl());

			    updateLegend(map, attributes[0]);
			};


// initialize up the L.control.layers
			$.getJSON("data/DMV_HOUSING.geojson")
.done(function(data) {
    var info = processData(data);
    var prop = createPropSymbols(info.timestamps, data);
    var slide = createSliderUI(info.timestamps);
		createLegend(info.min,info.max);

});

function processData(data) {
  // initialize the variables to hold the timestamps and min/max values
  var timestamps = [];  // square brackets to define an array of data
                        // because there are multiple timestamps
  var	min = Infinity; // for the min, begin with the largest possible value - infinity
  var	max = -Infinity;// for the max, begin with the smallest possible value - negative infinity

  // Go through each row/feature of the data table
  // Note data is the variable name in the function definition - processData(data)
  for (var feature in data.features) {
      var properties = data.features[feature].properties;

      // At each row, go through the columns/attributes to get the values
      for (var attribute in properties) {
          if ( attribute != 'Id' &&
               attribute != 'Id2' )   // != means NOT EQUAL TO
                                      // These columns are NOT recorded

          {
              if ( $.inArray(attribute,timestamps) ===  -1) { // JQuery in.Array() method searches for a specified value within an array and return its index (or -1 if not found)
                                                // here, the new timestamp is only added when it is not already in the array
                                                // triple equals === compares both type and value

                  timestamps.push(attribute);  // The JS push() method adds new items to the end of an array
                                               // and returns the new length of the array
              }
              if (properties[attribute] < min) {
                  min = properties[attribute]; // record/update the current smaller values as the min
              }
              if (properties[attribute] > max) {
                  max = properties[attribute]; // record/update the current larger values as the max
              }
          }
      }
  }
  return { // the function finally returns the timestamps array, the min and max housing costs
      timestamps : timestamps,
      min : min,
      max : max
  }
}

// The function to draw the proportional symbols
function createPropSymbols(timestamps, data) {

  cities = L.geoJson(data, {

      pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, {
              fillColor: "#FA8072",
              color: '#FFFFFF',
              weight: 2,
              fillOpacity: 0.6

          }).on({
                mouseover: function(e) {
                    this.openPopup();
                    this.setStyle({fillColor: 'green'});  // fill color turns green when mouseover
                },
                mouseout: function(e) {
                    this.closePopup();
                    this.setStyle({fillColor: '#FA8072'});  // fill turns original color when mouseout
                }
        });
      }
  }).addTo(map);

  updatePropSymbols(timestamps[0]); // this function is defined below
                                  // When loaded, the map will first show proportional symbols with the first timestamp's data
}

// The function to update/resize each circle marker according to a value in the time series
function updatePropSymbols(timestamp) {

  cities.eachLayer(function(layer) {  // eachLayer() is an Leaflet function to iterate over the layers/points of the map

      var props = layer.feature.properties;   // attributes
      var radius = calcPropRadius(props[timestamp]); // circle radius, calculation function defined below

      // pop-up information (when mouseover) for each city is also defined here
      var popupContent = props.County + ', ' + timestamp + ': $' + String(props[timestamp]) ;

      layer.setRadius(radius);  // Leaflet method for setting the radius of a circle
      layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) }); // bind the popup content, with an offset
  });
}

// calculate the radius of the proportional symbols based on area
function calcPropRadius(attributeValue) {

  var scaleFactor = .5;   // the scale factor is used to scale the values; the units of the radius are in meters
                             // you may determine the scale factor accordingly based on the range of the values and the mapping scale
  var area = attributeValue * scaleFactor;

  return Math.sqrt(area/Math.PI);  // the function return the radius of the circle to be used in the updatePropSymbols()
}

function createSliderUI(timestamps) {
  var sliderControl = L.control({ position: 'bottomleft'} );


	 // position of the slider
                    // Another use of L.control :)
  sliderControl.onAdd = function(map) {
    //initialize a range slider with mousedown control
      var slider = L.DomUtil.create("input", "range-slider");
      L.DomEvent.addListener(slider, 'mousedown', function(e) {
          L.DomEvent.stopPropagation(e);
      });

    // Define the labels of the time slider as an array of strings
    // Modify this for your data
    var labels = ["Median Monthly Housing Cost for 2010", "Median Monthly Housing Cost for 2011","Median Monthly Housing Cost for 2012",
		"Median Monthly Housing Cost for 2013", "Median Monthly Housing Cost for 2014",
		"Median Monthly Housing Cost for 2015","Median Monthly Housing Cost for 2016","Median Monthly Housing Cost for 2017"];


    $(slider)
        .attr({
          'type':'range',
          'max': timestamps[7],
          'min':timestamps[0],
          'step': 1, // Change this to match the numeric interval between adjacent timestamps
          'value': String(timestamps[0,1,2,3,4,5,6,7])
        })



        .on('input change', function() {
            updatePropSymbols($(this).val().toString()); // automatic update the map for the timestamp
            var i = $.inArray(this.value,timestamps);
            $(".temporal-legend").text(labels[i]); // automatic update the label for the timestamp
        });


    return slider;
  }
  sliderControl.addTo(map);
  createTimeLabel("Median Monthly Housing Cost for 2017"); //The starting timestamp label
  }

  // Add labels to the time slider when the map first loaded
  function createTimeLabel(startTimestamp) {
    var temporalLegend = L.control({position: 'bottomleft' }); // same position as the slider
                       // One more use of L.control !!
    temporalLegend.onAdd = function(map) {
      var output = L.DomUtil.create("output", "temporal-legend");
      $(output).text(startTimestamp);
      return output;
    }
    temporalLegend.addTo(map);
  }


	function drawLegend(data) {

				var largeDiameter = calcRadius(data.features[0].properties.timestamps) * 2,
						smallDiameter = largeDiameter/2;

				$("#legend").css('height', largeDiameter.toFixed());

				$('#legend-large').css({
						'width': largeDiameter.toFixed(),
						'height': largeDiameter.toFixed()
				})

				$("#legend-large-label").html(data.features[0].properties.timestamps.toLocaleString());

				$("#legend-large-label").css({
						'left': largeDiameter + 30,
						'top' : -8
				});

				$('#legend-small').css({
						'width': smallDiameter.toFixed(),
						'height': smallDiameter.toFixed(),
						'top': largeDiameter - smallDiameter,
						'left': smallDiameter/2
				})

				$("#legend-small-label").html((data.features[0].properties.timestamps/2).toLocaleString());

				$("#legend-small-label").css({
						'top': smallDiameter - 8,
						'left': largeDiameter + 30
				});

				$("<hr class='large'>").insertBefore("#legend-large-label")
				$("<hr class='small'>").insertBefore("#legend-small-label").css('top', largeDiameter - smallDiameter - 8);

	}

	var Legend =  new L.Control.Legend({
        position: 'topleft',
        collapsed: true,
        controlButton: {
            title: "Legend"
        }
});
map.addControl( Legend );

$(".legend-container").append( $("#legend") );
$(".legend-toggle").append( "<i class='legend-toggle-icon fa fa-info fa-2x' style='color: #000'></i>" );
