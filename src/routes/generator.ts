type Grid = [boolean[]]

export function generate(driver: GeneratorDriver, grid: Grid): void {
	const width = grid.length
	const height = grid[0].length
	const BOUNDS = false

	function try_get(x: number, y: number): boolean {
		if (x >= 0 && y >= 0 && x < width && y < height)
			return grid[x][y]
		return BOUNDS
	}

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const c = grid[x][y]
			const l = try_get(x - 1, y)
			const r = try_get(x + 1, y)
			const t = try_get(x, y - 1)
			const b = try_get(x, y + 1)
			const br = try_get(x + 1, y + 1)
			const tl = try_get(x - 1, y - 1)
			const bl = try_get(x - 1, y + 1)
			const tr = try_get(x + 1, y - 1)

			if (c) {
				// if (!t && r && b && !l && !tl) {
				// 	driver.full_outer_corner(x, y, 0, 0)
				// 	continue
				// }
				// if (!t && !r && b && l && !tr) {
				// 	driver.full_outer_corner(x, y, 1, 0)
				// 	continue
				// }
				// if (t && r && !b && !l && !bl) {
				// 	driver.full_outer_corner(x, y, 0, 1)
				// 	continue
				// }
				// if (t && !r && !b && l && !br) {
				// 	driver.full_outer_corner(x, y, 1, 1)
				// 	continue
				// }

				if (!t && !l && !tl)
					driver.quad_outer_corner(x, y, 0, 0)
				else {
					driver.quad_fill(x, y, 0, 0)
				}

				if (!t && !r && !tr)
					driver.quad_outer_corner(x, y, 1, 0)
				else {
					driver.quad_fill(x, y, 1, 0)
				}

				if (!b && !l && !bl)
					driver.quad_outer_corner(x, y, 0, 1)
				else {
					driver.quad_fill(x, y, 0, 1)
				}

				if (!b && !r && !br)
					driver.quad_outer_corner(x, y, 1, 1)
				else {
					driver.quad_fill(x, y, 1, 1)
				}

				continue

				if (!b && bl)
					driver.quad_inner_corner(x, y + 1, 0, 0)

				if (!b && br)
					driver.quad_inner_corner(x, y + 1, 1, 0)

				if (!t && tl)
					driver.quad_inner_corner(x, y - 1, 0, 1)

				if (!t && tr)
					driver.quad_inner_corner(x, y - 1, 1, 1)

				continue
			}

			// continue

			// TODO Have filled tiles handle placing inner curves which will fix some
			//      of the bugs with `outer_curve_lg` and optimize the algorithm a lot.
			if (t && l)
				driver.quad_inner_corner(x, y, 0, 0)
			if (t && r)
				driver.quad_inner_corner(x, y, 1, 0)
			if (b && l)
				driver.quad_inner_corner(x, y, 0, 1)
			if (r && b)
				driver.quad_inner_corner(x, y, 1, 1)
			continue
			if (t && l && !tl)
				driver.quad_inner_corner(x, y, 0, 0)
			if (t && r && !tr)
				driver.quad_inner_corner(x, y, 1, 0)
			if (b && l && !bl)
				driver.quad_inner_corner(x, y, 0, 1)
			if (r && b && !br)
				driver.quad_inner_corner(x, y, 1, 1)
		}
	}
}

export type GeneratorDriver = {
	quad_fill: (x: number, y: number, xflip: number, yflip: number) => void
	quad_outer_corner: (x: number, y: number, xflip: number, yflip: number) => void
	quad_inner_corner: (x: number, y: number, xflip: number, yflip: number) => void
	full_outer_corner: (x: number, y: number, xflip: number, yflip: number) => void
}

export class CircleGeneratorDriver implements GeneratorDriver {
	driver!: Driver

	quad_fill(x: number, y: number, xflip: number, yflip: number): void {
		x = x + xflip / 2
		y = y + yflip / 2
		this.driver.move(x, y)
		this.driver.line(x + .5, y)
		this.driver.line(x + .5, y + .5)
		this.driver.line(x, y + .5)
	}
	quad_outer_corner(x: number, y: number, xflip: number, yflip: number): void {
		this.driver.move(x + xflip, y + .5)
		this.driver.quad(x + xflip, y + yflip, x + .5, y + yflip)
		this.driver.line(x + .5, y + .5)
		return
		this.driver.move(x + .5, y + .5)
		let rotation = Math.PI
		if (xflip == 1)
			rotation += Math.PI / 2
		if (yflip == 1)
			rotation += Math.PI
		if (xflip == 1 && yflip == 1)
			rotation = 0
		else if (yflip == 1)
			rotation = Math.PI / 2
		else if (xflip == 1)
			rotation = Math.PI / 2 * 3
		this.driver.ellipse(x + .5, y + .5, .5, .5, rotation, Math.PI / 2)
	}
	quad_inner_corner(x: number, y: number, xflip: number, yflip: number): void {
		this.driver.move(x + xflip, y + (1 - yflip))
		this.driver.line(x + xflip, y + .5)
		this.driver.quad(x + xflip, y + yflip, x + .5, y + yflip)
		this.driver.line(x + xflip, y + yflip)
	}
	full_outer_corner(x: number, y: number, xflip: number, yflip: number): void { }
}

export type Driver = {
	move: (x: number, y: number) => void
	line: (x: number, y: number) => void
	quad: (cx: number, cy: number, x: number, y: number) => void
	ellipse: (x: number, y: number, rx: number, ry: number, angle: number, end: number) => void
}

export class PathDriver implements Driver {
	path!: Path2D

	move(x: number, y: number): void {
		this.path.moveTo(x, y)
	}

	line(x: number, y: number): void {
		this.path.lineTo(x, y)
	}

	quad(cx: number, cy: number, x: number, y: number): void {
		this.path.quadraticCurveTo(cx, cy, x, y)
	}

	ellipse(x: number, y: number, rx: number, ry: number, angle: number, end: number): void {
		this.path.ellipse(x, y, rx, ry, angle, 0, end)
	}
}

export class SvgPathDriver implements Driver {
	str = ''

	move(x: number, y: number): void {
		this.str += `M ${x} ${y} `
	}

	line(x: number, y: number): void {
		this.str += `L ${x} ${y} `
	}

	quad(cx: number, cy: number, x: number, y: number): void {
		this.str += `Q ${cx} ${cy} ${x} ${y} `
	}

	ellipse(x: number, y: number, rx: number, ry: number, angle: number, end: number): void {
		// this.str += `A ${x} ${y}`
	}
}
