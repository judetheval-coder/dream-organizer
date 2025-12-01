"use client"

import { supabase } from './supabase'

// ============= SHARE FUNCTIONS =============

export type SharePlatform = 'twitter' | 'facebook' | 'pinterest' | 'copy' | 'download'

export interface ShareOptions {
  title: string
  description: string
  imageUrl?: string
  dreamId?: string
  url?: string
}

export async function shareDream(platform: SharePlatform, options: ShareOptions): Promise<boolean> {
  const { title, description, imageUrl, url, dreamId } = options
  const envBase = typeof window !== 'undefined' && (window.location?.origin) ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || ''
  const canonical = url || (dreamId ? `${envBase}/public/dreams/${dreamId}` : window.location.href)
  const finalUrl = canonical
  const text = `${title}\n\n${description}`

  switch (platform) {
    case 'twitter':
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(finalUrl)}`,
        '_blank',
        'width=600,height=400'
      )
      return true

    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}&quote=${encodeURIComponent(text)}`,
        '_blank',
        'width=600,height=400'
      )
      return true

    case 'pinterest':
      if (imageUrl) {
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(finalUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(text)}`,
          '_blank',
          'width=600,height=400'
        )
        return true
      }
      return false

    case 'copy':
      try {
        await navigator.clipboard.writeText(`${text}\n\n${finalUrl}`)
        return true
      } catch {
        return false
      }

    case 'download':
      if (imageUrl) {
        const a = document.createElement('a')
        a.href = imageUrl
        a.download = `dream-${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        return true
      }
      return false

    default:
      return false
  }
}

// ============= PUBLIC GALLERY FUNCTIONS =============

export interface PublicDream {
  id: string
  userId: string
  username: string
  avatar?: string
  dreamText: string
  panels: Array<{ id: string; imageUrl: string; description: string }>
  style: string
  mood: string
  createdAt: string
  reactions: { like: number; love: number; wow: number; dream: number; insightful: number }
  comments: number
  isFollowing?: boolean
  isPublic?: boolean
}

export async function publishDreamToGallery(dreamId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Insert into published_dreams table
    const { error } = await supabase
      .from('published_dreams')
      .upsert({
        dream_id: dreamId,
        user_id: userId,
        published_at: new Date().toISOString(),
      })

    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to publish dream' }
  }
}

export async function unpublishDreamFromGallery(dreamId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('published_dreams')
      .delete()
      .eq('dream_id', dreamId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to unpublish dream' }
  }
}

export async function fetchPublicDreams(currentUserId?: string): Promise<PublicDream[]> {
  try {
    // Get published dreams with dream data
    const { data, error } = await supabase
      .from('published_dreams')
      .select(`
        id,
        dream_id,
        user_id,
        view_count,
        like_count,
        comment_count,
        published_at,
        dreams (
          id,
          text,
          style,
          mood,
          created_at,
          panels (id, description, image_url)
        ),
        users (id, email)
      `)
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) throw error

    // Get current user's following list if logged in
    let followingList: string[] = []
    if (currentUserId) {
      followingList = await getFollowing(currentUserId)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((d: any) => ({
      id: d.dreams?.id || d.dream_id,
      userId: d.user_id,
      username: d.users?.email?.split('@')[0] || 'Dreamer',
      avatar: '🌙',
      dreamText: d.dreams?.text || '',
      panels: d.dreams?.panels?.map((p: { id: string; description: string; image_url: string }) => ({
        id: p.id,
        imageUrl: p.image_url,
        description: p.description,
      })) || [],
      style: d.dreams?.style || '',
      mood: d.dreams?.mood || '',
      createdAt: d.dreams?.created_at || d.published_at,
      reactions: { like: d.like_count || 0, love: 0, wow: 0, dream: 0, insightful: 0 },
      comments: d.comment_count || 0,
      isPublic: true,
      isFollowing: followingList.includes(d.user_id),
    }))
  } catch {
    return []
  }
}

