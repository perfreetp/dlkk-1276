import React, { useState } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { mockGoals, mockDailyActions } from '@/data/mockData'
import type { Goal, StageTask, WeeklyMilestone, DailyAction } from '@/types/goal'
import ProgressBar from '@/components/ProgressBar'
import { getToday } from '@/utils/dateUtil'

type ViewType = 'stages' | 'milestones' | 'daily'

const BreakdownPage: React.FC = () => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(mockGoals[0].id)
  const [viewType, setViewType] = useState<ViewType>('stages')
  const [dailyActions, setDailyActions] = useState<DailyAction[]>(mockDailyActions)

  const selectedGoal = mockGoals.find(g => g.id === selectedGoalId)

  const activeGoals = mockGoals.filter(g => g.status === 'active')

  const currentWeek = Math.ceil((new Date().getTime() - new Date(selectedGoal?.startDate || '').getTime()) / (7 * 24 * 60 * 60 * 1000)) || 1

  const todayStr = getToday()
  const todayActions = dailyActions.filter(
    action => action.date === todayStr && action.goalId === selectedGoalId
  )

  const handleToggleTask = (taskId: string) => {
    setDailyActions(prev =>
      prev.map(action =>
        action.id === taskId
          ? {
              ...action,
              status: action.status === 'completed' ? 'pending' : 'completed',
              completedMinutes: action.status === 'completed' ? 0 : action.estimatedMinutes
            }
          : action
      )
    )
  }

  const handleAddStage = () => {
    Taro.showToast({ title: '添加阶段任务', icon: 'none' })
  }

  const handleAddMilestone = () => {
    Taro.showToast({ title: '添加里程碑', icon: 'none' })
  }

  const handleAddDaily = () => {
    Taro.showToast({ title: '添加每日行动', icon: 'none' })
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
              onClick={() => handleToggleTask(action.id)}
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
            onClick={
              viewType === 'stages'
                ? handleAddStage
                : viewType === 'milestones'
                ? handleAddMilestone
                : handleAddDaily
            }
          >
            + 添加
          </Text>
        </View>

        {viewType === 'stages' && renderStages()}
        {viewType === 'milestones' && renderMilestones()}
        {viewType === 'daily' && renderDaily()}
      </ScrollView>
    </View>
  )
}

export default BreakdownPage
