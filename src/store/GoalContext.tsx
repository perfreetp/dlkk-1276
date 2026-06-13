import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Taro from '@tarojs/taro'
import type { Goal, DailyAction, WeeklyReview, StageTask, WeeklyMilestone } from '@/types/goal'
import { goalStorage, dailyActionStorage, reviewStorage } from '@/utils/storage'
import { mockGoals, mockDailyActions, mockWeeklyReviews } from '@/data/mockData'
import { getToday, formatDate } from '@/utils/dateUtil'

interface GoalContextType {
  goals: Goal[]
  dailyActions: DailyAction[]
  reviews: WeeklyReview[]
  loading: boolean
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'completedTasks' | 'totalTasks' | 'stageTasks' | 'weeklyMilestones' | 'status'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  archiveGoal: (id: string) => Promise<void>
  restoreGoal: (id: string) => Promise<void>
  addStageTask: (goalId: string, task: Omit<StageTask, 'id' | 'status'>) => Promise<void>
  updateStageTask: (goalId: string, taskId: string, updates: Partial<StageTask>) => Promise<void>
  addWeeklyMilestone: (goalId: string, milestone: Omit<WeeklyMilestone, 'id' | 'status'>) => Promise<void>
  updateWeeklyMilestone: (goalId: string, milestoneId: string, updates: Partial<WeeklyMilestone>) => Promise<void>
  addDailyAction: (action: Omit<DailyAction, 'id' | 'status' | 'completedMinutes' | 'pomodoroCount'>) => Promise<void>
  updateDailyAction: (id: string, updates: Partial<DailyAction>) => Promise<void>
  toggleDailyAction: (id: string) => Promise<void>
  delayDailyAction: (id: string, reason: string) => Promise<void>
  batchCompleteActions: (ids: string[]) => Promise<void>
  addReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => Promise<void>
  updateReview: (id: string, updates: Partial<WeeklyReview>) => Promise<void>
  getGoalById: (id: string) => Goal | undefined
  getTodayActions: () => DailyAction[]
  calculateStats: () => {
    totalGoals: number
    completedGoals: number
    completionRate: number
    activeGoals: number
    archivedGoals: number
  }
  refreshData: () => Promise<void>
}

const GoalContext = createContext<GoalContextType | undefined>(undefined)