// Check published state for a dream
export async function isDreamPublished(dreamId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('published_dreams')
      .select('id')
      .eq('dream_id', dreamId)
      .limit(1)
      .single()
    if (error) return false
    return !!data
  } catch {
    return false
  }
}

// ============= REACTION FUNCTIONS =============

export type ReactionType = 'like' | 'love' | 'wow' | 'dream' | 'insightful'

export async function reactToDream(
  dreamId: string,
  userId: string,
  reaction: ReactionType
): Promise<{ success: boolean; added: boolean; error?: string }> {
  try {
    // Check if user already has this reaction
    const { data: existing } = await supabase
      .from('dream_reactions')
      .select('id')
      .eq('dream_id', dreamId)
      .eq('user_id', userId)
      .eq('reaction_type', reaction)
      .single()

    if (existing) {
      // Remove reaction
      const { error } = await supabase
        .from('dream_reactions')
        .delete()
        .eq('id', existing.id)

      if (error) throw error
      return { success: true, added: false }
    } else {
      // Add reaction
      const { error } = await supabase
        .from('dream_reactions')
        .insert({
          dream_id: dreamId,
          user_id: userId,
          reaction_type: reaction,
        })

      if (error) throw error
      return { success: true, added: true }
    }
  } catch (e) {
    return { success: false, added: false, error: e instanceof Error ? e.message : 'Failed to react' }
  }
}

export async function getDreamReactions(dreamId: string): Promise<Record<ReactionType, number>> {
  try {
    const { data, error } = await supabase
      .from('dream_reactions')
      .select('reaction_type')
      .eq('dream_id', dreamId)

    if (error) throw error

    const counts: Record<ReactionType, number> = { like: 0, love: 0, wow: 0, dream: 0, insightful: 0 }
    data?.forEach(r => {
      if (r.reaction_type in counts) {
        counts[r.reaction_type as ReactionType]++
      }
    })
    return counts
  } catch {
    return { like: 0, love: 0, wow: 0, dream: 0, insightful: 0 }
  }
}

// ============= FOLLOW FUNCTIONS =============

export async function followUser(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('follows')
      .upsert({
        follower_id: followerId,
        following_id: followingId,
      })

    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to follow' }
  }
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)

    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to unfollow' }
  }
}

export async function getFollowing(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)

    if (error) throw error
    return data?.map(f => f.following_id) || []
  } catch {
    return []
  }
}

export async function getFollowers(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId)

    if (error) throw error
    return data?.map(f => f.follower_id) || []
  } catch {
    return []
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()

    return !!data
  } catch {
    return false
  }
}

// ============= DREAM GROUPS FUNCTIONS =============

export interface DreamGroup {
  id: string
  name: string
  description: string
  emoji: string
  memberCount: number
  postCount: number
  isJoined: boolean
  isPrivate: boolean
  category: string
  recentActivity?: string
  coverGradient?: string
  createdBy?: string
}

export async function joinGroup(groupId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('group_memberships')
      .upsert({
        group_id: groupId,
        user_id: userId,
        role: 'member',
      })

    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to join group' }
  }
}

export async function leaveGroup(groupId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('group_memberships')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to leave group' }
  }
}

export async function getJoinedGroups(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('group_memberships')
      .select('group_id')
      .eq('user_id', userId)

    if (error) throw error
    return data?.map(m => m.group_id) || []
  } catch {
    return []
  }
}

export async function fetchGroups(userId?: string): Promise<DreamGroup[]> {
  try {
    const { data, error } = await supabase
      .from('dream_groups')
      .select('*')
      .order('member_count', { ascending: false })

    if (error) throw error

    let joinedGroups: string[] = []
    if (userId) {
      joinedGroups = await getJoinedGroups(userId)
    }

    return (data || []).map(g => ({
      id: g.id,
      name: g.name,
      description: g.description || '',
      emoji: getCategoryEmoji(g.category),
      memberCount: g.member_count || 0,
      postCount: 0,
      isJoined: joinedGroups.includes(g.id),
      isPrivate: false,
      category: g.category,
      createdBy: g.created_by,
    }))
  } catch {
    return []
  }
}

