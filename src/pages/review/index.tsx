import React, { useState } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { mockWeeklyReviews } from '@/data/mockData'
import type { WeeklyReview } from '@/types/goal'

type FilterType = 'all' | 'completed' | 'draft'

const ReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<WeeklyReview[]>(mockWeeklyReviews)
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredReviews = reviews.filter(r => {
    if (filter === 'all') return true
    if (filter === 'completed') return true
    return false
  })

  const completedCount = reviews.length

  const handleCreateReview = () => {
    Taro.showToast({ title: '创建本周复盘', icon: 'none' })
    console.log('[Review] 创建新复盘')
  }

  const handleViewDetail = (review: WeeklyReview) => {
    console.log('[Review] 查看复盘详情:', review.weekNumber)
  }

  const handleExportImage = (review: WeeklyReview) => {
    Taro.showToast({ title: '导出复盘长图', icon: 'none' })
    console.log('[Review] 导出复盘长图:', review.weekNumber)
  }

  const handleShare = (review: WeeklyReview) => {
    Taro.showToast({ title: '生成分享海报', icon: 'none' })
    console.log('[Review] 分享复盘:', review.weekNumber)
  }

  const handleTemplate = () => {
    Taro.showToast({ title: '复盘模板功能', icon: 'none' })
  }

  const handleRemind = () => {
    Taro.showToast({ title: '设置提醒', icon: 'none' })
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <View className={styles.headerTitle}>复盘记录 📝</View>
        <View className={styles.headerSubtitle}>
          每周复盘，让成长有迹可循
        </View>
        <View className={styles.headerStats}>
          <View className={styles.headerStat}>
            <View className={styles.statValue}>{completedCount}</View>
            <View className={styles.statLabel}>已完成复盘</View>
          </View>
          <View className={styles.headerStat}>
            <View className={styles.statValue}>连续 3 周</View>
            <View className={styles.statLabel}>复盘坚持</View>
          </View>
        </View>
      </View>

      <View className={styles.actionsBar}>
        <Button
          className={classnames(styles.actionBtn, styles.primary)}
          onClick={handleCreateReview}
        >
          + 本周复盘
        </Button>
        <Button className={styles.actionBtn} onClick={handleTemplate}>
          📋 模板
        </Button>
        <Button className={styles.actionBtn} onClick={handleRemind}>
          ⏰ 提醒
        </Button>
      </View>

      <View className={styles.filterTabs}>
        <Button
          className={classnames(styles.filterTab, filter === 'all' && styles.active)}
          onClick={() => setFilter('all')}
        >
          全部
        </Button>
        <Button
          className={classnames(styles.filterTab, filter === 'completed' && styles.active)}
          onClick={() => setFilter('completed')}
        >
          已完成
        </Button>
        <Button
          className={classnames(styles.filterTab, filter === 'draft' && styles.active)}
          onClick={() => setFilter('draft')}
        >
          草稿
        </Button>
      </View>

      <ScrollView scrollY className={styles.reviewList}>
        {filteredReviews.length > 0 ? (
          filteredReviews.map(review => (
            <View
              key={review.id}
              className={styles.reviewCard}
              onClick={() => handleViewDetail(review)}
            >
              <View className={styles.reviewHeader}>
                <View className={styles.weekBadge}>
                  <View>
                    <View className={styles.weekNumber}>第 {review.weekNumber} 周</View>
                    <View className={styles.weekDate}>
                      {review.startDate} ~ {review.endDate}
                    </View>
                  </View>
                </View>
                <View className={classnames(styles.reviewStatus, 'completed')}>已完成</View>
              </View>

              <View className={styles.reviewSummary}>{review.progressSummary}</View>

              <View className={styles.highlightsSection}>
                <View className={styles.highlightsTitle}>本周亮点</View>
                <View className={styles.highlightsList}>
                  {review.highlights.map((highlight, index) => (
                    <View key={index} className={styles.highlightTag}>
                      ✨ {highlight}
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.goalProgressSection}>
                <View className={styles.goalProgressTitle}>目标进度</View>
                {review.goalProgress.slice(0, 3).map(gp => (
                  <View key={gp.goalId} className={styles.goalProgressItem}>
                    <Text className={styles.goalName}>{gp.goalTitle}</Text>
                    <Text className={styles.goalProgressValue}>{gp.progress}%</Text>
                  </View>
                ))}
              </View>

              <View className={styles.reviewFooter}>
                <View className={styles.footerActions}>
                  <Button
                    className={classnames(styles.footerBtn, styles.primary)}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExportImage(review)
                    }}
                  >
                    🖼️ 导出长图
                  </Button>
                  <Button
                    className={styles.footerBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare(review)
                    }}
                  >
                    📤 分享
                  </Button>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>📝</View>
            <View className={styles.emptyTitle}>还没有复盘记录</View>
            <View className={styles.emptyDesc}>
              每周花15分钟复盘，{'\n'}
              让成长有迹可循
            </View>
            <Button className={styles.createBtn} onClick={handleCreateReview}>
              + 创建本周复盘
            </Button>
          </View>
        )}
      </ScrollView>

      <Button className={styles.fabButton} onClick={handleCreateReview}>
        +
      </Button>
    </View>
  )
}

export default ReviewPage
