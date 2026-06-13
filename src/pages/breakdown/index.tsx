import React, { useState, useMemo } from 'react'
import { View, Text, Button, ScrollView, Input, Textarea, Picker } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useGoalContext } from '@/store/GoalContext'
import type { Goal, StageTask, WeeklyMilestone, DailyAction, Priority } from '@/types/goal'
import ProgressBar from '@/components/ProgressBar'
import { getToday } from '@/utils/dateUtil'

type ViewType = 'stages' | 'milestones' | 'daily'

const priorities: { value: Priority; label: string }[] = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' }
]

const BreakdownPage: React.FC = () => {
  const { goals, dailyActions, refreshData, addStageTask, updateStageTask, addWeeklyMilestone, updateWeeklyMilestone, addDailyAction, toggleDailyAction } = useGoalContext()

  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals])
  const [selectedGoalId, setSelectedGoalId] = useState<string>(activeGoals[0]?.id || '')
  const [viewType, setViewType] = useState<ViewType>('stages')

  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState<'stage' | 'milestone' | 'daily'>('stage')

  const [stageTitle, setStageTitle] = useState('')
  const [stageDesc, setStageDesc] = useState('')
  const [stageDeadline, setStageDeadline] = useState('')

  const [milestoneWeek, setMilestoneWeek] = useState(1)
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [milestoneDesc, setMilestoneDesc] = useState('')

  const [dailyTitle, setDailyTitle] = useState('')
  const [dailyPriority, setDailyPriority] = useState<Priority>('medium')
  const [dailyMinutes, setDailyMinutes] = useState(25)
  const [dailyDate, setDailyDate] = useState(getToday())

  useDidShow(async () => {
    await refreshData()
    if (activeGoals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(activeGoals[0].id)
    }
  })

  const selectedGoal = useMemo(() => goals.find(g => g.id === selectedGoalId), [goals, selectedGoalId])

  const currentWeek = useMemo(() => {
    if (!selectedGoal) return 1
    const diff = new Date().getTime() - new Date(selectedGoal.startDate).getTime()
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)) || 1
  }, [selectedGoal])

  const todayStr = getToday()
  const todayActions = useMemo(() => dailyActions.filter(
    action => action.date === todayStr && action.goalId === selectedGoalId
  ), [dailyActions, todayStr, selectedGoalId])

  const handleToggleStage = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    updateStageTask(selectedGoalId, taskId, { status: newStatus as any })
  }

  const handleToggleMilestone = (milestoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    updateWeeklyMilestone(selectedGoalId, milestoneId, { status: newStatus as any })
  }

  const resetAddForm = () => {
    setStageTitle('')
    setStageDesc('')
    setStageDeadline('')
    setMilestoneWeek(1)
    setMilestoneTitle('')
    setMilestoneDesc('')
    setDailyTitle('')
    setDailyPriority('medium')
    setDailyMinutes(25)
    setDailyDate(getToday())
  }

  const openAddModal = (type: 'stage' | 'milestone' | 'daily') => {
    if (!selectedGoalId) {
      Taro.showToast({ title: '请先选择目标', icon: 'none' })
      return
    }
    setAddType(type)
    resetAddForm()
    setShowAddModal(true)
  }

  const handleSaveAdd = async () => {
    if (addType === 'stage') {
      if (!stageTitle.trim()) {
        Taro.showToast({ title: '请输入任务标题', icon: 'none' })
        return
      }
      if (!stageDeadline) {
        Taro.showToast({ title: '请选择截止日期', icon: 'none' })
        return
      }
      await addStageTask(selectedGoalId, {
        title: stageTitle.trim(),
        description: stageDesc.trim(),
        deadline: stageDeadline,
        order: selectedGoal?.stageTasks.length || 0
      })
    } else if (addType === 'milestone') {
      if (!milestoneTitle.trim()) {
        Taro.showToast({ title: '请输入里程碑标题', icon: 'none' })
        return
      }
      await addWeeklyMilestone(selectedGoalId, {
        weekNumber: milestoneWeek,
        title: milestoneTitle.trim(),
        description: milestoneDesc.trim()
      })
    } else if (addType === 'daily') {
      if (!dailyTitle.trim()) {
        Taro.showToast({ title: '请输入行动标题', icon: 'none' })
        return
      }
      await addDailyAction({
        date: dailyDate,
        title: dailyTitle.trim(),
        goalId: selectedGoalId,
        priority: dailyPriority,
        estimatedMinutes: dailyMinutes,
        isTemporary: false
      })
    }

    setShowAddModal(false)
    resetAddForm()
    Taro.showToast({ title: '添加成功', icon: 'success' })
  }

  const renderStages = () => {
    if (!selectedGoal || selectedGoal.stageTasks.length === 0) {
      return (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>📋</View>
          <View className={styles.emptyText}>还没有阶段任务，点击添加开始拆解</View>
        </View>
      )
    }

    return (
      <View className={styles.stagesList}>
        {selectedGoal.stageTasks.map((stage, index) => (
          <View
            key={stage.id}
            className={classnames(styles.stageCard, styles[stage.status])}
            onClick={() => handleToggleStage(stage.id, stage.status)}
          >
            <View className={styles.stageHeader}>
              <View className={styles.stageIndex}>{index + 1}</View>
              <View className={styles.stageInfo}>
                <View className={styles.stageTitle}>{stage.title}</View>
                <View className={styles.stageDeadline}>截止：{stage.deadline}</View>
              </View>
              <View className={classnames(styles.stageStatus, `status-${stage.status}`)}>
                {stage.status === 'completed' ? '已完成' : stage.status === 'in-progress' ? '进行中' : '待开始'}
              </View>
            </View>
            <View className={styles.stageDesc}>{stage.description}</View>
            <View className={styles.stageProgress}>
              <ProgressBar
                progress={stage.status === 'completed' ? 100 : stage.status === 'in-progress' ? 50 : 0}
                color={stage.status === 'completed' ? 'success' : 'primary'}
                height="sm"
              />
            </View>
          </View>
        ))}
      </View>
    )
  }

  const renderMilestones = () => {
    if (!selectedGoal || selectedGoal.weeklyMilestones.length === 0) {
      return (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>🎯</View>
          <View className={styles.emptyText}>还没有每周里程碑，点击添加开始规划</View>
        </View>
      )
    }

    return (
      <View className={styles.milestonesList}>
        {selectedGoal.weeklyMilestones.map(milestone => (
          <View
            key={milestone.id}
            className={classnames(
              styles.milestoneItem,
              milestone.weekNumber === currentWeek && styles.current
            )}
            onClick={() => handleToggleMilestone(milestone.id, milestone.status)}
          >
            <View
              className={classnames(
                styles.weekBadge,
                milestone.status === 'completed' && styles.completed,
                milestone.weekNumber === currentWeek && milestone.status !== 'completed' && styles.current
              )}
            >
              <Text className={styles.weekNum}>第{milestone.weekNumber}周</Text>
              <Text className={styles.weekLabel}>Week</Text>
            </View>
            <View className={styles.milestoneContent}>
              <View className={styles.milestoneTitle}>{milestone.title}</View>
              <View className={styles.milestoneDesc}>{milestone.description}</View>
            </View>
            <View className={styles.milestoneStatusIcon}>
              {milestone.status === 'completed' ? '✅' : milestone.weekNumber === currentWeek ? '🔥' : '⏳'}
            </View>
          </View>
        ))}
      </View>
    )
  }

  const renderDaily = () => {
    if (todayActions.length === 0) {
      return (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>📅</View>
          <View className={styles.emptyText}>今天还没有安排行动，添加一个吧</View>
        </View>
      )
    }

    const completedCount = todayActions.filter(a => a.status === 'completed').length

    return (
      <View className={styles.dailyList}>
        <View className={styles.dayGroup}>
          <View className={styles.dayHeader}>
            <Text className={styles.dayDate}>今日安排</Text>
            <Text className={styles.dayCount}>
              {completedCount}/{todayActions.length} 已完成
            </Text>
          </View>
          {todayActions.map(action => (
            <View
              key={action.id}
              className={styles.dailyTask}
              onClick={() => toggleDailyAction(action.id)}
            >
              <View
                className={classnames(
                  styles.taskCheckbox,
                  action.status === 'completed' && styles.checked
                )}
              >
                {action.status === 'completed' && <Text>✓</Text>}
              </View>
              <Text
                className={classnames(
                  styles.taskTitle,
                  action.status === 'completed' && styles.completed
                )}
              >
                {action.title}
              </Text>
              <Text className={styles.taskPomodoro}>🍅×{action.pomodoroCount}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.goalSelector}>
        <ScrollView scrollX className={styles.goalSelectTab}>
          {activeGoals.map(goal => (
            <Button
              key={goal.id}
              className={classnames(styles.goalTab, selectedGoalId === goal.id && styles.active)}
              onClick={() => setSelectedGoalId(goal.id)}
            >
              {goal.title.length > 8 ? goal.title.slice(0, 8) + '...' : goal.title}
            </Button>
          ))}
        </ScrollView>
      </View>

      <View className={styles.sectionTabs}>
        <Button
          className={classnames(styles.sectionTab, viewType === 'stages' && styles.active)}
          onClick={() => setViewType('stages')}
        >
          阶段任务
        </Button>
        <Button
          className={classnames(styles.sectionTab, viewType === 'milestones' && styles.active)}
          onClick={() => setViewType('milestones')}
        >
          每周里程碑
        </Button>
        <Button
          className={classnames(styles.sectionTab, viewType === 'daily' && styles.active)}
          onClick={() => setViewType('daily')}
        >
          每日行动
        </Button>
      </View>

      <ScrollView scrollY className={styles.contentArea}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            {viewType === 'stages' ? '阶段任务' : viewType === 'milestones' ? '每周里程碑' : '每日行动'}
          </Text>
          <Text
            className={styles.sectionTip}
            onClick={() =>
              openAddModal(
                viewType === 'stages'
                  ? 'stage'
                  : viewType === 'milestones'
                  ? 'milestone'
                  : 'daily'
              )
            }
          >
            + 添加
          </Text>
        </View>

        {viewType === 'stages' && renderStages()}
        {viewType === 'milestones' && renderMilestones()}
        {viewType === 'daily' && renderDaily()}
      </ScrollView>

      {showAddModal && (
        <View className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>
                {addType === 'stage' ? '添加阶段任务' : addType === 'milestone' ? '添加里程碑' : '添加每日行动'}
              </Text>
              <Text className={styles.modalClose} onClick={() => setShowAddModal(false)}>×</Text>
            </View>

            <ScrollView scrollY className={styles.modalBody}>
              {addType === 'stage' && (
                <>
                  <View className={styles.formItem}>
                    <Text className={styles.formLabel}>任务标题 <Text className={styles.required}>*</Text></Text>
                    <Input
                      className={styles.formInput}
                      placeholder='例如：完成PMBOK第一章学习'
                      value={stageTitle}
                      onInput={(e) => setStageTitle(e.detail.value)}
                      maxlength={50}
                    />
                  </View>
                  <View className={styles.formItem}>
                    <Text className={styles.formLabel}>任务描述</Text>
                    <Textarea
                      className={styles.formTextarea}
                      placeholder='详细描述这个阶段任务...'
                      value={stageDesc}
                      onInput={(e) => setStageDesc(e.detail.value)}
                      maxlength={200}
                    />
                  </View>
                  <View className={styles.formItem}>
                    <Text className={styles.formLabel}>截止日期 <Text className={styles.required}>*</Text></Text>
                    <Picker
                      mode='date'
                      value={stageDeadline}
                      onChange={(e) => setStageDeadline(e.detail.value)}
                    >
                      <View className={styles.formPicker}>
                        <Text className={stageDeadline ? styles.pickerValue : styles.pickerPlaceholder}>
                          {stageDeadline || '请选择截止日期'}
                        </Text>
                        <Text className={styles.pickerArrow}>›</Text>
                      </View>
                    </Picker>
                  </View>
                </>
              )}

              {addType === 'milestone' && (
                <>
                  <View className={styles.formItem}>
                    <Text className={styles.formLabel}>周数 <Text className={styles.required}>*</Text></Text>
                    <Picker
                      mode='selector'
                      range={Array.from({ length: 12 }, (_, i) => `第 ${i + 1} 周`)}
                      value={milestoneWeek - 1}
                      onChange={(e) => setMilestoneWeek(parseInt(e.detail.value) + 1)}
                    >
                      <View className={styles.formPicker}>
                        <Text className={styles.pickerValue}>第 {milestoneWeek} 周</Text>
                        <Text className={styles.pickerArrow}>›</Text>
                      </View>
                    </Picker>
                  </View>
                  <View className={styles.formItem}>
                    <Text className={styles.formLabel}>里程碑标题 <Text className={styles.required}>*</Text></Text>
                    <Input
                      className={styles.formInput}
                      placeholder='例如：完成范围管理学习'
                      value={milestoneTitle}
                      onInput={(e) => setMilestoneTitle(e.detail.value)}
                      maxlength={50}
                    />
                  </View>
                  <View className={styles.formItem}>
                    <Text className={styles.formLabel}>描述</Text>
                    <Textarea
                      className={styles.formTextarea}
                      placeholder='简单描述这个里程碑...'
                      value={milestoneDesc}
                      onInput={(e) => setMilestoneDesc(e.detail.value)}
                      maxlength={200}
                    />
                  </View>
                </>
              )}

              {addType === 'daily' && (
                <>
                  <View className={styles.formItem}>
                    <Text className={styles.formLabel}>行动标题 <Text className={styles.required}>*</Text></Text>
                    <Input
                      className={styles.formInput}
                      placeholder='例如：学习PMBOK第5章'
                      value={dailyTitle}
                      onInput={(e) => setDailyTitle(e.detail.value)}
                      maxlength={50}
                    />
                  </View>
                  <View className={styles.formItem}>
                    <Text className={styles.formLabel}>日期</Text>
                    <Picker
                      mode='date'
                      value={dailyDate}
                      onChange={(e) => setDailyDate(e.detail.value)}
                    >
                      <View className={styles.formPicker}>
                        <Text className={styles.pickerValue}>{dailyDate}</Text>
                        <Text className={styles.pickerArrow}>›</Text>
                      </View>
                    </Picker>
                  </View>
                  <View className={styles.formItem}>
                    <Text className={styles.formLabel}>优先级</Text>
                    <View className={styles.priorityRow}>
                      {priorities.map((p, i) => (
                        <Button
                          key={p.value}
                          className={classnames(
                            styles.priorityBtn,
                            dailyPriority === p.value && styles.priorityBtnActive
                          )}
                          onClick={() => setDailyPriority(p.value)}
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
                      value={[15, 25, 30, 50, 60, 75, 90, 120].indexOf(dailyMinutes)}
                      onChange={(e) => setDailyMinutes([15, 25, 30, 50, 60, 75, 90, 120][parseInt(e.detail.value)])}
                    >
                      <View className={styles.formPicker}>
                        <Text className={styles.pickerValue}>{dailyMinutes} 分钟</Text>
                        <Text className={styles.pickerArrow}>›</Text>
                      </View>
                    </Picker>
                  </View>
                </>
              )}
            </ScrollView>

            <View className={styles.modalFooter}>
              <Button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                取消
              </Button>
              <Button className={styles.confirmBtn} onClick={handleSaveAdd}>
                保存
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default BreakdownPage
