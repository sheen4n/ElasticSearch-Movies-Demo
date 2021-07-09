// Update this variable to point to your domain.
// var apigatewayendpoint = '';
const index = 'movies';
const esEndpoint = `http://localhost:9200/${index}/_search`;
const loadingdiv = $('#loading');
const noresults = $('#noresults');
const resultdiv = $('#results');
const searchbox = $('input#search');
let timer = 0;

// Executes the search function 250 milliseconds after user stops typing
searchbox.keyup(function () {
  clearTimeout(timer);
  timer = setTimeout(search, 250);
});

async function search() {
  // Clear results before searching
  noresults.hide();
  resultdiv.empty();
  loadingdiv.show();
  // Get the query from the user
  let query = searchbox.val();
  // Only run a query if the string contains at least three characters
  if (query.length > 2) {
    // Make the HTTP request with the query as a parameter and wait for the JSON results
    const data = {
      size: 25,
      query: {
        multi_match: {
          query,
          fields: ['fields.title^4', 'fields.plot^2', 'fields.actors', 'fields.directors'],
        },
      },
    };

    // let response = await $.get(esEndpoint, requestData, 'json');
    const response = await fetch(esEndpoint, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });

    const responseData = await response.json();

    // Get the part of the JSON response that we care about
    let results = responseData['hits']['hits'];
    if (results.length > 0) {
      loadingdiv.hide();
      // Iterate through the results and write them to HTML
      resultdiv.append('<p>Found ' + results.length + ' results.</p>');
      for (let item in results) {
        let url = 'https://www.imdb.com/title/' + results[item]._id;
        let image = results[item]._source.fields.image_url;
        let title = results[item]._source.fields.title;
        let plot = results[item]._source.fields.plot;
        let year = results[item]._source.fields.year;
        // Construct the full HTML string that we want to append to the div
        resultdiv.append(
          '<div class="result">' +
            '<a href="' +
            url +
            '"><img src="' +
            image +
            '" onerror="imageError(this)"></a>' +
            '<div><h2><a href="' +
            url +
            '">' +
            title +
            '</a></h2><p>' +
            year +
            ' &mdash; ' +
            plot +
            '</p></div></div>',
        );
      }
    } else {
      noresults.show();
    }
  }
  loadingdiv.hide();
}

// Tiny function to catch images that fail to load and replace them
function imageError(image) {
  image.src = 'images/no-image.png';
}
