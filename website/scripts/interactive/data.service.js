angular.module('interactive-app')
    .factory('dataService', function ($http) {
        return {
            getHeroes: () => {
                return $http.get('./data/heroes.json');
            },

            getCamps: () => {
                return $http.get('./data/camps.json');
            },

            getCities: () => {
                return $http.get('./data/texas.json');
            }
        }
    });