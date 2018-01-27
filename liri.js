/* =========================
	 NPM
   =========================*/
require("dotenv").config();
let Twitter = require('twitter');
let Spotify = require('node-spotify-api');
let request = require('request');
const fs = require('fs');

/* =========================
	 Capturing User Entry
   =========================*/


if (process.argv.length === 2) {throw "You'll need at least one argument."};
// ---> TO-DO: IF NO ARGUMENT, THEN INTERACTIVE <---

var userInput = process.argv.slice(2);	//the whole userinput
const inputAPI = userInput.shift();

/* =========================
	 Twitter
   =========================*/

let twitter = {
	client: '',

	initialize: function() {
		this.client = new Twitter({
		  consumer_key: process.env.TWITTER_CONSUMER_KEY,
		  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
		  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
		});
	}, //initialize function
	getTweets: function() {
		this.client.get('https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=flyinteapot&count=20', function(error, tweets, response) {
		  if(error) throw error;
		  tweets.reverse();
		  tweets.forEach((tweet) => {
		  	console.log(tweet.text+'\n');
		  });
		});
	}, //getTweets function
} //twitter object

/* =========================
	 SPOTIFY
   =========================*/

let spotify = {
	client: '',

	initialize: function() {
		this.client = new Spotify({
		  id: process.env.SPOTIFY_ID,
		  secret: process.env.SPOTIFY_SECRET
		});
	}, //initialize: function()

	search: function() {
		let songQuery
		if (userInput.length) {
			if (typeof songQuery === 'object') {
				songQuery = userInput.join(' ');
			} else {
				songQuery = userInput;
			}
			
		} else {
			songQuery = 'The Sign';
		}

		this.client.search({ type: 'track', query: songQuery }, function(err, data) {
		  if (err) {
		    return console.log('Error occurred: ' + err);
		  }
		
		if (userInput.length) {
			let searchResult = data.tracks.items[0];
			console.log('Artist(s):'+searchResult.artists[0].name);
			console.log('Song Name:'+searchResult.name);
			console.log('Preview Link:'+searchResult.href);
			console.log('Album Name:'+searchResult.album.name);
		} else {
			let searchResult = data.tracks.items.filter(item => item.artists[0].name === 'Ace of Base')[0];
			console.log('Artist(s):'+searchResult.artists[0].name);
			console.log('Song Name:'+searchResult.name);
			console.log('Preview Link:'+searchResult.href);
			console.log('Album Name:'+searchResult.album.name);
		}
		});
	}, //search: function()
}

/* =========================
	 MOVIE OMDB
   =========================*/

let omdb = {
	search: function() {

		if (userInput.length) {
			var movieTitle = userInput.join(' ');
		} else {
			var movieTitle = 'Mr. Nobody';
		}
		const queryURL = 'http://www.omdbapi.com/?apikey=dd1c9cbb&t='+movieTitle;
		request(queryURL, function (error, response, body) {

		  if (response.statusCode !== 200) {
		  	throw 'Dude, that was a bad search.'
		  }
		  const movie = JSON.parse(body);
		  console.log('Title:', movie.Title);
		  console.log('\nYear:', movie.Year);

		  //IMDB
		  console.log('\nIMDB Rating:');
		  console.log(movie.Ratings.filter((rating) => rating.Source === "Internet Movie Database")[0].Value)

		  

		  //Rooten Tomatoes
		  console.log('\nRotten Tomatoes:');
		  console.log(movie.Ratings.filter((rating) => rating.Source === "Rotten Tomatoes")[0].Value);

		  console.log('\nCountry:', movie.Country);
		  console.log('\nLanguage:', movie.Language);
		  console.log('\nPlot:', movie.Plot);
		  console.log('\nActors:', movie.Actors);
		});
	}
}

let textCommand = {
	run: function() {
		fs.readFile('random.txt','utf8',function(err,data) {
			const textInputAPI = data.slice(0,data.indexOf(' '));
			userInput = data.slice(data.indexOf(' ')).replace(/['"]+/g, '');
			console.log(userInput.trim())
			liri.run(textInputAPI);
		})
	}
}


/* =========================
	 Driver
   =========================*/


let liri = {
	run: function(inputAPI) {
		switch (inputAPI) {
			case 'my-tweets':
				twitter.initialize();
				twitter.getTweets();
				break;
			case 'spotify-this-song':
				spotify.initialize();
				spotify.search();
				break;
			case 'movie-this':
				omdb.search();
				break;
			case 'do-what-it-says':
				textCommand.run();
				break;
			default:
				throw 'Unexpected user entry';
		} //switch
	}
}

liri.run(inputAPI);