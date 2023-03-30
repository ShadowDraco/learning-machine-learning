// reference the canvas and set its size
const canvas = document.getElementById('myCanvas')
const laneCount = 3
canvas.width = 400 - 5 * laneCount
// create a canvas context
const ctx = canvas.getContext('2d')
// create the road

const road = new Road(canvas.width / 2, canvas.width * 0.9, laneCount)
// create a car
const car = new Car(
	road.getLaneCenter(Math.floor(laneCount / 2)),
	window.innerHeight - 100,
	50 - 3 * laneCount,
	75 - 3 * laneCount,
	4,
	'PC',
	'blue'
)

const traffic = [
	new Car(
		road.getLaneCenter(1),
		400,
		50 - 3 * laneCount,
		75 - 3 * laneCount,
		2.5,
		'NPC',
		'random'
	),
	new Car(
		road.getLaneCenter(2),
		200,
		50 - 3 * laneCount,
		75 - 3 * laneCount,
		3,
		'NPC',
		'random'
	),
]

animate()

function animate() {
	traffic.forEach(car => {
		car.update(road.borders, [])
	})

	car.update(road.borders, traffic)
	// resize the canvas so that it resizes when the screen does
	// Also good for clearing the screen!
	canvas.height = window.innerHeight

	// save the context to translate by the car's speed to
	//gives the illusion of camera
	ctx.save()
	// translate by the y position + 70% canvas to keep car at bottom rather than top
	ctx.translate(0, -car.y + canvas.height * 0.7)

	road.draw(ctx)
	traffic.forEach(car => {
		car.draw(ctx)
	})
	car.draw(ctx, 'blue')

	ctx.restore()
	// a recursive function used to play smooth animations!!
	requestAnimationFrame(animate)
}
