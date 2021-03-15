// TO DO 
// -fix the structure so not everything is in the Promise
// - timer simetimes stops at one  ---- test if still present
// - user to change time
// - differnt sources of words  code, lyrics...
// - show more then just the next word
// !! just make the data a string and count whitespaces and new lines

let charactersTyped= 0
let errors = 0
let wordsTyped = 0
let word = ''
let tracking = false
let typingData = ''
let results = document.getElementById('results')
let writingField = document.getElementById('writingField')
const TYPING_TIME = 60000 //in miliseconds 
document.getElementById('timer').textContent = Math.floor(TYPING_TIME / 1000)

// textSourceType = 'fixed_words'
// textSource = 'https://dimitrov-radostin.github.io/typeTracker/most_popular_1000.json'
textSource = 'https://dimitrov-radostin.github.io/typeTracker/the_stranger.json'


//  load 
fetch(textSource)
    .then(r => r.json())
    .then(typingDataRaw => {
        console.log(typingDataRaw)
        // Parsing data
        if(typingDataRaw.type === 'words_in_array'){
            // get random position
            typingData = typingDataRaw.data
                .map((a) => ({sort: Math.random(), value: a}))
                .sort((a, b) => a.sort - b.sort)
                .map((a) => a.value)
                .join('')
                typingData = 'start ' + typingData
            console.log(typingData)
            // add start keyword
        } else if(typingDataRaw.type === 'string'){
            typingData = 'start ' + typingDataRaw.data
        }


        function startTracking() {
            tracking = true
            startTimer()
            setTimeout(stopTracking, TYPING_TIME - 1)
        }

        function stopTracking() {
            tracking = false
            document.removeEventListener('keydown', keyDownHandler)
            results.children[0].textContent = `${wordsTyped} words`
            results.children[1].textContent = `${errors} errors`
            results.children[2].textContent = `${charactersTyped} characters typed`
            // add speed ? in [words/minute] or chars
            clearInterval(updateTimerInterval)
        }

        function startTimer() {
            const startTime = Date.now()
            updateTimerInterval = setInterval(() => updateTimer(startTime), 1000)
        }

        function updateTimer (startTime){
            const timer = document.getElementById('timer')
            let timePassed = (Date.now() - startTime)
            timer.textContent = Math.round((TYPING_TIME - timePassed) / 1000)
        }

        function keyDownHandler(event) {
            let letter = typingData[charactersTyped]
            // console.log(event.key, letter, typingData.charCodeAt(charactersTyped))

            if(event.key === letter || (event.key === 'Enter' && letter.charCodeAt(0) === 10)){
                if (!tracking){      // could use another staring point (a button?)
                    startTracking()
                }
                if(letter === ' ' || letter.charCodeAt(0) === 10 || charactersTyped === 0){
                    newWordStartsAt = 1 + charactersTyped + typingData.substring(charactersTyped + 1).search(/\s/)   // use str.slice(i).search(/re/)  for more word separators
                    // if -1 ..... handle with circular logic

                    word = charactersTyped === 0 
                        ? typingData.substring(charactersTyped, newWordStartsAt)
                        : typingData.substring(charactersTyped + 1, newWordStartsAt)
                    // console.log('new word-- ', word)
                    
                    wordsTyped += 1
                    typedWord = ''
                    document.getElementById('givenWord').textContent = word.replace(/\n/g, String.fromCharCode('0x000023CE'))
                    document.getElementById('nextWord').textContent = typingData.substring(newWordStartsAt, newWordStartsAt + 30 - word.length).replace(/\n/g, String.fromCharCode('0x000023CE'))
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
        // }
    })

