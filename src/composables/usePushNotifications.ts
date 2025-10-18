import { ref } from 'vue'
import { apiRequest } from '@/utils/api'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export const usePushNotifications = () => {
  const isSupported = ref(false)
  const isSubscribed = ref(false)
  const permission = ref<NotificationPermission>('default')

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      return result === 'granted'
    } catch (err) {
      console.error('Permission request failed:', err)
      return false
    }
  }

  const subscribe = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready

      const granted = await requestPermission()
      if (!granted) return false

      let subscription = await registration.pushManager.getSubscription()
      let isNew = false

      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        })
        isNew = true
        console.log('New push subscription created')
      } else {
        console.log('Existing push subscription found')
      }

      if (isNew && subscription) {
        await apiRequest('/User/SetPushSubscription', {
          method: 'POST',
          body: { subscription: subscription.toJSON() }
        })
        console.log('Subscription sent to server')
      }

      isSubscribed.value = true
      return true
    } catch (err) {
      console.error('Push subscription failed:', err)
      return false
    }
  }

  const checkSupport = () => {
    isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    if ('Notification' in window) {
      permission.value = Notification.permission
    }
  }

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    checkSupport
  }
}
