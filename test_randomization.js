const ITERATIONS = 50000

const LENGTH = 100
let orderedArray = [...Array(100)].map((_, i) => i)
// console.log(orderedArray);

function randomize() {
    let randArray = [...orderedArray]
    for (let i = 0; i < LENGTH; i++) {
        let randomPosition = Math.floor(Math.random() * LENGTH)
        randArray.splice(randomPosition, 0, randArray.shift())
    }
    return randArray
}

let distribution = [...Array(LENGTH)].map(_ => 0)

for (let i = 0; i < ITERATIONS ; i++) {
    let sample = randomize()
    for (let j = 0; j < LENGTH; j++) {
        distribution[j] += sample[j]
    }
}
distribution = distribution.map(e => e / ITERATIONS)

console.log(distribution)
