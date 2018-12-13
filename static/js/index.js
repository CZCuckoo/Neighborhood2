var fourSquareSecret = "client_id=3AISUGDKCWVZPEILE41CLJI4MV0P2A4RBMSWF1JHFXYA2QPT&client_secret=GVMJSGMG4MRM2HDITEFGV0LE0VWRIZEDORPETPRAVDSQ1JY1&v=20181114";

var map;
var latvar = 42.361145;
var lngvar = -71.057083;

var galleries = ko.observableArray();
var markers = [];
var availableCities = ko.observableArray();
availableCities.push("View All");


var dropdown = document.getElementById('cityDropdown')
dropdown.addEventListener('change', function(){
    var selectedCity = dropdown.value;
    $.each(markers, function(index){
        var marker = markers[index];
        if (marker.city === selectedCity || selectedCity === "View All") {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        } 
    });
});

function initMap () {

    //constructor creates a new map.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: latvar, lng: lngvar},
        zoom: 13,
        // **** Setting styles. Not working if I link to external. 
        // styles: styles,
        mapTypeControl: false
    });

    // Add a style-selector control to the map.
    var styleControl = document.getElementById('style-selector-control');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(styleControl);

    // Set the map's style to the initial value of the selector.
    var styleSelector = document.getElementById('style-selector');
    map.setOptions({styles: styles[styleSelector.value]});

    // Apply new JSON when the user selects a different style.
    styleSelector.addEventListener('change', function() {
      map.setOptions({styles: styles[styleSelector.value]});
    });


    var largeInfowindow = new google.maps.InfoWindow();
    galleries.subscribe(function(changes) {
        
        for (var i = 0; i < changes.length; i++) {
            var index = changes[i].index;
            // Get the position from the location Array.
            var position = galleries()[index].location;
            var title = galleries()[index].title;
            var VENUE_ID = galleries()[index].id;
            var city = galleries()[index].city;
    
            // Create a marker per location, and put into markers Array.
            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: VENUE_ID,
                city: city
            });
    
            // Push the marker to the array of markers.
            markers.push(marker);
            if (typeof city != "undefined" && availableCities.indexOf(city) == -1) {
                availableCities.push(city);
            }
            
    
            // Create an onclick event to open an infowindow at each marker.
            marker.addListener('click', function() {
                populateInfoWindow(this, largeInfowindow);
            });        
        }
    }, null, "arrayChange");
    ko.applyBindings(galleries);
    google.maps.event.addDomListener(window, 'load', initializeGalleries);


    // Function to populate the infowindow when a marker is clicked. 
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            var footer = '<br><div>' + marker.title + '</div><img src="static/img/powered-by-foursquare-blue.png" width ="200">';
            $.get( "https://api.foursquare.com/v2/venues/" + marker.id + "/photos?" + fourSquareSecret, function( data ) {
                if (data.response.photos.count > 0) {
                    infowindow.setContent('<img src="' + data.response.photos.items[0].prefix + "width200" + data.response.photos.items[0].suffix + '">' + footer);  
                } else {
                    infowindow.setContent(footer);
                }
                infowindow.open(map, marker);
            }).fail(function() {
                infowindow.setContent(footer);
              }).always(function() {
                infowindow.open(map, marker);
              })
            
            // Make sure the marker property is cleared if the infowindow is closed
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        };
    };
}

// var galleries = [
//   'Item 1','Item 2','Item 3'
// ];

function makeUL(array) {
  var list = document.createElement('ul');
  for(var i = 0; i < array.length; i++) {
    var item = document.createElement('li');
    item.appendChild(document.createTextNode(array[i]));
    list.appendChild(item);
  }
  return list;
}

document.getElementById('gallerylist').appendChild(makeUL(galleries));





function initializeGalleries() {
    loadGalleries("",latvar,lngvar);
}

function artGallery(id, name, location) {
    var self = this;
    self.id = id;
    self.title = name;
    self.location = {lat: location.lat, lng: location.lng};
    self.displayAddress = location.address + " " + location.city + ", "+ location.state;
    self.city = location.city
  };
  
  loadGalleries = function (query,lat,lng) {
      if (query !== "") {
          query = "&query=" + query;
      }
  
      $.get( "https://api.foursquare.com/v2/venues/search?ll=" + lat + "," + lng + query + "&categoryId=4bf58dd8d48988d1e2931735&radius=8000&" + fourSquareSecret, function( data ) {
          $.each( data.response.venues, function( index, value ) {
              galleries.push(new artGallery(value.id, value.name, value.location));
          });
        }).fail(function() {
            //   TODO Better error handling
            alert( "Unable to load data from foursquare. Falling back to fixed data" );
          });;
  };

var styles = {
    default: null,
    silver: [
      {
        elementType: 'geometry',
        stylers: [{color: '#f5f5f5'}]
      },
      {
        elementType: 'labels.icon',
        stylers: [{visibility: 'off'}]
      },
      {
        elementType: 'labels.text.fill',
        stylers: [{color: '#616161'}]
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [{color: '#f5f5f5'}]
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [{color: '#bdbdbd'}]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{color: '#eeeeee'}]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#757575'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#e5e5e5'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9e9e9e'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#ffffff'}]
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.text.fill',
        stylers: [{color: '#757575'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#dadada'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#616161'}]
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9e9e9e'}]
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [{color: '#e5e5e5'}]
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{color: '#eeeeee'}]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#c9c9c9'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9e9e9e'}]
      }
    ],

    night: [
      {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#263c3f'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#6b9a76'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}]
      }
    ],

    retro: [
      {elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{color: '#c9b2a6'}]
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'geometry.stroke',
        stylers: [{color: '#dcd2be'}]
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [{color: '#ae9e90'}]
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#93817c'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [{color: '#a5b076'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#447530'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#f5f1e6'}]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{color: '#fdfcf8'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#f8c967'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#e9bc62'}]
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry',
        stylers: [{color: '#e98d58'}]
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry.stroke',
        stylers: [{color: '#db8555'}]
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{color: '#806b63'}]
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'transit.line',
        elementType: 'labels.text.fill',
        stylers: [{color: '#8f7d77'}]
      },
      {
        featureType: 'transit.line',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#ebe3cd'}]
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{color: '#b9d3c2'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#92998d'}]
      }
    ],

    hiding: [
      {
        featureType: 'poi.business',
        stylers: [{visibility: 'off'}]
      },
      {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{visibility: 'off'}]
      }
    ]
}