
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Service to handle waitlist logic and trigger automated emails
 * via the Firebase Trigger Email extension.
 */
export const joinWaitlist = async (email: string, source: string = 'landing_page') => {
  if (!email) throw new Error("Email is required");

  try {
    // --- Step 1: Save waitlist entry ---
    // Requirement: DO NOT remove or change existing waitlist_emails logic.
    const waitlistRef = collection(db, 'waitlist_emails');
    await addDoc(waitlistRef, {
      email: email,
      source: source,
      updated_at: serverTimestamp(),
    });

    // --- Step 2: Trigger confirmation email ---
    // Requirement: Happens only after Step 1 succeeds (sequential).
    try {
      const mailRef = collection(db, 'mail');
      await addDoc(mailRef, {
        to: [email],
        message: {
          subject: "You're in — AgileSuit is not what you're expecting",
          html: `
            <div style="font-family: 'Georgia', serif; background-color: #faf5ee; padding: 60px 20px; color: #3a302a; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                <p style="color: #c2652a; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; font-size: 12px; margin-bottom: 40px;">AgileSuit</p>
                
                <h1 style="font-size: 32px; font-weight: normal; margin-bottom: 24px; line-height: 1.2;">Hi,<br>You're in — AgileSuit is not what you're expecting</h1>
                
                <div style="text-align: left; margin-bottom: 48px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">You're officially on the AgileSuit early access list.</p>
                  <p style="font-size: 16px; margin-bottom: 20px;">I wanted to reach out personally because I want to set the right expectation. AgileSuit isn't another Kanban board, and it definitely isn't Jira with a better UI.</p>
                  <p style="font-size: 16px; margin-bottom: 20px;">Most tools just track tasks. We built AgileSuit to run the sprint for you. Instead of manual ceremonies and forgotten action items, we've integrated AI into the entire lifecycle—from capacity planning to automated retrospectives. It's designed so your team spends less time on 'process' and more time on shipping code.</p>
                  <p style="font-size: 16px; margin-bottom: 20px;">What's next? We are onboarding users in small batches to maintain a high-quality experience. When your spot is ready, you'll receive an invite to start your first sprint on us (no credit card required, no sales calls).</p>
                  <p style="font-size: 16px;">Welcome to the future of the sprint.</p>
                </div>

                <h3 style="color: #c2652a; font-size: 18px; margin-bottom: 32px; font-weight: normal; border-bottom: 1px solid #d8d0c8; padding-bottom: 12px; text-align: left;">What makes AgileSuit different</h3>

                <div style="background-color: #f6f0e8; padding: 24px; border-radius: 12px; margin-bottom: 16px; text-align: left;">
                  <strong style="display: block; margin-bottom: 4px;">Zero Config Backlogs</strong>
                  <span style="font-size: 14px; color: #605850;">AI automatically categorizes and prioritizes incoming requests based on your team's historical velocity.</span>
                </div>

                <div style="display: table; width: 100%; border-spacing: 0; margin-bottom: 16px;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; width: 50%; padding-right: 8px;">
                      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; text-align: left; border: 1px solid #eae2da; height: 100px;">
                        <strong style="display: block; margin-bottom: 4px;">Predictive Roadmapping</strong>
                        <span style="font-size: 14px; color: #605850;">Stop guessing ship dates. Our engine models bottlenecks before they happen.</span>
                      </div>
                    </div>
                    <div style="display: table-cell; width: 50%; padding-left: 8px;">
                      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; text-align: left; border: 1px solid #eae2da; height: 100px;">
                        <strong style="display: block; margin-bottom: 4px;">Semantic Search</strong>
                        <span style="font-size: 14px; color: #605850;">Find that specific comment from six months ago using natural language queries.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style="display: table; width: 100%; border-spacing: 0; margin-bottom: 40px;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; width: 50%; padding-right: 8px;">
                      <div style="background-color: #f6f0e8; padding: 24px; border-radius: 12px; text-align: left; height: 100px;">
                        <strong style="display: block; margin-bottom: 4px;">Lightning Fast</strong>
                        <span style="font-size: 14px; color: #605850;">Built for speed. Every interaction is local-first and instantaneous.</span>
                      </div>
                    </div>
                    <div style="display: table-cell; width: 50%; padding-left: 8px;">
                      <div style="background-color: #f6f0e8; padding: 24px; border-radius: 12px; text-align: left; height: 100px;">
                        <strong style="display: block; margin-bottom: 4px;">Focus Mode</strong>
                        <span style="font-size: 14px; color: #605850;">A distraction-free view that surfaces only your immediate next task.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style="margin-top: 40px; border-top: 1px solid #d8d0c8; padding-top: 40px;">
                   <p style="font-style: italic; color: #605850; font-size: 14px; margin-bottom: 24px;">"We are onboarding in small batches to ensure every team has a high-quality experience."</p>
                   <a href="https://agilesuit.com" style="background-color: #c2652a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">Check your queue status</a>
                </div>

                <p style="margin-top: 60px; font-size: 12px; color: #9a9088; text-transform: uppercase; letter-spacing: 1px;">AgileSuit</p>
                <p style="font-size: 10px; color: #9a9088; margin-top: 8px;">© ${new Date().getFullYear()} AgileSuit. Crafted for the disciplined minimalist.</p>
              </div>
            </div>
          `,
        },
      });
      console.log('Waitlist Service: Stitch-inspired mail document created successfully');
    } catch (emailError) {
      // Requirement: If email trigger fails, log error but do not break the flow.
      console.error('Waitlist Service: Email trigger failed but entry was saved:', emailError);
    }

    return { success: true };
  } catch (error: any) {
    // Requirement: If waitlist save fails, do not send email.
    console.error('Waitlist Service: Failed to save entry:', error);
    throw new Error(error.message || 'Failed to join waitlist. Please try again.');
  }
};
