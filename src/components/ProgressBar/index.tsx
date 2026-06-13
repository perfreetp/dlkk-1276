import React from 'react'
import { View } from '@tarojs/components'
import styles from './index.module.scss'
import classnames from 'classnames'

interface ProgressBarProps {
  progress: number
  color?: 'primary' | 'success' | 'warning' | 'error' | 'secondary'
  height?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'primary',
  height = 'md',
  showLabel = false
}) => {
  const safeProgress = Math.min(100, Math.max(0, progress))

  return (
    <View className={styles.progressWrapper}>
      <View
        className={classnames(
          styles.progressBar,
          styles[`height-${height}`]
        )}
      >
        <View
          className={classnames(
            styles.progressFill,
            styles[`color-${color}`]
          )}
          style={{ width: `${safeProgress}%` }}
        />
      </View>
      {showLabel && (
        <View className={styles.progressLabel}>{Math.round(safeProgress)}%</View>
      )}
    </View>
  )
}

export default ProgressBar
