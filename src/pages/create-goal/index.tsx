import React, { useState } from 'react'
import { View, Text, Input, Textarea, Button, Switch, Picker } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useGoalContext } from '@/store/GoalContext'
import { formatDate, getToday } from '@/utils/dateUtil'
import type { Priority } from '@/types/goal'

const categories = [
  { value: 'exam', label: '📚 考证' },
  { value: 'career', label: '💼 职业发展' },
  { value: 'health', label: '💪 健康' },
  { value: 'learning', label: '🎓 学习成长' },
  { value: 'wealth', label: '💰 财富' },
  { value: 'other', label: '📝 其他' }
]

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: '🔥 高优先级', color: '#EF4444' },
  { value: 'medium', label: '⚡ 中优先级', color: '#F59E0B' },
  { value: 'low', label: '🌱 低优先级', color: '#10B981' }
]

const CreateGoalPage: React.FC = () => {
  const { addGoal } = useGoalContext()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [metric, setMetric] = useState('')
  const [startDate, setStartDate] = useState(getToday())
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('09:00')
  const [category, setCategory] = useState('learning')

  const handleSubmit = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入目标标题', icon: 'none' })
      return
    }
    if (!metric.trim()) {
      Taro.showToast({ title: '请输入衡量标准', icon: 'none' })
      return
    }
    if (!deadline) {
      Taro.showToast({ title: '请选择截止日期', icon: 'none' })
      return
    }

    try {
      await addGoal({
        title: title.trim(),
        description: description.trim(),
        metric: metric.trim(),
        startDate,
        deadline,
        priority,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : undefined,
        category
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 500)
    } catch (error) {
      console.error('[CreateGoal] 保存失败:', error)
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
  }

  const categoryIndex = categories.findIndex(c => c.value === category)
  const priorityIndex = priorities.findIndex(p => p.value === priority)

  return (
    <View className={styles.pageContainer}>
      <View className={styles.formSection}>
        <View className={styles.formItem}>
          <Text className={styles.label}>
            目标标题 <Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={styles.input}
            placeholder='例如：通过PMP项目管理考试'
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>目标描述</Text>
          <Textarea
            className={styles.textarea}
            placeholder='简单描述一下这个目标的背景和重要性...'
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={200}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            衡量标准 <Text className={styles.required}>*</Text>
          </Text>
          <Textarea
            className={styles.textarea}
            placeholder='成功的具体指标是什么？例如：考试分数达到X分，完成X个任务...'
            value={metric}
            onInput={(e) => setMetric(e.detail.value)}
            maxlength={200}
          />
        </View>
      </View>

      <View className={styles.formSection}>
        <View className={styles.formItem}>
          <Text className={styles.label}>
            截止日期 <Text className={styles.required}>*</Text>
          </Text>
          <Picker
            mode='date'
            value={deadline}
            start={startDate}
            onChange={(e) => setDeadline(e.detail.value)}
          >
            <View className={styles.picker}>
              <Text className={deadline ? styles.pickerValue : styles.pickerPlaceholder}>
                {deadline || '请选择截止日期'}
              </Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>开始日期</Text>
          <Picker
            mode='date'
            value={startDate}
            onChange={(e) => setStartDate(e.detail.value)}
          >
            <View className={styles.picker}>
              <Text className={styles.pickerValue}>{startDate}</Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>优先级</Text>
          <View className={styles.priorityOptions}>
            {priorities.map((p, index) => (
              <Button
                key={p.value}
                className={classnames(
                  styles.priorityOption,
                  priorityIndex === index && styles.priorityActive
                )}
                style={{
                  borderColor: priorityIndex === index ? p.color : '#E5E7EB',
                  color: priorityIndex === index ? p.color : '#6B7280'
                }}
                onClick={() => setPriority(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <View className={styles.formItem}>
          <View className={styles.reminderRow}>
            <Text className={styles.label}>开启提醒</Text>
            <Switch
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.detail.value)}
              color='#5B8DEF'
            />
          </View>
          {reminderEnabled && (
            <Picker
              mode='time'
              value={reminderTime}
              onChange={(e) => setReminderTime(e.detail.value)}
            >
              <View className={styles.picker}>
                <Text className={styles.pickerValue}>每天 {reminderTime} 提醒</Text>
                <Text className={styles.pickerArrow}>›</Text>
              </View>
            </Picker>
          )}
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>分类</Text>
          <View className={styles.categoryGrid}>
            {categories.map((cat, index) => (
              <Button
                key={cat.value}
                className={classnames(
                  styles.categoryItem,
                  categoryIndex === index && styles.categoryActive
                )}
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <Button className={styles.cancelBtn} onClick={() => Taro.navigateBack()}>
          取消
        </Button>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          保存目标
        </Button>
      </View>
    </View>
  )
}

export default CreateGoalPage
