import { defineConfig, presetUno, presetTypography, } from 'unocss'
import extractorSvelte from '@unocss/extractor-svelte'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import transformerDirectives from '@unocss/transformer-directives'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
	presets: [
		presetUno(),
		presetTypography(),
		presetIcons({
			scale: 1.5,
		}),
	],
	extractors: [
		extractorSvelte(),
	],
	transformers: [
		transformerVariantGroup(),
		transformerDirectives(),
	],
})
