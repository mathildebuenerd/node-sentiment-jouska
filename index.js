/*
 * Multilanguage AFINN-based sentiment analysis for Node.js
 */
var oDictionary = require('./lib/AFINN.js');
var oLangDetect = new (require('languagedetect'));

var frenchExtraWords = {
    "ahah": 1,
    "aucun": -1,
    "aucune": -1,
    "aucunes": -1,
    "ballot": -1,
    "bien": 2,
    "bise": 2,
    "bisou": 2,
    "bisous": 2,
    "bonne": 3,
    "bonus": 1,
    "cher": 0,
    "chié": -4,
    "chiée": -4,
    "cimer": 2,
    "clair": 0,
    "comme": 0,
    "cool": 1,
    "coucou": 1,
    "croire": 0,
    "dire": 0,
    "dommage": -3,
    "douces": 2,
    "douceur": 2,
    "douceurs": 2,
    "doux": 2,
    "dsl": -2,
    "énervée": -2,
    "énervées": -2,
    "énervés": -2,
    "espèrent": 2,
    "espères": 2,
    "euh":  -1,
    "excellente": 3,
    "haha": 2,
    "hahaha": 2,
    "hahahaha": 2,
    "hâte": 2,
    "hâtes": 2,
    "hésite": -2,
    "hésites": -2,
    "hésitent": -2,
    "heu": -1,
    "heuu": -1,
    "fin": 0,
    "fun": 2,
    "gentil": 2,
    "gentille": 2,
    "gentilles": 2,
    "gentils": 2,
    "impeccable": 3,
    "j'espère": 2,
    "j'hésite": -2,
    "juste": 0,
    "nickel": 2,
    "mignons": 2,
    "mignone": 2,
    "mignones": 2,
    "mignonne": 2,
    "mignonnes": 2,
    "morte": -3,
    "nenuit": 2,
    "nul": -3,
    "nulle": -3,
    "oups": -1,
    "parfait": 3,
    "parfaite": 3,
    "pénible": -4,
    "plaire": 3,
    "plait": 3,
    "plaît": 3,
    "ptin": -4,
    "rêve": 1,
    "sens": 0,
    "super": 3,
    "top": 1,
    "veut": 1,
    "veux": 1,
    "vouloir": 1
};

oDictionary['fr'] = Object.assign(oDictionary['fr'], frenchExtraWords); // on ajoute le lexique personnalisé au lexique
console.log(`oDictionnary:`);
console.log(oDictionary);


/**
 * Split a sentence into words
 *
 * @param sInput
 * @returns {Array}
 */
