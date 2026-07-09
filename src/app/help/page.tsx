import { BackToCardLink } from "@/components/BackToCardLink";

export const metadata = {
  title: "Quick Launch Guide — Garrett Scarlett",
};

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-[17px] font-bold text-text-primary">{title}</h2>
      <div className="mt-2 flex flex-col gap-3 text-[14px] leading-[1.5] text-text-secondary">
        {children}
      </div>
    </section>
  );
}

function Device({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="rounded-row-sm border border-border-hairline bg-surface-panel px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[.12em] text-text-label">{name}</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13.5px] text-text-secondary">
        {children}
      </ul>
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-[560px] px-6 py-10">
      <BackToCardLink />

      <h1 className="mt-6 font-display text-[26px] font-bold leading-[1.1] text-text-primary">
        Quick Launch Guide
      </h1>
      <p className="mt-3 text-[14.5px] leading-[1.5] text-text-secondary">
        Get your contact card onto your home screen so it opens in about two seconds — then, if
        you want, wire it to a button or a tap on the back of your phone. Once installed it also
        works with <strong className="text-text-primary">no internet</strong>, which matters when
        venue wifi is bad.
      </p>

      <Step title="Step 1 — Install it (everyone, ~15 seconds)">
        <p>
          <strong className="text-text-primary">iPhone (Safari):</strong> open your card link →
          tap <strong className="text-text-primary">Share</strong> →{" "}
          <strong className="text-text-primary">Add to Home Screen</strong> →{" "}
          <strong className="text-text-primary">Add.</strong>
        </p>
        <p>
          <strong className="text-text-primary">Android (Chrome):</strong> open your card link →
          tap the <strong className="text-text-primary">⋮</strong> menu →{" "}
          <strong className="text-text-primary">Install app</strong> (or{" "}
          <strong className="text-text-primary">Add to Home screen</strong>).
        </p>
        <p>
          You now have an app icon that opens straight to your QR, full screen. It keeps working
          offline after the first open.
        </p>
        <p className="font-mono text-[12px] text-text-muted">
          Tip: the icon isn&apos;t the QR itself — it just launches the page. The scannable QR
          fills the screen once it opens.
        </p>
      </Step>

      <Step title="Step 2 — Add a faster trigger (optional)">
        <p>
          You already have a one-tap icon. If you want it even faster — a physical button or a
          gesture — find your phone below.
        </p>
        <div className="flex flex-col gap-3">
          <Device name="Google Pixel (incl. Pixel 10 Pro XL)">
            <li>
              <strong className="text-text-primary">App shortcuts:</strong> long-press the icon →
              pick <strong className="text-text-primary">Show my QR</strong>.
            </li>
            <li>
              <strong className="text-text-primary">Quick Tap (tap the back of the phone):</strong>{" "}
              Settings → System → Gestures → Quick Tap → turn on → Open app → choose your card.
            </li>
          </Device>
          <Device name="Samsung Galaxy">
            <li>
              <strong className="text-text-primary">App shortcuts:</strong> long-press the icon.
            </li>
            <li>
              <strong className="text-text-primary">Side key:</strong> Settings → Advanced
              features → Side key → Double press → Open app → choose your card.
            </li>
          </Device>
          <Device name="Other Android (Motorola, OnePlus, etc.)">
            <li>
              <strong className="text-text-primary">App shortcuts:</strong> long-press the icon
              (works on every Android).
            </li>
            <li>Some phones can remap a button or a gesture — check Settings → Gestures or Buttons.</li>
          </Device>
          <Device name="iPhone">
            <li>
              First make a quick Shortcut: Shortcuts app → + → Add Action → search Open URLs →
              paste your card link → name it &quot;My Card.&quot;
            </li>
            <li>
              <strong className="text-text-primary">Back Tap (iPhone 8+):</strong> Settings →
              Accessibility → Touch → Back Tap → Double Tap → choose your shortcut.
            </li>
            <li>
              <strong className="text-text-primary">Action Button (15 Pro / 16 / 17):</strong>{" "}
              Settings → Action Button → swipe to Shortcut → pick &quot;My Card.&quot;
            </li>
            <li>
              <strong className="text-text-primary">Lock Screen button (iOS 18+):</strong>{" "}
              long-press the lock screen → Customize → replace a bottom button with your shortcut.
            </li>
            <li>
              <strong className="text-text-primary">Siri:</strong> just say &quot;Show my
              card.&quot;
            </li>
          </Device>
        </div>
      </Step>

      <Step title="Step 3 — Power users: shake or motion (Android)">
        <p>
          Want to shake the phone to pull up your QR? Install Tasker or MacroDroid, create a
          profile with a Shake (or Flip) trigger, and set the action to Open URL → your card link.
        </p>
        <p className="font-mono text-[12px] text-text-muted">
          iPhone has no built-in shake-to-run, so Back Tap is the closest gesture there.
        </p>
      </Step>

      <Step title="Using it when the wifi is bad">
        <p>
          Your installed app and your QR keep working with no signal. The catch: if the person
          receiving your card also has no signal, a normal QR (which sends them to a web page)
          can&apos;t load on their end.
        </p>
        <p>
          For that case, open <strong className="text-text-primary">Present mode</strong> and flip
          to <strong className="text-text-primary">Offline QR</strong>. That version puts your
          contact details inside the QR itself, so their phone can add you with zero internet. (It
          drops the photo — too big to fit — but keeps your name, title, phone, email, and links.)
        </p>
        <p className="font-mono text-[12px] text-text-muted">
          Rule of thumb: good signal → default QR (prettier card, always up to date). Dead room →
          Offline QR.
        </p>
      </Step>
    </div>
  );
}
