import { optimize as svgo_optimize } from 'svgo'
import { SvgPathDriver, generate, type GeneratorDriver } from './generator'
import type { View } from '$lib/models/interfaces'

export interface ExportOptions {
	scale_factor: number
}

export interface SvgExportOptions extends ExportOptions {
}

export const svg_path_driver = new SvgPathDriver()

export function create_svg(view: View, generator: GeneratorDriver, options: SvgExportOptions): string {
	svg_path_driver.str = ''
	generator.driver = svg_path_driver
	generate(generator, view)

	const raw_svg = `<svg version="1.1" width="${view.width * options.scale_factor}" height="${view.height * options.scale_factor
		}" viewBox="0 0 ${view.width} ${view.height}" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" stroke="none" d="${svg_path_driver.str
		}" /></svg>`

	const optimized_svg = svgo_optimize(raw_svg, { multipass: true, floatPrecision: 2, }).data
	return optimized_svg
}
