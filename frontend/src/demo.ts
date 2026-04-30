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
