angular.module('interactive-app')
    .factory('mapService', function () {
        return {
            init: () => {
                var script = document.createElement('script');
                script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDn-3Kkt4q8O2EHWp4TJoA1YgUDHywCeN4&callback=initialize";
                script.type = "text/javascript";
                document.getElementsByTagName("body")[0].appendChild(script);
            }
        }
    });

function initialize() {
    angular.element($('#map')).scope().initMap();
}