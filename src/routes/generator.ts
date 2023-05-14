type Grid = [boolean[]]

type RuleKey = { t: boolean, r: boolean, b: boolean, l: boolean }
type RuleValue = (ctx: CanvasRenderingContext2D, x: number, y: number) => void
type RuleFunction = (ctx: CanvasRenderingContext2D, x: number, y: number, xflip: number, yflip: number) => void

let base_rules = new Map<RuleKey, RuleFunction>()
let computed_rules = compute_rules(base_rules)

function compute_rules(input: Map<RuleKey, RuleFunction>): Map<RuleKey, RuleValue> {
	let output = new Map<RuleKey, RuleValue>()

	for (const entry of input) {
		const key = entry[0]
		const value = entry[1]
		output.set(key, (ctx, x, y) => value(ctx, x, y, 0, 0))
		output.set({ t: !key.t, r: key.r, b: !key.b, l: key.l, }, (ctx, x, y) => value(ctx, x, y, 1, 0))
		output.set({ t: key.t, r: !key.r, b: key.b, l: !key.l, }, (ctx, x, y) => value(ctx, x, y, 0, 1))
		output.set({ t: !key.t, r: !key.r, b: !key.b, l: !key.l, }, (ctx, x, y) => value(ctx, x, y, 1, 1))
	}

	return output
}

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
				if (t && !r && !b && l && !br)
					outer_curve(ctx, x, y, 0, 0)
				else if (!t && r && b && !l && !tl)
					outer_curve(ctx, x, y, 1, 1)
				else if (t && r && !b && !l && !bl)
					outer_curve(ctx, x, y, 1, 0)
				else if (!t && !r && b && l && !tr)
					outer_curve(ctx, x, y, 0, 1)
				else if (!t && !r && !b && l && !tr && !br)
					xend(ctx, x, y, 0)
				else if (!t && r && !b && !l && !tl && !bl)
					xend(ctx, x, y, 1)
				else if (t && !r && !b && !l && !bl && !br)
					yend(ctx, x, y, 0)
				else if (!t && !r && b && !l && !tl && !tr)
					yend(ctx, x, y, 1)
				else
					fill(ctx, x, y)
			}

			if (r && b && !br)
				inner_curve(ctx, x, y, 1, 1)
			if (t && l && !tl)
				inner_curve(ctx, x, y, 0, 0)

			if (b && l && !bl)
				inner_curve(ctx, x, y, 0, 1)
			if (t && r && !tr)
				inner_curve(ctx, x, y, 1, 0)
		}
	}
}

export function fill(ctx: CanvasRenderingContext2D, x: number, y: number): void {
	ctx.fillRect(x, y, 1, 1)
}

export function xend(ctx: CanvasRenderingContext2D, x: number, y: number, xflip: number): void {
	ctx.beginPath()
	ctx.moveTo(x + xflip, y)
	ctx.lineTo(x + .5, y)
	ctx.quadraticCurveTo(x + (1 - xflip), y, x + (1 - xflip), y + .5)
	ctx.quadraticCurveTo(x + (1 - xflip), y + 1, x + .5, y + 1)
	ctx.lineTo(x + xflip, y + 1)
	ctx.fill()
}

export function yend(ctx: CanvasRenderingContext2D, x: number, y: number, yflip: number): void {
	ctx.beginPath()
	ctx.moveTo(x, y + yflip)
	ctx.lineTo(x, y + .5)
	ctx.quadraticCurveTo(x, y + (1 - yflip), x + .5, y + (1 - yflip))
	ctx.quadraticCurveTo(x + 1, y + (1 - yflip), x + 1, y + .5)
	ctx.lineTo(x + 1, y + yflip)
	ctx.fill()
}

export function outer_curve(ctx: CanvasRenderingContext2D, x: number, y: number, xflip: number, yflip: number): void {
	ctx.beginPath()
	ctx.moveTo(x + xflip, y + (1 - yflip))
	// ctx.lineTo(x + (1 - xflip), y + (yflip))
	ctx.quadraticCurveTo(x + (1 - xflip), y + (1 - yflip), x + (1 - xflip), y + yflip)
	ctx.lineTo(x + xflip, y + yflip)
	ctx.fill()
}

export function inner_curve(ctx: CanvasRenderingContext2D, x: number, y: number, xflip: number, yflip: number): void {
	ctx.beginPath()
	ctx.moveTo(x + xflip, y + (1 - yflip))
	ctx.lineTo(x + xflip, y + 0.5)
	ctx.quadraticCurveTo(x + xflip, y + yflip, x + 0.5, y + yflip)
	// ctx.lineTo(x + 0.5, y + yflip)
	ctx.lineTo(x + xflip, y + yflip)
	ctx.fill()
}
