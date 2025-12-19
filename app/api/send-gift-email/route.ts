import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { recipientEmail, giftCode, tier, duration, message, scheduledDate } = await req.json()

        if (!recipientEmail || !giftCode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // If scheduled for later, just return success (would use a queue/cron in production)
        if (scheduledDate && new Date(scheduledDate) > new Date()) {
            console.log(`Gift email scheduled for ${scheduledDate}:`, { recipientEmail, giftCode })
            return NextResponse.json({ success: true, scheduled: true })
        }

        // Build email content
        const tierName = tier === 'pro' ? 'Pro' : 'Premium'
        const durationLabels: Record<string, string> = {
            '1_month': '1 Month',
            '3_months': '3 Months',
            '6_months': '6 Months',
            '12_months': '1 Year'
        }
        const durationLabel = durationLabels[duration as string] || duration

        // In production, use a service like Resend, SendGrid, or Postmark
        // For now, log the email that would be sent
        const emailContent = {
            to: recipientEmail,
            subject: `🎁 You've received a Dream Organizer ${tierName} gift subscription!`,
            html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">🎁 You've Received a Gift!</h1>
          <p>Someone special has gifted you a <strong>${tierName}</strong> subscription to Dream Organizer for <strong>${durationLabel}</strong>!</p>
          ${message ? `<blockquote style="border-left: 4px solid #7c3aed; padding-left: 16px; margin: 20px 0; font-style: italic;">"${message}"</blockquote>` : ''}
          <div style="background: linear-gradient(135deg, #7c3aed20, #06b6d420); padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; color: #666;">Your Gift Code</p>
            <p style="font-size: 28px; font-weight: bold; color: #7c3aed; font-family: monospace; letter-spacing: 2px; margin: 0;">${giftCode}</p>
          </div>
          <p>To redeem your gift:</p>
          <ol>
            <li>Go to <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dreamorganizer.app'}/settings" style="color: #7c3aed;">Dream Organizer Settings</a></li>
            <li>Click "Redeem Gift Code"</li>
            <li>Enter your code: <strong>${giftCode}</strong></li>
          </ol>
          <p style="color: #666; font-size: 14px;">This gift code never expires. Enjoy turning your dreams into beautiful comics!</p>
        </div>
      `
        }

        console.log('Gift email would be sent:', emailContent)

        // Check if we have email service configured
        if (process.env.RESEND_API_KEY) {
            // Use Resend to send email
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || 'Dream Organizer <noreply@dreamorganizer.app>',
                    to: recipientEmail,
                    subject: emailContent.subject,
                    html: emailContent.html
                })
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('Resend error:', error)
                // Don't fail - email is best effort
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Send gift email error:', error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
}
