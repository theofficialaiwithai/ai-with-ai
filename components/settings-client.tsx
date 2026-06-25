'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/* ── design tokens ── */
const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

/* ── model catalogue ── */
const MODEL_GROUPS = [
  {
    provider: 'Anthropic',
    color: '#CC785C',
    models: [
      { id: 'claude-haiku-3-5',  label: 'Claude Haiku',  note: 'Fast' },
      { id: 'claude-sonnet-4-5', label: 'Claude Sonnet', note: 'Balanced — recommended', recommended: true },
      { id: 'claude-opus-4-5',   label: 'Claude Opus',   note: 'Most powerful' },
    ],
  },
  {
    provider: 'OpenAI',
    color: '#10A37F',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini', note: 'Fast' },
      { id: 'gpt-4o',      label: 'GPT-4o',      note: 'Balanced' },
      { id: 'o1-mini',     label: 'o1-Mini',      note: 'Advanced reasoning' },
    ],
  },
]

/* ── shared card wrapper ── */
function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={{
      background: '#1A1A2E',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, overflow: 'hidden',
      marginBottom: 24,
    }}>
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, color: '#F8FAFC', margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontFamily: FB, fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      <div style={{ padding: '20px 24px 24px' }}>{children}</div>
    </section>
  )
}

/* ── labelled field ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontFamily: FD, fontSize: 13, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

/* ── text input ── */
function TextInput({
  value, onChange, placeholder, readOnly, monospace,
}: {
  value: string; onChange?: (v: string) => void
  placeholder?: string; readOnly?: boolean; monospace?: boolean
}) {
  return (
    <input
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: readOnly ? 'rgba(255,255,255,0.02)' : '#0D0D1A',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8, padding: '10px 14px',
        fontFamily: monospace ? FM : FB, fontSize: 14, color: readOnly ? '#4A5568' : '#F8FAFC',
        outline: 'none',
        cursor: readOnly ? 'default' : 'text',
      }}
      onFocus={e => { if (!readOnly) e.target.style.borderColor = '#7C3AED' }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
    />
  )
}

/* ── save / action button ── */
function ActionButton({
  onClick, loading, label, loadingLabel, variant = 'primary', small,
}: {
  onClick: () => void; loading?: boolean; label: string; loadingLabel?: string
  variant?: 'primary' | 'danger' | 'ghost'; small?: boolean
}) {
  const bg = variant === 'primary' ? '#7C3AED' : variant === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)'
  const border = variant === 'danger' ? '1px solid rgba(239,68,68,0.3)' : variant === 'ghost' ? '1px solid rgba(255,255,255,0.08)' : 'none'
  const color = variant === 'danger' ? '#F87171' : '#fff'
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background: loading ? 'rgba(124,58,237,0.4)' : bg,
        border, borderRadius: 8, color,
        fontFamily: FD, fontSize: small ? 13 : 14, fontWeight: 600,
        padding: small ? '7px 14px' : '10px 20px',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s, opacity 0.15s',
        opacity: loading ? 0.7 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? (loadingLabel ?? 'Saving…') : label}
    </button>
  )
}

/* ── success / error toast ── */
function StatusMsg({ msg, isError }: { msg: string; isError?: boolean }) {
  return (
    <p style={{
      fontFamily: FB, fontSize: 13,
      color: isError ? '#F87171' : '#10B981',
      marginTop: 8, marginBottom: 0,
    }}>{isError ? '✗ ' : '✓ '}{msg}</p>
  )
}

