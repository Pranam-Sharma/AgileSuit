
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
            <div style="font-family: 'Georgia', serif; background-color: #faf5ee; padding: 40px 10px; color: #3a302a; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; text-align: center; background-color: #ffffff; padding: 40px 20px; border-radius: 24px; border: 1px solid #eae2da;">
                <p style="color: #c2652a; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; font-size: 11px; margin-bottom: 30px;">AgileSuit</p>
                
                <h1 style="font-size: 28px; font-weight: normal; margin-bottom: 24px; line-height: 1.2; color: #3a302a;">Hi,<br>You're in — AgileSuit is not what you're expecting</h1>
                
                <div style="text-align: left; margin-bottom: 40px; padding: 0 10px;">
                  <p style="font-size: 15px; margin-bottom: 16px;">You're officially on the AgileSuit early access list.</p>
                  <p style="font-size: 15px; margin-bottom: 16px;">I wanted to reach out personally because I want to set the right expectation. AgileSuit isn't another Kanban board, and it definitely isn't Jira with a better UI.</p>
                  <p style="font-size: 15px; margin-bottom: 16px;">Most tools just track tasks. We built AgileSuit to run the sprint for you. Instead of manual ceremonies, we've integrated AI into the entire lifecycle. It's designed so your team spends less time on 'process' and more time on shipping code.</p>
                  <p style="font-size: 15px;">Welcome to the future of the sprint.</p>
                </div>

                <h3 style="color: #c2652a; font-size: 16px; margin-bottom: 24px; font-weight: normal; border-bottom: 1px solid #d8d0c8; padding-bottom: 10px; text-align: left; margin-left: 10px; margin-right: 10px;">What makes AgileSuit different</h3>

                <!-- Feature 1 -->
                <div style="background-color: #f6f0e8; padding: 20px; border-radius: 16px; margin: 0 10px 16px 10px; text-align: left; border: 1px solid #eae2da;">
                  <div style="font-size: 20px; margin-bottom: 8px;">🔄</div>
                  <strong style="display: block; margin-bottom: 4px; font-size: 16px;">Zero Config Backlogs</strong>
                  <span style="font-size: 13px; color: #605850;">AI automatically categorizes and prioritizes incoming requests based on historical velocity.</span>
                </div>

                <!-- Stacking Cards Container -->
                <div style="margin: 0 10px;">
                  <div style="background-color: #ffffff; padding: 20px; border-radius: 16px; margin-bottom: 16px; text-align: left; border: 1px solid #eae2da;">
                    <div style="font-size: 20px; margin-bottom: 8px;">🧭</div>
                    <strong style="display: block; margin-bottom: 4px; font-size: 16px;">Predictive Roadmapping</strong>
                    <span style="font-size: 13px; color: #605850;">Stop guessing ship dates. Our engine models bottlenecks before they happen.</span>
                  </div>
                  
                  <div style="background-color: #ffffff; padding: 20px; border-radius: 16px; margin-bottom: 16px; text-align: left; border: 1px solid #eae2da;">
                    <div style="font-size: 20px; margin-bottom: 8px;">🔍</div>
                    <strong style="display: block; margin-bottom: 4px; font-size: 16px;">Semantic Search</strong>
                    <span style="font-size: 13px; color: #605850;">Find that specific comment from months ago using natural language queries.</span>
                  </div>

                  <div style="background-color: #f6f0e8; padding: 20px; border-radius: 16px; margin-bottom: 16px; text-align: left; border: 1px solid #eae2da;">
                    <div style="font-size: 20px; margin-bottom: 8px;">⚡</div>
                    <strong style="display: block; margin-bottom: 4px; font-size: 16px;">Lightning Fast</strong>
                    <span style="font-size: 13px; color: #605850;">Built for speed. Every interaction is local-first and instantaneous.</span>
                  </div>

                  <div style="background-color: #f6f0e8; padding: 20px; border-radius: 16px; margin-bottom: 16px; text-align: left; border: 1px solid #eae2da;">
                    <div style="font-size: 20px; margin-bottom: 8px;">🎯</div>
                    <strong style="display: block; margin-bottom: 4px; font-size: 16px;">Focus Mode</strong>
                    <span style="font-size: 13px; color: #605850;">A distraction-free view that surfaces only your immediate next task.</span>
                  </div>
                </div>

                <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #d8d0c8;">
                   <p style="font-style: italic; color: #605850; font-size: 13px; margin-bottom: 24px; padding: 0 20px;">"We are onboarding in small batches to ensure every team has a high-quality experience."</p>
                   <a href="https://agilesuit.com" style="background-color: #c2652a; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">Check your queue status</a>
                </div>

                <p style="margin-top: 50px; font-size: 11px; color: #9a9088; text-transform: uppercase; letter-spacing: 1px;">AgileSuit</p>
                <p style="font-size: 10px; color: #9a9088; margin-top: 8px;">© ${new Date().getFullYear()} AgileSuit. Crafted for the disciplined minimalist.</p>
              </div>
            </div>
          `,
        },
      });
      console.log('Waitlist Service: Responsive Stitch mail document created successfully');
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
