// Update this variable to point to your domain.
// var apigatewayendpoint = '';
const index = 'resources';
const esEndpoint = `http://localhost:9200/${index}/_search`;
const loadingdiv = $('#loading');
const noresults = $('#noresults');
const resultdiv = $('#results');
const searchbox = $('input#search');
const fields = [
  'fields.title^4',
  'fields.description^2',
  'fields.categories',
  'fields.image_url',
  'fields.url',
  'fields.type',
  'fields.tags^3',
];

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
  console.log(query);
  // Only run a query if the string contains at least three characters
  if (query.length > 2) {
    const data = {
      query: {
        multi_match: {
          query,
          fields,
          type: 'most_fields',
          operator: 'and',
          minimum_should_match: 3,
          tie_breaker: 0.0,
          analyzer: 'standard',
          boost: 1,
          fuzziness: 'AUTO',
          fuzzy_transpositions: true,
          lenient: true,
          prefix_length: 0,
          max_expansions: 50,
          auto_generate_synonyms_phrase_query: true,
          cutoff_frequency: 0.01,
          zero_terms_query: 'none',
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
        const type = results[item]._source.fields.type;
        let imageUrl;
        let playbackId;
        let thumbnailTime;
        if (type === 'video') {
          playbackId = results[item]._source.fields.playback_id;
          thumbnailTime = results[item]._source.fields.thumbnail_time;
          imageUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${thumbnailTime}`;
        } else {
          imageUrl = results[item]._source.fields.image_url;
        }
        let url;
        if (type === 'video') {
          url = 'https://stream.mux.com/' + playbackId + '.m3u8';
        } else {
          url = results[item]._source.fields.url;
        }
        let title = results[item]._source.fields.title;

        let description = results[item]._source.fields.description;
        // Construct the full HTML string that we want to append to the div
        if (type === 'video') {
          resultdiv.append(
            '<div class="result">' +
              '<video id="' +
              playbackId +
              '" poster="' +
              imageUrl +
              '"controls></video><div><h2>' +
              title +
              '</h2><p>' +
              description +
              '</p></div></div>',
          );

          (function () {
            // HLS.js-specific setup code
            if (Hls.isSupported()) {
              var video = document.getElementById(playbackId);
              var hls = new Hls();
              hls.loadSource(url);
              hls.attachMedia(video);
            }
          })();
        } else {
          resultdiv.append(
            '<div class="result">' +
              '<a href="' +
              url +
              '"><img src="' +
              imageUrl +
              '" onerror="imageError(this)"></a>' +
              '<div><h2><a href="' +
              url +
              '">' +
              title +
              '</a></h2><p>' +
              description +
              '</p></div></div>',
          );
        }
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