export async function createGroup(
  group: { name: string; description: string; category: string; isPrivate: boolean },
  userId: string
): Promise<{ success: boolean; group?: DreamGroup; error?: string }> {
  try {
    // Server-side check: ensure the user is premium
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (userErr) throw userErr
    if (!userRow || userRow.subscription_tier !== 'premium') {
      return { success: false, error: 'Only premium users can create groups' }
    }
    const { data, error } = await supabase
      .from('dream_groups')
      .insert({
        name: group.name,
        description: group.description,
        category: group.category,
        created_by: userId,
      })
      .select()
      .single()

    if (error) throw error

    // Auto-join the creator as admin
    await supabase
      .from('group_memberships')
      .insert({
        group_id: data.id,
        user_id: userId,
        role: 'admin',
      })

    const newGroup: DreamGroup = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      emoji: getCategoryEmoji(data.category),
      memberCount: 1,
      postCount: 0,
      isJoined: true,
      isPrivate: group.isPrivate,
      category: data.category,
      createdBy: userId,
    }

    return { success: true, group: newGroup }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create group' }
  }
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    lucid: '✨',
    nightmares: '👻',
    recurring: '🔄',
    prophetic: '🔮',
    flying: '🦅',
    interpretation: '🧠',
    general: '🌙',
  }
  return emojis[category] || '🌙'
}

// ============= GIFT SUBSCRIPTION FUNCTIONS =============

export interface GiftPurchase {
  id: string
  senderId: string
  recipientEmail: string
  tier: 'pro' | 'premium'
  duration: '1_month' | '3_months' | '6_months' | '12_months'
  message: string
  scheduledDate?: string
  purchasedAt: string
  redeemed: boolean
  redeemedAt?: string
  giftCode: string
}

export function generateGiftCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'DREAM-'
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function purchaseGiftSubscription(
  senderId: string,
  recipientEmail: string,
  tier: 'pro' | 'premium',
  duration: '1_month' | '3_months' | '6_months' | '12_months',
  message: string,
  scheduledDate?: string
): Promise<{ success: boolean; giftCode?: string; checkoutUrl?: string; error?: string }> {
  try {
    const giftCode = generateGiftCode()
    const durationMap: Record<string, string> = {
      '1_month': 'monthly',
      '3_months': 'monthly',
      '6_months': 'monthly',
      '12_months': 'yearly',
    }

    const { error } = await supabase
      .from('gift_subscriptions')
      .insert({
        purchaser_id: senderId,
        gift_code: giftCode,
        tier,
        duration: durationMap[duration],
        recipient_email: recipientEmail,
        message,
        expires_at: scheduledDate ? new Date(scheduledDate).toISOString() : null,
      })

    if (error) throw error

    // TODO: Send email notification to recipient

    return { success: true, giftCode }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to purchase gift' }
  }
}