function tokenize(sInput) {

    if (sInput.length === 0) {
        return [];
    }

    return sInput
        .toLowerCase()
        .replace(/\r?\n|\r/g, ' ') // line breaks replaced by space https://stackoverflow.com/a/10805292
        .replace(/[.,\/#!$%\^&\*;:{}=_`\"~()]/g, '')
        .replace(/-/g, ' ')
        .replace(/\s{2,}/g, ' ') // remove extra spaces https://stackoverflow.com/a/4328722
        .split(' ');
};

// Performs sentiment analysis on the provided input 'phrase'
module.exports = function (sPhrase, sLangCode, originalPhrase, mCallback) {

    if (typeof sPhrase === 'undefined') {
        sPhrase = '';
    }


    // Storage objects
    var aTokens = tokenize(sPhrase),
        iGlobalScore = 0,
        aWords = [],
        aPositive = [],
        aNegative = [],
        bNegation = false;


    // Detect language if needed (beta must be performed on each word for more efficiency)
    if (sLangCode == null) {
        var aDetectedLang = oLangDetect.detect(aTokens.join(' '), 1);
        if (aDetectedLang[0]) {
            sLangCode = aDetectedLang[0][0].substring(0, 2);
        }
    }

    // Iterate over tokens
    var len = aTokens.length;
    while (len--) {
        var sToken = String(aTokens[len]), iCurrentScore = 0;

        // Negation flag
        if (oDictionary["negations"][sLangCode] && oDictionary["negations"][sLangCode][sToken]) {
            bNegation = true;
        }

        if (! oDictionary[sLangCode] || ! oDictionary[sLangCode][sToken]) {
            if (! oDictionary['emoji'][sToken]) {
                continue;
            }
            // It's an emoji
            // iCurrentScore = Number(oDictionary['emoji'][sToken]);
        } else {
            // It's a word
            iCurrentScore = Number(oDictionary[sLangCode][sToken]);
        }

        aWords.push(String(sToken));
        if (iCurrentScore > 0) {
            aPositive.push(String(sToken));
        } else if (iCurrentScore < 0) {
            aNegative.push(String(sToken));
        }
        iGlobalScore += iCurrentScore;
    }

    // Handle negation detection flag
    // Plutot que de multiplier par -1 s'il y a une négation, on enlève -3, ça évite qu'il y ai des scores trop bas dans des propositions où il n'y a qu'une négation et plusieurs mots positifs
    iGlobalScore = iGlobalScore + (bNegation === true ? -3 : 0);

    emojis(originalPhrase);
    textEmojis(originalPhrase);

    function emojis(sentence) {

        // for each emoji
        for (const emoji in oDictionary['emoji']) {
            let hasEmoji = sentence.indexOf(emoji);

            // while the emoji is found in the sentence
            while (hasEmoji !== -1) {

                let emojiScore = oDictionary['emoji'][emoji];
                iGlobalScore += Number(emojiScore); // add the score to the global score

                // add the emoji into the positive/negative arrays
                if (emojiScore > 0) {
                    aPositive.push(String(emoji));
                } else {
                    aNegative.push(String(emoji));
                }

                // we continue the while loop, from the index after the first found emoji
                hasEmoji = sentence.indexOf(emoji, hasEmoji + 1 );
            }
        }
    }
    function textEmojis(sentence) {

        let inlineSmileys = new RegExp(/(<[\/\\]?3|[()/|*$][-^]?[:;=]|x[d()]|\^[a-z._-]{0,1}\^['"]{0,1}|[:;=B8][\-^]?[3DOPp@$*\\)(\/|])(?=\s|[!.?]|$)/, 'gim'); // detect smileys like :) ;) :p :/ =/ :-) :( :D xD :-) ^^

        const smileyValues = {
            ":)": 3,
            ";)": 3,
            ":(": -3,
            "x)": 3,
            ":p": 2,
            ":o": -1,
            ":3": -1,
            ":|": -2,
            ":/": -2,
            ":\\": -2,
            ":$": -1,
            ":*": 3,
            ":@": -1,
            ":-)": 3,
            ";-)": 3,
            ":-(": -3,
            ":-p": 2,
            ":-o": -1,
            ":-3": -2,
            ":-|": -2,
            ":-/": -2,
            ":-\\": -2,
            ":-$": -1,
            ":-*": 3,
            ":-@": -1,
            "(:": 3,
            "):": -3,
            "(x": 3,
            "$:": -2,
            "*:": 3,
            "/:": -2,
            "\\:": -2,
            "(-:": 3,
            ")-:": -3,
            "$-:": -2,
            "*-:": 3,
            "/-:": -2,
            "\\-:": -2,
            "=)": 2,
            "=(": -2,
            "(=": 2,
            ")=": -2,
            "=p": 2,
            "<3": 3,
            "</3": -3,
            "<\\3": -3,
            "^^": 2,
            "^.^": 2,
            "^o^": 2,
            "^-^": 2,
            "^_^": 2,
            '^^"': -2,
            "^^'": -2,
            "xd": 3
        };

        let smileyArray;
        while ((smileyArray = inlineSmileys.exec(sentence.toLocaleLowerCase())) !== null) { // convert to lowercase for smileys like :s :S

            const smileyScore = smileyValues[smileyArray[0]]; // get the smiley score
            iGlobalScore += Number(smileyScore); // add the score to the global score

            // add the smiley into the positive/negative arrays
            if (smileyScore > 0) {
                aPositive.push(String(smileyArray[0]));
            } else {
                aNegative.push(String(smileyArray[0]));
            }
        }
    }

    // Handle optional async interface
    var oResult = {
        score: iGlobalScore,
        comparative: iGlobalScore / aTokens.length,
        vote: 'neutral',
        tokens: aTokens,
        words: aWords,
        positive: aPositive,
        negative: aNegative,
        negation: bNegation,
        language: sLangCode
    };

    // Classify text as positive, negative or neutral.
    if (oResult.score > 0) {
        oResult.vote = 'positive';
    } else if (oResult.score < 0) {
        oResult.vote = 'negative';
    }

    if (mCallback == null) {
        return oResult;
    }

    process.nextTick(function () {
        mCallback(null, oResult);
    });
};
