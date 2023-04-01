// reference the canvas and set its size
const carCanvas = document.getElementById('carCanvas')
const networkCanvas = document.getElementById('networkCanvas')

const mutationAmount = 0.2 //TODO
const N = 50 //TODO - number of AI cars

const numberOfTrafficCars = 100 //TODO
const spaceBetweenTraffic = 100 //TODO
const laneCount = 3 //TODO
const canvasWidth = 200 //TODO

carCanvas.width = canvasWidth - 8 * laneCount
networkCanvas.width = canvasWidth * 1.2

// create a canvas context
const carCtx = carCanvas.getContext('2d')
const networkCtx = networkCanvas.getContext('2d')
// create the road

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, laneCount)
// create a bunch of cars

const cars = generateCars(N)

//track the best car
let bestCar = cars[0]
let cameraIndex = 0
let farthestDistance = 0

/*
  Try this! 
  localStorage.setItem('bestBrain', bestBrain: '{"levels":[{"inputs":[0.27936910034547513,0.480357…397,0.2854052975149031,-0.006766876409308259]]}]}')
*/

if (localStorage.getItem('bestBrain')) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'))
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, mutationAmount)
    }
  }
}

const traffic = generateTraffic()

function generateTraffic() {
  let distance = 300
  let traffic = []

  for (let i = 0; i < numberOfTrafficCars; i++) {
    traffic.push(
      new Car(
        road.getLaneCenter(Math.floor(Math.random() * laneCount)),
        distance - i * (spaceBetweenTraffic + Math.random() * 10),
        10 + 10 * (canvasWidth / 100) - 3 * laneCount,
        40 + 10 * (canvasWidth / 100) - 3 * laneCount,
        Math.floor(Math.random() * 2 + 1),
        'NPC',
        'random'
      )
    )
  }
  return traffic
}

animate()

function save() {
  localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
  location.reload()
}

function discard() {
  localStorage.removeItem('bestBrain')
  location.reload()
}

function generateCars(N) {
  const cars = []
  for (let i = 1; i < N; i++) {
    cars.push(
      new Car(
        road.getLaneCenter(Math.floor(laneCount / 2)),
        window.innerHeight - 100,
        10 + 10 * (canvasWidth / 100) - 3 * laneCount,
        30 + 10 * (canvasWidth / 100) - 3 * laneCount,
        3,
        'AI',
        'blue',
        i - 1
      )
    )
  }
  cars[0].beingFollowed = true
  return cars
}

function animate(time) {
  traffic.forEach(car => {
    car.update(road.borders, [])
  })

  cars.forEach(car => {
    // update each car, as a non-followed car
    car.update(road.borders, traffic)
    car.beingFollowed = false
  })

  // set the furthest car as the followed car
  bestCar = cars.find(car => car.y == Math.min(...cars.map(car => car.y)))
  bestCar.beingFollowed = true
  // resize the canvas so that it resizes when the screen does
  // Also good for clearing the screen!
  carCanvas.height = window.innerHeight
  networkCanvas.height = window.innerHeight

  // save the context to translate by the car's speed to
  //gives the illusion of camera
  carCtx.save()
  // translate by the y position + 70% canvas to keep car at bottom rather than top
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7)

  road.draw(carCtx)
  traffic.forEach(car => {
    car.draw(carCtx)
  })

  // draw all cars but the furthest one
  carCtx.globalAlpha = 0.2
  cars.forEach(car => {
    if (car.index !== bestCar.index) {
      car.draw(carCtx, 'blue')
    }
  })
  // draw the furthest one
  carCtx.globalAlpha = 1
  bestCar.draw(carCtx, 'purple')

  carCtx.restore()

  // animate and show the visualizer
  networkCtx.lineDashOffset = -time / 50
  Visualizer.drawNetwork(networkCtx, bestCar.brain)

  // a recursive function used to play smooth animations!!
  requestAnimationFrame(animate)
}
