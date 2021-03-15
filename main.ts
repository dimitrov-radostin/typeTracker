// TO DO 
// - fix the structure so not everything is in the Promise
// - timer simetimes stops at one  ---- test if still present
// - user to change time
// - differnt sources: paraghraphs, code, lyrics, custom (from user) ...
// - ? use a button to start

let charactersTyped = 0
let errors = 0
let wordsTyped = 0
let word = ''
let tracking = false
let typedWord = ''
let results = document.getElementById('results')
let writingField = document.getElementById('writingField')
const TYPING_TIME = 60000 //in miliseconds 
document.getElementById('timer').textContent = Math.floor(TYPING_TIME / 1000).toString()

// textSource = 'https://dimitrov-radostin.github.io/typeTracker/most_popular_1000.json'
let textSource = 'https://dimitrov-radostin.github.io/typeTracker/the_stranger.json'

function parseData(rawData){
    let typingData: string

    if(rawData.type === 'words_in_array'){
        // get random position
        typingData = rawData.data
            .map((a) => ({sort: Math.random(), value: a}))
            .sort((a, b) => a.sort - b.sort)
            .map((a) => a.value)
            .join('')
            typingData = 'start ' + typingData
    } else if(rawData.type === 'string'){
        typingData = 'start ' + rawData.data
    }
    return typingData
}

function startTracking(keyDownHandler) {
    tracking = true
    let updateTimerInterval = startTimer()
    setTimeout(() => stopTracking(updateTimerInterval, keyDownHandler), TYPING_TIME - 1)
}

function stopTracking(updateTimerInterval, keyDownHandler) {
    tracking = false
    document.removeEventListener('keydown', keyDownHandler)
    results.children[0].textContent = `${wordsTyped} words`
    results.children[1].textContent = `${errors} errors`
    results.children[2].textContent = `${charactersTyped} characters`
    // add speed ? in [words/minute] or chars
    clearInterval(updateTimerInterval)
}

function startTimer() {
    const startTime = Date.now()
    let updateTimerInterval = setInterval(() => updateTimer(startTime), 1000)
    return updateTimerInterval
}

function updateTimer (startTime){
    const timer = document.getElementById('timer')
    let timePassed = (Date.now() - startTime)
    timer.textContent = Math.round((TYPING_TIME - timePassed) / 1000).toString()
}

// load data
fetch(textSource)
    .then(r => r.json())
    .then(parseData)
    .then(typingData => {
        function keyDownHandler(event) {
            let letter = typingData[charactersTyped]

            if(event.key === letter || (event.key === 'Enter' && letter.charCodeAt(0) === 10)){
                if (!tracking){      // could use another staring point (a button?)
                    startTracking(keyDownHandler)
                }
                if(letter === ' ' || letter.charCodeAt(0) === 10 || charactersTyped === 0){
                    let length = typingData.length
                    let newWordStartsAt = 1 + (charactersTyped % length) + typingData.substring(charactersTyped % length + 1).search(/\s/)

                    word = charactersTyped === 0 
                        ? typingData.substring(charactersTyped, newWordStartsAt)
                        : typingData.substring(charactersTyped + 1, newWordStartsAt)
                    
                    wordsTyped += 1
                    typedWord = '';
                    document.getElementById('givenWord').textContent = word.replace(/\n/g, String.fromCharCode(0x000023CE))
                    document.getElementById('nextWord').textContent = typingData
                        .substring(newWordStartsAt, newWordStartsAt + 30 - word.length)
                        .replace(/\n/g, String.fromCharCode(0x000023CE))
                }

                typedWord += letter
                writingField.children[0].textContent = typedWord			
                writingField.children[1].textContent = ''
                charactersTyped++
            }else {
                console.log('error',event.key, letter, letter.charCodeAt(0))
                if (writingField.children[1].textContent.length === 0){
                    errors++ 
                }
                writingField.children[1].textContent = event.key
            }
        }
            document.addEventListener('keydown', keyDownHandler)
    })

