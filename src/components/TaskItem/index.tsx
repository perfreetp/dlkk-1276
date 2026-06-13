import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import classnames from 'classnames'
import type { DailyAction } from '@/types/goal'
import { mockGoals } from '@/data/mockData'

interface TaskItemProps {
  task: DailyAction
  onToggle?: (id: string) => void
  onDelay?: (id: string) => void
  onStartPomodoro?: (id: string) => void
  showGoalName?: boolean
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelay,
  onStartPomodoro,
  showGoalName = true
}) => {
  const goal = mockGoals.find(g => g.id === task.goalId)

  const handleToggle = () => {
    onToggle?.(task.id)
  }

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'high'
      case 'medium': return 'medium'
      case 'low': return 'low'
      default: return 'low'
    }
  }

  const isCompleted = task.status === 'completed'
  const isInProgress = task.status === 'in-progress'
  const isDelayed = task.status === 'delayed'

  return (
    <View
      className={classnames(
        styles.taskItem,
        isCompleted && styles.completed,
        isDelayed && styles.delayed,
        task.isTemporary && styles.temporary
      )}
    >
      <View className={styles.checkboxWrap} onClick={handleToggle}>
        <View className={classnames(
          styles.checkbox,
          isCompleted && styles.checked
        )}>
          {isCompleted && <Text className={styles.checkIcon}>✓</Text>}
        </View>
      </View>

      <View className={styles.taskContent}>
        <View className={styles.taskTitle}>
          {task.title}
          {task.isTemporary && (
            <Text className={styles.tempTag}>临时</Text>
          )}
        </View>

        {showGoalName && goal && (
          <View className={styles.goalName}>· {goal.title}</View>
        )}

        <View className={styles.taskMeta}>
          <View className={classnames(
            styles.priorityDot,
            styles[`priority-${getPriorityColor()}`]
          )} />
          <Text className={styles.metaText}>
            {task.pomodoroCount}个番茄 · 预估{task.estimatedMinutes}分钟
          </Text>
          {task.completedMinutes > 0 && (
            <Text className={styles.metaText}>
              已完成{task.completedMinutes}分钟
            </Text>
          )}
        </View>

        {task.delayReason && (
          <View className={styles.delayReason}>
            <Text className={styles.delayLabel}>延期原因：</Text>
            <Text className={styles.delayText}>{task.delayReason}</Text>
          </View>
        )}
      </View>

      <View className={styles.taskActions}>
        {!isCompleted && (
          <View
            className={classnames(
              styles.actionBtn,
              styles.pomodoroBtn
            )}
            onClick={(e) => {
              e.stopPropagation()
              onStartPomodoro?.(task.id)
            }}
          >
            <Text className={styles.pomodoroIcon}>🍅</Text>
          </View>
        )}
        {!isCompleted && !isDelayed && (
          <View
            className={classnames(
              styles.actionBtn,
              styles.delayBtn
            )}
            onClick={(e) => {
              e.stopPropagation()
              onDelay?.(task.id)
            }}
          >
            <Text className={styles.delayIcon}>⏰</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default TaskItem
