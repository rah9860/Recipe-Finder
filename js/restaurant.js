const APIKEY = "c2f0f72dbd915f77b029f4cbe3d6de2f";

class Restaurant {
    constructor(name, location, cuisine, url) {
        this.name = name;
        this.location = location;
        this.cuisine = cuisine;
        this.url = url;
    }
}

let restaurantApp = new Vue({
    el: '#restaurantApp',
    data: {
        restaurants: [],
        searchTerm: '',
        searchBy: '',
        searchBySequel: '',
        keywordOrCity: '',
        maxRestaurants: 1,
        status: 'Ready to search!',
        showModal: false,
    },
    methods: {
        restSearchButtonClicked: function(){
            this.restaurants = [];

            console.log("searchButtonClicked() called from app");
            //the url

            if(this.keywordOrCity == "keyword" && this.searchBySequel != "cityID")
            {
                this.searchBy = "keyword";
            }
            else if(this.keywordOrCity == "city" && this.searchBySequel != "cityID")
            {
                this.searchBy = "city";
            }

            const ZOMATO_URL = "https://developers.zomato.com/api/v2.1/";


            const CITY_SEARCH = "cities?q=";
            const SEARCH_BY_CITY = "search?entity_type=city&entity_id=";
            const SEARCH_BY_KEYWORD = "search?q=";

            let url = ZOMATO_URL;

            console.log(this.searchBy); //testing
            if(this.searchBy == "keyword")
            {
                url += SEARCH_BY_KEYWORD;
            }
            else if(this.searchBy == "city")
            {
                url += CITY_SEARCH;
            }

            let term = this.searchTerm;
            displayTermRest = term;

            term = term.trim();

            term = encodeURIComponent(term);

            if(term.length < 1) return;


            if(this.searchBySequel == "cityID")
            {
                url += SEARCH_BY_CITY;
                term = this.cityID;
            }

            url += term;

            this.status = "Searching for '" + displayTermRest + "'";
            //loading text

            console.log(url);

            this.getRestaurantData(url);
        },

        getRestaurantData: function(url) {
            let xhr = new XMLHttpRequest();
            //getting data

            xhr.onload = this.restaurantDataLoaded;

            xhr.onerror = this.dataError;

            xhr.open("GET",url);
            xhr.setRequestHeader("user-key", APIKEY);
            console.log(APIKEY);
            xhr.send();
        },
        restaurantDataLoaded: function(e) {
            let xhr = e.target;
            console.log(xhr.responseText);

            let obj = JSON.parse(xhr.responseText);

            if(this.searchBy == "city")
            {
                let results = obj.location_suggestions;

                if(!results || results.length == 0) //if no results, return message
                {
                    this.status = "No results found for '" + displayTermRest + "'";
                    this.showModal = true;
                    return;
                }
                

                let result = results[0];
                this.cityID = result.id;
                this.searchBy = "";
                this.searchBySequel = "cityID";
                this.restSearchButtonClicked(); 
                return;
            }

            this.searchBySequel = "";

            if(!obj.restaurants || obj.restaurants.length == 0) //if no results, return message
            {
                this.status = "No results found for '" + displayTermRest + "'";
                this.showModal = true;
                return;
            }

            let results = obj.restaurants; //assign the meal data to results

            let numResults = Math.min(results.length, this.maxRestaurants);

            this.status = "Here are " + numResults + " results for '" + displayTermRest + "'";

            for (let i = 0;i < numResults; i++) //start displaying those results
            {
                let result = results[i].restaurant;

                let restaurantObj = new Restaurant(result.name, result.location.address, result.cuisines, result.url);
                
                this.restaurants.push(restaurantObj);
            }
        },
        dataError: function(e){console.log("An error occurred");}


    },
})