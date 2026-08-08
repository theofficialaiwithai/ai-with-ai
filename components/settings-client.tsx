'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RetroShell from '@/components/retro-os/retro-shell'
import WindowCard, { RetroPill } from '@/components/retro-os/window-card'

/* ── design tokens ── */
const BORDER = '#000000'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const GOLD = '#FFCB33'
const PINK = '#FF5FA8'
const VIOLET = '#9B7FD1'
const LIME = '#5FD98A'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'
const SUCCESS = '#2F9E5C'
const ERROR = '#E1483F'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

/* ── model catalogue ── */
const MODEL_GROUPS = [
  {
    provider: 'Anthropic',
    models: [
      { id: 'claude-haiku-3-5',  label: 'Claude Haiku',  note: 'Fast' },
      { id: 'claude-sonnet-4-5', label: 'Claude Sonnet', note: 'Balanced — recommended', recommended: true },
      { id: 'claude-opus-4-5',   label: 'Claude Opus',   note: 'Most powerful' },
    ],
  },
  {
    provider: 'OpenAI',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini', note: 'Fast' },
      { id: 'gpt-4o',      label: 'GPT-4o',      note: 'Balanced' },
      { id: 'o1-mini',     label: 'o1-Mini',      note: 'Advanced reasoning' },
    ],
  },
]

/* ── shared card wrapper ── */
function SettingsCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <WindowCard
        infoBar={`${title.toUpperCase().replace(/ /g, '_')}.SYS`}
        borderRadius={16}
        bodyStyle={{ padding: '22px 24px 24px', background: WINDOW }}
      >
        {subtitle && <p style={{ fontFamily: FB, fontSize: 13, color: INK_SOFT, margin: '0 0 18px' }}>{subtitle}</p>}
        {children}
      </WindowCard>
    </div>
  )
}

/* ── labelled field ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontFamily: FD, fontSize: 13, fontWeight: 700, color: INK, display: 'block', marginBottom: 6 }}>
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
        background: WINDOW_ALT,
        border: `2px solid ${BORDER}`,
        borderRadius: 10, padding: '10px 14px',
        fontFamily: monospace ? FV : FB, fontSize: monospace ? 16 : 14, color: readOnly ? INK_SOFT : INK,
        outline: 'none',
        cursor: readOnly ? 'default' : 'text',
      }}
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
  const [hovered, setHovered] = useState(false)
  const bg = variant === 'primary' ? GOLD : variant === 'danger' ? PINK : WINDOW
  const color = variant === 'danger' ? '#fff' : INK
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: loading ? '#D9D5E5' : bg, color,
        border: `2px solid ${BORDER}`, borderRadius: 10,
        fontFamily: FD, fontSize: small ? 12.5 : 14, fontWeight: 700,
        padding: small ? '6px 14px' : '10px 20px',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: loading ? 'none' : hovered ? `4px 4px 0 ${BORDER}` : `2px 2px 0 ${BORDER}`,
        transform: !loading && hovered ? 'translate(-1px,-1px)' : 'translate(0,0)',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
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
      fontFamily: FV, fontSize: 15, fontWeight: 700,
      color: isError ? ERROR : SUCCESS,
      marginTop: 8, marginBottom: 0,
    }}>{isError ? '✗ ' : '✓ '}{msg}</p>
  )
}

/* ── API key provider card ── */
function ApiKeyCard({
  provider, providerLabel, providerIcon, placeholder, hasKey,
}: {
  provider: 'anthropic' | 'openai'
  providerLabel: string
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
      flex: 1, minWidth: 240,
      background: WINDOW_ALT,
      border: `2px solid ${BORDER}`,
      borderRadius: 12, padding: 18,
      boxShadow: connected ? `3px 3px 0 ${LIME}` : `3px 3px 0 ${BORDER}`,
      transition: 'box-shadow 0.2s',
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>{providerIcon}</span>
        <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: INK }}>{providerLabel}</span>
        {connected && (
          <div style={{ marginLeft: 'auto' }}>
            <RetroPill bg={LIME} color={INK}>● CONNECTED</RetroPill>
          </div>
        )}
      </div>

      {/* key input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140, position: 'relative' }}>
          <input
            type={reveal ? 'text' : 'password'}
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            placeholder={connected ? '••••••••••••••••' : placeholder}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: WINDOW, border: `2px solid ${BORDER}`,
              borderRadius: 8, padding: '8px 34px 8px 12px',
              fontFamily: FV, fontSize: 15, color: INK, outline: 'none',
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          />
          {/* eye toggle */}
          <button
            onClick={() => setReveal(v => !v)}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: INK_SOFT, fontSize: 14, lineHeight: 1, padding: 2,
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
const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  pro:       { label: 'PRO ACTIVE',      bg: VIOLET, color: '#fff' },
  lifetime:  { label: 'LIFETIME ACCESS', bg: GOLD,   color: INK },
  free:      { label: 'FREE',            bg: WINDOW_ALT, color: INK_SOFT },
  cancelled: { label: 'CANCELLED',       bg: PINK,   color: '#fff' },
  past_due:  { label: 'PAYMENT FAILED',  bg: PINK,   color: '#fff' },
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.free
  return <RetroPill bg={s.bg} color={s.color}>{s.label}</RetroPill>
}

