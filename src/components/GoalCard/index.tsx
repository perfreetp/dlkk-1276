import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import type { Goal } from '@/types/goal'
import ProgressBar from '@/components/ProgressBar'
import { getDaysRemaining } from '@/utils/dateUtil'

interface GoalCardProps {
  goal: Goal
  onClick?: () => void
  showActions?: boolean
}

const priorityLabels = {
  high: { text: '高优先级', color: 'high' },
  medium: { text: '中优先级', color: 'medium' },
  low: { text: '低优先级', color: 'low' }
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick, showActions = true }) => {
  const daysRemaining = getDaysRemaining(goal.deadline)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({ url: `/pages/goal-detail/index?id=${goal.id}` })
    }
  }

  const getProgressColor = () => {
    if (goal.progress >= 80) return 'success'
    if (goal.progress >= 50) return 'primary'
    if (daysRemaining < 10 && goal.progress < 50) return 'error'
    return 'primary'
  }

  return (
    <View className={styles.goalCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.categoryTag}>{goal.category}</View>
        <View
          className={classnames(
            styles.priorityTag,
            styles[`priority-${priorityLabels[goal.priority].color}`]
          )}
        >
          {priorityLabels[goal.priority].text}
        </View>
      </View>

      <View className={styles.goalTitle}>{goal.title}</View>
      <View className={styles.goalMetric}>{goal.metric}</View>

      <View className={styles.progressSection}>
        <View className={styles.progressInfo}>
          <Text className={styles.progressText}>进度</Text>
          <Text className={styles.progressValue}>{goal.progress}%</Text>
        </View>
        <ProgressBar progress={goal.progress} color={getProgressColor()} height="md" />
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.footerItem}>
          <View className={styles.footerLabel}>剩余天数</View>
          <View className={classnames(
            styles.footerValue,
            daysRemaining < 10 && styles.danger
          )}>
            {daysRemaining > 0 ? `${daysRemaining}天` : '已到期'}
          </View>
        </View>
        <View className={styles.footerDivider} />
        <View className={styles.footerItem}>
          <View className={styles.footerLabel}>任务完成</View>
          <View className={styles.footerValue}>
            {goal.completedTasks}/{goal.totalTasks}
          </View>
        </View>
        <View className={styles.footerDivider} />
        <View className={styles.footerItem}>
          <View className={styles.footerLabel}>状态</View>
          <View className={classnames(
            styles.footerValue,
            styles[`status-${goal.status}`]
          )}>
            {goal.status === 'active' ? '进行中' : goal.status === 'completed' ? '已完成' : '已归档'}
          </View>
        </View>
      </View>
    </View>
  )
}

export default GoalCard
