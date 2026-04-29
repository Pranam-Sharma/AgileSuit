'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

export async function joinWaitlistAction(formData: {
  email: string;
  source: string;
  turnstileToken: string;
  userAgent: string;
}) {
  const { email, source, turnstileToken, userAgent } = formData;

  // 1. Validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format' };
  }

  // 2. Turnstile Verification
  try {
    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${encodeURIComponent(TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(turnstileToken)}`,
      }
    );

    const outcome = await verifyResponse.json();
    if (!outcome.success) {
      return { success: false, error: 'Security verification failed. Please try again.' };
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'Failed to verify security challenge.' };
  }

  // 3. Save to Firestore (Waitlist Entry)
  try {
    // Save to waitlist_emails
    await adminDb.collection('waitlist_emails').add({
      email,
      source,
      updated_at: FieldValue.serverTimestamp(),
      userAgent,
      status: 'pending'
    });

    // 4. Trigger Confirmation Email (via mail collection)
    await adminDb.collection('mail').add({
      to: [email],
      message: {
        subject: "You're in — AgileSuit is not what you're expecting",
        html: `
          <div style="font-family: 'Georgia', serif; background-color: #faf5ee; padding: 40px 10px; color: #3a302a; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; text-align: center; background-color: #ffffff; padding: 50px 20px; border-radius: 2px; border: 1px solid #eae2da;">
              <p style="color: #c2652a; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; font-size: 11px; margin-bottom: 40px;">AgileSuit</p>
              
              <h1 style="font-size: 32px; font-weight: normal; margin-bottom: 24px; line-height: 1.2; color: #3a302a;">Hi,<br>You're in — AgileSuit is not what you're expecting</h1>
              
              <div style="text-align: left; margin-bottom: 48px; padding: 0 15px;">
                <p style="font-size: 15px; margin-bottom: 18px; color: #605850;">You're officially on the AgileSuit early access list.</p>
                <p style="font-size: 15px; margin-bottom: 18px; color: #605850;">I wanted to reach out personally because I want to set the right expectation. AgileSuit isn't another Kanban board, and it definitely isn't Jira with a better UI.</p>
                <p style="font-size: 15px; margin-bottom: 18px; color: #605850;">Most tools just track tasks. We built AgileSuit to run the sprint for you. Instead of manual ceremonies and forgotten action items, we've integrated AI into the entire lifecycle—from capacity planning to automated retrospectives. It's designed so your team spends less time on 'process' and more time on shipping code.</p>
                <p style="font-size: 15px; margin-bottom: 18px; color: #605850;">We've already battle-tested this across months of production sprints to ensure it actually solves the friction engineering managers face every day.</p>
                <p style="font-size: 15px; color: #605850;">What's next? We are onboarding users in small batches to maintain a high-quality experience. When your spot is ready, you'll receive an invite to start your first sprint on us.</p>
              </div>

              <h3 style="color: #c2652a; font-size: 16px; margin-bottom: 24px; font-weight: normal; border-bottom: 1px solid #d8d0c8; padding-bottom: 12px; text-align: left; margin-left: 15px; margin-right: 15px;">What makes AgileSuit different</h3>

              <!-- Zero Config Backlogs -->
              <div style="background-color: #f6f0e8; padding: 24px; border-radius: 4px; margin: 0 15px 16px 15px; text-align: left;">
                <div style="color: #c2652a; font-size: 20px; margin-bottom: 8px;">◈</div>
                <strong style="display: block; margin-bottom: 4px; font-size: 16px; color: #3a302a;">Zero Config Backlogs</strong>
                <span style="font-size: 13px; color: #605850;">AI automatically categorizes and prioritizes incoming requests based on your team's historical velocity.</span>
              </div>

              <!-- Two-Column Stackable Grid -->
              <div style="margin: 0 15px;">
                <div style="display: inline-block; width: 100%; max-width: 275px; vertical-align: top; margin-bottom: 16px;">
                  <div style="background-color: #ffffff; padding: 24px; border-radius: 4px; text-align: left; border: 1px solid #eae2da; margin-right: 4px; min-height: 120px;">
                    <div style="color: #c2652a; font-size: 20px; margin-bottom: 8px;">◎</div>
                    <strong style="display: block; margin-bottom: 4px; font-size: 16px; color: #3a302a;">Predictive Roadmapping</strong>
                    <span style="font-size: 13px; color: #605850;">Stop guessing ship dates. Our engine models bottlenecks before they happen.</span>
                  </div>
                </div>
                <div style="display: inline-block; width: 100%; max-width: 275px; vertical-align: top; margin-bottom: 16px;">
                  <div style="background-color: #ffffff; padding: 24px; border-radius: 4px; text-align: left; border: 1px solid #eae2da; margin-left: 4px; min-height: 120px;">
                    <div style="color: #c2652a; font-size: 20px; margin-bottom: 8px;">✨</div>
                    <strong style="display: block; margin-bottom: 4px; font-size: 16px; color: #3a302a;">Semantic Search</strong>
                    <span style="font-size: 13px; color: #605850;">Find that specific comment from six months ago using natural language queries.</span>
                  </div>
                </div>
              </div>

              <div style="margin: 0 15px;">
                <div style="display: inline-block; width: 100%; max-width: 275px; vertical-align: top; margin-bottom: 16px;">
                  <div style="background-color: #f6f0e8; padding: 24px; border-radius: 4px; text-align: left; margin-right: 4px; min-height: 120px;">
                    <div style="color: #c2652a; font-size: 20px; margin-bottom: 8px;">⚡</div>
                    <strong style="display: block; margin-bottom: 4px; font-size: 16px; color: #3a302a;">Lightning Fast Interactions</strong>
                    <span style="font-size: 13px; color: #605850;">Built for speed. Every interaction is local-first and instantaneous.</span>
                  </div>
                </div>
                <div style="display: inline-block; width: 100%; max-width: 275px; vertical-align: top; margin-bottom: 16px;">
                  <div style="background-color: #f6f0e8; padding: 24px; border-radius: 4px; text-align: left; margin-left: 4px; min-height: 120px;">
                    <div style="color: #c2652a; font-size: 20px; margin-bottom: 8px;">⦿</div>
                    <strong style="display: block; margin-bottom: 4px; font-size: 16px; color: #3a302a;">Focus Mode</strong>
                    <span style="font-size: 13px; color: #605850;">A distraction-free view that surfaces only your immediate next task.</span>
                  </div>
                </div>
              </div>

              <div style="margin-top: 48px; padding-top: 40px; border-top: 1px solid #d8d0c8;">
                 <p style="font-style: italic; color: #605850; font-size: 14px; margin-bottom: 32px; padding: 0 30px;">"We are onboarding in small batches to ensure every team has a high-quality experience."</p>
                 <a href="https://www.agilesuit.com" style="background-color: #c2652a; color: #ffffff; padding: 16px 40px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; text-transform: uppercase; letter-spacing: 1.5px;">Check your queue status</a>
              </div>

              <p style="margin-top: 60px; font-size: 11px; color: #9a9088; text-transform: uppercase; letter-spacing: 2px;">AgileSuit</p>
              <p style="font-size: 10px; color: #9a9088; margin-top: 8px;">© ${new Date().getFullYear()} AgileSuit. Crafted for the disciplined minimalist.</p>
            </div>
          </div>
        `,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Waitlist action error:', error);
    return { success: false, error: 'Failed to join waitlist. Please try again.' };
  }
}
