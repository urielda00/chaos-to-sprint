import React, { useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  Loader2,
  LockKeyhole,
  Moon,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Zap,
} from 'lucide-react'
import type { ExecutionPlan, GithubIssue, Priority, Confidence } from './types'
import { demoContext, demoTranscript } from './demo'
import './styles.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
let hasWarmedUpApi = false

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function PriorityBadge({ value }: { value: Priority }) {
  const style = {
    High: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-rose-500/25',
    Medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/25',
    Low: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25',
  }[value]

  return <span className={classNames('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', style)}>{value}</span>
}

function ConfidenceBadge({ value }: { value: Confidence }) {
  const style = {
    High: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 ring-indigo-500/25',
    Medium: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-sky-500/25',
    Low: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 ring-zinc-500/25',
  }[value]

  return <span className={classNames('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', style)}>{value}</span>
}

function Card({
  title,
  icon,
  children,
  className,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={classNames(
        'rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/55',
        className
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        {icon && (
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
            {icon}
          </div>
        )}
        <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
    >
      {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
      {copied ? 'Copied' : label}
    </button>
  )
}

function formatIssue(issue: GithubIssue) {
  return `Title: ${issue.title}

Description:
${issue.description}

Acceptance Criteria:
${issue.acceptance_criteria.map((item) => `- ${item}`).join('\n')}

Priority: ${issue.priority}
Labels: ${issue.labels.join(', ')}`
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm font-semibold text-zinc-500 dark:border-white/15 dark:text-zinc-400">
      {text}
    </div>
  )
}

function App() {
  const [dark, setDark] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [context, setContext] = useState('')
  const [plan, setPlan] = useState<ExecutionPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDemoNotice, setShowDemoNotice] = useState(() => {
  return localStorage.getItem('chaos-to-sprint-demo-notice-seen') !== 'true'
})

useEffect(() => {
  if (hasWarmedUpApi) return

  hasWarmedUpApi = true

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 10000)

  fetch(`${API_BASE_URL}/api/health`, {
    method: 'GET',
    signal: controller.signal,
  }).catch(() => {
    // Silent warm-up only. Do not show an error to the user.
  }).finally(() => {
    window.clearTimeout(timeoutId)
  })
}, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const canAnalyze = transcript.trim().length >= 80 && !loading

  async function analyze() {
    setLoading(true)
    setError('')
    setPlan(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, context }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Analysis failed')
      }

      setPlan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function resetAll() {
    setTranscript('')
    setContext('')
    setPlan(null)
    setError('')
    setLoading(false)
  }
  function closeDemoNotice() {
  localStorage.setItem('chaos-to-sprint-demo-notice-seen', 'true')
  setShowDemoNotice(false)
}

  const actionItemsCount = plan?.action_items.length ?? 0
  const peopleCount = plan?.people.length ?? 0
  const risksCount = plan?.risks.length ?? 0

  const progressText = useMemo(() => {
    if (!loading) return ''
    return 'Screening the transcript, analyzing it with OpenAI in real time, extracting owners, and building sprint-ready output...'
  }, [loading])

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#c7d2fe,_transparent_34%),linear-gradient(135deg,_#f8fafc,_#eef2ff_45%,_#fdf2f8)] text-zinc-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_32%),linear-gradient(135deg,_#050505,_#111827_45%,_#18181b)] dark:text-white">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-[0.28] dark:opacity-[0.17]" />
      {showDemoNotice && (
  <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-white p-6 shadow-2xl dark:bg-zinc-950">
      <div className="mb-4 inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
        Demo Notice
      </div>

      <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
        This demo uses a cost-efficient AI model
      </h2>

      <p className="mt-3 leading-7 text-zinc-700 dark:text-zinc-300">
        To keep the live demo lightweight and affordable, Chaos to Sprint uses a cost-efficient OpenAI model. Analysis is generated in real time, so creating the execution plan may take a few seconds.
      </p>

      <div className="mt-6 flex justify-end">
        <button
          onClick={closeDemoNotice}
          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-indigo-500"
        >
          Got it
        </button>
      </div>
    </div>
  </div>
)}

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <nav className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white shadow-glow dark:bg-white dark:text-zinc-950">
              <Sparkles size={23} />
            </div>

            <div>
              <p className="font-black tracking-tight">Chaos to Sprint</p>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Secure AI execution planner</p>
            </div>
          </div>

          <button
            onClick={() => setDark((value) => !value)}
            className="rounded-2xl border border-zinc-200 bg-white/80 p-3 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>

        <section className="mb-14 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-bold text-indigo-700 dark:text-indigo-200">
              <Zap size={16} /> Live OpenAI integration for messy team transcripts
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-zinc-950 dark:text-white sm:text-7xl">
              Turn meeting chaos into a sprint-ready plan.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700 dark:text-zinc-300">
              Paste a Zoom, Meet, Teams, or Otter transcript. The system validates the request, analyzes it with OpenAI in real time, and returns decisions, owners, risks, GitHub issues, and a team update your team can actually use.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="rounded-full bg-white/75 px-4 py-2 ring-1 ring-zinc-200 dark:bg-white/5 dark:ring-white/10">Live OpenAI API</span>
              <span className="rounded-full bg-white/75 px-4 py-2 ring-1 ring-zinc-200 dark:bg-white/5 dark:ring-white/10">Real-time analysis</span>
              <span className="rounded-full bg-white/75 px-4 py-2 ring-1 ring-zinc-200 dark:bg-white/5 dark:ring-white/10">Moderation + validation</span>
              <span className="rounded-full bg-white/75 px-4 py-2 ring-1 ring-zinc-200 dark:bg-white/5 dark:ring-white/10">Evidence-based output</span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/40 bg-white/65 p-5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
            <div className="rounded-[1.5rem] bg-zinc-950 p-5 text-white dark:bg-black/60">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-300">Live AI Pipeline</span>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">OpenAI Powered</span>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  'Paste or load meeting transcript',
                  'Validate request on secure backend',
                  'Screen unsafe or malicious content',
                  'Analyze with OpenAI in real time',
                  'Generate execution dashboard',
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 font-black">{index + 1}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {!plan && (
          <section className="mb-8">
            <Card title="Input" icon={<Play size={20} />}>
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
                  <div className="mb-1 flex items-center gap-2 font-black">
                    <ShieldCheck size={18} /> Secure live AI analysis
                  </div>
                  Your transcript is validated on the backend, screened for unsafe instructions, and analyzed by OpenAI in real time.
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setTranscript(demoTranscript)
                      setContext(demoContext)
                      setPlan(null)
                      setError('')
                    }}
                    className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-zinc-950"
                  >
                    Load Demo Transcript
                  </button>

                  <button
                    onClick={resetAll}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-700 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                  >
                    Clear
                  </button>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Meeting transcript</span>
                  <textarea
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    placeholder="Paste raw Zoom / Google Meet / Teams transcript here..."
                    className="h-80 w-full resize-none rounded-3xl border border-zinc-200 bg-white/90 p-4 text-sm leading-6 outline-none ring-indigo-500/20 transition focus:ring-4 dark:border-white/10 dark:bg-black/25 dark:text-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Optional project / team context</span>
                  <textarea
                    value={context}
                    onChange={(event) => setContext(event.target.value)}
                    placeholder="Example: Dana is frontend, Noa is backend, Amir is product..."
                    className="h-28 w-full resize-none rounded-3xl border border-zinc-200 bg-white/90 p-4 text-sm leading-6 outline-none ring-indigo-500/20 transition focus:ring-4 dark:border-white/10 dark:bg-black/25 dark:text-white"
                  />
                </label>

                <button
                  disabled={!canAnalyze}
                  onClick={analyze}
                  className="flex w-full items-center justify-center gap-3 rounded-3xl bg-indigo-600 px-5 py-4 text-base font-black text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  {loading ? 'Analyzing with OpenAI...' : 'Generate Execution Plan'}
                </button>

                {loading && <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{progressText}</p>}

                {error && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-700 dark:text-rose-200">
                    {error}
                  </div>
                )}
              </div>
            </Card>
          </section>
        )}

        {!plan && !loading && transcript.trim().length === 0 && (
          <section>
            <Card title="Output Preview" icon={<CheckCircle2 size={20} />} className="min-h-[420px]">
              <div className="grid h-full place-items-center rounded-3xl border border-dashed border-zinc-300 p-10 text-center dark:border-white/15">
                <div>
                  <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                    <Sparkles size={28} />
                  </div>

                  <h3 className="text-2xl font-black">Your execution dashboard will appear here</h3>

                  <p className="mx-auto mt-3 max-w-md text-zinc-600 dark:text-zinc-400">
                    Load the demo transcript, run the live OpenAI analysis, and see the transcript transformed into a professional sprint plan.
                  </p>
                </div>
              </div>
            </Card>
          </section>
        )}

        {plan && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/55">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Execution Dashboard</p>
                <h2 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">Transcript analyzed successfully</h2>
              </div>

              <button
                onClick={resetAll}
                className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-zinc-950"
              >
                <RotateCcw size={18} />
                Analyze Another Transcript
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-zinc-200 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-bold text-zinc-500">Action Items</p>
                <p className="mt-2 text-4xl font-black">{actionItemsCount}</p>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-bold text-zinc-500">People</p>
                <p className="mt-2 text-4xl font-black">{peopleCount}</p>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-bold text-zinc-500">Risks</p>
                <p className="mt-2 text-4xl font-black">{risksCount}</p>
              </div>
            </div>

            <Card title="Executive Summary" icon={<Sparkles size={20} />}>
              <p className="leading-7 text-zinc-700 dark:text-zinc-300">{plan.summary}</p>
            </Card>

            <Card title="Key Decisions" icon={<CheckCircle2 size={20} />}>
              <div className="space-y-4">
                {plan.decisions.length === 0 && <EmptyState text="No clear decisions detected." />}

                {plan.decisions.map((item, index) => (
                  <div key={index} className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <h3 className="font-black">{item.decision}</h3>
                      <ConfidenceBadge value={item.confidence} />
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.reason}</p>

                    <p className="mt-3 rounded-xl bg-white p-3 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200 dark:bg-black/20 dark:ring-white/10">
                      Evidence: “{item.evidence}”
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Action Items" icon={<Zap size={20} />}>
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-white/10">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-zinc-100 text-xs font-black uppercase tracking-wide text-zinc-500 dark:bg-white/5">
                    <tr>
                      <th className="px-4 py-3">Task</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Due</th>
                      <th className="px-4 py-3">Confidence</th>
                      <th className="px-4 py-3">Evidence</th>
                    </tr>
                  </thead>

                  <tbody>
                    {plan.action_items.map((item, index) => (
                      <tr key={index} className="border-t border-zinc-200 align-top dark:border-white/10">
                        <td className="max-w-[280px] px-4 py-4 font-bold text-zinc-950 dark:text-white">{item.task}</td>
                        <td className="px-4 py-4 text-zinc-800 dark:text-zinc-200">{item.owner}</td>
                        <td className="px-4 py-4">
                          <PriorityBadge value={item.priority} />
                        </td>
                        <td className="px-4 py-4 font-semibold text-zinc-700 dark:text-zinc-300">{item.due}</td>
                        <td className="px-4 py-4">
                          <ConfidenceBadge value={item.confidence} />
                        </td>
                        <td className="max-w-[280px] px-4 py-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">“{item.evidence}”</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="People Mentioned & Responsibilities" icon={<Users size={20} />}>
              <div className="grid gap-3 sm:grid-cols-2">
                {plan.people.length === 0 && <EmptyState text="No people detected." />}

                {plan.people.map((person, index) => (
                  <div key={index} className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-black">{person.name}</h3>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-zinc-600 ring-1 ring-zinc-200 dark:bg-black/20 dark:text-zinc-300 dark:ring-white/10">
                        Spoke: {person.spoke_in_meeting ? 'Yes' : 'No'}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{person.role}</p>
                    <p className="mt-2 text-sm font-semibold">{person.mentioned_task}</p>

                    {person.needs_follow_up && <p className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300">Needs follow-up</p>}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Risks & Blockers" icon={<AlertTriangle size={20} />}>
              <div className="space-y-3">
                {plan.risks.length === 0 && <EmptyState text="No risks or blockers detected." />}

                {plan.risks.map((risk, index) => (
                  <div key={index} className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                    <h3 className="font-black">{risk.risk}</h3>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Impact: {risk.impact}</p>
                    <p className="mt-2 text-sm font-semibold">Mitigation: {risk.mitigation}</p>

                    {risk.evidence && (
                      <p className="mt-3 rounded-xl bg-white p-3 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200 dark:bg-black/20 dark:ring-white/10">
                        Evidence: “{risk.evidence}”
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Open Questions" icon={<AlertTriangle size={20} />}>
              <div className="space-y-3">
                {plan.open_questions.length === 0 && <EmptyState text="No open questions detected." />}

                {plan.open_questions.map((question, index) => (
                  <div key={index} className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                    <h3 className="font-black">{question.question}</h3>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{question.why_it_matters}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                      Suggested owner: {question.suggested_owner}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Suggested GitHub Issues" icon={<Clipboard size={20} />}>
              <div className="space-y-4">
                {plan.github_issues.length === 0 && <EmptyState text="No GitHub issues suggested." />}

                {plan.github_issues.map((issue, index) => (
                  <div key={index} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-base font-black">{issue.title}</h3>
                      <CopyButton value={formatIssue(issue)} />
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{issue.description}</p>

                    <ul className="mt-3 list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
                      {issue.acceptance_criteria.map((criterion) => (
                        <li key={criterion}>{criterion}</li>
                      ))}
                    </ul>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <PriorityBadge value={issue.priority} />
                      {issue.labels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-zinc-600 ring-1 ring-zinc-200 dark:bg-black/20 dark:text-zinc-300 dark:ring-white/10"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Team Update Message" icon={<ClipboardCheck size={20} />}>
              <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                <p className="leading-7 text-zinc-700 dark:text-zinc-300">{plan.team_update}</p>
                <div className="mt-4">
                  <CopyButton value={plan.team_update} label="Copy Team Update" />
                </div>
              </div>
            </Card>

            <Card title="Next Best Step" icon={<Zap size={20} />}>
              <p className="text-xl font-black leading-8 text-zinc-950 dark:text-white">{plan.next_best_step}</p>
            </Card>

            <Card title="Security Architecture" icon={<LockKeyhole size={20} />}>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                  <h3 className="font-black">Backend validation</h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Requests are validated before analysis starts.</p>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                  <h3 className="font-black">Safety screening</h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Unsafe or malicious content is filtered before processing.</p>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                  <h3 className="font-black">Injection guard</h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Transcript instructions cannot override the AI role.</p>
                </div>
              </div>
            </Card>
          </section>
        )}
      </div>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)