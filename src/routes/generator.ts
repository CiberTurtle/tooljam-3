type Grid = [boolean[]]

export function generate(ctx: CanvasRenderingContext2D, grid: Grid): void {
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
				if (!t && r && b && !l && !tl) {
					outer_curve_lg(ctx, x, y, 0, 0)
					continue
				}
				if (!t && !r && b && l && !tr) {
					outer_curve_lg(ctx, x, y, 1, 0)
					continue
				}
				if (t && r && !b && !l && !bl) {
					outer_curve_lg(ctx, x, y, 0, 1)
					continue
				}
				if (t && !r && !b && l && !br) {
					outer_curve_lg(ctx, x, y, 1, 1)
					continue
				}

				if (!t && !l && !tl)
					outer_curve(ctx, x, y, 0, 0)
				else {
					block(ctx, x, y, 0, 0)
				}

				if (!t && !r && !tr)
					outer_curve(ctx, x, y, 1, 0)
				else {
					block(ctx, x, y, 1, 0)
				}

				if (!b && !l && !bl)
					outer_curve(ctx, x, y, 0, 1)
				else {
					block(ctx, x, y, 0, 1)
				}

				if (!b && !r && !br)
					outer_curve(ctx, x, y, 1, 1)
				else {
					block(ctx, x, y, 1, 1)
				}

				continue
			}

			// TODO Have filled tiles handle placing inner curves which will fix some
			//      of the bugs with `outer_curve_lg` and optimize the algorithm a lot.
			if (t && l && !tl)
				inner_curve(ctx, x, y, 0, 0)
			if (t && r && !tr)
				inner_curve(ctx, x, y, 1, 0)
			if (b && l && !bl)
				inner_curve(ctx, x, y, 0, 1)
			if (r && b && !br)
				inner_curve(ctx, x, y, 1, 1)
		}
	}
}

export function block(ctx: CanvasRenderingContext2D, x: number, y: number, xflip: number, yflip: number): void {
	ctx.fillRect(x + xflip / 2, y + yflip / 2, .5, .5)
}

export function outer_curve(ctx: CanvasRenderingContext2D, x: number, y: number, xflip: number, yflip: number): void {
	ctx.beginPath()
	let rotation = Math.PI
	if (xflip == 1 && yflip == 1)
		rotation = 0
	else if (yflip == 1)
		rotation = Math.PI / 2
	else if (xflip == 1)
		rotation = Math.PI / 2 * 3
	ctx.ellipse(x + .5, y + .5, .5, .5, rotation, 0, Math.PI / 2)
	// ctx.moveTo(x + xflip, y + .5)
	// ctx.quadraticCurveTo(x + xflip, y + yflip, x + .5, y + yflip)
	ctx.lineTo(x + .5, y + .5)
	ctx.fill()
}

export function outer_curve_lg(ctx: CanvasRenderingContext2D, x: number, y: number, xflip: number, yflip: number): void {
	ctx.beginPath()
	let rotation = Math.PI
	if (xflip == 1 && yflip == 1)
		rotation = 0
	else if (yflip == 1)
		rotation = Math.PI / 2
	else if (xflip == 1)
		rotation = Math.PI / 2 * 3
	ctx.ellipse(x + (1 - xflip), y + (1 - yflip), 1, 1, rotation, 0, Math.PI / 2)
	// ctx.moveTo(x + xflip, y + .5)
	// ctx.quadraticCurveTo(x + xflip, y + yflip, x + .5, y + yflip)
	ctx.lineTo(x + (1 - xflip), y + (1 - yflip))
	ctx.fill()
}

export function inner_curve(ctx: CanvasRenderingContext2D, x: number, y: number, xflip: number, yflip: number): void {
	ctx.beginPath()
	ctx.moveTo(x + xflip, y + (1 - yflip))
	ctx.lineTo(x + xflip, y + .5)
	ctx.quadraticCurveTo(x + xflip, y + yflip, x + .5, y + yflip)
	ctx.lineTo(x + xflip, y + yflip)
	ctx.fill()
}
