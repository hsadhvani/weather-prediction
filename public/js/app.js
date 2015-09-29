
// create angular app
var app = angular.module('weather_app', ['ui.bootstrap']);
// global variables
var outputData = [];
var unitDivisor = 1;
var gradient=[];

// angular controller
app.controller('stationCtrl', ['$scope', '$http', function ($scope, $http) {

    // default scope variable values
    $scope.selected = undefined;
    $scope.stationIsSelected = false;
    $scope.unitToDivide = 1;
    $scope.unitToDisplay = "";
    $scope.station_list = [];
    $scope.outputData = "";
    $scope.overallIsSelected = false;
    $scope.months = [{name: 'January', value: "01"},
        {name: 'February', value: "02"},
        {name: 'March', value: "03"},
        {name: 'April', value: "04"},
        {name: 'May', value: "05"},
        {name: 'June', value: "06"},
        {name: 'July', value: "07"},
        {name: 'August', value: "08"},
        {name: 'September', value: "09"},
        {name: 'October', value: "10"},
        {name: 'November', value: "11"},
        {name: 'December', value: "12"}
    ]
    $scope.attributes = [{name: 'Total Precipitation', value: "TPCP"},
        {name: 'Mean Monthly Temperature', value: "MNTM"},
        {name: 'Total Snow', value: "TSNW"},

    ]
    $scope.attributeSelected = "Select Attribute"
    $scope.attrubuteToLoad = null;
    $scope.monthSelected = "Month"
    $scope.monthToLoad = 0;
    $scope.showMap=false;
    $scope.showClassify=false;

    // scope functions

    /**
     *
     * selects month on click
     * @param month
     */
    $scope.selectMonth = function (month) {
        $scope.monthSelected = month.name;
        $scope.monthToLoad = month.value;

    };

    /**
     *
     * selects attribute on click
     *
     * @param attribute
     */
    $scope.selectAttribute = function (attribute) {
        $scope.attributeSelected = attribute.name;
        $scope.attrubuteToLoad = attribute.value;


    };

    /**
     *
     * loads station data and initializes map
     *
     */
    $scope.loadStationData = function () {
        if ($scope.monthToLoad == undefined || $scope.monthToLoad == null || $scope.monthToLoad == 0 || $scope.selected == undefined
            || $scope.selected == null || $scope.selected == "" || $scope.attrubuteToLoad == null || $scope.attrubuteToLoad == undefined) {
            alert('Select month, attribute and station!');
        }
        else {
            $http.post('/station/' + $scope.monthToLoad + "/" + $scope.selected, {
                attribute: $scope.attrubuteToLoad
            })
                .success(function (data) {
                    // load data and map

                    if($scope.attrubuteToLoad=='TPCP' || $scope.attrubuteToLoad=='TSNW'){
                        gradient = [
                            'rgba(0, 255, 255, 0)',
                            'rgba(0, 255, 255, 1)',
                            'rgba(0, 191, 255, 1)',
                            'rgba(0, 127, 255, 1)',
                            'rgba(0, 63, 255, 1)',
                            'rgba(0, 0, 255, 1)',
                            'rgba(0, 0, 223, 1)',
                            'rgba(0, 0, 191, 1)',
                            'rgba(0, 0, 159, 1)',
                            'rgba(0, 0, 127, 1)',
                            'rgba(63, 0, 91, 1)',
                            'rgba(127, 0, 63, 1)',
                            'rgba(191, 0, 31, 1)',
                            'rgba(255, 0, 0, 1)'
                        ];
                    }
                    else{
                        gradient=[];
                    }
                    $scope.outputData=data;
                    outputData = data;
                    console.log(data);
                    $scope.monthLoaded = $scope.monthSelected;
                    $scope.attributeLoaded = $scope.attributeSelected;
                    $scope.stationIsSelected = true;
                    $scope.overallIsSelected = false;
                    $scope.showMap=true;
                    //$scope.showClassify=false;
                    findDivideByAndUnits();
                    initializeMap(data);

                });
        }
    };




    $scope.loadStationClassify = function () {
        if ($scope.monthToLoad == undefined || $scope.monthToLoad == null || $scope.monthToLoad == 0 || $scope.selected == undefined
            || $scope.selected == null || $scope.selected == "" || $scope.attrubuteToLoad == null || $scope.attrubuteToLoad == undefined) {
            alert('Select month, attribute and station!');
        }
        else {
            $http.post('/classify/' + $scope.monthToLoad + "/" + $scope.selected, {
                attribute: $scope.attrubuteToLoad
            })
                .success(function (data) {
                    // load data and map
                    //alert(data);
                    $scope.loadStationData();
                    $scope.showClassify=true;
                    $scope.monthLoaded = $scope.monthSelected;
                    $scope.attributeLoaded = $scope.attributeSelected;
                    var classifyOutputSplit=data.output.split('\n');
                    $scope.chanceText=classifyOutputSplit[0];
                    $scope.percentChance=classifyOutputSplit[1];
                });
        }
    };

    /**
     *
     * loads overall data and initializes map
     *
     */
    $scope.loadOverallData = function () {
        if ($scope.monthToLoad == undefined || $scope.monthToLoad == null || $scope.monthToLoad == 0 ||
            $scope.attrubuteToLoad == null || $scope.attrubuteToLoad == undefined) {
            alert('Select month and attribute!');
        }
        else {
            $http.post('/station/' + $scope.monthToLoad + "/", {
                attribute: $scope.attrubuteToLoad
            })
                .success(function (data) {
                    // load data and map
                    // set gradient for precipitation and snow
                    if($scope.attrubuteToLoad=='TPCP' || $scope.attrubuteToLoad=='TSNW'){
                        gradient = [
                            'rgba(0, 255, 255, 0)',
                            'rgba(0, 255, 255, 1)',
                            'rgba(0, 191, 255, 1)',
                            'rgba(0, 127, 255, 1)',
                            'rgba(0, 63, 255, 1)',
                            'rgba(0, 0, 255, 1)',
                            'rgba(0, 0, 223, 1)',
                            'rgba(0, 0, 191, 1)',
                            'rgba(0, 0, 159, 1)',
                            'rgba(0, 0, 127, 1)',
                            'rgba(63, 0, 91, 1)',
                            'rgba(127, 0, 63, 1)',
                            'rgba(191, 0, 31, 1)',
                            'rgba(255, 0, 0, 1)'
                        ];
                    }
                    else{
                        gradient=[];
                    }
                    outputData = data;
                    $scope.monthLoaded = $scope.monthSelected;
                    $scope.attributeLoaded = $scope.attributeSelected;
                    $scope.stationIsSelected = false;
                    $scope.overallIsSelected = true;
                    $scope.showMap=true;
                    $scope.showClassify=false;
                    findDivideByAndUnits();
                    initializeMap(null);


                });

        }
    };
    // gets list of stations
    $http.get('/stations')
        .success(function (data) {
            $scope.station_list = data;
        });

    // sets units for attributes
    function findDivideByAndUnits() {
        switch ($scope.attrubuteToLoad) {
            case "TPCP":
                $scope.unitToDivide = 100;
                unitDivisor = 100;
                $scope.unitToDisplay = "inches";
                break;
            case "MNTM":
                $scope.unitToDivide = 10;
                unitDivisor = 10;
                $scope.unitToDisplay = "° F";
                break;
            case "TSNW":
                $scope.unitToDivide = 10;
                unitDivisor = 10;
                $scope.unitToDisplay = "inches";
                break;
        }


    }
}]);
/**
 *
 * loads google map for station or all
 * @param station
 */
function initializeMap(station) {
    var mapOptions = {};
    // if no station is selected
    if (station == null) {
        mapOptions = {
            zoom: 5,
            center: new google.maps.LatLng("37.27611", "-111.4813"),
            mapTypeId: google.maps.MapTypeId.MAP
        };
    }

    // else if station is select
    else {
        mapOptions = {
            zoom: 11,
            center: new google.maps.LatLng(station[0]['LATITUDE'], station[0]['LONGITUDE']),
            mapTypeId: google.maps.MapTypeId.MAP
        };

    }
    // create google heatmap
    map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);

    var heatMapData = [];
    // load heatmap data
    for (var i = 0; i < outputData.length; i++) {
        heatMapData.push({
            location: new google.maps.LatLng(outputData[i]["LATITUDE"], outputData[i]["LONGITUDE"]),
            weight: Number(outputData[i]['AVG'])/unitDivisor
        });
    }
    // update heatmap values
    // load gradient if set

    if(gradient.length>0){
        new google.maps.visualization.HeatmapLayer({
            data: heatMapData, map: map , gradient:gradient
        });
    }
    else{
        new google.maps.visualization.HeatmapLayer({
            data: heatMapData, map: map
        });
    }




}

