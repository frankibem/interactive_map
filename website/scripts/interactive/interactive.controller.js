var interactiveApp = angular.module('interactive-app', []);

interactiveApp.controller('campCtrl', ['$scope', '$compile', 'dataService', 'mapService',
    function ($scope, $compile, dataService, mapService) {
        $scope.initMap = () => {
            $scope.map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 50.06419, lng: 13.35937 },
                zoom: 6, // determined by trial and error
                gestureHandling: 'cooperative',
                mapTypeControl: false,            
                streetViewControl: false,
                fullscreenControl: false,
                styles: [
                    {
                        "elementType": "labels",
                        "stylers": [
                            {
                                "saturation": -100
                            },
                            {
                                "gamma": 1.33
                            }
                        ]
                    },
                    {
                        "featureType": "administrative.locality",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape",
                        "stylers": [
                            {
                                "saturation": "-100"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "saturation": "-100"
                            },
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.man_made",
                        "stylers": [
                            {
                                "color": "#eff4f5"
                            },
                            {
                                "visibility": "on"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.man_made",
                        "elementType": "geometry",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.man_made",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.natural",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "poi",
                        "stylers": [
                            {
                                "hue": "#00e3ff"
                            },
                            {
                                "saturation": "-70"
                            },
                            {
                                "lightness": "0"
                            },
                            {
                                "gamma": "1"
                            },
                            {
                                "weight": "1"
                            }
                        ]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "geometry.stroke",
                        "stylers": [
                            {
                                "saturation": "-100"
                            },
                            {
                                "lightness": "0"
                            }
                        ]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "saturation": "-100"
                            },
                            {
                                "lightness": "1"
                            },
                            {
                                "gamma": "1"
                            },
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "poi.business",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "labels.icon",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road.arterial",
                        "stylers": [
                            {
                                "lightness": "40"
                            },
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road.highway",
                        "stylers": [
                            {
                                "saturation": "-100"
                            },
                            {
                                "lightness": "60"
                            },
                            {
                                "gamma": 1
                            }
                        ]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road.local",
                        "stylers": [
                            {
                                "saturation": -100
                            },
                            {
                                "lightness": "60"
                            },
                            {
                                "gamma": 1
                            },
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "transit",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "transit",
                        "elementType": "labels.icon",
                        "stylers": [
                            {
                                "saturation": "-100"
                            },
                            {
                                "lightness": "0"
                            },
                            {
                                "gamma": ".5"
                            },
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "transit",
                        "elementType": "labels.text",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "water",
                        "stylers": [
                            {
                                "color": "#92aaad"
                            }
                        ]
                    }
                ]
            });

            // Single InfoWindow to be redrawn for each marker
            $scope.infoWindow = new google.maps.InfoWindow({
                content: ''
            });

            fetchCampsAndHeroes();
        }

        // Load hero and camp information
        function fetchCampsAndHeroes() {
            $scope.loading = true;
            dataService.getHeroes()
                .then(function (response) {
                    $scope.heroes = response.data;

                    dataService.getCamps()
                        .then(function (response) {
                            $scope.camps = response.data;
                            mergeData();
                            drawMarkers();
                        });
                });
        }

        // Merge hero and camp data into list of composite objects with camp and heroes for each group
        function mergeData() {
            var camp_heroes = [];
            for (var i = 0; i < $scope.camps.length; i++) {
                camp = $scope.camps[i];

                // Get all heroes for current camp
                heroes = [];
                for (var j = 0; j < camp.heroes.length; j++) {
                    // Note: heroes are sorted by id
                    hero = $scope.heroes[camp.heroes[j]];
                    heroes.push(hero);
                }

                // Order heroes by name
                heroes.sort(function (hero1, hero2) {
                    return hero1.name.localeCompare(hero2.name);
                });

                camp_heroes.push({
                    id: camp.id,
                    name: camp.name,
                    lat: camp.lat,
                    lon: camp.lon,
                    heroes: heroes
                });
            }
            $scope.camp_heroes = camp_heroes;
        }

        // Draw markers for each object in $scope.group_heroes
        function drawMarkers() {
            markers = [];
            for (var i = 0; i < $scope.camp_heroes.length; i++) {
                var camp = $scope.camp_heroes[i];
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(camp.lat, camp.lon),
                    map: $scope.map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 6,
                        labelOrigin: new google.maps.Point(0, 3)
                    },
                    title: camp.name,
                    label: {
                        text: camp.name,
                        fontSize: "16px",
                        fontWeight: "bold"
                    }
                });
                markers.push(marker);
                camp.marker = marker;
                addMarkerListener(marker, camp);
            }

            // Cluster the markers
            var markerCluster = new MarkerClusterer($scope.map, markers, { imagePath: 'images/clusters/m' });
            $scope.loading = false;
        }

        // Create info window when marker is clicked (closure is necessary)
        function addMarkerListener(marker, camp) {
            marker.addListener('click', function () {
                showInfoWindowForCamp(camp, marker);
            });
        }

        // Close previous infowindow and reopen for clicked marker
        function showInfoWindowForCamp(camp, marker) {
            $scope.infoWindow.close();

            var template =
                `<h4>${camp.name}</h4>
                <button type="button" class="btn btn-small" ng-click="showCampHeroes(${camp.id})">
                    View Liberators
                </button>`;
            var compiledView = $compile(template)($scope);
            var holder = document.createElement('div');
            for (var i = 0; i < compiledView.length; i++) {
                holder.appendChild(compiledView[i]);
            }

            $scope.infoWindow.setContent(holder);
            $scope.infoWindow.open($scope.map, marker);
        }

        $scope.showCampHeroes = function (campId) {
            $scope.loading = true;
            $scope.currentCamp = $scope.camp_heroes.filter(camp => camp.id === campId)[0];
            $scope.loading = false;

            $('html, body').animate({ scrollTop: $(window).height() }, 1000);
        }

        $scope.onMapCampChanged = function (mapCamp) {
            if (mapCamp) {
                // Center on marker
                $scope.map.setZoom(13);
                $scope.map.panTo(mapCamp.marker.getPosition());
            }
        }

        mapService.init();
    }
]);

