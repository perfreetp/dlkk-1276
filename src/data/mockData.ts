import type { Goal, DailyAction, WeeklyReview, StatData, PomodoroSession } from '@/types/goal'

const today = new Date()
const formatDate = (d: Date): string => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const mockGoals: Goal[] = [
  {
    id: '1',
    title: '通过PMP项目管理认证考试',
    description: '系统学习项目管理知识体系，通过PMP认证考试，提升职业竞争力',
    metric: '完成PMBOK指南6版学习，模拟考试分数达到130+',
    startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 3, 30)),
    priority: 'high',
    reminderEnabled: true,
    reminderTime: '20:00',
    status: 'active',
    progress: 45,
    totalTasks: 12,
    completedTasks: 5,
    category: '考证',
    createdAt: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    stageTasks: [
      {
        id: 's1',
        title: '入门阶段：了解PMBOK框架',
        description: '通读PMBOK指南前三章，掌握五大过程组和十大知识领域',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth(), 15)),
        status: 'completed',
        order: 1
      },
      {
        id: 's2',
        title: '基础阶段：系统学习各知识领域',
        description: '深入学习每个知识领域的输入、工具技术、输出',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 28)),
        status: 'in-progress',
        order: 2
      },
      {
        id: 's3',
        title: '强化阶段：刷题和模拟考试',
        description: '完成2000+道练习题，进行5次全真模拟考试',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 2, 20)),
        status: 'pending',
        order: 3
      },
      {
        id: 's4',
        title: '冲刺阶段：查漏补缺',
        description: '回顾错题本，重点攻克薄弱环节',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 3, 25)),
        status: 'pending',
        order: 4
      }
    ],
    weeklyMilestones: [
      { id: 'w1', weekNumber: 1, title: '完成第1-3章学习', description: '掌握项目管理框架', status: 'completed' },
      { id: 'w2', weekNumber: 2, title: '完成范围管理学习', description: 'WBS分解等工具', status: 'completed' },
      { id: 'w3', weekNumber: 3, title: '完成进度管理学习', description: '关键路径法等', status: 'completed' },
      { id: 'w4', weekNumber: 4, title: '完成成本管理学习', description: '挣值管理等', status: 'in-progress' },
      { id: 'w5', weekNumber: 5, title: '完成质量管理学习', description: '质量工具等', status: 'pending' },
      { id: 'w6', weekNumber: 6, title: '完成资源管理学习', description: '资源规划等', status: 'pending' },
      { id: 'w7', weekNumber: 7, title: '完成沟通风险管理学习', description: '沟通渠道、风险应对', status: 'pending' },
      { id: 'w8', weekNumber: 8, title: '完成采购和相关方学习', description: '合同类型、相关方分析', status: 'pending' },
      { id: 'w9', weekNumber: 9, title: '第一轮模拟考试', description: '检验学习成果', status: 'pending' },
      { id: 'w10', weekNumber: 10, title: '第二轮模拟考试', description: '提升答题速度', status: 'pending' },
      { id: 'w11', weekNumber: 11, title: '错题回顾', description: '针对性复习', status: 'pending' },
      { id: 'w12', weekNumber: 12, title: '最终冲刺', description: '调整状态迎考', status: 'pending' }
    ]
  },
  {
    id: '2',
    title: '建立个人品牌，实现副业收入5000元/月',
    description: '通过内容创作和专业服务，打造个人IP，实现稳定的副业收入',
    metric: '月收入达到5000元，粉丝数达到1万+',
    startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 3, 30)),
    priority: 'high',
    reminderEnabled: true,
    reminderTime: '21:00',
    status: 'active',
    progress: 30,
    totalTasks: 15,
    completedTasks: 4,
    category: '职业发展',
    createdAt: formatDate(new Date(today.getFullYear(), today.getMonth(), 2)),
    stageTasks: [
      {
        id: 's5',
        title: '定位阶段：确定个人品牌方向',
        description: '明确目标用户、价值主张、内容定位',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth(), 10)),
        status: 'completed',
        order: 1
      },
      {
        id: 's6',
        title: '搭建阶段：建立内容矩阵',
        description: '注册各平台账号，完善个人主页，发布首批内容',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 15)),
        status: 'in-progress',
        order: 2
      },
      {
        id: 's7',
        title: '增长阶段：积累第一批种子用户',
        description: '通过优质内容和互动，积累1000名种子用户',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 2, 15)),
        status: 'pending',
        order: 3
      },
      {
        id: 's8',
        title: '变现阶段：探索商业化路径',
        description: '推出付费产品或服务，实现第一笔收入',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 3, 30)),
        status: 'pending',
        order: 4
      }
    ],
    weeklyMilestones: [
      { id: 'w13', weekNumber: 1, title: '完成市场调研', description: '分析竞品和目标用户', status: 'completed' },
      { id: 'w14', weekNumber: 2, title: '确定品牌定位', description: '明确人设和内容方向', status: 'completed' },
      { id: 'w15', weekNumber: 3, title: '注册各平台账号', description: '微信公众号、知乎、小红书', status: 'completed' },
      { id: 'w16', weekNumber: 4, title: '发布首批10篇内容', description: '建立内容基础', status: 'in-progress' },
      { id: 'w17', weekNumber: 5, title: '粉丝破百', description: '积累第一批关注者', status: 'pending' },
      { id: 'w18', weekNumber: 6, title: '粉丝破五百', description: '持续输出优质内容', status: 'pending' },
      { id: 'w19', weekNumber: 7, title: '完成第一个付费咨询', description: '验证变现模式', status: 'pending' },
      { id: 'w20', weekNumber: 8, title: '粉丝破两千', description: '进入增长阶段', status: 'pending' },
      { id: 'w21', weekNumber: 9, title: '月收入破千', description: '多渠道变现', status: 'pending' },
      { id: 'w22', weekNumber: 10, title: '月收入破三千', description: '扩大收入规模', status: 'pending' },
      { id: 'w23', weekNumber: 11, title: '粉丝破万', description: '达成粉丝目标', status: 'pending' },
      { id: 'w24', weekNumber: 12, title: '月收入五千', description: '达成收入目标', status: 'pending' }
    ]
  },
  {
    id: '3',
    title: '养成健康作息，体重减到65kg',
    description: '通过规律运动和健康饮食，改善身体状态，达到理想体重',
    metric: '体重从75kg减到65kg，体脂率从25%降到18%',
    startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 3, 30)),
    priority: 'medium',
    reminderEnabled: true,
    reminderTime: '07:00',
    status: 'active',
    progress: 60,
    totalTasks: 8,
    completedTasks: 5,
    category: '健康',
    createdAt: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    stageTasks: [
      {
        id: 's9',
        title: '适应阶段：建立运动习惯',
        description: '每周运动3次，每次30分钟，让身体适应运动节奏',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 1)),
        status: 'completed',
        order: 1
      },
      {
        id: 's10',
        title: '减脂阶段：有氧运动+饮食控制',
        description: '每周5次有氧，控制热量摄入，制造热量缺口',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 2, 15)),
        status: 'in-progress',
        order: 2
      },
      {
        id: 's11',
        title: '塑形阶段：力量训练增肌',
        description: '增加力量训练比例，提高基础代谢',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 3, 30)),
        status: 'pending',
        order: 3
      }
    ],
    weeklyMilestones: [
      { id: 'w25', weekNumber: 1, title: '适应运动节奏', description: '完成3次运动', status: 'completed' },
      { id: 'w26', weekNumber: 2, title: '体重减1kg', description: '初步见效', status: 'completed' },
      { id: 'w27', weekNumber: 3, title: '养成运动习惯', description: '运动成为日常', status: 'completed' },
      { id: 'w28', weekNumber: 4, title: '体重减2kg', description: '持续减脂', status: 'completed' },
      { id: 'w29', weekNumber: 5, title: '体重减3kg', description: '加速减脂', status: 'in-progress' },
      { id: 'w30', weekNumber: 6, title: '体重减4kg', description: '突破平台期', status: 'pending' },
      { id: 'w31', weekNumber: 7, title: '加入力量训练', description: '开始塑形', status: 'pending' },
      { id: 'w32', weekNumber: 8, title: '体重减5kg', description: '进度过半', status: 'pending' },
      { id: 'w33', weekNumber: 9, title: '体重减6kg', description: '接近目标', status: 'pending' },
      { id: 'w34', weekNumber: 10, title: '体重减7kg', description: '最后冲刺', status: 'pending' },
      { id: 'w35', weekNumber: 11, title: '体重减8kg', description: '达成目标', status: 'pending' },
      { id: 'w36', weekNumber: 12, title: '巩固成果', description: '保持体重稳定', status: 'pending' }
    ]
  },
  {
    id: '4',
    title: '读完12本专业书籍',
    description: '每读完一本写读书笔记，积累专业知识',
    metric: '完成12本书阅读，每本书输出1000字以上读书笔记',
    startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 3, 30)),
    priority: 'low',
    reminderEnabled: false,
    status: 'active',
    progress: 25,
    totalTasks: 12,
    completedTasks: 3,
    category: '学习成长',
    createdAt: formatDate(new Date(today.getFullYear(), today.getMonth(), 3)),
    stageTasks: [
      {
        id: 's12',
        title: '第一月：效率提升类', description: '阅读3本效率提升类书籍',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
        status: 'completed', order: 1
      },
      {
        id: 's13',
        title: '第二月：思维认知类', description: '阅读3本思维认知类书籍',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 2, 0)),
        status: 'in-progress', order: 2
      },
      {
        id: 's14',
        title: '第三月：专业技能类', description: '阅读3本专业技能类书籍',
        deadline: formatDate(new Date(today.getFullYear(), today.getMonth() + 3, 0)),
        status: 'pending', order: 3
      }
    ],
    weeklyMilestones: [
      { id: 'w37', weekNumber: 1, title: '读完《高效能人士的七个习惯》', description: '完成第一本书', status: 'completed' },
      { id: 'w38', weekNumber: 2, title: '读完《原子习惯》', description: '建立习惯体系', status: 'completed' },
      { id: 'w39', weekNumber: 3, title: '读完《深度工作》', description: '提升专注力', status: 'completed' },
      { id: 'w40', weekNumber: 4, title: '读完《思考，快与慢》', description: '了解思维模式', status: 'in-progress' },
      { id: 'w41', weekNumber: 5, title: '读完《穷查理宝典》', description: '学习多元思维', status: 'pending' },
      { id: 'w42', weekNumber: 6, title: '读完《原则》', description: '建立决策原则', status: 'pending' },
      { id: 'w43', weekNumber: 7, title: '读完第三月第1本', description: '开始专业技能类', status: 'pending' },
      { id: 'w44', weekNumber: 8, title: '读完第三月第2本', description: '持续输入', status: 'pending' },
      { id: 'w45', weekNumber: 9, title: '读完第三月第3本', description: '完成阅读计划', status: 'pending' },
      { id: 'w46', weekNumber: 10, title: '整理读书笔记', description: '输出知识体系', status: 'pending' },
      { id: 'w47', weekNumber: 11, title: '实践应用', description: '将知识应用到工作中', status: 'pending' },
      { id: 'w48', weekNumber: 12, title: '复盘总结', description: '季度阅读总结', status: 'pending' }
    ]
  }
]