export async function redeemGiftCode(
  giftCode: string,
  userId: string
): Promise<{ success: boolean; tier?: string; duration?: string; error?: string }> {
  try {
    // Find the gift code
    const { data: gift, error: findError } = await supabase
      .from('gift_subscriptions')
      .select('*')
      .eq('gift_code', giftCode)
      .eq('redeemed', false)
      .single()

    if (findError || !gift) {
      return { success: false, error: 'Invalid or already redeemed gift code' }
    }

    // Mark as redeemed
    const { error: updateError } = await supabase
      .from('gift_subscriptions')
      .update({
        redeemed: true,
        redeemed_by: userId,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', gift.id)

    if (updateError) throw updateError

    // Update user's subscription tier
    const { error: userError } = await supabase
      .from('users')
      .update({ subscription_tier: gift.tier })
      .eq('id', userId)

    if (userError) throw userError

    return { success: true, tier: gift.tier, duration: gift.duration }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to redeem gift' }
  }
}

// ============= CONTEST FUNCTIONS =============

export interface ContestEntry {
  id: string
  dreamId: string
  userId: string
  username: string
  avatar: string
  dreamTitle: string
  views: number
  likes: number
  enteredAt: string
}

export async function enterContest(
  dreamId: string,
  userId: string,
  username: string,
  dreamTitle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current contest ID (e.g., "2024-01" for January 2024)
    const contestId = new Date().toISOString().slice(0, 7)

    // Check if already entered
    const { data: existing } = await supabase
      .from('contest_entries')
      .select('id')
      .eq('dream_id', dreamId)
      .eq('contest_id', contestId)
      .single()

    if (existing) {
      return { success: false, error: 'This dream is already entered in the contest' }
    }

    const { error } = await supabase
      .from('contest_entries')
      .insert({
        dream_id: dreamId,
        user_id: userId,
        contest_id: contestId,
      })

    if (error) throw error
    // Keep a small audit log for contest entries to help debug issues
    console.info(`[contest] Entry: dreamId=${dreamId} userId=${userId} username=${username} title=${dreamTitle}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to enter contest' }
  }
}

export async function getContestEntries(): Promise<ContestEntry[]> {
  try {
    const contestId = new Date().toISOString().slice(0, 7)

    const { data, error } = await supabase
      .from('contest_entries')
      .select(`
        id,
        dream_id,
        user_id,
        votes,
        submitted_at,
        dreams (text, style),
        users (email)
      `)
      .eq('contest_id', contestId)
      .order('votes', { ascending: false })
      .limit(20)

    if (error) throw error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((e: any) => ({
      id: e.id,
      dreamId: e.dream_id,
      userId: e.user_id,
      username: e.users?.email?.split('@')[0] || 'Dreamer',
      avatar: '🌙',
      dreamTitle: e.dreams?.text?.slice(0, 50) + '...' || 'Untitled Dream',
      views: 0,
      likes: e.votes || 0,
      enteredAt: e.submitted_at,
    }))
  } catch {
    return []
  }
}

export async function voteForEntry(entryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('increment_contest_votes', { entry_id: entryId })
    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to vote' }
  }
}

export async function incrementDreamViews(dreamId: string): Promise<void> {
  try {
    await supabase.rpc('increment_dream_views', { dream_id: dreamId })
  } catch {
    // Silently fail - non-critical operation
  }
}

// ============= COMMENTS FUNCTIONS =============

export interface DreamComment {
  id: string
  dreamId: string
  userId: string
  username: string
  content: string
  createdAt: string
}

export async function addComment(
  dreamId: string,
  userId: string,
  content: string
): Promise<{ success: boolean; comment?: DreamComment; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('dream_comments')
      .insert({
        dream_id: dreamId,
        user_id: userId,
        content,
      })
      .select(`
        id,
        dream_id,
        user_id,
        content,
        created_at,
        users (email)
      `)
      .single()

    if (error) throw error

    return {
      success: true,
      comment: {
        id: data.id,
        dreamId: data.dream_id,
        userId: data.user_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        username: (data.users as any)?.email?.split('@')[0] || 'Dreamer',
        content: data.content,
        createdAt: data.created_at,
      },
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to add comment' }
  }
}

export async function getComments(dreamId: string): Promise<DreamComment[]> {
  try {
    const { data, error } = await supabase
      .from('dream_comments')
      .select(`
        id,
        dream_id,
        user_id,
        content,
        created_at,
        users (email)
      `)
      .eq('dream_id', dreamId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((c: any) => ({
      id: c.id,
      dreamId: c.dream_id,
      userId: c.user_id,
      username: c.users?.email?.split('@')[0] || 'Dreamer',
      content: c.content,
      createdAt: c.created_at,
    }))
  } catch {
    return []
  }
}
