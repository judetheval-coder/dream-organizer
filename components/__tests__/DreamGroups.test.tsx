import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Clerk user
jest.mock('@clerk/nextjs', () => ({
    useUser: () => ({ user: { id: 'test-user', email: 'test@example.com' } }),
}))

// Mock social lib
const mockCreateGroup = jest.fn().mockResolvedValue({ success: true, group: { id: 'g-new', name: 'Test Group', description: 'A test', emoji: '✨', memberCount: 1, postCount: 0, isJoined: true, isPrivate: false, category: 'general' } })
jest.mock('@/lib/social', () => ({
    joinGroup: jest.fn().mockResolvedValue({ success: true }),
    leaveGroup: jest.fn().mockResolvedValue({ success: true }),
    getJoinedGroups: jest.fn().mockResolvedValue([]),
    createGroup: (...args: unknown[]) => mockCreateGroup(...(args as any[])),
}))

// Mock useDreams to avoid network calls and provide default user tier
jest.mock('@/hooks/useDreams', () => ({
    useDreams: () => ({
        dreams: [],
        loading: false,
        loadingMore: false,
        hasMore: false,
        error: null,
        userTier: 'premium',
        refreshDreams: jest.fn(),
        saveDream: jest.fn(),
        updatePanel: jest.fn(),
        removeDream: jest.fn(),
        loadMoreDreams: jest.fn(),
        demoCreated: false,
    }),
}))

import DreamGroups from '../DreamGroups'
import { DEFAULT_GROUPS } from '@/lib/mock-data'

describe('DreamGroups', () => {
    it('renders and opens the create modal, creates a group', async () => {
        render(<DreamGroups groups={DEFAULT_GROUPS} />)

        // Wait for initial render to settle
        await waitFor(() => expect(screen.getByText(/Lucid Dreamers/i)).toBeInTheDocument())

        // Create button should be visible (header 'Create')
        const createBtn = screen.getByRole('button', { name: /^Create$/i })
        expect(createBtn).toBeInTheDocument()

        // Open modal
        fireEvent.click(createBtn)
        // Modal opens with a heading 'Create a Group'
        expect(screen.getByRole('heading', { name: /Create a Group/i })).toBeInTheDocument()

        // Fill name and description
        const nameInput = screen.getByPlaceholderText(/Group name/i)
        fireEvent.change(nameInput, { target: { value: 'Test Group' } })
        const descInput = screen.getByPlaceholderText(/Short description/i)
        fireEvent.change(descInput, { target: { value: 'A test' } })

        // Click the create button within the modal dialog using within
        const dialog = screen.getByRole('dialog')
        const createModalButton = within(dialog).getByRole('button', { name: /^Create$/i })
        fireEvent.click(createModalButton)

        await waitFor(() => {
            expect(mockCreateGroup).toHaveBeenCalled()
        })

        // New group should be visible in list after create (await for update)
        expect(await screen.findByText('Test Group')).toBeInTheDocument()
    })
})
