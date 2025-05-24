"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNaturalLanguageQuery = processNaturalLanguageQuery;
var natural = require("natural");
function processNaturalLanguageQuery(query) {
    // Tokenize the query
    var tokenizer = new natural.WordTokenizer();
    var tokens = tokenizer.tokenize(query);
    // Stem the tokens
    var stemmer = natural.PorterStemmer;
    var stemmedTokens = tokens.map(function (token) { return stemmer.stem(token); });
    // Join the stemmed tokens back into a string
    var processedQuery = stemmedTokens.join(' ');
    return processedQuery;
}
