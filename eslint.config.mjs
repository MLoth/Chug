// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  // Allow trailing commas
  {
    rules: {
      'comma-dangle': ['off', 'always-multiline'],
    },
  },
)
