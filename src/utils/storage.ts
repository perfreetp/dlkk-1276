import Taro from '@tarojs/taro'

const STORAGE_KEYS = {
  GOALS: 'goals_data',
  DAILY_ACTIONS: 'daily_actions_data',
  WEEKLY_REVIEWS: 'weekly_reviews_data',
  POMODORO_SESSIONS: 'pomodoro_sessions_data'
} as const

export const storage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const data = await Taro.getStorage({ key })
      return data.data as T
    } catch (error) {
      console.log('[Storage] 获取失败，使用默认值:', key)
      return defaultValue
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await Taro.setStorage({ key, data: value })
      console.log('[Storage] 保存成功:', key)
    } catch (error) {
      console.error('[Storage] 保存失败:', key, error)
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await Taro.removeStorage({ key })
      console.log('[Storage] 删除成功:', key)
    } catch (error) {
      console.error('[Storage] 删除失败:', key, error)
    }
  }
}

export const goalStorage = {
  async getAll() {
    return storage.get(STORAGE_KEYS.GOALS, [])
  },

  async saveAll(goals: any[]) {
    return storage.set(STORAGE_KEYS.GOALS, goals)
  }
}

export const dailyActionStorage = {
  async getAll() {
    return storage.get(STORAGE_KEYS.DAILY_ACTIONS, [])
  },

  async saveAll(actions: any[]) {
    return storage.set(STORAGE_KEYS.DAILY_ACTIONS, actions)
  }
}

export const reviewStorage = {
  async getAll() {
    return storage.get(STORAGE_KEYS.WEEKLY_REVIEWS, [])
  },

  async saveAll(reviews: any[]) {
    return storage.set(STORAGE_KEYS.WEEKLY_REVIEWS, reviews)
  }
}

export const pomodoroStorage = {
  async getAll() {
    return storage.get(STORAGE_KEYS.POMODORO_SESSIONS, [])
  },

  async saveAll(sessions: any[]) {
    return storage.set(STORAGE_KEYS.POMODORO_SESSIONS, sessions)
  }
}
