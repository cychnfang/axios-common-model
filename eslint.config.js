import tseslint from 'typescript-eslint'

export default tseslint.config({
  ignores: ['scripts/'],
  extends: [...tseslint.configs.recommended],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
  },
})