/* ── pricing tile ── */
function PricingTile({
  plan, planColor, price, priceSub, features, cta, onClick, loading,
}: {
  plan: string; planColor: string; price: string; priceSub: string
  features: string[]; cta: string; onClick: () => void; loading: boolean
}) {
  return (
    <div style={{
      flex: 1, minWidth: 220,
      background: WINDOW, border: `2.5px solid ${BORDER}`, borderRadius: 14,
      padding: '22px 20px', boxShadow: `5px 5px 0 ${BORDER}`,
    }}>
      <div style={{ fontFamily: FV, fontSize: 15, fontWeight: 700, color: planColor, marginBottom: 4, letterSpacing: '0.04em' }}>{plan}</div>
      <div style={{ fontFamily: FD, fontSize: 28, fontWeight: 800, color: INK, marginBottom: 14 }}>
        {price}<span style={{ fontSize: 13, fontWeight: 500, color: INK_SOFT }}>{priceSub}</span>
      </div>
      <ul style={{ fontFamily: FB, fontSize: 13, color: INK_SOFT, paddingLeft: 0, listStyle: 'none', marginBottom: 18, lineHeight: 2 }}>
        {features.map(f => <li key={f}>✓ {f}</li>)}
      </ul>
      <ActionButton onClick={onClick} loading={loading} label={cta} loadingLabel="Opening checkout…" />
    </div>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <span style={{ fontFamily: FD, fontSize: 14, fontWeight: 600, color: INK_SOFT }}>Current plan</span>
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
          <PricingTile
            plan="PRO" planColor={VIOLET}
            price="$19" priceSub="/month"
            features={['Unlimited sessions', 'All 4 platforms', 'Cancel anytime']}
            cta="Start Pro"
            loading={loading === 'monthly'}
            onClick={() => handleCheckout(proMonthlyPriceId, 'monthly')}
          />
          <PricingTile
            plan="LIFETIME" planColor="#B8860B"
            price="$149" priceSub=" once"
            features={['Everything in Pro', 'Pay once, keep forever', 'All future updates']}
            cta="Get Lifetime Access"
            loading={loading === 'lifetime'}
            onClick={() => handleCheckout(lifetimePriceId, 'lifetime')}
          />
        </div>
      )}

      {err && <StatusMsg msg={err} isError />}
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
    <RetroShell email={email} activePath="other" taskbarTabs={[{ filename: 'settings.sys', color: VIOLET }]}>
      {/* success banner */}
      {showSuccessBanner && (
        <div style={{
          background: LIME, borderBottom: `2.5px solid ${BORDER}`,
          padding: '12px 28px',
          fontFamily: FB, fontWeight: 600, fontSize: 13, color: INK, textAlign: 'center',
        }}>
          ✓ Payment successful — your plan has been upgraded!
        </div>
      )}

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 60px' }}>

        <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: 30, color: INK, margin: '0 0 26px' }}>
          Settings
        </h1>

        {/* ── Section 0: Billing ── */}
        <SettingsCard title="Billing" subtitle="Manage your subscription and payment method.">
          <BillingSection
            subscriptionStatus={subscriptionStatus}
            stripeCustomerId={stripeCustomerId}
            proMonthlyPriceId={proMonthlyPriceId}
            lifetimePriceId={lifetimePriceId}
          />
        </SettingsCard>

        {/* ── Section 1: Profile ── */}
        <SettingsCard title="Profile" subtitle="Your display name shown in your build sessions.">
          <Field label="Display Name">
            <TextInput value={name} onChange={setName} placeholder="Your name" />
          </Field>
          <Field label="Email">
            <TextInput value={email} readOnly />
          </Field>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
            <ActionButton onClick={handleSaveProfile} loading={savingProfile} label="Save Profile" />
            {profileStatus && <StatusMsg msg={profileStatus.msg} isError={profileStatus.error} />}
          </div>
        </SettingsCard>

        {/* ── Section 2: API Keys ── */}
        <SettingsCard title="API Keys" subtitle="Connect your own provider keys to use your quota and billing.">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <ApiKeyCard
              provider="anthropic"
              providerLabel="Anthropic"
              providerIcon="🟠"
              placeholder="sk-ant-…"
              hasKey={hasAnthropicKey}
            />
            <ApiKeyCard
              provider="openai"
              providerLabel="OpenAI"
              providerIcon="🟢"
              placeholder="sk-…"
              hasKey={hasOpenAIKey}
            />
          </div>
          <p style={{
            fontFamily: FV, fontSize: 14, color: INK_SOFT,
            background: WINDOW_ALT,
            border: `1.5px solid ${BORDER}`,
            borderRadius: 8, padding: '9px 12px', margin: 0,
          }}>
            🔒 Your API key is encrypted with AES-256-GCM before storage and never shared. You are billed directly by the provider.
          </p>
        </SettingsCard>

        {/* ── Section 3: Model Preferences ── */}
        <SettingsCard title="Model Preference" subtitle="Choose which model powers your in-build chat assistant.">
          {MODEL_GROUPS.map(group => (
            <div key={group.provider} style={{ marginBottom: 20 }}>
              <p style={{
                fontFamily: FV, fontSize: 15, letterSpacing: '0.04em', textTransform: 'uppercase',
                color: INK_SOFT, marginBottom: 10, marginTop: 0, fontWeight: 700,
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
                        background: active ? WINDOW_ALT : WINDOW,
                        border: `${active ? 2.5 : 1.5}px solid ${BORDER}`,
                        boxShadow: active ? `3px 3px 0 ${BORDER}` : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      {/* custom radio */}
                      <div
                        onClick={() => setSelectedModel(m.id)}
                        style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${BORDER}`,
                          background: active ? INK : WINDOW,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                      >
                        {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>

                      <div onClick={() => setSelectedModel(m.id)} style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, color: INK }}>{m.label}</span>
                          {m.recommended && <RetroPill bg={GOLD} color={INK}>RECOMMENDED</RetroPill>}
                        </div>
                        <span style={{ fontFamily: FB, fontSize: 12, color: INK_SOFT }}>{m.note}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          <p style={{
            fontFamily: FV, fontSize: 14, color: INK_SOFT,
            background: WINDOW_ALT,
            border: `1.5px solid ${BORDER}`,
            borderRadius: 8, padding: '9px 12px',
            marginTop: 4, marginBottom: 16,
          }}>
            ℹ️ Plan generation always uses Claude Sonnet for best quality regardless of this setting.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ActionButton onClick={handleSaveModel} loading={savingModel} label="Save Preference" />
            {modelStatus && <StatusMsg msg={modelStatus.msg} isError={modelStatus.error} />}
          </div>
        </SettingsCard>

      </div>
    </RetroShell>
  )
}
