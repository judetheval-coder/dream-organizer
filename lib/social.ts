"use client"

import { supabase } from './supabase'

// ============= SHARE FUNCTIONS =============

export type SharePlatform = 'twitter' | 'facebook' | 'pinterest' | 'copy' | 'download'

export interface ShareOptions {
  title: string
  description: string
  imageUrl?: string
  url?: string
}

export async function shareDream(platform: SharePlatform, options: ShareOptions): Promise<boolean> {
  const { title, description, imageUrl, url = window.location.href } = options
  const text = `${title}\n\n${description}`

  switch (platform) {
    case 'twitter':
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        '_blank',
        'width=600,height=400'
      )
      return true

    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
        '_blank',
        'width=600,height=400'
      )
      return true

    case 'pinterest':
      if (imageUrl) {
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(text)}`,
          '_blank',
          'width=600,height=400'
        )
        return true
      }
      return false

    case 'copy':
      try {
        await navigator.clipboard.writeText(`${text}\n\n${url}`)
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
  reactions: { like: number; wow: number; scary: number; funny: number }
  comments: number
  isFollowing?: boolean
  isPublic?: boolean
}

export async function publishDreamToGallery(dreamId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('dreams')
      .update({ is_public: true })
      .eq('id', dreamId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to publish dream' }
  }
}

export async function unpublishDreamFromGallery(dreamId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('dreams')
      .update({ is_public: false })
      .eq('id', dreamId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to unpublish dream' }
  }
}

export async function fetchPublicDreams(): Promise<PublicDream[]> {
  try {
    const { data, error } = await supabase
      .from('dreams')
      .select(`
        id,
        user_id,
        text,
        style,
        mood,
        created_at,
        panels (id, description, image_url),
        users (id, email)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      username: d.users?.[0]?.email?.split('@')[0] || d.users?.email?.split('@')[0] || 'Dreamer',
      avatar: '🌙',
      dreamText: d.text,
      panels: d.panels?.map((p: { id: string; description: string; image_url: string }) => ({
        id: p.id,
        imageUrl: p.image_url,
        description: p.description,
      })) || [],
      style: d.style,
      mood: d.mood,
      createdAt: d.created_at,
      reactions: { like: 0, wow: 0, scary: 0, funny: 0 },
      comments: 0,
      isPublic: true,
    }))
  } catch {
    return []
  }
}

// ============= REACTION FUNCTIONS =============

export async function reactToDream(
  dreamId: string, 
  userId: string, 
  reaction: 'like' | 'wow' | 'scary' | 'funny'
): Promise<{ success: boolean; error?: string }> {
  try {
    // For now, store in local storage since we don't have a reactions table
    const key = `dream-reactions-${dreamId}`
    const existing = JSON.parse(localStorage.getItem(key) || '{}')
    
    if (existing[userId] === reaction) {
      // Remove reaction
      delete existing[userId]
    } else {
      // Add/change reaction
      existing[userId] = reaction
    }
    
    localStorage.setItem(key, JSON.stringify(existing))
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to react' }
  }
}

// ============= FOLLOW FUNCTIONS =============

export async function followUser(
  followerId: string, 
  followingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Store in local storage for now
    const key = `following-${followerId}`
    const following = JSON.parse(localStorage.getItem(key) || '[]')
    
    if (!following.includes(followingId)) {
      following.push(followingId)
      localStorage.setItem(key, JSON.stringify(following))
    }
    
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
    const key = `following-${followerId}`
    const following = JSON.parse(localStorage.getItem(key) || '[]')
    
    const index = following.indexOf(followingId)
    if (index > -1) {
      following.splice(index, 1)
      localStorage.setItem(key, JSON.stringify(following))
    }
    
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to unfollow' }
  }
}

