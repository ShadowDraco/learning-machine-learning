const colors = ['red', 'green', 'yellow', 'orange', 'brown', 'white', 'gray']

class Car {
	constructor(x, y, w, h, maxSpeed, controlType, color) {
		this.x = x
		this.y = y
		this.width = w
		this.height = h

		this.speed = 0
		this.maxSpeed = maxSpeed
		this.friction = 0.03
		this.accel = 0.1
		this.angle = 0

		this.damaged = false

		color === 'random'
			? (this.color = colors[Math.round(Math.random() * colors.length - 1)])
			: (this.color = color)

		if (controlType === 'PC') {
			this.sensor = new Sensor(this)
		}

		this.controls = new Controls(controlType)
	}

	update(roadBorders, traffic) {
		// MOVEMENT
		if (!this.damaged) {
			this.#handleControls()
			this.#capSpeed()
			this.#applyFriction()
			this.#applyVelocity()

			// Collisions
			this.polygon = this.#createPolygon()
			this.damaged = this.#assessDamage(roadBorders, traffic)
		}

		if (this.sensor) {
			this.sensor.update(roadBorders, traffic)
		}
	}

	#assessDamage(roadBorders, traffic) {
		let collision = false
		roadBorders.forEach(border => {
			if (polysIntersect(this.polygon, border)) {
				collision = true
			}
		})

		traffic.forEach(car => {
			if (polysIntersect(this.polygon, car.polygon)) {
				collision = true
			}
		})

		return collision
	}

	// help track the positions of things that are moving on the canvas
	#createPolygon() {
		const points = []
		// get the radius to find the positions of corners
		const rad = Math.hypot(this.width, this.height) / 2
		// use the arc tangent to get the angle knowing the width and the height
		const alpha = Math.atan2(this.width, this.height)
		// top left
		points.push({
			x: this.x - Math.sin(this.angle - alpha) * rad,
			y: this.y - Math.cos(this.angle - alpha) * rad,
		})

		// top right
		points.push({
			x: this.x - Math.sin(this.angle + alpha) * rad,
			y: this.y - Math.cos(this.angle + alpha) * rad,
		})

		// bottom left
		points.push({
			x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
		})

		// bottom right
		points.push({
			x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
		})

		return points
	}

	#applyVelocity = () => {
		// apply velocity based on rotation
		this.x -= Math.sin(this.angle) * this.speed
		this.y -= Math.cos(this.angle) * this.speed
	}

	#handleControls = () => {
		if (this.controls.forward) {
			this.speed += this.accel
		}
		if (this.controls.reverse) {
			this.speed -= this.accel
		}

		if (this.speed != 0) {
			const flip = this.speed > 0 ? 1 : -1
			// if the flip is 1 nothing happens, otherwise signs are flipped to simulate proper driving
			if (this.controls.left) {
				this.angle += 0.03 * flip
			}
			if (this.controls.right) {
				this.angle -= 0.03 * flip
			}
		}
	}

	#capSpeed = () => {
		this.speed > this.maxSpeed ? (this.speed = this.maxSpeed) : ''
		this.speed < -this.maxSpeed ? (this.speed = -this.maxSpeed) : ''
	}

	#applyFriction = () => {
		if (this.speed > 0) {
			this.speed -= this.friction
		}
		if (this.speed < 0) {
			this.speed += this.friction
		}

		// if speed is less than friction set speed to 0 to prevent sliding
		Math.abs(this.speed) < this.friction ? (this.speed = 0) : ''
	}

	draw(ctx) {
		if (this.damaged) {
			ctx.fillStyle = 'gray'
		} else {
			ctx.fillStyle = this.color
		}
		if (this.sensor) {
			this.sensor.draw(ctx)
		}

		/* 
		// save context
		ctx.save()
		// rotate with translations
		ctx.translate(this.x, this.y)
		ctx.rotate(-this.angle)

        */
		ctx.beginPath()

		ctx.moveTo(this.polygon[0].x, this.polygon[0].y)
		this.polygon.forEach(point => {
			ctx.lineTo(point.x, point.y)
		})

		/*
        ctx.rect(
			// remove coordinates because the position is already translated ^
			>this.x< -this.width / 2,
			>this.y< -this.height / 2,
			this.width,
			this.height)
        */
		ctx.fill()

		/*// restore the context to the save point so it doesn't continually translate and rotate!
		ctx.restore()*/
	}
}
