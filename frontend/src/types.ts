export type Confidence = 'High' | 'Medium' | 'Low'
export type Priority = 'High' | 'Medium' | 'Low'

export type Decision = {
  decision: string
  reason: string
  evidence: string
  confidence: Confidence
}

export type ActionItem = {
  task: string
  owner: string
  priority: Priority
  due: string
  status: string
  evidence: string
  confidence: Confidence
}

export type Person = {
  name: string
  role: string
  mentioned_task: string
  spoke_in_meeting: boolean
  needs_follow_up: boolean
}

export type Risk = {
  risk: string
  impact: string
  mitigation: string
  evidence: string
}

export type OpenQuestion = {
  question: string
  why_it_matters: string
  suggested_owner: string
}

export type GithubIssue = {
  title: string
  description: string
  acceptance_criteria: string[]
  priority: Priority
  labels: string[]
}

export type ExecutionPlan = {
  summary: string
  decisions: Decision[]
  action_items: ActionItem[]
  people: Person[]
  risks: Risk[]
  open_questions: OpenQuestion[]
  github_issues: GithubIssue[]
  team_update: string
  next_best_step: string
}
