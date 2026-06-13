export type Priority = 'high' | 'medium' | 'low'

export type GoalStatus = 'active' | 'archived' | 'completed'

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'delayed'

export interface StageTask {
  id: string
  title: string
  description: string
  deadline: string
  status: TaskStatus
  order: number
}

export interface WeeklyMilestone {
  id: string
  weekNumber: number
  title: string
  description: string
  status: TaskStatus
}

export interface DailyAction {
  id: string
  date: string
  title: string
  goalId: string
  stageId?: string
  milestoneId?: string
  priority: Priority
  status: TaskStatus
  pomodoroCount: number
  estimatedMinutes: number
  completedMinutes: number
  delayReason?: string
  isTemporary: boolean
}

export interface Goal {
  id: string
  title: string
  description: string
  metric: string
  deadline: string
  startDate: string
  priority: Priority
  reminderEnabled: boolean
  reminderTime?: string
  status: GoalStatus
  progress: number
  totalTasks: number
  completedTasks: number
  stageTasks: StageTask[]
  weeklyMilestones: WeeklyMilestone[]
  createdAt: string
  category: string
}

export interface WeeklyReview {
  id: string
  weekNumber: number
  year: number
  startDate: string
  endDate: string
  progressSummary: string
  obstacles: string
  nextWeekPlan: string
  highlights: string[]
  goalProgress: {
    goalId: string
    goalTitle: string
    progress: number
    completedTasks: number
    totalTasks: number
  }[]
  createdAt: string
}

export interface StatData {
  totalGoals: number
  completedGoals: number
  completionRate: number
  streakDays: number
  totalFocusMinutes: number
  todayFocusMinutes: number
  weekFocusMinutes: number
  completedDailyActions: number
  totalDailyActions: number
  riskGoals: {
    id: string
    title: string
    riskLevel: 'high' | 'medium' | 'low'
    reason: string
  }[]
}

export interface PomodoroSession {
  id: string
  startTime: string
  endTime?: string
  duration: number
  taskId?: string
  goalId?: string
  completed: boolean
}
