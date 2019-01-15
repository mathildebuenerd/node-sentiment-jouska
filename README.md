# AFINN sentiment analysis for [Jouska](https://github.com/mathildebuenerd/jouska-v2)

Based on [node-sentiment](https://github.com/nicolasbonnici/node-sentiment) by Nicolas Bonnici, which is itself a fork of [the original sentiment project](https://github.com/thisandagain/sentiment).


## Installation

Install directly from this repo.

`npm install --save https://github.com/mathildebuenerd/node-sentiment-jouska/tarball/master`

## Usage

### Parameters
Use the sentiment function, which can have up to three parameters: 

`sentiment(text, language = 'en', originalText = text)`

- If no value is set for `language`, english is used instead.
- `originalText` is used to perform a more accurate emoji analysis **if you use a translation for the `text` variable.** If you don't, then it's equal to `text`.

### Why `text` and `originalText` ?

Because text analysis is usually far more developed for the English language. So you might want to translate your text before performing a sentiment analysis. In that case, emoji can be lost. 

For example, "How are you? :)" can be translated to "Comment vas-tu ?: )" in French, and so loose the ":)" emoji. That's why you should still provide the original text for the emoji analysis.


### Examples
`sentiment('I am feeling good :)')`

`sentiment('Je vais bien :)', 'fr')`

`sentiment(enTranslation, 'en', 'Je vais bien :)') // enTranslation is probably equal to "I am feeling good"` 


