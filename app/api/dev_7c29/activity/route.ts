import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'
import { devRoutesEnabled, disallowedDevResponse } from '@/lib/dev-utils'

export async function POST(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { action, count = 1, targetId, userId } = await request.json()

    const supabase = getClient()

    switch (action) {
        case 'simulate_group_joins':
            // Add fake users to groups
            const { data: fakeUsers } = await supabase
                .from('fake_users')
                .select('id')
                .limit(count)

            if (fakeUsers && fakeUsers.length > 0) {
                const groupMembers = fakeUsers.map(user => ({
                    group_id: targetId,
                    user_id: user.id,
                    role: 'member'
                }))

                const { data, error } = await supabase
                    .from('group_members')
                    .insert(groupMembers)

                if (error) {
                    return NextResponse.json({ error: error.message }, { status: 500 })
                }

                // Update group member count
                const { data: currentGroup } = await supabase
                    .from('dream_groups')
                    .select('member_count')
                    .eq('id', targetId)
                    .single()

                if (currentGroup) {
                    await supabase
                        .from('dream_groups')
                        .update({ member_count: (currentGroup.member_count || 0) + fakeUsers.length })
                        .eq('id', targetId)
                }

                return NextResponse.json({ success: true, added: fakeUsers.length })
            }
            break

        case 'simulate_contest_entries':
            // Add fake entries to contests
            const { data: fakeUsers2 } = await supabase
                .from('fake_users')
                .select('id')
                .limit(count)

            if (fakeUsers2 && fakeUsers2.length > 0) {
                const entries = fakeUsers2.map(user => ({
                    contest_id: targetId,
                    user_id: user.id,
                    entry_data: { simulated: true, content: 'Simulated entry for activity boost' }
                }))

                const { data, error } = await supabase
                    .from('contest_entries')
                    .insert(entries)

                if (error) {
                    return NextResponse.json({ error: error.message }, { status: 500 })
                }

                // Update contest participant count
                const { data: currentContest } = await supabase
                    .from('contests')
                    .select('participant_count')
                    .eq('id', targetId)
                    .single()

                if (currentContest) {
                    await supabase
                        .from('contests')
                        .update({ participant_count: (currentContest.participant_count || 0) + fakeUsers2.length })
                        .eq('id', targetId)
                }

                return NextResponse.json({ success: true, added: fakeUsers2.length })
            }
            break

        case 'boost_engagement':
            // Randomly increase engagement metrics
            const boosts = []
            for (let i = 0; i < count; i++) {
                const randomType = ['media', 'groups', 'contests'][Math.floor(Math.random() * 3)]
                const randomIncrease = Math.floor(Math.random() * 50) + 10

                if (randomType === 'media') {
                    const { data: media } = await supabase
                        .from('public_media')
                        .select('id, view_count, like_count')
                        .limit(1)
                        .single()

                    if (media) {
                        await supabase
                            .from('public_media')
                            .update({
                                view_count: media.view_count + randomIncrease,
                                like_count: media.like_count + Math.floor(randomIncrease / 2)
                            })
                            .eq('id', media.id)
                        boosts.push(`Media ${media.id}: +${randomIncrease} views, +${Math.floor(randomIncrease / 2)} likes`)
                    }
                }
            }
            return NextResponse.json({ success: true, boosts })

        case 'simulate_comments':
            // Add fake comments to dreams/media
            const { data: fakeUsers3 } = await supabase
                .from('fake_users')
                .select('id, display_name')
                .limit(count)

            if (fakeUsers3 && fakeUsers3.length > 0) {
                const comments = fakeUsers3.map(user => ({
                    user_id: user.id,
                    content: [
                        'This is amazing! 😍',
                        'Love this concept!',
                        'So creative and unique',
                        'This speaks to me',
                        'Incredible work!',
                        'Dreams like this inspire me',
                        'Beautiful and imaginative',
                        'This is pure art',
                        'Absolutely stunning',
                        'Mind-blowing creativity'
                    ][Math.floor(Math.random() * 10)],
                    parent_type: 'dream',
                    parent_id: targetId,
                    like_count: Math.floor(Math.random() * 5)
                }))

                const { data, error } = await supabase
                    .from('comments')
                    .insert(comments)

                if (error) {
                    return NextResponse.json({ error: error.message }, { status: 500 })
                }

                return NextResponse.json({ success: true, added: fakeUsers3.length })
            }
            break

        case 'simulate_group_posts':
            // Add fake posts to groups
            const { data: fakeUsers4 } = await supabase
                .from('fake_users')
                .select('id, display_name')
                .limit(count)

            if (fakeUsers4 && fakeUsers4.length > 0) {
                const posts = fakeUsers4.map(user => ({
                    group_id: targetId,
                    user_id: user.id,
                    title: [
                        'Sharing a dream',
                        'New inspiration',
                        'Creative thoughts',
                        'Dream journal entry',
                        'Imaginative concept',
                        'Dream exploration',
                        'Creative spark',
                        'Dream discovery',
                        'Artistic vision',
                        'Dream inspiration'
                    ][Math.floor(Math.random() * 10)],
                    content: [
                        'Had this amazing dream last night...',
                        'Been thinking about this concept...',
                        'Dreamt about something incredible...',
                        'This idea came to me in a dream...',
                        'Exploring new creative territories...',
                        'Dream-inspired thoughts...',
                        'Let me share this vision...',
                        'Dream world exploration...',
                        'Creative dream sharing...',
                        'Imaginative journey...'
                    ][Math.floor(Math.random() * 10)],
                    like_count: Math.floor(Math.random() * 20) + 1,
                    comment_count: Math.floor(Math.random() * 5)
                }))

                const { data, error } = await supabase
                    .from('group_posts')
                    .insert(posts)

                if (error) {
                    return NextResponse.json({ error: error.message }, { status: 500 })
                }

                return NextResponse.json({ success: true, added: fakeUsers4.length })
            }
            break

        case 'auto_generate_dreams':
            // Auto-generate fake dreams with panels
            const generatedDreams = []
            for (let i = 0; i < count; i++) {
                const dreamTitles = [
                    'Flying Through Crystal Clouds',
                    'Underwater City Adventure',
                    'Time Travel to Ancient Rome',
                    'Space Station Discovery',
                    'Magical Forest Journey',
                    'Superhero Origin Story',
                    'Haunted Mansion Mystery',
                    'Pirate Treasure Quest',
                    'Alien Encounter',
                    'Medieval Castle Dreams'
                ]
                const dreamMoods = ['adventurous', 'mysterious', 'peaceful', 'exciting', 'surreal']
                const dreamStyles = ['realistic', 'cartoon', 'anime', 'fantasy', 'abstract']

                const dreamText = `I dreamt about ${dreamTitles[Math.floor(Math.random() * dreamTitles.length)].toLowerCase()}. It was ${dreamMoods[Math.floor(Math.random() * dreamMoods.length)]} and full of wonder.`

                const { data: dream, error: dreamError } = await supabase
                    .from('dreams')
                    .insert({
                        text: dreamText,
                        mood: dreamMoods[Math.floor(Math.random() * dreamMoods.length)],
                        style: dreamStyles[Math.floor(Math.random() * dreamStyles.length)],
                        user_id: '00000000-0000-0000-0000-000000000000' // Fake user ID
                    })
                    .select()
                    .single()

                if (dream && !dreamError) {
                    // Generate 2-4 panels for this dream
                    const panelCount = Math.floor(Math.random() * 3) + 2
                    const panels = []
                    for (let j = 0; j < panelCount; j++) {
                        panels.push({
                            dream_id: dream.id,
                            description: `Panel ${j + 1}: ${['Opening scene', 'Building tension', 'Climax moment', 'Resolution'][j] || 'Additional scene'}`,
                            image_url: `https://picsum.photos/400/300?random=${Math.random()}`,
                            scene_number: j + 1
                        })
                    }

                    await supabase.from('panels').insert(panels)
                    generatedDreams.push(dream)
                }
            }
            return NextResponse.json({ success: true, generated: generatedDreams.length })

        case 'auto_generate_contests':
            // Auto-generate fake contests
            const generatedContests = []
            for (let i = 0; i < count; i++) {
                const contestTitles = [
                    'Dream Art Competition',
                    'Creative Dream Stories',
                    'Surreal Visions Contest',
                    'Dream Journal Challenge',
                    'Fantasy Dream Art',
                    'Dream Photography Contest',
                    'Abstract Dream Art',
                    'Dream Comic Creation',
                    'Nightmare to Masterpiece',
                    'Dream World Building'
                ]
                const contestThemes = [
                    'Explore your subconscious',
                    'Create something beautiful',
                    'Share your wildest dreams',
                    'Turn nightmares into art',
                    'Build dream worlds',
                    'Capture dream essence',
                    'Express inner creativity',
                    'Dream-inspired innovation',
                    'Surreal art exploration',
                    'Dream visualization'
                ]

                const startDate = new Date()
                const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

                const { data: contest, error: contestError } = await supabase
                    .from('contests')
                    .insert({
                        title: contestTitles[Math.floor(Math.random() * contestTitles.length)],
                        description: contestThemes[Math.floor(Math.random() * contestThemes.length)],
                        rules: 'Create original dream-inspired art. Be respectful and creative.',
                        prize_info: 'Winner gets featured on homepage + bragging rights',
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString(),
                        status: 'active'
                    })
                    .select()
                    .single()

                if (contest && !contestError) {
                    generatedContests.push(contest)
                }
            }
            return NextResponse.json({ success: true, generated: generatedContests.length })

        case 'auto_generate_groups':
            // Auto-generate fake groups
            const generatedGroups = []
            for (let i = 0; i < count; i++) {
                const groupNames = [
                    'Dream Artists United',
                    'Lucid Dreamers',
                    'Creative Dreamers',
                    'Dream Journal Club',
                    'Surreal Art Collective',
                    'Dream Explorers',
                    'Nightmare Artists',
                    'Dream World Builders',
                    'Fantasy Dreamers',
                    'Abstract Dream Art'
                ]
                const groupEmojis = ['✨', '🌙', '🎨', '🌟', '💫', '🌈', '🎭', '🖼️', '🌌', '💭']
                const groupCategories = ['art', 'dreams', 'creativity', 'community', 'inspiration']

                const { data: group, error: groupError } = await supabase
                    .from('dream_groups')
                    .insert({
                        name: groupNames[Math.floor(Math.random() * groupNames.length)],
                        description: `A community for ${groupCategories[Math.floor(Math.random() * groupCategories.length)]} enthusiasts sharing dreams and creativity.`,
                        emoji: groupEmojis[Math.floor(Math.random() * groupEmojis.length)],
                        category: groupCategories[Math.floor(Math.random() * groupCategories.length)],
                        is_private: Math.random() > 0.7
                    })
                    .select()
                    .single()

                if (group && !groupError) {
                    generatedGroups.push(group)
                }
            }
            return NextResponse.json({ success: true, generated: generatedGroups.length })

        case 'auto_generate_media':
            // Auto-generate fake media
            const generatedMedia = []
            for (let i = 0; i < count; i++) {
                const mediaTitles = [
                    'Dream Landscape',
                    'Surreal Portrait',
                    'Abstract Dream Art',
                    'Fantasy Scene',
                    'Dream Character',
                    'Cosmic Vision',
                    'Dream Architecture',
                    'Mystical Forest',
                    'Dream Creature',
                    'Otherworldly Scene'
                ]
                const mediaTypes = ['image', 'video', 'audio']
                const selectedType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)]

                const { data: media, error: mediaError } = await supabase
                    .from('public_media')
                    .insert({
                        title: mediaTitles[Math.floor(Math.random() * mediaTitles.length)],
                        description: 'AI-generated dream-inspired artwork',
                        media_url: selectedType === 'image' ? `https://picsum.photos/600/400?random=${Math.random()}` : `https://example.com/${selectedType}/${Math.random()}`,
                        media_type: selectedType,
                        is_featured: Math.random() > 0.8,
                        user_id: '00000000-0000-0000-0000-000000000000'
                    })
                    .select()
                    .single()

                if (media && !mediaError) {
                    generatedMedia.push(media)
                }
            }
            return NextResponse.json({ success: true, generated: generatedMedia.length })

        case 'auto_generate_comments':
            // Auto-generate comments on existing dreams
            const { data: dreams } = await supabase
                .from('dreams')
                .select('id')
                .limit(10)

            if (dreams && dreams.length > 0) {
                const { data: fakeUsers5 } = await supabase
                    .from('fake_users')
                    .select('id, display_name')
                    .limit(count)

                if (fakeUsers5 && fakeUsers5.length > 0) {
                    const comments = fakeUsers5.map(user => ({
                        user_id: user.id,
                        content: [
                            'This dream is incredible! 😍',
                            'Love the creativity here!',
                            'So imaginative and beautiful',
                            'This really speaks to me',
                            'Amazing dream concept!',
                            'Dreams like this inspire me',
                            'Beautiful and surreal',
                            'This is pure artistry',
                            'Absolutely mesmerizing',
                            'Mind-blowing imagination'
                        ][Math.floor(Math.random() * 10)],
                        parent_type: 'dream',
                        parent_id: dreams[Math.floor(Math.random() * dreams.length)].id,
                        like_count: Math.floor(Math.random() * 10)
                    }))

                    const { data, error } = await supabase
                        .from('comments')
                        .insert(comments)

                    if (error) {
                        return NextResponse.json({ error: error.message }, { status: 500 })
                    }

                    return NextResponse.json({ success: true, generated: fakeUsers5.length })
                }
            }
            return NextResponse.json({ success: true, generated: 0 })

        case 'simulate_achievements':
            // Simulate user achievements
            try {
                const { data: fakeUsers6 } = await supabase
                    .from('fake_users')
                    .select('id')
                    .limit(count)

                if (fakeUsers6 && fakeUsers6.length > 0) {
                    const achievements = fakeUsers6.map(user => ({
                        user_id: user.id,
                        achievement_type: ['dreamer', 'artist', 'creator', 'explorer', 'visionary'][Math.floor(Math.random() * 5)],
                        title: [
                            'First Dream Shared',
                            'Creative Mind',
                            'Dream Artist',
                            'Imagination Master',
                            'Dream Explorer',
                            'Visionary Creator',
                            'Dream Weaver',
                            'Artistic Soul',
                            'Dream Pioneer',
                            'Creative Genius'
                        ][Math.floor(Math.random() * 10)],
                        description: 'Achievement unlocked through creative dreaming',
                        unlocked_at: new Date().toISOString()
                    }))

                    const { data, error } = await supabase
                        .from('user_achievements')
                        .insert(achievements)

                    if (error) {
                        return NextResponse.json({ error: `Table 'user_achievements' may not exist. Please run database-setup.sql in Supabase: ${error.message}` }, { status: 500 })
                    }

                    return NextResponse.json({ success: true, generated: fakeUsers6.length })
                }
            } catch (err) {
                return NextResponse.json({ error: `Database table issue. Please run database-setup.sql in Supabase: ${err}` }, { status: 500 })
            }
            break

        case 'simulate_online_users':
            // Simulate online presence
            const { data: fakeUsers7 } = await supabase
                .from('fake_users')
                .select('id')
                .limit(count)

            if (fakeUsers7 && fakeUsers7.length > 0) {
                const onlineStatuses = fakeUsers7.map(user => ({
                    user_id: user.id,
                    is_online: true,
                    last_seen: new Date().toISOString(),
                    current_activity: ['dreaming', 'creating', 'exploring', 'sharing', 'inspiring'][Math.floor(Math.random() * 5)]
                }))

                // Insert or update online status
                const { data, error } = await supabase
                    .from('user_online_status')
                    .upsert(onlineStatuses, { onConflict: 'user_id' })

                if (error) {
                    return NextResponse.json({ error: error.message }, { status: 500 })
                }

                return NextResponse.json({ success: true, generated: fakeUsers7.length })
            }
            break

        case 'auto_boost_all':
            // Boost all engagement metrics
            const multiplier = count || 2

            // Boost media engagement
            await supabase.rpc('boost_all_engagement', { multiplier_val: multiplier })

            return NextResponse.json({ success: true, multiplier })

        case 'generate_trending_content':
            // Generate viral/trending content
            const trendingPosts = []
            for (let i = 0; i < count; i++) {
                const { data: fakeUser } = await supabase
                    .from('fake_users')
                    .select('id, display_name')
                    .limit(1)
                    .single()

                if (fakeUser) {
                    const { data: post, error } = await supabase
                        .from('group_posts')
                        .insert({
                            group_id: null, // Public post
                            user_id: fakeUser.id,
                            title: [
                                'VIRAL: Mind-Blowing Dream Art!',
                                'TRENDING: Dream That Changed My Life',
                                'HOT: Surreal Dream Experience',
                                'VIRAL: Dream World Discovery',
                                'TRENDING: Creative Dream Journey'
                            ][Math.floor(Math.random() * 5)],
                            content: 'This dream was absolutely incredible and mind-expanding. The colors, the emotions, the sheer creativity - it\'s blowing up online! #DreamArt #ViralDreams #Creative',
                            like_count: Math.floor(Math.random() * 100) + 50,
                            comment_count: Math.floor(Math.random() * 20) + 10,
                            is_trending: true
                        })
                        .select()
                        .single()

                    if (post && !error) {
                        trendingPosts.push(post)
                    }
                }
            }
            return NextResponse.json({ success: true, generated: trendingPosts.length })

        case 'simulate_social_proof':
            // Simulate social proof events (likes, follows, etc.)
            const socialEvents = []
            for (let i = 0; i < count; i++) {
                const eventTypes = ['like', 'follow', 'share', 'comment', 'save']
                const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

                socialEvents.push({
                    event_type: eventType,
                    user_id: '00000000-0000-0000-0000-000000000000',
                    target_type: 'dream',
                    target_id: '00000000-0000-0000-0000-000000000000',
                    created_at: new Date().toISOString(),
                    metadata: { simulated: true, viral: true }
                })
            }

            const { data, error } = await supabase
                .from('social_events')
                .insert(socialEvents)

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            return NextResponse.json({ success: true, generated: socialEvents.length })
    }

    return NextResponse.json({ error: 'Action not implemented' }, { status: 400 })
}

