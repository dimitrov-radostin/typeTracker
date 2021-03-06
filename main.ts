// TO DO 
// - fix the structure so not everything is in the Promise -- kind of
// - more sources: code, lyrics, custom (from user) ...
// - ? use a button to start
// after timeout show whole typed text with errors
// start after typing strat
// may be show some count down and then start
// optimise to remeber parsed source when loading them so that on multiple chnages to 
// add quit option
// group sources by category poems; book extracts; lyrics ...


// https://developers.google.com/youtube/v3/docs/search/list
// https://developers.google.com/youtube/player_parameters


const IGNORE_AS_ERRORS = ['Shift', 'Ctrl']
const WORD_SEPARETORS_REGEXP = /\s/g
const FANSY_SPACE_SYMBOL = String.fromCharCode(9251)
const FANSY_NEW_LINE_SYMBOL = String.fromCharCode(9166)
const ESCAPE_ON_SCREEN = [
    { "ESCAPE_REGEXP": /\n/g, "SHOW": FANSY_NEW_LINE_SYMBOL },
    { "ESCAPE_REGEXP": / /g, "SHOW": FANSY_SPACE_SYMBOL }
]
const SOURCE_LOCATION = 'https://dimitrov-radostin.github.io/typeTracker/'
// const SOURCE_LOCATION = 'http://127.0.0.1:5500/'
let loading_data = false

let typingData = {
    'string': '',
    'array_words': [],
    'words_starting_positions': [],

    update: data => {
        typingData.string = data
        typingData.array_words = data.split(WORD_SEPARETORS_REGEXP)
        typingData.words_starting_positions = typingData.array_words
            .map(word => word.length + 1)
            .reduce(
                (arr, currentWordLength) =>
                    [...arr, arr[arr.length - 1] + currentWordLength]
                , [0]
            )

        ESCAPE_ON_SCREEN.forEach(v => {
            data = data.replace(v.ESCAPE_REGEXP, v.SHOW)
        })

        typingData.array_words = typingData.array_words
            .map(
                (w, i) =>
                    i !== typingData.array_words.length ?
                        w + data[typingData.words_starting_positions[i + 1] - 1] :
                        w + FANSY_NEW_LINE_SYMBOL
            )
    },
    
    words_before_position: (position: number) => {
        return typingData.words_starting_positions.findIndex(v => v > position) - 1
    }
}

let position = 0
let errors = []

const writingField = document.getElementById('writingField')
const resultsDiv = document.getElementById('results')
const timer = document.getElementById('timer')
// Load the default typing data on loading the page
loadAndDisplayText(document.querySelector('input[name="text_source"]:checked').value)

// Reload typing data on user selecting a new source
document.getElementById("text_source")
    .addEventListener('click', event => {
        if (event.target && event.target.matches("input[type='radio']")) {
            loadAndDisplayText(event.target.value)
        }
    });

document.getElementById("start_button")
    .addEventListener('click', startTracking)


function startTracking() {
    if (loading_data) {
        alert("Tracking started before data is loaded.")
    }
    let TYPING_TIME = 1000 * document.getElementById("typing_time").value

    position = 0

    errors = []
    typedWord = ''

    displayText(position)
    
    document.addEventListener('keydown', keyDownHandler)
    document.getElementById('start_button').blur()
    document.getElementById("darkLayer").style.display = ""
    timer.textContent = (TYPING_TIME / 1000).toString()
    document.getElementById("timerWrapper").classList.toggle("hiddenTimer")

    writingField.children[0].textContent = ''
    writingField.children[1].textContent = ''
    
    for(let child of resultsDiv.children){
        child.textContent = ''
    }
    let updateTimerInterval = startTimer(TYPING_TIME)
    setTimeout(() => stopTracking(updateTimerInterval, keyDownHandler, TYPING_TIME), TYPING_TIME + 1)
}

function stopTracking(updateTimerInterval, keyDownHandler, TYPING_TIME) {
    document.removeEventListener('keydown', keyDownHandler)
    document.getElementById("darkLayer").style.display = "none"
    document.getElementById("timerWrapper").classList.toggle("hiddenTimer")

    // also display the whole text typed with errors made
    let word_count = typingData.words_before_position(position)
    resultsDiv.children[0].textContent = `characters: ${position}`
    resultsDiv.children[1].textContent = `words: ${word_count}`
    resultsDiv.children[2].textContent = `speed: ${word_count / (TYPING_TIME / 60000)} words/minute`
    resultsDiv.children[3].textContent = `errors: ${errors.length}`
    resultsDiv.children[4].textContent = `error rate: ${position? (100 * errors.length / position) : 0}%`
    clearInterval(updateTimerInterval)
}

function startTimer(TYPING_TIME) {
    const startTime = Date.now()
    let updateTimerInterval = setInterval(() => updateTimer(startTime, TYPING_TIME), 1000)
    return updateTimerInterval
}

function updateTimer(startTime, TYPING_TIME) {
    let timePassed = (Date.now() - startTime)
    timer.textContent = Math.round((TYPING_TIME - timePassed) / 1000).toString()
}

function displayText(position: number) {
    let current_word_count = typingData.words_before_position(position)
    document.getElementById("currentWord").textContent = typingData.array_words[current_word_count]
    document.getElementById("word2").textContent = typingData.array_words[current_word_count + 1]
    document.getElementById("word3").textContent = typingData.array_words[current_word_count + 2]
    document.getElementById("word4").textContent = typingData.array_words[current_word_count + 3]
    document.getElementById("word5").textContent = typingData.array_words[current_word_count + 4]
}

function loadAndDisplayText(source) {
    loading_data = true
    let sourcePath = SOURCE_LOCATION + source
    fetch(sourcePath)
        .then(r => r.json())
        .then(parseData)
        .then(data => {
            typingData.update(data)
            console.log(data)
            displayText(0)
            loading_data = false
        })
        .catch(e => { alert("omaza se \n" + e) })
}

function parseData(rawData) {
    let typingData: string

    if (rawData.type === 'words_in_array') {
        // shuffle the words
        typingData = rawData
            .data
            .map((a) => ({ sort: Math.random(), value: a }))
            .sort((a, b) => a.sort - b.sort)
            .map((a) => a.value)
            .join('')       // all words end with space in the json, so an empty str is usesd here
    } else if (rawData.type === 'string') {
        typingData = rawData.data
    }
    return typingData
}

let typedWord = ''
function keyDownHandler(event) {
    // REMOVE EVENT LISTNER FOR START KEYWORD
    let letter = typingData.string[position]

    if (event.key === letter || (event.key === 'Enter' && letter.charCodeAt(0) === 10)) {
        if (typingData.words_starting_positions.includes(position + 1)) {
            typedWord = ''
            displayText(position + 1)
        }
        typedWord += letter
        writingField.children[0].textContent = typedWord
        writingField.children[1].textContent = ''
        position++

    } else if (! IGNORE_AS_ERRORS.includes(event.key)) {
        console.log('error', event.key, letter, letter.charCodeAt(0))

        if (writingField.children[1].textContent.length === 0) {
            errors.push(position)
        }
        writingField.children[1].textContent = event.key
    }
}

