import React, { useState, useEffect, useRef, useMemo } from 'react'
import { View, Text, Button, ScrollView, Input, Picker, Checkbox } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import TaskItem from '@/components/TaskItem'
import { useGoalContext } from '@/store/GoalContext'
import type { DailyAction, Priority } from '@/types/goal'
import { getToday, formatMinutes } from '@/utils/dateUtil'

const priorities: { value: Priority; label: string }[] = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' }
]

const TodayPage: React.FC = () => {
  const { dailyActions, goals, refreshData, toggleDailyAction, delayDailyAction, batchCompleteActions, addDailyAction } = useGoalContext()

  const [pomodoroTime, setPomodoroTime] = useState(25 * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(110)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addPriority, setAddPriority] = useState<Priority>('medium')
  const [addMinutes, setAddMinutes] = useState(25)

  const [showBatchMode, setShowBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const todayStr = getToday()

  useDidShow(async () => {
    await refreshData()
  })

  const tasks = useMemo(() => dailyActions.filter(t => t.date === todayStr), [dailyActions, todayStr])

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
    toggleDailyAction(taskId)
  }

  const handleDelayTask = (taskId: string) => {
    Taro.showModal({
      title: '延期任务',
      content: '请输入延期原因',
      editable: true,
      placeholderText: '请输入延期原因...',
      success: async (res) => {
        if (res.confirm && res.content) {
          await delayDailyAction(taskId, res.content)
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
      itemList: ['添加临时事项', '从目标中选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          setAddTitle('')
          setAddPriority('medium')
          setAddMinutes(25)
          setShowAddModal(true)
        } else if (res.tapIndex === 1) {
          Taro.showToast({ title: '请在拆解计划中添加', icon: 'none' })
        }
      }
    })
  }

  const handleSaveTemporary = async () => {
    if (!addTitle.trim()) {
      Taro.showToast({ title: '请输入事项内容', icon: 'none' })
      return
    }

    await addDailyAction({
      date: todayStr,
      title: addTitle.trim(),
      goalId: 'temporary',
      priority: addPriority,
      estimatedMinutes: addMinutes,
      isTemporary: true
    })

    setShowAddModal(false)
    setAddTitle('')
    Taro.showToast({ title: '添加成功', icon: 'success' })
  }

  const handleQuickPlan = () => {
    Taro.showToast({ title: '快速规划功能', icon: 'none' })
  }

  const handleBatchComplete = () => {
    if (showBatchMode) {
      if (selectedIds.length === 0) {
        Taro.showToast({ title: '请先选择任务', icon: 'none' })
        return
      }
      batchCompleteActions(selectedIds)
      setSelectedIds([])
      setShowBatchMode(false)
    } else {
      setShowBatchMode(true)
      setSelectedIds([])
    }
  }

  const handleCancelBatch = () => {
    setShowBatchMode(false)
    setSelectedIds([])
  }

  const toggleSelectTask = (taskId: string) => {
    setSelectedIds(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const selectAllPending = () => {
    const pendingIds = pendingTasks.map(t => t.id)
    const allSelected = pendingIds.every(id => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(pendingIds)
    }
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

      {showBatchMode && (
        <View className={styles.batchHeader}>
          <View className={styles.batchInfo}>
            <Text
              className={styles.selectAllText}
              onClick={selectAllPending}
            >
              全选待完成
            </Text>
            <Text className={styles.batchCount}>已选择 {selectedIds.length} 项</Text>
          </View>
          <Text className={styles.cancelBatch} onClick={handleCancelBatch}>
            取消
          </Text>
        </View>
      )}

      <ScrollView scrollY className={styles.tasksSection}>
        {pendingTasks.length > 0 && (
          <View>
            <View className={styles.taskGroupTitle}>
              <Text>📝 待完成 ({pendingTasks.length})</Text>
            </View>
            <View className={styles.tasksList}>
              {pendingTasks.map(task => (
                <View key={task.id} className={styles.taskWrapper}>
                  {showBatchMode && (
                    <Checkbox
                      checked={selectedIds.includes(task.id)}
                      onChange={() => toggleSelectTask(task.id)}
                      color='#5B8DEF'
                    />
                  )}
                  <TaskItem
                    task={task}
                    onToggle={showBatchMode ? () => toggleSelectTask(task.id) : handleToggleTask}
                    onDelay={handleDelayTask}
                    onStartPomodoro={handleStartPomodoro}
                  />
                </View>
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
                <View key={task.id} className={styles.taskWrapper}>
                  {showBatchMode && (
                    <Checkbox
                      checked={selectedIds.includes(task.id)}
                      onChange={() => toggleSelectTask(task.id)}
                      color='#5B8DEF'
                    />
                  )}
                  <TaskItem
                    task={task}
                    onToggle={showBatchMode ? () => toggleSelectTask(task.id) : handleToggleTask}
                    onStartPomodoro={handleStartPomodoro}
                  />
                </View>
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
                <View key={task.id} className={styles.taskWrapper}>
                  {showBatchMode && (
                    <Checkbox
                      checked={selectedIds.includes(task.id)}
                      onChange={() => toggleSelectTask(task.id)}
                      color='#5B8DEF'
                    />
                  )}
                  <TaskItem
                    task={task}
                    onToggle={showBatchMode ? () => toggleSelectTask(task.id) : handleToggleTask}
                  />
                </View>
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

      {!showBatchMode && (
        <Button className={styles.addFAB} onClick={handleAddTask}>
          +
        </Button>
      )}

      <View className={styles.bottomBar}>
        {showBatchMode ? (
          <Button
            className={styles.batchConfirmBtn}
            onClick={handleBatchComplete}
          >
            ✓ 批量完成 ({selectedIds.length})
          </Button>
        ) : (
          <>
            <Button className={styles.quickAction} onClick={handleQuickPlan}>
              📋 快速规划
            </Button>
            <Button className={styles.primaryAction} onClick={handleBatchComplete}>
              ✓ 批量完成
            </Button>
          </>
        )}
      </View>

      {showAddModal && (
        <View className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>添加临时事项</Text>
              <Text className={styles.modalClose} onClick={() => setShowAddModal(false)}>×</Text>
            </View>

            <View className={styles.modalBody}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>事项内容 <Text className={styles.required}>*</Text></Text>
                <Input
                  className={styles.formInput}
                  placeholder='例如：回复邮件、打电话...'
                  value={addTitle}
                  onInput={(e) => setAddTitle(e.detail.value)}
                  maxlength={50}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>优先级</Text>
                <View className={styles.priorityRow}>
                  {priorities.map((p, i) => (
                    <Button
                      key={p.value}
                      className={classnames(
                        styles.priorityBtn,
                        addPriority === p.value && styles.priorityBtnActive
                      )}
                      onClick={() => setAddPriority(p.value)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </View>
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>预估时间（分钟）</Text>
                <Picker
                  mode='selector'
                  range={[15, 25, 30, 50, 60, 75, 90, 120]}
                  value={[15, 25, 30, 50, 60, 75, 90, 120].indexOf(addMinutes)}
                  onChange={(e) => setAddMinutes([15, 25, 30, 50, 60, 75, 90, 120][parseInt(e.detail.value)])}
                >
                  <View className={styles.formPicker}>
                    <Text className={styles.pickerValue}>{addMinutes} 分钟</Text>
                    <Text className={styles.pickerArrow}>›</Text>
                  </View>
                </Picker>
              </View>
            </View>

            <View className={styles.modalFooter}>
              <Button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                取消
              </Button>
              <Button className={styles.confirmBtn} onClick={handleSaveTemporary}>
                保存
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default TodayPage
