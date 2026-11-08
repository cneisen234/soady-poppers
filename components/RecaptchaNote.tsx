// Google's required notice wherever reCAPTCHA protects a form; it stands in for
// the floating badge, which is hidden (globals.css) so it never covers the page.

export function RecaptchaNote() {
  return (
    <>
      Protected by reCAPTCHA. The Google{' '}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
        Privacy Policy
      </a>{' '}
      and{' '}
      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
        Terms of Service
      </a>{' '}
      apply.
    </>
  );
}
