import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import TaskItem from '@/components/TaskItem'
import { mockDailyActions, mockGoals } from '@/data/mockData'
import type { DailyAction } from '@/types/goal'
import { getToday, formatDate, formatMinutes } from '@/utils/dateUtil'

const TodayPage: React.FC = () => {
  const [tasks, setTasks] = useState<DailyAction[]>([])
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(110)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const todayStr = getToday()

  useEffect(() => {
    const todayTasks = mockDailyActions.filter(t => t.date === todayStr)
    setTasks(todayTasks)
  }, [todayStr])

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            Taro.showToast({ title: '🍅 番茄钟完成！', icon: 'success' })
            setTodayFocusMinutes(prev => prev + 25)
            return 25 * 60
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isTimerRunning])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleStartTimer = () => {
    setIsTimerRunning(true)
    console.log('[Today] 开始番茄钟')
  }

  const handlePauseTimer = () => {
    setIsTimerRunning(false)
    console.log('[Today] 暂停番茄钟')
  }

  const handleResetTimer = () => {
    setIsTimerRunning(false)
    setPomodoroTime(25 * 60)
    console.log('[Today] 重置番茄钟')
  }

  const handleToggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const newStatus = task.status === 'completed' ? 'pending' : 'completed'
          return {
            ...task,
            status: newStatus,
            completedMinutes: newStatus === 'completed' ? task.estimatedMinutes : 0
          }
        }
        return task
      })
    )
  }

  const handleDelayTask = (taskId: string) => {
    Taro.showModal({
      title: '延期任务',
      content: '请输入延期原因',
      editable: true,
      placeholderText: '请输入延期原因...',
      success: (res) => {
        if (res.confirm && res.content) {
          setTasks(prev =>
            prev.map(task =>
              task.id === taskId
                ? { ...task, status: 'delayed', delayReason: res.content }
                : task
            )
          )
          console.log('[Today] 任务已延期:', taskId, '原因:', res.content)
        }
      }
    })
  }

  const handleStartPomodoro = (taskId: string) => {
    setSelectedTaskId(taskId)
    setPomodoroTime(25 * 60)
    setIsTimerRunning(true)
    const task = tasks.find(t => t.id === taskId)
    console.log('[Today] 开始番茄钟 - 任务:', task?.title)
  }

  const handleAddTask = () => {
    Taro.showActionSheet({
      itemList: ['添加临时事项', '从目标中选择', '从模板添加'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: '添加临时事项', icon: 'none' })
        } else if (res.tapIndex === 1) {
          Taro.showToast({ title: '从目标中选择', icon: 'none' })
        } else {
          Taro.showToast({ title: '从模板添加', icon: 'none' })
        }
      }
    })
  }

  const handleQuickPlan = () => {
    Taro.showToast({ title: '快速规划功能', icon: 'none' })
  }

  const handleBatchComplete = () => {
    Taro.showToast({ title: '批量完成功能', icon: 'none' })
  }

  const completedTasks = tasks.filter(t => t.status === 'completed')
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress')
  const delayedTasks = tasks.filter(t => t.status === 'delayed')
  const totalEstimatedMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)
  const completedCount = completedTasks.length
  const totalCount = tasks.length

  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  const date = new Date()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const dateStr = `${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`

  return (
    <View className={styles.pageContainer}>
      <View className={styles.dateHeader}>
        <View className={styles.dateMain}>{dateStr}</View>
        <View className={styles.dateSub}>新的一天，从第一个行动开始 💪</View>
        <View className={styles.streakInfo}>
          <View className={styles.streakBadge}>🔥 连续 23 天</View>
          <Text className={styles.streakText}>保持节奏，继续加油！</Text>
        </View>
      </View>

      <View className={styles.focusCard}>
        <View className={styles.focusHeader}>
          <View>
            <View className={styles.focusTitle}>🍅 番茄专注</View>
            <View className={styles.focusSubtitle}>
              {selectedTask ? `当前：${selectedTask.title.slice(0, 10)}...` : '选择任务开始专注'}
            </View>
          </View>
          <View className={styles.focusSubtitle}>
            今日已专注 {formatMinutes(todayFocusMinutes)}
          </View>
        </View>

        <View className={styles.timerDisplay}>
          <View className={classnames(styles.timerCircle, isTimerRunning && styles.active)}>
            <Text className={styles.timerTime}>{formatTime(pomodoroTime)}</Text>
            <Text className={styles.timerLabel}>专注时间</Text>
          </View>
        </View>

        <View className={styles.focusControls}>
          {!isTimerRunning ? (
            <Button
              className={classnames(styles.controlBtn, styles.startBtn)}
              onClick={handleStartTimer}
            >
              开始专注
            </Button>
          ) : (
            <Button
              className={classnames(styles.controlBtn, styles.pauseBtn)}
              onClick={handlePauseTimer}
            >
              暂停
            </Button>
          )}
          <Button
            className={classnames(styles.controlBtn, styles.resetBtn)}
            onClick={handleResetTimer}
          >
            重置
          </Button>
        </View>
      </View>

      <View className={styles.todayStats}>
        <View className={styles.todayStat}>
          <View className={styles.statValue}>{completedCount}/{totalCount}</View>
          <View className={styles.statLabel}>今日任务</View>
        </View>
        <View className={styles.todayStat}>
          <View className={styles.statValue}>
            {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
          </View>
          <View className={styles.statLabel}>完成率</View>
        </View>
        <View className={styles.todayStat}>
          <View className={styles.statValue}>{formatMinutes(totalEstimatedMinutes)}</View>
          <View className={styles.statLabel}>预计时长</View>
        </View>
      </View>

      <ScrollView scrollY className={styles.tasksSection}>
        {pendingTasks.length > 0 && (
          <View>
            <View className={styles.taskGroupTitle}>
              <Text>📝 待完成 ({pendingTasks.length})</Text>
            </View>
            <View className={styles.tasksList}>
              {pendingTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelay={handleDelayTask}
                  onStartPomodoro={handleStartPomodoro}
                />
              ))}
            </View>
          </View>
        )}

        {delayedTasks.length > 0 && (
          <View className={styles.delayedSection}>
            <View className={styles.delayedTitle}>
              <Text>⏰ 已延期 ({delayedTasks.length})</Text>
            </View>
            <View className={styles.tasksList}>
              {delayedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onStartPomodoro={handleStartPomodoro}
                />
              ))}
            </View>
          </View>
        )}

        {completedTasks.length > 0 && (
          <View>
            <View className={styles.taskGroupTitle}>
              <Text>✅ 已完成 ({completedTasks.length})</Text>
            </View>
            <View className={styles.tasksList}>
              {completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                />
              ))}
            </View>
          </View>
        )}

        {tasks.length === 0 && (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>📋</View>
            <View className={styles.emptyText}>今天还没有安排任务</View>
            <Button className={styles.emptyBtn} onClick={handleAddTask}>
              + 添加任务
            </Button>
          </View>
        )}
      </ScrollView>

      <Button className={styles.addFAB} onClick={handleAddTask}>
        +
      </Button>

      <View className={styles.bottomBar}>
        <Button className={styles.quickAction} onClick={handleQuickPlan}>
          📋 快速规划
        </Button>
        <Button className={styles.primaryAction} onClick={handleBatchComplete}>
          ✓ 批量完成
        </Button>
      </View>
    </View>
  )
}

export default TodayPage
