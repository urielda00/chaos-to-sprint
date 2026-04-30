from typing import List, Literal, Optional
from pydantic import BaseModel, Field

Confidence = Literal["High", "Medium", "Low"]
Priority = Literal["High", "Medium", "Low"]

class AnalyzeRequest(BaseModel):
    transcript: str = Field(..., min_length=80, max_length=30000)
    context: Optional[str] = Field(default="", max_length=4000)

class Decision(BaseModel):
    decision: str
    reason: str
    evidence: str
    confidence: Confidence

class ActionItem(BaseModel):
    task: str
    owner: str
    priority: Priority
    due: str
    status: str
    evidence: str
    confidence: Confidence

class Person(BaseModel):
    name: str
    role: str
    mentioned_task: str
    spoke_in_meeting: bool
    needs_follow_up: bool

class Risk(BaseModel):
    risk: str
    impact: str
    mitigation: str
    evidence: str

class OpenQuestion(BaseModel):
    question: str
    why_it_matters: str
    suggested_owner: str

class GithubIssue(BaseModel):
    title: str
    description: str
    acceptance_criteria: List[str]
    priority: Priority
    labels: List[str]

class ExecutionPlan(BaseModel):
    summary: str
    decisions: List[Decision]
    action_items: List[ActionItem]
    people: List[Person]
    risks: List[Risk]
    open_questions: List[OpenQuestion]
    github_issues: List[GithubIssue]
    team_update: str
    next_best_step: str
