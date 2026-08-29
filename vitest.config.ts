import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            exclude: [
                ...coverageConfigDefaults.exclude,
                '**/App.vue',
                '**/main.js',
                '**/components/**',
                '**/lib/**',
                '**/models/**',
                '**/stores/**',
                '**/types/**',
                '**/utils/**'
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 79,
                statements: 80,
            },
            reporter: ['text', 'html'],
            provider: 'v8'
        },
    },
})