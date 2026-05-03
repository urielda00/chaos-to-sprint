import type { ExecutionPlan } from './types'

export const demoTranscript = `Zoom Transcript - Product Sprint Sync

Maya (Product Lead): Thanks everyone. We need to decide what goes into this sprint. The biggest complaint from users is still that they sometimes get logged out while booking a lab room.

Daniel (Frontend): I checked the booking page yesterday. The UI state looks okay, but after refresh the user object sometimes comes back empty. I am not sure if it is frontend auth state or the token endpoint.

Maya: The login issue should come before the calendar redesign. If users cannot stay logged in, the redesign does not matter.

Eli (Backend): I can look at the token refresh endpoint, but I am busy with deployment today. Someone should check the backend logs too.

Maya: Let's have Noa check backend logs tomorrow morning. She knows the auth service better than anyone, even though she is not here today.

Daniel: I can add a quick frontend check and see if the user refresh request returns 401 or just malformed data.

Maya: Good. Daniel, please verify the frontend auth flow by tomorrow. Eli, check whether the refresh endpoint changed after the last deploy. Noa should inspect backend logs around token refresh failures.

Eli: One risk is that we do not have enough logs around the auth middleware. If that is the case, we may need temporary debug logs.

Maya: Agreed. Also, Amir needs to confirm whether mobile support is part of the dashboard redesign this sprint. I do not want us to start UI work before that is clear.

Daniel: So the plan is auth bug first, dashboard later?

Maya: Yes. Auth bug first. Dashboard redesign only after Amir confirms scope. Let's send a short team update after this meeting.`

export const demoContext = `Team context: Maya is Product Lead, Daniel is Frontend Developer, Eli is Backend Developer, Noa is Backend/Auth Developer, Amir is Product Designer. Project: Lab room booking platform with authentication, room calendar, and dashboard redesign work.`