/* ── API key provider card ── */
function ApiKeyCard({
  provider, providerLabel, providerColor, providerIcon,
  placeholder, hasKey,
}: {
  provider: 'anthropic' | 'openai'
  providerLabel: string
  providerColor: string
  providerIcon: string
  placeholder: string
  hasKey: boolean
}) {
  const [keyInput, setKeyInput] = useState('')
  const [reveal, setReveal] = useState(false)
  const [connected, setConnected] = useState(hasKey)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [status, setStatus] = useState<{ msg: string; error: boolean } | null>(null)

  async function handleSave() {
    if (!keyInput.trim()) return
    setSaving(true); setStatus(null)
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: keyInput.trim() }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
      setConnected(true); setKeyInput(''); setStatus({ msg: 'Key saved securely', error: false })
    } catch (e) {
      setStatus({ msg: e instanceof Error ? e.message : 'Failed', error: true })
    } finally { setSaving(false) }
  }

  async function handleRemove() {
    setRemoving(true); setStatus(null)
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Remove failed')
      setConnected(false); setStatus({ msg: 'Key removed', error: false })
    } catch (e) {
      setStatus({ msg: e instanceof Error ? e.message : 'Failed', error: true })
    } finally { setRemoving(false) }
  }

  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: '#0D0D1A',
      border: `1px solid ${connected ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 12, padding: 20,
      transition: 'border-color 0.3s',
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>{providerIcon}</span>
        <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: '#F8FAFC' }}>{providerLabel}</span>
        {connected && (
          <span style={{
            marginLeft: 'auto',
            fontFamily: FM, fontSize: 11,
            background: 'rgba(16,185,129,0.12)',
            color: '#10B981',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 9999, padding: '2px 8px',
          }}>● Connected</span>
        )}
      </div>

      {/* key input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type={reveal ? 'text' : 'password'}
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            placeholder={connected ? '••••••••••••••••' : placeholder}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '9px 36px 9px 12px',
              fontFamily: FM, fontSize: 13, color: '#F8FAFC', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#7C3AED'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          />
          {/* eye toggle */}
          <button
            onClick={() => setReveal(v => !v)}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#4A5568', fontSize: 14, lineHeight: 1, padding: 2,
            }}
            title={reveal ? 'Hide' : 'Reveal'}
          >
            {reveal ? '🙈' : '👁️'}
          </button>
        </div>
        <ActionButton onClick={handleSave} loading={saving} label="Connect" loadingLabel="Saving…" small />
        {connected && (
          <ActionButton onClick={handleRemove} loading={removing} label="Remove" loadingLabel="…" variant="danger" small />
        )}
      </div>

      {status && <StatusMsg msg={status.msg} isError={status.error} />}
    </div>
  )
}

/* ── subscription status pill ── */
const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pro:       { label: 'Pro Active',      color: '#9D5AF0', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.3)' },
  lifetime:  { label: 'Lifetime Access', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  free:      { label: 'Free',            color: '#94A3B8', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
  cancelled: { label: 'Cancelled',       color: '#F87171', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)' },
  past_due:  { label: 'Payment Failed',  color: '#F87171', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)' },
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.free
  return (
    <span style={{
      fontFamily: FM, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 9999, padding: '3px 10px', display: 'inline-block',
    }}>
      {s.label}
    </span>
  )
}

/* ── billing section ── */
function BillingSection({
  subscriptionStatus, stripeCustomerId, proMonthlyPriceId, lifetimePriceId,
}: {
  subscriptionStatus: string
  stripeCustomerId: string | null
  proMonthlyPriceId: string
  lifetimePriceId: string
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function handleCheckout(priceId: string, label: string) {
    setLoading(label); setErr(null)
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed')
      window.location.href = data.url
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading('portal'); setErr(null)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Portal error')
      window.location.href = data.url
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(null)
    }
  }

  const isPaid = subscriptionStatus === 'pro' || subscriptionStatus === 'lifetime'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontFamily: FD, fontSize: 14, color: '#94A3B8' }}>Current plan</span>
        <StatusPill status={subscriptionStatus} />
      </div>

      {isPaid && stripeCustomerId && (
        <ActionButton
          onClick={handlePortal}
          loading={loading === 'portal'}
          label="Manage billing →"
          loadingLabel="Opening portal…"
          variant="ghost"
        />
      )}

      {!isPaid && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* Pro Monthly */}
          <div style={{
            flex: 1, minWidth: 220,
            background: '#0D0D1A', border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 14, padding: '24px 22px',
          }}>
            <div style={{ fontFamily: FD, fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>Pro</div>
            <div style={{ fontFamily: FD, fontSize: 28, fontWeight: 700, color: '#F8FAFC', marginBottom: 16 }}>
              $19<span style={{ fontSize: 14, fontWeight: 500, color: '#94A3B8' }}>/month</span>
            </div>
            <ul style={{ fontFamily: FB, fontSize: 13, color: '#94A3B8', paddingLeft: 0, listStyle: 'none', marginBottom: 20, lineHeight: 2 }}>
              <li>✓ Unlimited sessions</li>
              <li>✓ All 4 platforms</li>
              <li>✓ Cancel anytime</li>
            </ul>
            <ActionButton
              onClick={() => handleCheckout(proMonthlyPriceId, 'monthly')}
              loading={loading === 'monthly'}
              label="Start Pro"
              loadingLabel="Opening checkout…"
            />
          </div>

          {/* Lifetime */}
          <div style={{
            flex: 1, minWidth: 220,
            background: '#0D0D1A', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 14, padding: '24px 22px',
          }}>
            <div style={{ fontFamily: FD, fontSize: 13, fontWeight: 600, color: '#F59E0B', marginBottom: 4 }}>Lifetime</div>
            <div style={{ fontFamily: FD, fontSize: 28, fontWeight: 700, color: '#F8FAFC', marginBottom: 16 }}>
              $149<span style={{ fontSize: 14, fontWeight: 500, color: '#94A3B8' }}> once</span>
            </div>
            <ul style={{ fontFamily: FB, fontSize: 13, color: '#94A3B8', paddingLeft: 0, listStyle: 'none', marginBottom: 20, lineHeight: 2 }}>
              <li>✓ Everything in Pro</li>
              <li>✓ Pay once, keep forever</li>
              <li>✓ All future updates</li>
            </ul>
            <button
              onClick={() => handleCheckout(lifetimePriceId, 'lifetime')}
              disabled={!!loading}
              style={{
                background: 'none', color: '#F59E0B',
                border: '1px solid rgba(245,158,11,0.5)',
                borderRadius: 8, padding: '10px 20px',
                fontFamily: FD, fontWeight: 600, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading === 'lifetime' ? 'Opening checkout…' : 'Get Lifetime Access'}
            </button>
          </div>
        </div>
      )}

      {err && <p style={{ fontFamily: FB, fontSize: 13, color: '#F87171', marginTop: 12 }}>✗ {err}</p>}
    </div>
  )
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
interface Props {
  initialName: string
  email: string
  preferredModel: string
  hasAnthropicKey: boolean
  hasOpenAIKey: boolean
  subscriptionStatus: string
  stripeCustomerId: string | null
  showSuccessBanner: boolean
  proMonthlyPriceId: string
  lifetimePriceId: string
}

export default function SettingsClient({
  initialName, email, preferredModel, hasAnthropicKey, hasOpenAIKey,
  subscriptionStatus, stripeCustomerId, showSuccessBanner,
  proMonthlyPriceId, lifetimePriceId,
}: Props) {
  const router = useRouter()

  /* profile */
  const [name, setName] = useState(initialName)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileStatus, setProfileStatus] = useState<{ msg: string; error: boolean } | null>(null)

  /* model */
  const [selectedModel, setSelectedModel] = useState(preferredModel)
  const [savingModel, setSavingModel] = useState(false)
  const [modelStatus, setModelStatus] = useState<{ msg: string; error: boolean } | null>(null)

  async function handleSaveProfile() {
    setSavingProfile(true); setProfileStatus(null)
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
      setProfileStatus({ msg: 'Profile saved', error: false })
      router.refresh()
    } catch (e) {
      setProfileStatus({ msg: e instanceof Error ? e.message : 'Failed', error: true })
    } finally { setSavingProfile(false) }
  }

  async function handleSaveModel() {
    setSavingModel(true); setModelStatus(null)
    try {
      const res = await fetch('/api/settings/model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
      setModelStatus({ msg: 'Preference saved', error: false })
    } catch (e) {
      setModelStatus({ msg: e instanceof Error ? e.message : 'Failed', error: true })
    } finally { setSavingModel(false) }
  }

  return (
    <>
      <style>{`
        input[type="password"]::-webkit-credentials-auto-fill-button { display: none !important; }
        .model-radio:checked + label { border-color: #7C3AED !important; background: rgba(124,58,237,0.1) !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0D0D1A', color: '#F8FAFC' }}>

        {/* nav */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: FD, fontWeight: 700, fontSize: 16,
              color: '#9D5AF0', padding: 0,
            }}
          >
            ← AI with AI
          </button>
          <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, color: '#F8FAFC', margin: 0 }}>
            Settings
          </h1>
          <div style={{ width: 80 }} />
        </nav>

        {/* success banner */}
        {showSuccessBanner && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', borderBottom: '1px solid rgba(16,185,129,0.25)',
            padding: '12px 28px',
            fontFamily: FB, fontSize: 13, color: '#10B981', textAlign: 'center',
          }}>
            ✓ Payment successful — your plan has been upgraded!
          </div>
        )}

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* ── Section 0: Billing ── */}
          <Card title="Billing" subtitle="Manage your subscription and payment method.">
            <BillingSection
              subscriptionStatus={subscriptionStatus}
              stripeCustomerId={stripeCustomerId}
              proMonthlyPriceId={proMonthlyPriceId}
              lifetimePriceId={lifetimePriceId}
            />
          </Card>

          {/* ── Section 1: Profile ── */}
          <Card title="Profile" subtitle="Your display name shown in your build sessions.">
            <Field label="Display Name">
              <TextInput value={name} onChange={setName} placeholder="Your name" />
            </Field>
            <Field label="Email">
              <TextInput value={email} readOnly />
            </Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
              <ActionButton
                onClick={handleSaveProfile}
                loading={savingProfile}
                label="Save Profile"
              />
              {profileStatus && <StatusMsg msg={profileStatus.msg} isError={profileStatus.error} />}
            </div>
          </Card>

          {/* ── Section 2: API Keys ── */}
          <Card
            title="API Keys"
            subtitle="Connect your own provider keys to use your quota and billing."
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <ApiKeyCard
                provider="anthropic"
                providerLabel="Anthropic"
                providerColor="#CC785C"
                providerIcon="🟠"
                placeholder="sk-ant-…"
                hasKey={hasAnthropicKey}
              />
              <ApiKeyCard
                provider="openai"
                providerLabel="OpenAI"
                providerColor="#10A37F"
                providerIcon="🟢"
                placeholder="sk-…"
                hasKey={hasOpenAIKey}
              />
            </div>
            <p style={{
              fontFamily: FB, fontSize: 12, color: '#374151',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 8, padding: '8px 12px', margin: 0,
            }}>
              🔒 Your API key is encrypted with AES-256-GCM before storage and never shared. You are billed directly by the provider.
            </p>
          </Card>

          {/* ── Section 3: Model Preferences ── */}
          <Card
            title="Model Preference"
            subtitle="Choose which model powers your in-build chat assistant."
          >
            {MODEL_GROUPS.map(group => (
              <div key={group.provider} style={{ marginBottom: 20 }}>
                <p style={{
                  fontFamily: FM, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: '#4A5568', marginBottom: 10, marginTop: 0,
                }}>{group.provider}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.models.map(m => {
                    const active = selectedModel === m.id
                    return (
                      <label
                        key={m.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                          background: active ? 'rgba(124,58,237,0.08)' : '#0D0D1A',
                          border: `1px solid ${active ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
                          transition: 'all 0.15s',
                        }}
                      >
                        {/* custom radio */}
                        <div
                          onClick={() => setSelectedModel(m.id)}
                          style={{
                            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                            border: `2px solid ${active ? '#7C3AED' : 'rgba(255,255,255,0.15)'}`,
                            background: active ? '#7C3AED' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                        >
                          {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                        </div>

                        <div onClick={() => setSelectedModel(m.id)} style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 14, color: '#F8FAFC' }}>{m.label}</span>
                            {m.recommended && (
                              <span style={{
                                fontFamily: FM, fontSize: 10,
                                background: 'rgba(124,58,237,0.2)', color: '#9D5AF0',
                                border: '1px solid rgba(124,58,237,0.3)',
                                borderRadius: 9999, padding: '1px 6px',
                              }}>recommended</span>
                            )}
                          </div>
                          <span style={{ fontFamily: FB, fontSize: 12, color: '#4A5568' }}>{m.note}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}

            <p style={{
              fontFamily: FB, fontSize: 12, color: '#374151',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 8, padding: '8px 12px',
              marginTop: 4, marginBottom: 16,
            }}>
              ℹ️ Plan generation always uses Claude Sonnet for best quality regardless of this setting.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ActionButton
                onClick={handleSaveModel}
                loading={savingModel}
                label="Save Preference"
              />
              {modelStatus && <StatusMsg msg={modelStatus.msg} isError={modelStatus.error} />}
            </div>
          </Card>

        </div>
      </div>
    </>
  )
}