export const useGoalContext = () => {
  const context = useContext(GoalContext)
  if (!context) {
    throw new Error('useGoalContext must be used within a GoalProvider')
  }
  return context
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

export const GoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [dailyActions, setDailyActions] = useState<DailyAction[]>([])
  const [reviews, setReviews] = useState<WeeklyReview[]>([])
  const [loading, setLoading] = useState(true)

  const initializeData = async () => {
    try {
      const storedGoals = await goalStorage.getAll()
      const storedActions = await dailyActionStorage.getAll()
      const storedReviews = await reviewStorage.getAll()

      if (storedGoals.length === 0) {
        console.log('[GoalContext] 无存储数据，使用示例数据初始化')
        await goalStorage.saveAll(mockGoals)
        await dailyActionStorage.saveAll(mockDailyActions)
        await reviewStorage.saveAll(mockWeeklyReviews)
        setGoals(mockGoals)
        setDailyActions(mockDailyActions)
        setReviews(mockWeeklyReviews)
      } else {
        console.log('[GoalContext] 加载存储数据成功')
        setGoals(storedGoals)
        setDailyActions(storedActions)
        setReviews(storedReviews)
      }
    } catch (error) {
      console.error('[GoalContext] 初始化失败:', error)
      setGoals(mockGoals)
      setDailyActions(mockDailyActions)
      setReviews(mockWeeklyReviews)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    const storedGoals = await goalStorage.getAll()
    const storedActions = await dailyActionStorage.getAll()
    const storedReviews = await reviewStorage.getAll()
    setGoals(storedGoals)
    setDailyActions(storedActions)
    setReviews(storedReviews)
  }

  useEffect(() => {
    initializeData()
  }, [])

  const recalculateGoalProgress = (goal: Goal): Goal => {
    const completedTasks = goal.stageTasks.filter(t => t.status === 'completed').length +
      goal.weeklyMilestones.filter(m => m.status === 'completed').length
    const totalTasks = goal.stageTasks.length + goal.weeklyMilestones.length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const completedStageTasks = goal.stageTasks.filter(t => t.status === 'completed').length

    return {
      ...goal,
      progress,
      completedTasks: completedStageTasks,
      totalTasks: goal.stageTasks.length
    }
  }

  const addGoal = async (goalData: any) => {
    const newGoal: Goal = {
      ...goalData,
      id: generateId(),
      createdAt: formatDate(new Date()),
      status: 'active',
      progress: 0,
      completedTasks: 0,
      totalTasks: 0,
      stageTasks: [],
      weeklyMilestones: []
    }
    const updatedGoals = [...goals, newGoal]
    setGoals(updatedGoals)
    await goalStorage.saveAll(updatedGoals)
    console.log('[GoalContext] 添加目标:', newGoal.title)
    Taro.showToast({ title: '目标创建成功', icon: 'success' })
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map(g =>
      g.id === id ? { ...g, ...updates } : g
    )
    setGoals(updatedGoals)
    await goalStorage.saveAll(updatedGoals)
    console.log('[GoalContext] 更新目标:', id)
  }

  const deleteGoal = async (id: string) => {
    const updatedGoals = goals.filter(g => g.id !== id)
    setGoals(updatedGoals)
    await goalStorage.saveAll(updatedGoals)
    console.log('[GoalContext] 删除目标:', id)
  }

  const archiveGoal = async (id: string) => {
    await updateGoal(id, { status: 'archived' })
    Taro.showToast({ title: '目标已归档', icon: 'success' })
  }

  const restoreGoal = async (id: string) => {
    await updateGoal(id, { status: 'active' })
    Taro.showToast({ title: '目标已恢复', icon: 'success' })
  }

  const addStageTask = async (goalId: string, taskData: any) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    const newTask: StageTask = {
      ...taskData,
      id: generateId(),
      status: 'pending'
    }

    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const updated = {
          ...g,
          stageTasks: [...g.stageTasks, newTask]
        }
        return recalculateGoalProgress(updated)
      }
      return g
    })

    setGoals(updatedGoals)
    await goalStorage.saveAll(updatedGoals)
    console.log('[GoalContext] 添加阶段任务:', newTask.title)
  }

  const updateStageTask = async (goalId: string, taskId: string, updates: Partial<StageTask>) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const updatedTasks = g.stageTasks.map(t =>
          t.id === taskId ? { ...t, ...updates } : t
        )
        const updated = { ...g, stageTasks: updatedTasks }
        return recalculateGoalProgress(updated)
      }
      return g
    })

    setGoals(updatedGoals)
    await goalStorage.saveAll(updatedGoals)
  }

  const addWeeklyMilestone = async (goalId: string, milestoneData: any) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    const newMilestone: WeeklyMilestone = {
      ...milestoneData,
      id: generateId(),
      status: 'pending'
    }

    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const updated = {
          ...g,
          weeklyMilestones: [...g.weeklyMilestones, newMilestone]
        }
        return recalculateGoalProgress(updated)
      }
      return g
    })

    setGoals(updatedGoals)
    await goalStorage.saveAll(updatedGoals)
    console.log('[GoalContext] 添加里程碑:', newMilestone.title)
  }

  const updateWeeklyMilestone = async (goalId: string, milestoneId: string, updates: Partial<WeeklyMilestone>) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const updatedMilestones = g.weeklyMilestones.map(m =>
          m.id === milestoneId ? { ...m, ...updates } : m
        )
        const updated = { ...g, weeklyMilestones: updatedMilestones }
        return recalculateGoalProgress(updated)
      }
      return g
    })

    setGoals(updatedGoals)
    await goalStorage.saveAll(updatedGoals)
  }

  const addDailyAction = async (actionData: any) => {
    const newAction: DailyAction = {
      ...actionData,
      id: generateId(),
      status: 'pending',
      completedMinutes: 0,
      pomodoroCount: actionData.pomodoroCount || Math.ceil(actionData.estimatedMinutes / 25)
    }

    const updatedActions = [...dailyActions, newAction]
    setDailyActions(updatedActions)
    await dailyActionStorage.saveAll(updatedActions)
    console.log('[GoalContext] 添加每日行动:', newAction.title)
  }

  const updateDailyAction = async (id: string, updates: Partial<DailyAction>) => {
    const updatedActions = dailyActions.map(a =>
      a.id === id ? { ...a, ...updates } : a
    )
    setDailyActions(updatedActions)
    await dailyActionStorage.saveAll(updatedActions)
  }

  const toggleDailyAction = async (id: string) => {
    const action = dailyActions.find(a => a.id === id)
    if (!action) return

    const newStatus = action.status === 'completed' ? 'pending' : 'completed'
    const completedMinutes = newStatus === 'completed' ? action.estimatedMinutes : 0

    await updateDailyAction(id, {
      status: newStatus,
      completedMinutes
    })

    if (newStatus === 'completed') {
      Taro.showToast({ title: '完成啦！', icon: 'success' })
    }
  }

  const delayDailyAction = async (id: string, reason: string) => {
    await updateDailyAction(id, {
      status: 'delayed',
      delayReason: reason
    })
    Taro.showToast({ title: '已记录延期原因', icon: 'success' })
  }

  const batchCompleteActions = async (ids: string[]) => {
    const updatedActions = dailyActions.map(a => {
      if (ids.includes(a.id)) {
        return {
          ...a,
          status: 'completed' as const,
          completedMinutes: a.estimatedMinutes
        }
      }
      return a
    })
    setDailyActions(updatedActions)
    await dailyActionStorage.saveAll(updatedActions)
    Taro.showToast({ title: `已完成 ${ids.length} 个任务`, icon: 'success' })
  }

  const addReview = async (reviewData: any) => {
    const newReview: WeeklyReview = {
      ...reviewData,
      id: generateId(),
      createdAt: formatDate(new Date())
    }

    const updatedReviews = [newReview, ...reviews]
    setReviews(updatedReviews)
    await reviewStorage.saveAll(updatedReviews)
    console.log('[GoalContext] 添加复盘:', newReview.weekNumber)
    Taro.showToast({ title: '复盘保存成功', icon: 'success' })
  }

  const updateReview = async (id: string, updates: Partial<WeeklyReview>) => {
    const updatedReviews = reviews.map(r =>
      r.id === id ? { ...r, ...updates } : r
    )
    setReviews(updatedReviews)
    await reviewStorage.saveAll(updatedReviews)
  }

  const getGoalById = (id: string) => {
    return goals.find(g => g.id === id)
  }

  const getTodayActions = () => {
    const today = getToday()
    return dailyActions.filter(a => a.date === today)
  }

  const calculateStats = () => {
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.status === 'completed').length
    const activeGoals = goals.filter(g => g.status === 'active').length
    const archivedGoals = goals.filter(g => g.status === 'archived').length
    const avgProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
      : 0

    return {
      totalGoals,
      completedGoals,
      completionRate: avgProgress,
      activeGoals,
      archivedGoals
    }
  }

  const value: GoalContextType = {
    goals,
    dailyActions,
    reviews,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    restoreGoal,
    addStageTask,
    updateStageTask,
    addWeeklyMilestone,
    updateWeeklyMilestone,
    addDailyAction,
    updateDailyAction,
    toggleDailyAction,
    delayDailyAction,
    batchCompleteActions,
    addReview,
    updateReview,
    getGoalById,
    getTodayActions,
    calculateStats,
    refreshData
  }

  return (
    <GoalContext.Provider value={value}>
      {children}
    </GoalContext.Provider>
  )
}