const todayStr = formatDate(today)
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)
const yesterdayStr = formatDate(yesterday)
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const tomorrowStr = formatDate(tomorrow)

export const mockDailyActions: DailyAction[] = [
  {
    id: 'd1',
    date: todayStr,
    title: '学习PMBOK第5章：范围管理',
    goalId: '1',
    stageId: 's2',
    milestoneId: 'w2',
    priority: 'high',
    status: 'completed',
    pomodoroCount: 3,
    estimatedMinutes: 75,
    completedMinutes: 80,
    isTemporary: false
  },
  {
    id: 'd2',
    date: todayStr,
    title: '完成范围管理章节习题',
    goalId: '1',
    stageId: 's2',
    milestoneId: 'w2',
    priority: 'high',
    status: 'in-progress',
    pomodoroCount: 2,
    estimatedMinutes: 50,
    completedMinutes: 30,
    isTemporary: false
  },
  {
    id: 'd3',
    date: todayStr,
    title: '撰写公众号文章：项目管理入门指南',
    goalId: '2',
    stageId: 's6',
    milestoneId: 'w16',
    priority: 'medium',
    status: 'pending',
    pomodoroCount: 4,
    estimatedMinutes: 100,
    completedMinutes: 0,
    isTemporary: false
  },
  {
    id: 'd4',
    date: todayStr,
    title: '跑步5公里',
    goalId: '3',
    stageId: 's10',
    milestoneId: 'w29',
    priority: 'medium',
    status: 'pending',
    pomodoroCount: 1,
    estimatedMinutes: 35,
    completedMinutes: 0,
    isTemporary: false
  },
  {
    id: 'd5',
    date: todayStr,
    title: '阅读《思考，快与慢》第6章',
    goalId: '4',
    stageId: 's13',
    milestoneId: 'w40',
    priority: 'low',
    status: 'pending',
    pomodoroCount: 2,
    estimatedMinutes: 50,
    completedMinutes: 0,
    isTemporary: false
  },
  {
    id: 'd6',
    date: todayStr,
    title: '回复客户邮件',
    goalId: '2',
    priority: 'high',
    status: 'pending',
    pomodoroCount: 1,
    estimatedMinutes: 20,
    completedMinutes: 0,
    isTemporary: true
  },
  {
    id: 'd7',
    date: yesterdayStr,
    title: '学习PMBOK第4章：整合管理',
    goalId: '1',
    priority: 'high',
    status: 'completed',
    pomodoroCount: 3,
    estimatedMinutes: 75,
    completedMinutes: 75,
    isTemporary: false
  },
  {
    id: 'd8',
    date: yesterdayStr,
    title: '发布小红书笔记',
    goalId: '2',
    priority: 'medium',
    status: 'delayed',
    pomodoroCount: 2,
    estimatedMinutes: 50,
    completedMinutes: 20,
    delayReason: '临时接到客户需求，时间冲突',
    isTemporary: false
  }
]

