import Taro from '@tarojs/taro'
import type { WeeklyReview } from '@/types/goal'

const CANVAS_WIDTH = 750
const PADDING = 40
const CONTENT_WIDTH = CANVAS_WIDTH - PADDING * 2

const COLORS = {
  primary: '#5B8DEF',
  secondary: '#7B68EE',
  success: '#10B981',
  warning: '#F59E0B',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  bgCard: '#FFFFFF',
  bgPage: '#F5F7FA',
  border: '#E5E7EB',
  divider: '#F3F4F6'
}

const wrapText = (text: string, fontSize: number, maxWidth: number): string[] => {
  const words = text.split('')
  const lines: string[] = []
  let currentLine = ''

  for (const char of words) {
    const testLine = currentLine + char
    const testWidth = testLine.length * fontSize * 0.6

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export const generateReviewImage = async (review: WeeklyReview): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvasId = 'reviewExportCanvas'

    let contentHeight = 0
    contentHeight += 180
    contentHeight += 40

    const progressLines = wrapText(review.progressSummary, 24, CONTENT_WIDTH - 80)
    contentHeight += progressLines.length * 36 + 80

    const obstacleLines = wrapText(review.obstacles, 24, CONTENT_WIDTH - 80)
    contentHeight += obstacleLines.length * 36 + 80

    const planLines = wrapText(review.nextWeekPlan, 24, CONTENT_WIDTH - 80)
    contentHeight += planLines.length * 36 + 80

    if (review.highlights.length > 0) {
      contentHeight += 80 + review.highlights.length * 56
    }

    if (review.goalProgress.length > 0) {
      contentHeight += 80 + review.goalProgress.length * 100
    }

    contentHeight += 120

    const query = Taro.createSelectorQuery()
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec(async (res) => {
        try {
          if (!res || !res[0]) {
            reject(new Error('Canvas 元素未找到'))
            return
          }

          const canvas = res[0].node
          const ctx = canvas.getContext('2d')

          const dpr = Taro.getSystemInfoSync().pixelRatio
          canvas.width = CANVAS_WIDTH * dpr
          canvas.height = contentHeight * dpr
          ctx.scale(dpr, dpr)

          const gradient = ctx.createLinearGradient(0, 0, 0, contentHeight)
          gradient.addColorStop(0, COLORS.bgPage)
          gradient.addColorStop(1, COLORS.bgPage)
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, CANVAS_WIDTH, contentHeight)

          ctx.fillStyle = COLORS.primary
          ctx.fillRect(0, 0, CANVAS_WIDTH, 12)

          let y = 50

          ctx.fillStyle = COLORS.textPrimary
          ctx.font = 'bold 36px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`第 ${review.weekNumber} 周复盘`, CANVAS_WIDTH / 2, y)
          y += 50

          ctx.fillStyle = COLORS.textSecondary
          ctx.font = '24px sans-serif'
          ctx.fillText(`${review.startDate} ~ ${review.endDate}`, CANVAS_WIDTH / 2, y)
          y += 60

          const drawSection = (icon: string, title: string, content: string, color: string) => {
            ctx.fillStyle = COLORS.bgCard
            ctx.beginPath()
            ctx.roundRect(PADDING, y, CONTENT_WIDTH, 0, 16)

            const lines = wrapText(content, 24, CONTENT_WIDTH - 80)
            const sectionHeight = lines.length * 36 + 80

            ctx.fillRect(PADDING, y, CONTENT_WIDTH, sectionHeight)

            ctx.fillStyle = color
            ctx.font = 'bold 28px sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText(`${icon} ${title}`, PADDING + 32, y + 48)

            ctx.fillStyle = COLORS.textPrimary
            ctx.font = '24px sans-serif'
            lines.forEach((line, index) => {
              ctx.fillText(line, PADDING + 32, y + 90 + index * 36)
            })

            y += sectionHeight + 24
          }

          drawSection('📈', '本周进展', review.progressSummary, COLORS.primary)
          drawSection('🚧', '遇到的阻碍', review.obstacles, COLORS.warning)
          drawSection('🎯', '下周调整', review.nextWeekPlan, COLORS.success)

          if (review.highlights.length > 0) {
            const sectionHeight = 80 + review.highlights.length * 56
            ctx.fillStyle = COLORS.bgCard
            ctx.fillRect(PADDING, y, CONTENT_WIDTH, sectionHeight)

            ctx.fillStyle = COLORS.secondary
            ctx.font = 'bold 28px sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText('✨ 本周亮点', PADDING + 32, y + 48)

            ctx.fillStyle = COLORS.textPrimary
            ctx.font = '24px sans-serif'
            review.highlights.forEach((highlight, index) => {
              const bulletY = y + 90 + index * 56
              ctx.fillStyle = COLORS.secondary
              ctx.beginPath()
              ctx.arc(PADDING + 48, bulletY - 6, 6, 0, Math.PI * 2)
              ctx.fill()

              ctx.fillStyle = COLORS.textPrimary
              ctx.fillText(highlight, PADDING + 68, bulletY)
            })

            y += sectionHeight + 24
          }

          if (review.goalProgress.length > 0) {
            const sectionHeight = 80 + review.goalProgress.length * 100
            ctx.fillStyle = COLORS.bgCard
            ctx.fillRect(PADDING, y, CONTENT_WIDTH, sectionHeight)

            ctx.fillStyle = COLORS.primary
            ctx.font = 'bold 28px sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText('📊 目标进度', PADDING + 32, y + 48)

            review.goalProgress.forEach((gp, index) => {
              const itemY = y + 90 + index * 100

              ctx.fillStyle = COLORS.textPrimary
              ctx.font = '24px sans-serif'
              ctx.textAlign = 'left'
              const title = gp.goalTitle.length > 20 ? gp.goalTitle.slice(0, 20) + '...' : gp.goalTitle
              ctx.fillText(title, PADDING + 32, itemY + 20)

              ctx.fillStyle = COLORS.textSecondary
              ctx.font = '22px sans-serif'
              ctx.textAlign = 'right'
              ctx.fillText(`${gp.progress}%`, PADDING + CONTENT_WIDTH - 32, itemY + 20)

              ctx.fillStyle = COLORS.divider
              ctx.fillRect(PADDING + 32, itemY + 36, CONTENT_WIDTH - 64, 8)

              const progressWidth = ((CONTENT_WIDTH - 64) * gp.progress) / 100
              const progressGradient = ctx.createLinearGradient(
                PADDING + 32, 0, PADDING + 32 + progressWidth, 0
              )
              progressGradient.addColorStop(0, COLORS.primary)
              progressGradient.addColorStop(1, COLORS.secondary)
              ctx.fillStyle = progressGradient
              ctx.fillRect(PADDING + 32, itemY + 36, progressWidth, 8)

              ctx.fillStyle = COLORS.textTertiary
              ctx.font = '20px sans-serif'
              ctx.textAlign = 'left'
              ctx.fillText(
                `已完成 ${gp.completedTasks} / ${gp.totalTasks} 个任务`,
                PADDING + 32,
                itemY + 68
              )
            })

            y += sectionHeight + 24
          }

          ctx.fillStyle = COLORS.textTertiary
          ctx.font = '22px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('季度目标管理 · 让成长有迹可循', CANVAS_WIDTH / 2, contentHeight - 40)

          setTimeout(() => {
            Taro.canvasToTempFilePath({
              canvasId,
              canvas,
              width: CANVAS_WIDTH,
              height: contentHeight,
              destWidth: CANVAS_WIDTH * 2,
              destHeight: contentHeight * 2,
              success: (res) => {
                resolve(res.tempFilePath)
              },
              fail: (err) => {
                reject(err)
              }
            })
          }, 100)
        } catch (error) {
          reject(error)
        }
      })
  })
}

export const saveImageToAlbum = async (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    Taro.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        Taro.showToast({ title: '已保存到相册', icon: 'success' })
        resolve()
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          Taro.showModal({
            title: '需要授权',
            content: '需要相册权限才能保存图片，请在设置中开启',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                Taro.openSetting()
              }
            }
          })
        } else {
          Taro.showToast({ title: '保存失败', icon: 'none' })
        }
        reject(err)
      }
    })
  })
}

export const previewImage = (filePath: string): void => {
  Taro.previewImage({
    urls: [filePath],
    current: filePath
  })
}
