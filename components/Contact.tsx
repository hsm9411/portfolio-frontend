'use client'

import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'

export default function Contact() {
  const form = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.current) return

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      setStatus('error')
      return
    }

    setStatus('sending')

    emailjs
      .sendForm(serviceId, templateId, form.current, { publicKey })
      .then(() => {
        setStatus('success')
        form.current?.reset()
      })
      .catch(() => setStatus('error'))
  }

  return (
    <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-[1000px] px-5 py-20">
        <h2 className="mb-4 text-center text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          Contact
        </h2>
        <p className="mb-12 text-center text-base text-gray-500 dark:text-gray-400">
          궁금한 점이 있으시거나 협업 제안은 언제든 환영합니다.
        </p>

        <form ref={form} onSubmit={sendEmail} className="mx-auto flex max-w-[600px] flex-col gap-5">
          <input
            type="text"
            name="user_name"
            placeholder="이름 (Name)"
            required
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-[15px] text-base text-gray-900 outline-none transition-colors focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          />
          <input
            type="email"
            name="user_email"
            placeholder="이메일 (Email)"
            required
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-[15px] text-base text-gray-900 outline-none transition-colors focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          />
          <textarea
            name="message"
            placeholder="내용을 입력해주세요 (Message)"
            required
            rows={6}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white px-4 py-[15px] text-base text-gray-900 outline-none transition-colors focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-lg bg-gray-900 py-[15px] text-[1.05rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
          >
            {status === 'sending' ? '전송 중...' : '메일 보내기'}
          </button>
        </form>

        {/* 상태 메시지 */}
        {status === 'success' && (
          <p className="mt-6 text-center text-sm font-medium text-green-600 dark:text-green-400">
            ✅ 성공적으로 메일이 발송되었습니다!
          </p>
        )}
        {status === 'error' && (
          <p className="mt-6 text-center text-sm font-medium text-red-500 dark:text-red-400">
            ❌ 전송 실패. 환경변수 또는 네트워크를 확인해주세요.
          </p>
        )}
      </div>
    </section>
  )
}
