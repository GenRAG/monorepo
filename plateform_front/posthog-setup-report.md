<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the GenRAG platform frontend. `posthog-js` and `@posthog/react` were installed. PostHog is initialized in `src/index.tsx` and the entire app is wrapped with `PostHogProvider`. Ten business events are now captured across auth, agent lifecycle, workflow, document upload, and playground flows. Users are identified (via `posthog.identify`) on login using their server-side user ID, and their identity is reset on logout with `posthog.reset()`.

| Event | Description | File |
|-------|-------------|------|
| `user_signed_up` | User successfully created a new account. | `src/pages/Auth/Register/CreateAccountForm.tsx` |
| `user_logged_in` | User successfully logged in with email and password. | `src/pages/Auth/Login/PasswordForm.tsx` |
| `user_logged_out` | User clicked the logout button and was signed out. | `src/app/Navigation/SidebarFooter.tsx` |
| `agent_created` | User created a new RAG agent, optionally from a template. | `src/components/Agents/CreateAgentModal.tsx` |
| `agent_deleted` | User permanently deleted an agent and all associated data. | `src/components/Agents/DeleteAgentModal.tsx` |
| `agent_deployed` | User deployed an agent to production. | `src/components/Deployment/DeployModal.tsx` |
| `agent_stopped` | User stopped a production agent and reverted it to development. | `src/components/Deployment/DashboardTab/HeaderCard/HeaderCard.tsx` |
| `workflow_saved` | User saved the agent workflow configuration. | `src/pages/Agents/Workflow/index.tsx` |
| `document_uploaded` | User successfully uploaded a document to an agent for indexing. | `src/hooks/useUploadDocuments.ts` |
| `rag_query_sent` | User sent a query to the agent in the playground. | `src/pages/Agents/Chat/index.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/210079/dashboard/775234)
- [New signups over time](https://eu.posthog.com/project/210079/insights/6JKy5KZg)
- [Agent lifecycle events](https://eu.posthog.com/project/210079/insights/P8ClOFFU)
- [Document uploads over time](https://eu.posthog.com/project/210079/insights/y0uyQ31D)
- [Playground usage over time](https://eu.posthog.com/project/210079/insights/rwUjY84P)
- [Signup to deployment funnel](https://eu.posthog.com/project/210079/insights/YDIDcrm7)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `REACT_APP_PUBLIC_POSTHOG_KEY` and `REACT_APP_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
