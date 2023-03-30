class Sensor {
	constructor(car) {
		this.car = car
		this.rayCount = 6
		this.rayLength = 220 // view distance
		this.raySpread = Math.PI / 3 // set angle of rays

		this.rays = []
		this.readings = []
	}

	update(roadBorders, traffic) {
		this.#castRays()
		this.readings = []
		this.rays.forEach(ray => {
			this.readings.push(this.#getReading(ray, roadBorders, traffic))
		})
	}

	// find intersections between sensor rays and road borders
	#getReading = (ray, roadBorders, traffic) => {
		let touches = []
		roadBorders.forEach(border => {
			const touch = getIntersection(ray[0], ray[1], border[0], border[1])

			if (touch) {
				touches.push(touch)
			}
		})

		traffic.forEach(car => {
			const poly = car.polygon
			for (let j = 0; j < poly.length; j++) {
				const value = getIntersection(
					ray[0],
					ray[1],
					poly[j],
					poly[(j + 1) % poly.length]
				)

				if (value) {
					touches.push(value)
				}
			}
		})

		if (touches.length === 0) {
			return null
		} else {
			const offsets = touches.map(e => e.offset)
			const minOffset = Math.min(...offsets) // get the smallest offset
			return touches.find(e => e.offset == minOffset)
		}
	}

	#castRays = () => {
		this.rays = []
		for (let i = 0; i < this.rayCount; i++) {
			const rayAngle =
				lerp(
					this.raySpread / 2,
					-this.raySpread / 2,
					this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
				) + this.car.angle // add the car's current angle to the sensor

			// create start and end points that come from the car's position and angle
			// going forward from that position and angle
			const start = { x: this.car.x, y: this.car.y }
			const end = {
				x: this.car.x - Math.sin(rayAngle) * this.rayLength,
				y: this.car.y - Math.cos(rayAngle) * this.rayLength,
			}
			this.rays.push([start, end])
		}
	}

	draw(ctx) {
		for (let i = 0; i < this.rayCount; i++) {
			// create an 'end' where the ray intersects something
			let end = this.rays[i][1]

			if (this.readings[i]) {
				end = this.readings[i]
			}

			ctx.beginPath()
			ctx.lineWidth = 2
			ctx.strokeStyle = 'yellow'
			ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y)

			ctx.lineTo(end.x, end.y)
			ctx.stroke()

			ctx.beginPath()
			ctx.lineWidth = 2
			ctx.strokeStyle = 'black'
			ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y)

			ctx.lineTo(end.x, end.y)
			ctx.stroke()
		}
	}
}