export function getFollowing(userId: string): string[] {
  try {
    const key = `following-${userId}`
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
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

export function joinGroup(groupId: string, userId: string): { success: boolean } {
  try {
    const key = `groups-joined-${userId}`
    const joined = JSON.parse(localStorage.getItem(key) || '[]')
    
    if (!joined.includes(groupId)) {
      joined.push(groupId)
      localStorage.setItem(key, JSON.stringify(joined))
    }
    
    return { success: true }
  } catch {
    return { success: false }
  }
}

export function leaveGroup(groupId: string, userId: string): { success: boolean } {
  try {
    const key = `groups-joined-${userId}`
    const joined = JSON.parse(localStorage.getItem(key) || '[]')
    
    const index = joined.indexOf(groupId)
    if (index > -1) {
      joined.splice(index, 1)
      localStorage.setItem(key, JSON.stringify(joined))
    }
    
    return { success: true }
  } catch {
    return { success: false }
  }
}

export function getJoinedGroups(userId: string): string[] {
  try {
    const key = `groups-joined-${userId}`
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export function createGroup(group: Omit<DreamGroup, 'id' | 'memberCount' | 'postCount' | 'isJoined'>, userId: string): DreamGroup {
  const newGroup: DreamGroup = {
    ...group,
    id: `group-${Date.now()}`,
    memberCount: 1,
    postCount: 0,
    isJoined: true,
    createdBy: userId,
  }
  
  // Store in local storage
  const key = 'dream-groups-custom'
  const groups = JSON.parse(localStorage.getItem(key) || '[]')
  groups.push(newGroup)
  localStorage.setItem(key, JSON.stringify(groups))
  
  // Auto-join creator
  joinGroup(newGroup.id, userId)
  
  return newGroup
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
    // In production, this would create a Stripe checkout session
    // For now, we'll simulate the purchase
    const giftCode = generateGiftCode()
    
    const purchase: GiftPurchase = {
      id: `gift-${Date.now()}`,
      senderId,
      recipientEmail,
      tier,
      duration,
      message,
      scheduledDate,
      purchasedAt: new Date().toISOString(),
      redeemed: false,
      giftCode,
    }
    
    // Store gift in local storage (in production, this would be in the database)
    const key = 'gift-purchases'
    const purchases = JSON.parse(localStorage.getItem(key) || '[]')
    purchases.push(purchase)
    localStorage.setItem(key, JSON.stringify(purchases))
    
    // In production, send email to recipient
    console.log(`Gift email would be sent to ${recipientEmail} with code ${giftCode}`)
    
    return { success: true, giftCode }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to purchase gift' }
  }
}

export function redeemGiftCode(giftCode: string, userId: string): { success: boolean; tier?: string; duration?: string; error?: string } {
  try {
    const key = 'gift-purchases'
    const purchases: GiftPurchase[] = JSON.parse(localStorage.getItem(key) || '[]')
    
    const giftIndex = purchases.findIndex(p => p.giftCode === giftCode && !p.redeemed)
    
    if (giftIndex === -1) {
      return { success: false, error: 'Invalid or already redeemed gift code' }
    }
    
    purchases[giftIndex].redeemed = true
    purchases[giftIndex].redeemedAt = new Date().toISOString()
    localStorage.setItem(key, JSON.stringify(purchases))
    
    const gift = purchases[giftIndex]
    
    // In production, this would update the user's subscription in the database
    console.log(`User ${userId} redeemed ${gift.tier} for ${gift.duration}`)
    
    return { success: true, tier: gift.tier, duration: gift.duration }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to redeem gift' }
  }
}

// ============= CONTEST FUNCTIONS =============

export interface ContestEntry {
  dreamId: string
  userId: string
  username: string
  avatar: string
  dreamTitle: string
  views: number
  likes: number
  enteredAt: string
}

export function enterContest(dreamId: string, userId: string, username: string, dreamTitle: string): { success: boolean; error?: string } {
  try {
    const key = `contest-${new Date().toISOString().slice(0, 7)}` // Current month
    const entries: ContestEntry[] = JSON.parse(localStorage.getItem(key) || '[]')
    
    // Check if already entered
    if (entries.some(e => e.dreamId === dreamId)) {
      return { success: false, error: 'This dream is already entered in the contest' }
    }
    
    entries.push({
      dreamId,
      userId,
      username,
      avatar: '🌙',
      dreamTitle,
      views: 0,
      likes: 0,
      enteredAt: new Date().toISOString(),
    })
    
    localStorage.setItem(key, JSON.stringify(entries))
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to enter contest' }
  }
}

export function getContestEntries(): ContestEntry[] {
  try {
    const key = `contest-${new Date().toISOString().slice(0, 7)}`
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export function incrementDreamViews(dreamId: string): void {
  try {
    const key = `contest-${new Date().toISOString().slice(0, 7)}`
    const entries: ContestEntry[] = JSON.parse(localStorage.getItem(key) || '[]')
    
    const entry = entries.find(e => e.dreamId === dreamId)
    if (entry) {
      entry.views++
      localStorage.setItem(key, JSON.stringify(entries))
    }
  } catch {
    // Ignore errors
  }
}