export const mockWeeklyReviews: WeeklyReview[] = [
  {
    id: 'r1',
    weekNumber: 3,
    year: today.getFullYear(),
    startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 15)),
    endDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 21)),
    progressSummary: '本周完成了PMBOK前三章的学习，对项目管理框架有了整体认识。个人品牌方面，完成了三个平台的账号注册和初步装修。',
    obstacles: '工作加班比较多，学习时间被压缩。内容创作方面，不知道写什么主题，有拖延倾向。',
    nextWeekPlan: '1. 完成范围管理章节的学习和练习 2. 发布第一篇公众号文章 3. 建立内容选题库',
    highlights: ['完成PMBOK前三章学习', '注册三个平台账号', '坚持运动5次'],
    goalProgress: [
      { goalId: '1', goalTitle: 'PMP认证考试', progress: 20, completedTasks: 1, totalTasks: 5 },
      { goalId: '2', goalTitle: '个人品牌建设', progress: 15, completedTasks: 2, totalTasks: 8 },
      { goalId: '3', goalTitle: '健康减脂', progress: 30, completedTasks: 5, totalTasks: 8 },
      { goalId: '4', goalTitle: '阅读计划', progress: 25, completedTasks: 3, totalTasks: 12 }
    ],
    createdAt: formatDate(new Date(today.getFullYear(), today.getMonth(), 21))
  },
  {
    id: 'r2',
    weekNumber: 2,
    year: today.getFullYear(),
    startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 8)),
    endDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 14)),
    progressSummary: '第二周逐步进入状态，学习和运动都比较规律。开始尝试做内容，但质量还有待提高。',
    obstacles: '早起困难，经常睡到7点多才起，导致早上学习时间不够。',
    nextWeekPlan: '1. 调整作息，6:30起床 2. 完成PMBOK第二章习题 3. 规划内容选题方向',
    highlights: ['连续运动7天', '读完《原子习惯》', '发布第一篇知乎回答'],
    goalProgress: [
      { goalId: '1', goalTitle: 'PMP认证考试', progress: 12, completedTasks: 1, totalTasks: 5 },
      { goalId: '2', goalTitle: '个人品牌建设', progress: 8, completedTasks: 1, totalTasks: 8 },
      { goalId: '3', goalTitle: '健康减脂', progress: 20, completedTasks: 3, totalTasks: 8 },
      { goalId: '4', goalTitle: '阅读计划', progress: 18, completedTasks: 2, totalTasks: 12 }
    ],
    createdAt: formatDate(new Date(today.getFullYear(), today.getMonth(), 14))
  },
  {
    id: 'r3',
    weekNumber: 1,
    year: today.getFullYear(),
    startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 7)),
    progressSummary: '第一周主要是适应期，设定了季度目标和详细计划。整体状态不错，开了个好头。',
    obstacles: '计划排得太满，导致有些任务没有完成。需要更合理地评估任务时间。',
    nextWeekPlan: '1. 调整每日任务数量，专注重要目标 2. 开始PMBOK第一章学习 3. 建立运动习惯',
    highlights: ['完成季度目标设定', '坚持运动5天', '读完第一本书'],
    goalProgress: [
      { goalId: '1', goalTitle: 'PMP认证考试', progress: 5, completedTasks: 1, totalTasks: 5 },
      { goalId: '2', goalTitle: '个人品牌建设', progress: 3, completedTasks: 1, totalTasks: 8 },
      { goalId: '3', goalTitle: '健康减脂', progress: 10, completedTasks: 2, totalTasks: 8 },
      { goalId: '4', goalTitle: '阅读计划', progress: 10, completedTasks: 1, totalTasks: 12 }
    ],
    createdAt: formatDate(new Date(today.getFullYear(), today.getMonth(), 7))
  }
]

