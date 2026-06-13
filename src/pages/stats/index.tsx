import React, { useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useGoalContext } from '@/store/GoalContext'
import type { Goal } from '@/types/goal'
import { formatMinutes } from '@/utils/dateUtil'

const StatsPage: React.FC = () => {
  const { goals, reviews, pomodoroSessions, refreshData, calculateStats } = useGoalContext()

  useDidShow(async () => {
    await refreshData()
  })

  const stats = useMemo(() => calculateStats(), [goals, reviews, pomodoroSessions])

  const weekDays = ['一', '二', '三', '四', '五', '六', '日']
  const weekFocusMinutes = [60, 90, 75, 120, 85, 110, 0]
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  const handleExportReport = () => {
    Taro.showToast({ title: '导出数据报告', icon: 'none' })
    console.log('[Stats] 导出数据报告')
  }

  const handleViewDetail = () => {
    Taro.showToast({ title: '查看详细统计', icon: 'none' })
  }

  const handleRiskClick = (risk: typeof stats.riskGoals[0]) => {
    console.log('[Stats] 查看风险目标:', risk.title)
    Taro.showToast({ title: `风险目标：${risk.title}`, icon: 'none' })
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const archivedGoals = goals.filter(g => g.status === 'archived')
  const completedPomodoros = pomodoroSessions.filter(p => p.completed).length

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <View className={styles.headerTitle}>数据统计 📊</View>
        <View className={styles.headerSubtitle}>
          用数据见证你的成长
        </View>
        <View className={styles.streakHighlight}>
          <Text className={styles.streakIcon}>🔥</Text>
          <View>
            <Text className={styles.streakValue}>{stats.streakDays}</Text>
            <Text className={styles.streakLabel}>连续推进天数</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsOverview}>
        <View className={styles.overviewCard}>
          <View className={styles.overviewIcon}>🎯</View>
          <View className={classnames(styles.overviewValue, styles.primary)}>
            {stats.completionRate}%
          </View>
          <View className={styles.overviewLabel}>整体完成率</View>
          <View className={styles.overviewSub}>
            {stats.completedDailyActions}/{stats.totalDailyActions} 个行动
          </View>
        </View>
        <View className={styles.overviewCard}>
          <View className={styles.overviewIcon}>⏱️</View>
          <View className={classnames(styles.overviewValue, styles.success)}>
            {formatMinutes(stats.weekFocusMinutes)}
          </View>
          <View className={styles.overviewLabel}>本周专注</View>
          <View className={styles.overviewSub}>
            日均 {Math.round(stats.weekFocusMinutes / 7)} 分钟
          </View>
        </View>
        <View className={styles.overviewCard}>
          <View className={styles.overviewIcon}>✅</View>
          <View className={classnames(styles.overviewValue, styles.secondary)}>
            {stats.completedGoals}
          </View>
          <View className={styles.overviewLabel}>已完成目标</View>
          <View className={styles.overviewSub}>
            共 {stats.totalGoals} 个目标
          </View>
        </View>
        <View className={styles.overviewCard}>
          <View className={styles.overviewIcon}>📚</View>
          <View className={classnames(styles.overviewValue, styles.warning)}>
            {formatMinutes(stats.totalFocusMinutes)}
          </View>
          <View className={styles.overviewLabel}>累计专注</View>
          <View className={styles.overviewSub}>
            总投入时间
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>本周专注时间</Text>
          <Text className={styles.sectionAction} onClick={handleViewDetail}>
            详情
          </Text>
        </View>
        <View className={styles.weekChart}>
          {weekDays.map((day, index) => (
            <View key={index} className={styles.weekDay}>
              <Text className={styles.timeValue}>
                {weekFocusMinutes[index] > 0 ? `${Math.round(weekFocusMinutes[index] / 60)}h` : ''}
              </Text>
              <View className={styles.barContainer}>
                <View
                  className={classnames(
                    styles.barFill,
                    index === todayIndex && styles.today
                  )}
                  style={{
                    height: `${Math.max(weekFocusMinutes[index] / 120 * 100, 8)}%`
                  }}
                />
              </View>
              <Text className={styles.dayLabel}>{day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>目标进度</Text>
          <Text className={styles.sectionAction} onClick={handleExportReport}>
            导出
          </Text>
        </View>
        <View className={styles.goalProgressList}>
          {activeGoals.map(goal => (
            <View key={goal.id} className={styles.goalProgressItem}>
              <View className={styles.goalProgressHeader}>
                <Text className={styles.goalName}>{goal.title}</Text>
                <Text className={styles.goalPercent}>{goal.progress}%</Text>
              </View>
              <View className={styles.goalProgressBar}>
                <View
                  className={styles.goalProgressFill}
                  style={{
                    width: `${goal.progress}%`,
                    background: goal.progress >= 80
                      ? 'linear-gradient(90deg, #10B981, #36D399)'
                      : 'linear-gradient(90deg, #5B8DEF, #8AB4F8)'
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.riskSection}>
        <Text className={styles.riskTitle}>⚠️ 目标风险提示</Text>
        {stats.riskGoals.length > 0 ? (
          stats.riskGoals.map(risk => (
            <View
              key={risk.id}
              className={classnames(styles.riskCard, styles[risk.riskLevel])}
              onClick={() => handleRiskClick(risk)}
            >
              <View className={styles.riskHeader}>
                <Text className={styles.riskGoalName}>{risk.title}</Text>
                <View className={classnames(styles.riskLevel, styles[risk.riskLevel])}>
                  {risk.riskLevel === 'high' ? '高风险' : risk.riskLevel === 'medium' ? '中风险' : '低风险'}
                </View>
              </View>
              <Text className={styles.riskReason}>{risk.reason}</Text>
            </View>
          ))
        ) : (
          <View className={styles.section}>
            <Text style={{ fontSize: '60rpx', textAlign: 'center', display: 'block', marginBottom: '16rpx' }}>🎉</Text>
            <Text style={{ fontSize: '28rpx', color: '#4E5969', textAlign: 'center', display: 'block' }}>
              所有目标进展顺利，继续保持！
            </Text>
          </View>
        )}
      </View>

      <View className={styles.moreStats}>
        <View className={styles.moreStatCard}>
          <View className={classnames(styles.moreStatIcon, styles.primary)}>📝</View>
          <View className={styles.moreStatInfo}>
            <View className={styles.moreStatValue}>{reviews.length}</View>
            <View className={styles.moreStatLabel}>已完成复盘</View>
          </View>
        </View>
        <View className={styles.moreStatCard}>
          <View className={classnames(styles.moreStatIcon, styles.success)}>🍅</View>
          <View className={styles.moreStatInfo}>
            <View className={styles.moreStatValue}>{completedPomodoros}</View>
            <View className={styles.moreStatLabel}>完成番茄</View>
          </View>
        </View>
        <View className={styles.moreStatCard}>
          <View className={classnames(styles.moreStatIcon, styles.secondary)}>📁</View>
          <View className={styles.moreStatInfo}>
            <View className={styles.moreStatValue}>{archivedGoals.length}</View>
            <View className={styles.moreStatLabel}>已归档</View>
          </View>
        </View>
        <View className={styles.moreStatCard}>
          <View className={classnames(styles.moreStatIcon, styles.warning)}>👥</View>
          <View className={styles.moreStatInfo}>
            <View className={styles.moreStatValue}>2</View>
            <View className={styles.moreStatLabel}>监督好友</View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default StatsPage
