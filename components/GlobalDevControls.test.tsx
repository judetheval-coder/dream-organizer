import React from 'react'
import { render } from '@testing-library/react'

describe('GlobalDevControls', () => {
    const OLD_ENV = process.env

    afterEach(() => {
        process.env = { ...OLD_ENV }
        jest.resetModules()
    })

    test('does not render in production (runtime guard)', () => {
        process.env.NODE_ENV = 'production'
        jest.resetModules()

        const { GlobalDevControls } = require('./GlobalDevControls')
        const { container } = render(React.createElement(GlobalDevControls))
        // If the component returns null, container.innerHTML will be empty
        expect(container.innerHTML).toBe('')
    })
})
