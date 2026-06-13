import React, { useState, useMemo } from 'react'
import { View, Text, Textarea, Button, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useGoalContext } from '@/store/GoalContext'
import { getWeekNumber, formatDate, getWeekStartEnd } from '@/utils/dateUtil'
import type { Goal } from '@/types/goal'

const CreateReviewPage: React.FC = () => {
  const { goals, addReview } = useGoalContext()

  const currentDate = new Date()
  const weekNumber = getWeekNumber(currentDate)
  const year = currentDate.getFullYear()
  const weekRange = getWeekStartEnd(weekNumber, year)

  const [progressSummary, setProgressSummary] = useState('')
  const [obstacles, setObstacles] = useState('')
  const [nextWeekPlan, setNextWeekPlan] = useState('')
  const [highlightInput, setHighlightInput] = useState('')
  const [highlights, setHighlights] = useState<string[]>([])

  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals])

  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return
    setHighlights(prev => [...prev, highlightInput.trim()])
    setHighlightInput('')
  }

  const handleRemoveHighlight = (index: number) => {
    setHighlights(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!progressSummary.trim()) {
      Taro.showToast({ title: '请填写本周进展', icon: 'none' })
      return
    }
    if (!obstacles.trim()) {
      Taro.showToast({ title: '请填写遇到的阻碍', icon: 'none' })
      return
    }
    if (!nextWeekPlan.trim()) {
      Taro.showToast({ title: '请填写下周计划', icon: 'none' })
      return
    }

    const goalProgress = activeGoals.map(goal => ({
      goalId: goal.id,
      goalTitle: goal.title,
      progress: goal.progress,
      completedTasks: goal.completedTasks,
      totalTasks: goal.totalTasks
    }))

    try {
      await addReview({
        weekNumber,
        year,
        startDate: formatDate(weekRange.start),
        endDate: formatDate(weekRange.end),
        progressSummary: progressSummary.trim(),
        obstacles: obstacles.trim(),
        nextWeekPlan: nextWeekPlan.trim(),
        highlights,
        goalProgress
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 500)
    } catch (error) {
      console.error('[CreateReview] 保存失败:', error)
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.weekInfo}>
          <Text className={styles.weekTitle}>第 {weekNumber} 周</Text>
          <Text className={styles.weekDate}>
            {formatDate(weekRange.start)} ~ {formatDate(weekRange.end)}
          </Text>
        </View>
        <View className={styles.goalsSummary}>
          <Text className={styles.summaryLabel}>进行中目标: {activeGoals.length} 个</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.formSection}>
          <View className={styles.formItem}>
            <Text className={styles.label}>
              📈 本周进展 <Text className={styles.required}>*</Text>
            </Text>
            <Textarea
              className={styles.textarea}
              placeholder='这周完成了什么？取得了哪些进展？...'
              value={progressSummary}
              onInput={(e) => setProgressSummary(e.detail.value)}
              maxlength={500}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>
              🚧 遇到的阻碍 <Text className={styles.required}>*</Text>
            </Text>
            <Textarea
              className={styles.textarea}
              placeholder='遇到了什么困难？哪些地方需要改进？...'
              value={obstacles}
              onInput={(e) => setObstacles(e.detail.value)}
              maxlength={500}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>
              🎯 下周调整 <Text className={styles.required}>*</Text>
            </Text>
            <Textarea
              className={styles.textarea}
              placeholder='下周的重点是什么？如何改进？...'
              value={nextWeekPlan}
              onInput={(e) => setNextWeekPlan(e.detail.value)}
              maxlength={500}
            />
          </View>
        </View>

        <View className={styles.formSection}>
          <View className={styles.formItem}>
            <Text className={styles.label}>✨ 本周亮点</Text>
            <View className={styles.highlightsList}>
              {highlights.map((highlight, index) => (
                <View key={index} className={styles.highlightItem}>
                  <Text className={styles.highlightText}>• {highlight}</Text>
                  <Text
                    className={styles.highlightRemove}
                    onClick={() => handleRemoveHighlight(index)}
                  >
                    ×
                  </Text>
                </View>
              ))}
            </View>
            <View className={styles.addHighlightRow}>
              <Input
                className={styles.highlightInput}
                placeholder='添加一个亮点...'
                value={highlightInput}
                onInput={(e) => setHighlightInput(e.detail.value)}
                maxlength={50}
                confirmType='done'
                onConfirm={handleAddHighlight}
              />
              <Button className={styles.addHighlightBtn} onClick={handleAddHighlight}>
                +
              </Button>
            </View>
          </View>
        </View>

        {activeGoals.length > 0 && (
          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>📊 目标进度</Text>
            {activeGoals.map(goal => (
              <View key={goal.id} className={styles.goalProgressItem}>
                <View className={styles.goalProgressHeader}>
                  <Text className={styles.goalProgressTitle}>{goal.title}</Text>
                  <Text className={styles.goalProgressValue}>{goal.progress}%</Text>
                </View>
                <View className={styles.goalProgressBar}>
                  <View
                    className={styles.goalProgressFill}
                    style={{ width: `${goal.progress}%` }}
                  />
                </View>
                <View className={styles.goalProgressDetail}>
                  已完成 {goal.completedTasks} / {goal.totalTasks} 个任务
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className={styles.footer}>
        <Button className={styles.cancelBtn} onClick={() => Taro.navigateBack()}>
          取消
        </Button>
        <Button className={styles.submitBtn} onClick={handleSave}>
          💾 保存复盘
        </Button>
      </View>
    </View>
  )
}

export default CreateReviewPage