export const mockStats: StatData = {
  totalGoals: 4,
  completedGoals: 0,
  completionRate: 40,
  streakDays: 23,
  totalFocusMinutes: 4560,
  todayFocusMinutes: 110,
  weekFocusMinutes: 520,
  completedDailyActions: 67,
  totalDailyActions: 96,
  riskGoals: [
    {
      id: '2',
      title: '建立个人品牌，实现副业收入5000元/月',
      riskLevel: 'high',
      reason: '进度落后20%，内容产出不稳定'
    },
    {
      id: '4',
      title: '读完12本专业书籍',
      riskLevel: 'medium',
      reason: '进度略慢，需增加阅读时间'
    }
  ]
}

export const mockPomodoroSessions: PomodoroSession[] = [
  {
    id: 'p1',
    startTime: todayStr + ' 09:00:00',
    endTime: todayStr + ' 09:25:00',
    duration: 25,
    taskId: 'd1',
    goalId: '1',
    completed: true
  },
  {
    id: 'p2',
    startTime: todayStr + ' 09:30:00',
    endTime: todayStr + ' 09:55:00',
    duration: 25,
    taskId: 'd1',
    goalId: '1',
    completed: true
  },
  {
    id: 'p3',
    startTime: todayStr + ' 10:00:00',
    endTime: todayStr + ' 10:25:00',
    duration: 25,
    taskId: 'd1',
    goalId: '1',
    completed: true
  },
  {
    id: 'p4',
    startTime: todayStr + ' 14:00:00',
    endTime: todayStr + ' 14:25:00',
    duration: 25,
    taskId: 'd2',
    goalId: '1',
    completed: true
  },
  {
    id: 'p5',
    startTime: todayStr + ' 14:30:00',
    duration: 25,
    taskId: 'd2',
    goalId: '1',
    completed: false
  }
]

export const goalTemplates = [
  {
    id: 't1',
    title: '职业技能提升计划',
    description: '三个月系统提升专业技能，建立核心竞争力',
    category: '职业发展',
    suggestedStages: ['基础巩固', '技能进阶', '项目实战', '复盘总结'],
    icon: '💼'
  },
  {
    id: 't2',
    title: '考试备考计划',
    description: '科学备考，高效通过各类认证考试',
    category: '考证',
    suggestedStages: ['基础学习', '强化练习', '模拟考试', '冲刺复习'],
    icon: '📚'
  },
  {
    id: 't3',
    title: '健身减脂计划',
    description: '循序渐进减脂塑形，养成健康生活习惯',
    category: '健康',
    suggestedStages: ['适应期', '减脂期', '塑形期', '巩固期'],
    icon: '💪'
  },
  {
    id: 't4',
    title: '副业创业计划',
    description: '从零开始打造副业收入管道',
    category: '财富',
    suggestedStages: ['方向探索', '最小验证', '产品打磨', '规模增长'],
    icon: '🚀'
  }
]
