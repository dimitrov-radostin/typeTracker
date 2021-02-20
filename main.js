// TO DO 
// -fix the structure so not everything is in the Promise
// - timer simetimes stops at one
// - start from random position and so on
// - user to change time
// - differnt sources of words  code, lyrics...
// - show more then just the next word


//  load words 
fetch('https://dimitrov-radostin.github.io/typeTracker/words.json')
    .then(r => r.json())
    .then(words => {
        console.log(words)
        numberOfWords = words.length
        words.unshift('start')
        // start from random position and make everything circular (remove the if words empty logic .. and th e shifting)
        words = words.map(w => w + ' ')
        // wordSetter(words)

        let lettrePosition = 0
        let errors = 0
        let word 
        let tracking = false
        let results = document.getElementById('results')
        let writingField = document.getElementById('writingField')
        const TYPING_TIME = 20000 //in miliseconds 
        document.getElementById('timer').textContent = Math.floor(TYPING_TIME / 1000)


        function startTracking() {
            tracking = true
            startTimer()
            setTimeout(stopTracking, TYPING_TIME - 1)
        }

        function stopTracking() {
            tracking = false
            document.removeEventListener('keydown', keyDownHandler)
            results.children[0].textContent = `${numberOfWords - words.length} words`
            results.children[1].textContent = `${errors} errors`
            clearInterval(updateTimerInterval)
        }

        function startTimer() {
            const startTime = Date.now()
            updateTimerInterval = setInterval(() => updateTimer(startTime), 1000)
        }

        function updateTimer (startTime){
            const timer = document.getElementById('timer')
            let timePassed = (Date.now() - startTime)
            timer.textContent = Math.floor((TYPING_TIME - timePassed) / 1000)
        }


        function keyDownHandler(event) {
            let lettre = word.charAt(lettrePosition);
            if(event.key === lettre) {
                if (!tracking){
                    startTracking()
                }
                lettrePosition++
                writingField.children[0].textContent = word.substring(0, lettrePosition)			
                writingField.children[1].textContent = ''
                if(lettrePosition >= word.length){
                    setNextWords()
                }
            }else {
                if (writingField.children[1].textContent.length === 0){
                    errors++ 
                }
                writingField.children[1].textContent = event.key
            }
        }

        // function wordSetter(words) {
            function setNextWords() {
                lettrePosition = 0
                if(words.length < 1){
                    alert('out of words')
                }
                word = words.shift()
                document.getElementById('givenWord').textContent = word
                document.getElementById('nextWord').textContent = words[0]
                writingField.children[0].textContent = ''
            }

            setNextWords();
            document.addEventListener('keydown', keyDownHandler)
        // }
    })

