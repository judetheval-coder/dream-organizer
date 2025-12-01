// Mock next/server to avoid web API polyfill issues in the test environment
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn(() => ({ status: 404 })),
    },
}))

describe('devRoutesEnabled', () => {
    const OLD_ENV = process.env

    afterEach(() => {
        process.env = { ...OLD_ENV }
        jest.resetModules()
    })

    test('returns false when NODE_ENV is production', () => {
        process.env.NODE_ENV = 'production'
        const { devRoutesEnabled: fn } = require('./dev-utils')
        expect(fn()).toBe(false)
    })

    test('returns false when DISABLE_DEV_ROUTES is set to true (non-production)', () => {
        process.env.NODE_ENV = 'development'
        process.env.DISABLE_DEV_ROUTES = 'true'
        const { devRoutesEnabled: fn } = require('./dev-utils')
        expect(fn()).toBe(false)
    })

    test('returns true in development by default', () => {
        process.env.NODE_ENV = 'development'
        delete process.env.DISABLE_DEV_ROUTES
        const { devRoutesEnabled: fn } = require('./dev-utils')
        expect(fn()).toBe(true)
    })
})

describe('disallowedDevResponse', () => {
    test('returns a 404 NextResponse', () => {
        const { disallowedDevResponse } = require('./dev-utils')
        const res = disallowedDevResponse()
        // NextResponse includes a status property
        expect(res.status).toBe(404)
    })
})
