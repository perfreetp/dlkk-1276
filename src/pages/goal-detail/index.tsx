import React, { useState, useMemo } from 'react'
import { View, Text, Input, Textarea, Button, Switch, Picker, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useGoalContext } from '@/store/GoalContext'
import { getToday, getDaysRemaining } from '@/utils/dateUtil'
import ProgressBar from '@/components/ProgressBar'
import type { Priority, Goal } from '@/types/goal'

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

const GoalDetailPage: React.FC = () => {
  const router = useRouter()
  const goalId = router.params.id as string
  const { getGoalById, updateGoal, archiveGoal, restoreGoal, deleteGoal, goals } = useGoalContext()

  const goal = useMemo(() => getGoalById(goalId), [goals, goalId, getGoalById])

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(goal?.title || '')
  const [description, setDescription] = useState(goal?.description || '')
  const [metric, setMetric] = useState(goal?.metric || '')
  const [startDate, setStartDate] = useState(goal?.startDate || getToday())
  const [deadline, setDeadline] = useState(goal?.deadline || '')
  const [priority, setPriority] = useState<Priority>(goal?.priority || 'medium')
  const [reminderEnabled, setReminderEnabled] = useState(goal?.reminderEnabled || false)
  const [reminderTime, setReminderTime] = useState(goal?.reminderTime || '09:00')
  const [category, setCategory] = useState(goal?.category || 'learning')

  useDidShow(() => {
    if (goal) {
      setTitle(goal.title)
      setDescription(goal.description)
      setMetric(goal.metric)
      setStartDate(goal.startDate)
      setDeadline(goal.deadline)
      setPriority(goal.priority)
      setReminderEnabled(goal.reminderEnabled)
      setReminderTime(goal.reminderTime || '09:00')
      setCategory(goal.category)
    }
  })

  if (!goal) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>❌</Text>
          <Text className={styles.emptyTitle}>目标不存在</Text>
          <Button className={styles.backBtn} onClick={() => Taro.navigateBack()}>
            返回
          </Button>
        </View>
      </View>
    )
  }

  const daysRemaining = getDaysRemaining(goal.deadline)

  const handleSave = async () => {
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
      await updateGoal(goalId, {
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

      Taro.showToast({ title: '保存成功', icon: 'success' })
      setIsEditing(false)
    } catch (error) {
      console.error('[GoalDetail] 保存失败:', error)
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
  }

  const handleArchive = async () => {
    Taro.showModal({
      title: '确认归档',
      content: '归档后该目标将从进行中列表移除，你可以在已归档中查看和恢复。',
      success: async (res) => {
        if (res.confirm) {
          await archiveGoal(goalId)
          setTimeout(() => Taro.navigateBack(), 500)
        }
      }
    })
  }

  const handleRestore = async () => {
    await restoreGoal(goalId)
    setTimeout(() => Taro.navigateBack(), 500)
  }

  const handleDelete = async () => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后数据将无法恢复，确定要删除这个目标吗？',
      confirmColor: '#EF4444',
      success: async (res) => {
        if (res.confirm) {
          await deleteGoal(goalId)
          Taro.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 500)
        }
      }
    })
  }

  const categoryIndex = categories.findIndex(c => c.value === category)
  const priorityIndex = priorities.findIndex(p => p.value === priority)
  const categoryLabel = categories[categoryIndex]?.label || '其他'

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <View className={styles.statusBadge}>
            {goal.status === 'active' && '进行中'}
            {goal.status === 'archived' && '已归档'}
            {goal.status === 'completed' && '已完成'}
          </View>
          <View className={styles.daysInfo}>
            {daysRemaining > 0 ? (
              <Text>还剩 <Text className={styles.daysHighlight}>{daysRemaining}</Text> 天</Text>
            ) : daysRemaining === 0 ? (
              <Text className={styles.daysWarning}>今天截止</Text>
            ) : (
              <Text className={styles.daysOverdue}>已逾期 {Math.abs(daysRemaining)} 天</Text>
            )}
          </View>
        </View>

        <View className={styles.progressSection}>
          <View className={styles.progressHeader}>
            <Text className={styles.progressLabel}>整体进度</Text>
            <Text className={styles.progressValue}>{goal.progress}%</Text>
          </View>
          <ProgressBar progress={goal.progress} height={12} />
          <View className={styles.taskStats}>
            <Text>已完成 {goal.completedTasks} / {goal.totalTasks} 个阶段任务</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        {!isEditing ? (
          <View className={styles.viewMode}>
            <View className={styles.cardSection}>
              <Text className={styles.sectionTitle}>目标信息</Text>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>标题</Text>
                <Text className={styles.infoValue}>{goal.title}</Text>
              </View>
              {goal.description && (
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>描述</Text>
                  <Text className={styles.infoValue}>{goal.description}</Text>
                </View>
              )}
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>衡量标准</Text>
                <Text className={styles.infoValue}>{goal.metric}</Text>
              </View>
              <View className={styles.infoRow}>
                <View className={styles.infoItemHalf}>
                  <Text className={styles.infoLabel}>开始日期</Text>
                  <Text className={styles.infoValue}>{goal.startDate}</Text>
                </View>
                <View className={styles.infoItemHalf}>
                  <Text className={styles.infoLabel}>截止日期</Text>
                  <Text className={styles.infoValue}>{goal.deadline}</Text>
                </View>
              </View>
              <View className={styles.infoRow}>
                <View className={styles.infoItemHalf}>
                  <Text className={styles.infoLabel}>优先级</Text>
                  <Text
                    className={styles.infoValue}
                    style={{ color: priorities[priorityIndex]?.color }}
                  >
                    {priorities[priorityIndex]?.label}
                  </Text>
                </View>
                <View className={styles.infoItemHalf}>
                  <Text className={styles.infoLabel}>分类</Text>
                  <Text className={styles.infoValue}>{categoryLabel}</Text>
                </View>
              </View>
              {goal.reminderEnabled && (
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>提醒</Text>
                  <Text className={styles.infoValue}>每天 {goal.reminderTime} 🔔</Text>
                </View>
              )}
            </View>

            <View className={styles.cardSection}>
              <Text className={styles.sectionTitle}>拆解进度</Text>
              <View className={styles.breakdownStats}>
                <View className={styles.breakdownStat}>
                  <Text className={styles.breakdownStatValue}>{goal.stageTasks.length}</Text>
                  <Text className={styles.breakdownStatLabel}>阶段任务</Text>
                </View>
                <View className={styles.breakdownStat}>
                  <Text className={styles.breakdownStatValue}>{goal.weeklyMilestones.length}</Text>
                  <Text className={styles.breakdownStatLabel}>里程碑</Text>
                </View>
                <View className={styles.breakdownStat}>
                  <Text className={styles.breakdownStatValue}>
                    {goal.stageTasks.filter(t => t.status === 'completed').length}
                  </Text>
                  <Text className={styles.breakdownStatLabel}>已完成</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View className={styles.editMode}>
            <View className={styles.formSection}>
              <View className={styles.formItem}>
                <Text className={styles.label}>
                  目标标题 <Text className={styles.required}>*</Text>
                </Text>
                <Input
                  className={styles.input}
                  value={title}
                  onInput={(e) => setTitle(e.detail.value)}
                  maxlength={50}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.label}>目标描述</Text>
                <Textarea
                  className={styles.textarea}
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
                  value={metric}
                  onInput={(e) => setMetric(e.detail.value)}
                  maxlength={200}
                />
              </View>
            </View>

            <View className={styles.formSection}>
              <View className={styles.formItem}>
                <Text className={styles.label}>截止日期</Text>
                <Picker
                  mode='date'
                  value={deadline}
                  start={startDate}
                  onChange={(e) => setDeadline(e.detail.value)}
                >
                  <View className={styles.picker}>
                    <Text className={styles.pickerValue}>{deadline}</Text>
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
          </View>
        )}
      </ScrollView>

      <View className={styles.footer}>
        {!isEditing ? (
          <>
            <Button className={styles.secondaryBtn} onClick={handleDelete}>
              🗑️ 删除
            </Button>
            {goal.status === 'active' ? (
              <Button className={styles.secondaryBtn} onClick={handleArchive}>
                📁 归档
              </Button>
            ) : goal.status === 'archived' ? (
              <Button className={styles.secondaryBtn} onClick={handleRestore}>
                ↩️ 恢复
              </Button>
            ) : null}
            <Button className={styles.primaryBtn} onClick={() => setIsEditing(true)}>
              ✏️ 编辑
            </Button>
          </>
        ) : (
          <>
            <Button className={styles.secondaryBtn} onClick={() => setIsEditing(false)}>
              取消
            </Button>
            <Button className={styles.primaryBtn} onClick={handleSave}>
              💾 保存
            </Button>
          </>
        )}
      </View>
    </View>
  )
}

export default GoalDetailPage
