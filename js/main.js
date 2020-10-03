//local storage things
//currently broken
const prefix = "rah9860-";
const nameKey = prefix + "name";
const storedName = localStorage.getItem(nameKey);

class Recipe {
    
    constructor(id, name, category, locale, instructions, mealThumb)
    {
        this.idMeal = id;
        this.name = name;
        this.category = category;
        this.locale = locale;
        this.instruc = instructions;
        this.mealThumb = mealThumb;
    }
}

// Your web app's Firebase configuration
let firebaseConfig = {
    apiKey: "AIzaSyDsGFAb-8F5ytDmmOlPXCPoSBjGo_Pynb4",
    authDomain: "project2-d31fa.firebaseapp.com",
    databaseURL: "https://project2-d31fa.firebaseio.com",
    projectId: "project2-d31fa",
    storageBucket: "project2-d31fa.appspot.com",
    messagingSenderId: "798287532486",
    appId: "1:798287532486:web:e9470ae13374ee3b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//add custom MVVM component for if no results
Vue.component('modal', {
    template: `
<div class="modal-mask">
<div class="modal-wrapper">
<div class="modal-container">
<div class="modal-note">
<slot name="header"> No Results Found </slot>
</div>
<div class="modal-footer">
<button class="modal-default-button" @click="$emit('close')"> OK</button>
</div>
</div>
</div>
</div>`
})

let recipeApp = new Vue({ //the vue app
    el: '#recipeApp',
    data() {
        return {
            recipeSearch: {
                searchTerm: '' //it will be getting the search term
            }
        }
    },
    data: { //the other necessary data that will be used to change html
        recipes: [],
        recipesRand: [],
        searchTerm: '',
        maxRecipes: 1,
        searchOrRand: '',
        status: 'Ready to search!',
        statusRand: 'Ready to roll!',
        showModal: false,
    },
    mounted () {
        if (localStorage[nameKey])
            {
                this.searchTerm = localStorage[nameKey];
            }
    },
    methods: {
        searchButtonClicked: function() { //the search button getting clicked
            //console.log("search clicked");
            this.searchOrRand = "search"; //sets the query to Search

            //the url
            const THEMEALDB_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
            let url = THEMEALDB_URL;
            let term = this.searchTerm; //grabs the searchterm
            displayTerm = term;
            firebase.database().ref('Searches').push({ //stores the searchterm for use in admin page
                searchTerm: term,
                timeStamp: Date.now() //also the timestamp
            });

            term = term.trim(); //starts getting the term ready
            term = encodeURIComponent(term);
            if(term.length < 1) return;
            url += term; //applies term to url

            //loading text
            //console.log(url);
            this.getRecipeData(url); //sends it to the xhr
        },
        sendToWebStorage()
        {
            //const storedName = localStorage.getItem(nameKey);
            if(this.searchTerm != "")
            { //broken local storage
                localStorage.setItem(nameKey, this.searchTerm);
            }
        },

        searchRandButtonClicked: function() { //if the random button is clicked
            this.searchOrRand = "rand"; //sets the query to random
            const THEMEALDB_URL_RAND = "https://www.themealdb.com/api/json/v1/1/random.php"; //the random url
            let url = THEMEALDB_URL_RAND;
            this.statusRand = "Searching for A Recipe...";
            this.getRecipeData(url);
        },

        getRecipeData: function(url) { //the xhr stuff
            let xhr = new XMLHttpRequest();
            //getting data

            xhr.onload = this.recipeDataLoaded;
            xhr.onerror = this.dataError;
            xhr.open("GET",url);
            xhr.send();
        },

        recipeDataLoaded: function(e) { //processing data time
            if (this.searchOrRand == "search") //sets the array depending on button
                this.recipes = [];
            else
                this.recipesRand = [];


            let xhr = e.target;
            //console.log(xhr.responseText);

            let obj = JSON.parse(xhr.responseText);

            if(!obj.meals || obj.meals.length == 0) //if no results, return message
            {
                this.status = "No results found for " + displayTerm;
                this.showModal = true;
                return;
            }

            let results = obj.meals; //assign the meal data to results

            //let numResults = document.querySelector("#limit").value;

            //setting status based on button and section
            if (this.searchOrRand == "search") 
                this.status = "Here are " + Math.min(this.maxRecipes,results.length) + " results for '" + displayTerm + "'";
            else
                this.statusRand = "Here is a random recipe!";

            //evaluates based on search or rand using Ternary Operator
            let numResults = (this.searchOrRand == "search") ? Math.min(this.maxRecipes,results.length) : 1;

            for (let i = 0;i < numResults; i++) //start displaying those results
            {
                let result = results[i];

                let mealThumb = result.strMealThumb;
                if (!mealThumb) mealThumb = "no-image-found.png";
                
                let recipeObj = new Recipe(result.idMeal, result.strMeal, result.strCategory, result.strArea, result.strInstructions, mealThumb);

                if (this.searchOrRand == "search") //where to push
                {
                    this.recipes.push(recipeObj);
                }
                else
                {
                    this.recipesRand.push(recipeObj);
                }

            } 


        },

        dataError: function(e) { //error time
            console.log("An error occurred");
        }
    }
});