// Duplication: Exact logic as campCtrl but calls getCities() instead
interactiveApp.controller('texasCtrl', ['$scope', '$compile', 'dataService', 'mapService',
    function ($scope, $compile, dataService, mapService) {
        $scope.initMap = () => {
            $scope.map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 31.96859, lng: -99.90181 },
                zoom: 6, // determined by trial and error
                gestureHandling: 'cooperative',
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                styles: [
                    {
                        "elementType": "labels",
                        "stylers": [
                            {
                                "saturation": -100
                            },
                            {
                                "gamma": 1.33
                            }
                        ]
                    },
                    {
                        "featureType": "administrative.locality",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape",
                        "stylers": [
                            {
                                "saturation": "-100"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "saturation": "-100"
                            },
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.man_made",
                        "stylers": [
                            {
                                "color": "#eff4f5"
                            },
                            {
                                "visibility": "on"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.man_made",
                        "elementType": "geometry",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.man_made",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.natural",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "poi",
                        "stylers": [
                            {
                                "hue": "#00e3ff"
                            },
                            {
                                "saturation": "-70"
                            },
                            {
                                "lightness": "0"
                            },
                            {
                                "gamma": "1"
                            },
                            {
                                "weight": "1"
                            }
                        ]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "geometry.stroke",
                        "stylers": [
                            {
                                "saturation": "-100"
                            },
                            {
                                "lightness": "0"
                            }
                        ]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "saturation": "-100"
                            },
                            {
                                "lightness": "1"
                            },
                            {
                                "gamma": "1"
                            },
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "poi.business",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "labels.icon",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road.arterial",
                        "stylers": [
                            {
                                "lightness": "40"
                            },
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road.highway",
                        "stylers": [
                            {
                                "saturation": "-100"
                            },
                            {
                                "lightness": "60"
                            },
                            {
                                "gamma": 1
                            }
                        ]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road.local",
                        "stylers": [
                            {
                                "saturation": -100
                            },
                            {
                                "lightness": "60"
                            },
                            {
                                "gamma": 1
                            },
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "transit",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "transit",
                        "elementType": "labels.icon",
                        "stylers": [
                            {
                                "saturation": "-100"
                            },
                            {
                                "lightness": "0"
                            },
                            {
                                "gamma": ".5"
                            },
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "transit",
                        "elementType": "labels.text",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "water",
                        "stylers": [
                            {
                                "color": "#92aaad"
                            }
                        ]
                    }
                ]
            });

            // Single InfoWindow to be redrawn for each marker
            $scope.infoWindow = new google.maps.InfoWindow({
                content: ''
            });

            fetchCitiesAndHeroes();
        }

        // Load hero and camp information
        function fetchCitiesAndHeroes() {
            $scope.loading = true;
            dataService.getHeroes()
                .then(function (response) {
                    $scope.heroes = response.data;

                    dataService.getCities()
                        .then(function (response) {
                            $scope.camps = response.data;
                            mergeData();
                            drawMarkers();
                        });
                });
        }

        // Merge hero and camp data into list of composite objects with camp and heroes for each group
        function mergeData() {
            var camp_heroes = [];
            for (var i = 0; i < $scope.camps.length; i++) {
                camp = $scope.camps[i];

                // Get all heroes for current camp
                heroes = [];
                for (var j = 0; j < camp.heroes.length; j++) {
                    // Note: heroes are sorted by id
                    hero = $scope.heroes[camp.heroes[j]];
                    heroes.push(hero);
                }

                // Order heroes by name
                heroes.sort(function (hero1, hero2) {
                    return hero1.name.localeCompare(hero2.name);
                });

                camp_heroes.push({
                    id: camp.id,
                    name: camp.name,
                    lat: camp.lat,
                    lon: camp.lon,
                    heroes: heroes
                });
            }
            $scope.camp_heroes = camp_heroes;
        }

        // Draw markers for each object in $scope.group_heroes
        function drawMarkers() {
            markers = [];
            for (var i = 0; i < $scope.camp_heroes.length; i++) {
                var camp = $scope.camp_heroes[i];
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(camp.lat, camp.lon),
                    map: $scope.map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 6,
                        labelOrigin: new google.maps.Point(0, 3)
                    },
                    title: camp.name,
                    label: {
                        text: camp.name,
                        fontSize: "16px",
                        fontWeight: "bold"
                    }
                });
                markers.push(marker);
                camp.marker = marker;
                addMarkerListener(marker, camp);
            }

            // Cluster the markers
            var markerCluster = new MarkerClusterer($scope.map, markers, { imagePath: 'images/clusters/m' });
            $scope.loading = false;
        }

        // Create info window when marker is clicked (closure is necessary)
        function addMarkerListener(marker, camp) {
            marker.addListener('click', function () {
                showInfoWindowForCamp(camp, marker);
            });
        }

        // Close previous infowindow and reopen for clicked marker
        function showInfoWindowForCamp(camp, marker) {
            $scope.infoWindow.close();

            var template =
                `<h4>${camp.name}</h4>
                <button type="button" class="btn btn-small" ng-click="showCampHeroes(${camp.id})">
                    View Liberators
                </button>`;
            var compiledView = $compile(template)($scope);
            var holder = document.createElement('div');
            for (var i = 0; i < compiledView.length; i++) {
                holder.appendChild(compiledView[i]);
            }

            $scope.infoWindow.setContent(holder);
            $scope.infoWindow.open($scope.map, marker);
        }

        $scope.showCampHeroes = function (campId) {
            $scope.currentCamp = $scope.camp_heroes.filter(camp => camp.id === campId)[0];
            $('html, body').animate({ scrollTop: $(window).height() }, 1000);
        }

        $scope.onMapCampChanged = function (mapCamp) {
            if (mapCamp) {
                // Center on marker
                $scope.map.setZoom(13);
                $scope.map.panTo(mapCamp.marker.getPosition());
            }
        }

        mapService.init();
    }
]);