export async function GET() {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    // Get simulation statistics
    const supabase = getClient()

    const [
        { count: totalFakeUsers },
        { count: totalGroupMembers },
        { count: totalContestEntries },
        { count: totalMediaItems },
        { count: totalComments },
        { count: totalGroupPosts }
    ] = await Promise.all([
        supabase.from('fake_users').select('*', { count: 'exact', head: true }),
        supabase.from('group_members').select('*', { count: 'exact', head: true }),
        supabase.from('contest_entries').select('*', { count: 'exact', head: true }),
        supabase.from('public_media').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('group_posts').select('*', { count: 'exact', head: true })
    ])

    // Get engagement totals
    const { data: media } = await supabase
        .from('public_media')
        .select('view_count, like_count')

    const totalViews = media?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0
    const totalLikes = media?.reduce((sum, item) => sum + (item.like_count || 0), 0) || 0

    return NextResponse.json({
        simulationStats: {
            totalFakeUsers: totalFakeUsers || 0,
            totalSimulatedMembers: totalGroupMembers || 0,
            totalSimulatedEntries: totalContestEntries || 0,
            totalMediaItems: totalMediaItems || 0,
            totalSimulatedComments: totalComments || 0,
            totalSimulatedPosts: totalGroupPosts || 0,
            totalSimulatedViews: totalViews,
            totalSimulatedLikes: totalLikes,
            engagementMultiplier: totalFakeUsers ? Math.round((totalViews + totalLikes + (totalComments || 0) + (totalGroupPosts || 0)) / Math.max(totalFakeUsers, 1)) : 0
        }
    })
}