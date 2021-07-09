# How to use the repository to setup a mini-working search app

## Step 1: Setup Elasticsearch backend

```zsh
cd docker-compose
docker-compose up build -d
cd ..
```

The above step setups the elasticsearch backend.

## Step 2: Load the data from postman

Load the Elasticsearch.postman_collection.json into postman.
Fire the post request with bulk data and load the data into elasticsearch.
Use the post request for search with term "thor" and see the results.

## Step 3: Run the sample-site

Use the live server plugin and search for the terms to elasticsearch.
