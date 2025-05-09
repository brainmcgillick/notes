const { test, describe } = require('node:test')
const assert = require('node:assert')

const reverse = require('../utils/for_testing').reverse

describe('reverse of', () => {
    test('a', () => {
        const result = reverse('a')
    
        assert.strictEqual(result, 'a')
    })

    test('react', () => {
        const result = reverse('react')
    
        assert.strictEqual(result, 'tcaer')
    })

    test('saippuakauppias', () => {
        const result = reverse('saippuakauppias')
    
        assert.strictEqual(result, 'saippuakauppias')
    })
})