import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import classnames from 'classnames'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  color?: 'primary' | 'success' | 'warning' | 'secondary' | 'accent'
  trend?: {
    value: number
    isUp: boolean
  }
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend
}) => {
  return (
    <View className={classnames(styles.statCard, styles[`color-${color}`])}>
      <View className={styles.cardIcon}>
        <Text className={styles.iconText}>{icon}</Text>
      </View>
      <View className={styles.cardContent}>
        <View className={styles.cardTitle}>{title}</View>
        <View className={styles.cardValue}>
          <Text className={styles.valueText}>{value}</Text>
          {trend && (
            <View className={classnames(
              styles.trendTag,
              trend.isUp ? styles.trendUp : styles.trendDown
            )}>
              {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
            </View>
          )}
        </View>
        {subtitle && <View className={styles.cardSubtitle}>{subtitle}</View>}
      </View>
    </View>
  )
}

export default StatCard
