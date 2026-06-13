import React, { useState, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import GoalCard from '@/components/GoalCard'
import { goalTemplates } from '@/data/mockData'
import { useGoalContext } from '@/store/GoalContext'
import type { Goal } from '@/types/goal'

type FilterType = 'all' | 'active' | 'completed' | 'archived'

const GoalBoardPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('active')
  const { goals, refreshData, loading } = useGoalContext()

  useDidShow(async () => {
    await refreshData()
  })

  const filteredGoals = useMemo(() => goals.filter(goal => {
    if (filter === 'all') return true
    return goal.status === filter
  }), [goals, filter])

  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals])
  const completedGoals = useMemo(() => goals.filter(g => g.status === 'completed'), [goals])
  const archivedGoals = useMemo(() => goals.filter(g => g.status === 'archived'), [goals])

  const handleCreateGoal = () => {
    Taro.navigateTo({ url: '/pages/create-goal/index' })
  }

  const handleTemplateClick = (template: typeof goalTemplates[0]) => {
    Taro.showToast({ title: `使用模板：${template.title}`, icon: 'none' })
  }

  const handleGoalClick = (goal: Goal) => {
    Taro.navigateTo({ url: `/pages/goal-detail/index?id=${goal.id}` })
  }

  const handleArchive = () => {
    setFilter('archived')
  }

  const handleShare = () => {
    Taro.showToast({ title: '好友监督码功能', icon: 'none' })
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <View className={styles.headerTop}>
          <View className={styles.greeting}>你好，追梦人 👋</View>
          <View className={styles.headerActions}>
            <Button className={styles.headerBtn} onClick={handleArchive}>📁</Button>
            <Button className={styles.headerBtn} onClick={handleShare}>👥</Button>
          </View>
        </View>

        <View className={styles.quickStats}>
          <View className={styles.quickStat}>
            <View className={styles.quickStatValue}>{activeGoals.length}</View>
            <View className={styles.quickStatLabel}>进行中</View>
          </View>
          <View className={styles.quickStat}>
            <View className={styles.quickStatValue}>{completedGoals.length}</View>
            <View className={styles.quickStatLabel}>已完成</View>
          </View>
          <View className={styles.quickStat}>
            <View className={styles.quickStatValue}>{archivedGoals.length}</View>
            <View className={styles.quickStatLabel}>已归档</View>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.filterTabs}>
          <Button
            className={classnames(styles.filterTab, filter === 'active' && styles.active)}
            onClick={() => setFilter('active')}
          >
            进行中
          </Button>
          <Button
            className={classnames(styles.filterTab, filter === 'completed' && styles.active)}
            onClick={() => setFilter('completed')}
          >
            已完成
          </Button>
          <Button
            className={classnames(styles.filterTab, filter === 'archived' && styles.active)}
            onClick={() => setFilter('archived')}
          >
            已归档
          </Button>
          <Button
            className={classnames(styles.filterTab, filter === 'all' && styles.active)}
            onClick={() => setFilter('all')}
          >
            全部
          </Button>
        </View>
      </View>

      <ScrollView scrollY className={styles.goalsList}>
        {filteredGoals.length > 0 ? (
          filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => handleGoalClick(goal)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>🎯</View>
            <View className={styles.emptyTitle}>还没有目标</View>
            <View className={styles.emptyDesc}>创建你的第一个季度目标，开启成长之旅</View>
            <Button className={styles.createBtn} onClick={handleCreateGoal}>
              + 创建目标
            </Button>
          </View>
        )}

        {filter === 'active' && activeGoals.length > 0 && (
          <View className={styles.templatesSection}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>目标模板</Text>
              <Text className={styles.sectionAction}>更多模板</Text>
            </View>
            <View className={styles.templatesGrid}>
              {goalTemplates.map(template => (
                <View
                  key={template.id}
                  className={styles.templateCard}
                  onClick={() => handleTemplateClick(template)}
                >
                  <View className={styles.templateIcon}>{template.icon}</View>
                  <View className={styles.templateTitle}>{template.title}</View>
                  <View className={styles.templateDesc}>{template.description}</View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <Button className={styles.fabButton} onClick={handleCreateGoal}>
        +
      </Button>
    </View>
  )
}

export default GoalBoardPage