export const demoPlan: ExecutionPlan = {
  summary:
    'The team agreed to prioritize the authentication logout issue before starting the dashboard redesign. Daniel will validate the frontend auth flow, Eli will check whether the refresh endpoint changed after the last deployment, and Noa should inspect backend logs around token refresh failures. Dashboard redesign work is blocked until Amir confirms whether mobile support is included in the sprint scope.',
  decisions: [
    {
      decision: 'Prioritize the authentication bug before the dashboard redesign.',
      reason:
        'The team agreed that users staying logged in is more important than redesign work.',
      evidence:
        'Maya: The login issue should come before the calendar redesign. If users cannot stay logged in, the redesign does not matter.',
      confidence: 'High',
    },
    {
      decision: 'Delay dashboard redesign work until the scope is confirmed.',
      reason:
        'Mobile support may affect the dashboard redesign scope, so UI work should not start yet.',
      evidence:
        'Maya: Dashboard redesign only after Amir confirms scope.',
      confidence: 'High',
    },
  ],
  action_items: [
    {
      task: 'Verify the frontend authentication refresh flow.',
      owner: 'Daniel',
      priority: 'High',
      due: 'Tomorrow',
      status: 'Open',
      evidence:
        'Maya: Daniel, please verify the frontend auth flow by tomorrow.',
      confidence: 'High',
    },
    {
      task: 'Check whether the refresh endpoint changed after the last deployment.',
      owner: 'Eli',
      priority: 'High',
      due: 'Not specified',
      status: 'Open',
      evidence:
        'Maya: Eli, check whether the refresh endpoint changed after the last deploy.',
      confidence: 'High',
    },
    {
      task: 'Inspect backend logs around token refresh failures.',
      owner: 'Noa',
      priority: 'High',
      due: 'Tomorrow morning',
      status: 'Open',
      evidence:
        'Maya: Let’s have Noa check backend logs tomorrow morning.',
      confidence: 'High',
    },
    {
      task: 'Confirm whether mobile support is part of the dashboard redesign scope.',
      owner: 'Amir',
      priority: 'Medium',
      due: 'Not specified',
      status: 'Open',
      evidence:
        'Maya: Amir needs to confirm whether mobile support is part of the dashboard redesign this sprint.',
      confidence: 'High',
    },
  ],
  people: [
    {
      name: 'Maya',
      role: 'Product Lead',
      mentioned_task: 'Set sprint priority and clarified blockers.',
      spoke_in_meeting: true,
      needs_follow_up: false,
    },
    {
      name: 'Daniel',
      role: 'Frontend Developer',
      mentioned_task: 'Verify frontend auth refresh behavior.',
      spoke_in_meeting: true,
      needs_follow_up: true,
    },
    {
      name: 'Eli',
      role: 'Backend Developer',
      mentioned_task: 'Check the token refresh endpoint after deployment.',
      spoke_in_meeting: true,
      needs_follow_up: true,
    },
    {
      name: 'Noa',
      role: 'Backend/Auth Developer',
      mentioned_task: 'Inspect backend logs around token refresh failures.',
      spoke_in_meeting: false,
      needs_follow_up: true,
    },
    {
      name: 'Amir',
      role: 'Product Designer',
      mentioned_task: 'Confirm dashboard redesign scope and mobile support.',
      spoke_in_meeting: false,
      needs_follow_up: true,
    },
  ],
  risks: [
    {
      risk: 'Insufficient backend logs around auth middleware.',
      impact:
        'The team may not have enough information to identify the cause of token refresh failures.',
      mitigation:
        'Add temporary debug logs if existing logs are not enough.',
      evidence:
        'Eli: One risk is that we do not have enough logs around the auth middleware.',
    },
    {
      risk: 'Dashboard redesign scope is unclear.',
      impact:
        'Starting UI work too early may cause rework if mobile support is included.',
      mitigation:
        'Wait for Amir to confirm the scope before starting redesign implementation.',
      evidence:
        'Maya: I do not want us to start UI work before that is clear.',
    },
  ],
  open_questions: [
    {
      question: 'Is mobile support part of the dashboard redesign this sprint?',
      why_it_matters:
        'This determines whether the dashboard redesign requires responsive/mobile-specific work.',
      suggested_owner: 'Amir',
    },
    {
      question: 'Are token refresh failures caused by frontend state, 401 responses, or malformed backend data?',
      why_it_matters:
        'The root cause determines whether the fix belongs mostly in frontend auth handling or backend token refresh logic.',
      suggested_owner: 'Daniel / Eli',
    },
  ],
  github_issues: [
    {
      title: 'Investigate and fix user logout during lab room booking',
      description:
        'Users sometimes get logged out while booking a lab room. Investigate whether the issue comes from frontend auth state, token refresh responses, or backend endpoint changes after deployment.',
      acceptance_criteria: [
        'Frontend verifies whether refresh requests return 401 or malformed user data.',
        'Backend checks whether the token refresh endpoint changed after the last deployment.',
        'Backend logs around token refresh failures are reviewed.',
        'Root cause is documented before implementation.',
      ],
      priority: 'High',
      labels: ['bug', 'auth', 'frontend', 'backend'],
    },
    {
      title: 'Improve temporary diagnostics for auth middleware',
      description:
        'If existing logs are insufficient, add temporary debug logging around auth middleware and token refresh failures.',
      acceptance_criteria: [
        'Relevant auth middleware events are logged safely.',
        'Logs do not expose tokens, secrets, or sensitive user data.',
        'Temporary logs can be removed or reduced after the incident is resolved.',
      ],
      priority: 'Medium',
      labels: ['backend', 'logging', 'investigation'],
    },
    {
      title: 'Confirm dashboard redesign sprint scope',
      description:
        'Clarify whether mobile support is included in the dashboard redesign before starting UI implementation.',
      acceptance_criteria: [
        'Amir confirms whether mobile support is in scope.',
        'Dashboard redesign scope is documented.',
        'Frontend work does not begin before scope confirmation.',
      ],
      priority: 'Medium',
      labels: ['product', 'design', 'scope'],
    },
  ],
  team_update:
    'Auth stability is the top sprint priority. Daniel will verify the frontend auth flow, Eli will check the refresh endpoint after the latest deployment, and Noa should inspect backend logs around token refresh failures. Dashboard redesign work is paused until Amir confirms whether mobile support is included in scope.',
  next_best_step:
    'Start with Daniel validating the frontend refresh behavior and Eli checking the refresh endpoint changes, then compare findings with Noa’s backend log review.',
}